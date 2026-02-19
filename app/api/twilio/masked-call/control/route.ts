// app/api/twilio/masked-call/control/route.ts
// Conference control API — hold, mute, kick, add participant, end conference
// Auth: fleet_session cookie (admin-only actions)

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { twilioClient, TWILIO_LOCAL_NUMBER, WEBHOOK_BASE_URL } from '@/app/lib/twilio/client'

function verifyFleetSession(token: string): boolean {
  return typeof token === 'string' && /^[a-f0-9]{64}$/.test(token)
}

export async function POST(request: NextRequest) {
  try {
    // Auth: fleet session only
    const cookieStore = await cookies()
    const session = cookieStore.get('fleet_session')?.value
    if (!session || !verifyFleetSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!twilioClient) {
      return NextResponse.json({ error: 'Phone system unavailable' }, { status: 503 })
    }

    const body = await request.json()
    const { action, conferenceSid, participantSid, phone, label, hold, muted } = body

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    switch (action) {
      case 'hold': {
        if (!conferenceSid || !participantSid) {
          return NextResponse.json({ error: 'Missing conferenceSid or participantSid' }, { status: 400 })
        }
        await twilioClient.conferences(conferenceSid).participants(participantSid).update({
          hold: hold !== false,
          holdUrl: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/wait-music?lang=en&n=0`,
          holdMethod: 'POST',
        })
        return NextResponse.json({ success: true, action: 'hold', hold: hold !== false })
      }

      case 'mute': {
        if (!conferenceSid || !participantSid) {
          return NextResponse.json({ error: 'Missing conferenceSid or participantSid' }, { status: 400 })
        }
        await twilioClient.conferences(conferenceSid).participants(participantSid).update({
          muted: muted !== false,
        })
        return NextResponse.json({ success: true, action: 'mute', muted: muted !== false })
      }

      case 'kick': {
        if (!conferenceSid || !participantSid) {
          return NextResponse.json({ error: 'Missing conferenceSid or participantSid' }, { status: 400 })
        }
        await twilioClient.conferences(conferenceSid).participants(participantSid).remove()
        return NextResponse.json({ success: true, action: 'kick' })
      }

      case 'add': {
        if (!conferenceSid || !phone) {
          return NextResponse.json({ error: 'Missing conferenceSid or phone' }, { status: 400 })
        }
        // Get the conference friendly name to use in join URL
        const conf = await twilioClient.conferences(conferenceSid).fetch()
        const participant = await twilioClient.conferences(conferenceSid).participants.create({
          from: TWILIO_LOCAL_NUMBER,
          to: phone,
          earlyMedia: false,
          beep: 'true',
          label: label || undefined,
          endConferenceOnExit: false,
        })
        return NextResponse.json({ success: true, action: 'add', callSid: participant.callSid })
      }

      case 'end': {
        if (!conferenceSid) {
          return NextResponse.json({ error: 'Missing conferenceSid' }, { status: 400 })
        }
        await twilioClient.conferences(conferenceSid).update({ status: 'completed' })
        return NextResponse.json({ success: true, action: 'end' })
      }

      case 'participants': {
        if (!conferenceSid) {
          return NextResponse.json({ error: 'Missing conferenceSid' }, { status: 400 })
        }
        const participants = await twilioClient.conferences(conferenceSid).participants.list()
        return NextResponse.json({
          success: true,
          participants: participants.map(p => ({
            callSid: p.callSid,
            label: p.label,
            muted: p.muted,
            hold: p.hold,
            startTime: p.dateCreated,
          })),
        })
      }

      default:
        return NextResponse.json({ error: `Unknown action: ${action}` }, { status: 400 })
    }
  } catch (error: any) {
    console.error('[Conference Control] Error:', error)
    return NextResponse.json({ error: error.message || 'Control action failed' }, { status: 500 })
  }
}
