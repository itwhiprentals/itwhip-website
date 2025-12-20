// app/api/auth/complete-profile/route.ts
// API endpoint to save phone number after OAuth signup

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth/next-auth-config'
import { prisma } from '@/app/lib/database/prisma'

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
    const { phone } = body

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

    const userId = (session.user as any).id
    const email = session.user.email

    // Update user's phone number
    await prisma.user.update({
      where: { id: userId },
      data: {
        phone: digitsOnly,
        phoneVerified: false // Phone not verified yet
      }
    })

    // Also update ReviewerProfile if exists
    try {
      await prisma.reviewerProfile.update({
        where: { userId: userId },
        data: {
          phone: digitsOnly
        }
      })
    } catch {
      // ReviewerProfile might not exist, that's okay
    }

    console.log(`[Complete Profile] Phone saved for user ${email}: ${digitsOnly}`)

    return NextResponse.json({
      success: true,
      message: 'Phone number saved successfully'
    })

  } catch (error) {
    console.error('[Complete Profile] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save phone number' },
      { status: 500 }
    )
  }
}
