// app/api/fleet/prospects/route.ts
// Admin API for managing host prospects (recruitment pipeline)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'

// GET /api/fleet/prospects - List all host prospects
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Filters
    const status = searchParams.get('status')
    const source = searchParams.get('source')
    const requestId = searchParams.get('requestId')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      archivedAt: null // Don't show archived by default
    }
    if (status) where.status = status
    if (source) where.source = source
    if (requestId) where.requestId = requestId

    // Check for archived filter
    if (searchParams.get('includeArchived') === 'true') {
      delete where.archivedAt
    }

    // Get prospects with related data
    const [prospectsRaw, total] = await Promise.all([
      prisma.hostProspect.findMany({
        where,
        include: {
          request: {
            select: {
              id: true,
              requestCode: true,
              guestName: true,
              guestEmail: true,
              vehicleMake: true,
              vehicleType: true,
              startDate: true,
              endDate: true,
              offeredRate: true,
              durationDays: true,
              status: true
            }
          },
          convertedHost: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhoto: true,
              approvalStatus: true
            }
          }
        },
        orderBy: [
          { status: 'asc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.hostProspect.count({ where })
    ])

    // Check if emails are linked to VERIFIED accounts in the system
    // We need to know WHO the email belongs to (not just true/false)
    const emailsToCheck = new Set<string>()
    for (const prospect of prospectsRaw) {
      if (prospect.email) emailsToCheck.add(prospect.email.toLowerCase())
      if (prospect.request?.guestEmail) emailsToCheck.add(prospect.request.guestEmail.toLowerCase())
    }

    // Map email -> owner info
    const emailOwnerMap = new Map<string, { type: string; owner: string }>()

    if (emailsToCheck.size > 0) {
      const emailArray = Array.from(emailsToCheck)

      // Check all verified tables
      const [hosts, users, reviewers] = await Promise.all([
        prisma.rentalHost.findMany({
          where: { email: { in: emailArray, mode: 'insensitive' } },
          select: { email: true, name: true, approvalStatus: true }
        }),
        prisma.user.findMany({
          where: { email: { in: emailArray, mode: 'insensitive' } },
          select: { email: true, name: true, createdAt: true }
        }),
        prisma.reviewerProfile.findMany({
          where: { email: { in: emailArray, mode: 'insensitive' } },
          select: { email: true, name: true, createdAt: true }
        })
      ])

      // Build owner info map - hosts take priority
      for (const h of hosts) {
        if (h.email) {
          emailOwnerMap.set(h.email.toLowerCase(), {
            type: 'host',
            owner: `${h.name || 'Unknown'} (Host - ${h.approvalStatus})`
          })
        }
      }
      for (const u of users) {
        if (u.email && !emailOwnerMap.has(u.email.toLowerCase())) {
          const joinDate = u.createdAt ? new Date(u.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''
          emailOwnerMap.set(u.email.toLowerCase(), {
            type: 'user',
            owner: `${u.name || 'Unknown'} (Renter${joinDate ? ` since ${joinDate}` : ''})`
          })
        }
      }
      for (const r of reviewers) {
        if (r.email && !emailOwnerMap.has(r.email.toLowerCase())) {
          const joinDate = r.createdAt ? new Date(r.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''
          emailOwnerMap.set(r.email.toLowerCase(), {
            type: 'guest',
            owner: `${r.name || 'Unknown'} (Guest${joinDate ? ` since ${joinDate}` : ''})`
          })
        }
      }
    }

    // Enhance prospects with email owner info
    // linkedTo = WHO the email belongs to (null if NEW)
    const prospects = prospectsRaw.map(prospect => {
      const prospectEmailOwner = prospect.email
        ? emailOwnerMap.get(prospect.email.toLowerCase()) || null
        : null
      const guestEmailOwner = prospect.request?.guestEmail
        ? emailOwnerMap.get(prospect.request.guestEmail.toLowerCase()) || null
        : null

      return {
        ...prospect,
        // Prospect email status
        isProspectEmailKnown: !!prospectEmailOwner,
        prospectLinkedTo: prospectEmailOwner?.owner || null,
        // Request guest email status
        request: prospect.request ? {
          ...prospect.request,
          isGuestEmailKnown: !!guestEmailOwner,
          guestLinkedTo: guestEmailOwner?.owner || null
        } : null
      }
    })

    // Calculate funnel stats - ALL prospects (not just filtered)
    const [allTimeStats, last7DaysConverted] = await Promise.all([
      // Get counts by status for all prospects
      prisma.hostProspect.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { archivedAt: null }
      }),
      // Get converted count in last 7 days
      prisma.hostProspect.count({
        where: {
          status: 'CONVERTED',
          convertedAt: {
            gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
          }
        }
      })
    ])

    // Build stats object
    const statusCounts = allTimeStats.reduce((acc, s) => {
      acc[s.status] = s._count.id
      return acc
    }, {} as Record<string, number>)

    const totalProspects = Object.values(statusCounts).reduce((sum, count) => sum + count, 0)
    const convertedCount = statusCounts['CONVERTED'] || 0
    const conversionRate = totalProspects > 0 ? (convertedCount / totalProspects) * 100 : 0

    const stats = {
      total: totalProspects,
      draft: statusCounts['DRAFT'] || 0,
      emailSent: statusCounts['EMAIL_SENT'] || 0,
      emailOpened: statusCounts['EMAIL_OPENED'] || 0,
      linkClicked: statusCounts['LINK_CLICKED'] || 0,
      converted: convertedCount,
      expired: statusCounts['EXPIRED'] || 0,
      last7DaysConverted,
      conversionRate
    }

    return NextResponse.json({
      success: true,
      prospects,
      stats,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
        hasNext: page * limit < total,
        hasPrev: page > 1
      }
    })

  } catch (error: any) {
    console.error('[Fleet Prospects API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch prospects' },
      { status: 500 }
    )
  }
}

// POST /api/fleet/prospects - Create a new host prospect
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleDescription,
      source,
      sourceUrl,
      conversationNotes,
      requestId,
      addedBy,
      sendInviteImmediately
    } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Check if prospect with this email already exists
    const existingProspect = await prisma.hostProspect.findFirst({
      where: { email: email.toLowerCase() }
    })

    if (existingProspect) {
      return NextResponse.json(
        { error: 'A prospect with this email already exists', existingId: existingProspect.id },
        { status: 409 }
      )
    }

    // Check if email is already a host
    const existingHost = await prisma.rentalHost.findFirst({
      where: { email: email.toLowerCase() }
    })

    if (existingHost) {
      return NextResponse.json(
        { error: 'This email is already registered as a host', hostId: existingHost.id },
        { status: 409 }
      )
    }

    // Generate invite token if sending immediately
    const inviteToken = sendInviteImmediately ? nanoid(32) : null
    const inviteTokenExp = sendInviteImmediately
      ? new Date(Date.now() + 48 * 60 * 60 * 1000) // 48 hours
      : null

    // Create the prospect
    const prospect = await prisma.hostProspect.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        vehicleMake,
        vehicleModel,
        vehicleYear,
        vehicleDescription,
        source: source || 'FACEBOOK_MARKETPLACE',
        sourceUrl,
        conversationNotes,
        requestId,
        addedBy,
        status: sendInviteImmediately ? 'EMAIL_SENT' : 'DRAFT',
        inviteToken,
        inviteTokenExp,
        inviteSentAt: sendInviteImmediately ? new Date() : null
      },
      include: {
        request: {
          select: {
            id: true,
            requestCode: true,
            vehicleType: true,
            offeredRate: true
          }
        }
      }
    })

    // TODO: If sendInviteImmediately, trigger email sending here
    // This would integrate with your email provider (Resend, etc.)

    return NextResponse.json({
      success: true,
      prospect,
      inviteToken: sendInviteImmediately ? inviteToken : null
    })

  } catch (error: any) {
    console.error('[Fleet Prospects API] Create error:', error)
    return NextResponse.json(
      { error: 'Failed to create prospect' },
      { status: 500 }
    )
  }
}
