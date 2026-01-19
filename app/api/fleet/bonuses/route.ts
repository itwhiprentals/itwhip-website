// app/api/fleet/bonuses/route.ts
// Fleet Bonus Management API

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET - Fetch bonus analytics and recent transactions
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const action = searchParams.get('action')

    // Fetch platform settings for global bonus values
    const settings = await prisma.platformSettings.findFirst({
      where: { id: 'global' }
    })

    if (action === 'analytics') {
      // Get bonus analytics
      const [
        totalBonusesGiven,
        totalDepositsGiven,
        totalCreditsGiven,
        guestsWithBonus,
        recentTransactions
      ] = await Promise.all([
        // Total bonuses given (from CreditBonusTransaction - ADD actions)
        prisma.creditBonusTransaction.aggregate({
          where: { action: 'ADD' },
          _sum: { amount: true }
        }),
        // Total deposits given (from DepositTransaction - LOAD type with bonus in description)
        prisma.depositTransaction.aggregate({
          where: {
            type: 'LOAD',
            description: { contains: 'bonus', mode: 'insensitive' }
          },
          _sum: { amount: true }
        }),
        // Total credit balance across all guests
        prisma.reviewerProfile.aggregate({
          _sum: {
            creditBalance: true,
            bonusBalance: true,
            depositWalletBalance: true
          }
        }),
        // Count of guests with any bonus
        prisma.reviewerProfile.count({
          where: {
            OR: [
              { bonusBalance: { gt: 0 } },
              { creditBalance: { gt: 0 } },
              { depositWalletBalance: { gt: 0 } }
            ]
          }
        }),
        // Recent bonus transactions (from CreditBonusTransaction)
        prisma.creditBonusTransaction.findMany({
          where: { action: 'ADD' },
          orderBy: { createdAt: 'desc' },
          take: 20,
          include: {
            ReviewerProfile: {
              select: {
                id: true,
                name: true,
                email: true,
                profilePhotoUrl: true
              }
            }
          }
        })
      ])

      return NextResponse.json({
        success: true,
        analytics: {
          totalBonusesGiven: (totalBonusesGiven._sum.amount || 0) + (totalDepositsGiven._sum.amount || 0),
          currentBalances: {
            deposits: totalCreditsGiven._sum.depositWalletBalance || 0,
            credits: totalCreditsGiven._sum.creditBalance || 0,
            bonuses: totalCreditsGiven._sum.bonusBalance || 0
          },
          guestsWithBonus,
          globalSettings: {
            guestSignupBonus: settings?.guestSignupBonus || 0,
            guestReferralBonus: settings?.guestReferralBonus || 0,
            maxBonusPercentage: settings?.maxBonusPercentage || 0.25,
            bonusExpirationDays: settings?.bonusExpirationDays || 90
          }
        },
        recentTransactions
      })
    }

    if (action === 'guests') {
      // Search for guests
      const search = searchParams.get('search') || ''
      const filter = searchParams.get('filter') || 'all'
      const page = parseInt(searchParams.get('page') || '1')
      const limit = parseInt(searchParams.get('limit') || '20')

      const where: any = {}

      if (search) {
        where.OR = [
          { name: { contains: search, mode: 'insensitive' } },
          { email: { contains: search, mode: 'insensitive' } }
        ]
      }

      if (filter === 'verified') {
        where.stripeIdentityStatus = 'verified'
      } else if (filter === 'with_bonus') {
        where.OR = [
          { bonusBalance: { gt: 0 } },
          { creditBalance: { gt: 0 } },
          { depositWalletBalance: { gt: 0 } }
        ]
      } else if (filter === 'top_rated') {
        where.averageRating = { gte: 4.5 }
        where.totalTrips = { gte: 3 }
      }

      const [guests, total] = await Promise.all([
        prisma.reviewerProfile.findMany({
          where,
          select: {
            id: true,
            name: true,
            email: true,
            profilePhotoUrl: true,
            averageRating: true,
            totalTrips: true,
            memberTier: true,
            stripeIdentityStatus: true,
            depositWalletBalance: true,
            creditBalance: true,
            bonusBalance: true,
            memberSince: true
          },
          orderBy: { memberSince: 'desc' },
          skip: (page - 1) * limit,
          take: limit
        }),
        prisma.reviewerProfile.count({ where })
      ])

      return NextResponse.json({
        success: true,
        guests,
        pagination: {
          page,
          limit,
          total,
          pages: Math.ceil(total / limit)
        }
      })
    }

    // Default: return settings
    return NextResponse.json({
      success: true,
      settings: {
        guestSignupBonus: settings?.guestSignupBonus || 0,
        guestReferralBonus: settings?.guestReferralBonus || 0,
        maxBonusPercentage: settings?.maxBonusPercentage || 0.25,
        bonusExpirationDays: settings?.bonusExpirationDays || 90
      }
    })

  } catch (error) {
    console.error('[Fleet Bonuses] GET error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch bonus data' },
      { status: 500 }
    )
  }
}

// POST - Add bonus to user(s)
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      userIds,          // Array of profile IDs or 'all' or 'verified' or 'top_rated'
      bonusType,        // 'deposit' | 'credit' | 'bonus'
      amount,           // Dollar amount
      description,      // Custom description
      expirationDays    // Optional: override default expiration
    } = body

    if (!bonusType || !amount || amount <= 0) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields: bonusType, amount' },
        { status: 400 }
      )
    }

    // Get target users with their current balances
    let targetProfiles: { id: string; name: string | null; depositWalletBalance: number; creditBalance: number; bonusBalance: number }[] = []

    if (Array.isArray(userIds) && userIds.length > 0) {
      // Specific users
      targetProfiles = await prisma.reviewerProfile.findMany({
        where: { id: { in: userIds } },
        select: { id: true, name: true, depositWalletBalance: true, creditBalance: true, bonusBalance: true }
      })
    } else if (userIds === 'all') {
      // All users
      targetProfiles = await prisma.reviewerProfile.findMany({
        select: { id: true, name: true, depositWalletBalance: true, creditBalance: true, bonusBalance: true }
      })
    } else if (userIds === 'verified') {
      // Only verified users
      targetProfiles = await prisma.reviewerProfile.findMany({
        where: { stripeIdentityStatus: 'verified' },
        select: { id: true, name: true, depositWalletBalance: true, creditBalance: true, bonusBalance: true }
      })
    } else if (userIds === 'top_rated') {
      // Top rated users (4.5+ with 3+ trips)
      targetProfiles = await prisma.reviewerProfile.findMany({
        where: {
          averageRating: { gte: 4.5 },
          totalTrips: { gte: 3 }
        },
        select: { id: true, name: true, depositWalletBalance: true, creditBalance: true, bonusBalance: true }
      })
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid userIds parameter' },
        { status: 400 }
      )
    }

    if (targetProfiles.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No users found matching criteria' },
        { status: 400 }
      )
    }

    // Apply bonus to each user
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const results = await prisma.$transaction(async (tx: any) => {
      const applied: string[] = []
      const failed: string[] = []

      for (const profile of targetProfiles) {
        try {
          if (bonusType === 'deposit') {
            // Calculate new balance
            const newBalance = profile.depositWalletBalance + amount

            // Add to deposit wallet
            await tx.reviewerProfile.update({
              where: { id: profile.id },
              data: { depositWalletBalance: { increment: amount } }
            })

            await tx.depositTransaction.create({
              data: {
                guestId: profile.id,
                amount,
                type: 'LOAD',
                balanceAfter: newBalance,
                description: description || 'Fleet bonus - deposit'
              }
            })
          } else if (bonusType === 'credit') {
            // Calculate new balance
            const newBalance = profile.creditBalance + amount

            // Add to credit balance
            await tx.reviewerProfile.update({
              where: { id: profile.id },
              data: { creditBalance: { increment: amount } }
            })

            await tx.creditBonusTransaction.create({
              data: {
                guestId: profile.id,
                amount,
                type: 'CREDIT',
                action: 'ADD',
                balanceAfter: newBalance,
                reason: description || 'Fleet bonus - credit'
              }
            })
          } else if (bonusType === 'bonus') {
            // Calculate new balance
            const newBalance = profile.bonusBalance + amount

            // Add to bonus balance
            await tx.reviewerProfile.update({
              where: { id: profile.id },
              data: { bonusBalance: { increment: amount } }
            })

            await tx.creditBonusTransaction.create({
              data: {
                guestId: profile.id,
                amount,
                type: 'BONUS',
                action: 'ADD',
                balanceAfter: newBalance,
                reason: description || 'Fleet promotional bonus',
                expiresAt: expirationDays
                  ? new Date(Date.now() + expirationDays * 24 * 60 * 60 * 1000)
                  : new Date(Date.now() + 90 * 24 * 60 * 60 * 1000)
              }
            })
          }

          applied.push(profile.id)
        } catch (err) {
          console.error(`Failed to apply bonus to ${profile.id}:`, err)
          failed.push(profile.id)
        }
      }

      return { applied, failed }
    })

    return NextResponse.json({
      success: true,
      message: `Bonus applied to ${results.applied.length} users`,
      applied: results.applied.length,
      failed: results.failed.length,
      totalAmount: amount * results.applied.length
    })

  } catch (error) {
    console.error('[Fleet Bonuses] POST error:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to apply bonus' },
      { status: 500 }
    )
  }
}
