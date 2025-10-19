// app/api/host/bookings/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'

// Helper to get host from headers
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  
  if (!userId && !hostId) {
    return null
  }
  
  const host = await prisma.rentalHost.findFirst({
    where: hostId ? { id: hostId } : { userId: userId }
  })
  
  return host
}

// GET - Fetch bookings for host
export async function GET(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if host has permission to view bookings
    if (host.approvalStatus !== 'APPROVED' && host.approvalStatus !== 'SUSPENDED') {
      return NextResponse.json(
        { error: 'Host not approved' },
        { status: 403 }
      )
    }
    
    // Get query parameters
    const { searchParams } = new URL(request.url)
    const statusFilter = searchParams.get('status') || 'all'
    const search = searchParams.get('search') || ''
    
    // Build where clause based on status filter
    const now = new Date()
    let whereClause: any = {
      hostId: host.id
    }
    
    // Apply status filters
    switch (statusFilter) {
      case 'pending':
        whereClause.status = 'PENDING'
        break
      case 'upcoming':
        whereClause.status = 'CONFIRMED'
        whereClause.startDate = { gt: now }
        break
      case 'active':
        whereClause.tripStatus = 'ACTIVE'
        break
      case 'past':
        whereClause.status = 'COMPLETED'
        break
      case 'cancelled':
        whereClause.status = 'CANCELLED'
        break
    }
    
    // Apply search filter
    if (search) {
      whereClause.OR = [
        { bookingCode: { contains: search, mode: 'insensitive' } },
        { guestName: { contains: search, mode: 'insensitive' } },
        { guestEmail: { contains: search, mode: 'insensitive' } },
        { renter: {
          OR: [
            { name: { contains: search, mode: 'insensitive' } },
            { email: { contains: search, mode: 'insensitive' } }
          ]
        }},
        { car: {
          OR: [
            { make: { contains: search, mode: 'insensitive' } },
            { model: { contains: search, mode: 'insensitive' } }
          ]
        }}
      ]
    }
    
    // Fetch bookings with related data
    const bookings = await prisma.rentalBooking.findMany({
      where: whereClause,
      include: {
        car: {
          include: {
            photos: {
              where: { isHero: true },
              take: 1
            }
          }
        },
        renter: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            avatar: true
          }
        },
        messages: {
          take: 1,
          orderBy: {
            createdAt: 'desc'
          },
          select: {
            id: true,
            message: true,
            createdAt: true
          }
        }
      },
      orderBy: [
        { status: 'asc' },
        { startDate: 'desc' }
      ]
    })
    
    // Format bookings for response
    const formattedBookings = bookings.map(booking => ({
      id: booking.id,
      bookingCode: booking.bookingCode,
      car: {
        id: booking.car.id,
        make: booking.car.make,
        model: booking.car.model,
        year: booking.car.year,
        photos: booking.car.photos.map(p => ({
          url: p.url
        }))
      },
      renter: booking.renter ? {
        id: booking.renter.id,
        name: booking.renter.name,
        email: booking.renter.email,
        phone: booking.renter.phone,
        avatar: booking.renter.avatar
      } : null,
      guestName: booking.guestName,
      guestEmail: booking.guestEmail,
      guestPhone: booking.guestPhone,
      startDate: booking.startDate.toISOString(),
      endDate: booking.endDate.toISOString(),
      startTime: booking.startTime,
      endTime: booking.endTime,
      pickupType: booking.pickupType,
      pickupLocation: booking.pickupLocation,
      numberOfDays: booking.numberOfDays,
      totalAmount: booking.totalAmount.toNumber(),
      depositAmount: booking.depositAmount.toNumber(),
      status: booking.status,
      paymentStatus: booking.paymentStatus,
      verificationStatus: booking.verificationStatus,
      tripStatus: booking.tripStatus,
      licenseVerified: booking.licenseVerified,
      selfieVerified: booking.selfieVerified,
      createdAt: booking.createdAt.toISOString(),
      messages: booking.messages
    }))
    
    // Calculate counts for different statuses (for tabs)
    const allBookings = await prisma.rentalBooking.findMany({
      where: { hostId: host.id },
      select: {
        status: true,
        tripStatus: true,
        startDate: true
      }
    })
    
    const counts = {
      all: allBookings.length,
      pending: allBookings.filter(b => b.status === 'PENDING').length,
      upcoming: allBookings.filter(b => 
        b.status === 'CONFIRMED' && b.startDate > now
      ).length,
      active: allBookings.filter(b => b.tripStatus === 'ACTIVE').length,
      past: allBookings.filter(b => b.status === 'COMPLETED').length,
      cancelled: allBookings.filter(b => b.status === 'CANCELLED').length
    }
    
    return NextResponse.json({
      bookings: formattedBookings,
      counts: counts,
      total: formattedBookings.length
    })
    
  } catch (error) {
    console.error('Bookings fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch bookings' },
      { status: 500 }
    )
  }
}

// POST - Create a new booking (for hosts creating manual bookings)
export async function POST(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    // Check if host is approved
    if (host.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved hosts can create bookings' },
        { status: 403 }
      )
    }
    
    const body = await request.json()
    
    // Validate required fields
    const requiredFields = [
      'carId', 'startDate', 'endDate', 'guestName', 
      'guestEmail', 'totalAmount'
    ]
    
    for (const field of requiredFields) {
      if (!body[field]) {
        return NextResponse.json(
          { error: `${field} is required` },
          { status: 400 }
        )
      }
    }
    
    // Verify car belongs to host
    const car = await prisma.rentalCar.findFirst({
      where: {
        id: body.carId,
        hostId: host.id
      }
    })
    
    if (!car) {
      return NextResponse.json(
        { error: 'Car not found or does not belong to host' },
        { status: 404 }
      )
    }
    
    // Calculate number of days
    const startDate = new Date(body.startDate)
    const endDate = new Date(body.endDate)
    const numberOfDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24))
    
    // Generate booking code
    const bookingCode = `RENT-${new Date().getFullYear()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`
    
    // Create the booking
    const newBooking = await prisma.rentalBooking.create({
      data: {
        bookingCode: bookingCode,
        carId: body.carId,
        hostId: host.id,
        
        // Guest details
        guestName: body.guestName,
        guestEmail: body.guestEmail,
        guestPhone: body.guestPhone,
        
        // Trip details
        startDate: startDate,
        endDate: endDate,
        startTime: body.startTime || '10:00 AM',
        endTime: body.endTime || '10:00 AM',
        numberOfDays: numberOfDays,
        
        // Pickup details
        pickupType: body.pickupType || 'host',
        pickupLocation: body.pickupLocation || car.address,
        deliveryAddress: body.deliveryAddress,
        
        // Financial details
        dailyRate: car.dailyRate.toNumber(),
        subtotal: car.dailyRate.toNumber() * numberOfDays,
        deliveryFee: body.deliveryFee || 0,
        insuranceFee: body.insuranceFee || 0,
        serviceFee: body.serviceFee || 0,
        taxes: body.taxes || 0,
        totalAmount: body.totalAmount,
        depositAmount: body.depositAmount || 500,
        
        // Status
        status: 'CONFIRMED', // Manual bookings are auto-confirmed
        paymentStatus: body.paymentStatus || 'PENDING',
        verificationStatus: 'APPROVED', // Skip verification for manual bookings
        tripStatus: 'NOT_STARTED',
        
        // Session info
        bookingIpAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip'),
        bookingCountry: 'US',
        bookingCity: car.city
      }
    })
    
    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: host.userId,
        action: 'booking_created_manual',
        entityType: 'booking',
        entityId: newBooking.id,
        metadata: {
          bookingCode: newBooking.bookingCode,
          carDetails: `${car.year} ${car.make} ${car.model}`,
          guestName: body.guestName
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      booking: newBooking
    })
    
  } catch (error) {
    console.error('Booking creation error:', error)
    return NextResponse.json(
      { error: 'Failed to create booking' },
      { status: 500 }
    )
  }
}