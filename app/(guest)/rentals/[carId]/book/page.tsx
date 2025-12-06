// app/(guest)/rentals/[carId]/book/page.tsx
'use client'

import { useState, useEffect, use, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { 
  IoArrowBackOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkOutline,
  IoCheckmarkCircle,
  IoDocumentTextOutline,
  IoCameraOutline,
  IoCardOutline,
  IoPersonOutline,
  IoInformationCircleOutline,
  IoLockClosedOutline,
  IoEyeOutline,
  IoWarningOutline,
  IoCloseCircle,
  IoSparklesOutline,
  IoBanOutline,
  IoCloseCircleOutline
} from 'react-icons/io5'
import { format } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// Import modal components
import RentalAgreementModal from '@/app/(guest)/rentals/components/modals/RentalAgreementModal'
import InsuranceRequirementsModal from '@/app/(guest)/rentals/components/modals/InsuranceRequirementsModal'
import TrustSafetyModal from '@/app/(guest)/rentals/components/modals/TrustSafetyModal'

// ============================================
// TYPES
// ============================================

interface RentalCarWithDetails {
  id: string
  make: string
  model: string
  year: number
  carType: string
  seats: number
  dailyRate: number
  rating?: number
  totalTrips?: number
  address?: string
  isActive: boolean // ✅ ADDED: Vehicle availability status
  photos?: Array<{
    url: string
    alt?: string
  }>
  host?: {
    name: string
    profilePhoto?: string
    responseTime?: number
  }
}

interface SavedBookingDetails {
  carId: string
  carClass: string
  startDate: string
  endDate: string
  startTime: string
  endTime: string
  deliveryType: string
  deliveryAddress: string
  insuranceType: string
  addOns: {
    refuelService: boolean
    additionalDriver: boolean
    extraMiles: boolean
    vipConcierge: boolean
  }
  pricing: {
    days: number
    dailyRate: number
    basePrice: number
    insurancePrice: number
    deliveryFee: number
    serviceFee: number
    taxes: number
    total: number
    deposit: number
    breakdown: {
      refuelService: number
      additionalDriver: number
      extraMiles: number
      vipConcierge: number
    }
  }
}

interface ReviewerProfile {
  id: string
  email: string
  name: string
  phone?: string
  driversLicenseUrl?: string
  selfieUrl?: string
  documentsVerified: boolean
  documentVerifiedAt?: string
  isVerified: boolean
  fullyVerified: boolean
  canInstantBook: boolean
  
  // Insurance data
  insuranceProvider?: string
  insurancePolicyNumber?: string
  insuranceVerified?: boolean
  insuranceCardUrl?: string
  insuranceExpires?: string
}

interface ModerationStatus {
  accountStatus: string
  hasActiveIssues: boolean
  activeWarningCount: number
  suspension?: {
    level: string
    reason: string
    isPermanent: boolean
  }
  restrictions: {
    canBookLuxury: boolean
    canBookPremium: boolean
    requiresManualApproval: boolean
    canInstantBook: boolean
  }
}

// ============================================
// MAIN COMPONENT
// ============================================

export default function BookingPage({ params }: { params: Promise<{ carId: string }> }) {
  const router = useRouter()
  const { carId } = use(params)
  
  // ✅ FIXED: Use direct state instead of useCustomSession hook
  const [session, setSession] = useState<{ user: { id: string; email: string; name: string; role: string } } | null>(null)
  const [sessionStatus, setSessionStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  
  // Core states
  const [car, setCar] = useState<RentalCarWithDetails | null>(null)
  const [savedBookingDetails, setSavedBookingDetails] = useState<SavedBookingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  
  // User profile states
  const [userProfile, setUserProfile] = useState<ReviewerProfile | null>(null)
  const [moderationStatus, setModerationStatus] = useState<ModerationStatus | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  
  // Modal states
  const [showRentalAgreement, setShowRentalAgreement] = useState(false)
  const [showInsuranceModal, setShowInsuranceModal] = useState(false)
  const [showTrustSafetyModal, setShowTrustSafetyModal] = useState(false)
  
  // Track page load time for fraud detection
  useEffect(() => {
    (window as any).pageLoadTime = Date.now()
  }, [])
  
  // Refs for scroll to incomplete sections
  const documentsRef = useRef<HTMLDivElement>(null)
  const paymentRef = useRef<HTMLDivElement>(null)
  
  // File input refs
  const licenseInputRef = useRef<HTMLInputElement>(null)
  const insuranceInputRef = useRef<HTMLInputElement>(null)
  const selfieInputRef = useRef<HTMLInputElement>(null)
  
  // Document upload states
  const [licenseUploaded, setLicenseUploaded] = useState(false)
  const [insuranceUploaded, setInsuranceUploaded] = useState(false)
  const [selfieUploaded, setSelfieUploaded] = useState(false)
  
  // Store actual upload URLs
  const [licensePhotoUrl, setLicensePhotoUrl] = useState('')
  const [insurancePhotoUrl, setInsurancePhotoUrl] = useState('')
  const [selfiePhotoUrl, setSelfiePhotoUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)
  
  // Payment form states
  const [guestName, setGuestName] = useState('')
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVC, setCardCVC] = useState('')
  const [cardZip, setCardZip] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)
  
  // Primary driver information states
  const [driverFirstName, setDriverFirstName] = useState('')
  const [driverLastName, setDriverLastName] = useState('')
  const [driverAge, setDriverAge] = useState<Date | null>(null)
  const [driverLicense, setDriverLicense] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [driverEmail, setDriverEmail] = useState('')
  
  // ============================================
  // ✅ FIXED: CHECK AUTHENTICATION DIRECTLY
  // ============================================
  
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/auth/verify', {
          method: 'GET',
          credentials: 'include',
        })

        if (response.ok) {
          const userData = await response.json()
          setSession({ user: userData.user })
          setSessionStatus('authenticated')
        } else {
          setSession(null)
          setSessionStatus('unauthenticated')
        }
      } catch (error) {
        console.error('Auth check failed:', error)
        setSession(null)
        setSessionStatus('unauthenticated')
      }
    }

    checkAuth()
  }, [])
  
  // ============================================
  // FETCH USER PROFILE AND MODERATION STATUS
  // ============================================
  
  useEffect(() => {
    const fetchUserData = async () => {
      console.log('🔍 fetchUserData called')
      console.log('📧 Session:', session)
      console.log('⏳ Session status:', sessionStatus)
      
      // Wait for session to load
      if (sessionStatus === 'loading') {
        console.log('⏳ Session still loading...')
        return
      }
      
      // Only fetch if user is logged in
      if (session?.user?.email) {
        console.log('✅ User is logged in:', session.user.email)
        
        try {
          setProfileLoading(true)
          
          console.log('📡 Fetching profile and moderation data...')
          
          // Fetch profile and moderation data in parallel
          const [profileRes, moderationRes] = await Promise.all([
            fetch('/api/guest/profile', { credentials: 'include' }),
            fetch('/api/guest/moderation', { credentials: 'include' })
          ])
          
          console.log('📥 Profile response status:', profileRes.status)
          console.log('📥 Moderation response status:', moderationRes.status)
          
          if (profileRes.ok) {
            const response = await profileRes.json()
            console.log('📦 Profile API response:', response)
            
            const profileData = response.profile
            console.log('👤 Profile data extracted:', profileData)
            
            setUserProfile(profileData)
            
            // Auto-fill form fields from profile
            if (profileData.name) {
              const nameParts = profileData.name.split(' ')
              setDriverFirstName(nameParts[0] || '')
              setDriverLastName(nameParts.slice(1).join(' ') || '')
              setGuestName(profileData.name)
              console.log('✅ Name auto-filled:', profileData.name)
            }
            if (profileData.email) {
              setDriverEmail(profileData.email)
              setGuestEmail(profileData.email)
              console.log('✅ Email auto-filled:', profileData.email)
            }
            if (profileData.phone) {
              setDriverPhone(profileData.phone)
              setGuestPhone(profileData.phone)
              console.log('✅ Phone auto-filled:', profileData.phone)
            }
            
            // Auto-fill document URLs if verified
            if (profileData.documentsVerified) {
              console.log('✅ Documents are verified!')
              if (profileData.driversLicenseUrl) {
                setLicensePhotoUrl(profileData.driversLicenseUrl)
                setLicenseUploaded(true)
                console.log('✅ License URL set:', profileData.driversLicenseUrl)
              }
              if (profileData.selfieUrl) {
                setSelfiePhotoUrl(profileData.selfieUrl)
                setSelfieUploaded(true)
                console.log('✅ Selfie URL set:', profileData.selfieUrl)
              }
              if (profileData.insuranceCardUrl) {
                setInsurancePhotoUrl(profileData.insuranceCardUrl)
                setInsuranceUploaded(true)
                console.log('✅ Insurance card URL set:', profileData.insuranceCardUrl)
              }
            } else {
              console.log('⚠️ Documents NOT verified')
            }
          } else {
            const errorText = await profileRes.text()
            console.error('❌ Profile API failed:', profileRes.status, errorText)
          }
          
          if (moderationRes.ok) {
            const moderationData = await moderationRes.json()
            console.log('🛡️ Moderation data:', moderationData)
            setModerationStatus(moderationData)
          } else {
            const errorText = await moderationRes.text()
            console.error('❌ Moderation API failed:', moderationRes.status, errorText)
          }
        } catch (error) {
          console.error('💥 Error fetching user data:', error)
        } finally {
          setProfileLoading(false)
          console.log('✅ Profile loading complete')
        }
      } else {
        console.log('ℹ️ No session found, user not logged in')
        setProfileLoading(false)
      }
    }
    
    fetchUserData()
  }, [session, sessionStatus])
  
  // ============================================
  // DEBUG: Show loaded data after profile loads
  // ============================================
  
  useEffect(() => {
    if (!profileLoading) {
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('📊 FINAL STATE AFTER LOADING:')
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
      console.log('👤 User Profile:', userProfile)
      console.log('🛡️ Moderation Status:', moderationStatus)
      console.log('📝 Form Data:', {
        driverFirstName,
        driverLastName,
        driverEmail,
        driverPhone,
        guestName,
        guestEmail,
        guestPhone
      })
      console.log('📄 Documents:', {
        licenseUploaded,
        insuranceUploaded,
        selfieUploaded,
        licensePhotoUrl: licensePhotoUrl ? 'SET' : 'NOT SET',
        insurancePhotoUrl: insurancePhotoUrl ? 'SET' : 'NOT SET',
        selfiePhotoUrl: selfiePhotoUrl ? 'SET' : 'NOT SET'
      })
      console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    }
  }, [profileLoading, userProfile, moderationStatus, driverFirstName, driverLastName, driverEmail, driverPhone, licenseUploaded, insuranceUploaded, selfieUploaded, licensePhotoUrl, insurancePhotoUrl, selfiePhotoUrl, guestName, guestEmail, guestPhone])
  
  // ============================================
  // BOOKING ELIGIBILITY CHECK
  // ============================================
  
  const checkBookingEligibility = (): { allowed: boolean; reason?: string } => {
    // ✅ NEW: Check if vehicle is available
    if (car && !car.isActive) {
      return {
        allowed: false,
        reason: 'This vehicle is currently unavailable for booking. It may be undergoing maintenance, involved in an insurance claim, or temporarily deactivated by the owner.'
      }
    }
    
    if (!moderationStatus) return { allowed: true }
    
    // Check if banned
    if (moderationStatus.accountStatus === 'BANNED') {
      return {
        allowed: false,
        reason: 'Your account has been permanently banned. Please contact support for more information.'
      }
    }
    
    // Check if suspended
    if (moderationStatus.accountStatus === 'SUSPENDED') {
      return {
        allowed: false,
        reason: moderationStatus.suspension?.isPermanent
          ? 'Your account is suspended. Please contact support.'
          : `Your account is temporarily suspended. Reason: ${moderationStatus.suspension?.reason || 'Policy violation'}`
      }
    }
    
    // ✅ FIXED: Add null check for restrictions
    if (!moderationStatus.restrictions) return { allowed: true }
    
    // Check luxury restrictions
    if (car?.carType === 'LUXURY' && !moderationStatus.restrictions.canBookLuxury) {
      return {
        allowed: false,
        reason: 'You currently cannot book luxury vehicles. This restriction may be due to active warnings or account issues.'
      }
    }
    
    // Check premium restrictions
    if (car?.carType === 'PREMIUM' && !moderationStatus.restrictions.canBookPremium) {
      return {
        allowed: false,
        reason: 'You currently cannot book premium vehicles. This restriction may be due to active warnings or account issues.'
      }
    }
    
    // Warning about manual approval
    if (moderationStatus.restrictions.requiresManualApproval) {
      return {
        allowed: true,
        reason: 'Your booking will require manual approval due to account warnings. Processing may take 24-48 hours.'
      }
    }
    
    // Warning threshold check
    if (moderationStatus.activeWarningCount >= 3) {
      return {
        allowed: true,
        reason: `You have ${moderationStatus.activeWarningCount} active warnings. Your booking will require manual approval.`
      }
    }
    
    return { allowed: true }
  }
  
  // ============================================
  // CALCULATE ADJUSTED DEPOSIT (Insurance Discount)
  // ============================================
  
  const getAdjustedDeposit = () => {
    if (!savedBookingDetails) return 0
    
    const baseDeposit = savedBookingDetails.pricing.deposit
    
    // Apply 50% discount if insurance is verified
    if (userProfile?.insuranceVerified) {
      return baseDeposit * 0.5
    }
    
    return baseDeposit
  }
  
  // ============================================
  // VALIDATION CHECKS
  // ============================================
  
  // Check if all documents are uploaded (skip if already verified)
  const allDocumentsUploaded = userProfile?.documentsVerified 
    ? true 
    : (licenseUploaded && insuranceUploaded && selfieUploaded)
  
  // Check if payment form is complete
  const cardValid = cardNumber.length >= 15 && cardExpiry.length === 5 && cardCVC.length >= 3 && cardZip.length === 5
  const driverInfoComplete = driverFirstName && driverLastName && driverAge && driverLicense && driverPhone && driverEmail
  const paymentComplete = guestName && driverInfoComplete && cardValid && agreedToTerms
  
  // Check if can checkout
  const canCheckout = allDocumentsUploaded && paymentComplete
  
  // ============================================
  // LOAD BOOKING DETAILS FROM SESSION STORAGE
  // ============================================
  
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const saved = sessionStorage.getItem('rentalBookingDetails')
      if (saved) {
        try {
          const details = JSON.parse(saved) as SavedBookingDetails
          setSavedBookingDetails(details)
        } catch (e) {
          console.error('Error parsing saved booking details:', e)
          router.push(`/rentals/${carId}`)
        }
      } else {
        alert('Please select your booking options first')
        router.push(`/rentals/${carId}`)
      }
    }
  }, [carId, router])
  
  // ============================================
  // FETCH CAR DETAILS
  // ============================================
  
  useEffect(() => {
    const fetchCarDetails = async () => {
      try {
        const response = await fetch(`/api/rentals/cars/${carId}`)
        if (!response.ok) throw new Error('Car not found')
        const data = await response.json()
        setCar(data)
        
        // ✅ NEW: Log vehicle availability status
        console.log('🚗 Vehicle loaded:', {
          id: data.id,
          name: `${data.year} ${data.make} ${data.model}`,
          isActive: data.isActive
        })
      } catch (error) {
        console.error('Error fetching car:', error)
        router.push('/rentals')
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchCarDetails()
  }, [carId, router])
  
  // ============================================
  // FILE UPLOAD HANDLER
  // ============================================
  
  const handleFileUpload = async (file: File, type: 'license' | 'insurance' | 'selfie') => {
    if (!file) return
    
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB')
      return
    }
    
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file')
      return
    }
    
    setIsUploading(true)
    
    try {
      const formData = new FormData()
      formData.append('file', file)
      formData.append('type', type)
      
      const response = await fetch('/api/rentals/upload', {
        method: 'POST',
        body: formData
      })
      
      const data = await response.json()
      
      if (response.ok && data.url) {
        if (type === 'license') {
          setLicensePhotoUrl(data.url)
          setLicenseUploaded(true)
        } else if (type === 'insurance') {
          setInsurancePhotoUrl(data.url)
          setInsuranceUploaded(true)
        } else if (type === 'selfie') {
          setSelfiePhotoUrl(data.url)
          setSelfieUploaded(true)
        }
        
        console.log(`${type} uploaded successfully:`, data.url)
      } else {
        alert(`Failed to upload ${type}: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      alert(`Error uploading ${type}. Please try again.`)
    } finally {
      setIsUploading(false)
    }
  }
  
  // ============================================
  // FORMAT HELPERS
  // ============================================
  
  const formatCardNumber = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    const matches = v.match(/\d{4,16}/g)
    const match = (matches && matches[0]) || ''
    const parts = []
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4))
    }
    if (parts.length) {
      return parts.join(' ')
    } else {
      return value
    }
  }
  
  const formatExpiry = (value: string) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '')
    if (v.length >= 2) {
      return v.slice(0, 2) + (v.length > 2 ? '/' + v.slice(2, 4) : '')
    }
    return v
  }
  
  // ============================================
  // CHECKOUT HANDLER
  // ============================================
  
  const handleCheckoutClick = async () => {
    // Check eligibility first
    const eligibility = checkBookingEligibility()
    if (!eligibility.allowed) {
      alert(`❌ Booking Restricted\n\n${eligibility.reason}`)
      return
    }
    
    // Show warning if manual approval required
    if (eligibility.reason && eligibility.reason.includes('manual approval')) {
      const proceed = confirm(`⚠️ Manual Approval Required\n\n${eligibility.reason}\n\nDo you want to proceed?`)
      if (!proceed) return
    }
    
    // Validation checks
    if (!allDocumentsUploaded) {
      documentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      alert('Please upload all required documents')
      return
    }
    
    if (!paymentComplete) {
      paymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      alert('Please complete all required fields')
      return
    }
    
    setIsProcessing(true)
    
    try {
      const formatDateString = (dateStr: string) => {
        if (!dateStr) return ''
        if (dateStr.match(/^\d{4}-\d{2}-\d{2}$/)) return dateStr
        const date = new Date(dateStr)
        return date.toISOString().split('T')[0]
      }
      
      const formatDOB = (dob: Date | null) => {
        if (!dob) return '1990-01-01'
        return format(dob, 'yyyy-MM-dd')
      }
      
      const mapInsuranceType = (type: string) => {
        switch(type?.toLowerCase()) {
          case 'standard':
          case 'basic':
            return 'basic'
          case 'premium':
            return 'premium'
          case 'none':
            return 'none'
          default:
            return 'basic'
        }
      }
      
      const mapPickupType = (deliveryType: string) => {
        switch(deliveryType?.toLowerCase()) {
          case 'pickup':
          case 'host':
            return 'host'
          case 'valet':
          case 'delivery':
            return 'delivery'
          case 'airport':
            return 'airport'
          case 'hotel':
            return 'hotel'
          default:
            return 'host'
        }
      }
      
      // Prepare booking payload
      const bookingPayload = {
        carId: savedBookingDetails?.carId || carId,
        
        // Guest information
        guestEmail: driverEmail || guestEmail || '',
        guestPhone: driverPhone || guestPhone || '',
        guestName: guestName || `${driverFirstName} ${driverLastName}`.trim(),
        
        // Include reviewerProfileId if logged in
        ...(userProfile?.id && { reviewerProfileId: userProfile.id }),
        
        // Dates and times
        startDate: formatDateString(savedBookingDetails?.startDate || ''),
        endDate: formatDateString(savedBookingDetails?.endDate || ''),
        startTime: savedBookingDetails?.startTime || '10:00',
        endTime: savedBookingDetails?.endTime || '10:00',
        
        // Pickup details
        pickupType: mapPickupType(savedBookingDetails?.deliveryType || 'host'),
        pickupLocation: car?.address || 'Phoenix, AZ',
        
        // Insurance
        insurance: mapInsuranceType(savedBookingDetails?.insuranceType || 'basic'),
        
        // Driver info
        driverInfo: {
          licenseNumber: driverLicense || '',
          licenseState: 'AZ',
          licenseExpiry: '2028-12-31',
          dateOfBirth: formatDOB(driverAge),
          licensePhotoUrl: licensePhotoUrl || '',
          insurancePhotoUrl: insurancePhotoUrl || '',
          selfiePhotoUrl: selfiePhotoUrl || ''
        },
        
        // Fraud detection data
        fraudData: {
          deviceFingerprint: `web_${Date.now()}_${Math.random().toString(36).substring(7)}`,
          sessionData: {
            formCompletionTime: Math.floor((Date.now() - ((window as any).pageLoadTime || Date.now())) / 1000),
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }
      }
      
      // Call booking API
      const response = await fetch('/api/rentals/book', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingPayload)
      })
      
      const data = await response.json()
      console.log('Booking API response:', data)
      
      if (response.ok && data.booking) {
        sessionStorage.removeItem('rentalBookingDetails')
        
        alert(`✅ Booking successful!\n\nReference: ${data.booking.bookingCode}\nStatus: ${data.status || 'pending_review'}\n\nCheck your email for confirmation.`)
        
        if (data.booking.accessToken) {
          router.push(`/rentals/track/${data.booking.accessToken}`)
        } else if (data.booking.bookingCode) {
          router.push(`/rentals/confirmation/${data.booking.bookingCode}`)
        } else {
          router.push('/rentals')
        }
      } else {
        const errorMessage = data.error || data.message || 'Booking failed'
        console.error('Booking error:', errorMessage)
        
        if (data.details) {
          console.error('Validation errors:', data.details)
          const fieldErrors = data.details.fieldErrors || {}
          const errorsList = Object.entries(fieldErrors)
            .map(([field, errors]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('\n')
          alert(`Booking failed:\n${errorMessage}\n\n${errorsList}`)
        } else {
          alert(`Booking failed: ${errorMessage}`)
        }
      }
    } catch (error) {
      console.error('Booking submission error:', error)
      alert('Failed to submit booking. Please check console for details.')
    } finally {
      setIsProcessing(false)
    }
  }
  
  // ============================================
  // LOADING STATES
  // ============================================
  
  if (isLoading || !car || !savedBookingDetails || profileLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-amber-600"></div>
      </div>
    )
  }
  
  const numberOfDays = savedBookingDetails.pricing.days
  const adjustedDeposit = getAdjustedDeposit()
  const eligibility = moderationStatus 
    ? checkBookingEligibility() 
    : { allowed: true }
  
  // ============================================
  // RENDER
  // ============================================
  
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header Bar */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-0 z-40">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <button
              onClick={() => router.back()}
              className="flex items-center text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-100 transition-colors"
            >
              <IoArrowBackOutline className="w-5 h-5 mr-2" />
              <span className="text-sm">Back to car details</span>
            </button>
            
            <div className="flex items-center text-sm text-gray-500">
              <IoShieldCheckmarkOutline className="w-5 h-5 mr-1 text-green-500" />
              <span>Secure checkout</span>
            </div>
          </div>
        </div>
      </div>
      
      {/* Car Info Card */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700">
        <div className="max-w-4xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              {car.photos?.[0] && (
                <img
                  src={car.photos[0].url}
                  alt={`${car.make} ${car.model}`}
                  className="w-20 h-14 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {car.year} {car.make} {car.model}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {car.carType} • {car.seats} seats
                </p>
                <div className="flex items-center mt-1 space-x-3">
                  <div className="flex items-center">
                    <div className="flex text-amber-400 text-xs">
                      {'★★★★★'.split('').map((star, i) => (
                        <span key={i} className={i < Math.floor(car.rating || 5) ? '' : 'opacity-30'}>
                          {star}
                        </span>
                      ))}
                    </div>
                    <span className="ml-1 text-xs text-gray-500">
                      {car.rating || 5.0}
                    </span>
                  </div>
                  <span className="text-xs text-gray-500">
                    {car.totalTrips || 0} trips
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32">
        
        {/* ✅ NEW: VEHICLE UNAVAILABLE BANNER - HIGHEST PRIORITY */}
        {!car.isActive && (
          <div className="bg-red-50 dark:bg-red-900/20 border-2 border-red-300 dark:border-red-700 rounded-lg p-4 mb-6 shadow-sm">
            <div className="flex items-start gap-3">
              <IoCloseCircleOutline className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-red-900 dark:text-red-100 mb-2 text-base">
                  Vehicle Currently Unavailable
                </p>
                <p className="text-sm text-red-800 dark:text-red-200 mb-3">
                  This vehicle is temporarily unavailable for booking. This may be due to:
                </p>
                <ul className="text-sm text-red-800 dark:text-red-200 space-y-1 ml-4">
                  <li>• Active insurance claim being processed</li>
                  <li>• Scheduled maintenance or repairs</li>
                  <li>• Owner temporarily deactivated the listing</li>
                </ul>
                <p className="text-sm text-red-700 dark:text-red-300 mt-3 font-medium">
                  Please browse other available vehicles or check back later.
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* ✅ VERIFIED USER WELCOME BANNER */}
        {userProfile?.documentsVerified && (
          <div className="bg-gradient-to-r from-green-50 to-blue-50 dark:from-green-900/20 dark:to-blue-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <IoCheckmarkCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div className="flex-1">
                <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  Welcome back, {userProfile.name}! ✨
                </p>
                <ul className="space-y-1 text-xs text-green-800 dark:text-green-200">
                  <li>✓ Your documents are verified - no need to upload again!</li>
                  <li>✓ Your information has been auto-filled</li>
                  {userProfile.insuranceVerified && (
                    <li>✓ Insurance verified - 50% deposit discount applied!</li>
                  )}
                  {userProfile.canInstantBook && (
                    <li>✓ Instant booking enabled</li>
                  )}
                </ul>
              </div>
            </div>
          </div>
        )}
        
        {/* ⚠️ ACCOUNT WARNING/RESTRICTION BANNER */}
        {!eligibility.allowed && car.isActive && (
          <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <IoBanOutline className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-red-900 dark:text-red-100 mb-1">
                  Booking Restricted
                </p>
                <p className="text-sm text-red-800 dark:text-red-200">
                  {eligibility.reason}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* ⚠️ MANUAL APPROVAL WARNING */}
        {eligibility.allowed && eligibility.reason && car.isActive && (
          <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <IoWarningOutline className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                  Manual Approval Required
                </p>
                <p className="text-sm text-yellow-800 dark:text-yellow-200">
                  {eligibility.reason}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* 💰 INSURANCE DISCOUNT BANNER */}
        {userProfile?.insuranceVerified && car.isActive && (
          <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4 mb-4 shadow-sm">
            <div className="flex items-start space-x-3">
              <IoSparklesOutline className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
              <div>
                <p className="font-semibold text-green-900 dark:text-green-100 mb-1">
                  Insurance Discount Active! 🎉
                </p>
                <p className="text-sm text-green-800 dark:text-green-200">
                  Your verified insurance ({userProfile.insuranceProvider}) has reduced your deposit by 50%!
                </p>
                <p className="text-xs text-green-700 dark:text-green-300 mt-1">
                  Original: ${savedBookingDetails.pricing.deposit.toLocaleString()} → 
                  Now: ${adjustedDeposit.toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        )}
        
        {/* P2P Important Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-start space-x-3">
            <IoInformationCircleOutline className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-2">Important Booking Information</p>
              <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-200">
                <li>• <strong>No charges until approved:</strong> Your card will be saved but not charged until we verify your documents and approve your booking</li>
                <li>• <strong>Peer-to-peer rental:</strong> You're renting directly from a vehicle owner, not a traditional rental company</li>
                <li>• <strong>Verification required:</strong> All documents must be verified before your trip is confirmed</li>
              </ul>
            </div>
          </div>
        </div>
        
        {/* Selected Dates Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm border border-gray-300 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <IoCheckmarkOutline className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Trip Dates Selected</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {format(new Date(savedBookingDetails.startDate + 'T00:00:00'), 'MMM d')} - 
                  {format(new Date(savedBookingDetails.endDate + 'T00:00:00'), 'MMM d, yyyy')} 
                  ({numberOfDays} {numberOfDays === 1 ? 'day' : 'days'})
                </p>
              </div>
            </div>
            <button 
              onClick={() => router.back()}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Edit
            </button>
          </div>
        </div>
        
        {/* Selected Insurance Card */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm border border-gray-300 dark:border-gray-600">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-3">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                <IoCheckmarkOutline className="w-5 h-5 text-green-600" />
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">Insurance Selected</p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {savedBookingDetails.insuranceType === 'premium' ? 'Premium Protection' :
                   savedBookingDetails.insuranceType === 'standard' ? 'Standard Protection' : 'Basic Protection'}
                  - ${savedBookingDetails.pricing.insurancePrice / numberOfDays}/day
                </p>
              </div>
            </div>
            <button 
              onClick={() => router.back()}
              className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
            >
              Edit
            </button>
          </div>
        </div>
        
        {/* Experience Enhancements Card */}
        {Object.values(savedBookingDetails.addOns).some(v => v) && (
          <div className="bg-white dark:bg-gray-800 rounded-lg p-4 mb-4 shadow-sm border border-gray-300 dark:border-gray-600">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-100 dark:bg-green-900/20 rounded-full flex items-center justify-center">
                  <IoCheckmarkOutline className="w-5 h-5 text-green-600" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900 dark:text-white">Experience Enhancements</p>
                  <p className="text-xs text-gray-600 dark:text-gray-400">
                    {Object.values(savedBookingDetails.addOns).filter(v => v).length} add-ons selected
                  </p>
                </div>
              </div>
              <button 
                onClick={() => router.back()}
                className="text-xs text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
              >
                Edit
              </button>
            </div>
          </div>
        )}
        
        {/* Primary Driver Information Section */}
        <div className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 shadow-sm border border-gray-300 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center">
            <IoPersonOutline className="w-5 h-5 mr-2" />
            Primary Driver Information
            {userProfile?.documentsVerified && (
              <span className="ml-2 text-xs text-green-600 dark:text-green-400">
                (Auto-filled)
              </span>
            )}
          </h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={driverFirstName}
                onChange={(e) => setDriverFirstName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white"
                placeholder="John"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={driverLastName}
                onChange={(e) => setDriverLastName(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white"
                placeholder="Doe"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <DatePicker
                selected={driverAge}
                onChange={(date) => setDriverAge(date)}
                showYearDropdown
                showMonthDropdown
                scrollableYearDropdown
                yearDropdownItemNumber={100}
                dateFormat="MM/dd/yyyy"
                placeholderText="Select date of birth"
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white"
                wrapperClassName="w-full"
                calendarClassName="!rounded-xl !border-0 !shadow-xl"
                popperClassName="!z-50"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Must be 21 or older</p>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Driver's License # <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={driverLicense}
                onChange={(e) => setDriverLicense(e.target.value.toUpperCase())}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white"
                placeholder="D12345678"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <input
                type="tel"
                value={driverPhone}
                onChange={(e) => setDriverPhone(e.target.value)}
                disabled={!!userProfile?.phone}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                placeholder="(602) 555-0100"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                value={driverEmail}
                onChange={(e) => setDriverEmail(e.target.value)}
                disabled={!!userProfile?.email}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600"
                placeholder="john@example.com"
                required
              />
            </div>
          </div>
        </div>
        
        {/* Document Upload Section */}
        <div ref={documentsRef} className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 shadow-sm border border-gray-300 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Upload Your Documents
            {userProfile?.documentsVerified && (
              <span className="ml-2 text-sm text-green-600 dark:text-green-400 font-normal">
                ✓ Already verified
              </span>
            )}
          </h2>
          
          {/* ✅ VERIFIED USER - SKIP DOCUMENTS */}
          {userProfile?.documentsVerified ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                    Documents Verified ✓
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    Your identity documents were verified on {new Date(userProfile.documentVerifiedAt || '').toLocaleDateString()}. No need to upload again!
                  </p>
                  <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                    <li>✓ Driver's License - Verified</li>
                    <li>✓ Selfie Verification - Verified</li>
                    {userProfile.insuranceVerified && <li>✓ Insurance Card - Verified</li>}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* NON-VERIFIED USER - SHOW UPLOAD FORMS */
            <>
              {isUploading && (
                <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                  <p className="text-sm text-blue-700 dark:text-blue-300 text-center">
                    Uploading document...
                  </p>
                </div>
              )}
              
              {/* Driver's License */}
              <div className={`p-4 mb-3 border-2 rounded-lg transition-all ${
                licenseUploaded ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      licenseUploaded ? 'bg-green-500' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {licenseUploaded ? (
                        <IoCheckmarkOutline className="w-5 h-5 text-white" />
                      ) : (
                        <IoDocumentTextOutline className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Driver's License</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {licensePhotoUrl ? 'Uploaded successfully' : 'Front and back required'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {licensePhotoUrl && (
                      <a 
                        href={licensePhotoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <IoEyeOutline className="w-4 h-4" />
                        View
                      </a>
                    )}
                    
                    <input
                      ref={licenseInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'license')
                      }}
                      className="hidden"
                    />
                    
                    <button 
                      onClick={() => licenseInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {licenseUploaded ? 'Replace' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Insurance Card */}
              <div className={`p-4 mb-3 border-2 rounded-lg transition-all ${
                insuranceUploaded ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      insuranceUploaded ? 'bg-green-500' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {insuranceUploaded ? (
                        <IoCheckmarkOutline className="w-5 h-5 text-white" />
                      ) : (
                        <IoShieldCheckmarkOutline className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Insurance Card</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {insurancePhotoUrl ? 'Uploaded successfully' : 'Proof of coverage'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {insurancePhotoUrl && (
                      <a 
                        href={insurancePhotoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <IoEyeOutline className="w-4 h-4" />
                        View
                      </a>
                    )}
                    
                    <input
                      ref={insuranceInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'insurance')
                      }}
                      className="hidden"
                    />
                    
                    <button 
                      onClick={() => insuranceInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {insuranceUploaded ? 'Replace' : 'Upload'}
                    </button>
                  </div>
                </div>
              </div>
              
              {/* Selfie */}
              <div className={`p-4 border-2 rounded-lg transition-all ${
                selfieUploaded ? 'border-green-500 bg-green-50 dark:bg-green-900/10' : 'border-gray-200 dark:border-gray-600 hover:border-gray-300'
              }`}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                      selfieUploaded ? 'bg-green-500' : 'bg-gray-100 dark:bg-gray-700'
                    }`}>
                      {selfieUploaded ? (
                        <IoCheckmarkOutline className="w-5 h-5 text-white" />
                      ) : (
                        <IoCameraOutline className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">Verification Selfie</p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {selfiePhotoUrl ? 'Uploaded successfully' : 'For identity verification'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-2">
                    {selfiePhotoUrl && (
                      <a 
                        href={selfiePhotoUrl} 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                      >
                        <IoEyeOutline className="w-4 h-4" />
                        View
                      </a>
                    )}
                    
                    <input
                      ref={selfieInputRef}
                      type="file"
                      accept="image/*"
                      onChange={(e) => {
                        const file = e.target.files?.[0]
                        if (file) handleFileUpload(file, 'selfie')
                      }}
                      className="hidden"
                    />
                    
                    <button 
                      onClick={() => selfieInputRef.current?.click()}
                      disabled={isUploading}
                      className="px-4 py-2 bg-black text-white text-sm rounded-lg hover:bg-gray-800 transition-colors disabled:opacity-50"
                    >
                      {selfieUploaded ? 'Replace' : 'Take Photo'}
                    </button>
                  </div>
                </div>
              </div>
              
              {allDocumentsUploaded && (
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs font-medium text-green-700 dark:text-green-300 text-center">
                    ✓ All documents uploaded - You can now proceed to payment
                  </p>
                </div>
              )}
            </>
          )}
        </div>
        
        {/* Payment Section */}
        <div 
          ref={paymentRef}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 shadow-sm border border-gray-300 dark:border-gray-600"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-6">Payment Information</h2>
          
          {/* Cardholder Name */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Cardholder Name
            </label>
            <input
              id="guestName"
              type="text"
              value={guestName}
              onChange={(e) => setGuestName(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
              placeholder="Name on card"
            />
          </div>
          
          {/* Card Information */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Card Information
            </label>
            
            <div className="space-y-3">
              <div className="relative">
                <input
                  type="text"
                  value={cardNumber}
                  onChange={(e) => setCardNumber(formatCardNumber(e.target.value))}
                  maxLength={19}
                  className="w-full px-3 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                  placeholder="1234 5678 9012 3456"
                />
                <IoCardOutline className="absolute left-3 top-2.5 w-5 h-5 text-gray-400" />
              </div>
              
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={cardExpiry}
                  onChange={(e) => setCardExpiry(formatExpiry(e.target.value))}
                  maxLength={5}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                  placeholder="MM/YY"
                />
                <div className="relative">
                  <input
                    type="text"
                    value={cardCVC}
                    onChange={(e) => setCardCVC(e.target.value.replace(/\D/g, '').slice(0, 4))}
                    maxLength={4}
                    className="w-full px-3 py-2 pr-10 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                    placeholder="CVC"
                  />
                  <IoLockClosedOutline className="absolute right-3 top-2.5 w-4 h-4 text-gray-400" />
                </div>
              </div>
              
              <input
                type="text"
                value={cardZip}
                onChange={(e) => setCardZip(e.target.value.replace(/\D/g, '').slice(0, 5))}
                maxLength={5}
                className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white"
                placeholder="ZIP Code"
              />
            </div>
            
            <div className="flex items-center justify-end gap-1 mt-3">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <IoLockClosedOutline className="w-3 h-3" />
                Secure & Encrypted
              </span>
            </div>
          </div>
          
          {/* Price Summary */}
          <div className="border-t dark:border-gray-700 pt-6">
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Rental ({numberOfDays} days)</span>
                <span className="font-medium">${savedBookingDetails.pricing.basePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Insurance</span>
                <span className="font-medium">${savedBookingDetails.pricing.insurancePrice.toLocaleString()}</span>
              </div>
              {savedBookingDetails.pricing.deliveryFee > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Delivery</span>
                  <span className="font-medium">${savedBookingDetails.pricing.deliveryFee}</span>
                </div>
              )}
              {(savedBookingDetails.pricing.breakdown.refuelService + 
                savedBookingDetails.pricing.breakdown.additionalDriver + 
                savedBookingDetails.pricing.breakdown.extraMiles + 
                savedBookingDetails.pricing.breakdown.vipConcierge) > 0 && (
                <div className="flex justify-between">
                  <span className="text-gray-600 dark:text-gray-400">Enhancements</span>
                  <span className="font-medium">
                    ${(savedBookingDetails.pricing.breakdown.refuelService + 
                       savedBookingDetails.pricing.breakdown.additionalDriver + 
                       savedBookingDetails.pricing.breakdown.extraMiles + 
                       savedBookingDetails.pricing.breakdown.vipConcierge).toLocaleString()}
                  </span>
                </div>
              )}
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Service fee</span>
                <span className="font-medium">${savedBookingDetails.pricing.serviceFee.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-gray-400">Taxes</span>
                <span className="font-medium">${savedBookingDetails.pricing.taxes.toLocaleString()}</span>
              </div>
              
              <div className="pt-4 mt-4 border-t dark:border-gray-700">
                <div className="flex justify-between items-baseline">
                  <span className="text-base font-semibold">Total</span>
                  <div className="text-right">
                    <span className="text-2xl font-bold text-gray-900 dark:text-white">
                      ${savedBookingDetails.pricing.total.toLocaleString()}
                    </span>
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                      Plus ${adjustedDeposit.toLocaleString()} security deposit
                      {userProfile?.insuranceVerified && (
                        <span className="text-green-600 dark:text-green-400 font-medium ml-1">
                          (50% off!)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
          
          {/* Terms and Conditions Agreement */}
          <div className="mt-4 p-3 bg-gray-50 dark:bg-gray-900 rounded-lg">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <div className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowRentalAgreement(true)
                  }}
                  className="text-amber-600 hover:text-amber-700 underline font-normal"
                >
                  Rental Agreement
                </button>
                ,{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowInsuranceModal(true)
                  }}
                  className="text-amber-600 hover:text-amber-700 underline font-normal"
                >
                  Insurance Requirements
                </button>
                , and{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowTrustSafetyModal(true)
                  }}
                  className="text-amber-600 hover:text-amber-700 underline font-normal"
                >
                  Trust & Safety
                </button>
                . I understand charges apply after verification.
              </div>
            </label>
          </div>
        </div>
      </div>
      
      {/* Sticky Floating Checkout Bar */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-40">
        <div className="max-w-7xl mx-auto px-4 py-3">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-baseline gap-2">
                <span className="text-2xl font-bold text-gray-900 dark:text-white">
                  ${savedBookingDetails.pricing.total.toLocaleString()}
                </span>
                <span className="text-sm text-gray-500">total</span>
              </div>
              <p className="text-xs text-gray-500">
                {numberOfDays} {numberOfDays === 1 ? 'day' : 'days'} • Taxes & fees included
              </p>
              {userProfile?.insuranceVerified && (
                <p className="text-xs text-green-600 dark:text-green-400 font-medium">
                  💚 Deposit reduced to ${adjustedDeposit.toLocaleString()}
                </p>
              )}
            </div>
            <button
              onClick={handleCheckoutClick}
              disabled={isProcessing || isUploading || !eligibility.allowed}
              className={`px-6 py-2.5 font-semibold shadow-lg rounded-lg transition-all ${
                !isProcessing && !isUploading && eligibility.allowed
                  ? 'bg-black text-white hover:bg-gray-800'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Processing...
                </span>
              ) : !eligibility.allowed ? (
                'Unavailable'
              ) : (
                'Complete Booking'
              )}
            </button>
          </div>
        </div>
      </div>
      
      {/* Modals */}
      <RentalAgreementModal 
        isOpen={showRentalAgreement}
        onClose={() => setShowRentalAgreement(false)}
        carDetails={car}
        bookingDetails={savedBookingDetails}
      />
      
      <InsuranceRequirementsModal
        isOpen={showInsuranceModal}
        onClose={() => setShowInsuranceModal(false)}
      />
      
      <TrustSafetyModal
        isOpen={showTrustSafetyModal}
        onClose={() => setShowTrustSafetyModal(false)}
      />
    </div>
  )
}