// app/lib/mileage/rules.ts

export interface UsageRule {
  maxGap: number
  warningThreshold: number
  criticalThreshold: number
  description: string
  revenueImpact: string
  insuranceNote: string
  taxImplication?: string
}

export const USAGE_RULES: Record<string, UsageRule> = {
  'Rental': {
    maxGap: 15,
    warningThreshold: 16,
    criticalThreshold: 50,
    description: 'Rental Only - Vehicle strictly for rental business',
    revenueImpact: 'Eligible for best insurance rates',
    insuranceNote: 'Personal use voids coverage. All mileage must be rental-related.',
    taxImplication: '100% business deduction eligible'
  },
  'Personal': {
    maxGap: 500,
    warningThreshold: 501,
    criticalThreshold: 1000,
    description: 'Mixed Use - Rental and personal driving allowed',
    revenueImpact: 'Standard insurance rates apply',
    insuranceNote: 'Coverage applies to both rental and personal use up to 500 miles between rentals.',
    taxImplication: 'Partial business deduction based on rental vs personal ratio' // ✅ ADDED
  },
  'Business': {
    maxGap: 300,
    warningThreshold: 301,
    criticalThreshold: 750,
    description: 'Commercial Use - Business errands between rentals',
    revenueImpact: 'Commercial insurance rates',
    insuranceNote: 'Business mileage allowed for car maintenance, cleaning, and delivery.',
    taxImplication: '100% business deduction for all documented business miles' // ✅ ADDED
  }
}

export interface MileageGapSeverity {
  level: 'NORMAL' | 'WARNING' | 'CRITICAL' | 'VIOLATION'
  color: string
  textColor: string
  bgColor: string
  borderColor: string
  icon: string
  message: string
}

export function getMileageGapSeverity(
  gap: number,
  primaryUse: string
): MileageGapSeverity {
  const rule = USAGE_RULES[primaryUse] || USAGE_RULES['Rental']
  
  if (gap <= rule.maxGap) {
    return {
      level: 'NORMAL',
      color: 'green',
      textColor: 'text-green-600 dark:text-green-400',
      bgColor: 'bg-green-50 dark:bg-green-900/20',
      borderColor: 'border-green-200 dark:border-green-800',
      icon: 'IoCheckmarkCircleOutline',
      message: `Within ${rule.maxGap} mile limit`
    }
  }
  
  if (gap <= rule.warningThreshold) {
    return {
      level: 'WARNING',
      color: 'yellow',
      textColor: 'text-yellow-600 dark:text-yellow-400',
      bgColor: 'bg-yellow-50 dark:bg-yellow-900/20',
      borderColor: 'border-yellow-200 dark:border-yellow-800',
      icon: 'IoWarningOutline',
      message: `Exceeds ${rule.maxGap} mile limit - requires explanation`
    }
  }
  
  if (gap <= rule.criticalThreshold) {
    return {
      level: 'CRITICAL',
      color: 'orange',
      textColor: 'text-orange-600 dark:text-orange-400',
      bgColor: 'bg-orange-50 dark:bg-orange-900/20',
      borderColor: 'border-orange-200 dark:border-orange-800',
      icon: 'IoAlertCircleOutline',
      message: `Significant gap - may affect insurance claims`
    }
  }
  
  return {
    level: 'VIOLATION',
    color: 'red',
    textColor: 'text-red-600 dark:text-red-400',
    bgColor: 'bg-red-50 dark:bg-red-900/20',
    borderColor: 'border-red-200 dark:border-red-800',
    icon: 'IoCloseCircleOutline',
    message: `Severe violation - insurance coverage at risk`
  }
}

export interface ComplianceScore {
  score: number
  status: 'EXCELLENT' | 'GOOD' | 'FAIR' | 'POOR' | 'CRITICAL'
  color: string
  recommendations: string[]
}

export function calculateComplianceScore(
  totalGaps: number,
  warningGaps: number,
  criticalGaps: number,
  violationGaps: number,
  totalTrips: number
): ComplianceScore {
  // Base score starts at 100
  let score = 100
  
  // Deduct points based on severity
  score -= warningGaps * 5
  score -= criticalGaps * 10
  score -= violationGaps * 20
  
  // Bonus for clean record
  if (totalGaps === 0 && totalTrips > 10) {
    score = Math.min(100, score + 5)
  }
  
  // Ensure score stays within bounds
  score = Math.max(0, Math.min(100, score))
  
  const recommendations: string[] = []
  
  if (violationGaps > 0) {
    recommendations.push('Urgent: Address violation-level mileage gaps immediately')
  }
  if (criticalGaps > 0) {
    recommendations.push('Document reasons for large mileage gaps')
  }
  if (warningGaps > 2) {
    recommendations.push('Consider switching to "Personal" use for more flexibility')
  }
  if (score === 100) {
    recommendations.push('Excellent compliance - maintain current practices')
  }
  
  let status: ComplianceScore['status']
  let color: string
  
  if (score >= 95) {
    status = 'EXCELLENT'
    color = 'green'
  } else if (score >= 85) {
    status = 'GOOD'
    color = 'blue'
  } else if (score >= 70) {
    status = 'FAIR'
    color = 'yellow'
  } else if (score >= 50) {
    status = 'POOR'
    color = 'orange'
  } else {
    status = 'CRITICAL'
    color = 'red'
  }
  
  return {
    score,
    status,
    color,
    recommendations
  }
}

export function formatMileageGap(miles: number): string {
  if (miles < 0) return 'Invalid reading'
  if (miles === 0) return 'No gap'
  if (miles === 1) return '1 mile'
  return `${miles.toLocaleString()} miles`
}

export function getUsageRecommendation(
  currentUsage: string,
  averageGap: number
): string | null {
  const rule = USAGE_RULES[currentUsage]
  
  if (!rule) return null
  
  // If consistently over the limit, suggest changing usage type
  if (currentUsage === 'Rental' && averageGap > 50) {
    return 'Your average mileage gap suggests personal use. Consider switching to "Personal" mode for better compliance.'
  }
  
  if (currentUsage === 'Personal' && averageGap < 15) {
    return 'Your low mileage gaps qualify for "Rental Only" mode, which offers better insurance rates.'
  }
  
  if (currentUsage === 'Business' && averageGap > 500) {
    return 'High mileage gaps detected. Ensure all miles are business-related and documented.'
  }
  
  return null
}