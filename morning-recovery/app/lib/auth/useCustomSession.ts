// app/lib/auth/useCustomSession.ts
'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  email: string
  name: string
  role: string
}

interface Session {
  user: User
}

export function useCustomSession() {
  const [session, setSession] = useState<Session | null>(null)
  const [status, setStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')

  useEffect(() => {
    let isMounted = true

    const fetchSession = async () => {
      console.log('🔍 useCustomSession: Fetching session...')
      
      try {
        const response = await fetch('/api/auth/verify', {
          credentials: 'include',
          cache: 'no-store'
        })
        
        if (!isMounted) return
        
        console.log('📥 useCustomSession: Response status', response.status)
        
        if (response.ok) {
          const data = await response.json()
          console.log('📦 useCustomSession: Response data', data)
          
          if (data.user) {
            setSession({ user: data.user })
            setStatus('authenticated')
            console.log('✅ useCustomSession: User authenticated', data.user.email)
          } else {
            setSession(null)
            setStatus('unauthenticated')
            console.log('❌ useCustomSession: No user in response')
          }
        } else {
          setSession(null)
          setStatus('unauthenticated')
          console.log('❌ useCustomSession: Auth verify failed', response.status)
        }
      } catch (error) {
        console.error('❌ useCustomSession: Error', error)
        if (isMounted) {
          setSession(null)
          setStatus('unauthenticated')
        }
      }
    }

    fetchSession()

    return () => {
      isMounted = false
    }
  }, [])

  return {
    data: session,
    status
  }
}