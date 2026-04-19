// app/fleet/api/dl-image/route.ts
// Fleet-only proxy for DL / verification document images.
// - Full URLs (http/https) → 302 redirect (old rows)
// - S3 keys → server fetches from private bucket and streams bytes back

import { NextRequest, NextResponse } from 'next/server'
import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3'

export const dynamic = 'force-dynamic'

const FLEET_KEY = 'phoenix-fleet-2847'
const REGION = process.env.AWS_REGION || 'us-east-2'
const PRIVATE_BUCKET = process.env.AWS_S3_PRIVATE_BUCKET || 'itwhip-private-documents'

const s3 = new S3Client({ region: REGION })

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const key = searchParams.get('key')
  const path = searchParams.get('path')

  if (key !== FLEET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }
  if (!path) {
    return NextResponse.json({ error: 'Missing path' }, { status: 400 })
  }

  // Figure out the S3 key. Three shapes we handle:
  //   1) Bare key: "dl-photos/.../file.jpg"
  //   2) Full URL to our PRIVATE bucket (possibly with expired signature) — extract the key and re-fetch
  //   3) Full URL elsewhere (Cloudinary, public CDN) — just redirect
  let s3Key: string | null = null

  if (path.startsWith('http://') || path.startsWith('https://')) {
    try {
      const parsed = new URL(path)
      const host = parsed.hostname
      const isOurPrivateBucket =
        host === `${PRIVATE_BUCKET}.s3.${REGION}.amazonaws.com` ||
        host === `${PRIVATE_BUCKET}.s3.amazonaws.com` ||
        host === `s3.${REGION}.amazonaws.com` && parsed.pathname.startsWith(`/${PRIVATE_BUCKET}/`)
      if (isOurPrivateBucket) {
        s3Key = decodeURIComponent(
          host.startsWith(PRIVATE_BUCKET)
            ? parsed.pathname.replace(/^\//, '')
            : parsed.pathname.replace(`/${PRIVATE_BUCKET}/`, '')
        )
      } else {
        // Public/CDN URL — just redirect the browser to it
        return NextResponse.redirect(path, 302)
      }
    } catch {
      return NextResponse.json({ error: 'Invalid path' }, { status: 400 })
    }
  } else {
    s3Key = path
  }

  if (!s3Key) {
    return NextResponse.json({ error: 'Unable to resolve key' }, { status: 400 })
  }

  try {
    const obj = await s3.send(new GetObjectCommand({ Bucket: PRIVATE_BUCKET, Key: s3Key }))
    const body = obj.Body
    if (!body) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }

    // Stream to buffer
    const chunks: Uint8Array[] = []
    for await (const chunk of body as AsyncIterable<Uint8Array>) {
      chunks.push(chunk)
    }
    const buffer = Buffer.concat(chunks)

    const contentType = obj.ContentType || 'image/jpeg'

    return new NextResponse(buffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': buffer.length.toString(),
        'Cache-Control': 'private, max-age=300',
      },
    })
  } catch (err: any) {
    if (err?.name === 'NoSuchKey' || err?.$metadata?.httpStatusCode === 404) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 })
    }
    console.error('[dl-image] Error fetching S3 object:', err?.message || err)
    return NextResponse.json({ error: 'Failed to fetch image' }, { status: 500 })
  }
}
