// app/lib/twilio/caller-lookup.ts
// Match incoming caller phone number to guest/host profile + active booking

import { prisma } from '@/app/lib/database/prisma'
import { normalizeForLookup } from './phone'

// ─── Types ─────────────────────────────────────────────────────────

export interface ActiveBooking {
  id: string
  bookingCode: string
  tripStatus: string | null
  carName: string
  startDate: Date
  endDate: Date
  hostPhone: string | null
  guestPhone: string | null
}

export interface CallerIdentity {
  type: 'guest' | 'host' | 'unknown'
  id: string | null
  name: string | null
  activeBooking: ActiveBooking | null
}

// ─── Lookup ────────────────────────────────────────────────────────

export async function lookupCaller(phone: string): Promise<CallerIdentity> {
  const digits = normalizeForLookup(phone)
  if (!digits || digits.length < 10) {
    return { type: 'unknown', id: null, name: null, activeBooking: null }
  }

  // Check RentalHost first (hosts always have required phone field)
  const host = await findHost(digits)
  if (host) {
    const activeBooking = await findActiveBookingForHost(host.id)
    return { type: 'host', id: host.id, name: host.name, activeBooking }
  }

  // Check ReviewerProfile (guest)
  const guest = await findGuest(digits)
  if (guest) {
    const activeBooking = await findActiveBookingForGuest(guest.id)
    return { type: 'guest', id: guest.id, name: guest.name, activeBooking }
  }

  // Check RentalBooking.guestPhone directly (guest may not have a profile)
  const bookingByPhone = await findActiveBookingByGuestPhone(digits)
  if (bookingByPhone) {
    return {
      type: 'guest',
      id: null,
      name: bookingByPhone.guestName,
      activeBooking: bookingByPhone,
    }
  }

  return { type: 'unknown', id: null, name: null, activeBooking: null }
}

// ─── Private Helpers ───────────────────────────────────────────────

async function findHost(digits: string) {
  return prisma.rentalHost.findFirst({
    where: { phone: { contains: digits } },
    select: { id: true, name: true },
  })
}

async function findGuest(digits: string) {
  return prisma.reviewerProfile.findFirst({
    where: { phoneNumber: { contains: digits } },
    select: { id: true, name: true },
  })
}

async function findActiveBookingForHost(hostId: string): Promise<ActiveBooking | null> {
  const booking = await prisma.rentalBooking.findFirst({
    where: {
      hostId,
      status: { in: ['CONFIRMED', 'ACTIVE'] },
      OR: [
        { tripStatus: { in: ['ACTIVE', 'NOT_STARTED'] } },
        { tripStatus: null },
      ],
    },
    orderBy: { startDate: 'asc' },
    select: {
      id: true,
      bookingCode: true,
      tripStatus: true,
      startDate: true,
      endDate: true,
      guestPhone: true,
      car: { select: { year: true, make: true, model: true } },
      host: { select: { phone: true } },
    },
  })

  if (!booking) return null

  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    tripStatus: booking.tripStatus,
    carName: `${booking.car.year || ''} ${booking.car.make || ''} ${booking.car.model || ''}`.trim(),
    startDate: booking.startDate,
    endDate: booking.endDate,
    hostPhone: booking.host.phone,
    guestPhone: booking.guestPhone,
  }
}

async function findActiveBookingForGuest(guestId: string): Promise<ActiveBooking | null> {
  const booking = await prisma.rentalBooking.findFirst({
    where: {
      reviewerProfileId: guestId,
      status: { in: ['CONFIRMED', 'ACTIVE'] },
      OR: [
        { tripStatus: { in: ['ACTIVE', 'NOT_STARTED'] } },
        { tripStatus: null },
      ],
    },
    orderBy: { startDate: 'asc' },
    select: {
      id: true,
      bookingCode: true,
      tripStatus: true,
      startDate: true,
      endDate: true,
      guestPhone: true,
      guestName: true,
      car: { select: { year: true, make: true, model: true } },
      host: { select: { phone: true } },
    },
  })

  if (!booking) return null

  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    tripStatus: booking.tripStatus,
    carName: `${booking.car.year || ''} ${booking.car.make || ''} ${booking.car.model || ''}`.trim(),
    startDate: booking.startDate,
    endDate: booking.endDate,
    hostPhone: booking.host.phone,
    guestPhone: booking.guestPhone,
  }
}

async function findActiveBookingByGuestPhone(digits: string): Promise<(ActiveBooking & { guestName: string | null }) | null> {
  const booking = await prisma.rentalBooking.findFirst({
    where: {
      guestPhone: { contains: digits },
      status: { in: ['CONFIRMED', 'ACTIVE'] },
      OR: [
        { tripStatus: { in: ['ACTIVE', 'NOT_STARTED'] } },
        { tripStatus: null },
      ],
    },
    orderBy: { startDate: 'asc' },
    select: {
      id: true,
      bookingCode: true,
      tripStatus: true,
      startDate: true,
      endDate: true,
      guestPhone: true,
      guestName: true,
      car: { select: { year: true, make: true, model: true } },
      host: { select: { phone: true } },
    },
  })

  if (!booking) return null

  return {
    id: booking.id,
    bookingCode: booking.bookingCode,
    tripStatus: booking.tripStatus,
    carName: `${booking.car.year || ''} ${booking.car.make || ''} ${booking.car.model || ''}`.trim(),
    startDate: booking.startDate,
    endDate: booking.endDate,
    hostPhone: booking.host.phone,
    guestPhone: booking.guestPhone,
    guestName: booking.guestName,
  }
}

// ─── Booking Lookup by Phone ──────────────────────────────────────

export async function lookupBookingByPhone(phone: string) {
  const digits = normalizeForLookup(phone)
  if (!digits || digits.length < 10) return null

  return prisma.rentalBooking.findFirst({
    where: {
      guestPhone: { contains: digits },
      status: { in: ['CONFIRMED', 'ACTIVE', 'COMPLETED'] },
    },
    orderBy: { startDate: 'desc' },
    select: {
      id: true,
      bookingCode: true,
      status: true,
      tripStatus: true,
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,
      guestPhone: true,
      guestName: true,
      guestEmail: true,
      pickupLocation: true,
      deliveryAddress: true,
      car: { select: { year: true, make: true, model: true, address: true, city: true } },
      host: { select: { name: true, phone: true } },
      Claim: { select: { id: true, status: true, type: true, estimatedCost: true }, take: 5 },
    },
  })
}

// ─── Booking Lookup by Code ────────────────────────────────────────

export async function lookupBookingByCode(code: string) {
  return prisma.rentalBooking.findFirst({
    where: { bookingCode: code.toUpperCase() },
    select: {
      id: true,
      bookingCode: true,
      status: true,
      tripStatus: true,
      startDate: true,
      endDate: true,
      startTime: true,
      endTime: true,
      guestPhone: true,
      guestName: true,
      guestEmail: true,
      pickupLocation: true,
      deliveryAddress: true,
      car: { select: { year: true, make: true, model: true, address: true, city: true } },
      host: { select: { name: true, phone: true } },
      Claim: { select: { id: true, status: true, type: true, estimatedCost: true }, take: 5 },
    },
  })
}
