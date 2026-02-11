// app/api/guest/appeals/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)
const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET!
)

// Helper to verify guest token (tries both guest and admin secrets)
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

// ✅ FIXED: Check appeal limits PER WARNING (not globally)
async function canSubmitAppeal(guestId: string, moderationId: string) {
  // Get ALL appeals for THIS SPECIFIC WARNING only
  const appealsForThisWarning = await prisma.guestAppeal.findMany({
    where: {
      guestId,
      moderationId // ✅ Only check appeals for THIS warning
    },
    orderBy: {
      submittedAt: 'desc'
    }
  })

  // Check if there's already a PENDING or UNDER_REVIEW appeal for this warning
  const pendingAppeal = appealsForThisWarning.find(
    appeal => appeal.status === 'PENDING' || appeal.status === 'UNDER_REVIEW'
  )

  if (pendingAppeal) {
    return {
      canAppeal: false,
      reason: 'EXISTING_APPEAL',
      appealsUsed: appealsForThisWarning.length,
      maxAppeals: 2,
      existingAppeal: pendingAppeal,
      allAppeals: appealsForThisWarning
    }
  }

  // Check if user has used both appeal attempts for this warning (2 max per warning)
  if (appealsForThisWarning.length >= 2) {
    return {
      canAppeal: false,
      reason: 'LIMIT_REACHED',
      appealsUsed: 2,
      maxAppeals: 2,
      existingAppeal: null,
      allAppeals: appealsForThisWarning,
      message: 'You have used both appeal attempts for this warning'
    }
  }

  // ✅ Can submit appeal!
  return {
    canAppeal: true,
    reason: null,
    appealsUsed: appealsForThisWarning.length,
    maxAppeals: 2,
    existingAppeal: null,
    allAppeals: appealsForThisWarning
  }
}

// POST - Submit an appeal
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user from token
    const accessToken = request.cookies.get('accessToken')?.value
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Verify token
    const payload = await verifyGuestToken(accessToken)
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const userId = payload.userId as string

    const body = await request.json()
    const { reason, evidence, moderationId } = body

    if (!reason || !reason.trim()) {
      return NextResponse.json(
        { error: 'Appeal reason is required' },
        { status: 400 }
      )
    }

    // ✅ moderationId is now REQUIRED (each warning must be appealed individually)
    if (!moderationId) {
      return NextResponse.json(
        { error: 'Moderation ID is required to appeal a specific warning' },
        { status: 400 }
      )
    }

    // Find the guest's ReviewerProfile
    const guest = await prisma.reviewerProfile.findUnique({
      where: { userId },
      include: {
        moderationHistory: {
          where: {
            actionType: {
              in: ['SUSPEND', 'BAN', 'WARNING']
            }
          },
          orderBy: {
            takenAt: 'desc'
          }
        }
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest profile not found' },
        { status: 404 }
      )
    }

    // Find the specific moderation action to appeal
    const targetModeration = await prisma.guestModeration.findFirst({
      where: {
        id: moderationId,
        guestId: guest.id
      }
    })

    if (!targetModeration) {
      return NextResponse.json(
        { error: 'Moderation action not found' },
        { status: 404 }
      )
    }

    // ✅ Check if this warning is still active (not expired)
    if (targetModeration.expiresAt && new Date(targetModeration.expiresAt) < new Date()) {
      return NextResponse.json(
        { error: 'This warning has already expired and cannot be appealed' },
        { status: 400 }
      )
    }

    // ✅ Check appeal limits FOR THIS SPECIFIC WARNING
    const appealCheck = await canSubmitAppeal(guest.id, targetModeration.id)
    
    if (!appealCheck.canAppeal) {
      if (appealCheck.reason === 'EXISTING_APPEAL' && appealCheck.existingAppeal) {
        return NextResponse.json(
          { 
            error: 'You already have a pending appeal for this warning',
            reason: 'EXISTING_APPEAL',
            existingAppeal: {
              id: appealCheck.existingAppeal.id,
              status: appealCheck.existingAppeal.status,
              submittedAt: appealCheck.existingAppeal.submittedAt
            },
            appealsUsed: appealCheck.appealsUsed,
            maxAppeals: appealCheck.maxAppeals
          },
          { status: 400 }
        )
      }

      if (appealCheck.reason === 'LIMIT_REACHED') {
        return NextResponse.json(
          { 
            error: `You have used both appeal attempts (2/2) for this warning.`,
            reason: 'LIMIT_REACHED',
            appealsUsed: appealCheck.appealsUsed,
            maxAppeals: appealCheck.maxAppeals,
            message: 'Each warning allows 2 appeal attempts. You have used both for this warning.'
          },
          { status: 400 }
        )
      }

      return NextResponse.json(
        { 
          error: 'Cannot submit appeal at this time',
          reason: appealCheck.reason,
          appealsUsed: appealCheck.appealsUsed,
          maxAppeals: appealCheck.maxAppeals
        },
        { status: 400 }
      )
    }

    // Validate evidence format if provided
    let validatedEvidence = null
    if (evidence) {
      if (!Array.isArray(evidence)) {
        return NextResponse.json(
          { error: 'Evidence must be an array of file URLs' },
          { status: 400 }
        )
      }
      
      // Limit to 5 files
      if (evidence.length > 5) {
        return NextResponse.json(
          { error: 'Maximum 5 evidence files allowed' },
          { status: 400 }
        )
      }

      validatedEvidence = evidence
    }

    // Create the appeal
    const appeal = await prisma.guestAppeal.create({
      data: {
        id: crypto.randomUUID(),
        updatedAt: new Date(),
        guestId: guest.id,
        moderationId: targetModeration.id,
        reason: reason.trim(),
        evidence: validatedEvidence || undefined,
        status: 'PENDING',
        submittedAt: new Date()
      } as any
    })

    console.log('✅ Guest appeal submitted:', {
      appealId: appeal.id,
      guestId: guest.id,
      guestName: guest.name,
      moderationId: targetModeration.id,
      actionType: targetModeration.actionType,
      warningCategory: targetModeration.warningCategory,
      hasEvidence: !!validatedEvidence,
      evidenceCount: validatedEvidence?.length || 0,
      appealsUsedForThisWarning: appealCheck.appealsUsed + 1,
      timestamp: new Date().toISOString()
    })

    // TODO: Send notification to fleet admins about new appeal
    // TODO: Send confirmation email to guest

    return NextResponse.json({
      success: true,
      message: 'Appeal submitted successfully. Our team will review it within 24-48 hours.',
      appeal: {
        id: appeal.id,
        status: appeal.status,
        submittedAt: appeal.submittedAt,
        evidenceCount: validatedEvidence?.length || 0,
        moderationAction: {
          id: targetModeration.id,
          type: targetModeration.actionType,
          level: targetModeration.suspensionLevel,
          category: targetModeration.warningCategory,
          reason: targetModeration.publicReason
        }
      },
      appealLimits: {
        appealsUsedForThisWarning: appealCheck.appealsUsed + 1,
        maxAppealsPerWarning: appealCheck.maxAppeals,
        remainingAppealsForThisWarning: appealCheck.maxAppeals - (appealCheck.appealsUsed + 1)
      }
    })

  } catch (error) {
    console.error('Guest appeal submission error:', error)
    return NextResponse.json(
      { error: 'Failed to submit appeal. Please try again.' },
      { status: 500 }
    )
  }
}

// GET - Get guest's appeals history
export async function GET(request: NextRequest) {
  try {
    // Get authenticated user from token
    const accessToken = request.cookies.get('accessToken')?.value
    
    if (!accessToken) {
      return NextResponse.json(
        { error: 'Unauthorized - Please log in' },
        { status: 401 }
      )
    }

    // Verify token
    const payload = await verifyGuestToken(accessToken)
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const userId = payload.userId as string

    // Find the guest's ReviewerProfile
    const guest = await prisma.reviewerProfile.findUnique({
      where: { userId }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest profile not found' },
        { status: 404 }
      )
    }

    // Fetch all appeals for this guest
    const appeals = await prisma.guestAppeal.findMany({
      where: { guestId: guest.id },
      include: {
        moderation: {
          select: {
            id: true,
            actionType: true,
            suspensionLevel: true,
            warningCategory: true,
            publicReason: true,
            takenAt: true,
            takenBy: true,
            expiresAt: true
          }
        }
      },
      orderBy: {
        submittedAt: 'desc'
      }
    })

    // ✅ Group appeals by moderation action to show appeal count per warning
    const moderationAppealCounts = new Map<string, number>()
    appeals.forEach(appeal => {
      const count = moderationAppealCounts.get(appeal.moderationId) || 0
      moderationAppealCounts.set(appeal.moderationId, count + 1)
    })

    return NextResponse.json({
      success: true,
      appeals: appeals.map(appeal => ({
        id: appeal.id,
        status: appeal.status,
        reason: appeal.reason,
        evidence: appeal.evidence || [],
        submittedAt: appeal.submittedAt,
        reviewedAt: appeal.reviewedAt,
        reviewedBy: appeal.reviewedBy,
        reviewNotes: appeal.reviewNotes,
        moderationAction: {
          id: appeal.moderation.id,
          type: appeal.moderation.actionType,
          level: appeal.moderation.suspensionLevel,
          category: appeal.moderation.warningCategory,
          reason: appeal.moderation.publicReason,
          takenAt: appeal.moderation.takenAt,
          takenBy: appeal.moderation.takenBy,
          expiresAt: appeal.moderation.expiresAt
        },
        // ✅ Show how many appeals exist for THIS warning
        appealsForThisWarning: moderationAppealCounts.get(appeal.moderationId) || 0,
        maxAppealsPerWarning: 2
      })),
      message: 'Each warning allows up to 2 appeal attempts'
    })

  } catch (error) {
    console.error('Failed to fetch guest appeals:', error)
    return NextResponse.json(
      { error: 'Failed to fetch appeals' },
      { status: 500 }
    )
  }
}