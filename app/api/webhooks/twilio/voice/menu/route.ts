// app/api/webhooks/twilio/voice/menu/route.ts
// DTMF handler — routes Press 1/2/3/4 from main menu and submenus
// All menu navigation happens here via ?lang=&menu= query params

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyTwilioWebhook, parseTwilioBody } from '@/app/lib/twilio/verify-signature'
import { lookupBookingByCode } from '@/app/lib/twilio/caller-lookup'
import {
  generateMainMenu,
  generateBookingCodeEntry,
  generateBookingFound,
  generateBookingNotFound,
  generateBookingSkip,
  generateInsuranceMenu,
  generateInsuranceInfo,
  generateReportDamage,
  generateSpeakWithSomeone,
  generateVoicemailPrompt,
  generateEmergencyMenu,
  generateRoadsideInfo,
  generateConnectToHost,
  generatePickupDetails,
  generateNoInput,
  generateInvalidInput,
} from '@/app/lib/twilio/twiml'

export async function POST(request: NextRequest) {
  try {
    const params = await parseTwilioBody(request)
    const signature = request.headers.get('x-twilio-signature')

    if (!verifyTwilioWebhook('/api/webhooks/twilio/voice/menu', params, signature)) {
      console.error('[IVR Menu] Invalid Twilio signature')
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { Digits: digits, CallSid: callSid } = params
    const url = new URL(request.url)
    const lang = (url.searchParams.get('lang') || 'en') as 'en' | 'es' | 'fr'
    const menu = url.searchParams.get('menu') || 'main'

    // Update call log with menu path
    if (callSid) {
      await prisma.callLog.updateMany({
        where: { callSid },
        data: {
          menuPath: `${menu}>${digits || 'none'}`,
          language: lang,
        },
      }).catch(() => {})
    }

    let twiml: string

    switch (menu) {
      // ─── Main Menu ──────────────────────────────────────
      case 'main':
        switch (digits) {
          case '1': // Booking support
            twiml = generateBookingCodeEntry(lang)
            break
          case '2': // Insurance & claims
            twiml = generateInsuranceMenu(lang)
            break
          case '3': // Speak with someone
            twiml = generateSpeakWithSomeone(lang)
            break
          default:
            twiml = generateInvalidInput(lang)
        }
        break

      // ─── Active Trip Menu ───────────────────────────────
      case 'active-trip':
        switch (digits) {
          case '1': // Emergency
            twiml = generateEmergencyMenu(lang)
            break
          case '2': // Standard menu
            twiml = generateMainMenu(lang)
            break
          default:
            twiml = generateInvalidInput(lang)
        }
        break

      // ─── Emergency Menu ─────────────────────────────────
      case 'emergency':
        switch (digits) {
          case '1': // Roadside assistance info
            twiml = generateRoadsideInfo(lang)
            break
          case '2': // Speak with someone immediately
            twiml = generateSpeakWithSomeone(lang)
            break
          default:
            twiml = generateInvalidInput(lang)
        }
        break

      // ─── Booking Code Entry ─────────────────────────────
      case 'booking-code': {
        if (digits === '*') {
          twiml = generateBookingSkip(lang)
          break
        }

        if (digits && digits.length >= 4) {
          const booking = await lookupBookingByCode(digits)
          if (booking) {
            const carName = `${booking.car.year || ''} ${booking.car.make || ''} ${booking.car.model || ''}`.trim()
            const fmt = (d: Date) => new Date(d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
            const dates = `${fmt(booking.startDate)}-${fmt(booking.endDate)}`

            twiml = generateBookingFound({
              bookingCode: booking.bookingCode,
              carName,
              dates,
              hostName: booking.host?.name || 'your host',
            }, lang)
          } else {
            twiml = generateBookingNotFound(lang)
          }
        } else {
          twiml = generateBookingNotFound(lang)
        }
        break
      }

      // ─── Booking Found Actions ──────────────────────────
      case 'booking-found': {
        const bookingCode = url.searchParams.get('code') || ''
        switch (digits) {
          case '1': { // Connect to host
            const bk = await lookupBookingByCode(bookingCode)
            if (bk?.host?.phone) {
              twiml = generateConnectToHost(bk.host.phone, lang)
            } else {
              twiml = generateSpeakWithSomeone(lang)
            }
            break
          }
          case '2': { // Pickup details
            const bk = await lookupBookingByCode(bookingCode)
            if (bk) {
              const address = bk.deliveryAddress || bk.pickupLocation || bk.car?.address
                ? `${bk.deliveryAddress || bk.pickupLocation || bk.car?.address || ''}, ${bk.car?.city || 'Phoenix'}`
                : 'your pickup location'
              const date = new Date(bk.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
              const time = bk.startTime || '10:00 AM'

              twiml = generatePickupDetails({ address, date, time }, lang)
            } else {
              twiml = generateBookingNotFound(lang)
            }
            break
          }
          case '3': // Back to main menu
            twiml = generateMainMenu(lang)
            break
          default:
            twiml = generateInvalidInput(lang)
        }
        break
      }

      // ─── Insurance Menu ─────────────────────────────────
      case 'insurance':
        switch (digits) {
          case '1': // Insurance questions
            twiml = generateInsuranceInfo(lang)
            break
          case '2': // Report damage
            twiml = generateReportDamage(lang)
            break
          case '3': // Check claim status → link to website
            twiml = generateReportDamage(lang)
            break
          case '4': // Back to main
            twiml = generateMainMenu(lang)
            break
          default:
            twiml = generateInvalidInput(lang)
        }
        break

      // ─── Booking Not Found Actions ────────────────────────
      case 'booking-not-found':
        switch (digits) {
          case '1': // Try again
            twiml = generateBookingCodeEntry(lang)
            break
          case '2': // Main menu
            twiml = generateMainMenu(lang)
            break
          default:
            twiml = generateMainMenu(lang)
        }
        break

      // ─── Voicemail Prompt ───────────────────────────────
      case 'voicemail-prompt':
        twiml = generateVoicemailPrompt(lang)
        break

      // ─── Speak with Someone ─────────────────────────────
      case 'speak': {
        if (digits === '1') {
          twiml = generateVoicemailPrompt(lang)
        } else {
          twiml = generateMainMenu(lang)
        }
        break
      }

      default:
        twiml = generateMainMenu(lang)
    }

    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  } catch (error) {
    console.error('[IVR Menu] Error:', error)
    const twiml = generateMainMenu('en')
    return new NextResponse(twiml, {
      status: 200,
      headers: { 'Content-Type': 'text/xml' },
    })
  }
}
