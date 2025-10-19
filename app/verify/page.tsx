// app/verify/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const message = searchParams.get('message')
  
  const [code, setCode] = useState('')
  const [hostId, setHostId] = useState('')
  const [verifying, setVerifying] = useState(false)
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [statusMessage, setStatusMessage] = useState('')
  const [showHostIdInput, setShowHostIdInput] = useState(false)

  useEffect(() => {
    if (token) {
      // Auto-verify with token
      handleTokenVerification()
    }
    
    // Check if we have hostId in session storage (from signup flow)
    const storedHostId = sessionStorage.getItem('pendingHostId')
    if (storedHostId) {
      setHostId(storedHostId)
    }
  }, [token])

  const handleTokenVerification = async () => {
    setVerifying(true)
    try {
      // Token already contains hostId:code in base64
      const response = await fetch('/api/host/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()
      
      if (response.ok) {
        setStatus('success')
        setStatusMessage('Email verified successfully! Redirecting to login...')
        sessionStorage.removeItem('pendingHostId') // Clear stored hostId
        setTimeout(() => {
          router.push('/host/login')
        }, 3000)
      } else {
        setStatus('error')
        setStatusMessage(data.error || 'Verification failed')
      }
    } catch (error) {
      setStatus('error')
      setStatusMessage('Invalid verification link')
    }
    setVerifying(false)
  }

  const handleManualVerification = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (code.length !== 6) {
      setStatusMessage('Please enter a 6-digit code')
      return
    }
    
    // If no hostId, we need to get it
    if (!hostId) {
      setShowHostIdInput(true)
      setStatusMessage('Please enter your Host ID (check your email or database)')
      return
    }
    
    setVerifying(true)
    setStatusMessage('')
    
    try {
      // Call the verify API with hostId and code
      const response = await fetch('/api/host/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hostId,
          code,
          verificationType: 'email'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setStatus('success')
        setStatusMessage('Email verified successfully! Redirecting to login...')
        sessionStorage.removeItem('pendingHostId') // Clear stored hostId
        setTimeout(() => {
          router.push('/host/login')
        }, 3000)
      } else {
        setStatus('error')
        setStatusMessage(data.error || 'Verification failed. Please check your code.')
      }
    } catch (error) {
      setStatus('error')
      setStatusMessage('Unable to verify. Please try again.')
    }
    
    setVerifying(false)
  }

  const handleResendCode = async () => {
    if (!hostId) {
      setShowHostIdInput(true)
      setStatusMessage('Please enter your Host ID to resend verification')
      return
    }

    setVerifying(true)
    setStatusMessage('')

    try {
      const response = await fetch('/api/host/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hostId,
          verificationType: 'email'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setStatusMessage('New verification code sent! Check your email.')
        // In dev mode, show the code
        if (data.devCode) {
          setStatusMessage(`New code sent! Dev mode: ${data.devCode}`)
        }
      } else {
        setStatusMessage(data.error || 'Failed to resend code')
      }
    } catch (error) {
      setStatusMessage('Unable to resend code. Please try again.')
    }
    
    setVerifying(false)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20 pb-12">
        <div className="max-w-md mx-auto px-4">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
            <div className="text-center mb-6">
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Verify Your Email
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {token ? 'Verifying your email...' : 
                 message === 'check-email' ? 'Check your email for the verification code' :
                 'Enter your verification code'}
              </p>
            </div>

            {status === 'success' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  {statusMessage}
                </div>
              </div>
            )}

            {status === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {statusMessage}
                </div>
              </div>
            )}

            {status === 'pending' && statusMessage && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 text-blue-800 dark:text-blue-200 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                  </svg>
                  {statusMessage}
                </div>
              </div>
            )}

            {status === 'pending' && !token && (
              <form onSubmit={handleManualVerification}>
                {/* Host ID input (shown when needed) */}
                {(showHostIdInput || !hostId) && (
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Host ID
                    </label>
                    <input
                      type="text"
                      value={hostId}
                      onChange={(e) => setHostId(e.target.value)}
                      className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500 text-sm"
                      placeholder="Enter your Host ID"
                      disabled={verifying}
                    />
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Your Host ID was sent in your verification email or you can find it in the database
                    </p>
                  </div>
                )}

                {/* Verification Code Input */}
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    6-Digit Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-2xl tracking-wider bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="000000"
                    disabled={verifying}
                    autoFocus
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={verifying || code.length !== 6}
                  className="w-full bg-purple-600 text-white py-3 px-4 rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {verifying ? 'Verifying...' : 'Verify Email'}
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={verifying}
                  className="w-full mt-3 bg-gray-200 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Resend Code
                </button>

                <div className="mt-4 text-center">
                  <Link 
                    href="/host/login" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-purple-600 dark:hover:text-purple-400"
                  >
                    Already verified? Login here
                  </Link>
                </div>
              </form>
            )}

            {verifying && token && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
              </div>
            )}

            {/* Development Helper */}
            {process.env.NODE_ENV === 'development' && hostId && (
              <div className="mt-4 p-3 bg-gray-100 dark:bg-gray-700 rounded text-xs text-gray-600 dark:text-gray-400">
                <p className="font-semibold">Dev Info:</p>
                <p>Host ID: {hostId}</p>
                <p>Enter the code from your email or console</p>
              </div>
            )}
          </div>

          {/* Help text */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Didn't receive the email? Check your spam folder.</p>
            <p className="mt-2">
              Need help? Contact{' '}
              <a href="mailto:info@itwhip.com" className="text-purple-600 hover:underline">
                info@itwhip.com
              </a>
            </p>
          </div>

          {/* Known Host ID for Testing (Dev Only) */}
          {process.env.NODE_ENV === 'development' && (
            <div className="mt-4 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg text-xs">
              <p className="font-semibold text-yellow-800 dark:text-yellow-200">Testing Info:</p>
              <p className="text-yellow-700 dark:text-yellow-300 mt-1">
                Jay Jackson's Host ID: cmg6fh4j50000doel8gah9z72
              </p>
              <p className="text-yellow-700 dark:text-yellow-300">
                Verification Code: 536486 (if still valid)
              </p>
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  )
}

export default function VerifyPage() {
  return (
    <Suspense fallback={
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600"></div>
        </div>
        <Footer />
      </>
    }>
      <VerifyContent />
    </Suspense>
  )
}