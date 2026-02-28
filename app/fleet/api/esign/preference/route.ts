// app/fleet/api/esign/preference/route.ts
// Fleet control endpoint for changing a partner's agreement preference

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

const FLEET_KEY = 'phoenix-fleet-2847'

function validateApiKey(request: NextRequest): boolean {
  const key = request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

export async function PATCH(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { prospectId, preference } = await request.json()

    if (!prospectId) {
      return NextResponse.json({ error: 'prospectId is required' }, { status: 400 })
    }

    if (!preference || !['ITWHIP', 'OWN', 'BOTH'].includes(preference)) {
      return NextResponse.json({ error: 'Invalid preference. Must be ITWHIP, OWN, or BOTH.' }, { status: 400 })
    }

    // Verify prospect exists
    const prospect = await prisma.hostProspect.findUnique({
      where: { id: prospectId },
      select: { id: true, name: true, hostAgreementUrl: true }
    })

    if (!prospect) {
      return NextResponse.json({ error: 'Prospect not found' }, { status: 404 })
    }

    // OWN or BOTH require an uploaded agreement
    if ((preference === 'OWN' || preference === 'BOTH') && !prospect.hostAgreementUrl) {
      return NextResponse.json({
        error: `Cannot set preference to ${preference} — partner has not uploaded their agreement yet.`
      }, { status: 400 })
    }

    // Build update data (same logic as partner-facing API)
    const updateData: Record<string, unknown> = {
      agreementPreference: preference,
      lastActivityAt: new Date()
    }

    if (preference === 'ITWHIP') {
      updateData.itwhipAgreementAccepted = true
      updateData.agreementUploaded = true
    }

    if (preference === 'BOTH') {
      updateData.itwhipAgreementAccepted = true
    }

    await prisma.hostProspect.update({
      where: { id: prospectId },
      data: updateData
    })

    return NextResponse.json({
      success: true,
      prospectId,
      preference,
      partnerName: prospect.name
    })

  } catch (error) {
    console.error('[fleet/api/esign/preference] Error:', error)
    return NextResponse.json({
      error: error instanceof Error ? error.message : 'Failed to update preference'
    }, { status: 500 })
  }
}
