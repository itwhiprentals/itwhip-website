// app/(guest)/components/hero/search-components/useLocationSearch.ts
// Custom hook for debounced location search - FIXED

import { useState, useEffect } from 'react'
import { getGroupedLocations, getPopularLocations, type Location } from '@/lib/data/arizona-locations'

export function useLocationSearch(externalQuery: string = '', debounceMs: number = 300) {
  const [debouncedQuery, setDebouncedQuery] = useState(externalQuery)
  const [results, setResults] = useState<{ airports: Location[], cities: Location[] }>({
    airports: [],
    cities: []
  })

  // Debounce the external query
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedQuery(externalQuery)
    }, debounceMs)

    return () => clearTimeout(timer)
  }, [externalQuery, debounceMs])

  // Perform search when debounced query changes
  useEffect(() => {
    if (debouncedQuery.trim().length > 0) {
      const grouped = getGroupedLocations(debouncedQuery)
      setResults(grouped)
    } else {
      const popular = getPopularLocations()
      const grouped = {
        airports: popular.filter(loc => loc.type === 'airport'),
        cities: popular.filter(loc => loc.type === 'city')
      }
      setResults(grouped)
    }
  }, [debouncedQuery])

  return {
    results,
    isSearching: externalQuery !== debouncedQuery
  }
}