// app/(guest)/rentals/[carId]/book/BookingPageClient.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useRouter } from 'next/navigation'
import {
  IoArrowBackOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkOutline,
  IoCheckmarkCircle,
  IoCheckmarkCircleOutline,
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
  IoCloseCircleOutline,
  IoHelpCircleOutline,
  IoRibbonOutline
} from 'react-icons/io5'
import { format } from 'date-fns'
import DatePicker from 'react-datepicker'
import 'react-datepicker/dist/react-datepicker.css'

// Import shared booking pricing utility (ensures consistent calculations)
import {
  calculateBookingPricing,
  formatPrice,
  calculateAppliedBalances,
  getActualDeposit,
  getCarClassAndDefaultDeposit,
  type GuestBalances,
  type AppliedBalancesResult
} from '@/app/(guest)/rentals/lib/booking-pricing'
import { getCityFromAddress } from '@/app/(guest)/rentals/lib/arizona-taxes'

// Import Header component
import Header from '@/app/components/Header'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'

// Import modal components
import RentalAgreementModal from '@/app/(guest)/rentals/components/modals/RentalAgreementModal'
import InsuranceRequirementsModal from '@/app/(guest)/rentals/components/modals/InsuranceRequirementsModal'
import TrustSafetyModal from '@/app/(guest)/rentals/components/modals/TrustSafetyModal'

// Import Phase 14 booking UI components
import { VisitorIdentityVerify, GuestIdentityVerify, InsurancePill } from './components'

// Stripe Payment Element for Apple Pay, Google Pay, and Card payments
import { loadStripe } from '@stripe/stripe-js'
import { Elements, PaymentElement, useStripe, useElements } from '@stripe/react-stripe-js'

// Initialize Stripe outside component to avoid recreating on each render
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!)

// ============================================
// PAYMENT ELEMENT WRAPPER COMPONENT
// ============================================

interface PaymentFormWrapperProps {
  onReady: () => void
  onComplete: (complete: boolean) => void
  onError: (error: string | null) => void
  confirmPaymentRef: React.MutableRefObject<(() => Promise<{ success: boolean; error?: string; paymentIntentId?: string }>) | null>
  billingDetails?: {
    name?: string
    email?: string
    phone?: string
  }
}

function PaymentFormWrapper({ onReady, onComplete, onError, confirmPaymentRef, billingDetails }: PaymentFormWrapperProps) {
  const stripe = useStripe()
  const elements = useElements()

  // Expose confirmPayment function to parent via ref
  React.useEffect(() => {
    confirmPaymentRef.current = async () => {
      if (!stripe || !elements) {
        return { success: false, error: 'Payment system not ready' }
      }

      try {
        const { error, paymentIntent } = await stripe.confirmPayment({
          elements,
          confirmParams: {
            return_url: `${window.location.href.split('?')[0]}?payment_return=true`,
            payment_method_data: {
              billing_details: {
                name: billingDetails?.name || undefined,
                email: billingDetails?.email || undefined,
                phone: billingDetails?.phone || undefined
              }
            }
          },
          redirect: 'if_required' // Don't redirect for card payments
        })

        if (error) {
          console.error('[Payment Element] Payment failed:', error.message)
          return { success: false, error: error.message }
        }

        if (paymentIntent) {
          console.log('[Payment Element] Payment confirmed:', paymentIntent.id, paymentIntent.status)
          return { success: true, paymentIntentId: paymentIntent.id }
        }

        return { success: false, error: 'Unknown payment error' }
      } catch (err: any) {
        console.error('[Payment Element] Confirm error:', err)
        return { success: false, error: err.message || 'Payment confirmation failed' }
      }
    }

    return () => {
      confirmPaymentRef.current = null
    }
  }, [stripe, elements, confirmPaymentRef, billingDetails])

  return (
    <PaymentElement
      onReady={() => {
        console.log('[Payment Element] Ready')
        onReady()
      }}
      onChange={(event) => {
        onComplete(event.complete)
        if (event.complete) {
          onError(null)
        }
      }}
      options={{
        layout: 'tabs',
        wallets: {
          applePay: 'auto',
          googlePay: 'auto'
        },
        defaultValues: {
          billingDetails: {
            name: billingDetails?.name || '',
            email: billingDetails?.email || '',
            phone: billingDetails?.phone || ''
          }
        }
      }}
    />
  )
}

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
  insuranceType?: string  // Legacy field name
  insuranceTier?: string  // Current field name from BookingWidget ('MINIMUM' | 'BASIC' | 'PREMIUM' | 'LUXURY')
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

  // Stripe Identity Verification
  stripeIdentityStatus?: string | null  // null, 'pending', 'requires_input', 'verified'
  stripeIdentityVerifiedAt?: string | null

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

export default function BookingPageClient({ carId }: { carId: string }) {
  const router = useRouter()
  
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

  // Handle Stripe Identity return — ?verified=true in URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    if (params.get('verified') === 'true') {
      // Mark as Stripe-verified so DL verification shows "Already Verified"
      setAiVerificationResult({
        success: true,
        passed: true,
        stripeVerified: true,
      } as any)
      // Clean the URL params
      const url = new URL(window.location.href)
      url.searchParams.delete('verified')
      url.searchParams.delete('email')
      window.history.replaceState({}, '', url.pathname + url.search)
    }

    // Handle 3DS redirect return — payment was confirmed off-page
    if (params.get('payment_return') === 'true' && params.get('payment_intent')) {
      const piId = params.get('payment_intent')
      const redirectStatus = params.get('redirect_status')
      console.log('[3DS Return] Payment redirect detected:', piId, redirectStatus)

      if (redirectStatus === 'succeeded' && piId) {
        setPaymentIntentId(piId)
        setPaymentAlreadyConfirmed(true)
        alert('Your payment was confirmed. Please click "Book Now" to complete your reservation.')
      } else if (redirectStatus === 'failed') {
        setPaymentError('Payment failed during verification. Please try again.')
      }

      // Clean URL params
      const url = new URL(window.location.href)
      url.searchParams.delete('payment_return')
      url.searchParams.delete('payment_intent')
      url.searchParams.delete('payment_intent_client_secret')
      url.searchParams.delete('redirect_status')
      window.history.replaceState({}, '', url.pathname + url.search)
    }
  }, [])
  
  // Refs for scroll to incomplete sections
  const documentsRef = useRef<HTMLDivElement>(null)
  const paymentRef = useRef<HTMLDivElement>(null)

  // Ref for Stripe Payment Element confirm function
  const confirmPaymentRef = useRef<(() => Promise<{ success: boolean; error?: string; paymentIntentId?: string }>) | null>(null)

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
  const [licenseBackPhotoUrl, setLicenseBackPhotoUrl] = useState('')
  const [insurancePhotoUrl, setInsurancePhotoUrl] = useState('')
  const [selfiePhotoUrl, setSelfiePhotoUrl] = useState('')
  const [isUploading, setIsUploading] = useState(false)

  // Insurance upload expandable section (collapsed by default per Baymard best practices)
  const [showInsuranceUpload, setShowInsuranceUpload] = useState(false)

  // Stripe Identity verification state
  const [isVerifyingIdentity, setIsVerifyingIdentity] = useState(false)
  const [identityError, setIdentityError] = useState<string | null>(null)
  const [existingAccountInfo, setExistingAccountInfo] = useState<{
    exists: boolean
    type: 'guest' | 'host' | null
    verified: boolean
    email: string
  } | null>(null)

  // Phase 14: AI-powered DL verification for visitors (replaces Stripe $1.50 check with ~$0.02 AI check)
  const [aiVerificationResult, setAiVerificationResult] = useState<{
    success: boolean
    passed: boolean
    data?: {
      name: string
      dob: string
      licenseNumber: string
      expiration: string
      state: string
      isExpired: boolean
    }
    confidence?: number
    redFlags?: string[]
    error?: string
    stripeVerified?: boolean
    manualPending?: boolean
    frozen?: boolean
    frozenUntil?: string
  } | null>(null)
  
  // Payment form states
  const [guestName, setGuestName] = useState('')  // Cardholder first name
  const [guestLastName, setGuestLastName] = useState('')  // Cardholder last name (no validation required)
  const [guestEmail, setGuestEmail] = useState('')
  const [guestPhone, setGuestPhone] = useState('')
  const [cardNumber, setCardNumber] = useState('')
  const [cardExpiry, setCardExpiry] = useState('')
  const [cardCVC, setCardCVC] = useState('')
  const [cardZip, setCardZip] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  // Stripe Payment Element states (for Apple Pay, Google Pay, Card)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [isPaymentElementReady, setIsPaymentElementReady] = useState(false)
  const [isPaymentElementComplete, setIsPaymentElementComplete] = useState(false)
  const [paymentError, setPaymentError] = useState<string | null>(null)
  const [paymentAlreadyConfirmed, setPaymentAlreadyConfirmed] = useState(false)

  // Saved payment methods state
  const [savedPaymentMethods, setSavedPaymentMethods] = useState<{
    id: string
    brand: string
    last4: string
    expMonth: number
    expYear: number
    isDefault: boolean
  }[]>([])
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<string>('new') // 'new' or payment method ID
  const [savedMethodsLoading, setSavedMethodsLoading] = useState(false)

  // Primary driver information states
  const [driverFirstName, setDriverFirstName] = useState('')
  const [driverLastName, setDriverLastName] = useState('')

  // HOST Guard state - prevent HOST users from booking
  const [hostGuard, setHostGuard] = useState<{
    show: boolean
    type: 'host-only' | 'dual-account' | null
    linkedGuestEmail?: string
    isSwitching?: boolean
    checked?: boolean  // Track if host guard check has completed
  }>({ show: false, type: null, checked: false })

  // Deposit tooltip state
  const [showDepositTooltip, setShowDepositTooltip] = useState(false)
  const [driverAge, setDriverAge] = useState<Date | null>(null)
  const [driverLicense, setDriverLicense] = useState('')
  const [driverPhone, setDriverPhone] = useState('')
  const [driverEmail, setDriverEmail] = useState('')

  // Email validation state
  const [emailValidation, setEmailValidation] = useState<{
    isValid: boolean
    error: string | null
    suggestion: string | null
  }>({ isValid: false, error: null, suggestion: null })

  // Phone validation state
  const [phoneValidation, setPhoneValidation] = useState<{
    isValid: boolean
    error: string | null
  }>({ isValid: false, error: null })

  // Name validation states
  const [firstNameValidation, setFirstNameValidation] = useState<{
    isValid: boolean
    error: string | null
  }>({ isValid: false, error: null })

  const [lastNameValidation, setLastNameValidation] = useState<{
    isValid: boolean
    error: string | null
  }>({ isValid: false, error: null })

  // Cardholder name validation states (same rules: 3+ chars, letters only, no dots/numbers)
  const [cardholderFirstValidation, setCardholderFirstValidation] = useState<{
    isValid: boolean
    error: string | null
  }>({ isValid: false, error: null })

  const [cardholderLastValidation, setCardholderLastValidation] = useState<{
    isValid: boolean
    error: string | null
  }>({ isValid: false, error: null })

  // DOB/Age validation state
  const [ageValidation, setAgeValidation] = useState<{
    isValid: boolean
    error: string | null
    age: number | null
  }>({ isValid: false, error: null, age: null })

  // Second driver states
  const [showSecondDriver, setShowSecondDriver] = useState(false)
  const [secondDriverFirstName, setSecondDriverFirstName] = useState('')
  const [secondDriverLastName, setSecondDriverLastName] = useState('')
  const [secondDriverAge, setSecondDriverAge] = useState<Date | null>(null)
  const [secondDriverLicense, setSecondDriverLicense] = useState('')

  // ✅ Guest financial balances (Credits, Bonus, Deposit Wallet)
  const [guestBalances, setGuestBalances] = useState<GuestBalances>({
    creditBalance: 0,
    bonusBalance: 0,
    depositWalletBalance: 0
  })
  const [balancesLoaded, setBalancesLoaded] = useState(false)

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
  // HANDLE RETURN FROM STRIPE VERIFICATION
  // ============================================

  useEffect(() => {
    // Check URL params for verified status
    const urlParams = new URLSearchParams(window.location.search)
    const verified = urlParams.get('verified')
    const email = urlParams.get('email')

    if (verified === 'true' && email) {
      console.log('[Booking] Returned from Stripe verification with email:', email)

      // Set the verification email so the UI knows they just verified
      // setVerificationEmail was removed - email tracked via session state

      // Check if they now have an account (auto-created by webhook)
      const checkVerificationStatus = async () => {
        try {
          // Give webhook a moment to process
          await new Promise(resolve => setTimeout(resolve, 1000))

          // Try to verify auth status again
          const response = await fetch('/api/auth/verify', {
            method: 'GET',
            credentials: 'include',
          })

          if (response.ok) {
            const userData = await response.json()
            setSession({ user: userData.user })
            setSessionStatus('authenticated')

            // Clean up URL
            const cleanUrl = window.location.pathname
            window.history.replaceState({}, '', cleanUrl)
          } else {
            // Not logged in yet - prompt to sign in with verified email
            setExistingAccountInfo({
              exists: true,
              type: 'guest',
              verified: true,
              email: email
            })

            // Clean up URL
            const cleanUrl = window.location.pathname
            window.history.replaceState({}, '', cleanUrl)
          }
        } catch (error) {
          console.error('[Booking] Error checking verification status:', error)
        }
      }

      checkVerificationStatus()
    }
  }, [])

  // ============================================
  // CHECK IF HOST USER - BLOCK FROM BOOKING
  // ============================================

  useEffect(() => {
    const checkHostBookingEligibility = async () => {
      // Only check after auth status is determined
      if (sessionStatus === 'loading') return

      // If not authenticated, allow booking (they'll need to login)
      if (sessionStatus !== 'authenticated') {
        console.log('[Booking] User not authenticated - allowing booking flow')
        setHostGuard({ show: false, type: null, checked: true })
        return
      }

      try {
        const dualRoleRes = await fetch('/api/auth/check-dual-role', {
          credentials: 'include'
        })

        if (dualRoleRes.ok) {
          const dualRole = await dualRoleRes.json()
          console.log('[Booking] Dual-role check:', dualRole)

          // HOST-only trying to book → Block
          if (dualRole.hasHostProfile && !dualRole.hasGuestProfile) {
            console.log('[Booking] HOST-only user - cannot book')
            setHostGuard({
              show: true,
              type: 'host-only',
              checked: true
            })
            return
          }

          // HOST with dual account logged in as HOST → Need to switch to guest
          if (dualRole.hasHostProfile && dualRole.hasGuestProfile && dualRole.currentRole === 'host') {
            console.log('[Booking] HOST with dual account - must switch to guest')

            // Get the linked guest email for display
            let linkedEmail = undefined
            if (dualRole.linkedUserId) {
              try {
                // The guest profile is on a linked account
                const userRes = await fetch(`/api/auth/check-dual-role`, { credentials: 'include' })
                if (userRes.ok) {
                  // We already have this info - just need to get the email
                  // For now, we'll show "your Guest account" since we have confirmation they have one
                  linkedEmail = dualRole.guestProfileIsLinked ? 'linked' : undefined
                }
              } catch (e) {
                console.log('[Booking] Could not fetch linked guest email')
              }
            }

            setHostGuard({
              show: true,
              type: 'dual-account',
              linkedGuestEmail: linkedEmail,
              checked: true
            })
            return
          }

          // User is a GUEST or no host profile - safe to proceed
          console.log('[Booking] User is GUEST - can book')
          setHostGuard({ show: false, type: null, checked: true })
        } else {
          // No dual-role info - assume guest
          console.log('[Booking] No dual-role info - assuming guest')
          setHostGuard({ show: false, type: null, checked: true })
        }
      } catch (e) {
        console.error('[Booking] Failed to check booking eligibility:', e)
        // On error, allow booking but mark as checked
        setHostGuard({ show: false, type: null, checked: true })
      }
    }

    checkHostBookingEligibility()
  }, [sessionStatus])

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

      // Wait for host guard check to complete
      if (!hostGuard.checked) {
        console.log('⏳ Host guard check not complete yet...')
        return
      }

      // Skip if HOST guard is showing (user is a HOST)
      if (hostGuard.show) {
        console.log('🚫 Skipping guest profile fetch - HOST user blocked')
        setProfileLoading(false)
        return
      }

      // Only fetch if user is logged in
      if (session?.user?.email) {
        console.log('✅ User is logged in:', session.user.email)

        // First check if user is a HOST (to avoid 404 errors on guest APIs)
        try {
          const dualRoleRes = await fetch('/api/auth/check-dual-role', {
            credentials: 'include'
          })
          if (dualRoleRes.ok) {
            const dualRole = await dualRoleRes.json()
            // If user is HOST-only or HOST in host mode, skip guest APIs
            if (dualRole.currentRole === 'host' || (dualRole.hasHostProfile && !dualRole.hasGuestProfile)) {
              console.log('🚫 Skipping guest profile fetch - user is in HOST mode')
              setProfileLoading(false)
              return
            }
          }
        } catch (e) {
          console.log('⚠️ Could not check dual-role, proceeding with guest fetch')
        }

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
              const firstName = nameParts[0] || ''
              const lastName = nameParts.slice(1).join(' ') || ''
              setDriverFirstName(firstName)
              setDriverLastName(lastName)
              // Auto-fill cardholder name (first/last separately)
              setGuestName(firstName)
              setGuestLastName(lastName)

              // Validate auto-filled names - STRICT: 3+ chars, letters only (no dots/numbers)
              const validNamePattern = /^[a-zA-Z]+(['-][a-zA-Z]+)*$/
              const firstTrimmed = firstName.trim()
              const lastTrimmed = lastName.trim()

              if (firstTrimmed.length >= 3 && validNamePattern.test(firstTrimmed)) {
                setFirstNameValidation({ isValid: true, error: null })
              } else if (firstTrimmed.length > 0) {
                setFirstNameValidation({
                  isValid: false,
                  error: firstTrimmed.length < 3 ? 'First name must be at least 3 characters' : 'First name can only contain letters'
                })
              }

              if (lastTrimmed.length >= 3 && validNamePattern.test(lastTrimmed)) {
                setLastNameValidation({ isValid: true, error: null })
              } else if (lastTrimmed.length > 0) {
                setLastNameValidation({
                  isValid: false,
                  error: lastTrimmed.length < 3 ? 'Last name must be at least 3 characters' : 'Last name can only contain letters'
                })
              }

              // Also validate cardholder names (same rules)
              if (firstTrimmed.length >= 3 && validNamePattern.test(firstTrimmed)) {
                setCardholderFirstValidation({ isValid: true, error: null })
              } else if (firstTrimmed.length > 0) {
                setCardholderFirstValidation({
                  isValid: false,
                  error: firstTrimmed.length < 3 ? 'Cardholder first name must be at least 3 characters' : 'Cardholder first name can only contain letters'
                })
              }

              if (lastTrimmed.length >= 3 && validNamePattern.test(lastTrimmed)) {
                setCardholderLastValidation({ isValid: true, error: null })
              } else if (lastTrimmed.length > 0) {
                setCardholderLastValidation({
                  isValid: false,
                  error: lastTrimmed.length < 3 ? 'Cardholder last name must be at least 3 characters' : 'Cardholder last name can only contain letters'
                })
              }

              console.log('Name auto-filled:', profileData.name)
            }
            if (profileData.email) {
              setDriverEmail(profileData.email)
              setGuestEmail(profileData.email)
              // Validate pre-filled email (should always be valid from profile)
              const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
              if (emailRegex.test(profileData.email)) {
                setEmailValidation({ isValid: true, error: null, suggestion: null })
              }
              console.log('✅ Email auto-filled:', profileData.email)
            }
            if (profileData.phone) {
              // Format phone to (###)-###-#### format
              const digits = profileData.phone.replace(/\D/g, '').slice(0, 10)
              let formattedPhone = profileData.phone
              if (digits.length === 10) {
                formattedPhone = `(${digits.slice(0, 3)})-${digits.slice(3, 6)}-${digits.slice(6)}`
              }
              setDriverPhone(formattedPhone)
              setGuestPhone(formattedPhone)
              // Validate pre-filled phone (should always be valid from profile)
              if (digits.length >= 10) {
                setPhoneValidation({ isValid: true, error: null })
              }
              console.log('Phone auto-filled:', formattedPhone)
            }

            // Auto-fill Date of Birth from profile
            if (profileData.dateOfBirth) {
              const dob = new Date(profileData.dateOfBirth)
              if (!isNaN(dob.getTime())) {
                setDriverAge(dob)
                // Calculate age for validation
                const today = new Date()
                let age = today.getFullYear() - dob.getFullYear()
                const monthDiff = today.getMonth() - dob.getMonth()
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
                  age--
                }
                // Set validation (min age 21 for standard vehicles)
                if (age >= 21 && age <= 100) {
                  setAgeValidation({ isValid: true, error: null, age })
                  console.log('✅ Date of birth auto-filled:', dob, '- Age:', age)
                } else {
                  console.log('⚠️ Date of birth auto-filled but age validation failed:', age)
                }
              }
            }

            // Auto-fill Driver's License Number from profile
            if (profileData.driverLicenseNumber) {
              setDriverLicense(profileData.driverLicenseNumber)
              console.log('✅ Driver license auto-filled:', profileData.driverLicenseNumber)
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

            // Fetch saved payment methods for authenticated users
            try {
              setSavedMethodsLoading(true)
              const paymentMethodsRes = await fetch('/api/payments/methods', {
                credentials: 'include'
              })
              if (paymentMethodsRes.ok) {
                const methodsData = await paymentMethodsRes.json()
                if (methodsData.success && methodsData.paymentMethods?.length > 0) {
                  setSavedPaymentMethods(methodsData.paymentMethods)
                  // Auto-select: prefer default method, otherwise use first saved card
                  const defaultMethod = methodsData.paymentMethods.find((m: any) => m.isDefault)
                  if (defaultMethod) {
                    setSelectedPaymentMethod(defaultMethod.id)
                    console.log('💳 Default payment method selected:', defaultMethod.id)
                  } else {
                    // No default set - use first saved card
                    setSelectedPaymentMethod(methodsData.paymentMethods[0].id)
                    console.log('💳 First saved payment method selected:', methodsData.paymentMethods[0].id)
                  }
                  console.log('💳 Saved payment methods loaded:', methodsData.paymentMethods.length)
                }
              }
            } catch (pmError) {
              console.error('Failed to load saved payment methods:', pmError)
            } finally {
              setSavedMethodsLoading(false)
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
  }, [session, sessionStatus, hostGuard.show, hostGuard.checked])
  
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
  // ✅ FETCH GUEST FINANCIAL BALANCES
  // ============================================

  useEffect(() => {
    const fetchBalances = async () => {
      // For unauthenticated users or hosts, mark as loaded with 0 balances
      if (sessionStatus === 'unauthenticated' || hostGuard.show) {
        setBalancesLoaded(true)
        return
      }

      // Wait for auth to settle
      if (sessionStatus === 'loading' || profileLoading) {
        return
      }

      try {
        // Fetch balance and deposit wallet data in parallel
        const [balanceRes, depositRes] = await Promise.all([
          fetch('/api/payments/balance', { credentials: 'include' }),
          fetch('/api/payments/deposit-wallet', { credentials: 'include' })
        ])

        let creditBalance = 0
        let bonusBalance = 0
        let depositWalletBalance = 0

        if (balanceRes.ok) {
          const balanceData = await balanceRes.json()
          creditBalance = balanceData.creditBalance || 0
          bonusBalance = balanceData.bonusBalance || 0
        }

        if (depositRes.ok) {
          const depositData = await depositRes.json()
          depositWalletBalance = depositData.balance || 0
        }

        setGuestBalances({
          creditBalance,
          bonusBalance,
          depositWalletBalance
        })
        setBalancesLoaded(true)
      } catch (error) {
        setBalancesLoaded(true) // Mark as loaded even on error to prevent infinite loading
      }
    }

    fetchBalances()
  }, [sessionStatus, profileLoading, hostGuard.show])

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

    // ✅ Check if driver info is complete (all fields valid)
    // This ensures all driver fields pass validation before booking can proceed
    // No alert/reason - errors show inline under each field
    const isDriverInfoComplete = driverFirstName && driverLastName && driverAge && driverLicense && driverPhone && driverEmail &&
      emailValidation.isValid && phoneValidation.isValid && firstNameValidation.isValid && lastNameValidation.isValid && ageValidation.isValid

    if (!isDriverInfoComplete) {
      return { allowed: false }  // No reason - inline errors show under Primary Driver Info fields
    }

    // ✅ Check if identity is verified (for non-logged-in users OR users without verification)
    // Phase 14: Also check AI verification for visitors (aiVerificationResult.passed)
    const userIsVerified = userProfile?.documentsVerified || userProfile?.stripeIdentityStatus === 'verified' || aiVerificationResult?.passed
    if (!userIsVerified && sessionStatus === 'unauthenticated') {
      return { allowed: false }  // No reason - user sees Verify Identity section
    }

    // ✅ Check if payment info is complete (via Stripe Payment Element or saved method)
    const hasSavedMethodSelected = selectedPaymentMethod !== 'new' && savedPaymentMethods.length > 0
    if (!hasSavedMethodSelected && (!isPaymentElementComplete || !isPaymentElementReady)) {
      return { allowed: false }  // No reason - user sees Payment Element
    }

    // ✅ Check if terms agreed
    if (!agreedToTerms) {
      return { allowed: false }  // No reason - user sees unchecked terms box
    }

    // ✅ REQUIRED: Insurance must be selected and calculated
    // No booking can proceed without insurance - it's mandatory
    if (savedBookingDetails) {
      // Check both insuranceType (legacy) and insuranceTier (current) field names
      const insuranceSelection = (savedBookingDetails.insuranceType || savedBookingDetails.insuranceTier || '')?.toLowerCase()
      const insurancePrice = savedBookingDetails.pricing?.insurancePrice ?? 0

      // Block if no insurance selected OR insurance is explicitly 'none' OR price is 0
      if (!insuranceSelection || insuranceSelection === 'none' || insurancePrice <= 0) {
        return {
          allowed: false,
          reason: 'Insurance is required for all bookings. Please go back and select an insurance option.'
        }
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
  
  // Check if identity is verified (Stripe Identity, manual documents, or Phase 14 AI verification)
  // Note: Booking insurance is REQUIRED (validated in checkBookingEligibility)
  // Personal insurance card upload is OPTIONAL (for deposit discount)
  // Phase 14: Also check AI verification for visitors (aiVerificationResult.passed)
  const isIdentityVerified = userProfile?.documentsVerified || userProfile?.stripeIdentityStatus === 'verified' || aiVerificationResult?.passed
  
  // Check if this is a $0 booking (credits/discounts cover full amount + deposit)
  // Stripe requires minimum $0.50, so anything below that is effectively free
  // Must calculate using the same logic as PaymentIntent creation
  const isZeroPaymentBooking = React.useMemo(() => {
    if (!savedBookingDetails?.pricing || !balancesLoaded || !car) return false

    // Calculate pricing
    const carCity = (car as any)?.city || getCityFromAddress(car?.address || 'Phoenix, AZ')
    const pricing = calculateBookingPricing({
      dailyRate: savedBookingDetails.pricing.dailyRate,
      days: savedBookingDetails.pricing.days,
      insurancePrice: savedBookingDetails.pricing.insurancePrice,
      deliveryFee: savedBookingDetails.pricing.deliveryFee,
      enhancements: {
        refuelService: savedBookingDetails.pricing.breakdown?.refuelService || 0,
        additionalDriver: savedBookingDetails.pricing.breakdown?.additionalDriver || 0,
        extraMiles: savedBookingDetails.pricing.breakdown?.extraMiles || 0,
        vipConcierge: savedBookingDetails.pricing.breakdown?.vipConcierge || 0
      },
      city: carCity
    })

    // Calculate adjusted deposit (50% off if insurance verified)
    let deposit = savedBookingDetails.pricing.deposit || 0
    if (userProfile?.insuranceVerified) {
      deposit = deposit * 0.5
    }

    // Apply credits and bonus
    const appliedBalances = calculateAppliedBalances(
      pricing,
      deposit,
      guestBalances,
      0.25
    )

    // Grand total = rental amount after credits + deposit from card
    const grandTotal = appliedBalances.amountToPay + appliedBalances.depositFromCard

    // If grand total is < $0.50, it's a $0 booking
    return grandTotal >= 0 && grandTotal < 0.50
  }, [savedBookingDetails, balancesLoaded, car, guestBalances, userProfile?.insuranceVerified])

  // Check if payment form is complete
  // Use Payment Element status OR saved payment method selection
  // For $0 bookings, payment is automatically valid (no card needed)
  const hasSavedMethod = selectedPaymentMethod !== 'new' && savedPaymentMethods.length > 0
  const cardValid = isZeroPaymentBooking || hasSavedMethod || (isPaymentElementComplete && isPaymentElementReady)
  // Email and phone must be valid, and all driver fields filled
  const driverInfoComplete = driverFirstName && driverLastName && driverAge && driverLicense && driverPhone && driverEmail &&
    emailValidation.isValid && phoneValidation.isValid && firstNameValidation.isValid && lastNameValidation.isValid && ageValidation.isValid
  const paymentComplete = driverInfoComplete && cardValid && agreedToTerms
  
  // Check if can checkout
  const canCheckout = isIdentityVerified && paymentComplete
  
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

        // ✅ RECALCULATE deposit from fresh car data (overrides stale sessionStorage)
        const freshDeposit = getActualDeposit(data)
        console.log('💰 Fresh deposit calculated:', freshDeposit)

        // Update savedBookingDetails with the fresh deposit if they differ
        setSavedBookingDetails(prev => {
          if (!prev) return prev
          if (prev.pricing.deposit !== freshDeposit) {
            console.log('💰 Updating deposit from', prev.pricing.deposit, 'to', freshDeposit)
            return {
              ...prev,
              pricing: {
                ...prev.pricing,
                deposit: freshDeposit
              }
            }
          }
          return prev
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
  // CREATE PAYMENT INTENT FOR STRIPE PAYMENT ELEMENT
  // ============================================

  useEffect(() => {
    const createPaymentIntent = async () => {
      // Wait for all required data before creating PaymentIntent
      if (!savedBookingDetails?.pricing?.total) return
      if (clientSecret) return
      if (!balancesLoaded) return
      if (!car) return

      // Calculate the ACTUAL amount to charge (after credits/bonus + deposit)
      const carCity = (car as any)?.city || getCityFromAddress(car?.address || 'Phoenix, AZ')
      const pricing = calculateBookingPricing({
        dailyRate: savedBookingDetails.pricing.dailyRate,
        days: savedBookingDetails.pricing.days,
        insurancePrice: savedBookingDetails.pricing.insurancePrice,
        deliveryFee: savedBookingDetails.pricing.deliveryFee,
        enhancements: {
          refuelService: savedBookingDetails.pricing.breakdown?.refuelService || 0,
          additionalDriver: savedBookingDetails.pricing.breakdown?.additionalDriver || 0,
          extraMiles: savedBookingDetails.pricing.breakdown?.extraMiles || 0,
          vipConcierge: savedBookingDetails.pricing.breakdown?.vipConcierge || 0
        },
        city: carCity
      })

      // Calculate adjusted deposit (50% off if insurance verified)
      let deposit = savedBookingDetails.pricing.deposit || 0
      if (userProfile?.insuranceVerified) {
        deposit = deposit * 0.5
      }

      // Apply credits and bonus to get actual amount to pay
      const appliedBalances = calculateAppliedBalances(
        pricing,
        deposit,
        guestBalances,
        0.25 // 25% max bonus
      )

      // Grand total = rental amount after credits + deposit (minus any deposit wallet coverage)
      const grandTotal = appliedBalances.amountToPay + appliedBalances.depositFromCard
      const grandTotalCents = Math.round(grandTotal * 100)

      // Minimum $0.50 USD required by Stripe
      if (grandTotalCents < 50) return

      try {

        const response = await fetch('/api/rentals/payment-element', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            amount: grandTotalCents,
            email: driverEmail || guestEmail || userProfile?.email,
            carId,
            startDate: savedBookingDetails.startDate,
            endDate: savedBookingDetails.endDate,
            metadata: {
              carId,
              days: savedBookingDetails.pricing.days?.toString(),
              insurance: savedBookingDetails.insuranceTier || savedBookingDetails.insuranceType,
              rentalAmount: appliedBalances.amountToPay.toFixed(2),
              depositAmount: appliedBalances.depositFromCard.toFixed(2),
              creditsApplied: appliedBalances.creditsApplied.toFixed(2),
              bonusApplied: appliedBalances.bonusApplied.toFixed(2)
            }
          })
        })

        if (response.ok) {
          const data = await response.json()
          setClientSecret(data.clientSecret)
          setPaymentIntentId(data.paymentIntentId)
        } else {
          setPaymentError('Unable to initialize payment. Please try again.')
        }
      } catch (error) {
        setPaymentError('Payment initialization failed. Please refresh the page.')
      }
    }

    createPaymentIntent()
  }, [savedBookingDetails, carId, clientSecret, driverEmail, guestEmail, userProfile, balancesLoaded, guestBalances, car])

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
  // EMAIL VALIDATION HELPER
  // ============================================

  // Common email domains for validation
  const COMMON_EMAIL_DOMAINS = [
    'gmail.com', 'yahoo.com', 'hotmail.com', 'outlook.com', 'icloud.com',
    'aol.com', 'mail.com', 'protonmail.com', 'live.com', 'msn.com',
    'ymail.com', 'me.com', 'comcast.net', 'att.net', 'verizon.net',
    'cox.net', 'sbcglobal.net', 'bellsouth.net', 'charter.net'
  ]

  // Common typos mapping
  const DOMAIN_TYPO_CORRECTIONS: Record<string, string> = {
    'gmai.com': 'gmail.com',
    'gmial.com': 'gmail.com',
    'gmil.com': 'gmail.com',
    'gmail.co': 'gmail.com',
    'gmal.com': 'gmail.com',
    'gamil.com': 'gmail.com',
    'gnail.com': 'gmail.com',
    'yaho.com': 'yahoo.com',
    'yahooo.com': 'yahoo.com',
    'yahoo.co': 'yahoo.com',
    'yhaoo.com': 'yahoo.com',
    'yaoo.com': 'yahoo.com',
    'hotmal.com': 'hotmail.com',
    'hotmai.com': 'hotmail.com',
    'hotmail.co': 'hotmail.com',
    'hotamil.com': 'hotmail.com',
    'outlok.com': 'outlook.com',
    'outloo.com': 'outlook.com',
    'outlook.co': 'outlook.com',
    'outlookcom': 'outlook.com',
    'iclould.com': 'icloud.com',
    'icloud.co': 'icloud.com',
    'icoud.com': 'icloud.com'
  }

  const validateEmail = (email: string): { isValid: boolean; error: string | null; suggestion: string | null } => {
    if (!email) {
      return { isValid: false, error: null, suggestion: null }
    }

    // Basic format check
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return { isValid: false, error: 'Please enter a valid email address', suggestion: null }
    }

    const [localPart, domain] = email.toLowerCase().split('@')

    // Check for minimum local part length
    if (localPart.length < 1) {
      return { isValid: false, error: 'Email address is too short', suggestion: null }
    }

    // Check for typos in domain
    if (DOMAIN_TYPO_CORRECTIONS[domain]) {
      const correctedDomain = DOMAIN_TYPO_CORRECTIONS[domain]
      return {
        isValid: false,
        error: null,
        suggestion: `Did you mean ${localPart}@${correctedDomain}?`
      }
    }

    // Check for valid TLD
    const tld = domain.split('.').pop()
    if (!tld || tld.length < 2) {
      return { isValid: false, error: 'Please enter a valid email domain', suggestion: null }
    }

    // Check for disposable email patterns (optional - basic check)
    const disposablePatterns = ['tempmail', 'throwaway', '10minute', 'guerrilla', 'mailinator']
    if (disposablePatterns.some(pattern => domain.includes(pattern))) {
      return { isValid: false, error: 'Please use a permanent email address', suggestion: null }
    }

    return { isValid: true, error: null, suggestion: null }
  }

  // Handle email change with validation
  const handleDriverEmailChange = (email: string) => {
    setDriverEmail(email)
    const validation = validateEmail(email)
    setEmailValidation(validation)
  }

  // Accept email suggestion
  const acceptEmailSuggestion = () => {
    if (emailValidation.suggestion) {
      const suggested = emailValidation.suggestion.replace('Did you mean ', '').replace('?', '')
      setDriverEmail(suggested)
      setEmailValidation({ isValid: true, error: null, suggestion: null })
    }
  }

  // ============================================
  // PHONE VALIDATION HELPER
  // ============================================

  // Format phone number as user types: (###) ###-####
  const formatPhoneNumber = (value: string): string => {
    // Remove all non-digits
    const digits = value.replace(/\D/g, '')

    // Limit to 10 digits
    const limited = digits.slice(0, 10)

    // Format based on length: (###) ###-####
    if (limited.length === 0) return ''
    if (limited.length <= 3) return `(${limited}`
    if (limited.length <= 6) return `(${limited.slice(0, 3)}) ${limited.slice(3)}`
    return `(${limited.slice(0, 3)}) ${limited.slice(3, 6)}-${limited.slice(6)}`
  }

  // Validate phone number
  const validatePhone = (phone: string): { isValid: boolean; error: string | null } => {
    if (!phone) {
      return { isValid: false, error: null }
    }

    // Extract digits only
    const digits = phone.replace(/\D/g, '')

    // Must be exactly 10 digits for US numbers
    if (digits.length < 10) {
      return { isValid: false, error: 'Phone number must be 10 digits' }
    }

    // Check for invalid area codes (can't start with 0 or 1)
    if (digits[0] === '0' || digits[0] === '1') {
      return { isValid: false, error: 'Invalid area code' }
    }

    // Check for obviously fake numbers
    const fakePatterns = ['0000000000', '1111111111', '1234567890', '5555555555']
    if (fakePatterns.includes(digits)) {
      return { isValid: false, error: 'Please enter a valid phone number' }
    }

    return { isValid: true, error: null }
  }

  // Handle phone change with formatting and validation
  const handleDriverPhoneChange = (value: string) => {
    const formatted = formatPhoneNumber(value)
    setDriverPhone(formatted)
    const validation = validatePhone(formatted)
    setPhoneValidation(validation)
  }

  // ============================================
  // NAME VALIDATION HELPERS
  // ============================================

  // Validate name - STRICT: minimum 3 characters, letters only
  // NO dots, numbers, or special characters allowed
  const validateName = (name: string, fieldName: string): { isValid: boolean; error: string | null } => {
    if (!name) {
      return { isValid: false, error: null }
    }

    // Remove extra spaces and check length
    const trimmed = name.trim()

    // Must be at least 3 characters - reject 1 or 2 letter names
    if (trimmed.length < 3) {
      return { isValid: false, error: `${fieldName} must be at least 3 characters` }
    }

    // STRICT: Only letters allowed, plus hyphens/apostrophes for names like O'Brien, Mary-Jane
    // NO dots, numbers, or other special characters
    const validNamePattern = /^[a-zA-Z]+(['-][a-zA-Z]+)*$/
    if (!validNamePattern.test(trimmed)) {
      return { isValid: false, error: `${fieldName} can only contain letters` }
    }

    return { isValid: true, error: null }
  }

  // Handle first name change with validation
  const handleFirstNameChange = (value: string) => {
    setDriverFirstName(value)
    const validation = validateName(value, 'First name')
    setFirstNameValidation(validation)
  }

  // Handle last name change with validation
  const handleLastNameChange = (value: string) => {
    setDriverLastName(value)
    const validation = validateName(value, 'Last name')
    setLastNameValidation(validation)
  }

  // Handle cardholder first name change with validation
  const handleCardholderFirstChange = (value: string) => {
    setGuestName(value)
    const validation = validateName(value, 'Cardholder first name')
    setCardholderFirstValidation(validation)
  }

  // Handle cardholder last name change with validation
  const handleCardholderLastChange = (value: string) => {
    setGuestLastName(value)
    const validation = validateName(value, 'Cardholder last name')
    setCardholderLastValidation(validation)
  }

  // ============================================
  // DOB/AGE VALIDATION HELPERS
  // ============================================

  // Get minimum age requirement for the vehicle
  const getMinimumAgeForVehicle = (): number => {
    // Exotic/Luxury vehicles typically require 25+
    // Standard vehicles require 21+
    const carType = car?.carType?.toLowerCase() || ''
    if (carType === 'exotic' || carType === 'luxury') {
      return 25
    }
    return 21
  }

  // Calculate age from date of birth
  const calculateAge = (dob: Date): number => {
    const today = new Date()
    let age = today.getFullYear() - dob.getFullYear()
    const monthDiff = today.getMonth() - dob.getMonth()
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
      age--
    }
    return age
  }

  // Validate age meets vehicle requirements
  const validateAge = (dob: Date | null): { isValid: boolean; error: string | null; age: number | null } => {
    if (!dob) {
      return { isValid: false, error: null, age: null }
    }

    const age = calculateAge(dob)
    const minAge = getMinimumAgeForVehicle()

    if (age < minAge) {
      const carType = car?.carType?.toLowerCase() || ''
      const vehicleDesc = (carType === 'exotic' || carType === 'luxury') ? 'exotic/luxury vehicles' : 'this vehicle'
      return {
        isValid: false,
        error: `Must be ${minAge}+ to rent ${vehicleDesc}. You are ${age}.`,
        age
      }
    }

    if (age > 100) {
      return { isValid: false, error: 'Please enter a valid date of birth', age: null }
    }

    return { isValid: true, error: null, age }
  }

  // Handle DOB change with validation
  const handleDobChange = (date: Date | null) => {
    setDriverAge(date)
    const validation = validateAge(date)
    setAgeValidation(validation)
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
    // Check eligibility first - button is already disabled if not allowed
    // Only show alert for account-level restrictions (has reason), not field validation
    const eligibility = checkBookingEligibility()
    if (!eligibility.allowed) {
      // Only alert if there's a specific reason (account restriction)
      // Field validation errors show inline - no alert needed
      if (eligibility.reason) {
        alert(`❌ Booking Restricted\n\n${eligibility.reason}`)
      }
      return
    }

    // Show warning if manual approval required
    if (eligibility.reason && eligibility.reason.includes('manual approval')) {
      const proceed = confirm(`⚠️ Manual Approval Required\n\n${eligibility.reason}\n\nDo you want to proceed?`)
      if (!proceed) return
    }

    // Validation checks - scroll to incomplete sections instead of alert
    if (!isIdentityVerified) {
      documentsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      return
    }
    
    if (!paymentComplete) {
      paymentRef.current?.scrollIntoView({ behavior: 'smooth', block: 'center' })
      // No alert - inline errors show under each field
      return
    }

    // Double-check: Insurance is REQUIRED for all bookings
    const insuranceSelection = (savedBookingDetails?.insuranceType || savedBookingDetails?.insuranceTier || '')?.toLowerCase()
    const insurancePrice = savedBookingDetails?.pricing?.insurancePrice ?? 0
    if (!insuranceSelection || insuranceSelection === 'none' || insurancePrice <= 0) {
      alert('Insurance is required for all bookings. Please go back and select an insurance option.')
      return
    }

    setIsProcessing(true)
    setPaymentError(null)

    try {
      // Step 1: Confirm payment (skip for $0 bookings)
      let confirmedPaymentIntentId: string | undefined

      // Check if this is a $0 booking - skip payment entirely
      if (isZeroPaymentBooking) {
        console.log('[Checkout] $0 booking - skipping payment confirmation')
        confirmedPaymentIntentId = undefined // No payment needed
      }
      // Check if payment was already confirmed (e.g., 3DS redirect return)
      else if (paymentAlreadyConfirmed && paymentIntentId) {
        console.log('[Checkout] Using pre-confirmed PaymentIntent (3DS return):', paymentIntentId)
        confirmedPaymentIntentId = paymentIntentId
      }
      // Check if using saved payment method or new card via Payment Element
      else if (selectedPaymentMethod !== 'new' && savedPaymentMethods.length > 0) {
        // Using saved payment method - confirm via API
        console.log('[Checkout] Confirming with saved payment method:', selectedPaymentMethod)

        if (!paymentIntentId) {
          alert('Payment intent not ready. Please try again.')
          setIsProcessing(false)
          return
        }

        const confirmRes = await fetch('/api/rentals/confirm-saved-payment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({
            paymentIntentId,
            paymentMethodId: selectedPaymentMethod
          })
        })

        if (!confirmRes.ok) {
          const errorData = await confirmRes.json()
          throw new Error(errorData.error || 'Payment confirmation failed')
        }

        const confirmData = await confirmRes.json()
        if (!confirmData.success) {
          throw new Error(confirmData.error || 'Payment confirmation failed')
        }

        confirmedPaymentIntentId = confirmData.paymentIntentId
        console.log('[Checkout] Saved payment method confirmed! PaymentIntent:', confirmedPaymentIntentId)
      } else {
        // Using new card via Payment Element
        if (!confirmPaymentRef.current) {
          alert('Payment system not ready. Please try again.')
          setIsProcessing(false)
          return
        }

        console.log('[Checkout] Confirming payment with Payment Element...')
        const paymentResult = await confirmPaymentRef.current()

        if (!paymentResult.success) {
          console.error('[Checkout] Payment failed:', paymentResult.error)
          setPaymentError(paymentResult.error || 'Payment failed')
          setIsProcessing(false)
          return
        }

        confirmedPaymentIntentId = paymentResult.paymentIntentId
        console.log('[Checkout] Payment Element confirmed! PaymentIntent:', confirmedPaymentIntentId)
      }

      console.log('[Checkout] Payment step complete! PaymentIntent:', confirmedPaymentIntentId || '(none - $0 booking)')

      // Step 2: Create booking with confirmed payment
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

        // Guest information (use driver info as primary)
        guestEmail: driverEmail || guestEmail || '',
        guestPhone: driverPhone || guestPhone || '',
        guestName: `${driverFirstName} ${driverLastName}`.trim(),

        // Include reviewerProfileId if logged in
        ...(userProfile?.id && { reviewerProfileId: userProfile.id }),

        // Stripe Payment (confirmed via Payment Element, or undefined for $0 bookings)
        ...(confirmedPaymentIntentId && { paymentIntentId: confirmedPaymentIntentId }),

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
          // licenseExpiry collected during identity verification (Stripe Identity)
          dateOfBirth: formatDOB(driverAge),
          licensePhotoUrl: licensePhotoUrl || '',
          licenseBackPhotoUrl: licenseBackPhotoUrl || '',
          insurancePhotoUrl: insurancePhotoUrl || '',
          selfiePhotoUrl: selfiePhotoUrl || ''
        },

        // AI DL verification result (from VisitorIdentityVerify)
        ...(aiVerificationResult?.passed && {
          aiVerification: {
            result: aiVerificationResult,
            score: aiVerificationResult.confidence || 0,
            passed: true,
          }
        }),

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
  // Get rate-based deposit for "waived" display when deposit is 0
  const { deposit: rateBasedDeposit } = getCarClassAndDefaultDeposit(savedBookingDetails.pricing.dailyRate)
  const eligibility = moderationStatus
    ? checkBookingEligibility()
    : { allowed: true }

  // ============================================
  // SWITCH TO GUEST ACCOUNT HANDLER
  // ============================================

  const handleSwitchToGuest = async () => {
    setHostGuard(prev => ({ ...prev, isSwitching: true }))

    try {
      // Call the switch-role API to switch from HOST to GUEST
      const response = await fetch('/api/auth/switch-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify({ targetRole: 'guest' })
      })

      if (response.ok) {
        // Successfully switched - reload the page to continue booking as guest
        console.log('[Booking] Successfully switched to guest account')
        window.location.reload()
      } else {
        // If switch-role doesn't exist or fails, redirect to login
        console.log('[Booking] Switch failed, redirecting to login')
        router.push('/auth/login?roleHint=guest&returnTo=' + encodeURIComponent(window.location.pathname))
      }
    } catch (e) {
      console.error('[Booking] Error switching to guest:', e)
      // Fallback to login page
      router.push('/auth/login?roleHint=guest&returnTo=' + encodeURIComponent(window.location.pathname))
    }
  }

  // ============================================
  // RENDER
  // ============================================

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 overflow-x-hidden">
      {/* Main Header */}
      <Header />

      {/* ============================================ */}
      {/* HOST GUARD MODAL - Overlay on booking page */}
      {/* ============================================ */}
      {hostGuard.show && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          {/* Backdrop - semi-transparent to see page behind */}
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => router.back()}
          />

          {/* Modal Content */}
          <div className="relative bg-gray-800 rounded-xl p-8 max-w-md w-full text-center shadow-2xl border border-gray-700 animate-in fade-in zoom-in duration-200">
            {/* Warning Icon */}
            <div className="w-16 h-16 bg-yellow-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
              <IoWarningOutline className="w-10 h-10 text-yellow-500" />
            </div>

            {hostGuard.type === 'host-only' ? (
              /* HOST-ONLY: No guest account exists */
              <>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Guest Account Required
                </h2>
                <p className="text-gray-400 mb-6">
                  You&apos;re logged in as a Host. To book a car, you need to create a Guest account.
                </p>
                <div className="space-y-3">
                  <button
                    onClick={() => router.push('/auth/signup?roleHint=guest')}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-medium rounded-lg transition-colors"
                  >
                    Create Guest Account
                  </button>
                  <button
                    onClick={() => router.push('/host/dashboard')}
                    className="w-full py-3 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Back to Host Dashboard
                  </button>
                </div>
              </>
            ) : (
              /* DUAL ACCOUNT: Guest account exists - offer smooth switch */
              <>
                <h2 className="text-2xl font-bold text-white mb-2">
                  Switch to Guest Mode
                </h2>
                <p className="text-gray-400 mb-2">
                  You&apos;re currently logged in as a Host.
                </p>
                <p className="text-gray-300 mb-6">
                  We detected you have a <span className="text-green-400 font-medium">Guest account</span> linked to this profile.
                </p>

                <div className="space-y-3">
                  {/* Primary Action: Switch to Guest */}
                  <button
                    onClick={handleSwitchToGuest}
                    disabled={hostGuard.isSwitching}
                    className="w-full py-3 px-4 bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 disabled:from-gray-600 disabled:to-gray-600 text-white font-medium rounded-lg transition-colors flex items-center justify-center gap-2"
                  >
                    {hostGuard.isSwitching ? (
                      <>
                        <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                        Switching...
                      </>
                    ) : (
                      <>
                        <IoCheckmarkCircle className="w-5 h-5" />
                        Switch to Guest Account
                      </>
                    )}
                  </button>

                  {/* Secondary: Manual login */}
                  <button
                    onClick={() => router.push('/auth/login?roleHint=guest&returnTo=' + encodeURIComponent(window.location.pathname))}
                    className="w-full py-2.5 px-4 text-gray-400 hover:text-white text-sm transition-colors"
                  >
                    Sign in with different Guest account
                  </button>

                  {/* Tertiary: Go back */}
                  <button
                    onClick={() => router.back()}
                    className="w-full py-2.5 px-4 bg-gray-700 hover:bg-gray-600 text-white font-medium rounded-lg transition-colors"
                  >
                    Go Back
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Spacer for fixed header */}
      <div className="h-16" />

      {/* Header Bar - sticky below main header */}
      <div className="bg-white dark:bg-gray-800 border-b dark:border-gray-700 sticky top-16 z-40">
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
                  alt={`${capitalizeCarMake(car.make)} ${normalizeModelName(car.model, car.make)}`}
                  className="w-20 h-14 object-cover rounded-lg"
                />
              )}
              <div>
                <p className="text-sm font-medium text-gray-900 dark:text-white">
                  {car.year} {capitalizeCarMake(car.make)} {normalizeModelName(car.model, car.make)}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {car.carType} • {car.seats} seats
                </p>
                <div className="flex items-center mt-1 space-x-3">
                  {car.rating && car.rating > 0 ? (
                    <div className="flex items-center">
                      <div className="flex text-amber-400 text-xs">
                        {'★★★★★'.split('').map((star, i) => (
                          <span key={i} className={i < Math.floor(car.rating!) ? '' : 'opacity-30'}>
                            {star}
                          </span>
                        ))}
                      </div>
                      <span className="ml-1 text-xs text-gray-500">
                        {car.rating.toFixed(1)}
                      </span>
                    </div>
                  ) : (
                    <span className="px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-400 text-xs rounded-full font-medium">
                      New
                    </span>
                  )}
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
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        
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
        
        {/* ⚠️ ACCOUNT WARNING/RESTRICTION BANNER - Only show for account-level restrictions (has reason) */}
        {/* Field validation errors show inline under each field - no banner needed for those */}
        {!eligibility.allowed && eligibility.reason && car.isActive && (
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
        
        {/* P2P Important Notice */}
        <div className="bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg p-4 mb-4 shadow-sm">
          <div className="flex items-start space-x-3">
            <IoInformationCircleOutline className="w-5 h-5 text-amber-600 mt-0.5 flex-shrink-0" />
            <div className="text-sm">
              <p className="font-medium text-amber-900 dark:text-amber-100 mb-2">Important Booking Information</p>
              <ul className="space-y-1 text-xs text-amber-800 dark:text-amber-200">
                <li>• <strong>Book without an account:</strong> Complete your booking as a guest - we&apos;ll create your account automatically using your driver&apos;s license info{' '}
                  <a href="/help/guest-account" className="text-amber-700 dark:text-amber-300 underline hover:no-underline">Learn more</a>
                </li>
                <li>• <strong>Quick verification:</strong> Upload your driver&apos;s license for instant verification - no redirects or lengthy forms</li>
                <li>• <strong>No charges until approved:</strong> Your card is securely saved but won&apos;t be charged until the host approves your booking</li>
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
                  {(() => {
                    // Handle both insuranceType (legacy) and insuranceTier (current) field names
                    const tier = (savedBookingDetails.insuranceType || savedBookingDetails.insuranceTier || '').toUpperCase()
                    switch(tier) {
                      case 'LUXURY': return 'Luxury Protection'
                      case 'PREMIUM': return 'Premium Protection'
                      case 'BASIC':
                      case 'STANDARD': return 'Standard Protection'
                      case 'MINIMUM': return 'Minimum Protection'
                      default: return 'Basic Protection'
                    }
                  })()}
                  {' '}- ${savedBookingDetails.pricing.insurancePrice / numberOfDays}/day
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
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center flex-wrap gap-2">
            <IoPersonOutline className="w-5 h-5" />
            <span>Primary Driver Information</span>
            <span className="text-xs font-normal text-gray-500 dark:text-gray-400">(Account Holder)</span>
            {userProfile?.documentsVerified && (
              <span className="text-xs text-green-600 dark:text-green-400">
                - Auto-filled
              </span>
            )}
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                First Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={driverFirstName}
                  onChange={(e) => handleFirstNameChange(e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white ${
                    driverFirstName && firstNameValidation.isValid
                      ? 'border-green-500 dark:border-green-500'
                      : driverFirstName && firstNameValidation.error
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="John"
                  required
                />
                {driverFirstName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {firstNameValidation.isValid ? (
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                    ) : firstNameValidation.error ? (
                      <IoCloseCircle className="w-5 h-5 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {driverFirstName && firstNameValidation.error && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <IoCloseCircleOutline className="w-3.5 h-3.5" />
                  {firstNameValidation.error}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Last Name <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={driverLastName}
                  onChange={(e) => handleLastNameChange(e.target.value)}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white ${
                    driverLastName && lastNameValidation.isValid
                      ? 'border-green-500 dark:border-green-500'
                      : driverLastName && lastNameValidation.error
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="Doe"
                  required
                />
                {driverLastName && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {lastNameValidation.isValid ? (
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                    ) : lastNameValidation.error ? (
                      <IoCloseCircle className="w-5 h-5 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {driverLastName && lastNameValidation.error && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <IoCloseCircleOutline className="w-3.5 h-3.5" />
                  {lastNameValidation.error}
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <DatePicker
                  selected={driverAge}
                  onChange={(date) => handleDobChange(date)}
                  showYearDropdown
                  showMonthDropdown
                  scrollableYearDropdown
                  yearDropdownItemNumber={100}
                  dateFormat="MM/dd/yyyy"
                  placeholderText="Select date of birth"
                  className={`w-full px-2 py-2 pr-10 bg-white dark:bg-gray-700 border rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer ${
                    driverAge && ageValidation.isValid
                      ? 'border-green-500 dark:border-green-500'
                      : driverAge && ageValidation.error
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-200 dark:border-gray-600'
                  }`}
                  wrapperClassName="w-full"
                  calendarClassName="!rounded-xl !border-0 !shadow-xl"
                  popperClassName="!z-50"
                  required
                />
                {/* Validation icon */}
                {driverAge && ageValidation.isValid && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
                {driverAge && ageValidation.error && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none">
                    <IoCloseCircle className="w-5 h-5 text-red-500" />
                  </div>
                )}
              </div>
              {driverAge && ageValidation.error ? (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <IoCloseCircleOutline className="w-3.5 h-3.5" />
                  {ageValidation.error}
                </p>
              ) : driverAge && ageValidation.isValid && ageValidation.age ? (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <IoCheckmarkCircleOutline className="w-3.5 h-3.5" />
                  You are {ageValidation.age} years old
                </p>
              ) : (
                <p className="text-xs text-gray-500 mt-1">Must be {getMinimumAgeForVehicle()}+ to rent this vehicle</p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Driver&apos;s License # <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={driverLicense}
                  onChange={(e) => setDriverLicense(e.target.value.toUpperCase())}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white ${
                    driverLicense && driverLicense.length >= 3
                      ? 'border-green-500 dark:border-green-500'
                      : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="D12345678"
                  required
                />
                {/* Validation icon */}
                {driverLicense && driverLicense.length >= 3 && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                  </div>
                )}
              </div>
              {driverLicense && driverLicense.length >= 3 && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <IoCheckmarkOutline className="w-3.5 h-3.5" />
                  Valid license number
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Phone Number <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="tel"
                  value={driverPhone}
                  onChange={(e) => handleDriverPhoneChange(e.target.value)}
                  disabled={!!userProfile?.phone}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 ${
                    driverPhone && phoneValidation.isValid
                      ? 'border-green-500 dark:border-green-500'
                      : driverPhone && phoneValidation.error
                        ? 'border-red-500 dark:border-red-500'
                        : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="(602)-555-0100"
                  required
                />
                {/* Validation icon */}
                {driverPhone && !userProfile?.phone && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {phoneValidation.isValid ? (
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                    ) : phoneValidation.error ? (
                      <IoCloseCircle className="w-5 h-5 text-red-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {/* Phone validation feedback */}
              {driverPhone && phoneValidation.error && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <IoCloseCircleOutline className="w-3.5 h-3.5" />
                  {phoneValidation.error}
                </p>
              )}
              {driverPhone && phoneValidation.isValid && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <IoCheckmarkOutline className="w-3.5 h-3.5" />
                  Valid phone number
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Email Address <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <input
                  type="email"
                  value={driverEmail}
                  onChange={(e) => handleDriverEmailChange(e.target.value)}
                  disabled={!!userProfile?.email}
                  className={`w-full px-3 py-2 pr-10 border rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 dark:bg-gray-700 dark:text-white disabled:bg-gray-100 dark:disabled:bg-gray-600 ${
                    driverEmail && emailValidation.isValid
                      ? 'border-green-500 dark:border-green-500'
                      : driverEmail && (emailValidation.error || emailValidation.suggestion)
                        ? 'border-orange-500 dark:border-orange-500'
                        : 'border-gray-300 dark:border-gray-600'
                  }`}
                  placeholder="john@example.com"
                  required
                />
                {/* Validation icon */}
                {driverEmail && !userProfile?.email && (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2">
                    {emailValidation.isValid ? (
                      <IoCheckmarkCircle className="w-5 h-5 text-green-500" />
                    ) : emailValidation.error || emailValidation.suggestion ? (
                      <IoWarningOutline className="w-5 h-5 text-orange-500" />
                    ) : null}
                  </div>
                )}
              </div>
              {/* Email validation feedback */}
              {driverEmail && emailValidation.error && (
                <p className="text-xs text-red-500 mt-1 flex items-center gap-1">
                  <IoCloseCircleOutline className="w-3.5 h-3.5" />
                  {emailValidation.error}
                </p>
              )}
              {driverEmail && emailValidation.suggestion && (
                <div className="flex items-center gap-2 mt-1">
                  <p className="text-xs text-orange-600 dark:text-orange-400">
                    {emailValidation.suggestion}
                  </p>
                  <button
                    type="button"
                    onClick={acceptEmailSuggestion}
                    className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-500 underline font-medium"
                  >
                    Yes, fix it
                  </button>
                </div>
              )}
              {driverEmail && emailValidation.isValid && (
                <p className="text-xs text-green-600 dark:text-green-400 mt-1 flex items-center gap-1">
                  <IoCheckmarkOutline className="w-3.5 h-3.5" />
                  Valid email address
                </p>
              )}
            </div>
          </div>

          {/* Add Second Driver Section */}
          <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
            {!showSecondDriver ? (
              <>
                <button
                  type="button"
                  className="flex items-center gap-2 text-sm font-medium text-amber-600 hover:text-amber-700 dark:text-amber-500 dark:hover:text-amber-400 transition-colors"
                  onClick={() => setShowSecondDriver(true)}
                >
                  <span className="w-5 h-5 rounded-full border-2 border-current flex items-center justify-center text-xs font-bold">+</span>
                  Add Second Driver
                </button>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  Additional drivers must be 21+ with valid license. $10/day fee applies.
                </p>
              </>
            ) : (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900 dark:text-white flex items-center gap-2">
                    <IoPersonOutline className="w-4 h-4" />
                    Second Driver Information
                    <span className="text-xs font-normal text-amber-600 dark:text-amber-400">+$10/day</span>
                  </h3>
                  <button
                    type="button"
                    onClick={() => {
                      setShowSecondDriver(false)
                      setSecondDriverFirstName('')
                      setSecondDriverLastName('')
                      setSecondDriverAge(null)
                      setSecondDriverLicense('')
                    }}
                    className="text-xs text-red-600 hover:text-red-700 dark:text-red-400"
                  >
                    Remove
                  </button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={secondDriverFirstName}
                      onChange={(e) => setSecondDriverFirstName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white"
                      placeholder="Jane"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Last Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={secondDriverLastName}
                      onChange={(e) => setSecondDriverLastName(e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white"
                      placeholder="Doe"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Date of Birth <span className="text-red-500">*</span>
                    </label>
                    <DatePicker
                      selected={secondDriverAge}
                      onChange={(date) => setSecondDriverAge(date)}
                      showYearDropdown
                      showMonthDropdown
                      scrollableYearDropdown
                      yearDropdownItemNumber={100}
                      dateFormat="MM/dd/yyyy"
                      placeholderText="Select date of birth"
                      className="w-full px-2 py-2 bg-white dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg text-sm text-gray-900 dark:text-white focus:ring-1 focus:ring-amber-500 focus:border-amber-500 cursor-pointer"
                      wrapperClassName="w-full"
                      calendarClassName="!rounded-xl !border-0 !shadow-xl"
                      popperClassName="!z-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">Must be 21 or older</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                      Driver&apos;s License # <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={secondDriverLicense}
                      onChange={(e) => setSecondDriverLicense(e.target.value.toUpperCase())}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-sm focus:ring-2 focus:ring-amber-500 focus:border-amber-500 bg-white dark:bg-gray-700 dark:text-white"
                      placeholder="D12345678"
                    />
                  </div>
                </div>

                <p className="text-xs text-gray-500 dark:text-gray-400">
                  Second driver will need to present their license at pickup for verification.
                </p>
              </div>
            )}
          </div>
        </div>
        
        {/* Identity Verification Section */}
        <div ref={documentsRef} className="bg-white dark:bg-gray-800 rounded-lg p-6 mb-4 shadow-sm border border-gray-300 dark:border-gray-600">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-4 flex items-center gap-2">
            <IoShieldCheckmarkOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            Verify Your Identity
            {(userProfile?.documentsVerified || userProfile?.stripeIdentityStatus === 'verified' || aiVerificationResult?.passed) && (
              <span className="ml-2 text-sm text-green-600 dark:text-green-400 font-normal">
                ✓ Verified
              </span>
            )}
          </h2>

          {/* 🔐 NOT LOGGED IN - VERIFY FIRST, ACCOUNT LATER */}
          {sessionStatus === 'unauthenticated' ? (
            <div className="space-y-4">
              {/* Email already exists notification */}
              {existingAccountInfo?.exists && existingAccountInfo.verified && (
                <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <IoCheckmarkCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                        Already Verified!
                      </p>
                      <p className="text-sm text-green-800 dark:text-green-200 mb-3">
                        This email is already verified. Sign in to continue with your booking.
                      </p>
                      <button
                        onClick={() => router.push(`/auth/login?email=${encodeURIComponent(existingAccountInfo.email)}&returnTo=${encodeURIComponent(window.location.pathname)}`)}
                        className="px-4 py-2 bg-green-600 text-white text-sm rounded-lg hover:bg-green-700 transition-colors"
                      >
                        Sign In to Continue
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Host account exists notification */}
              {existingAccountInfo?.exists && existingAccountInfo.type === 'host' && !existingAccountInfo.verified && (
                <div className="bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800 rounded-lg p-4">
                  <div className="flex items-start space-x-3">
                    <IoWarningOutline className="w-6 h-6 text-orange-600 dark:text-orange-400 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="font-medium text-orange-900 dark:text-orange-100 mb-1">
                        Host Account Found
                      </p>
                      <p className="text-sm text-orange-800 dark:text-orange-200 mb-3">
                        A host account exists with this email. Sign in and switch to guest mode to book.
                      </p>
                      <button
                        onClick={() => router.push(`/auth/login?email=${encodeURIComponent(existingAccountInfo.email)}&returnTo=${encodeURIComponent(window.location.pathname)}`)}
                        className="px-4 py-2 bg-orange-600 text-white text-sm rounded-lg hover:bg-orange-700 transition-colors"
                      >
                        Sign In as Host
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Main verification card - Phase 14: AI-powered DL verification */}
              {!existingAccountInfo?.exists && (
                <>
                  {/* Show message if driver info not complete */}
                  {!driverInfoComplete ? (
                    <div className="flex items-center gap-3 p-4 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
                      <IoInformationCircleOutline className="w-6 h-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                      <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                        Please complete the Primary Driver Information above to verify your identity.
                      </p>
                    </div>
                  ) : (
                    <>
                      {/* Using email from Primary Driver Info */}
                      <div className={`mb-4 p-3 rounded-lg ${
                        emailValidation.isValid
                          ? 'bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800'
                          : emailValidation.suggestion || emailValidation.error
                            ? 'bg-orange-50 dark:bg-orange-900/20 border border-orange-200 dark:border-orange-800'
                            : 'bg-gray-50 dark:bg-gray-700/50'
                      }`}>
                        <div className="flex items-center justify-between">
                          <p className="text-xs text-gray-500 dark:text-gray-400">
                            Verifying as: <span className={`font-medium ${
                              emailValidation.isValid
                                ? 'text-green-700 dark:text-green-300'
                                : 'text-gray-900 dark:text-white'
                            }`}>{driverEmail}</span>
                          </p>
                          {emailValidation.isValid && (
                            <IoCheckmarkCircle className="w-4 h-4 text-green-500" />
                          )}
                          {emailValidation.suggestion && (
                            <IoWarningOutline className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                        {emailValidation.suggestion && (
                          <div className="mt-2 flex items-center gap-2">
                            <p className="text-xs text-orange-600 dark:text-orange-400">
                              {emailValidation.suggestion}
                            </p>
                            <button
                              type="button"
                              onClick={acceptEmailSuggestion}
                              className="text-xs text-amber-600 hover:text-amber-700 dark:text-amber-500 underline font-medium"
                            >
                              Fix it
                            </button>
                          </div>
                        )}
                      </div>

                      {/* Phase 14: AI-powered DL verification (~$0.02 instead of $1.50 Stripe) */}
                      <VisitorIdentityVerify
                        onVerificationComplete={(result) => {
                          setAiVerificationResult(result)
                          if (result.passed && result.data) {
                            console.log('[Booking] AI DL verification passed:', result.data)
                          }
                        }}
                        onPhotosUploaded={(frontUrl, backUrl) => {
                          setLicensePhotoUrl(frontUrl)
                          if (backUrl) setLicenseBackPhotoUrl(backUrl)
                        }}
                        driverName={`${driverFirstName} ${driverLastName}`.trim()}
                        driverEmail={driverEmail}
                        driverPhone={driverPhone}
                        carId={carId}
                        disabled={!emailValidation.isValid}
                      />
                    </>
                  )}

                  {/* Already have account link */}
                  <p className="text-xs text-center text-gray-500 dark:text-gray-400 mt-3">
                    Already verified?{' '}
                    <button
                      onClick={() => router.push(`/auth/login?returnTo=${encodeURIComponent(window.location.pathname)}`)}
                      className="text-blue-600 dark:text-blue-400 hover:underline"
                    >
                      Sign in
                    </button>
                  </p>
                </>
              )}
            </div>
          ) : /* ✅ VERIFIED USER - SKIP DOCUMENTS */
          userProfile?.documentsVerified ? (
            <div className="bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg p-4">
              <div className="flex items-start space-x-3">
                <IoCheckmarkCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0" />
                <div>
                  <p className="font-medium text-green-900 dark:text-green-100 mb-1">
                    Identity Verified
                  </p>
                  <p className="text-sm text-green-800 dark:text-green-200 mb-2">
                    Your identity was verified on {new Date(userProfile.documentVerifiedAt || '').toLocaleDateString()}. No need to verify again!
                  </p>
                  <ul className="text-xs text-green-700 dark:text-green-300 space-y-1">
                    <li className="flex items-center gap-1">
                      <IoCheckmarkOutline className="w-3.5 h-3.5" />
                      Driver's License - Verified
                    </li>
                    <li className="flex items-center gap-1">
                      <IoCheckmarkOutline className="w-3.5 h-3.5" />
                      Identity Photo - Verified
                    </li>
                    {userProfile.insuranceVerified && (
                      <li className="flex items-center gap-1">
                        <IoCheckmarkOutline className="w-3.5 h-3.5" />
                        Insurance Card - Verified
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          ) : (
            /* NON-VERIFIED USER - SHOW STRIPE IDENTITY + INSURANCE UPLOAD */
            <>
              {/* ========== STRIPE IDENTITY VERIFICATION ========== */}
              {(() => {
                const stripeStatus = userProfile?.stripeIdentityStatus
                const isStripeVerified = stripeStatus === 'verified'
                const isStripePending = stripeStatus === 'pending' || stripeStatus === 'requires_input'

                // Handle Stripe Identity verification
                const handleVerifyWithStripe = async () => {
                  setIsVerifyingIdentity(true)
                  setIdentityError(null)

                  try {
                    const response = await fetch('/api/identity/verify', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      credentials: 'include',
                      body: JSON.stringify({
                        returnUrl: `${window.location.origin}/rentals/${carId}/book?verified=true`
                      })
                    })

                    const data = await response.json()

                    if (!response.ok) {
                      throw new Error(data.error || 'Failed to start verification')
                    }

                    // Redirect to Stripe Identity verification
                    if (data.url) {
                      window.location.href = data.url
                    }
                  } catch (err) {
                    setIdentityError(err instanceof Error ? err.message : 'Failed to start verification')
                    setIsVerifyingIdentity(false)
                  }
                }

                return (
                  <div className={`p-4 mb-4 border-2 rounded-lg transition-all ${
                    isStripeVerified
                      ? 'border-green-500 bg-green-50 dark:bg-green-900/10'
                      : isStripePending
                        ? 'border-orange-300 bg-orange-50 dark:bg-orange-900/10'
                        : 'border-gray-200 dark:border-gray-600'
                  }`}>
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex items-start space-x-3 flex-1">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                          isStripeVerified
                            ? 'bg-green-500'
                            : isStripePending
                              ? 'bg-orange-500'
                              : 'bg-gray-100 dark:bg-gray-700'
                        }`}>
                          {isStripeVerified ? (
                            <IoCheckmarkOutline className="w-5 h-5 text-white" />
                          ) : isStripePending ? (
                            <IoWarningOutline className="w-5 h-5 text-white" />
                          ) : (
                            <IoShieldCheckmarkOutline className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            Identity Verification
                          </p>
                          {isStripeVerified ? (
                            <p className="text-xs text-green-600 dark:text-green-400 mt-0.5">
                              Verified via Stripe Identity
                            </p>
                          ) : isStripePending ? (
                            <>
                              <p className="text-xs text-orange-600 dark:text-orange-400 mt-0.5">
                                Verification incomplete - Please finish to continue
                              </p>
                              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                                You started verification but didn't complete it. Click Continue to finish.
                              </p>
                            </>
                          ) : (
                            <>
                              <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                                Required - Verify your driver's license and identity
                              </p>
                              <ul className="text-xs text-gray-500 dark:text-gray-400 mt-2 space-y-1">
                                <li className="flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-500 flex items-center justify-center text-[8px]">1</span>
                                  Photo of Driver's License (front & back)
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-500 flex items-center justify-center text-[8px]">2</span>
                                  Selfie to match your ID
                                </li>
                                <li className="flex items-center gap-1.5">
                                  <span className="w-4 h-4 rounded-full border border-gray-300 dark:border-gray-500 flex items-center justify-center text-[8px]">3</span>
                                  Instant verification via Stripe
                                </li>
                              </ul>
                            </>
                          )}

                          {identityError && (
                            <p className="text-xs text-red-600 dark:text-red-400 mt-2">
                              {identityError}
                            </p>
                          )}
                        </div>
                      </div>

                      {!isStripeVerified && (
                        <button
                          onClick={handleVerifyWithStripe}
                          disabled={isVerifyingIdentity}
                          className={`px-4 py-2 text-white text-sm rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2 flex-shrink-0 ${
                            isStripePending
                              ? 'bg-orange-600 hover:bg-orange-700'
                              : 'bg-black hover:bg-gray-800'
                          }`}
                        >
                          {isVerifyingIdentity ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <>
                              <IoShieldCheckmarkOutline className="w-4 h-4" />
                              <span>{isStripePending ? 'Continue' : 'Verify Now'}</span>
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })()}

              {/* ========== INSURANCE CARD (OPTIONAL) ========== */}
              <div className={`p-4 border-2 rounded-lg transition-all ${
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
                        <IoDocumentTextOutline className="w-5 h-5 text-gray-400" />
                      )}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        Insurance Card
                        <span className="text-xs font-normal text-gray-500 dark:text-gray-400 ml-1">(Optional)</span>
                      </p>
                      <p className="text-xs text-gray-600 dark:text-gray-400">
                        {insurancePhotoUrl ? 'Uploaded successfully' : 'Upload for 50% deposit discount'}
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

                {/* Deposit discount callout */}
                {!insuranceUploaded && (
                  <div className="mt-3 flex items-center gap-2 bg-blue-50 dark:bg-blue-900/20 px-3 py-2 rounded text-xs">
                    <IoSparklesOutline className="w-4 h-4 text-blue-600 dark:text-blue-400 flex-shrink-0" />
                    <span className="text-blue-700 dark:text-blue-300">
                      Upload your insurance card to reduce your security deposit by 50%
                    </span>
                  </div>
                )}
              </div>

              {/* Success message when identity verified */}
              {userProfile?.stripeIdentityStatus === 'verified' && (
                <div className="mt-4 p-3 bg-green-100 dark:bg-green-900/20 rounded-lg">
                  <p className="text-xs font-medium text-green-700 dark:text-green-300 text-center flex items-center justify-center gap-1">
                    <IoCheckmarkCircle className="w-4 h-4" />
                    Identity verified - You can now proceed to payment
                  </p>
                </div>
              )}
            </>
          )}
        </div>

        {/* Phase 14: Insurance Pill - Prompts users to upload insurance for deposit discount */}
        <InsurancePill
          isLoggedIn={sessionStatus === 'authenticated'}
          hasInsurance={!!userProfile?.insuranceVerified}
          insurancePhotoUrl={userProfile?.insuranceCardUrl}
        />

        {/* Payment Section */}
        <div
          ref={paymentRef}
          className="bg-white dark:bg-gray-800 rounded-lg p-6 mt-4 shadow-sm border border-gray-300 dark:border-gray-600"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <IoCardOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            Payment Information
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {isZeroPaymentBooking
              ? 'Your credits cover this booking - no payment required!'
              : savedPaymentMethods.length > 0
                ? 'Select a saved card or enter new payment details'
                : 'Enter your card details for payment and security deposit'
            }
          </p>

          {/* $0 Booking - Credits Applied */}
          {isZeroPaymentBooking && (
            <div className="mb-6 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="flex-shrink-0 w-10 h-10 bg-amber-100 dark:bg-amber-800 rounded-full flex items-center justify-center">
                    <IoCheckmarkCircle className="w-6 h-6 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div>
                    <p className="font-medium text-amber-800 dark:text-amber-200">Credits Applied</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      Your account balance covers this booking
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">$0.00</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Amount due</p>
                </div>
              </div>
            </div>
          )}

          {/* Saved Payment Methods - Amazon-style dropdown */}
          {!isZeroPaymentBooking && savedPaymentMethods.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                Payment Method
              </label>
              <div className="space-y-2">
                {savedPaymentMethods.map((method) => (
                  <label
                    key={method.id}
                    className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                      selectedPaymentMethod === method.id
                        ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                        : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                    }`}
                  >
                    <input
                      type="radio"
                      name="paymentMethod"
                      value={method.id}
                      checked={selectedPaymentMethod === method.id}
                      onChange={() => setSelectedPaymentMethod(method.id)}
                      className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                    />
                    <div className="flex items-center gap-2 flex-1">
                      {/* Card brand icon */}
                      <span className="text-gray-600 dark:text-gray-400">
                        {method.brand === 'visa' && '💳'}
                        {method.brand === 'mastercard' && '💳'}
                        {method.brand === 'amex' && '💳'}
                        {!['visa', 'mastercard', 'amex'].includes(method.brand) && '💳'}
                      </span>
                      <span className="text-sm text-gray-900 dark:text-white font-medium capitalize">
                        {method.brand} •••• {method.last4}
                      </span>
                      <span className="text-xs text-gray-500 dark:text-gray-400">
                        Expires {method.expMonth.toString().padStart(2, '0')}/{method.expYear.toString().slice(-2)}
                      </span>
                      {method.isDefault && (
                        <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                          Default
                        </span>
                      )}
                    </div>
                  </label>
                ))}

                {/* New card option */}
                <label
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
                    selectedPaymentMethod === 'new'
                      ? 'border-amber-500 bg-amber-50 dark:bg-amber-900/20'
                      : 'border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
                  }`}
                >
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="new"
                    checked={selectedPaymentMethod === 'new'}
                    onChange={() => setSelectedPaymentMethod('new')}
                    className="h-4 w-4 text-amber-500 focus:ring-amber-500"
                  />
                  <span className="text-sm text-gray-900 dark:text-white font-medium">
                    Use a new card
                  </span>
                </label>
              </div>
            </div>
          )}

          {/* Stripe Payment Element - Show only when "new card" is selected and not $0 booking */}
          {!isZeroPaymentBooking && (
          <div className={`mb-6 ${savedPaymentMethods.length > 0 && selectedPaymentMethod !== 'new' ? 'hidden' : ''}`}>
            {clientSecret ? (
              <Elements
                stripe={stripePromise}
                options={{
                  clientSecret,
                  appearance: {
                    theme: 'stripe',
                    variables: {
                      colorPrimary: '#f59e0b', // amber-500 to match ItWhip
                      colorBackground: '#ffffff',
                      colorText: '#1f2937',
                      borderRadius: '8px',
                      fontFamily: 'system-ui, -apple-system, sans-serif'
                    },
                    rules: {
                      '.Input': {
                        border: '1px solid #d1d5db',
                        boxShadow: 'none'
                      },
                      '.Input:focus': {
                        border: '2px solid #f59e0b',
                        boxShadow: 'none'
                      }
                    }
                  }
                }}
              >
                <PaymentFormWrapper
                  onReady={() => setIsPaymentElementReady(true)}
                  onComplete={(complete) => setIsPaymentElementComplete(complete)}
                  onError={(error) => setPaymentError(error)}
                  confirmPaymentRef={confirmPaymentRef}
                  billingDetails={{
                    name: `${driverFirstName} ${driverLastName}`.trim() || undefined,
                    email: driverEmail || guestEmail || userProfile?.email || undefined,
                    phone: driverPhone || guestPhone || undefined
                  }}
                />
              </Elements>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                <span className="ml-3 text-sm text-gray-500">Loading payment options...</span>
              </div>
            )}

            {/* Payment Error Display */}
            {paymentError && (
              <div className="mt-3 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                <p className="text-sm text-red-600 dark:text-red-400 flex items-center gap-2">
                  <IoWarningOutline className="w-4 h-4" />
                  {paymentError}
                </p>
              </div>
            )}

            {/* Secure Payment Badge */}
            <div className="flex items-center justify-end gap-1 mt-3">
              <span className="text-xs text-gray-500 flex items-center gap-1">
                <IoLockClosedOutline className="w-3 h-3" />
                Secure & Encrypted by Stripe
              </span>
            </div>
          </div>
          )}

          {/* Price Summary - Credits/Bonus/Deposit Wallet applied inline below */}
          <div className="border-t dark:border-gray-700 pt-6">
            {(() => {
              // Use shared pricing utility for consistent calculations with BookingWidget
              const carCity = (car as any)?.city || getCityFromAddress(car?.address || 'Phoenix, AZ')
              const pricing = calculateBookingPricing({
                dailyRate: savedBookingDetails.pricing.dailyRate,
                days: savedBookingDetails.pricing.days,
                insurancePrice: savedBookingDetails.pricing.insurancePrice,
                deliveryFee: savedBookingDetails.pricing.deliveryFee,
                enhancements: {
                  refuelService: savedBookingDetails.pricing.breakdown.refuelService,
                  additionalDriver: savedBookingDetails.pricing.breakdown.additionalDriver,
                  extraMiles: savedBookingDetails.pricing.breakdown.extraMiles,
                  vipConcierge: savedBookingDetails.pricing.breakdown.vipConcierge
                },
                city: carCity
              })

              // Calculate applied balances (credits, bonus, deposit wallet)
              const appliedBalances = calculateAppliedBalances(
                pricing,
                adjustedDeposit,
                guestBalances,
                0.25 // 25% max bonus
              )

              return (
                <div className="space-y-2 text-sm">
                  {/* Rental */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Rental ({numberOfDays} days)</span>
                    <span className="font-medium text-gray-900 dark:text-white">${formatPrice(pricing.basePrice)}</span>
                  </div>

                  {/* Insurance */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Insurance</span>
                    <span className="font-medium text-gray-900 dark:text-white">${formatPrice(pricing.insurancePrice)}</span>
                  </div>

                  {/* Delivery (conditional) */}
                  {pricing.deliveryFee > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Delivery</span>
                      <span className="font-medium text-gray-900 dark:text-white">${formatPrice(pricing.deliveryFee)}</span>
                    </div>
                  )}

                  {/* Enhancements (conditional) */}
                  {pricing.enhancementsTotal > 0 && (
                    <div className="flex justify-between">
                      <span className="text-gray-600 dark:text-gray-400">Enhancements</span>
                      <span className="font-medium text-gray-900 dark:text-white">${formatPrice(pricing.enhancementsTotal)}</span>
                    </div>
                  )}

                  {/* Service fee */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Service Fee</span>
                    <span className="font-medium text-gray-900 dark:text-white">${formatPrice(pricing.serviceFee)}</span>
                  </div>

                  {/* Taxes with dynamic percentage */}
                  <div className="flex justify-between">
                    <span className="font-semibold text-gray-900 dark:text-white">Taxes ({pricing.taxRateDisplay})</span>
                    <span className="font-medium text-gray-900 dark:text-white">${formatPrice(pricing.taxes)}</span>
                  </div>

                  {/* ✅ Applied Credits (if any) */}
                  {appliedBalances.creditsApplied > 0 && (
                    <div className="flex justify-between text-purple-600 dark:text-purple-400">
                      <span className="font-medium">Credits Applied</span>
                      <span className="font-medium">-${formatPrice(appliedBalances.creditsApplied)}</span>
                    </div>
                  )}

                  {/* ✅ Applied Bonus (if any) */}
                  {appliedBalances.bonusApplied > 0 && (
                    <div className="flex justify-between text-amber-600 dark:text-amber-400">
                      <span className="font-medium">Bonus Applied (max 25%)</span>
                      <span className="font-medium">-${formatPrice(appliedBalances.bonusApplied)}</span>
                    </div>
                  )}

                  {/* Totals Section */}
                  <div className="pt-4 mt-4 border-t dark:border-gray-700">
                    {/* Trip Total - strikethrough if savings applied */}
                    {appliedBalances.totalSavings > 0 ? (
                      <>
                        <div className="flex justify-between items-baseline">
                          <span className="text-gray-500 dark:text-gray-400">Original Total</span>
                          <span className="text-gray-500 dark:text-gray-400 line-through">${formatPrice(pricing.total)}</span>
                        </div>
                        <div className="flex justify-between items-baseline mt-1">
                          <span className="font-bold text-gray-900 dark:text-white">Amount to Pay</span>
                          <span className="text-lg font-bold text-green-600 dark:text-green-400">${formatPrice(appliedBalances.amountToPay)}</span>
                        </div>
                        <div className="flex justify-end mt-1">
                          <span className="text-xs font-medium text-green-600 dark:text-green-400 bg-green-100 dark:bg-green-900/30 px-2 py-0.5 rounded-full">
                            You save ${formatPrice(appliedBalances.totalSavings)}!
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="flex justify-between items-baseline">
                        <span className="font-bold text-gray-900 dark:text-white">Trip Total</span>
                        <span className="text-lg font-bold text-gray-900 dark:text-white">${formatPrice(pricing.total)}</span>
                      </div>
                    )}

                {/* Security Deposit - Show strikethrough when waived, normal red box when required */}
                <div className="flex justify-end mt-2 mb-3">
                  {adjustedDeposit > 0 ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-red-500 rounded-lg">
                      <span className="text-sm font-medium text-white">
                        + ${adjustedDeposit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} deposit
                      </span>
                      {userProfile?.insuranceVerified && (
                        <span className="text-xs text-green-200 font-medium">
                          50% off!
                        </span>
                      )}
                      {/* (Hold) with tooltip inline */}
                      <div className="relative inline-flex items-center gap-0.5">
                        <span className="text-xs text-white/80 font-medium">(Hold)</span>
                        <button
                          type="button"
                          onMouseEnter={() => setShowDepositTooltip(true)}
                          onMouseLeave={() => setShowDepositTooltip(false)}
                          onClick={() => setShowDepositTooltip(!showDepositTooltip)}
                          className="text-white/70 hover:text-white -mt-0.5"
                          aria-label="Learn about security deposit"
                        >
                          <IoHelpCircleOutline className="w-3.5 h-3.5" />
                        </button>

                        {showDepositTooltip && (
                          <div className="absolute z-50 right-0 bottom-full mb-1 whitespace-nowrap px-2 py-1 bg-white dark:bg-gray-800 rounded shadow-lg border border-gray-200 dark:border-gray-600">
                            <p className="text-[11px] text-gray-600 dark:text-gray-400 leading-relaxed">Temporary hold, not a charge.<br/>Released 3-5 days after trip.</p>
                            <div className="absolute right-2 top-full w-0 h-0 border-l-[4px] border-r-[4px] border-t-[4px] border-transparent border-t-gray-200 dark:border-t-gray-600"></div>
                          </div>
                        )}
                      </div>
                    </div>
                  ) : rateBasedDeposit > 0 ? (
                    <div className="inline-flex items-center gap-2 px-3 py-1.5 bg-green-500/10 border border-green-500/30 rounded-lg">
                      <span className="text-sm font-medium line-through text-gray-400 dark:text-gray-500">
                        ${rateBasedDeposit.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                      <span className="text-sm font-semibold text-green-600 dark:text-green-400">
                        Deposit waived
                      </span>
                    </div>
                  ) : null}
                </div>

                    {/* Grand Total (Trip + Deposit) - NO arrow for this row */}
                    {/* Use amountToPay (after credits) + deposit for the actual total due */}
                    <div className="flex justify-between items-baseline pt-3 border-t dark:border-gray-700">
                      <span className="text-base font-semibold text-gray-900 dark:text-white">Total Due Today</span>
                      <div className="text-right">
                        <span className="text-2xl font-bold text-gray-900 dark:text-white">
                          ${formatPrice(appliedBalances.amountToPay + adjustedDeposit)}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })()}
          </div>

          {/* Terms and Conditions Agreement */}
          <div className="mt-6 p-3 bg-gray-100 dark:bg-gray-700 border border-gray-200 dark:border-gray-600 rounded-lg">
            <label className="flex items-start space-x-2 cursor-pointer">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => setAgreedToTerms(e.target.checked)}
                className="mt-0.5 w-4 h-4 text-amber-600 border-gray-300 rounded focus:ring-amber-500"
              />
              <div className="text-xs text-gray-600 dark:text-gray-400 leading-relaxed">
                I agree to the{' '}
                <button
                  type="button"
                  onClick={(e) => {
                    e.preventDefault()
                    setShowRentalAgreement(true)
                  }}
                  className="text-amber-600 hover:text-amber-700 underline font-medium text-xs"
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
                  className="text-amber-600 hover:text-amber-700 underline font-medium text-xs"
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
                  className="text-amber-600 hover:text-amber-700 underline font-medium text-xs"
                >
                  Trust & Safety
                </button>
                {' '}policies.
              </div>
            </label>
          </div>

        </div>
      </div>

      {/* Sticky Floating Checkout Bar - Mobile Optimized */}
      <div className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700 shadow-2xl z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3">
          <div className="flex items-center justify-between gap-3">
            {/* Pricing Info - Compact on mobile */}
            {(() => {
              // Use shared pricing utility for consistent calculations with BookingWidget
              const carCity = (car as any)?.city || getCityFromAddress(car?.address || 'Phoenix, AZ')
              const pricing = calculateBookingPricing({
                dailyRate: savedBookingDetails.pricing.dailyRate,
                days: savedBookingDetails.pricing.days,
                insurancePrice: savedBookingDetails.pricing.insurancePrice,
                deliveryFee: savedBookingDetails.pricing.deliveryFee,
                enhancements: {
                  refuelService: savedBookingDetails.pricing.breakdown.refuelService,
                  additionalDriver: savedBookingDetails.pricing.breakdown.additionalDriver,
                  extraMiles: savedBookingDetails.pricing.breakdown.extraMiles,
                  vipConcierge: savedBookingDetails.pricing.breakdown.vipConcierge
                },
                city: carCity
              })
              // Calculate applied balances to account for credits/bonus
              const stickyAppliedBalances = calculateAppliedBalances(
                pricing,
                adjustedDeposit,
                guestBalances,
                0.25 // 25% max bonus
              )
              // Use amountToPay (after credits) + deposit for the actual total
              const grandTotal = stickyAppliedBalances.amountToPay + adjustedDeposit

              return (
                <div className="min-w-0 flex-1">
                  <div className="flex items-baseline gap-1.5 sm:gap-2">
                    <span className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
                      ${formatPrice(grandTotal)}
                    </span>
                    <span className="text-xs sm:text-sm text-gray-500 dark:text-gray-400">total</span>
                  </div>
                  {/* Show deposit info - strikethrough when waived */}
                  {adjustedDeposit > 0 ? (
                    <>
                      <p className="text-[10px] sm:text-xs text-gray-500 dark:text-gray-400">
                        <span className="hidden sm:inline">${formatPrice(stickyAppliedBalances.amountToPay)} + </span>
                        <span className="text-red-600 dark:text-red-400">${formatPrice(adjustedDeposit)} deposit</span>
                        <span className="text-gray-400 dark:text-gray-500 ml-1">(refundable)</span>
                      </p>
                      {userProfile?.insuranceVerified && (
                        <p className="text-[10px] sm:text-xs text-green-600 dark:text-green-400 font-medium">
                          50% deposit discount applied
                        </p>
                      )}
                    </>
                  ) : rateBasedDeposit > 0 ? (
                    <p className="text-[10px] sm:text-xs flex items-center gap-1">
                      <span className="hidden sm:inline text-gray-500 dark:text-gray-400">${formatPrice(stickyAppliedBalances.amountToPay)} + </span>
                      <span className="line-through text-gray-400 dark:text-gray-500">${formatPrice(rateBasedDeposit)}</span>
                      <span className="text-green-600 dark:text-green-400 font-medium">Deposit waived</span>
                    </p>
                  ) : null}
                </div>
              )
            })()}

            {/* Book Button */}
            <button
              onClick={handleCheckoutClick}
              disabled={isProcessing || isUploading || !eligibility.allowed || !isIdentityVerified}
              className={`flex-shrink-0 px-4 sm:px-6 py-2.5 sm:py-3 text-sm sm:text-base font-semibold shadow-lg rounded-lg transition-all ${
                !isProcessing && !isUploading && eligibility.allowed && isIdentityVerified
                  ? 'bg-black text-white hover:bg-gray-800 active:scale-[0.98]'
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
            >
              {isProcessing ? (
                <span className="flex items-center gap-2">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  <span className="hidden sm:inline">Processing...</span>
                </span>
              ) : !isIdentityVerified ? (
                'Verify Identity to Book'
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
        bookingDetails={savedBookingDetails as any}
        guestDetails={{
          name: `${guestName} ${guestLastName}`.trim() || session?.user?.name || `${driverFirstName} ${driverLastName}`.trim() || '',
          email: guestEmail || session?.user?.email || driverEmail || '',
          bookingCode: '',
          verificationStatus: 'PENDING'
        }}
        isDraft={true}
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