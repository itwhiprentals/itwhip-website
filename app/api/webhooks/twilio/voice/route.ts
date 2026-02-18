// app/api/webhooks/twilio/voice/route.ts
// Main IVR entry point — Twilio calls this when someone dials 855 or 602
// Handles TWO types of POST:
//   1. Initial call (no Digits) → language selection
//   2. Gather result (Digits=1/2/3) → route to appropriate menu based on caller identity
//
// Routing logic after language selection:
//   - Active trip caller → Active Trip Menu (emergency priority)
//   - Known customer (guest/host in DB) → Customer Menu
//   - Unknown caller (visitor) → Visitor Menu

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyTwilioWebhook, parseTwilioBody } from '@/app/lib/twilio/verify-signature'
import { lookupCaller, type CallerIdentity } from '@/app/lib/twilio/caller-lookup'
import {
  generateLanguageSelection,
  generateActiveTripMenu,
  generateCustomerMenu,
  generateVisitorMenu,
} from '@/app/lib/twilio/twiml'

type Lang = 'en' | 'es' | 'fr'

const LANG_MAP: Record<string, Lang> = { '1': 'en', '2': 'es', '3': 'fr' }

function xml(twiml: string): NextResponse {
  return new NextResponse(twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

export async function POST(request: NextRequest) {
  try {
    const params = await parseTwilioBody(request)
    const signature = request.headers.get('x-twilio-signature')

    if (!verifyTwilioWebhook('/api/webhooks/twilio/voice', params, signature)) {
      console.error('[IVR] Invalid Twilio signature')
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { From: from, CallSid: callSid, Digits: digits } = params
    const lang = LANG_MAP[digits || ''] as Lang | undefined

    // ─── Initial call (no language selected yet) ──────────────────
    if (!lang) {
      prisma.callLog.create({
        data: {
          from: from || 'unknown',
          to: params.To || '',
          callSid: callSid || crypto.randomUUID(),
          status: 'ringing',
          direction: 'INBOUND',
          menuPath: 'entry',
        },
      }).catch(e => console.error('[IVR] Failed to log call:', e))

      return xml(generateLanguageSelection())
    }

    // ─── Language selected → identify caller → route ──────────────

    let caller: CallerIdentity | null = null
    try {
      caller = from ? await lookupCaller(from) : null
    } catch (e) {
      console.error('[IVR] Caller lookup failed (continuing):', e)
    }

    // Update call log
    if (callSid) {
      prisma.callLog.updateMany({
        where: { callSid },
        data: {
          language: lang,
          ...(caller && {
            callerType: caller.type,
            callerId: caller.id,
            ...(caller.activeBooking && { bookingId: caller.activeBooking.id }),
          }),
        },
      }).catch(() => {})
    }

    // Route based on caller identity:
    // 1. Active trip → emergency priority menu
    if (caller?.activeBooking) {
      return xml(generateActiveTripMenu(caller.name || 'there', caller.activeBooking.carName, lang))
    }

    // 2. Known customer (guest or host in DB) → customer menu
    if (caller && caller.type !== 'unknown') {
      return xml(generateCustomerMenu(lang))
    }

    // 3. Unknown caller (visitor) → visitor menu
    return xml(generateVisitorMenu(lang))
  } catch (error) {
    console.error('[IVR] Unhandled error:', error)
    return xml(generateVisitorMenu('en'))
  }
}
