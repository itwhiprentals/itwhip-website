// app/hooks/useCarAvailability.ts
// MILITARY GRADE: Hook for fetching and validating car date availability
// Used by BookingWidget (car detail page) and BookingPageClient (checkout page)
// Now returns per-day availability with reasons (buffer, ACTIVE trip, etc.)

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { format, addMonths, addDays } from 'date-fns'

export interface DayAvailability {
  date: string
  available: boolean
  reason?: string
  earliestPickupTime?: string
  bookingId?: string
  returnExpected?: boolean
  returnCompleted?: boolean
  bufferEndsAt?: string
}

interface UseCarAvailabilityReturn {
  blockedDates: string[]
  days: DayAvailability[]
  loading: boolean
  error: string | null
  validateDateRange: (start: string, end: string) => { available: boolean; conflictDates: string[]; reasons: string[] }
  checkAvailability: (start: string, end: string) => Promise<{ available: boolean; conflictDates: string[] }>
  getDayInfo: (date: string) => DayAvailability | undefined
  refetch: () => void
}

export function useCarAvailability(carId: string | undefined): UseCarAvailabilityReturn {
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [days, setDays] = useState<DayAvailability[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  // Fetch blocked dates + per-day availability for the next 3 months
  const fetchBlockedDates = useCallback(async () => {
    if (!carId) {
      setLoading(false)
      return
    }

    setLoading(true)
    setError(null)

    try {
      const now = new Date()
      const months = [
        format(now, 'yyyy-MM'),
        format(addMonths(now, 1), 'yyyy-MM'),
        format(addMonths(now, 2), 'yyyy-MM'),
      ]

      const response = await fetch(
        `/api/rentals/availability?carId=${carId}&month=${months.join(',')}`
      )

      if (!response.ok) {
        throw new Error('Failed to fetch availability')
      }

      const data = await response.json()
      setBlockedDates(data.blockedDates || [])
      setDays(data.days || [])
    } catch (err) {
      console.error('[useCarAvailability] Fetch error:', err)
      setError('Could not load availability')
      setBlockedDates([])
      setDays([])
    } finally {
      setLoading(false)
    }
  }, [carId])

  useEffect(() => {
    if (!fetchedRef.current) {
      fetchedRef.current = true
      fetchBlockedDates()
    }
  }, [fetchBlockedDates])

  // Client-side validation against cached data — now includes reasons
  const validateDateRange = useCallback(
    (start: string, end: string): { available: boolean; conflictDates: string[]; reasons: string[] } => {
      if (!start || !end) return { available: true, conflictDates: [], reasons: [] }

      const dayMap = new Map(days.map(d => [d.date, d]))
      const blockedSet = new Set(blockedDates)
      const conflictDates: string[] = []
      const reasons: string[] = []
      let current = new Date(start + 'T00:00:00')
      const endDate = new Date(end + 'T00:00:00')

      while (current <= endDate) {
        const dateStr = format(current, 'yyyy-MM-dd')
        if (blockedSet.has(dateStr)) {
          conflictDates.push(dateStr)
          const dayInfo = dayMap.get(dateStr)
          if (dayInfo?.reason && !reasons.includes(dayInfo.reason)) {
            reasons.push(dayInfo.reason)
          }
        }
        current = addDays(current, 1)
      }

      return { available: conflictDates.length === 0, conflictDates, reasons }
    },
    [blockedDates, days]
  )

  // Server-side availability check (fresh data, used before PI creation)
  const checkAvailability = useCallback(
    async (start: string, end: string): Promise<{ available: boolean; conflictDates: string[] }> => {
      if (!carId) return { available: false, conflictDates: [] }

      try {
        const response = await fetch(
          `/api/rentals/availability?carId=${carId}&startDate=${start}&endDate=${end}`
        )
        if (!response.ok) {
          throw new Error('Availability check failed')
        }
        const data = await response.json()
        return {
          available: data.available,
          conflictDates: data.conflictDates || [],
        }
      } catch (err) {
        console.error('[useCarAvailability] Check error:', err)
        return { available: false, conflictDates: [] }
      }
    },
    [carId]
  )

  // Get info for a specific day
  const getDayInfo = useCallback(
    (date: string): DayAvailability | undefined => {
      return days.find(d => d.date === date)
    },
    [days]
  )

  const refetch = useCallback(() => {
    fetchedRef.current = false
    fetchBlockedDates()
  }, [fetchBlockedDates])

  return { blockedDates, days, loading, error, validateDateRange, checkAvailability, getDayInfo, refetch }
}
