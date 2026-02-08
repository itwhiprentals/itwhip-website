// app/api/admin/system/monitor/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { createAlert } from '@/app/lib/monitoring/alerts'
import { healthCheck } from '@/app/middleware/monitoring'

export async function POST(request: NextRequest) {
  try {
    // Allow access with CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'itwhip-cron-secret-2024'
    if (authHeader === `Bearer ${cronSecret}`) {
      // Authorized via CRON_SECRET, continue
    } else {
      // Will be blocked by middleware if not admin authenticated
      const adminToken = request.cookies.get('adminAccessToken')?.value
      if (!adminToken) {
        return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
      }
    }

    const checks = []
    const issues = []
    
    // 1. Check system health using your existing health check
    const health = await healthCheck()
    checks.push({ 
      type: 'health', 
      status: health.status,
      issues: health.issues 
    })
    
    // 2. Check for security patterns
    const patternsResponse = await fetch(`${process.env.NEXT_PUBLIC_URL}/api/admin/system/alerts/patterns`, {
      headers: { 'Authorization': `Bearer ${cronSecret}` }
    })
    const patterns = await patternsResponse.json()
    checks.push({ 
      type: 'patterns', 
      detected: patterns.patterns?.length || 0 
    })
    
    // 3. Check database health
    try {
      const startTime = Date.now()
      await prisma.$queryRaw`SELECT 1`
      const dbTime = Date.now() - startTime
      checks.push({ 
        type: 'database', 
        status: dbTime < 100 ? 'healthy' : dbTime < 500 ? 'slow' : 'critical',
        responseTime: dbTime 
      })
    } catch (error) {
      checks.push({ type: 'database', status: 'down' })
      issues.push('Database connection failed')
    }
    
    // 4. Check for stale bookings
    const staleBookings = await prisma.rentalBooking.count({
      where: {
        status: 'PENDING' as any,
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
    
    if (staleBookings > 0) {
      issues.push(`${staleBookings} stale bookings detected`)
      await createAlert({
        type: 'business' as any,
        severity: 'medium' as any,
        title: 'Stale Bookings',
        message: `${staleBookings} bookings pending for over 24 hours`,
        details: { count: staleBookings }
      })
    }
    
    // 5. Check for extended trips
    const extendedTrips = await prisma.rentalBooking.findMany({
      where: {
        tripStatus: 'ACTIVE' as any,
        actualStartTime: {
          lt: new Date(Date.now() - 48 * 60 * 60 * 1000)
        }
      },
      select: {
        id: true,
        bookingCode: true,
        guestName: true,
        actualStartTime: true
      },
      take: 10
    })
    
    if (extendedTrips.length > 0) {
      issues.push(`${extendedTrips.length} trips active for over 48 hours`)
      await createAlert({
        type: 'business' as any,
        severity: 'high' as any,
        title: 'Extended Active Trips',
        message: `${extendedTrips.length} trips have been active for over 48 hours`,
        details: { 
          trips: extendedTrips.map(t => ({
            id: t.id,
            code: t.bookingCode,
            guest: t.guestName,
            duration: Math.floor((Date.now() - (t.actualStartTime?.getTime() || 0)) / 3600000) + ' hours'
          }))
        }
      })
    }
    
    // 6. Check for pending charges
    const pendingCharges = await prisma.tripCharge.count({
      where: {
        chargeStatus: 'PENDING' as any,
        createdAt: {
          lt: new Date(Date.now() - 24 * 60 * 60 * 1000)
        }
      }
    })
    
    if (pendingCharges > 5) {
      issues.push(`${pendingCharges} charges pending for over 24 hours`)
      await createAlert({
        type: 'business' as any,
        severity: 'high' as any,
        title: 'Pending Charges',
        message: `${pendingCharges} trip charges pending for over 24 hours`,
        details: { count: pendingCharges }
      })
    }
    
    // 7. Check for unverified bookings
    const unverifiedBookings = await prisma.rentalBooking.count({
      where: {
        verificationStatus: 'PENDING' as any,
        createdAt: {
          lt: new Date(Date.now() - 12 * 60 * 60 * 1000)
        }
      }
    })
    
    if (unverifiedBookings > 0) {
      issues.push(`${unverifiedBookings} bookings pending verification`)
    }
    
    // Log monitoring run
    await prisma.auditLog.create({
      data: {
        category: 'SECURITY',
        eventType: 'monitoring_run',
        severity: issues.length > 0 ? 'WARNING' : 'INFO',
        action: 'monitor',
        resource: 'system',
        details: {
          checks,
          issues,
          timestamp: new Date().toISOString()
        },
        ipAddress: '127.0.0.1',
        userAgent: 'System Monitor',
        hash: '',
        previousHash: null
      } as any
    })
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      checks,
      alerts: {
        staleBookings,
        extendedTrips: extendedTrips.length,
        pendingCharges,
        unverifiedBookings
      },
      issues,
      status: issues.length === 0 ? 'healthy' : issues.length < 3 ? 'degraded' : 'critical'
    })
  } catch (error) {
    console.error('Monitoring failed:', error)
    return NextResponse.json({ 
      error: 'Monitoring failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// GET endpoint to retrieve last monitoring results
export async function GET(request: NextRequest) {
  try {
    // Allow access with CRON_SECRET
    const authHeader = request.headers.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'itwhip-cron-secret-2024'
    if (authHeader === `Bearer ${cronSecret}`) {
      // Authorized via CRON_SECRET, continue
    } else {
      // Will be blocked by middleware if not admin authenticated
      const adminToken = request.cookies.get('adminAccessToken')?.value
      if (!adminToken) {
        return NextResponse.json({ error: 'Unauthorized - Admin access required' }, { status: 401 })
      }
    }

    const lastRun = await prisma.auditLog.findFirst({
      where: {
        eventType: 'monitoring_run'
      },
      orderBy: {
        timestamp: 'desc'
      }
    })
    
    return NextResponse.json({
      success: true,
      lastRun: lastRun ? {
        timestamp: lastRun.timestamp,
        details: lastRun.details
      } : null
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to retrieve monitoring status'
    }, { status: 500 })
  }
}