// app/api/account/link/verify/route.ts
// POST /api/account/link/verify - Verify code and assign legacyDualId to both accounts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { nanoid } from 'nanoid'

export async function POST(request: NextRequest) {
  const { requestId, verificationCode } = await request.json()

  // Validate input
  if (!requestId || !verificationCode) {
    return NextResponse.json(
      { error: 'Request ID and verification code are required' },
      { status: 400 }
    )
  }

  // Find link request
  const linkRequest = await prisma.accountLinkRequest.findUnique({
    where: { id: requestId }
  })

  if (!linkRequest) {
    return NextResponse.json({ error: 'Link request not found' }, { status: 404 })
  }

  // Check status
  if (linkRequest.status !== 'PENDING') {
    return NextResponse.json(
      { error: `Link request is ${linkRequest.status.toLowerCase()}` },
      { status: 400 }
    )
  }

  // Check expiration
  if (new Date() > linkRequest.codeExpiresAt) {
    await prisma.accountLinkRequest.update({
      where: { id: requestId },
      data: { status: 'EXPIRED' }
    })
    return NextResponse.json(
      { error: 'Verification code expired' },
      { status: 400 }
    )
  }

  // Verify code (case-insensitive)
  if (linkRequest.verificationCode.toUpperCase() !== verificationCode.toUpperCase()) {
    return NextResponse.json(
      { error: 'Invalid verification code' },
      { status: 400 }
    )
  }

  // Find target user
  const targetUser = await prisma.user.findUnique({
    where: { email: linkRequest.targetEmail },
    select: { id: true, legacyDualId: true }
  })

  if (!targetUser) {
    return NextResponse.json(
      { error: 'Target user not found' },
      { status: 404 }
    )
  }

  // Double-check that neither user has been linked since request was created
  const initiatingUser = await prisma.user.findUnique({
    where: { id: linkRequest.initiatingUserId },
    select: { id: true, legacyDualId: true }
  })

  if (initiatingUser?.legacyDualId) {
    return NextResponse.json(
      { error: 'Initiating account has been linked to another account since this request was created' },
      { status: 400 }
    )
  }

  if (targetUser.legacyDualId) {
    return NextResponse.json(
      { error: 'Target account has been linked to another account since this request was created' },
      { status: 400 }
    )
  }

  // Generate legacyDualId (16 characters)
  const legacyDualId = nanoid(16)

  // Assign to both Users and their profiles in transaction
  try {
    await prisma.$transaction(async (tx) => {
      // Update initiating user
      await tx.user.update({
        where: { id: linkRequest.initiatingUserId },
        data: { legacyDualId: legacyDualId }
      })

      // Update target user
      await tx.user.update({
        where: { id: targetUser.id },
        data: { legacyDualId: legacyDualId }
      })

      // Update their profiles (RentalHost and ReviewerProfile)
      // Update all RentalHost profiles for initiating user
      await tx.rentalHost.updateMany({
        where: { userId: linkRequest.initiatingUserId },
        data: { legacyDualId: legacyDualId }
      })

      // Update all ReviewerProfile profiles for initiating user
      await tx.reviewerProfile.updateMany({
        where: { userId: linkRequest.initiatingUserId },
        data: { legacyDualId: legacyDualId }
      })

      // Update all RentalHost profiles for target user
      await tx.rentalHost.updateMany({
        where: { userId: targetUser.id },
        data: { legacyDualId: legacyDualId }
      })

      // Update all ReviewerProfile profiles for target user
      await tx.reviewerProfile.updateMany({
        where: { userId: targetUser.id },
        data: { legacyDualId: legacyDualId }
      })

      // Mark request as completed
      await tx.accountLinkRequest.update({
        where: { id: requestId },
        data: {
          status: 'COMPLETED',
          legacyDualId: legacyDualId,
          verifiedAt: new Date()
        }
      })
    })

    console.log(`[Account Link] ✅ Successfully linked accounts:`)
    console.log(`   Initiating User: ${linkRequest.initiatingUserId}`)
    console.log(`   Target User: ${targetUser.id}`)
    console.log(`   Legacy Dual ID: ${legacyDualId}`)

    return NextResponse.json({
      success: true,
      message: 'Accounts successfully linked!',
      legacyDualId: legacyDualId
    })
  } catch (error) {
    console.error('[Account Link] ❌ Transaction failed:', error)
    return NextResponse.json(
      { error: 'Failed to link accounts. Please try again.' },
      { status: 500 }
    )
  }
}
