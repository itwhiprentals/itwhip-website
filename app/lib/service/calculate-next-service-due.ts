// app/lib/service/calculate-next-service-due.ts

import { ServiceType } from '@prisma/client'

/**
 * Service interval configurations
 * Based on industry standards and manufacturer recommendations
 */
export const SERVICE_INTERVALS = {
  [ServiceType.OIL_CHANGE]: {
    miles: 5000,        // Every 5,000 miles
    days: 180,          // OR every 6 months
    description: 'Oil Change'
  },
  [ServiceType.STATE_INSPECTION]: {
    miles: null,        // Not mileage-based
    days: 365,          // Annual inspection
    description: 'State Inspection'
  },
  [ServiceType.TIRE_ROTATION]: {
    miles: 7500,        // Every 7,500 miles
    days: 180,          // OR every 6 months
    description: 'Tire Rotation'
  },
  [ServiceType.BRAKE_CHECK]: {
    miles: 15000,       // Every 15,000 miles
    days: 365,          // OR every 12 months
    description: 'Brake Inspection'
  },
  [ServiceType.FLUID_CHECK]: {
    miles: 10000,       // Every 10,000 miles
    days: 180,          // OR every 6 months
    description: 'Fluid Service'
  },
  [ServiceType.BATTERY_CHECK]: {
    miles: null,        // Not mileage-based
    days: 365,          // Annual check
    description: 'Battery Check'
  },
  [ServiceType.AIR_FILTER]: {
    miles: 15000,       // Every 15,000 miles
    days: 365,          // OR every 12 months
    description: 'Air Filter Replacement'
  },
  [ServiceType.MAJOR_SERVICE_30K]: {
    miles: 30000,       // At 30k miles
    days: null,         // Not time-based
    description: '30,000 Mile Service'
  },
  [ServiceType.MAJOR_SERVICE_60K]: {
    miles: 60000,       // At 60k miles
    days: null,         // Not time-based
    description: '60,000 Mile Service'
  },
  [ServiceType.MAJOR_SERVICE_90K]: {
    miles: 90000,       // At 90k miles
    days: null,         // Not time-based
    description: '90,000 Mile Service'
  },
  [ServiceType.CUSTOM]: {
    miles: null,        // User-defined
    days: null,         // User-defined
    description: 'Custom Service'
  }
} as const

/**
 * Result of next service calculation
 */
export interface NextServiceDue {
  nextServiceDue: Date | null
  nextServiceMileage: number | null
  intervalDays: number | null
  intervalMiles: number | null
  basedOn: 'mileage' | 'time' | 'both' | 'manual'
}

/**
 * Calculate next service due date based on service type
 */
export function calculateNextServiceDue(
  serviceType: ServiceType,
  serviceDate: Date | string,
  mileageAtService: number
): NextServiceDue {
  const interval = SERVICE_INTERVALS[serviceType]
  const serviceDateObj = new Date(serviceDate)
  
  // For CUSTOM services, return nulls (user must specify manually)
  if (serviceType === ServiceType.CUSTOM) {
    return {
      nextServiceDue: null,
      nextServiceMileage: null,
      intervalDays: null,
      intervalMiles: null,
      basedOn: 'manual'
    }
  }
  
  let nextServiceDue: Date | null = null
  let nextServiceMileage: number | null = null
  let basedOn: 'mileage' | 'time' | 'both' | 'manual' = 'manual'
  
  // Calculate next due by date (if interval has days)
  if (interval.days) {
    nextServiceDue = new Date(serviceDateObj)
    nextServiceDue.setDate(nextServiceDue.getDate() + interval.days)
  }
  
  // Calculate next due by mileage (if interval has miles)
  if (interval.miles) {
    nextServiceMileage = mileageAtService + interval.miles
  }
  
  // Determine what the calculation is based on
  if (interval.days && interval.miles) {
    basedOn = 'both'
  } else if (interval.days) {
    basedOn = 'time'
  } else if (interval.miles) {
    basedOn = 'mileage'
  }
  
  return {
    nextServiceDue,
    nextServiceMileage,
    intervalDays: interval.days,
    intervalMiles: interval.miles,
    basedOn
  }
}

/**
 * Calculate estimated next service date based on average usage
 */
export function estimateNextServiceDate(
  currentMileage: number,
  mileageAtService: number,
  serviceDate: Date | string,
  averageMilesPerDay: number = 40 // Default: 40 miles/day
): Date | null {
  const milesSinceService = currentMileage - mileageAtService
  const serviceDateObj = new Date(serviceDate)
  const now = new Date()
  
  // Calculate days since service
  const daysSinceService = Math.floor(
    (now.getTime() - serviceDateObj.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  // Calculate actual miles per day
  const actualMilesPerDay = daysSinceService > 0 
    ? milesSinceService / daysSinceService 
    : averageMilesPerDay
  
  // Use the calculated rate, but cap it at reasonable limits
  const milesPerDay = Math.min(Math.max(actualMilesPerDay, 20), 200)
  
  return new Date() // Placeholder - can be enhanced with more complex calculations
}

/**
 * Check if service is overdue
 */
export function isServiceOverdue(
  nextServiceDue: Date | null,
  nextServiceMileage: number | null,
  currentDate: Date = new Date(),
  currentMileage: number = 0
): {
  isOverdue: boolean
  overdueByDays: number
  overdueByMiles: number
  reason: string | null
} {
  let isOverdue = false
  let overdueByDays = 0
  let overdueByMiles = 0
  let reason: string | null = null
  
  // Check if overdue by date
  if (nextServiceDue) {
    const dueDateObj = new Date(nextServiceDue)
    if (currentDate > dueDateObj) {
      isOverdue = true
      overdueByDays = Math.floor(
        (currentDate.getTime() - dueDateObj.getTime()) / (1000 * 60 * 60 * 24)
      )
      reason = `Overdue by ${overdueByDays} day${overdueByDays !== 1 ? 's' : ''}`
    }
  }
  
  // Check if overdue by mileage
  if (nextServiceMileage && currentMileage > nextServiceMileage) {
    isOverdue = true
    overdueByMiles = currentMileage - nextServiceMileage
    
    if (reason) {
      reason += ` and ${overdueByMiles.toLocaleString()} mile${overdueByMiles !== 1 ? 's' : ''}`
    } else {
      reason = `Overdue by ${overdueByMiles.toLocaleString()} mile${overdueByMiles !== 1 ? 's' : ''}`
    }
  }
  
  return {
    isOverdue,
    overdueByDays,
    overdueByMiles,
    reason
  }
}

/**
 * Get days until next service
 */
export function getDaysUntilService(
  nextServiceDue: Date | null,
  currentDate: Date = new Date()
): number | null {
  if (!nextServiceDue) return null
  
  const dueDateObj = new Date(nextServiceDue)
  const diffTime = dueDateObj.getTime() - currentDate.getTime()
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24))
  
  return diffDays
}

/**
 * Get miles until next service
 */
export function getMilesUntilService(
  nextServiceMileage: number | null,
  currentMileage: number
): number | null {
  if (!nextServiceMileage) return null
  
  return nextServiceMileage - currentMileage
}

/**
 * Format next service due as human-readable string
 */
export function formatNextServiceDue(
  nextServiceDue: Date | null,
  nextServiceMileage: number | null,
  basedOn: 'mileage' | 'time' | 'both' | 'manual'
): string {
  if (basedOn === 'manual') {
    return 'User-specified'
  }
  
  const parts: string[] = []
  
  if (nextServiceDue && (basedOn === 'time' || basedOn === 'both')) {
    parts.push(nextServiceDue.toLocaleDateString())
  }
  
  if (nextServiceMileage && (basedOn === 'mileage' || basedOn === 'both')) {
    parts.push(`${nextServiceMileage.toLocaleString()} miles`)
  }
  
  if (parts.length === 0) return 'Not specified'
  
  return parts.join(' or ')
}

/**
 * Validate if manual override is reasonable
 */
export function validateManualOverride(
  serviceType: ServiceType,
  manualNextDue: Date | null,
  manualNextMileage: number | null,
  serviceDate: Date | string,
  mileageAtService: number
): {
  isReasonable: boolean
  warning: string | null
} {
  const interval = SERVICE_INTERVALS[serviceType]
  const serviceDateObj = new Date(serviceDate)
  
  // Custom services don't have standard intervals
  if (serviceType === ServiceType.CUSTOM) {
    return { isReasonable: true, warning: null }
  }
  
  // Check date override
  if (manualNextDue && interval.days) {
    const daysDiff = Math.floor(
      (new Date(manualNextDue).getTime() - serviceDateObj.getTime()) / (1000 * 60 * 60 * 24)
    )
    
    const expectedDays = interval.days
    const deviationPercent = Math.abs((daysDiff - expectedDays) / expectedDays) * 100
    
    if (deviationPercent > 50) {
      return {
        isReasonable: false,
        warning: `Next service date differs significantly from recommended interval (${expectedDays} days). You specified ${daysDiff} days.`
      }
    }
  }
  
  // Check mileage override
  if (manualNextMileage && interval.miles) {
    const milesDiff = manualNextMileage - mileageAtService
    const expectedMiles = interval.miles
    const deviationPercent = Math.abs((milesDiff - expectedMiles) / expectedMiles) * 100
    
    if (deviationPercent > 50) {
      return {
        isReasonable: false,
        warning: `Next service mileage differs significantly from recommended interval (${expectedMiles.toLocaleString()} miles). You specified ${milesDiff.toLocaleString()} miles.`
      }
    }
  }
  
  return { isReasonable: true, warning: null }
}

/**
 * Get service interval description
 */
export function getServiceIntervalDescription(serviceType: ServiceType): string {
  const interval = SERVICE_INTERVALS[serviceType]
  const parts: string[] = []
  
  if (interval.miles) {
    parts.push(`every ${interval.miles.toLocaleString()} miles`)
  }
  
  if (interval.days) {
    const months = Math.floor(interval.days / 30)
    if (months >= 1) {
      parts.push(`every ${months} month${months !== 1 ? 's' : ''}`)
    } else {
      parts.push(`every ${interval.days} days`)
    }
  }
  
  if (parts.length === 0) {
    return 'As needed'
  }
  
  return parts.join(' or ')
}

/**
 * Format days remaining in a human-readable way
 */
export function formatDaysRemaining(daysRemaining: number): string {
  if (daysRemaining < 0) {
    const overdue = Math.abs(daysRemaining)
    if (overdue === 1) return '1 day overdue'
    if (overdue < 7) return `${overdue} days overdue`
    if (overdue < 30) return `${Math.floor(overdue / 7)} weeks overdue`
    return `${Math.floor(overdue / 30)} months overdue`
  }
  
  if (daysRemaining === 0) return 'Due today'
  if (daysRemaining === 1) return 'Due tomorrow'
  if (daysRemaining < 7) return `Due in ${daysRemaining} days`
  if (daysRemaining < 30) return `Due in ${Math.floor(daysRemaining / 7)} weeks`
  if (daysRemaining < 365) return `Due in ${Math.floor(daysRemaining / 30)} months`
  
  return `Due in ${Math.floor(daysRemaining / 365)} years`
}

/**
 * Format miles remaining in a human-readable way
 */
export function formatMilesRemaining(milesRemaining: number): string {
  if (milesRemaining < 0) {
    return `${Math.abs(milesRemaining).toLocaleString()} miles overdue`
  }
  
  if (milesRemaining === 0) return 'Due now'
  
  return `${milesRemaining.toLocaleString()} miles remaining`
}

/**
 * Get service type display name
 */
export function getServiceTypeDisplayName(serviceType: ServiceType): string {
  return SERVICE_INTERVALS[serviceType]?.description || serviceType
}