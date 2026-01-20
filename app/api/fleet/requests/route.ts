// app/api/fleet/requests/route.ts
// Admin API for managing reservation requests

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'

// GET /api/fleet/requests - List all reservation requests
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams

    // Filters
    const status = searchParams.get('status')
    const priority = searchParams.get('priority')
    const requestType = searchParams.get('type')
    const city = searchParams.get('city')
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')
    const skip = (page - 1) * limit

    // Build where clause
    const where: any = {}
    if (status) where.status = status
    if (priority) where.priority = priority
    if (requestType) where.requestType = requestType
    if (city) where.pickupCity = { contains: city, mode: 'insensitive' }

    // Get requests with claims and prospects
    const [requests, total] = await Promise.all([
      prisma.reservationRequest.findMany({
        where,
        include: {
          claims: {
            include: {
              host: {
                select: {
                  id: true,
                  name: true,
                  email: true,
                  profilePhoto: true
                }
              },
              car: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true
                }
              }
            },
            orderBy: { claimedAt: 'desc' }
          },
          invitedProspects: {
            select: {
              id: true,
              name: true,
              email: true,
              status: true,
              inviteSentAt: true
            }
          },
          fulfilledBooking: {
            select: {
              id: true,
              bookingCode: true,
              status: true
            }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { createdAt: 'desc' }
        ],
        skip,
        take: limit
      }),
      prisma.reservationRequest.count({ where })
    ])

    // Calculate stats
    const stats = await prisma.reservationRequest.groupBy({
      by: ['status'],
      _count: { id: true }
    })

    const statusCounts = stats.reduce((acc, s) => {
      acc[s.status] = s._count.id
      return acc
    }, {} as Record<string, number>)

    return NextResponse.json({
      success: true,
      requests,
      stats: statusCounts,
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
    console.error('[Fleet Requests API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch requests' },
      { status: 500 }
    )
  }
}

// POST /api/fleet/requests - Create a new reservation request
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      // Guest info
      guestName,
      guestEmail,
      guestPhone,
      companyName,
      // Vehicle requirements
      vehicleType,
      vehicleClass,
      vehicleMake,
      vehicleModel,
      quantity,
      // Dates & location
      startDate,
      endDate,
      durationDays,
      pickupCity,
      pickupState,
      pickupAddress,
      dropoffCity,
      dropoffState,
      dropoffAddress,
      // Pricing
      offeredRate,
      totalBudget,
      isNegotiable,
      // Other
      requestType,
      priority,
      guestNotes,
      adminNotes,
      source,
      sourceDetails,
      expiresAt,
      createdBy
    } = body

    // Validate required fields
    if (!guestName) {
      return NextResponse.json(
        { error: 'Guest name is required' },
        { status: 400 }
      )
    }

    // Generate request code
    const requestCode = `REQ-${nanoid(8).toUpperCase()}`

    // Calculate duration if dates provided
    let calculatedDuration = durationDays
    if (startDate && endDate && !durationDays) {
      const start = new Date(startDate)
      const end = new Date(endDate)
      calculatedDuration = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))
    }

    // Create the request
    const reservationRequest = await prisma.reservationRequest.create({
      data: {
        requestCode,
        requestType: requestType || 'STANDARD',
        guestName,
        guestEmail,
        guestPhone,
        companyName,
        vehicleType,
        vehicleClass,
        vehicleMake,
        vehicleModel,
        quantity: quantity || 1,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        durationDays: calculatedDuration,
        pickupCity,
        pickupState,
        pickupAddress,
        dropoffCity,
        dropoffState,
        dropoffAddress,
        offeredRate,
        totalBudget,
        isNegotiable: isNegotiable ?? true,
        status: 'OPEN',
        priority: priority || 'NORMAL',
        guestNotes,
        adminNotes,
        source,
        sourceDetails,
        expiresAt: expiresAt ? new Date(expiresAt) : null,
        createdBy
      }
    })

    return NextResponse.json({
      success: true,
      request: reservationRequest
    })

  } catch (error: any) {
    console.error('[Fleet Requests API] Create error:', error)
    return NextResponse.json(
      { error: 'Failed to create request' },
      { status: 500 }
    )
  }
}
