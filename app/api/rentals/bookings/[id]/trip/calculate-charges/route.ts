// app/api/rentals/bookings/[id]/trip/calculate-charges/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { calculateTripCharges } from '@/app/lib/trip/calculations'
import { TRIP_CONSTANTS } from '@/app/lib/trip/constants'

export async function POST(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
   const { id: bookingId } = await params
   const body = await request.json()
   const {
     endMileage,
     fuelLevelEnd,
     damageItems = [],
     returnTime = new Date()
   } = body

   // Get guest email from header
   const guestEmail = request.headers.get('x-guest-email')

   // Fetch booking
   const booking = await prisma.rentalBooking.findUnique({
     where: { id: bookingId },
     select: {
       id: true,
       guestEmail: true,
       renterId: true,
       startMileage: true,
       fuelLevelStart: true,
       startDate: true,
       endDate: true,
       numberOfDays: true,
       tripStartedAt: true,
       dailyRate: true
     }
   })

   if (!booking) {
     return NextResponse.json(
       { error: 'Booking not found' },
       { status: 404 }
     )
   }

   // Verify guest access
   if (booking.guestEmail !== guestEmail && booking.renterId) {
     return NextResponse.json(
       { error: 'Unauthorized' },
       { status: 403 }
     )
   }

   // Verify trip has started
   if (!booking.tripStartedAt) {
     return NextResponse.json(
       { error: 'Trip has not started yet' },
       { status: 400 }
     )
   }

   // Validate inputs
   if (!endMileage || endMileage < (booking.startMileage || 0)) {
     return NextResponse.json(
       { error: 'Invalid end mileage' },
       { status: 400 }
     )
   }

   if (!fuelLevelEnd || !TRIP_CONSTANTS.FUEL_LEVELS.includes(fuelLevelEnd)) {
     return NextResponse.json(
       { error: 'Invalid fuel level' },
       { status: 400 }
     )
   }

   // Calculate charges
   const charges: any = calculateTripCharges(
     booking.startMileage || 0,
     endMileage,
     booking.fuelLevelStart || 'Full',
     fuelLevelEnd,
     new Date(booking.startDate),
     new Date(booking.endDate),
     new Date(returnTime),
     booking.numberOfDays,
     damageItems
   )

   // Add percentage breakdown for UI display
   const chargeBreakdown = {
     mileage: {
       ...charges.mileage,
       percentage: charges.total > 0 ? (charges.mileage.charge / charges.total) * 100 : 0
     },
     fuel: {
       ...charges.fuel,
       percentage: charges.total > 0 ? (charges.fuel.charge / charges.total) * 100 : 0
     },
     time: {
       ...charges.time,
       percentage: charges.total > 0 ? (charges.time.charge / charges.total) * 100 : 0
     },
     damage: {
       ...charges.damage,
       percentage: charges.total > 0 ? (charges.damage.charge / charges.total) * 100 : 0
     }
   }

   // Calculate potential savings tips
   const tips = []
   
   if (charges.mileage.overage > 0) {
     tips.push({
       type: 'mileage',
       message: `You exceeded your included mileage by ${charges.mileage.overage} miles`,
       savings: charges.mileage.charge
     })
   }
   
   if (charges.fuel.needsRefuel) {
     tips.push({
       type: 'fuel',
       message: 'Return with same fuel level to avoid refueling fee',
       savings: charges.fuel.charge
     })
   }
   
   if (charges.time.isLate) {
     const hoursLate = Math.ceil(charges.time.lateMinutes / 60)
     tips.push({
       type: 'time',
       message: `Return on time to avoid late fees (${hoursLate} hours late)`,
       savings: charges.time.charge
     })
   }

   // Log the charge calculation request
   await prisma.activityLog.create({
     data: {
       id: crypto.randomUUID(),
       action: 'CHARGES_CALCULATED',
       entityType: 'RentalBooking',
       entityId: bookingId,
       metadata: {
         endMileage,
         fuelLevelEnd,
         charges,
         timestamp: new Date()
       },
       ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
     }
   })

   return NextResponse.json({
     success: true,
     charges,
     breakdown: chargeBreakdown,
     tips,
     booking: {
       startMileage: booking.startMileage,
       fuelLevelStart: booking.fuelLevelStart,
       dailyRate: booking.dailyRate,
       numberOfDays: booking.numberOfDays,
       includedMiles: booking.numberOfDays * TRIP_CONSTANTS.DAILY_MILEAGE_INCLUDED
     }
   })

 } catch (error) {
   console.error('Error calculating charges:', error)
   return NextResponse.json(
     { error: 'Failed to calculate charges', details: error instanceof Error ? error.message : 'Unknown error' },
     { status: 500 }
   )
 }
}

// GET - Get charge preview with current booking data
export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
   const { id: bookingId } = await params
   const guestEmail = request.headers.get('x-guest-email')

   const booking = await prisma.rentalBooking.findUnique({
     where: { id: bookingId },
     select: {
       id: true,
       guestEmail: true,
       renterId: true,
       startMileage: true,
       fuelLevelStart: true,
       startDate: true,
       endDate: true,
       numberOfDays: true,
       tripStartedAt: true,
       dailyRate: true,
       totalAmount: true
     }
   })

   if (!booking) {
     return NextResponse.json(
       { error: 'Booking not found' },
       { status: 404 }
     )
   }

   // Verify guest access
   if (booking.guestEmail !== guestEmail && booking.renterId) {
     return NextResponse.json(
       { error: 'Unauthorized' },
       { status: 403 }
     )
   }

   return NextResponse.json({
     success: true,
     booking: {
       startMileage: booking.startMileage,
       fuelLevelStart: booking.fuelLevelStart,
       dailyRate: booking.dailyRate,
       numberOfDays: booking.numberOfDays,
       totalAmount: booking.totalAmount,
       includedMiles: booking.numberOfDays * TRIP_CONSTANTS.DAILY_MILEAGE_INCLUDED,
       mileageRate: TRIP_CONSTANTS.OVERAGE_RATE_PER_MILE,
       refuelFee: TRIP_CONSTANTS.REFUEL_FEE,
       lateFeePerHour: TRIP_CONSTANTS.LATE_FEE_PER_HOUR,
       gracePeriodMinutes: TRIP_CONSTANTS.GRACE_PERIOD_MINUTES
     }
   })

 } catch (error) {
   console.error('Error getting charge preview:', error)
   return NextResponse.json(
     { error: 'Failed to get charge preview' },
     { status: 500 }
   )
 }
}