// app/api/fleet/insurance/rates/history/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

/**
 * GET /api/fleet/insurance/rates/history
 * Get rate change history with filters
 * 
 * Query params:
 * - providerId: string (optional)
 * - tier: string (optional)
 * - vehicleClass: string (optional)
 * - startDate: string (optional)
 * - endDate: string (optional)
 * - limit: number (default 50)
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url)
    const providerId = searchParams.get('providerId')
    const tier = searchParams.get('tier')
    const vehicleClass = searchParams.get('vehicleClass')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')

    // Build where clause
    const where: any = {}

    if (providerId) {
      where.providerId = providerId
    }

    if (tier) {
      where.tier = tier
    }

    if (vehicleClass) {
      where.vehicleClass = vehicleClass
    }

    if (startDate || endDate) {
      where.effectiveDate = {}
      if (startDate) {
        where.effectiveDate.gte = new Date(startDate)
      }
      if (endDate) {
        where.effectiveDate.lte = new Date(endDate)
      }
    }

    // Get rate history with provider details
    const history: any[] = await prisma.insuranceRateHistory.findMany({
      where,
      include: {
        InsuranceProvider: {
          select: {
            id: true,
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit
    })

    // Calculate statistics
    const stats = {
      totalChanges: history.length,
      increases: history.filter(h => h.newRate > h.oldRate).length,
      decreases: history.filter(h => h.newRate < h.oldRate).length,
      noChange: history.filter(h => h.newRate === h.oldRate).length,
      averageIncrease: 0,
      averageDecrease: 0,
      largestIncrease: 0,
      largestDecrease: 0
    }

    const increases = history.filter(h => h.newRate > h.oldRate)
    const decreases = history.filter(h => h.newRate < h.oldRate)

    if (increases.length > 0) {
      stats.averageIncrease = increases.reduce((sum, h) => sum + (h.newRate - h.oldRate), 0) / increases.length
      stats.largestIncrease = Math.max(...increases.map(h => h.newRate - h.oldRate))
    }

    if (decreases.length > 0) {
      stats.averageDecrease = Math.abs(decreases.reduce((sum, h) => sum + (h.newRate - h.oldRate), 0) / decreases.length)
      stats.largestDecrease = Math.abs(Math.min(...decreases.map(h => h.newRate - h.oldRate)))
    }

    // Group by provider for summary
    const byProvider: { [key: string]: any } = {}
    
    history.forEach(h => {
      const providerId = h.InsuranceProviderId
      if (!byProvider[providerId]) {
        byProvider[providerId] = {
          provider: h.InsuranceProvider,
          changes: 0,
          increases: 0,
          decreases: 0,
          lastChange: h.createdAt
        }
      }
      byProvider[providerId].changes++
      if (h.newRate > h.oldRate) byProvider[providerId].increases++
      if (h.newRate < h.oldRate) byProvider[providerId].decreases++
    })

    const providerSummary = Object.values(byProvider)

    // Format history for response
    const formattedHistory = history.map(h => ({
      id: h.id,
      provider: h.InsuranceProvider,
      tier: h.tier,
      vehicleClass: h.vehicleClass,
      oldRate: h.oldRate,
      newRate: h.newRate,
      change: h.newRate - h.oldRate,
      changePercent: h.oldRate > 0 
        ? parseFloat(((h.newRate - h.oldRate) / h.oldRate * 100).toFixed(2))
        : null,
      changeType: h.newRate > h.oldRate ? 'INCREASE' : h.newRate < h.oldRate ? 'DECREASE' : 'NO_CHANGE',
      effectiveDate: h.effectiveDate,
      changedBy: h.changedBy,
      reason: h.reason,
      createdAt: h.createdAt
    }))

    return NextResponse.json({
      history: formattedHistory,
      stats,
      providerSummary,
      filters: {
        providerId,
        tier,
        vehicleClass,
        startDate,
        endDate,
        limit
      }
    })

  } catch (error) {
    console.error('Rate history fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch rate history' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/fleet/insurance/rates/history/export
 * Export rate history as CSV
 */
export async function POST(req: NextRequest) {
  try {
    const body = await req.json()
    const { providerId, startDate, endDate } = body

    const where: any = {}
    if (providerId) where.providerId = providerId
    if (startDate || endDate) {
      where.effectiveDate = {}
      if (startDate) where.effectiveDate.gte = new Date(startDate)
      if (endDate) where.effectiveDate.lte = new Date(endDate)
    }

    const history: any[] = await prisma.insuranceRateHistory.findMany({
      where,
      include: {
        InsuranceProvider: {
          select: {
            name: true,
            type: true
          }
        }
      },
      orderBy: {
        effectiveDate: 'desc'
      }
    })

    // Generate CSV
    const csvRows = [
      ['Date', 'Provider', 'Type', 'Vehicle Class', 'Tier', 'Old Rate', 'New Rate', 'Change', 'Change %', 'Changed By', 'Reason']
    ]

    history.forEach(h => {
      const change = h.newRate - h.oldRate
      const changePercent = h.oldRate > 0 ? ((change / h.oldRate) * 100).toFixed(2) : 'N/A'
      
      csvRows.push([
        h.effectiveDate.toISOString().split('T')[0],
        h.InsuranceProvider.name,
        h.InsuranceProvider.type,
        h.vehicleClass,
        h.tier,
        h.oldRate.toString(),
        h.newRate.toString(),
        change.toString(),
        changePercent,
        h.changedBy,
        h.reason || ''
      ])
    })

    const csv = csvRows.map(row => row.join(',')).join('\n')

    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="rate-history-${Date.now()}.csv"`
      }
    })

  } catch (error) {
    console.error('Rate history export error:', error)
    return NextResponse.json(
      { error: 'Failed to export rate history' },
      { status: 500 }
    )
  }
}