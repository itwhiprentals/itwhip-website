// app/api/webhooks/twilio/voice/menu/route.ts
// DTMF handler — routes key presses from all IVR menus
// All menu navigation via ?menu=&lang=&tries= query params

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyTwilioWebhook, parseTwilioBody } from '@/app/lib/twilio/verify-signature'
import { lookupBookingByCode } from '@/app/lib/twilio/caller-lookup'
import {
  generateVisitorMenu,
  generateAboutItWhip,
  generateCustomerMenu,
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
  generateInvalidInput,
  generateSmsSent,
} from '@/app/lib/twilio/twiml'

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

    // Must include query params — Twilio signs against the full URL
    const reqUrl = new URL(request.url)
    const fullPath = reqUrl.pathname + reqUrl.search
    if (!verifyTwilioWebhook(fullPath, params, signature)) {
      console.error('[IVR Menu] Invalid Twilio signature')
      return new NextResponse('Forbidden', { status: 403 })
    }

    const { Digits: digits, CallSid: callSid, From: callerPhone } = params
    const url = new URL(request.url)
    const lang = (url.searchParams.get('lang') || 'en') as 'en' | 'es' | 'fr'
    const menu = url.searchParams.get('menu') || 'visitor'
    const tries = parseInt(url.searchParams.get('tries') || '0', 10)

    // Update call log with menu path
    if (callSid) {
      prisma.callLog.updateMany({
        where: { callSid },
        data: {
          menuPath: `${menu}>${digits || 'none'}`,
          language: lang,
        },
      }).catch(() => {})
    }

    let twiml: string

    switch (menu) {
      // ─── Visitor Main Menu ──────────────────────────────
      case 'visitor':
        switch (digits) {
          case '1': // Learn about ItWhip
            twiml = generateAboutItWhip(lang)
            break
          case '2': // I have a booking code
            twiml = generateBookingCodeEntry(lang)
            break
          case '3': // Speak with someone
            twiml = generateSpeakWithSomeone(lang)
            break
          default:
            twiml = generateVisitorMenu(lang, tries)
        }
        break

      // ─── About ItWhip Actions ───────────────────────────
      case 'about-action':
        switch (digits) {
          case '1': // Send text with links
            if (callerPhone) {
              import('@/app/lib/twilio/sms-triggers').then(({ sendIvrAboutSms }) => {
                sendIvrAboutSms(callerPhone, lang).catch(e => console.error('[IVR SMS]', e))
              }).catch(() => {})
            }
            twiml = generateSmsSent(lang, 'visitor')
            break
          case '2': // Speak with someone
            twiml = generateSpeakWithSomeone(lang)
            break
          case '3': // Hear again
            twiml = generateAboutItWhip(lang)
            break
          default:
            twiml = generateVisitorMenu(lang)
        }
        break

      // ─── Customer Main Menu ─────────────────────────────
      case 'customer':
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
            twiml = generateCustomerMenu(lang, tries)
        }
        break

      // ─── Active Trip Menu ───────────────────────────────
      case 'active-trip':
        switch (digits) {
          case '1': // Emergency
            twiml = generateEmergencyMenu(lang)
            break
          case '2': // Standard customer menu
            twiml = generateCustomerMenu(lang)
            break
          default:
            twiml = generateInvalidInput(lang, 'customer')
        }
        break

      // ─── Emergency Menu ─────────────────────────────────
      case 'emergency':
        switch (digits) {
          case '1': // Roadside assistance
            twiml = generateRoadsideInfo(lang)
            break
          case '2': // Speak with someone immediately
            twiml = generateSpeakWithSomeone(lang)
            break
          default:
            twiml = generateEmergencyMenu(lang, tries)
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

              twiml = generatePickupDetails({ address, date, time, bookingCode }, lang)
            } else {
              twiml = generateBookingNotFound(lang)
            }
            break
          }
          case '3': // Back to main menu
            twiml = generateCustomerMenu(lang)
            break
          default:
            twiml = generateInvalidInput(lang, 'customer')
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
          case '3': // Check claim status
            twiml = generateReportDamage(lang)
            break
          case '4': // Back to main
            twiml = generateCustomerMenu(lang)
            break
          default:
            twiml = generateInsuranceMenu(lang, tries)
        }
        break

      // ─── Insurance Info Actions ────────────────────────────
      case 'insurance-info-action':
        switch (digits) {
          case '1': // Send text with insurance info
            if (callerPhone) {
              import('@/app/lib/twilio/sms-triggers').then(({ sendIvrInsuranceSms }) => {
                sendIvrInsuranceSms(callerPhone, lang).catch(e => console.error('[IVR SMS]', e))
              }).catch(() => {})
            }
            twiml = generateSmsSent(lang, 'customer')
            break
          default:
            twiml = generateCustomerMenu(lang)
        }
        break

      // ─── Report Damage Actions ─────────────────────────────
      case 'damage-action':
        switch (digits) {
          case '1': // Send text with damage reporting link
            if (callerPhone) {
              import('@/app/lib/twilio/sms-triggers').then(({ sendIvrReportDamageSms }) => {
                sendIvrReportDamageSms(callerPhone, lang).catch(e => console.error('[IVR SMS]', e))
              }).catch(() => {})
            }
            twiml = generateSmsSent(lang, 'customer')
            break
          case '2': // Leave voicemail
            twiml = generateVoicemailPrompt(lang)
            break
          default:
            twiml = generateCustomerMenu(lang)
        }
        break

      // ─── Roadside Info Actions ─────────────────────────────
      case 'roadside-action':
        switch (digits) {
          case '1': // Send text with roadside guide
            if (callerPhone) {
              import('@/app/lib/twilio/sms-triggers').then(({ sendIvrRoadsideSms }) => {
                sendIvrRoadsideSms(callerPhone, lang).catch(e => console.error('[IVR SMS]', e))
              }).catch(() => {})
            }
            twiml = generateSmsSent(lang, 'customer')
            break
          case '2': // Leave voicemail
            twiml = generateVoicemailPrompt(lang)
            break
          default:
            twiml = generateCustomerMenu(lang)
        }
        break

      // ─── Pickup Details Actions ────────────────────────────
      case 'pickup-action': {
        const pickupCode = url.searchParams.get('code') || ''
        switch (digits) {
          case '1': { // Send text with pickup details
            if (callerPhone && pickupCode) {
              const bk = await lookupBookingByCode(pickupCode)
              if (bk) {
                const address = bk.deliveryAddress || bk.pickupLocation || bk.car?.address
                  ? `${bk.deliveryAddress || bk.pickupLocation || bk.car?.address || ''}, ${bk.car?.city || 'Phoenix'}`
                  : 'your pickup location'
                const date = new Date(bk.startDate).toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })
                const time = bk.startTime || '10:00 AM'
                import('@/app/lib/twilio/sms-triggers').then(({ sendIvrPickupDetailsSms }) => {
                  sendIvrPickupDetailsSms(callerPhone, { address, date, time, bookingCode: pickupCode }, lang).catch(e => console.error('[IVR SMS]', e))
                }).catch(() => {})
              }
            }
            twiml = generateSmsSent(lang, 'customer')
            break
          }
          default:
            twiml = generateCustomerMenu(lang)
        }
        break
      }

      // ─── Booking Not Found Actions ──────────────────────
      case 'booking-not-found':
        switch (digits) {
          case '1': // Try again
            twiml = generateBookingCodeEntry(lang)
            break
          case '2': // Main menu
            twiml = generateVisitorMenu(lang)
            break
          default:
            twiml = generateVisitorMenu(lang)
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
          twiml = generateVisitorMenu(lang)
        }
        break
      }

      default:
        twiml = generateVisitorMenu(lang)
    }

    return xml(twiml)
  } catch (error) {
    console.error('[IVR Menu] Error:', error)
    return xml(generateVisitorMenu('en'))
  }
}
