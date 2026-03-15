// app/hooks/useFavorites.ts
// Favorites hook — API sync when logged in, localStorage fallback when logged out

'use client'

import { useState, useEffect, useCallback, useRef } from 'react'

const STORAGE_KEY = 'rental_favorites'

// Module-level cache so all components share the same state
let cachedIds: Set<string> | null = null
let cachedLoggedIn: boolean | null = null
const listeners = new Set<(ids: Set<string>) => void>()

function notify(ids: Set<string>) {
  cachedIds = ids
  listeners.forEach(fn => fn(ids))
}

function readLocalStorage(): Set<string> {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    return raw ? new Set(JSON.parse(raw)) : new Set()
  } catch {
    return new Set()
  }
}

function writeLocalStorage(ids: Set<string>) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify([...ids]))
}

export function useFavorites() {
  const [favorites, setFavorites] = useState<Set<string>>(cachedIds ?? new Set())
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(cachedLoggedIn ?? false)
  const initRef = useRef(false)

  // Initialize: try API first, fall back to localStorage
  useEffect(() => {
    if (initRef.current) return
    initRef.current = true

    async function init() {
      // If we already loaded, use cache
      if (cachedIds !== null && cachedLoggedIn !== null) {
        setFavorites(cachedIds)
        setIsLoggedIn(cachedLoggedIn)
        return
      }

      try {
        const res = await fetch('/api/favorites')
        if (res.ok) {
          const data = await res.json()
          const serverIds = new Set<string>(data.favorites)

          // Merge any localStorage favorites into server (one-time migration)
          const localIds = readLocalStorage()
          const toSync: string[] = []
          localIds.forEach(id => {
            if (!serverIds.has(id)) toSync.push(id)
          })

          if (toSync.length > 0) {
            await Promise.allSettled(
              toSync.map(carId =>
                fetch('/api/favorites', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({ carId }),
                })
              )
            )
            toSync.forEach(id => serverIds.add(id))
          }

          // Clear localStorage now that server is source of truth
          localStorage.removeItem(STORAGE_KEY)

          cachedLoggedIn = true
          setIsLoggedIn(true)
          notify(serverIds)
          setFavorites(serverIds)
          return
        }
      } catch {
        // Network error — fall through to localStorage
      }

      // Not logged in or API failed — use localStorage
      cachedLoggedIn = false
      setIsLoggedIn(false)
      const localIds = readLocalStorage()
      notify(localIds)
      setFavorites(localIds)
    }

    init()
  }, [])

  // Subscribe to cross-component updates
  useEffect(() => {
    const handler = (ids: Set<string>) => setFavorites(ids)
    listeners.add(handler)
    return () => { listeners.delete(handler) }
  }, [])

  const isFavorite = useCallback(
    (carId: string) => favorites.has(carId),
    [favorites],
  )

  const toggleFavorite = useCallback(
    async (carId: string) => {
      const current = cachedIds ?? new Set<string>()
      const next = new Set(current)
      const removing = next.has(carId)

      if (removing) {
        next.delete(carId)
      } else {
        next.add(carId)
      }

      // Optimistic update
      notify(next)
      setFavorites(next)

      if (isLoggedIn) {
        try {
          await fetch('/api/favorites', {
            method: removing ? 'DELETE' : 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ carId }),
          })
        } catch {
          // Revert on failure
          notify(current)
          setFavorites(current)
        }
      } else {
        writeLocalStorage(next)
      }
    },
    [isLoggedIn],
  )

  return { favorites, isFavorite, toggleFavorite }
}
