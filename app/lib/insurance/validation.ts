// app/lib/insurance/validation.ts

import { prisma } from '@/app/lib/database/prisma'
import { RentalHost, RentalBooking } from '@prisma/client'

export interface ValidationResult {
  valid: boolean
  reason?: string
  code?: string
}

export interface ActiveBookingCheck {
  hasActiveBookings: boolean
  activeCount: number
  futureCount: number
  nextAvailableDate: Date | null
  blockingBookings: Array<{
    id: string
    bookingCode: string
    startDate: Date
    endDate: Date
    status: string
  }>
}

/**
 * Check if host has active or future bookings that would block insurance changes
 */
export async function checkActiveBookings(hostId: string): Promise<ActiveBookingCheck> {
  const now = new Date()
  
  // Find all blocking bookings
  const blockingBookings = await prisma.rentalBooking.findMany({
    where: {
      hostId,
      status: {
        in: ['PENDING', 'CONFIRMED', 'ACTIVE', 'IN_PROGRESS'] as any
      },
      OR: [
        // Current bookings (happening now)
        {
          startDate: { lte: now },
          endDate: { gte: now }
        },
        // Future bookings
        {
          startDate: { gt: now }
        }
      ]
    },
    select: {
      id: true,
      bookingCode: true,
      startDate: true,
      endDate: true,
      status: true
    },
    orderBy: {
      endDate: 'desc'
    }
  })
  
  // Separate active vs future
  const activeBookings = blockingBookings.filter(b => 
    b.startDate <= now && b.endDate >= now
  )
  
  const futureBookings = blockingBookings.filter(b => 
    b.startDate > now
  )
  
  // Find next available date (after last booking ends)
  const nextAvailableDate = blockingBookings.length > 0
    ? new Date(Math.max(...blockingBookings.map(b => b.endDate.getTime())))
    : null
  
  return {
    hasActiveBookings: blockingBookings.length > 0,
    activeCount: activeBookings.length,
    futureCount: futureBookings.length,
    nextAvailableDate,
    blockingBookings: blockingBookings.map(b => ({
      id: b.id,
      bookingCode: b.bookingCode,
      startDate: b.startDate,
      endDate: b.endDate,
      status: b.status
    }))
  }
}

/**
 * Validate if host can add a new insurance type
 */
export async function validateNewInsurance(
  hostId: string,
  insuranceType: 'P2P' | 'COMMERCIAL'
): Promise<ValidationResult> {
  const host = await prisma.rentalHost.findUnique({
    where: { id: hostId },
    select: {
      p2pInsuranceProvider: true,
      p2pInsuranceStatus: true,
      commercialInsuranceProvider: true,
      commercialInsuranceStatus: true,
      hostInsuranceProvider: true,
      hostInsuranceStatus: true,
      usingLegacyInsurance: true
    }
  })
  
  if (!host) {
    return { valid: false, reason: 'Host not found', code: 'HOST_NOT_FOUND' }
  }
  
  if (insuranceType === 'P2P') {
    // Check for existing P2P (including legacy)
    const hasP2P = host.p2pInsuranceProvider || 
                   (host.usingLegacyInsurance && host.hostInsuranceProvider)
    
    if (hasP2P) {
      return { 
        valid: false, 
        reason: 'You already have P2P insurance. Delete the existing one before adding new.', 
        code: 'DUPLICATE_P2P' 
      }
    }
  } else {
    // Check for existing Commercial
    if (host.commercialInsuranceProvider) {
      return { 
        valid: false, 
        reason: 'You already have commercial insurance. Delete the existing one before adding new.', 
        code: 'DUPLICATE_COMMERCIAL' 
      }
    }
  }
  
  return { valid: true }
}

/**
 * Validate if insurance can be deleted
 */
export async function validateInsuranceDeletion(
  hostId: string,
  insuranceType: 'P2P' | 'COMMERCIAL'
): Promise<ValidationResult> {
  const host = await prisma.rentalHost.findUnique({
    where: { id: hostId },
    select: {
      p2pInsuranceStatus: true,
      commercialInsuranceStatus: true,
      hostInsuranceStatus: true,
      usingLegacyInsurance: true
    }
  })
  
  if (!host) {
    return { valid: false, reason: 'Host not found', code: 'HOST_NOT_FOUND' }
  }
  
  // Check the status of insurance being deleted
  const status = insuranceType === 'P2P' 
    ? (host.usingLegacyInsurance ? host.hostInsuranceStatus : host.p2pInsuranceStatus)
    : host.commercialInsuranceStatus
  
  // Cannot delete PENDING insurance
  if (status === 'PENDING') {
    return { 
      valid: false, 
      reason: 'Cannot delete insurance while approval is pending. Wait for admin decision.', 
      code: 'PENDING_STATUS' 
    }
  }
  
  // Check for active bookings
  const bookingCheck = await checkActiveBookings(hostId)
  if (bookingCheck.hasActiveBookings) {
    const nextDate = bookingCheck.nextAvailableDate
    return { 
      valid: false, 
      reason: `Cannot delete insurance with ${bookingCheck.activeCount} active and ${bookingCheck.futureCount} future bookings. Available after ${nextDate?.toLocaleDateString()}.`, 
      code: 'ACTIVE_BOOKINGS' 
    }
  }
  
  return { valid: true }
}

/**
 * Validate if insurance can be toggled
 */
export async function validateInsuranceToggle(
  hostId: string,
  targetType: 'P2P' | 'COMMERCIAL'
): Promise<ValidationResult> {
  const host = await prisma.rentalHost.findUnique({
    where: { id: hostId },
    select: {
      p2pInsuranceStatus: true,
      commercialInsuranceStatus: true,
      hostInsuranceStatus: true,
      usingLegacyInsurance: true,
      p2pInsuranceProvider: true,
      commercialInsuranceProvider: true,
      hostInsuranceProvider: true
    }
  })
  
  if (!host) {
    return { valid: false, reason: 'Host not found', code: 'HOST_NOT_FOUND' }
  }
  
  // Check if both insurances exist
  const hasP2P = host.p2pInsuranceProvider || 
                 (host.usingLegacyInsurance && host.hostInsuranceProvider)
  const hasCommercial = !!host.commercialInsuranceProvider
  
  if (!hasP2P || !hasCommercial) {
    return { 
      valid: false, 
      reason: 'You need both P2P and Commercial insurance to toggle between them.', 
      code: 'MISSING_INSURANCE' 
    }
  }
  
  // Check if target insurance is ACTIVE
  const targetStatus = targetType === 'P2P'
    ? (host.usingLegacyInsurance ? host.hostInsuranceStatus : host.p2pInsuranceStatus)
    : host.commercialInsuranceStatus
  
  if (targetStatus !== 'ACTIVE') {
    return { 
      valid: false, 
      reason: `Cannot switch to ${targetType} insurance - it must be ACTIVE status.`, 
      code: 'NOT_ACTIVE' 
    }
  }
  
  // Check for active bookings
  const bookingCheck = await checkActiveBookings(hostId)
  if (bookingCheck.hasActiveBookings) {
    return { 
      valid: false, 
      reason: `Cannot toggle insurance with active bookings. Available after ${bookingCheck.nextAvailableDate?.toLocaleDateString()}.`, 
      code: 'ACTIVE_BOOKINGS' 
    }
  }
  
  return { valid: true }
}

/**
 * Check if host is in cooldown period between changes
 */
export async function checkInsuranceCooldown(
  hostId: string,
  cooldownMinutes: number = 5
): Promise<ValidationResult> {
  const recentActivity = await prisma.activityLog.findFirst({
    where: {
      entityId: hostId,
      entityType: 'HOST',
      action: {
        in: [
          'INSURANCE_DELETED',
          'INSURANCE_TOGGLED',
          'INSURANCE_SUBMITTED',
          'INSURANCE_UPDATED'
        ]
      },
      createdAt: {
        gte: new Date(Date.now() - cooldownMinutes * 60 * 1000)
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  if (recentActivity) {
    const timeRemaining = Math.ceil(
      (cooldownMinutes * 60 * 1000 - (Date.now() - recentActivity.createdAt.getTime())) / 60000
    )
    
    return {
      valid: false,
      reason: `Please wait ${timeRemaining} minutes before making another insurance change.`,
      code: 'COOLDOWN_ACTIVE'
    }
  }
  
  return { valid: true }
}

/**
 * Validate insurance status transition
 */
export function validateStatusTransition(
  currentStatus: string | null,
  newStatus: string
): ValidationResult {
  // Define valid transitions
  const validTransitions: Record<string, string[]> = {
    'null': ['PENDING'],
    'PENDING': ['ACTIVE', 'REJECTED'],
    'ACTIVE': ['EXPIRED', 'DEACTIVATED'],
    'EXPIRED': ['PENDING'], // Can resubmit
    'DEACTIVATED': ['PENDING', 'ACTIVE'], // Can reactivate
    'REJECTED': ['PENDING'] // Can resubmit
  }
  
  const current = currentStatus || 'null'
  const allowed = validTransitions[current] || []
  
  if (!allowed.includes(newStatus)) {
    return {
      valid: false,
      reason: `Invalid status transition from ${current} to ${newStatus}`,
      code: 'INVALID_TRANSITION'
    }
  }
  
  return { valid: true }
}

/**
 * Check if insurance is expiring soon
 */
export function checkExpirationWarning(
  expirationDate: Date | string | null,
  warningDays: number = 30
): { 
  isExpiring: boolean
  daysUntilExpiration: number | null
  severity: 'urgent' | 'warning' | 'info' | null
} {
  if (!expirationDate) {
    return { isExpiring: false, daysUntilExpiration: null, severity: null }
  }
  
  const expiry = new Date(expirationDate)
  const now = new Date()
  const daysUntil = Math.floor((expiry.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
  
  if (daysUntil < 0) {
    return { isExpiring: true, daysUntilExpiration: 0, severity: 'urgent' }
  }
  
  if (daysUntil <= 7) {
    return { isExpiring: true, daysUntilExpiration: daysUntil, severity: 'urgent' }
  }
  
  if (daysUntil <= warningDays) {
    return { isExpiring: true, daysUntilExpiration: daysUntil, severity: 'warning' }
  }
  
  return { isExpiring: false, daysUntilExpiration: daysUntil, severity: 'info' }
}