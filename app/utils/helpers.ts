// app/utils/helpers.ts

import type { SurgePrediction, DynamicPrices } from '../types'
import { APP_CONFIG, colors } from './constants'

/**
 * Calculate dynamic pricing based on surge multiplier
 */
export function calculateDynamicPrice(
  surge: number, 
  distance: number = APP_CONFIG.defaultDistanceMiles
): DynamicPrices {
  const baseFare = 2.50
  const perMile = 1.50
  const basePrice = baseFare + (distance * perMile)
  const competitorEstimate = basePrice * surge
  
  // ItWhip price is 65% of competitor price
  let itwhipPrice = competitorEstimate * 0.65
  
  // Ensure driver minimum
  itwhipPrice = Math.max(itwhipPrice, APP_CONFIG.driverMinimumFare)
  itwhipPrice = Math.round(itwhipPrice)
  
  return {
    itwhip: itwhipPrice,
    competitorMin: Math.round(competitorEstimate * 0.9),
    competitorMax: Math.round(competitorEstimate * 1.1),
    savings: Math.round(competitorEstimate - itwhipPrice)
  }
}

/**
 * Generate surge predictions for the next 6 hours
 */
export function generateSurgePredictions(): SurgePrediction[] {
  const now = new Date()
  const predictions: SurgePrediction[] = []
  
  for (let i = 0; i < 6; i++) {
    const time = new Date(now.getTime() + i * 60 * 60 * 1000)
    const hour = time.getHours()
    let multiplier = 1.0
    let probability = 50
    
    // Peak hours: 3-6 PM and 6-9 AM
    if ((hour >= 15 && hour <= 18) || (hour >= 6 && hour <= 9)) {
      multiplier = 2.3 + Math.random() * 0.8
      probability = 85
    } else if (hour >= 12 && hour <= 14) {
      // Lunch hours
      multiplier = 1.5 + Math.random() * 0.5
      probability = 65
    }
    
    predictions.push({
      time: time.toLocaleTimeString('en-US', { 
        hour: '2-digit', 
        minute: '2-digit' 
      }),
      multiplier: Math.round(multiplier * 10) / 10,
      probability
    })
  }
  
  return predictions
}

/**
 * Get background color based on ticker severity
 */
export function getTickerBgColor(severity: string): string {
  switch(severity) {
    case 'critical': 
      return colors.surge.critical
    case 'warning': 
      return colors.surge.warning
    default: 
      return colors.surge.info
  }
}

/**
 * Get status color for traffic conditions
 */
export function getStatusColor(status: string): string {
  switch(status) {
    case 'heavy': 
      return colors.traffic.heavy
    case 'moderate': 
      return colors.traffic.moderate
    default: 
      return colors.traffic.clear
  }
}

/**
 * Format currency with proper symbol and decimals
 */
export function formatCurrency(amount: number, includeSymbol = true): string {
  const formatted = amount.toFixed(2)
  return includeSymbol ? `$${formatted}` : formatted
}

/**
 * Format large numbers with K/M suffixes
 */
export function formatLargeNumber(num: number): string {
  if (num >= 1000000) {
    return `${(num / 1000000).toFixed(1)}M`
  }
  if (num >= 1000) {
    return `${(num / 1000).toFixed(1)}k`
  }
  return num.toString()
}

/**
 * Calculate time difference in human-readable format
 */
export function getTimeDifference(futureDate: Date, currentDate: Date): string {
  const diff = futureDate.getTime() - currentDate.getTime()
  
  if (diff <= 0) return 'NOW'
  
  const minutes = Math.floor(diff / 60000)
  const seconds = Math.floor((diff % 60000) / 1000)
  
  if (minutes > 60) {
    const hours = Math.floor(minutes / 60)
    const remainingMinutes = minutes % 60
    return `${hours}h ${remainingMinutes}m`
  }
  
  return `${minutes}:${seconds.toString().padStart(2, '0')}`
}

/**
 * Parse time string to Date object
 */
export function parseTimeString(timeStr: string): Date {
  const [time, period] = timeStr.split(' ')
  const [hours, minutes] = time.split(':')
  const date = new Date()
  
  let hour = parseInt(hours)
  if (period === 'PM' && hour !== 12) hour += 12
  if (period === 'AM' && hour === 12) hour = 0
  
  date.setHours(hour)
  date.setMinutes(parseInt(minutes))
  date.setSeconds(0)
  
  return date
}

/**
 * Get terminal name from number
 */
export function getTerminalName(terminal: number): string {
  switch(terminal) {
    case 2: return 'Terminal 2'
    case 3: return 'Terminal 3 (John S. McCain III)'
    case 4: return 'Terminal 4 (Barry M. Goldwater)'
    default: return `Terminal ${terminal}`
  }
}

/**
 * Calculate estimated arrival time
 */
export function calculateETA(distanceMiles: number, trafficDelay: number = 0): number {
  const baseSpeedMph = 35 // Average speed in city
  const baseTime = (distanceMiles / baseSpeedMph) * 60 // Convert to minutes
  return Math.round(baseTime + trafficDelay)
}

/**
 * Get delay risk level from probability
 */
export function getDelayRiskLevel(probability: number): {
  level: 'low' | 'moderate' | 'high'
  color: string
  text: string
} {
  if (probability > 60) {
    return {
      level: 'high',
      color: colors.status.error,
      text: 'High delay risk'
    }
  }
  if (probability > 30) {
    return {
      level: 'moderate',
      color: colors.status.warning,
      text: 'Moderate delay risk'
    }
  }
  return {
    level: 'low',
    color: colors.status.success,
    text: 'On time'
  }
}

/**
 * Validate email format
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

/**
 * Validate phone number format
 */
export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\(?([0-9]{3})\)?[-. ]?([0-9]{3})[-. ]?([0-9]{4})$/
  return phoneRegex.test(phone)
}

/**
 * Format phone number for display
 */
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/)
  if (match) {
    return `(${match[1]}) ${match[2]}-${match[3]}`
  }
  return phone
}

/**
 * Get greeting based on time of day
 */
export function getTimeGreeting(): string {
  const hour = new Date().getHours()
  if (hour < 12) return 'Good morning'
  if (hour < 17) return 'Good afternoon'
  if (hour < 21) return 'Good evening'
  return 'Good night'
}

/**
 * Calculate platform fee
 */
export function calculatePlatformFee(fareAmount: number): number {
  return Math.round(fareAmount * APP_CONFIG.platformFeePercentage * 100) / 100
}

/**
 * Calculate driver earnings
 */
export function calculateDriverEarnings(fareAmount: number): number {
  const platformFee = calculatePlatformFee(fareAmount)
  return Math.round((fareAmount - platformFee) * 100) / 100
}

/**
 * Generate random ID
 */
export function generateId(prefix: string = 'id'): string {
  return `${prefix}_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
}

/**
 * Debounce function for search and other inputs
 */
export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: NodeJS.Timeout | null = null
  
  return (...args: Parameters<T>) => {
    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(() => func(...args), wait)
  }
}

/**
 * Throttle function for scroll events
 */
export function throttle<T extends (...args: any[]) => any>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle: boolean = false
  
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}

/**
 * Check if device is mobile
 */
export function isMobileDevice(): boolean {
  if (typeof window === 'undefined') return false
  return /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
    navigator.userAgent
  )
}

/**
 * Get browser name
 */
export function getBrowserName(): string {
  if (typeof window === 'undefined') return 'unknown'
  
  const agent = navigator.userAgent.toLowerCase()
  if (agent.indexOf('chrome') > -1) return 'chrome'
  if (agent.indexOf('safari') > -1) return 'safari'
  if (agent.indexOf('firefox') > -1) return 'firefox'
  if (agent.indexOf('edge') > -1) return 'edge'
  return 'other'
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch (err) {
    console.error('Failed to copy:', err)
    return false
  }
}

/**
 * Share content using Web Share API
 */
export async function shareContent(data: {
  title: string
  text: string
  url: string
}): Promise<boolean> {
  if (navigator.share) {
    try {
      await navigator.share(data)
      return true
    } catch (err) {
      console.error('Error sharing:', err)
      return false
    }
  }
  return false
}