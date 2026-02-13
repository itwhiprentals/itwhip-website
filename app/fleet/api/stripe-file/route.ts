// app/fleet/api/stripe-file/route.ts
// Proxies Stripe Identity verification photos for fleet admin viewing
// Uses direct authenticated download from Stripe Files API
// Requires a restricted API key with Identity + Files permissions
import { NextRequest, NextResponse } from 'next/server'

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

    const stripeKey = process.env.STRIPE_IDENTITY_RESTRICTED_KEY
    if (!stripeKey) {
      console.error('[Stripe File Proxy] STRIPE_IDENTITY_RESTRICTED_KEY not configured')
      return NextResponse.json({ error: 'Server misconfigured' }, { status: 500 })
    }

    // Download file directly from Stripe Files API with authenticated request
    const response = await fetch(`https://files.stripe.com/v1/files/${fileId}/contents`, {
      headers: {
        'Authorization': `Bearer ${stripeKey}`,
      },
    })

    if (!response.ok) {
      const errorText = await response.text().catch(() => '')
      console.error(`[Stripe File Proxy] Stripe files API returned ${response.status} for ${fileId}: ${errorText.slice(0, 200)}`)

      if (response.status === 403) {
        return NextResponse.json({ error: 'Photo not accessible', code: 'PHOTO_EXPIRED' }, { status: 410 })
      }
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
    console.error('[Stripe File Proxy] Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
