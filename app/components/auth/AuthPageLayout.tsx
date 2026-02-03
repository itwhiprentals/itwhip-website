'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'

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
  // Set theme-color meta tag for mobile status bar
  useEffect(() => {
    let metaTag = document.querySelector('meta[name="theme-color"]') as HTMLMetaElement
    if (!metaTag) {
      metaTag = document.createElement('meta')
      metaTag.name = 'theme-color'
      document.head.appendChild(metaTag)
    }
    metaTag.content = '#111827' // gray-900
  }, [])

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black flex flex-col">
      {/* Back Button */}
      <div className="pt-20 px-4">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-gray-400 hover:text-white transition-colors"
        >
          <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          <span className="text-sm">Back</span>
        </Link>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex items-center justify-center px-4 pb-8">
        <div className="w-full max-w-sm">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="flex justify-center mb-4">
              <Image
                src="/logo-white.png"
                alt="ItWhip"
                width={120}
                height={40}
                className="h-10 w-auto"
              />
            </div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {hostMode && (
              <span className="inline-block mt-2 px-3 py-1 bg-green-500/20 border border-green-500/50 rounded-full text-xs font-medium text-green-400">
                Host Portal
              </span>
            )}
            {subtitle && (
              <p className="mt-2 text-sm text-gray-400">{subtitle}</p>
            )}
          </div>

          {/* Content */}
          <div className="space-y-3">
            {children}
          </div>

          {/* Terms Footer */}
          <p className="mt-8 text-center text-xs text-gray-500">
            By continuing, you agree to our{' '}
            <Link href="/terms" className="text-gray-400 hover:text-white underline">
              Terms of Service
            </Link>{' '}
            and{' '}
            <Link href="/privacy" className="text-gray-400 hover:text-white underline">
              Privacy Policy
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}
