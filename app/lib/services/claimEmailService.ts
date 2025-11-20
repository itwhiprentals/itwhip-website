// app/lib/services/claimEmailService.ts

import { sendEmail } from '../email/sender'
import {
  getClaimFiledHostTemplate,
  getClaimNotificationGuestTemplate,
  getClaimNotificationFleetTemplate,
  getClaimApprovedHostTemplate,
  getClaimDecisionGuestTemplate,
  getClaimReminderGuestTemplate,
} from '../email/templates'
import type { EmailResponse } from '../email/types'

/**
 * Claim Email Service
 * Orchestrates all claim-related email notifications
 */

// ============================================================================
// HOST EMAILS
// ============================================================================

/**
 * Send claim filed confirmation to host
 */
export async function sendClaimFiledEmail(
  to: string,
  data: {
    hostName: string
    claimId: string
    bookingCode: string
    carDetails: string
    incidentDate: string
    estimatedCost: number
    claimType: string
    vehicleDeactivated: boolean
    fnolSummary?: {
      hasComprehensiveReport: boolean
      odometerReading?: number
      vehicleDrivable?: boolean
      weatherConditions?: string
      roadConditions?: string
      policeReportFiled?: boolean
      policeDepartment?: string | null
      policeReportNumber?: string | null
      witnessCount?: number
      otherPartyInvolved?: boolean
      injuriesReported?: boolean
      injuryCount?: number
      incidentLocation?: string
    }
  }
): Promise<EmailResponse> {
  try {
    const template = getClaimFiledHostTemplate({
      ...data,
      claimUrl: `https://itwhip.com/host/claims/${data.claimId}`,
    })

    return await sendEmail(to, template.subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending claim filed email:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send claim filed email' 
    }
  }
}

/**
 * Send claim approved notification to host
 */
export async function sendClaimApprovedHostEmail(
  to: string,
  data: {
    hostName: string
    claimId: string
    bookingCode: string
    carDetails: string
    approvedAmount: number
    hostPayout: number
    earningsPercent: number
    reviewNotes?: string
    expectedPayoutDate: string
  }
): Promise<EmailResponse> {
  try {
    const template = getClaimApprovedHostTemplate({
      ...data,
      claimUrl: `https://itwhip.com/host/claims/${data.claimId}`,
    })

    return await sendEmail(to, template.subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending claim approved email to host:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send claim approved email' 
    }
  }
}

// ============================================================================
// GUEST EMAILS
// ============================================================================

/**
 * Send claim notification to guest (48hr deadline)
 */
export async function sendClaimNotificationGuestEmail(
  to: string,
  data: {
    guestName: string
    claimId: string
    bookingCode: string
    carDetails: string
    incidentDate: string
    estimatedCost: number
    claimType: string
    responseDeadline: string
    deductibleAmount: number
    depositHeld: number
  }
): Promise<EmailResponse> {
  try {
    const now = new Date()
    const deadline = new Date(data.responseDeadline)
    const hoursRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)))
    const potentialCharge = Math.max(0, data.deductibleAmount - data.depositHeld)

    const template = getClaimNotificationGuestTemplate({
      ...data,
      hoursRemaining,
      potentialCharge,
      responseUrl: `https://itwhip.com/guest/claims/${data.claimId}/respond`,
    })

    return await sendEmail(to, template.subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending claim notification to guest:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send claim notification to guest' 
    }
  }
}

/**
 * Send claim decision to guest (approved or denied)
 */
export async function sendClaimDecisionGuestEmail(
  to: string,
  data: {
    guestName: string
    claimId: string
    bookingCode: string
    carDetails: string
    decision: 'approved' | 'denied'
    approvedAmount?: number
    guestResponsibility?: number
    denialReason?: string
    paymentDueDate?: string
  }
): Promise<EmailResponse> {
  try {
    const template = getClaimDecisionGuestTemplate({
      ...data,
      claimUrl: `https://itwhip.com/guest/claims/${data.claimId}`,
      appealUrl: data.decision === 'approved' 
        ? `https://itwhip.com/guest/claims/${data.claimId}/appeal`
        : undefined,
    })

    return await sendEmail(to, template.subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending claim decision to guest:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send claim decision to guest' 
    }
  }
}

/**
 * Send 24hr reminder to guest
 */
export async function sendClaimReminderGuestEmail(
  to: string,
  data: {
    guestName: string
    claimId: string
    bookingCode: string
    carDetails: string
    responseDeadline: string
  }
): Promise<EmailResponse> {
  try {
    const now = new Date()
    const deadline = new Date(data.responseDeadline)
    const hoursRemaining = Math.max(0, Math.floor((deadline.getTime() - now.getTime()) / (1000 * 60 * 60)))

    const template = getClaimReminderGuestTemplate({
      ...data,
      hoursRemaining,
      responseUrl: `https://itwhip.com/guest/claims/${data.claimId}/respond`,
      consequences: 'Your account will be automatically suspended, you won\'t be able to make new bookings, any active reservations will be cancelled, and the claim may be decided without your input.',
    })

    return await sendEmail(to, template.subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending claim reminder to guest:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send claim reminder to guest' 
    }
  }
}

// ============================================================================
// FLEET ADMIN EMAILS
// ============================================================================

/**
 * Send claim notification to fleet admin
 */
export async function sendClaimNotificationFleetEmail(
  to: string,
  data: {
    claimId: string
    bookingCode: string
    hostName: string
    guestName: string
    carDetails: string
    incidentDate: string
    estimatedCost: number
    claimType: string
    priority: 'low' | 'medium' | 'high'
    insuranceProvider: string
    earningsTier: string
    fnolSummary?: {
      hasComprehensiveReport: boolean
      odometerReading?: number
      vehicleDrivable?: boolean
      weatherConditions?: string
      roadConditions?: string
      policeReportFiled?: boolean
      policeDepartment?: string | null
      policeReportNumber?: string | null
      witnessCount?: number
      otherPartyInvolved?: boolean
      injuriesReported?: boolean
      injuryCount?: number
      incidentLocation?: string
    }
  }
): Promise<EmailResponse> {
  try {
    const template = getClaimNotificationFleetTemplate({
      ...data,
      reviewUrl: `https://itwhip.com/fleet/claims/${data.claimId}`,
    })

    const fleetEmail = to || process.env.FLEET_EMAIL || 'info@itwhip.com'
    return await sendEmail(fleetEmail, template.subject, template.html, template.text)
  } catch (error) {
    console.error('Error sending claim notification to fleet:', error)
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Failed to send claim notification to fleet' 
    }
  }
}

// ============================================================================
// UTILITY FUNCTIONS
// ============================================================================

/**
 * Calculate claim priority based on cost and type
 */
export function calculateClaimPriority(
  estimatedCost: number,
  claimType: string
): 'low' | 'medium' | 'high' {
  // High priority: serious incidents or high cost
  if (
    claimType === 'ACCIDENT' ||
    claimType === 'THEFT' ||
    estimatedCost > 5000
  ) {
    return 'high'
  }

  // Medium priority: moderate damage
  if (estimatedCost > 1000) {
    return 'medium'
  }

  // Low priority: minor damage
  return 'low'
}

/**
 * Calculate expected payout date (7 business days from now)
 */
export function calculateExpectedPayoutDate(): string {
  const date = new Date()
  let businessDays = 0
  
  while (businessDays < 7) {
    date.setDate(date.getDate() + 1)
    const dayOfWeek = date.getDay()
    
    // Skip weekends
    if (dayOfWeek !== 0 && dayOfWeek !== 6) {
      businessDays++
    }
  }
  
  return date.toISOString()
}

/**
 * Calculate 48hr response deadline
 */
export function calculate48HourDeadline(): string {
  const deadline = new Date()
  deadline.setHours(deadline.getHours() + 48)
  return deadline.toISOString()
}

/**
 * Calculate 24hr reminder time (24 hours before deadline)
 */
export function calculate24HourReminderTime(deadline: string): string {
  const reminderTime = new Date(deadline)
  reminderTime.setHours(reminderTime.getHours() - 24)
  return reminderTime.toISOString()
}

// ============================================================================
// BATCH EMAIL OPERATIONS
// ============================================================================

/**
 * Send all emails when claim is filed
 */
export async function sendClaimFiledNotifications(data: {
  claimId: string
  bookingCode: string
  hostName: string
  hostEmail: string
  carDetails: string
  incidentDate: string
  estimatedCost: number
  claimType: string
  vehicleDeactivated: boolean
  guestName: string
  insuranceProvider: string
  earningsTier: string
  fleetEmail?: string
  fnolSummary?: {
    hasComprehensiveReport: boolean
    odometerReading?: number
    vehicleDrivable?: boolean
    weatherConditions?: string
    roadConditions?: string
    policeReportFiled?: boolean
    policeDepartment?: string | null
    policeReportNumber?: string | null
    witnessCount?: number
    otherPartyInvolved?: boolean
    injuriesReported?: boolean
    injuryCount?: number
    incidentLocation?: string
  }
}): Promise<{
  hostEmailSent: boolean
  fleetEmailSent: boolean
  errors: string[]
}> {
  const errors: string[] = []
  let hostEmailSent = false
  let fleetEmailSent = false

  // Send to host
  const hostResult = await sendClaimFiledEmail(data.hostEmail, {
    hostName: data.hostName,
    claimId: data.claimId,
    bookingCode: data.bookingCode,
    carDetails: data.carDetails,
    incidentDate: data.incidentDate,
    estimatedCost: data.estimatedCost,
    claimType: data.claimType,
    vehicleDeactivated: data.vehicleDeactivated,
    fnolSummary: data.fnolSummary,
  })

  if (hostResult.success) {
    hostEmailSent = true
  } else {
    errors.push(`Host email failed: ${hostResult.error}`)
  }

  // Send to fleet
  const priority = calculateClaimPriority(data.estimatedCost, data.claimType)
  const fleetResult = await sendClaimNotificationFleetEmail(
    data.fleetEmail || process.env.FLEET_EMAIL || 'info@itwhip.com',
    {
      claimId: data.claimId,
      bookingCode: data.bookingCode,
      hostName: data.hostName,
      guestName: data.guestName,
      carDetails: data.carDetails,
      incidentDate: data.incidentDate,
      estimatedCost: data.estimatedCost,
      claimType: data.claimType,
      priority,
      insuranceProvider: data.insuranceProvider,
      earningsTier: data.earningsTier,
      fnolSummary: data.fnolSummary,
    }
  )

  if (fleetResult.success) {
    fleetEmailSent = true
  } else {
    errors.push(`Fleet email failed: ${fleetResult.error}`)
  }

  return {
    hostEmailSent,
    fleetEmailSent,
    errors,
  }
}

/**
 * Send all emails when claim is approved
 */
export async function sendClaimApprovedNotifications(data: {
  claimId: string
  bookingCode: string
  hostName: string
  hostEmail: string
  guestName: string
  guestEmail: string
  carDetails: string
  approvedAmount: number
  hostPayout: number
  earningsPercent: number
  reviewNotes?: string
  deductibleAmount: number
  depositHeld: number
  responseDeadline: string
  incidentDate: string
  estimatedCost: number
  claimType: string
}): Promise<{
  hostEmailSent: boolean
  guestEmailSent: boolean
  errors: string[]
}> {
  const errors: string[] = []
  let hostEmailSent = false
  let guestEmailSent = false

  // Send to host
  const expectedPayoutDate = calculateExpectedPayoutDate()
  const hostResult = await sendClaimApprovedHostEmail(data.hostEmail, {
    hostName: data.hostName,
    claimId: data.claimId,
    bookingCode: data.bookingCode,
    carDetails: data.carDetails,
    approvedAmount: data.approvedAmount,
    hostPayout: data.hostPayout,
    earningsPercent: data.earningsPercent,
    reviewNotes: data.reviewNotes,
    expectedPayoutDate,
  })

  if (hostResult.success) {
    hostEmailSent = true
  } else {
    errors.push(`Host email failed: ${hostResult.error}`)
  }

  // Send to guest with payment responsibility
  const guestResponsibility = Math.max(0, data.deductibleAmount - data.depositHeld)
  const paymentDueDate = new Date()
  paymentDueDate.setDate(paymentDueDate.getDate() + 7)

  const guestResult = await sendClaimDecisionGuestEmail(data.guestEmail, {
    guestName: data.guestName,
    claimId: data.claimId,
    bookingCode: data.bookingCode,
    carDetails: data.carDetails,
    decision: 'approved',
    approvedAmount: data.approvedAmount,
    guestResponsibility,
    paymentDueDate: paymentDueDate.toISOString(),
  })

  if (guestResult.success) {
    guestEmailSent = true
  } else {
    errors.push(`Guest email failed: ${guestResult.error}`)
  }

  return {
    hostEmailSent,
    guestEmailSent,
    errors,
  }
}

// Export all functions
export default {
  sendClaimFiledEmail,
  sendClaimApprovedHostEmail,
  sendClaimNotificationGuestEmail,
  sendClaimDecisionGuestEmail,
  sendClaimReminderGuestEmail,
  sendClaimNotificationFleetEmail,
  calculateClaimPriority,
  calculateExpectedPayoutDate,
  calculate48HourDeadline,
  calculate24HourReminderTime,
  sendClaimFiledNotifications,
  sendClaimApprovedNotifications,
}