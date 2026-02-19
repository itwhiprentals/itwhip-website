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
  generateGoodbye,
  generateClaimStatusEntry,
  generateClaimFound,
  generateClaimNotFound,
} from '@/app/lib/twilio/twiml'

type Lang = 'en' | 'es' | 'fr'

// Human-readable claim status for IVR
const CLAIM_STATUS_LABELS: Record<Lang, Record<string, string>> = {
  en: {
    PENDING: 'pending review',
    UNDER_REVIEW: 'under review',
    APPROVED: 'approved',
    DENIED: 'denied',
    PAID: 'paid',
    DISPUTED: 'disputed',
    RESOLVED: 'resolved',
    GUEST_RESPONSE_PENDING: 'waiting for guest response',
    GUEST_NO_RESPONSE: 'awaiting guest response',
    VEHICLE_REPAIR_PENDING: 'pending vehicle repair',
    INSURANCE_PROCESSING: 'being processed by insurance',
    CLOSED: 'closed',
    GUEST_RESPONDED: 'guest has responded',
  },
  es: {
    PENDING: 'pendiente de revision',
    UNDER_REVIEW: 'en revision',
    APPROVED: 'aprobado',
    DENIED: 'denegado',
    PAID: 'pagado',
    DISPUTED: 'en disputa',
    RESOLVED: 'resuelto',
    GUEST_RESPONSE_PENDING: 'esperando respuesta del huesped',
    GUEST_NO_RESPONSE: 'esperando respuesta del huesped',
    VEHICLE_REPAIR_PENDING: 'pendiente de reparacion del vehiculo',
    INSURANCE_PROCESSING: 'en proceso por el seguro',
    CLOSED: 'cerrado',
    GUEST_RESPONDED: 'el huesped ha respondido',
  },
  fr: {
    PENDING: 'en attente d\'examen',
    UNDER_REVIEW: 'en cours d\'examen',
    APPROVED: 'approuvée',
    DENIED: 'refusée',
    PAID: 'payée',
    DISPUTED: 'contestée',
    RESOLVED: 'résolue',
    GUEST_RESPONSE_PENDING: 'en attente de réponse du locataire',
    GUEST_NO_RESPONSE: 'en attente de réponse du locataire',
    VEHICLE_REPAIR_PENDING: 'en attente de réparation du véhicule',
    INSURANCE_PROCESSING: 'en cours de traitement par l\'assurance',
    CLOSED: 'clôturée',
    GUEST_RESPONDED: 'le locataire a répondu',
  },
}

function claimStatusLabel(status: string, lang: Lang): string {
  return CLAIM_STATUS_LABELS[lang]?.[status] || CLAIM_STATUS_LABELS.en[status] || status.toLowerCase().replace(/_/g, ' ')
}

function xml(twiml: string): NextResponse {
  return new NextResponse(twiml, {
    status: 200,
    headers: { 'Content-Type': 'text/xml' },
  })
}

/**
 * Fire an outbound call to join someone into a conference room.
 * Non-blocking — uses dynamic import + fire-and-forget.
 */
function connectViaConference(phone: string, roomName: string, callerCallSid: string, lang: Lang) {
  import('@/app/lib/twilio/conference').then(({ dialIntoConference }) => {
    dialIntoConference(phone, roomName, callerCallSid, lang).catch(e =>
      console.error('[IVR Conference] Dial failed:', e)
    )
  }).catch(() => {})
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
    const lang = (url.searchParams.get('lang') || 'en') as Lang
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

    // Helper: generate unique conference room name
    const makeRoom = () => `call-${callSid || 'unknown'}-${Date.now()}`

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
          case '3': // Speak with someone → Flex
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
          case '2': // Speak with someone → Flex
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
          case '3': // Speak with someone → Flex
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
          case '2': // Speak with someone immediately → Flex
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
              const room = makeRoom()
              connectViaConference(bk.host.phone, room, callSid, lang)
              twiml = generateConnectToHost(room, lang)
            } else {
              // No host phone — connect to support via Flex
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
            twiml = generateClaimStatusEntry(lang)
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

      // ─── Claim Status — Code Entry ────────────────────────
      case 'claim-code': {
        if (digits === '*') {
          twiml = generateInsuranceMenu(lang)
          break
        }

        if (digits && digits.length >= 4) {
          const booking = await lookupBookingByCode(digits)
          if (booking && booking.claims && booking.claims.length > 0) {
            // Use the most recent claim
            const claim = booking.claims[0]
            const statusLabel = claimStatusLabel(claim.status, lang)
            twiml = generateClaimFound(booking.bookingCode, statusLabel, lang)
          } else if (booking) {
            // Booking exists but no claims
            twiml = generateClaimNotFound(lang)
          } else {
            twiml = generateClaimNotFound(lang)
          }
        } else {
          twiml = generateClaimNotFound(lang)
        }
        break
      }

      // ─── Claim Found Actions ──────────────────────────────
      case 'claim-found': {
        switch (digits) {
          case '1': // Speak with someone about the claim → Flex
            twiml = generateSpeakWithSomeone(lang)
            break
          default:
            twiml = generateCustomerMenu(lang)
        }
        break
      }

      // ─── Claim Not Found Actions ──────────────────────────
      case 'claim-not-found':
        switch (digits) {
          case '1': // Try again
            twiml = generateClaimStatusEntry(lang)
            break
          default:
            twiml = generateCustomerMenu(lang)
        }
        break

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

      // ─── Voicemail Prompt / Queue+Conference Callback ────
      case 'voicemail-prompt': {
        // Called from Enqueue action (Flex) or Conference/Dial action (host calls)
        const dialStatus = params.DialCallStatus
        const queueResult = params.QueueResult
        if (dialStatus === 'completed' || queueResult === 'bridged') {
          // Call connected and ended normally → goodbye
          twiml = generateGoodbye(lang)
        } else {
          // No answer, busy, failed, queue timeout → voicemail
          twiml = generateVoicemailPrompt(lang)
        }
        break
      }

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
