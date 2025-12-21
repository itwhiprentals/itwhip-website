// app/components/auth/OAuthButtons.tsx
'use client'

import { useState } from 'react'
import { signIn, signOut } from 'next-auth/react'

// Theme variants for different auth contexts
type ThemeVariant = 'guest' | 'host'

interface OAuthButtonsProps {
  callbackUrl?: string
  className?: string
  showDivider?: boolean
  buttonSize?: 'sm' | 'md' | 'lg'
  theme?: ThemeVariant
  // Role hint for the OAuth callback - used for role-based redirects
  roleHint?: 'guest' | 'host'
  // Mode: 'login' requires existing account, 'signup' creates new account
  mode?: 'login' | 'signup'
}

export default function OAuthButtons({
  callbackUrl,
  className = '',
  showDivider = true,
  buttonSize = 'md',
  theme = 'guest',
  roleHint,
  mode = 'signup'
}: OAuthButtonsProps) {
  const [isLoading, setIsLoading] = useState<'google' | 'apple' | null>(null)
  const [error, setError] = useState<string | null>(null)

  const sizeClasses = {
    sm: 'py-2 px-4 text-sm',
    md: 'py-3 px-4 text-base',
    lg: 'py-4 px-6 text-lg'
  }

  // Theme-specific styles
  const themeStyles = {
    guest: {
      dividerBg: 'bg-gray-900',
      dividerText: 'text-gray-400',
      dividerBorder: 'border-gray-600'
    },
    host: {
      dividerBg: 'bg-white',
      dividerText: 'text-gray-500',
      dividerBorder: 'border-gray-300'
    }
  }

  const currentTheme = themeStyles[theme]

  // Build callback URL with role hint for proper redirects
  const buildCallbackUrl = () => {
    // Use the OAuth redirect handler which will determine proper redirect based on user roles
    const baseUrl = '/api/auth/oauth-redirect'
    const params = new URLSearchParams()

    if (roleHint) {
      params.set('roleHint', roleHint)
    }
    if (callbackUrl) {
      params.set('returnTo', callbackUrl)
    }
    if (mode) {
      params.set('mode', mode)
    }

    return params.toString() ? `${baseUrl}?${params.toString()}` : baseUrl
  }

  const handleOAuthSignIn = async (provider: 'google' | 'apple') => {
    try {
      setIsLoading(provider)
      setError(null)

      // IMPORTANT: Sign out first to clear any existing session
      // This prevents NextAuth from linking new OAuth accounts to the wrong user
      // See: https://github.com/nextauthjs/next-auth/issues/3300
      await signOut({ redirect: false })

      // Use NextAuth signIn with redirect to our OAuth redirect handler
      const result = await signIn(provider, {
        callbackUrl: buildCallbackUrl(),
        redirect: true
      })

      // Note: The page will redirect, so this code won't run on success
      if (result?.error) {
        setError(`Failed to sign in with ${provider}. Please try again.`)
        setIsLoading(null)
      }
    } catch (err) {
      console.error(`OAuth ${provider} error:`, err)
      setError(`Failed to sign in with ${provider}. Please try again.`)
      setIsLoading(null)
    }
  }

  return (
    <div className={`space-y-4 ${className}`}>
      {error && (
        <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg">
          <p className="text-sm text-red-400 text-center">{error}</p>
        </div>
      )}

      {/* Google Sign In */}
      <button
        type="button"
        onClick={() => handleOAuthSignIn('google')}
        disabled={isLoading !== null}
        className={`w-full flex items-center justify-center gap-3 ${sizeClasses[buttonSize]} bg-white hover:bg-gray-50 text-gray-700 font-medium rounded-lg border border-gray-300 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow`}
      >
        {isLoading === 'google' ? (
          <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24">
            <path
              fill="#4285F4"
              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
            />
            <path
              fill="#34A853"
              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
            />
            <path
              fill="#FBBC05"
              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
            />
            <path
              fill="#EA4335"
              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
            />
          </svg>
        )}
        <span>Continue with Google</span>
      </button>

      {/* Apple Sign In */}
      <button
        type="button"
        onClick={() => handleOAuthSignIn('apple')}
        disabled={isLoading !== null}
        className={`w-full flex items-center justify-center gap-3 ${sizeClasses[buttonSize]} bg-black hover:bg-gray-900 text-white font-medium rounded-lg border border-gray-700 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow`}
      >
        {isLoading === 'apple' ? (
          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
        ) : (
          <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17.05 20.28c-.98.95-2.05.8-3.08.35-1.09-.46-2.09-.48-3.24 0-1.44.62-2.2.44-3.06-.35C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.54 4.09l.01-.01zM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25z"/>
          </svg>
        )}
        <span>Continue with Apple</span>
      </button>

      {/* Divider */}
      {showDivider && (
        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className={`w-full border-t ${currentTheme.dividerBorder}`}></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className={`px-4 ${currentTheme.dividerBg} ${currentTheme.dividerText}`}>
              or continue with email
            </span>
          </div>
        </div>
      )}
    </div>
  )
}
