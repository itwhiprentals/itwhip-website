#!/usr/bin/env node
// scripts/fix-thomas-booking.js
// Creates the missing RentalBooking record for Thomas Faylor
// His Stripe PI was authorized ($191.96) but the DB record was never created
// (3D Secure flow broke the frontend → /api/rentals/book never called)

require('dotenv').config({ path: '.env.local' })
const { PrismaClient } = require('@prisma/client')
const crypto = require('crypto')

const prisma = new PrismaClient()

const BOOKING = {
  // Stripe
  paymentIntentId: 'pi_3T5B9TIZPP7mao582Cg9rNn8',
  paymentMethodId: 'pm_1T5BATIZPP7mao586olZ91XW',
  chargeId: 'ch_3T5B9TIZPP7mao5826DVw6LP',

  // Car & Host
  carId: 'cmk4yb5rv0001ld04ssplj8qd',       // 2022 Nissan Sentra
  hostId: 'cmjnav88v0002doy6sg88eq1f',       // Thomas Rodriguez

  // Guest
  guestEmail: 'brammerboy99@gmail.com',
  guestPhone: '+14808454325',
  guestName: 'THOMAS FAYLOR',
  reviewerProfileId: 'd8yr7hhWuxLqD_gyjJgHT',
  renterId: 'sJQF4Q5f3HzK4-VhQyY2p',

  // Dates — today (Feb 27) for 3 days
  startDate: new Date('2026-02-27T12:00:00'),
  endDate: new Date('2026-03-02T12:00:00'),
  startTime: '10:00',
  endTime: '10:00',

  // Pricing (from Stripe PI metadata)
  dailyRate: 50.42,
  numberOfDays: 3,
  subtotal: 151.26,
  serviceFee: 22.69,
  taxes: 18.39,
  insuranceFee: 0,
  deliveryFee: 0,
  totalAmount: 191.96,
  depositAmount: 0,

  // Pickup
  pickupLocation: 'Phoenix',
  pickupType: 'host',

  // Guest verification (from Stripe Identity verified profile)
  licenseNumber: 'D04758972',
  licenseState: 'AZ',
  licenseExpiry: new Date('2055-08-28'),
  dateOfBirth: new Date('1990-08-28'),
}

function generateBookingCode() {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
  let code = ''
  for (let i = 0; i < 6; i++) code += chars[Math.floor(Math.random() * chars.length)]
  return `RENT-2026-${code}`
}

async function main() {
  console.log('=== Fix Thomas Faylor Missing Booking ===\n')

  // 1. No duplicate
  const existing = await prisma.rentalBooking.findFirst({
    where: { paymentIntentId: BOOKING.paymentIntentId },
    select: { id: true, bookingCode: true }
  })
  if (existing) {
    console.log(`Already exists: ${existing.bookingCode} (${existing.id})`)
    return
  }

  // 2. Car exists
  const car = await prisma.rentalCar.findUnique({
    where: { id: BOOKING.carId },
    select: { id: true, make: true, model: true, year: true }
  })
  if (!car) { console.log('Car not found'); return }
  console.log(`Car: ${car.year} ${car.make} ${car.model}`)

  // 3. Guest exists
  const guest = await prisma.reviewerProfile.findUnique({
    where: { id: BOOKING.reviewerProfileId },
    select: { id: true, name: true, email: true }
  })
  if (!guest) { console.log('Guest not found'); return }
  console.log(`Guest: ${guest.name} (${guest.email})`)

  // 4. Create booking
  const bookingCode = generateBookingCode()

  const booking = await prisma.rentalBooking.create({
    data: {
      id: crypto.randomUUID(),
      bookingCode,
      updatedAt: new Date(),
      carId: BOOKING.carId,
      hostId: BOOKING.hostId,
      guestEmail: BOOKING.guestEmail,
      guestPhone: BOOKING.guestPhone,
      guestName: BOOKING.guestName,
      reviewerProfileId: BOOKING.reviewerProfileId,
      renterId: BOOKING.renterId,
      startDate: BOOKING.startDate,
      endDate: BOOKING.endDate,
      startTime: BOOKING.startTime,
      endTime: BOOKING.endTime,
      pickupLocation: BOOKING.pickupLocation,
      pickupType: BOOKING.pickupType,
      dailyRate: BOOKING.dailyRate,
      numberOfDays: BOOKING.numberOfDays,
      subtotal: BOOKING.subtotal,
      deliveryFee: BOOKING.deliveryFee,
      insuranceFee: BOOKING.insuranceFee,
      insuranceTier: 'basic',
      serviceFee: BOOKING.serviceFee,
      taxes: BOOKING.taxes,
      totalAmount: BOOKING.totalAmount,
      depositAmount: BOOKING.depositAmount,
      securityDeposit: 0,
      depositHeld: 0,
      status: 'PENDING',
      paymentStatus: 'AUTHORIZED',
      fleetStatus: 'PENDING',
      paymentIntentId: BOOKING.paymentIntentId,
      stripePaymentMethodId: BOOKING.paymentMethodId,
      stripeChargeId: BOOKING.chargeId,
      verificationStatus: 'APPROVED',
      licenseVerified: true,
      licenseNumber: BOOKING.licenseNumber,
      licenseState: BOOKING.licenseState,
      licenseExpiry: BOOKING.licenseExpiry,
      selfieVerified: true,
      dateOfBirth: BOOKING.dateOfBirth,
      documentsSubmittedAt: new Date('2026-02-26T02:20:25.117Z'),
      emailVerified: true,
      phoneVerified: true,
      emailDomain: 'gmail.com',
      riskScore: 0,
      sessionId: 'manual-fix',
      sessionStartedAt: new Date(),
      deviceFingerprint: 'manual-fix',
    },
    select: {
      id: true,
      bookingCode: true,
      status: true,
      paymentStatus: true,
      totalAmount: true,
      startDate: true,
      endDate: true,
    }
  })

  console.log('\nBooking created!')
  console.log(`  Code: ${booking.bookingCode}`)
  console.log(`  ID: ${booking.id}`)
  console.log(`  Status: ${booking.status} / ${booking.paymentStatus}`)
  console.log(`  Total: $${booking.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`)
  console.log(`  Dates: ${booking.startDate?.toISOString().split('T')[0]} to ${booking.endDate?.toISOString().split('T')[0]}`)
  console.log(`  PI: ${BOOKING.paymentIntentId}`)

  await prisma.$disconnect()
}

main().catch(e => {
  console.error('Failed:', e)
  prisma.$disconnect()
  process.exit(1)
})
