// app/components/GpsProvider.tsx
// Wraps app layout — requests GPS once on mount, provides via context.
// PageTracker and other components read from context without managing their own GPS state.

'use client'

import { createContext, useContext, useEffect, useState, type ReactNode } from 'react'
import { requestGps, type GpsData } from '@/app/lib/analytics/gps-collector'

interface GpsContextValue {
  gps: GpsData | null
  loading: boolean
}

const GpsContext = createContext<GpsContextValue>({ gps: null, loading: true })

export function useGps(): GpsContextValue {
  return useContext(GpsContext)
}

export default function GpsProvider({ children }: { children: ReactNode }) {
  const [gps, setGps] = useState<GpsData | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    requestGps()
      .then(setGps)
      .finally(() => setLoading(false))
  }, [])

  return (
    <GpsContext.Provider value={{ gps, loading }}>
      {children}
    </GpsContext.Provider>
  )
}
