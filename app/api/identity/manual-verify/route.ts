// app/api/identity/manual-verify/route.ts
// Submit a manual verification request (selfie holding license)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, name, phone, selfieUrl, dlFrontUrl, dlBackUrl, carId } = body

    if (!email || !selfieUrl) {
      return NextResponse.json(
        { error: 'Email and selfie are required' },
        { status: 400 }
      )
    }

    const normalizedEmail = email.toLowerCase().trim()

    // Check if frozen
    const frozenRecord = await prisma.suspendedIdentifier.findUnique({
      where: {
        identifierType_identifierValue: {
          identifierType: 'email',
          identifierValue: normalizedEmail
        }
      }
    })

    const now = new Date()
    if (frozenRecord && (!frozenRecord.expiresAt || frozenRecord.expiresAt > now)) {
      return NextResponse.json(
        { error: 'Verification is temporarily unavailable for this account' },
        { status: 403 }
      )
    }

    // Check for existing pending request
    const existingPending = await prisma.manualVerificationRequest.findFirst({
      where: {
        email: normalizedEmail,
        status: 'PENDING'
      }
    })

    if (existingPending) {
      return NextResponse.json({
        success: true,
        requestId: existingPending.id,
        message: 'You already have a verification request under review.',
        alreadyPending: true
      })
    }

    // Get IP and user agent
    const ipAddress = request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
      || request.headers.get('x-real-ip')
      || 'unknown'
    const userAgent = request.headers.get('user-agent') || 'unknown'

    // Create manual verification request
    const verificationRequest = await prisma.manualVerificationRequest.create({
      data: {
        email: normalizedEmail,
        name: name || null,
        phone: phone || null,
        selfieUrl,
        dlFrontUrl: dlFrontUrl || null,
        dlBackUrl: dlBackUrl || null,
        bookingCarId: carId || null,
        ipAddress,
        userAgent
      }
    })

    console.log(`[Manual Verify] New request ${verificationRequest.id} from ${normalizedEmail}`)

    return NextResponse.json({
      success: true,
      requestId: verificationRequest.id,
      message: 'Your verification is under review. We\'ll notify you by email once approved.'
    })

  } catch (error: any) {
    console.error('[Manual Verify API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to submit verification request' },
      { status: 500 }
    )
  }
}
