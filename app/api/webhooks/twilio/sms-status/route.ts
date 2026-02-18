// app/api/webhooks/twilio/sms-status/route.ts
// Receives delivery status updates from Twilio for outbound SMS
// Twilio POSTs form-encoded data with MessageSid, MessageStatus, etc.

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyTwilioWebhook, parseTwilioBody } from '@/app/lib/twilio/verify-signature'

export async function POST(request: NextRequest) {
  try {
    const params = await parseTwilioBody(request)
    const signature = request.headers.get('x-twilio-signature')

    // Verify Twilio signature
    if (!verifyTwilioWebhook('/api/webhooks/twilio/sms-status', params, signature)) {
      console.error('[SMS Status] Invalid Twilio signature')
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { MessageSid, MessageStatus, ErrorCode, ErrorMessage } = params

    if (!MessageSid || !MessageStatus) {
      return new NextResponse('OK', { status: 200 })
    }

    // Update SmsLog with delivery status
    const updateData: Record<string, unknown> = {
      status: MessageStatus,
    }

    if (MessageStatus === 'delivered') {
      updateData.deliveredAt = new Date()
    }

    if (ErrorCode) {
      updateData.errorCode = ErrorCode
      updateData.errorMessage = ErrorMessage || null
    }

    await prisma.smsLog.updateMany({
      where: { twilioSid: MessageSid },
      data: updateData,
    })

    return new NextResponse('OK', { status: 200 })
  } catch (error) {
    console.error('[SMS Status] Error:', error)
    return new NextResponse('OK', { status: 200 })
  }
}
