// app/api/account/link/request/route.ts
// POST /api/account/link/request - Initiate account linking by sending verification code

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  const user = await verifyRequest(request)
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { targetEmail } = await request.json()

  // Validate targetEmail
  if (!targetEmail || typeof targetEmail !== 'string') {
    return NextResponse.json(
      { error: 'Target email is required' },
      { status: 400 }
    )
  }

  // Cannot link to yourself
  if (targetEmail === user.email) {
    return NextResponse.json(
      { error: 'Cannot link account to itself' },
      { status: 400 }
    )
  }

  // Find target user by email
  const targetUser = await prisma.user.findUnique({
    where: { email: targetEmail },
    select: { id: true, email: true, legacyDualId: true }
  })

  if (!targetUser) {
    return NextResponse.json(
      { error: 'No account found with that email' },
      { status: 404 }
    )
  }

  // Check if already linked
  if (user.legacyDualId && targetUser.legacyDualId === user.legacyDualId) {
    return NextResponse.json(
      { error: 'Accounts are already linked' },
      { status: 400 }
    )
  }

  // Check if either user already has a different link
  if (user.legacyDualId) {
    return NextResponse.json(
      { error: 'Your account is already linked to another account. Unlink first to link to a different account.' },
      { status: 400 }
    )
  }

  if (targetUser.legacyDualId) {
    return NextResponse.json(
      { error: 'Target account is already linked to another account.' },
      { status: 400 }
    )
  }

  // Check for existing pending request
  const existingRequest = await prisma.accountLinkRequest.findFirst({
    where: {
      initiatingUserId: user.id,
      targetEmail: targetEmail,
      status: 'PENDING'
    }
  })

  if (existingRequest) {
    // Check if code is still valid
    if (new Date() < existingRequest.codeExpiresAt) {
      return NextResponse.json(
        {
          error: 'A pending link request already exists. Please wait for it to expire or complete it.',
          requestId: existingRequest.id
        },
        { status: 400 }
      )
    } else {
      // Expire the old request
      await prisma.accountLinkRequest.update({
        where: { id: existingRequest.id },
        data: { status: 'EXPIRED' }
      })
    }
  }

  // Generate verification code (8 characters, uppercase)
  const verificationCode = nanoid(8).toUpperCase()
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000) // 15 minutes

  // Create link request
  const linkRequest = await prisma.accountLinkRequest.create({
    data: {
      initiatingUserId: user.id,
      targetEmail: targetEmail,
      verificationCode: verificationCode,
      codeExpiresAt: expiresAt,
      status: 'PENDING'
    }
  })

  // TODO: Send verification code via email
  // For now, just log it (in production, use email service)
  console.log(`[Account Link] Verification code for ${targetEmail}: ${verificationCode}`)
  console.log(`[Account Link] Code expires at: ${expiresAt.toISOString()}`)

  // In development, return the code (REMOVE IN PRODUCTION)
  const responseData: any = {
    success: true,
    requestId: linkRequest.id,
    message: 'Verification code sent to target email'
  }

  if (process.env.NODE_ENV === 'development') {
    responseData.devCode = verificationCode // Only for dev/testing
  }

  return NextResponse.json(responseData)
}
