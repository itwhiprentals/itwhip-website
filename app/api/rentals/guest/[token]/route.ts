// app/api/rentals/guest/[token]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { validateToken } from '@/app/lib/auth/guest-tokens'

export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ token: string }> }
) {
 try {
   const { token: tokenValue } = await params
   const { token: guestToken, booking, email } = await validateToken(tokenValue)
   
   // Return booking details for guest dashboard
   return NextResponse.json({
     success: true,
     booking: {
       id: booking.id,
       bookingCode: booking.bookingCode,
       status: booking.status,
       verificationStatus: booking.verificationStatus,
       verificationDeadline: booking.verificationDeadline,
       car: {
         id: booking.car.id,
         make: booking.car.make,
         model: booking.car.model,
         year: booking.car.year,
         photos: booking.car.photos,
         dailyRate: booking.car.dailyRate,
         features: booking.car.features
       },
       host: {
         name: booking.car.host.name,
         phone: booking.car.host.phone,
         responseTime: booking.car.host.responseTime
       },
       startDate: booking.startDate,
       endDate: booking.endDate,
       startTime: booking.startTime,
       endTime: booking.endTime,
       pickupLocation: booking.pickupLocation,
       totalAmount: booking.totalAmount,
       guestEmail: email,
       guestName: booking.guestName,
       documentsSubmittedAt: booking.documentsSubmittedAt,
       licenseVerified: booking.licenseVerified,
       selfieVerified: booking.selfieVerified
     },
     tokenValid: true,
     tokenExpiresAt: guestToken.expiresAt
   })
   
 } catch (error: any) {
   console.error('Token validation error:', error)
   
   // Handle specific errors
   if (error.message === 'Invalid token') {
     return NextResponse.json(
       { error: 'Invalid or expired token' },
       { status: 401 }
     )
   }
   
   if (error.message === 'Token expired') {
     return NextResponse.json(
       { error: 'Token has expired. Please request a new link.' },
       { status: 401 }
     )
   }
   
   return NextResponse.json(
     { error: 'Failed to validate token' },
     { status: 500 }
   )
 }
}

// Handle POST for token refresh
export async function POST(
 request: NextRequest,
 { params }: { params: Promise<{ token: string }> }
) {
 try {
   const { token: tokenValue } = await params
   const { refreshToken } = await import('@/app/lib/auth/guest-tokens')
   const newToken = await refreshToken(tokenValue)
   
   const newDashboardUrl = `${process.env.NEXT_PUBLIC_BASE_URL}/rentals/dashboard/guest/${newToken}`
   
   return NextResponse.json({
     success: true,
     newToken,
     dashboardUrl: newDashboardUrl,
     message: 'Token refreshed successfully'
   })
   
 } catch (error) {
   console.error('Token refresh error:', error)
   return NextResponse.json(
     { error: 'Failed to refresh token' },
     { status: 500 }
   )
 }
}