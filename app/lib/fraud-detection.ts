// app/lib/fraud-detection.ts

import { collectDeviceFingerprint, checkBotSignals } from './device-fingerprint'
import { initializeSessionTracking, getSessionTracker } from './session-tracking'
import { validateEmail } from '../utils/email-validator'
import { calculateBookingRisk, calculateVelocityRisk, compareWithHistoricalAverage } from '../utils/risk-calculator'
import { lookupIp, extractIpAddress } from '../utils/ip-lookup'

interface FraudCheckRequest {
  // Booking details
  bookingData: {
    guestEmail: string
    guestPhone?: string
    guestName: string
    totalAmount: number
    numberOfDays: number
    startDate: Date
    pickupLocation: string
    deliveryAddress?: string
    carId: string
    dailyRate: number
  }
  
  // Request context
  headers: Headers
  
  // Historical data (optional)
  historicalScores?: number[]
  recentBookings?: Array<{
    fingerprint: string
    ipAddress: string
    email: string
    timestamp: number
  }>
}

interface FraudCheckResponse {
  // Overall assessment
  riskScore: number
  riskLevel: 'low' | 'medium' | 'high' | 'critical'
  requiresManualReview: boolean
  shouldBlock: boolean
  
  // Detailed findings
  deviceFingerprint: string
  sessionId: string
  ipAddress: string
  
  // Component scores
  emailRisk: {
    score: number
    level: string
    flags: string[]
  }
  sessionRisk: {
    score: number
    flags: string[]
  }
  deviceRisk: {
    score: number
    flags: string[]
  }
  locationRisk: {
    score: number
    flags: string[]
  }
  velocityRisk: {
    score: number
    flags: string[]
  }
  
  // All risk factors
  allFlags: string[]
  suggestedActions: string[]
  
  // Data to store
  dataToStore: {
    deviceFingerprint: string
    sessionId: string
    sessionDuration: number
    bookingIpAddress: string
    bookingCountry?: string
    bookingCity?: string
    bookingUserAgent: string
    riskScore: number
    riskFlags: string
    emailDomain: string
    formCompletionTime: number
    copyPasteUsed: boolean
    mouseEventsRecorded: boolean
    emailVerified: boolean
    phoneVerified: boolean
  }
}

/**
 * Perform comprehensive fraud check on a booking
 */
export async function performFraudCheck(request: FraudCheckRequest): Promise<FraudCheckResponse> {
  // 1. Extract basic information
  const ipAddress = extractIpAddress(request.headers)
  const userAgent = request.headers.get('user-agent') || 'unknown'
  
  // 2. Collect device fingerprint
  const deviceData = collectDeviceFingerprint()
  const botSignals = checkBotSignals(deviceData)
  
  // 3. Get session data
  const sessionTracker = getSessionTracker()
  const sessionData = sessionTracker ? sessionTracker.getSessionSummary() : null
  
  // 4. Validate email
  const emailValidation = validateEmail(request.bookingData.guestEmail)
  
  // 5. Lookup IP information
  const ipLookup = await lookupIp(ipAddress)
  
  // 6. Prepare data for risk calculation
  const bookingHour = new Date().getHours()
  const bookingDayOfWeek = new Date().getDay()
  const daysUntilCheckIn = Math.floor(
    (request.bookingData.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
  )
  
  const isFirstTimeUser = !request.recentBookings || 
    request.recentBookings.filter(b => b.email === request.bookingData.guestEmail).length === 0
  
  // 7. Calculate velocity risk if historical data provided
  let velocityScore = 0
  let velocityFlags: string[] = []
  
  if (request.recentBookings && request.recentBookings.length > 0) {
    const velocityRisk = calculateVelocityRisk(
      request.recentBookings,
      deviceData.fingerprint,
      ipAddress,
      request.bookingData.guestEmail
    )
    velocityScore = velocityRisk.velocityScore
    velocityFlags = velocityRisk.velocityFlags
  }
  
  // 8. Calculate comprehensive risk score
  const riskAssessment = calculateBookingRisk(
    {
      guestEmail: request.bookingData.guestEmail,
      guestPhone: request.bookingData.guestPhone,
      guestName: request.bookingData.guestName,
      totalAmount: request.bookingData.totalAmount,
      numberOfDays: request.bookingData.numberOfDays,
      daysUntilCheckIn,
      isFirstTimeUser,
      pickupLocation: request.bookingData.pickupLocation,
      deliveryAddress: request.bookingData.deliveryAddress,
      bookingHour,
      bookingDayOfWeek
    },
    sessionData ? {
      duration: sessionData.duration || 0,
      pageViewCount: sessionData.pageViewCount || 0,
      fieldInteractionCount: sessionData.fieldInteractionCount || 0,
      totalInteractions: sessionData.totalInteractions || 0,
      copyPasteUsed: sessionData.copyPasteUsed || false,
      maxScrollDepth: sessionData.maxScrollDepth || 0,
      validationErrors: sessionData.validationErrors || 0,
      formSubmitAttempts: sessionData.formSubmitAttempts || 0,
      suspiciousActivity: sessionData.suspiciousActivity || []
    } : {
      duration: 0,
      pageViewCount: 0,
      fieldInteractionCount: 0,
      totalInteractions: 0,
      copyPasteUsed: false,
      maxScrollDepth: 0,
      validationErrors: 0,
      formSubmitAttempts: 0,
      suspiciousActivity: ['no_session_data']
    },
    {
      fingerprint: deviceData.fingerprint,
      botSignals,
      screenResolution: deviceData.rawData.screenResolution,
      timezone: deviceData.rawData.timezone,
      platform: deviceData.rawData.platform,
      touchSupport: deviceData.rawData.touchSupport,
      cookieEnabled: deviceData.rawData.cookieEnabled
    },
    {
      ipAddress,
      country: ipLookup.country,
      city: ipLookup.city,
      vpnDetected: ipLookup.vpn || false,
      proxyDetected: ipLookup.proxy || false
    },
    emailValidation
  )
  
  // 9. Add velocity risk to total score
  const totalRiskScore = Math.min(100, riskAssessment.score + velocityScore)
  
  // 10. Compare with historical average if provided
  let anomalyDetected = false
  if (request.historicalScores && request.historicalScores.length > 10) {
    const comparison = compareWithHistoricalAverage(totalRiskScore, request.historicalScores)
    anomalyDetected = comparison.isAnomaly
    if (anomalyDetected) {
      riskAssessment.flags.push('statistical_anomaly')
    }
  }
  
  // 11. Determine if booking should be blocked
  const shouldBlock = 
    totalRiskScore >= 85 ||
    botSignals.length > 0 ||
    riskAssessment.flags.includes('fake_name') ||
    (ipLookup.tor && totalRiskScore > 50) ||
    velocityFlags.includes('5_bookings_same_device_last_hour')
  
  // 12. Compile all flags
  const allFlags = [
    ...riskAssessment.flags,
    ...velocityFlags,
    ...(ipLookup.riskFactors || []),
    ...botSignals,
    ...(anomalyDetected ? ['statistical_anomaly'] : [])
  ]
  
  // 13. Determine final risk level
  let finalRiskLevel: 'low' | 'medium' | 'high' | 'critical'
  if (totalRiskScore >= 70 || shouldBlock) finalRiskLevel = 'critical'
  else if (totalRiskScore >= 50) finalRiskLevel = 'high'
  else if (totalRiskScore >= 30) finalRiskLevel = 'medium'
  else finalRiskLevel = 'low'
  
  return {
    riskScore: totalRiskScore,
    riskLevel: finalRiskLevel,
    requiresManualReview: riskAssessment.requiresManualReview || anomalyDetected,
    shouldBlock,
    
    deviceFingerprint: deviceData.fingerprint,
    sessionId: sessionData?.sessionId || 'no-session',
    ipAddress,
    
    emailRisk: {
      score: emailValidation.riskScore,
      level: emailValidation.riskLevel,
      flags: emailValidation.flags
    },
    
    sessionRisk: {
      score: sessionData ? 
        Math.min(50, sessionData.suspiciousActivity.length * 10) : 50,
      flags: sessionData?.suspiciousActivity || ['no_session_data']
    },
    
    deviceRisk: {
      score: botSignals.length * 25,
      flags: botSignals
    },
    
    locationRisk: {
      score: ipLookup.riskScore || 0,
      flags: ipLookup.riskFactors || []
    },
    
    velocityRisk: {
      score: velocityScore,
      flags: velocityFlags
    },
    
    allFlags: [...new Set(allFlags)], // Remove duplicates
    suggestedActions: riskAssessment.suggestedActions,
    
    dataToStore: {
      deviceFingerprint: deviceData.fingerprint,
      sessionId: sessionData?.sessionId || 'no-session',
      sessionDuration: sessionData?.duration || 0,
      bookingIpAddress: ipAddress,
      bookingCountry: ipLookup.country,
      bookingCity: ipLookup.city,
      bookingUserAgent: userAgent,
      riskScore: totalRiskScore,
      riskFlags: JSON.stringify(allFlags),
      emailDomain: request.bookingData.guestEmail.split('@')[1],
      formCompletionTime: sessionData?.duration || 0,
      copyPasteUsed: sessionData?.copyPasteUsed || false,
      mouseEventsRecorded: (sessionData?.totalInteractions || 0) > 0,
      emailVerified: false, // Will be updated if verification is performed
      phoneVerified: false  // Will be updated if verification is performed
    }
  }
}

/**
 * Initialize fraud detection on the client side
 */
export function initializeFraudDetection(): {
  sessionTracker: any
  deviceFingerprint: string
} {
  // Initialize session tracking
  const sessionTracker = initializeSessionTracking()
  
  // Track form fields
  if (sessionTracker) {
    sessionTracker.trackFormFields()
  }
  
  // Collect device fingerprint
  const deviceData = collectDeviceFingerprint()
  
  return {
    sessionTracker,
    deviceFingerprint: deviceData.fingerprint
  }
}

/**
 * Get fraud detection data for submission
 */
export function getFraudDetectionData(): {
  deviceFingerprint: string
  sessionData: any
  botSignals: string[]
} {
  const deviceData = collectDeviceFingerprint()
  const sessionTracker = getSessionTracker()
  const sessionData = sessionTracker ? sessionTracker.getSessionSummary() : null
  const botSignals = checkBotSignals(deviceData)
  
  return {
    deviceFingerprint: deviceData.fingerprint,
    sessionData,
    botSignals
  }
}

/**
 * Check if a booking appears to be automated/bot
 */
export function quickBotCheck(): boolean {
  const deviceData = collectDeviceFingerprint()
  const botSignals = checkBotSignals(deviceData)
  const sessionTracker = getSessionTracker()
  
  // Quick bot indicators
  if (botSignals.length > 0) return true
  
  if (sessionTracker) {
    const summary = sessionTracker.getSessionSummary()
    if (summary.totalInteractions === 0 && summary.duration > 5000) return true
    if (summary.duration < 10000 && summary.fieldInteractionCount > 5) return true
  }
  
  return false
}

/**
 * Format risk report for admin viewing
 */
export function formatRiskReport(fraudCheck: FraudCheckResponse): string {
  const sections = []
  
  sections.push(`Risk Assessment Summary`)
  sections.push(`========================`)
  sections.push(`Overall Risk Score: ${fraudCheck.riskScore}/100`)
  sections.push(`Risk Level: ${fraudCheck.riskLevel.toUpperCase()}`)
  sections.push(`Requires Manual Review: ${fraudCheck.requiresManualReview ? 'YES' : 'NO'}`)
  sections.push(`Should Block: ${fraudCheck.shouldBlock ? 'YES - BLOCK THIS BOOKING' : 'NO'}`)
  sections.push('')
  
  sections.push(`Component Risk Scores`)
  sections.push(`---------------------`)
  sections.push(`Email Risk: ${fraudCheck.emailRisk.score} (${fraudCheck.emailRisk.level})`)
  sections.push(`Session Risk: ${fraudCheck.sessionRisk.score}`)
  sections.push(`Device Risk: ${fraudCheck.deviceRisk.score}`)
  sections.push(`Location Risk: ${fraudCheck.locationRisk.score}`)
  sections.push(`Velocity Risk: ${fraudCheck.velocityRisk.score}`)
  sections.push('')
  
  if (fraudCheck.allFlags.length > 0) {
    sections.push(`Risk Indicators Detected`)
    sections.push(`------------------------`)
    fraudCheck.allFlags.forEach(flag => {
      sections.push(`• ${flag.replace(/_/g, ' ')}`)
    })
    sections.push('')
  }
  
  if (fraudCheck.suggestedActions.length > 0) {
    sections.push(`Recommended Actions`)
    sections.push(`-------------------`)
    fraudCheck.suggestedActions.forEach(action => {
      sections.push(`• ${action}`)
    })
    sections.push('')
  }
  
  sections.push(`Technical Details`)
  sections.push(`-----------------`)
  sections.push(`Device Fingerprint: ${fraudCheck.deviceFingerprint}`)
  sections.push(`Session ID: ${fraudCheck.sessionId}`)
  sections.push(`IP Address: ${fraudCheck.ipAddress}`)
  
  return sections.join('\n')
}