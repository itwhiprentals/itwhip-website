// app/api/twilio/voice-token/route.ts
// Generate Twilio AccessToken with VoiceGrant for browser-based calling
// Auth: fleet_session cookie (fleet admin only)

import { NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import twilio from 'twilio'
import {
  TWILIO_ACCOUNT_SID,
  TWILIO_API_KEY_SID,
  TWILIO_API_KEY_SECRET,
  TWILIO_TWIML_APP_SID,
} from '@/app/lib/twilio/client'

const AccessToken = twilio.jwt.AccessToken
const VoiceGrant = AccessToken.VoiceGrant

const IDENTITY = 'fleet-agent'
const TOKEN_TTL = 3600 // 1 hour

function verifyFleetSession(token: string): boolean {
  return typeof token === 'string' && /^[a-f0-9]{64}$/.test(token)
}

export async function GET() {
  try {
    // Auth: verify fleet session cookie
    const cookieStore = await cookies()
    const session = cookieStore.get('fleet_session')?.value
    if (!session || !verifyFleetSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Validate env vars
    if (!TWILIO_ACCOUNT_SID || !TWILIO_API_KEY_SID || !TWILIO_API_KEY_SECRET || !TWILIO_TWIML_APP_SID) {
      console.error('[Voice Token] Missing Twilio Voice SDK env vars')
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    // Create AccessToken with VoiceGrant
    const token = new AccessToken(
      TWILIO_ACCOUNT_SID,
      TWILIO_API_KEY_SID,
      TWILIO_API_KEY_SECRET,
      { identity: IDENTITY, ttl: TOKEN_TTL }
    )

    const voiceGrant = new VoiceGrant({
      outgoingApplicationSid: TWILIO_TWIML_APP_SID,
      incomingAllow: true,
    })

    token.addGrant(voiceGrant)

    return NextResponse.json({
      token: token.toJwt(),
      identity: IDENTITY,
    })
  } catch (error) {
    console.error('[Voice Token] Error:', error)
    return NextResponse.json({ error: 'Failed to generate token' }, { status: 500 })
  }
}
