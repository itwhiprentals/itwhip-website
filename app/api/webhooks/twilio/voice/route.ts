// app/api/webhooks/twilio/voice/route.ts
// Main IVR entry point — Twilio calls this when someone dials 855 or 602
// Layer 1: Language selection → routes to English, Spanish, or French menu

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyTwilioWebhook, parseTwilioBody } from '@/app/lib/twilio/verify-signature'
import { lookupCaller } from '@/app/lib/twilio/caller-lookup'
import {
  generateLanguageSelection,
  generateActiveTripMenu,
  generateMainMenu,
} from '@/app/lib/twilio/twiml'

type Lang = 'en' | 'es' | 'fr'

const LANG_MAP: Record<string, Lang> = { '1': 'en', '2': 'es', '3': 'fr' }

export async function POST(request: NextRequest) {
  try {
    const params = await parseTwilioBody(request)
    const signature = request.headers.get('x-twilio-signature')

    // Verify Twilio signature
    if (!verifyTwilioWebhook('/api/webhooks/twilio/voice', params, signature)) {
      console.error('[IVR] Invalid Twilio signature')
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { From: from, CallSid: callSid, Digits: digits } = params

    // Log the call
    await prisma.callLog.create({
      data: {
        from: from || 'unknown',
        to: params.To || '',
        callSid: callSid || crypto.randomUUID(),
        status: 'ringing',
        direction: 'INBOUND',
        menuPath: 'entry',
      },
    }).catch(e => console.error('[IVR] Failed to log call:', e))

    // Caller lookup — identify guest/host with active trip
    const caller = from ? await lookupCaller(from) : null

    if (caller) {
      await prisma.callLog.updateMany({
        where: { callSid: callSid || '' },
        data: {
          callerType: caller.type,
          callerId: caller.id,
          ...(caller.activeBooking && { bookingId: caller.activeBooking.id }),
        },
      }).catch(() => {})
    }

    let twiml: string
    const lang = LANG_MAP[digits || ''] as Lang | undefined

    if (lang) {
      // Language selected — route to appropriate menu
      if (caller?.activeBooking) {
        twiml = generateActiveTripMenu(caller.name || 'there', caller.activeBooking.carName, lang)
      } else {
        twiml = generateMainMenu(lang)
      }
    } else {
      // First call or invalid digit — show language selection
      twiml = generateLanguageSelection()
    }

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('[IVR] Error:', error)
    const twiml = generateLanguageSelection()
    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}
