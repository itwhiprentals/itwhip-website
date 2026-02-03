'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'

interface AuthPageLayoutProps {
  children: React.ReactNode
  hostMode?: boolean
  title?: string
  subtitle?: string
}

export default function AuthPageLayout({
  children,
  hostMode = false,
  title = 'Welcome to ItWhip',
  subtitle
}: AuthPageLayoutProps) {
  const [isDark, setIsDark] = useState(false)

  // Detect system dark mode and set theme-color + body background
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)')
    setIsDark(mediaQuery.matches)

    const handleChange = (e: MediaQueryListEvent) => setIsDark(e.matches)
    mediaQuery.addEventListener('change', handleChange)

    return () => mediaQuery.removeEventListener('change', handleChange)
  }, [])

  // Update theme-color and body background when dark mode changes
  useEffect(() => {
    const bgColor = isDark ? '#111827' : '#ffffff' // gray-900 or white

    let metaTag = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.name = 'theme-color'
      document.head.appendChild(metaTag)
    }
    metaTag.content = bgColor

    const originalBg = document.body.style.backgroundColor
    document.body.style.backgroundColor = bgColor

    return () => {
      document.body.style.backgroundColor = originalBg
    }
  }, [isDark])

  return (
    <div className="min-h-screen bg-white dark:bg-gray-900 flex flex-col">
      {/* Back Button */}
      <div className="pt-12 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Back</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-start justify-center px-4 pt-4 pb-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src="/logo.png"
                alt="ItWhip"
                width={60}
                height={60}
                style={{ width: '60px', height: '60px', borderRadius: '50%' }}
              />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">{title}</h1>
            {hostMode && (
              <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs font-medium text-green-600 dark:text-green-400">
                Host Portal
              </span>
            )}
            {subtitle && (
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-3">
            {children}
          </div>

          {/* Terms Footer */}
          <p className="mt-8 text-center text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline">
              Terms of Service
            </Link>
            ,{' '}
            <Link href="/privacy" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline">
              Privacy Policy
            </Link>
            , and{' '}
            <Link href="/platform-agreement" className="text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white underline">
              Platform Agreement
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
