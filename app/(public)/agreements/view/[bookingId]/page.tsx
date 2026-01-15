// app/(public)/agreements/view/[bookingId]/page.tsx
// PDF Viewer for signed rental agreements

'use client'

import { useState, useEffect, use } from 'react'
import Link from 'next/link'
import Image from 'next/image'

interface AgreementInfo {
  bookingCode: string
  vehicle: string
  guestName: string
  hostName: string
  signedAt: string
  pdfUrl: string
}

export default function AgreementViewerPage({ params }: { params: Promise<{ bookingId: string }> }) {
  const { bookingId } = use(params)

  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [agreement, setAgreement] = useState<AgreementInfo | null>(null)

  useEffect(() => {
    fetchAgreement()
  }, [bookingId])

  const fetchAgreement = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/agreements/view/${bookingId}`)
      const data = await response.json()

      if (data.success) {
        setAgreement(data.agreement)
      } else {
        setError(data.error || 'Agreement not found')
      }
    } catch {
      setError('Failed to load agreement')
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto mb-4" />
          <p className="text-gray-600">Loading agreement...</p>
        </div>
      </div>
    )
  }

  if (error || !agreement) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
          <h2 className="text-xl font-semibold text-gray-900 mb-2">Agreement Not Found</h2>
          <p className="text-gray-600 mb-6">{error || 'The agreement you\'re looking for doesn\'t exist or has been removed.'}</p>
          <Link
            href="/"
            className="inline-block bg-orange-500 hover:bg-orange-600 text-white px-6 py-2 rounded-lg font-medium transition-colors"
          >
            Go to Homepage
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Image
              src="/logo.png"
              alt="ItWhip"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
            <div>
              <h1 className="text-lg font-semibold text-gray-900">Signed Agreement</h1>
              <p className="text-sm text-gray-500">Booking #{agreement.bookingCode}</p>
            </div>
          </div>
          <a
            href={`/api/agreements/view/${bookingId}/pdf`}
            download={`agreement-${agreement.bookingCode}.pdf`}
            className="flex items-center gap-2 bg-orange-500 hover:bg-orange-600 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </a>
        </div>
      </div>

      {/* Agreement Info Bar */}
      <div className="bg-green-50 border-b border-green-200">
        <div className="max-w-6xl mx-auto px-4 py-3">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0">
              <svg className="w-5 h-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-green-800">
                Signed by {agreement.guestName}
              </p>
              <p className="text-xs text-green-600">
                {new Date(agreement.signedAt).toLocaleString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: 'numeric',
                  minute: '2-digit',
                  timeZoneName: 'short'
                })}
              </p>
            </div>
            <div className="hidden sm:block text-right">
              <p className="text-sm text-green-800">{agreement.vehicle}</p>
              <p className="text-xs text-green-600">Provider: {agreement.hostName}</p>
            </div>
          </div>
        </div>
      </div>

      {/* PDF Viewer */}
      <div className="max-w-6xl mx-auto px-4 py-6">
        <div className="bg-white rounded-lg shadow-lg overflow-hidden" style={{ height: 'calc(100vh - 220px)', minHeight: '600px' }}>
          {/* Use our proxy API to serve PDF with correct headers */}
          <iframe
            src={`/api/agreements/view/${bookingId}/pdf`}
            className="w-full h-full border-0"
            title="Signed Agreement PDF"
          />
        </div>

        {/* Fallback download section */}
        <div className="mt-4 text-center">
          <p className="text-sm text-gray-500 mb-2">
            Having trouble viewing? Download the PDF directly:
          </p>
          <a
            href={`/api/agreements/view/${bookingId}/pdf`}
            download={`agreement-${agreement.bookingCode}.pdf`}
            className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-medium"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
            </svg>
            Download PDF
          </a>
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-4">
        <div className="max-w-6xl mx-auto px-4 text-center">
          <p className="text-sm text-gray-500">
            This document is legally binding. Powered by{' '}
            <a href="https://itwhip.com" className="text-orange-600 hover:underline">ItWhip</a>
          </p>
        </div>
      </footer>
    </div>
  )
}
