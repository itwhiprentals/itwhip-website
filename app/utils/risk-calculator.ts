// app/utils/risk-calculator.ts

type EmailValidationResult = { isValid: boolean; riskLevel: string; reasons: string[]; details: any }

interface BookingData {
  // Guest information
  guestEmail: string
  guestPhone?: string
  guestName: string
  
  // Booking details
  totalAmount: number
  numberOfDays: number
  daysUntilCheckIn: number
  isFirstTimeUser: boolean
  
  // Location
  pickupLocation: string
  deliveryAddress?: string
  
  // Timing
  bookingHour: number // Hour of day (0-23)
  bookingDayOfWeek: number // Day of week (0-6)
}

interface SessionData {
  duration: number // milliseconds
  pageViewCount: number
  fieldInteractionCount: number
  totalInteractions: number
  copyPasteUsed: boolean
  maxScrollDepth: number
  validationErrors: number
  formSubmitAttempts: number
  suspiciousActivity: string[]
}

interface DeviceData {
  fingerprint: string
  botSignals: string[]
  screenResolution: string
  timezone: string
  platform: string
  touchSupport: boolean
  cookieEnabled: boolean
}

interface LocationData {
  ipAddress: string
  country?: string
  city?: string
  vpnDetected?: boolean
  proxyDetected?: boolean
}

interface RiskAssessment {
  score: number // 0-100
  level: 'low' | 'medium' | 'high' | 'critical'
  flags: string[]
  factors: RiskFactor[]
  requiresManualReview: boolean
  suggestedActions: string[]
}

interface RiskFactor {
  category: string
  factor: string
  impact: number // Points added to risk score
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
}

/**
 * Calculate comprehensive risk score for a rental booking
 */
export function calculateBookingRisk(
  booking: BookingData,
  session: SessionData,
  device: DeviceData,
  location: LocationData,
  emailValidation: EmailValidationResult
): RiskAssessment {
  const factors: RiskFactor[] = []
  const flags: string[] = []
  let totalScore = 0

  // 1. EMAIL RISK FACTORS
  const emailVal = emailValidation as any
  if (emailVal.riskScore > 0) {
    factors.push({
      category: 'email',
      factor: `Email risk score: ${emailVal.riskScore}`,
      impact: Math.floor(emailVal.riskScore * 0.3), // 30% weight
      severity: emailVal.riskLevel as any
    })
    totalScore += Math.floor(emailVal.riskScore * 0.3)
    flags.push(...(emailVal.flags || []))
  }

  // 2. SESSION BEHAVIOR FACTORS
  // Very short session (under 30 seconds)
  if (session.duration < 30000) {
    factors.push({
      category: 'session',
      factor: 'Very short session (under 30 seconds)',
      impact: 25,
      severity: 'high'
    })
    totalScore += 25
    flags.push('very_short_session')
  }
  // Quick booking (under 2 minutes)
  else if (session.duration < 120000) {
    factors.push({
      category: 'session',
      factor: 'Quick booking (under 2 minutes)',
      impact: 15,
      severity: 'medium'
    })
    totalScore += 15
    flags.push('quick_booking')
  }

  // No interactions
  if (session.totalInteractions < 10) {
    factors.push({
      category: 'session',
      factor: 'Minimal user interactions',
      impact: 20,
      severity: 'high'
    })
    totalScore += 20
    flags.push('minimal_interactions')
  }

  // Excessive copy/paste
  if (session.copyPasteUsed) {
    factors.push({
      category: 'session',
      factor: 'Copy/paste detected',
      impact: 10,
      severity: 'low'
    })
    totalScore += 10
    flags.push('copy_paste_used')
  }

  // Many validation errors
  if (session.validationErrors > 5) {
    factors.push({
      category: 'session',
      factor: `${session.validationErrors} validation errors`,
      impact: 15,
      severity: 'medium'
    })
    totalScore += 15
    flags.push('excessive_validation_errors')
  }

  // Suspicious activity patterns
  session.suspiciousActivity.forEach(activity => {
    factors.push({
      category: 'session',
      factor: activity.replace(/_/g, ' '),
      impact: 10,
      severity: 'medium'
    })
    totalScore += 10
    flags.push(activity)
  })

  // 3. DEVICE FACTORS
  // Bot signals detected
  if (device.botSignals.length > 0) {
    device.botSignals.forEach(signal => {
      factors.push({
        category: 'device',
        factor: `Bot signal: ${signal}`,
        impact: 20,
        severity: 'critical'
      })
      totalScore += 20
      flags.push(signal)
    })
  }

  // Cookies disabled
  if (!device.cookieEnabled) {
    factors.push({
      category: 'device',
      factor: 'Cookies disabled',
      impact: 10,
      severity: 'medium'
    })
    totalScore += 10
    flags.push('cookies_disabled')
  }

  // Suspicious screen resolution
  if (device.screenResolution === '0x0' || device.screenResolution === '1x1') {
    factors.push({
      category: 'device',
      factor: 'Invalid screen resolution',
      impact: 25,
      severity: 'critical'
    })
    totalScore += 25
    flags.push('invalid_screen')
  }

  // 4. LOCATION FACTORS
  // VPN/Proxy detected
  if (location.vpnDetected || location.proxyDetected) {
    factors.push({
      category: 'location',
      factor: 'VPN/Proxy detected',
      impact: 20,
      severity: 'high'
    })
    totalScore += 20
    flags.push('vpn_proxy_detected')
  }

  // Geographic mismatch (if we can determine)
  if (location.country && booking.pickupLocation) {
    // This is simplified - in production you'd check actual distance
    const pickupCountry = detectCountryFromLocation(booking.pickupLocation)
    if (pickupCountry && location.country !== pickupCountry) {
      factors.push({
        category: 'location',
        factor: 'Booking from different country',
        impact: 15,
        severity: 'medium'
      })
      totalScore += 15
      flags.push('geographic_mismatch')
    }
  }

  // 5. BOOKING PATTERN FACTORS
  // First time user with high value booking
  if (booking.isFirstTimeUser && booking.totalAmount > 1000) {
    factors.push({
      category: 'booking',
      factor: 'First-time user with high-value booking',
      impact: 20,
      severity: 'high'
    })
    totalScore += 20
    flags.push('first_time_high_value')
  }

  // Last minute booking (less than 24 hours)
  if (booking.daysUntilCheckIn < 1) {
    factors.push({
      category: 'booking',
      factor: 'Last-minute booking',
      impact: 10,
      severity: 'low'
    })
    totalScore += 10
    flags.push('last_minute_booking')
  }

  // Very long rental (over 30 days)
  if (booking.numberOfDays > 30) {
    factors.push({
      category: 'booking',
      factor: 'Extended rental period',
      impact: 10,
      severity: 'low'
    })
    totalScore += 10
    flags.push('extended_rental')
  }

  // Late night booking (11 PM - 5 AM)
  if (booking.bookingHour >= 23 || booking.bookingHour < 5) {
    factors.push({
      category: 'booking',
      factor: 'Late night booking',
      impact: 8,
      severity: 'low'
    })
    totalScore += 8
    flags.push('late_night_booking')
  }

  // Weekend high-value booking
  if ((booking.bookingDayOfWeek === 0 || booking.bookingDayOfWeek === 6) && booking.totalAmount > 500) {
    factors.push({
      category: 'booking',
      factor: 'Weekend high-value booking',
      impact: 5,
      severity: 'info'
    })
    totalScore += 5
    flags.push('weekend_high_value')
  }

  // 6. NAME ANALYSIS
  const nameRisk = analyzeGuestName(booking.guestName)
  if (nameRisk.suspicious) {
    factors.push({
      category: 'identity',
      factor: nameRisk.reason,
      impact: nameRisk.score,
      severity: nameRisk.severity
    })
    totalScore += nameRisk.score
    flags.push(...nameRisk.flags)
  }

  // Calculate final score (cap at 100)
  const finalScore = Math.min(100, totalScore)

  // Determine risk level
  let level: 'low' | 'medium' | 'high' | 'critical'
  if (finalScore >= 70) level = 'critical'
  else if (finalScore >= 50) level = 'high'
  else if (finalScore >= 30) level = 'medium'
  else level = 'low'

  // Determine if manual review needed
  const requiresManualReview = 
    finalScore >= 60 ||
    flags.includes('vpn_proxy_detected') ||
    flags.includes('bot_signal') ||
    flags.includes('fake_name') ||
    (booking.isFirstTimeUser && booking.totalAmount > 2000)

  // Suggest actions based on risk
  const suggestedActions = getSuggestedActions(finalScore, flags, booking)

  return {
    score: finalScore,
    level,
    flags,
    factors,
    requiresManualReview,
    suggestedActions
  }
}

/**
 * Analyze guest name for suspicious patterns
 */
function analyzeGuestName(name: string): {
  suspicious: boolean
  reason: string
  score: number
  severity: 'info' | 'low' | 'medium' | 'high' | 'critical'
  flags: string[]
} {
  const flags: string[] = []
  let score = 0
  let reason = ''
  let severity: 'info' | 'low' | 'medium' | 'high' | 'critical' = 'info'

  // Check for obviously fake names
  const fakeNames = ['test', 'asdf', 'qwerty', 'abc', 'xxx', 'fake', 'none', 'na', 'no name']
  const lowerName = name.toLowerCase().trim()
  
  if (fakeNames.some(fake => lowerName.includes(fake))) {
    flags.push('fake_name')
    score = 30
    reason = 'Possibly fake name detected'
    severity = 'high'
    return { suspicious: true, reason, score, severity, flags }
  }

  // Check for single character repeated
  if (/^(.)\1+$/.test(name.replace(/\s/g, ''))) {
    flags.push('repeated_character_name')
    score = 25
    reason = 'Name contains only repeated characters'
    severity = 'high'
    return { suspicious: true, reason, score, severity, flags }
  }

  // Check for numbers in name
  if (/\d/.test(name)) {
    flags.push('numbers_in_name')
    score = 15
    reason = 'Name contains numbers'
    severity = 'medium'
    return { suspicious: true, reason, score, severity, flags }
  }

  // Check for too short name (less than 3 characters total)
  if (name.replace(/\s/g, '').length < 3) {
    flags.push('very_short_name')
    score = 20
    reason = 'Name too short'
    severity = 'medium'
    return { suspicious: true, reason, score, severity, flags }
  }

  // Check for special characters (except common ones)
  if (/[^a-zA-Z\s\-\.'àáäâèéëêìíïîòóöôùúüûñç]/i.test(name)) {
    flags.push('special_characters_name')
    score = 10
    reason = 'Unusual special characters in name'
    severity = 'low'
    return { suspicious: true, reason, score, severity, flags }
  }

  // Check for all caps or all lowercase (suspicious for formal booking)
  if (name === name.toUpperCase() || name === name.toLowerCase()) {
    flags.push('improper_case_name')
    score = 5
    reason = 'Name not properly capitalized'
    severity = 'info'
    return { suspicious: true, reason, score, severity, flags }
  }

  return { suspicious: false, reason: '', score: 0, severity: 'info', flags: [] }
}

/**
 * Detect country from location string (simplified)
 */
function detectCountryFromLocation(location: string): string | null {
  const locationLower = location.toLowerCase()
  
  // Simple detection based on common location strings
  if (locationLower.includes('usa') || locationLower.includes('united states') || 
      locationLower.includes('america')) return 'US'
  if (locationLower.includes('uk') || locationLower.includes('united kingdom') || 
      locationLower.includes('britain')) return 'GB'
  if (locationLower.includes('canada')) return 'CA'
  if (locationLower.includes('australia')) return 'AU'
  if (locationLower.includes('france')) return 'FR'
  if (locationLower.includes('germany')) return 'DE'
  if (locationLower.includes('spain')) return 'ES'
  if (locationLower.includes('italy')) return 'IT'
  
  // Check for US state codes
  const usStates = ['al', 'ak', 'az', 'ar', 'ca', 'co', 'ct', 'de', 'fl', 'ga', 
                    'hi', 'id', 'il', 'in', 'ia', 'ks', 'ky', 'la', 'me', 'md',
                    'ma', 'mi', 'mn', 'ms', 'mo', 'mt', 'ne', 'nv', 'nh', 'nj',
                    'nm', 'ny', 'nc', 'nd', 'oh', 'ok', 'or', 'pa', 'ri', 'sc',
                    'sd', 'tn', 'tx', 'ut', 'vt', 'va', 'wa', 'wv', 'wi', 'wy']
  
  const words = locationLower.split(/[\s,]+/)
  if (words.some(word => usStates.includes(word))) return 'US'
  
  return null
}

/**
 * Get suggested actions based on risk assessment
 */
function getSuggestedActions(score: number, flags: string[], booking: BookingData): string[] {
  const actions: string[] = []

  if (score >= 70) {
    actions.push('Require manual review before approval')
    actions.push('Request additional verification documents')
    actions.push('Consider requiring larger security deposit')
  } else if (score >= 50) {
    actions.push('Flag for enhanced review')
    actions.push('Verify phone number via SMS')
    actions.push('Check previous booking history carefully')
  } else if (score >= 30) {
    actions.push('Standard verification process')
    actions.push('Monitor for unusual activity')
  }

  // Specific flag-based actions
  if (flags.includes('disposable_domain')) {
    actions.push('Require non-disposable email address')
  }
  
  if (flags.includes('vpn_proxy_detected')) {
    actions.push('Verify actual location matches booking location')
  }
  
  if (flags.includes('bot_signal') || flags.includes('headless_chrome')) {
    actions.push('Block booking - automated bot detected')
  }
  
  if (flags.includes('fake_name')) {
    actions.push('Require government ID verification')
  }
  
  if (flags.includes('first_time_high_value') && booking.totalAmount > 2000) {
    actions.push('Consider payment verification call')
    actions.push('Require comprehensive insurance')
  }
  
  if (flags.includes('very_short_session')) {
    actions.push('Review for potential automated booking')
  }
  
  if (flags.includes('geographic_mismatch')) {
    actions.push('Confirm travel plans with guest')
  }

  return [...new Set(actions)] // Remove duplicates
}

/**
 * Compare risk score with historical average
 */
export function compareWithHistoricalAverage(
  currentScore: number,
  historicalScores: number[]
): {
  percentile: number
  isAnomaly: boolean
  deviationFromMean: number
} {
  if (historicalScores.length === 0) {
    return {
      percentile: 50,
      isAnomaly: false,
      deviationFromMean: 0
    }
  }

  // Calculate mean
  const mean = historicalScores.reduce((a, b) => a + b, 0) / historicalScores.length

  // Calculate standard deviation
  const squaredDiffs = historicalScores.map(score => Math.pow(score - mean, 2))
  const avgSquaredDiff = squaredDiffs.reduce((a, b) => a + b, 0) / historicalScores.length
  const stdDev = Math.sqrt(avgSquaredDiff)

  // Calculate percentile
  const scoresBelow = historicalScores.filter(score => score < currentScore).length
  const percentile = (scoresBelow / historicalScores.length) * 100

  // Calculate deviation from mean
  const deviationFromMean = currentScore - mean

  // Check if anomaly (more than 2 standard deviations from mean)
  const isAnomaly = Math.abs(deviationFromMean) > (2 * stdDev)

  return {
    percentile: Math.round(percentile),
    isAnomaly,
    deviationFromMean: Math.round(deviationFromMean)
  }
}

/**
 * Calculate velocity risk (multiple bookings from same source)
 */
export function calculateVelocityRisk(
  recentBookings: Array<{
    fingerprint: string
    ipAddress: string
    email: string
    timestamp: number
  }>,
  currentFingerprint: string,
  currentIp: string,
  currentEmail: string
): {
  velocityScore: number
  velocityFlags: string[]
} {
  const now = Date.now()
  const oneHourAgo = now - (60 * 60 * 1000)
  const oneDayAgo = now - (24 * 60 * 60 * 1000)
  
  let velocityScore = 0
  const velocityFlags: string[] = []

  // Count bookings in last hour
  const lastHourBookings = recentBookings.filter(b => b.timestamp > oneHourAgo)
  const sameDeviceLastHour = lastHourBookings.filter(b => b.fingerprint === currentFingerprint).length
  const sameIpLastHour = lastHourBookings.filter(b => b.ipAddress === currentIp).length

  if (sameDeviceLastHour > 1) {
    velocityScore += sameDeviceLastHour * 15
    velocityFlags.push(`${sameDeviceLastHour}_bookings_same_device_last_hour`)
  }

  if (sameIpLastHour > 2) {
    velocityScore += sameIpLastHour * 10
    velocityFlags.push(`${sameIpLastHour}_bookings_same_ip_last_hour`)
  }

  // Count bookings in last day
  const lastDayBookings = recentBookings.filter(b => b.timestamp > oneDayAgo)
  const sameDeviceLastDay = lastDayBookings.filter(b => b.fingerprint === currentFingerprint).length
  
  if (sameDeviceLastDay > 3) {
    velocityScore += sameDeviceLastDay * 5
    velocityFlags.push(`${sameDeviceLastDay}_bookings_same_device_last_day`)
  }

  // Check for email variations (same domain, different usernames)
  const emailDomain = currentEmail.split('@')[1]
  const sameEmailDomain = lastDayBookings.filter(b => 
    b.email.split('@')[1] === emailDomain && b.email !== currentEmail
  ).length
  
  if (sameEmailDomain > 2) {
    velocityScore += sameEmailDomain * 8
    velocityFlags.push(`multiple_emails_same_domain`)
  }

  return { velocityScore: Math.min(50, velocityScore), velocityFlags }
}