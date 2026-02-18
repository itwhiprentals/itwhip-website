// app/api/webhooks/twilio/sms/route.ts
// Inbound SMS handler — receives texts to +16026092577
// Looks up sender, routes to booking thread or sends auto-reply

import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'
import { prisma } from '@/app/lib/database/prisma'
import { verifyTwilioWebhook, parseTwilioBody } from '@/app/lib/twilio/verify-signature'
import { normalizeForLookup } from '@/app/lib/twilio/phone'
import * as templates from '@/app/lib/twilio/sms-templates'

export async function POST(request: NextRequest) {
  try {
    const params = await parseTwilioBody(request)
    const signature = request.headers.get('x-twilio-signature')

    // Verify Twilio signature
    if (!verifyTwilioWebhook('/api/webhooks/twilio/sms', params, signature)) {
      console.error('[Inbound SMS] Invalid Twilio signature')
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { From: from, Body: body, MessageSid: messageSid } = params

    if (!from || !body) {
      return new NextResponse('OK', { status: 200 })
    }

    const phoneLast10 = normalizeForLookup(from)

    // Log inbound SMS
    await prisma.smsLog.create({
      data: {
        to: params.To || '',
        from,
        body,
        status: 'received',
        type: 'INBOUND',
        twilioSid: messageSid || null,
      }
    })

    // Look up sender by phone — check active bookings first
    const activeBooking = await prisma.rentalBooking.findFirst({
      where: {
        OR: [
          { guestPhone: { endsWith: phoneLast10 } },
          { host: { phone: { endsWith: phoneLast10 } } },
        ],
        status: { in: ['CONFIRMED', 'ACTIVE'] },
        tripStatus: { in: ['PENDING', 'ACTIVE', null] },
      },
      select: {
        id: true,
        bookingCode: true,
        guestPhone: true,
        guestName: true,
        guestEmail: true,
        hostId: true,
        host: { select: { phone: true, name: true } },
        car: { select: { year: true, make: true, model: true } },
      },
      orderBy: { startDate: 'desc' },
    })

    const twiml = new twilio.twiml.MessagingResponse()

    if (activeBooking) {
      // Determine if sender is guest or host
      const senderIsGuest = activeBooking.guestPhone?.endsWith(phoneLast10)
      const senderType = senderIsGuest ? 'guest' : 'host'
      const senderName = senderIsGuest
        ? (activeBooking.guestName || 'Guest')
        : (activeBooking.host?.name || 'Host')

      // Create a message in the booking thread
      await prisma.rentalMessage.create({
        data: {
          id: crypto.randomUUID(),
          bookingId: activeBooking.id,
          senderId: senderIsGuest ? 'sms-guest' : activeBooking.hostId,
          senderType,
          senderName,
          message: body.trim(),
          category: 'general',
          isRead: false,
          readByAdmin: false,
          updatedAt: new Date(),
        } as any,
      })

      // Update SmsLog with booking link
      if (messageSid) {
        await prisma.smsLog.updateMany({
          where: { twilioSid: messageSid },
          data: { bookingId: activeBooking.id },
        })
      }

      console.log(`[Inbound SMS] Routed to booking ${activeBooking.bookingCode} from ${senderType}`)

      // Auto-reply confirming message was delivered
      const locale = 'en' // Inbound SMS auto-reply always English
      const replyBody = templates.inboundAutoReplyWithBooking({
        recipientType: senderIsGuest ? 'host' : 'guest',
        bookingCode: activeBooking.bookingCode,
      }, locale)

      twiml.message(replyBody)
    } else {
      // No active booking — send generic auto-reply
      const replyBody = templates.inboundAutoReplyNoBooking('en')
      twiml.message(replyBody)

      console.log(`[Inbound SMS] No active booking for ${from}`)
    }

    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('[Inbound SMS] Error:', error)
    // Always return valid TwiML even on error
    const twiml = new twilio.twiml.MessagingResponse()
    return new NextResponse(twiml.toString(), {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}
