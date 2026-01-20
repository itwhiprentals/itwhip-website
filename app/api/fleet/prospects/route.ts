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
    const [prospects, total] = await Promise.all([
      prisma.hostProspect.findMany({
        where,
        include: {
          request: {
            select: {
              id: true,
              requestCode: true,
              guestName: true,
              vehicleType: true,
              startDate: true,
              endDate: true,
              offeredRate: true,
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

    // Calculate funnel stats
    const funnelStats = await prisma.hostProspect.groupBy({
      by: ['status'],
      _count: { id: true },
      where: {
        createdAt: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      }
    })

    const funnel = funnelStats.reduce((acc, s) => {
      acc[s.status] = s._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      prospects,
      funnel,
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
