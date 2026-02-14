// app/(guest)/rentals/dashboard/bookings/[id]/utils/helpers.ts

import { Booking, RefundCalculation, TimelineStep } from '../types'
import { STATUS_COLORS, CANCELLATION_POLICIES } from '../constants'
import { CheckCircle, Car } from '../components/Icons'

export const getTimeAgo = (date: Date): string => {
  const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
  if (seconds < 60) return 'just now'
  const minutes = Math.floor(seconds / 60)
  if (minutes < 60) return `${minutes}m ago`
  const hours = Math.floor(minutes / 60)
  if (hours < 24) return `${hours}h ago`
  const days = Math.floor(hours / 24)
  if (days < 7) return `${days}d ago`
  return new Date(date).toLocaleDateString()
}

export const getDaysUntilPickup = (startDate: string): number => {
  const pickup = new Date(startDate)
  const now = new Date()
  const diff = pickup.getTime() - now.getTime()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}

export const getHoursUntilPickup = (startDate: string): number => {
  const pickup = new Date(startDate)
  const now = new Date()
  const diff = pickup.getTime() - now.getTime()
  return Math.floor(diff / (1000 * 60 * 60))
}

export const getTimeUntilPickup = (booking: Booking | null): string | null => {
  if (!booking) return null
  const pickup = new Date(booking.startDate)
  const now = new Date()
  const diff = pickup.getTime() - now.getTime()
  
  if (diff < 0) return null
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24))
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''} until pickup`
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} until pickup`
  return 'Pickup today!'
}

export const calculateRefund = (booking: Booking): RefundCalculation => {
  const hoursUntilTrip = getHoursUntilPickup(booking.startDate)
  const tripDays = booking.numberOfDays || calculateTripDays(booking.startDate, booking.endDate)
  const safeDays = Math.max(1, tripDays)
  const averageDailyCost = booking.totalAmount / safeDays
  const serviceFeeRefund = hoursUntilTrip >= 168 ? booking.serviceFee : 0

  // 24+ hours: free cancellation
  if (hoursUntilTrip >= 24) {
    return {
      refundAmount: booking.totalAmount,
      serviceFeeRefund,
      totalRefund: booking.totalAmount + serviceFeeRefund,
      refundPercentage: 1.0,
      penaltyAmount: 0,
      penaltyDays: 0,
      depositRefunded: true,
      label: 'Full refund'
    }
  }

  // <24 hours: day-based penalty
  const penaltyDays = safeDays > 2 ? 1 : 0.5
  const penaltyAmount = Math.round(averageDailyCost * penaltyDays * 100) / 100
  const refundAmount = Math.max(0, Math.round((booking.totalAmount - penaltyAmount) * 100) / 100)

  return {
    refundAmount,
    serviceFeeRefund: 0,
    totalRefund: refundAmount,
    refundPercentage: booking.totalAmount > 0 ? refundAmount / booking.totalAmount : 0,
    penaltyAmount,
    penaltyDays,
    depositRefunded: true,
    label: safeDays > 2
      ? `1-day penalty ($${penaltyAmount.toFixed(2)})`
      : `Half-day penalty ($${penaltyAmount.toFixed(2)})`
  }
}

export const getStatusColor = (status: string): string => {
  return STATUS_COLORS[status as keyof typeof STATUS_COLORS] || STATUS_COLORS.PENDING
}

export const getTimelineSteps = (booking: Booking | null): TimelineStep[] => {
  if (!booking) return []
  
  const steps: TimelineStep[] = [
    { 
      name: 'Booked', 
      status: 'complete', 
      icon: CheckCircle 
    },
    { 
      name: 'Verified', 
      status: booking.verificationStatus === 'verified' || booking.verificationStatus === 'approved' 
        ? 'complete' 
        : booking.verificationStatus === 'pending' || booking.verificationStatus === 'submitted'
        ? 'current' 
        : 'upcoming', 
      icon: CheckCircle 
    },
    { 
      name: 'Confirmed', 
      status: ['CONFIRMED', 'ACTIVE', 'COMPLETED'].includes(booking.status) 
        ? 'complete' 
        : 'upcoming', 
      icon: CheckCircle 
    },
    { 
      name: 'Active', 
      status: booking.status === 'ACTIVE' 
        ? 'current' 
        : booking.status === 'COMPLETED' 
        ? 'complete' 
        : 'upcoming', 
      icon: Car 
    },
    { 
      name: 'Completed', 
      status: booking.status === 'COMPLETED' 
        ? 'complete' 
        : 'upcoming', 
      icon: CheckCircle 
    },
  ]
  
  return steps
}

export const formatCurrency = (amount: number): string => {
  return `$${amount.toFixed(2)}`
}

export const formatDate = (date: string | Date, options?: Intl.DateTimeFormatOptions): string => {
  return new Date(date).toLocaleDateString('en-US', options || { 
    month: 'short', 
    day: 'numeric', 
    year: 'numeric' 
  })
}

export const formatTime = (date: string | Date): string => {
  return new Date(date).toLocaleTimeString('en-US', { 
    hour: 'numeric', 
    minute: '2-digit',
    hour12: true 
  })
}

export const calculateTripDays = (startDate: string, endDate: string): number => {
  return Math.ceil(
    (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)
  )
}

export const validateFileUpload = (file: File): { valid: boolean; error?: string } => {
  const validTypes = ['image/jpeg', 'image/png', 'application/pdf']
  const maxSize = 10 * 1024 * 1024 // 10MB
  
  if (!validTypes.includes(file.type)) {
    return { valid: false, error: 'Please upload a JPEG, PNG, or PDF file' }
  }
  
  if (file.size > maxSize) {
    return { valid: false, error: 'File size must be less than 10MB' }
  }
  
  return { valid: true }
}

export const getProgressiveInfoLevel = (booking: Booking): string => {
  const daysUntil = getDaysUntilPickup(booking.startDate)
  const hoursUntil = getHoursUntilPickup(booking.startDate)
  
  if (booking.status !== 'CONFIRMED') return 'basic'
  if (hoursUntil <= 1 && booking.hasKeybox) return 'access_codes'
  if (hoursUntil <= 24) return 'full_details'
  if (daysUntil <= 7) return 'host_intro'
  return 'general'
}

export const shouldShowPrePickupChecklist = (booking: Booking): boolean => {
  return booking.status === 'CONFIRMED' && getDaysUntilPickup(booking.startDate) <= 7
}