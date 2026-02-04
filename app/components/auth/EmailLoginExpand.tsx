'use client'

import { useState } from 'react'
import Link from 'next/link'

interface GuardResponse {
  type: string
  title: string
  message: string
  actions: {
    primary: { label: string; url: string }
    secondary?: { label: string; url: string }
  }
}

interface EmailLoginExpandProps {
  mode: 'login' | 'signup'
  hostMode?: boolean
  onSuccess?: () => void
  onGuard?: (guard: GuardResponse, email: string) => void
}

export default function EmailLoginExpand({ mode, hostMode = false, onSuccess, onGuard }: EmailLoginExpandProps) {
  const [expanded, setExpanded] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: ''
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }))
    setError('')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    if (mode === 'signup') {
      if (!formData.name.trim()) {
        setError('Name is required')
        return
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Passwords do not match')
        return
      }
      if (formData.password.length < 8) {
        setError('Password must be at least 8 characters')
        return
      }
    }

    setLoading(true)

    try {
      // Host mode uses dedicated host login endpoint for proper cookie handling
      const endpoint = mode === 'login'
        ? (hostMode ? '/api/host/login' : '/api/auth/login')
        : '/api/auth/signup'
      const body = mode === 'login'
        ? { email: formData.email, password: formData.password, roleHint: hostMode ? 'host' : 'guest' }
        : { name: formData.name, email: formData.email, password: formData.password, roleHint: hostMode ? 'host' : 'guest' }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })

      const data = await res.json()

      if (!res.ok) {
        // Check for guard response (cross-account type access)
        if (data.guard && onGuard) {
          onGuard(data.guard, formData.email)
          return
        }
        setError(data.error || 'Something went wrong')
        return
      }

      // Success - redirect using API-provided redirect URL or fallback
      if (onSuccess) {
        onSuccess()
      } else {
        // Use redirect from API response if available, otherwise use default
        const redirectUrl = data.redirect || (hostMode ? '/host/dashboard' : '/')
        window.location.href = redirectUrl
      }
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  if (!expanded) {
    return (
      <button
        onClick={() => setExpanded(true)}
        className="w-full flex items-center justify-center gap-3 px-4 py-3 bg-transparent hover:bg-gray-100 dark:hover:bg-gray-800/50 text-gray-700 dark:text-gray-300 font-medium rounded-lg transition-colors border border-gray-300 dark:border-gray-600"
      >
        <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
        </svg>
        Continue with Email
      </button>
    )
  }

  return (
    <div className="mt-2 pt-4 border-t border-gray-200 dark:border-gray-700/50 animate-in slide-in-from-top-2 duration-200">
      <form onSubmit={handleSubmit} className="space-y-4">
        {error && (
          <div className="p-3 bg-red-500/10 border border-red-500/50 rounded-lg">
            <p className="text-sm text-red-500 dark:text-red-400">{error}</p>
          </div>
        )}

        {mode === 'signup' && (
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Full Name
            </label>
            <input
              id="name"
              name="name"
              type="text"
              value={formData.name}
              onChange={handleChange}
              placeholder="John Doe"
              className="w-full px-3 py-2.5 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              autoFocus
            />
          </div>
        )}

        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="you@example.com"
            className="w-full px-3 py-2.5 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            autoFocus={mode === 'login'}
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
            Password
          </label>
          <input
            id="password"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="••••••••"
            className="w-full px-3 py-2.5 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>

        {mode === 'signup' && (
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Confirm Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="••••••••"
              className="w-full px-3 py-2.5 bg-white dark:bg-gray-800/50 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
        )}

        <button
          type="submit"
          disabled={loading}
          className={`w-full py-3 font-semibold rounded-lg transition-colors disabled:opacity-50 ${
            hostMode
              ? 'bg-green-600 hover:bg-green-700 text-white'
              : 'bg-blue-600 hover:bg-blue-700 text-white'
          }`}
        >
          {loading ? (
            <svg className="animate-spin h-5 w-5 mx-auto" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          ) : (
            mode === 'login' ? 'Sign In' : 'Create Account'
          )}
        </button>

        {mode === 'login' && (
          <div className="text-center">
            <Link
              href={hostMode ? '/host/forgot-password' : '/auth/forgot-password'}
              className="text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
            >
              Forgot password?
            </Link>
          </div>
        )}

        <button
          type="button"
          onClick={() => setExpanded(false)}
          className="w-full text-sm text-gray-500 hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
        >
          ← Back to other options
        </button>
      </form>
    </div>
  )
}
