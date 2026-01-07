// app/api/partner/signup/route.ts
// Partner/Car Owner Signup API
// Simple registration for car owners invited by hosts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { hash } from 'argon2'
import { SignJWT } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key-here'
)

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, email, password, inviteToken, isOAuthUser, oauthUserId } = body

    // Validation - password required for non-OAuth users
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Name and email are required' },
        { status: 400 }
      )
    }

    if (!isOAuthUser && !password) {
      return NextResponse.json(
        { error: 'Password is required' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate password length for non-OAuth users
    if (!isOAuthUser && password && password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if email already exists in RentalHost
    const existingHost = await prisma.rentalHost.findUnique({
      where: { email: normalizedEmail }
    })

    if (existingHost) {
      return NextResponse.json(
        { error: 'Email already registered. Please login instead.' },
        { status: 409 }
      )
    }

    // Check if email exists in User table
    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail }
    })

    // For OAuth users, we allow linking to existing User record
    // For non-OAuth users, we reject if email exists
    if (existingUser && !isOAuthUser) {
      return NextResponse.json(
        { error: 'Email already registered. Please login instead.' },
        { status: 409 }
      )
    }

    // If invite token provided, validate it
    let invitation = null
    if (inviteToken) {
      invitation = await prisma.managementInvitation.findUnique({
        where: { token: inviteToken },
        include: {
          car: true,
          invitedByHost: true
        }
      })

      if (!invitation) {
        return NextResponse.json(
          { error: 'Invalid invitation token' },
          { status: 400 }
        )
      }

      if (invitation.status !== 'PENDING') {
        return NextResponse.json(
          { error: 'This invitation has already been used or expired' },
          { status: 400 }
        )
      }

      if (invitation.expiresAt && new Date(invitation.expiresAt) < new Date()) {
        return NextResponse.json(
          { error: 'This invitation has expired' },
          { status: 400 }
        )
      }
    }

    // Hash password for non-OAuth users
    const passwordHash = isOAuthUser ? null : await hash(password)

    // For OAuth users with existing User record, link to it
    // For non-OAuth users, create new User record
    let newPartner

    if (isOAuthUser && existingUser) {
      // OAuth user with existing User record - just create RentalHost linked to existing User
      newPartner = await prisma.rentalHost.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          phone: '',

          // Partner type - individual car owner
          hostType: 'PARTNER',
          isVehicleOwner: true,

          // Auto-approve if they have a valid invitation
          // Otherwise pending approval
          approvalStatus: invitation ? 'APPROVED' : 'PENDING',
          approvedAt: invitation ? new Date() : null,
          approvedBy: invitation ? 'INVITATION_AUTO_APPROVE' : null,

          // Location placeholder - can be updated in settings
          city: 'Not Set',
          state: 'N/A',
          zipCode: null,

          // Dashboard access only if approved
          dashboardAccess: !!invitation,
          canViewBookings: !!invitation,
          canEditCalendar: !!invitation,
          canSetPricing: !!invitation,
          canMessageGuests: !!invitation,
          canWithdrawFunds: false, // Requires Stripe Connect setup

          // Commission defaults (will be set per vehicle)
          commissionRate: 0.30, // Default 30% platform fee

          // Status
          active: !!invitation,
          isVerified: true, // OAuth users are email verified

          // Link to existing User record
          userId: existingUser.id
        },
        include: {
          user: true
        }
      })
    } else {
      // Create new partner with new User record
      newPartner = await prisma.rentalHost.create({
        data: {
          name: name.trim(),
          email: normalizedEmail,
          phone: '',

          // Partner type - individual car owner
          hostType: 'PARTNER',
          isVehicleOwner: true,

          // Auto-approve if they have a valid invitation
          // Otherwise pending approval
          approvalStatus: invitation ? 'APPROVED' : 'PENDING',
          approvedAt: invitation ? new Date() : null,
          approvedBy: invitation ? 'INVITATION_AUTO_APPROVE' : null,

          // Location placeholder - can be updated in settings
          city: 'Not Set',
          state: 'N/A',
          zipCode: null,

          // Dashboard access only if approved
          dashboardAccess: !!invitation,
          canViewBookings: !!invitation,
          canEditCalendar: !!invitation,
          canSetPricing: !!invitation,
          canMessageGuests: !!invitation,
          canWithdrawFunds: false, // Requires Stripe Connect setup

          // Commission defaults (will be set per vehicle)
          commissionRate: 0.30, // Default 30% platform fee

          // Status
          active: !!invitation,
          isVerified: true, // Email verified by clicking invite link

          // Create linked User record
          user: {
            create: {
              email: normalizedEmail,
              name: name.trim(),
              phone: null,
              passwordHash: passwordHash || '',
              role: 'CLAIMED',
              emailVerified: true, // Verified by invite link or OAuth
              isActive: true
            }
          }
        },
        include: {
          user: true
        }
      })
    }

    // Log the signup
    await prisma.activityLog.create({
      data: {
        action: 'PARTNER_SIGNUP',
        entityType: 'HOST',
        entityId: newPartner.id,
        hostId: newPartner.id,
        category: 'ACCOUNT',
        severity: 'INFO',
        metadata: {
          description: `New partner registered: ${name}`,
          email: normalizedEmail,
          hasInvitation: !!invitation,
          invitedBy: invitation?.invitedByHost?.name || null,
          invitedByHostId: invitation?.invitedByHostId || null,
          signupMethod: isOAuthUser ? 'google_oauth' : 'email_password'
        }
      }
    })

    // Create admin notification if no invitation (manual signup)
    if (!invitation) {
      await prisma.adminNotification.create({
        data: {
          type: 'PARTNER_APPLICATION',
          title: 'New Partner Registration',
          message: `${name} has registered as a car owner/partner`,
          priority: 'MEDIUM',
          status: 'UNREAD',
          actionRequired: true,
          actionUrl: `/fleet/hosts/${newPartner.id}/review`,
          relatedId: newPartner.id,
          relatedType: 'RentalHost',
          metadata: {
            partnerName: name,
            partnerEmail: normalizedEmail,
            signupType: 'manual'
          }
        }
      })
    }

    // If approved (has invitation), create session
    if (invitation) {
      const token = await new SignJWT({
        hostId: newPartner.id,
        email: newPartner.email,
        hostType: newPartner.hostType,
        isPartner: true
      })
        .setProtectedHeader({ alg: 'HS256' })
        .setIssuedAt()
        .setExpirationTime('7d')
        .sign(JWT_SECRET)

      const cookieStore = await cookies()
      cookieStore.set('partner_token', token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 60 * 60 * 24 * 7, // 7 days
        path: '/'
      })
    }

    console.log(`[Partner Signup] New partner created:`, {
      id: newPartner.id,
      name: newPartner.name,
      email: newPartner.email,
      approved: newPartner.approvalStatus === 'APPROVED',
      hasInvitation: !!invitation
    })

    return NextResponse.json({
      success: true,
      message: invitation
        ? 'Account created successfully! Redirecting to your invitation...'
        : 'Account created successfully! Your application is pending review.',
      data: {
        partnerId: newPartner.id,
        email: newPartner.email,
        approved: newPartner.approvalStatus === 'APPROVED',
        hasInvitation: !!invitation,
        nextStep: invitation
          ? `/invite/view/${inviteToken}`
          : 'Wait for approval'
      }
    })

  } catch (error: any) {
    console.error('[Partner Signup] Error:', error)

    // Check for specific Prisma errors
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create account. Please try again.' },
      { status: 500 }
    )
  }
}

// GET - Check email availability
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const email = searchParams.get('email')

    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    const existingHost = await prisma.rentalHost.findUnique({
      where: { email: normalizedEmail },
      select: { id: true }
    })

    const existingUser = await prisma.user.findUnique({
      where: { email: normalizedEmail },
      select: { id: true }
    })

    return NextResponse.json({
      available: !existingHost && !existingUser,
      email: normalizedEmail
    })

  } catch (error) {
    console.error('[Partner Signup] Email check error:', error)
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    )
  }
}
