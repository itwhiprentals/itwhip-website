// app/lib/trip/handoff-ai.ts
// Haiku AI integration for handoff: ETA estimation + arrival summary + anti-spoofing

import Anthropic from '@anthropic-ai/sdk'
import { calculateDistance } from '@/lib/utils/distance'
import { TRIP_CONSTANTS } from './constants'

const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')
  return new Anthropic({ apiKey })
}

const HAIKU_MODEL = 'claude-haiku-4-5-20251001'

// ─── Types ──────────────────────────────────────────────────────────────

export interface GpsPing {
  latitude: number
  longitude: number
  timestamp: Date
  distanceMeters: number
}

interface EtaResult {
  eta_minutes: number | null
  direction: 'approaching' | 'stationary' | 'away' | 'unknown'
  message: string
}

// ─── Anti-Spoofing: Location Trust Score ────────────────────────────────

export function calculateLocationTrust(
  current: GpsPing,
  previous: GpsPing | null
): number {
  let trust = 100

  // No previous ping — cannot evaluate movement, baseline trust
  if (!previous) return 85

  const timeDiffSeconds = (current.timestamp.getTime() - previous.timestamp.getTime()) / 1000
  if (timeDiffSeconds <= 0) return trust

  // Calculate speed between pings
  const distanceMiles = calculateDistance(
    { latitude: previous.latitude, longitude: previous.longitude },
    { latitude: current.latitude, longitude: current.longitude }
  )
  const speedMph = (distanceMiles / timeDiffSeconds) * 3600

  // Impossible speed (> 200mph between pings)
  if (speedMph > TRIP_CONSTANTS.IMPOSSIBLE_SPEED_MPH) {
    trust -= 40
  }

  // Suspicious: perfectly identical coordinates across pings (GPS spoofing tools often do this)
  if (current.latitude === previous.latitude && current.longitude === previous.longitude) {
    // Stationary is normal, only flag after many identical pings
    // For single comparison, slight deduction
    trust -= 5
  }

  // Null-island proximity (within 1 degree of 0,0)
  if (Math.abs(current.latitude) < 1 && Math.abs(current.longitude) < 1) {
    trust -= 50
  }

  return Math.max(0, Math.min(100, trust))
}

// ─── Simple ETA Calculation (Math-based, used alongside Haiku) ─────────

export function calculateSimpleEta(
  current: GpsPing,
  previous: GpsPing | null
): { speedMph: number; etaMinutes: number | null; direction: 'approaching' | 'stationary' | 'away' } {
  if (!previous) {
    return { speedMph: 0, etaMinutes: null, direction: 'stationary' }
  }

  const timeDiffSeconds = (current.timestamp.getTime() - previous.timestamp.getTime()) / 1000
  if (timeDiffSeconds <= 0) {
    return { speedMph: 0, etaMinutes: null, direction: 'stationary' }
  }

  const distanceMiles = calculateDistance(
    { latitude: previous.latitude, longitude: previous.longitude },
    { latitude: current.latitude, longitude: current.longitude }
  )
  const speedMph = (distanceMiles / timeDiffSeconds) * 3600

  // Determine direction based on distance to car
  const distanceChange = current.distanceMeters - previous.distanceMeters
  let direction: 'approaching' | 'stationary' | 'away'

  if (Math.abs(distanceChange) < 50) {
    direction = 'stationary'
  } else if (distanceChange < 0) {
    direction = 'approaching'
  } else {
    direction = 'away'
  }

  // ETA only meaningful when approaching
  let etaMinutes: number | null = null
  if (direction === 'approaching' && speedMph > 1) {
    const remainingMiles = current.distanceMeters / 1609.34
    etaMinutes = Math.round((remainingMiles / speedMph) * 60)
  }

  return { speedMph: Math.round(speedMph * 10) / 10, etaMinutes, direction }
}

// ─── Haiku ETA Generation ──────────────────────────────────────────────

export async function generateEtaMessage(
  currentPing: GpsPing,
  previousPing: GpsPing | null,
  carAddress: string | null,
): Promise<string> {
  try {
    const simpleEta = calculateSimpleEta(currentPing, previousPing)
    const distanceMiles = (currentPing.distanceMeters / 1609.34).toFixed(1)

    const client = getClient()
    const response = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 100,
      system: [{
        type: 'text',
        text: 'You generate brief, natural-language ETA messages for a car rental host dashboard. Keep messages under 15 words. Be direct and factual. Use miles for distance. Examples: "Approaching at 30mph, ETA 8 minutes" or "Stationary 12 miles away" or "Moving away from vehicle".',
        cache_control: { type: 'ephemeral' },
      }],
      messages: [{
        role: 'user',
        content: `Guest GPS update:
- Distance from car: ${distanceMiles} mi (${currentPing.distanceMeters}m)
- Direction: ${simpleEta.direction}
- Speed: ${simpleEta.speedMph}mph
- ETA: ${simpleEta.etaMinutes ? `~${simpleEta.etaMinutes} min` : 'unknown'}
${carAddress ? `- Car location: ${carAddress}` : ''}

Generate a brief ETA status message for the host.`,
      }],
    })

    const text = response.content[0]
    if (text.type === 'text') {
      return text.text.trim()
    }
    return `${distanceMiles} mi away, ${simpleEta.direction}`
  } catch (error) {
    console.error('[Handoff AI] ETA generation failed:', error)
    // Graceful fallback to simple message
    const distanceMiles = (currentPing.distanceMeters / 1609.34).toFixed(1)
    const simpleEta = calculateSimpleEta(currentPing, previousPing)
    return `${distanceMiles} mi away, ${simpleEta.direction}`
  }
}

// ─── Haiku Arrival Summary ─────────────────────────────────────────────

export async function generateArrivalSummary(params: {
  guestName: string
  distanceMeters: number
  verificationMethod: string | null
  verificationScore: number | null
  totalBookings: number
  bookingDays: number
  locationTrust: number
  // Booking time context
  scheduledPickupDate?: string | null  // ISO date
  scheduledPickupTime?: string | null  // "HH:mm" format
  currentTime?: Date
}): Promise<string> {
  try {
    const client = getClient()
    const now = params.currentTime || new Date()

    // Calculate pickup timing context
    let timingContext = ''
    if (params.scheduledPickupDate && params.scheduledPickupTime) {
      try {
        const [hours, minutes] = params.scheduledPickupTime.split(':').map(Number)
        const scheduled = new Date(params.scheduledPickupDate)
        scheduled.setHours(hours, minutes, 0, 0)
        const diffMinutes = Math.round((now.getTime() - scheduled.getTime()) / 60000)

        if (diffMinutes > 30) {
          timingContext = `Guest is ${Math.round(diffMinutes / 60 * 10) / 10 > 1 ? `${Math.round(diffMinutes / 60)} hour(s)` : `${diffMinutes} minutes`} LATE for scheduled ${params.scheduledPickupTime} pickup.`
        } else if (diffMinutes > 0) {
          timingContext = `Guest is ${diffMinutes} minutes past scheduled ${params.scheduledPickupTime} pickup (within grace period).`
        } else if (diffMinutes > -15) {
          timingContext = `Guest arrived on time for ${params.scheduledPickupTime} pickup.`
        } else {
          timingContext = `Guest is ${Math.abs(diffMinutes)} minutes early for ${params.scheduledPickupTime} pickup.`
        }
      } catch {
        timingContext = `Scheduled pickup: ${params.scheduledPickupTime}`
      }
    }

    const response = await client.messages.create({
      model: HAIKU_MODEL,
      max_tokens: 150,
      system: [{
        type: 'text',
        text: `You generate brief, actionable arrival summaries for a car rental host dashboard. Keep it to 2-3 short sentences max. Focus on what matters to the host RIGHT NOW:
1. Is the guest on time, late, or early? (MOST important — lead with this)
2. Any ID verification concerns?
3. Rental duration for context.
Be direct and practical. If guest is late, note it clearly. If on time, keep it brief. Do NOT mention location trust scores or distance — the host can already see that.`,
        cache_control: { type: 'ephemeral' },
      }],
      messages: [{
        role: 'user',
        content: `Guest arrival:
- Name: ${params.guestName}
- ${timingContext || 'Pickup time not specified'}
- ID verification: ${params.verificationMethod || 'Not verified'} ${params.verificationScore ? `(score: ${params.verificationScore}/100)` : ''}
- Booking history: ${params.totalBookings === 0 ? 'First-time renter' : `${params.totalBookings} previous rental(s)`}
- Rental duration: ${params.bookingDays} day(s)

Generate a brief, actionable summary for the host.`,
      }],
    })

    const text = response.content[0]
    if (text.type === 'text') {
      return text.text.trim()
    }
    return timingContext || `${params.guestName} has arrived for pickup.`
  } catch (error) {
    console.error('[Handoff AI] Arrival summary failed:', error)
    return `${params.guestName} has arrived for pickup.`
  }
}
