// app/api/partner/onboarding/secure-account/route.ts
// Partner API for recruited hosts to secure their account (phone, email verification, password)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { hash } from 'argon2'
import { nanoid } from 'nanoid'
import { logProspectActivity } from '@/app/lib/auth/host-tokens'

const JWT_SECRET = process.env.JWT_SECRET!

// Helper to get current host from auth
async function getCurrentHost() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value
    || cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string; userId?: string }
    const hostId = decoded.hostId

    if (!hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: { convertedFromProspect: true }
    })
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    // ─────────────────────────────────────────────────────────
    // Action: Send verification code to email
    // ─────────────────────────────────────────────────────────
    if (action === 'sendVerificationCode') {
      const { email } = body

      if (!email || typeof email !== 'string') {
        return NextResponse.json(
          { error: 'Email is required' },
          { status: 400 }
        )
      }

      // Generate a 6-digit code
      const code = Math.floor(100000 + Math.random() * 900000).toString()
      const expiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

      // Find or create User linked to this host to store the verification code
      if (host.userId) {
        await prisma.user.update({
          where: { id: host.userId },
          data: {
            emailVerificationCode: code,
            emailVerificationExpiry: expiry
          }
        })
      } else {
        // Create a User record to store the verification code
        const userId = nanoid()
        await prisma.user.create({
          data: {
            id: userId,
            email: host.email,
            name: host.name,
            role: 'ANONYMOUS',
            emailVerificationCode: code,
            emailVerificationExpiry: expiry,
            updatedAt: new Date()
          }
        })
        // Link the user to the host
        await prisma.rentalHost.update({
          where: { id: host.id },
          data: { userId }
        })
      }

      // TODO: Send actual email with verification code
      console.log(`[Secure Account] Verification code for ${email}: ${code}`)

      // Log activity if prospect exists
      if (host.convertedFromProspect) {
        await logProspectActivity(host.convertedFromProspect.id, 'EMAIL_VERIFICATION_SENT', {
          hostId: host.id,
          email
        })
      }

      return NextResponse.json({ success: true })
    }

    // ─────────────────────────────────────────────────────────
    // Action: Secure account (phone, email, password)
    // ─────────────────────────────────────────────────────────
    if (action === 'secureAccount') {
      const { phone, email, password, verificationCode } = body

      // Update phone if provided
      if (phone) {
        await prisma.rentalHost.update({
          where: { id: host.id },
          data: { phone }
        })
      }

      // Verify and update email if provided
      if (email && verificationCode) {
        // Find the User to check the verification code
        if (!host.userId) {
          return NextResponse.json(
            { error: 'No verification code was sent. Please request a code first.' },
            { status: 400 }
          )
        }

        const user = await prisma.user.findUnique({
          where: { id: host.userId }
        })

        if (!user) {
          return NextResponse.json(
            { error: 'User record not found' },
            { status: 400 }
          )
        }

        // Check code validity
        if (
          !user.emailVerificationCode ||
          !user.emailVerificationExpiry ||
          user.emailVerificationCode !== verificationCode
        ) {
          return NextResponse.json(
            { error: 'Invalid verification code' },
            { status: 400 }
          )
        }

        // Check expiry
        if (new Date() > new Date(user.emailVerificationExpiry)) {
          return NextResponse.json(
            { error: 'Verification code has expired. Please request a new one.' },
            { status: 400 }
          )
        }

        // Update host email as verified
        await prisma.rentalHost.update({
          where: { id: host.id },
          data: {
            email,
            emailVerified: true,
            emailVerifiedAt: new Date()
          }
        })

        // Clear the verification code
        await prisma.user.update({
          where: { id: host.userId },
          data: {
            emailVerificationCode: null,
            emailVerificationExpiry: null
          }
        })
      }

      // Set password if provided
      if (password) {
        if (typeof password !== 'string' || password.length < 8) {
          return NextResponse.json(
            { error: 'Password must be at least 8 characters' },
            { status: 400 }
          )
        }

        const passwordHash = await hash(password)

        if (host.userId) {
          // Update existing User's password
          await prisma.user.update({
            where: { id: host.userId },
            data: { passwordHash }
          })
        } else {
          // Create a new User linked to this host
          const userId = nanoid()
          await prisma.user.create({
            data: {
              id: userId,
              email: host.email,
              name: host.name,
              passwordHash,
              role: 'CLAIMED',
              emailVerified: true,
              updatedAt: new Date()
            }
          })
          // Link the user to the host
          await prisma.rentalHost.update({
            where: { id: host.id },
            data: { userId }
          })
        }

        // Mark host as having a password
        await prisma.rentalHost.update({
          where: { id: host.id },
          data: { hasPassword: true }
        })
      }

      // Log activity if prospect exists
      if (host.convertedFromProspect) {
        await logProspectActivity(host.convertedFromProspect.id, 'ACCOUNT_SECURED', {
          hostId: host.id,
          updatedFields: {
            phone: !!phone,
            email: !!email,
            password: !!password
          }
        })
      }

      return NextResponse.json({ success: true })
    }

    // Unknown action
    return NextResponse.json(
      { error: `Unknown action: ${action}` },
      { status: 400 }
    )

  } catch (error: any) {
    console.error('[Secure Account API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to secure account' },
      { status: 500 }
    )
  }
}
