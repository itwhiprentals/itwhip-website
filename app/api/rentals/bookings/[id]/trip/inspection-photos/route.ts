// app/api/rentals/bookings/[id]/trip/inspection-photos/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { v2 as cloudinary } from 'cloudinary'
import { prisma } from '@/app/lib/database/prisma'

// Configure Cloudinary
cloudinary.config({
 cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
 api_key: process.env.CLOUDINARY_API_KEY,
 api_secret: process.env.CLOUDINARY_API_SECRET,
})

export async function POST(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
   const { id: bookingId } = await params
   const formData = await request.formData()
   const file = formData.get('file') as File
   const photoType = formData.get('type') as string // e.g., "inspection_front", "inspection_odometer"
   
   if (!file) {
     return NextResponse.json(
       { error: 'No file provided' },
       { status: 400 }
     )
   }

   // Validate file type
   const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp']
   if (!validTypes.includes(file.type)) {
     return NextResponse.json(
       { error: 'Invalid file type. Only JPEG, PNG, and WebP are allowed.' },
       { status: 400 }
     )
   }

   // Validate file size (10MB max)
   if (file.size > 10 * 1024 * 1024) {
     return NextResponse.json(
       { error: 'File size must be less than 10MB' },
       { status: 400 }
     )
   }

   // Get guest email from header
   const guestEmail = request.headers.get('x-guest-email')

   // Verify booking exists and user has access
   const booking = await prisma.rentalBooking.findUnique({
     where: { id: bookingId },
     select: {
       id: true,
       guestEmail: true,
       renterId: true,
       bookingCode: true
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

   // Convert file to base64
   const bytes = await file.arrayBuffer()
   const buffer = Buffer.from(bytes)
   const base64 = buffer.toString('base64')
   const dataUri = `data:${file.type};base64,${base64}`

   // Upload to Cloudinary with specific folder structure
   const uploadResponse = await cloudinary.uploader.upload(dataUri, {
     folder: `rentals/inspections/${bookingId}`,
     public_id: `${photoType}_${Date.now()}`,
     resource_type: 'auto',
     transformation: [
       { width: 1920, height: 1920, crop: 'limit' },
       { quality: 'auto:good' },
       { fetch_format: 'auto' }
     ],
     context: {
       booking_code: booking.bookingCode,
       photo_type: photoType,
       upload_date: new Date().toISOString()
     }
   })

   // Log the photo upload in the database
   await prisma.activityLog.create({
     data: {
       id: crypto.randomUUID(),
       action: 'INSPECTION_PHOTO_UPLOADED',
       entityType: 'RentalBooking',
       entityId: bookingId,
       metadata: {
         photoType,
         url: uploadResponse.secure_url,
         publicId: uploadResponse.public_id,
         timestamp: new Date()
       },
       ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown'
     }
   })

   return NextResponse.json({
     success: true,
     url: uploadResponse.secure_url,
     publicId: uploadResponse.public_id,
     photoType
   })

 } catch (error) {
   console.error('Error uploading inspection photo:', error)
   return NextResponse.json(
     { error: 'Failed to upload photo', details: error instanceof Error ? error.message : 'Unknown error' },
     { status: 500 }
   )
 }
}

// GET - Retrieve inspection photos for a booking
export async function GET(
 request: NextRequest,
 { params }: { params: Promise<{ id: string }> }
) {
 try {
   const { id: bookingId } = await params
   const guestEmail = request.headers.get('x-guest-email')
   const photoType = request.nextUrl.searchParams.get('type') // 'start' or 'end'

   // Verify booking and access
   const booking = await prisma.rentalBooking.findUnique({
     where: { id: bookingId },
     select: {
       id: true,
       guestEmail: true,
       renterId: true,
       inspectionPhotosStart: true,
       inspectionPhotosEnd: true
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

   // Get photos from InspectionPhoto table
   const photos = await prisma.inspectionPhoto.findMany({
     where: {
       bookingId,
       ...(photoType && { type: photoType })
     },
     orderBy: {
       uploadedAt: 'desc'
     }
   })

   // Also get photos from booking JSON fields
   let startPhotos = {}
   let endPhotos = {}
   
   try {
     if (booking.inspectionPhotosStart) {
       startPhotos = JSON.parse(booking.inspectionPhotosStart as string)
     }
     if (booking.inspectionPhotosEnd) {
       endPhotos = JSON.parse(booking.inspectionPhotosEnd as string)
     }
   } catch (e) {
     console.error('Error parsing inspection photos JSON:', e)
   }

   return NextResponse.json({
     success: true,
     photos,
     startPhotos,
     endPhotos
   })

 } catch (error) {
   console.error('Error retrieving inspection photos:', error)
   return NextResponse.json(
     { error: 'Failed to retrieve photos' },
     { status: 500 }
   )
 }
}