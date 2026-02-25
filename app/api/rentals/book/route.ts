// app/api/rentals/book/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { z } from 'zod'
import { sanitizeValue } from '@/app/middleware/validation'
import { RentalBookingStatus } from '@/app/lib/dal/types'
import { calculateBookingPricing, getActualDeposit } from '@/app/[locale]/(guest)/rentals/lib/booking-pricing'
import { addHours } from 'date-fns'
import { extractIpAddress } from '@/app/utils/ip-lookup'
import { verifyAdminRequest } from '@/app/lib/admin/middleware'
import { verifyRecaptchaToken } from '@/app/lib/recaptcha'
import { sendBookingConfirmation, sendPendingReviewEmail, sendFraudAlertEmail, sendHostReviewEmail } from '@/app/lib/email/booking-emails'

// Import new verification rules
import { 
  requiresVerification, 
  getVerificationReason, 
  getEstimatedReviewTime,
  getVerificationMessage,
  getPaymentTiming,
  calculateDriverAge 
} from '@/app/lib/booking/verification-rules'

// ========== 🆕 ACTIVITY TRACKING IMPORT ==========
import { trackActivity } from '@/lib/helpers/guestProfileStatus'
// ========== END IMPORT ==========

// ========== ACCOUNT HOLD CHECK IMPORT ==========
import { checkAccountHold } from '@/app/lib/claims/account-hold'
// ========== END ACCOUNT HOLD IMPORT ==========

// ========== STRIPE TEST INTEGRATION ==========
import Stripe from 'stripe'

// Initialize Stripe with TEST key (using your env variable name)
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || '', {
  apiVersion: '2025-08-27.basil'
})

// Test card numbers for development
const TEST_CARDS = {
  SUCCESS: '4242424242424242',
  REQUIRES_AUTH: '4000002500003155',
  DECLINED: '4000000000000002'
}
// ========== END STRIPE SETUP ==========

// Helper function to parse date in Arizona timezone
function parseArizonaDate(dateStr: string): Date {
  // Parse as noon in Arizona time to avoid timezone boundary issues
  const [year, month, day] = dateStr.split('-').map(Number)
  // Create date at noon local time (not UTC)
  const date = new Date(year, month - 1, day, 12, 0, 0)
  return date
}

// Validation schema for booking request - Updated with Arizona date handling
const bookingSchema = z.object({
  carId: z.string(),
  
  // Guest information (required for non-authenticated users)
  guestEmail: z.string().email(),
  guestPhone: z.string(),
  guestName: z.string(),
  
  // Dates and times - FIXED with Arizona timezone handling
  startDate: z.string().transform(str => parseArizonaDate(str)),
  endDate: z.string().transform(str => parseArizonaDate(str)),
  startTime: z.string(),
  endTime: z.string(),
  
  // Timezone indicator (optional but helpful)
  timezone: z.string().optional(),
  
  // Pickup details
  pickupType: z.enum(['host', 'airport', 'hotel', 'delivery']),
  pickupLocation: z.string(),
  deliveryAddress: z.string().optional(),
  returnLocation: z.string().optional(),
  
  // Extras and insurance
  extras: z.array(z.string()).optional(),
  insurance: z.enum(['none', 'minimum', 'basic', 'premium', 'luxury']),
  
  // Driver verification info
  driverInfo: z.object({
    licenseNumber: z.string(),
    licenseState: z.string(),
    licenseExpiry: z.string().optional(),
    dateOfBirth: z.string(),
    licensePhotoUrl: z.string().optional(),
    licenseBackPhotoUrl: z.string().optional(),
    insurancePhotoUrl: z.string().optional(),
    selfiePhotoUrl: z.string().optional(),
  }),

  // AI DL verification result (from visitor flow)
  aiVerification: z.object({
    result: z.any(),
    score: z.number(),
    passed: z.boolean(),
  }).optional(),
  
  // Payment (verification determines timing)
  paymentIntentId: z.string().optional(),
  paymentMethodId: z.string().optional(), // For saving card
  notes: z.string().optional(),

  // Promo code (optional)
  promoCode: z.string().optional(),
  promoDiscountAmount: z.number().optional(),
  promoSource: z.enum(['platform', 'host']).optional(),
  
  // Fraud detection data from client
  fraudData: z.object({
    deviceFingerprint: z.string(),
    sessionData: z.any().optional(),
    botSignals: z.array(z.string()).optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  let stripePaymentIntentId: string | null = null
  let bookingData: any = null
  try {
    // Parse and validate request body
    const body = await request.json()

    // Verify reCAPTCHA token (soft-fails if not configured)
    const captcha = await verifyRecaptchaToken(body.recaptchaToken)
    if (!captcha.success) {
      return NextResponse.json(
        { error: captcha.error || 'reCAPTCHA verification failed' },
        { status: 403 }
      )
    }

    const validationResult = bookingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    bookingData = validationResult.data

    // Sanitize user-provided string fields to prevent stored XSS
    bookingData.guestName = sanitizeValue(bookingData.guestName, 'guestName')
    bookingData.guestEmail = sanitizeValue(bookingData.guestEmail, 'guestEmail')
    bookingData.guestPhone = sanitizeValue(bookingData.guestPhone, 'guestPhone')
    if (bookingData.notes) bookingData.notes = sanitizeValue(bookingData.notes, 'notes')
    if (bookingData.pickupLocation) bookingData.pickupLocation = sanitizeValue(bookingData.pickupLocation, 'pickupLocation')
    if (bookingData.deliveryAddress) bookingData.deliveryAddress = sanitizeValue(bookingData.deliveryAddress, 'deliveryAddress')

    // ========== ACCOUNT HOLD CHECK ==========
    // Check if guest has an active account hold (e.g., from unresolved claim)
    const accountHoldStatus = await checkAccountHold(bookingData.guestEmail)

    if (!accountHoldStatus.canBook) {
      return NextResponse.json({
        error: 'Account on hold',
        message: accountHoldStatus.message || 'Your account is currently on hold. Please resolve any outstanding claims before booking.',
        code: 'ACCOUNT_HOLD',
        claimId: accountHoldStatus.claimId,
        holdReason: accountHoldStatus.holdReason,
        resolveUrl: accountHoldStatus.claimId
          ? `/claims/${accountHoldStatus.claimId}`
          : '/claims'
      }, { status: 403 })
    }
    // ========== END ACCOUNT HOLD CHECK ==========

    // ========== SUSPENDED IDENTIFIER CHECK ==========
    // Block bookings from emails/phones that have been explicitly suspended
    const suspendedEmail = await prisma.suspendedIdentifier.findUnique({
      where: {
        identifierType_identifierValue: {
          identifierType: 'email',
          identifierValue: bookingData.guestEmail.toLowerCase(),
        }
      },
      select: { reason: true, expiresAt: true }
    })

    if (suspendedEmail && (!suspendedEmail.expiresAt || suspendedEmail.expiresAt > new Date())) {
      console.warn(`[book] Suspended email attempted booking: ${bookingData.guestEmail}`)
      return NextResponse.json(
        { error: 'This account has been suspended. Please contact support.' },
        { status: 403 }
      )
    }
    // ========== END SUSPENDED IDENTIFIER CHECK ==========

    // ========== LINK GUEST PROFILE & USER ==========
    // Look up ReviewerProfile and User by email so bookings are properly linked
    const guestProfile = await prisma.reviewerProfile.findUnique({
      where: { email: bookingData.guestEmail },
      select: { id: true, userId: true, documentsVerified: true, canBookLuxury: true, canBookPremium: true },
    })
    const reviewerProfileId = guestProfile?.id || null
    const renterId = guestProfile?.userId || null

    // ========== EMAIL VERIFICATION CHECK ==========
    // Block bookings from users who haven't verified their email
    if (renterId) {
      const userRecord = await prisma.user.findUnique({
        where: { id: renterId },
        select: { emailVerified: true },
      })
      if (userRecord && userRecord.emailVerified === false) {
        console.warn(`[book] Unverified email attempted booking: ${bookingData.guestEmail}`)
        return NextResponse.json(
          {
            error: 'Please verify your email address before booking.',
            code: 'EMAIL_NOT_VERIFIED',
            verifyUrl: '/verify-email'
          },
          { status: 403 }
        )
      }
    }
    // ========== END EMAIL VERIFICATION CHECK ==========
    // ========== END LINK ==========

    // SECURE QUERY - Get car details WITHOUT source field
    const car = await prisma.rentalCar.findUnique({
      where: { id: bookingData.carId },
      select: {
        // Only fields needed for booking logic - NO SOURCE FIELD
        id: true,
        make: true,
        model: true,
        year: true,
        isActive: true,
        instantBook: true,
        carType: true,
        
        // Pricing fields
        dailyRate: true,
        weeklyRate: true,
        monthlyRate: true,
        deliveryFee: true,
        insuranceDaily: true,
        city: true,  // For city-specific tax rate
        estimatedValue: true, // For insurance pricing lookup

        // Deposit fields (for getActualDeposit)
        noDeposit: true,
        customDepositAmount: true,
        vehicleDepositMode: true,

        // Host info - minimal for notifications
        hostId: true,
        host: {
          select: {
            id: true,
            name: true,
            email: true,
            phone: true,
            isVerified: true,
            responseTime: true,
            userId: true,
            depositAmount: true,
            requireDeposit: true,
            makeDeposits: true,
          }
        },
        
        // Check availability
        bookings: {
          where: {
            OR: [
              { status: RentalBookingStatus.CONFIRMED as any },
              { status: RentalBookingStatus.ACTIVE as any }
            ],
            AND: [
              { endDate: { gte: bookingData.startDate } },
              { startDate: { lte: bookingData.endDate } }
            ]
          },
          select: {
            id: true,
            startDate: true,
            endDate: true,
            status: true
          }
        }
      }
    }) as any

    if (!car) {
      return NextResponse.json(
        { error: 'Car not found' },
        { status: 404 }
      )
    }

    if (!car.isActive) {
      return NextResponse.json(
        { error: 'Car is not available' },
        { status: 400 }
      )
    }

    // ========== GUEST RESTRICTION CHECK ==========
    // Enforce luxury/premium booking restrictions from active warnings
    if (guestProfile) {
      const carTypeUpper = (car.carType || '').toUpperCase()

      // Luxury restriction: blocks LUXURY, EXOTIC, CONVERTIBLE car types
      if (guestProfile.canBookLuxury === false && ['LUXURY', 'EXOTIC', 'CONVERTIBLE'].includes(carTypeUpper)) {
        console.warn(`[book] Luxury-restricted guest attempted booking: ${bookingData.guestEmail}, carType: ${car.carType}`)
        return NextResponse.json({
          error: 'Booking restricted',
          message: 'You currently cannot book luxury vehicles (Luxury, Exotic, or Convertible). This restriction is due to active account warnings. Please review your Community Guidelines to clear this restriction.',
          code: 'LUXURY_RESTRICTED',
        }, { status: 403 })
      }

      // Premium restriction: blocks EXOTIC car types only
      if (guestProfile.canBookPremium === false && carTypeUpper === 'EXOTIC') {
        console.warn(`[book] Premium-restricted guest attempted booking: ${bookingData.guestEmail}, carType: ${car.carType}`)
        return NextResponse.json({
          error: 'Booking restricted',
          message: 'You currently cannot book exotic/premium vehicles. This restriction is due to active account warnings. Please review your Community Guidelines to clear this restriction.',
          code: 'PREMIUM_RESTRICTED',
        }, { status: 403 })
      }
    }
    // ========== END GUEST RESTRICTION CHECK ==========

    // ========== SELF-BOOKING PREVENTION GUARD ==========
    // Prevent guests from booking their own host vehicles

    // PRIMARY CHECK: Email matching
    const isOwnVehicleByEmail = car.host.email.toLowerCase() === bookingData.guestEmail.toLowerCase()

    // SECONDARY CHECK: For authenticated users, also check userId
    const accessToken = request.cookies.get('accessToken')?.value ||
                       request.cookies.get('hostAccessToken')?.value
    let authenticatedUserId: string | null = null

    if (accessToken) {
      try {
        const jwt = await import('jsonwebtoken')
        const JWT_SECRET = process.env.JWT_SECRET!
        const decoded = jwt.verify(accessToken, JWT_SECRET) as any
        authenticatedUserId = decoded.userId
      } catch (err) {
        // Token invalid or expired - continue without userId check
      }
    }

    const isOwnVehicleByUserId = authenticatedUserId && car.host.userId === authenticatedUserId

    if (isOwnVehicleByEmail || isOwnVehicleByUserId) {
      // Log self-booking attempt for fraud detection
      await prisma.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: 'self_booking_attempt',
          entityType: 'RentalBooking',
          entityId: bookingData.carId,
          metadata: {
            guestEmail: bookingData.guestEmail,
            hostEmail: car.host.email,
            userId: authenticatedUserId,
            reason: 'Guest attempted to book their own vehicle'
          },
          ipAddress: extractIpAddress(request.headers)
        }
      })

      return NextResponse.json({
        error: 'Cannot book your own vehicle',
        message: 'You cannot book a vehicle you own. To block personal use dates, please use the calendar in your host dashboard.',
        code: 'SELF_BOOKING_NOT_ALLOWED'
      }, { status: 403 })
    }

    // ========== END SELF-BOOKING GUARD ==========

    // Check availability — are there overlapping CONFIRMED/ACTIVE bookings?
    // The Prisma query above (car.bookings) already fetches bookings with date overlap
    const overlappingBookings = car.bookings || []
    const isAvailable = overlappingBookings.length === 0

    if (!isAvailable) {
      return NextResponse.json(
        { error: 'Car is not available for selected dates' },
        { status: 400 }
      )
    }

    // ========== DATE RANGE VALIDATION ==========
    // Reject invalid date ranges BEFORE any Stripe operations to prevent orphaned PIs
    if (bookingData.startDate >= bookingData.endDate) {
      return NextResponse.json(
        { error: 'End date must be after start date' },
        { status: 400 }
      )
    }
    // ========== END DATE RANGE VALIDATION ==========

    // Calculate pricing with city-specific tax rate using unified pricing function
    const driverAge = calculateDriverAge(bookingData.driverInfo.dateOfBirth)
    const numberOfDays = Math.max(1, Math.ceil(
      (bookingData.endDate.getTime() - bookingData.startDate.getTime()) / (1000 * 60 * 60 * 24)
    ))

    // Look up insurance price server-side (same logic as /api/bookings/insurance/quote)
    let insurancePrice = 0
    if (bookingData.insurance !== 'none') {
      try {
        const provider = await prisma.insuranceProvider.findFirst({
          where: { isPrimary: true, isActive: true },
          select: { pricingRules: true }
        })
        if (provider?.pricingRules) {
          const vehicleValue = Number(car.estimatedValue) || car.dailyRate * 365
          const rules = provider.pricingRules as any
          let bracket: any
          if (vehicleValue < 25000) bracket = rules.under25k
          else if (vehicleValue < 50000) bracket = rules['25to50k']
          else if (vehicleValue < 100000) bracket = rules['50to100k']
          else bracket = rules.over100k
          const tierKey = bookingData.insurance.toUpperCase()
          const dailyPremium = bracket?.[tierKey] || 0
          insurancePrice = dailyPremium * numberOfDays
        }
      } catch (insErr) {
        console.warn('[book] Insurance lookup failed (using 0):', insErr)
      }
    }

    const pricingResult = calculateBookingPricing({
      dailyRate: car.dailyRate,
      days: numberOfDays,
      weeklyRate: car.weeklyRate || undefined,
      monthlyRate: car.monthlyRate || undefined,
      insurancePrice,
      deliveryFee: car.deliveryFee || 0,
      city: car.city || 'Phoenix',
    })

    // Map to shape expected by the rest of this file
    const pricing = {
      subtotal: pricingResult.basePrice,
      serviceFee: pricingResult.serviceFee,
      taxes: pricingResult.taxes,
      insurance: pricingResult.insurancePrice,
      delivery: pricingResult.deliveryFee,
      total: pricingResult.total,
      days: numberOfDays,
    }

    // Deposit uses per-vehicle logic (global/individual mode, make overrides, etc.)
    const depositAmount = getActualDeposit(car)

    // ========== SIMPLIFIED FRAUD DETECTION ==========
    
    // Extract IP address from headers
    const ipAddress = extractIpAddress(request.headers)
    const userAgent = request.headers.get('user-agent') || 'unknown'
    
    // Get client fraud data or use defaults
    const clientFraudData = bookingData.fraudData || {
      deviceFingerprint: 'unknown',
      sessionData: {},
      botSignals: []
    }
    
    // Simple risk scoring based on available data
    let riskScore = 0
    let riskFlags: string[] = []
    
    // Check for development/testing environment
    const isDevelopment = process.env.NODE_ENV === 'development' || 
                         process.env.SKIP_FRAUD_CHECK === 'true' ||
                         ipAddress === '127.0.0.1' || 
                         ipAddress.startsWith('192.168.') ||
                         ipAddress.startsWith('10.')
    
    if (isDevelopment) {
      // Minimal risk for development
      riskScore = 0
      riskFlags = ['development_environment']
    } else {
      // Basic risk checks
      if (clientFraudData.botSignals && clientFraudData.botSignals.length > 0) {
        riskScore += 50
        riskFlags.push(...clientFraudData.botSignals)
      }
      
      if (clientFraudData.deviceFingerprint === 'unknown') {
        riskScore += 20
        riskFlags.push('no_device_fingerprint')
      }
      
      // Check session data if available
      if (clientFraudData.sessionData) {
        const sessionDuration = clientFraudData.sessionData.duration || 0
        if (sessionDuration < 30000) { // Less than 30 seconds
          riskScore += 15
          riskFlags.push('short_session')
        }
        
        const interactions = clientFraudData.sessionData.totalInteractions || 0
        if (interactions < 5) {
          riskScore += 10
          riskFlags.push('low_interaction')
        }
      }
      
      // High-value booking check
      if (pricing.total > 1000) {
        riskScore += 10
        riskFlags.push('high_value_booking')
      }
      
      // Last-minute booking check
      const daysUntilStart = Math.floor(
        (bookingData.startDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24)
      )
      if (daysUntilStart < 1) {
        riskScore += 15
        riskFlags.push('last_minute_booking')
      }
    }
    
    // Determine risk level
    let riskLevel: 'low' | 'medium' | 'high' | 'critical'
    if (riskScore >= 70) riskLevel = 'critical'
    else if (riskScore >= 50) riskLevel = 'high'
    else if (riskScore >= 30) riskLevel = 'medium'
    else riskLevel = 'low'
    
    const requiresManualReview = riskScore >= 60
    const shouldBlock = riskScore >= 85 && !isDevelopment
    
    // Log fraud check results
    console.log('Fraud Check Results:', {
      riskScore,
      riskLevel,
      shouldBlock,
      requiresManualReview,
      flags: riskFlags,
      isDevelopment
    })
    
    // Block only if truly high risk and not in development
    if (shouldBlock) {
      await prisma.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: 'booking_blocked',
          entityType: 'RentalBooking',
          entityId: bookingData.carId,
          metadata: {
            guestEmail: bookingData.guestEmail,
            riskScore,
            flags: riskFlags,
            reason: 'High fraud risk detected'
          },
          ipAddress
        }
      })
      
      return NextResponse.json(
        { 
          error: 'Booking cannot be processed',
          message: 'Your booking cannot be completed at this time. Please contact support if you believe this is an error.',
          code: 'FRAUD_BLOCK'
        },
        { status: 403 }
      )
    }
    
    // ========== END FRAUD DETECTION ==========

    // ========== DL VERIFICATION GATE ==========
    // SECURITY FIX: Query server-side verification results instead of trusting client payload.
    // Previously accepted `aiVerification.passed` from the client body, which could be spoofed
    // with a simple `{ passed: true, score: 100 }` to bypass DL verification entirely.
    const guestDocumentsVerified = guestProfile?.documentsVerified === true

    // Check server-side AI verification from DLVerificationLog
    let serverSideAIVerified = false
    if (!guestDocumentsVerified) {
      const latestDLVerification = await prisma.dLVerificationLog.findFirst({
        where: {
          guestEmail: bookingData.guestEmail.toLowerCase(),
          passed: true,
        },
        orderBy: { createdAt: 'desc' },
        select: { passed: true, score: true, createdAt: true }
      })

      // Require verification to be recent (within 72 hours)
      if (latestDLVerification) {
        const hoursAgo = (Date.now() - latestDLVerification.createdAt.getTime()) / (1000 * 60 * 60)
        serverSideAIVerified = hoursAgo <= 72
        if (!serverSideAIVerified) {
          console.warn(`[book] DL verification expired for ${bookingData.guestEmail} (${Math.round(hoursAgo)}h ago)`)
        }
      }
    }

    if (!serverSideAIVerified && !guestDocumentsVerified) {
      console.warn(`[book] DL verification failed for ${bookingData.guestEmail} (no server-side verification found)`)
      return NextResponse.json(
        {
          error: 'Driver verification required',
          message: 'Your driver\'s license must be verified before booking. Please upload clear photos of your license and try again.',
          code: 'DL_VERIFICATION_REQUIRED'
        },
        { status: 403 }
      )
    }
    // ========== END DL VERIFICATION GATE ==========

    // ========== MINIMUM AMOUNT GUARD ==========
    if (pricing.total <= 0) {
      console.warn(`[book] $0 booking attempt blocked: total=${pricing.total}, carId=${bookingData.carId}, guest=${bookingData.guestEmail}`)
      return NextResponse.json(
        { error: 'Booking total must be greater than $0. Please check the vehicle pricing.' },
        { status: 400 }
      )
    }
    // ========== END MINIMUM AMOUNT GUARD ==========

    // ========== VERIFICATION LOGIC USING BUSINESS RULES ==========
    const bookingInfo = {
      numberOfDays: pricing.days,
      totalAmount: pricing.total,
      guestEmail: bookingData.guestEmail,
      startDate: bookingData.startDate,
      driverAge
    }

    const needsVerification = requiresVerification(car, bookingInfo)
    const verificationReason = getVerificationReason(car, bookingInfo)
    const estimatedReviewTime = getEstimatedReviewTime(verificationReason)
    const paymentTiming = getPaymentTiming(needsVerification, verificationReason)
    
    console.log('Verification Decision:', {
      needsVerification,
      reason: verificationReason,
      reviewTime: estimatedReviewTime,
      paymentTiming
    })
    // ========== END VERIFICATION LOGIC ==========

    // ========== STRIPE TEST PAYMENT SETUP ==========
    let stripeCustomerId: string | null = null
    stripePaymentIntentId = null
    let stripePaymentMethodId: string | null = null
    let paymentAlreadyConfirmed = false

    // Check if a pre-confirmed PaymentIntent was provided (from Payment Element)
    if (bookingData.paymentIntentId) {
      try {
        console.log('🔷 Verifying pre-confirmed PaymentIntent:', bookingData.paymentIntentId)
        const existingPaymentIntent = await stripe.paymentIntents.retrieve(bookingData.paymentIntentId)

        // Verify PaymentIntent belongs to this guest (prevent using someone else's payment)
        const piEmail = existingPaymentIntent.metadata?.guestEmail || existingPaymentIntent.receipt_email
        if (piEmail && piEmail !== bookingData.guestEmail && piEmail !== 'unknown') {
          console.warn(`[book] PI ownership mismatch: PI email=${piEmail}, guest=${bookingData.guestEmail}`)
          return NextResponse.json(
            { error: 'Payment does not belong to this booking. Please refresh and try again.' },
            { status: 400 }
          )
        }

        // Check if payment is in a valid state
        if (existingPaymentIntent.status === 'succeeded') {
          console.log('🔷 Payment already succeeded:', existingPaymentIntent.id)
          stripePaymentIntentId = existingPaymentIntent.id
          stripeCustomerId = existingPaymentIntent.customer as string || null
          paymentAlreadyConfirmed = true
        } else if (existingPaymentIntent.status === 'requires_capture') {
          console.log('🔷 Payment authorized, requires capture:', existingPaymentIntent.id)
          stripePaymentIntentId = existingPaymentIntent.id
          stripeCustomerId = existingPaymentIntent.customer as string || null
          paymentAlreadyConfirmed = true
        } else if (existingPaymentIntent.status === 'processing') {
          console.log('🔷 Payment processing:', existingPaymentIntent.id)
          stripePaymentIntentId = existingPaymentIntent.id
          stripeCustomerId = existingPaymentIntent.customer as string || null
          paymentAlreadyConfirmed = true
        } else {
          console.warn('🔷 PaymentIntent in unexpected state:', existingPaymentIntent.status)
          // Will create new payment below if needed
        }
      } catch (error) {
        console.error('🔷 Error retrieving PaymentIntent:', error)
        // Will create new payment below if needed
      }
    }

    // Create Stripe customer for bookings requiring verification (only if payment not already confirmed)
    if ((needsVerification || requiresManualReview) && !paymentAlreadyConfirmed) {
      try {
        console.log('🔷 Creating Stripe TEST customer...')
        
        // Check if customer already exists
        const existingCustomers = await stripe.customers.list({
          email: bookingData.guestEmail,
          limit: 1
        })
        
        let customer
        if (existingCustomers.data.length > 0) {
          customer = existingCustomers.data[0]
          console.log('🔷 Found existing Stripe customer:', customer.id)
        } else {
          // Create new Stripe customer
          customer = await stripe.customers.create({
            email: bookingData.guestEmail,
            name: bookingData.guestName,
            phone: bookingData.guestPhone,
            metadata: {
              bookingCode: generateBookingCode(),
              carId: bookingData.carId,
              environment: 'TEST',
              verificationReason
            }
          })
          console.log('🔷 Created new Stripe customer:', customer.id)
        }
        
        stripeCustomerId = customer.id
        
        // Create a SetupIntent to save card for future charging
        const setupIntent = await stripe.setupIntents.create({
          customer: customer.id,
          payment_method_types: ['card'],
          usage: 'off_session',
          metadata: {
            bookingCode: generateBookingCode(),
            totalAmount: Math.round(pricing.total * 100).toString(),
            depositAmount: Math.round(depositAmount * 100).toString(),
            environment: 'TEST'
          }
        })
        
        console.log('🔷 Created Stripe SetupIntent:', setupIntent.id)
        console.log('🔷 Client secret for frontend:', setupIntent.client_secret)
        
        // For testing, create a payment intent that will be confirmed later
        const paymentIntent = await stripe.paymentIntents.create({
          amount: Math.round(pricing.total * 100), // Amount in cents
          currency: 'usd',
          customer: customer.id,
          capture_method: 'manual', // Don't capture immediately
          setup_future_usage: 'off_session',
          metadata: {
            bookingCode: generateBookingCode(),
            carId: bookingData.carId,
            guestEmail: bookingData.guestEmail,
            environment: 'TEST',
            verificationRequired: needsVerification.toString(),
            verificationReason
          },
          description: `Test booking for ${car.make} ${car.model}`
        })
        
        stripePaymentIntentId = paymentIntent.id
        console.log('🔷 Created Stripe PaymentIntent (TEST):', paymentIntent.id)
        console.log('🔷 Amount to charge on approval: $', (paymentIntent.amount / 100).toFixed(2))
        
        // If a test payment method was provided, attach it
        if (bookingData.paymentMethodId) {
          await stripe.paymentMethods.attach(bookingData.paymentMethodId, {
            customer: customer.id
          })
          stripePaymentMethodId = bookingData.paymentMethodId
          console.log('🔷 Attached payment method:', bookingData.paymentMethodId)
        }
        
      } catch (stripeError) {
        console.error('❌ Stripe TEST error:', stripeError)
        // Don't fail the booking, just log the error
        // In production, you might want to handle this differently
      }
    }
    // ========== END STRIPE SETUP ==========

    // ========== SERVER-SIDE PROMO CODE VALIDATION ==========
    if (bookingData.promoCode) {
      if (bookingData.promoSource === 'platform') {
        const promoRecord = await prisma.platform_promo_codes.findFirst({
          where: { code: { equals: bookingData.promoCode, mode: 'insensitive' } }
        })
        if (!promoRecord || !promoRecord.isActive) {
          return NextResponse.json({ error: 'Promo code is no longer valid' }, { status: 400 })
        }
        if (promoRecord.expiresAt && new Date() > promoRecord.expiresAt) {
          return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 })
        }
        if (promoRecord.maxUses && promoRecord.usedCount >= promoRecord.maxUses) {
          return NextResponse.json({ error: 'Promo code usage limit reached' }, { status: 400 })
        }
      } else if (bookingData.promoSource === 'host') {
        const hostPromo = await prisma.partner_discounts.findFirst({
          where: { code: { equals: bookingData.promoCode, mode: 'insensitive' } }
        })
        if (!hostPromo || !hostPromo.isActive) {
          return NextResponse.json({ error: 'Promo code is no longer valid' }, { status: 400 })
        }
        if (hostPromo.expiresAt && new Date() > hostPromo.expiresAt) {
          return NextResponse.json({ error: 'Promo code has expired' }, { status: 400 })
        }
      }
    }
    // ========== END PROMO CODE VALIDATION ==========

    // Generate booking code
    const bookingCode = generateBookingCode()

    // Create the booking in a serializable transaction to prevent double-booking
    const booking = await prisma.$transaction(async (tx) => {
      // Re-verify availability INSIDE transaction to prevent race condition
      // (The check at line ~310 is a fast-path reject; this is the authoritative check)
      const conflict = await tx.rentalBooking.findFirst({
        where: {
          carId: bookingData.carId,
          status: { in: ['PENDING', 'CONFIRMED', 'ACTIVE'] },
          startDate: { lte: bookingData.endDate },
          endDate: { gte: bookingData.startDate },
        },
        select: { id: true }
      })
      if (conflict) {
        throw new Error('AVAILABILITY_CONFLICT')
      }

      // Create the booking with appropriate status
      const newBooking = await tx.rentalBooking.create({
        data: {
          id: crypto.randomUUID(),
          bookingCode,
          updatedAt: new Date(),
          carId: bookingData.carId,
          hostId: car.hostId,
          
          // Guest information — link to profile & user when available
          guestEmail: bookingData.guestEmail,
          guestPhone: bookingData.guestPhone,
          guestName: bookingData.guestName,
          reviewerProfileId,
          renterId,
          
          // Dates - now properly parsed in Arizona timezone
          startDate: bookingData.startDate,
          endDate: bookingData.endDate,
          startTime: bookingData.startTime,
          endTime: bookingData.endTime,
          
          // Pickup
          pickupLocation: bookingData.pickupLocation,
          pickupType: bookingData.pickupType,
          deliveryAddress: bookingData.deliveryAddress,
          returnLocation: bookingData.returnLocation || bookingData.pickupLocation,
          
          // Pricing
          dailyRate: car.dailyRate,
          numberOfDays: pricing.days,
          subtotal: pricing.subtotal,
          deliveryFee: pricing.delivery,
          insuranceFee: pricing.insurance,
          insuranceTier: bookingData.insurance !== 'none' ? bookingData.insurance : null,
          serviceFee: pricing.serviceFee,
          taxes: pricing.taxes,
          totalAmount: pricing.total,
          depositAmount: depositAmount,
          securityDeposit: depositAmount || 0,
          depositHeld: 0,

          // Promo code (if applied)
          promoCode: bookingData.promoCode || null,
          promoDiscountAmount: bookingData.promoDiscountAmount || 0,
          promoSource: bookingData.promoSource || null,

          // ALL bookings start PENDING — three-tier approval: fleet → host → confirmed
          status: RentalBookingStatus.PENDING as any,
          // Payment is held via manual capture (AUTHORIZED), not charged until host approves
          paymentStatus: 'AUTHORIZED' as any,
          fleetStatus: 'PENDING',
          paymentIntentId: stripePaymentIntentId || bookingData.paymentIntentId,
          
          // ========== STRIPE FIELDS ==========
          stripeCustomerId: stripeCustomerId,
          stripePaymentMethodId: stripePaymentMethodId,
          // ========== END STRIPE FIELDS ==========
          
          // Verification info - parse dates properly
          licenseVerified: (needsVerification || requiresManualReview) ? false : true,
          licenseNumber: bookingData.driverInfo.licenseNumber,
          licenseState: bookingData.driverInfo.licenseState,
          licenseExpiry: bookingData.driverInfo.licenseExpiry ? parseArizonaDate(bookingData.driverInfo.licenseExpiry) : null,
          licensePhotoUrl: bookingData.driverInfo.licensePhotoUrl,
          licenseBackPhotoUrl: bookingData.driverInfo.licenseBackPhotoUrl || null,
          insurancePhotoUrl: bookingData.driverInfo.insurancePhotoUrl,
          selfieVerified: (needsVerification || requiresManualReview) ? false : true,
          selfiePhotoUrl: bookingData.driverInfo.selfiePhotoUrl,
          dateOfBirth: parseArizonaDate(bookingData.driverInfo.dateOfBirth),
          
          // AI DL verification — pulled from server-side DLVerificationLog (never trust client)
          ...(serverSideAIVerified && {
            aiVerificationAt: new Date(),
            aiVerificationModel: 'claude-sonnet-4-5-20250929',
          }),

          // Verification status
          verificationStatus: (requiresManualReview ? 'SUBMITTED' : (needsVerification ? 'SUBMITTED' : 'APPROVED')) as any,
          // Always set documentsSubmittedAt when we have DL photos or AI verification
          documentsSubmittedAt: (needsVerification || requiresManualReview || serverSideAIVerified) ? new Date() : null,
          flaggedForReview: requiresManualReview,
          
          // SIMPLIFIED FRAUD DATA
          deviceFingerprint: clientFraudData.deviceFingerprint,
          sessionId: clientFraudData.sessionData?.sessionId || 'no-session',
          sessionStartedAt: clientFraudData.sessionData?.startTime ? 
            new Date(clientFraudData.sessionData.startTime) : new Date(),
          sessionDuration: clientFraudData.sessionData?.duration || 0,
          bookingIpAddress: ipAddress,
          bookingUserAgent: userAgent,
          riskScore,
          riskFlags: JSON.stringify(riskFlags),
          riskNotes: requiresManualReview ? `Flagged for review: ${riskLevel} risk` : null,
          emailDomain: bookingData.guestEmail.split('@')[1],
          formCompletionTime: clientFraudData.sessionData?.duration || 0,
          copyPasteUsed: clientFraudData.sessionData?.copyPasteUsed || false,
          mouseEventsRecorded: (clientFraudData.sessionData?.totalInteractions || 0) > 0,
          emailVerified: false,
          phoneVerified: false,
          
          extras: bookingData.extras ? JSON.stringify(bookingData.extras) : null,
          notes: bookingData.notes
        },
        select: {
          // SELECT ONLY NEEDED FIELDS - NO RAW INCLUDES
          id: true,
          bookingCode: true,
          carId: true,
          hostId: true,
          guestEmail: true,
          guestPhone: true,
          guestName: true,
          startDate: true,
          endDate: true,
          startTime: true,
          endTime: true,
          pickupLocation: true,
          pickupType: true,
          deliveryAddress: true,
          subtotal: true,
          deliveryFee: true,
          insuranceFee: true,
          serviceFee: true,
          taxes: true,
          totalAmount: true,
          depositAmount: true,
          status: true,
          paymentStatus: true,
          flaggedForReview: true,
          riskScore: true,
          reviewerProfileId: true,
          notes: true,

          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true,
              photos: {
                select: {
                  id: true,
                  url: true,
                  caption: true,
                  isHero: true
                },
                where: { isHero: true },
                take: 1
              }
            }
          },
          
          host: {
            select: {
              id: true,
              name: true,
              email: true,
              phone: true
            }
          }
        }
      })

      // ========== 🆕 TRACK BOOKING CREATION ACTIVITY ==========
      // Get reviewerProfileId if guest has one (via email)
      let guestProfileId = newBooking.reviewerProfileId
      
      if (!guestProfileId) {
        // Try to find existing reviewer profile by email
        const existingProfile = await tx.reviewerProfile.findUnique({
          where: { email: bookingData.guestEmail },
          select: { id: true }
        })
        guestProfileId = existingProfile?.id || null
      }
      
      // Track activity if we have a profile ID
      if (guestProfileId) {
        try {
          await trackActivity(guestProfileId, {
            action: 'BOOKING_CREATED',
            description: `Booked ${car.year} ${car.make} ${car.model} for ${pricing.days} day${pricing.days > 1 ? 's' : ''}`,
            performedBy: 'GUEST',
            metadata: {
              bookingId: newBooking.id,
              bookingCode: newBooking.bookingCode,
              carName: `${car.year} ${car.make} ${car.model}`,
              carId: bookingData.carId,
              startDate: bookingData.startDate.toISOString(),
              endDate: bookingData.endDate.toISOString(),
              numberOfDays: pricing.days,
              totalAmount: pricing.total,
              pickupLocation: bookingData.pickupLocation,
              pickupType: bookingData.pickupType,
              status: newBooking.status,
              needsVerification,
              verificationReason: needsVerification ? verificationReason : null
            }
          })
          console.log('✅ Tracked booking creation activity for guest:', guestProfileId)
        } catch (trackError) {
          console.error('⚠️ Failed to track booking activity (non-blocking):', trackError)
          // Don't fail the booking if tracking fails
        }
      } else {
        console.log('ℹ️ No reviewer profile found for guest email:', bookingData.guestEmail)
      }
      // ========== END ACTIVITY TRACKING ==========

      // ========== APPLY CREDITS, BONUS & DEPOSIT WALLET ==========
      let creditsApplied = 0
      let bonusApplied = 0
      let depositFromWallet = 0
      let depositFromCard = depositAmount
      let chargeAmount = pricing.total

      if (guestProfileId) {
        try {
          // Get guest's current balances and verification status
          const guestProfile = await tx.reviewerProfile.findUnique({
            where: { id: guestProfileId },
            select: {
              creditBalance: true,
              bonusBalance: true,
              depositWalletBalance: true,
              stripeIdentityStatus: true,
              documentsVerified: true,
              insuranceVerified: true,
              insuranceCardFrontUrl: true,
              insuranceProvider: true,
              policyNumber: true
            }
          })

          // Auto-link profile insurance to booking if verified
          if (guestProfile?.insuranceVerified && guestProfile.insuranceCardFrontUrl) {
            await tx.rentalBooking.update({
              where: { id: newBooking.id },
              data: {
                insurancePhotoUrl: guestProfile.insuranceCardFrontUrl,
                guestInsuranceActive: true,
                guestInsuranceProvider: guestProfile.insuranceProvider || undefined,
                guestInsurancePolicyNumber: guestProfile.policyNumber || undefined
              }
            })
            console.log('🔗 Auto-linked profile insurance to booking:', newBooking.id)
          }

          // ========== VERIFICATION GATE FOR CREDITS ==========
          // Credits can only be used if guest is verified
          const isGuestVerified = guestProfile?.stripeIdentityStatus === 'verified' ||
                                   guestProfile?.documentsVerified === true

          if (guestProfile) {
            const balances = {
              creditBalance: guestProfile.creditBalance || 0,
              bonusBalance: guestProfile.bonusBalance || 0,
              depositWalletBalance: guestProfile.depositWalletBalance || 0
            }

            // ========== VERIFICATION GATE ==========
            // Only apply credits/bonus if guest is verified
            if (isGuestVerified) {
              // Credits override bonus: if credits exist, skip bonus entirely
              if (balances.creditBalance > 0) {
                // Credits take full priority — no bonus applied
                creditsApplied = Math.min(balances.creditBalance, pricing.total)
                bonusApplied = 0
              } else {
                // No credits — use bonus (capped at 25% of base rental price)
                const maxBonusPercentage = 0.25
                const basePrice = pricing.subtotal
                const maxBonusAllowed = Math.round(basePrice * maxBonusPercentage * 100) / 100
                bonusApplied = Math.min(balances.bonusBalance, maxBonusAllowed, pricing.total)
                creditsApplied = 0
              }

              // Final charge amount (rental portion)
              chargeAmount = Math.round((pricing.total - creditsApplied - bonusApplied) * 100) / 100

              // Deposit from wallet
              depositFromWallet = Math.min(balances.depositWalletBalance, depositAmount)
              depositFromCard = Math.round((depositAmount - depositFromWallet) * 100) / 100

              // Enforce $1.00 minimum Stripe charge if credits/bonus reduced it to near-zero
              if (chargeAmount + depositFromCard < 1.00) {
                chargeAmount = Math.round((1.00 - depositFromCard) * 100) / 100
                if (chargeAmount < 0) chargeAmount = 1.00
              }

              console.log('💰 Financial breakdown (verified guest):', {
                originalTotal: pricing.total,
                creditsApplied,
                bonusApplied,
                chargeAmount,
                depositFromWallet,
                depositFromCard,
                stripeCharge: chargeAmount + depositFromCard
              })
            } else {
              // Guest not verified - credits are locked
              console.log('🔒 Credits locked - guest not verified:', {
                availableCredits: balances.creditBalance,
                availableBonus: balances.bonusBalance,
                availableDeposit: balances.depositWalletBalance,
                verificationStatus: guestProfile.stripeIdentityStatus,
                documentsVerified: guestProfile.documentsVerified,
                message: 'Guest must complete identity verification to use credits'
              })
            }
            // ========== END VERIFICATION GATE ==========

            // Note: Deduction code only executes if credits were applied (which requires verification)
            // If not verified, creditsApplied/bonusApplied/depositFromWallet remain 0

            // Deduct credits if applied
            if (creditsApplied > 0) {
              await tx.reviewerProfile.update({
                where: { id: guestProfileId },
                data: { creditBalance: { decrement: creditsApplied } }
              })

              await tx.creditBonusTransaction.create({
                data: {
                  id: crypto.randomUUID(),
                  guestId: guestProfileId,
                  amount: creditsApplied,
                  type: 'CREDIT',
                  action: 'USE',
                  balanceAfter: balances.creditBalance - creditsApplied,
                  reason: `Applied to booking ${newBooking.bookingCode}`,
                  bookingId: newBooking.id
                }
              })
              console.log('✅ Deducted credits:', creditsApplied)
            }

            // Deduct bonus if applied
            if (bonusApplied > 0) {
              await tx.reviewerProfile.update({
                where: { id: guestProfileId },
                data: { bonusBalance: { decrement: bonusApplied } }
              })

              await tx.creditBonusTransaction.create({
                data: {
                  id: crypto.randomUUID(),
                  guestId: guestProfileId,
                  amount: bonusApplied,
                  type: 'BONUS',
                  action: 'USE',
                  balanceAfter: balances.bonusBalance - bonusApplied,
                  reason: `Applied to booking ${newBooking.bookingCode} (25% max)`,
                  bookingId: newBooking.id
                }
              })
              console.log('✅ Deducted bonus:', bonusApplied)
            }

            // Deduct from deposit wallet if used
            if (depositFromWallet > 0) {
              await tx.reviewerProfile.update({
                where: { id: guestProfileId },
                data: { depositWalletBalance: { decrement: depositFromWallet } }
              })

              await tx.depositTransaction.create({
                data: {
                  id: crypto.randomUUID(),
                  guestId: guestProfileId,
                  amount: depositFromWallet,
                  type: 'HOLD',
                  balanceAfter: balances.depositWalletBalance - depositFromWallet,
                  bookingId: newBooking.id,
                  description: `Security deposit hold for booking ${newBooking.bookingCode}`
                }
              })
              console.log('✅ Held deposit from wallet:', depositFromWallet)
            }

            // Update the booking with financial tracking fields
            await tx.rentalBooking.update({
              where: { id: newBooking.id },
              data: {
                creditsApplied,
                bonusApplied,
                depositFromWallet,
                depositFromCard,
                chargeAmount,
                // Track if credits were available but locked due to verification
                ...((!isGuestVerified && (balances.creditBalance > 0 || balances.bonusBalance > 0)) ? {
                  notes: (newBooking.notes || '') + `\n[System] Guest has ${balances.creditBalance > 0 ? `$${balances.creditBalance} credit` : ''}${balances.creditBalance > 0 && balances.bonusBalance > 0 ? ' + ' : ''}${balances.bonusBalance > 0 ? `$${balances.bonusBalance} bonus` : ''} locked - identity verification required to use.`
                } : {})
              }
            })
          }
        } catch (finError) {
          console.error('⚠️ Error processing financial balances (non-blocking):', finError)
          // Don't fail the booking if balance processing fails
        }
      }

      // Update Stripe payment intent amount if credits/bonus reduced the charge
      // Skip if PI is already confirmed (requires_capture) — amount can't be changed after confirmation
      const finalStripeAmount = Math.round((chargeAmount + depositFromCard) * 100)
      if (stripePaymentIntentId && finalStripeAmount < Math.round((pricing.total + depositAmount) * 100)) {
        try {
          const existingPI = await stripe.paymentIntents.retrieve(stripePaymentIntentId)
          if (existingPI.status === 'requires_capture') {
            console.log('ℹ️ PI already confirmed (requires_capture) — skipping amount update. Current amount:', existingPI.amount, 'cents')
          } else {
            await stripe.paymentIntents.update(stripePaymentIntentId, {
              amount: Math.max(finalStripeAmount, 100), // Min $1.00 (100 cents)
              metadata: {
                originalTotal: pricing.total.toString(),
                creditsApplied: creditsApplied.toString(),
                bonusApplied: bonusApplied.toString(),
                chargeAmount: chargeAmount.toString(),
                depositFromCard: depositFromCard.toString(),
                depositFromWallet: depositFromWallet.toString()
              }
            })
            console.log('✅ Updated Stripe PaymentIntent amount to:', chargeAmount + depositFromCard, '(rental:', chargeAmount, '+ deposit:', depositFromCard, ')')
          }
        } catch (stripeUpdateError) {
          console.error('⚠️ Failed to update Stripe amount (non-blocking):', stripeUpdateError)
        }
      }
      // ========== END FINANCIAL PROCESSING ==========

      // Store fraud indicators if any
      if (riskFlags.length > 0 && !isDevelopment) {
        await tx.fraudIndicator.createMany({
          data: riskFlags.map(flag => ({
            id: crypto.randomUUID(),
            bookingId: newBooking.id,
            indicator: flag,
            severity: (riskScore >= 70 ? 'HIGH' :
                     riskScore >= 50 ? 'MEDIUM' : 'LOW') as any,
            confidence: 0.8,
            source: 'system'
          }))
        })
      }

      // Store session data if available
      if (clientFraudData.sessionData && clientFraudData.sessionData.sessionId) {
        // Check if session already exists
        const existingSession = await tx.bookingSession.findUnique({
          where: { sessionId: clientFraudData.sessionData.sessionId }
        })
        
        if (!existingSession) {
          // Create new session entry
          await tx.bookingSession.create({
            data: {
              id: crypto.randomUUID(),
              bookingId: newBooking.id,
              sessionId: clientFraudData.sessionData.sessionId,
              updatedAt: new Date(),
              duration: clientFraudData.sessionData.duration || 0,
              abandoned: false,
              completedAt: new Date(),
              pageViews: JSON.stringify(clientFraudData.sessionData.pageViews || []),
              clickCount: clientFraudData.sessionData.totalInteractions || 0,
              validationErrors: clientFraudData.sessionData.validationErrors || 0
            }
          })
        } else {
          // Update existing session with new booking
          await tx.bookingSession.update({
            where: { sessionId: clientFraudData.sessionData.sessionId },
            data: {
              bookingId: newBooking.id,
              completedAt: new Date(),
              abandoned: false,
              duration: clientFraudData.sessionData.duration || existingSession.duration
            }
          })
        }
      }

      // Create guest access token for tracking
      const accessToken = await tx.guestAccessToken.create({
        data: {
          id: crypto.randomUUID(),
          token: crypto.randomUUID(),
          bookingId: newBooking.id,
          email: bookingData.guestEmail,
          expiresAt: addHours(new Date(), 72) // 3 days to access booking
        }
      })

      // Increment promo code usage count
      if (bookingData.promoCode && bookingData.promoSource === 'platform') {
        await tx.platform_promo_codes.updateMany({
          where: { code: { equals: bookingData.promoCode, mode: 'insensitive' } },
          data: { usedCount: { increment: 1 } }
        })
      } else if (bookingData.promoCode && bookingData.promoSource === 'host') {
        await tx.partner_discounts.updateMany({
          where: { code: { equals: bookingData.promoCode, mode: 'insensitive' } },
          data: { usedCount: { increment: 1 } }
        })
      }

      // For confirmed bookings (no verification needed and not flagged), update statistics and block availability
      if (!needsVerification && !requiresManualReview) {
        // Update car statistics
        await tx.rentalCar.update({
          where: { id: bookingData.carId },
          data: {
            totalTrips: { increment: 1 }
          }
        })

        // Create availability blocks for booked dates
        const dates = []
        const currentDate = new Date(bookingData.startDate)
        const endDate = new Date(bookingData.endDate)

        while (currentDate <= endDate) {
          dates.push(new Date(currentDate))
          currentDate.setDate(currentDate.getDate() + 1)
        }

        await tx.rentalAvailability.createMany({
          data: dates.map(date => ({
            id: crypto.randomUUID(),
            carId: bookingData.carId,
            date,
            isAvailable: false,
            note: `Booked - ${bookingCode}`
          })),
          skipDuplicates: true
        })
      }

      // Log the booking activity
      await tx.activityLog.create({
        data: {
          id: crypto.randomUUID(),
          action: requiresManualReview ? 'booking_flagged' : 'booking_created',
          entityType: 'RentalBooking',
          entityId: newBooking.id,
          metadata: {
            bookingCode,
            riskScore,
            riskLevel,
            flagged: requiresManualReview,
            verificationRequired: needsVerification,
            verificationReason,
            stripeCustomerId: stripeCustomerId || null,
            stripePaymentIntentId: stripePaymentIntentId || null,
            testMode: true
          },
          ipAddress
        }
      })

      return { booking: newBooking, token: accessToken.token }
    }, { isolationLevel: 'Serializable' }) as any

    // ALL bookings are now pending review (three-tier approval: fleet → host → confirmed)
    // Send pending review email to guest — never instant confirmation
    sendPendingReviewEmail({
      guestEmail: booking.booking.guestEmail,
      guestName: booking.booking.guestName,
      bookingCode: booking.booking.bookingCode,
      carMake: booking.booking.car.make,
      carModel: booking.booking.car.model,
      carImage: booking.booking.car.photos?.[0]?.url || '',
      startDate: booking.booking.startDate.toISOString(),
      endDate: booking.booking.endDate.toISOString(),
      pickupLocation: booking.booking.pickupLocation,
      totalAmount: booking.booking.totalAmount.toFixed(2),
      documentsSubmittedAt: new Date().toISOString(),
      estimatedReviewTime: requiresManualReview ? 'within 1 hour' : (needsVerification ? estimatedReviewTime : 'within a few hours'),
      trackingUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/rentals/dashboard/guest/${booking.token}`,
      accessToken: booking.token
    }).catch(error => {
      console.error('Error sending pending review email:', error)
    })

    // Send booking received SMS to guest (fire-and-forget, same time as email)
    import('@/app/lib/twilio/sms-triggers').then(({ sendBookingReceivedSms }) => {
      sendBookingReceivedSms({
        bookingCode: booking.booking.bookingCode,
        guestPhone: booking.booking.guestPhone,
        guestId: booking.booking.reviewerProfileId,
        car: booking.booking.car,
        startDate: booking.booking.startDate,
        endDate: booking.booking.endDate,
        bookingId: booking.booking.id,
      }).catch(e => console.error('[booking] Booking received SMS failed:', e))
    }).catch(e => console.error('[SMS] sms-triggers import failed:', e))

    // Host is NOT notified here — only after fleet approval (PATCH 'approve' → sendHostReviewEmail)

    // ALL bookings are pending review — return 202 Accepted
    const responseStatus = 202

    return NextResponse.json({
      success: true,
      verificationRequired: needsVerification,
      verificationReason: needsVerification ? verificationReason : null,
      paymentTiming,
      status: requiresManualReview ? 'fraud_review' : 'pending_review',
      riskAssessment: {
        score: riskScore,
        level: riskLevel
      },
      stripe: stripeCustomerId ? {
        testMode: true,
        customerId: stripeCustomerId,
        paymentIntentId: stripePaymentIntentId,
        paymentStatus: 'AUTHORIZED',
        amountToCharge: pricing.total,
        message: 'Payment held — will be charged when booking is confirmed'
      } : null,
      message: requiresManualReview
        ? 'Your booking is under review for security verification. We\'ll notify you within 1 hour.'
        : 'Your booking request has been received and is under review. Your card has been authorized but will not be charged until the booking is confirmed.',
      booking: {
        id: booking.booking.id,
        bookingCode: booking.booking.bookingCode,
        accessToken: booking.token,
        car: {
          make: booking.booking.car.make,
          model: booking.booking.car.model,
          year: booking.booking.car.year,
          photos: booking.booking.car.photos
        },
        host: (needsVerification || requiresManualReview) ? null : {
          name: booking.booking.host.name,
          phone: booking.booking.host.phone
        },
        dates: {
          start: booking.booking.startDate,
          end: booking.booking.endDate,
          startTime: booking.booking.startTime,
          endTime: booking.booking.endTime
        },
        pickup: {
          type: booking.booking.pickupType,
          location: booking.booking.pickupLocation,
          deliveryAddress: booking.booking.deliveryAddress
        },
        pricing: {
          subtotal: booking.booking.subtotal,
          deliveryFee: booking.booking.deliveryFee,
          insuranceFee: booking.booking.insuranceFee,
          serviceFee: booking.booking.serviceFee,
          taxes: booking.booking.taxes,
          total: booking.booking.totalAmount,
          deposit: booking.booking.depositAmount
        },
        status: booking.booking.status,
        paymentStatus: booking.booking.paymentStatus
      }
    }, { status: responseStatus })

  } catch (error: any) {
    // ========== ORPHAN PREVENTION: Cancel PI if booking creation failed ==========
    // If payment was already confirmed (requires_capture or succeeded) but the booking
    // failed to create, we must cancel/refund the PI to prevent orphaned holds.
    const piToCancel = stripePaymentIntentId || bookingData?.paymentIntentId
    if (piToCancel) {
      try {
        const orphanedPI = await stripe.paymentIntents.retrieve(piToCancel)
        if (orphanedPI.status === 'requires_capture') {
          await stripe.paymentIntents.cancel(piToCancel)
          console.log(`[book] Voided orphaned PI ${piToCancel} after booking failure: ${error?.message}`)
        } else if (orphanedPI.status === 'succeeded') {
          await stripe.refunds.create({ payment_intent: piToCancel })
          console.log(`[book] Refunded orphaned PI ${piToCancel} after booking failure: ${error?.message}`)
        }
      } catch (cancelErr) {
        console.error(`[book] CRITICAL: Failed to cancel orphaned PI ${piToCancel}:`, cancelErr)
      }
    }
    // ========== END ORPHAN PREVENTION ==========

    // Handle availability race condition (concurrent booking for same dates)
    if (error?.message === 'AVAILABILITY_CONFLICT') {
      return NextResponse.json(
        { error: 'Car is no longer available for selected dates', paymentCancelled: !!piToCancel },
        { status: 409 }
      )
    }

    console.error('Booking creation error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: (error as any).errors, paymentCancelled: !!piToCancel },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create booking', paymentCancelled: !!piToCancel },
      { status: 500 }
    )
  }
}

// GET - Retrieve booking details (supports guest access via token) - ENHANCED VERSION
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const bookingId = searchParams.get('id')
    const bookingCode = searchParams.get('code')
    const accessToken = searchParams.get('token')

    if (!bookingId && !bookingCode && !accessToken) {
      return NextResponse.json(
        { error: 'Booking ID, code, or access token required' },
        { status: 400 }
      )
    }

    // If using access token, verify it first
    if (accessToken) {
      const token = await prisma.guestAccessToken.findUnique({
        where: { token: accessToken },
        include: {
          booking: {
            select: {
              // All booking fields needed
              id: true,
              bookingCode: true,
              startDate: true,
              endDate: true,
              startTime: true,
              endTime: true,
              guestEmail: true,
              guestPhone: true,
              guestName: true,
              status: true,
              paymentStatus: true,
              verificationStatus: true,
              tripStatus: true,
              pickupLocation: true,
              pickupType: true,
              deliveryAddress: true,
              subtotal: true,
              deliveryFee: true,
              insuranceFee: true,
              serviceFee: true,
              taxes: true,
              totalAmount: true,
              depositAmount: true,
              
              car: {
                select: {
                  id: true,
                  make: true,
                  model: true,
                  year: true,
                  photos: {
                    select: {
                      url: true,
                      caption: true
                    },
                    take: 5
                  }
                }
              },
              
              host: {
                select: {
                  name: true,
                  phone: true,
                  email: true
                }
              },
              
              messages: {
                select: {
                  id: true,
                  message: true,
                  senderType: true,
                  createdAt: true,
                  isRead: true
                },
                orderBy: { createdAt: 'desc' }
              },
              
              FraudIndicator: {
                select: {
                  indicator: true,
                  severity: true
                }
              }
            }
          }
        }
      }) as any

      if (!token || token.expiresAt < new Date()) {
        return NextResponse.json(
          { error: 'Invalid or expired access token' },
          { status: 401 }
        )
      }

      // Calculate metadata for enhanced tracking experience
      const tokenAge = Math.floor((Date.now() - token.createdAt.getTime()) / 60000) // in minutes
      const isFirstVisit = !token.usedAt
      
      // Check if user has an account
      const accountExists = await prisma.user.findUnique({
        where: { email: token.booking.guestEmail }
      }) !== null
      
      // Count related bookings
      const relatedBookingsCount = await prisma.rentalBooking.count({
        where: { 
          guestEmail: token.booking.guestEmail,
          id: { not: token.booking.id } // Exclude current booking
        }
      })

      // Mark token as used (only on first real visit, not automated checks)
      if (!token.usedAt && tokenAge > 0) {
        await prisma.guestAccessToken.update({
          where: { id: token.id },
          data: { usedAt: new Date() }
        })
      }

      return NextResponse.json({ 
        booking: token.booking,
        isFirstVisit,
        tokenAge,
        accountExists,
        relatedBookingsCount
      })
    }

    // Standard booking lookup (by ID or code) - USING SELECT
    const booking = await prisma.rentalBooking.findFirst({
      where: {
        OR: [
          bookingId ? { id: bookingId } : {},
          bookingCode ? { bookingCode } : {}
        ].filter(condition => Object.keys(condition).length > 0)
      },
      select: {
        // All needed booking fields
        id: true,
        bookingCode: true,
        startDate: true,
        endDate: true,
        startTime: true,
        endTime: true,
        guestEmail: true,
        guestPhone: true,
        guestName: true,
        status: true,
        paymentStatus: true,
        verificationStatus: true,
        tripStatus: true,
        pickupLocation: true,
        pickupType: true,
        deliveryAddress: true,
        subtotal: true,
        deliveryFee: true,
        insuranceFee: true,
        serviceFee: true,
        taxes: true,
        totalAmount: true,
        depositAmount: true,
        
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            photos: {
              select: {
                url: true,
                caption: true
              },
              take: 5
            }
          }
        },
        
        host: {
          select: {
            name: true,
            phone: true,
            email: true
          }
        },
        
        messages: {
          select: {
            id: true,
            message: true,
            senderType: true,
            createdAt: true,
            isRead: true
          },
          orderBy: { createdAt: 'desc' }
        },
        
        FraudIndicator: {
          select: {
            indicator: true,
            severity: true
          }
        }
      }
    }) as any

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    // For non-token access, still provide basic metadata
    const accountExists = await prisma.user.findUnique({
      where: { email: booking.guestEmail }
    }) !== null
    
    const relatedBookingsCount = await prisma.rentalBooking.count({
      where: { 
        guestEmail: booking.guestEmail,
        id: { not: booking.id }
      }
    })

    return NextResponse.json({ 
      booking,
      isFirstVisit: false, // Non-token access is never first visit
      tokenAge: 0,
      accountExists,
      relatedBookingsCount
    })

  } catch (error) {
    console.error('Error fetching booking:', error)
    return NextResponse.json(
      { error: 'Failed to fetch booking' },
      { status: 500 }
    )
  }
}

// PATCH - Update booking status (kept for admin use) - WITH STRIPE CHARGING
export async function PATCH(request: NextRequest) {
  try {
    // Verify admin JWT auth (cookie-based)
    const adminAuth = await verifyAdminRequest(request)
    if (!adminAuth.isValid) {
      return NextResponse.json(
        { error: adminAuth.error || 'Admin authentication required' },
        { status: 401 }
      )
    }

    const { bookingId, action, data } = await request.json()

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        bookingCode: true,
        status: true,
        paymentStatus: true,
        verificationStatus: true,
        flaggedForReview: true,
        riskScore: true,
        stripeCustomerId: true,
        paymentIntentId: true,
        carId: true,
        hostId: true,
        startDate: true,
        endDate: true,
        guestEmail: true,
        totalAmount: true
      }
    }) as any

    if (!booking) {
      return NextResponse.json(
        { error: 'Booking not found' },
        { status: 404 }
      )
    }

    let updatedBooking
    switch (action) {
      case 'approve':
        // FLEET APPROVAL — does NOT capture payment or confirm booking
        // Sets fleetStatus=APPROVED, hostStatus=PENDING, notifies host
        if (booking.status !== (RentalBookingStatus.PENDING as any)) {
          return NextResponse.json(
            { error: 'Booking is not pending approval' },
            { status: 400 }
          )
        }

        updatedBooking = await prisma.$transaction(async (tx) => {
          const updated = await tx.rentalBooking.update({
            where: { id: bookingId },
            data: {
              fleetStatus: 'APPROVED',
              hostStatus: 'PENDING',
              hostNotifiedAt: new Date(),
              verificationStatus: 'APPROVED' as any,
              reviewedBy: adminAuth.payload?.email || adminAuth.payload?.sub || 'admin',
              reviewedAt: new Date(),
              licenseVerified: true,
              selfieVerified: true,
              flaggedForReview: false,
              riskNotes: data?.notes || null,
            },
            select: {
              id: true,
              bookingCode: true,
              status: true,
              fleetStatus: true,
              hostStatus: true,
              paymentStatus: true,
              verificationStatus: true,
              updatedAt: true
            }
          })

          // Log fleet approval
          await tx.activityLog.create({
            data: {
              id: crypto.randomUUID(),
              action: 'fleet_approved',
              entityType: 'RentalBooking',
              entityId: bookingId,
              metadata: {
                reviewedBy: adminAuth.payload?.email || adminAuth.payload?.sub || 'admin',
                wasFlagged: booking.flaggedForReview,
                riskScore: booking.riskScore,
                note: 'Fleet approved — awaiting host approval'
              },
              ipAddress: '127.0.0.1'
            }
          })

          return updated
        })

        // Send host review email — host needs to approve/reject
        const fullBookingForHost = await prisma.rentalBooking.findUnique({
          where: { id: bookingId },
          select: {
            id: true,
            guestEmail: true,
            guestName: true,
            bookingCode: true,
            startDate: true,
            endDate: true,
            totalAmount: true,
            numberOfDays: true,
            pickupLocation: true,
            car: {
              select: {
                make: true,
                model: true,
                year: true,
                photos: { select: { url: true }, take: 1 }
              }
            },
            host: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }) as any

        if (fullBookingForHost?.host?.email) {
          sendHostReviewEmail({
            hostEmail: fullBookingForHost.host.email,
            hostName: fullBookingForHost.host.name || 'Host',
            bookingCode: fullBookingForHost.bookingCode,
            guestName: fullBookingForHost.guestName,
            carMake: fullBookingForHost.car.make,
            carModel: fullBookingForHost.car.model,
            carYear: fullBookingForHost.car.year,
            carImage: fullBookingForHost.car.photos?.[0]?.url || '',
            startDate: fullBookingForHost.startDate.toISOString(),
            endDate: fullBookingForHost.endDate.toISOString(),
            pickupLocation: fullBookingForHost.pickupLocation || 'TBD',
            totalAmount: fullBookingForHost.totalAmount?.toFixed(2) || '0.00',
            numberOfDays: fullBookingForHost.numberOfDays || 1,
            reviewUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/partner/bookings/${fullBookingForHost.id}`
          }).catch(error => {
            console.error('Error sending host review email:', error)
          })
        }

        return NextResponse.json({
          booking: updatedBooking,
          message: 'Fleet approved — host has been notified for review'
        })

      case 'reject':
        updatedBooking = await prisma.$transaction(async (tx) => {
          const updated = await tx.rentalBooking.update({
            where: { id: bookingId },
            data: {
              status: RentalBookingStatus.CANCELLED as any,
              verificationStatus: 'REJECTED' as any,
              verificationNotes: data?.reason,
              reviewedBy: adminAuth.payload?.email || adminAuth.payload?.sub || 'admin',
              reviewedAt: new Date(),
              cancelledAt: new Date(),
              cancelledBy: 'ADMIN' as any,
              cancellationReason: data?.reason || 'Failed verification'
            },
            select: {
              id: true,
              bookingCode: true,
              status: true,
              verificationStatus: true,
              cancelledAt: true
            }
          })

          // Log rejection
          await tx.activityLog.create({
            data: {
              id: crypto.randomUUID(),
              action: 'booking_rejected',
              entityType: 'RentalBooking',
              entityId: bookingId,
              metadata: {
                reason: data?.reason,
                reviewedBy: adminAuth.payload?.email || adminAuth.payload?.sub || 'admin',
                riskScore: booking.riskScore
              },
              ipAddress: '127.0.0.1'
            }
          })

          return updated
        })

        // Release payment hold on fleet rejection
        if (booking.paymentIntentId) {
          try {
            const stripe = (await import('stripe')).default
            const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' as any })
            await stripeClient.paymentIntents.cancel(booking.paymentIntentId)
            await prisma.rentalBooking.update({
              where: { id: bookingId },
              data: { paymentStatus: 'REFUNDED' }
            })
            console.log(`[Fleet Reject] Payment hold released for ${booking.bookingCode}`)
          } catch (stripeError: any) {
            console.error(`[Fleet Reject] Failed to release payment hold for ${booking.bookingCode}:`, stripeError.message)
          }
        }
        break

      case 'cancel':
        // Standard cancellation logic
        const now = new Date()
        const startDate = new Date(booking.startDate)
        const hoursUntilStart = (startDate.getTime() - now.getTime()) / (1000 * 60 * 60)

        if (hoursUntilStart < 24) {
          return NextResponse.json(
            { error: 'Cannot cancel within 24 hours of start time' },
            { status: 400 }
          )
        }

        updatedBooking = await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: {
            status: RentalBookingStatus.CANCELLED as any,
            paymentStatus: 'REFUNDED' as any,
            cancelledAt: new Date(),
            cancelledBy: 'ADMIN' as any,
            cancellationReason: data?.reason || 'Admin cancellation'
          },
          select: {
            id: true,
            bookingCode: true,
            status: true,
            paymentStatus: true,
            cancelledAt: true
          }
        })

        // Release payment hold on cancellation
        if (booking.paymentIntentId) {
          try {
            const stripe = (await import('stripe')).default
            const stripeClient = new stripe(process.env.STRIPE_SECRET_KEY!, { apiVersion: '2025-08-27.basil' as any })
            await stripeClient.paymentIntents.cancel(booking.paymentIntentId)
            console.log(`[Fleet Cancel] Payment hold released for ${booking.bookingCode}`)
          } catch (stripeError: any) {
            console.error(`[Fleet Cancel] Failed to release payment hold for ${booking.bookingCode}:`, stripeError.message)
          }
        }
        break

      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }

    return NextResponse.json({ booking: updatedBooking })

  } catch (error) {
    console.error('Error updating booking:', error)
    return NextResponse.json(
      { error: 'Failed to update booking' },
      { status: 500 }
    )
  }
}

// Helper functions
function generateBookingCode(): string {
  const prefix = 'RENT'
  const year = new Date().getFullYear()
  const random = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${prefix}-${year}-${random}`
}

function calculateAge(dateOfBirth: string): number {
  const today = new Date()
  const birthDate = parseArizonaDate(dateOfBirth)
  let age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    age--
  }
  
  return age
}