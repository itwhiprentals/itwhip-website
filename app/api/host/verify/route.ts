// app/api/host/verify/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendHostVerificationEmail } from '@/app/lib/email'
import crypto from 'crypto'

// IMPORTANT: This API should NOT require authentication
// Hosts need to verify their email BEFORE they can log in

// Helper to check if request has auth (but don't require it)
function getHostIdFromAuth(request: NextRequest): string | null {
  try {
    const authHeader = request.headers.get('authorization')
    const cookieHeader = request.headers.get('cookie')
    // We could decode JWT here if needed, but for verification we don't require it
    return null
  } catch {
    return null
  }
}

// Generate a 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate a secure token for URL-based verification
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

// OPTIONS - Handle CORS preflight
export async function OPTIONS(request: NextRequest) {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  })
}

// POST - Send verification code (NO AUTH REQUIRED)
export async function POST(request: NextRequest) {
  try {
    // Skip any authentication checks for this endpoint
    const body = await request.json()
    const { hostId, verificationType = 'email' } = body

    if (!hostId) {
      return NextResponse.json(
        { error: 'Host ID is required' },
        { status: 400 }
      )
    }

    // Get host details
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        email: true,
        phone: true,
        name: true,
        isVerified: true,
        verificationLevel: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    if (host.isVerified && verificationType === 'email') {
      return NextResponse.json({
        success: true,
        message: `Already verified via ${verificationType}`,
        verified: true
      })
    }

    // Generate verification code and token
    const verificationCode = generateVerificationCode()
    // Create token that includes hostId and code for easy decoding
    const verificationToken = Buffer.from(`${host.id}:${verificationCode}`).toString('base64')
    const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Store verification data in ActivityLog
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        action: 'VERIFICATION_REQUESTED',
        entityType: 'HOST',
        entityId: host.id,
        metadata: {
          verificationType,
          code: verificationCode,
          token: verificationToken,
          expiresAt: expiresAt.toISOString(),
          email: host.email,
          phone: host.phone
        }
      }
    })

    // Send verification based on type
    if (verificationType === 'email') {
      const verificationUrl = `${process.env.NEXT_PUBLIC_APP_URL || process.env.NEXT_PUBLIC_URL || 'https://itwhip.com'}/verify?token=${verificationToken}`
      
      try {
        const emailResult = await sendHostVerificationEmail(host.email, {
          hostName: host.name,
          verificationType: 'email',
          verificationCode,
          verificationUrl,
          expiresIn: '15 minutes'
        })

        if (!emailResult.success) {
          console.error('Failed to send verification email:', emailResult.error)
          // Still return success with devCode in development
          if (process.env.NODE_ENV === 'development') {
            return NextResponse.json({
              success: true,
              message: 'Email service error, but code generated (dev mode)',
              verificationType: 'email',
              devCode: verificationCode,
              devToken: verificationToken,
              error: emailResult.error
            })
          }
          return NextResponse.json(
            { error: 'Failed to send verification email', details: emailResult.error },
            { status: 500 }
          )
        }

        // Success response
        if (process.env.NODE_ENV === 'development') {
          console.log(`Verification email sent to ${host.email} with code: ${verificationCode}`)
          return NextResponse.json({
            success: true,
            message: 'Verification code sent to email',
            verificationType: 'email',
            messageId: emailResult.messageId,
            devCode: verificationCode,
            devToken: verificationToken
          })
        }

        return NextResponse.json({
          success: true,
          message: 'Verification code sent to email',
          verificationType: 'email',
          messageId: emailResult.messageId
        })
      } catch (emailError) {
        console.error('Email sending error:', emailError)
        // In development, still provide the code
        if (process.env.NODE_ENV === 'development') {
          return NextResponse.json({
            success: true,
            message: 'Email error but code generated (dev only)',
            devCode: verificationCode,
            devToken: verificationToken
          })
        }
        return NextResponse.json(
          { error: 'Email service error' },
          { status: 500 }
        )
      }
      
    } else if (verificationType === 'phone') {
      // TODO: Integrate with SMS service (Twilio, etc.)
      console.log(`
        ========================================
        VERIFICATION SMS
        ========================================
        To: ${host.phone}
        
        Your ItWhip verification code is: ${verificationCode}
        
        Valid for 15 minutes.
        ========================================
      `)

      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'Verification code sent to phone',
          verificationType: 'phone',
          devCode: verificationCode
        })
      }

      return NextResponse.json({
        success: true,
        message: 'Verification code sent via SMS',
        verificationType: 'phone'
      })
    }

    return NextResponse.json({
      success: true,
      message: `Verification code sent via ${verificationType}`,
      verificationType
    })

  } catch (error) {
    console.error('Send verification error:', error)
    return NextResponse.json(
      { error: 'Failed to send verification code', details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// PUT - Verify code (NO AUTH REQUIRED)
export async function PUT(request: NextRequest) {
  try {
    // Skip any authentication checks for this endpoint
    const body = await request.json()
    const { hostId, code, token, verificationType = 'email' } = body

    // If token is provided, decode it to get hostId and code
    let actualHostId = hostId
    let actualCode = code
    
    if (token && !hostId && !code) {
      try {
        const decoded = Buffer.from(token, 'base64').toString('utf-8')
        const [decodedHostId, decodedCode] = decoded.split(':')
        actualHostId = decodedHostId
        actualCode = decodedCode
      } catch (e) {
        return NextResponse.json(
          { error: 'Invalid token format' },
          { status: 400 }
        )
      }
    }

    if (!actualHostId || !actualCode) {
      return NextResponse.json(
        { error: 'Host ID and verification code required' },
        { status: 400 }
      )
    }

    // Get host
    const host = await prisma.rentalHost.findUnique({
      where: { id: actualHostId }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Get the most recent verification attempt
    const recentVerification = await prisma.activityLog.findFirst({
      where: {
        entityId: actualHostId,
        action: 'VERIFICATION_REQUESTED',
        entityType: 'HOST'
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    if (!recentVerification || !recentVerification.metadata) {
      return NextResponse.json(
        { error: 'No verification request found. Please request a new code.' },
        { status: 400 }
      )
    }

    const metadata = recentVerification.metadata as any
    const expiresAt = new Date(metadata.expiresAt)

    // Check if expired
    if (new Date() > expiresAt) {
      return NextResponse.json(
        { error: 'Verification code expired. Please request a new one.' },
        { status: 400 }
      )
    }

    // Verify the code
    if (metadata.code !== actualCode) {
      // Log failed attempt
      await prisma.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: 'VERIFICATION_FAILED',
          entityType: 'HOST',
          entityId: actualHostId,
          metadata: {
            verificationType,
            reason: 'Invalid code',
            attemptedCode: actualCode
          }
        }
      })

      return NextResponse.json(
        { error: 'Invalid verification code' },
        { status: 400 }
      )
    }

    // Update host verification status
    const updatedHost = await prisma.rentalHost.update({
      where: { id: actualHostId },
      data: {
        isVerified: true,
        verifiedAt: new Date(),
        verificationLevel: verificationType
        // Note: emailVerified and phoneVerified fields don't exist in the schema
        // The isVerified field is sufficient for now
      }
    })

    // Log successful verification
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        action: 'VERIFICATION_COMPLETED',
        entityType: 'HOST',
        entityId: actualHostId,
        metadata: {
          verificationType,
          verifiedAt: new Date().toISOString()
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Verification successful! You can now log in.',
      host: {
        id: updatedHost.id,
        name: updatedHost.name,
        email: updatedHost.email,
        isVerified: updatedHost.isVerified,
        verificationLevel: updatedHost.verificationLevel
      }
    })

  } catch (error) {
    console.error('Verify code error:', error)
    return NextResponse.json(
      { error: 'Failed to verify code' },
      { status: 500 }
    )
  }
}

// GET - Check verification status (NO AUTH REQUIRED)
export async function GET(request: NextRequest) {
  try {
    // Skip any authentication checks for this endpoint
    const searchParams = request.nextUrl.searchParams
    const hostId = searchParams.get('hostId')
    const email = searchParams.get('email')

    if (!hostId && !email) {
      return NextResponse.json(
        { error: 'Host ID or email is required' },
        { status: 400 }
      )
    }

    const host = await prisma.rentalHost.findUnique({
      where: hostId ? { id: hostId } : { email: email! },
      select: {
        id: true,
        name: true,
        email: true,
        phone: true,
        isVerified: true,
        verifiedAt: true,
        verificationLevel: true,
        emailVerified: true,
        phoneVerified: true
      }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      success: true,
      host: {
        id: host.id,
        name: host.name,
        email: host.email
      },
      verification: {
        isVerified: host.isVerified,
        verifiedAt: host.verifiedAt,
        verificationLevel: host.verificationLevel
      }
    })

  } catch (error) {
    console.error('Check verification error:', error)
    return NextResponse.json(
      { error: 'Failed to check verification status' },
      { status: 500 }
    )
  }
}

// DELETE - Resend verification (NO AUTH REQUIRED)
export async function DELETE(request: NextRequest) {
  try {
    // Skip any authentication checks for this endpoint
    const body = await request.json()
    const { hostId, email } = body

    if (!hostId && !email) {
      return NextResponse.json(
        { error: 'Host ID or email is required' },
        { status: 400 }
      )
    }

    // Get host by ID or email
    const host = await prisma.rentalHost.findUnique({
      where: hostId ? { id: hostId } : { email: email! },
      select: { id: true, email: true }
    })

    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }

    // Check recent attempts to prevent spam
    const recentAttempts = await prisma.activityLog.count({
      where: {
        entityId: host.id,
        action: 'VERIFICATION_REQUESTED',
        createdAt: {
          gte: new Date(Date.now() - 5 * 60 * 1000) // Last 5 minutes
        }
      }
    })

    if (recentAttempts >= 3) {
      return NextResponse.json(
        { error: 'Too many attempts. Please wait 5 minutes.' },
        { status: 429 }
      )
    }

    // Forward to POST to resend
    return POST(new NextRequest(request.url, {
      method: 'POST',
      body: JSON.stringify({ hostId: host.id, verificationType: 'email' })
    }))

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification' },
      { status: 500 }
    )
  }
}