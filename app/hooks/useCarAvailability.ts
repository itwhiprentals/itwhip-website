// app/hooks/useCarAvailability.ts
// Hook for fetching and validating car date availability
// Used by BookingWidget (car detail page) and BookingPageClient (checkout page)

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { format, addMonths, addDays } from 'date-fns'

interface UseCarAvailabilityReturn {
  blockedDates: string[]
  loading: boolean
  error: string | null
  validateDateRange: (start: string, end: string) => { available: boolean; conflictDates: string[] }
  checkAvailability: (start: string, end: string) => Promise<{ available: boolean; conflictDates: string[] }>
  refetch: () => void
}

export function useCarAvailability(carId: string | undefined): UseCarAvailabilityReturn {
  const [blockedDates, setBlockedDates] = useState<string[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const fetchedRef = useRef(false)

  // Fetch blocked dates for the next 3 months
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
    } catch (err) {
      console.error('[useCarAvailability] Fetch error:', err)
      setError('Could not load availability')
      setBlockedDates([])
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

  // Client-side validation against cached blocked dates
  const validateDateRange = useCallback(
    (start: string, end: string): { available: boolean; conflictDates: string[] } => {
      if (!start || !end) return { available: true, conflictDates: [] }

      const blockedSet = new Set(blockedDates)
      const conflictDates: string[] = []
      let current = new Date(start + 'T00:00:00')
      const endDate = new Date(end + 'T00:00:00')

      while (current <= endDate) {
        const dateStr = format(current, 'yyyy-MM-dd')
        if (blockedSet.has(dateStr)) {
          conflictDates.push(dateStr)
        }
        current = addDays(current, 1)
      }

      return { available: conflictDates.length === 0, conflictDates }
    },
    [blockedDates]
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

  const refetch = useCallback(() => {
    fetchedRef.current = false
    fetchBlockedDates()
  }, [fetchBlockedDates])

  return { blockedDates, loading, error, validateDateRange, checkAvailability, refetch }
}
