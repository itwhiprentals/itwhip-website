// app/api/admin/rentals/bookings/[id]/risk-analysis/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { formatRiskReport } from '@/app/lib/fraud-detection'
import { compareWithHistoricalAverage } from '@/app/utils/risk-calculator'

interface RiskAnalysisResponse {
  bookingId: string
  bookingCode: string
  overallRisk: {
    score: number
    level: 'low' | 'medium' | 'high' | 'critical'
    percentile: number
    isAnomaly: boolean
    requiresManualReview: boolean
  }
  
  riskBreakdown: {
    email: {
      score: number
      flags: string[]
      details: {
        domain: string
        isDisposable: boolean
        hasTypo: boolean
        suggestions?: string[]
      }
    }
    device: {
      score: number
      flags: string[]
      details: {
        fingerprint: string
        platform: string
        botSignals: string[]
        cookiesEnabled: boolean
      }
    }
    session: {
      score: number
      flags: string[]
      details: {
        duration: number
        interactions: number
        copyPasteUsed: boolean
        validationErrors: number
      }
    }
    location: {
      score: number
      flags: string[]
      details: {
        ipAddress: string
        country?: string
        city?: string
        vpnDetected: boolean
        proxyDetected: boolean
      }
    }
    identity: {
      score: number
      flags: string[]
      details: {
        nameAnalysis: string[]
        phoneVerified: boolean
        emailVerified: boolean
      }
    }
  }
  
  relatedBookings: {
    sameDevice: Array<{
      bookingCode: string
      date: string
      status: string
      amount: number
    }>
    sameIp: Array<{
      bookingCode: string
      date: string
      status: string
      amount: number
    }>
    sameEmail: Array<{
      bookingCode: string
      date: string
      status: string
      amount: number
    }>
  }
  
  velocityAnalysis: {
    last24Hours: number
    last7Days: number
    last30Days: number
    velocityRisk: 'normal' | 'elevated' | 'high' | 'critical'
  }
  
  recommendations: {
    priority: 'high' | 'medium' | 'low'
    actions: Array<{
      action: string
      reason: string
      priority: 'high' | 'medium' | 'low'
    }>
  }
  
  adminActions: {
    suggestedAction: 'approve' | 'reject' | 'review'
    availableActions: string[]
    overrideOptions: string[]
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    // Fetch booking with all related data
    const booking = await prisma.rentalBooking.findUnique({
      where: { id },
      include: {
        car: {
          include: {
            photos: true,
            host: true
          }
        },
        fraudIndicators: true,
        bookingSession: true,
        disputes: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // Parse risk flags if stored as JSON string
    let riskFlags: string[] = []
    try {
      riskFlags = booking.riskFlags ? JSON.parse(booking.riskFlags) : []
    } catch {
      riskFlags = []
    }

    // Get historical risk scores for comparison
    const historicalScores = await prisma.rentalBooking.findMany({
      where: {
        riskScore: { not: null },
        status: { not: 'CANCELLED' },
        id: { not: booking.id }
      },
      select: { riskScore: true },
      take: 100,
      orderBy: { createdAt: 'desc' }
    }).then(bookings => 
      bookings.map(b => b.riskScore || 0).filter(score => score > 0)
    )

    // Calculate percentile and anomaly detection
    const comparison = historicalScores.length > 10 
      ? compareWithHistoricalAverage(booking.riskScore || 0, historicalScores)
      : { percentile: 50, isAnomaly: false, deviationFromMean: 0 }

    // RISK BREAKDOWN BY CATEGORY
    const emailFlags = riskFlags.filter(f => 
      f.includes('email') || f.includes('disposable') || f.includes('domain')
    )
    const deviceFlags = riskFlags.filter(f => 
      f.includes('bot') || f.includes('headless') || f.includes('automation') || 
      f.includes('screen') || f.includes('cookie')
    )
    const sessionFlags = riskFlags.filter(f => 
      f.includes('session') || f.includes('interaction') || f.includes('copy_paste') ||
      f.includes('validation') || f.includes('scroll')
    )
    const locationFlags = riskFlags.filter(f => 
      f.includes('vpn') || f.includes('proxy') || f.includes('tor') || 
      f.includes('country') || f.includes('geographic')
    )
    const identityFlags = riskFlags.filter(f => 
      f.includes('name') || f.includes('phone') || f.includes('verified')
    )

    // Calculate category scores (simplified - in production, use actual scoring logic)
    const calculateCategoryScore = (flags: string[], weight: number = 10): number => {
      return Math.min(100, flags.length * weight)
    }

    // RELATED BOOKINGS DETECTION
    const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
    
    // Find bookings from same device
    const sameDeviceBookings = booking.deviceFingerprint ? 
      await prisma.rentalBooking.findMany({
        where: {
          deviceFingerprint: booking.deviceFingerprint,
          id: { not: booking.id },
          createdAt: { gte: thirtyDaysAgo }
        },
        select: {
          bookingCode: true,
          createdAt: true,
          status: true,
          totalAmount: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }) : []

    // Find bookings from same IP
    const sameIpBookings = booking.bookingIpAddress ?
      await prisma.rentalBooking.findMany({
        where: {
          bookingIpAddress: booking.bookingIpAddress,
          id: { not: booking.id },
          createdAt: { gte: thirtyDaysAgo }
        },
        select: {
          bookingCode: true,
          createdAt: true,
          status: true,
          totalAmount: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }) : []

    // Find bookings from same email
    const sameEmailBookings = booking.guestEmail ?
      await prisma.rentalBooking.findMany({
        where: {
          guestEmail: booking.guestEmail,
          id: { not: booking.id }
        },
        select: {
          bookingCode: true,
          createdAt: true,
          status: true,
          totalAmount: true
        },
        orderBy: { createdAt: 'desc' },
        take: 10
      }) : []

    // VELOCITY ANALYSIS
    const now = new Date()
    const oneDayAgo = new Date(now.getTime() - 24 * 60 * 60 * 1000)
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
    
    const velocityCounts = await Promise.all([
      // Last 24 hours
      prisma.rentalBooking.count({
        where: {
          OR: [
            { deviceFingerprint: booking.deviceFingerprint },
            { bookingIpAddress: booking.bookingIpAddress },
            { guestEmail: booking.guestEmail }
          ],
          createdAt: { gte: oneDayAgo }
        }
      }),
      // Last 7 days
      prisma.rentalBooking.count({
        where: {
          OR: [
            { deviceFingerprint: booking.deviceFingerprint },
            { bookingIpAddress: booking.bookingIpAddress },
            { guestEmail: booking.guestEmail }
          ],
          createdAt: { gte: sevenDaysAgo }
        }
      }),
      // Last 30 days
      prisma.rentalBooking.count({
        where: {
          OR: [
            { deviceFingerprint: booking.deviceFingerprint },
            { bookingIpAddress: booking.bookingIpAddress },
            { guestEmail: booking.guestEmail }
          ],
          createdAt: { gte: thirtyDaysAgo }
        }
      })
    ])

    // Determine velocity risk
    let velocityRisk: 'normal' | 'elevated' | 'high' | 'critical' = 'normal'
    if (velocityCounts[0] > 5) velocityRisk = 'critical'
    else if (velocityCounts[0] > 3) velocityRisk = 'high'
    else if (velocityCounts[1] > 10) velocityRisk = 'elevated'
    else if (velocityCounts[2] > 20) velocityRisk = 'elevated'

    // RECOMMENDATIONS GENERATION
    const recommendations: Array<{ action: string; reason: string; priority: 'high' | 'medium' | 'low' }> = []
    
    // High priority recommendations
    if (booking.riskScore && booking.riskScore >= 70) {
      recommendations.push({
        action: 'Require additional verification',
        reason: 'Risk score exceeds high-risk threshold',
        priority: 'high'
      })
    }
    
    if (deviceFlags.includes('bot_signal') || deviceFlags.includes('headless_chrome')) {
      recommendations.push({
        action: 'Reject booking - automated bot detected',
        reason: 'Strong indicators of automated booking attempt',
        priority: 'high'
      })
    }
    
    if (velocityRisk === 'critical') {
      recommendations.push({
        action: 'Review all related bookings',
        reason: 'Excessive booking velocity detected',
        priority: 'high'
      })
    }
    
    // Medium priority recommendations
    if (locationFlags.includes('vpn_detected') || locationFlags.includes('proxy_detected')) {
      recommendations.push({
        action: 'Verify actual location matches booking',
        reason: 'VPN/Proxy usage detected',
        priority: 'medium'
      })
    }
    
    if (emailFlags.includes('disposable_domain')) {
      recommendations.push({
        action: 'Request permanent email address',
        reason: 'Disposable email service detected',
        priority: 'medium'
      })
    }
    
    if (!booking.licenseVerified || !booking.selfieVerified) {
      recommendations.push({
        action: 'Complete document verification',
        reason: 'Verification documents not reviewed',
        priority: 'medium'
      })
    }
    
    // Low priority recommendations
    if (booking.sessionDuration && booking.sessionDuration < 120000) {
      recommendations.push({
        action: 'Monitor for unusual activity',
        reason: 'Quick booking session detected',
        priority: 'low'
      })
    }
    
    if (comparison.isAnomaly) {
      recommendations.push({
        action: 'Flag for statistical review',
        reason: 'Risk score is statistical anomaly',
        priority: 'low'
      })
    }

    // ADMIN ACTION GUIDANCE
    let suggestedAction: 'approve' | 'reject' | 'review' = 'review'
    if (booking.riskScore) {
      if (booking.riskScore >= 85 || deviceFlags.includes('bot_signal')) {
        suggestedAction = 'reject'
      } else if (booking.riskScore <= 30 && velocityRisk === 'normal') {
        suggestedAction = 'approve'
      }
    }

    const response: RiskAnalysisResponse = {
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      
      overallRisk: {
        score: booking.riskScore || 0,
        level: booking.riskScore 
          ? booking.riskScore >= 70 ? 'critical'
          : booking.riskScore >= 50 ? 'high'
          : booking.riskScore >= 30 ? 'medium'
          : 'low'
          : 'low',
        percentile: comparison.percentile,
        isAnomaly: comparison.isAnomaly,
        requiresManualReview: booking.flaggedForReview || false
      },
      
      riskBreakdown: {
        email: {
          score: calculateCategoryScore(emailFlags, 15),
          flags: emailFlags,
          details: {
            domain: booking.emailDomain || booking.guestEmail?.split('@')[1] || 'unknown',
            isDisposable: emailFlags.includes('disposable_domain'),
            hasTypo: emailFlags.includes('typo_detected'),
            suggestions: emailFlags.includes('typo_detected') ? ['gmail.com', 'yahoo.com'] : undefined
          }
        },
        
        device: {
          score: calculateCategoryScore(deviceFlags, 20),
          flags: deviceFlags,
          details: {
            fingerprint: booking.deviceFingerprint || 'unknown',
            platform: 'unknown', // Would need to parse from user agent
            botSignals: deviceFlags.filter(f => f.includes('bot')),
            cookiesEnabled: !deviceFlags.includes('cookies_disabled')
          }
        },
        
        session: {
          score: calculateCategoryScore(sessionFlags, 10),
          flags: sessionFlags,
          details: {
            duration: booking.sessionDuration || 0,
            interactions: booking.bookingSession?.clickCount || 0,
            copyPasteUsed: booking.copyPasteUsed || false,
            validationErrors: booking.bookingSession?.validationErrors || 0
          }
        },
        
        location: {
          score: calculateCategoryScore(locationFlags, 15),
          flags: locationFlags,
          details: {
            ipAddress: booking.bookingIpAddress || 'unknown',
            country: booking.bookingCountry || undefined,
            city: booking.bookingCity || undefined,
            vpnDetected: locationFlags.includes('vpn_detected'),
            proxyDetected: locationFlags.includes('proxy_detected')
          }
        },
        
        identity: {
          score: calculateCategoryScore(identityFlags, 10),
          flags: identityFlags,
          details: {
            nameAnalysis: identityFlags.filter(f => f.includes('name')),
            phoneVerified: booking.phoneVerified || false,
            emailVerified: booking.emailVerified || false
          }
        }
      },
      
      relatedBookings: {
        sameDevice: sameDeviceBookings.map(b => ({
          bookingCode: b.bookingCode,
          date: b.createdAt.toISOString(),
          status: b.status,
          amount: b.totalAmount
        })),
        sameIp: sameIpBookings.map(b => ({
          bookingCode: b.bookingCode,
          date: b.createdAt.toISOString(),
          status: b.status,
          amount: b.totalAmount
        })),
        sameEmail: sameEmailBookings.map(b => ({
          bookingCode: b.bookingCode,
          date: b.createdAt.toISOString(),
          status: b.status,
          amount: b.totalAmount
        }))
      },
      
      velocityAnalysis: {
        last24Hours: velocityCounts[0],
        last7Days: velocityCounts[1],
        last30Days: velocityCounts[2],
        velocityRisk
      },
      
      recommendations: {
        priority: recommendations.some(r => r.priority === 'high') ? 'high'
          : recommendations.some(r => r.priority === 'medium') ? 'medium'
          : 'low',
        actions: recommendations
      },
      
      adminActions: {
        suggestedAction,
        availableActions: [
          'Approve booking',
          'Reject booking',
          'Request additional verification',
          'Flag for further review',
          'Add admin notes',
          'Contact guest',
          'Block device/IP',
          'Report to fraud database'
        ],
        overrideOptions: [
          'Override risk score',
          'Approve despite high risk',
          'Whitelist email/device',
          'Mark as false positive'
        ]
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Error generating risk analysis:', error)
    return NextResponse.json(
      { error: 'Failed to generate risk analysis' },
      { status: 500 }
    )
  }
}

// POST - Update risk assessment or take action
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    const { action, notes, override } = body

    // TODO: Add admin authentication check

    const booking = await prisma.rentalBooking.findUnique({
      where: { id }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    let updateData: any = {}
    let logAction = ''

    switch (action) {
      case 'override_risk':
        if (override?.newScore !== undefined) {
          updateData.riskScore = override.newScore
          updateData.riskNotes = notes || 'Admin override'
          logAction = 'risk_override'
        }
        break
        
      case 'whitelist':
        // Add to whitelist (would need a whitelist table)
        updateData.flaggedForReview = false
        updateData.riskNotes = `Whitelisted by admin: ${notes || 'No reason provided'}`
        logAction = 'whitelist_added'
        break
        
      case 'mark_false_positive':
        updateData.fraudulent = false
        updateData.flaggedForReview = false
        updateData.riskNotes = `False positive: ${notes || 'No reason provided'}`
        logAction = 'false_positive_marked'
        break
        
      case 'block_device':
        // Would need to implement device blocking table
        logAction = 'device_blocked'
        break
        
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    // Update booking if needed
    if (Object.keys(updateData).length > 0) {
      await prisma.rentalBooking.update({
        where: { id },
        data: updateData
      })
    }

    // Log the action
    await prisma.activityLog.create({
      data: {
        action: logAction,
        entityType: 'RentalBooking',
        entityId: id,
        metadata: {
          action,
          notes,
          override,
          previousRiskScore: booking.riskScore
        }
      }
    })

    return NextResponse.json({
      success: true,
      message: `Action ${action} completed successfully`
    })

  } catch (error) {
    console.error('Error updating risk assessment:', error)
    return NextResponse.json(
      { error: 'Failed to update risk assessment' },
      { status: 500 }
    )
  }
}