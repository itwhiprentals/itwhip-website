// app/(guest)/rentals/[carId]/book/BookingPageClient.tsx
'use client'

import React, { useState, useEffect, useRef } from 'react'
import { useGoogleReCaptcha } from 'react-google-recaptcha-v3'
import { useRouter } from 'next/navigation'
import { useTranslations } from 'next-intl'
import {
  IoCheckmarkCircle,
  IoCardOutline,
  IoLockClosedOutline,
  IoWarningOutline,
  IoCloseCircle,
  IoCloseCircleOutline
} from 'react-icons/io5'
import { format } from 'date-fns'

// Import shared booking pricing utility (ensures consistent calculations)
import {
  calculateBookingPricing,
  formatPrice,
  calculateAppliedBalances,
  getActualDeposit,
  getCarClassAndDefaultDeposit,
  type GuestBalances,
  type AppliedBalancesResult
} from '@/app/[locale]/(guest)/rentals/lib/booking-pricing'
import { getCityFromAddress } from '@/app/[locale]/(guest)/rentals/lib/arizona-taxes'

// Import Header component
import Header from '@/app/components/Header'
import { capitalizeCarMake, normalizeModelName } from '@/app/lib/utils/formatters'

// Modal components are now in BookingModals

// Import Phase 14 booking UI components
import { VisitorIdentityVerify, GuestIdentityVerify, InsurancePill, BookingSuccessModal, HeaderBar, CarInfoCard, BookingModals, AlertBanners, HostGuardModal, BookingDetailsCards, SecondDriverForm, PrimaryDriverForm, PriceSummary, PricingFooter, IdentityVerificationSection } from './components'
import type { AppliedPromo } from './components/PromoCodeInput'

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
  const { executeRecaptcha } = useGoogleReCaptcha()
  const t = useTranslations('BookingPage')

  // ✅ FIXED: Use direct state instead of useCustomSession hook
  const [session, setSession] = useState<{ user: { id: string; email: string; name: string; role: string } } | null>(null)
  const [sessionStatus, setSessionStatus] = useState<'loading' | 'authenticated' | 'unauthenticated'>('loading')
  
  // Core states
  const [car, setCar] = useState<RentalCarWithDetails | null>(null)
  const [savedBookingDetails, setSavedBookingDetails] = useState<SavedBookingDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isProcessing, setIsProcessing] = useState(false)
  const [bookingSuccess, setBookingSuccess] = useState<{ bookingCode: string; accessToken?: string; status?: string; id?: string } | null>(null)
  const [bookingError, setBookingError] = useState<string | null>(null)

  // User profile states
  const [userProfile, setUserProfile] = useState<ReviewerProfile | null>(null)
  const [moderationStatus, setModerationStatus] = useState<ModerationStatus | null>(null)
  const [profileLoading, setProfileLoading] = useState(true)
  
  // Modal states
  const [showRentalAgreement, setShowRentalAgreement] = useState(false)
  const [showInsuranceModal, setShowInsuranceModal] = useState(false)
  const [showTrustSafetyModal, setShowTrustSafetyModal] = useState(false)
  const [showManualApprovalModal, setShowManualApprovalModal] = useState<string | null>(null)
  const manualApprovalAccepted = useRef(false)
  
  // Track page load time for fraud detection
  useEffect(() => {
    (window as any).pageLoadTime = Date.now();
    (window as any).__interactionCount = 0;
    (window as any).__copyPasteUsed = false
    const countInteraction = () => { (window as any).__interactionCount++ }
    const detectPaste = () => { (window as any).__copyPasteUsed = true }
    document.addEventListener('click', countInteraction)
    document.addEventListener('keydown', countInteraction)
    document.addEventListener('paste', detectPaste)
    return () => {
      document.removeEventListener('click', countInteraction)
      document.removeEventListener('keydown', countInteraction)
      document.removeEventListener('paste', detectPaste)
    }
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

      // Validate PI matches the one we created (prevent URL manipulation)
      const expectedPi = sessionStorage.getItem('_expected_pi')
      if (expectedPi && piId !== expectedPi) {
        console.error('[3DS Return] PI mismatch! Expected:', expectedPi, 'Got:', piId)
        setPaymentError('Payment verification failed. Please try again.')
      } else if (redirectStatus === 'succeeded' && piId) {
        setPaymentIntentId(piId)
        setPaymentAlreadyConfirmed(true)
        setBookingError(null)
        setPaymentError('Your payment was confirmed. Please click "Book Now" to complete your reservation.')
        sessionStorage.removeItem('_expected_pi')
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
  const [appliedPromo, setAppliedPromo] = useState<AppliedPromo | null>(null)

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

            // Get the linked guest email for display (already available from dualRole response)
            const linkedEmail = dualRole.linkedUserId && dualRole.guestProfileIsLinked ? 'linked' : undefined

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
                  error: firstTrimmed.length < 3 ? t('firstNameMinLength') : t('firstNameLettersOnly')
                })
              }

              if (lastTrimmed.length >= 3 && validNamePattern.test(lastTrimmed)) {
                setLastNameValidation({ isValid: true, error: null })
              } else if (lastTrimmed.length > 0) {
                setLastNameValidation({
                  isValid: false,
                  error: lastTrimmed.length < 3 ? t('lastNameMinLength') : t('lastNameLettersOnly')
                })
              }

              // Also validate cardholder names (same rules)
              if (firstTrimmed.length >= 3 && validNamePattern.test(firstTrimmed)) {
                setCardholderFirstValidation({ isValid: true, error: null })
              } else if (firstTrimmed.length > 0) {
                setCardholderFirstValidation({
                  isValid: false,
                  error: firstTrimmed.length < 3 ? t('cardholderFirstMinLength') : t('cardholderFirstLettersOnly')
                })
              }

              if (lastTrimmed.length >= 3 && validNamePattern.test(lastTrimmed)) {
                setCardholderLastValidation({ isValid: true, error: null })
              } else if (lastTrimmed.length > 0) {
                setCardholderLastValidation({
                  isValid: false,
                  error: lastTrimmed.length < 3 ? t('cardholderLastMinLength') : t('cardholderLastLettersOnly')
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
    // manualPending = selfie submitted for review, treat as provisionally verified
    const userIsVerified = userProfile?.documentsVerified || userProfile?.stripeIdentityStatus === 'verified' || aiVerificationResult?.passed || aiVerificationResult?.manualPending
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
    
    // Check luxury restrictions (Luxury, Exotic, Convertible car types)
    const carTypeUpper = (car?.carType || '').toUpperCase()
    if (['LUXURY', 'EXOTIC', 'CONVERTIBLE'].includes(carTypeUpper) && !moderationStatus.restrictions.canBookLuxury) {
      return {
        allowed: false,
        reason: 'You currently cannot book luxury vehicles (Luxury, Exotic, or Convertible). Clear your warning by reviewing the Community Guidelines.'
      }
    }

    // Check premium restrictions (Exotic car types only)
    if (carTypeUpper === 'EXOTIC' && !moderationStatus.restrictions.canBookPremium) {
      return {
        allowed: false,
        reason: 'You currently cannot book exotic/premium vehicles. Clear your warning by reviewing the Community Guidelines.'
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
  // manualPending = selfie submitted for review, treat as provisionally verified
  const isIdentityVerified = userProfile?.documentsVerified || userProfile?.stripeIdentityStatus === 'verified' || aiVerificationResult?.passed || aiVerificationResult?.manualPending
  
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

    // Apply promo discount to pricing total
    const promoAmount = appliedPromo
      ? appliedPromo.discountType === 'percentage'
        ? Math.round(savedBookingDetails.pricing.dailyRate * savedBookingDetails.pricing.days * appliedPromo.discountValue / 100 * 100) / 100
        : appliedPromo.discountValue
      : 0
    const pricingForBalances = promoAmount > 0
      ? { ...pricing, total: Math.round((pricing.total - promoAmount) * 100) / 100 }
      : pricing

    // Apply credits and bonus
    const appliedBalances = calculateAppliedBalances(
      pricingForBalances,
      deposit,
      guestBalances,
      0.25
    )

    // Grand total = rental amount after credits + deposit from card
    const grandTotal = appliedBalances.amountToPay + appliedBalances.depositFromCard

    // If grand total is < $0.50, it's a $0 booking
    return grandTotal >= 0 && grandTotal < 0.50
  }, [savedBookingDetails, balancesLoaded, car, guestBalances, userProfile?.insuranceVerified, appliedPromo])

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
        // No booking details in session — redirect back to car page
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

        // Check if car is still active/bookable before proceeding
        if (data.isActive === false) {
          setBookingError(t('vehicleNoLongerAvailable'))
          setIsLoading(false)
          return
        }
        if (data.hostStatus && data.hostStatus !== 'APPROVED') {
          setBookingError(t('vehicleTemporarilyUnavailable'))
          setIsLoading(false)
          return
        }

        setCar(data)

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

      // Identity guard: don't create PI until identity is verified
      // (covers both authenticated users and unauthenticated visitors with manualPending/AI-passed)
      if (!isIdentityVerified) return

      // Availability gate: fresh server-side check before creating PI
      try {
        const availRes = await fetch(
          `/api/rentals/availability?carId=${carId}&startDate=${savedBookingDetails.startDate}&endDate=${savedBookingDetails.endDate}`
        )
        const availData = await availRes.json()
        if (!availData.available) {
          setBookingError(t('datesNoLongerAvailable'))
          return
        }
      } catch {
        setBookingError(t('unableToVerifyDates'))
        return
      }

      // Calculate the ACTUAL amount to charge (after credits/bonus + deposit + promo)
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

      // Apply promo discount to pricing total (service fee stays on original amount)
      const promoAmount = appliedPromo
        ? appliedPromo.discountType === 'percentage'
          ? Math.round(savedBookingDetails.pricing.dailyRate * savedBookingDetails.pricing.days * appliedPromo.discountValue / 100 * 100) / 100
          : appliedPromo.discountValue
        : 0
      const pricingForBalances = promoAmount > 0
        ? { ...pricing, total: Math.round((pricing.total - promoAmount) * 100) / 100 }
        : pricing

      // Calculate adjusted deposit (50% off if insurance verified)
      let deposit = savedBookingDetails.pricing.deposit || 0
      if (userProfile?.insuranceVerified) {
        deposit = deposit * 0.5
      }

      // Apply credits and bonus to get actual amount to pay
      const appliedBalances = calculateAppliedBalances(
        pricingForBalances,
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
            insurancePrice: savedBookingDetails.pricing.insurancePrice || 0,
            deliveryFee: savedBookingDetails.pricing.deliveryFee || 0,
            enhancements: {
              refuelService: savedBookingDetails.pricing.breakdown?.refuelService || 0,
              additionalDriver: savedBookingDetails.pricing.breakdown?.additionalDriver || 0,
              extraMiles: savedBookingDetails.pricing.breakdown?.extraMiles || 0,
              vipConcierge: savedBookingDetails.pricing.breakdown?.vipConcierge || 0
            },
            insuranceVerified: userProfile?.insuranceVerified || false,
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
          // Store PI ID for 3DS redirect validation
          if (data.paymentIntentId) {
            sessionStorage.setItem('_expected_pi', data.paymentIntentId)
          }
        } else {
          setPaymentError(t('paymentIntentNotReady'))
        }
      } catch (error) {
        setPaymentError(t('paymentIntentNotReady'))
      }
    }

    createPaymentIntent()
  }, [savedBookingDetails, carId, clientSecret, driverEmail, guestEmail, userProfile, balancesLoaded, guestBalances, car, isIdentityVerified, appliedPromo])

  // ============================================
  // FILE UPLOAD HANDLER
  // ============================================
  
  const handleFileUpload = async (file: File, type: 'license' | 'insurance' | 'selfie') => {
    if (!file) return

    if (file.size > 5 * 1024 * 1024) {
      setBookingError(t('fileSizeLimit'))
      return
    }

    if (!file.type.startsWith('image/')) {
      setBookingError(t('pleaseUploadImage'))
      return
    }

    setIsUploading(true)
    setBookingError(null)

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
        setBookingError(`Failed to upload ${type}: ${data.error || 'Unknown error'}`)
      }
    } catch (error) {
      console.error('Upload error:', error)
      setBookingError(`Error uploading ${type}. Please try again.`)
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
      return { isValid: false, error: t('pleaseEnterValidEmailAddress'), suggestion: null }
    }

    const [localPart, domain] = email.toLowerCase().split('@')

    // Check for minimum local part length
    if (localPart.length < 1) {
      return { isValid: false, error: t('emailAddressTooShortError'), suggestion: null }
    }

    // Check for typos in domain
    if (DOMAIN_TYPO_CORRECTIONS[domain]) {
      const correctedDomain = DOMAIN_TYPO_CORRECTIONS[domain]
      return {
        isValid: false,
        error: null,
        suggestion: t('didYouMean', { suggestion: `${localPart}@${correctedDomain}` })
      }
    }

    // Check for valid TLD
    const tld = domain.split('.').pop()
    if (!tld || tld.length < 2) {
      return { isValid: false, error: t('pleaseEnterValidEmailDomain'), suggestion: null }
    }

    // Check for disposable email patterns (optional - basic check)
    const disposablePatterns = ['tempmail', 'throwaway', '10minute', 'guerrilla', 'mailinator']
    if (disposablePatterns.some(pattern => domain.includes(pattern))) {
      return { isValid: false, error: t('pleaseUsePermanentEmailAddress'), suggestion: null }
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
      return { isValid: false, error: t('invalidPhoneNumberError') }
    }

    // Check for invalid area codes (can't start with 0 or 1)
    if (digits[0] === '0' || digits[0] === '1') {
      return { isValid: false, error: t('invalidAreaCodeError') }
    }

    // Check for obviously fake numbers
    const fakePatterns = ['0000000000', '1111111111', '1234567890', '5555555555']
    if (fakePatterns.includes(digits)) {
      return { isValid: false, error: t('pleaseEnterValidPhoneNumber') }
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
    // Override with translated error messages
    if (validation.error) {
      const trimmed = value.trim()
      setFirstNameValidation({
        isValid: false,
        error: trimmed.length < 3 ? t('firstNameMinLength') : t('firstNameLettersOnly')
      })
    } else {
      setFirstNameValidation(validation)
    }
  }

  // Handle last name change with validation
  const handleLastNameChange = (value: string) => {
    setDriverLastName(value)
    const validation = validateName(value, 'Last name')
    // Override with translated error messages
    if (validation.error) {
      const trimmed = value.trim()
      setLastNameValidation({
        isValid: false,
        error: trimmed.length < 3 ? t('lastNameMinLength') : t('lastNameLettersOnly')
      })
    } else {
      setLastNameValidation(validation)
    }
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
      const vehicleDesc = (carType === 'exotic' || carType === 'luxury') ? 'exotic/luxury' : 'standard'
      return {
        isValid: false,
        error: t('mustBeMinAgeToRent', { age: minAge, vehicleType: vehicleDesc, currentAge: age }),
        age
      }
    }

    if (age > 100) {
      return { isValid: false, error: t('pleaseEnterValidDob'), age: null }
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
        setBookingError(eligibility.reason || 'Booking restricted')
      }
      return
    }

    // Show warning if manual approval required
    if (eligibility.reason && eligibility.reason.includes('manual approval') && !manualApprovalAccepted.current) {
      setShowManualApprovalModal(eligibility.reason)
      return
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
      setBookingError(t('insuranceRequired'))
      return
    }

    setIsProcessing(true)
    setPaymentError(null)
    setBookingError(null)

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
          setBookingError(t('paymentIntentNotReady'))
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

        // Handle 3D Secure authentication if required
        if (confirmData.requiresAction && confirmData.clientSecret) {
          console.log('[Checkout] 3DS required — launching authentication challenge...')
          const stripeInstance = await stripePromise
          if (!stripeInstance) {
            throw new Error('Payment system not available. Please refresh and try again.')
          }

          const { error: actionError, paymentIntent } = await stripeInstance.handleNextAction({
            clientSecret: confirmData.clientSecret
          })

          if (actionError) {
            console.error('[Checkout] 3DS authentication failed:', actionError.message)
            throw new Error(actionError.message || 'Card verification failed. Please try again.')
          }

          if (paymentIntent?.status === 'succeeded') {
            confirmedPaymentIntentId = paymentIntent.id
            console.log('[Checkout] 3DS passed! PaymentIntent:', confirmedPaymentIntentId)
          } else if (paymentIntent?.status === 'requires_payment_method') {
            throw new Error('Card verification failed. Please try a different card.')
          } else {
            confirmedPaymentIntentId = paymentIntent?.id || confirmData.paymentIntentId
            console.log('[Checkout] 3DS completed with status:', paymentIntent?.status)
          }
        } else {
          confirmedPaymentIntentId = confirmData.paymentIntentId
        }

        console.log('[Checkout] Saved payment method confirmed! PaymentIntent:', confirmedPaymentIntentId)
      } else {
        // Using new card via Payment Element
        if (!confirmPaymentRef.current) {
          setBookingError(t('paymentSystemNotReady'))
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
          case 'minimum':
            return 'minimum'
          case 'standard':
          case 'basic':
            return 'basic'
          case 'premium':
            return 'premium'
          case 'luxury':
            return 'luxury'
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

        // Promo code (if applied)
        ...(appliedPromo && {
          promoCode: appliedPromo.code,
          promoDiscountAmount: promoDiscountAmount,
          promoSource: appliedPromo.source
        }),

        // Driver info
        driverInfo: {
          licenseNumber: driverLicense || '',
          licenseState: aiVerificationResult?.data?.state || 'AZ',
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
          deviceFingerprint: (() => {
            // Stable fingerprint from browser properties (persists within session)
            const stored = sessionStorage.getItem('_dfp')
            if (stored) return stored
            const raw = [navigator.userAgent, navigator.language, screen.width, screen.height,
              screen.colorDepth, new Date().getTimezoneOffset(), navigator.hardwareConcurrency || 0,
              navigator.maxTouchPoints || 0].join('|')
            let hash = 0
            for (let i = 0; i < raw.length; i++) { hash = ((hash << 5) - hash + raw.charCodeAt(i)) | 0 }
            const fp = `web_${Math.abs(hash).toString(36)}`
            sessionStorage.setItem('_dfp', fp)
            return fp
          })(),
          sessionData: {
            sessionId: `ses_${(window as any).pageLoadTime || Date.now()}`,
            startTime: (window as any).pageLoadTime || Date.now(),
            duration: Math.floor((Date.now() - ((window as any).pageLoadTime || Date.now())) / 1000),
            formCompletionTime: Math.floor((Date.now() - ((window as any).pageLoadTime || Date.now())) / 1000),
            totalInteractions: (window as any).__interactionCount || 0,
            copyPasteUsed: (window as any).__copyPasteUsed || false,
            userAgent: navigator.userAgent,
            screenResolution: `${window.screen.width}x${window.screen.height}`,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
          }
        }
      }
      
      // Get reCAPTCHA token for booking
      if (executeRecaptcha) {
        try { (bookingPayload as any).recaptchaToken = await executeRecaptcha('booking') } catch {}
      }

      // Call booking API (credentials: 'include' sends cookies for self-booking prevention)
      const response = await fetch('/api/rentals/book', {
        method: 'POST',
        credentials: 'include',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(bookingPayload)
      })
      
      const data = await response.json()
      console.log('Booking API response:', data)
      
      if (response.ok && data.booking) {
        sessionStorage.removeItem('rentalBookingDetails')
        setBookingError(null)
        setBookingSuccess({
          bookingCode: data.booking.bookingCode,
          accessToken: data.booking.accessToken,
          status: data.status || 'pending_review',
          id: data.booking.id,
        })
        // Auto-redirect after a short delay so guest can see confirmation
        setTimeout(() => {
          if (data.booking.id) {
            router.push(`/rentals/dashboard/bookings/${data.booking.id}?new=1`)
          } else {
            router.push('/rentals/dashboard/bookings')
          }
        }, 3000)
      } else {
        const errorMessage = data.error || data.message || t('bookingFailed')
        console.error('Booking error:', errorMessage)

        if (data.details) {
          console.error('Validation errors:', data.details)
          const fieldErrors = data.details.fieldErrors || {}
          const errorsList = Object.entries(fieldErrors)
            .map(([field, errors]: [string, any]) => `${field}: ${Array.isArray(errors) ? errors.join(', ') : errors}`)
            .join('; ')
          setBookingError(`${errorMessage} — ${errorsList}`)
        } else {
          setBookingError(errorMessage)
        }
      }
    } catch (error) {
      console.error('Booking submission error:', error)
      setBookingError(t('failedToSubmitBooking'))
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

  // Calculate promo discount dollar amount
  const promoDiscountAmount = appliedPromo
    ? appliedPromo.discountType === 'percentage'
      ? Math.round(savedBookingDetails.pricing.dailyRate * numberOfDays * appliedPromo.discountValue / 100 * 100) / 100
      : appliedPromo.discountValue
    : 0

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

      <HostGuardModal
        hostGuard={hostGuard}
        onBack={() => router.back()}
        onCreateGuestAccount={() => router.push('/auth/signup?roleHint=guest')}
        onGoToHostDashboard={() => router.push('/host/dashboard')}
        onSwitchToGuest={handleSwitchToGuest}
        onSignInDifferent={() => router.push('/auth/login?roleHint=guest&returnTo=' + encodeURIComponent(window.location.pathname))}
      />

      <HeaderBar onBack={() => router.back()} />
      
      <CarInfoCard car={car} />
      
      {/* Main Content */}
      <div className="max-w-4xl mx-auto px-4 py-6 pb-24">
        
        <AlertBanners carIsActive={car.isActive} eligibility={eligibility} />

        <BookingDetailsCards
          savedBookingDetails={savedBookingDetails}
          numberOfDays={numberOfDays}
          onEdit={() => router.back()}
        />
        
        {/* Primary Driver Information Section */}
        <PrimaryDriverForm
          driverFirstName={driverFirstName}
          driverLastName={driverLastName}
          driverAge={driverAge}
          driverLicense={driverLicense}
          driverPhone={driverPhone}
          driverEmail={driverEmail}
          firstNameValidation={firstNameValidation}
          lastNameValidation={lastNameValidation}
          ageValidation={ageValidation}
          phoneValidation={phoneValidation}
          emailValidation={emailValidation}
          onFirstNameChange={handleFirstNameChange}
          onLastNameChange={handleLastNameChange}
          onDobChange={handleDobChange}
          onLicenseChange={setDriverLicense}
          onPhoneChange={handleDriverPhoneChange}
          onEmailChange={handleDriverEmailChange}
          onAcceptEmailSuggestion={acceptEmailSuggestion}
          minimumAge={getMinimumAgeForVehicle()}
          userProfile={userProfile}
        >
          <SecondDriverForm
            showSecondDriver={showSecondDriver}
            onToggle={setShowSecondDriver}
            secondDriverFirstName={secondDriverFirstName}
            onFirstNameChange={setSecondDriverFirstName}
            secondDriverLastName={secondDriverLastName}
            onLastNameChange={setSecondDriverLastName}
            secondDriverAge={secondDriverAge}
            onAgeChange={setSecondDriverAge}
            secondDriverLicense={secondDriverLicense}
            onLicenseChange={setSecondDriverLicense}
            onRemove={() => {
              setShowSecondDriver(false)
              setSecondDriverFirstName('')
              setSecondDriverLastName('')
              setSecondDriverAge(null)
              setSecondDriverLicense('')
            }}
          />
        </PrimaryDriverForm>
        
        {/* Identity Verification Section */}
        <IdentityVerificationSection
          sessionStatus={sessionStatus}
          userProfile={userProfile}
          existingAccountInfo={existingAccountInfo}
          aiVerificationResult={aiVerificationResult}
          driverInfoComplete={driverInfoComplete}
          emailValidation={emailValidation}
          driverEmail={driverEmail}
          driverFirstName={driverFirstName}
          driverLastName={driverLastName}
          driverPhone={driverPhone}
          identityError={identityError}
          isVerifyingIdentity={isVerifyingIdentity}
          insuranceUploaded={insuranceUploaded}
          insurancePhotoUrl={insurancePhotoUrl}
          isUploading={isUploading}
          carId={carId}
          documentsRef={documentsRef}
          onAcceptEmailSuggestion={acceptEmailSuggestion}
          onAiVerificationComplete={(result) => {
            setAiVerificationResult(result)
            if (result.passed && result.data) {
              console.log('[Booking] AI DL verification passed:', result.data)
            }
          }}
          onPhotosUploaded={(frontUrl, backUrl) => {
            setLicensePhotoUrl(frontUrl)
            if (backUrl) setLicenseBackPhotoUrl(backUrl)
          }}
          onSetIsVerifyingIdentity={setIsVerifyingIdentity}
          onSetIdentityError={setIdentityError}
          onFileUpload={handleFileUpload}
        />

        {/* Phase 14: Insurance Pill - Prompts users to upload insurance for deposit discount */}
        <InsurancePill
          isLoggedIn={sessionStatus === 'authenticated'}
          hasInsurance={!!userProfile?.insuranceVerified}
          insurancePhotoUrl={userProfile?.insuranceCardUrl}
        />

        {/* Payment Section */}
        <div
          ref={paymentRef}
          className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 mt-4 shadow-sm border border-gray-300 dark:border-gray-600"
        >
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 flex items-center gap-2">
            <IoCardOutline className="w-5 h-5 text-gray-600 dark:text-gray-400" />
            {t('paymentInformation')}
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
            {isZeroPaymentBooking
              ? t('creditsPaymentSubtitle')
              : savedPaymentMethods.length > 0
                ? t('savedCardSubtitle')
                : t('newCardSubtitle')
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
                    <p className="font-medium text-amber-800 dark:text-amber-200">{t('creditsAppliedBox')}</p>
                    <p className="text-sm text-amber-600 dark:text-amber-400">
                      {t('balanceCoversBooking')}
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-gray-900 dark:text-white">$0.00</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{t('amountDue')}</p>
                </div>
              </div>
            </div>
          )}

          {/* Saved Payment Methods - Amazon-style dropdown */}
          {!isZeroPaymentBooking && savedPaymentMethods.length > 0 && (
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t('paymentMethodLabel')}
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
                        {t('expires')} {method.expMonth.toString().padStart(2, '0')}/{method.expYear.toString().slice(-2)}
                      </span>
                      {method.isDefault && (
                        <span className="ml-auto text-xs bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 px-2 py-0.5 rounded">
                          {t('defaultLabel')}
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
                    {t('useNewCard')}
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
            ) : !isIdentityVerified ? (
              <div className="p-4 bg-gray-50 dark:bg-gray-700/30 border border-gray-200 dark:border-gray-600 rounded-lg">
                <div className="flex items-center gap-2 mb-2">
                  <IoLockClosedOutline className="w-4 h-4 text-gray-400" />
                  <p className="text-sm text-gray-600 dark:text-gray-300 font-medium">
                    {t('verifyYourIdentityToEnablePayment')}
                  </p>
                </div>
                <p className="text-xs text-gray-500 dark:text-gray-400">
                  {t('completeIdentityVerificationStep')}
                </p>
              </div>
            ) : (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-amber-500"></div>
                <span className="ml-3 text-sm text-gray-500">{t('loadingPaymentOptions')}</span>
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
                {t('secureEncryptedByStripe')}
              </span>
            </div>
          </div>
          )}

          <PriceSummary
            savedBookingDetails={savedBookingDetails}
            car={car}
            adjustedDeposit={adjustedDeposit}
            rateBasedDeposit={rateBasedDeposit}
            guestBalances={guestBalances}
            userProfile={userProfile}
            numberOfDays={numberOfDays}
            promoDiscount={promoDiscountAmount}
            carId={carId}
            appliedPromo={appliedPromo}
            onPromoApplied={(promo) => {
              setAppliedPromo(promo)
              setClientSecret(null)
              setPaymentIntentId(null)
            }}
            onPromoRemoved={() => {
              setAppliedPromo(null)
              setClientSecret(null)
              setPaymentIntentId(null)
            }}
            agreedToTerms={agreedToTerms}
            onAgreedToTermsChange={setAgreedToTerms}
            showDepositTooltip={showDepositTooltip}
            onShowDepositTooltipChange={setShowDepositTooltip}
            onShowRentalAgreement={() => setShowRentalAgreement(true)}
            onShowInsuranceModal={() => setShowInsuranceModal(true)}
            onShowTrustSafetyModal={() => setShowTrustSafetyModal(true)}
          />

        </div>
      </div>

      {/* Sticky Floating Checkout Bar - Mobile Optimized */}
      {bookingSuccess && <BookingSuccessModal bookingSuccess={bookingSuccess} />}

      {/* Booking Error Banner */}
      {bookingError && !bookingSuccess && (
        <div className="fixed bottom-[72px] left-0 right-0 z-40 px-4 pb-2">
          <div className="max-w-2xl mx-auto bg-red-50 dark:bg-red-900/30 border border-red-200 dark:border-red-800 rounded-lg px-4 py-3 flex items-start gap-3">
            <IoCloseCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <p className="text-sm text-red-700 dark:text-red-300 flex-1">{bookingError}</p>
            <button onClick={() => setBookingError(null)} className="text-red-400 hover:text-red-600">
              <IoCloseCircleOutline className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      <PricingFooter
        savedBookingDetails={savedBookingDetails}
        car={car}
        adjustedDeposit={adjustedDeposit}
        rateBasedDeposit={rateBasedDeposit}
        guestBalances={guestBalances}
        userProfile={userProfile}
        isProcessing={isProcessing}
        isUploading={isUploading}
        eligibility={eligibility}
        isIdentityVerified={isIdentityVerified}
        onCheckout={handleCheckoutClick}
        promoDiscount={promoDiscountAmount}
      />
      
      <BookingModals
        showRentalAgreement={showRentalAgreement}
        onCloseRentalAgreement={() => setShowRentalAgreement(false)}
        showInsuranceModal={showInsuranceModal}
        onCloseInsuranceModal={() => setShowInsuranceModal(false)}
        showTrustSafetyModal={showTrustSafetyModal}
        onCloseTrustSafetyModal={() => setShowTrustSafetyModal(false)}
        showManualApprovalModal={showManualApprovalModal}
        onCloseManualApprovalModal={() => setShowManualApprovalModal(null)}
        onAcceptManualApproval={() => {
          setShowManualApprovalModal(null)
          manualApprovalAccepted.current = true
          handleCheckoutClick()
        }}
        car={car}
        savedBookingDetails={savedBookingDetails}
        guestName={`${guestName} ${guestLastName}`.trim() || session?.user?.name || `${driverFirstName} ${driverLastName}`.trim() || ''}
        guestEmail={guestEmail || session?.user?.email || driverEmail || ''}
      />
    </div>
  )
}