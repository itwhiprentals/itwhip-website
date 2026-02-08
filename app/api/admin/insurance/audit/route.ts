// app/api/admin/insurance/audit/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { calculateHostTier } from '@/app/lib/insurance/tier-calculator'

/**
 * GET /api/admin/insurance/audit
 * Get insurance audit logs and analytics
 */
export async function GET(request: NextRequest) {
  try {
    // Verify admin access
    const fleetKey = request.headers.get('x-fleet-key')
    if (fleetKey !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const hostId = searchParams.get('hostId')
    const action = searchParams.get('action')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const limit = parseInt(searchParams.get('limit') || '50')
    
    // Build query filters
    const where: any = {
      entityType: 'HOST',
      action: {
        in: [
          'INSURANCE_SUBMITTED',
          'INSURANCE_APPROVED',
          'INSURANCE_REJECTED',
          'INSURANCE_DELETED',
          'INSURANCE_TOGGLED',
          'INSURANCE_EXPIRED',
          'INSURANCE_UPDATED'
        ]
      }
    }
    
    if (hostId) where.entityId = hostId
    if (action) where.action = action
    
    if (startDate || endDate) {
      where.createdAt = {}
      if (startDate) where.createdAt.gte = new Date(startDate)
      if (endDate) where.createdAt.lte = new Date(endDate)
    }
    
    // Get audit logs
    const logs = await prisma.activityLog.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      take: limit,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true
          }
        }
      }
    })
    
    // Get statistics
    const stats = await prisma.activityLog.groupBy({
      by: ['action'],
      where,
      _count: { action: true }
    })
    
    // Get recent tier changes
    const recentTierChanges = await prisma.rentalHost.findMany({
      where: {
        lastTierChange: {
          gte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // Last 7 days
        }
      },
      select: {
        id: true,
        name: true,
        email: true,
        earningsTier: true,
        lastTierChange: true,
        tierChangeReason: true,
        tierChangeBy: true,
        p2pInsuranceStatus: true,
        commercialInsuranceStatus: true
      },
      orderBy: { lastTierChange: 'desc' },
      take: 10
    })
    
    // Get insurance distribution
    const distribution = await prisma.rentalHost.groupBy({
      by: ['earningsTier'],
      _count: { earningsTier: true }
    })
    
    return NextResponse.json({
      logs: logs.map(log => ({
        id: log.id,
        action: log.action,
        hostId: log.entityId,
        metadata: log.metadata,
        performedBy: log.user?.email || 'System',
        ipAddress: log.ipAddress,
        createdAt: log.createdAt
      })),
      statistics: stats.map(s => ({
        action: s.action,
        count: s._count.action
      })),
      recentTierChanges,
      distribution: distribution.map(d => ({
        tier: d.earningsTier,
        count: d._count.earningsTier
      })),
      summary: {
        totalLogs: logs.length,
        dateRange: {
          from: logs[logs.length - 1]?.createdAt || null,
          to: logs[0]?.createdAt || null
        }
      }
    })
    
  } catch (error) {
    console.error('Error fetching audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch audit logs' },
      { status: 500 }
    )
  }
}

/**
 * POST /api/admin/insurance/audit
 * Admin override to force insurance changes
 */
export async function POST(request: NextRequest) {
  try {
    // Verify admin access
    const fleetKey = request.headers.get('x-fleet-key')
    if (fleetKey !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const { 
      hostId, 
      action, 
      tier, 
      reason, 
      adminEmail 
    } = await request.json()
    
    // Validate required fields
    if (!hostId || !action || !reason || !adminEmail) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }
    
    // Get host
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })
    
    if (!host) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }
    
    const currentTier = calculateHostTier(host)
    
    // Handle different admin actions
    switch (action) {
      case 'FORCE_TIER_CHANGE':
        if (!tier || !['BASIC', 'STANDARD', 'PREMIUM'].includes(tier)) {
          return NextResponse.json(
            { error: 'Invalid tier specified' },
            { status: 400 }
          )
        }
        
        const tierMap: Record<string, { commission: number; earnings: number }> = {
          'BASIC': { commission: 0.60, earnings: 0.40 },
          'STANDARD': { commission: 0.25, earnings: 0.75 },
          'PREMIUM': { commission: 0.10, earnings: 0.90 }
        }

        const result = await prisma.$transaction(async (tx) => {
          // Update host tier
          const updatedHost = await tx.rentalHost.update({
            where: { id: hostId },
            data: {
              earningsTier: tier as any,
              commissionRate: tierMap[tier].commission,
              lastTierChange: new Date(),
              tierChangeReason: `Admin override: ${reason}`,
              tierChangeBy: adminEmail
            }
          })
          
          // Log the admin action
          await tx.activityLog.create({
            data: {
              id: crypto.randomUUID(),
              entityType: 'HOST',
              entityId: hostId,
              action: 'ADMIN_TIER_OVERRIDE',
              metadata: {
                previousTier: currentTier.tier,
                newTier: tier,
                previousEarnings: currentTier.hostEarnings,
                newEarnings: tierMap[tier].earnings,
                reason,
                adminEmail
              },
              ipAddress: request.headers.get('x-forwarded-for') || 'admin'
            }
          })
          
          // Create notifications
          await tx.hostNotification.create({
            data: {
              hostId,
              type: 'TIER_CHANGED',
              category: 'insurance',
              subject: 'Earnings Tier Updated',
              message: `Your earnings tier has been updated to ${tier} (${Math.round(tierMap[tier].earnings * 100)}%) by admin. Reason: ${reason}`,
              status: 'SENT' as any,
              priority: 'high'
            } as any
          })
          
          await tx.adminNotification.create({
            data: {
              type: 'ADMIN_ACTION',
              title: 'Manual Tier Override',
              message: `${adminEmail} changed ${host.name}'s tier from ${currentTier.tier} to ${tier}. Reason: ${reason}`,
              priority: 'low',
              status: 'UNREAD',
              relatedId: hostId,
              relatedType: 'HOST',
              metadata: {
                action: 'FORCE_TIER_CHANGE',
                adminEmail,
                hostName: host.name,
                tierChange: `${currentTier.tier} -> ${tier}`
              }
            } as any
          })
          
          return updatedHost
        })
        
        return NextResponse.json({
          success: true,
          message: 'Tier override successful',
          previousTier: currentTier.tier,
          newTier: tier,
          host: {
            id: result.id,
            name: result.name,
            earningsTier: result.earningsTier,
            commissionRate: result.commissionRate
          }
        })
        
      case 'EXPIRE_INSURANCE':
        const { insuranceType } = await request.json()
        
        if (!insuranceType || !['P2P', 'COMMERCIAL'].includes(insuranceType)) {
          return NextResponse.json(
            { error: 'Invalid insurance type' },
            { status: 400 }
          )
        }
        
        const expireResult = await prisma.$transaction(async (tx) => {
          const updateData: any = {
            lastTierChange: new Date(),
            tierChangeReason: `Admin expired ${insuranceType} insurance: ${reason}`,
            tierChangeBy: adminEmail
          }
          
          if (insuranceType === 'P2P') {
            updateData.p2pInsuranceStatus = 'EXPIRED'
            updateData.hostInsuranceStatus = 'EXPIRED' // Legacy
          } else {
            updateData.commercialInsuranceStatus = 'EXPIRED'
          }
          
          const updatedHost = await tx.rentalHost.update({
            where: { id: hostId },
            data: updateData
          })
          
          // Recalculate tier
          const newTier = calculateHostTier(updatedHost)
          
          // Update tier if changed
          if (newTier.tier !== currentTier.tier) {
            await tx.rentalHost.update({
              where: { id: hostId },
              data: {
                earningsTier: newTier.tier as any,
                commissionRate: newTier.platformCommission
              }
            })
          }
          
          // Log action
          await tx.activityLog.create({
            data: {
              id: crypto.randomUUID(),
              entityType: 'HOST',
              entityId: hostId,
              action: 'ADMIN_INSURANCE_EXPIRED',
              metadata: {
                insuranceType,
                reason,
                adminEmail,
                tierChange: currentTier.tier !== newTier.tier 
                  ? `${currentTier.tier} → ${newTier.tier}`
                  : 'No change'
              },
              ipAddress: request.headers.get('x-forwarded-for') || 'admin'
            }
          })
          
          return { updatedHost, newTier }
        })
        
        return NextResponse.json({
          success: true,
          message: `${insuranceType} insurance marked as expired`,
          newTier: expireResult.newTier
        })
        
      case 'RESTORE_INSURANCE':
        // Restore a previously deleted insurance (within 48 hours)
        const auditLog = await prisma.activityLog.findFirst({
          where: {
            entityId: hostId,
            action: 'INSURANCE_DELETED',
            createdAt: {
              gte: new Date(Date.now() - 48 * 60 * 60 * 1000) // 48 hours
            }
          },
          orderBy: { createdAt: 'desc' }
        })
        
        if (!auditLog || !auditLog.metadata) {
          return NextResponse.json(
            { error: 'No recent deletion found to restore' },
            { status: 404 }
          )
        }
        
        // Restore logic would go here based on metadata
        
        return NextResponse.json({
          success: true,
          message: 'Insurance restoration requires manual database update'
        })
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
    
  } catch (error) {
    console.error('Error in admin override:', error)
    return NextResponse.json(
      { error: 'Failed to process admin override' },
      { status: 500 }
    )
  }
}

/**
 * DELETE /api/admin/insurance/audit
 * Purge old audit logs (cleanup)
 */
export async function DELETE(request: NextRequest) {
  try {
    // Verify admin access
    const fleetKey = request.headers.get('x-fleet-key')
    if (fleetKey !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { error: 'Admin access required' },
        { status: 403 }
      )
    }
    
    const { olderThanDays = 90 } = await request.json()
    
    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - olderThanDays)
    
    const result = await prisma.activityLog.deleteMany({
      where: {
        entityType: 'HOST',
        action: {
          in: [
            'INSURANCE_SUBMITTED',
            'INSURANCE_APPROVED',
            'INSURANCE_REJECTED',
            'INSURANCE_DELETED',
            'INSURANCE_TOGGLED'
          ]
        },
        createdAt: {
          lt: cutoffDate
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `Deleted ${result.count} audit logs older than ${olderThanDays} days`
    })
    
  } catch (error) {
    console.error('Error purging audit logs:', error)
    return NextResponse.json(
      { error: 'Failed to purge audit logs' },
      { status: 500 }
    )
  }
}