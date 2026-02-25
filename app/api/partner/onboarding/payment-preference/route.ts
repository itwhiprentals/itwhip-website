// app/api/partner/onboarding/payment-preference/route.ts
// Save payment preference (CASH or PLATFORM) for recruited host

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { logProspectActivity } from '@/app/lib/auth/host-tokens'

const JWT_SECRET = process.env.JWT_SECRET!

async function getCurrentHost() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value
    || cookieStore.get('hostAccessToken')?.value
    || cookieStore.get('accessToken')?.value

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string }
    const hostId = decoded.hostId
    if (!hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: { convertedFromProspect: true }
    })
  } catch {
    return null
  }
}

export async function POST(request: NextRequest) {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { preference } = await request.json()

    if (!preference || !['CASH', 'PLATFORM'].includes(preference)) {
      return NextResponse.json(
        { error: 'Invalid preference. Must be CASH or PLATFORM.' },
        { status: 400 }
      )
    }

    const prospect = host.convertedFromProspect
    if (!prospect) {
      return NextResponse.json(
        { error: 'No linked prospect found' },
        { status: 404 }
      )
    }

    // Save payment preference
    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        paymentPreference: preference,
        lastActivityAt: new Date()
      }
    })

    // Log activity
    await logProspectActivity(prospect.id, 'PAYMENT_PREFERENCE_SET', {
      hostId: host.id,
      preference
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[Payment Preference API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save payment preference' },
      { status: 500 }
    )
  }
}
