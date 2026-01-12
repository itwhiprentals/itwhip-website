// app/fleet/partners/[id]/page.tsx
// Fleet Partner Detail View - Comprehensive partner management

'use client'

import { useState, useEffect, use } from 'react'
import { useSearchParams } from 'next/navigation'
import Link from 'next/link'
import {
  IoArrowBackOutline,
  IoBusinessOutline,
  IoCarOutline,
  IoCheckmarkCircleOutline,
  IoCheckmarkOutline,
  IoCloseCircleOutline,
  IoTimeOutline,
  IoTrendingUpOutline,
  IoStarOutline,
  IoCashOutline,
  IoDocumentTextOutline,
  IoWarningOutline,
  IoMailOutline,
  IoCallOutline,
  IoLinkOutline,
  IoSettingsOutline,
  IoPersonOutline,
  IoEyeOutline,
  IoPauseCircleOutline,
  IoPlayCircleOutline,
  IoCreateOutline,
  IoShieldCheckmarkOutline,
  IoCardOutline,
  IoWalletOutline,
  IoSwapHorizontalOutline,
  IoReceiptOutline,
  IoAlertCircleOutline,
  IoCloseOutline,
  IoSpeedometerOutline,
  IoLocationOutline,
  IoStar,
  IoReturnDownBackOutline
} from 'react-icons/io5'

interface Partner {
  id: string
  name: string
  email: string
  phone: string
  hostType: string
  approvalStatus: string
  active: boolean

  // Partner fields
  partnerCompanyName: string
  partnerSlug?: string
  partnerLogo?: string
  partnerBio?: string
  partnerSupportEmail?: string
  partnerSupportPhone?: string

  // Commission
  currentCommissionRate: number
  tier1VehicleCount: number
  tier1CommissionRate: number
  tier2VehicleCount: number
  tier2CommissionRate: number
  tier3VehicleCount: number
  tier3CommissionRate: number

  // Stats
  partnerFleetSize: number
  partnerTotalBookings: number
  partnerTotalRevenue: number
  partnerAvgRating: number

  // Stripe
  stripeConnectAccountId?: string
  stripePayoutsEnabled?: boolean
  stripeChargesEnabled?: boolean
  stripeDetailsSubmitted?: boolean
  stripeRequirements?: Record<string, any>
  stripeDisabledReason?: string

  // Timestamps
  createdAt: string
  updatedAt: string

  // Relations
  cars?: {
    id: string
    make: string
    model: string
    year: number
    trim?: string
    vin?: string
    color?: string
    licensePlate?: string
    dailyRate?: number
    weeklyRate?: number
    monthlyRate?: number
    transmission?: string
    fuelType?: string
    seats?: number
    currentMileage?: number
    isActive: boolean
    totalTrips?: number
    rating?: number
    createdAt: string
    photos: { url: string; isHero: boolean; order?: number }[]
  }[]
  partnerApplication?: {
    id: string
    status: string
    submittedAt: string
    reviewedAt?: string
    reviewedBy?: string
    reviewNotes?: string
    businessType: string
    yearsInBusiness: number
    fleetSize: number
    vehicleTypes: string[]
    operatingCities: string[]
  }
  partnerDocuments: {
    id: string
    type: string
    status: string
    url: string
    uploadedAt: string
    expiresAt?: string
    isExpired: boolean
    reviewedAt?: string
    reviewedBy?: string
    rejectNote?: string
  }[]
  partnerCommissionHistory: {
    id: string
    oldRate: number
    newRate: number
    reason?: string
    changedBy: string
    createdAt: string
  }[]
  _count: {
    cars: number
  }
}

interface Activity {
  id: string
  type: string
  title: string
  description?: string
  timestamp: string
  severity: 'INFO' | 'SUCCESS' | 'WARNING' | 'ERROR'
  metadata?: Record<string, any>
}

interface PartnerBooking {
  id: string
  bookingCode: string
  status: string
  guestName: string
  guestEmail: string
  guestPhone: string
  vehicle: {
    id: string
    name: string
    photo?: string
  } | null
  startDate: string
  endDate: string
  totalAmount: number
  commission: number
  netAmount: number
  createdAt: string
}

interface BankingData {
  partner: {
    id: string
    name: string
    email: string
    companyName: string
    approvalStatus: string
    commissionRate: number
  }
  stripeConnect: {
    accountId?: string
    payoutsEnabled: boolean
    chargesEnabled: boolean
    detailsSubmitted: boolean
  }
  stripeCustomer: {
    customerId?: string
    canCharge: boolean
  }
  balances: {
    current: number
    pending: number
    hold: number
    negative: number
    availableForPayout: number
  }
  payout: {
    lastPayoutDate?: string
    lastPayoutAmount?: number
    totalPayouts: number
    payoutCount: number
    enabled: boolean
    disabledReason?: string
    instantEnabled: boolean
    schedule?: string
    minimumAmount?: number
  }
  bankAccount?: {
    last4: string
    bankName: string
    accountType: string
    verified: boolean
  }
  debitCard?: {
    last4: string
    brand: string
    expMonth: number
    expYear: number
  }
  recentCharges: {
    id: string
    amount: number
    chargeType: string
    reason: string
    status: string
    createdAt: string
  }[]
  recentPayouts: {
    id: string
    amount: number
    status: string
    createdAt: string
  }[]
  stats: {
    totalChargedAmount: number
    totalPayouts: number
  }
  revenueFlow?: {
    totalBookings: number
    completedBookings: number
    pendingBookings: number
    grossRevenue: number
    completedGrossRevenue: number
    pendingGrossRevenue: number
    commissionRate: number
    totalCommission: number
    completedCommission: number
    pendingCommission: number
    netRevenue: number
    completedNetRevenue: number
    pendingNetRevenue: number
    totalPaidOut: number
    awaitingPayout: number
    currentBalance: number
    holdBalance: number
    availableForPayout: number
  }
}

export default function PartnerDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const searchParams = useSearchParams()
  const apiKey = searchParams.get('key') || 'phoenix-fleet-2847'

  const [partner, setPartner] = useState<Partner | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState('overview')
  const [showSuspendModal, setShowSuspendModal] = useState(false)
  const [showEditCommissionModal, setShowEditCommissionModal] = useState(false)
  const [newCommissionRate, setNewCommissionRate] = useState(0.25)
  const [suspendReason, setSuspendReason] = useState('')
  const [processing, setProcessing] = useState(false)

  // Activity state
  const [activities, setActivities] = useState<Activity[]>([])
  const [activityLoading, setActivityLoading] = useState(false)

  // Banking state
  const [banking, setBanking] = useState<BankingData | null>(null)
  const [bankingLoading, setBankingLoading] = useState(false)
  const [chargeAmount, setChargeAmount] = useState('')
  const [chargeReason, setChargeReason] = useState('')
  const [chargeMethod, setChargeMethod] = useState<'customer' | 'connect'>('connect') // default to debit balance
  const [chargeProcessing, setChargeProcessing] = useState(false)

  // Funds management state
  const [showHoldModal, setShowHoldModal] = useState(false)
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [holdAction, setHoldAction] = useState<'hold' | 'release'>('hold')
  const [holdAmount, setHoldAmount] = useState('')
  const [holdReason, setHoldReason] = useState('')
  const [holdUntil, setHoldUntil] = useState('')
  const [payoutAmount, setPayoutAmount] = useState('')
  const [payoutReason, setPayoutReason] = useState('')
  const [fundsProcessing, setFundsProcessing] = useState(false)

  // Vehicle modal state
  const [selectedVehicle, setSelectedVehicle] = useState<NonNullable<Partner['cars']>[0] | null>(null)
  const [vehicleModalPhoto, setVehicleModalPhoto] = useState(0)

  // Document request state
  const [requestingDoc, setRequestingDoc] = useState<string | null>(null)
  const [requestAllDocs, setRequestAllDocs] = useState(false)

  // Bookings state
  const [bookings, setBookings] = useState<PartnerBooking[]>([])
  const [bookingsLoading, setBookingsLoading] = useState(false)
  const [bookingsStats, setBookingsStats] = useState<{
    total: number
    pending: number
    confirmed: number
    inProgress: number
    completed: number
    cancelled: number
    totalRevenue: number
  } | null>(null)

  // Vehicle action state
  const [vehicleActionProcessing, setVehicleActionProcessing] = useState(false)

  // Approval settings state
  const [approvalSettings, setApprovalSettings] = useState<{
    approvalMode: 'AUTO' | 'MANUAL' | 'DYNAMIC'
    approvalThreshold: number
  } | null>(null)
  const [approvalLoading, setApprovalLoading] = useState(false)
  const [approvalSaving, setApprovalSaving] = useState(false)

  useEffect(() => {
    fetchPartner()
  }, [resolvedParams.id])

  // Fetch activities when activity tab is selected
  useEffect(() => {
    if (activeTab === 'activity' && partner && activities.length === 0) {
      fetchActivities()
    }
  }, [activeTab, partner])

  // Fetch banking when banking tab is selected
  useEffect(() => {
    if (activeTab === 'banking' && partner && !banking) {
      fetchBanking()
    }
  }, [activeTab, partner])

  // Fetch bookings when bookings tab is selected
  useEffect(() => {
    if (activeTab === 'bookings' && partner && bookings.length === 0) {
      fetchBookings()
    }
  }, [activeTab, partner])

  // Fetch approval settings when fleet tab is selected
  useEffect(() => {
    if (activeTab === 'fleet' && partner && !approvalSettings) {
      fetchApprovalSettings()
    }
  }, [activeTab, partner])

  const fetchPartner = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/fleet/partners/${resolvedParams.id}?key=${apiKey}`)
      const data = await response.json()

      if (data.success) {
        setPartner(data.partner)
        setNewCommissionRate(data.partner.currentCommissionRate)
      }
    } catch (error) {
      console.error('Failed to fetch partner:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchBookings = async () => {
    if (!partner) return
    try {
      setBookingsLoading(true)
      const response = await fetch(`/api/fleet/bookings?key=${apiKey}&partnerId=${partner.id}&limit=50`)
      const data = await response.json()
      if (data.success) {
        setBookings(data.bookings || [])
        setBookingsStats(data.stats || null)
      }
    } catch (error) {
      console.error('Failed to fetch bookings:', error)
    } finally {
      setBookingsLoading(false)
    }
  }

  const handleVehicleAction = async (vehicleId: string, action: 'approve' | 'reject' | 'suspend' | 'activate', reason?: string) => {
    try {
      setVehicleActionProcessing(true)
      const response = await fetch(`/api/fleet/vehicles/${vehicleId}?key=${apiKey}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      })

      const data = await response.json()
      if (data.success) {
        // Refresh partner to get updated vehicle list
        fetchPartner()
        setSelectedVehicle(null)
      } else {
        alert(data.error || `Failed to ${action} vehicle`)
      }
    } catch (error) {
      console.error(`Failed to ${action} vehicle:`, error)
      alert(`Failed to ${action} vehicle`)
    } finally {
      setVehicleActionProcessing(false)
    }
  }

  const fetchApprovalSettings = async () => {
    if (!partner) return
    try {
      setApprovalLoading(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/approval-settings?key=${apiKey}`)
      const data = await response.json()
      if (data.success) {
        setApprovalSettings({
          approvalMode: data.settings.approvalMode,
          approvalThreshold: data.settings.approvalThreshold
        })
      }
    } catch (error) {
      console.error('Failed to fetch approval settings:', error)
    } finally {
      setApprovalLoading(false)
    }
  }

  const updateApprovalSettings = async (mode: 'AUTO' | 'MANUAL' | 'DYNAMIC', threshold?: number) => {
    if (!partner) return
    try {
      setApprovalSaving(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/approval-settings?key=${apiKey}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          approvalMode: mode,
          approvalThreshold: threshold ?? approvalSettings?.approvalThreshold ?? 25
        })
      })

      const data = await response.json()
      if (data.success) {
        setApprovalSettings({
          approvalMode: data.settings.approvalMode,
          approvalThreshold: data.settings.approvalThreshold
        })
      } else {
        alert(data.error || 'Failed to update approval settings')
      }
    } catch (error) {
      console.error('Failed to update approval settings:', error)
      alert('Failed to update approval settings')
    } finally {
      setApprovalSaving(false)
    }
  }

  const handleSuspend = async () => {
    if (!partner) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/suspend?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ reason: suspendReason })
      })

      const data = await response.json()
      if (data.success) {
        setShowSuspendModal(false)
        setSuspendReason('')
        fetchPartner()
      } else {
        alert(data.error || 'Failed to update partner status')
      }
    } catch (error) {
      console.error('Failed to suspend partner:', error)
      alert('Failed to update partner status')
    } finally {
      setProcessing(false)
    }
  }

  const handleReactivate = async () => {
    if (!partner) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/reactivate?key=${apiKey}`, {
        method: 'POST'
      })

      const data = await response.json()
      if (data.success) {
        fetchPartner()
      } else {
        alert(data.error || 'Failed to reactivate partner')
      }
    } catch (error) {
      console.error('Failed to reactivate partner:', error)
      alert('Failed to reactivate partner')
    } finally {
      setProcessing(false)
    }
  }

  const handleUpdateCommission = async () => {
    if (!partner) return

    try {
      setProcessing(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/commission?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          rate: newCommissionRate,
          reason: 'Manual adjustment by fleet admin'
        })
      })

      const data = await response.json()
      if (data.success) {
        setShowEditCommissionModal(false)
        fetchPartner()
      } else {
        alert(data.error || 'Failed to update commission rate')
      }
    } catch (error) {
      console.error('Failed to update commission:', error)
      alert('Failed to update commission rate')
    } finally {
      setProcessing(false)
    }
  }

  const fetchActivities = async () => {
    if (!partner) return
    try {
      setActivityLoading(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/activity?key=${apiKey}`)
      const data = await response.json()
      if (data.success) {
        setActivities(data.activities || [])
      }
    } catch (error) {
      console.error('Failed to fetch activities:', error)
    } finally {
      setActivityLoading(false)
    }
  }

  const fetchBanking = async () => {
    if (!partner) return
    try {
      setBankingLoading(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/banking?key=${apiKey}`)
      const data = await response.json()
      if (data.success) {
        setBanking(data.data)
      }
    } catch (error) {
      console.error('Failed to fetch banking:', error)
    } finally {
      setBankingLoading(false)
    }
  }

  const handleChargePartner = async () => {
    if (!partner || !chargeAmount || !chargeReason) return

    try {
      setChargeProcessing(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/banking?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          amount: parseFloat(chargeAmount),
          reason: chargeReason,
          method: chargeMethod // 'connect' = debit balance, 'customer' = charge card
        })
      })

      const data = await response.json()
      if (data.success) {
        const methodLabel = chargeMethod === 'connect' ? 'debited from balance' : 'charged to card'
        alert(`Successfully ${methodLabel}: $${chargeAmount}`)
        setChargeAmount('')
        setChargeReason('')
        // Refresh banking data
        fetchBanking()
      } else {
        alert(data.error || 'Failed to charge partner')
      }
    } catch (error) {
      console.error('Failed to charge partner:', error)
      alert('Failed to charge partner')
    } finally {
      setChargeProcessing(false)
    }
  }

  // Handle hold/release funds
  const handleFundsAction = async () => {
    if (!partner || !holdReason) return

    if ((holdAction === 'hold' || holdAction === 'release') && (!holdAmount || parseFloat(holdAmount) <= 0)) {
      alert('Valid amount is required')
      return
    }

    try {
      setFundsProcessing(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/funds?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: holdAction,
          amount: parseFloat(holdAmount),
          reason: holdReason,
          holdUntil: holdUntil || undefined
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(data.data.message)
        setShowHoldModal(false)
        setHoldAmount('')
        setHoldReason('')
        setHoldUntil('')
        fetchBanking()
      } else {
        alert(data.error || 'Failed to process funds action')
      }
    } catch (error) {
      console.error('Failed to process funds action:', error)
      alert('Failed to process funds action')
    } finally {
      setFundsProcessing(false)
    }
  }

  // Handle force payout
  const handleForcePayout = async () => {
    if (!partner || !payoutAmount || !payoutReason) return

    if (parseFloat(payoutAmount) <= 0) {
      alert('Valid payout amount is required')
      return
    }

    if (!confirm(`Force payout of $${payoutAmount} to ${partner.partnerCompanyName || partner.name}?`)) {
      return
    }

    try {
      setFundsProcessing(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/funds?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'force_payout',
          amount: parseFloat(payoutAmount),
          reason: payoutReason
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(data.data.message)
        setShowPayoutModal(false)
        setPayoutAmount('')
        setPayoutReason('')
        fetchBanking()
      } else {
        alert(data.error || 'Failed to process payout')
      }
    } catch (error) {
      console.error('Failed to process payout:', error)
      alert('Failed to process payout')
    } finally {
      setFundsProcessing(false)
    }
  }

  // Handle toggle payouts (suspend/enable)
  const handleTogglePayouts = async (enable: boolean) => {
    if (!partner) return

    const action = enable ? 'enable_payouts' : 'suspend_payouts'
    const confirmMsg = enable
      ? `Enable payouts for ${partner.partnerCompanyName || partner.name}?`
      : `Suspend payouts for ${partner.partnerCompanyName || partner.name}?`

    const reason = prompt(confirmMsg + '\n\nPlease enter a reason:')
    if (!reason) return

    try {
      setFundsProcessing(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/funds?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, reason })
      })

      const data = await response.json()
      if (data.success) {
        alert(data.data.message)
        fetchBanking()
      } else {
        alert(data.error || 'Failed to update payout status')
      }
    } catch (error) {
      console.error('Failed to toggle payouts:', error)
      alert('Failed to update payout status')
    } finally {
      setFundsProcessing(false)
    }
  }

  // Handle toggle instant payout
  const handleToggleInstantPayout = async () => {
    if (!partner || !banking) return

    const currentStatus = banking.payout?.instantEnabled || false
    const newStatus = !currentStatus
    const confirmMsg = newStatus
      ? `Enable instant payouts for ${partner.partnerCompanyName || partner.name}?`
      : `Disable instant payouts for ${partner.partnerCompanyName || partner.name}?`

    const reason = prompt(confirmMsg + '\n\nPlease enter a reason:')
    if (!reason) return

    try {
      setFundsProcessing(true)
      const response = await fetch(`/api/fleet/partners/${partner.id}/funds?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_instant_payout',
          enableInstant: newStatus,
          reason
        })
      })

      const data = await response.json()
      if (data.success) {
        alert(data.data.message)
        fetchBanking()
      } else {
        alert(data.error || 'Failed to toggle instant payout')
      }
    } catch (error) {
      console.error('Failed to toggle instant payout:', error)
      alert('Failed to toggle instant payout')
    } finally {
      setFundsProcessing(false)
    }
  }

  // Request documents from partner
  const handleRequestDocuments = async (documentTypes: string[]) => {
    if (!partner || documentTypes.length === 0) return

    const isAll = documentTypes.length > 1
    if (isAll) {
      setRequestAllDocs(true)
    } else {
      setRequestingDoc(documentTypes[0])
    }

    try {
      const response = await fetch(`/api/fleet/partners/${partner.id}/request-documents?key=${apiKey}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          documentTypes,
          deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days
        })
      })

      const data = await response.json()
      if (data.success) {
        const docCount = documentTypes.length
        const docNames = docCount === 1
          ? getDocumentTypeName(documentTypes[0])
          : `${docCount} documents`
        const emailStatus = data.data?.emailSent
          ? `✓ Email sent to ${data.data.partnerEmail}`
          : '⚠ Request logged but email failed to send'
        alert(`Document request for ${docNames}\n\n${emailStatus}`)
      } else {
        alert(data.error || 'Failed to send document request')
      }
    } catch (error) {
      console.error('Failed to request documents:', error)
      alert('Failed to send document request')
    } finally {
      setRequestingDoc(null)
      setRequestAllDocs(false)
    }
  }

  const getActivityIcon = (type: string) => {
    const icons: Record<string, { icon: React.ReactNode; bgColor: string }> = {
      'COMMISSION': { icon: <IoSwapHorizontalOutline className="w-4 h-4 text-purple-600" />, bgColor: 'bg-purple-100 dark:bg-purple-900/30' },
      'DOCUMENT': { icon: <IoDocumentTextOutline className="w-4 h-4 text-blue-600" />, bgColor: 'bg-blue-100 dark:bg-blue-900/30' },
      'PAYOUT': { icon: <IoCashOutline className="w-4 h-4 text-green-600" />, bgColor: 'bg-green-100 dark:bg-green-900/30' },
      'BOOKING': { icon: <IoCarOutline className="w-4 h-4 text-orange-600" />, bgColor: 'bg-orange-100 dark:bg-orange-900/30' },
      'ACTIVITY': { icon: <IoTimeOutline className="w-4 h-4 text-gray-600" />, bgColor: 'bg-gray-100 dark:bg-gray-900/30' }
    }
    return icons[type] || icons['ACTIVITY']
  }

  const getActivitySeverityColor = (severity: string) => {
    switch (severity) {
      case 'SUCCESS': return 'border-l-green-500'
      case 'WARNING': return 'border-l-yellow-500'
      case 'ERROR': return 'border-l-red-500'
      default: return 'border-l-gray-300 dark:border-l-gray-600'
    }
  }

  const getTierBadge = (rate: number) => {
    if (rate <= 0.10) return { label: 'Diamond', color: 'text-purple-700 bg-purple-100 dark:text-purple-400 dark:bg-purple-900/30' }
    if (rate <= 0.15) return { label: 'Platinum', color: 'text-blue-700 bg-blue-100 dark:text-blue-400 dark:bg-blue-900/30' }
    if (rate <= 0.20) return { label: 'Gold', color: 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30' }
    return { label: 'Standard', color: 'text-gray-700 bg-gray-100 dark:text-gray-400 dark:bg-gray-700' }
  }

  const getDocumentTypeName = (type: string) => {
    const names: Record<string, string> = {
      'BUSINESS_LICENSE': 'Business License',
      'INSURANCE_CERTIFICATE': 'Insurance Certificate',
      'COMMERCIAL_AUTO_POLICY': 'Commercial Auto Policy',
      'BACKGROUND_CHECK': 'Background Check',
      'W9_FORM': 'W-9 Form',
      'ARTICLES_OF_INCORPORATION': 'Articles of Incorporation'
    }
    return names[type] || type
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center justify-center h-64">
            <div className="text-gray-500">Loading partner details...</div>
          </div>
        </div>
      </div>
    )
  }

  if (!partner) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 p-4 sm:p-6">
        <div className="max-w-7xl mx-auto">
          <div className="text-center py-12">
            <IoBusinessOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">Partner not found</h2>
            <Link href={`/fleet/partners?key=${apiKey}`} className="text-orange-600 hover:text-orange-700">
              Back to partners
            </Link>
          </div>
        </div>
      </div>
    )
  }

  const tier = getTierBadge(partner.currentCommissionRate)

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pb-20 sm:pb-6">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-4">
          {/* Mobile: Stack vertically, Desktop: Horizontal */}
          <div className="flex flex-col gap-4 mb-4">
            {/* Top row: Back button + Partner info */}
            <div className="flex items-start gap-3">
              <Link
                href={`/fleet/partners?key=${apiKey}`}
                className="p-3 sm:p-2 min-w-[44px] min-h-[44px] flex items-center justify-center hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <IoArrowBackOutline className="text-xl" />
              </Link>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 bg-orange-100 dark:bg-orange-900/30 rounded-lg flex items-center justify-center flex-shrink-0">
                    {partner.partnerLogo ? (
                      <img src={partner.partnerLogo} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-orange-600 dark:text-orange-400">
                        {partner.partnerCompanyName?.charAt(0) || 'P'}
                      </span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    {/* Company name */}
                    <h1 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white truncate">
                      {partner.partnerCompanyName || partner.name}
                    </h1>
                    {/* Badges - wrap on mobile */}
                    <div className="flex flex-wrap gap-2 mt-1">
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                        partner.active
                          ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                          : 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                      }`}>
                        {partner.active ? 'Active' : 'Suspended'}
                      </span>
                      <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tier.color}`}>
                        {tier.label}
                      </span>
                    </div>
                    {/* Email and link - stack on mobile */}
                    <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 text-sm text-gray-500 dark:text-gray-400 mt-1">
                      <span className="truncate">{partner.email}</span>
                      {partner.partnerSlug && (
                        <a
                          href={`/rideshare/${partner.partnerSlug}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-1 text-orange-600 hover:text-orange-700"
                        >
                          <IoLinkOutline className="w-4 h-4 flex-shrink-0" />
                          <span className="truncate">/rideshare/{partner.partnerSlug}</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action buttons - stack on mobile, horizontal on desktop */}
            <div className="flex flex-col sm:flex-row gap-2 sm:gap-2 sm:ml-auto">
              {partner.active ? (
                <button
                  onClick={() => setShowSuspendModal(true)}
                  className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors min-h-[44px] sm:min-h-0"
                >
                  <IoPauseCircleOutline className="w-4 h-4" />
                  Suspend
                </button>
              ) : (
                <button
                  onClick={handleReactivate}
                  disabled={processing}
                  className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 min-h-[44px] sm:min-h-0"
                >
                  <IoPlayCircleOutline className="w-4 h-4" />
                  Reactivate
                </button>
              )}
              {/* Preview public landing page */}
              {partner.partnerSlug && (
                <a
                  href={`/rideshare/${partner.partnerSlug}?preview=true&key=${apiKey}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg text-sm font-medium transition-colors min-h-[44px] sm:min-h-0"
                >
                  <IoLinkOutline className="w-4 h-4" />
                  Preview Site
                </a>
              )}
              {/* View partner dashboard as partner */}
              <Link
                href={`/fleet/partners/${partner.id}/impersonate?key=${apiKey}`}
                className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg text-sm font-medium transition-colors min-h-[44px] sm:min-h-0"
              >
                <IoEyeOutline className="w-4 h-4" />
                View Dashboard
              </Link>
              {/* View refund requests for this partner */}
              <Link
                href={`/fleet/refunds?key=${apiKey}&partnerId=${partner.id}`}
                className="flex items-center justify-center gap-2 px-4 py-3 sm:py-2 bg-amber-600 hover:bg-amber-700 text-white rounded-lg text-sm font-medium transition-colors min-h-[44px] sm:min-h-0"
              >
                <IoReturnDownBackOutline className="w-4 h-4" />
                Refunds
              </Link>
            </div>
          </div>

          {/* Tabs - scrollable on mobile */}
          <div className="flex gap-1 mt-4 border-b border-gray-200 dark:border-gray-700 -mb-px overflow-x-auto scrollbar-hide">
            {['overview', 'fleet', 'bookings', 'documents', 'commission', 'banking', 'activity'].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-4 py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap min-h-[44px] sm:min-h-0 ${
                  activeTab === tab
                    ? 'border-orange-500 text-orange-600 dark:text-orange-400'
                    : 'border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
        {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Stats Cards */}
            <div className="lg:col-span-2">
              <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <IoCarOutline className="w-4 h-4" />
                    <span className="text-xs">Fleet Size</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {partner.partnerFleetSize}
                  </div>
                  <div className="text-xs text-gray-500">vehicles</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <IoTrendingUpOutline className="w-4 h-4" />
                    <span className="text-xs">Bookings</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {partner.partnerTotalBookings}
                  </div>
                  <div className="text-xs text-gray-500">total</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <IoCashOutline className="w-4 h-4" />
                    <span className="text-xs">Revenue</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    ${(partner.partnerTotalRevenue / 1000).toFixed(1)}k
                  </div>
                  <div className="text-xs text-gray-500">total</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                    <IoStarOutline className="w-4 h-4" />
                    <span className="text-xs">Rating</span>
                  </div>
                  <div className="text-2xl font-bold text-gray-900 dark:text-white">
                    {partner.partnerAvgRating > 0 ? partner.partnerAvgRating.toFixed(1) : '-'}
                  </div>
                  <div className="text-xs text-gray-500">average</div>
                </div>
              </div>

              {/* Contact Info */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Contact Information</h3>
                <div className="grid sm:grid-cols-2 gap-4">
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Primary Contact</div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <IoPersonOutline className="w-4 h-4" />
                      {partner.name}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Email</div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <IoMailOutline className="w-4 h-4" />
                      {partner.email}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Phone</div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <IoCallOutline className="w-4 h-4" />
                      {partner.phone || '-'}
                    </div>
                  </div>
                  <div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Support Email</div>
                    <div className="flex items-center gap-2 text-gray-900 dark:text-white">
                      <IoMailOutline className="w-4 h-4" />
                      {partner.partnerSupportEmail || partner.email}
                    </div>
                  </div>
                </div>
              </div>

              {/* Application Details */}
              {partner.partnerApplication && (
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Application Details</h3>
                  <div className="grid sm:grid-cols-2 gap-4">
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Business Type</div>
                      <div className="text-gray-900 dark:text-white">{partner.partnerApplication.businessType}</div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Years in Business</div>
                      <div className="text-gray-900 dark:text-white">{partner.partnerApplication.yearsInBusiness} years</div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vehicle Types</div>
                      <div className="flex flex-wrap gap-2">
                        {partner.partnerApplication.vehicleTypes.map((type, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-blue-50 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded"
                          >
                            {type}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div className="sm:col-span-2">
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Operating Cities</div>
                      <div className="flex flex-wrap gap-2">
                        {partner.partnerApplication.operatingCities.map((city, idx) => (
                          <span
                            key={idx}
                            className="px-2 py-1 text-xs bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded"
                          >
                            {city}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Submitted</div>
                      <div className="text-gray-900 dark:text-white">
                        {partner.partnerApplication.submittedAt
                          ? formatDate(partner.partnerApplication.submittedAt)
                          : '-'}
                      </div>
                    </div>
                    <div>
                      <div className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reviewed</div>
                      <div className="text-gray-900 dark:text-white">
                        {partner.partnerApplication.reviewedAt
                          ? formatDate(partner.partnerApplication.reviewedAt)
                          : '-'}
                        {partner.partnerApplication.reviewedBy && (
                          <span className="text-gray-500 text-sm"> by {partner.partnerApplication.reviewedBy}</span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="space-y-6">
              {/* Commission Card */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Commission</h3>
                  <button
                    onClick={() => setShowEditCommissionModal(true)}
                    className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                  >
                    <IoCreateOutline className="w-4 h-4" />
                  </button>
                </div>
                <div className="text-center mb-4">
                  <div className="text-4xl font-bold text-gray-900 dark:text-white">
                    {Math.round(partner.currentCommissionRate * 100)}%
                  </div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">platform fee</div>
                </div>
                <div className={`text-center px-3 py-2 rounded-lg ${tier.color}`}>
                  <span className="font-medium">{tier.label} Tier</span>
                </div>

                {/* Tier Progress */}
                <div className="mt-4 space-y-2 text-sm">
                  <div className="flex justify-between text-gray-600 dark:text-gray-400">
                    <span>Standard (25%)</span>
                    <span>0-9 vehicles</span>
                  </div>
                  <div className={`flex justify-between ${partner.partnerFleetSize >= 10 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                    <span>Gold (20%)</span>
                    <span>10+ vehicles</span>
                  </div>
                  <div className={`flex justify-between ${partner.partnerFleetSize >= 50 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                    <span>Platinum (15%)</span>
                    <span>50+ vehicles</span>
                  </div>
                  <div className={`flex justify-between ${partner.partnerFleetSize >= 100 ? 'text-green-600 dark:text-green-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                    <span>Diamond (10%)</span>
                    <span>100+ vehicles</span>
                  </div>
                </div>
              </div>

              {/* Documents Summary */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Documents</h3>
                {partner.partnerDocuments.length === 0 ? (
                  <p className="text-sm text-gray-500 dark:text-gray-400">No documents uploaded</p>
                ) : (
                  <div className="space-y-3">
                    {partner.partnerDocuments.map((doc) => (
                      <div key={doc.id} className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <IoDocumentTextOutline className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-700 dark:text-gray-300">
                            {getDocumentTypeName(doc.type)}
                          </span>
                        </div>
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          doc.isExpired
                            ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                            : doc.status === 'VERIFIED'
                            ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                            : 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
                        }`}>
                          {doc.isExpired ? 'Expired' : doc.status}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
                <Link
                  href={`/fleet/partners/${partner.id}/documents?key=${apiKey}`}
                  className="block mt-4 text-center text-sm text-orange-600 hover:text-orange-700 font-medium"
                >
                  Manage Documents
                </Link>
              </div>

              {/* Stripe Status - Enhanced */}
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Payouts</h3>

                {partner.stripeConnectAccountId ? (
                  <div className="space-y-3">
                    {/* Connection Status */}
                    <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
                      <IoShieldCheckmarkOutline className="w-5 h-5" />
                      <span className="text-sm font-medium">Stripe Connected</span>
                    </div>

                    {/* Payouts Enabled */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Payouts</span>
                      <span className={partner.stripePayoutsEnabled ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                        {partner.stripePayoutsEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    {/* Charges Enabled */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Charges</span>
                      <span className={partner.stripeChargesEnabled ? 'text-green-600 dark:text-green-400 font-medium' : 'text-red-600 dark:text-red-400 font-medium'}>
                        {partner.stripeChargesEnabled ? 'Enabled' : 'Disabled'}
                      </span>
                    </div>

                    {/* Details Submitted */}
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-500 dark:text-gray-400">Details</span>
                      <span className={partner.stripeDetailsSubmitted ? 'text-green-600 dark:text-green-400 font-medium' : 'text-yellow-600 dark:text-yellow-400 font-medium'}>
                        {partner.stripeDetailsSubmitted ? 'Submitted' : 'Pending'}
                      </span>
                    </div>

                    {/* Requirements Warning */}
                    {partner.stripeRequirements && Object.keys(partner.stripeRequirements).length > 0 && (
                      <div className="mt-2 p-2 bg-yellow-50 dark:bg-yellow-900/20 rounded text-sm text-yellow-700 dark:text-yellow-400">
                        <IoWarningOutline className="inline w-4 h-4 mr-1" />
                        Pending requirements
                      </div>
                    )}

                    {/* Disabled Reason */}
                    {partner.stripeDisabledReason && (
                      <div className="mt-2 p-2 bg-red-50 dark:bg-red-900/20 rounded text-sm text-red-700 dark:text-red-400">
                        {partner.stripeDisabledReason}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-yellow-600 dark:text-yellow-400">
                    <IoWarningOutline className="w-5 h-5" />
                    <span className="text-sm font-medium">Stripe Not Connected</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {activeTab === 'fleet' && (
          <div className="space-y-6">
            {/* Vehicle Approval Rules */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <IoShieldCheckmarkOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">Vehicle Approval Rules</h3>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Control how new vehicles from this partner are approved
                    </p>
                  </div>
                </div>
                {approvalLoading && (
                  <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                )}
              </div>

              {/* Approval Mode Selector */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                {/* Pre-Approve All */}
                <button
                  onClick={() => updateApprovalSettings('AUTO')}
                  disabled={approvalSaving}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    approvalSettings?.approvalMode === 'AUTO'
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-green-300 dark:hover:border-green-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      approvalSettings?.approvalMode === 'AUTO'
                        ? 'bg-green-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {approvalSettings?.approvalMode === 'AUTO' && <IoCheckmarkOutline className="w-3 h-3" />}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Pre-Approve All</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    All vehicles are automatically approved when listed. Best for trusted partners like Hertz, Avis.
                  </p>
                </button>

                {/* Must Approve All */}
                <button
                  onClick={() => updateApprovalSettings('MANUAL')}
                  disabled={approvalSaving}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    approvalSettings?.approvalMode === 'MANUAL'
                      ? 'border-red-500 bg-red-50 dark:bg-red-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-red-300 dark:hover:border-red-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      approvalSettings?.approvalMode === 'MANUAL'
                        ? 'bg-red-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {approvalSettings?.approvalMode === 'MANUAL' && <IoCheckmarkOutline className="w-3 h-3" />}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Must Approve All</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    No vehicles go live until manually approved. Full control over every listing.
                  </p>
                </button>

                {/* Dynamic Approval */}
                <button
                  onClick={() => updateApprovalSettings('DYNAMIC', approvalSettings?.approvalThreshold ?? 25)}
                  disabled={approvalSaving}
                  className={`p-4 rounded-lg border-2 text-left transition-all ${
                    approvalSettings?.approvalMode === 'DYNAMIC'
                      ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                      : 'border-gray-200 dark:border-gray-700 hover:border-blue-300 dark:hover:border-blue-700'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center ${
                      approvalSettings?.approvalMode === 'DYNAMIC'
                        ? 'bg-blue-500 text-white'
                        : 'bg-gray-200 dark:bg-gray-700'
                    }`}>
                      {approvalSettings?.approvalMode === 'DYNAMIC' && <IoCheckmarkOutline className="w-3 h-3" />}
                    </div>
                    <span className="font-medium text-gray-900 dark:text-white">Dynamic Approval</span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    System detects issues and requests approval. Adjustable threshold.
                  </p>
                </button>
              </div>

              {/* Dynamic Threshold Slider */}
              {approvalSettings?.approvalMode === 'DYNAMIC' && (
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
                      Approval Threshold
                    </span>
                    <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                      {approvalSettings.approvalThreshold}%
                    </span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    step="5"
                    value={approvalSettings.approvalThreshold}
                    onChange={(e) => {
                      const newValue = parseInt(e.target.value)
                      setApprovalSettings(prev => prev ? { ...prev, approvalThreshold: newValue } : null)
                    }}
                    onMouseUp={(e) => {
                      const target = e.target as HTMLInputElement
                      updateApprovalSettings('DYNAMIC', parseInt(target.value))
                    }}
                    onTouchEnd={(e) => {
                      const target = e.target as HTMLInputElement
                      updateApprovalSettings('DYNAMIC', parseInt(target.value))
                    }}
                    className="w-full h-2 bg-gray-200 dark:bg-gray-600 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
                    <span>0% - Auto-approve most</span>
                    <span>100% - Review all</span>
                  </div>
                  <div className="mt-3 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      {approvalSettings.approvalThreshold === 0 && 'System will auto-approve all vehicles unless critical issues are detected.'}
                      {approvalSettings.approvalThreshold > 0 && approvalSettings.approvalThreshold <= 25 && 'System will auto-approve most vehicles. Only flagged issues require review.'}
                      {approvalSettings.approvalThreshold > 25 && approvalSettings.approvalThreshold <= 50 && 'Moderate review. System will flag more vehicles for manual approval.'}
                      {approvalSettings.approvalThreshold > 50 && approvalSettings.approvalThreshold <= 75 && 'Strict review. Most new vehicles will require approval.'}
                      {approvalSettings.approvalThreshold > 75 && approvalSettings.approvalThreshold < 100 && 'Very strict. Nearly all vehicles require manual approval.'}
                      {approvalSettings.approvalThreshold === 100 && 'All vehicles require manual approval (same as "Must Approve All").'}
                    </p>
                  </div>
                </div>
              )}

              {approvalSaving && (
                <div className="mt-3 flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400">
                  <div className="w-4 h-4 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                  Saving...
                </div>
              )}
            </div>

            {/* Fleet Vehicles */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Fleet Vehicles ({partner.cars?.length || 0})
              </h3>
              {partner.cars && partner.cars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {partner.cars.map((car) => (
                  <button
                    key={car.id}
                    onClick={() => {
                      setSelectedVehicle(car)
                      setVehicleModalPhoto(0)
                    }}
                    className="group block text-left"
                  >
                    <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 mb-2">
                      {car.photos?.[0]?.url ? (
                        <img
                          src={car.photos[0].url}
                          alt={`${car.year} ${car.make} ${car.model}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center">
                          <IoCarOutline className="w-8 h-8 text-gray-400" />
                        </div>
                      )}
                    </div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400 transition-colors">
                      {car.year} {car.make} {car.model}
                    </div>
                    <div className="flex items-center justify-between">
                      <span className={`text-xs ${car.isActive ? 'text-green-600 dark:text-green-400' : 'text-gray-400'}`}>
                        {car.isActive ? 'Active' : 'Inactive'}
                      </span>
                      {car.dailyRate && (
                        <span className="text-xs font-medium text-orange-600 dark:text-orange-400">
                          ${car.dailyRate}/day
                        </span>
                      )}
                    </div>
                  </button>
                ))}
              </div>
              ) : (
                <div className="text-center py-8">
                  <IoCarOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No vehicles in fleet yet.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'bookings' && (
          <div className="space-y-6">
            {/* Bookings Stats */}
            {bookingsStats && (
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-gray-200 dark:border-gray-700">
                  <div className="text-xs text-gray-500 dark:text-gray-400">Total</div>
                  <div className="text-xl font-bold text-gray-900 dark:text-white">{bookingsStats.total}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-yellow-200 dark:border-yellow-800">
                  <div className="text-xs text-yellow-600 dark:text-yellow-400">Pending</div>
                  <div className="text-xl font-bold text-yellow-600 dark:text-yellow-400">{bookingsStats.pending}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-blue-200 dark:border-blue-800">
                  <div className="text-xs text-blue-600 dark:text-blue-400">Confirmed</div>
                  <div className="text-xl font-bold text-blue-600 dark:text-blue-400">{bookingsStats.confirmed}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-purple-200 dark:border-purple-800">
                  <div className="text-xs text-purple-600 dark:text-purple-400">In Progress</div>
                  <div className="text-xl font-bold text-purple-600 dark:text-purple-400">{bookingsStats.inProgress}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-green-200 dark:border-green-800">
                  <div className="text-xs text-green-600 dark:text-green-400">Completed</div>
                  <div className="text-xl font-bold text-green-600 dark:text-green-400">{bookingsStats.completed}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-red-200 dark:border-red-800">
                  <div className="text-xs text-red-600 dark:text-red-400">Cancelled</div>
                  <div className="text-xl font-bold text-red-600 dark:text-red-400">{bookingsStats.cancelled}</div>
                </div>
                <div className="bg-white dark:bg-gray-800 rounded-lg p-3 border border-orange-200 dark:border-orange-800">
                  <div className="text-xs text-orange-600 dark:text-orange-400">Revenue</div>
                  <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    ${((bookingsStats.totalRevenue || 0) / 1000).toFixed(1)}k
                  </div>
                </div>
              </div>
            )}

            {/* Financial Summary Link */}
            {bookingsStats && bookingsStats.totalRevenue > 0 && (
              <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 rounded-lg border border-green-200 dark:border-green-800 p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                      <IoCashOutline className="w-5 h-5 text-green-600 dark:text-green-400" />
                    </div>
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        ${(bookingsStats.totalRevenue * (1 - (partner?.currentCommissionRate || 0.25))).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} Partner Earnings
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        From ${bookingsStats.totalRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} gross revenue ({Math.round((partner?.currentCommissionRate || 0.25) * 100)}% commission)
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => setActiveTab('banking')}
                    className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                  >
                    <IoWalletOutline className="w-4 h-4" />
                    View Payouts
                  </button>
                </div>
              </div>
            )}

            {/* Bookings List */}
            <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700">
              <div className="p-4 border-b border-gray-200 dark:border-gray-700">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                  Bookings ({bookings.length})
                </h3>
              </div>

              {bookingsLoading ? (
                <div className="p-8 text-center">
                  <div className="w-8 h-8 border-2 border-orange-500 border-t-transparent rounded-full animate-spin mx-auto" />
                  <p className="text-gray-500 dark:text-gray-400 mt-2">Loading bookings...</p>
                </div>
              ) : bookings.length > 0 ? (
                <div className="divide-y divide-gray-200 dark:divide-gray-700">
                  {bookings.map((booking) => (
                    <div key={booking.id} className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700/50">
                      <div className="flex items-start gap-4">
                        {/* Vehicle Photo */}
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 flex-shrink-0">
                          {booking.vehicle?.photo ? (
                            <img
                              src={booking.vehicle.photo}
                              alt={booking.vehicle.name}
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <IoCarOutline className="w-6 h-6 text-gray-400" />
                            </div>
                          )}
                        </div>

                        {/* Booking Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 mb-1">
                            <span className="text-sm font-medium text-gray-900 dark:text-white">
                              {booking.bookingCode}
                            </span>
                            <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                              booking.status === 'COMPLETED' ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400' :
                              booking.status === 'CONFIRMED' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/50 dark:text-blue-400' :
                              booking.status === 'IN_PROGRESS' ? 'bg-purple-100 text-purple-700 dark:bg-purple-900/50 dark:text-purple-400' :
                              booking.status === 'PENDING' ? 'bg-yellow-100 text-yellow-700 dark:bg-yellow-900/50 dark:text-yellow-400' :
                              booking.status === 'CANCELLED' ? 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400' :
                              'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                            }`}>
                              {booking.status.replace('_', ' ')}
                            </span>
                          </div>
                          <div className="text-sm text-gray-600 dark:text-gray-300">
                            {booking.vehicle?.name || 'Unknown Vehicle'}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                            {booking.guestName} • {booking.guestEmail}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            {new Date(booking.startDate).toLocaleDateString()} - {new Date(booking.endDate).toLocaleDateString()}
                          </div>
                        </div>

                        {/* Financial Info */}
                        <div className="text-right flex-shrink-0">
                          <div className="text-sm font-semibold text-gray-900 dark:text-white">
                            ${booking.totalAmount.toFixed(2)}
                          </div>
                          <div className="text-xs text-gray-500 dark:text-gray-400">
                            Commission: ${booking.commission.toFixed(2)}
                          </div>
                          <div className="text-xs text-green-600 dark:text-green-400 font-medium">
                            Net: ${booking.netAmount.toFixed(2)}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center">
                  <IoTrendingUpOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                  <p className="text-gray-500 dark:text-gray-400">No bookings yet for this partner.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {activeTab === 'documents' && (() => {
          const allDocTypes = [
            { type: 'BUSINESS_LICENSE', name: 'Business License', description: 'Valid business license or permit' },
            { type: 'INSURANCE_CERTIFICATE', name: 'Insurance Certificate', description: 'Proof of general liability insurance' },
            { type: 'COMMERCIAL_AUTO_POLICY', name: 'Commercial Auto Policy', description: 'Commercial auto insurance covering fleet vehicles' },
            { type: 'BACKGROUND_CHECK', name: 'Background Check', description: 'Background check clearance document' },
            { type: 'W9_FORM', name: 'W-9 Form', description: 'IRS W-9 tax form for payments' },
            { type: 'ARTICLES_OF_INCORPORATION', name: 'Articles of Incorporation', description: 'Business formation documents' }
          ]
          const missingOrExpiredDocs = allDocTypes.filter(dt => {
            const doc = partner.partnerDocuments.find(d => d.type === dt.type)
            return !doc || doc.status !== 'VERIFIED' || doc.isExpired
          }).map(dt => dt.type)

          return (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Required Documents</h3>
                <span className="text-sm text-gray-500 dark:text-gray-400">
                  {partner.partnerDocuments.filter(d => d.status === 'VERIFIED' && !d.isExpired).length} / 6 verified
                </span>
              </div>
              {missingOrExpiredDocs.length > 0 && (
                <button
                  onClick={() => handleRequestDocuments(missingOrExpiredDocs)}
                  disabled={requestAllDocs}
                  className="px-4 py-2 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded-lg text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {requestAllDocs ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                      Sending...
                    </>
                  ) : (
                    <>
                      <IoMailOutline className="w-4 h-4" />
                      Request All Missing ({missingOrExpiredDocs.length})
                    </>
                  )}
                </button>
              )}
            </div>

            {/* Email notification info */}
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
              <div className="flex items-center gap-2 text-sm">
                <IoMailOutline className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                <span className="text-blue-800 dark:text-blue-200">
                  Document requests will be sent to: <strong>{partner.email}</strong>
                </span>
              </div>
            </div>

            {/* Document Checklist */}
            <div className="space-y-3">
              {allDocTypes.map((docType) => {
                const uploadedDoc = partner.partnerDocuments.find(d => d.type === docType.type)
                const isVerified = uploadedDoc?.status === 'VERIFIED' && !uploadedDoc?.isExpired
                const isPending = uploadedDoc?.status === 'PENDING'
                const isRejected = uploadedDoc?.status === 'REJECTED'
                const isExpired = uploadedDoc?.isExpired
                const needsRequest = !isVerified

                return (
                  <div
                    key={docType.type}
                    className={`p-4 rounded-lg border ${
                      isVerified
                        ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                        : isExpired
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : isRejected
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800'
                        : isPending
                        ? 'bg-yellow-50 dark:bg-yellow-900/20 border-yellow-200 dark:border-yellow-800'
                        : 'bg-gray-50 dark:bg-gray-700/50 border-gray-200 dark:border-gray-600'
                    }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex items-start gap-3">
                        <div className={`mt-0.5 w-5 h-5 rounded-full flex items-center justify-center ${
                          isVerified
                            ? 'bg-green-500 text-white'
                            : isExpired || isRejected
                            ? 'bg-red-500 text-white'
                            : isPending
                            ? 'bg-yellow-500 text-white'
                            : 'bg-gray-300 dark:bg-gray-600'
                        }`}>
                          {isVerified ? (
                            <IoCheckmarkOutline className="w-3 h-3" />
                          ) : isExpired || isRejected ? (
                            <IoCloseOutline className="w-3 h-3" />
                          ) : isPending ? (
                            <IoTimeOutline className="w-3 h-3" />
                          ) : null}
                        </div>
                        <div>
                          <div className="font-medium text-gray-900 dark:text-white">
                            {docType.name}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            {docType.description}
                          </div>
                          {uploadedDoc && (
                            <div className="mt-1 text-xs text-gray-400">
                              Uploaded: {formatDate(uploadedDoc.uploadedAt)}
                              {uploadedDoc.expiresAt && (
                                <span className={uploadedDoc.isExpired ? ' text-red-500' : ''}>
                                  {' • '}{uploadedDoc.isExpired ? 'Expired' : 'Expires'}: {formatDate(uploadedDoc.expiresAt)}
                                </span>
                              )}
                            </div>
                          )}
                          {uploadedDoc?.rejectNote && (
                            <div className="mt-1 text-xs text-red-600 dark:text-red-400">
                              Rejection reason: {uploadedDoc.rejectNote}
                            </div>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          isVerified
                            ? 'text-green-700 bg-green-100 dark:text-green-400 dark:bg-green-900/30'
                            : isExpired
                            ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                            : isRejected
                            ? 'text-red-700 bg-red-100 dark:text-red-400 dark:bg-red-900/30'
                            : isPending
                            ? 'text-yellow-700 bg-yellow-100 dark:text-yellow-400 dark:bg-yellow-900/30'
                            : 'text-gray-500 bg-gray-200 dark:text-gray-400 dark:bg-gray-600'
                        }`}>
                          {isVerified ? 'Verified' : isExpired ? 'Expired' : isRejected ? 'Rejected' : isPending ? 'Pending Review' : 'Missing'}
                        </span>
                        {uploadedDoc?.url && (
                          <a
                            href={uploadedDoc.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="px-2 py-1 bg-gray-200 dark:bg-gray-600 hover:bg-gray-300 dark:hover:bg-gray-500 rounded text-xs font-medium transition-colors"
                          >
                            View
                          </a>
                        )}
                        {needsRequest && (
                          <button
                            onClick={() => handleRequestDocuments([docType.type])}
                            disabled={requestingDoc === docType.type || requestAllDocs}
                            className="px-2 py-1 bg-purple-600 hover:bg-purple-700 disabled:bg-purple-400 text-white rounded text-xs font-medium transition-colors flex items-center gap-1"
                          >
                            {requestingDoc === docType.type ? (
                              <div className="w-3 h-3 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                              <IoMailOutline className="w-3 h-3" />
                            )}
                            Request
                          </button>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          )
        })()}

        {activeTab === 'commission' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Commission History</h3>
            {partner.partnerCommissionHistory.length === 0 ? (
              <p className="text-gray-500 dark:text-gray-400">No commission changes recorded.</p>
            ) : (
              <div className="space-y-4">
                {partner.partnerCommissionHistory.map((history) => (
                  <div
                    key={history.id}
                    className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg"
                  >
                    <div>
                      <div className="font-medium text-gray-900 dark:text-white">
                        {Math.round(history.oldRate * 100)}% → {Math.round(history.newRate * 100)}%
                      </div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {history.reason || 'Commission rate updated'}
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm text-gray-500 dark:text-gray-400">
                        {formatDate(history.createdAt)}
                      </div>
                      <div className="text-xs text-gray-400">
                        by {history.changedBy}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'banking' && (
          <div className="space-y-6">
            {bankingLoading ? (
              <div className="animate-pulse space-y-4">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="h-24 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                  ))}
                </div>
                <div className="h-64 bg-gray-200 dark:bg-gray-700 rounded-lg" />
              </div>
            ) : banking ? (
              <>
                {/* Revenue Flow - Centralized Financial View */}
                {banking.revenueFlow && (
                  <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-lg border border-blue-200 dark:border-blue-800 p-6">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                        <IoTrendingUpOutline className="w-5 h-5 text-blue-600" />
                        Revenue Flow
                      </h3>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Commission Rate: {Math.round(banking.revenueFlow.commissionRate * 100)}%
                      </span>
                    </div>

                    {/* Flow Diagram */}
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                      {/* Bookings */}
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Bookings</div>
                        <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                          {banking.revenueFlow.totalBookings}
                        </div>
                        <div className="text-xs text-gray-500">
                          {banking.revenueFlow.completedBookings} completed
                        </div>
                      </div>

                      {/* Gross Revenue */}
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Gross Revenue</div>
                        <div className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${banking.revenueFlow.grossRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500">
                          Before commission
                        </div>
                      </div>

                      {/* Commission */}
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Platform Commission</div>
                        <div className="text-2xl font-bold text-orange-600 dark:text-orange-400">
                          -${banking.revenueFlow.totalCommission.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500">
                          {Math.round(banking.revenueFlow.commissionRate * 100)}% of gross
                        </div>
                      </div>

                      {/* Net Revenue */}
                      <div className="text-center">
                        <div className="text-xs text-gray-500 dark:text-gray-400 mb-1">Partner Earnings</div>
                        <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                          ${banking.revenueFlow.netRevenue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <div className="text-xs text-gray-500">
                          After commission
                        </div>
                      </div>
                    </div>

                    {/* Payout Status Bar */}
                    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                      <div className="flex items-center justify-between text-sm mb-2">
                        <span className="text-gray-600 dark:text-gray-300">Payout Progress</span>
                        <span className="font-medium text-gray-900 dark:text-white">
                          ${banking.revenueFlow.totalPaidOut.toLocaleString(undefined, { minimumFractionDigits: 2 })} paid of ${banking.revenueFlow.completedNetRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })} earned
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3 overflow-hidden">
                        <div
                          className="bg-gradient-to-r from-green-500 to-green-400 h-3 rounded-full transition-all"
                          style={{
                            width: `${banking.revenueFlow.completedNetRevenue > 0
                              ? Math.min(100, (banking.revenueFlow.totalPaidOut / banking.revenueFlow.completedNetRevenue) * 100)
                              : 0}%`
                          }}
                        />
                      </div>
                      <div className="flex justify-between mt-2 text-xs">
                        <span className="text-green-600 dark:text-green-400">
                          Paid: ${banking.revenueFlow.totalPaidOut.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-amber-600 dark:text-amber-400">
                          Awaiting: ${banking.revenueFlow.awaitingPayout.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <span className="text-purple-600 dark:text-purple-400">
                          Pending Bookings: ${banking.revenueFlow.pendingNetRevenue.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Balance Cards */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <IoWalletOutline className="w-4 h-4" />
                      <span className="text-xs">Available</span>
                    </div>
                    <div className="text-2xl font-bold text-green-600 dark:text-green-400">
                      ${(banking.balances.current || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <IoTimeOutline className="w-4 h-4" />
                      <span className="text-xs">Pending</span>
                    </div>
                    <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                      ${(banking.balances.pending || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <IoAlertCircleOutline className="w-4 h-4" />
                      <span className="text-xs">On Hold</span>
                    </div>
                    <div className="text-2xl font-bold text-red-600 dark:text-red-400">
                      ${(banking.balances.hold || 0).toFixed(2)}
                    </div>
                  </div>
                  <div className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700">
                    <div className="flex items-center gap-2 text-gray-500 dark:text-gray-400 mb-1">
                      <IoCashOutline className="w-4 h-4" />
                      <span className="text-xs">Total Payouts</span>
                    </div>
                    <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      ${(banking.payout.totalPayouts || 0).toFixed(2)}
                    </div>
                  </div>
                </div>

                {/* Payment Methods & Stripe Status */}
                <div className="grid lg:grid-cols-2 gap-6">
                  {/* Payment Methods */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Payment Methods</h3>
                    {banking.bankAccount ? (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg mb-3">
                        <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                          <IoCashOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {banking.bankAccount.bankName}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ••••{banking.bankAccount.last4} ({banking.bankAccount.accountType})
                          </div>
                        </div>
                        {banking.bankAccount.verified && (
                          <span className="text-xs text-green-600 dark:text-green-400 font-medium">Verified</span>
                        )}
                      </div>
                    ) : (
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-3">No bank account on file</p>
                    )}

                    {banking.debitCard && (
                      <div className="flex items-center gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                        <div className="p-2 bg-purple-100 dark:bg-purple-900/30 rounded-lg">
                          <IoCardOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                        </div>
                        <div className="flex-1">
                          <div className="font-medium text-gray-900 dark:text-white">
                            {banking.debitCard.brand}
                          </div>
                          <div className="text-sm text-gray-500 dark:text-gray-400">
                            ••••{banking.debitCard.last4} • Exp {banking.debitCard.expMonth}/{banking.debitCard.expYear}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Stripe Status */}
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Stripe Status</h3>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Connect Account</span>
                        <span className={`text-sm font-medium ${banking.stripeConnect.accountId ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {banking.stripeConnect.accountId ? 'Connected' : 'Not Connected'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Payouts</span>
                        <span className={`text-sm font-medium ${banking.stripeConnect.payoutsEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {banking.stripeConnect.payoutsEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Charges</span>
                        <span className={`text-sm font-medium ${banking.stripeConnect.chargesEnabled ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                          {banking.stripeConnect.chargesEnabled ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Customer (for charging)</span>
                        <span className={`text-sm font-medium ${banking.stripeCustomer.canCharge ? 'text-green-600 dark:text-green-400' : 'text-yellow-600 dark:text-yellow-400'}`}>
                          {banking.stripeCustomer.canCharge ? 'Ready' : 'No payment method'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Charge Partner Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Charge Partner</h3>

                  {/* Charge Method Selector */}
                  <div className="flex gap-2 mb-4">
                    <button
                      onClick={() => setChargeMethod('connect')}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        chargeMethod === 'connect'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      }`}
                    >
                      <IoWalletOutline className="inline w-4 h-4 mr-1" />
                      Debit Balance
                    </button>
                    <button
                      onClick={() => setChargeMethod('customer')}
                      disabled={!banking.stripeCustomer.canCharge}
                      className={`flex-1 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                        chargeMethod === 'customer'
                          ? 'bg-purple-600 text-white'
                          : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300'
                      } ${!banking.stripeCustomer.canCharge ? 'opacity-50 cursor-not-allowed' : ''}`}
                    >
                      <IoCardOutline className="inline w-4 h-4 mr-1" />
                      Charge Card
                    </button>
                  </div>

                  {/* Method Description */}
                  <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
                    {chargeMethod === 'connect'
                      ? 'Debit from partner\'s payout balance (requires sufficient balance)'
                      : 'Charge partner\'s payment method on file (card/bank)'}
                  </p>

                  {(chargeMethod === 'connect' && banking.stripeConnect.accountId) ||
                   (chargeMethod === 'customer' && banking.stripeCustomer.canCharge) ? (
                    <div className="flex flex-col sm:flex-row gap-3">
                      <input
                        type="number"
                        placeholder="Amount ($)"
                        value={chargeAmount}
                        onChange={(e) => setChargeAmount(e.target.value)}
                        className="w-full sm:w-32 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <input
                        type="text"
                        placeholder="Reason for charge"
                        value={chargeReason}
                        onChange={(e) => setChargeReason(e.target.value)}
                        className="flex-1 px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
                      />
                      <button
                        onClick={handleChargePartner}
                        disabled={chargeProcessing || !chargeAmount || !chargeReason}
                        className={`px-4 py-2 text-white rounded-lg text-sm font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
                          chargeMethod === 'connect' ? 'bg-purple-600 hover:bg-purple-700' : 'bg-red-600 hover:bg-red-700'
                        }`}
                      >
                        {chargeProcessing ? 'Processing...' : chargeMethod === 'connect'
                          ? `Debit $${chargeAmount || '0'}`
                          : `Charge $${chargeAmount || '0'}`}
                      </button>
                    </div>
                  ) : (
                    <div className="p-3 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        <IoWarningOutline className="inline w-4 h-4 mr-1" />
                        {chargeMethod === 'connect'
                          ? 'Partner has no Stripe Connect account.'
                          : 'Partner has no payment method on file.'}
                      </p>
                    </div>
                  )}
                </div>

                {/* Recent Charges */}
                {banking.recentCharges && banking.recentCharges.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Charges</h3>
                    <div className="space-y-3">
                      {banking.recentCharges.map((charge) => (
                        <div key={charge.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              ${charge.amount.toFixed(2)}
                            </div>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                              {charge.reason}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded font-medium ${
                              charge.status === 'COMPLETED'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : charge.status === 'FAILED'
                                ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            }`}>
                              {charge.status}
                            </span>
                            <div className="text-xs text-gray-400 mt-1">
                              {formatDate(charge.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Payouts */}
                {banking.recentPayouts && banking.recentPayouts.length > 0 && (
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                    <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Recent Payouts</h3>
                    <div className="space-y-3">
                      {banking.recentPayouts.map((payout) => (
                        <div key={payout.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                          <div className="flex items-center gap-3">
                            <div className="p-2 bg-green-100 dark:bg-green-900/30 rounded-lg">
                              <IoCashOutline className="w-4 h-4 text-green-600 dark:text-green-400" />
                            </div>
                            <div className="font-medium text-gray-900 dark:text-white">
                              ${payout.amount.toFixed(2)}
                            </div>
                          </div>
                          <div className="text-right">
                            <span className={`text-xs px-2 py-1 rounded font-medium ${
                              payout.status === 'COMPLETED'
                                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'
                                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-400'
                            }`}>
                              {payout.status}
                            </span>
                            <div className="text-xs text-gray-400 mt-1">
                              {formatDate(payout.createdAt)}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Funds Management Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
                  <h3 className="font-semibold text-gray-900 dark:text-white mb-4">Funds Management</h3>

                  {/* Payout Settings */}
                  <div className="grid sm:grid-cols-2 gap-4 mb-6">
                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Payouts Status</span>
                        {banking.payout.enabled ? (
                          <span className="flex items-center gap-1 text-xs text-green-600 dark:text-green-400 font-medium">
                            <IoCheckmarkCircleOutline className="w-4 h-4" />
                            Enabled
                          </span>
                        ) : (
                          <span className="flex items-center gap-1 text-xs text-red-600 dark:text-red-400 font-medium">
                            <IoCloseCircleOutline className="w-4 h-4" />
                            Suspended
                          </span>
                        )}
                      </div>
                      {!banking.payout.enabled && banking.payout.disabledReason && (
                        <p className="text-xs text-red-600 dark:text-red-400 mt-1">
                          Reason: {banking.payout.disabledReason}
                        </p>
                      )}
                      <button
                        onClick={() => handleTogglePayouts(!banking.payout.enabled)}
                        disabled={fundsProcessing}
                        className={`mt-2 w-full px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                          banking.payout.enabled
                            ? 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 hover:bg-red-200 dark:hover:bg-red-900/50'
                            : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400 hover:bg-green-200 dark:hover:bg-green-900/50'
                        }`}
                      >
                        {banking.payout.enabled ? 'Suspend Payouts' : 'Enable Payouts'}
                      </button>
                    </div>

                    <div className="p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm text-gray-500 dark:text-gray-400">Instant Payouts</span>
                        {banking.payout.instantEnabled ? (
                          <span className="flex items-center gap-1 text-xs text-purple-600 dark:text-purple-400 font-medium">
                            <IoSpeedometerOutline className="w-4 h-4" />
                            Enabled
                          </span>
                        ) : (
                          <span className="text-xs text-gray-500 dark:text-gray-400">Disabled</span>
                        )}
                      </div>
                      <p className="text-xs text-gray-500 dark:text-gray-400 mb-2">
                        {banking.debitCard ? 'Debit card on file' : 'No debit card on file'}
                      </p>
                      <button
                        onClick={handleToggleInstantPayout}
                        disabled={fundsProcessing || !banking.debitCard}
                        className={`w-full px-3 py-1.5 text-xs font-medium rounded-lg transition-colors disabled:opacity-50 ${
                          banking.payout.instantEnabled
                            ? 'bg-gray-100 dark:bg-gray-600 text-gray-700 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-gray-500'
                            : 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-400 hover:bg-purple-200 dark:hover:bg-purple-900/50'
                        }`}
                      >
                        {banking.payout.instantEnabled ? 'Disable Instant' : 'Enable Instant'}
                      </button>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div className="grid sm:grid-cols-3 gap-3">
                    <button
                      onClick={() => {
                        setHoldAction('hold')
                        setShowHoldModal(true)
                      }}
                      disabled={fundsProcessing || (banking.balances.current || 0) <= 0}
                      className="px-4 py-2 bg-amber-600 hover:bg-amber-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Hold Funds
                    </button>
                    <button
                      onClick={() => {
                        setHoldAction('release')
                        setShowHoldModal(true)
                      }}
                      disabled={fundsProcessing || (banking.balances.hold || 0) <= 0}
                      className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Release Funds
                    </button>
                    <button
                      onClick={() => setShowPayoutModal(true)}
                      disabled={fundsProcessing || (banking.balances.availableForPayout || 0) <= 0 || !banking.stripeConnect.accountId}
                      className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white text-sm font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      Force Payout
                    </button>
                  </div>

                  {/* Available for payout info */}
                  <div className="mt-4 p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      <strong>Available for payout:</strong> ${(banking.balances.availableForPayout || 0).toFixed(2)}
                      {banking.balances.hold > 0 && (
                        <span className="text-xs ml-2">
                          (${banking.balances.current.toFixed(2)} balance - ${banking.balances.hold.toFixed(2)} held)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-12 text-center">
                <IoWalletOutline className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">
                  No banking data available
                </h3>
                <p className="text-gray-500 dark:text-gray-400">
                  Banking information could not be loaded.
                </p>
              </div>
            )}
          </div>
        )}

        {activeTab === 'activity' && (
          <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Activity Log</h3>

            {activityLoading ? (
              <div className="animate-pulse space-y-3">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-16 bg-gray-200 dark:bg-gray-700 rounded-lg" />
                ))}
              </div>
            ) : activities.length > 0 ? (
              <div className="space-y-3">
                {activities.map((activity) => {
                  const activityIcon = getActivityIcon(activity.type)
                  return (
                    <div
                      key={activity.id}
                      className={`flex items-start gap-3 p-3 bg-gray-50 dark:bg-gray-700/50 rounded-lg border-l-4 ${getActivitySeverityColor(activity.severity)}`}
                    >
                      <div className={`p-2 rounded-full ${activityIcon.bgColor}`}>
                        {activityIcon.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {activity.title}
                        </p>
                        {activity.description && (
                          <p className="text-xs text-gray-500 dark:text-gray-400 mt-0.5 truncate">
                            {activity.description}
                          </p>
                        )}
                        <p className="text-xs text-gray-400 mt-1">
                          {formatDate(activity.timestamp)}
                        </p>
                      </div>
                    </div>
                  )
                })}
              </div>
            ) : (
              <div className="text-center py-8">
                <IoTimeOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500 dark:text-gray-400">No activity recorded yet.</p>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Suspend Modal */}
      {showSuspendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Suspend Partner
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {partner.partnerCompanyName}
              </p>
            </div>

            <div className="p-6">
              <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-3 mb-4">
                <p className="text-sm text-red-800 dark:text-red-200">
                  Suspending this partner will deactivate all their vehicle listings and prevent new bookings.
                </p>
              </div>

              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Reason for suspension
              </label>
              <textarea
                value={suspendReason}
                onChange={(e) => setSuspendReason(e.target.value)}
                placeholder="Enter the reason for suspension..."
                rows={3}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-red-500 focus:border-red-500"
              />
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowSuspendModal(false)
                  setSuspendReason('')
                }}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSuspend}
                disabled={processing || !suspendReason.trim()}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {processing ? 'Processing...' : 'Suspend Partner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Edit Commission Modal */}
      {showEditCommissionModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Edit Commission Rate
              </h2>
            </div>

            <div className="p-6">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Commission Rate (%)
              </label>
              <input
                type="number"
                value={Math.round(newCommissionRate * 100)}
                onChange={(e) => setNewCommissionRate(parseInt(e.target.value) / 100)}
                min="5"
                max="50"
                step="1"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-lg font-semibold focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
              />
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                Partner keeps {100 - Math.round(newCommissionRate * 100)}% of each booking
              </p>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowEditCommissionModal(false)
                  setNewCommissionRate(partner.currentCommissionRate)
                }}
                disabled={processing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleUpdateCommission}
                disabled={processing}
                className="flex-1 px-4 py-2 bg-orange-600 hover:bg-orange-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {processing ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Vehicle Detail Modal */}
      {selectedVehicle && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50" onClick={() => setSelectedVehicle(null)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-2xl shadow-xl max-h-[90vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="sticky top-0 bg-white dark:bg-gray-800 p-4 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                  {selectedVehicle.year} {selectedVehicle.make} {selectedVehicle.model}
                </h2>
                {selectedVehicle.trim && (
                  <p className="text-sm text-gray-500 dark:text-gray-400">{selectedVehicle.trim}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedVehicle(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full transition-colors"
              >
                <IoCloseOutline className="w-5 h-5 text-gray-500" />
              </button>
            </div>

            {/* Photo Gallery */}
            <div className="relative aspect-[16/9] bg-gray-100 dark:bg-gray-700">
              {selectedVehicle.photos?.length > 0 ? (
                <>
                  <img
                    src={selectedVehicle.photos[vehicleModalPhoto]?.url}
                    alt={`${selectedVehicle.year} ${selectedVehicle.make} ${selectedVehicle.model}`}
                    className="w-full h-full object-cover"
                  />
                  {selectedVehicle.photos.length > 1 && (
                    <div className="absolute bottom-3 left-1/2 -translate-x-1/2 flex gap-1.5">
                      {selectedVehicle.photos.map((_photo: { url: string; isHero: boolean }, idx: number) => (
                        <button
                          key={idx}
                          onClick={() => setVehicleModalPhoto(idx)}
                          className={`w-2 h-2 rounded-full transition-colors ${
                            idx === vehicleModalPhoto
                              ? 'bg-white'
                              : 'bg-white/50 hover:bg-white/75'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </>
              ) : (
                <div className="w-full h-full flex items-center justify-center">
                  <IoCarOutline className="w-16 h-16 text-gray-400" />
                </div>
              )}

              {/* Status Badge */}
              <div className="absolute top-3 right-3">
                <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                  selectedVehicle.isActive
                    ? 'bg-green-100 text-green-700 dark:bg-green-900/50 dark:text-green-400'
                    : 'bg-gray-100 text-gray-700 dark:bg-gray-700 dark:text-gray-400'
                }`}>
                  {selectedVehicle.isActive ? 'Active' : 'Inactive'}
                </span>
              </div>
            </div>

            {/* Vehicle Info */}
            <div className="p-4 space-y-4">
              {/* Pricing */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-orange-50 dark:bg-orange-900/20 rounded-lg">
                  <div className="text-xl font-bold text-orange-600 dark:text-orange-400">
                    ${selectedVehicle.dailyRate || '—'}
                  </div>
                  <div className="text-xs text-gray-500">per day</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${selectedVehicle.weeklyRate || '—'}
                  </div>
                  <div className="text-xs text-gray-500">per week</div>
                </div>
                <div className="text-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <div className="text-lg font-semibold text-gray-900 dark:text-white">
                    ${selectedVehicle.monthlyRate || '—'}
                  </div>
                  <div className="text-xs text-gray-500">per month</div>
                </div>
              </div>

              {/* Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <IoCarOutline className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">{selectedVehicle.totalTrips || 0}</div>
                    <div className="text-xs text-gray-500">Trips</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <IoStar className="w-5 h-5 text-yellow-500" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {selectedVehicle.rating ? selectedVehicle.rating.toFixed(1) : '—'}
                    </div>
                    <div className="text-xs text-gray-500">Rating</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                  <IoSpeedometerOutline className="w-5 h-5 text-gray-400" />
                  <div>
                    <div className="font-medium text-gray-900 dark:text-white">
                      {selectedVehicle.currentMileage ? `${(selectedVehicle.currentMileage / 1000).toFixed(0)}k` : '—'}
                    </div>
                    <div className="text-xs text-gray-500">Miles</div>
                  </div>
                </div>
              </div>

              {/* Details */}
              <div className="grid grid-cols-2 gap-x-4 gap-y-3 p-4 bg-gray-50 dark:bg-gray-700/50 rounded-lg">
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Color</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {selectedVehicle.color || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Transmission</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {selectedVehicle.transmission || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Fuel Type</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white capitalize">
                    {selectedVehicle.fuelType || '—'}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-gray-500 dark:text-gray-400">Seats</div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    {selectedVehicle.seats || '—'}
                  </div>
                </div>
                {selectedVehicle.licensePlate && (
                  <div>
                    <div className="text-xs text-gray-500 dark:text-gray-400">License Plate</div>
                    <div className="text-sm font-medium text-gray-900 dark:text-white">
                      {selectedVehicle.licensePlate}
                    </div>
                  </div>
                )}
                {selectedVehicle.vin && (
                  <div className="col-span-2">
                    <div className="text-xs text-gray-500 dark:text-gray-400">VIN</div>
                    <div className="text-sm font-mono text-gray-900 dark:text-white break-all">
                      {selectedVehicle.vin}
                    </div>
                  </div>
                )}
              </div>

              {/* Added Date */}
              <div className="text-xs text-gray-500 dark:text-gray-400 text-center">
                Added {formatDate(selectedVehicle.createdAt)}
              </div>

              {/* Fleet Admin Actions */}
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4 mt-4">
                <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">Fleet Controls</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedVehicle.isActive ? (
                    <button
                      onClick={() => handleVehicleAction(selectedVehicle.id, 'suspend', 'Suspended by fleet admin')}
                      disabled={vehicleActionProcessing}
                      className="flex items-center gap-1.5 px-3 py-2 bg-red-100 hover:bg-red-200 dark:bg-red-900/30 dark:hover:bg-red-900/50 text-red-700 dark:text-red-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <IoPauseCircleOutline className="w-4 h-4" />
                      Suspend Vehicle
                    </button>
                  ) : (
                    <button
                      onClick={() => handleVehicleAction(selectedVehicle.id, 'activate')}
                      disabled={vehicleActionProcessing}
                      className="flex items-center gap-1.5 px-3 py-2 bg-green-100 hover:bg-green-200 dark:bg-green-900/30 dark:hover:bg-green-900/50 text-green-700 dark:text-green-400 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                    >
                      <IoCheckmarkCircleOutline className="w-4 h-4" />
                      Activate Vehicle
                    </button>
                  )}
                  <button
                    onClick={() => {
                      const reason = prompt('Enter rejection reason (optional):')
                      handleVehicleAction(selectedVehicle.id, 'reject', reason || 'Rejected by fleet admin')
                    }}
                    disabled={vehicleActionProcessing}
                    className="flex items-center gap-1.5 px-3 py-2 bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-300 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
                  >
                    <IoCloseCircleOutline className="w-4 h-4" />
                    Reject Listing
                  </button>
                </div>
                {vehicleActionProcessing && (
                  <div className="mt-2 flex items-center gap-2 text-sm text-gray-500">
                    <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin" />
                    Processing...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Hold/Release Funds Modal */}
      {showHoldModal && banking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                {holdAction === 'hold' ? 'Hold Funds' : 'Release Funds'}
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {partner?.partnerCompanyName || partner?.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              {/* Hold/Release toggle */}
              <div className="flex gap-2">
                <button
                  onClick={() => setHoldAction('hold')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    holdAction === 'hold'
                      ? 'bg-amber-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Hold
                </button>
                <button
                  onClick={() => setHoldAction('release')}
                  className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    holdAction === 'release'
                      ? 'bg-green-600 text-white'
                      : 'border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300'
                  }`}
                >
                  Release
                </button>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={holdAmount}
                  onChange={(e) => setHoldAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {holdAction === 'hold'
                    ? `Available: $${(banking.balances.current || 0).toFixed(2)}`
                    : `Currently held: $${(banking.balances.hold || 0).toFixed(2)}`}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason *
                </label>
                <textarea
                  value={holdReason}
                  onChange={(e) => setHoldReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder={holdAction === 'hold' ? 'Explain why you are holding these funds...' : 'Explain why you are releasing these funds...'}
                />
              </div>

              {holdAction === 'hold' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Hold Until (optional)
                  </label>
                  <input
                    type="date"
                    value={holdUntil}
                    onChange={(e) => setHoldUntil(e.target.value)}
                    className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  />
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowHoldModal(false)
                  setHoldAmount('')
                  setHoldReason('')
                  setHoldUntil('')
                }}
                disabled={fundsProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleFundsAction}
                disabled={fundsProcessing || !holdAmount || !holdReason}
                className={`flex-1 px-4 py-2 text-white rounded-lg font-medium transition-colors disabled:opacity-50 ${
                  holdAction === 'hold' ? 'bg-amber-600 hover:bg-amber-700' : 'bg-green-600 hover:bg-green-700'
                }`}
              >
                {fundsProcessing ? 'Processing...' : holdAction === 'hold' ? 'Hold Funds' : 'Release Funds'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Force Payout Modal */}
      {showPayoutModal && banking && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <div className="bg-white dark:bg-gray-800 rounded-lg w-full max-w-md shadow-xl">
            <div className="p-6 border-b border-gray-200 dark:border-gray-700">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">
                Force Immediate Payout
              </h2>
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                {partner?.partnerCompanyName || partner?.name}
              </p>
            </div>

            <div className="p-6 space-y-4">
              <div className="p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  This will override the normal payout schedule and send money immediately to the partner's bank account.
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount ($)
                </label>
                <input
                  type="number"
                  step="0.01"
                  value={payoutAmount}
                  onChange={(e) => setPayoutAmount(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  placeholder="0.00"
                />
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Available for payout: ${(banking.balances.availableForPayout || 0).toFixed(2)}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Reason *
                </label>
                <textarea
                  value={payoutReason}
                  onChange={(e) => setPayoutReason(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                  rows={3}
                  placeholder="Explain why this payout is being forced..."
                />
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 dark:border-gray-700 flex gap-3">
              <button
                onClick={() => {
                  setShowPayoutModal(false)
                  setPayoutAmount('')
                  setPayoutReason('')
                }}
                disabled={fundsProcessing}
                className="flex-1 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg font-medium hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors disabled:opacity-50"
              >
                Cancel
              </button>
              <button
                onClick={handleForcePayout}
                disabled={fundsProcessing || !payoutAmount || !payoutReason}
                className="flex-1 px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-lg font-medium transition-colors disabled:opacity-50"
              >
                {fundsProcessing ? 'Processing...' : 'Force Payout'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
