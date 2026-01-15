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
    // URL format: https://res.cloudinary.com/cloud_name/raw/upload/v123/folder/filename.pdf
    const urlParts = booking.agreementSignedPdfUrl.split('/upload/')
    if (urlParts.length < 2) {
      console.error('[PDF Proxy] Invalid Cloudinary URL format')
      return NextResponse.json(
        { error: 'Invalid PDF URL' },
        { status: 500 }
      )
    }

    // Remove version and get public_id with extension
    const pathAfterUpload = urlParts[1]
    const pathWithoutVersion = pathAfterUpload.replace(/^v\d+\//, '')
    // Remove .pdf extension for public_id
    const publicId = pathWithoutVersion.replace(/\.pdf$/, '')

    console.log('[PDF Proxy] Attempting to fetch PDF for:', publicId)

    // Try multiple methods to get the PDF

    // Method 1: Generate a private download URL using Cloudinary API
    let pdfResponse: Response | null = null

    try {
      // Get resource info and create authenticated URL
      const timestamp = Math.floor(Date.now() / 1000)
      const signature = cloudinary.utils.api_sign_request(
        { public_id: publicId, timestamp, resource_type: 'raw' },
        process.env.CLOUDINARY_API_SECRET!
      )

      // Build authenticated URL with signature
      const authUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/s--${signature}--/${publicId}.pdf`
      console.log('[PDF Proxy] Trying authenticated URL')
      pdfResponse = await fetch(authUrl)
    } catch (e) {
      console.log('[PDF Proxy] Method 1 failed:', e)
    }

    // Method 2: Try signed URL with different parameters
    if (!pdfResponse?.ok) {
      const signedUrl = cloudinary.url(publicId, {
        resource_type: 'raw',
        type: 'upload',
        sign_url: true,
        secure: true,
        format: 'pdf',
        expires_at: Math.floor(Date.now() / 1000) + 3600
      })
      console.log('[PDF Proxy] Trying signed URL')
      pdfResponse = await fetch(signedUrl)
    }

    // Method 3: Try the original URL directly
    if (!pdfResponse?.ok) {
      console.log('[PDF Proxy] Trying original URL')
      pdfResponse = await fetch(booking.agreementSignedPdfUrl)
    }

    // Method 4: Use Cloudinary download URL format
    if (!pdfResponse?.ok) {
      const downloadUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/fl_attachment/${publicId}.pdf`
      console.log('[PDF Proxy] Trying download URL format')
      pdfResponse = await fetch(downloadUrl)
    }

    // Method 5: Use Cloudinary Admin API to get the resource - try different types
    if (!pdfResponse?.ok) {
      console.log('[PDF Proxy] Trying Admin API method')

      // Try with 'upload' type first, then 'authenticated', then 'private'
      const typesToTry = ['upload', 'authenticated', 'private']

      for (const resourceType of typesToTry) {
        try {
          console.log(`[PDF Proxy] Admin API trying type: ${resourceType}`)
          const resource = await cloudinary.api.resource(publicId, {
            resource_type: 'raw',
            type: resourceType
          })
          if (resource.secure_url) {
            console.log(`[PDF Proxy] Found resource with type ${resourceType}, secure_url:`, resource.secure_url)
            pdfResponse = await fetch(resource.secure_url)
            if (pdfResponse?.ok) break
          }
        } catch (err) {
          console.log(`[PDF Proxy] Admin API type ${resourceType} failed`)
        }
      }
    }

    // Method 6: Try with explicit version from original URL
    if (!pdfResponse?.ok) {
      // Extract version from original URL
      const versionMatch = pathAfterUpload.match(/^(v\d+)\//)
      if (versionMatch) {
        const versionUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/${versionMatch[1]}/${publicId}.pdf`
        console.log('[PDF Proxy] Trying with explicit version')
        pdfResponse = await fetch(versionUrl)
      }
    }

    // Method 7: Try using private_download_url API
    if (!pdfResponse?.ok) {
      console.log('[PDF Proxy] Trying private_download_url')
      try {
        const downloadUrl = cloudinary.utils.private_download_url(publicId, 'pdf', {
          resource_type: 'raw',
          expires_at: Math.floor(Date.now() / 1000) + 3600
        })
        console.log('[PDF Proxy] Private download URL:', downloadUrl)
        pdfResponse = await fetch(downloadUrl)
      } catch (e) {
        console.log('[PDF Proxy] private_download_url failed:', e)
      }
    }

    // Method 8: Try generating URL with all proper parameters manually
    if (!pdfResponse?.ok) {
      console.log('[PDF Proxy] Trying manual signed URL generation')
      try {
        const timestamp = Math.floor(Date.now() / 1000)
        const expires = timestamp + 3600

        // Generate signature for download
        const signatureParams = {
          expires_at: expires,
          public_id: publicId,
          timestamp: timestamp
        }

        const signature = cloudinary.utils.api_sign_request(
          signatureParams,
          process.env.CLOUDINARY_API_SECRET!
        )

        // Build URL with signature
        const signedDownloadUrl = `https://res.cloudinary.com/${process.env.CLOUDINARY_CLOUD_NAME}/raw/upload/s--${signature}--/fl_attachment/${publicId}.pdf?_s=${signature}&_a=${process.env.CLOUDINARY_API_KEY}`
        console.log('[PDF Proxy] Manual signed URL')
        pdfResponse = await fetch(signedDownloadUrl)
      } catch (e) {
        console.log('[PDF Proxy] Manual signing failed:', e)
      }
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
