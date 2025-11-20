// app/lib/mileage/forensics.ts

import { USAGE_RULES, getMileageGapSeverity } from './rules'

export interface MileageGap {
  bookingId: string
  bookingCode: string
  tripEndDate: Date
  tripEndMileage: number
  nextTripStartDate: Date
  nextTripStartMileage: number
  gapMiles: number
  gapDays: number
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'VIOLATION'
  flagged: boolean
  explanation?: string
}

export interface MileageAnomaly {
  type: 'REVERSE' | 'EXCESSIVE_GAP' | 'IMPOSSIBLE_SPEED' | 'PATTERN_CHANGE'
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  description: string
  detectedAt: Date
  mileageReported: number
  mileageExpected: number
  bookingId?: string
  requiresInvestigation: boolean
}

export interface ForensicAnalysis {
  gaps: MileageGap[]
  anomalies: MileageAnomaly[]
  totalMileage: number
  rentalMileage: number
  unaccountedMileage: number
  averageGapSize: number
  maxGap: number
  complianceRate: number
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  insuranceImpact: string
  recommendations: string[]
}

export function analyzeBookingMileage(
  bookings: Array<{
    id: string
    bookingCode: string
    startDate: Date
    endDate: Date
    startMileage: number | null
    endMileage: number | null
    status: string
  }>,
  currentMileage: number,
  primaryUse: string
): ForensicAnalysis {
  const gaps: MileageGap[] = []
  const anomalies: MileageAnomaly[] = []
  
  // Sort bookings by end date
  const sortedBookings = bookings
    .filter(b => b.status === 'COMPLETED' && b.endMileage !== null)
    .sort((a, b) => new Date(a.endDate).getTime() - new Date(b.endDate).getTime())
  
  let totalRentalMileage = 0
  let previousBooking = null
  
  for (const booking of sortedBookings) {
    if (!booking.startMileage || !booking.endMileage) continue
    
    // Calculate rental mileage
    const rentalMiles = booking.endMileage - booking.startMileage
    totalRentalMileage += rentalMiles
    
    // Check for reverse mileage
    if (rentalMiles < 0) {
      anomalies.push({
        type: 'REVERSE',
        severity: 'CRITICAL',
        description: `Odometer went backwards during rental ${booking.bookingCode}`,
        detectedAt: new Date(),
        mileageReported: booking.endMileage,
        mileageExpected: booking.startMileage,
        bookingId: booking.id,
        requiresInvestigation: true
      })
    }
    
    // Check gap from previous booking
    if (previousBooking && previousBooking.endMileage) {
      const gapMiles = booking.startMileage - previousBooking.endMileage
      const gapDays = Math.floor(
        (new Date(booking.startDate).getTime() - new Date(previousBooking.endDate).getTime()) 
        / (1000 * 60 * 60 * 24)
      )
      
      const severity = getMileageGapSeverity(gapMiles, primaryUse)
      
      gaps.push({
        bookingId: previousBooking.id,
        bookingCode: previousBooking.bookingCode,
        tripEndDate: new Date(previousBooking.endDate),
        tripEndMileage: previousBooking.endMileage,
        nextTripStartDate: new Date(booking.startDate),
        nextTripStartMileage: booking.startMileage,
        gapMiles,
        gapDays,
        severity: severity.level,
        flagged: severity.level !== 'NORMAL'
      })
      
      // Check for impossible speed
      if (gapDays > 0) {
        const milesPerDay = gapMiles / gapDays
        if (milesPerDay > 500) {
          anomalies.push({
            type: 'IMPOSSIBLE_SPEED',
            severity: 'HIGH',
            description: `${milesPerDay.toFixed(0)} miles/day between bookings - excessive driving detected`,
            detectedAt: new Date(),
            mileageReported: booking.startMileage,
            mileageExpected: previousBooking.endMileage,
            bookingId: booking.id,
            requiresInvestigation: true
          })
        }
      }
    }
    
    previousBooking = booking
  }
  
  // Check gap from last booking to current mileage
  if (previousBooking && previousBooking.endMileage && currentMileage) {
    const finalGap = currentMileage - previousBooking.endMileage
    const daysSinceLastTrip = Math.floor(
      (Date.now() - new Date(previousBooking.endDate).getTime()) 
      / (1000 * 60 * 60 * 24)
    )
    
    const severity = getMileageGapSeverity(finalGap, primaryUse)
    
    if (severity.level !== 'NORMAL') {
      gaps.push({
        bookingId: previousBooking.id,
        bookingCode: previousBooking.bookingCode,
        tripEndDate: new Date(previousBooking.endDate),
        tripEndMileage: previousBooking.endMileage,
        nextTripStartDate: new Date(),
        nextTripStartMileage: currentMileage,
        gapMiles: finalGap,
        gapDays: daysSinceLastTrip,
        severity: severity.level,
        flagged: true,
        explanation: 'Current odometer reading'
      })
    }
  }
  
  // Calculate metrics
  const totalGaps = gaps.length
  const flaggedGaps = gaps.filter(g => g.flagged).length
  const averageGapSize = gaps.length > 0 
    ? gaps.reduce((sum, g) => sum + g.gapMiles, 0) / gaps.length 
    : 0
  const maxGap = gaps.length > 0 
    ? Math.max(...gaps.map(g => g.gapMiles))
    : 0
  
  const unaccountedMileage = gaps.reduce((sum, g) => sum + g.gapMiles, 0)
  const complianceRate = totalGaps > 0 
    ? ((totalGaps - flaggedGaps) / totalGaps) * 100 
    : 100
  
  // Determine risk level
  let riskLevel: ForensicAnalysis['riskLevel'] = 'LOW'
  if (anomalies.some(a => a.severity === 'CRITICAL')) {
    riskLevel = 'CRITICAL'
  } else if (gaps.some(g => g.severity === 'VIOLATION')) {
    riskLevel = 'HIGH'
  } else if (gaps.filter(g => g.severity === 'CRITICAL').length > 2) {
    riskLevel = 'HIGH'
  } else if (gaps.filter(g => g.severity === 'WARNING').length > 5) {
    riskLevel = 'MEDIUM'
  }
  
  // Generate insurance impact statement
  let insuranceImpact = 'No impact on coverage'
  if (riskLevel === 'CRITICAL') {
    insuranceImpact = 'Coverage may be denied for claims. Immediate action required.'
  } else if (riskLevel === 'HIGH') {
    insuranceImpact = 'Claims will face additional scrutiny. Documentation required.'
  } else if (riskLevel === 'MEDIUM') {
    insuranceImpact = 'Minor impact. Maintain documentation for all non-rental miles.'
  }
  
  // Generate recommendations
  const recommendations: string[] = []
  
  if (primaryUse === 'Rental' && averageGapSize > 30) {
    recommendations.push('Consider switching to "Personal" or "Business" use for more flexibility')
  }
  
  if (anomalies.length > 0) {
    recommendations.push('Address mileage anomalies immediately to maintain coverage')
  }
  
  if (flaggedGaps > 3) {
    recommendations.push('Document reasons for all mileage gaps over threshold')
  }
  
  if (complianceRate < 80) {
    recommendations.push('Improve trip logging to maintain compliance')
  }
  
  if (recommendations.length === 0 && complianceRate === 100) {
    recommendations.push('Excellent mileage tracking - maintain current practices')
  }
  
  return {
    gaps,
    anomalies,
    totalMileage: currentMileage || 0,
    rentalMileage: totalRentalMileage,
    unaccountedMileage,
    averageGapSize: Math.round(averageGapSize),
    maxGap,
    complianceRate: Math.round(complianceRate),
    riskLevel,
    insuranceImpact,
    recommendations
  }
}

export function detectMileagePatternChange(
  historicalGaps: number[],
  recentGaps: number[]
): MileageAnomaly | null {
  if (historicalGaps.length < 5 || recentGaps.length < 3) {
    return null
  }
  
  const historicalAvg = historicalGaps.reduce((a, b) => a + b, 0) / historicalGaps.length
  const recentAvg = recentGaps.reduce((a, b) => a + b, 0) / recentGaps.length
  
  const changeRatio = recentAvg / historicalAvg
  
  if (changeRatio > 3) {
    return {
      type: 'PATTERN_CHANGE',
      severity: 'MEDIUM',
      description: `Recent mileage gaps are ${changeRatio.toFixed(1)}x higher than historical average`,
      detectedAt: new Date(),
      mileageReported: Math.round(recentAvg),
      mileageExpected: Math.round(historicalAvg),
      requiresInvestigation: true
    }
  }
  
  return null
}

export function generateMileageReport(analysis: ForensicAnalysis): string {
  const lines = [
    `Mileage Forensic Report`,
    `========================`,
    ``,
    `Total Vehicle Mileage: ${analysis.totalMileage.toLocaleString()} miles`,
    `Rental Mileage: ${analysis.rentalMileage.toLocaleString()} miles`,
    `Unaccounted Mileage: ${analysis.unaccountedMileage.toLocaleString()} miles`,
    ``,
    `Compliance Rate: ${analysis.complianceRate}%`,
    `Risk Level: ${analysis.riskLevel}`,
    `Average Gap Size: ${analysis.averageGapSize} miles`,
    `Maximum Gap: ${analysis.maxGap} miles`,
    ``,
    `Insurance Impact: ${analysis.insuranceImpact}`,
    ``,
    `Recommendations:`,
    ...analysis.recommendations.map(r => `• ${r}`),
    ``,
    `Anomalies Detected: ${analysis.anomalies.length}`,
    ...analysis.anomalies.map(a => `• [${a.severity}] ${a.description}`)
  ]
  
  return lines.join('\n')
}