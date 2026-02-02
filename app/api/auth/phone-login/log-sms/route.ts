// Log SMS attempts for monitoring
import { NextRequest, NextResponse } from 'next/server'
import { nanoid } from 'nanoid'
import { prisma } from '@/app/lib/database/prisma'
import { getClientIp } from '@/app/lib/rate-limit'
import { getLocationFromIp } from '@/app/lib/security/geolocation'

export async function POST(request: NextRequest) {
  try {
    const { phone, success, error } = await request.json()
    const clientIp = getClientIp(request)
    const location = await getLocationFromIp(clientIp, request.headers)

    await prisma.securityEvent.create({
      data: {
        id: nanoid(),
        type: success ? 'SMS_SENT' : 'SMS_FAILED',
        severity: success ? 'LOW' : 'MEDIUM',
        sourceIp: clientIp,
        targetId: phone,
        message: success ? 'SMS verification code sent' : 'SMS sending failed',
        details: JSON.stringify({
          method: 'phone',
          phone: phone,
          reason: error || 'SUCCESS',
          source: 'guest_portal'
        }),
        action: success ? 'sms_sent' : 'sms_failed',
        blocked: false,
        userAgent: request.headers.get('user-agent') || '',
        country: location.country,
        city: location.city,
        timestamp: new Date()
      }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[SMS Log] Error:', error)
    return NextResponse.json({ error: 'Failed to log' }, { status: 500 })
  }
}
