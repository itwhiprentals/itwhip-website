#!/usr/bin/env npx tsx
// ──────────────────────────────────────────────────────────────────────
// reset-to-stage4.ts
// Resets to Stage 4: Car assigned, guest+reviewer exists, booking exists
// Host just needs to agree and accept. Dates → March 6-7.
//
// Usage:
//   npx tsx scripts/reset-to-stage4.ts          # dry run
//   npx tsx scripts/reset-to-stage4.ts --execute # apply
// ──────────────────────────────────────────────────────────────────────

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()
const DRY = !process.argv.includes('--execute')

const HOST_ID = 'siLdeZNv3e7Q5zqr-MgHv'
const PROSPECT_ID = 'cmm8dcwyg0002c9v029wxd6q7'
const REQUEST_ID = 'cmm8d0z7d0000c9v0mw61xu31'
const BOOKING_ID = 'bd8a055c-8a18-4e3e-8023-7b66366e57dc'

const NEW_START = new Date('2026-03-06T00:00:00.000Z')
const NEW_END = new Date('2026-03-07T00:00:00.000Z')

async function main() {
  console.log(DRY ? '\n=== DRY RUN (pass --execute to apply) ===\n' : '\n=== EXECUTING RESET TO STAGE 4 ===\n')

  // Current state
  const req = await prisma.reservationRequest.findUnique({ where: { id: REQUEST_ID } })
  const booking = await prisma.rentalBooking.findUnique({
    where: { id: BOOKING_ID },
    include: { renter: { include: { reviewerProfile: true } } }
  })
  const prospect = await prisma.hostProspect.findUnique({ where: { id: PROSPECT_ID } })

  console.log('Current state:')
  console.log(`  Request: status=${req?.status}, dates=${req?.startDate?.toISOString()} → ${req?.endDate?.toISOString()}`)
  console.log(`  Booking: status=${booking?.status}, dates=${booking?.startDate?.toISOString()} → ${booking?.endDate?.toISOString()}`)
  console.log(`  Booking agreement: ${booking?.agreementStatus}, paymentType: ${booking?.paymentType}`)
  console.log(`  Renter: ${booking?.renter?.name} <${booking?.renter?.email}>, hasReviewerProfile: ${booking?.renter?.reviewerProfile ? 'YES' : 'NO'}`)
  console.log(`  Prospect: status=${prospect?.status}, agreement=${prospect?.agreementPreference}, payment=${prospect?.paymentPreference}`)

  console.log('\nChanges:')
  console.log(`  Request: dates → ${NEW_START.toISOString()} - ${NEW_END.toISOString()}, status stays CAR_ASSIGNED`)
  console.log(`  Booking: dates → ${NEW_START.toISOString()} - ${NEW_END.toISOString()}, status → PENDING, agreementStatus → not_sent`)
  console.log(`  Prospect: status → CONVERTED (stays), agreement → ITWHIP, payment → CASH`)
  console.log(`  Host: onboarding timestamps cleared, welcomeDiscount reset`)

  if (DRY) {
    console.log('\nRun with --execute to apply.')
    return
  }

  // ── EXECUTE ──

  // 1. Update request dates
  await prisma.reservationRequest.update({
    where: { id: REQUEST_ID },
    data: {
      startDate: NEW_START,
      endDate: NEW_END,
      status: 'CAR_ASSIGNED',
    }
  })
  console.log(`\nRequest ${REQUEST_ID} → dates updated, CAR_ASSIGNED`)

  // 2. Update booking dates + reset agreement
  await prisma.rentalBooking.update({
    where: { id: BOOKING_ID },
    data: {
      startDate: NEW_START,
      endDate: NEW_END,
      status: 'PENDING',
      agreementStatus: 'not_sent',
      agreementSentAt: null,
      agreementSignedAt: null,
      agreementSignedPdfUrl: null,
      signerName: null,
      paymentType: 'CASH',
      handoffStatus: null,
    }
  })
  console.log(`Booking ${BOOKING_ID} → dates updated, PENDING, agreement reset, paymentType=CASH`)

  // 3. Ensure prospect is in correct state
  const newExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000)
  await prisma.hostProspect.update({
    where: { id: PROSPECT_ID },
    data: {
      status: 'CONVERTED',
      agreementPreference: 'ITWHIP',
      paymentPreference: 'CASH',
      inviteTokenExp: newExpiry,
    }
  })
  console.log(`Prospect ${PROSPECT_ID} → CONVERTED, ITWHIP agreement, CASH payment`)

  // 4. Reset host onboarding timestamps
  await prisma.rentalHost.update({
    where: { id: HOST_ID },
    data: {
      onboardingStartedAt: null,
      onboardingCompletedAt: null,
      declinedRequestAt: null,
      welcomeDiscountUsed: false,
      welcomeDiscountBookingId: null,
      welcomeDiscountAppliedAt: null,
    }
  })
  console.log(`Host ${HOST_ID} → onboarding cleared, welcomeDiscount reset`)

  // 5. Delete any messages for this booking (fresh start)
  const msgCount = await prisma.rentalMessage.deleteMany({ where: { bookingId: BOOKING_ID } })
  console.log(`Messages deleted: ${msgCount.count}`)

  console.log('\n=== RESET TO STAGE 4 COMPLETE ===')
  console.log('State: Car assigned, guest+reviewer exist, booking exists (PENDING).')
  console.log('Host needs to: agree + accept → send agreement to guest.')
}

main()
  .catch(e => console.error('FATAL:', e))
  .finally(() => prisma.$disconnect())
