// app/lib/trip/useTripSync.ts
// Client-side hook — polls booking every 3s and detects server wizard step.
// IDENTICAL pattern to mobile: ItWhipApp/src/hooks/useTripSync.ts

'use client'

import { useState, useEffect, useRef } from 'react'
import { detectTripStep, type TripStepState } from './tripStepDetector'

const POLL_INTERVAL = 3_000

interface UseTripSyncResult extends TripStepState {
  booking: any
  loading: boolean
}

export function useTripSync(
  bookingId: string,
  type: 'start' | 'end',
): UseTripSyncResult {
  const [state, setState] = useState<TripStepState>({ step: 0, photos: null, odometer: null, fuel: null })
  const [booking, setBooking] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const stoppedRef = useRef(false)

  useEffect(() => {
    let cancelled = false

    const poll = async () => {
      try {
        const response = await fetch(`/api/rentals/user-bookings?bookingId=${bookingId}`, {
          credentials: 'include',
        })
        if (!response.ok || cancelled) return
        const data = await response.json()
        const b = data.bookings?.[0]
        if (!b || cancelled) return

        setBooking(b)
        setLoading(false)

        if (type === 'start' && b.tripStartedAt) { stoppedRef.current = true; return }
        if (type === 'end' && b.tripEndedAt) { stoppedRef.current = true; return }

        const detected = detectTripStep(b, type)
        setState(detected)
      } catch {
        // Silent — retry next poll
      }
    }

    poll()
    const interval = setInterval(() => {
      if (!stoppedRef.current && !cancelled) poll()
    }, POLL_INTERVAL)

    return () => { cancelled = true; clearInterval(interval) }
  }, [bookingId, type])

  return { ...state, booking, loading }
}
