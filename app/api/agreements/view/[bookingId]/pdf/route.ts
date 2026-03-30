// app/api/agreements/view/[bookingId]/pdf/route.ts
// Proxy endpoint to serve signed agreement PDFs

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { getPrivateDocumentUrl, isS3Key } from '@/app/lib/storage/s3'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ bookingId: string }> }
) {
  try {
    const { bookingId } = await params

    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: { id: true, bookingCode: true, agreementStatus: true, agreementSignedPdfUrl: true, hostId: true }
    })

    if (!booking) return NextResponse.json({ error: 'Agreement not found' }, { status: 404 })
    if (booking.agreementStatus !== 'signed' || !booking.agreementSignedPdfUrl) {
      return NextResponse.json({ error: 'Signed PDF not available' }, { status: 404 })
    }

    let pdfUrl: string

    // S3 key — generate pre-signed URL
    if (isS3Key(booking.agreementSignedPdfUrl)) {
      pdfUrl = await getPrivateDocumentUrl(booking.agreementSignedPdfUrl, 900)
    } else {
      // Legacy Cloudinary URL — fetch directly
      pdfUrl = booking.agreementSignedPdfUrl
    }

    // Fetch and proxy the PDF
    const pdfResponse = await fetch(pdfUrl)
    if (!pdfResponse.ok) {
      console.error('[PDF Proxy] Failed to fetch PDF:', pdfResponse.status)
      return NextResponse.json({ error: 'Failed to fetch PDF' }, { status: 500 })
    }

    const pdfBuffer = await pdfResponse.arrayBuffer()

    return new NextResponse(pdfBuffer, {
      headers: {
        'Content-Type': 'application/pdf',
        'Content-Disposition': `inline; filename="${booking.bookingCode}-agreement.pdf"`,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error) {
    console.error('[PDF Proxy] Error:', error)
    return NextResponse.json({ error: 'Failed to serve PDF' }, { status: 500 })
  }
}
