'use client'

// AuthContext - Centralized auth state management
// Implements Google/Airbnb-style instant role switching without page refresh
// Source: https://react.dev/learn/managing-state

import { createContext, useContext, useState, useCallback, useEffect, ReactNode } from 'react'

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

  // Refresh auth state from server
  const refreshAuth = useCallback(async () => {
    console.log('[AuthContext] Refreshing auth state...')

    try {
      // Check dual-role status first - this tells us which tokens exist
      const dualRoleRes = await fetch('/api/auth/check-dual-role', {
        credentials: 'include'
      })

      if (!dualRoleRes.ok) {
        console.log('[AuthContext] No valid session found')
        setState({
          isLoggedIn: false,
          user: null,
          currentRole: null,
          hasBothProfiles: false,
          isLoading: false,
          isSwitchingRole: false
        })
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
          return
        }
      }

      // No valid session found
      console.log('[AuthContext] No authenticated user found')
      setState({
        isLoggedIn: false,
        user: null,
        currentRole: null,
        hasBothProfiles: false,
        isLoading: false,
        isSwitchingRole: false
      })
    } catch (e) {
      console.error('[AuthContext] Error checking auth:', e)
      setState(prev => ({ ...prev, isLoading: false, isSwitchingRole: false }))
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
  useEffect(() => {
    refreshAuth()
  }, [refreshAuth])

  // Re-check auth when window regains focus (handles external login/logout)
  useEffect(() => {
    const handleFocus = () => {
      console.log('[AuthContext] Window focused, re-checking auth')
      refreshAuth()
    }

    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [refreshAuth])

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

