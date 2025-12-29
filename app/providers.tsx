// app/providers.tsx
'use client'

import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { SessionProvider } from 'next-auth/react'
import { ReactNode, useState, createContext, useContext } from 'react'
import { useUserLocation, type UserLocation } from '@/hooks/useUserLocation'
import { AuthProvider } from '@/app/contexts/AuthContext'

// ============================================================================
// LOCATION CONTEXT
// ============================================================================

interface LocationContextValue {
  location: UserLocation
  loading: boolean
  error: string | null
  refresh: () => void
  hasPermission: boolean | null
}

const LocationContext = createContext<LocationContextValue | null>(null)

export function useLocation(): LocationContextValue {
  const context = useContext(LocationContext)
  if (!context) {
    throw new Error('useLocation must be used within a LocationProvider')
  }
  return context
}

function LocationProvider({ children }: { children: ReactNode }) {
  const locationData = useUserLocation()
  return (
    <LocationContext.Provider value={locationData}>
      {children}
    </LocationContext.Provider>
  )
}

// ============================================================================
// MAIN PROVIDERS
// ============================================================================

export function Providers({ children }: { children: ReactNode }) {
  const [queryClient] = useState(() => new QueryClient({
    defaultOptions: {
      queries: {
        staleTime: 25000,
        gcTime: 60000,
        refetchOnWindowFocus: false,
        refetchOnReconnect: false,
        retry: 1,
      },
    },
  }))

  return (
    <SessionProvider>
      <AuthProvider>
        <QueryClientProvider client={queryClient}>
          <LocationProvider>
            {children}
          </LocationProvider>
        </QueryClientProvider>
      </AuthProvider>
    </SessionProvider>
  )
}