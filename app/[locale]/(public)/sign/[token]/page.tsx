'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import SignatureCanvas from 'react-signature-canvas'
import Image from 'next/image'

interface AgreementData {
  booking: {
    id: string
    bookingCode: string
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    numberOfDays: number
    dailyRate: number
    totalAmount: number
    securityDeposit: number
    pickupLocation: string
    pickupType: string
  }
  vehicle: {
    year: number
    make: string
    model: string
    vin?: string
    licensePlate?: string
    color?: string
    photo?: string
  } | null
  partner: {
    companyName: string
    name: string
    email: string
    phone?: string
    city?: string
    state?: string
  } | null
  customer: {
    name: string
    email?: string
    phone?: string
  }
  customClauses: string[]
  expiresAt: string
  // Agreement preference type
  agreementType?: string // 'ITWHIP' | 'OWN' | 'BOTH'
  // Test agreement fields
  isTest?: boolean
  hostAgreementUrl?: string
  hostAgreementName?: string
  hostAgreementSections?: Array<{ id: string; title: string; content: string; icon: string }> | null
}

/** Inline accordion section for host agreement sections on the guest signing page */
function HostAgreementSectionAccordion({ section }: { section: { id: string; title: string; content: string } }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="w-full flex items-center justify-between px-4 py-3 text-left hover:bg-gray-50 transition-colors"
      >
        <span className="text-sm font-medium text-gray-800 truncate pr-2">{section.title}</span>
        <svg className={`w-4 h-4 text-gray-400 flex-shrink-0 transition-transform ${open ? 'rotate-180' : ''}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
        </svg>
      </button>
      {open && (
        <div className="px-4 pb-4 text-sm text-gray-600 leading-relaxed whitespace-pre-line">
          {section.content}
        </div>
      )}
    </div>
  )
}

export default function SignAgreementPage() {
  const params = useParams()
  const token = params.token as string

  const sigCanvas = useRef<SignatureCanvas>(null)

  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [agreementData, setAgreementData] = useState<AgreementData | null>(null)
  const [status, setStatus] = useState<'loading' | 'ready' | 'signed' | 'expired' | 'error'>('loading')

  // Form state
  const [signerName, setSignerName] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  const [hasSignature, setHasSignature] = useState(false)

  // Success state
  const [signedAgreementUrl, setSignedAgreementUrl] = useState<string | null>(null)
  const [isTestAgreement, setIsTestAgreement] = useState(false)

  useEffect(() => {
    fetchAgreement()
  }, [token])

  async function fetchAgreement() {
    try {
      setLoading(true)
      const response = await fetch(`/api/agreements/${token}`)
      const data = await response.json()

      if (!response.ok) {
        if (data.status === 'expired') {
          setStatus('expired')
          setError(data.message)
        } else if (data.status === 'already_signed') {
          setStatus('signed')
          // Prefer viewerUrl (ItWhip domain) over raw pdfUrl
          setSignedAgreementUrl(data.viewerUrl || data.pdfUrl)
        } else {
          setStatus('error')
          setError(data.error || 'Failed to load agreement')
        }
        return
      }

      if (data.status === 'already_signed') {
        setStatus('signed')
        // Prefer viewerUrl (ItWhip domain) over raw pdfUrl
        setSignedAgreementUrl(data.viewerUrl || data.pdfUrl)
        return
      }

      setAgreementData(data)
      setSignerName(data.customer?.name || '')
      if (data.isTest) {
        setIsTestAgreement(true)
      }
      setStatus('ready')
    } catch (err) {
      setStatus('error')
      setError('Failed to load agreement. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  function clearSignature() {
    if (sigCanvas.current) {
      sigCanvas.current.clear()
      setHasSignature(false)
    }
  }

  function handleSignatureEnd() {
    if (sigCanvas.current) {
      setHasSignature(!sigCanvas.current.isEmpty())
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()

    if (!sigCanvas.current || sigCanvas.current.isEmpty()) {
      alert('Please provide your signature')
      return
    }

    if (!signerName.trim()) {
      alert('Please enter your full legal name')
      return
    }

    if (!agreedToTerms) {
      alert('Please agree to the terms and conditions')
      return
    }

    try {
      setSubmitting(true)

      // Get signature as data URL (use regular canvas, not trimmed due to library compatibility)
      const signatureImage = sigCanvas.current.toDataURL('image/png')

      const response = await fetch(`/api/agreements/${token}/sign`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          signatureImage,
          signerName: signerName.trim(),
          agreedToTerms
        })
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Failed to submit signature')
      }

      // Check if this was a test agreement
      if (data.isTest) {
        setIsTestAgreement(true)
      }

      // Prefer viewerUrl (ItWhip domain) over raw pdfUrl
      setSignedAgreementUrl(data.viewerUrl || data.pdfUrl)
      setStatus('signed')
    } catch (err) {
      alert(err instanceof Error ? err.message : 'Failed to submit signature')
    } finally {
      setSubmitting(false)
    }
  }

  function formatDate(dateString: string) {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
  }

  function formatCurrency(amount: number) {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  // Loading state
  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-12 h-12 border-4 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading agreement...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (status === 'error') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agreement Not Found</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <a
            href="https://itwhip.com"
            className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
          >
            Go to ItWhip
          </a>
        </div>
      </div>
    )
  }

  // Expired state
  if (status === 'expired') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <div className="w-16 h-16 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-amber-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Link Expired</h1>
          <p className="text-gray-600 mb-6">{error}</p>
          <p className="text-sm text-gray-500">
            Please contact the rental provider for a new signing link.
          </p>
        </div>
      </div>
    )
  }

  // Already signed state
  if (status === 'signed') {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          {isTestAgreement && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg px-4 py-3 mb-6">
              <p className="text-blue-800 text-sm font-medium">Test E-Sign Preview</p>
            </div>
          )}
          <div className={`w-16 h-16 ${isTestAgreement ? 'bg-blue-100' : 'bg-green-100'} rounded-full flex items-center justify-center mx-auto mb-4`}>
            <svg className={`w-8 h-8 ${isTestAgreement ? 'text-blue-600' : 'text-green-600'}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">
            {isTestAgreement ? 'Test Complete!' : 'Agreement Signed!'}
          </h1>
          <p className="text-gray-600 mb-6">
            {isTestAgreement
              ? 'This is exactly what your guests will see when they sign your rental agreement. No actual agreement was created.'
              : 'Thank you for signing the rental agreement. A copy has been sent to your email and to the rental provider.'
            }
          </p>
          {signedAgreementUrl && !isTestAgreement && (
            <a
              href={signedAgreementUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              View Signed Agreement
            </a>
          )}
          {isTestAgreement && (
            <button
              onClick={() => window.close()}
              className="inline-block bg-blue-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-blue-600 transition-colors"
            >
              Close Preview
            </button>
          )}
          <p className="text-sm text-gray-500 mt-6">
            You can close this page now.
          </p>
        </div>
      </div>
    )
  }

  // Ready to sign state
  if (!agreementData) return null

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Test Banner */}
      {isTestAgreement && (
        <div className="bg-blue-600 text-white py-2 px-4 text-center text-sm sticky top-0 z-20">
          <span className="font-medium">Test Preview</span> - This is what your guests will see when signing agreements
        </div>
      )}

      {/* Header */}
      <header className={`bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6 px-4 sticky ${isTestAgreement ? 'top-8' : 'top-0'} z-10`}>
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3">
            <Image
              src="/logo-white.png"
              alt="ItWhip"
              width={120}
              height={32}
              className="h-8 w-auto"
            />
            <span className="text-lg font-semibold">Rental Agreement</span>
          </div>
        </div>
      </header>

      <main className="max-w-3xl mx-auto px-4 py-8">
        <form onSubmit={handleSubmit}>
          {/* Agreement Header */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              Vehicle Rental Agreement
            </h1>
            <p className="text-gray-600">
              Agreement #{agreementData.booking.bookingCode}
            </p>
          </div>

          {/* Parties */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Parties</h2>

            <div className="grid md:grid-cols-2 gap-6">
              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Owner/Provider</p>
                <p className="text-gray-900 font-medium">{agreementData.partner?.companyName}</p>
                {agreementData.partner?.email && (
                  <p className="text-sm text-gray-600">{agreementData.partner.email}</p>
                )}
                {agreementData.partner?.city && agreementData.partner?.state && (
                  <p className="text-sm text-gray-600">{agreementData.partner.city}, {agreementData.partner.state}</p>
                )}
              </div>

              <div>
                <p className="text-sm font-medium text-gray-500 mb-1">Renter</p>
                <p className="text-gray-900 font-medium">{agreementData.customer.name}</p>
                {agreementData.customer.email && (
                  <p className="text-sm text-gray-600">{agreementData.customer.email}</p>
                )}
              </div>
            </div>
          </div>

          {/* Vehicle Details */}
          {agreementData.vehicle && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Vehicle Details</h2>

              <div className="flex items-start gap-4">
                {agreementData.vehicle.photo && (
                  <Image
                    src={agreementData.vehicle.photo}
                    alt="Vehicle"
                    width={120}
                    height={80}
                    className="rounded-lg object-cover"
                  />
                )}
                <div>
                  <p className="text-lg font-medium text-gray-900">
                    {agreementData.vehicle.year} {agreementData.vehicle.make} {agreementData.vehicle.model}
                  </p>
                  {agreementData.vehicle.color && (
                    <p className="text-sm text-gray-600">Color: {agreementData.vehicle.color}</p>
                  )}
                  {agreementData.vehicle.licensePlate && (
                    <p className="text-sm text-gray-600">License: {agreementData.vehicle.licensePlate}</p>
                  )}
                  {agreementData.vehicle.vin && (
                    <p className="text-sm text-gray-600">VIN: {agreementData.vehicle.vin}</p>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Rental Period */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rental Period</h2>

            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <p className="text-sm font-medium text-gray-500">Start</p>
                <p className="text-gray-900">{formatDate(agreementData.booking.startDate)}</p>
                <p className="text-sm text-gray-600">at {agreementData.booking.startTime}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-500">End</p>
                <p className="text-gray-900">{formatDate(agreementData.booking.endDate)}</p>
                <p className="text-sm text-gray-600">at {agreementData.booking.endTime}</p>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                <strong>Duration:</strong> {agreementData.booking.numberOfDays} day(s)
              </p>
              <p className="text-sm text-gray-600">
                <strong>Pickup:</strong> {agreementData.booking.pickupLocation} ({agreementData.booking.pickupType})
              </p>
            </div>
          </div>

          {/* Pricing */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Rental Charges</h2>

            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-600">Daily Rate</span>
                <span className="text-gray-900">{formatCurrency(agreementData.booking.dailyRate)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Security Deposit</span>
                <span className="text-gray-900">{formatCurrency(agreementData.booking.securityDeposit)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-gray-100 font-semibold">
                <span className="text-gray-900">Total Amount</span>
                <span className="text-orange-600">{formatCurrency(agreementData.booking.totalAmount)}</span>
              </div>
            </div>
          </div>

          {/* ═══ AGREEMENT CONTENT — conditional on agreementType ═══ */}

          {/* Partner's Agreement (OWN or BOTH) — sections accordion or PDF fallback */}
          {(agreementData.agreementType === 'OWN' || agreementData.agreementType === 'BOTH') && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-2">
                {agreementData.partner?.companyName || 'Provider'}&apos;s Rental Agreement
              </h2>
              <p className="text-sm text-gray-600 mb-4">
                Please review the rental provider&apos;s agreement below before signing.
              </p>

              {/* Sections accordion (when AI-extracted sections exist) */}
              {agreementData.hostAgreementSections && agreementData.hostAgreementSections.length > 0 ? (
                <div className="border border-gray-200 rounded-lg overflow-hidden divide-y divide-gray-100">
                  {agreementData.hostAgreementSections.map((section) => (
                    <HostAgreementSectionAccordion key={section.id} section={section} />
                  ))}
                </div>
              ) : agreementData.hostAgreementUrl ? (
                /* Fallback: PDF iframe when no sections extracted */
                <>
                  <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <iframe
                      src={`${agreementData.hostAgreementUrl}#toolbar=1&navpanes=0`}
                      className="w-full"
                      style={{ height: '600px' }}
                      title={`${agreementData.partner?.companyName || 'Provider'} Agreement`}
                    />
                  </div>
                  <a
                    href={agreementData.hostAgreementUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-sm text-orange-600 hover:text-orange-700 mt-3"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    Open in new tab
                  </a>
                </>
              ) : null}
            </div>
          )}

          {/* BOTH: Precedence notice + ItWhip Standard Terms header */}
          {agreementData.agreementType === 'BOTH' && (
            <div className="bg-gradient-to-r from-orange-50 to-amber-50 border border-orange-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-orange-800">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
                <span className="font-medium">ItWhip Platform Terms</span>
              </div>
              <p className="text-sm text-orange-700 mt-1 ml-7">
                The following platform terms are provided by ItWhip to protect both parties. In case of conflict between these Platform Terms and the Provider&apos;s Additional Terms above, these Platform Terms shall prevail.
              </p>
            </div>
          )}

          {/* ItWhip Standard Terms (shown for ITWHIP and BOTH, hidden for OWN) */}
          {agreementData.agreementType !== 'OWN' && (
            <>
              {/* Arizona Legal Compliance */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-gray-700 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 6l3 1m0 0l-3 9a5.002 5.002 0 006.001 0M6 7l3 9M6 7l6-2m6 2l3-1m-3 1l-3 9a5.002 5.002 0 006.001 0M18 7l3 9m-3-9l-6-2m0-2v2m0 16V5m0 16H9m3 0h3" />
                  </svg>
                  <div>
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Arizona Legal Requirements</h2>
                    <p className="text-sm text-gray-600 mb-3">
                      This agreement complies with all applicable Arizona state laws governing vehicle rentals and peer-to-peer car sharing arrangements.
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• Driver eligibility verification required per A.R.S. §28-3472</li>
                      <li>• Security deposits handled per A.R.S. §33-1321</li>
                      <li>• Peer-to-peer rental compliance per A.R.S. §28-9601</li>
                      <li>• Insurance requirements per A.R.S. §20-331</li>
                      <li>• Transaction Privilege Tax collection per A.R.S. §42-5061</li>
                    </ul>
                  </div>
                </div>
              </div>

              {/* Trip Protection Coverage */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <div className="flex items-start">
                  <svg className="w-6 h-6 text-gray-700 mt-0.5 mr-3 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                  <div className="flex-1">
                    <h2 className="text-lg font-semibold text-gray-900 mb-2">Trip Protection Coverage</h2>
                    <p className="text-sm text-gray-600 mb-4">
                      This rental includes comprehensive trip protection coverage. In the event of an accident or damage, you are protected with the following coverage limits:
                    </p>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">Liability Coverage</p>
                        <p className="text-sm text-gray-600">$750,000 maximum</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">Your Deductible</p>
                        <p className="text-sm text-gray-600">As specified above</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">Personal Effects</p>
                        <p className="text-sm text-gray-600">$500 maximum</p>
                      </div>
                      <div className="bg-gray-50 rounded-lg p-3">
                        <p className="text-sm font-medium text-gray-900">Loss of Use</p>
                        <p className="text-sm text-gray-600">Covered</p>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 mt-3">
                      Coverage excludes intentional damage, driving under influence, unauthorized use, and commercial activities.
                    </p>
                  </div>
                </div>
              </div>

              {/* Terms and Conditions */}
              <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Terms and Conditions</h2>

                <div className="max-h-[500px] overflow-y-auto pr-2 space-y-6">
                  {/* Section 1: Driver Eligibility */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">1. Driver Eligibility & Requirements</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      The renter must be at least 21 years of age and possess a valid driver&apos;s license that has been active for a minimum of one year. International renters must provide a valid passport and international driving permit if their license is not in English.
                    </p>
                  </section>

                  {/* Section 2: Authorized Use */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">2. Authorized Use & Restrictions</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      The vehicle may only be operated on properly maintained roads and highways. The following uses are strictly prohibited:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• Racing, speed testing, or any type of competition</li>
                      <li>• Towing or pushing any vehicle or trailer</li>
                      <li>• Off-road driving or driving on unpaved surfaces</li>
                      <li>• Commercial use including rideshare or delivery services</li>
                      <li>• Transporting hazardous materials or illegal substances</li>
                      <li>• Driving outside Arizona without written permission</li>
                    </ul>
                  </section>

                  {/* Section 3: Renter Responsibilities */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">3. Renter Responsibilities</h3>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• Return the vehicle with the same fuel level as at pickup</li>
                      <li>• Maintain the vehicle in the same condition as received</li>
                      <li>• Lock the vehicle when unattended and safeguard keys</li>
                      <li>• Report any mechanical issues or damage immediately</li>
                      <li>• No smoking or vaping in the vehicle ($250 cleaning fee)</li>
                      <li>• No pets without prior approval ($100 cleaning fee)</li>
                      <li>• Pay all tolls, parking fees, and traffic violations</li>
                    </ul>
                  </section>

                  {/* Section 4: Accident & Emergency */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">4. Accident & Emergency Procedures</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-700 font-medium mb-2">In case of accident or emergency:</p>
                      <ol className="text-sm text-gray-600 space-y-1 list-decimal ml-4">
                        <li>Ensure safety of all parties and call 911 if needed</li>
                        <li>Contact local police and obtain report number</li>
                        <li>Document scene with photos of all damage</li>
                        <li>Exchange information with all parties involved</li>
                        <li>Report to owner and ItWhip support immediately</li>
                        <li>Do not admit fault to anyone except police</li>
                      </ol>
                    </div>
                  </section>

                  {/* Section 5: Cancellation Policy */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">5. Cancellation Policy</h3>
                    <div className="grid grid-cols-4 gap-2 mb-2">
                      <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="text-sm font-semibold text-gray-900">72+ hrs</div>
                        <div className="text-xs text-gray-600">100% refund</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="text-sm font-semibold text-gray-900">24-72 hrs</div>
                        <div className="text-xs text-gray-600">75% refund</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="text-sm font-semibold text-gray-900">12-24 hrs</div>
                        <div className="text-xs text-gray-600">50% refund</div>
                      </div>
                      <div className="text-center p-2 bg-gray-50 rounded border border-gray-200">
                        <div className="text-sm font-semibold text-gray-900">&lt;12 hrs</div>
                        <div className="text-xs text-gray-600">No refund</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500">Service fees are non-refundable. No-shows forfeit entire payment.</p>
                  </section>

                  {/* Section 6: Security Deposit */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">6. Security Deposit Return Process</h3>
                    <p className="text-sm text-gray-600 mb-2">
                      Your security deposit is fully refundable when you meet these conditions:
                    </p>
                    <ul className="text-sm text-gray-600 space-y-1 ml-4">
                      <li>• <strong>On-Time Return:</strong> Within 30-minute grace period</li>
                      <li>• <strong>Fuel Level:</strong> Match the level at pickup</li>
                      <li>• <strong>Vehicle Condition:</strong> Normal wear accepted</li>
                      <li>• <strong>Interior:</strong> No smoking odor, excessive dirt, or stains</li>
                      <li>• <strong>Mileage:</strong> Stay within agreed mileage allowance</li>
                    </ul>
                    <div className="bg-amber-50 rounded-lg p-3 mt-3 border border-amber-200">
                      <p className="text-sm text-amber-800">
                        <strong>Timeline (Per A.R.S. §33-1321):</strong> Deposit released within 7-14 business days to original payment method.
                      </p>
                    </div>
                  </section>

                  {/* Section 7: Platform Facilitator */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">7. Platform Facilitator Disclosure</h3>
                    <div className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                      <p className="text-sm text-gray-600 mb-2">
                        <strong>Important:</strong> This rental agreement is entered into directly between the vehicle owner and the renter. ItWhip Technologies, Inc. operates solely as a marketplace facilitator under Arizona law (A.R.S. §42-5001) and is not a party to this rental contract.
                      </p>
                      <p className="text-sm text-gray-600">
                        The platform provides technology services including payment processing, messaging, and trip coordination. Any disputes regarding vehicle condition, availability, or rental terms are between host and guest.
                      </p>
                    </div>
                  </section>

                  {/* Section 8: Electronic Signature */}
                  <section>
                    <h3 className="text-sm font-semibold text-gray-900 mb-2">8. Electronic Signature Consent</h3>
                    <p className="text-sm text-gray-600">
                      By signing this agreement electronically, the Renter consents to conduct this transaction by electronic means and agrees that their electronic signature is legally binding under the Uniform Electronic Transactions Act (UETA) and the Electronic Signatures in Global and National Commerce Act (ESIGN).
                    </p>
                  </section>

                  {/* Custom Clauses */}
                  {agreementData.customClauses.length > 0 && (
                    <section className="pt-4 border-t border-gray-200">
                      <h3 className="text-sm font-semibold text-gray-900 mb-3">Additional Terms (Provider-Specific)</h3>
                      {agreementData.customClauses.map((clause, index) => (
                        <div key={index} className="mb-4 bg-orange-50 rounded-lg p-4 border border-orange-200">
                          <h4 className="text-sm font-medium text-gray-900 mb-1">
                            Additional Clause {index + 1}
                          </h4>
                          <p className="text-sm text-gray-600">{clause}</p>
                        </div>
                      ))}
                    </section>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Signature Section */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Electronic Signature</h2>

            <p className="text-sm text-gray-600 mb-6">
              By signing below, you acknowledge that you have read, understood, and agree to be bound by all terms and conditions of this Vehicle Rental Agreement.
            </p>

            {/* Agreement Checkbox */}
            <label className="flex items-start gap-3 mb-6 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-1 w-5 h-5 rounded border-gray-300 text-orange-500 focus:ring-orange-500"
              />
              <span className="text-sm text-gray-700">
                {agreementData.agreementType === 'OWN'
                  ? `I have reviewed ${agreementData.partner?.companyName || 'the provider'}'s rental agreement and agree to be bound by its terms. I understand this is a legally binding agreement.`
                  : agreementData.agreementType === 'BOTH'
                    ? `I have reviewed both ${agreementData.partner?.companyName || 'the provider'}'s rental agreement and the ItWhip Platform Terms above. I agree to be bound by all terms. I understand this is a legally binding agreement.`
                    : 'I have read and agree to the terms and conditions above. I understand this is a legally binding agreement.'
                }
              </span>
            </label>

            {/* Name Input */}
            <div className="mb-6">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Full Legal Name
              </label>
              <input
                type="text"
                value={signerName}
                onChange={(e) => setSignerName(e.target.value)}
                placeholder="Enter your full legal name"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                required
              />
            </div>

            {/* Signature Canvas */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Your Signature
              </label>
              <div className={`relative border-2 rounded-lg overflow-hidden transition-colors ${
                hasSignature ? 'border-orange-500' : 'border-gray-300'
              }`}>
                <SignatureCanvas
                  ref={sigCanvas}
                  penColor="#000000"
                  canvasProps={{
                    className: 'signature-canvas w-full',
                    style: {
                      width: '100%',
                      height: '200px',
                      touchAction: 'none'
                    }
                  }}
                  onEnd={handleSignatureEnd}
                  backgroundColor="#ffffff"
                />

                {!hasSignature && (
                  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                    <span className="text-gray-400">Sign here</span>
                  </div>
                )}
              </div>

              <div className="flex items-center justify-between mt-2">
                <button
                  type="button"
                  onClick={clearSignature}
                  className="text-sm text-orange-600 hover:text-orange-700"
                  disabled={!hasSignature}
                >
                  Clear Signature
                </button>
                {hasSignature && (
                  <span className="text-xs text-green-600 flex items-center gap-1">
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                    </svg>
                    Signature captured
                  </span>
                )}
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting || !hasSignature || !agreedToTerms || !signerName.trim()}
              className={`w-full py-4 rounded-lg font-semibold text-white transition-colors ${
                submitting || !hasSignature || !agreedToTerms || !signerName.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-orange-500 hover:bg-orange-600'
              }`}
            >
              {submitting ? (
                <span className="flex items-center justify-center gap-2">
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Processing...
                </span>
              ) : (
                'Sign & Submit Agreement'
              )}
            </button>

            <p className="text-xs text-gray-500 text-center mt-4">
              By signing, you agree this electronic signature is legally binding under UETA and ESIGN Act.
            </p>
          </div>
        </form>
      </main>

      {/* Footer */}
      <footer className="bg-gray-100 border-t border-gray-200 py-6 px-4">
        <div className="max-w-3xl mx-auto text-center">
          <p className="text-sm text-gray-500">
            Powered by <a href="https://itwhip.com" className="text-orange-600 hover:underline">ItWhip</a> - The trusted car rental marketplace
          </p>
        </div>
      </footer>
    </div>
  )
}
