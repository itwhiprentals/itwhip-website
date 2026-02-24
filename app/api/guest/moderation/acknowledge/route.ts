// POST /api/guest/moderation/acknowledge
// Guest dismisses their first warning by acknowledging Community Guidelines
// Only works when activeWarningCount === 1

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)
const GUEST_JWT_SECRET = new TextEncoder().encode(process.env.GUEST_JWT_SECRET!)

async function verifyGuestToken(token: string) {
  for (const secret of [GUEST_JWT_SECRET, JWT_SECRET]) {
    try {
      const { payload } = await jwtVerify(token, secret)
      return payload
    } catch {
      continue
    }
  }
  return null
}

export async function POST(request: NextRequest) {
  try {
    const accessToken = request.cookies.get('accessToken')?.value

    if (!accessToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const payload = await verifyGuestToken(accessToken)
    if (!payload || !payload.userId) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const userId = payload.userId as string

    // Find guest profile with active warnings
    const guest = await prisma.reviewerProfile.findUnique({
      where: { userId },
      include: {
        moderationHistory: {
          where: { actionType: 'WARNING' },
          orderBy: { takenAt: 'desc' }
        }
      }
    })

    if (!guest) {
      return NextResponse.json({ error: 'Guest profile not found' }, { status: 404 })
    }

    // Only allow for first warning (activeWarningCount === 1)
    if (!guest.activeWarningCount || guest.activeWarningCount !== 1) {
      return NextResponse.json(
        { error: 'Guidelines acknowledgment is only available for first warnings' },
        { status: 400 }
      )
    }

    const now = new Date()

    // Find the single active warning
    const activeWarning = guest.moderationHistory.find(w =>
      w.actionType === 'WARNING' &&
      (!w.expiresAt || new Date(w.expiresAt) > now)
    )

    if (!activeWarning) {
      return NextResponse.json(
        { error: 'No active warning found' },
        { status: 400 }
      )
    }

    // Check it hasn't already been appealed (approved)
    const approvedAppeal = await prisma.guestAppeal.findFirst({
      where: {
        guestId: guest.id,
        moderationId: activeWarning.id,
        status: 'APPROVED'
      }
    })

    if (approvedAppeal) {
      return NextResponse.json(
        { error: 'This warning has already been cleared via appeal' },
        { status: 400 }
      )
    }

    // Transaction: expire warning + update profile + audit trail
    const result = await prisma.$transaction(async (tx) => {
      // Expire the warning
      await tx.guestModeration.update({
        where: { id: activeWarning.id },
        data: { expiresAt: now }
      })

      // Update profile counts and reset restrictions
      await tx.reviewerProfile.update({
        where: { id: guest.id },
        data: {
          activeWarningCount: 0,
          canInstantBook: true,
          canBookLuxury: true,
          canBookPremium: true,
          requiresManualApproval: false
        }
      })

      // Update GuestProfileStatus if it exists
      await tx.guestProfileStatus.updateMany({
        where: { guestId: guest.id },
        data: { accountStatus: 'ACTIVE' }
      })

      // Audit trail
      await tx.guestModeration.create({
        data: {
          id: crypto.randomUUID(),
          guestId: guest.id,
          actionType: 'NOTE_ADDED',
          publicReason: 'Warning dismissed — guest acknowledged Community Guidelines',
          internalNotes: `Guest acknowledged Community Guidelines to dismiss warning ${activeWarning.id}. Category: ${activeWarning.warningCategory || 'N/A'}. Original reason: ${activeWarning.publicReason}`,
          internalNotesOnly: true,
          takenBy: 'system-guidelines-ack',
          takenAt: now
        }
      })

      return { dismissedWarningId: activeWarning.id }
    })

    console.log(`[Moderation] Warning ${result.dismissedWarningId} dismissed via guidelines acknowledgment for guest ${guest.id}`)

    return NextResponse.json({
      success: true,
      dismissedWarningId: result.dismissedWarningId,
      message: 'Warning dismissed successfully'
    })

  } catch (error) {
    console.error('[Moderation] Error acknowledging warning:', error)
    return NextResponse.json(
      { error: 'Failed to acknowledge warning' },
      { status: 500 }
    )
  }
}
