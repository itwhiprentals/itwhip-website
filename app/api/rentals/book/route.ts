// app/api/rentals/book/route.ts
import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { z } from 'zod'
import { RentalBookingStatus } from '@/app/lib/dal/types'
import { sendHostNotification } from '@/app/lib/email'
import { calculatePricing } from '@/app/(guest)/rentals/lib/pricing'
import { addHours } from 'date-fns'
import { extractIpAddress } from '@/app/utils/ip-lookup'
import { sendBookingConfirmation, sendPendingReviewEmail, sendFraudAlertEmail } from '@/app/lib/email/booking-emails'

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
  insurance: z.enum(['none', 'basic', 'premium']),
  
  // Driver verification info
  driverInfo: z.object({
    licenseNumber: z.string(),
    licenseState: z.string(),
    licenseExpiry: z.string().optional(),
    dateOfBirth: z.string(),
    licensePhotoUrl: z.string().optional(),
    insurancePhotoUrl: z.string().optional(),
    selfiePhotoUrl: z.string().optional(),
  }),
  
  // Payment (verification determines timing)
  paymentIntentId: z.string().optional(),
  paymentMethodId: z.string().optional(), // For saving card
  notes: z.string().optional(),
  
  // Fraud detection data from client
  fraudData: z.object({
    deviceFingerprint: z.string(),
    sessionData: z.any().optional(),
    botSignals: z.array(z.string()).optional()
  }).optional()
})

export async function POST(request: NextRequest) {
  try {
    // Parse and validate request body
    const body = await request.json()
    const validationResult = bookingSchema.safeParse(body)

    if (!validationResult.success) {
      return NextResponse.json(
        { error: 'Invalid booking data', details: validationResult.error.flatten() },
        { status: 400 }
      )
    }

    const bookingData = validationResult.data

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
            depositAmount: true
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
        const JWT_SECRET = process.env.JWT_SECRET || 'fallback-secret-key'
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

    // Calculate pricing with city-specific tax rate
    const driverAge = calculateDriverAge(bookingData.driverInfo.dateOfBirth)
    const pricing = calculatePricing({
      dailyRate: car.dailyRate,
      startDate: bookingData.startDate,
      endDate: bookingData.endDate,
      deliveryFee: car.deliveryFee || 0,
      city: car.city || 'Phoenix'  // Pass city for tax calculation
    })
    // Deposit comes from the host, not from calculatePricing
    const depositAmount = car.host.depositAmount || 0

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
    let stripePaymentIntentId: string | null = null
    let stripePaymentMethodId: string | null = null
    let paymentAlreadyConfirmed = false

    // Check if a pre-confirmed PaymentIntent was provided (from Payment Element)
    if (bookingData.paymentIntentId) {
      try {
        console.log('🔷 Verifying pre-confirmed PaymentIntent:', bookingData.paymentIntentId)
        const existingPaymentIntent = await stripe.paymentIntents.retrieve(bookingData.paymentIntentId)

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

    // Generate booking code
    const bookingCode = generateBookingCode()

    // Create the booking in a transaction
    const booking = await prisma.$transaction(async (tx) => {
      // Create the booking with appropriate status
      const newBooking = await tx.rentalBooking.create({
        data: {
          id: crypto.randomUUID(),
          bookingCode,
          updatedAt: new Date(),
          carId: bookingData.carId,
          hostId: car.hostId,
          
          // Guest information (no renterId for guest bookings)
          guestEmail: bookingData.guestEmail,
          guestPhone: bookingData.guestPhone,
          guestName: bookingData.guestName,
          
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
          serviceFee: pricing.serviceFee,
          taxes: pricing.taxes,
          totalAmount: pricing.total,
          depositAmount: depositAmount,
          securityDeposit: depositAmount || 0,
          depositHeld: 0,

          // Status based on verification requirements AND fraud risk
          status: ((needsVerification || requiresManualReview) ? RentalBookingStatus.PENDING : RentalBookingStatus.CONFIRMED) as any,
          // Payment is PAID if already confirmed via Payment Element, otherwise based on verification
          paymentStatus: (paymentAlreadyConfirmed ? 'PAID' : ((needsVerification || requiresManualReview) ? 'PENDING' : 'PAID')) as any,
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
          insurancePhotoUrl: bookingData.driverInfo.insurancePhotoUrl,
          selfieVerified: (needsVerification || requiresManualReview) ? false : true,
          selfiePhotoUrl: bookingData.driverInfo.selfiePhotoUrl,
          dateOfBirth: parseArizonaDate(bookingData.driverInfo.dateOfBirth),
          
          // Verification status
          verificationStatus: (requiresManualReview ? 'SUBMITTED' : (needsVerification ? 'SUBMITTED' : 'APPROVED')) as any,
          documentsSubmittedAt: (needsVerification || requiresManualReview) ? new Date() : null,
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
              documentsVerified: true
            }
          })

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
              // Calculate what can be applied
              const maxBonusPercentage = 0.25 // 25% max of base price

              // 1. Calculate max bonus (25% of base rental price)
              const basePrice = pricing.subtotal - pricing.insurance - pricing.delivery
              const maxBonusAllowed = Math.round(basePrice * maxBonusPercentage * 100) / 100
              bonusApplied = Math.min(balances.bonusBalance, maxBonusAllowed, pricing.total)

              // 2. Credits apply to remaining (100% usable)
              const afterBonus = pricing.total - bonusApplied
              creditsApplied = Math.min(balances.creditBalance, afterBonus)

              // 3. Final charge amount
              chargeAmount = Math.round((pricing.total - creditsApplied - bonusApplied) * 100) / 100

              // 4. Deposit from wallet
              depositFromWallet = Math.min(balances.depositWalletBalance, depositAmount)
              depositFromCard = Math.round((depositAmount - depositFromWallet) * 100) / 100

              console.log('💰 Financial breakdown (verified guest):', {
                originalTotal: pricing.total,
                creditsApplied,
                bonusApplied,
                chargeAmount,
                depositFromWallet,
                depositFromCard
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
      if (stripePaymentIntentId && chargeAmount < pricing.total) {
        try {
          await stripe.paymentIntents.update(stripePaymentIntentId, {
            amount: Math.round(chargeAmount * 100), // Amount in cents
            metadata: {
              originalTotal: pricing.total.toString(),
              creditsApplied: creditsApplied.toString(),
              bonusApplied: bonusApplied.toString(),
              chargeAmount: chargeAmount.toString()
            }
          })
          console.log('✅ Updated Stripe PaymentIntent amount to:', chargeAmount)
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
    }) as any

    // Send appropriate emails based on status
    if (requiresManualReview) {
      // FRAUD REVIEW: Send special review email to guest
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
        estimatedReviewTime: 'within 1 hour',
        trackingUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/rentals/dashboard/guest/${booking.token}`,
        accessToken: booking.token
      }).catch(error => {
        console.error('Error sending review email:', error)
      })
    } else if (needsVerification) {
      // Verification required: Send pending review email to guest
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
        estimatedReviewTime,
        trackingUrl: `${process.env.NEXT_PUBLIC_BASE_URL}/rentals/dashboard/guest/${booking.token}`,
        accessToken: booking.token
      }).catch(error => {
        console.error('Error sending pending review email:', error)
      })
    } else {
      // Instant confirmation: Send immediate confirmation
      Promise.all([
        sendBookingConfirmation({
          ...booking.booking,
          accessToken: booking.token
        })
      ]).catch(error => {
        console.error('Error sending booking emails:', error)
      })
    }

    // Return booking details with appropriate message and status code
    const responseStatus = requiresManualReview ? 202 : 201
    
    return NextResponse.json({
      success: true,
      verificationRequired: needsVerification,
      verificationReason: needsVerification ? verificationReason : null,
      paymentTiming,
      status: requiresManualReview ? 'fraud_review' : (needsVerification ? 'pending_review' : 'confirmed'),
      riskAssessment: {
        score: riskScore,
        level: riskLevel
      },
      // ========== STRIPE TEST INFO ==========
      stripe: stripeCustomerId ? {
        testMode: true,
        customerId: stripeCustomerId,
        paymentIntentId: stripePaymentIntentId,
        paymentStatus: 'PENDING',
        amountToCharge: pricing.total,
        message: 'TEST MODE: Card will be charged on approval'
      } : null,
      // ========== END STRIPE INFO ==========
      message: requiresManualReview 
        ? 'Your booking is under review for security verification. We\'ll notify you within 1 hour.'
        : (needsVerification 
          ? getVerificationMessage(verificationReason)
          : 'Your booking is confirmed!'),
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

  } catch (error) {
    console.error('Booking creation error:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Validation error', details: (error as any).errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create booking' },
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
    const { bookingId, action, data, adminToken } = await request.json()

    // For now, require a simple admin token
    // TODO: Implement proper admin authentication
    if (!adminToken || adminToken !== process.env.ADMIN_TOKEN) {
      return NextResponse.json(
        { error: 'Admin authentication required' },
        { status: 401 }
      )
    }

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
        // Only for bookings in PENDING status
        if (booking.status !== (RentalBookingStatus.PENDING as any)) {
          return NextResponse.json(
            { error: 'Booking is not pending approval' },
            { status: 400 }
          )
        }

        // ========== STRIPE TEST PAYMENT PROCESSING ==========
        let paymentResult = null
        if (booking.stripeCustomerId && booking.paymentIntentId) {
          try {
            console.log('🔷 Processing TEST Stripe payment for booking:', booking.bookingCode)
            console.log('🔷 Customer ID:', booking.stripeCustomerId)
            console.log('🔷 Payment Intent ID:', booking.paymentIntentId)
            
            // For testing, we'll use a test payment method
            // In production, you'd use the saved payment method
            const testPaymentMethod = await stripe.paymentMethods.create({
              type: 'card',
              card: {
                token: 'tok_visa' // Stripe test token
              }
            })
            
            // Attach test payment method to customer
            await stripe.paymentMethods.attach(testPaymentMethod.id, {
              customer: booking.stripeCustomerId
            })
            
            // Confirm the payment intent
            const paymentIntent = await stripe.paymentIntents.confirm(
              booking.paymentIntentId,
              {
                payment_method: testPaymentMethod.id,
                return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/rentals/dashboard/bookings/${booking.id}`
              }
            )
            
            console.log('🔷 Payment Intent Status:', paymentIntent.status)
            console.log('🔷 Amount charged (TEST):', `$${(paymentIntent.amount / 100).toFixed(2)}`)
            
            // If payment requires capture (manual capture mode)
            if (paymentIntent.status === 'requires_capture') {
              const capturedIntent = await stripe.paymentIntents.capture(booking.paymentIntentId)
              console.log('🔷 Payment captured:', capturedIntent.status)
              paymentResult = {
                success: true,
                status: capturedIntent.status,
                amount: capturedIntent.amount / 100,
                testMode: true
              }
            } else if (paymentIntent.status === 'succeeded') {
              paymentResult = {
                success: true,
                status: paymentIntent.status,
                amount: paymentIntent.amount / 100,
                testMode: true
              }
            }
            
          } catch (stripeError: any) {
            console.error('❌ Stripe TEST payment error:', stripeError)
            paymentResult = {
              success: false,
              error: stripeError.message,
              testMode: true
            }
          }
        }
        // ========== END STRIPE PAYMENT ==========

        updatedBooking = await prisma.$transaction(async (tx) => {
          // Update booking status
          const updated = await tx.rentalBooking.update({
            where: { id: bookingId },
            data: {
              status: RentalBookingStatus.CONFIRMED as any,
              paymentStatus: (paymentResult?.success ? 'PAID' : 'FAILED') as any,
              verificationStatus: 'APPROVED' as any,
              reviewedBy: data?.reviewedBy || 'admin',
              reviewedAt: new Date(),
              licenseVerified: true,
              selfieVerified: true,
              flaggedForReview: false,
              riskNotes: data?.notes || null,
              // Store payment result
              paymentIntentId: booking.paymentIntentId,
              paymentProcessedAt: paymentResult?.success ? new Date() : null
            },
            select: {
              id: true,
              bookingCode: true,
              status: true,
              paymentStatus: true,
              verificationStatus: true,
              updatedAt: true
            }
          })

          // Update car statistics
          await tx.rentalCar.update({
            where: { id: booking.carId },
            data: {
              totalTrips: { increment: 1 }
            }
          })

          // Block availability dates
          const dates = []
          const currentDate = new Date(booking.startDate)
          const endDate = new Date(booking.endDate)

          while (currentDate <= endDate) {
            dates.push(new Date(currentDate))
            currentDate.setDate(currentDate.getDate() + 1)
          }

          await tx.rentalAvailability.createMany({
            data: dates.map(date => ({
              id: crypto.randomUUID(),
              carId: booking.carId,
              date,
              isAvailable: false,
              note: `Booked - ${booking.bookingCode}`
            })),
            skipDuplicates: true
          })

          // Log approval with payment info
          await tx.activityLog.create({
            data: {
              id: crypto.randomUUID(),
              action: 'booking_approved',
              entityType: 'RentalBooking',
              entityId: bookingId,
              metadata: {
                reviewedBy: data?.reviewedBy || 'admin',
                wasFlaged: booking.flaggedForReview,
                riskScore: booking.riskScore,
                paymentProcessed: paymentResult?.success || false,
                paymentAmount: paymentResult?.amount || 0,
                stripeTestMode: true
              },
              ipAddress: '127.0.0.1'
            }
          })

          return updated
        })

        // Send confirmation emails
        const fullBooking = await prisma.rentalBooking.findUnique({
          where: { id: bookingId },
          select: {
            guestEmail: true,
            guestName: true,
            bookingCode: true,
            startDate: true,
            endDate: true,
            totalAmount: true,
            car: {
              select: {
                make: true,
                model: true,
                year: true
              }
            },
            host: {
              select: {
                name: true,
                email: true
              }
            }
          }
        }) as any

        if (fullBooking) {
          Promise.all([
            sendBookingConfirmation(fullBooking),
            sendHostNotification(fullBooking)
          ]).catch(error => {
            console.error('Error sending approval emails:', error)
          })
        }
        
        // Include payment result in response
        return NextResponse.json({ 
          booking: updatedBooking,
          payment: paymentResult
        })

      case 'reject':
        updatedBooking = await prisma.$transaction(async (tx) => {
          const updated = await tx.rentalBooking.update({
            where: { id: bookingId },
            data: {
              status: RentalBookingStatus.CANCELLED as any,
              verificationStatus: 'REJECTED' as any,
              verificationNotes: data?.reason,
              reviewedBy: data?.reviewedBy || 'admin',
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
                reviewedBy: data?.reviewedBy || 'admin',
                riskScore: booking.riskScore
              },
              ipAddress: '127.0.0.1'
            }
          })

          return updated
        })
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