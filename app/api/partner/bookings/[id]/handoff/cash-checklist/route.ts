// app/api/partner/bookings/[id]/handoff/cash-checklist/route.ts
// Sequential cash handoff checklist for cash bookings
// Steps: arrived → payment_received → dl_checked → identity_confirmed → inspection_started → handoff_complete

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

const CASH_CHECKLIST_STEPS = [
  'arrived',
  'payment_received',
  'dl_checked',
  'identity_confirmed',
  'inspection_started',
  'handoff_complete'
] as const

type CashChecklistStep = typeof CASH_CHECKLIST_STEPS[number]

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value ||
                cookieStore.get('hostAccessToken')?.value
  if (!token) return null
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string
    return await prisma.rentalHost.findUnique({ where: { id: hostId } })
  } catch {
    return null
  }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const partner = await getPartnerFromToken()
    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { id: bookingId } = await params
    const body = await request.json()
    const { completedSteps } = body as { completedSteps: CashChecklistStep[] }

    if (!Array.isArray(completedSteps)) {
      return NextResponse.json({ error: 'completedSteps must be an array' }, { status: 400 })
    }

    // Fetch booking
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      include: {
        renter: { include: { reviewerProfile: true } }
      }
    })

    if (!booking || booking.hostId !== partner.id) {
      return NextResponse.json({ error: 'Booking not found' }, { status: 404 })
    }

    // CRITICAL: Only allow for cash bookings
    if (booking.paymentType !== 'CASH') {
      return NextResponse.json(
        { error: 'Cash checklist is only available for cash bookings' },
        { status: 400 }
      )
    }

    // Validate sequential order — each step requires all previous steps
    for (let i = 0; i < completedSteps.length; i++) {
      const step = completedSteps[i]
      const stepIndex = CASH_CHECKLIST_STEPS.indexOf(step)
      if (stepIndex === -1) {
        return NextResponse.json({ error: `Invalid step: ${step}` }, { status: 400 })
      }
      // Check all prior steps are included
      for (let j = 0; j < stepIndex; j++) {
        if (!completedSteps.includes(CASH_CHECKLIST_STEPS[j])) {
          return NextResponse.json(
            { error: `Step "${step}" requires completing "${CASH_CHECKLIST_STEPS[j]}" first` },
            { status: 400 }
          )
        }
      }
    }

    // Payment received is REQUIRED before handoff complete
    if (completedSteps.includes('handoff_complete') && !completedSteps.includes('payment_received')) {
      return NextResponse.json(
        { error: 'You must confirm payment was received before completing handoff' },
        { status: 400 }
      )
    }

    const now = new Date()
    const updates: any = {}

    // Handle identity_confirmed → manual verification (saves $5)
    if (completedSteps.includes('identity_confirmed')) {
      const profile = booking.renter?.reviewerProfile
      if (profile && !profile.documentsVerified && !profile.manuallyVerifiedByHost) {
        await prisma.reviewerProfile.update({
          where: { id: profile.id },
          data: {
            manuallyVerifiedByHost: true,
            manualVerificationHostId: partner.id,
            manualVerificationDate: now
          }
        })
        console.log(`[Cash Checklist] Guest ${profile.id} manually verified by host ${partner.id}`)
      }
    }

    // Handle handoff_complete
    if (completedSteps.includes('handoff_complete')) {
      updates.handoffStatus = 'HANDOFF_COMPLETE'
      updates.hostHandoffVerifiedAt = now

      // Cash handoff complete = always paid
      updates.paymentStatus = 'PAID'
      updates.paymentProcessedAt = now

      console.log(`[Cash Checklist] Handoff complete for booking ${booking.bookingCode} — cash payment confirmed`)
    }

    // Update booking if any changes
    if (Object.keys(updates).length > 0) {
      await prisma.rentalBooking.update({
        where: { id: bookingId },
        data: updates
      })
    }

    return NextResponse.json({
      success: true,
      completedSteps,
      handoffComplete: completedSteps.includes('handoff_complete')
    })
  } catch (error) {
    console.error('[Cash Checklist] Error:', error)
    return NextResponse.json(
      { error: 'Failed to process checklist' },
      { status: 500 }
    )
  }
}
