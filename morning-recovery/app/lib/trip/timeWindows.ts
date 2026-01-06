// app/lib/trip/timeWindows.ts

import { TRIP_CONSTANTS } from './constants'

export interface TripWindow {
  earliestStart: Date
  latestStart: Date
  expiresAt: Date
  canStartNow: boolean
  minutesUntilCanStart: number | null
  hoursUntilExpiry: number
}

export function calculateTripWindow(
  startDate: Date,
  startTime: string
): TripWindow {
  // Parse the scheduled pickup time
  const [hours, minutes] = startTime.split(':').map(Number)
  const scheduledTime = new Date(startDate)
  scheduledTime.setHours(hours, minutes, 0, 0)
  
  // Calculate window boundaries
  const earliestStart = new Date(
    scheduledTime.getTime() - TRIP_CONSTANTS.PICKUP_WINDOW_BEFORE_MINUTES * 60 * 1000
  )
  
  const latestStart = new Date(
    scheduledTime.getTime() + TRIP_CONSTANTS.PICKUP_WINDOW_AFTER_HOURS * 60 * 60 * 1000
  )
  
  const expiresAt = new Date(
    scheduledTime.getTime() + TRIP_CONSTANTS.TRIP_EXPIRY_HOURS * 60 * 60 * 1000
  )
  
  const now = new Date()
  const canStartNow = now >= earliestStart && now <= latestStart
  
  const minutesUntilCanStart = now < earliestStart
    ? Math.ceil((earliestStart.getTime() - now.getTime()) / (60 * 1000))
    : null
    
  const hoursUntilExpiry = Math.max(
    0,
    Math.floor((expiresAt.getTime() - now.getTime()) / (60 * 60 * 1000))
  )
  
  return {
    earliestStart,
    latestStart,
    expiresAt,
    canStartNow,
    minutesUntilCanStart,
    hoursUntilExpiry
  }
}

export function formatTimeWindow(window: TripWindow): string {
  if (window.canStartNow) {
    if (window.hoursUntilExpiry > 0) {
      return `Available now (expires in ${window.hoursUntilExpiry}h)`
    }
    return 'Available now'
  }
  
  if (window.minutesUntilCanStart) {
    if (window.minutesUntilCanStart < 60) {
      return `Available in ${window.minutesUntilCanStart} minutes`
    }
    const hours = Math.floor(window.minutesUntilCanStart / 60)
    return `Available in ${hours} hour${hours > 1 ? 's' : ''}`
  }
  
  return 'Trip window has expired'
}