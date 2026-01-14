'use client'

// AuthContext - Centralized auth state management
// Implements Google/Airbnb-style instant role switching without page refresh
// Source: https://react.dev/learn/managing-state

import { createContext, useContext, useState, useCallback, useEffect, useRef, ReactNode } from 'react'
import { usePathname } from 'next/navigation'

// ============================================
// TYPES
// ============================================

interface User {
  id: string
  name: string
  email: string
  role: 'GUEST' | 'BUSINESS' | 'ADMIN'
  profilePhoto?: string
}

interface AuthState {
  isLoggedIn: boolean
  user: User | null
  currentRole: 'host' | 'guest' | null
  hasBothProfiles: boolean
  isLoading: boolean
  isSwitchingRole: boolean // TRUE during role switch - use to show loading states in Header/MobileMenu/Dashboard
}

interface AuthContextType extends AuthState {
  refreshAuth: () => Promise<void>
  switchRole: (targetRole: 'host' | 'guest') => Promise<boolean>
  logout: () => Promise<void>
  setUser: (user: User | null) => void
}

// ============================================
// CONTEXT
// ============================================

const AuthContext = createContext<AuthContextType | undefined>(undefined)

// ============================================
// PROVIDER
// ============================================

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    isLoggedIn: false,
    user: null,
    currentRole: null,
    hasBothProfiles: false,
    isLoading: true,
    isSwitchingRole: false
  })

  // ========== RACE CONDITION GUARDS ==========
  // Prevent concurrent refreshAuth calls from causing UI flashing
  const refreshInProgressRef = useRef(false)
  const refreshVersionRef = useRef(0) // Track which refresh is "current"
  const initialCheckDoneRef = useRef(false)

  // Refresh auth state from server
  const refreshAuth = useCallback(async () => {
    // Guard against concurrent calls - queue will be handled by version check
    if (refreshInProgressRef.current) {
      console.log('[AuthContext] Refresh already in progress, skipping')
      return
    }

    refreshInProgressRef.current = true
    const thisVersion = ++refreshVersionRef.current
    console.log(`[AuthContext] Refreshing auth state... (v${thisVersion})`)

    try {
      // Check dual-role status first - this tells us which tokens exist
      const dualRoleRes = await fetch('/api/auth/check-dual-role', {
        credentials: 'include'
      })

      if (!dualRoleRes.ok) {
        console.log('[AuthContext] No valid session found')
        // Check if this refresh is still current before updating state
        if (thisVersion === refreshVersionRef.current) {
          initialCheckDoneRef.current = true
          setState({
            isLoggedIn: false,
            user: null,
            currentRole: null,
            hasBothProfiles: false,
            isLoading: false,
            isSwitchingRole: false
          })
        }
        return
      }

      const dualRole = await dualRoleRes.json()
      console.log('[AuthContext] Dual-role check:', dualRole)

      // Determine which auth to verify based on current role
      if (dualRole.currentRole === 'host' && dualRole.hasHostProfile) {
        // User is in HOST mode
        const hostRes = await fetch('/api/host/login', {
          method: 'GET',
          credentials: 'include'
        })

        if (hostRes.ok) {
          const data = await hostRes.json()
          if (data.authenticated && data.host) {
            console.log('[AuthContext] Authenticated as HOST:', data.host.email)
            if (thisVersion === refreshVersionRef.current) {
              initialCheckDoneRef.current = true
              setState({
                isLoggedIn: true,
                user: {
                  id: data.host.id,
                  name: data.host.name,
                  email: data.host.email,
                  role: 'BUSINESS',
                  profilePhoto: data.host.profilePhoto
                },
                currentRole: 'host',
                hasBothProfiles: dualRole.hasGuestProfile || false,
                isLoading: false,
                isSwitchingRole: false
              })
            }
            return
          }
        }
      }

      // Check guest auth if currentRole is guest OR if host check didn't succeed
      if (dualRole.currentRole === 'guest' || dualRole.hasGuestProfile) {
        console.log('[AuthContext] Checking guest auth...')
        const guestRes = await fetch('/api/auth/verify', {
          credentials: 'include'
        })

        console.log('[AuthContext] Guest verify response:', guestRes.status)

        if (guestRes.ok) {
          const data = await guestRes.json()
          console.log('[AuthContext] Guest verify data:', data)
          // Note: /api/auth/verify returns { user, tokenInfo } - no "authenticated" field
          if (data.user) {
            console.log('[AuthContext] ✅ Authenticated as GUEST:', data.user.email)
            if (thisVersion === refreshVersionRef.current) {
              initialCheckDoneRef.current = true
              const newState = {
                isLoggedIn: true,
                user: {
                  id: data.user.id,
                  name: data.user.name,
                  email: data.user.email,
                  role: 'GUEST' as const,
                  profilePhoto: data.user.profilePhoto
                },
                currentRole: 'guest' as const,
                hasBothProfiles: dualRole.hasHostProfile || false,
                isLoading: false,
                isSwitchingRole: false
              }
              console.log('[AuthContext] Setting guest state:', newState)
              setState(newState)
            }
            return
          } else {
            console.log('[AuthContext] ⚠️ Guest verify returned but no user data:', data)
          }
        } else {
          console.log('[AuthContext] ⚠️ Guest verify failed:', guestRes.status)
        }
      }

      // Check admin auth
      const adminRes = await fetch('/api/admin/auth/verify', {
        credentials: 'include'
      })

      if (adminRes.ok) {
        const data = await adminRes.json()
        if (data.authenticated && data.user) {
          console.log('[AuthContext] Authenticated as ADMIN:', data.user.email)
          if (thisVersion === refreshVersionRef.current) {
            initialCheckDoneRef.current = true
            setState({
              isLoggedIn: true,
              user: {
                id: data.user.id,
                name: data.user.name,
                email: data.user.email,
                role: 'ADMIN',
                profilePhoto: data.user.profilePhoto || data.user.avatar
              },
              currentRole: null, // Admin doesn't have host/guest roles
              hasBothProfiles: false,
              isLoading: false,
              isSwitchingRole: false
            })
          }
          return
        }
      }

      // No valid session found
      console.log('[AuthContext] No authenticated user found')
      if (thisVersion === refreshVersionRef.current) {
        initialCheckDoneRef.current = true
        setState({
          isLoggedIn: false,
          user: null,
          currentRole: null,
          hasBothProfiles: false,
          isLoading: false,
          isSwitchingRole: false
        })
      }
    } catch (e) {
      console.error('[AuthContext] Error checking auth:', e)
      if (thisVersion === refreshVersionRef.current) {
        setState(prev => ({ ...prev, isLoading: false, isSwitchingRole: false }))
      }
    } finally {
      // Always reset the in-progress flag when done
      refreshInProgressRef.current = false
    }
  }, [])

  // Switch between host and guest roles
  const switchRole = useCallback(async (targetRole: 'host' | 'guest'): Promise<boolean> => {
    console.log('[AuthContext] Switching to role:', targetRole)

    // Set isSwitchingRole to true immediately - this signals Header/MobileMenu/Dashboard to show loading
    setState(prev => ({ ...prev, isSwitchingRole: true }))

    try {
      const res = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetRole })
      })

      if (res.ok) {
        const data = await res.json()
        console.log('[AuthContext] Switch successful:', data)

        // IMMEDIATELY update state for instant UI update
        // Set isLoggedIn explicitly to ensure Header shows profile button
        setState(prev => {
          const newRole = targetRole === 'host' ? 'BUSINESS' : 'GUEST'
          console.log('[AuthContext] Updating state:', {
            prevUser: prev.user?.email,
            prevRole: prev.user?.role,
            newRole,
            targetRole
          })
          return {
            ...prev,
            isLoggedIn: true, // Explicitly true
            isLoading: false, // Not loading
            currentRole: targetRole,
            user: prev.user ? {
              ...prev.user,
              role: newRole as 'GUEST' | 'BUSINESS' | 'ADMIN'
            } : prev.user
          }
        })

        // Refresh auth after a short delay to get full user data
        // But the immediate state update above should already show correct UI
        setTimeout(() => {
          console.log('[AuthContext] Running delayed refreshAuth')
          refreshAuth()
        }, 500)

        return true
      } else {
        const error = await res.json()
        console.error('[AuthContext] Switch failed:', error)
        // Reset isSwitchingRole on failure
        setState(prev => ({ ...prev, isSwitchingRole: false }))
        return false
      }
    } catch (e) {
      console.error('[AuthContext] Switch role error:', e)
      // Reset isSwitchingRole on error
      setState(prev => ({ ...prev, isSwitchingRole: false }))
      return false
    }
  }, [refreshAuth])

  // Logout and clear state
  const logout = useCallback(async () => {
    console.log('[AuthContext] Logging out...')

    try {
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include'
      })
    } catch (e) {
      console.error('[AuthContext] Logout error:', e)
    }

    // Clear state regardless of API result
    setState({
      isLoggedIn: false,
      user: null,
      currentRole: null,
      hasBothProfiles: false,
      isLoading: false,
      isSwitchingRole: false
    })
  }, [])

  // Manual user setter (for components that need to update user info)
  const setUser = useCallback((user: User | null) => {
    setState(prev => ({
      ...prev,
      user,
      isLoggedIn: user !== null
    }))
  }, [])

  // Initial auth check on mount
  // Only retry if user appears logged out (cookies may not be immediately available after OAuth)
  useEffect(() => {
    refreshAuth()

    // Retry auth check after 500ms ONLY if:
    // 1. Initial check completed AND
    // 2. User appears logged out (might be cookie timing issue after OAuth)
    const retryTimeout = setTimeout(() => {
      // Only retry if we got a logged-out result and haven't successfully authenticated
      if (initialCheckDoneRef.current && !state.isLoggedIn) {
        console.log('[AuthContext] Retrying auth check (initial check found no session)')
        // Reset the flag to allow the retry
        refreshInProgressRef.current = false
        refreshAuth()
      }
    }, 500)

    return () => clearTimeout(retryTimeout)
  }, [refreshAuth]) // Note: state.isLoggedIn not in deps - we only want to check once

  // Re-check auth when window regains focus (handles external login/logout)
  // Debounced to prevent rapid re-checks when switching between windows
  const lastFocusCheckRef = useRef<number>(0)
  useEffect(() => {
    const handleFocus = () => {
      const now = Date.now()
      // Debounce: only check if at least 5 seconds since last check
      if (now - lastFocusCheckRef.current < 5000) {
        console.log('[AuthContext] Skipping focus check (debounced)')
        return
      }
      lastFocusCheckRef.current = now

      // Reset in-progress flag in case previous check stalled
      refreshInProgressRef.current = false
      console.log('[AuthContext] Window focused, re-checking auth')
      refreshAuth()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refreshAuth])

  // Track pathname changes and refresh auth when navigating to protected pages
  // This ensures auth state is up-to-date after OAuth redirects
  const pathname = usePathname()
  const prevPathnameRef = useRef<string | null>(null)

  useEffect(() => {
    // Only refresh if pathname changed (not on initial mount - that's handled above)
    if (prevPathnameRef.current !== null && prevPathnameRef.current !== pathname) {
      // Check if navigating to a protected page that needs fresh auth
      const protectedPaths = ['/dashboard', '/host/', '/partner/', '/admin/', '/profile', '/messages']
      const isProtectedPath = protectedPaths.some(p => pathname?.startsWith(p))

      if (isProtectedPath) {
        // Reset in-progress flag to allow this refresh
        refreshInProgressRef.current = false
        console.log('[AuthContext] Navigated to protected path, refreshing auth:', pathname)
        refreshAuth()
      }
    }

    prevPathnameRef.current = pathname
  }, [pathname, refreshAuth])

  return (
    <AuthContext.Provider value={{ ...state, refreshAuth, switchRole, logout, setUser }}>
      {children}
    </AuthContext.Provider>
  )
}

// ============================================
// HOOK
// ============================================

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }
  return context
}

// Optional hook that doesn't throw if used outside provider
// Useful for components that may or may not be wrapped
export function useAuthOptional() {
  return useContext(AuthContext)
}

