'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams } from 'next/navigation'
import SignatureCanvas from 'react-signature-canvas'
import Image from 'next/image'

// Standard ItWhip rental agreement terms
const STANDARD_TERMS = [
  {
    title: '1. RENTAL PERIOD',
    content: 'The Renter agrees to rent the vehicle for the period specified above. Any extension of the rental period must be approved in advance by the Owner and may be subject to additional charges.'
  },
  {
    title: '2. RENTAL CHARGES',
    content: 'The Renter agrees to pay all rental charges as specified above, including but not limited to: daily rate, security deposit, delivery fees, and applicable taxes. Payment is due upon booking confirmation.'
  },
  {
    title: '3. SECURITY DEPOSIT',
    content: 'A security deposit will be held to cover potential damages, excess mileage, fuel costs, or other charges. The deposit will be refunded within 7 business days after the vehicle is returned, less any applicable deductions.'
  },
  {
    title: '4. MILEAGE POLICY',
    content: 'Mileage allowance is as agreed with the rental provider. Any excess mileage will be charged at the agreed-upon overage rate. Mileage readings at pickup and return will be documented.'
  },
  {
    title: '5. FUEL POLICY',
    content: 'The vehicle should be returned with the same fuel level as when picked up. If the vehicle is returned with less fuel, the Renter will be charged for refueling plus a service fee.'
  },
  {
    title: '6. INSURANCE REQUIREMENTS',
    content: 'The Renter must maintain valid auto insurance coverage during the rental period. The Renter agrees to provide proof of insurance upon request and assumes responsibility for any damage not covered by insurance.'
  },
  {
    title: '7. VEHICLE USE RESTRICTIONS',
    content: 'The vehicle may only be driven by authorized drivers listed on this agreement. The vehicle shall NOT be used for: racing, towing, off-road driving, transporting hazardous materials, illegal purposes, or subletting to third parties.'
  },
  {
    title: '8. DAMAGE LIABILITY',
    content: 'The Renter is responsible for any damage to the vehicle during the rental period, regardless of fault. The Renter agrees to report any accidents, damage, or mechanical issues immediately to the Owner.'
  },
  {
    title: '9. LATE RETURN',
    content: 'If the vehicle is returned late without prior approval, the Renter will be charged a late fee as specified by the Owner, which may include additional daily charges and penalties.'
  },
  {
    title: '10. VEHICLE CONDITION',
    content: 'The Renter acknowledges receiving the vehicle in good working condition and agrees to return it in the same condition, ordinary wear and tear excepted. A vehicle inspection will be conducted at pickup and return.'
  },
  {
    title: '11. ROADSIDE ASSISTANCE',
    content: 'In the event of a breakdown or emergency, the Renter should contact the Owner immediately. Unauthorized repairs may not be reimbursed.'
  },
  {
    title: '12. GOVERNING LAW',
    content: 'This agreement shall be governed by and construed in accordance with the laws of the State of Arizona. Any disputes arising from this agreement shall be resolved in the courts of Arizona.'
  },
  {
    title: '13. DISPUTE RESOLUTION',
    content: 'In the event of a dispute, the parties agree to first attempt resolution through the ItWhip platform\'s dispute resolution process before pursuing legal action.'
  },
  {
    title: '14. ELECTRONIC SIGNATURE CONSENT',
    content: 'By signing this agreement electronically, the Renter consents to conduct this transaction by electronic means and agrees that their electronic signature is legally binding under the Uniform Electronic Transactions Act (UETA) and the Electronic Signatures in Global and National Commerce Act (ESIGN).'
  }
]

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
  const [signedPdfUrl, setSignedPdfUrl] = useState<string | null>(null)

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
          setSignedPdfUrl(data.pdfUrl)
        } else {
          setStatus('error')
          setError(data.error || 'Failed to load agreement')
        }
        return
      }

      if (data.status === 'already_signed') {
        setStatus('signed')
        setSignedPdfUrl(data.pdfUrl)
        return
      }

      setAgreementData(data)
      setSignerName(data.customer?.name || '')
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

      setSignedPdfUrl(data.pdfUrl)
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
          <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <svg className="w-8 h-8 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Agreement Signed!</h1>
          <p className="text-gray-600 mb-6">
            Thank you for signing the rental agreement. A copy has been sent to the rental provider.
          </p>
          {signedPdfUrl && (
            <a
              href={signedPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block bg-orange-500 text-white px-6 py-3 rounded-lg font-medium hover:bg-orange-600 transition-colors"
            >
              Download Signed Agreement
            </a>
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
      {/* Header */}
      <header className="bg-gradient-to-r from-orange-500 to-orange-600 text-white py-6 px-4 sticky top-0 z-10">
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

          {/* Terms and Conditions */}
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Terms and Conditions</h2>

            <div className="max-h-96 overflow-y-auto pr-2 space-y-4">
              {STANDARD_TERMS.map((term, index) => (
                <div key={index}>
                  <h3 className="font-medium text-gray-900 mb-1">{term.title}</h3>
                  <p className="text-sm text-gray-600">{term.content}</p>
                </div>
              ))}

              {/* Custom Clauses */}
              {agreementData.customClauses.length > 0 && (
                <>
                  <div className="pt-4 mt-4 border-t border-gray-200">
                    <h3 className="font-medium text-gray-900 mb-3">Additional Terms (Provider-Specific)</h3>
                    {agreementData.customClauses.map((clause, index) => (
                      <div key={index} className="mb-4">
                        <h4 className="font-medium text-gray-900 mb-1">
                          {15 + index}. ADDITIONAL CLAUSE
                        </h4>
                        <p className="text-sm text-gray-600">{clause}</p>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          </div>

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
                I have read and agree to the terms and conditions above. I understand this is a legally binding agreement.
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
