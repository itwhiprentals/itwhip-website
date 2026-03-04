#!/usr/bin/env npx tsx
// ──────────────────────────────────────────────────────────────────────
// reset-pedro-test.ts
// Resets Pedro Rentals test environment back to:
//   "Host received the email, no booking, no car, guest doesn't exist"
//
// Usage:
//   npx tsx scripts/reset-pedro-test.ts          # dry run (default)
//   npx tsx scripts/reset-pedro-test.ts --execute # actually run
// ──────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DRY = !process.argv.includes('--execute')

const HOST_ID = 'siLdeZNv3e7Q5zqr-MgHv'
const PROSPECT_ID = 'cmm8dcwyg0002c9v029wxd6q7'
const REQUEST_ID = 'cmm8d0z7d0000c9v0mw61xu31'

async function main() {
  console.log(DRY ? '\n=== DRY RUN (pass --execute to apply) ===\n' : '\n=== EXECUTING RESET ===\n')

  // 1. Find all bookings for this host
  const bookings = await prisma.rentalBooking.findMany({
    where: { hostId: HOST_ID },
    select: { id: true, status: true, guestName: true, renterId: true, carId: true }
  })
  console.log(`Bookings found: ${bookings.length}`)
  bookings.forEach(b => console.log(`  - ${b.id} [${b.status}] ${b.guestName}`))

  // 2. Find all cars for this host
  const cars = await prisma.rentalCar.findMany({
    where: { hostId: HOST_ID },
    select: { id: true, make: true, model: true, year: true }
  })
  console.log(`Cars found: ${cars.length}`)
  cars.forEach(c => console.log(`  - ${c.id} ${c.year} ${c.make} ${c.model}`))

  // 3. Find all guest users (renters) from these bookings
  const renterIds = [...new Set(bookings.map(b => b.renterId).filter(Boolean))] as string[]
  const guests = renterIds.length > 0 ? await prisma.user.findMany({
    where: { id: { in: renterIds } },
    select: { id: true, name: true, email: true }
  }) : []
  console.log(`Guest users found: ${guests.length}`)
  guests.forEach(g => console.log(`  - ${g.id} ${g.name} <${g.email}>`))

  // 4. Find guest reviewer profiles
  const guestProfiles = renterIds.length > 0 ? await prisma.reviewerProfile.findMany({
    where: { userId: { in: renterIds } },
    select: { id: true, userId: true }
  }) : []
  console.log(`Guest profiles found: ${guestProfiles.length}`)

  // 5. Find request claims
  const claims = await prisma.requestClaim.findMany({
    where: { hostId: HOST_ID },
    select: { id: true, status: true, bookingId: true, carId: true }
  })
  console.log(`Request claims found: ${claims.length}`)

  // 6. Collect all booking IDs and car IDs
  const bookingIds = bookings.map(b => b.id)
  const carIds = cars.map(c => c.id)

  if (DRY) {
    console.log('\n--- What will be deleted/reset ---')
    console.log(`  GuestAccessTokens for ${bookingIds.length} booking(s)`)
    console.log(`  RentalMessages for ${bookingIds.length} booking(s)`)
    console.log(`  PlatformFeesOwed for host ${HOST_ID}`)
    console.log(`  CreditBonusTransactions for ${renterIds.length} guest(s)`)
    console.log(`  HostDeductibles for host ${HOST_ID}`)
    console.log(`  CarPhotos for ${carIds.length} car(s)`)
    console.log(`  BookingStatusHistory for ${bookingIds.length} booking(s)`)
    console.log(`  SmsLogs for ${bookingIds.length} booking(s)`)
    console.log(`  CallLogs for ${bookingIds.length} booking(s)`)
    console.log(`  RequestClaims: ${claims.length}`)
    console.log(`  Bookings: ${bookingIds.length}`)
    console.log(`  Cars: ${carIds.length}`)
    console.log(`  Sessions for ${renterIds.length} guest(s)`)
    console.log(`  ReviewerProfiles: ${guestProfiles.length}`)
    console.log(`  Guest Users: ${guests.length}`)
    console.log(`  ReservationRequest ${REQUEST_ID} → status reset to OPEN, fulfilledBookingId → null`)
    console.log(`  Prospect ${PROSPECT_ID} → onboarding flags cleared`)
    console.log(`  Host ${HOST_ID} → onboarding timestamps cleared`)
    console.log('\nRun with --execute to apply.')
    return
  }

  // ── EXECUTE ──────────────────────────────────────────────────

  // Delete FK children of bookings
  if (bookingIds.length > 0) {
    const r1 = await prisma.guestAccessToken.deleteMany({ where: { bookingId: { in: bookingIds } } })
    console.log(`GuestAccessTokens deleted: ${r1.count}`)

    const r2 = await prisma.rentalMessage.deleteMany({ where: { bookingId: { in: bookingIds } } })
    console.log(`RentalMessages deleted: ${r2.count}`)

    // BookingStatusHistory — may or may not exist as a model
    try {
      const r3 = await (prisma as any).bookingStatusHistory.deleteMany({ where: { bookingId: { in: bookingIds } } })
      console.log(`BookingStatusHistory deleted: ${r3.count}`)
    } catch { console.log('BookingStatusHistory: skipped (model not found)') }

    // SmsLogs
    try {
      const r4 = await prisma.smsLog.deleteMany({ where: { bookingId: { in: bookingIds } } })
      console.log(`SmsLogs deleted: ${r4.count}`)
    } catch { console.log('SmsLogs: skipped') }

    // CallLogs
    try {
      const r5 = await prisma.callLog.deleteMany({ where: { bookingId: { in: bookingIds } } })
      console.log(`CallLogs deleted: ${r5.count}`)
    } catch { console.log('CallLogs: skipped') }
  }

  // Platform fees & deductibles
  const r6 = await prisma.platformFeeOwed.deleteMany({ where: { hostId: HOST_ID } })
  console.log(`PlatformFeesOwed deleted: ${r6.count}`)

  const r7 = await prisma.hostDeductible.deleteMany({ where: { hostId: HOST_ID } })
  console.log(`HostDeductibles deleted: ${r7.count}`)

  // Credit transactions for guests
  if (renterIds.length > 0) {
    const r8 = await prisma.creditBonusTransaction.deleteMany({ where: { userId: { in: renterIds } } })
    console.log(`CreditBonusTransactions deleted: ${r8.count}`)
  }

  // Car photos
  if (carIds.length > 0) {
    const r9 = await prisma.carPhoto.deleteMany({ where: { carId: { in: carIds } } })
    console.log(`CarPhotos deleted: ${r9.count}`)
  }

  // Request claims — always delete (they get recreated on claim)
  const r10 = await prisma.requestClaim.deleteMany({ where: { hostId: HOST_ID } })
  console.log(`RequestClaims deleted: ${r10.count}`)

  // Delete bookings
  if (bookingIds.length > 0) {
    for (const id of bookingIds) {
      try {
        await prisma.rentalBooking.delete({ where: { id } })
        console.log(`Booking deleted: ${id}`)
      } catch (e) {
        console.error(`Booking ${id} FAILED:`, String(e).substring(0, 200))
      }
    }
  }

  // Delete cars
  if (carIds.length > 0) {
    for (const id of carIds) {
      try {
        await prisma.rentalCar.delete({ where: { id } })
        console.log(`Car deleted: ${id}`)
      } catch (e) {
        console.error(`Car ${id} FAILED:`, String(e).substring(0, 200))
      }
    }
  }

  // Delete guest sessions, profiles, users
  if (renterIds.length > 0) {
    const r11 = await prisma.session.deleteMany({ where: { userId: { in: renterIds } } })
    console.log(`Sessions deleted: ${r11.count}`)

    for (const profile of guestProfiles) {
      await prisma.reviewerProfile.delete({ where: { id: profile.id } })
      console.log(`ReviewerProfile deleted: ${profile.id}`)
    }

    for (const guest of guests) {
      try {
        await prisma.user.delete({ where: { id: guest.id } })
        console.log(`User deleted: ${guest.id} (${guest.email})`)
      } catch (e) {
        console.error(`User ${guest.id} FAILED:`, String(e).substring(0, 200))
      }
    }
  }

  // Reset ReservationRequest back to OPEN
  await prisma.reservationRequest.update({
    where: { id: REQUEST_ID },
    data: {
      status: 'OPEN',
      fulfilledBookingId: null,
      viewCount: 0,
      claimAttempts: 0,
    }
  })
  console.log(`ReservationRequest ${REQUEST_ID} → OPEN`)

  // Reset prospect onboarding flags + push invite expiry 7 days out
  const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await prisma.hostProspect.update({
    where: { id: PROSPECT_ID },
    data: {
      onboardingStartedAt: null,
      onboardingCompletedAt: null,
      carPhotosUploaded: false,
      ratesConfigured: false,
      payoutConnected: false,
      agreementUploaded: false,
      convertedBookingId: null,
      inviteTokenExp: newExpiry,
      paymentPreference: null,
      agreementPreference: null,
      itwhipAgreementAccepted: false,
      hostAgreementUrl: null,
      hostAgreementName: null,
      agreementValidationScore: null,
      agreementValidationSummary: null,
      hostAgreementSections: null,
    }
  })
  console.log(`Prospect ${PROSPECT_ID} → onboarding + preferences cleared, inviteTokenExp → ${newExpiry.toISOString()}`)

  // Reset host onboarding timestamps
  await prisma.rentalHost.update({
    where: { id: HOST_ID },
    data: {
      onboardingStartedAt: null,
      onboardingCompletedAt: null,
      declinedRequestAt: null,
      welcomeDiscountUsed: false,
      welcomeDiscountBookingId: null,
      welcomeDiscountAppliedAt: null,
      paymentPreference: null,
      agreementPreference: null,
      hostAgreementUrl: null,
      hostAgreementName: null,
      agreementValidationScore: null,
      agreementValidationSummary: null,
      hostAgreementSections: null,
    }
  })
  console.log(`Host ${HOST_ID} → onboarding + preferences cleared, welcomeDiscount reset`)

  console.log('\n=== RESET COMPLETE ===')
  console.log('State: Host received email, no booking, no car, guest does not exist.')
}

main()
  .catch(e => console.error('FATAL:', e))
  .finally(() => prisma.$disconnect())
