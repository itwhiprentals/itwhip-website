// app/api/auth/complete-profile/route.ts
// API endpoint to save phone number after OAuth signup
// For NEW users (pending OAuth): Creates User + Account + ReviewerProfile in transaction
// For EXISTING users: Just updates phone number

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth/next-auth-config'
import { prisma } from '@/app/lib/database/prisma'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import { sendOAuthWelcomeEmail } from '@/app/lib/email/oauth-welcome-sender'

// JWT secrets (same as oauth-redirect)
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
)

// Helper to generate custom JWT tokens
async function generateCustomTokens(user: { id: string; email: string; name: string | null; role: string }) {
  const tokenId = nanoid()
  const refreshTokenId = nanoid()
  const refreshFamily = nanoid()

  const accessToken = await new SignJWT({
    userId: user.id,
    email: user.email,
    name: user.name,
    role: user.role,
    jti: tokenId
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('15m')
    .sign(JWT_SECRET)

  const refreshToken = await new SignJWT({
    userId: user.id,
    family: refreshFamily,
    jti: refreshTokenId
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_REFRESH_SECRET)

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
    const { phone, roleHint } = body

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

      const newUser = await prisma.$transaction(async (tx) => {
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
          await tx.rentalHost.create({
            data: {
              userId: user.id,
              email: pendingOAuth.email,
              name: pendingOAuth.name || '',
              phone: digitsOnly,
              profilePhoto: pendingOAuth.image,
              approvalStatus: 'PENDING',
              isVerified: false
            }
          })
          console.log(`[Complete Profile] Created RentalHost profile (pending approval)`)
        } else {
          // Create ReviewerProfile for guest signup
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
          console.log(`[Complete Profile] Created ReviewerProfile`)
        }

        return user
      })

      console.log(`[Complete Profile] Transaction complete - new user created: ${newUser.id}`)

      // Send welcome email for GUEST signups only (hosts have separate approval flow)
      if (roleHint !== 'host' && newUser.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'
        try {
          await sendOAuthWelcomeEmail(newUser.email, {
            userName: newUser.name || 'Guest',
            userEmail: newUser.email,
            documentsUrl: `${appUrl}/profile?tab=documents`,
            insuranceUrl: `${appUrl}/profile?tab=insurance`,
            dashboardUrl: `${appUrl}/dashboard`
          })
          console.log(`[Complete Profile] Sent welcome email to: ${newUser.email}`)
        } catch (emailError) {
          // Don't fail the signup if email fails - just log it
          console.error(`[Complete Profile] Failed to send welcome email:`, emailError)
        }
      }

      // Generate tokens and return response with cookies
      return await createSuccessResponse(newUser, digitsOnly)
    }

    // ========================================================================
    // EXISTING USER - Just update phone number
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

    // Verify the phone was saved by re-reading
    const verifyUser = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, phone: true, email: true }
    })
    console.log(`[Complete Profile] Verify user phone after update:`, verifyUser)

    // Also update ReviewerProfile if exists
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
      // ReviewerProfile might not exist, that's okay
      console.log(`[Complete Profile] No ReviewerProfile to update (this is OK):`, err instanceof Error ? err.message : 'unknown')
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
async function createSuccessResponse(user: any, phone: string) {
  const tokens = await generateCustomTokens({
    id: user.id,
    email: user.email,
    name: user.name,
    role: user.role || 'CLAIMED'
  })

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

  // Set JWT cookies
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

  console.log(`[Complete Profile] Generated JWT tokens for new user: ${user.id}`)

  return response
}
