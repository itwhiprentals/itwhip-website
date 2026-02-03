'use client'

import { Suspense, useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import VerifyLinkForm from '@/app/components/auth/verify-link/VerifyLinkForm'

function VerifyLinkContent() {
  const searchParams = useSearchParams()
  const token = searchParams.get('token')

  const [info, setInfo] = useState<any>(null)
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (!token) {
      setError('Missing verification token. Please try signing in again.')
      setLoading(false)
      return
    }

    async function fetchInfo() {
      try {
        const res = await fetch(`/api/auth/verify-link/info?token=${encodeURIComponent(token!)}`)
        const data = await res.json()

        if (!res.ok) {
          setError(data.error || 'Invalid or expired link. Please try signing in again.')
          return
        }

        setInfo(data)
      } catch {
        setError('Something went wrong. Please try signing in again.')
      } finally {
        setLoading(false)
      }
    }

    fetchInfo()
  }, [token])

  return (
    <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700">
      {loading && (
        <div className="flex justify-center py-8">
          <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      )}

      {error && !loading && (
        <div className="text-center space-y-4">
          <div className="inline-block bg-red-500/20 border border-red-500/50 rounded-full p-4">
            <svg className="h-8 w-8 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.082 16.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <p className="text-gray-400">{error}</p>
          <a
            href="/auth/login"
            className="inline-block px-4 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
          >
            Back to Sign In
          </a>
        </div>
      )}

      {info && !loading && token && (
        <VerifyLinkForm token={token} info={info} />
      )}
    </div>
  )
}

export default function VerifyLinkPage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-black">
      <div className="flex items-center justify-center px-4 py-16 pt-24 min-h-screen">
        <div className="w-full max-w-md">
          <Suspense fallback={
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl shadow-xl p-8 border border-gray-700">
              <div className="flex justify-center py-8">
                <svg className="animate-spin h-8 w-8 text-blue-500" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
              </div>
            </div>
          }>
            <VerifyLinkContent />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
