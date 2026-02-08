// app/api/fleet/guests/[id]/credits/route.ts
// Add or remove credits/bonus/deposit from existing guest accounts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// POST /api/fleet/guests/[id]/credits - Add or remove credits
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify fleet access
    const urlKey = request.nextUrl.searchParams.get('key')
    const headerKey = request.headers.get('x-fleet-key')
    const phoenixKey = 'phoenix-fleet-2847'

    if (urlKey !== phoenixKey && headerKey !== phoenixKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      amount,
      type = 'credit', // 'credit' | 'bonus' | 'deposit'
      action = 'add',  // 'add' | 'remove'
      reason,
      note,
      expirationDays,
      adminUser = 'fleet-admin'
    } = body

    // Validate amount
    if (!amount || amount <= 0) {
      return NextResponse.json(
        { error: 'Amount must be a positive number' },
        { status: 400 }
      )
    }

    // Validate type
    if (!['credit', 'bonus', 'deposit'].includes(type)) {
      return NextResponse.json(
        { error: 'Type must be one of: credit, bonus, deposit' },
        { status: 400 }
      )
    }

    // Validate action
    if (!['add', 'remove'].includes(action)) {
      return NextResponse.json(
        { error: 'Action must be one of: add, remove' },
        { status: 400 }
      )
    }

    // Find the guest
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        creditBalance: true,
        bonusBalance: true,
        depositWalletBalance: true
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    // Determine which balance to modify
    const balanceField = type === 'credit'
      ? 'creditBalance'
      : type === 'bonus'
        ? 'bonusBalance'
        : 'depositWalletBalance'

    const currentBalance = type === 'credit'
      ? (guest.creditBalance || 0)
      : type === 'bonus'
        ? (guest.bonusBalance || 0)
        : (guest.depositWalletBalance || 0)

    // Check if removal is possible
    if (action === 'remove' && currentBalance < amount) {
      return NextResponse.json(
        {
          error: `Insufficient ${type} balance. Current: $${currentBalance.toFixed(2)}, Requested: $${amount.toFixed(2)}`
        },
        { status: 400 }
      )
    }

    // Calculate new balance
    const adjustmentAmount = action === 'add' ? amount : -amount
    const newBalance = currentBalance + adjustmentAmount

    // Calculate expiration if provided
    let expiresAt: Date | null = null
    if (expirationDays && action === 'add') {
      expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + expirationDays)
    }

    // Perform the update in a transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the balance
      const updatedGuest = await tx.reviewerProfile.update({
        where: { id },
        data: {
          [balanceField]: newBalance,
          updatedAt: new Date()
        },
        select: {
          id: true,
          name: true,
          email: true,
          creditBalance: true,
          bonusBalance: true,
          depositWalletBalance: true
        }
      })

      // Create the transaction record based on type
      let transaction
      if (type === 'deposit') {
        // Use DepositTransaction for deposit wallet
        transaction = await tx.depositTransaction.create({
          data: {
            id: crypto.randomUUID(),
            guestId: id,
            amount: adjustmentAmount,
            type: action === 'add' ? 'ADD' : 'REFUND',
            balanceAfter: newBalance,
            description: reason || note || `Admin ${action}: ${type}`
          }
        })
      } else {
        // Use CreditBonusTransaction for credit/bonus
        transaction = await tx.creditBonusTransaction.create({
          data: {
            id: crypto.randomUUID(),
            guestId: id,
            amount: adjustmentAmount,
            type: type === 'credit' ? 'CREDIT' : 'BONUS',
            action: action === 'add' ? 'ADD' : 'ADJUST',
            balanceAfter: newBalance,
            reason: reason || note || `Admin ${action}`,
            expiresAt
          }
        })
      }

      // Log the activity
      await tx.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: `guest_${type}_${action}`,
          entityType: 'ReviewerProfile',
          entityId: id,
          metadata: {
            amount,
            type,
            action,
            previousBalance: currentBalance,
            newBalance,
            reason: reason || note,
            expiresAt,
            adminUser
          },
          ipAddress: '127.0.0.1'
        }
      })

      return { updatedGuest, transaction }
    })

    console.log(`💰 Guest ${type} ${action}:`, {
      guestId: id,
      guestName: guest.name,
      amount,
      type,
      action,
      previousBalance: currentBalance,
      newBalance,
      reason: reason || note,
      adminUser
    })

    return NextResponse.json({
      success: true,
      message: `Successfully ${action === 'add' ? 'added' : 'removed'} $${amount.toFixed(2)} ${type}`,
      guest: {
        id: result.updatedGuest.id,
        name: result.updatedGuest.name,
        email: result.updatedGuest.email,
        balances: {
          credit: result.updatedGuest.creditBalance || 0,
          bonus: result.updatedGuest.bonusBalance || 0,
          deposit: result.updatedGuest.depositWalletBalance || 0
        }
      },
      transaction: {
        id: result.transaction.id,
        amount: adjustmentAmount,
        type,
        action,
        previousBalance: currentBalance,
        newBalance,
        expiresAt
      }
    })

  } catch (error: any) {
    console.error('[Fleet Guest Credits] Error:', error)
    return NextResponse.json(
      { error: 'Failed to update credits', details: error.message },
      { status: 500 }
    )
  }
}

// GET /api/fleet/guests/[id]/credits - Get credit history
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Verify fleet access
    const urlKey = request.nextUrl.searchParams.get('key')
    const headerKey = request.headers.get('x-fleet-key')
    const phoenixKey = 'phoenix-fleet-2847'

    if (urlKey !== phoenixKey && headerKey !== phoenixKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const limit = Math.min(parseInt(searchParams.get('limit') || '50'), 100)
    const type = searchParams.get('type') // 'credit' | 'bonus' | 'deposit' | null for all

    // Find the guest
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        creditBalance: true,
        bonusBalance: true,
        depositWalletBalance: true,
        stripeIdentityStatus: true,
        documentsVerified: true
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    // Fetch credit/bonus transactions
    const creditBonusTransactions = await prisma.creditBonusTransaction.findMany({
      where: {
        guestId: id,
        ...(type === 'credit' || type === 'bonus' ? {
          type: type.toUpperCase()
        } : {})
      },
      orderBy: { createdAt: 'desc' },
      take: limit
    })

    // Fetch deposit transactions if needed
    let depositTransactions: any[] = []
    if (!type || type === 'deposit') {
      depositTransactions = await prisma.depositTransaction.findMany({
        where: { guestId: id },
        orderBy: { createdAt: 'desc' },
        take: limit
      })
    }

    // Combine and sort all transactions
    const allTransactions = [
      ...creditBonusTransactions.map(t => ({
        id: t.id,
        amount: t.amount,
        type: t.type.toLowerCase(),
        action: t.action,
        balanceAfter: t.balanceAfter,
        reason: t.reason,
        expiresAt: t.expiresAt,
        createdAt: t.createdAt
      })),
      ...depositTransactions.map(t => ({
        id: t.id,
        amount: t.amount,
        type: 'deposit',
        action: t.type,
        balanceAfter: t.balanceAfter,
        reason: t.description,
        expiresAt: null,
        createdAt: t.createdAt
      }))
    ].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
     .slice(0, limit)

    return NextResponse.json({
      success: true,
      guest: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        balances: {
          credit: guest.creditBalance || 0,
          bonus: guest.bonusBalance || 0,
          deposit: guest.depositWalletBalance || 0,
          total: (guest.creditBalance || 0) + (guest.bonusBalance || 0) + (guest.depositWalletBalance || 0)
        },
        verification: {
          isVerified: guest.stripeIdentityStatus === 'verified' || guest.documentsVerified === true,
          status: guest.stripeIdentityStatus,
          documentsVerified: guest.documentsVerified
        }
      },
      transactions: allTransactions,
      count: allTransactions.length
    })

  } catch (error: any) {
    console.error('[Fleet Guest Credits History] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch credit history', details: error.message },
      { status: 500 }
    )
  }
}
