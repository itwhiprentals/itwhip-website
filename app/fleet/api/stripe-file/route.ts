// app/fleet/api/stripe-file/route.ts
// Proxies Stripe Identity verification photos for fleet admin viewing
// Uses FileLinks per Stripe docs: https://docs.stripe.com/identity/access-verification-results
// Requires a restricted API key with Identity + Files permissions
import { NextRequest, NextResponse } from 'next/server'
import Stripe from 'stripe'

// Separate Stripe instance using restricted key (has Identity photo access)
const stripeIdentity = new Stripe(process.env.STRIPE_IDENTITY_RESTRICTED_KEY!, {
  apiVersion: '2025-08-27.basil' as any,
})

export async function GET(request: NextRequest) {
  try {
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const fileId = request.nextUrl.searchParams.get('id')
    if (!fileId || !fileId.startsWith('file_')) {
      return NextResponse.json({ error: 'Invalid file ID' }, { status: 400 })
    }

    // Create a short-lived FileLink (max 30s for identity files per Stripe docs)
    const fileLink = await stripeIdentity.fileLinks.create({
      file: fileId,
      expires_at: Math.floor(Date.now() / 1000) + 30,
    })

    if (!fileLink.url) {
      console.error(`[Stripe File Proxy] FileLink created but has no URL for ${fileId}`)
      return NextResponse.json({ error: 'File not available' }, { status: 404 })
    }

    // Fetch the file content via the temporary FileLink URL (unauthenticated)
    const response = await fetch(fileLink.url)

    if (!response.ok) {
      console.error(`[Stripe File Proxy] Failed to fetch file ${fileId} via FileLink: ${response.status}`)
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: 502 })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=300',
      },
    })
  } catch (error: any) {
    // Detect the 48-hour limitation error from "Access recent" restricted key
    if (error.message?.includes('48 hours ago') || error.message?.includes('IP restrictions')) {
      console.warn(`[Stripe File Proxy] Photo expired (>48h): ${fileId}`)
      return NextResponse.json({ error: 'Photo expired', code: 'PHOTO_EXPIRED' }, { status: 410 })
    }
    console.error('[Stripe File Proxy] Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
