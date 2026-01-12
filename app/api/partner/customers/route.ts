// app/api/partner/customers/route.ts
// Partner Customer Management API - List & Create

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER')) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const search = searchParams.get('search') || ''
    const filter = searchParams.get('filter') || 'all' // all, active, past

    // Get all partner's vehicles
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true }
    })
    const vehicleIds = vehicles.map(v => v.id)

    // Get all bookings for partner's vehicles with renter/guest data
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        carId: { in: vehicleIds }
      },
      include: {
        renter: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            phoneNumber: true,
            profileImageUrl: true,
            createdAt: true,
            reviewerProfile: {
              select: {
                id: true,
                profilePhotoUrl: true,
                city: true,
                state: true
              }
            }
          }
        },
        reviewerProfile: {
          select: {
            id: true,
            profilePhotoUrl: true,
            city: true,
            state: true,
            phoneNumber: true
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
      orderBy: { createdAt: 'desc' }
    })

    // Group bookings by user
    const customerMap = new Map<string, {
      id: string
      name: string
      email: string
      phone: string | null
      photo: string | null
      reviewerProfileId: string | null
      city: string | null
      state: string | null
      memberSince: Date
      bookings: any[]
      totalSpent: number
      lastBooking: Date | null
      status: 'active' | 'past' | 'pending'
    }>()

    const now = new Date()

    for (const booking of bookings) {
      // Skip bookings with no identifiable customer
      if (!booking.renter && !booking.guestEmail && !booking.reviewerProfile) continue

      // Determine customer identity - prefer renter (registered user), then reviewer profile, then guest email
      let customerId: string
      let customerName: string
      let customerEmail: string
      let customerPhone: string | null
      let customerPhoto: string | null
      let reviewerProfileId: string | null
      let customerCity: string | null
      let customerState: string | null
      let memberSince: Date

      if (booking.renter) {
        // Registered user
        customerId = booking.renter.id
        customerName = `${booking.renter.firstName || ''} ${booking.renter.lastName || ''}`.trim() || 'Guest'
        customerEmail = booking.renter.email || ''
        customerPhone = booking.renter.phoneNumber || null
        customerPhoto = booking.renter.reviewerProfile?.profilePhotoUrl || booking.renter.profileImageUrl || null
        reviewerProfileId = booking.renter.reviewerProfile?.id || null
        customerCity = booking.renter.reviewerProfile?.city || null
        customerState = booking.renter.reviewerProfile?.state || null
        memberSince = booking.renter.createdAt
      } else if (booking.reviewerProfile) {
        // Guest with reviewer profile
        customerId = `profile_${booking.reviewerProfile.id}`
        customerName = booking.guestName || 'Guest'
        customerEmail = booking.guestEmail || ''
        customerPhone = booking.guestPhone || booking.reviewerProfile.phoneNumber || null
        customerPhoto = booking.reviewerProfile.profilePhotoUrl || null
        reviewerProfileId = booking.reviewerProfile.id
        customerCity = booking.reviewerProfile.city || null
        customerState = booking.reviewerProfile.state || null
        memberSince = booking.createdAt
      } else {
        // Guest with email only
        customerId = `email_${booking.guestEmail}`
        customerName = booking.guestName || 'Guest'
        customerEmail = booking.guestEmail || ''
        customerPhone = booking.guestPhone || null
        customerPhoto = null
        reviewerProfileId = null
        customerCity = null
        customerState = null
        memberSince = booking.createdAt
      }

      const existing = customerMap.get(customerId)

      const bookingInfo = {
        id: booking.id,
        vehicle: booking.car
          ? `${booking.car.year} ${booking.car.make} ${booking.car.model}`
          : 'Unknown',
        startDate: booking.startDate,
        endDate: booking.endDate,
        status: booking.status,
        total: Number(booking.totalAmount) || 0
      }

      // Determine if active (current or upcoming confirmed booking)
      const isActive = (booking.status === 'CONFIRMED' || booking.status === 'ACTIVE') &&
                       new Date(booking.endDate) >= now

      if (existing) {
        existing.bookings.push(bookingInfo)
        existing.totalSpent += bookingInfo.total
        if (!existing.lastBooking || new Date(booking.createdAt) > existing.lastBooking) {
          existing.lastBooking = new Date(booking.createdAt)
        }
        if (isActive) existing.status = 'active'
      } else {
        customerMap.set(customerId, {
          id: customerId,
          name: customerName,
          email: customerEmail,
          phone: customerPhone,
          photo: customerPhoto,
          reviewerProfileId,
          city: customerCity,
          state: customerState,
          memberSince,
          bookings: [bookingInfo],
          totalSpent: bookingInfo.total,
          lastBooking: new Date(booking.createdAt),
          status: isActive ? 'active' : 'past'
        })
      }
    }

    // Convert to array and filter
    let customers = Array.from(customerMap.values())

    // Apply search filter
    if (search) {
      const searchLower = search.toLowerCase()
      customers = customers.filter(c =>
        c.name.toLowerCase().includes(searchLower) ||
        c.email.toLowerCase().includes(searchLower) ||
        (c.phone && c.phone.includes(search))
      )
    }

    // Apply status filter
    if (filter === 'active') {
      customers = customers.filter(c => c.status === 'active')
    } else if (filter === 'past') {
      customers = customers.filter(c => c.status === 'past')
    }

    // Sort by most recent booking
    customers.sort((a, b) => {
      if (!a.lastBooking) return 1
      if (!b.lastBooking) return -1
      return b.lastBooking.getTime() - a.lastBooking.getTime()
    })

    // Calculate stats
    const stats = {
      total: customerMap.size,
      active: Array.from(customerMap.values()).filter(c => c.status === 'active').length,
      repeatCustomers: Array.from(customerMap.values()).filter(c => c.bookings.length > 1).length
    }

    // Format for response
    const formattedCustomers = customers.map(c => ({
      id: c.id,
      name: c.name,
      email: c.email,
      phone: c.phone,
      photo: c.photo,
      reviewerProfileId: c.reviewerProfileId,
      location: c.city && c.state ? `${c.city}, ${c.state}` : null,
      memberSince: c.memberSince.toISOString(),
      bookingCount: c.bookings.length,
      totalSpent: c.totalSpent,
      lastBooking: c.lastBooking?.toISOString() || null,
      status: c.status
    }))

    return NextResponse.json({
      success: true,
      customers: formattedCustomers,
      stats
    })

  } catch (error) {
    console.error('[Partner Customers] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 })
  }
}

// POST - Create new customer (for manual booking or direct add)
export async function POST(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { name, firstName: inputFirstName, lastName: inputLastName, email, phone } = body

    // Support both name and firstName/lastName formats
    let firstName: string
    let lastName: string

    if (inputFirstName) {
      firstName = inputFirstName.trim()
      lastName = (inputLastName || '').trim()
    } else if (name) {
      const nameParts = name.trim().split(' ')
      firstName = nameParts[0]
      lastName = nameParts.slice(1).join(' ') || ''
    } else {
      return NextResponse.json(
        { error: 'First name is required' },
        { status: 400 }
      )
    }

    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailLower = email.trim().toLowerCase()

    // Check if user with email already exists
    let user = await prisma.user.findUnique({
      where: { email: emailLower },
      include: {
        reviewerProfile: true
      }
    })

    if (user) {
      // Return existing user
      return NextResponse.json({
        success: true,
        customer: {
          id: user.id,
          name: `${user.firstName || ''} ${user.lastName || ''}`.trim() || `${firstName} ${lastName}`.trim(),
          email: user.email,
          phone: user.phoneNumber || phone,
          photo: user.reviewerProfile?.profilePhotoUrl || user.profileImageUrl,
          reviewerProfileId: user.reviewerProfile?.id || null,
          isExisting: true
        }
      })
    }

    // Create new user
    user = await prisma.user.create({
      data: {
        email: emailLower,
        firstName,
        lastName,
        phoneNumber: phone || null,
        role: 'USER'
      },
      include: {
        reviewerProfile: true
      }
    })

    return NextResponse.json({
      success: true,
      customer: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`.trim(),
        email: user.email,
        phone: user.phoneNumber,
        photo: null,
        reviewerProfileId: null,
        isExisting: false
      }
    })

  } catch (error: any) {
    console.error('[Partner Customers] Create error:', error)

    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'A user with this email already exists' },
        { status: 409 }
      )
    }

    return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 })
  }
}
