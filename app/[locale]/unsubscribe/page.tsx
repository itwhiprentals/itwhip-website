// app/unsubscribe/page.tsx
// CAN-SPAM compliance: unsubscribe confirmation page

'use client'

import { useSearchParams } from 'next/navigation'
import { useState, Suspense } from 'react'

function UnsubscribeContent() {
  const searchParams = useSearchParams()
  const email = searchParams.get('email') || ''
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle')
  const [message, setMessage] = useState('')

  async function handleUnsubscribe() {
    if (!email) {
      setStatus('error')
      setMessage('No email address provided.')
      return
    }

    setStatus('loading')
    try {
      const response = await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      })

      const data = await response.json()

      if (response.ok) {
        setStatus('success')
        setMessage(data.message)
      } else {
        setStatus('error')
        setMessage(data.error || 'Something went wrong. Please try again.')
      }
    } catch {
      setStatus('error')
      setMessage('Network error. Please try again.')
    }
  }

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#f9fafb',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
      padding: '20px'
    }}>
      <div style={{
        maxWidth: '480px',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRadius: '12px',
        boxShadow: '0 4px 6px rgba(0, 0, 0, 0.07)',
        padding: '40px',
        textAlign: 'center'
      }}>
        <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#111827', marginBottom: '8px' }}>
          ItWhip
        </h1>

        {status === 'success' ? (
          <>
            <div style={{ fontSize: '48px', marginBottom: '16px' }}>&#10003;</div>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#059669', marginBottom: '12px' }}>
              Unsubscribed
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', lineHeight: '22px' }}>
              {message}
            </p>
          </>
        ) : status === 'error' ? (
          <>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#dc2626', marginBottom: '12px' }}>
              Error
            </h2>
            <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '20px' }}>
              {message}
            </p>
            <button
              onClick={() => setStatus('idle')}
              style={{
                padding: '10px 24px',
                backgroundColor: '#f3f4f6',
                border: '1px solid #d1d5db',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '14px',
                color: '#374151'
              }}
            >
              Try Again
            </button>
          </>
        ) : (
          <>
            <h2 style={{ fontSize: '20px', fontWeight: 600, color: '#1f2937', marginBottom: '12px' }}>
              Unsubscribe from Emails
            </h2>
            {email && (
              <p style={{ color: '#6b7280', fontSize: '14px', marginBottom: '24px' }}>
                Unsubscribe <strong>{email}</strong> from ItWhip marketing emails?
                <br />
                <span style={{ fontSize: '12px' }}>
                  You will still receive booking confirmations and security alerts.
                </span>
              </p>
            )}
            <button
              onClick={handleUnsubscribe}
              disabled={status === 'loading'}
              style={{
                padding: '12px 32px',
                backgroundColor: status === 'loading' ? '#9ca3af' : '#dc2626',
                color: '#ffffff',
                border: 'none',
                borderRadius: '8px',
                cursor: status === 'loading' ? 'not-allowed' : 'pointer',
                fontSize: '15px',
                fontWeight: 600
              }}
            >
              {status === 'loading' ? 'Processing...' : 'Unsubscribe'}
            </button>
          </>
        )}

        <p style={{ marginTop: '32px', color: '#9ca3af', fontSize: '12px' }}>
          &copy; {new Date().getFullYear()} ItWhip Technologies
        </p>
      </div>
    </div>
  )
}

export default function UnsubscribePage() {
  return (
    <Suspense fallback={
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        Loading...
      </div>
    }>
      <UnsubscribeContent />
    </Suspense>
  )
}
