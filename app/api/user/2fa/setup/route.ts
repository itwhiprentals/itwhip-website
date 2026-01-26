// app/api/user/2fa/setup/route.ts
// Generate TOTP secret and QR code for 2FA setup
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import * as OTPAuth from 'otpauth'
import * as QRCode from 'qrcode'

// Helper to get user ID from JWT
async function getUserFromToken(req: NextRequest): Promise<string | null> {
  try {
    const userId = req.headers.get('x-user-id')
    if (userId) return userId

    const token = req.cookies.get('accessToken')?.value
    if (!token) return null

    const { jwtVerify } = await import('jose')
    const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET || 'fallback-secret-key')
    const GUEST_JWT_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key')

    for (const secret of [JWT_SECRET, GUEST_JWT_SECRET]) {
      try {
        const { payload } = await jwtVerify(token, secret)
        return payload.userId as string
      } catch {
        continue
      }
    }

    return null
  } catch (error) {
    console.error('[2FA Setup] Token verification failed:', error)
    return null
  }
}

// Generate random secret
function generateSecret(): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567'
  let secret = ''
  for (let i = 0; i < 32; i++) {
    secret += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return secret
}

export async function POST(req: NextRequest) {
  try {
    const userId = await getUserFromToken(req)

    if (!userId) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Get user
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        email: true,
        name: true,
        twoFactorEnabled: true,
        twoFactorSecret: true
      }
    })

    if (!user) {
      return NextResponse.json(
        { error: 'User not found' },
        { status: 404 }
      )
    }

    if (user.twoFactorEnabled) {
      return NextResponse.json(
        { error: 'Two-factor authentication is already enabled' },
        { status: 400 }
      )
    }

    // Generate new secret
    const secret = generateSecret()

    // Create TOTP object
    const totp = new OTPAuth.TOTP({
      issuer: 'ItWhip',
      label: user.email || user.name || 'ItWhip User',
      algorithm: 'SHA1',
      digits: 6,
      period: 30,
      secret: secret
    })

    // Get otpauth URL for QR code
    const otpauthUrl = totp.toString()

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(otpauthUrl, {
      width: 200,
      margin: 2,
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    })

    // Store the secret temporarily (not enabled yet)
    await prisma.user.update({
      where: { id: userId },
      data: {
        twoFactorSecret: secret
      }
    })

    console.log(`[2FA Setup] Secret generated for user: ${userId}`)

    return NextResponse.json({
      success: true,
      secret, // Show to user so they can manually enter if needed
      qrCode: qrCodeDataUrl,
      message: 'Scan the QR code with your authenticator app, then enter the code to verify'
    })

  } catch (error) {
    console.error('[2FA Setup] Error:', error)
    return NextResponse.json(
      { error: 'An error occurred while setting up 2FA' },
      { status: 500 }
    )
  }
}
