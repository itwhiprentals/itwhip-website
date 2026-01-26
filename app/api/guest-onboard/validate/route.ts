// app/api/guest-onboard/validate/route.ts
// Validates guest invite token and creates/authenticates guest account + applies credit

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { Prisma } from '@prisma/client'
import { SignJWT } from 'jose'
import { nanoid } from 'nanoid'
import crypto from 'crypto'
import { generateEmailReference } from '@/app/lib/email/config'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key'
)
const JWT_REFRESH_SECRET = new TextEncoder().encode(
  process.env.JWT_REFRESH_SECRET || 'fallback-refresh-secret'
)

export async function POST(request: NextRequest) {
  try {
    const { token } = await request.json()

    if (!token) {
      return NextResponse.json(
        { error: 'Token is required' },
        { status: 400 }
      )
    }

    // Find prospect by invite token
    const prospect = await prisma.guestProspect.findUnique({
      where: { inviteToken: token }
    })

    if (!prospect) {
      return NextResponse.json(
        { error: 'Invalid or unknown link' },
        { status: 404 }
      )
    }

    // Check if token is expired
    if (prospect.inviteTokenExp && new Date(prospect.inviteTokenExp) < new Date()) {
      // Track expired access attempt
      await prisma.guestProspect.update({
        where: { id: prospect.id },
        data: {
          expiredAccessCount: { increment: 1 },
          lastExpiredAccessAt: new Date(),
          lastActivityAt: new Date()
        }
      })

      // Log activity
      await prisma.guestProspectActivity.create({
        data: {
          prospectId: prospect.id,
          activityType: 'EXPIRED_ACCESS',
          metadata: {
            ip: request.headers.get('x-forwarded-for') || 'unknown'
          }
        }
      })

      return NextResponse.json(
        { error: 'This link has expired. Please request a new one.' },
        { status: 410 }
      )
    }

    // Track link click
    await prisma.guestProspect.update({
      where: { id: prospect.id },
      data: {
        linkClickedAt: prospect.linkClickedAt || new Date(),
        linkClickCount: { increment: 1 },
        lastActivityAt: new Date(),
        status: prospect.status === 'INVITED' ? 'CLICKED' : prospect.status
      }
    })

    // Check if already converted - if so, just log them in
    if (prospect.convertedProfileId) {
      const existingProfile = await prisma.reviewerProfile.findUnique({
        where: { id: prospect.convertedProfileId },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        }
      })

      if (existingProfile?.user) {
        // Generate tokens for returning user
        const tokens = await generateGuestTokens(existingProfile.user)

        // Create short-lived session for callback flow (60 seconds)
        const sessionToken = nanoid(32)
        await prisma.guestSession.create({
          data: {
            token: sessionToken,
            userId: existingProfile.user.id,
            accessToken: tokens.accessToken,
            refreshToken: tokens.refreshToken,
            expiresAt: new Date(Date.now() + 60 * 1000) // 60 seconds
          }
        })

        return NextResponse.json({
          success: true,
          sessionToken, // Client uses this for callback redirect
          guestName: prospect.name.split(' ')[0],
          isReturning: true,
          creditApplied: false, // Already applied before
          creditAmount: 0,
          creditType: 'credit'
        })
      }
    }

    // Check if a guest profile already exists with this email
    let guestProfile = await prisma.reviewerProfile.findUnique({
      where: { email: prospect.email.toLowerCase() },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true
          }
        }
      }
    })

    let user = guestProfile?.user
    let isNew = false
    let creditApplied = false

    if (guestProfile) {
      // Update existing profile to mark as recruited if not already
      if (!guestProfile.recruitedVia) {
        await prisma.reviewerProfile.update({
          where: { id: guestProfile.id },
          data: {
            recruitedVia: 'guest_invite',
            recruitedAt: new Date()
          }
        })
      }
    } else {
      // Create new user and guest profile
      isNew = true

      // First, find or create a User record
      user = await prisma.user.findUnique({
        where: { email: prospect.email.toLowerCase() }
      })

      if (!user) {
        user = await prisma.user.create({
          data: {
            id: nanoid(),
            email: prospect.email.toLowerCase(),
            name: prospect.name,
            role: 'CLAIMED', // CLAIMED = verified guest (via invite link)
            passwordHash: '', // No password - they use magic link
            isActive: true,
            emailVerified: false,
            updatedAt: new Date()
          }
        })
      }

      // Create the guest profile
      guestProfile = await prisma.reviewerProfile.create({
        data: {
          id: nanoid(),
          userId: user.id,
          email: prospect.email.toLowerCase(),
          name: prospect.name,
          phoneNumber: prospect.phone || '',
          city: 'Phoenix', // Default
          state: 'AZ',
          // Recruitment tracking
          recruitedVia: 'guest_invite',
          recruitedAt: new Date(),
          // Initial balances
          creditBalance: 0,
          bonusBalance: 0,
          depositWalletBalance: 0,
          updatedAt: new Date()
        },
        include: {
          user: {
            select: {
              id: true,
              email: true,
              name: true,
              role: true
            }
          }
        }
      })

      user = guestProfile.user
    }

    // Apply credit if not already applied
    if (prospect.creditAmount > 0 && !prospect.creditAppliedAt) {
      try {
        await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
          const creditType = prospect.creditType || 'credit'

          if (creditType === 'credit') {
            const newBalance = (guestProfile!.creditBalance || 0) + prospect.creditAmount

            await tx.reviewerProfile.update({
              where: { id: guestProfile!.id },
              data: { creditBalance: { increment: prospect.creditAmount } }
            })

            await tx.creditBonusTransaction.create({
              data: {
                id: nanoid(),
                guestId: guestProfile!.id,
                amount: prospect.creditAmount,
                type: 'CREDIT',
                action: 'ADD',
                balanceAfter: newBalance,
                reason: prospect.creditNote || 'Guest invite credit'
              }
            })
          } else if (creditType === 'bonus') {
            const newBalance = (guestProfile!.bonusBalance || 0) + prospect.creditAmount

            await tx.reviewerProfile.update({
              where: { id: guestProfile!.id },
              data: { bonusBalance: { increment: prospect.creditAmount } }
            })

            await tx.creditBonusTransaction.create({
              data: {
                id: nanoid(),
                guestId: guestProfile!.id,
                amount: prospect.creditAmount,
                type: 'BONUS',
                action: 'ADD',
                balanceAfter: newBalance,
                reason: prospect.creditNote || 'Guest invite bonus',
                expiresAt: prospect.creditExpirationDays
                  ? new Date(Date.now() + prospect.creditExpirationDays * 24 * 60 * 60 * 1000)
                  : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000) // Default 90 days
              }
            })
          } else if (creditType === 'deposit') {
            await tx.reviewerProfile.update({
              where: { id: guestProfile!.id },
              data: { depositWalletBalance: { increment: prospect.creditAmount } }
            })

            const newDepositBalance = (guestProfile!.depositWalletBalance || 0) + prospect.creditAmount
            await tx.depositTransaction.create({
              data: {
                id: nanoid(),
                guestId: guestProfile!.id,
                amount: prospect.creditAmount,
                type: 'LOAD',
                balanceAfter: newDepositBalance,
                description: prospect.creditNote || 'Guest invite deposit bonus'
              }
            })
          }

          // Mark prospect credit as applied
          await tx.guestProspect.update({
            where: { id: prospect.id },
            data: {
              creditAppliedAt: new Date()
            }
          })
        })

        creditApplied = true
      } catch (creditError) {
        console.error('[Guest Onboard] Failed to apply credit:', creditError)
        // Continue anyway - account is created
      }
    }

    // Link prospect to profile
    await prisma.guestProspect.update({
      where: { id: prospect.id },
      data: {
        convertedProfileId: guestProfile!.id,
        convertedAt: new Date(),
        status: 'CONVERTED'
      }
    })

    // Mark email as verified (they clicked the invite link sent to their email)
    await prisma.user.update({
      where: { id: user!.id },
      data: { emailVerified: true }
    })

    // Log conversion activity
    await prisma.guestProspectActivity.create({
      data: {
        prospectId: prospect.id,
        activityType: 'CONVERTED',
        metadata: {
          isNew,
          creditApplied,
          creditAmount: prospect.creditAmount,
          creditType: prospect.creditType
        }
      }
    })

    // Send welcome email with link to set password (only for new users)
    if (isNew && user?.email) {
      try {
        const { sendEmail } = await import('@/app/lib/email/sender')
        const { getGuestWelcomeTemplate } = await import('@/app/lib/email/templates/guest-welcome')

        const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://itwhip.com'

        // Generate a set-password token (similar to forgot-password flow)
        const setPasswordToken = crypto.randomBytes(32).toString('hex')
        const hashedToken = crypto.createHash('sha256').update(setPasswordToken).digest('hex')

        // Save token to user (expires in 7 days)
        await prisma.user.update({
          where: { id: user.id },
          data: {
            resetToken: hashedToken,
            resetTokenExpiry: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
            resetTokenUsed: false
          }
        })

        // Generate reference ID upfront so it can be included in the email
        const emailReferenceId = generateEmailReference('GW')

        const emailData = {
          guestName: prospect.name,
          guestEmail: user.email,
          creditAmount: creditApplied ? prospect.creditAmount : undefined,
          creditType: prospect.creditType as 'credit' | 'bonus' | 'deposit' | undefined,
          setPasswordUrl: `${baseUrl}/auth/set-password?token=${setPasswordToken}`,
          dashboardUrl: `${baseUrl}/dashboard`,
          supportEmail: 'info@itwhip.com',
          referenceId: emailReferenceId
        }

        const { subject, html, text } = getGuestWelcomeTemplate(emailData)
        await sendEmail(user.email, subject, html, text)

        console.log(`[Guest Onboard] Welcome email sent to: ${user.email} (ref: ${emailReferenceId})`)
      } catch (emailError) {
        console.error('[Guest Onboard] Failed to send welcome email:', emailError)
        // Non-critical - continue with login flow
      }
    }

    // Generate tokens for new/existing user
    const tokens = await generateGuestTokens(user!)

    // Create short-lived session for callback flow (60 seconds)
    // This eliminates the cookie race condition by setting cookies in the callback response
    const sessionToken = nanoid(32)
    await prisma.guestSession.create({
      data: {
        token: sessionToken,
        userId: user!.id,
        accessToken: tokens.accessToken,
        refreshToken: tokens.refreshToken,
        expiresAt: new Date(Date.now() + 60 * 1000) // 60 seconds
      }
    })

    return NextResponse.json({
      success: true,
      sessionToken, // Client uses this for callback redirect
      guestName: prospect.name.split(' ')[0],
      isNew,
      creditApplied,
      creditAmount: prospect.creditAmount,
      creditType: prospect.creditType
    })

  } catch (error: any) {
    console.error('[Guest Onboard Validate] Error:', error)
    return NextResponse.json(
      { error: 'Failed to validate link' },
      { status: 500 }
    )
  }
}

// Helper: Generate JWT tokens for guest
async function generateGuestTokens(
  user: { id: string; email: string | null; name: string | null; role: string }
): Promise<{ accessToken: string; refreshToken: string }> {
  const tokenId = nanoid()
  const refreshFamily = nanoid()

  // Create access token (15 minutes)
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

  // Create refresh token (7 days)
  const refreshToken = await new SignJWT({
    userId: user.id,
    family: refreshFamily,
    jti: nanoid()
  })
    .setProtectedHeader({ alg: 'HS256' })
    .setIssuedAt()
    .setExpirationTime('7d')
    .sign(JWT_REFRESH_SECRET)

  // Save refresh token (if model exists in schema)
  try {
    if ('refreshToken' in prisma) {
      await (prisma as any).refreshToken.create({
        data: {
          userId: user.id,
          token: refreshToken,
          family: refreshFamily,
          expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
        }
      })
    }
  } catch (err) {
    // RefreshToken model may not exist - non-critical
    console.log('[Guest Onboard] Refresh token not saved (model may not exist)')
  }

  return { accessToken, refreshToken }
}

// Note: Cookie setting moved to /api/auth/guest-callback route
// This eliminates race condition between Set-Cookie and client navigation
