// app/lib/esg/esg-helpers.ts
/**
 * ESG Helper Utilities
 * Shared functions for ESG calculation system
 */

// ============================================================================
// SCORE UTILITIES
// ============================================================================

/**
 * Get color class for ESG score
 */
export function getScoreColor(score: number): string {
  if (score >= 85) return 'text-green-600 dark:text-green-400'
  if (score >= 70) return 'text-yellow-600 dark:text-yellow-400'
  if (score >= 50) return 'text-orange-600 dark:text-orange-400'
  return 'text-red-600 dark:text-red-400'
}

/**
 * Get background color class for ESG score
 */
export function getScoreBgColor(score: number): string {
  if (score >= 85) return 'bg-green-50 dark:bg-green-900/10'
  if (score >= 70) return 'bg-yellow-50 dark:bg-yellow-900/10'
  if (score >= 50) return 'bg-orange-50 dark:bg-orange-900/10'
  return 'bg-red-50 dark:bg-red-900/10'
}

/**
 * Get border color class for ESG score
 */
export function getScoreBorderColor(score: number): string {
  if (score >= 85) return 'border-green-200 dark:border-green-700/50'
  if (score >= 70) return 'border-yellow-200 dark:border-yellow-700/50'
  if (score >= 50) return 'border-orange-200 dark:border-orange-700/50'
  return 'border-red-200 dark:border-red-700/50'
}

/**
 * Get human-readable label for ESG score
 */
export function getScoreLabel(score: number): string {
  if (score >= 95) return 'Outstanding'
  if (score >= 90) return 'Excellent'
  if (score >= 85) return 'Very Good'
  if (score >= 75) return 'Good'
  if (score >= 70) return 'Above Average'
  if (score >= 60) return 'Average'
  if (score >= 50) return 'Fair'
  return 'Needs Improvement'
}

/**
 * Get risk level based on score
 */
export function getRiskLevel(score: number): 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' {
  if (score >= 85) return 'LOW'
  if (score >= 70) return 'MEDIUM'
  if (score >= 50) return 'HIGH'
  return 'CRITICAL'
}

// ============================================================================
// VEHICLE TYPE UTILITIES
// ============================================================================

/**
 * Determine if vehicle is electric
 */
export function isElectricVehicle(fuelType: string): boolean {
  return fuelType.toLowerCase() === 'electric' || fuelType.toLowerCase() === 'ev'
}

/**
 * Determine if vehicle is hybrid
 */
export function isHybridVehicle(fuelType: string): boolean {
  return fuelType.toLowerCase().includes('hybrid')
}

/**
 * Get environmental baseline score for fuel type
 */
export function getEnvironmentalBaselineScore(fuelType: string): number {
  if (isElectricVehicle(fuelType)) return 90 // EV gets high baseline
  if (isHybridVehicle(fuelType)) return 70   // Hybrid gets medium baseline
  return 50 // Gas gets neutral baseline
}

/**
 * Get vehicle category for display
 */
export function getVehicleCategory(fuelType: string): 'EV' | 'HYBRID' | 'GAS' {
  if (isElectricVehicle(fuelType)) return 'EV'
  if (isHybridVehicle(fuelType)) return 'HYBRID'
  return 'GAS'
}

// ============================================================================
// CALCULATION UTILITIES
// ============================================================================

/**
 * Clamp score between 0 and 100
 */
export function clampScore(score: number): number {
  return Math.max(0, Math.min(100, Math.round(score)))
}

/**
 * Calculate weighted average
 */
export function weightedAverage(values: Array<{ value: number; weight: number }>): number {
  const totalWeight = values.reduce((sum, item) => sum + item.weight, 0)
  if (totalWeight === 0) return 0
  
  const weightedSum = values.reduce((sum, item) => sum + (item.value * item.weight), 0)
  return weightedSum / totalWeight
}

/**
 * Calculate percentage safely (avoid division by zero)
 */
export function safePercentage(numerator: number, denominator: number): number {
  if (denominator === 0) return 0
  return (numerator / denominator) * 100
}

/**
 * Calculate rate (e.g., incidents per 100 trips)
 */
export function calculateRate(events: number, total: number, per: number = 100): number {
  if (total === 0) return 0
  return (events / total) * per
}

// ============================================================================
// DATE UTILITIES
// ============================================================================

/**
 * Calculate days between two dates
 */
export function daysBetween(date1: Date, date2: Date): number {
  const diffTime = Math.abs(date2.getTime() - date1.getTime())
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24))
}

/**
 * Check if date is overdue
 */
export function isOverdue(date: Date | null, currentDate: Date = new Date()): boolean {
  if (!date) return false
  return date < currentDate
}

/**
 * Get days until date
 */
export function daysUntil(date: Date | null, currentDate: Date = new Date()): number {
  if (!date) return 0
  return daysBetween(currentDate, date)
}

// ============================================================================
// BADGE UTILITIES
// ============================================================================

/**
 * Check if badge requirements are met
 */
export function checkBadgeEligibility(
  badgeCode: string,
  metrics: {
    score?: number
    trips?: number
    streak?: number
    metricValue?: number
  },
  requirements: {
    requiredScore?: number
    requiredTrips?: number
    requiredStreak?: number
    requiredValue?: number
  }
): boolean {
  if (requirements.requiredScore && (metrics.score || 0) < requirements.requiredScore) {
    return false
  }
  
  if (requirements.requiredTrips && (metrics.trips || 0) < requirements.requiredTrips) {
    return false
  }
  
  if (requirements.requiredStreak && (metrics.streak || 0) < requirements.requiredStreak) {
    return false
  }
  
  if (requirements.requiredValue && (metrics.metricValue || 0) < requirements.requiredValue) {
    return false
  }
  
  return true
}

// ============================================================================
// IMPROVEMENT TIP GENERATORS
// ============================================================================

/**
 * Generate contextual improvement tips based on scores and metrics
 */
export function generateImprovementTips(params: {
  compositeScore: number
  safetyScore: number
  environmentalScore: number
  maintenanceScore: number
  complianceScore: number
  currentStreak: number
  evPercentage: number
  maintenanceOnTime: boolean
  fleetComposition: {
    electric: number
    hybrid: number
    gas: number
  }
}): string[] {
  const tips: string[] = []
  
  // Safety tips
  if (params.safetyScore < 70) {
    tips.push('Focus on incident-free trips to boost your safety score')
  } else if (params.currentStreak < 50) {
    tips.push('Build your incident-free streak - you\'re on track!')
  }
  
  // Environmental tips (contextual based on fleet)
  if (params.fleetComposition.electric === 0 && params.fleetComposition.hybrid === 0) {
    // All gas fleet
    if (params.environmentalScore < 60) {
      tips.push('Consider adding a hybrid vehicle to improve environmental score')
    }
  } else if (params.fleetComposition.electric === 0) {
    // Has hybrid, no EV
    if (params.environmentalScore < 75) {
      tips.push('Adding an electric vehicle would significantly boost your environmental score')
    }
  } else if (params.evPercentage < 0.5) {
    // Has some EVs but less than 50%
    tips.push('Increase EV trip percentage to maximize environmental impact')
  }
  
  // Maintenance tips
  if (!params.maintenanceOnTime) {
    tips.push('Schedule overdue maintenance to improve compliance score')
  } else if (params.maintenanceScore < 80) {
    tips.push('Maintain consistent service schedules across all vehicles')
  }
  
  // Compliance tips
  if (params.complianceScore < 70) {
    tips.push('Respond faster to claims and bookings to improve compliance')
  }
  
  // Overall excellence tip
  if (params.compositeScore >= 90) {
    tips.push('Outstanding performance! Keep up the excellent work')
  } else if (params.compositeScore >= 85) {
    tips.push('Great job! You\'re in the top tier of hosts')
  }
  
  return tips
}

// ============================================================================
// DATA CONFIDENCE UTILITIES
// ============================================================================

/**
 * Calculate data confidence level based on available data points
 */
export function calculateDataConfidence(params: {
  totalTrips: number
  hasInsurance: boolean
  hasMaintenanceRecords: boolean
  vehicleCount: number
}): 'HIGH' | 'MEDIUM' | 'LOW' {
  let score = 0
  
  // Trip volume
  if (params.totalTrips >= 50) score += 4
  else if (params.totalTrips >= 20) score += 3
  else if (params.totalTrips >= 10) score += 2
  else if (params.totalTrips >= 5) score += 1
  
  // Insurance data
  if (params.hasInsurance) score += 2
  
  // Maintenance records
  if (params.hasMaintenanceRecords) score += 2
  
  // Fleet size
  if (params.vehicleCount >= 3) score += 2
  else if (params.vehicleCount >= 2) score += 1
  
  if (score >= 8) return 'HIGH'
  if (score >= 5) return 'MEDIUM'
  return 'LOW'
}

// ============================================================================
// FORMATTING UTILITIES
// ============================================================================

/**
 * Format score with label
 */
export function formatScore(score: number): string {
  return `${score}/100 (${getScoreLabel(score)})`
}

/**
 * Format percentage
 */
export function formatPercentage(value: number): string {
  return `${Math.round(value * 100)}%`
}

/**
 * Format CO2 savings
 */
export function formatCO2Savings(kg: number): string {
  if (kg >= 1000) {
    return `${(kg / 1000).toFixed(1)} tons`
  }
  return `${Math.round(kg)} kg`
}

/**
 * Format mileage
 */
export function formatMileage(miles: number): string {
  return `${miles.toLocaleString()} mi`
}

// ============================================================================
// INDUSTRY BENCHMARKS (Based on Research)
// ============================================================================

/**
* Industry-standard benchmarks for mobility platforms
* Sources: EPA, Mobility Europe averages, peer platforms
*/
export const INDUSTRY_BENCHMARKS = {
safety: {
  excellent: 90,      // Top 10% of hosts
  industryAvg: 75,    // Platform average
  minimum: 60,        // Acceptable threshold
},
environmental: {
  evAdoption: {
    leading: 50,      // 50%+ EV fleet (industry leaders)
    industryAvg: 12,  // Current mobility platform average
    emerging: 5,      // Early adopters
  },
  co2PerMile: {
    excellent: 0.15,  // kg CO2/mile (EV average)
    good: 0.25,       // kg CO2/mile (Hybrid average)
    industryAvg: 0.404, // kg CO2/mile (EPA gas car average)
    poor: 0.50,       // kg CO2/mile (Inefficient vehicles)
  },
  co2Standards: {
    eu2025: 0.0936,   // 93.6g CO2/km = EU regulation target
    mobilityAvg: 0.0863, // 86.3g CO2/km = Mobility Europe average
    privateCarAvg: 0.1127, // 112.7g CO2/km = Private car average
  },
},
incidentFreeRate: {
  elite: 95,          // 95%+ trips incident-free
  good: 90,           // 90%+ trips incident-free
  industryAvg: 85,    // Industry average
  poor: 75,           // Below standard
},
compliance: {
  responseTime: {
    excellent: 2,     // hours
    good: 6,          // hours
    industryAvg: 24,  // hours
    poor: 48,         // hours
  },
  maintenanceAdherence: {
    excellent: 100,   // % on-time
    good: 90,         // % on-time
    industryAvg: 80,  // % on-time
    poor: 70,         // % on-time
  },
},
utilizationRate: {
  excellent: 60,      // 60%+ utilization (top performers)
  industryAvg: 45,    // Platform average
  poor: 30,           // Below standard
},
}

/**
* Compare score to industry average and return detailed comparison
*/
export function compareToIndustry(
score: number,
industryAvg: number
): {
percentDifference: number
isAboveAverage: boolean
label: string
icon: string
} {
const diff = score - industryAvg
const percentDiff = industryAvg > 0 ? Math.round((diff / industryAvg) * 100) : 0

return {
  percentDifference: Math.abs(percentDiff),
  isAboveAverage: diff > 0,
  label: diff > 0 
    ? `${Math.abs(percentDiff)}% above industry average`
    : `${Math.abs(percentDiff)}% below industry average`,
  icon: diff > 0 ? '📈' : '📉'
}
}

/**
* Get benchmark label for a specific metric
*/
export function getBenchmarkLabel(
value: number,
benchmarks: { excellent: number; good: number; industryAvg: number; poor?: number },
isLowerBetter: boolean = false
): 'excellent' | 'good' | 'average' | 'poor' {
if (isLowerBetter) {
  // For metrics like CO2 or response time where lower is better
  if (value <= benchmarks.excellent) return 'excellent'
  if (value <= benchmarks.good) return 'good'
  if (value <= benchmarks.industryAvg) return 'average'
  return 'poor'
} else {
  // For metrics like scores where higher is better
  if (value >= benchmarks.excellent) return 'excellent'
  if (value >= benchmarks.good) return 'good'
  if (value >= benchmarks.industryAvg) return 'average'
  return 'poor'
}
}

// ============================================================================
// CO2 CONVERSION UTILITIES
// ============================================================================

/**
* Convert CO2 savings to trees planted equivalent
* Based on: 1 tree absorbs ~14 kg CO2 per year (EPA)
*/
export function co2ToTrees(kgCO2: number): number {
const CO2_PER_TREE_PER_YEAR = 14 // kg
return Math.round(kgCO2 / CO2_PER_TREE_PER_YEAR)
}

/**
* Convert CO2 to miles driven equivalent (for context)
* Shows how many miles of average car driving = this CO2
*/
export function co2ToMilesDriven(kgCO2: number): number {
const BASELINE_PRIVATE_CAR = 0.404 // kg CO2 per mile
return Math.round(kgCO2 / BASELINE_PRIVATE_CAR)
}

/**
* Format CO2 savings with context (trees, miles, etc.)
*/
export function formatCO2WithContext(kg: number): {
primary: string
trees: string
milesEquivalent: string
} {
const trees = co2ToTrees(kg)
const miles = co2ToMilesDriven(kg)

let primary: string
if (kg >= 1000) {
  primary = `${(kg / 1000).toFixed(1)} tons CO2`
} else {
  primary = `${Math.round(kg)} kg CO2`
}

return {
  primary,
  trees: `${trees} tree${trees !== 1 ? 's' : ''} planted`,
  milesEquivalent: `${miles.toLocaleString()} miles avoided`,
}
}

/**
* Get CO2 impact rating based on kg/mile
*/
export function getCO2ImpactRating(kgPerMile: number): {
rating: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR'
color: string
label: string
} {
const benchmarks = INDUSTRY_BENCHMARKS.environmental.co2PerMile

if (kgPerMile <= benchmarks.excellent) {
  return {
    rating: 'EXCELLENT',
    color: 'text-green-600 dark:text-green-400',
    label: 'Zero/Low Emissions'
  }
} else if (kgPerMile <= benchmarks.good) {
  return {
    rating: 'GOOD',
    color: 'text-yellow-600 dark:text-yellow-400',
    label: 'Efficient Hybrid'
  }
} else if (kgPerMile <= benchmarks.industryAvg) {
  return {
    rating: 'FAIR',
    color: 'text-orange-600 dark:text-orange-400',
    label: 'Average Efficiency'
  }
} else {
  return {
    rating: 'POOR',
    color: 'text-red-600 dark:text-red-400',
    label: 'High Emissions'
  }
}
}

// ============================================================================
// PERCENTILE CALCULATION
// ============================================================================

/**
* Calculate percentile rank (where does this score fall among all hosts)
*/
export function estimatePercentile(score: number): number {
if (score >= 95) return 99 // Top 1%
if (score >= 90) return 95 // Top 5%
if (score >= 85) return 85 // Top 15%
if (score >= 80) return 75 // Top 25%
if (score >= 75) return 60 // Top 40%
if (score >= 70) return 50 // Median
if (score >= 65) return 40
if (score >= 60) return 30
if (score >= 55) return 20
if (score >= 50) return 10
return 5
}

/**
* Get percentile label for display
*/
export function getPercentileLabel(percentile: number): string {
if (percentile >= 99) return 'Top 1% of hosts'
if (percentile >= 95) return 'Top 5% of hosts'
if (percentile >= 90) return 'Top 10% of hosts'
if (percentile >= 75) return 'Top 25% of hosts'
if (percentile >= 50) return 'Above average'
if (percentile >= 25) return 'Average performance'
return 'Below average'
}

// ============================================================================
// ENHANCED IMPROVEMENT TIPS WITH BENCHMARKS
// ============================================================================

/**
* Generate improvement tips with benchmark context
*/
export function generateBenchmarkedImprovementTips(params: {
compositeScore: number
safetyScore: number
environmentalScore: number
avgCO2PerMile?: number
evPercentage: number
responseTimeHours: number
}): Array<{
tip: string
priority: 'high' | 'medium' | 'low'
category: 'safety' | 'environmental' | 'compliance'
benchmarkGap?: number
}> {
const tips: Array<{
  tip: string
  priority: 'high' | 'medium' | 'low'
  category: 'safety' | 'environmental' | 'compliance'
  benchmarkGap?: number
}> = []

// Safety tips
if (params.safetyScore < INDUSTRY_BENCHMARKS.safety.industryAvg) {
  const gap = INDUSTRY_BENCHMARKS.safety.industryAvg - params.safetyScore
  tips.push({
    tip: `Improve safety score by ${Math.round(gap)} points to reach industry average (${INDUSTRY_BENCHMARKS.safety.industryAvg})`,
    priority: 'high',
    category: 'safety',
    benchmarkGap: gap,
  })
}

// Environmental tips
if (params.avgCO2PerMile && params.avgCO2PerMile > INDUSTRY_BENCHMARKS.environmental.co2PerMile.industryAvg) {
  tips.push({
    tip: 'Consider adding more fuel-efficient or electric vehicles to reduce CO2 per mile',
    priority: 'medium',
    category: 'environmental',
  })
}

if (params.evPercentage < INDUSTRY_BENCHMARKS.environmental.evAdoption.industryAvg) {
  tips.push({
    tip: `Add electric vehicles to reach ${INDUSTRY_BENCHMARKS.environmental.evAdoption.industryAvg}% EV fleet (industry average)`,
    priority: 'medium',
    category: 'environmental',
  })
}

// Compliance tips
if (params.responseTimeHours > INDUSTRY_BENCHMARKS.compliance.responseTime.good) {
  tips.push({
    tip: `Reduce response time to under ${INDUSTRY_BENCHMARKS.compliance.responseTime.good} hours for better compliance`,
    priority: 'high',
    category: 'compliance',
  })
}

return tips
}