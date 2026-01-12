// app/api/partner/verify/[guestId]/route.ts
// Get verification status for a specific guest

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)

// Get partner from token
async function getPartner() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('host_access_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    return payload.hostId as string
  } catch {
    return null
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ guestId: string }> }
) {
  try {
    const partnerId = await getPartner()
    if (!partnerId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { guestId } = await params

    // Get guest profile
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id: guestId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        stripeIdentityStatus: true,
        stripeIdentityVerifiedAt: true,
        stripeIdentitySessionId: true,
        stripeVerifiedFirstName: true,
        stripeVerifiedLastName: true,
        stripeVerifiedDob: true,
        stripeVerifiedIdExpiry: true,
        driverLicenseNumber: true,
        driverLicenseState: true,
        profileImage: true,
        createdAt: true
      }
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest not found' }, { status: 404 })
    }

    // Verify this guest has booked with this partner
    const hasBooking = await prisma.rentalBooking.count({
      where: {
        guestId,
        car: { rentalHostId: partnerId }
      }
    })

    // Also check if partner sent verification link
    const sentVerification = await prisma.partnerVerificationRequest.count({
      where: {
        partnerId,
        guestId
      }
    }).catch(() => 0)

    if (hasBooking === 0 && sentVerification === 0) {
      return NextResponse.json(
        { error: 'Not authorized to view this guest' },
        { status: 403 }
      )
    }

    // Format response - hide sensitive data
    const response = {
      id: guest.id,
      name: guest.stripeVerifiedFirstName
        ? `${guest.stripeVerifiedFirstName} ${guest.stripeVerifiedLastName}`
        : guest.fullName,
      email: guest.email,
      phone: guest.phone,
      profileImage: guest.profileImage,
      verification: {
        status: guest.stripeIdentityStatus || 'not_started',
        verifiedAt: guest.stripeIdentityVerifiedAt,
        isVerified: guest.stripeIdentityStatus === 'verified',
        // Only show partial ID for security
        licenseNumber: guest.driverLicenseNumber
          ? `***${guest.driverLicenseNumber.slice(-4)}`
          : null,
        licenseState: guest.driverLicenseState,
        licenseExpiry: guest.stripeVerifiedIdExpiry,
        // Age verification without showing actual DOB
        isOver21: guest.stripeVerifiedDob
          ? calculateAge(guest.stripeVerifiedDob) >= 21
          : null,
        isOver25: guest.stripeVerifiedDob
          ? calculateAge(guest.stripeVerifiedDob) >= 25
          : null
      },
      memberSince: guest.createdAt
    }

    return NextResponse.json({
      success: true,
      guest: response
    })

  } catch (error) {
    console.error('[Partner Verify Status] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch verification status' },
      { status: 500 }
    )
  }
}

function calculateAge(dob: Date): number {
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }
  return age
}
