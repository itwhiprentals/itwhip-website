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
  const [isLoading, setIsLoading] = useState<'google' | null>(null)
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

  const handleOAuthSignIn = async (provider: 'google') => {
    try {
      setIsLoading(provider)
      setError(null)

      // Store OAuth params in cookies FIRST (before signOut)
      // These will be read by oauth-redirect route since NextAuth redirect callback
      // doesn't preserve our custom callbackUrl params
      const role = roleHint || 'guest'
      console.log('[OAuthButtons] Setting OAuth cookies FIRST:', { roleHint, role, mode, callbackUrl })

      // Set cookies with longer expiry and explicit SameSite
      const cookieOptions = 'path=/; max-age=600; SameSite=Lax'
      document.cookie = `oauth_role_hint=${role}; ${cookieOptions}`
      document.cookie = `oauth_mode=${mode || 'signup'}; ${cookieOptions}`
      if (callbackUrl) {
        document.cookie = `oauth_return_to=${encodeURIComponent(callbackUrl)}; ${cookieOptions}`
      }

      // Wait briefly to ensure cookies are set
      await new Promise(resolve => setTimeout(resolve, 50))

      // Verify cookies were set
      const cookiesSet = document.cookie.includes('oauth_role_hint')
      console.log('[OAuthButtons] Initial cookies set:', cookiesSet)

      // IMPORTANT: Sign out to clear any existing session
      // This prevents NextAuth from linking new OAuth accounts to the wrong user
      // See: https://github.com/nextauthjs/next-auth/issues/3300
      await signOut({ redirect: false })

      // CRITICAL: Re-set cookies immediately after signOut
      // signOut() may clear all cookies, so we need to restore ours
      console.log('[OAuthButtons] Re-setting cookies after signOut')
      document.cookie = `oauth_role_hint=${role}; ${cookieOptions}`
      document.cookie = `oauth_mode=${mode || 'signup'}; ${cookieOptions}`
      if (callbackUrl) {
        document.cookie = `oauth_return_to=${encodeURIComponent(callbackUrl)}; ${cookieOptions}`
      }

      // Final verification before redirecting
      const finalCheck = document.cookie.includes('oauth_role_hint')
      console.log('[OAuthButtons] Final verification before signIn:', {
        cookiesPresent: finalCheck,
        role,
        allCookies: document.cookie.split(';').map(c => c.trim().substring(0, 20))
      })

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

