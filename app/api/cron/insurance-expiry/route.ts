// app/api/cron/insurance-expiry/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { calculateHostTier } from '@/app/lib/insurance/tier-calculator'
import { checkExpirationWarning } from '@/app/lib/insurance/validation'

// Type definitions
interface InsuranceNotification {
  type: string
  insurance: string
  daysLeft?: number
}

interface ExpiredInsurance {
  hostId: string
  hostName: string
  type: string
  expiredDate: Date | null
}

interface ExpiringInsurance {
  hostId: string
  hostName: string
  type: string
  daysUntil: number
  expiresOn: Date | null
}

interface TierChange {
  hostId: string
  hostName: string
  previousTier: string
  newTier: string
  reason: string
}

/**
 * GET /api/cron/insurance-expiry
 * Daily cron job to handle insurance expirations and warnings
 */
export async function GET(request: NextRequest) {
  try {
    // Verify cron secret or admin access
    const cronSecret = request.headers.get('x-cron-secret')
    const fleetKey = request.headers.get('x-fleet-key')
    
    if (cronSecret !== process.env.CRON_SECRET && fleetKey !== 'phoenix-fleet-2847') {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const now = new Date()
    const results = {
      expired: [] as ExpiredInsurance[],
      expiringSoon: [] as ExpiringInsurance[],
      notifications: {
        thirtyDay: [] as string[],
        sevenDay: [] as string[],
        oneDay: [] as string[],
        expired: [] as string[]
      },
      tierChanges: [] as TierChange[]
    }
    
    // Find all hosts with insurance
    const hostsWithInsurance = await prisma.rentalHost.findMany({
      where: {
        OR: [
          { p2pInsuranceStatus: { in: ['ACTIVE', 'PENDING'] } },
          { commercialInsuranceStatus: { in: ['ACTIVE', 'PENDING'] } },
          { hostInsuranceStatus: { in: ['ACTIVE', 'PENDING'] } } // Legacy
        ]
      },
      select: {
        id: true,
        name: true,
        email: true,
        earningsTier: true,
        commissionRate: true,
        p2pInsuranceStatus: true,
        p2pInsuranceExpires: true,
        p2pInsuranceProvider: true,
        commercialInsuranceStatus: true,
        commercialInsuranceExpires: true,
        commercialInsuranceProvider: true,
        hostInsuranceStatus: true,
        hostInsuranceExpires: true,
        hostInsuranceProvider: true,
        usingLegacyInsurance: true
      }
    })
    
    for (const host of hostsWithInsurance) {
      const updates: Record<string, any> = {}
      const notifications: InsuranceNotification[] = []
      let tierChanged = false
      const currentTier = calculateHostTier(host)
      
      // Check P2P insurance expiration (including legacy)
      const p2pExpires = host.usingLegacyInsurance 
        ? host.hostInsuranceExpires 
        : host.p2pInsuranceExpires
      
      const p2pStatus = host.usingLegacyInsurance
        ? host.hostInsuranceStatus
        : host.p2pInsuranceStatus
        
      if (p2pExpires && p2pStatus === 'ACTIVE') {
        const p2pCheck = checkExpirationWarning(p2pExpires)
        
        if (p2pCheck.daysUntilExpiration !== null && p2pCheck.daysUntilExpiration <= 0) {
          // Expired
          if (host.usingLegacyInsurance) {
            updates.hostInsuranceStatus = 'EXPIRED'
          } else {
            updates.p2pInsuranceStatus = 'EXPIRED'
          }
          
          results.expired.push({
            hostId: host.id,
            hostName: host.name,
            type: 'P2P',
            expiredDate: p2pExpires
          })
          
          notifications.push({
            type: 'EXPIRED',
            insurance: 'P2P'
          })
          
          tierChanged = true
          
        } else if (p2pCheck.isExpiring && p2pCheck.daysUntilExpiration !== null) {
          // Send warning notifications
          const warningKey = `p2p_${p2pCheck.daysUntilExpiration}day`
          
          // Check if we already sent this warning
          const existingWarning = await prisma.hostNotification.findFirst({
            where: {
              hostId: host.id,
              type: 'INSURANCE_EXPIRING',
              metadata: {
                path: ['warningKey'],
                equals: warningKey
              },
              createdAt: {
                gte: new Date(now.getTime() - 24 * 60 * 60 * 1000) // Last 24 hours
              }
            }
          })
          
          if (!existingWarning) {
            if (p2pCheck.daysUntilExpiration === 30) {
              results.notifications.thirtyDay.push(host.id)
              notifications.push({
                type: '30_DAY_WARNING',
                insurance: 'P2P',
                daysLeft: 30
              })
            } else if (p2pCheck.daysUntilExpiration === 7) {
              results.notifications.sevenDay.push(host.id)
              notifications.push({
                type: '7_DAY_WARNING',
                insurance: 'P2P',
                daysLeft: 7
              })
            } else if (p2pCheck.daysUntilExpiration === 1) {
              results.notifications.oneDay.push(host.id)
              notifications.push({
                type: '1_DAY_WARNING',
                insurance: 'P2P',
                daysLeft: 1
              })
            }
          }
          
          if (p2pCheck.daysUntilExpiration > 0) {
            results.expiringSoon.push({
              hostId: host.id,
              hostName: host.name,
              type: 'P2P',
              daysUntil: p2pCheck.daysUntilExpiration,
              expiresOn: p2pExpires
            })
          }
        }
      }
      
      // Check Commercial insurance expiration
      if (host.commercialInsuranceExpires && host.commercialInsuranceStatus === 'ACTIVE') {
        const commercialCheck = checkExpirationWarning(host.commercialInsuranceExpires)
        
        if (commercialCheck.daysUntilExpiration !== null && commercialCheck.daysUntilExpiration <= 0) {
          // Expired
          updates.commercialInsuranceStatus = 'EXPIRED'
          
          results.expired.push({
            hostId: host.id,
            hostName: host.name,
            type: 'COMMERCIAL',
            expiredDate: host.commercialInsuranceExpires
          })
          
          notifications.push({
            type: 'EXPIRED',
            insurance: 'COMMERCIAL'
          })
          
          tierChanged = true
          
        } else if (commercialCheck.isExpiring && commercialCheck.daysUntilExpiration !== null) {
          // Send warning notifications
          const warningKey = `commercial_${commercialCheck.daysUntilExpiration}day`
          
          const existingWarning = await prisma.hostNotification.findFirst({
            where: {
              hostId: host.id,
              type: 'INSURANCE_EXPIRING',
              metadata: {
                path: ['warningKey'],
                equals: warningKey
              },
              createdAt: {
                gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
              }
            }
          })
          
          if (!existingWarning) {
            if (commercialCheck.daysUntilExpiration === 30) {
              results.notifications.thirtyDay.push(host.id)
              notifications.push({
                type: '30_DAY_WARNING',
                insurance: 'COMMERCIAL',
                daysLeft: 30
              })
            } else if (commercialCheck.daysUntilExpiration === 7) {
              results.notifications.sevenDay.push(host.id)
              notifications.push({
                type: '7_DAY_WARNING',
                insurance: 'COMMERCIAL',
                daysLeft: 7
              })
            } else if (commercialCheck.daysUntilExpiration === 1) {
              results.notifications.oneDay.push(host.id)
              notifications.push({
                type: '1_DAY_WARNING',
                insurance: 'COMMERCIAL',
                daysLeft: 1
              })
            }
          }
          
          if (commercialCheck.daysUntilExpiration > 0) {
            results.expiringSoon.push({
              hostId: host.id,
              hostName: host.name,
              type: 'COMMERCIAL',
              daysUntil: commercialCheck.daysUntilExpiration,
              expiresOn: host.commercialInsuranceExpires
            })
          }
        }
      }
      
      // If insurance expired, recalculate tier
      if (tierChanged) {
        const simulatedHost = { ...host, ...updates }
        const newTier = calculateHostTier(simulatedHost)
        
        if (newTier.tier !== currentTier.tier) {
          updates.earningsTier = newTier.tier
          updates.commissionRate = newTier.platformCommission
          updates.lastTierChange = now
          updates.tierChangeReason = 'Insurance expired'
          updates.tierChangeBy = 'SYSTEM'
          
          results.tierChanges.push({
            hostId: host.id,
            hostName: host.name,
            previousTier: currentTier.tier,
            newTier: newTier.tier,
            reason: 'Insurance expired'
          })
        }
      }
      
      // Apply updates and create notifications
      if (Object.keys(updates).length > 0 || notifications.length > 0) {
        await prisma.$transaction(async (tx) => {
          // Update host if needed
          if (Object.keys(updates).length > 0) {
            await tx.rentalHost.update({
              where: { id: host.id },
              data: updates
            })
          }
          
          // Create notifications
          for (const notification of notifications) {
            if (notification.type === 'EXPIRED') {
              await tx.hostNotification.create({
                data: {
                  hostId: host.id,
                  type: 'INSURANCE_EXPIRED',
                  category: 'insurance',
                  subject: `${notification.insurance} Insurance Expired`,
                  message: `Your ${notification.insurance} insurance has expired. Your earnings tier may have changed. Please renew to maintain higher earnings.`,
                  status: 'SENT' as any,
                  priority: 'urgent',
                  metadata: {
                    insuranceType: notification.insurance,
                    expiredDate: now.toISOString()
                  }
                } as any
              })
              
              results.notifications.expired.push(host.id)
              
            } else if (notification.type.includes('WARNING')) {
              const daysLeft = notification.daysLeft || 0
              const urgency = daysLeft <= 7 ? 'urgent' : 'high'
              
              await tx.hostNotification.create({
                data: {
                  hostId: host.id,
                  type: 'INSURANCE_EXPIRING',
                  category: 'insurance',
                  subject: `${notification.insurance} Insurance Expiring in ${daysLeft} days`,
                  message: `Your ${notification.insurance} insurance will expire in ${daysLeft} days. Renew now to maintain your earnings tier.`,
                  status: 'SENT' as any,
                  priority: urgency,
                  metadata: {
                    insuranceType: notification.insurance,
                    daysUntilExpiration: daysLeft,
                    warningKey: `${notification.insurance.toLowerCase()}_${daysLeft}day`
                  }
                } as any
              })
            }
          }
          
          // Log activity
          if (tierChanged) {
            await tx.activityLog.create({
              data: {
                entityType: 'HOST',
                entityId: host.id,
                action: 'INSURANCE_EXPIRED',
                metadata: {
                  expiredInsurance: notifications
                    .filter(n => n.type === 'EXPIRED')
                    .map(n => n.insurance),
                  tierChange: results.tierChanges.find(tc => tc.hostId === host.id) || null
                },
                ipAddress: 'CRON_JOB'
              } as any
            })
          }
        })
      }
    }
    
    // Create admin summary notification if there were expirations
    if (results.expired.length > 0 || results.tierChanges.length > 0) {
      await prisma.adminNotification.create({
        data: {
          type: 'INSURANCE_EXPIRY_SUMMARY',
          title: 'Daily Insurance Expiry Report',
          message: `${results.expired.length} insurances expired today. ${results.tierChanges.length} hosts had tier changes.`,
          priority: 'medium',
          status: 'UNREAD',
          metadata: {
            expired: results.expired,
            tierChanges: results.tierChanges,
            warnings: {
              thirtyDay: results.notifications.thirtyDay.length,
              sevenDay: results.notifications.sevenDay.length,
              oneDay: results.notifications.oneDay.length
            },
            runDate: now.toISOString()
          }
        } as any
      })
    }
    
    return NextResponse.json({
      success: true,
      timestamp: now.toISOString(),
      processed: hostsWithInsurance.length,
      results: {
        expired: results.expired.length,
        expiringSoon: results.expiringSoon.length,
        tierChanges: results.tierChanges.length,
        notifications: {
          thirtyDay: results.notifications.thirtyDay.length,
          sevenDay: results.notifications.sevenDay.length,
          oneDay: results.notifications.oneDay.length,
          expired: results.notifications.expired.length
        }
      },
      details: results
    })
    
  } catch (error: any) {
    console.error('Insurance expiry cron error:', error)
    
    // Log error to admin notifications
    await prisma.adminNotification.create({
      data: {
        type: 'CRON_ERROR',
        title: 'Insurance Expiry Cron Failed',
        message: `The insurance expiry cron job failed: ${error?.message || 'Unknown error'}`,
        priority: 'urgent',
        status: 'UNREAD',
        metadata: {
          error: error?.message || 'Unknown error',
          timestamp: new Date().toISOString()
        }
      } as any
    }).catch(console.error)
    
    return NextResponse.json(
      { error: 'Cron job failed', message: error?.message || 'Unknown error' },
      { status: 500 }
    )
  }
}