// app/api/webhooks/twilio/voice/transcription/route.ts
// Transcription callback — Twilio POSTs after voicemail transcription completes
// Updates CallLog with transcription text

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyTwilioWebhook, parseTwilioBody } from '@/app/lib/twilio/verify-signature'

export async function POST(request: NextRequest) {
  try {
    const params = await parseTwilioBody(request)
    const signature = request.headers.get('x-twilio-signature')

    if (!verifyTwilioWebhook('/api/webhooks/twilio/voice/transcription', params, signature)) {
      console.error('[Transcription] Invalid Twilio signature')
      return new NextResponse('Forbidden', { status: 403 })
    }

    const {
      CallSid: callSid,
      RecordingSid: recordingSid,
      TranscriptionText: transcription,
      TranscriptionStatus: status,
    } = params

    // Find the call log by CallSid or RecordingSid
    if (transcription && (callSid || recordingSid)) {
      const where = callSid
        ? { callSid }
        : { recordingSid: recordingSid! }

      await prisma.callLog.updateMany({
        where,
        data: {
          transcription,
        },
      })

      console.log(`[Transcription] Saved for ${callSid || recordingSid}: "${transcription.substring(0, 80)}..."`)
    } else if (status === 'failed') {
      console.warn(`[Transcription] Failed for ${callSid || recordingSid}`)
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('[Transcription] Error:', error)
    return new NextResponse('OK', { status: 200 })
  }
}
