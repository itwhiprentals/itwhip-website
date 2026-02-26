// app/api/partner/onboarding/agreement-preference/route.ts
// Save agreement preference (ITWHIP, OWN, or BOTH) for recruited host

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

// GET — Return current agreement preference + test e-sign count
export async function GET() {
  try {
    const host = await getCurrentHost()

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const prospect = host.convertedFromProspect
    if (!prospect) {
      return NextResponse.json(
        { error: 'No linked prospect found' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      preference: prospect.agreementPreference,
      testEsignCount: prospect.testEsignCount,
      hostAgreementUrl: prospect.hostAgreementUrl
    })
  } catch (error: any) {
    console.error('[Agreement Preference API] GET Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agreement preference' },
      { status: 500 }
    )
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

    if (!preference || !['ITWHIP', 'OWN', 'BOTH'].includes(preference)) {
      return NextResponse.json(
        { error: 'Invalid preference. Must be ITWHIP, OWN, or BOTH.' },
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

    // Build update data based on preference
    const updateData: any = {
      agreementPreference: preference,
      lastActivityAt: new Date()
    }

    // ITWHIP: accept ItWhip agreement + mark agreement as done (no upload needed)
    if (preference === 'ITWHIP') {
      updateData.itwhipAgreementAccepted = true
      updateData.agreementUploaded = true
    }

    // BOTH: accept ItWhip agreement (upload still needed separately for their own)
    if (preference === 'BOTH') {
      updateData.itwhipAgreementAccepted = true
    }

    // OWN: no automatic flags — host needs to upload their agreement separately

    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: updateData
    })

    // Log activity
    await logProspectActivity(prospect.id, 'AGREEMENT_PREFERENCE_SET', {
      hostId: host.id,
      preference
    })

    return NextResponse.json({ success: true })

  } catch (error: any) {
    console.error('[Agreement Preference API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to save agreement preference' },
      { status: 500 }
    )
  }
}
