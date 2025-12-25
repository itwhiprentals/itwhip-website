// app/api/auth/complete-profile/route.ts
// API endpoint to save phone number after OAuth signup
// For NEW users (pending OAuth): Creates User + Account + ReviewerProfile in transaction
// For EXISTING users: Just updates phone number

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth/next-auth-config'
import { prisma } from '@/app/lib/database/prisma'
import { Prisma } from '@prisma/client'
import { sign } from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import { sendOAuthWelcomeEmail } from '@/app/lib/email/oauth-welcome-sender'
import { sendHostOAuthWelcomeEmail } from '@/app/lib/email/host-oauth-welcome-sender'

// JWT secrets (same as oauth-redirect)
const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'

// Helper to generate HOST JWT tokens (for rental hosts)
function generateHostTokens(host: {
  id: string
  userId: string
  email: string
  name: string
  approvalStatus: string
}) {
  const accessToken = sign(
    {
      userId: host.userId,
      hostId: host.id,
      email: host.email,
      name: host.name,
      role: 'BUSINESS',
      isRentalHost: true,
      approvalStatus: host.approvalStatus
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = sign(
    {
      userId: host.userId,
      hostId: host.id,
      email: host.email,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

// Helper to generate GUEST JWT tokens (for regular users)
function generateGuestTokens(user: {
  id: string
  email: string
  name: string | null
  role: string
}) {
  const tokenId = nanoid()
  const refreshTokenId = nanoid()

  const accessToken = sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      jti: tokenId
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = sign(
    {
      userId: user.id,
      jti: refreshTokenId
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { phone, roleHint, carData } = body

    if (!phone) {
      return NextResponse.json(
        { error: 'Phone number is required' },
        { status: 400 }
      )
    }

    // Validate phone number (10 digits)
    const digitsOnly = phone.replace(/\D/g, '')
    if (digitsOnly.length !== 10) {
      return NextResponse.json(
        { error: 'Invalid phone number format' },
        { status: 400 }
      )
    }

    // Validate car data for hosts
    if (roleHint === 'host') {
      if (!carData) {
        return NextResponse.json(
          { error: 'Vehicle information is required for hosts' },
          { status: 400 }
        )
      }

      const { make, model, year, color, city, state, zipCode } = carData

      if (!make || !model || !year || !color) {
        return NextResponse.json(
          { error: 'Vehicle make, model, year, and color are required' },
          { status: 400 }
        )
      }

      if (!city || !state || !zipCode) {
        return NextResponse.json(
          { error: 'Vehicle location (city, state, zip code) is required' },
          { status: 400 }
        )
      }

      if (!/^\d{5}$/.test(zipCode)) {
        return NextResponse.json(
          { error: 'Invalid zip code format. Must be 5 digits.' },
          { status: 400 }
        )
      }

      const yearNum = parseInt(year)
      const currentYear = new Date().getFullYear()
      if (yearNum < 1990 || yearNum > currentYear + 1) {
        return NextResponse.json(
          { error: `Invalid vehicle year. Must be between 1990 and ${currentYear + 1}.` },
          { status: 400 }
        )
      }
    }

    const pendingOAuth = (session.user as any).pendingOAuth
    const isProfileComplete = (session.user as any).isProfileComplete

    // ========================================================================
    // PENDING OAUTH USER - Create new user with phone
    // ========================================================================
    if (pendingOAuth && !isProfileComplete) {
      console.log(`[Complete Profile] Creating new user from pending OAuth: ${pendingOAuth.email}`)

      // Check if user already exists with this email (edge case - might have been created elsewhere)
      const existingUser = await prisma.user.findUnique({
        where: { email: pendingOAuth.email }
      })

      if (existingUser) {
        console.log(`[Complete Profile] User already exists - updating phone and linking account`)

        // Update existing user's phone
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            phone: digitsOnly,
            phoneVerified: false,
            image: pendingOAuth.image || existingUser.image,
            name: pendingOAuth.name || existingUser.name
          }
        })

        // Check if OAuth account link exists
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: pendingOAuth.provider,
              providerAccountId: pendingOAuth.providerAccountId
            }
          }
        })

        if (!existingAccount) {
          // Create account link
          await prisma.account.create({
            data: {
              userId: existingUser.id,
              type: 'oauth',
              provider: pendingOAuth.provider,
              providerAccountId: pendingOAuth.providerAccountId,
              access_token: pendingOAuth.access_token,
              refresh_token: pendingOAuth.refresh_token,
              expires_at: pendingOAuth.expires_at,
              token_type: pendingOAuth.token_type,
              scope: pendingOAuth.scope,
              id_token: pendingOAuth.id_token
            }
          })
          console.log(`[Complete Profile] Created OAuth account link for existing user`)
        }

        // Generate tokens and return response with cookies
        return await createSuccessResponse(updatedUser, digitsOnly)
      }

      // Create NEW user with phone - USE TRANSACTION
      console.log(`[Complete Profile] Creating new user in transaction`)

      let newUser
      try {
        newUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Create User
        const user = await tx.user.create({
          data: {
            email: pendingOAuth.email,
            name: pendingOAuth.name,
            image: pendingOAuth.image,
            phone: digitsOnly,
            phoneVerified: false,
            emailVerified: true, // OAuth email is verified
            role: 'CLAIMED'
          }
        })
        console.log(`[Complete Profile] Created User: ${user.id}`)

        // 2. Create Account (OAuth link)
        await tx.account.create({
          data: {
            userId: user.id,
            type: 'oauth',
            provider: pendingOAuth.provider,
            providerAccountId: pendingOAuth.providerAccountId,
            access_token: pendingOAuth.access_token,
            refresh_token: pendingOAuth.refresh_token,
            expires_at: pendingOAuth.expires_at,
            token_type: pendingOAuth.token_type,
            scope: pendingOAuth.scope,
            id_token: pendingOAuth.id_token
          }
        })
        console.log(`[Complete Profile] Created Account link`)

        // 3. Create profile based on roleHint
        if (roleHint === 'host') {
          // Create RentalHost for host signup
          // Note: Host will still need approval, this just creates the profile
          const host = await tx.rentalHost.create({
            data: {
              userId: user.id,
              email: pendingOAuth.email,
              name: pendingOAuth.name || '',
              phone: digitsOnly,
              profilePhoto: pendingOAuth.image,

              // Location from car data
              city: carData!.city,
              state: carData!.state,
              zipCode: carData!.zipCode,

              // Status
              approvalStatus: 'PENDING',
              isVerified: true, // OAuth email is verified
              active: false,
              dashboardAccess: false,

              // Permissions (all false initially)
              canViewBookings: false,
              canEditCalendar: false,
              canSetPricing: false,
              canMessageGuests: false,
              canWithdrawFunds: false,

              // Default commission
              commissionRate: 0.20,
              hostType: 'REAL'
            }
          })
          console.log(`[Complete Profile] Created RentalHost profile (pending approval) with verified email`)

          // 4. Create Car
          await tx.rentalCar.create({
            data: {
              hostId: host.id,

              // Vehicle info from form
              make: carData!.make,
              model: carData!.model,
              year: parseInt(carData!.year),
              trim: carData!.trim || null,
              color: carData!.color,

              // Location (matches host)
              city: carData!.city,
              state: carData!.state,
              zipCode: carData!.zipCode,
              address: '',

              // Status - NOT ACTIVE until fully completed
              isActive: false,

              // Defaults
              carType: 'midsize',
              seats: 5,
              doors: 4,
              transmission: 'automatic',
              fuelType: 'gas',

              // Pricing - must be set before activation
              dailyRate: 0,
              weeklyRate: 0,
              monthlyRate: 0,
              weeklyDiscount: 15,
              monthlyDiscount: 30,
              deliveryFee: 35,

              // Delivery options
              airportPickup: true,
              hotelDelivery: true,
              homeDelivery: false,

              // Availability
              instantBook: false,
              advanceNotice: 24,
              minTripDuration: 1,
              maxTripDuration: 30,

              // Insurance
              insuranceIncluded: false,
              insuranceDaily: 25,

              // Stats
              totalTrips: 0,
              rating: 0,

              // JSON fields
              features: '[]',
              rules: '[]',

              // Required fields (null until completed)
              vin: null,
              licensePlate: null,
              description: null,
              currentMileage: null,
              registeredOwner: null,
              registrationState: carData!.state,
              registrationExpiryDate: null,
              titleStatus: 'Clean',
              garageAddress: null
            }
          })
          console.log(`[Complete Profile] Created RentalCar for host`)
        } else if (roleHint === 'guest') {
          // SECURITY: Block guest profile creation for existing HOST users
          const existingHost = await tx.rentalHost.findFirst({
            where: { email: pendingOAuth.email }
          })

          if (existingHost) {
            console.log(`[Complete Profile] ⚠️ BLOCKED: Existing HOST user tried to create guest profile`)
            throw new Error('HOST_EXISTS')
          }

          // Create ReviewerProfile ONLY for explicit guest signup
          // ⚠️ CRITICAL: No auto-creation - must explicitly specify roleHint='guest'
          await tx.reviewerProfile.create({
            data: {
              userId: user.id,
              email: pendingOAuth.email,
              name: pendingOAuth.name || '',
              phoneNumber: digitsOnly,
              profilePhotoUrl: pendingOAuth.image,
              memberSince: new Date(),
              city: '',
              state: 'AZ',
              zipCode: '',
              emailVerified: true
            }
          })
          console.log(`[Complete Profile] Created ReviewerProfile for GUEST`)
        } else {
          console.log(`[Complete Profile] ⚠️ No profile created - roleHint: ${roleHint || 'NOT PROVIDED'}`)
          console.log(`[Complete Profile] User must complete proper guest/host signup flow`)
        }

        return user
      })

      console.log(`[Complete Profile] Transaction complete - new user created: ${newUser.id}`)

      // Send role-specific welcome email
      if (newUser.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'
        try {
          if (roleHint === 'host') {
            // Send host OAuth welcome email with verification checklist
            await sendHostOAuthWelcomeEmail(newUser.email, {
              userName: newUser.name || 'Host',
              userEmail: newUser.email,
              profileUrl: `${appUrl}/host/profile?tab=profile`,
              documentsUrl: `${appUrl}/host/profile?tab=documents`,
              carsUrl: `${appUrl}/host/cars`,
              earningsUrl: `${appUrl}/host/earnings`,
              insuranceUrl: `${appUrl}/host/profile?tab=insurance`,
              dashboardUrl: `${appUrl}/host/dashboard`
            })
            console.log(`[Complete Profile] Sent host OAuth welcome email to: ${newUser.email}`)
          } else {
            // Send guest OAuth welcome email
            await sendOAuthWelcomeEmail(newUser.email, {
              userName: newUser.name || 'Guest',
              userEmail: newUser.email,
              documentsUrl: `${appUrl}/profile?tab=documents`,
              insuranceUrl: `${appUrl}/profile?tab=insurance`,
              dashboardUrl: `${appUrl}/dashboard`
            })
            console.log(`[Complete Profile] Sent guest OAuth welcome email to: ${newUser.email}`)
          }
        } catch (emailError) {
          // Don't fail the signup if email fails - just log it
          console.error(`[Complete Profile] Failed to send welcome email:`, emailError)
        }
      }

      // Generate tokens and return response with cookies
      return await createSuccessResponse(newUser, digitsOnly, roleHint || 'guest')
      } catch (error: any) {
        // Handle HOST_EXISTS error specifically
        if (error.message === 'HOST_EXISTS') {
          return NextResponse.json({
            success: false,
            error: 'You already have a Host account. Use account linking to add guest capabilities.',
            requiresAccountLinking: true
          }, { status: 409 })
        }
        // Re-throw other errors
        throw error
      }
    }

    // ========================================================================
    // EXISTING USER - Just update phone number
    // NOTE: This does NOT create profiles automatically. Users must use the
    // account linking flow to become dual-role (HOST + GUEST).
    // ========================================================================
    const userId = (session.user as any).id
    const email = session.user.email

    console.log(`[Complete Profile] Updating phone for existing user: ${userId}, phone: ${digitsOnly}`)

    // Update user's phone number
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phone: digitsOnly,
        phoneVerified: false
      }
    })
    console.log(`[Complete Profile] User.update result:`, {
      id: updatedUser.id,
      phone: updatedUser.phone,
      phoneVerified: updatedUser.phoneVerified
    })

    // Also update ReviewerProfile if exists (phone sync only - NO creation)
    try {
      const updatedProfile = await prisma.reviewerProfile.update({
        where: { userId: userId },
        data: {
          phoneNumber: digitsOnly
        }
      })
      console.log(`[Complete Profile] ReviewerProfile.update result:`, {
        id: updatedProfile.id,
        phoneNumber: updatedProfile.phoneNumber
      })
    } catch (err) {
      // ReviewerProfile might not exist, that's okay - NO auto-creation
      console.log(`[Complete Profile] No ReviewerProfile to update (this is OK - must use account linking to create)`)
    }

    // Also update RentalHost if exists (phone sync only - NO creation)
    try {
      const updatedHost = await prisma.rentalHost.updateMany({
        where: { userId: userId },
        data: {
          phone: digitsOnly
        }
      })
      console.log(`[Complete Profile] RentalHost.updateMany result:`, {
        count: updatedHost.count
      })
    } catch (err) {
      // RentalHost might not exist, that's okay
      console.log(`[Complete Profile] No RentalHost to update (this is OK)`)
    }

    console.log(`[Complete Profile] Phone saved successfully for existing user ${email}: ${digitsOnly}`)

    // For existing users, just return success (they already have JWT cookies)
    return NextResponse.json({
      success: true,
      message: 'Phone number saved successfully'
    })

  } catch (error) {
    console.error('[Complete Profile] Error:', error)
    return NextResponse.json(
      { error: 'Failed to complete profile' },
      { status: 500 }
    )
  }
}

// Helper function to create response with JWT cookies for new users
async function createSuccessResponse(user: any, phone: string, roleHint: string = 'guest') {
  let tokens: { accessToken: string; refreshToken: string }
  let isHost = false

  // Generate role-specific tokens
  if (roleHint === 'host') {
    // Fetch the RentalHost profile to get hostId and approvalStatus
    const hostProfile = await prisma.rentalHost.findFirst({
      where: { userId: user.id },
      select: {
        id: true,
        approvalStatus: true
      }
    })

    if (hostProfile) {
      tokens = generateHostTokens({
        id: hostProfile.id,
        userId: user.id,
        email: user.email,
        name: user.name || '',
        approvalStatus: hostProfile.approvalStatus
      })
      isHost = true
      console.log(`[Complete Profile] Generated HOST tokens with approvalStatus: ${hostProfile.approvalStatus}`)
    } else {
      // Fallback to guest tokens if host profile not found
      tokens = generateGuestTokens({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'CLAIMED'
      })
      console.log(`[Complete Profile] Host profile not found, generated guest tokens`)
    }
  } else {
    // Generate guest tokens
    tokens = generateGuestTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'CLAIMED'
    })
    console.log(`[Complete Profile] Generated GUEST tokens`)
  }

  const response = NextResponse.json({
    success: true,
    message: 'Profile completed successfully',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: phone
    },
    isNewUser: true // Flag for frontend to know this was a new user creation
  })

  // Set standard JWT cookies
  response.cookies.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/'
  })

  response.cookies.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  })

  // ALSO set host-specific cookies if this is a host
  if (isHost) {
    response.cookies.set('hostAccessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    response.cookies.set('hostRefreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })
    console.log(`[Complete Profile] Set both accessToken AND hostAccessToken cookies for host`)
  }

  console.log(`[Complete Profile] Generated JWT tokens for new user: ${user.id}`)

  return response
}
