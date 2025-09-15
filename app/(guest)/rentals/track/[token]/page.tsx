// app/(guest)/rentals/track/[token]/page.tsx
'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { motion, AnimatePresence } from 'framer-motion'
import confetti from 'canvas-confetti'
import { 
  IoArrowBackOutline,
  IoCarSportOutline,
  IoLocationOutline,
  IoCalendarOutline,
  IoTimeOutline,
  IoCheckmarkCircle,
  IoAlertCircle,
  IoCloseCircle,
  IoHourglassOutline,
  IoCopyOutline,
  IoCallOutline,
  IoMailOutline,
  IoPrintOutline,
  IoDownloadOutline,
  IoSparklesOutline,
  IoRocketOutline,
  IoPersonAddOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoGiftOutline,
  IoFlashOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoDocumentTextOutline,
  IoHelpCircleOutline,
  IoLockClosedOutline,
  IoLogInOutline,
  IoKeyOutline,
  IoReceiptOutline,
  IoWalletOutline
} from 'react-icons/io5'
import GuestToMemberModal from '../../components/GuestToMemberModal'
import BookingCelebration from '../../components/BookingCelebration'
import AccountBenefitsCard from '../../components/AccountBenefitsCard'
import StatusProgression from '../../components/StatusProgression'
import CancellationPolicyModal from '../../components/modals/CancellationPolicyModal'
import InsuranceRequirementsModal from '../../components/modals/InsuranceRequirementsModal'
import TrustSafetyModal from '../../components/modals/TrustSafetyModal'

interface BookingData {
  id: string
  bookingCode: string
  status: string
  verificationStatus: string
  paymentStatus: string
  
  // Trip fields
  tripStatus?: string
  tripStartedAt?: string | Date | null
  tripEndedAt?: string | Date | null
  startMileage?: number
  
  // Guest info
  guestName: string
  guestEmail: string
  guestPhone: string
  
  // Car details
  car: {
    make: string
    model: string
    year: number
    photos: Array<{ url: string }>
    host: {
      name: string
      email: string
      phone: string
    }
  }
  
  // Booking details
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  pickupLocation: string
  pickupType: string
  deliveryAddress?: string
  numberOfDays: number
  
  // Pricing
  totalAmount: number
  depositAmount: number
  serviceFee: number
  
  // Verification
  documentsSubmittedAt?: string
  verificationDeadline?: string
  reviewedAt?: string
  verificationNotes?: string
}

interface BookingResponse {
  booking: BookingData
  isFirstVisit: boolean
  tokenAge: number
  accountExists: boolean
  relatedBookingsCount: number
}

export default function EnhancedTrackingPage() {
  const params = useParams()
  const router = useRouter()
  const token = params.token as string
  
  const [bookingData, setBookingData] = useState<BookingResponse | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [copied, setCopied] = useState<string | null>(null)
  const [showFullDetails, setShowFullDetails] = useState(false)
  const [showCreateAccountModal, setShowCreateAccountModal] = useState(false)
  const [hasChosenPath, setHasChosenPath] = useState(false)
  const [supportRequestOpen, setSupportRequestOpen] = useState(false)
  const [supportForm, setSupportForm] = useState({
    issueType: '',
    description: ''
  })
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [showCancellationModal, setShowCancellationModal] = useState(false)
  const [showInsuranceModal, setShowInsuranceModal] = useState(false)
  const [showTrustSafetyModal, setShowTrustSafetyModal] = useState(false)

  useEffect(() => {
    checkAuthStatus()
    fetchBookingByToken()
    // Poll for updates every 15 seconds
    const interval = setInterval(fetchBookingByToken, 15000)
    return () => clearInterval(interval)
  }, [token])

  useEffect(() => {
    // Trigger confetti for fresh bookings (but not for confirmed bookings)
    if (bookingData?.isFirstVisit && !loading && bookingData.booking.status !== 'CONFIRMED') {
      setTimeout(() => {
        confetti({
          particleCount: 100,
          spread: 70,
          origin: { y: 0.6 }
        })
      }, 500)
    }
  }, [bookingData, loading])

  const checkAuthStatus = () => {
    // Check for auth cookie/token to determine if user is logged in
    const accessToken = document.cookie
      .split('; ')
      .find(row => row.startsWith('accessToken='))
    
    setIsAuthenticated(!!accessToken)
  }

  const fetchBookingByToken = async () => {
    try {
      const response = await fetch(`/api/rentals/book?token=${token}`)
      
      if (!response.ok) {
        if (response.status === 401) {
          setError('Invalid or expired access link. Please check your email for the correct link.')
        } else {
          setError('Unable to load booking details. Please try again.')
        }
        return
      }

      const data = await response.json()
      setBookingData(data)
      
      // Handle routing based on booking status and authentication
      handleBookingRouting(data)
      
    } catch (err) {
      console.error('Error fetching booking:', err)
      setError('Something went wrong. Please try again later.')
    } finally {
      setLoading(false)
    }
  }

  const handleBookingRouting = (data: BookingResponse) => {
    const { booking, accountExists } = data
    
    // For confirmed bookings that haven't started yet
    if (booking.status === 'CONFIRMED' && !booking.tripStartedAt) {
      // If authenticated and account exists, redirect to dashboard
      if (isAuthenticated && accountExists) {
        router.push(`/rentals/dashboard/bookings/${booking.id}`)
        return
      }
      
      // Otherwise, show account creation/login requirement
      setShowFullDetails(true)
      setHasChosenPath(true)
      return
    }
    
    // For active or completed trips, show read-only status
    if (booking.tripStatus === 'ACTIVE' || booking.tripEndedAt) {
      setShowFullDetails(true)
      setHasChosenPath(true)
      return
    }
    
    // For pending bookings, follow original flow
    if (!data.isFirstVisit) {
      setShowFullDetails(true)
      setHasChosenPath(true)
    }
  }

  const calculateTimeRemaining = () => {
    if (!booking) return null
    
    // Parse the date and time properly
    const endDate = new Date(booking.endDate)
    const [endHours, endMinutes] = booking.endTime.split(':').map(Number)
    endDate.setHours(endHours, endMinutes, 0, 0)
    
    const now = new Date()
    const diff = endDate.getTime() - now.getTime()
    
    if (diff <= 0) return 'Overdue'
    
    const days = Math.floor(diff / (1000 * 60 * 60 * 24))
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))
    
    if (days > 0) {
      return `${days} day${days > 1 ? 's' : ''}, ${hours} hour${hours !== 1 ? 's' : ''}`
    }
    if (hours > 0) {
      return `${hours} hour${hours !== 1 ? 's' : ''}, ${minutes} minute${minutes !== 1 ? 's' : ''}`
    }
    return `${minutes} minute${minutes !== 1 ? 's' : ''}`
  }

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text)
    setCopied(field)
    setTimeout(() => setCopied(null), 2000)
  }

  const handleCreateAccount = () => {
    setShowCreateAccountModal(true)
  }

  const handleContinueAsGuest = () => {
    setHasChosenPath(true)
    setShowFullDetails(true)
  }

  const handleAccountCreated = () => {
    // Refresh auth status and page after account creation
    checkAuthStatus()
    router.refresh()
    setShowCreateAccountModal(false)
    
    // If booking is confirmed, redirect to dashboard
    if (booking?.status === 'CONFIRMED') {
      router.push(`/rentals/dashboard/bookings/${booking.id}`)
    }
  }

  const handleSupportSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    // In production, this would send to your API
    alert('Support request submitted. We\'ll respond within 1 hour via email.')
    setSupportForm({ issueType: '', description: '' })
    setSupportRequestOpen(false)
  }

  const handleLoginRedirect = () => {
    // Store return URL for after login
    sessionStorage.setItem('returnUrl', `/rentals/track/${token}`)
    router.push(`/auth/login?return=/rentals/track/${token}`)
  }

  const handleSignupRedirect = () => {
    // Store return URL for after signup
    sessionStorage.setItem('returnUrl', `/rentals/track/${token}`)
    router.push(`/auth/signup?return=/rentals/track/${token}&email=${encodeURIComponent(booking?.guestEmail || '')}`)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your booking...</p>
        </div>
      </div>
    )
  }

  if (error || !bookingData) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="max-w-md w-full bg-white rounded-lg shadow-lg p-8 text-center">
          <IoAlertCircle className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Unable to Access Booking</h2>
          <p className="text-gray-600 mb-6">{error || 'Booking not found'}</p>
          <Link
            href="/rentals"
            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
          >
            <IoArrowBackOutline className="w-5 h-5 mr-2" />
            Back to Rentals
          </Link>
        </div>
      </div>
    )
  }

  const { booking } = bookingData
  const isP2P = booking.car.host ? true : false
  const isFirstVisit = bookingData.isFirstVisit && !hasChosenPath
  const isTripActive = booking.tripStatus === 'ACTIVE' || !!booking.tripStartedAt
  const needsAccount = booking.status === 'CONFIRMED' && !booking.tripStartedAt && !bookingData.accountExists
  const needsLogin = booking.status === 'CONFIRMED' && !booking.tripStartedAt && bookingData.accountExists && !isAuthenticated
  
  // NEW: Check for post-trip pending charges
  const hasPendingCharges = booking.tripEndedAt && booking.status === 'PENDING'

  return (
    <>
      <div className={`min-h-screen ${isFirstVisit ? 'bg-gradient-to-br from-blue-50 to-indigo-50' : 'bg-gray-50'} py-8`}>
        <div className="max-w-4xl mx-auto px-4">
          
          {/* Special UI for Confirmed Bookings Requiring Account/Login */}
          {(needsAccount || needsLogin) && (
            <div className="mb-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-xl shadow-lg overflow-hidden"
              >
                {/* Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 p-6">
                  <div className="flex items-center text-white">
                    <IoCheckmarkCircle className="w-8 h-8 mr-3" />
                    <div>
                      <h2 className="text-2xl font-bold">Booking Confirmed!</h2>
                      <p className="text-green-100 mt-1">
                        Your {booking.car.year} {booking.car.make} {booking.car.model} is ready
                      </p>
                    </div>
                  </div>
                </div>

                {/* Account Requirement Notice */}
                <div className="p-8">
                  <div className="bg-amber-50 border border-amber-200 rounded-lg p-6 mb-6">
                    <div className="flex items-start">
                      <IoLockClosedOutline className="w-6 h-6 text-amber-600 mr-3 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-amber-900 mb-2">
                          {needsAccount ? 'Account Required to Start Trip' : 'Login Required to Start Trip'}
                        </h3>
                        <p className="text-sm text-amber-700 mb-4">
                          For security and insurance purposes, you must {needsAccount ? 'create an account' : 'log in'} to:
                        </p>
                        <ul className="text-sm text-amber-700 space-y-1 ml-4">
                          <li>• Complete pre-trip inspection with photos</li>
                          <li>• Digitally sign the rental agreement</li>
                          <li>• Record starting mileage and fuel level</li>
                          <li>• Access emergency support during your trip</li>
                        </ul>
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons - FIXED TO SHOW BOTH OPTIONS */}
                  {needsAccount ? (
                    <div className="space-y-4">
                      <button
                        onClick={handleCreateAccount}
                        className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center"
                      >
                        <IoKeyOutline className="w-6 h-6 mr-2" />
                        Create Account & Start Trip
                      </button>
                      
                      {/* Alternative: Link to signup page */}
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Or</p>
                        <button
                          onClick={handleSignupRedirect}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Sign up with email & password
                        </button>
                      </div>
                      
                      <p className="text-center text-sm text-gray-600">
                        Takes less than 60 seconds • No credit card required
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <button
                        onClick={handleLoginRedirect}
                        className="w-full px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold text-lg flex items-center justify-center"
                      >
                        <IoLogInOutline className="w-6 h-6 mr-2" />
                        Log In to Start Trip
                      </button>
                      
                      {/* Don't have an account option */}
                      <div className="text-center">
                        <p className="text-sm text-gray-600 mb-2">Don't have an account?</p>
                        <button
                          onClick={handleCreateAccount}
                          className="text-blue-600 hover:text-blue-700 font-medium"
                        >
                          Create Account
                        </button>
                      </div>
                      
                      <div className="text-center border-t pt-4">
                        <p className="text-sm text-gray-600 mb-2">Forgot your password?</p>
                        <Link href="/auth/reset-password" className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                          Reset Password
                        </Link>
                      </div>
                    </div>
                  )}
                </div>
              </motion.div>
            </div>
          )}

          {/* Celebration Section for First Visit (Only for Pending Bookings) */}
          {isFirstVisit && booking.status === 'PENDING' && (
            <BookingCelebration 
              bookingCode={booking.bookingCode}
              carName={`${booking.car.year} ${booking.car.make} ${booking.car.model}`}
              startDate={booking.startDate}
              pickupLocation={booking.pickupLocation}
            />
          )}

          {/* Account Creation Prompt for First Visit Pending Bookings */}
          {isFirstVisit && booking.status === 'PENDING' && (
            <div className="mb-8">
              <div className="grid md:grid-cols-2 gap-6">
                {/* Create Account Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border-2 border-blue-500"
                >
                  <div className="bg-gradient-to-r from-blue-500 to-indigo-600 p-4">
                    <div className="flex items-center text-white">
                      <IoRocketOutline className="w-6 h-6 mr-2" />
                      <h3 className="font-bold text-lg">Create Free Account</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <AccountBenefitsCard 
                      relatedBookingsCount={bookingData.relatedBookingsCount}
                      isCompact={true}
                    />
                    <button
                      onClick={handleCreateAccount}
                      className="w-full mt-4 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold flex items-center justify-center"
                    >
                      <IoPersonAddOutline className="w-5 h-5 mr-2" />
                      Create Account & Import Bookings
                    </button>
                  </div>
                </motion.div>

                {/* Continue as Guest Card */}
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-white rounded-xl shadow-lg overflow-hidden border border-gray-200"
                >
                  <div className="bg-gray-100 p-4">
                    <div className="flex items-center text-gray-700">
                      <IoMailOutline className="w-6 h-6 mr-2" />
                      <h3 className="font-bold text-lg">Continue as Guest</h3>
                    </div>
                  </div>
                  <div className="p-6">
                    <ul className="space-y-3 mb-6">
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-700">View booking status</span>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-700">Email updates</span>
                      </li>
                      <li className="flex items-start">
                        <IoCheckmarkCircle className="w-5 h-5 text-green-500 mr-2 mt-0.5" />
                        <span className="text-gray-700">Access support</span>
                      </li>
                      <li className="flex items-start">
                        <IoWarningOutline className="w-5 h-5 text-amber-500 mr-2 mt-0.5" />
                        <span className="text-gray-700">Account required to start trip</span>
                      </li>
                    </ul>
                    <button
                      onClick={handleContinueAsGuest}
                      className="w-full px-4 py-3 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors font-semibold"
                    >
                      Continue as Guest
                    </button>
                  </div>
                </motion.div>
              </div>

              {/* View Booking Details Toggle */}
              {!showFullDetails && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.5 }}
                  className="mt-6 text-center"
                >
                  <button
                    onClick={() => setShowFullDetails(!showFullDetails)}
                    className="inline-flex items-center text-blue-600 hover:text-blue-700 font-medium"
                  >
                    <span>View Booking Details</span>
                    <IoChevronDownOutline className="w-5 h-5 ml-1" />
                  </button>
                </motion.div>
              )}
            </div>
          )}

          {/* Main Booking Details Section - Rest of the component remains the same */}
          <AnimatePresence>
            {(showFullDetails || isTripActive || (!isFirstVisit && !needsAccount && !needsLogin)) && (
              <motion.div
                initial={isFirstVisit ? { opacity: 0, height: 0 } : false}
                animate={{ opacity: 1, height: 'auto' }}
                exit={{ opacity: 0, height: 0 }}
                transition={{ duration: 0.3 }}
              >
                {/* Header */}
                <div className="bg-white rounded-lg shadow mb-6 p-6">
                  <div className="flex justify-between items-start mb-4">
                    <div>
                      <h1 className="text-2xl font-bold text-gray-900">
                        {booking.car.year} {booking.car.make} {booking.car.model}
                      </h1>
                      <p className="text-gray-600 mt-1">
                        Booking #{booking.bookingCode}
                      </p>
                    </div>
                    <div className="text-right">
                      <Link
                        href="/rentals/search"
                        className="text-sm text-blue-600 hover:text-blue-700"
                      >
                        Browse More Cars →
                      </Link>
                    </div>
                  </div>

                  {/* Quick Actions */}
                  <div className="flex gap-3">
                    <button
                      onClick={() => window.print()}
                      className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50"
                    >
                      <IoPrintOutline className="w-5 h-5 mr-2" />
                      Print
                    </button>
                    <button className="flex items-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50">
                      <IoDownloadOutline className="w-5 h-5 mr-2" />
                      Download PDF
                    </button>
                  </div>
                </div>

                {/* Status Progression Component */}
                <StatusProgression
                  status={booking.status}
                  tripStatus={booking.tripStatus}
                  tripStartedAt={booking.tripStartedAt}
                  tripEndedAt={booking.tripEndedAt}
                  verificationStatus={booking.verificationStatus}
                  paymentStatus={booking.paymentStatus}
                  documentsSubmittedAt={booking.documentsSubmittedAt}
                  reviewedAt={booking.reviewedAt}
                />

                {/* Rest of the component content remains the same... */}
                {/* [All the other sections like Pending Charges Notice, Emergency Contact, Trip Status Card, etc. remain unchanged] */}
                
                {/* Main Content Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
                  {/* Left Column - Booking Details */}
                  <div className="lg:col-span-2 space-y-6">
                    {/* Vehicle Details */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <IoCarSportOutline className="w-5 h-5 mr-2" />
                        Vehicle Details
                      </h2>
                      <div className="flex gap-4">
                        {booking.car.photos[0] && (
                          <img
                            src={booking.car.photos[0].url}
                            alt={`${booking.car.make} ${booking.car.model}`}
                            className="w-32 h-24 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <h3 className="font-semibold text-gray-900">
                            {booking.car.year} {booking.car.make} {booking.car.model}
                          </h3>
                          {booking.status === 'CONFIRMED' && booking.car.host && (
                            <div className="mt-2 space-y-1">
                              <p className="text-sm text-gray-600">
                                Host: <span className="font-medium">{booking.car.host.name}</span>
                              </p>
                              {/* Only show contact email */}
                              {(new Date(booking.startDate).getTime() - Date.now() < 86400000 || isTripActive) && (
                                <p className="text-sm text-gray-600 flex items-center">
                                  <IoMailOutline className="w-4 h-4 mr-1" />
                                  info@itwhip.com
                                </p>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Trip Details */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Trip Details</h2>
                      <div className="space-y-3">
                        <div className="flex items-center text-gray-600">
                          <IoCalendarOutline className="w-5 h-5 mr-3 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">Pick-up</p>
                            <p className="font-medium text-gray-900">
                              {new Date(booking.startDate).toLocaleDateString()} at {booking.startTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <IoCalendarOutline className="w-5 h-5 mr-3 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">Return</p>
                            <p className="font-medium text-gray-900">
                              {new Date(booking.endDate).toLocaleDateString()} at {booking.endTime}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center text-gray-600">
                          <IoLocationOutline className="w-5 h-5 mr-3 text-gray-400" />
                          <div className="flex-1">
                            <p className="text-sm text-gray-500">Location</p>
                            <p className="font-medium text-gray-900">{booking.pickupLocation}</p>
                            {booking.deliveryAddress && (
                              <p className="text-sm text-gray-600 mt-1">
                                Delivery to: {booking.deliveryAddress}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Important Documents */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <IoDocumentTextOutline className="w-5 h-5 mr-2" />
                        Important Documents
                      </h2>
                      <div className="space-y-2">
                        <button
                          onClick={() => setShowCancellationModal(true)}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 w-full text-left"
                        >
                          <span className="text-sm font-medium text-gray-900">Cancellation Policy</span>
                          <IoDownloadOutline className="w-5 h-5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => setShowInsuranceModal(true)}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 w-full text-left"
                        >
                          <span className="text-sm font-medium text-gray-900">Insurance Requirements</span>
                          <IoDownloadOutline className="w-5 h-5 text-gray-500" />
                        </button>
                        <button
                          onClick={() => setShowTrustSafetyModal(true)}
                          className="flex items-center justify-between p-3 bg-gray-50 rounded-lg hover:bg-gray-100 w-full text-left"
                        >
                          <span className="text-sm font-medium text-gray-900">Trust & Safety</span>
                          <IoDownloadOutline className="w-5 h-5 text-gray-500" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* Right Column - Summary & Actions */}
                  <div className="space-y-6">
                    {/* Price Summary */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h2 className="text-lg font-semibold text-gray-900 mb-4">Price Summary</h2>
                      <div className="space-y-2">
                        <div className="flex justify-between">
                          <span className="text-gray-600">Total Amount</span>
                          <span className="font-semibold text-gray-900">
                            ${booking.totalAmount.toFixed(2)}
                          </span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Deposit</span>
                          <span className="text-gray-900">${booking.depositAmount.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-gray-600">Service Fee</span>
                          <span className="text-gray-900">${booking.serviceFee.toFixed(2)}</span>
                        </div>
                        <div className="pt-2 mt-2 border-t">
                          <div className="flex justify-between">
                            <span className="font-medium text-gray-900">Payment Status</span>
                            <span className={`font-medium ${
                              hasPendingCharges ? 'text-amber-600' :
                              booking.paymentStatus === 'PAID' || booking.paymentStatus === 'paid' ? 'text-green-600' : 
                              booking.paymentStatus === 'FAILED' || booking.paymentStatus === 'failed' ? 'text-red-600' : 'text-yellow-600'
                            }`}>
                              {hasPendingCharges ? 'Calculating Charges' :
                               (booking.paymentStatus === 'PAID' || booking.paymentStatus === 'paid') ? 'Paid' :
                               (booking.paymentStatus === 'FAILED' || booking.paymentStatus === 'failed') ? 'Failed' : 'Pending'}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Support Request Form */}
                    <div className="bg-white rounded-lg shadow p-6">
                      <h3 className="font-semibold text-gray-900 mb-3 flex items-center">
                        <IoHelpCircleOutline className="w-5 h-5 mr-2" />
                        Need Help?
                      </h3>
                      
                      {!supportRequestOpen ? (
                        <>
                          <p className="text-sm text-gray-600 mb-4">
                            Our support team is here to help with any issues or questions.
                          </p>
                          <button
                            onClick={() => setSupportRequestOpen(true)}
                            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                          >
                            Submit Support Request
                          </button>
                          <div className="mt-4 text-center">
                            <p className="text-xs text-gray-500">Support responds faster via form</p>
                            <p className="text-xs text-gray-500 mt-1">Average response: under 1 hour</p>
                            <div className="mt-3 pt-3 border-t">
                              <a href="mailto:info@itwhip.com" className="text-sm font-semibold text-blue-600">
                                info@itwhip.com
                              </a>
                            </div>
                          </div>
                        </>
                      ) : (
                        <form onSubmit={handleSupportSubmit} className="space-y-3">
                          <select 
                            className="w-full border border-gray-300 rounded-lg p-2"
                            value={supportForm.issueType}
                            onChange={(e) => setSupportForm({...supportForm, issueType: e.target.value})}
                            required
                          >
                            <option value="">Select Issue Type</option>
                            <option value="cant-find">Can't find vehicle</option>
                            <option value="vehicle-issue">Vehicle problem</option>
                            <option value="billing">Billing question</option>
                            <option value="accident">Accident/Emergency</option>
                            <option value="other">Other</option>
                          </select>
                          <textarea 
                            className="w-full border border-gray-300 rounded-lg p-2" 
                            placeholder="Describe your issue..."
                            rows={3}
                            value={supportForm.description}
                            onChange={(e) => setSupportForm({...supportForm, description: e.target.value})}
                            required
                          />
                          <p className="text-xs text-green-600">
                            ✓ Forms are prioritized for fastest response
                          </p>
                          <div className="flex space-x-2">
                            <button
                              type="submit"
                              className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                              Submit
                            </button>
                            <button
                              type="button"
                              onClick={() => setSupportRequestOpen(false)}
                              className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </div>
                        </form>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>

      {/* Document Modals */}
      <CancellationPolicyModal 
        isOpen={showCancellationModal}
        onClose={() => setShowCancellationModal(false)}
      />
      <InsuranceRequirementsModal 
        isOpen={showInsuranceModal}
        onClose={() => setShowInsuranceModal(false)}
      />
      <TrustSafetyModal 
        isOpen={showTrustSafetyModal}
        onClose={() => setShowTrustSafetyModal(false)}
      />

      {/* Guest to Member Modal */}
      <GuestToMemberModal
        isOpen={showCreateAccountModal}
        onClose={() => setShowCreateAccountModal(false)}
        bookingData={booking}
        relatedBookingsCount={bookingData.relatedBookingsCount}
        onSuccess={handleAccountCreated}
      />
    </>
  )
}