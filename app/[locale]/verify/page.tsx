// app/verify/page.tsx
'use client'

import { useState, useEffect, Suspense } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'
import { Link } from '@/i18n/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import { IoMailOutline } from 'react-icons/io5'

function VerifyContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const token = searchParams.get('token')
  const message = searchParams.get('message')
  
  const [code, setCode] = useState('')
  const [hostId, setHostId] = useState('')
  const [hostEmail, setHostEmail] = useState('')
  const [resendEmail, setResendEmail] = useState('')
  const [showEmailInput, setShowEmailInput] = useState(false)
  const [verifying, setVerifying] = useState(false)
  const [status, setStatus] = useState<'pending' | 'success' | 'error'>('pending')
  const [statusMessage, setStatusMessage] = useState('')

  useEffect(() => {
    if (token) {
      handleTokenVerification()
    }
    
    // Get hostId and email from localStorage (set during signup)
    if (typeof window !== 'undefined') {
      const storedHostId = localStorage.getItem('pendingHostId')
      const storedEmail = localStorage.getItem('pendingHostEmail')
      
      if (storedHostId) {
        setHostId(storedHostId)
      }
      if (storedEmail) {
        setHostEmail(storedEmail)
        setResendEmail(storedEmail)
      }
    }
  }, [token])

  const handleTokenVerification = async () => {
    setVerifying(true)
    try {
      const response = await fetch('/api/host/verify', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ token })
      })

      const data = await response.json()
      
      if (response.ok) {
        setStatus('success')
        setStatusMessage('Email verified successfully! Redirecting to login...')
        localStorage.removeItem('pendingHostId')
        localStorage.removeItem('pendingHostEmail')
        setTimeout(() => {
          router.push('/host/login')
        }, 2000)
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
    
    if (!hostId) {
      setStatusMessage('Session expired. Click "Resend Code" and enter your email.')
      setShowEmailInput(true)
      return
    }
    
    setVerifying(true)
    setStatusMessage('')
    
    try {
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
        localStorage.removeItem('pendingHostId')
        localStorage.removeItem('pendingHostEmail')
        setTimeout(() => {
          router.push('/host/login')
        }, 2000)
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
    // If we have hostId, resend directly
    if (hostId) {
      await resendCodeWithHostId(hostId)
      return
    }
    
    // Otherwise, show email input
    setShowEmailInput(true)
    setStatusMessage('')
  }

  const handleResendWithEmail = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!resendEmail || !resendEmail.includes('@')) {
      setStatusMessage('Please enter a valid email address')
      return
    }

    setVerifying(true)
    setStatusMessage('')

    try {
      const response = await fetch('/api/host/verify/resend', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: resendEmail })
      })

      const data = await response.json()
      
      if (response.ok) {
        // Store the hostId for verification
        if (data.hostId) {
          localStorage.setItem('pendingHostId', data.hostId)
          localStorage.setItem('pendingHostEmail', resendEmail)
          setHostId(data.hostId)
          setHostEmail(resendEmail)
        }
        setStatusMessage('New verification code sent! Check your email.')
        setShowEmailInput(false)
        setStatus('pending')
      } else {
        // Handle specific error cases
        if (data.code === 'ALREADY_VERIFIED') {
          setStatus('error')
          setStatusMessage('This account is already verified. Please login.')
        } else if (data.code === 'NOT_FOUND') {
          setStatus('error')
          setStatusMessage('No account found with this email. Please sign up first.')
        } else {
          setStatusMessage(data.error || 'Failed to resend code')
        }
      }
    } catch (error) {
      setStatusMessage('Unable to resend code. Please try again.')
    }
    
    setVerifying(false)
  }

  const resendCodeWithHostId = async (id: string) => {
    setVerifying(true)
    setStatusMessage('')

    try {
      const response = await fetch('/api/host/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          hostId: id,
          verificationType: 'email'
        })
      })

      const data = await response.json()
      
      if (response.ok) {
        setStatusMessage('New verification code sent! Check your email.')
        setStatus('pending')
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
              <div className="w-16 h-16 bg-green-100 dark:bg-green-900/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
              </div>
              <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
                Verify Your Email
              </h1>
              <p className="text-gray-600 dark:text-gray-400 mt-2">
                {token ? 'Verifying your email...' : 
                 showEmailInput ? 'Enter your email to resend verification code' :
                 message === 'check-email' ? 'Enter the 6-digit code sent to your email' :
                 'Enter your verification code'}
              </p>
              {hostEmail && !showEmailInput && (
                <p className="text-sm text-green-600 dark:text-green-400 mt-1">
                  Sent to: {hostEmail}
                </p>
              )}
            </div>

            {/* Success Message */}
            {status === 'success' && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{statusMessage}</span>
                </div>
                {statusMessage.includes('already verified') && (
                  <Link 
                    href="/host/login"
                    className="mt-3 inline-block w-full text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Go to Login
                  </Link>
                )}
              </div>
            )}

            {/* Error Message */}
            {status === 'error' && (
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 text-red-800 dark:text-red-200 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  <span>{statusMessage}</span>
                </div>
                {statusMessage.includes('already verified') && (
                  <Link 
                    href="/host/login"
                    className="mt-3 inline-block w-full text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Go to Login
                  </Link>
                )}
                {statusMessage.includes('sign up') && (
                  <Link 
                    href="/host/signup"
                    className="mt-3 inline-block w-full text-center bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors font-medium"
                  >
                    Go to Sign Up
                  </Link>
                )}
              </div>
            )}

            {/* Warning Message */}
            {status === 'pending' && statusMessage && !statusMessage.includes('sent') && (
              <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 text-yellow-800 dark:text-yellow-200 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                  <span>{statusMessage}</span>
                </div>
              </div>
            )}

            {/* Success Message for Code Sent */}
            {status === 'pending' && statusMessage && statusMessage.includes('sent') && (
              <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 text-green-800 dark:text-green-200 p-4 rounded-lg mb-6">
                <div className="flex items-center">
                  <svg className="w-5 h-5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span>{statusMessage}</span>
                </div>
              </div>
            )}

            {/* Email Input Form (for resend when session expired) */}
            {status === 'pending' && showEmailInput && !token && (
              <form onSubmit={handleResendWithEmail} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                    Email Address
                  </label>
                  <div className="relative">
                    <IoMailOutline className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                    <input
                      type="email"
                      value={resendEmail}
                      onChange={(e) => setResendEmail(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                      placeholder="Enter your email"
                      disabled={verifying}
                      autoFocus
                    />
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Enter the email you used to sign up
                  </p>
                </div>
                
                <button
                  type="submit"
                  disabled={verifying || !resendEmail}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {verifying ? 'Sending...' : 'Send Verification Code'}
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setShowEmailInput(false)
                    setStatusMessage('')
                  }}
                  className="w-full bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 transition-colors font-medium"
                >
                  Back to Code Entry
                </button>

                <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-700">
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Don't have an account?{' '}
                    <Link href="/host/signup" className="text-green-600 hover:text-green-700 font-medium">
                      Sign Up
                    </Link>
                  </p>
                </div>
              </form>
            )}

            {/* Main Verification Form */}
            {status === 'pending' && !showEmailInput && !token && (
              <form onSubmit={handleManualVerification}>
                {/* Verification Code Input */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 text-center">
                    6-Digit Verification Code
                  </label>
                  <input
                    type="text"
                    maxLength={6}
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full px-4 py-4 border border-gray-300 dark:border-gray-600 rounded-lg text-center text-3xl tracking-[0.5em] font-mono bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-green-500"
                    placeholder="000000"
                    disabled={verifying}
                    autoFocus
                  />
                </div>
                
                <button
                  type="submit"
                  disabled={verifying || code.length !== 6}
                  className="w-full bg-green-600 text-white py-3 px-4 rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  {verifying ? 'Verifying...' : 'Verify Email'}
                </button>

                <button
                  type="button"
                  onClick={handleResendCode}
                  disabled={verifying}
                  className="w-full mt-3 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 py-3 px-4 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors font-medium"
                >
                  Resend Code
                </button>

                <div className="mt-6 text-center">
                  <Link 
                    href="/host/login" 
                    className="text-sm text-gray-600 dark:text-gray-400 hover:text-green-600 dark:hover:text-green-400"
                  >
                    Already verified? Login here
                  </Link>
                </div>
              </form>
            )}

            {/* Loading state for token verification */}
            {verifying && token && (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
              </div>
            )}
          </div>

          {/* Help text */}
          <div className="mt-6 text-center text-sm text-gray-600 dark:text-gray-400">
            <p>Didn't receive the email? Check your spam folder.</p>
            <p className="mt-2">
              Need help? Contact{' '}
              <a href="mailto:info@itwhip.com" className="text-green-600 hover:underline">
                info@itwhip.com
              </a>
            </p>
          </div>
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
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600"></div>
        </div>
        <Footer />
      </>
    }>
      <VerifyContent />
    </Suspense>
  )
}