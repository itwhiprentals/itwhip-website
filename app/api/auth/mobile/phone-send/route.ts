// app/api/auth/mobile/phone-send/route.ts
// Send OTP via Twilio Verify for mobile app phone login
// Bypasses Firebase reCAPTCHA which doesn't work in React Native

import { NextRequest, NextResponse } from 'next/server'
import twilio from 'twilio'

const accountSid = process.env.TWILIO_ACCOUNT_SID!
const authToken = process.env.TWILIO_AUTH_TOKEN!
const VERIFY_SERVICE_SID = process.env.TWILIO_VERIFY_SERVICE_SID!

export async function POST(request: NextRequest) {
  try {
    const { phone } = await request.json()

    if (!phone || !phone.match(/^\+\d{10,15}$/)) {
      return NextResponse.json(
        { error: 'Valid phone number in E.164 format required (e.g., +1XXXXXXXXXX)' },
        { status: 400 }
      )
    }

    console.log(`[Mobile Phone Send] Sending OTP to ${phone}`)

    const client = twilio(accountSid, authToken)
    const verification = await client.verify.v2
      .services(VERIFY_SERVICE_SID)
      .verifications.create({ to: phone, channel: 'sms' })

    console.log(`[Mobile Phone Send] Twilio Verify status: ${verification.status}`)

    return NextResponse.json({
      success: true,
      status: verification.status,
    })
  } catch (error: any) {
    console.error('[Mobile Phone Send] Error:', error.message)
    return NextResponse.json(
      { error: 'Failed to send verification code. Please try again.' },
      { status: 500 }
    )
  }
}
