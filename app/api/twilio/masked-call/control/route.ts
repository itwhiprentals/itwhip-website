// app/api/twilio/masked-call/control/route.ts
// Conference control API — hold, mute, kick, add, end, participants,
// find-conference, bridge (connect guest & host), active-conferences
// Auth: fleet_session cookie (admin-only)

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/app/lib/database/prisma'
import { twilioClient, TWILIO_LOCAL_NUMBER, WEBHOOK_BASE_URL } from '@/app/lib/twilio/client'

function verifyFleetSession(token: string): boolean {
  return typeof token === 'string' && /^[a-f0-9]{64}$/.test(token)
}

export async function POST(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const session = cookieStore.get('fleet_session')?.value
    if (!session || !verifyFleetSession(session)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (!twilioClient) {
      return NextResponse.json({ error: 'Phone system unavailable' }, { status: 503 })
    }

    const body = await request.json()
    const { action, conferenceSid, participantSid, phone, label, hold, muted, callSid, bookingId } = body

    if (!action) {
      return NextResponse.json({ error: 'Missing action' }, { status: 400 })
    }

    switch (action) {
      // ─── Basic conference participant controls ─────────────────────

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
        const participant = await twilioClient.conferences(conferenceSid).participants.create({
          from: TWILIO_LOCAL_NUMBER,
          to: phone,
          earlyMedia: false,
          beep: 'true',
          label: label || phone,
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

      // ─── Participant list with enriched data ───────────────────────

      case 'participants': {
        if (!conferenceSid) {
          return NextResponse.json({ error: 'Missing conferenceSid' }, { status: 400 })
        }
        const participants = await twilioClient.conferences(conferenceSid).participants.list()
        // Use label from Twilio directly — avoids N extra API calls per poll
        const enriched = participants.map((p) => ({
          callSid: p.callSid,
          label: p.label || p.callSid.slice(0, 12),
          muted: p.muted,
          hold: p.hold,
          startTime: p.dateCreated,
          phoneNumber: null,
          isClient: p.label?.startsWith('client:') || false,
        }))
        return NextResponse.json({ success: true, participants: enriched })
      }

      // ─── Find which conference a call is in ────────────────────────

      case 'find-conference': {
        const conferences = await twilioClient.conferences.list({ status: 'in-progress', limit: 20 })
        const ourPrefixes = ['browser-', 'call-', 'bridge-', 'masked-']

        for (const conf of conferences) {
          if (!ourPrefixes.some(p => conf.friendlyName.startsWith(p))) continue
          const participants = await twilioClient.conferences(conf.sid).participants.list()

          if (callSid) {
            if (participants.find(p => p.callSid === callSid)) {
              return NextResponse.json({
                found: true,
                conferenceSid: conf.sid,
                friendlyName: conf.friendlyName,
                participants: participants.map(p => ({
                  callSid: p.callSid, label: p.label || p.callSid.slice(0, 12),
                  muted: p.muted, hold: p.hold,
                })),
              })
            }
          } else if (participants.length > 0) {
            // No callSid — return first active conference
            return NextResponse.json({
              found: true,
              conferenceSid: conf.sid,
              friendlyName: conf.friendlyName,
              participants: participants.map(p => ({
                callSid: p.callSid, label: p.label || p.callSid.slice(0, 12),
                muted: p.muted, hold: p.hold,
              })),
            })
          }
        }
        return NextResponse.json({ found: false })
      }

      // ─── List all active conferences (for monitoring panel) ────────

      case 'active-conferences': {
        const conferences = await twilioClient.conferences.list({ status: 'in-progress', limit: 20 })
        const ourPrefixes = ['browser-', 'call-', 'bridge-', 'masked-']
        const ours = conferences.filter(c => ourPrefixes.some(p => c.friendlyName.startsWith(p)))

        const results = await Promise.all(ours.map(async (conf) => {
          const participants = await twilioClient!.conferences(conf.sid).participants.list()
          return {
            sid: conf.sid,
            friendlyName: conf.friendlyName,
            participantCount: participants.length,
            dateCreated: conf.dateCreated,
          }
        }))

        return NextResponse.json({ success: true, conferences: results })
      }

      // ─── Bridge guest & host (admin-initiated, admin NOT in call) ──

      case 'bridge': {
        if (!bookingId) {
          return NextResponse.json({ error: 'Missing bookingId' }, { status: 400 })
        }

        const booking = await prisma.rentalBooking.findUnique({
          where: { id: bookingId },
          select: {
            id: true, bookingCode: true, status: true,
            guestPhone: true,
            host: { select: { phone: true, name: true } },
            renter: { select: { phoneNumber: true } },
          },
        })

        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

        const guestPhone = booking.guestPhone || booking.renter?.phoneNumber
        const hostPhone = booking.host?.phone
        if (!guestPhone || !hostPhone) {
          return NextResponse.json({ error: 'Missing phone numbers for guest or host' }, { status: 400 })
        }

        const roomName = `bridge-${booking.bookingCode}-${Date.now()}`

        const guestCall = await twilioClient.calls.create({
          to: guestPhone,
          from: TWILIO_LOCAL_NUMBER,
          url: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/masked-caller?room=${encodeURIComponent(roomName)}&target=host&lang=en`,
          method: 'POST',
          timeout: 30,
          statusCallback: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/masked-status?room=${encodeURIComponent(roomName)}&otherLeg=host`,
          statusCallbackEvent: ['completed', 'busy', 'no-answer', 'failed', 'canceled'],
          statusCallbackMethod: 'POST',
        })

        const hostCall = await twilioClient.calls.create({
          to: hostPhone,
          from: TWILIO_LOCAL_NUMBER,
          url: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/masked-caller?room=${encodeURIComponent(roomName)}&target=guest&lang=en`,
          method: 'POST',
          timeout: 30,
          // AMD disabled — was falsely detecting real humans as voicemail
          statusCallback: `${WEBHOOK_BASE_URL}/api/webhooks/twilio/voice/masked-status?room=${encodeURIComponent(roomName)}&otherLeg=guest`,
          statusCallbackEvent: ['completed', 'busy', 'no-answer', 'failed', 'canceled'],
          statusCallbackMethod: 'POST',
        })

        prisma.callLog.create({
          data: {
            callSid: guestCall.sid,
            direction: 'OUTBOUND',
            from: TWILIO_LOCAL_NUMBER,
            to: guestPhone,
            status: 'initiated',
            callerType: 'admin',
            menuPath: `bridge/${booking.bookingCode}`,
            bookingId: booking.id,
            language: 'en',
          },
        }).catch(e => console.error('[Bridge] Log error:', e))

        console.log(`[Bridge] ${booking.bookingCode} | Room: ${roomName} | Guest: ${guestCall.sid} | Host: ${hostCall.sid}`)

        return NextResponse.json({
          success: true,
          roomName,
          guestCallSid: guestCall.sid,
          hostCallSid: hostCall.sid,
        })
      }

      // ─── Booking lookup for adding participants ────────────────────

      case 'booking-lookup': {
        const code = body.code as string
        if (!code) return NextResponse.json({ error: 'Missing booking code' }, { status: 400 })

        const booking = await prisma.rentalBooking.findFirst({
          where: { bookingCode: code.toUpperCase() },
          select: {
            id: true, bookingCode: true, guestName: true, guestPhone: true,
            host: { select: { name: true, phone: true } },
            renter: { select: { phoneNumber: true } },
          },
        })

        if (!booking) return NextResponse.json({ error: 'Booking not found' }, { status: 404 })

        return NextResponse.json({
          success: true,
          bookingCode: booking.bookingCode,
          guestName: booking.guestName,
          guestPhone: booking.guestPhone || booking.renter?.phoneNumber || null,
          hostName: booking.host?.name || null,
          hostPhone: booking.host?.phone || null,
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
