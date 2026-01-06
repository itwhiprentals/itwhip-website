// app/api/admin/system/cron/route.ts
// This should be called by Vercel Cron, Uptime Robot, or external scheduler every 5 minutes

import { NextRequest, NextResponse } from 'next/server'
import { headers } from 'next/headers'

export async function GET(request: NextRequest) {
  try {
    // Verify cron secret
    const headersList = headers()
    const authHeader = headersList.get('authorization')
    const cronSecret = process.env.CRON_SECRET || 'itwhip-cron-secret-2024'
    
    if (authHeader !== `Bearer ${cronSecret}`) {
      console.log('Unauthorized cron attempt')
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }
    
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
    const results = []
    
    // 1. Run system monitoring
    try {
      const monitorResponse = await fetch(`${baseUrl}/api/admin/system/monitor`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cronSecret}`
        }
      })
      const monitorResult = await monitorResponse.json()
      results.push({ 
        task: 'monitor', 
        status: monitorResult.success ? 'success' : 'failed',
        details: monitorResult
      })
    } catch (error) {
      results.push({ 
        task: 'monitor', 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // 2. Check for security patterns
    try {
      const patternsResponse = await fetch(`${baseUrl}/api/admin/system/alerts/patterns`, {
        headers: { 'Authorization': `Bearer ${cronSecret}` }
      })
      const patternsResult = await patternsResponse.json()
      results.push({ 
        task: 'patterns', 
        status: patternsResult.success ? 'success' : 'failed',
        detected: patternsResult.patterns?.length || 0
      })
    } catch (error) {
      results.push({ 
        task: 'patterns', 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // 3. Clean up old audit logs (keep last 30 days)
    try {
      const { prisma } = await import('@/app/lib/database/prisma')
      const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
      
      const deleted = await prisma.auditLog.deleteMany({
        where: {
          timestamp: { lt: thirtyDaysAgo },
          severity: { in: ['INFO'] } // Only delete INFO level logs
        }
      })
      
      results.push({ 
        task: 'cleanup', 
        status: 'success',
        deletedLogs: deleted.count
      })
    } catch (error) {
      results.push({ 
        task: 'cleanup', 
        status: 'error',
        error: error instanceof Error ? error.message : 'Unknown error'
      })
    }
    
    // 4. Process scheduled reminders
    try {
      const reminderResponse = await fetch(`${baseUrl}/api/admin/rentals/reminders/schedule`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${cronSecret}`
        }
      })
      
      if (reminderResponse.ok) {
        const reminderResult = await reminderResponse.json()
        results.push({ 
          task: 'reminders', 
          status: 'success',
          processed: reminderResult.processed || 0
        })
      }
    } catch (error) {
      // Reminders might not exist yet, that's okay
      results.push({ 
        task: 'reminders', 
        status: 'skipped'
      })
    }
    
    // 5. Update system metrics
    try {
      const { prisma } = await import('@/app/lib/database/prisma')
      const now = new Date()
      
      // Log successful cron run
      await prisma.auditLog.create({
        data: {
          category: 'SECURITY',
          eventType: 'cron_run',
          severity: 'INFO',
          action: 'cron',
          resource: 'system',
          details: { 
            results,
            timestamp: now.toISOString()
          },
          ipAddress: '127.0.0.1',
          userAgent: 'System Cron',
          hash: '',
          previousHash: null
        }
      })
    } catch (error) {
      console.error('Failed to log cron run:', error)
    }
    
    return NextResponse.json({
      success: true,
      timestamp: new Date().toISOString(),
      results,
      nextRun: new Date(Date.now() + 5 * 60 * 1000).toISOString()
    })
    
  } catch (error) {
    console.error('Cron job failed:', error)
    return NextResponse.json({ 
      error: 'Cron job failed',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// POST endpoint for manual trigger (admin only)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add admin authentication check
    
    // Trigger the cron job with auth
    const cronSecret = process.env.CRON_SECRET || 'itwhip-cron-secret-2024'
    const baseUrl = process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'
    
    const response = await fetch(`${baseUrl}/api/admin/system/cron`, {
      headers: {
        'Authorization': `Bearer ${cronSecret}`
      }
    })
    
    const result = await response.json()
    
    return NextResponse.json({
      success: true,
      message: 'Cron job triggered manually',
      result
    })
  } catch (error) {
    return NextResponse.json({ 
      error: 'Failed to trigger cron job'
    }, { status: 500 })
  }
}