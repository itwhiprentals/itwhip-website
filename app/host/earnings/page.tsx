// app/host/earnings/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import PendingBanner from '@/app/host/components/PendingBanner'
import {
  IoWalletOutline,
  IoCashOutline,
  IoTrendingUpOutline,
  IoCarOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoDownloadOutline,
  IoInformationCircleOutline,
  IoReceiptOutline,
  IoStatsChartOutline,
  IoCalculatorOutline,
  IoFlashOutline,
  IoCloseOutline,
  IoBanOutline,
  IoAlertCircleOutline,
  IoBarChartOutline,
  IoShieldCheckmarkOutline,
  IoPeopleOutline,
  IoKeyOutline,
  IoArrowBackOutline
} from 'react-icons/io5'

interface EarningsData {
  currentBalance: number
  pendingBalance: number
  totalEarnings: number
  // NEW: 3-tier system fields
  earningsTier: 'BASIC' | 'STANDARD' | 'PREMIUM'
  tierName: string
  hostEarningsPercentage: number
  platformFee: number
  earningsLabel: string
  tierDescription: string
  tierBadgeColor: string
  nextTier?: string
  nextTierLabel?: string
  // Legacy compatibility
  hasOwnInsurance: boolean
  earningsPercentage: number
  lastPayout: {
    amount: number
    date: string
    method: string
  } | null
  upcomingPayout: {
    amount: number
    estimatedDate: string
  } | null
  monthlyEarnings: Array<{
    month: string
    year: number
    earnings: number
    bookings: number
  }>
  recentTransactions: Array<{
    id: string
    type: 'booking' | 'payout' | 'refund' | 'adjustment'
    description: string
    amount: number
    date: string
    status: 'completed' | 'pending' | 'processing'
    bookingCode?: string
  }>
  yearToDate: {
    earnings: number
    bookings: number
    averagePerBooking: number
  }
  // NEW: Earnings breakdown by source
  earningsBreakdown?: {
    ownVehicles: {
      totalEarnings: number
      pendingEarnings: number
      vehicleCount: number
      bookingCount: number
    }
    managedVehicles: {
      totalEarnings: number
      pendingEarnings: number
      vehicleCount: number
      bookingCount: number
      averageCommission: number
    }
  }
}

interface PayoutMethod {
  id: string
  type: 'bank_account' | 'card'
  bankName?: string
  brand?: string
  last4: string
  accountType?: string
  expMonth?: number
  expYear?: number
  status?: string
  isDefault: boolean
}

interface HostStatus {
  approvalStatus: 'PENDING' | 'NEEDS_ATTENTION' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
  pendingActions?: string[]
  restrictionReasons?: string[]
  verificationProgress?: number
  statusMessage?: string
  suspendedReason?: string
}

type TimeRange = 'week' | 'month' | 'quarter' | 'year' | 'all'

const INSTANT_PAYOUT_FEE_RATE = 0.015
const MIN_STANDARD_PAYOUT = 50
const MIN_INSTANT_PAYOUT = 10
const MAX_INSTANT_PAYOUT = 1000

export default function HostEarningsPage() {
  const router = useRouter()
  const [loading, setLoading] = useState(true)
  const [statusLoading, setStatusLoading] = useState(true)
  const [earnings, setEarnings] = useState<EarningsData | null>(null)
  const [payoutMethods, setPayoutMethods] = useState<PayoutMethod[]>([])
  const [timeRange, setTimeRange] = useState<TimeRange>('all') // ✅ DEFAULT TO 'ALL'
  const [showPayoutModal, setShowPayoutModal] = useState(false)
  const [showConfirmationModal, setShowConfirmationModal] = useState(false)
  const [requestingPayout, setRequestingPayout] = useState(false)
  const [payoutAmount, setPayoutAmount] = useState('')
  const [selectedPayoutMethod, setSelectedPayoutMethod] = useState<string>('')
  const [hostStatus, setHostStatus] = useState<HostStatus | null>(null)
  const [vehicleType, setVehicleType] = useState<'economy' | 'standard' | 'luxury'>('standard')
  const [daysPerMonth, setDaysPerMonth] = useState(15)
  const [calculatorTier, setCalculatorTier] = useState<'BASIC' | 'STANDARD' | 'PREMIUM'>('STANDARD')
  const [isHostManager, setIsHostManager] = useState(false)
  const [managesOwnCars, setManagesOwnCars] = useState<boolean | null>(null)
  const [showBreakdown, setShowBreakdown] = useState(false)

  // Fleet Manager Commission Calculator state (for pending view)
  const [vehiclesManaged, setVehiclesManaged] = useState(5)
  const [avgBookingValue, setAvgBookingValue] = useState(100)
  const [commissionRate, setCommissionRate] = useState(25)
  const [daysBookedPerMonth, setDaysBookedPerMonth] = useState(15)

  // Fleet Manager = hosts who ONLY manage other people's cars (no vehicles of their own)
  const isFleetManager = managesOwnCars === false

  // Commission calculator for Fleet Managers
  const calculateCommissionEarnings = () => {
    const monthlyCommission = vehiclesManaged * avgBookingValue * daysBookedPerMonth * (commissionRate / 100)
    return {
      monthly: monthlyCommission,
      annual: monthlyCommission * 12,
      grossBookings: vehiclesManaged * avgBookingValue * daysBookedPerMonth
    }
  }
  const commissionEarnings = calculateCommissionEarnings()

  useEffect(() => {
    fetchHostStatus()
    checkAccountType()
  }, [])

  const checkAccountType = async () => {
    try {
      const response = await fetch('/api/host/account-type', {
        credentials: 'include'
      })
      if (response.ok) {
        const data = await response.json()
        setIsHostManager(data.isHostManager || data.managedVehicleCount > 0)
        setManagesOwnCars(data.managesOwnCars)
      }
    } catch (error) {
      console.error('Failed to check account type:', error)
    }
  }

  // Smart back button - goes to previous page or appropriate dashboard
  const handleBack = () => {
    if (window.history.length > 1) {
      router.back()
    } else {
      router.push(isFleetManager ? '/partner/dashboard' : '/host/dashboard')
    }
  }

  useEffect(() => {
    if (hostStatus?.approvalStatus === 'APPROVED' || hostStatus?.approvalStatus === 'SUSPENDED') {
      fetchEarnings()
      if (hostStatus.approvalStatus === 'APPROVED') {
        fetchPayoutMethods()
      }
    } else if (hostStatus) {
      setLoading(false)
    }
  }, [timeRange, hostStatus?.approvalStatus])

  const fetchHostStatus = async () => {
    try {
      setStatusLoading(true)
      const response = await fetch('/api/host/verification-status', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const result = await response.json()
        
        if (result.success && result.data) {
          setHostStatus({
            approvalStatus: result.data.overallStatus,
            pendingActions: result.data.nextSteps?.map((step: any) => step.action) || [],
            restrictionReasons: result.data.restrictions || [],
            verificationProgress: result.data.verificationProgress,
            statusMessage: result.data.statusMessage,
            suspendedReason: result.data.suspendedReason
          })
        } else {
          setHostStatus({
            approvalStatus: 'PENDING',
            pendingActions: [],
            restrictionReasons: []
          })
        }
      } else {
        setHostStatus({
          approvalStatus: 'PENDING',
          pendingActions: [],
          restrictionReasons: []
        })
      }
    } catch (error) {
      console.error('Failed to fetch host status:', error)
      setHostStatus({
        approvalStatus: 'PENDING',
        pendingActions: [],
        restrictionReasons: []
      })
    } finally {
      setStatusLoading(false)
    }
  }

  const fetchEarnings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/host/earnings?range=${timeRange}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        setEarnings(data)
      } else {
        // ✅ FIXED: Fallback mock data - Default to BASIC tier (40%)
        setEarnings({
          currentBalance: 2847.50,
          pendingBalance: 450.00,
          totalEarnings: 15420.00,
          earningsTier: 'BASIC',
          tierName: 'Basic',
          hostEarningsPercentage: 0.40,
          platformFee: 0.60,
          earningsLabel: 'Earn 40%',
          tierDescription: 'No insurance added yet - using platform insurance',
          tierBadgeColor: 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400',
          nextTier: 'STANDARD',
          nextTierLabel: 'Add P2P Insurance to earn 75%',
          hasOwnInsurance: false,
          earningsPercentage: 0.40,
          lastPayout: {
            amount: 1200.00,
            date: '2025-01-15',
            method: 'Bank Transfer'
          },
          upcomingPayout: {
            amount: 2847.50,
            estimatedDate: '2025-02-01'
          },
          monthlyEarnings: [
            { month: 'January', year: 2025, earnings: 3200, bookings: 12 },
            { month: 'December', year: 2024, earnings: 2850, bookings: 10 },
            { month: 'November', year: 2024, earnings: 2600, bookings: 9 },
            { month: 'October', year: 2024, earnings: 3100, bookings: 11 }
          ],
          recentTransactions: [
            {
              id: '1',
              type: 'booking',
              description: '2025 Lamborghini Huracán - 3 days',
              amount: 2100,
              date: '2025-01-28',
              status: 'completed',
              bookingCode: 'RENT-2025-ABC123'
            },
            {
              id: '2',
              type: 'booking',
              description: '2024 Porsche 911 - 2 days',
              amount: 1400,
              date: '2025-01-25',
              status: 'pending',
              bookingCode: 'RENT-2025-XYZ789'
            },
            {
              id: '3',
              type: 'payout',
              description: 'Weekly payout to Bank ****1234',
              amount: -1200,
              date: '2025-01-15',
              status: 'completed'
            }
          ],
          yearToDate: {
            earnings: 3200,
            bookings: 12,
            averagePerBooking: 266.67
          }
        })
      }
    } catch (error) {
      console.error('Failed to fetch earnings:', error)
    } finally {
      setLoading(false)
    }
  }

  const fetchPayoutMethods = async () => {
    try {
      const response = await fetch('/api/host/banking/methods', {
        credentials: 'include'
      })
      
      if (response.ok) {
        const data = await response.json()
        
        if (data.success && data.methods) {
          setPayoutMethods(data.methods)
          
          const defaultMethod = data.methods.find((m: PayoutMethod) => m.isDefault)
          if (defaultMethod) {
            setSelectedPayoutMethod(defaultMethod.id)
          } else if (data.methods.length > 0) {
            setSelectedPayoutMethod(data.methods[0].id)
          }
        }
      }
    } catch (error) {
      console.error('Failed to fetch payout methods:', error)
    }
  }

  const getSelectedMethod = () => {
    return payoutMethods.find(m => m.id === selectedPayoutMethod)
  }

  const isInstantPayout = () => {
    const method = getSelectedMethod()
    return method?.type === 'card'
  }

  const calculateInstantFee = (amount: number) => {
    return amount * INSTANT_PAYOUT_FEE_RATE
  }

  const calculateNetAmount = (amount: number) => {
    if (isInstantPayout()) {
      return amount - calculateInstantFee(amount)
    }
    return amount
  }

  const handlePayoutClick = () => {
    const amount = parseFloat(payoutAmount)
    
    if (!amount || amount <= 0) {
      alert('Please enter a valid amount')
      return
    }
    
    if (!selectedPayoutMethod) {
      alert('Please select a payout method')
      return
    }
    
    if (earnings && amount > earnings.currentBalance) {
      alert('Amount exceeds available balance')
      return
    }

    const minAmount = isInstantPayout() ? MIN_INSTANT_PAYOUT : MIN_STANDARD_PAYOUT
    if (amount < minAmount) {
      alert(`Minimum ${isInstantPayout() ? 'instant' : 'standard'} payout is $${minAmount}`)
      return
    }

    if (isInstantPayout() && amount > MAX_INSTANT_PAYOUT) {
      alert(`Maximum instant payout is $${MAX_INSTANT_PAYOUT}. Please use standard payout for larger amounts.`)
      return
    }

    if (isInstantPayout()) {
      setShowConfirmationModal(true)
    } else {
      handleRequestPayout()
    }
  }

  const handleRequestPayout = async () => {
    setRequestingPayout(true)
    
    try {
      const response = await fetch('/api/host/earnings/payout', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        credentials: 'include',
        body: JSON.stringify({
          amount: parseFloat(payoutAmount),
          payoutMethodId: selectedPayoutMethod,
          instant: isInstantPayout()
        })
      })
      
      if (response.ok) {
        alert(isInstantPayout() 
          ? 'Instant payout processed! Money should arrive in ~30 minutes.'
          : 'Payout requested successfully! Money will arrive in 2-3 business days.')
        setShowPayoutModal(false)
        setShowConfirmationModal(false)
        setPayoutAmount('')
        await fetchEarnings()
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to request payout')
      }
    } catch (error) {
      console.error('Failed to request payout:', error)
      alert('An error occurred while requesting payout')
    } finally {
      setRequestingPayout(false)
    }
  }

  const downloadReport = async () => {
    try {
      const response = await fetch(`/api/host/earnings/report?range=${timeRange}`, {
        credentials: 'include'
      })
      
      if (response.ok) {
        const blob = await response.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `earnings-report-${timeRange}.csv`
        a.click()
      }
    } catch (error) {
      console.error('Failed to download report:', error)
    }
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(amount)
  }

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const getTransactionIcon = (type: string) => {
    switch (type) {
      case 'booking':
        return <IoCarOutline className="w-5 h-5 text-green-600" />
      case 'payout':
        return <IoWalletOutline className="w-5 h-5 text-blue-600" />
      case 'refund':
        return <IoReceiptOutline className="w-5 h-5 text-red-600" />
      default:
        return <IoCashOutline className="w-5 h-5 text-gray-600" />
    }
  }

  // ✅ NEW: 3-Tier Calculator
  const calculatePotentialEarnings = () => {
    const rates = {
      economy: 50,
      standard: 100,
      luxury: 250
    }
    
    const dailyRate = rates[vehicleType]
    const monthlyEarnings = dailyRate * daysPerMonth
    
    // Calculate based on selected tier
    let earningsPercentage = 0.40
    let platformFee = 0.60
    
    switch (calculatorTier) {
      case 'BASIC':
        earningsPercentage = 0.40
        platformFee = 0.60
        break
      case 'STANDARD':
        earningsPercentage = 0.75
        platformFee = 0.25
        break
      case 'PREMIUM':
        earningsPercentage = 0.90
        platformFee = 0.10
        break
    }
    
    const feeAmount = monthlyEarnings * platformFee
    const netEarnings = monthlyEarnings * earningsPercentage
    
    return {
      gross: monthlyEarnings,
      platformFee: feeAmount,
      platformFeePercent: platformFee * 100,
      earningsPercent: earningsPercentage * 100,
      net: netEarnings,
      annual: netEarnings * 12,
      tier: calculatorTier
    }
  }

  const potentialEarnings = calculatePotentialEarnings()
  
  const isApproved = hostStatus?.approvalStatus === 'APPROVED'
  const isPending = hostStatus?.approvalStatus === 'PENDING' || hostStatus?.approvalStatus === 'NEEDS_ATTENTION'
  const isSuspended = hostStatus?.approvalStatus === 'SUSPENDED'
  const isRejected = hostStatus?.approvalStatus === 'REJECTED'

  // ✅ Get tier badge color
  const getTierBadgeColor = (tier: string) => {
    switch (tier) {
      case 'BASIC':
        return 'bg-gray-100 text-gray-800 dark:bg-gray-900/30 dark:text-gray-400'
      case 'STANDARD':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-400'
      case 'PREMIUM':
        return 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-400'
      default:
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
    }
  }

  if (statusLoading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Checking account status...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (isRejected) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="max-w-3xl mx-auto px-4 py-16">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-8 text-center">
              <IoBanOutline className="w-16 h-16 text-red-600 dark:text-red-400 mx-auto mb-4" />
              <h2 className="text-2xl font-bold text-red-900 dark:text-red-100 mb-3">
                Application Rejected
              </h2>
              <p className="text-red-800 dark:text-red-300 mb-6">
                Your host application has been rejected. Earnings data is not available for rejected accounts.
              </p>
              <button
                onClick={() => router.push('/contact')}
                className="px-6 py-3 bg-red-600 hover:bg-red-700 text-white font-medium rounded-lg transition-colors"
              >
                Contact Support
              </button>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (loading && (isApproved || isSuspended)) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading earnings...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (isPending) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            {hostStatus && (
              <PendingBanner
                approvalStatus={hostStatus.approvalStatus}
                page="earnings"
                pendingActions={hostStatus.pendingActions}
                restrictionReasons={hostStatus.restrictionReasons}
                onActionClick={() => router.push('/host/profile?tab=documents')}
                isFleetManager={isFleetManager}
              />
            )}

            {hostStatus?.statusMessage && (
              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
                <div className="flex items-start">
                  <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 mr-2 flex-shrink-0 mt-0.5" />
                  <p className="text-sm text-blue-900 dark:text-blue-100">
                    {hostStatus.statusMessage}
                  </p>
                </div>
              </div>
            )}

            {hostStatus?.verificationProgress !== undefined && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    Verification Progress
                  </h3>
                  <span className="text-2xl font-bold text-purple-600">
                    {hostStatus.verificationProgress}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-purple-600 to-blue-600 h-3 rounded-full transition-all"
                    style={{ width: `${hostStatus.verificationProgress}%` }}
                  />
                </div>
              </div>
            )}

            {isFleetManager ? (
              /* ========================================
                 FLEET MANAGER PENDING VIEW
                 They have NO cars, earn commission from managing others' vehicles
                 ======================================== */
              <>
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Commission Earnings Preview
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    See how your commission earnings will work once your account is approved
                  </p>
                </div>

                {/* How Fleet Manager Earnings Work */}
                <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-6 mb-6">
                  <div className="flex items-start gap-3">
                    <IoPeopleOutline className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                    <div>
                      <h3 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                        How Fleet Manager Earnings Work
                      </h3>
                      <p className="text-sm text-blue-800 dark:text-blue-200">
                        As a Fleet Manager, you earn commission on every booking for vehicles you manage.
                        Commission rates are negotiated individually with each vehicle owner when they approve your partnership.
                        You don't need to own any vehicles or handle insurance - owners take care of that.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Commission Calculator */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-sm border border-purple-200 dark:border-purple-800 p-6 mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                      <IoCalculatorOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Commission Calculator
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Estimate your potential commission earnings
                      </p>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-5">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Vehicles You'll Manage: {vehiclesManaged}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="20"
                          value={vehiclesManaged}
                          onChange={(e) => setVehiclesManaged(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>1</span>
                          <span>10</span>
                          <span>20</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Avg. Booking Value: ${avgBookingValue}/day
                        </label>
                        <input
                          type="range"
                          min="50"
                          max="300"
                          step="10"
                          value={avgBookingValue}
                          onChange={(e) => setAvgBookingValue(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>$50</span>
                          <span>$175</span>
                          <span>$300</span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Your Commission Rate: {commissionRate}%
                        </label>
                        <input
                          type="range"
                          min="10"
                          max="40"
                          value={commissionRate}
                          onChange={(e) => setCommissionRate(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>10%</span>
                          <span>25%</span>
                          <span>40%</span>
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Rates vary per vehicle (negotiated with each owner)
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Days Booked Per Month: {daysBookedPerMonth}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={daysBookedPerMonth}
                          onChange={(e) => setDaysBookedPerMonth(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>1 day</span>
                          <span>15 days</span>
                          <span>30 days</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Fleet Bookings</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(commissionEarnings.grossBookings)}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {vehiclesManaged} vehicles × ${avgBookingValue}/day × {daysBookedPerMonth} days
                        </p>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            Your Commission ({commissionRate}%)
                          </span>
                          <span className="text-purple-600 dark:text-purple-400 font-bold">
                            {formatCurrency(commissionEarnings.monthly)}
                          </span>
                        </div>
                      </div>

                      <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Potential Monthly Commission
                        </p>
                        <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                          {formatCurrency(commissionEarnings.monthly)}
                        </p>
                      </div>

                      <div className="bg-green-50 dark:bg-green-900/20 rounded-lg p-3">
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Potential Annual Commission
                        </p>
                        <p className="text-xl font-bold text-green-600 dark:text-green-400">
                          {formatCurrency(commissionEarnings.annual)}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 rounded-lg p-4 border bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800">
                    <p className="text-sm text-purple-900 dark:text-purple-100">
                      <strong>💡 How it works:</strong> Each vehicle owner sets your commission rate when approving your partnership.
                      Commission rates vary per vehicle and are shown in each car's profile. Rates can be negotiated based on your services (marketing, customer service, vehicle coordination, etc.).
                    </p>
                  </div>
                </div>

                {/* CTA */}
                <div className="text-center">
                  <Link
                    href="/host/fleet/invite-owner"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                  >
                    <IoPeopleOutline className="w-5 h-5" />
                    Invite Car Owners to Get Started
                  </Link>
                  <p className="text-sm text-gray-500 dark:text-gray-400 mt-3">
                    Once your account is approved, invite vehicle owners to start earning commission
                  </p>
                </div>
              </>
            ) : (
              /* ========================================
                 REGULAR HOST PENDING VIEW
                 They own cars, earn via insurance tiers (40%, 75%, 90%)
                 ======================================== */
              <>
                <div className="mb-6">
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                    Earnings Potential
                  </h1>
                  <p className="text-gray-600 dark:text-gray-400">
                    See how much you could earn once your account is approved
                  </p>
                </div>

                {/* ✅ 3-Tier Calculator */}
                <div className="bg-gradient-to-br from-purple-50 to-blue-50 dark:from-purple-900/20 dark:to-blue-900/20 rounded-lg shadow-sm border border-purple-200 dark:border-purple-800 p-6 mb-6">
                  <div className="flex items-center gap-3 mb-6">
                    <div className="p-3 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                      <IoCalculatorOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                        Earnings Calculator
                      </h2>
                      <p className="text-sm text-gray-600 dark:text-gray-400">
                        Estimate your potential monthly income
                      </p>
                    </div>
                  </div>

                  {/* 3-Tier Selection */}
                  <div className="mb-6">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                      Choose Your Earnings Tier
                    </label>
                    <div className="grid md:grid-cols-3 gap-3">
                      <button
                        onClick={() => setCalculatorTier('BASIC')}
                        className={`p-4 rounded-lg text-left border-2 transition-all ${
                          calculatorTier === 'BASIC'
                            ? 'border-gray-500 bg-gray-50 dark:bg-gray-900/40'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <IoShieldCheckmarkOutline className={`w-5 h-5 ${calculatorTier === 'BASIC' ? 'text-gray-600' : 'text-gray-400'}`} />
                          <span className={`font-semibold ${calculatorTier === 'BASIC' ? 'text-gray-900 dark:text-gray-100' : 'text-gray-700 dark:text-gray-300'}`}>
                            Basic Tier
                          </span>
                        </div>
                        <p className={`text-sm ${calculatorTier === 'BASIC' ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          <strong className="text-lg">Earn 40%</strong> per booking
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          No insurance required
                        </p>
                      </button>

                      <button
                        onClick={() => setCalculatorTier('STANDARD')}
                        className={`p-4 rounded-lg text-left border-2 transition-all ${
                          calculatorTier === 'STANDARD'
                            ? 'border-green-500 bg-green-50 dark:bg-green-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <IoShieldCheckmarkOutline className={`w-5 h-5 ${calculatorTier === 'STANDARD' ? 'text-green-600' : 'text-gray-400'}`} />
                          <span className={`font-semibold ${calculatorTier === 'STANDARD' ? 'text-green-900 dark:text-green-100' : 'text-gray-700 dark:text-gray-300'}`}>
                            Standard Tier
                          </span>
                        </div>
                        <p className={`text-sm ${calculatorTier === 'STANDARD' ? 'text-green-700 dark:text-green-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          <strong className="text-lg">Earn 75%</strong> per booking
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          P2P insurance required
                        </p>
                      </button>

                      <button
                        onClick={() => setCalculatorTier('PREMIUM')}
                        className={`p-4 rounded-lg text-left border-2 transition-all ${
                          calculatorTier === 'PREMIUM'
                            ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20'
                            : 'border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800'
                        }`}
                      >
                        <div className="flex items-center gap-2 mb-2">
                          <IoShieldCheckmarkOutline className={`w-5 h-5 ${calculatorTier === 'PREMIUM' ? 'text-purple-600' : 'text-gray-400'}`} />
                          <span className={`font-semibold ${calculatorTier === 'PREMIUM' ? 'text-purple-900 dark:text-purple-100' : 'text-gray-700 dark:text-gray-300'}`}>
                            Premium Tier
                          </span>
                        </div>
                        <p className={`text-sm ${calculatorTier === 'PREMIUM' ? 'text-purple-700 dark:text-purple-300' : 'text-gray-500 dark:text-gray-400'}`}>
                          <strong className="text-lg">Earn 90%</strong> per booking
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                          Commercial insurance required
                        </p>
                      </button>
                    </div>
                  </div>

                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Vehicle Type
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {(['economy', 'standard', 'luxury'] as const).map((type) => (
                            <button
                              key={type}
                              onClick={() => setVehicleType(type)}
                              className={`px-4 py-3 rounded-lg text-sm font-medium capitalize transition-all ${
                                vehicleType === type
                                  ? 'bg-purple-600 text-white shadow-md'
                                  : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700'
                              }`}
                            >
                              {type}
                            </button>
                          ))}
                        </div>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                          {vehicleType === 'economy' && 'Avg. $50/day - Compact cars, sedans'}
                          {vehicleType === 'standard' && 'Avg. $100/day - SUVs, midsize vehicles'}
                          {vehicleType === 'luxury' && 'Avg. $250/day - Premium, exotic vehicles'}
                        </p>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                          Days Rented Per Month: {daysPerMonth}
                        </label>
                        <input
                          type="range"
                          min="1"
                          max="30"
                          value={daysPerMonth}
                          onChange={(e) => setDaysPerMonth(parseInt(e.target.value))}
                          className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-lg appearance-none cursor-pointer accent-purple-600"
                        />
                        <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                          <span>1 day</span>
                          <span>15 days</span>
                          <span>30 days</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white dark:bg-gray-800 rounded-lg p-6 space-y-4">
                      <div>
                        <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Gross Monthly Earnings</p>
                        <p className="text-2xl font-bold text-gray-900 dark:text-white">
                          {formatCurrency(potentialEarnings.gross)}
                        </p>
                      </div>

                      <div className="border-t border-gray-200 dark:border-gray-700 pt-3">
                        <div className="flex justify-between text-sm mb-2">
                          <span className="text-gray-600 dark:text-gray-400">
                            Platform Fee ({potentialEarnings.platformFeePercent}%)
                          </span>
                          <span className="text-gray-900 dark:text-white font-medium">
                            -{formatCurrency(potentialEarnings.platformFee)}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-400">
                            Your Earnings ({potentialEarnings.earningsPercent}%)
                          </span>
                          <span className={`font-bold ${
                            calculatorTier === 'BASIC' ? 'text-gray-600 dark:text-gray-400' :
                            calculatorTier === 'STANDARD' ? 'text-green-600 dark:text-green-400' :
                            'text-purple-600 dark:text-purple-400'
                          }`}>
                            {formatCurrency(potentialEarnings.net)}
                          </span>
                        </div>
                      </div>

                      <div className={`rounded-lg p-3 ${
                        calculatorTier === 'BASIC' ? 'bg-gray-50 dark:bg-gray-900/20' :
                        calculatorTier === 'STANDARD' ? 'bg-green-50 dark:bg-green-900/20' :
                        'bg-purple-50 dark:bg-purple-900/20'
                      }`}>
                        <p className="text-xs text-gray-600 dark:text-gray-400 mb-1">
                          Potential Annual Income
                        </p>
                        <p className={`text-xl font-bold ${
                          calculatorTier === 'BASIC' ? 'text-gray-600 dark:text-gray-400' :
                          calculatorTier === 'STANDARD' ? 'text-green-600 dark:text-green-400' :
                          'text-purple-600 dark:text-purple-400'
                        }`}>
                          {formatCurrency(potentialEarnings.annual)}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Tier Impact Notice */}
                  <div className={`mt-4 rounded-lg p-4 border ${
                    calculatorTier === 'BASIC'
                      ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
                      : calculatorTier === 'STANDARD'
                      ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                      : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
                  }`}>
                    <p className={`text-sm ${
                      calculatorTier === 'BASIC' ? 'text-gray-900 dark:text-gray-100' :
                      calculatorTier === 'STANDARD' ? 'text-green-900 dark:text-green-100' :
                      'text-purple-900 dark:text-purple-100'
                    }`}>
                      <strong>💡 Tip:</strong> {
                        calculatorTier === 'BASIC'
                          ? 'Basic tier requires no insurance but earns 40%. Upgrade to Standard (75%) or Premium (90%) for higher earnings!'
                          : calculatorTier === 'STANDARD'
                          ? 'With P2P insurance, you keep 75% of every booking! Upgrade to commercial insurance for 90%.'
                          : 'Maximum earnings! With commercial insurance, you keep 90% of every booking. 🎉'}
                    </p>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (isSuspended) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
          <div className="p-4 sm:p-6 max-w-7xl mx-auto">
            <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-6 mb-6">
              <div className="flex items-start">
                <IoAlertCircleOutline className="w-6 h-6 text-red-600 dark:text-red-400 mr-3 flex-shrink-0 mt-0.5" />
                <div>
                  <h3 className="text-lg font-semibold text-red-900 dark:text-red-100 mb-2">
                    Account Suspended
                  </h3>
                  <p className="text-sm text-red-800 dark:text-red-300 mb-4">
                    {hostStatus?.suspendedReason || 'Your account has been suspended. Payouts are currently disabled.'}
                  </p>
                  <p className="text-xs text-red-700 dark:text-red-400">
                    You can view your past earnings below, but cannot request new payouts until the suspension is lifted.
                  </p>
                </div>
              </div>
            </div>

            <div className="mb-6">
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                Earnings (Read-Only)
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                View your earnings history
              </p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 mb-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 opacity-75">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                    <IoWalletOutline className="w-6 h-6 text-gray-600 dark:text-gray-400" />
                  </div>
                  <IoBanOutline className="w-5 h-5 text-red-600" />
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Available Balance (Held)</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(earnings?.currentBalance || 0)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                    <IoTimeOutline className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Pending</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(earnings?.pendingBalance || 0)}
                </p>
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <div className="flex items-center justify-between mb-4">
                  <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                    <IoBarChartOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                  </div>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">Total Earnings</p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(earnings?.totalEarnings || 0)}
                </p>
              </div>
            </div>

            <div className="grid lg:grid-cols-2 gap-6">
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Past Earnings
                </h3>
                
                {earnings?.monthlyEarnings && earnings.monthlyEarnings.length > 0 ? (
                  <div className="space-y-3">
                    {earnings.monthlyEarnings.slice(0, 3).map((month, index) => (
                      <div key={index} className="flex justify-between items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <span className="text-sm text-gray-700 dark:text-gray-300">
                          {month.month} {month.year}
                        </span>
                        <span className="text-sm font-semibold text-gray-900 dark:text-white">
                          {formatCurrency(month.earnings)}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No earnings data available
                  </p>
                )}
              </div>

              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                  Recent Transactions
                </h3>
                
                {earnings?.recentTransactions && earnings.recentTransactions.length > 0 ? (
                  <div className="space-y-3">
                    {earnings.recentTransactions.slice(0, 3).map((transaction) => (
                      <div key={transaction.id} className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          {getTransactionIcon(transaction.type)}
                          <span className="text-sm text-gray-700 dark:text-gray-300 truncate">
                            {transaction.description}
                          </span>
                        </div>
                        <span className={`text-sm font-semibold ${
                          transaction.amount >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                    No recent transactions
                  </p>
                )}
              </div>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  // ✅ APPROVED HOST VIEW
  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Back Button */}
          <button
            onClick={handleBack}
            className="flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white mb-4 transition-colors"
          >
            <IoArrowBackOutline className="w-5 h-5" />
            <span>Back</span>
          </button>

          <div className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {isFleetManager ? 'Commission Earnings' : 'Earnings'}
              </h1>
              <p className="text-gray-600 dark:text-gray-400">
                {isFleetManager
                  ? 'Your commission from managed vehicles'
                  : 'Track your income and manage payouts'}
              </p>
            </div>

            {/* ✅ NEW: 3-Tier Badge - Only for hosts with cars, not Fleet Managers */}
            {earnings && !isFleetManager && (
              <div className={`px-4 py-2 rounded-full text-sm font-semibold flex items-center gap-2 ${getTierBadgeColor(earnings.earningsTier)}`}>
                <IoShieldCheckmarkOutline className="w-4 h-4" />
                {earnings.earningsLabel}
              </div>
            )}
          </div>

          {/* Fleet Manager Commission Info Banner */}
          {isFleetManager && (
            <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4 mb-6">
              <p className="text-blue-800 dark:text-blue-200 text-sm">
                <strong>Commission Earnings:</strong> As a Fleet Manager, you earn commission on bookings for vehicles you manage. Each vehicle has its own commission rate set when owners approve your partnership. View individual vehicle earnings in each car's profile.
              </p>
            </div>
          )}

          {/* ✅ NEW: 3-Tier Info Banner - Only show for non-Fleet Managers */}
          {earnings && !isFleetManager && (
            <div className={`mb-6 rounded-lg p-4 border ${
              earnings.earningsTier === 'BASIC'
                ? 'bg-gray-50 dark:bg-gray-900/20 border-gray-200 dark:border-gray-800'
                : earnings.earningsTier === 'STANDARD'
                ? 'bg-green-50 dark:bg-green-900/20 border-green-200 dark:border-green-800'
                : 'bg-purple-50 dark:bg-purple-900/20 border-purple-200 dark:border-purple-800'
            }`}>
              <div className="flex items-start gap-3">
                <IoShieldCheckmarkOutline className={`w-5 h-5 mt-0.5 ${
                  earnings.earningsTier === 'BASIC' ? 'text-gray-600 dark:text-gray-400' :
                  earnings.earningsTier === 'STANDARD' ? 'text-green-600 dark:text-green-400' : 
                  'text-purple-600 dark:text-purple-400'
                }`} />
                <div className="flex-1">
                  <p className={`text-sm font-medium ${
                    earnings.earningsTier === 'BASIC' ? 'text-gray-900 dark:text-gray-100' :
                    earnings.earningsTier === 'STANDARD' ? 'text-green-900 dark:text-green-100' : 
                    'text-purple-900 dark:text-purple-100'
                  }`}>
                    {earnings.tierDescription} - {earnings.tierName} Tier
                  </p>
                  <p className={`text-xs mt-1 ${
                    earnings.earningsTier === 'BASIC' ? 'text-gray-700 dark:text-gray-300' :
                    earnings.earningsTier === 'STANDARD' ? 'text-green-700 dark:text-green-300' : 
                    'text-purple-700 dark:text-purple-300'
                  }`}>
                    You earn {(earnings.hostEarningsPercentage * 100).toFixed(0)}% per booking • Platform fee: {(earnings.platformFee * 100).toFixed(0)}%
                  </p>
                </div>
                {earnings.nextTier && (
                  <Link
                    href="/host/profile?tab=insurance"
                    className={`text-xs font-medium hover:underline whitespace-nowrap ${
                      earnings.earningsTier === 'BASIC' ? 'text-gray-700 dark:text-gray-300' :
                      'text-green-700 dark:text-green-300'
                    }`}>
                    Upgrade →
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Fleet Manager Empty State - Show when no commission earnings */}
          {isFleetManager && earnings && earnings.totalEarnings === 0 && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-8 mb-6 text-center">
              <div className="max-w-md mx-auto">
                <div className="p-4 bg-purple-100 dark:bg-purple-900/30 rounded-full inline-block mb-4">
                  <IoPeopleOutline className="w-12 h-12 text-purple-600 dark:text-purple-400" />
                </div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">
                  No commission earnings yet
                </h3>
                <p className="text-gray-600 dark:text-gray-400 mb-6">
                  Start managing vehicles by inviting car owners. Commission rates are negotiated with each owner and shown per vehicle.
                </p>
                <Link
                  href="/host/fleet/invite-owner"
                  className="inline-flex items-center gap-2 px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-semibold rounded-lg transition-colors"
                >
                  <IoPeopleOutline className="w-5 h-5" />
                  Invite Car Owners
                </Link>
              </div>
            </div>
          )}

          {/* Earnings Breakdown by Source - Only show if host manages other vehicles */}
          {isHostManager && earnings?.earningsBreakdown && (
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                  <IoBarChartOutline className="w-5 h-5 text-purple-600" />
                  Earnings Breakdown
                </h3>
                <button
                  onClick={() => setShowBreakdown(!showBreakdown)}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  {showBreakdown ? 'Hide Details' : 'Show Details'}
                </button>
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                {/* Own Vehicles Earnings */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 dark:from-blue-900/20 dark:to-indigo-900/20 border border-blue-200 dark:border-blue-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                      <IoKeyOutline className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">My Vehicles</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Insurance tier earnings</p>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                      {formatCurrency(earnings.earningsBreakdown.ownVehicles.totalEarnings)}
                    </p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {earnings.earningsBreakdown.ownVehicles.vehicleCount} vehicle{earnings.earningsBreakdown.ownVehicles.vehicleCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {showBreakdown && (
                    <div className="mt-3 pt-3 border-t border-blue-200 dark:border-blue-700 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Pending earnings</span>
                        <span className="font-medium">{formatCurrency(earnings.earningsBreakdown.ownVehicles.pendingEarnings)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Total bookings</span>
                        <span className="font-medium">{earnings.earningsBreakdown.ownVehicles.bookingCount}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Your earnings tier</span>
                        <span className={`font-medium ${getTierBadgeColor(earnings.earningsTier)} px-2 py-0.5 rounded text-xs`}>
                          {earnings.earningsLabel}
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Managed Vehicles Earnings */}
                <div className="p-4 rounded-lg bg-gradient-to-br from-purple-50 to-pink-50 dark:from-purple-900/20 dark:to-pink-900/20 border border-purple-200 dark:border-purple-800">
                  <div className="flex items-center gap-3 mb-3">
                    <div className="p-2 bg-purple-100 dark:bg-purple-900/40 rounded-lg">
                      <IoPeopleOutline className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                    </div>
                    <div>
                      <h4 className="font-semibold text-gray-900 dark:text-white">Managed Vehicles</h4>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Commission-based earnings</p>
                    </div>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <p className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                      {formatCurrency(earnings.earningsBreakdown.managedVehicles.totalEarnings)}
                    </p>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {earnings.earningsBreakdown.managedVehicles.vehicleCount} vehicle{earnings.earningsBreakdown.managedVehicles.vehicleCount !== 1 ? 's' : ''}
                    </span>
                  </div>
                  {showBreakdown && (
                    <div className="mt-3 pt-3 border-t border-purple-200 dark:border-purple-700 space-y-2 text-sm">
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Pending earnings</span>
                        <span className="font-medium">{formatCurrency(earnings.earningsBreakdown.managedVehicles.pendingEarnings)}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Total bookings</span>
                        <span className="font-medium">{earnings.earningsBreakdown.managedVehicles.bookingCount}</span>
                      </div>
                      <div className="flex justify-between text-gray-600 dark:text-gray-400">
                        <span>Avg. commission</span>
                        <span className="font-medium text-purple-600 dark:text-purple-400">
                          {earnings.earningsBreakdown.managedVehicles.averageCommission.toFixed(0)}%
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Summary Bar */}
              <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-sm text-gray-600 dark:text-gray-400">Earnings by source:</span>
                </div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden flex">
                  {earnings.earningsBreakdown.ownVehicles.totalEarnings > 0 && (
                    <div
                      className="h-full bg-gradient-to-r from-blue-500 to-indigo-500"
                      style={{
                        width: `${(earnings.earningsBreakdown.ownVehicles.totalEarnings / (earnings.earningsBreakdown.ownVehicles.totalEarnings + earnings.earningsBreakdown.managedVehicles.totalEarnings)) * 100}%`
                      }}
                      title={`My Vehicles: ${formatCurrency(earnings.earningsBreakdown.ownVehicles.totalEarnings)}`}
                    />
                  )}
                  {earnings.earningsBreakdown.managedVehicles.totalEarnings > 0 && (
                    <div
                      className="h-full bg-gradient-to-r from-purple-500 to-pink-500"
                      style={{
                        width: `${(earnings.earningsBreakdown.managedVehicles.totalEarnings / (earnings.earningsBreakdown.ownVehicles.totalEarnings + earnings.earningsBreakdown.managedVehicles.totalEarnings)) * 100}%`
                      }}
                      title={`Managed Vehicles: ${formatCurrency(earnings.earningsBreakdown.managedVehicles.totalEarnings)}`}
                    />
                  )}
                </div>
                <div className="flex justify-between text-xs text-gray-500 dark:text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-blue-500 rounded-full"></span>
                    My Vehicles ({((earnings.earningsBreakdown.ownVehicles.totalEarnings / (earnings.earningsBreakdown.ownVehicles.totalEarnings + earnings.earningsBreakdown.managedVehicles.totalEarnings)) * 100).toFixed(0)}%)
                  </span>
                  <span className="flex items-center gap-1">
                    <span className="w-2 h-2 bg-purple-500 rounded-full"></span>
                    Managed ({((earnings.earningsBreakdown.managedVehicles.totalEarnings / (earnings.earningsBreakdown.ownVehicles.totalEarnings + earnings.earningsBreakdown.managedVehicles.totalEarnings)) * 100).toFixed(0)}%)
                  </span>
                </div>
              </div>
            </div>
          )}

          <div className="grid md:grid-cols-3 gap-4 mb-6">
            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <IoWalletOutline className="w-6 h-6 text-green-600 dark:text-green-400" />
                </div>
                <button
                  onClick={() => setShowPayoutModal(true)}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline"
                >
                  Request Payout
                </button>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {isFleetManager ? 'Commission Available' : 'Available Balance'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(earnings?.currentBalance || 0)}
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-yellow-100 dark:bg-yellow-900/20 rounded-lg">
                  <IoTimeOutline className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
                </div>
                <IoInformationCircleOutline
                  className="w-4 h-4 text-gray-400 cursor-help"
                  title={isFleetManager ? "Commission from recent bookings being processed" : "Funds from recent bookings that are being processed"}
                />
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {isFleetManager ? 'Pending Commission' : 'Pending'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(earnings?.pendingBalance || 0)}
              </p>
              <p className="text-xs text-gray-500 mt-2">
                Available in 2-3 business days
              </p>
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="p-2 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
                  <IoTrendingUpOutline className="w-6 h-6 text-purple-600 dark:text-purple-400" />
                </div>
                <span className="text-xs text-gray-500 capitalize">{timeRange === 'all' ? 'All Time' : timeRange}</span>
              </div>
              <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
                {isFleetManager ? 'Total Commission' : 'Total Earnings'}
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {formatCurrency(earnings?.totalEarnings || 0)}
              </p>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 mb-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex gap-2 overflow-x-auto pb-2 sm:pb-0">
                {(['week', 'month', 'quarter', 'year', 'all'] as TimeRange[]).map((range) => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                      timeRange === range
                        ? 'bg-purple-600 text-white'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700'
                    }`}
                  >
                    {range === 'all' ? 'All Time' : `This ${range}`}
                  </button>
                ))}
              </div>
              <button
                onClick={downloadReport}
                className="flex items-center gap-2 px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm"
              >
                <IoDownloadOutline className="w-4 h-4" />
                Download Report
              </button>
            </div>
          </div>

          <div className="grid lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
                <IoStatsChartOutline className="w-5 h-5 text-purple-600" />
                Monthly Earnings
              </h3>
              
              {earnings?.monthlyEarnings && earnings.monthlyEarnings.length > 0 ? (
                <div className="space-y-4">
                  {earnings.monthlyEarnings.map((month, index) => {
                    const maxEarnings = Math.max(...earnings.monthlyEarnings.map(m => m.earnings))
                    // ✅ Only show bar if there are bookings
                    const widthPercent = month.bookings > 0 ? (month.earnings / maxEarnings) * 100 : 0
                    
                    return (
                      <div key={index}>
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm text-gray-600 dark:text-gray-400">
                            {month.month} {month.year}
                          </span>
                          <span className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatCurrency(month.earnings)}
                          </span>
                        </div>
                        <div className="relative">
                          <div className="h-8 bg-gray-100 dark:bg-gray-700 rounded-full overflow-hidden">
                            {/* ✅ Empty bar if no bookings */}
                            {month.bookings > 0 ? (
                              <div 
                                className="h-full bg-gradient-to-r from-purple-500 to-purple-600 rounded-full transition-all duration-300"
                                style={{ width: `${widthPercent}%` }}
                              />
                            ) : null}
                          </div>
                          <span className="absolute right-2 top-1 text-xs text-gray-500">
                            {month.bookings} {month.bookings === 1 ? 'booking' : 'bookings'}
                          </span>
                        </div>
                      </div>
                    )
                  })}
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No earnings data available for this period
                </p>
              )}

              {earnings?.yearToDate && (
                <div className="mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                  <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                    Year to Date
                  </h4>
                  <div className="grid grid-cols-3 gap-4 text-center">
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Total</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(earnings.yearToDate.earnings)}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Bookings</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {earnings.yearToDate.bookings}
                      </p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-500 dark:text-gray-400">Avg/Booking</p>
                      <p className="text-lg font-bold text-gray-900 dark:text-white">
                        {formatCurrency(earnings.yearToDate.averagePerBooking)}
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
              <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
                Recent Transactions
              </h3>
              
              {earnings?.recentTransactions && earnings.recentTransactions.length > 0 ? (
                <div className="space-y-3">
                  {earnings.recentTransactions.map((transaction) => (
                    <div key={transaction.id} className="flex items-start gap-3">
                      <div className="mt-0.5">
                        {getTransactionIcon(transaction.type)}
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                          {transaction.description}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400">
                          {formatDate(transaction.date)}
                        </p>
                        {transaction.bookingCode && (
                          <Link
                            href={`/host/bookings/${transaction.bookingCode}`}
                            className="text-xs text-purple-600 dark:text-purple-400 hover:underline"
                          >
                            {transaction.bookingCode}
                          </Link>
                        )}
                      </div>
                      <div className="text-right">
                        <p className={`text-sm font-bold ${
                          transaction.amount >= 0 
                            ? 'text-green-600 dark:text-green-400' 
                            : 'text-red-600 dark:text-red-400'
                        }`}>
                          {transaction.amount >= 0 ? '+' : ''}{formatCurrency(Math.abs(transaction.amount))}
                        </p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 capitalize">
                          {transaction.status}
                        </p>
                      </div>
                    </div>
                  ))}
                  
                  <Link
                    href="/host/transactions"
                    className="block text-center text-sm text-purple-600 dark:text-purple-400 hover:underline pt-3"
                  >
                    View All Transactions
                  </Link>
                </div>
              ) : (
                <p className="text-center text-gray-500 dark:text-gray-400 py-8">
                  No recent transactions
                </p>
              )}
            </div>
          </div>

          <div className="mt-6 grid md:grid-cols-2 gap-4">
            {earnings?.lastPayout && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Last Payout
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(earnings.lastPayout.amount)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {formatDate(earnings.lastPayout.date)} via {earnings.lastPayout.method}
                    </p>
                  </div>
                  <IoCheckmarkCircleOutline className="w-8 h-8 text-green-600 dark:text-green-400" />
                </div>
              </div>
            )}
            
            {earnings?.upcomingPayout && (
              <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-6">
                <h3 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
                  Next Payout
                </h3>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(earnings.upcomingPayout.amount)}
                    </p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      Estimated {formatDate(earnings.upcomingPayout.estimatedDate)}
                    </p>
                  </div>
                  <IoTimeOutline className="w-8 h-8 text-yellow-600 dark:text-yellow-400" />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {showPayoutModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-2xl w-full p-6 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                Request Payout
              </h3>
              <button
                onClick={() => setShowPayoutModal(false)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <IoCloseOutline className="w-6 h-6 text-gray-500" />
              </button>
            </div>
            
            <div className="space-y-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Available Balance
                </label>
                <p className="text-3xl font-bold text-gray-900 dark:text-white">
                  {formatCurrency(earnings?.currentBalance || 0)}
                </p>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Amount to Withdraw
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-3 text-gray-500">$</span>
                  <input
                    type="number"
                    value={payoutAmount}
                    onChange={(e) => setPayoutAmount(e.target.value)}
                    max={earnings?.currentBalance || 0}
                    step="0.01"
                    className="w-full pl-8 pr-3 py-3 text-lg border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                    placeholder="0.00"
                  />
                </div>
                <button
                  onClick={() => setPayoutAmount(earnings?.currentBalance.toString() || '0')}
                  className="text-sm text-purple-600 dark:text-purple-400 hover:underline mt-2"
                >
                  Withdraw full balance
                </button>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                  Payout Method
                </label>
                {payoutMethods.length > 0 ? (
                  <select
                    value={selectedPayoutMethod}
                    onChange={(e) => setSelectedPayoutMethod(e.target.value)}
                    className="w-full px-4 py-3 text-base border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white"
                  >
                    {payoutMethods.map((method) => (
                      <option key={method.id} value={method.id}>
                        {method.type === 'bank_account' 
                          ? `${method.bankName || 'Bank'} ****${method.last4}${method.isDefault ? ' (Default)' : ''}` 
                          : `${method.brand} ****${method.last4}${method.isDefault ? ' (Default)' : ''}`}
                      </option>
                    ))}
                  </select>
                ) : (
                  <div className="text-sm text-gray-500 dark:text-gray-400 bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <p className="mb-2">No payout methods configured.</p>
                    <p className="text-purple-600 dark:text-purple-400 font-medium">
                      Complete your banking setup in Profile → Banking tab first
                    </p>
                  </div>
                )}
              </div>

              {payoutMethods.length > 0 && parseFloat(payoutAmount) > 0 && (
                <div className="grid md:grid-cols-2 gap-4">
                  <div className={`border-2 rounded-lg p-4 transition-all ${
                    !isInstantPayout() 
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white">Standard Payout</h4>
                      {!isInstantPayout() && (
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center text-gray-700 dark:text-gray-300">
                        <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600 mr-2" />
                        Free
                      </p>
                      <p className="flex items-center text-gray-700 dark:text-gray-300">
                        <IoTimeOutline className="w-4 h-4 text-gray-500 mr-2" />
                        2-3 business days
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white mt-3">
                        You receive: {formatCurrency(parseFloat(payoutAmount))}
                      </p>
                    </div>
                  </div>

                  <div className={`border-2 rounded-lg p-4 transition-all ${
                    isInstantPayout() 
                      ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
                      : 'border-gray-200 dark:border-gray-700'
                  }`}>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-900 dark:text-white flex items-center gap-1">
                        Instant Payout
                        <IoFlashOutline className="w-4 h-4 text-purple-600" />
                      </h4>
                      {isInstantPayout() && (
                        <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                      )}
                    </div>
                    <div className="space-y-2 text-sm">
                      <p className="flex items-center text-gray-700 dark:text-gray-300">
                        <IoCashOutline className="w-4 h-4 text-purple-600 mr-2" />
                        1.5% fee ({formatCurrency(calculateInstantFee(parseFloat(payoutAmount)))})
                      </p>
                      <p className="flex items-center text-gray-700 dark:text-gray-300">
                        <IoFlashOutline className="w-4 h-4 text-purple-600 mr-2" />
                        ~30 minutes
                      </p>
                      <p className="font-semibold text-gray-900 dark:text-white mt-3">
                        You receive: {formatCurrency(calculateNetAmount(parseFloat(payoutAmount)))}
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <p className="text-sm text-blue-900 dark:text-blue-300">
                  <strong>Note:</strong> {isInstantPayout() 
                    ? `Instant payouts require a debit card and have a 1.5% fee. Minimum ${formatCurrency(MIN_INSTANT_PAYOUT)}, maximum ${formatCurrency(MAX_INSTANT_PAYOUT)} per transaction.`
                    : `Standard payouts are free but take 2-3 business days. Minimum ${formatCurrency(MIN_STANDARD_PAYOUT)}.`}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowPayoutModal(false)}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handlePayoutClick}
                disabled={!payoutAmount || parseFloat(payoutAmount) <= 0 || payoutMethods.length === 0}
                className={`flex-1 px-4 py-3 rounded-lg transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${
                  isInstantPayout()
                    ? 'bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white'
                    : 'bg-green-600 hover:bg-green-700 text-white'
                }`}
              >
                {isInstantPayout() ? (
                  <>
                    <IoFlashOutline className="w-5 h-5" />
                    Instant Payout
                  </>
                ) : (
                  'Request Payout'
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {showConfirmationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-[60]">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-md w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2">
              <IoFlashOutline className="w-6 h-6 text-purple-600" />
              Confirm Instant Payout
            </h3>
            
            <div className="space-y-4 mb-6">
              <div className="flex justify-between text-base">
                <span className="text-gray-600 dark:text-gray-400">Amount</span>
                <span className="font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(parseFloat(payoutAmount))}
                </span>
              </div>
              
              <div className="flex justify-between text-base">
                <span className="text-gray-600 dark:text-gray-400">Fee (1.5%)</span>
                <span className="font-semibold text-red-600 dark:text-red-400">
                  -{formatCurrency(calculateInstantFee(parseFloat(payoutAmount)))}
                </span>
              </div>
              
              <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                <div className="flex justify-between text-lg">
                  <span className="font-semibold text-gray-900 dark:text-white">You receive</span>
                  <span className="font-bold text-green-600 dark:text-green-400">
                    {formatCurrency(calculateNetAmount(parseFloat(payoutAmount)))}
                  </span>
                </div>
              </div>

              <div className="bg-purple-50 dark:bg-purple-900/20 rounded-lg p-4 mt-4">
                <p className="text-sm text-purple-900 dark:text-purple-300">
                  <strong>Arrives in ~30 minutes to:</strong>
                </p>
                <p className="text-sm text-purple-700 dark:text-purple-400 mt-1">
                  {getSelectedMethod()?.brand} ****{getSelectedMethod()?.last4}
                </p>
              </div>
            </div>
            
            <div className="flex gap-3">
              <button
                onClick={() => setShowConfirmationModal(false)}
                disabled={requestingPayout}
                className="flex-1 px-4 py-3 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleRequestPayout}
                disabled={requestingPayout}
                className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white rounded-lg transition-all font-semibold disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {requestingPayout ? (
                  <>Processing...</>
                ) : (
                  <>
                    <IoFlashOutline className="w-5 h-5" />
                    Confirm Instant Payout
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      <Footer />
    </>
  )
}