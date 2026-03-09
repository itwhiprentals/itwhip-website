// Proxy Twilio recording audio to avoid browser auth dialogs
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const PHOENIX_KEY = 'phoenix-fleet-2847'
const EXTERNAL_KEY = process.env.FLEET_API_KEY || ''

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  if (key !== PHOENIX_KEY && !(EXTERNAL_KEY && key === EXTERNAL_KEY)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const callId = request.nextUrl.searchParams.get('id')
  if (!callId) {
    return NextResponse.json({ error: 'Missing call ID' }, { status: 400 })
  }

  const call = await prisma.callLog.findUnique({
    where: { id: callId },
    select: { recordingUrl: true },
  })

  if (!call?.recordingUrl) {
    return NextResponse.json({ error: 'Recording not found' }, { status: 404 })
  }

  // Twilio recording URLs need auth — fetch with credentials and stream back
  const accountSid = process.env.TWILIO_ACCOUNT_SID
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!accountSid || !authToken) {
    return NextResponse.json({ error: 'Twilio not configured' }, { status: 500 })
  }

  try {
    const res = await fetch(call.recordingUrl, {
      headers: {
        Authorization: 'Basic ' + Buffer.from(`${accountSid}:${authToken}`).toString('base64'),
      },
    })

    if (!res.ok) {
      return NextResponse.json({ error: 'Failed to fetch recording' }, { status: 502 })
    }

    const contentType = res.headers.get('content-type') || 'audio/mpeg'
    const body = await res.arrayBuffer()

    return new NextResponse(body, {
      headers: {
        'Content-Type': contentType,
        'Cache-Control': 'private, max-age=3600',
      },
    })
  } catch {
    return NextResponse.json({ error: 'Failed to proxy recording' }, { status: 500 })
  }
}
