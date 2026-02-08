// TEMPORARY: Test booking email endpoint
import { NextRequest, NextResponse } from 'next/server'
import { sendBookingConfirmation, sendPendingReviewEmail } from '@/app/lib/email/booking-emails'

export async function GET(request: NextRequest) {
  const to = request.nextUrl.searchParams.get('to') || 'hxris08@gmail.com'
  const type = request.nextUrl.searchParams.get('type') || 'confirmation'

  try {
    if (type === 'review') {
      await sendPendingReviewEmail({
        guestEmail: to,
        guestName: 'Chris H',
        bookingCode: 'IW-TEST-002',
        carMake: 'BMW',
        carModel: 'X5',
        carImage: '',
        startDate: '2026-03-01',
        endDate: '2026-03-05',
        pickupLocation: 'Phoenix Sky Harbor Airport (PHX)',
        totalAmount: '825.00',
        documentsSubmittedAt: new Date().toISOString(),
        estimatedReviewTime: 'within 1 hour',
        trackingUrl: 'https://itwhip.com/rentals/dashboard/guest/test-token',
        accessToken: 'test-token'
      })
    } else {
      await sendBookingConfirmation({
        guestEmail: to,
        guestName: 'Chris H',
        bookingCode: 'IW-TEST-001',
        startDate: '2026-03-01',
        endDate: '2026-03-05',
        pickupLocation: 'Phoenix Sky Harbor Airport (PHX)',
        totalAmount: 625.00,
        depositAmount: 250.00,
        subtotal: 460.00,
        serviceFee: 69.00,
        taxes: 46.00,
        insuranceFee: 0,
        deliveryFee: 0,
        car: {
          make: 'Tesla',
          model: 'Model 3',
          year: 2024,
          photos: [{ url: 'https://itwhip.com/images/vehicles/tesla-model-3.jpg' }]
        },
        accessToken: 'test-token-123'
      })
    }

    return NextResponse.json({
      success: true,
      sentTo: to,
      type,
      message: `Check ${to} for the ${type} email!`
    })
  } catch (error: any) {
    return NextResponse.json({
      success: false,
      error: error.message
    }, { status: 500 })
  }
}
