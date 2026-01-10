// app/api/payments/balance/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

// GET: Get credit and bonus balances with transaction history
export async function GET(request: NextRequest) {
  try {
    const user = await verifyRequest(request)
    if (!user) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 })
    }

    // Get guest profile
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(user.id ? [{ userId: user.id }] : []),
          ...(user.email ? [{ email: user.email }] : [])
        ]
      }
    })

    if (!profile) {
      return NextResponse.json({ success: false, error: 'Profile not found' }, { status: 404 })
    }

    // Get platform settings for max bonus percentage
    const settings = await prisma.platformSettings.findUnique({
      where: { id: 'global' }
    })
    const maxBonusPercentage = settings?.maxBonusPercentage ?? 0.25

    // Get transaction history
    const transactions = await prisma.creditBonusTransaction.findMany({
      where: { guestId: profile.id },
      orderBy: { createdAt: 'desc' },
      take: 50
    })

    // Check for expiring bonuses (within 30 days)
    const thirtyDaysFromNow = new Date()
    thirtyDaysFromNow.setDate(thirtyDaysFromNow.getDate() + 30)

    const expiringBonuses = await prisma.creditBonusTransaction.findMany({
      where: {
        guestId: profile.id,
        type: 'BONUS',
        action: 'ADD',
        expiresAt: {
          lte: thirtyDaysFromNow,
          gt: new Date()
        }
      }
    })

    // Calculate total expiring bonus amount
    const expiringAmount = expiringBonuses.reduce((sum, tx) => {
      // Only count non-expired, non-used bonuses
      return sum + Math.max(0, tx.amount)
    }, 0)

    // Format transactions
    const formattedTransactions = transactions.map(tx => ({
      id: tx.id,
      type: tx.type,
      action: tx.action,
      amount: tx.amount,
      balanceAfter: tx.balanceAfter,
      reason: tx.reason,
      bookingId: tx.bookingId,
      expiresAt: tx.expiresAt?.toISOString() || null,
      createdAt: tx.createdAt.toISOString()
    }))

    return NextResponse.json({
      success: true,
      creditBalance: profile.creditBalance,
      bonusBalance: profile.bonusBalance,
      maxBonusPercentage,
      expiringBonusAmount: expiringAmount,
      transactions: formattedTransactions
    })

  } catch (error) {
    console.error('[Balance GET] Error:', error)
    return NextResponse.json({ success: false, error: 'Failed to fetch balances' }, { status: 500 })
  }
}
