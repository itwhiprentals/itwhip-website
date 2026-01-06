// app/api/admin/system/alerts/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Store alerts in memory (in production, use database)
let systemAlerts: SystemAlert[] = []

interface SystemAlert {
 id: string
 type: 'critical' | 'warning' | 'info'
 category: 'system' | 'database' | 'storage' | 'payment' | 'trip' | 'security'
 title: string
 message: string
 details?: any
 createdAt: string
 acknowledgedAt?: string
 acknowledgedBy?: string
 resolved: boolean
 resolvedAt?: string
 actionRequired: boolean
 actionUrl?: string
}

export async function GET(request: Request) {
 try {
   // TODO: Add admin authentication check here
   
   const { searchParams } = new URL(request.url)
   const filter = searchParams.get('filter') || 'all'
   
   // Generate alerts based on current system state
   const now = new Date()
   const generatedAlerts: SystemAlert[] = []
   
   // Check for database issues
   try {
     const startTime = Date.now()
     await prisma.$queryRaw`SELECT 1`
     const responseTime = Date.now() - startTime
     
     if (responseTime > 500) {
       generatedAlerts.push({
         id: `db-slow-${Date.now()}`,
         type: 'warning',
         category: 'database',
         title: 'Database Response Slow',
         message: `Database queries taking ${responseTime}ms on average`,
         createdAt: now.toISOString(),
         resolved: false,
         actionRequired: false
       })
     }
   } catch (error) {
     generatedAlerts.push({
       id: `db-error-${Date.now()}`,
       type: 'critical',
       category: 'database',
       title: 'Database Connection Failed',
       message: 'Unable to connect to the database',
       details: error,
       createdAt: now.toISOString(),
       resolved: false,
       actionRequired: true,
       actionUrl: '/admin/system/health'
     })
   }
   
   // Check for stuck trips
   const stuckTrips = await prisma.rentalBooking.count({
     where: {
       tripStatus: 'ACTIVE',
       tripStartedAt: {
         lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000) // 30 days ago
       }
     }
   })
   
   if (stuckTrips > 0) {
     generatedAlerts.push({
       id: `stuck-trips-${Date.now()}`,
       type: 'warning',
       category: 'trip',
       title: 'Stuck Trips Detected',
       message: `${stuckTrips} trips have been active for over 30 days`,
       createdAt: now.toISOString(),
       resolved: false,
       actionRequired: true,
       actionUrl: '/admin/rentals/trips/active'
     })
   }
   
   // Check for overdue returns
   const overdueReturns = await prisma.rentalBooking.count({
     where: {
       tripStatus: 'ACTIVE',
       endDate: { lt: now }
     }
   })
   
   if (overdueReturns > 5) {
     generatedAlerts.push({
       id: `overdue-${Date.now()}`,
       type: 'warning',
       category: 'trip',
       title: 'Multiple Overdue Returns',
       message: `${overdueReturns} vehicles are overdue for return`,
       createdAt: now.toISOString(),
       resolved: false,
       actionRequired: true,
       actionUrl: '/admin/rentals/trips/active'
     })
   }
   
   // Check for failed payments
   const failedPayments = await prisma.rentalBooking.count({
     where: {
       paymentStatus: 'FAILED',
       updatedAt: {
         gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
       }
     }
   })
   
   if (failedPayments > 3) {
     generatedAlerts.push({
       id: `payment-failures-${Date.now()}`,
       type: 'critical',
       category: 'payment',
       title: 'High Payment Failure Rate',
       message: `${failedPayments} payment failures in the last 24 hours`,
       createdAt: now.toISOString(),
       resolved: false,
       actionRequired: true,
       actionUrl: '/admin/rentals/trips/charges'
     })
   }
   
   // Check for unresolved disputes
   const openDisputes = await prisma.rentalDispute.count({
     where: {
       status: 'OPEN',
       createdAt: {
         lt: new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000) // Older than 7 days
       }
     }
   })
   
   if (openDisputes > 0) {
     generatedAlerts.push({
       id: `old-disputes-${Date.now()}`,
       type: 'warning',
       category: 'trip',
       title: 'Old Unresolved Disputes',
       message: `${openDisputes} disputes have been open for over 7 days`,
       createdAt: now.toISOString(),
       resolved: false,
       actionRequired: true,
       actionUrl: '/admin/disputes'
     })
   }
   
   // Check storage usage (mock data)
   const storageUsage = 85 // percentage
   if (storageUsage > 80) {
     generatedAlerts.push({
       id: `storage-high-${Date.now()}`,
       type: 'warning',
       category: 'storage',
       title: 'High Storage Usage',
       message: `Storage is at ${storageUsage}% capacity`,
       createdAt: now.toISOString(),
       resolved: false,
       actionRequired: true,
       actionUrl: '/admin/system/health'
     })
   }
   
   // Merge with existing alerts
   systemAlerts = [...systemAlerts, ...generatedAlerts.filter(
     newAlert => !systemAlerts.find(existing => existing.title === newAlert.title && !existing.resolved)
   )]
   
   // Filter based on request
   let filteredAlerts = systemAlerts
   
   if (filter === 'unresolved') {
     filteredAlerts = systemAlerts.filter(a => !a.resolved)
   } else if (filter === 'critical') {
     filteredAlerts = systemAlerts.filter(a => a.type === 'critical')
   }
   
   // Sort by creation date (newest first)
   filteredAlerts.sort((a, b) => 
     new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
   )
   
   return NextResponse.json({
     alerts: filteredAlerts
   })
   
 } catch (error) {
   console.error('Failed to load alerts:', error)
   return NextResponse.json(
     { error: 'Failed to load system alerts' },
     { status: 500 }
   )
 }
}

// Acknowledge an alert
export async function POST(request: Request) {
 try {
   // TODO: Add admin authentication check here
   
   const { alertId, acknowledgedBy } = await request.json()
   
   const alertIndex = systemAlerts.findIndex(a => a.id === alertId)
   
   if (alertIndex === -1) {
     return NextResponse.json(
       { error: 'Alert not found' },
       { status: 404 }
     )
   }
   
   systemAlerts[alertIndex] = {
     ...systemAlerts[alertIndex],
     acknowledgedAt: new Date().toISOString(),
     acknowledgedBy: acknowledgedBy || 'admin'
   }
   
   return NextResponse.json({
     success: true,
     alert: systemAlerts[alertIndex]
   })
   
 } catch (error) {
   console.error('Failed to acknowledge alert:', error)
   return NextResponse.json(
     { error: 'Failed to acknowledge alert' },
     { status: 500 }
   )
 }
}

// Resolve an alert
export async function PUT(request: Request) {
 try {
   // TODO: Add admin authentication check here
   
   const { alertId, resolvedBy } = await request.json()
   
   const alertIndex = systemAlerts.findIndex(a => a.id === alertId)
   
   if (alertIndex === -1) {
     return NextResponse.json(
       { error: 'Alert not found' },
       { status: 404 }
     )
   }
   
   systemAlerts[alertIndex] = {
     ...systemAlerts[alertIndex],
     resolved: true,
     resolvedAt: new Date().toISOString()
   }
   
   return NextResponse.json({
     success: true,
     alert: systemAlerts[alertIndex]
   })
   
 } catch (error) {
   console.error('Failed to resolve alert:', error)
   return NextResponse.json(
     { error: 'Failed to resolve alert' },
     { status: 500 }
   )
 }
}

// Clear resolved alerts
export async function DELETE(request: Request) {
 try {
   // TODO: Add admin authentication check here
   
   const beforeCount = systemAlerts.length
   systemAlerts = systemAlerts.filter(a => !a.resolved)
   const removedCount = beforeCount - systemAlerts.length
   
   return NextResponse.json({
     success: true,
     removedCount
   })
   
 } catch (error) {
   console.error('Failed to clear alerts:', error)
   return NextResponse.json(
     { error: 'Failed to clear resolved alerts' },
     { status: 500 }
   )
 }
}

// Get alert configuration
export async function PATCH(request: Request) {
 try {
   // TODO: Add admin authentication check here
   
   // This would typically be stored in database
   const config = {
     emailNotifications: false,
     emailRecipients: ['admin@itwhip.com', 'tech@itwhip.com'],
     slackEnabled: false,
     slackWebhook: '',
     thresholds: {
       cpuUsage: 80,
       memoryUsage: 85,
       errorRate: 1,
       responseTime: 500,
       diskSpace: 90
     }
   }
   
   return NextResponse.json({
     config
   })
   
 } catch (error) {
   console.error('Failed to get alert config:', error)
   return NextResponse.json(
     { error: 'Failed to get alert configuration' },
     { status: 500 }
   )
 }
}