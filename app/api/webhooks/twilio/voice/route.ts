// app/api/webhooks/twilio/voice/route.ts
// Main IVR entry point — Twilio calls this when someone dials 855 or 602
// Handles TWO types of POST:
//   1. Initial call (no Digits) → language selection
//   2. Gather result (Digits=1/2/3) → route to language-specific menu

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyTwilioWebhook, parseTwilioBody } from '@/app/lib/twilio/verify-signature'
import { lookupCaller, type CallerIdentity } from '@/app/lib/twilio/caller-lookup'
import {
  generateLanguageSelection,
  generateActiveTripMenu,
  generateMainMenu,
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
      // Log new call (only on first POST, not on gather result)
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

    // ─── Language selected → route to menu ────────────────────────

    // Caller lookup (non-blocking — don't let it break the menu)
    let caller: CallerIdentity | null = null
    try {
      caller = from ? await lookupCaller(from) : null
    } catch (e) {
      console.error('[IVR] Caller lookup failed (continuing):', e)
    }

    // Update call log with caller info + language
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

    // Route to active trip menu or standard menu
    if (caller?.activeBooking) {
      return xml(generateActiveTripMenu(caller.name || 'there', caller.activeBooking.carName, lang))
    }

    return xml(generateMainMenu(lang))
  } catch (error) {
    // Safety net — always return valid TwiML so Twilio never gets a 500
    console.error('[IVR] Unhandled error:', error)
    return xml(generateMainMenu('en'))
  }
}
