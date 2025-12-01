// app/api/host/verify/resend/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendHostVerificationEmail } from '@/app/lib/email'
import crypto from 'crypto'

// Generate 6-digit verification code
function generateVerificationCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString()
}

// Generate a secure token for URL-based verification
function generateVerificationToken(): string {
  return crypto.randomBytes(32).toString('hex')
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email } = body

    // Validate email
    if (!email) {
      return NextResponse.json(
        { error: 'Email is required' },
        { status: 400 }
      )
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Find host by email (case-insensitive)
    const host = await prisma.rentalHost.findFirst({
      where: { 
        email: {
          equals: email.toLowerCase().trim(),
          mode: 'insensitive'
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        verificationLevel: true
      }
    })

    // Case 1: No account found
    if (!host) {
      return NextResponse.json(
        { 
          error: 'No account found with this email. Please sign up first.',
          code: 'NOT_FOUND'
        },
        { status: 404 }
      )
    }

    // Case 2: Already verified
    if (host.isVerified) {
      return NextResponse.json(
        { 
          error: 'This account is already verified. Please login.',
          code: 'ALREADY_VERIFIED'
        },
        { status: 409 }
      )
    }

    // Case 3: Account exists but not verified - send new code
    const verificationCode = generateVerificationCode()
    const verificationToken = generateVerificationToken()
    const codeExpiry = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

    // Build verification URL
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000'
    const verificationUrl = `${baseUrl}/verify?token=${verificationToken}`

    // Update host with new verification code
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        verificationLevel: JSON.stringify({
          emailCode: verificationCode,
          emailCodeExpiry: codeExpiry.toISOString(),
          emailCodeAttempts: 0,
          emailToken: verificationToken,
          emailTokenExpiry: codeExpiry.toISOString()
        })
      }
    })

    // Send verification email using the exact same format as main verify route
    const emailResult = await sendHostVerificationEmail(host.email, {
      hostName: host.name || 'Host',
      verificationType: 'email',
      verificationCode,
      verificationUrl,
      expiresIn: '15 minutes'
    })

    if (!emailResult.success) {
      console.error('Failed to send verification email:', emailResult.error)
      
      // In development, still return success with the code
      if (process.env.NODE_ENV === 'development') {
        return NextResponse.json({
          success: true,
          message: 'Email service error, but code generated (dev mode)',
          hostId: host.id,
          email: host.email,
          devCode: verificationCode,
          error: emailResult.error
        })
      }
      
      return NextResponse.json(
        { error: 'Failed to send verification email. Please try again.' },
        { status: 500 }
      )
    }

    // Log the activity
    await prisma.activityLog.create({
      data: {
        action: 'VERIFICATION_CODE_RESENT',
        entityType: 'HOST',
        entityId: host.id,
        metadata: {
          email: host.email,
          method: 'email_lookup',
          codeExpiry: codeExpiry.toISOString()
        },
        severity: 'INFO'
      }
    })

    console.log(`Verification code resent to ${host.email}: ${verificationCode}`)

    return NextResponse.json({
      success: true,
      message: 'Verification code sent successfully',
      hostId: host.id,
      email: host.email
    })

  } catch (error) {
    console.error('Resend verification error:', error)
    return NextResponse.json(
      { error: 'Failed to resend verification code. Please try again.' },
      { status: 500 }
    )
  }
}