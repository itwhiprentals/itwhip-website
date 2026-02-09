// app/admin/rentals/verifications/[id]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { 
  IoArrowBackOutline,
  IoDocumentTextOutline,
  IoPersonOutline,
  IoCarOutline,
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTimeOutline,
  IoExpandOutline,
  IoWarningOutline,
  IoDownloadOutline,
  IoEyeOutline,
  IoCardOutline,
  IoInformationCircleOutline,
  IoRefreshOutline,
  IoShieldCheckmarkOutline,
  IoSpeedometerOutline,
  IoFlashOutline,
  IoCashOutline,
  IoReceiptOutline,
  IoFlagOutline,
  IoCalculatorOutline,
  IoCheckboxOutline,
  IoSquareOutline,
  IoRemoveCircleOutline,
  IoAddCircleOutline
} from 'react-icons/io5'

interface ChargeLineItem {
  type: 'mileage' | 'fuel' | 'late' | 'damage' | 'cleaning'
  label: string
  originalAmount: number
  adjustedAmount: number
  included: boolean
  details?: string
}

interface TripCharges {
  total: number
  breakdown: Array<{
    label: string
    amount: number
    details?: string
  }>
  mileageOverage?: number
  fuelCharge?: number
  lateReturnCharge?: number
  damageCharge?: number
  cleaningCharge?: number
}

interface TripCharge {
  id: string
  totalCharges: number
  chargeStatus: string
  mileageCharge?: number
  fuelCharge?: number
  lateCharge?: number
  damageCharge?: number
  cleaningCharge?: number
  disputes?: string
  failureReason?: string
}

interface Booking {
  id: string
  bookingCode: string
  guestName: string
  guestEmail: string
  guestPhone: string
  licensePhotoUrl?: string
  insurancePhotoUrl?: string
  selfiePhotoUrl?: string
  licenseNumber?: string
  licenseState?: string
  licenseExpiry?: string
  dateOfBirth?: string
  documentsSubmittedAt?: string
  verificationStatus: string
  verificationNotes?: string
  
  // Payment fields
  stripeCustomerId?: string
  stripePaymentMethodId?: string
  paymentIntentId?: string
  paymentStatus: string
  paymentProcessedAt?: string
  paymentFailureReason?: string
  last4?: string
  
  // Risk assessment
  riskScore?: number
  riskFlags?: string
  fraudulent?: boolean
  flaggedForReview?: boolean
  
  // Pricing
  totalAmount: number
  depositAmount: number
  serviceFee: number
  taxes: number
  pendingChargesAmount?: number
  
  // Trip fields
  tripStatus?: string
  tripStartedAt?: string | Date | null
  tripEndedAt?: string | Date | null
  startMileage?: number
  endMileage?: number
  fuelLevelStart?: string
  fuelLevelEnd?: string
  actualStartTime?: string | Date | null
  actualEndTime?: string | Date | null
  numberOfDays?: number
  damageReported?: boolean
  damageDescription?: string
  notes?: string
  chargesNotes?: string
  
  // Trip charges from relation
  tripCharges?: TripCharge[]
  
  // Disputes
  disputes?: Array<{
    id: string
    type: string
    description: string
    status: string
    createdAt: string
  }>
  
  // AI verification
  aiVerificationResult?: {
    quickVerifyPassed?: boolean
    confidence?: number
    data?: {
      fullName?: string
      dateOfBirth?: string
      licenseNumber?: string
      expirationDate?: string
      stateOrCountry?: string
      address?: string
    }
    extractedFields?: Record<string, { value: string | null; confidence: number; rawText?: string }>
    securityFeatures?: {
      detected: string[]
      notDetected: string[]
      obscured: string[]
      assessment: 'PASS' | 'REVIEW' | 'FAIL'
    }
    photoQuality?: {
      lighting: string
      angle: string
      focus: string
      glare: string
      cropping: string
    }
    stateSpecificChecks?: {
      formatValid: boolean
      expirationNormal: boolean
      cardOrientation: string
      realIdCompliant: boolean | null
      notes: string
    }
    validation?: {
      isExpired: boolean
      isValid: boolean
      nameMatch: boolean
      nameComparison?: {
        match: boolean
        dlParsed: { first: string; middle?: string; last: string; raw: string }
        bookingParsed: { first: string; last: string; raw: string }
        mismatchDetails?: string
      }
      ageValid: boolean
      criticalFlags: string[]
      informationalFlags: string[]
    }
    error?: string
    success?: boolean
  } | null
  aiVerificationScore?: number | null
  aiVerificationAt?: string | null
  aiVerificationModel?: string | null

  // Back of license
  licenseBackPhotoUrl?: string

  car: {
    make: string
    model: string
    year: number
    photos: Array<{ url: string }>
    host: {
      name: string
      email: string
      phone?: string
    }
  }
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  pickupLocation: string
  pickupType: string
}

// ─── Claude AI Verification Panel ─────────────────────────────────────────
function AIVerificationPanel({ booking }: { booking: Booking }) {
  const ai = booking.aiVerificationResult
  if (!ai) return null

  // Error state
  if (ai.success === false || ai.error) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-lg shadow p-6">
        <h2 className="text-lg font-semibold mb-3 flex items-center text-red-800">
          <IoShieldCheckmarkOutline className="mr-2" />
          Claude AI Analysis
          <span className="ml-2 px-2 py-0.5 text-xs bg-red-100 text-red-700 rounded-full">Error</span>
        </h2>
        <p className="text-sm text-red-700">{ai.error || 'AI verification failed'}</p>
      </div>
    )
  }

  const passed = ai.quickVerifyPassed
  const score = ai.confidence ?? booking.aiVerificationScore ?? 0
  const validation = ai.validation
  const fields = ai.extractedFields
  const security = ai.securityFeatures
  const photoQ = ai.photoQuality
  const stateChecks = ai.stateSpecificChecks

  // Score color
  const scoreColor = score >= 85 ? 'green' : score >= 60 ? 'yellow' : 'red'
  const scoreLabel = score >= 85 ? 'High Confidence' : score >= 60 ? 'Moderate' : 'Low Confidence'

  // Comparison rows
  const comparisonRows = [
    {
      label: 'Name',
      extracted: ai.data?.fullName || fields?.fullName?.value || '—',
      provided: booking.guestName || '—',
      match: validation?.nameMatch,
      confidence: fields?.fullName?.confidence,
    },
    {
      label: 'DOB',
      extracted: ai.data?.dateOfBirth || fields?.dateOfBirth?.value || '—',
      provided: booking.dateOfBirth ? new Date(booking.dateOfBirth).toLocaleDateString() : '—',
      match: ai.data?.dateOfBirth && booking.dateOfBirth
        ? ai.data.dateOfBirth === new Date(booking.dateOfBirth).toISOString().split('T')[0]
        : undefined,
      confidence: fields?.dateOfBirth?.confidence,
    },
    {
      label: 'License #',
      extracted: ai.data?.licenseNumber || fields?.licenseNumber?.value || '—',
      provided: booking.licenseNumber || '—',
      match: ai.data?.licenseNumber && booking.licenseNumber
        ? ai.data.licenseNumber.replace(/[\s-]/g, '').toLowerCase() === booking.licenseNumber.replace(/[\s-]/g, '').toLowerCase()
        : undefined,
      confidence: fields?.licenseNumber?.confidence,
    },
    {
      label: 'Expiration',
      extracted: ai.data?.expirationDate || fields?.expirationDate?.value || '—',
      provided: booking.licenseExpiry || '—',
      match: stateChecks?.expirationNormal !== false ? true : undefined,
      confidence: fields?.expirationDate?.confidence,
    },
    {
      label: 'State',
      extracted: ai.data?.stateOrCountry || fields?.state?.value || '—',
      provided: booking.licenseState || '—',
      match: ai.data?.stateOrCountry && booking.licenseState
        ? ai.data.stateOrCountry.toUpperCase() === booking.licenseState.toUpperCase()
        : undefined,
      confidence: fields?.state?.confidence,
    },
  ]

  const getConfidenceBadge = (conf?: number) => {
    if (conf === undefined || conf === null) return null
    const color = conf >= 90 ? 'green' : conf >= 70 ? 'yellow' : 'red'
    return (
      <span className={`text-xs px-1.5 py-0.5 rounded bg-${color}-100 text-${color}-700`}>
        {conf}%
      </span>
    )
  }

  const getMatchIcon = (match?: boolean) => {
    if (match === undefined) return <span className="text-gray-400">—</span>
    return match
      ? <IoCheckmarkCircle className="text-green-500 text-lg" />
      : <IoCloseCircle className="text-red-500 text-lg" />
  }

  const photoQualityIcon = (val?: string) => {
    if (!val) return null
    const good = ['good', 'straight', 'clear', 'none', 'full_card']
    const ok = ['adequate', 'slight_tilt', 'slightly_blurry', 'minor', 'partial']
    if (good.includes(val)) return <span className="w-2 h-2 rounded-full bg-green-500 inline-block" />
    if (ok.includes(val)) return <span className="w-2 h-2 rounded-full bg-yellow-500 inline-block" />
    return <span className="w-2 h-2 rounded-full bg-red-500 inline-block" />
  }

  return (
    <div className={`rounded-lg shadow p-6 border-2 ${
      passed ? 'bg-green-50 border-green-200' : score >= 60 ? 'bg-yellow-50 border-yellow-200' : 'bg-red-50 border-red-200'
    }`}>
      {/* Header with score */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-lg font-semibold flex items-center">
          <IoShieldCheckmarkOutline className="mr-2" />
          Claude AI Analysis
        </h2>
        <div className="flex items-center gap-3">
          {booking.aiVerificationModel && (
            <span className="text-xs text-gray-500">{booking.aiVerificationModel}</span>
          )}
          {booking.aiVerificationAt && (
            <span className="text-xs text-gray-500">
              {new Date(booking.aiVerificationAt).toLocaleString()}
            </span>
          )}
        </div>
      </div>

      {/* Status Banner */}
      <div className={`rounded-lg p-4 mb-4 ${
        passed ? 'bg-green-100' : score >= 60 ? 'bg-yellow-100' : 'bg-red-100'
      }`}>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className={`w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold ${
              scoreColor === 'green' ? 'bg-green-200 text-green-800' :
              scoreColor === 'yellow' ? 'bg-yellow-200 text-yellow-800' :
              'bg-red-200 text-red-800'
            }`}>
              {score}
            </div>
            <div>
              <p className={`font-semibold ${
                passed ? 'text-green-800' : score >= 60 ? 'text-yellow-800' : 'text-red-800'
              }`}>
                {passed ? 'AI Recommends: APPROVE' : score >= 60 ? 'AI Recommends: MANUAL REVIEW' : 'AI Recommends: REJECT'}
              </p>
              <p className={`text-sm ${
                passed ? 'text-green-700' : score >= 60 ? 'text-yellow-700' : 'text-red-700'
              }`}>
                {scoreLabel} &middot; {validation?.criticalFlags?.length || 0} critical flags &middot; {validation?.informationalFlags?.length || 0} info flags
              </p>
            </div>
          </div>
          <div className="text-right">
            <p className="text-xs text-gray-600">Age Valid</p>
            <p className="font-medium">{validation?.ageValid !== false ? 'Yes' : 'No'}</p>
          </div>
        </div>
      </div>

      {/* Extraction Comparison Table */}
      <div className="mb-4">
        <h3 className="text-sm font-semibold text-gray-700 mb-2">Extraction Comparison</h3>
        <div className="overflow-hidden rounded-lg border border-gray-200">
          <table className="w-full text-sm">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Field</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Claude Extracted</th>
                <th className="px-3 py-2 text-left text-xs font-medium text-gray-500">Guest Provided</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Conf</th>
                <th className="px-3 py-2 text-center text-xs font-medium text-gray-500">Match</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-100">
              {comparisonRows.map((row) => (
                <tr key={row.label}>
                  <td className="px-3 py-2 font-medium text-gray-700">{row.label}</td>
                  <td className="px-3 py-2 text-gray-900 font-mono text-xs">{row.extracted}</td>
                  <td className="px-3 py-2 text-gray-600 text-xs">{row.provided}</td>
                  <td className="px-3 py-2 text-center">{getConfidenceBadge(row.confidence)}</td>
                  <td className="px-3 py-2 text-center">{getMatchIcon(row.match)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        {/* Name comparison detail */}
        {validation?.nameComparison && !validation.nameComparison.match && (
          <div className="mt-2 p-2 bg-red-50 border border-red-100 rounded text-xs text-red-700">
            <strong>Name parsing:</strong> DL parsed as &ldquo;{validation.nameComparison.dlParsed.first} {validation.nameComparison.dlParsed.last}&rdquo;,
            booking parsed as &ldquo;{validation.nameComparison.bookingParsed.first} {validation.nameComparison.bookingParsed.last}&rdquo;
            {validation.nameComparison.mismatchDetails && ` — ${validation.nameComparison.mismatchDetails}`}
          </div>
        )}
      </div>

      {/* Security Features */}
      {security && (
        <div className="mb-4">
          <h3 className="text-sm font-semibold text-gray-700 mb-2 flex items-center justify-between">
            Security Features
            <span className={`px-2 py-0.5 text-xs rounded-full ${
              security.assessment === 'PASS' ? 'bg-green-100 text-green-700' :
              security.assessment === 'REVIEW' ? 'bg-yellow-100 text-yellow-700' :
              'bg-red-100 text-red-700'
            }`}>
              {security.assessment}
            </span>
          </h3>
          <div className="grid grid-cols-1 gap-1 text-xs">
            {security.detected.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <IoCheckmarkCircle className="text-green-500 flex-shrink-0" />
                <span className="text-gray-700">{f}</span>
              </div>
            ))}
            {security.obscured.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <IoWarningOutline className="text-yellow-500 flex-shrink-0" />
                <span className="text-gray-600">{f}</span>
              </div>
            ))}
            {security.notDetected.map((f, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <span className="w-4 h-4 flex items-center justify-center text-gray-400 flex-shrink-0">—</span>
                <span className="text-gray-400">{f}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Photo Quality + State Checks row */}
      <div className="grid grid-cols-2 gap-4 mb-4">
        {/* Photo Quality */}
        {photoQ && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">Photo Quality</h3>
            <div className="space-y-1 text-xs">
              {Object.entries(photoQ).map(([key, val]) => (
                <div key={key} className="flex items-center justify-between">
                  <span className="text-gray-600 capitalize">{key}</span>
                  <div className="flex items-center gap-1.5">
                    {photoQualityIcon(val)}
                    <span className="text-gray-700 capitalize">{val?.replace(/_/g, ' ')}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* State-Specific */}
        {stateChecks && (
          <div>
            <h3 className="text-sm font-semibold text-gray-700 mb-2">State Checks</h3>
            <div className="space-y-1 text-xs">
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Format Valid</span>
                {getMatchIcon(stateChecks.formatValid)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Expiration Normal</span>
                {getMatchIcon(stateChecks.expirationNormal)}
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">Orientation</span>
                <span className="text-gray-700 capitalize">{stateChecks.cardOrientation}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-600">REAL ID</span>
                {stateChecks.realIdCompliant === null
                  ? <span className="text-gray-400">Unknown</span>
                  : getMatchIcon(stateChecks.realIdCompliant)}
              </div>
              {stateChecks.notes && (
                <p className="text-gray-500 mt-1 italic">{stateChecks.notes}</p>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Flags */}
      {((validation?.criticalFlags?.length || 0) > 0 || (validation?.informationalFlags?.length || 0) > 0) && (
        <div>
          {validation?.criticalFlags && validation.criticalFlags.length > 0 && (
            <div className="mb-2">
              <h3 className="text-sm font-semibold text-red-700 mb-1">Critical Flags</h3>
              <ul className="text-xs text-red-700 space-y-1">
                {validation.criticalFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <IoCloseCircle className="text-red-500 flex-shrink-0 mt-0.5" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {validation?.informationalFlags && validation.informationalFlags.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold text-yellow-700 mb-1">Informational Flags</h3>
              <ul className="text-xs text-yellow-700 space-y-1">
                {validation.informationalFlags.map((flag, i) => (
                  <li key={i} className="flex items-start gap-1.5">
                    <IoInformationCircleOutline className="text-yellow-500 flex-shrink-0 mt-0.5" />
                    {flag}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

export default function VerificationReviewPage() {
  const params = useParams()
  const router = useRouter()
  const bookingId = params.id as string
  
  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [processing, setProcessing] = useState(false)
  const [notes, setNotes] = useState('')
  const [expandedImage, setExpandedImage] = useState<string | null>(null)
  const [error, setError] = useState('')
  const [paymentStatus, setPaymentStatus] = useState<'checking' | 'ready' | 'processing' | 'captured' | 'failed' | 'none'>('checking')
  
  // Charge adjustment states
  const [charges, setCharges] = useState<TripCharges | null>(null)
  const [isPostTrip, setIsPostTrip] = useState(false)
  const [chargeLineItems, setChargeLineItems] = useState<ChargeLineItem[]>([])
  const [waivePercentage, setWaivePercentage] = useState<number>(0)
  const [waiveReason, setWaiveReason] = useState('')
  const [showWaiveDialog, setShowWaiveDialog] = useState(false)
  const [showAdjustmentPanel, setShowAdjustmentPanel] = useState(false)
  const [customWaiveAmount, setCustomWaiveAmount] = useState<number>(0)
  const [selectedWaiveType, setSelectedWaiveType] = useState<'percentage' | 'amount'>('percentage')

  useEffect(() => {
    fetchBookingDetails()
  }, [bookingId])

  const fetchBookingDetails = async () => {
    try {
      const response = await fetch(`/api/admin/rentals/verifications/${bookingId}/approve`)
      if (!response.ok) throw new Error('Failed to fetch booking')
      
      const data = await response.json()
      setBooking(data)
      setNotes(data.verificationNotes || '')
      
      // FIXED: Check if this is a post-trip charge review (uppercase)
      if (data.verificationStatus === 'PENDING_CHARGES' || 
          (data.tripEndedAt && data.tripCharges && data.tripCharges.length > 0)) {
        setIsPostTrip(true)
        
        // FIXED: Parse charges from the proper sources
        let chargesProcessed = false
        
        // First check for tripCharges relation (most reliable)
        if (data.tripCharges && data.tripCharges.length > 0) {
          const tripCharge = data.tripCharges[0] as TripCharge
          const chargeBreakdown = []
          
          if (tripCharge.mileageCharge && Number(tripCharge.mileageCharge) > 0) {
            chargeBreakdown.push({
              label: 'Mileage Overage',
              amount: Number(tripCharge.mileageCharge),
              details: `Additional miles driven`
            })
          }
          
          if (tripCharge.fuelCharge && Number(tripCharge.fuelCharge) > 0) {
            chargeBreakdown.push({
              label: 'Fuel Charge',
              amount: Number(tripCharge.fuelCharge),
              details: `Fuel refill required`
            })
          }
          
          if (tripCharge.lateCharge && Number(tripCharge.lateCharge) > 0) {
            chargeBreakdown.push({
              label: 'Late Return',
              amount: Number(tripCharge.lateCharge),
              details: `Vehicle returned late`
            })
          }
          
          if (tripCharge.damageCharge && Number(tripCharge.damageCharge) > 0) {
            chargeBreakdown.push({
              label: 'Damage',
              amount: Number(tripCharge.damageCharge),
              details: data.damageDescription || 'Damage reported'
            })
          }
          
          if (tripCharge.cleaningCharge && Number(tripCharge.cleaningCharge) > 0) {
            chargeBreakdown.push({
              label: 'Cleaning',
              amount: Number(tripCharge.cleaningCharge),
              details: 'Additional cleaning required'
            })
          }
          
          const parsedCharges = {
            total: Number(tripCharge.totalCharges),
            breakdown: chargeBreakdown
          }
          
          setCharges(parsedCharges)
          initializeChargeLineItems(parsedCharges)
          chargesProcessed = true
        }
        
        // Fallback to chargesNotes if no tripCharges
        if (!chargesProcessed && data.chargesNotes) {
          try {
            // Try parsing from chargesNotes
            const parsedCharges = JSON.parse(data.chargesNotes)
            setCharges(parsedCharges)
            initializeChargeLineItems(parsedCharges)
            chargesProcessed = true
          } catch (e) {
            console.log('Could not parse chargesNotes, calculating manually')
          }
        }
        
        // If still no charges found, calculate from booking data
        if (!chargesProcessed && data.tripEndedAt) {
          calculateCharges(data)
        }
      }
      
      // Determine payment status with last4 extraction
      if (data.stripePaymentMethodId) {
        setPaymentStatus('ready')
        if (!data.last4 && data.stripePaymentMethodId) {
          data.last4 = data.stripePaymentMethodId.slice(-4)
        }
      } else if (data.paymentIntentId && (data.paymentStatus === 'PAID' || data.paymentStatus === 'CHARGES_PAID')) {
        setPaymentStatus('captured')
      } else if (data.paymentStatus === 'FAILED') {
        setPaymentStatus('failed')
      } else {
        setPaymentStatus('none')
      }
    } catch (error) {
      console.error('Error fetching booking:', error)
      setError('Failed to load booking details')
    } finally {
      setLoading(false)
    }
  }

  const calculateCharges = (bookingData: Booking) => {
    const breakdown = []
    let total = 0
    
    // Mileage overage
    if (bookingData.startMileage && bookingData.endMileage) {
      const actualMiles = bookingData.endMileage - bookingData.startMileage
      const includedMiles = (bookingData.numberOfDays || 1) * 200
      const overageMiles = Math.max(0, actualMiles - includedMiles)
      if (overageMiles > 0) {
        const mileageCharge = overageMiles * 0.45
        breakdown.push({
          label: 'Mileage Overage',
          amount: mileageCharge,
          details: `${overageMiles} miles over limit`
        })
        total += mileageCharge
      }
    }
    
    // Fuel charge
    if (bookingData.fuelLevelStart && bookingData.fuelLevelEnd) {
      const fuelLevels: Record<string, number> = { 'Full': 4, '3/4': 3, '1/2': 2, '1/4': 1, 'Empty': 0 }
      const startLevel = fuelLevels[bookingData.fuelLevelStart] || 4
      const endLevel = fuelLevels[bookingData.fuelLevelEnd] || 4
      
      if (endLevel < startLevel) {
        const fuelDifference = startLevel - endLevel
        const fuelCharge = fuelDifference * 75 // $75 per quarter tank
        breakdown.push({
          label: 'Fuel Refill',
          amount: fuelCharge,
          details: `From ${bookingData.fuelLevelEnd} to ${bookingData.fuelLevelStart}`
        })
        total += fuelCharge
      }
    }
    
    // Late return
    if (bookingData.actualEndTime && bookingData.endDate) {
      const scheduledEnd = new Date(bookingData.endDate)
      const actualEnd = new Date(bookingData.actualEndTime)
      if (actualEnd > scheduledEnd) {
        const lateHours = Math.ceil((actualEnd.getTime() - scheduledEnd.getTime()) / (1000 * 60 * 60))
        const lateCharge = lateHours * 25
        breakdown.push({
          label: 'Late Return',
          amount: lateCharge,
          details: `${lateHours} hours late`
        })
        total += lateCharge
      }
    }
    
    // Damage charge
    if (bookingData.damageReported) {
      const damageCharge = 500 // Base damage charge
      breakdown.push({
        label: 'Damage',
        amount: damageCharge,
        details: bookingData.damageDescription || 'Reported damage'
      })
      total += damageCharge
    }
    
    const calculatedCharges = { total, breakdown }
    setCharges(calculatedCharges)
    initializeChargeLineItems(calculatedCharges)
  }

  const initializeChargeLineItems = (chargeData: TripCharges) => {
    const items: ChargeLineItem[] = []
    
    chargeData.breakdown.forEach(item => {
      let type: ChargeLineItem['type'] = 'mileage'
      if (item.label.toLowerCase().includes('fuel')) type = 'fuel'
      else if (item.label.toLowerCase().includes('late')) type = 'late'
      else if (item.label.toLowerCase().includes('damage')) type = 'damage'
      else if (item.label.toLowerCase().includes('cleaning')) type = 'cleaning'
      
      items.push({
        type,
        label: item.label,
        originalAmount: item.amount,
        adjustedAmount: item.amount,
        included: true,
        details: item.details
      })
    })
    
    setChargeLineItems(items)
  }

  const handleChargeToggle = (index: number) => {
    const newItems = [...chargeLineItems]
    newItems[index].included = !newItems[index].included
    setChargeLineItems(newItems)
  }

  const handleChargeAdjustment = (index: number, newAmount: number) => {
    const newItems = [...chargeLineItems]
    newItems[index].adjustedAmount = Math.max(0, newAmount)
    setChargeLineItems(newItems)
  }

  const calculateAdjustedTotal = () => {
    return chargeLineItems.reduce((sum, item) => {
      return sum + (item.included ? item.adjustedAmount : 0)
    }, 0)
  }

  const calculateWaivedAmount = (percentage: number) => {
    const total = calculateAdjustedTotal()
    return (total * percentage) / 100
  }

  const handleQuickWaive = (percentage: number) => {
    setWaivePercentage(percentage)
    setSelectedWaiveType('percentage')
    setShowWaiveDialog(true)
  }

  const handleCustomWaive = () => {
    const total = calculateAdjustedTotal()
    if (selectedWaiveType === 'amount') {
      const percentage = Math.min(100, (customWaiveAmount / total) * 100)
      setWaivePercentage(percentage)
    }
    setShowWaiveDialog(true)
  }

  const getRiskBadge = () => {
    if (!booking?.riskScore) return null
    
    const score = booking.riskScore
    let color = 'green'
    let text = 'Low Risk'
    
    if (score >= 70) {
      color = 'red'
      text = 'High Risk'
    } else if (score >= 40) {
      color = 'yellow'
      text = 'Medium Risk'
    }
    
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded-full bg-${color}-100 text-${color}-800`}>
        Risk Score: {score} - {text}
      </span>
    )
  }

  const handleAction = async (action: string) => {
    if (!notes.trim() && (action === 'reject' || action === 'waive' || action === 'partial_waive')) {
      setError('Please provide a reason')
      return
    }

    setProcessing(true)
    setError('')

    try {
      const payload: any = {
        action,
        notes: notes.trim() || (action === 'approve' ? 
          (isPostTrip ? 'Charges approved' : 'Documents verified successfully') : 
          'Verification requirements not met'),
        isPostTrip
      }

      // Add charge-specific data for post-trip actions
      if (isPostTrip) {
        payload.charges = {
          total: calculateAdjustedTotal(),
          breakdown: chargeLineItems.filter(item => item.included).map(item => ({
            label: item.label,
            amount: item.adjustedAmount,
            details: item.details
          }))
        }

        if (action === 'partial_waive') {
          payload.waivePercentage = waivePercentage
          payload.waiveReason = waiveReason || notes
        } else if (action === 'waive') {
          payload.waiveReason = waiveReason || notes
        } else if (action === 'adjust') {
          payload.chargeAdjustments = chargeLineItems.map(item => ({
            type: item.type,
            originalAmount: item.originalAmount,
            adjustedAmount: item.adjustedAmount,
            included: item.included,
            reason: notes
          }))
        } else if (action === 'process_charges') {
          // Keep action as 'process_charges' - backend expects this for post-trip
          // Don't change the action
        }
      }

      const response = await fetch(`/api/admin/rentals/verifications/${bookingId}/approve`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || 'Action failed')
      }

      const result = await response.json()
      
      // Show appropriate success message
      let successMessage = ''
      if (isPostTrip) {
        if (action === 'process_charges' && result.chargeResult?.status === 'succeeded') {
          successMessage = `✅ Charges processed successfully!\n\nAmount: $${calculateAdjustedTotal().toFixed(2)}`
        } else if (action === 'waive') {
          successMessage = '✅ All charges waived successfully'
        } else if (action === 'partial_waive') {
          successMessage = `✅ ${waivePercentage}% of charges waived successfully`
        } else if (action === 'adjust') {
          successMessage = '✅ Adjusted charges processed successfully'
        } else if (result.chargeResult?.status === 'failed') {
          successMessage = `⚠️ Charge attempt failed!\n\nReason: ${result.chargeResult.error}`
        }
      } else {
        if (action === 'approve' && result.paymentResult?.status === 'succeeded') {
          successMessage = `✅ Booking approved and payment captured!\n\nAmount: $${booking?.totalAmount.toFixed(2)}`
        } else if (action === 'approve') {
          successMessage = '✅ Booking approved successfully!'
        } else {
          successMessage = 'Booking rejected'
        }
      }

      alert(successMessage)
      router.push('/admin/rentals/verifications')
    } catch (error: any) {
      setError(error.message || 'Failed to process action')
    } finally {
      setProcessing(false)
    }
  }

  if (loading) {
    return (
      <div className="p-6 flex justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-900"></div>
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="p-6">
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded">
          Booking not found
        </div>
      </div>
    )
  }

  const isTestMode = booking.stripeCustomerId?.startsWith('cus_test') || 
                     booking.paymentIntentId?.startsWith('pi_test') ||
                     !booking.stripeCustomerId

  const adjustedTotal = calculateAdjustedTotal()
  const originalTotal = charges?.total || 0
  const totalReduction = originalTotal - adjustedTotal

  // Check if charges are already processed
  const chargesAlreadyProcessed = booking.verificationStatus === 'COMPLETED' || 
                                  booking.paymentStatus === 'CHARGES_PAID' ||
                                  booking.paymentStatus === 'CHARGES_WAIVED'

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="mb-6">
        <Link href="/admin/rentals/verifications" className="flex items-center text-gray-600 hover:text-gray-900 mb-4">
          <IoArrowBackOutline className="mr-2" />
          Back to Verifications
        </Link>
        
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">
            {isPostTrip ? 'Charge Review' : 'Verification Review'} - {booking.bookingCode}
          </h1>
          <div className="flex items-center gap-2">
            {isPostTrip && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-amber-100 text-amber-800">
                Post-Trip Charges
              </span>
            )}
            {chargesAlreadyProcessed && (
              <span className="px-3 py-1 text-sm font-medium rounded-full bg-green-100 text-green-800">
                Charges Processed
              </span>
            )}
            {getRiskBadge()}
            {booking.flaggedForReview && (
              <span className="px-2 py-1 text-xs font-medium rounded-full bg-orange-100 text-orange-800">
                Flagged for Review
              </span>
            )}
          </div>
        </div>
      </div>

      {/* AI Verification Status Banner */}
      {booking.aiVerificationResult && !isPostTrip && (
        <div className={`rounded-lg p-4 mb-6 border ${
          booking.aiVerificationResult.quickVerifyPassed
            ? 'bg-green-50 border-green-200'
            : (booking.aiVerificationScore ?? 0) >= 60
              ? 'bg-yellow-50 border-yellow-200'
              : 'bg-red-50 border-red-200'
        }`}>
          <div className="flex items-center gap-6 text-sm">
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Claude AI:</span>
              {booking.aiVerificationResult.quickVerifyPassed
                ? <span className="text-green-700 font-semibold">Pass (Score: {booking.aiVerificationScore})</span>
                : booking.aiVerificationResult.error
                  ? <span className="text-red-700 font-semibold">Error</span>
                  : <span className="text-yellow-700 font-semibold">Review (Score: {booking.aiVerificationScore})</span>
              }
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Stripe Identity:</span>
              <span className="text-gray-500">Not yet available</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-medium">Status:</span>
              {booking.aiVerificationResult.quickVerifyPassed
                ? <span className="text-green-700 font-semibold">Ready to Approve</span>
                : <span className="text-yellow-700 font-semibold">Manual Review</span>
              }
            </div>
          </div>
        </div>
      )}

      {/* Test Mode Notice */}
      {isTestMode && (
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-lg mb-6">
          <div className="flex items-start">
            <IoInformationCircleOutline className="w-5 h-5 text-blue-600 mr-2 flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-900">Test Mode Active</p>
              <p className="text-xs text-blue-700 mt-1">
                This booking is using Stripe test keys. No real payment will be processed.
              </p>
            </div>
          </div>
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded mb-6">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Main Content */}
        <div className="lg:col-span-2 space-y-6">
          
          {isPostTrip ? (
            <>
              {/* Enhanced Payment Method Status */}
              <div className={`rounded-lg shadow p-6 ${
                paymentStatus === 'none' 
                  ? 'bg-red-50 border-2 border-red-300' 
                  : 'bg-white border border-gray-200'
              }`}>
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <IoCardOutline className="mr-2" />
                  Payment Method Status
                </h2>
                
                {paymentStatus === 'none' ? (
                  <div className="space-y-3">
                    <div className="flex items-center text-red-700">
                      <IoWarningOutline className="w-6 h-6 mr-3 flex-shrink-0" />
                      <div>
                        <p className="font-semibold">No Payment Method Available</p>
                        <p className="text-sm mt-1">Cannot process charges automatically. Manual collection required.</p>
                      </div>
                    </div>
                    <div className="mt-3 p-3 bg-red-100 rounded">
                      <p className="text-sm text-red-800">
                        Contact guest to arrange payment or update payment method
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between">
                    <div className="flex items-center">
                      <div className="bg-green-100 rounded-full p-2 mr-3">
                        <IoCheckmarkCircle className="w-6 h-6 text-green-600" />
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">Card on File</p>
                        <p className="text-sm text-gray-600">•••• •••• •••• {booking.last4 || booking.stripePaymentMethodId?.slice(-4) || '****'}</p>
                      </div>
                    </div>
                    <span className="text-sm text-green-600 font-medium">
                      {chargesAlreadyProcessed ? 'Charges Complete' : 'Ready to charge'}
                    </span>
                  </div>
                )}
              </div>

              {/* Trip Summary */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <IoSpeedometerOutline className="mr-2" />
                  Trip Summary
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Trip Duration</p>
                    <p className="font-medium">
                      {booking.tripStartedAt && booking.tripEndedAt ? 
                        `${Math.ceil((new Date(booking.tripEndedAt).getTime() - new Date(booking.tripStartedAt).getTime()) / (1000 * 60 * 60))} hours` : 
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Total Miles Driven</p>
                    <p className="font-medium">
                      {booking.startMileage && booking.endMileage ? 
                        `${booking.endMileage - booking.startMileage} miles` : 
                        'N/A'}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Start Fuel Level</p>
                    <p className="font-medium">{booking.fuelLevelStart || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">End Fuel Level</p>
                    <p className="font-medium">{booking.fuelLevelEnd || 'N/A'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Damage Reported</p>
                    <p className="font-medium">
                      {booking.damageReported ? 
                        <span className="text-red-600">Yes - {booking.damageDescription}</span> : 
                        <span className="text-green-600">No</span>}
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500">Return Status</p>
                    <p className="font-medium">
                      {booking.actualEndTime && new Date(booking.actualEndTime) > new Date(booking.endDate) ? 
                        <span className="text-red-600">Late Return</span> : 
                        <span className="text-green-600">On Time</span>}
                    </p>
                  </div>
                </div>
              </div>

              {/* Enhanced Charges with Adjustments */}
              <div className="bg-white rounded-lg shadow p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold flex items-center">
                    <IoCalculatorOutline className="mr-2" />
                    Additional Charges
                  </h2>
                  {charges && charges.breakdown.length > 0 && !chargesAlreadyProcessed && (
                    <button
                      onClick={() => setShowAdjustmentPanel(!showAdjustmentPanel)}
                      className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                    >
                      {showAdjustmentPanel ? 'Hide Adjustments' : 'Adjust Charges'}
                    </button>
                  )}
                </div>
                
                {charges && chargeLineItems.length > 0 ? (
                  <>
                    <div className="space-y-3">
                      {chargeLineItems.map((item, index) => (
                        <div key={index} className={`pb-3 border-b ${!item.included ? 'opacity-50' : ''}`}>
                          <div className="flex items-start justify-between">
                            <div className="flex items-start">
                              <button
                                onClick={() => handleChargeToggle(index)}
                                className="mt-1 mr-3"
                                disabled={chargesAlreadyProcessed}
                              >
                                {item.included ? (
                                  <IoCheckboxOutline className="w-5 h-5 text-green-600" />
                                ) : (
                                  <IoSquareOutline className="w-5 h-5 text-gray-400" />
                                )}
                              </button>
                              <div className="flex-1">
                                <p className="font-medium text-gray-900">{item.label}</p>
                                {item.details && (
                                  <p className="text-sm text-gray-500 mt-1">{item.details}</p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center ml-4">
                              {showAdjustmentPanel && !chargesAlreadyProcessed ? (
                                <div className="flex items-center">
                                  <span className="text-sm text-gray-500 mr-2">$</span>
                                  <input
                                    type="number"
                                    value={item.adjustedAmount}
                                    onChange={(e) => handleChargeAdjustment(index, parseFloat(e.target.value) || 0)}
                                    disabled={!item.included}
                                    className="w-24 px-2 py-1 border rounded text-right disabled:bg-gray-100"
                                    step="0.01"
                                  />
                                  {item.originalAmount !== item.adjustedAmount && (
                                    <span className="ml-2 text-sm text-gray-500 line-through">
                                      ${item.originalAmount.toFixed(2)}
                                    </span>
                                  )}
                                </div>
                              ) : (
                                <p className="font-semibold text-gray-900">
                                  ${item.adjustedAmount.toFixed(2)}
                                </p>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    
                    {/* Totals Section */}
                    <div className="mt-4 pt-4 border-t space-y-2">
                      {totalReduction > 0 && (
                        <>
                          <div className="flex justify-between text-sm">
                            <span className="text-gray-600">Original Total</span>
                            <span className="line-through text-gray-500">${originalTotal.toFixed(2)}</span>
                          </div>
                          <div className="flex justify-between text-sm">
                            <span className="text-green-600">Adjustments</span>
                            <span className="text-green-600">-${totalReduction.toFixed(2)}</span>
                          </div>
                        </>
                      )}
                      <div className="flex justify-between items-center">
                        <span className="text-lg font-bold text-gray-900">
                          {chargesAlreadyProcessed ? 'Charged Amount' : 'Total to Charge'}
                        </span>
                        <span className="text-2xl font-bold text-gray-900">
                          ${adjustedTotal.toFixed(2)}
                        </span>
                      </div>
                    </div>

                    {/* Quick Waive Buttons - Only show if charges not processed */}
                    {!chargesAlreadyProcessed && (
                      <div className="mt-6 pt-4 border-t">
                        <p className="text-sm font-medium text-gray-700 mb-3">Quick Waive Options</p>
                        <div className="grid grid-cols-4 gap-2">
                          <button
                            onClick={() => handleQuickWaive(100)}
                            className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Waive 100%
                          </button>
                          <button
                            onClick={() => handleQuickWaive(50)}
                            className="px-3 py-2 bg-orange-100 hover:bg-orange-200 text-orange-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Waive 50%
                          </button>
                          <button
                            onClick={() => handleQuickWaive(25)}
                            className="px-3 py-2 bg-yellow-100 hover:bg-yellow-200 text-yellow-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Waive 25%
                          </button>
                          <button
                            onClick={() => {
                              setWaivePercentage(0)
                              setSelectedWaiveType('amount')
                              setShowWaiveDialog(true)
                            }}
                            className="px-3 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg text-sm font-medium transition-colors"
                          >
                            Custom
                          </button>
                        </div>
                      </div>
                    )}
                  </>
                ) : (
                  <div className="text-center py-8">
                    <IoCashOutline className="w-12 h-12 text-green-500 mx-auto mb-3" />
                    <p className="text-green-600 font-medium">No additional charges</p>
                    <p className="text-sm text-gray-500 mt-1">Trip completed without extra fees</p>
                  </div>
                )}
              </div>

              {/* Disputes Section */}
              {booking.disputes && booking.disputes.length > 0 && (
                <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                  <h3 className="text-lg font-semibold text-yellow-900 mb-3 flex items-center">
                    <IoFlagOutline className="mr-2" />
                    Guest Disputes ({booking.disputes.length})
                  </h3>
                  <div className="space-y-2">
                    {booking.disputes.map((dispute) => (
                      <div key={dispute.id} className="bg-white rounded p-3">
                        <div className="flex items-start justify-between">
                          <div>
                            <p className="font-medium text-gray-900">{dispute.type}</p>
                            <p className="text-sm text-gray-600 mt-1">{dispute.description}</p>
                            <p className="text-xs text-gray-500 mt-2">
                              Opened: {new Date(dispute.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                          <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                            dispute.status === 'OPEN' ? 'bg-yellow-100 text-yellow-800' :
                            dispute.status === 'UNDER_REVIEW' ? 'bg-blue-100 text-blue-800' :
                            'bg-gray-100 text-gray-800'
                          }`}>
                            {dispute.status}
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button
                    onClick={() => handleAction('review_dispute')}
                    className="mt-3 w-full py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium"
                  >
                    Mark as Under Review
                  </button>
                </div>
              )}
            </>
          ) : (
            <>
              {/* Pre-trip verification content */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <IoPersonOutline className="mr-2" />
                  Guest Information
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <p className="text-gray-500">Name</p>
                    <p className="font-medium">{booking.guestName}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Email</p>
                    <p className="font-medium">{booking.guestEmail}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Phone</p>
                    <p className="font-medium">{booking.guestPhone}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">License Number</p>
                    <p className="font-medium">{booking.licenseNumber || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">License State</p>
                    <p className="font-medium">{booking.licenseState || 'Not provided'}</p>
                  </div>
                  <div>
                    <p className="text-gray-500">Date of Birth</p>
                    <p className="font-medium">
                      {booking.dateOfBirth ? new Date(booking.dateOfBirth).toLocaleDateString() : 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Claude AI Analysis Panel */}
              {booking.aiVerificationResult && (
                <AIVerificationPanel booking={booking} />
              )}

              {/* Documents Section */}
              <div className="bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4 flex items-center">
                  <IoDocumentTextOutline className="mr-2" />
                  Submitted Documents
                </h2>
                
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  {/* License Front */}
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">DL Front</p>
                    {booking.licensePhotoUrl ? (
                      <div className="relative">
                        <img
                          src={booking.licensePhotoUrl}
                          alt="License Front"
                          className="w-full h-32 object-cover rounded cursor-pointer"
                          onClick={() => setExpandedImage(booking.licensePhotoUrl!)}
                        />
                        <button
                          onClick={() => window.open(booking.licensePhotoUrl, '_blank')}
                          className="absolute top-2 right-2 bg-white rounded p-1 shadow"
                        >
                          <IoExpandOutline className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Not uploaded
                      </div>
                    )}
                  </div>

                  {/* License Back */}
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">DL Back</p>
                    {booking.licenseBackPhotoUrl ? (
                      <div className="relative">
                        <img
                          src={booking.licenseBackPhotoUrl}
                          alt="License Back"
                          className="w-full h-32 object-cover rounded cursor-pointer"
                          onClick={() => setExpandedImage(booking.licenseBackPhotoUrl!)}
                        />
                        <button
                          onClick={() => window.open(booking.licenseBackPhotoUrl, '_blank')}
                          className="absolute top-2 right-2 bg-white rounded p-1 shadow"
                        >
                          <IoExpandOutline className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Not uploaded
                      </div>
                    )}
                  </div>

                  {/* Insurance */}
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Insurance Card</p>
                    {booking.insurancePhotoUrl ? (
                      <div className="relative">
                        <img 
                          src={booking.insurancePhotoUrl} 
                          alt="Insurance"
                          className="w-full h-32 object-cover rounded cursor-pointer"
                          onClick={() => setExpandedImage(booking.insurancePhotoUrl!)}
                        />
                        <button
                          onClick={() => window.open(booking.insurancePhotoUrl, '_blank')}
                          className="absolute top-2 right-2 bg-white rounded p-1 shadow"
                        >
                          <IoExpandOutline className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Not uploaded
                      </div>
                    )}
                  </div>

                  {/* Selfie */}
                  <div className="border rounded-lg p-4">
                    <p className="text-sm font-medium mb-2">Verification Selfie</p>
                    {booking.selfiePhotoUrl ? (
                      <div className="relative">
                        <img 
                          src={booking.selfiePhotoUrl} 
                          alt="Selfie"
                          className="w-full h-32 object-cover rounded cursor-pointer"
                          onClick={() => setExpandedImage(booking.selfiePhotoUrl!)}
                        />
                        <button
                          onClick={() => window.open(booking.selfiePhotoUrl, '_blank')}
                          className="absolute top-2 right-2 bg-white rounded p-1 shadow"
                        >
                          <IoExpandOutline className="w-4 h-4" />
                        </button>
                      </div>
                    ) : (
                      <div className="w-full h-32 bg-gray-100 rounded flex items-center justify-center text-gray-400">
                        Not uploaded
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Payment Information - Shown for both pre and post trip */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <IoCardOutline className="mr-2" />
              Payment Information
            </h2>
            
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-500">Status</span>
                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                  paymentStatus === 'captured' ? 'bg-green-100 text-green-800' :
                  paymentStatus === 'ready' ? 'bg-yellow-100 text-yellow-800' :
                  paymentStatus === 'failed' ? 'bg-red-100 text-red-800' :
                  paymentStatus === 'processing' ? 'bg-blue-100 text-blue-800' :
                  'bg-gray-100 text-gray-800'
                }`}>
                  {paymentStatus === 'captured' ? '✓ Payment Captured' :
                   paymentStatus === 'ready' ? '⏳ Ready to Charge' :
                   paymentStatus === 'failed' ? '✗ Payment Failed' :
                   paymentStatus === 'processing' ? '⟳ Processing' :
                   'No Payment Method'}
                </span>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-500">
                    {isPostTrip ? 'Additional Charges' : 'Total Amount'}
                  </p>
                  <p className="font-bold text-lg">
                    ${isPostTrip ? adjustedTotal.toFixed(2) : booking.totalAmount.toFixed(2)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-500">
                    {isPostTrip ? 'Original Booking' : 'Security Deposit'}
                  </p>
                  <p className="font-medium">
                    ${isPostTrip ? booking.totalAmount.toFixed(2) : booking.depositAmount.toFixed(2)}
                  </p>
                </div>
              </div>

              {booking.stripeCustomerId && (
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-gray-500">Stripe Customer</span>
                    <span className="font-mono">{booking.stripeCustomerId}</span>
                  </div>
                  {booking.stripePaymentMethodId && (
                    <div className="flex justify-between text-xs">
                      <span className="text-gray-500">Payment Method</span>
                      <span className="font-mono">...{booking.stripePaymentMethodId.slice(-4)}</span>
                    </div>
                  )}
                  {booking.paymentFailureReason && (
                    <div className="mt-2 p-2 bg-red-50 rounded text-xs text-red-600">
                      <strong>Last Error:</strong> {booking.paymentFailureReason}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Admin Notes */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">Admin Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="w-full p-3 border rounded-lg"
              rows={4}
              placeholder={isPostTrip ? 
                "Add notes about these charges or adjustments..." : 
                "Add notes about this verification..."}
              disabled={chargesAlreadyProcessed}
            />
          </div>
        </div>

        {/* Right Column - Sidebar */}
        <div className="space-y-6">
          {/* Vehicle Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4 flex items-center">
              <IoCarOutline className="mr-2" />
              Vehicle Details
            </h2>
            
            {booking.car.photos[0] && (
              <img 
                src={booking.car.photos[0].url}
                alt={`${booking.car.make} ${booking.car.model}`}
                className="w-full h-48 object-cover rounded-lg mb-4"
              />
            )}
            
            <div className="space-y-2 text-sm">
              <p className="font-medium text-lg">
                {booking.car.year} {booking.car.make} {booking.car.model}
              </p>
              <div className="pt-2 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-500">Host</span>
                  <span className="font-medium">{booking.car.host.name}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">Host Email</span>
                  <span className="font-medium text-xs">{booking.car.host.email}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Booking/Trip Details */}
          <div className="bg-white rounded-lg shadow p-6">
            <h2 className="text-lg font-semibold mb-4">
              {isPostTrip ? 'Trip Details' : 'Booking Details'}
            </h2>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Start Date</span>
                <span className="font-medium">
                  {new Date(booking.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">End Date</span>
                <span className="font-medium">
                  {new Date(booking.endDate).toLocaleDateString()}
                </span>
              </div>
              {isPostTrip && booking.tripStartedAt && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trip Started</span>
                    <span className="font-medium">
                      {new Date(booking.tripStartedAt).toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Trip Ended</span>
                    <span className="font-medium">
                      {booking.tripEndedAt ? new Date(booking.tripEndedAt).toLocaleString() : 'N/A'}
                    </span>
                  </div>
                </>
              )}
              {!isPostTrip && (
                <>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pickup Time</span>
                    <span className="font-medium">{booking.startTime}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Pickup Type</span>
                    <span className="font-medium capitalize">{booking.pickupType}</span>
                  </div>
                </>
              )}
              <div className="flex justify-between">
                <span className="text-gray-500">Location</span>
                <span className="font-medium text-xs">{booking.pickupLocation}</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="space-y-3">
            {chargesAlreadyProcessed ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <IoCheckmarkCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-green-800 font-medium">Charges Already Processed</p>
                <p className="text-sm text-green-600 mt-1">
                  Status: {booking.paymentStatus}
                </p>
              </div>
            ) : isPostTrip && charges && adjustedTotal > 0 ? (
              <>
                <button
                  onClick={() => handleAction('process_charges')}
                  disabled={processing || paymentStatus === 'none'}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    paymentStatus === 'none' 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {processing ? (
                    <>Processing...</>
                  ) : (
                    <>
                      <IoCashOutline className="mr-2" />
                      Process Charges ${adjustedTotal.toFixed(2)}
                    </>
                  )}
                </button>

                {totalReduction > 0 && (
                  <button
                    onClick={() => handleAction('adjust')}
                    disabled={processing || paymentStatus === 'none'}
                    className="w-full py-3 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium transition-colors"
                  >
                    <IoCalculatorOutline className="mr-2 inline" />
                    Apply Adjustments & Charge
                  </button>
                )}

                <button
                  onClick={() => setShowWaiveDialog(true)}
                  disabled={processing}
                  className="w-full py-3 px-4 bg-gray-600 hover:bg-gray-700 text-white rounded-lg font-medium transition-colors"
                >
                  <IoReceiptOutline className="mr-2 inline" />
                  Waive Charges
                </button>
              </>
            ) : isPostTrip && (!charges || adjustedTotal === 0) ? (
              <div className="bg-green-50 border border-green-200 rounded-lg p-4 text-center">
                <IoCheckmarkCircle className="w-12 h-12 text-green-500 mx-auto mb-2" />
                <p className="text-green-800 font-medium">No charges to process</p>
              </div>
            ) : (
              <>
                <button
                  onClick={() => handleAction('approve')}
                  disabled={processing || paymentStatus === 'captured'}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    paymentStatus === 'captured' 
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-green-600 hover:bg-green-700 text-white'
                  }`}
                >
                  {processing ? (
                    <>Processing...</>
                  ) : paymentStatus === 'captured' ? (
                    <>
                      <IoCheckmarkCircle className="mr-2" />
                      Already Approved & Paid
                    </>
                  ) : paymentStatus === 'ready' ? (
                    <>
                      <IoCheckmarkCircle className="mr-2" />
                      Approve & Charge ${booking.totalAmount.toFixed(2)}
                    </>
                  ) : (
                    <>
                      <IoCheckmarkCircle className="mr-2" />
                      Approve Booking
                    </>
                  )}
                </button>

                <button
                  onClick={() => handleAction('reject')}
                  disabled={processing || paymentStatus === 'captured'}
                  className={`w-full py-3 px-4 rounded-lg font-medium transition-colors flex items-center justify-center ${
                    paymentStatus === 'captured'
                      ? 'bg-gray-300 text-gray-500 cursor-not-allowed'
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  {paymentStatus === 'captured' ? (
                    <>
                      <IoCloseCircle className="mr-2" />
                      Cannot Reject - Already Paid
                    </>
                  ) : (
                    <>
                      <IoCloseCircle className="mr-2" />
                      Reject & Cancel
                    </>
                  )}
                </button>
              </>
            )}

            {paymentStatus === 'failed' && !chargesAlreadyProcessed && (
              <button
                onClick={() => handleAction('retry_payment')}
                className="w-full py-3 px-4 bg-yellow-600 hover:bg-yellow-700 text-white rounded-lg font-medium transition-colors flex items-center justify-center"
              >
                <IoRefreshOutline className="mr-2" />
                Retry Payment
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Enhanced Waive Dialog */}
      {showWaiveDialog && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">
              {waivePercentage === 100 ? 'Waive All Charges' : 
               waivePercentage > 0 ? `Waive ${waivePercentage.toFixed(0)}% of Charges` : 
               'Custom Waive Amount'}
            </h3>
            
            {selectedWaiveType === 'amount' && waivePercentage === 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter waive amount
                </label>
                <div className="flex items-center">
                  <span className="mr-2">$</span>
                  <input
                    type="number"
                    value={customWaiveAmount}
                    onChange={(e) => setCustomWaiveAmount(parseFloat(e.target.value) || 0)}
                    className="flex-1 px-3 py-2 border rounded-lg"
                    step="0.01"
                    max={adjustedTotal}
                    placeholder="0.00"
                  />
                  <button
                    onClick={handleCustomWaive}
                    className="ml-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    Apply
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Max: ${adjustedTotal.toFixed(2)}
                </p>
              </div>
            )}
            
            {waivePercentage > 0 && (
              <div className="mb-4 p-3 bg-gray-50 rounded">
                <div className="flex justify-between text-sm mb-1">
                  <span>Original Amount:</span>
                  <span className="font-medium">${adjustedTotal.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-sm mb-1">
                  <span>Waive Amount ({waivePercentage.toFixed(0)}%):</span>
                  <span className="font-medium text-red-600">
                    -${calculateWaivedAmount(waivePercentage).toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t">
                  <span>Remaining to Charge:</span>
                  <span>${(adjustedTotal - calculateWaivedAmount(waivePercentage)).toFixed(2)}</span>
                </div>
              </div>
            )}
            
            <textarea
              value={waiveReason}
              onChange={(e) => setWaiveReason(e.target.value)}
              className="w-full p-3 border rounded-lg mb-4"
              rows={3}
              placeholder="Reason for waiving charges (required)..."
            />
            
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  if (!waiveReason.trim()) {
                    setError('Please provide a reason for waiving')
                    return
                  }
                  handleAction(waivePercentage === 100 ? 'waive' : 'partial_waive')
                  setShowWaiveDialog(false)
                }}
                disabled={!waiveReason.trim() || (selectedWaiveType === 'amount' && waivePercentage === 0)}
                className="flex-1 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300"
              >
                Confirm Waive
              </button>
              <button
                onClick={() => {
                  setShowWaiveDialog(false)
                  setWaiveReason('')
                  setWaivePercentage(0)
                  setCustomWaiveAmount(0)
                }}
                className="flex-1 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Image Modal */}
      {expandedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-75 flex items-center justify-center z-50 p-4"
          onClick={() => setExpandedImage(null)}
        >
          <div className="relative max-w-4xl max-h-full">
            <img 
              src={expandedImage} 
              alt="Expanded document"
              className="max-w-full max-h-full object-contain"
            />
            <button
              onClick={() => setExpandedImage(null)}
              className="absolute top-4 right-4 text-white bg-black bg-opacity-50 rounded-full p-2"
            >
              <IoCloseCircle className="w-6 h-6" />
            </button>
          </div>
        </div>
      )}
    </div>
  )
}