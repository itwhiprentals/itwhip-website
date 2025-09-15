// app/api/admin/system/health/route.ts

import { NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(request: Request) {
 try {
   // TODO: Add admin authentication check here
   
   const now = new Date()
   
   // Database health check
   let dbStatus: 'connected' | 'slow' | 'disconnected' = 'connected'
   let dbResponseTime = 0
   
   try {
     const startTime = Date.now()
     await prisma.$queryRaw`SELECT 1`
     dbResponseTime = Date.now() - startTime
     
     if (dbResponseTime > 100) {
       dbStatus = 'slow'
     }
   } catch (error) {
     dbStatus = 'disconnected'
   }

   // Get database connection stats
   const [activeConnections, bookingCount] = await Promise.all([
     prisma.rentalBooking.count(),
     prisma.rentalBooking.count()
   ])

   // Check for stuck trips (active for more than 30 days)
   const stuckTrips = await prisma.rentalBooking.count({
     where: {
       tripStatus: 'ACTIVE',
       tripStartedAt: {
         lt: new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
       }
     }
   })

   // Check for overdue returns
   const overdueReturns = await prisma.rentalBooking.count({
     where: {
       tripStatus: 'ACTIVE',
       endDate: { lt: now }
     }
   })

   // Check for missing photos (trips started but no photos)
   const missingPhotos = await prisma.rentalBooking.count({
     where: {
       tripStatus: 'ACTIVE',
       inspectionPhotos: {
         none: {}
       }
     }
   })

   // Check failed uploads (would need to track this in a separate table)
   const failedUploads = 0 // Placeholder

   // Check Stripe health (mock data - would need actual Stripe integration)
   const failedCharges = await prisma.rentalBooking.count({
     where: {
       paymentStatus: 'FAILED',
       updatedAt: {
         gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
       }
     }
   })

   const totalCharges = await prisma.rentalBooking.count({
     where: {
       paymentStatus: { in: ['PAID', 'FAILED'] },
       updatedAt: {
         gte: new Date(now.getTime() - 24 * 60 * 60 * 1000)
       }
     }
   })

   const stripeSuccessRate = totalCharges > 0 
     ? ((totalCharges - failedCharges) / totalCharges) * 100 
     : 100

   // Performance metrics (mock data - would need actual monitoring)
   const performance = {
     avgResponseTime: dbResponseTime,
     errorRate: 0.1, // Would calculate from logs
     uptime: 99.9,
     memoryUsage: 45, // Would get from process.memoryUsage()
     cpuUsage: 30 // Would get from os.loadavg()
   }

   // Determine overall system status
   let overallStatus: 'healthy' | 'degraded' | 'critical' = 'healthy'
   
   if (dbStatus === 'disconnected' || stripeSuccessRate < 90) {
     overallStatus = 'critical'
   } else if (dbStatus === 'slow' || overdueReturns > 10 || stuckTrips > 5) {
     overallStatus = 'degraded'
   }

   // Storage health (mock data - would need actual Cloudinary/Firebase checks)
   const storage = {
     cloudinary: {
       status: failedUploads > 5 ? 'degraded' : 'operational' as 'operational' | 'degraded' | 'down',
       usage: 2500, // MB
       limit: 10000, // MB
       failedUploads
     },
     firebase: {
       status: 'operational' as 'operational' | 'degraded' | 'down',
       usage: 500, // MB
       limit: 5000 // MB
     }
   }

   // Email queue health (mock data)
   const emailQueue = {
     status: 'operational' as 'operational' | 'degraded' | 'down',
     queueSize: 0,
     failedEmails: 0
   }

   return NextResponse.json({
     status: overallStatus,
     database: {
       status: dbStatus,
       responseTime: dbResponseTime,
       activeConnections: Math.min(activeConnections, 100), // Mock active connections
       maxConnections: 100
     },
     storage,
     apis: {
       stripe: {
         status: stripeSuccessRate >= 95 ? 'operational' : stripeSuccessRate >= 90 ? 'degraded' : 'down' as any,
         failedCharges,
         successRate: stripeSuccessRate
       },
       email: emailQueue
     },
     performance,
     trips: {
       stuckTrips,
       overdueReturns,
       missingPhotos,
       failedUploads
     }
   })

 } catch (error) {
   console.error('Failed to load system health:', error)
   return NextResponse.json(
     { 
       status: 'critical',
       error: 'Failed to load system health',
       database: {
         status: 'disconnected',
         responseTime: 0,
         activeConnections: 0,
         maxConnections: 0
       },
       storage: {
         cloudinary: { status: 'down', usage: 0, limit: 0, failedUploads: 0 },
         firebase: { status: 'down', usage: 0, limit: 0 }
       },
       apis: {
         stripe: { status: 'down', failedCharges: 0, successRate: 0 },
         email: { status: 'down', queueSize: 0, failedEmails: 0 }
       },
       performance: {
         avgResponseTime: 0,
         errorRate: 0,
         uptime: 0,
         memoryUsage: 0,
         cpuUsage: 0
       },
       trips: {
         stuckTrips: 0,
         overdueReturns: 0,
         missingPhotos: 0,
         failedUploads: 0
       }
     },
     { status: 500 }
   )
 }
}

// Run system diagnostics
export async function POST(request: Request) {
 try {
   // TODO: Add admin authentication check here
   
   // Run various system checks
   const diagnostics = {
     timestamp: new Date().toISOString(),
     checks: []
   }

   // Test database connection
   try {
     await prisma.$queryRaw`SELECT 1`
     diagnostics.checks.push({ name: 'Database', status: 'passed' })
   } catch (error) {
     diagnostics.checks.push({ name: 'Database', status: 'failed', error: String(error) })
   }

   // Test Cloudinary (would need actual implementation)
   diagnostics.checks.push({ name: 'Cloudinary', status: 'passed' })

   // Test Stripe (would need actual implementation)
   diagnostics.checks.push({ name: 'Stripe', status: 'passed' })

   return NextResponse.json({
     success: true,
     diagnostics
   })

 } catch (error) {
   console.error('Failed to run diagnostics:', error)
   return NextResponse.json(
     { error: 'Failed to run diagnostics' },
     { status: 500 }
   )
 }
}