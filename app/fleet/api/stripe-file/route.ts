// app/fleet/api/stripe-file/route.ts
// Proxies Stripe Identity verification photos for fleet admin viewing
import { NextRequest, NextResponse } from 'next/server'
import { stripe } from '@/app/lib/stripe/client'

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

    // Retrieve file metadata from Stripe
    const file = await stripe.files.retrieve(fileId)

    if (!file.url) {
      return NextResponse.json({ error: 'File has no URL' }, { status: 404 })
    }

    // Fetch the actual file content from Stripe (requires auth)
    const response = await fetch(file.url, {
      headers: {
        'Authorization': `Bearer ${process.env.STRIPE_SECRET_KEY}`,
      },
    })

    if (!response.ok) {
      console.error(`[Stripe File Proxy] Failed to fetch file ${fileId}: ${response.status}`)
      return NextResponse.json({ error: 'Failed to fetch file' }, { status: 502 })
    }

    const contentType = response.headers.get('content-type') || 'image/jpeg'
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch (error: any) {
    console.error('[Stripe File Proxy] Error:', error.message)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
