// scripts/investigate-ghost-booking.ts
// Diagnostic script: Find all DB traces of Krystal Carlson Shaw's ghost booking (Feb 7, 2026)
// Payment exists in Stripe (pi_3SyDYhIZPP7mao581yV0JVo7, $209.65 Succeeded) but no booking in DB
// Run: npx tsx scripts/investigate-ghost-booking.ts

import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })
dotenv.config()
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const GUEST_EMAIL = 'krystal33342@gmail.com'
const GUEST_ID = 'nNK9XZ2dKQlwizHKU2Hum'
const PAYMENT_INTENT_ID = 'pi_3SyDYhIZPP7mao581yV0JVo7'
const CAR_ID = 'cmk52adnb0001jv04ys7lyfyg'
const FEB_7_START = new Date('2026-02-07T00:00:00Z')
const FEB_7_END = new Date('2026-02-08T00:00:00Z')

function section(title: string) {
  console.log('\n' + '='.repeat(70))
  console.log(`  ${title}`)
  console.log('='.repeat(70))
}

function result(label: string, data: any) {
  if (!data || (Array.isArray(data) && data.length === 0)) {
    console.log(`  ❌ ${label}: NONE FOUND`)
  } else if (Array.isArray(data)) {
    console.log(`  ✅ ${label}: ${data.length} record(s)`)
    data.forEach((item, i) => {
      console.log(`     [${i + 1}]`, JSON.stringify(item, null, 2).split('\n').join('\n         '))
    })
  } else {
    console.log(`  ✅ ${label}: FOUND`)
    console.log('    ', JSON.stringify(data, null, 2).split('\n').join('\n     '))
  }
}

async function investigate() {
  console.log('╔══════════════════════════════════════════════════════════════════════╗')
  console.log('║  GHOST BOOKING INVESTIGATION — Krystal Carlson Shaw                 ║')
  console.log('║  Email: krystal33342@gmail.com                                      ║')
  console.log('║  Stripe PI: pi_3SyDYhIZPP7mao581yV0JVo7 ($209.65 Succeeded)        ║')
  console.log('║  Date: February 7, 2026                                             ║')
  console.log('╚══════════════════════════════════════════════════════════════════════╝')

  // 1. RentalBooking — by email OR paymentIntentId
  section('1. RENTAL BOOKINGS (by email or PaymentIntent)')
  const bookingsByEmail = await prisma.rentalBooking.findMany({
    where: { guestEmail: GUEST_EMAIL },
    select: {
      id: true, bookingCode: true, status: true, paymentStatus: true,
      guestEmail: true, guestName: true, paymentIntentId: true,
      carId: true, totalAmount: true, createdAt: true, updatedAt: true,
      reviewerProfileId: true, hostId: true, startDate: true, endDate: true,
    },
    orderBy: { createdAt: 'desc' }
  })
  result('Bookings by email', bookingsByEmail)

  const bookingsByPI = await prisma.rentalBooking.findMany({
    where: { paymentIntentId: PAYMENT_INTENT_ID },
    select: {
      id: true, bookingCode: true, status: true, paymentStatus: true,
      guestEmail: true, paymentIntentId: true, totalAmount: true, createdAt: true
    }
  })
  result('Bookings by PaymentIntent ID', bookingsByPI)

  // 2. ReviewerProfile
  section('2. REVIEWER PROFILE')
  const profile = await prisma.reviewerProfile.findUnique({
    where: { id: GUEST_ID },
    select: {
      id: true, email: true, name: true, userId: true,
      isVerified: true, fullyVerified: true, documentsVerified: true,
      tripCount: true, reviewCount: true, creditBalance: true,
      suspensionLevel: true, createdAt: true, updatedAt: true,
      _count: { select: { RentalBooking: true } }
    }
  })
  result('Profile by ID', profile)

  // Also check by email in case ID doesn't match
  const profileByEmail = await prisma.reviewerProfile.findUnique({
    where: { email: GUEST_EMAIL },
    select: { id: true, email: true, name: true, userId: true }
  })
  result('Profile by email', profileByEmail)

  // 3. User account (linked from profile)
  section('3. USER ACCOUNT')
  if (profile?.userId) {
    const user = await prisma.user.findUnique({
      where: { id: profile.userId },
      select: {
        id: true, email: true, name: true, role: true, isActive: true,
        emailVerified: true, createdAt: true, lastActive: true,
      }
    })
    result('Linked User account', user)
  } else {
    console.log('  ⚠️  No userId linked to ReviewerProfile')
  }

  // 4. ActivityLog
  section('4. ACTIVITY LOG (all time)')
  const activities = await prisma.activityLog.findMany({
    where: {
      OR: [
        { guestId: GUEST_ID },
        { metadata: { path: ['guestEmail'], equals: GUEST_EMAIL } },
      ]
    },
    select: {
      id: true, action: true, entityType: true, entityId: true,
      metadata: true, ipAddress: true, severity: true, createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  })
  result('Activity log entries', activities)

  // 5. DL Verification Logs
  section('5. DL VERIFICATION LOGS')
  const dlLogs = await prisma.dLVerificationLog.findMany({
    where: { guestEmail: GUEST_EMAIL },
    select: {
      id: true, guestEmail: true, guestName: true, passed: true,
      score: true, recommendation: true, criticalFlags: true,
      extractedName: true, extractedState: true, bookingId: true,
      createdAt: true
    },
    orderBy: { createdAt: 'desc' },
    take: 10
  })
  result('DL verification attempts', dlLogs)

  // 6. PendingCheckout — sessions from Feb 7
  section('6. PENDING CHECKOUT SESSIONS (Feb 7)')
  const checkouts = await prisma.pendingCheckout.findMany({
    where: {
      createdAt: { gte: FEB_7_START, lt: FEB_7_END }
    },
    select: {
      id: true, checkoutSessionId: true, vehicleId: true,
      userId: true, visitorId: true, status: true,
      startDate: true, endDate: true,
      selectedInsurance: true, selectedDelivery: true,
      expiresAt: true, createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })
  result('All checkout sessions on Feb 7', checkouts)

  // 7. Car bookings around Feb 7 dates
  section('7. CAR BOOKINGS (cmk52adnb0001jv04ys7lyfyg around Feb 7)')
  const carBookings = await prisma.rentalBooking.findMany({
    where: {
      carId: CAR_ID,
      createdAt: { gte: new Date('2026-02-01'), lt: new Date('2026-02-15') }
    },
    select: {
      id: true, bookingCode: true, status: true, guestEmail: true,
      paymentIntentId: true, totalAmount: true, startDate: true,
      endDate: true, createdAt: true
    },
    orderBy: { createdAt: 'desc' }
  })
  result('Bookings on this car (Feb 1-15)', carBookings)

  // Also check what car this is
  const car = await prisma.rentalCar.findUnique({
    where: { id: CAR_ID },
    select: {
      id: true, make: true, model: true, year: true, dailyRate: true,
      isActive: true, city: true, hostId: true,
      host: { select: { name: true, email: true } }
    }
  })
  result('Car details', car)

  // 8. SecurityEvent
  section('8. SECURITY EVENTS')
  try {
    const secEvents = await prisma.securityEvent.findMany({
      where: {
        OR: [
          { message: { contains: GUEST_EMAIL } },
          { details: { contains: GUEST_EMAIL } },
        ],
        timestamp: { gte: FEB_7_START, lt: FEB_7_END }
      },
      take: 20,
      orderBy: { timestamp: 'desc' }
    })
    result('Security events on Feb 7', secEvents)
  } catch {
    console.log('  ⚠️  SecurityEvent query failed (metadata filtering may not be supported)')
  }

  // 9. LoginAttempt
  section('9. LOGIN ATTEMPTS')
  const loginAttempts = await prisma.loginAttempt.findMany({
    where: {
      identifier: GUEST_EMAIL,
      timestamp: { gte: FEB_7_START, lt: FEB_7_END }
    },
    select: {
      id: true, identifier: true, success: true, reason: true,
      ipAddress: true, userAgent: true, timestamp: true
    },
    orderBy: { timestamp: 'desc' }
  })
  result('Login attempts on Feb 7', loginAttempts)

  // 10. Sessions
  section('10. USER SESSIONS')
  if (profile?.userId) {
    const sessions = await prisma.session.findMany({
      where: { userId: profile.userId },
      select: {
        id: true, ipAddress: true, userAgent: true,
        createdAt: true, expiresAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 10
    })
    result('Recent sessions', sessions)
  } else {
    console.log('  ⚠️  No userId — cannot query sessions')
  }

  // 11. Check for ALL bookings with this PaymentIntent across the entire DB
  section('11. GLOBAL SEARCH — PaymentIntent in any booking')
  const globalPI = await prisma.rentalBooking.findMany({
    where: {
      OR: [
        { paymentIntentId: PAYMENT_INTENT_ID },
        { sessionId: { contains: 'SyDYh' } }, // partial PI match
      ]
    },
    select: {
      id: true, bookingCode: true, guestEmail: true, paymentIntentId: true,
      status: true, totalAmount: true, createdAt: true
    }
  })
  result('Any booking with this PaymentIntent', globalPI)

  // Summary
  section('SUMMARY')
  const hasBooking = bookingsByEmail.length > 0 || bookingsByPI.length > 0
  const hasProfile = !!profile
  const hasActivity = activities.length > 0
  const hasDL = dlLogs.length > 0

  console.log(`  Guest Profile: ${hasProfile ? '✅ EXISTS' : '❌ MISSING'}`)
  console.log(`  Booking Record: ${hasBooking ? '✅ EXISTS' : '❌ MISSING — THIS IS THE PROBLEM'}`)
  console.log(`  Activity Log: ${hasActivity ? '✅ Has entries' : '❌ No entries'}`)
  console.log(`  DL Verification: ${hasDL ? '✅ Has attempts' : '❌ No attempts'}`)
  console.log(`  Stripe PI: ✅ EXISTS (pi_3SyDYhIZPP7mao581yV0JVo7, $209.65 Succeeded)`)
  console.log()

  if (!hasBooking) {
    console.log('  🔴 CONCLUSION: Payment was charged in Stripe but booking was NEVER created')
    console.log('     in the database. The POST to /api/rentals/book either:')
    console.log('     - Never fired (frontend JS error, browser closed)')
    console.log('     - Returned an error (validation, availability, server error)')
    console.log('     - Timed out (network issue)')
    console.log()
    console.log('  📋 FOR STRIPE SUPPORT: The error is on our side. The payment was')
    console.log('     successfully processed by Stripe, but our application failed to')
    console.log('     create the corresponding booking record in our database. This is')
    console.log('     a gap in our two-step client-side flow where payment confirmation')
    console.log('     and booking creation are separate HTTP requests.')
  }
}

investigate()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
