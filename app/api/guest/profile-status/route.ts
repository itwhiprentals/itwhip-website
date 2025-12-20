// app/api/guest/profile-status/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'fallback-secret-key-change-in-production'
)
const GUEST_JWT_SECRET = new TextEncoder().encode(
  process.env.GUEST_JWT_SECRET || 'fallback-guest-secret-key'
)

// Helper to verify token (tries both guest and admin secrets)
async function verifyToken(token: string) {
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

// GET - Get guest profile moderation status
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
    const payload = await verifyToken(accessToken)
    if (!payload || !payload.userId) {
      return NextResponse.json(
        { error: 'Invalid authentication token' },
        { status: 401 }
      )
    }

    const userId = payload.userId as string

    // Find the guest's ReviewerProfile
    const profile = await prisma.reviewerProfile.findUnique({
      where: { userId },
      select: {
        id: true,
        // Suspension fields
        suspensionLevel: true,
        suspendedAt: true,
        suspendedReason: true,
        suspendedBy: true,
        suspensionExpiresAt: true,
        autoReactivate: true,
        // Ban fields
        bannedAt: true,
        banReason: true,
        bannedBy: true,
        // Warning fields
        warningCount: true,
        lastWarningAt: true,
        activeWarningCount: true,
        // Restriction fields
        canBookLuxury: true,
        canBookPremium: true,
        requiresManualApproval: true,
        canInstantBook: true,
        // Account hold
        accountOnHold: true,
        accountHoldReason: true,
        accountHoldClaimId: true,
        accountHoldAppliedAt: true
      }
    })

    if (!profile) {
      return NextResponse.json(
        { error: 'Guest profile not found' },
        { status: 404 }
      )
    }

    // Optionally fetch GuestProfileStatus if it exists
    let guestProfileStatus = null
    try {
      guestProfileStatus = await prisma.guestProfileStatus.findUnique({
        where: { guestId: profile.id },
        select: {
          accountStatus: true,
          activeWarningCount: true,
          activeSuspensions: true,
          activeRestrictions: true,
          lastWarningAt: true,
          lastSuspensionAt: true,
          lastNotificationAt: true
        }
      })
    } catch {
      // GuestProfileStatus may not exist for all guests
    }

    const now = new Date()

    // Determine account status
    let accountStatus = 'ACTIVE'
    if (profile.bannedAt) {
      accountStatus = 'BANNED'
    } else if (profile.suspendedAt && profile.suspensionExpiresAt && now < profile.suspensionExpiresAt) {
      accountStatus = 'SUSPENDED'
    } else if (guestProfileStatus?.accountStatus) {
      accountStatus = guestProfileStatus.accountStatus
    }

    // Build active suspensions array
    const activeSuspensions = []
    if (profile.suspendedAt && profile.suspensionExpiresAt && now < profile.suspensionExpiresAt) {
      activeSuspensions.push({
        level: profile.suspensionLevel,
        reason: profile.suspendedReason,
        suspendedAt: profile.suspendedAt,
        expiresAt: profile.suspensionExpiresAt,
        autoReactivate: profile.autoReactivate
      })
    }

    // Build active restrictions object
    const activeRestrictions = {
      canBookLuxury: profile.canBookLuxury ?? true,
      canBookPremium: profile.canBookPremium ?? true,
      requiresManualApproval: profile.requiresManualApproval ?? false,
      canInstantBook: profile.canInstantBook ?? true,
      restrictions: guestProfileStatus?.activeRestrictions || []
    }

    // Response
    const statusData = {
      accountStatus,
      activeWarningCount: guestProfileStatus?.activeWarningCount ?? profile.activeWarningCount ?? 0,
      totalWarningCount: profile.warningCount ?? 0,
      lastWarningAt: guestProfileStatus?.lastWarningAt ?? profile.lastWarningAt,
      activeSuspensions,
      activeSuspensionCount: guestProfileStatus?.activeSuspensions ?? activeSuspensions.length,
      lastSuspensionAt: guestProfileStatus?.lastSuspensionAt ?? profile.suspendedAt,
      activeRestrictions,
      accountOnHold: profile.accountOnHold ?? false,
      accountHoldReason: profile.accountHoldReason,
      accountHoldClaimId: profile.accountHoldClaimId,
      accountHoldAppliedAt: profile.accountHoldAppliedAt,
      // Ban info (if applicable)
      ...(profile.bannedAt && {
        bannedAt: profile.bannedAt,
        banReason: profile.banReason
      })
    }

    return NextResponse.json({
      success: true,
      status: statusData
    })

  } catch (error) {
    console.error('Failed to fetch guest profile status:', error)
    return NextResponse.json(
      { error: 'Failed to fetch profile status' },
      { status: 500 }
    )
  }
}
