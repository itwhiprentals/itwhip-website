// app/api/fleet/guest-prospects/route.ts
// Admin API for managing guest prospects (guest recruitment pipeline)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'

// GET /api/fleet/guest-prospects - List all guest prospects
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Filters
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {
      archivedAt: null // Don't show archived by default
    }
    if (status) where.status = status

    // Search by email, name, or phone
    if (search) {
      where.OR = [
        { email: { contains: search, mode: 'insensitive' } },
        { name: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search } }
      ]
    }

    // Check for archived filter
    if (searchParams.get('includeArchived') === 'true') {
      delete where.archivedAt
    }

    // Get prospects with related data
    const [prospectsRaw, total] = await Promise.all([
      prisma.guestProspect.findMany({
        where,
        include: {
          convertedProfile: {
            select: {
              id: true,
              name: true,
              email: true,
              profilePhotoUrl: true,
              stripeIdentityStatus: true,
              documentsVerified: true,
              creditBalance: true,
              bonusBalance: true,
              depositWalletBalance: true
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
      prisma.guestProspect.count({ where })
    ])

    // Check if emails are linked to existing accounts
    const emailsToCheck = new Set<string>()
    for (const prospect of prospectsRaw) {
      if (prospect.email) emailsToCheck.add(prospect.email.toLowerCase())
    }

    // Map email -> owner info
    const emailOwnerMap = new Map<string, { type: string; owner: string; profileId?: string }>()

    if (emailsToCheck.size > 0) {
      const emailArray = Array.from(emailsToCheck)

      // Check if email exists in ReviewerProfile (existing guest)
      const existingGuests = await prisma.reviewerProfile.findMany({
        where: { email: { in: emailArray, mode: 'insensitive' } },
        select: {
          id: true,
          email: true,
          name: true,
          createdAt: true,
          stripeIdentityStatus: true,
          documentsVerified: true
        }
      })

      for (const g of existingGuests) {
        if (g.email) {
          const isVerified = g.stripeIdentityStatus === 'verified' || g.documentsVerified === true
          const joinDate = g.createdAt ? new Date(g.createdAt).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }) : ''
          emailOwnerMap.set(g.email.toLowerCase(), {
            type: 'guest',
            owner: `${g.name || 'Unknown'} (Guest${joinDate ? ` since ${joinDate}` : ''}${isVerified ? ' - Verified' : ''})`,
            profileId: g.id
          })
        }
      }
    }

    // Enhance prospects with email owner info
    const prospects = prospectsRaw.map(prospect => {
      const emailOwner = prospect.email
        ? emailOwnerMap.get(prospect.email.toLowerCase()) || null
        : null

      return {
        ...prospect,
        isEmailKnown: !!emailOwner,
        linkedTo: emailOwner?.owner || null,
        existingProfileId: emailOwner?.profileId || null
      }
    })

    // Calculate funnel stats
    const [allTimeStats, last7DaysConverted] = await Promise.all([
      prisma.guestProspect.groupBy({
        by: ['status'],
        _count: { id: true },
        where: { archivedAt: null }
      }),
      prisma.guestProspect.count({
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

    // Calculate total credits offered
    const totalCreditsOffered = await prisma.guestProspect.aggregate({
      where: { archivedAt: null },
      _sum: { creditAmount: true }
    })

    const stats = {
      total: totalProspects,
      draft: statusCounts['DRAFT'] || 0,
      invited: statusCounts['INVITED'] || 0,
      clicked: statusCounts['CLICKED'] || 0,
      converted: convertedCount,
      expired: statusCounts['EXPIRED'] || 0,
      last7DaysConverted,
      conversionRate,
      totalCreditsOffered: totalCreditsOffered._sum.creditAmount || 0
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
    console.error('[Fleet Guest Prospects API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guest prospects' },
      { status: 500 }
    )
  }
}

// POST /api/fleet/guest-prospects - Create a new guest prospect
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      email,
      phone,
      notes,
      source,
      creditAmount,
      creditType,
      creditPurpose,
      creditNote,
      creditExpirationDays,
      referenceBooking,
      createdBy,
      sendInviteImmediately
    } = body

    // Validate required fields
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      )
    }

    // Check if prospect with this email already exists
    const existingProspect = await prisma.guestProspect.findFirst({
      where: { email: email.toLowerCase() }
    })

    if (existingProspect) {
      return NextResponse.json(
        { error: 'A guest prospect with this email already exists', existingId: existingProspect.id },
        { status: 409 }
      )
    }

    // Generate invite token (72-hour expiry for guest prospects)
    const inviteToken = sendInviteImmediately ? nanoid(32) : null
    const inviteTokenExp = sendInviteImmediately
      ? new Date(Date.now() + 72 * 60 * 60 * 1000) // 72 hours
      : null

    // Create the prospect
    const prospect = await prisma.guestProspect.create({
      data: {
        name,
        email: email.toLowerCase(),
        phone,
        notes,
        source: source || 'admin_invite',
        creditAmount: creditAmount || 0,
        creditType: creditType || 'credit',
        creditPurpose: creditPurpose || 'guest_invite',
        creditNote,
        creditExpirationDays,
        referenceBooking: referenceBooking || null,
        createdBy,
        status: sendInviteImmediately ? 'INVITED' : 'DRAFT',
        inviteToken,
        inviteTokenExp,
        inviteSentAt: sendInviteImmediately ? new Date() : null
      }
    })

    // Log activity
    if (sendInviteImmediately) {
      await prisma.guestProspectActivity.create({
        data: {
          prospectId: prospect.id,
          activityType: 'EMAIL_SENT',
          metadata: {
            creditAmount,
            creditType,
            tokenExpiry: inviteTokenExp?.toISOString()
          }
        }
      })
    }

    return NextResponse.json({
      success: true,
      prospect,
      inviteToken: sendInviteImmediately ? inviteToken : null
    })

  } catch (error: any) {
    console.error('[Fleet Guest Prospects API] Create error:', error)
    return NextResponse.json(
      { error: 'Failed to create guest prospect' },
      { status: 500 }
    )
  }
}
