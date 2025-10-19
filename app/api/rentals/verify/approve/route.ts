// app/api/rentals/verify/approve/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { 
 sendVerificationApprovedEmail,
 sendVerificationRejectedEmail,
 sendHostNotification 
} from '@/app/lib/email'

// ========== 🆕 ACTIVITY TRACKING IMPORT ==========
import { trackActivity } from '@/lib/helpers/guestProfileStatus'

export async function POST(request: NextRequest) {
 try {
   const body = await request.json()
   const { 
     bookingId, 
     approved, 
     reviewNotes, 
     adminId 
   } = body
   
   if (!adminId) {
     return NextResponse.json(
       { error: 'Admin authorization required' },
       { status: 403 }
     )
   }
   
   const booking = await prisma.rentalBooking.findUnique({
     where: { id: bookingId },
     include: {
       car: {
         include: {
           host: true,
           photos: true
         }
       },
       guestAccessTokens: {
         take: 1,
         orderBy: {
           createdAt: 'desc'
         }
       }
     }
   })
   
   if (!booking) {
     return NextResponse.json(
       { error: 'Booking not found' },
       { status: 404 }
     )
   }
   
   const updatedBooking = await prisma.rentalBooking.update({
     where: { id: bookingId },
     data: {
       verificationStatus: approved ? 'approved' : 'rejected',
       verificationNotes: reviewNotes,
       reviewedBy: adminId,
       reviewedAt: new Date(),
       status: approved ? 'CONFIRMED' : 'CANCELLED',
       licenseVerified: approved,
       selfieVerified: approved,
       paymentStatus: approved ? 'completed' : 'cancelled'
     }
   })
   
   const guestEmail = booking.guestEmail
   
   if (guestEmail) {
     if (approved) {
       // Get or use existing access token for tracking URL
       const accessToken = booking.guestAccessTokens?.[0]?.token || booking.id
       
       // Send approval email with car image
       await sendVerificationApprovedEmail(guestEmail, {
         guestName: booking.guestName || 'Guest',
         guestEmail: guestEmail,
         bookingCode: booking.bookingCode,
         carMake: booking.car.make,
         carModel: booking.car.model,
         carImage: booking.car.photos[0]?.url || 'https://res.cloudinary.com/du1hjyrgm/image/upload/f_auto,q_auto,w_800/v1756178756/IMG_0324_kgt9ne.jpg',
         startDate: booking.startDate.toLocaleDateString(),
         endDate: booking.endDate.toLocaleDateString(),
         pickupLocation: booking.pickupLocation || 'North Scottsdale',
         pickupTime: booking.startTime || '10:00 AM',
         hostName: booking.car.host.name,
         hostPhone: booking.car.host.phone || '',
         totalAmount: booking.totalAmount.toFixed(2),
         dashboardUrl: `${process.env.NEXT_PUBLIC_URL || 'http://localhost:3000'}/rentals/track/${accessToken}`
       })
       
       // Notify host
       await sendHostNotification({
         hostEmail: booking.car.host.email,
         hostName: booking.car.host.name,
         bookingId: booking.bookingCode,
         guestName: booking.guestName || 'Guest',
         carMake: booking.car.make,
         carModel: booking.car.model,
         startDate: booking.startDate.toLocaleDateString(),
         endDate: booking.endDate.toLocaleDateString(),
         totalEarnings: (booking.totalAmount * 0.8).toFixed(2)
       })
     } else {
       await sendVerificationRejectedEmail(guestEmail, {
         guestName: booking.guestName || 'Guest',
         bookingCode: booking.bookingCode,
         carMake: booking.car.make,
         carModel: booking.car.model,
         reason: reviewNotes || 'Verification requirements not met',
         canRebook: true,
         supportEmail: 'support@itwhip.com'
       })
     }
   }

   // ========== 🆕 TRACK BOOKING VERIFICATION ACTIVITY ==========
   try {
     // Find guest's ReviewerProfile
     let guestProfileId = booking.reviewerProfileId
     
     if (!guestProfileId && booking.guestEmail) {
       const reviewerProfile = await prisma.reviewerProfile.findFirst({
         where: { email: booking.guestEmail },
         select: { id: true }
       })
       guestProfileId = reviewerProfile?.id
     }

     if (guestProfileId) {
       if (approved) {
         // Track approval
         await trackActivity(guestProfileId, {
           action: 'BOOKING_CONFIRMED',
           description: `Booking confirmed for ${booking.car.year} ${booking.car.make} ${booking.car.model}`,
           performedBy: 'ADMIN',
           metadata: {
             bookingId: booking.id,
             bookingCode: booking.bookingCode,
             carName: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
             carId: booking.carId,
             hostName: booking.car.host.name,
             hostId: booking.car.host.id,
             
             // Verification details
             verificationStatus: 'approved',
             reviewedBy: adminId,
             reviewedAt: new Date().toISOString(),
             reviewNotes: reviewNotes || null,
             
             // Booking details
             startDate: booking.startDate.toISOString(),
             endDate: booking.endDate.toISOString(),
             pickupLocation: booking.pickupLocation,
             totalAmount: booking.totalAmount,
             
             // Status changes
             previousStatus: booking.status,
             newStatus: 'CONFIRMED',
             licenseVerified: true,
             selfieVerified: true,
             
             // Next steps
             canStartTrip: true,
             dashboardAccess: true
           }
         })

         console.log('✅ Booking confirmation tracked in guest timeline:', {
           guestId: guestProfileId,
           bookingId: booking.id,
           approved: true
         })
       } else {
         // Track rejection
         await trackActivity(guestProfileId, {
           action: 'BOOKING_CANCELLED',
           description: `Booking verification rejected for ${booking.car.year} ${booking.car.make} ${booking.car.model}`,
           performedBy: 'ADMIN',
           metadata: {
             bookingId: booking.id,
             bookingCode: booking.bookingCode,
             carName: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
             
             // Rejection details
             verificationStatus: 'rejected',
             rejectionReason: reviewNotes || 'Verification requirements not met',
             reviewedBy: adminId,
             reviewedAt: new Date().toISOString(),
             
             // Status changes
             previousStatus: booking.status,
             newStatus: 'CANCELLED',
             
             // Next steps
             canRebook: true,
             requiresNewDocuments: true
           }
         })

         console.log('✅ Booking rejection tracked in guest timeline:', {
           guestId: guestProfileId,
           bookingId: booking.id,
           approved: false
         })
       }
     } else {
       console.warn('⚠️ Could not find guest profile for booking verification tracking')
     }
   } catch (trackingError) {
     console.error('❌ Failed to track booking verification activity:', trackingError)
     // Continue without breaking - tracking is non-critical
   }
   // ========== END ACTIVITY TRACKING ==========
   
   return NextResponse.json({
     success: true,
     message: approved ? 'Booking approved' : 'Booking rejected',
     booking: {
       id: updatedBooking.id,
       status: updatedBooking.status,
       verificationStatus: updatedBooking.verificationStatus
     }
   })
   
 } catch (error) {
   console.error('Approval error:', error)
   return NextResponse.json(
     { error: 'Failed to process approval' },
     { status: 500 }
   )
 }
}

export async function GET(request: NextRequest) {
 try {
   const searchParams = request.nextUrl.searchParams
   const status = searchParams.get('status') || 'submitted'
   
   const bookings = await prisma.rentalBooking.findMany({
     where: {
       verificationStatus: status,
       car: {
         source: 'p2p'
       }
     },
     include: {
       car: {
         include: {
           host: true,
           photos: {
             take: 1
           }
         }
       }
     },
     orderBy: {
       documentsSubmittedAt: 'asc'
     }
   })
   
   return NextResponse.json({
     success: true,
     bookings: bookings.map(booking => ({
       id: booking.id,
       bookingCode: booking.bookingCode,
       guestEmail: booking.guestEmail,
       guestName: booking.guestName,
       car: {
         name: `${booking.car.year} ${booking.car.make} ${booking.car.model}`,
         photo: booking.car.photos[0]?.url,
         dailyRate: booking.car.dailyRate
       },
       host: booking.car.host.name,
       dates: {
         start: booking.startDate,
         end: booking.endDate
       },
       submittedAt: booking.documentsSubmittedAt,
       deadline: booking.verificationDeadline,
       totalAmount: booking.totalAmount
     })),
     total: bookings.length
   })
   
 } catch (error) {
   console.error('Fetch pending verifications error:', error)
   return NextResponse.json(
     { error: 'Failed to fetch pending verifications' },
     { status: 500 }
   )
 }
}