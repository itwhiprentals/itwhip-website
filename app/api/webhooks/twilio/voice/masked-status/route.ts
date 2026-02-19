// app/api/webhooks/twilio/voice/masked-status/route.ts
// Status callback for masked call legs
// If one party doesn't answer → end the conference so the other doesn't wait forever

import { NextRequest, NextResponse } from 'next/server'
import { parseTwilioBody } from '@/app/lib/twilio/verify-signature'
import { endConference } from '@/app/lib/twilio/conference'

export async function POST(request: NextRequest) {
  try {
    const params = await parseTwilioBody(request)
    const url = new URL(request.url)
    const room = url.searchParams.get('room') || ''
    const otherLeg = url.searchParams.get('otherLeg') || ''
    const callStatus = params.CallStatus || ''

    console.log(`[Masked Status] Room: ${room}, Status: ${callStatus}, OtherLeg: ${otherLeg}`)

    // If this leg didn't connect, end the conference
    if (['no-answer', 'busy', 'failed', 'canceled'].includes(callStatus)) {
      console.log(`[Masked Status] ${otherLeg} didn't answer (${callStatus}), ending conference ${room}`)
      await endConference(room)
    }

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('[Masked Status] Error:', error)
    return new NextResponse('OK', { status: 200 })
  }
}
