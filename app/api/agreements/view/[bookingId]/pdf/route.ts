// app/api/agreements/view/[bookingId]/pdf/route.ts
// Proxy endpoint to serve signed agreement PDFs with correct headers

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params

    // Find booking with signed agreement
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: {
        id: true,
        bookingCode: true,
        agreementStatus: true,
        agreementSignedPdfUrl: true,
        hostId: true
      }
    })

    if (!booking) {
      return NextResponse.json(
        { error: 'Agreement not found' },
        { status: 404 }
      )
    }

    // Check if agreement is signed and has PDF URL
    if (booking.agreementStatus !== 'signed' || !booking.agreementSignedPdfUrl) {
      return NextResponse.json(
        { error: 'Signed PDF not available' },
        { status: 404 }
      )
    }

    // Extract public_id from the URL
    // URL format: https://res.cloudinary.com/cloud_name/image/upload/v123/folder/filename.pdf
    // or: https://res.cloudinary.com/cloud_name/raw/upload/v123/folder/filename.pdf
    const urlParts = booking.agreementSignedPdfUrl.split('/upload/')
    if (urlParts.length < 2) {
      console.error('[PDF Proxy] Invalid Cloudinary URL format')
      return NextResponse.json(
        { error: 'Invalid PDF URL' },
        { status: 500 }
      )
    }

    // Detect resource type from URL (image or raw)
    const isImageType = booking.agreementSignedPdfUrl.includes('/image/upload/')
    const resourceType = isImageType ? 'image' : 'raw'
    console.log('[PDF Proxy] Detected resource type:', resourceType)

    // Remove version and get public_id with extension
    const pathAfterUpload = urlParts[1]
    const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '')
    // Remove .pdf extension for public_id
    const publicId = pathWithoutVersion.replace(/\.pdf$/, '')

    console.log('[PDF Proxy] Attempting to fetch PDF for:', publicId)
    console.log('[PDF Proxy] Original URL:', booking.agreementSignedPdfUrl)

    // Try multiple methods to get the PDF
    let pdfResponse: Response | null = null

    // Method 1: Try the original URL directly (simplest approach)
    console.log('[PDF Proxy] Method 1: Trying original URL directly')
    pdfResponse = await fetch(booking.agreementSignedPdfUrl)

    if (pdfResponse?.ok) {
      console.log('[PDF Proxy] Method 1 succeeded!')
    }

    // Method 2: Try with Cloudinary URL generator
    if (!pdfResponse?.ok) {
      console.log('[PDF Proxy] Method 2: Trying Cloudinary URL generator')
      const generatedUrl = cloudinary.url(publicId, {
        resource_type: resourceType,
        type: 'upload',
        secure: true,
        format: 'pdf'
      })
      console.log('[PDF Proxy] Generated URL:', generatedUrl)
      pdfResponse = await fetch(generatedUrl)
    }

    // Method 3: Try with signed URL
    if (!pdfResponse?.ok) {
      console.log('[PDF Proxy] Method 3: Trying signed URL')
      const signedUrl = cloudinary.url(publicId, {
        resource_type: resourceType,
        type: 'upload',
        sign_url: true,
        secure: true,
        format: 'pdf'
      })
      console.log('[PDF Proxy] Signed URL:', signedUrl)
      pdfResponse = await fetch(signedUrl)
    }

    // Method 4: Try Admin API to get resource info
    if (!pdfResponse?.ok) {
      console.log('[PDF Proxy] Method 4: Trying Admin API')
      try {
        const resource = await cloudinary.api.resource(publicId, {
          resource_type: resourceType,
          type: 'upload'
        })
        if (resource.secure_url) {
          console.log('[PDF Proxy] Found via Admin API:', resource.secure_url)
          pdfResponse = await fetch(resource.secure_url)
        }
      } catch (err) {
        console.log('[PDF Proxy] Admin API failed:', err)
      }
    }

    // Method 5: Try the other resource type (in case it was uploaded differently)
    if (!pdfResponse?.ok) {
      const altResourceType = resourceType === 'image' ? 'raw' : 'image'
      console.log('[PDF Proxy] Method 5: Trying alternate resource type:', altResourceType)

      const altUrl = cloudinary.url(publicId, {
        resource_type: altResourceType,
        type: 'upload',
        secure: true,
        format: 'pdf'
      })
      console.log('[PDF Proxy] Alternate URL:', altUrl)
      pdfResponse = await fetch(altUrl)
    }

    if (!pdfResponse?.ok) {
      console.error(`[PDF Proxy] All methods failed. Last status: ${pdfResponse?.status}`)
      console.error(`[PDF Proxy] Original URL: ${booking.agreementSignedPdfUrl}`)
      console.error(`[PDF Proxy] Public ID attempted: ${publicId}`)
      return NextResponse.json(
        {
          error: 'Failed to fetch PDF from storage',
          details: 'The PDF file may not exist in storage. This can happen if the original upload failed. Try signing a new agreement.',
          originalUrl: booking.agreementSignedPdfUrl
        },
        { status: 502 }
      )
    }

    // Get the PDF content as array buffer
    const pdfBuffer = await pdfResponse.arrayBuffer()

    // Return PDF with correct headers for browser viewing
    return new NextResponse(pdfBuffer, {
      status: 200,
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="agreement-${booking.bookingCode}.pdf"`,
        'Cache-Control': 'public, max-age=3600', // Cache for 1 hour
      }
    })

  } catch (error) {
    console.error('[PDF Proxy] Error:', error)
    return NextResponse.json(
      { error: 'Failed to serve PDF' },
      { status: 500 }
    )
  }
}
