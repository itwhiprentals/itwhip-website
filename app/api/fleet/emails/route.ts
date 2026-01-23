// app/api/fleet/emails/route.ts
// Fleet dashboard email search and management

import { NextRequest, NextResponse } from 'next/server'
import { searchEmailLogs, getEmailByReference } from '@/app/lib/email/config'
import { EmailType, EmailStatus } from '@prisma/client'

// GET /api/fleet/emails - Search and list email logs
export async function GET(request: NextRequest) {
  try {
    // Verify fleet access
    const { searchParams } = new URL(request.url)
    const urlKey = searchParams.get('key')
    const headerKey = request.headers.get('x-fleet-key')
    const phoenixKey = 'phoenix-fleet-2847'

    if (urlKey !== phoenixKey && headerKey !== phoenixKey) {
      // Check for fleet session cookie
      const fleetSession = request.cookies.get('fleet_session')?.value
      if (!fleetSession) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Get query params
    const search = searchParams.get('search') || undefined
    const emailType = searchParams.get('type') as EmailType | undefined
    const status = searchParams.get('status') as EmailStatus | undefined
    const startDate = searchParams.get('startDate')
      ? new Date(searchParams.get('startDate')!)
      : undefined
    const endDate = searchParams.get('endDate')
      ? new Date(searchParams.get('endDate')!)
      : undefined
    const page = parseInt(searchParams.get('page') || '1')
    const limit = parseInt(searchParams.get('limit') || '20')

    // If searching by reference ID directly
    const referenceId = searchParams.get('ref')
    if (referenceId) {
      const email = await getEmailByReference(referenceId)
      if (!email) {
        return NextResponse.json({ error: 'Email not found' }, { status: 404 })
      }
      return NextResponse.json({ success: true, email })
    }

    // Search email logs
    const result = await searchEmailLogs({
      search,
      emailType,
      status,
      startDate,
      endDate,
      page,
      limit
    })

    return NextResponse.json({
      success: true,
      ...result
    })

  } catch (error) {
    console.error('[Fleet Emails] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch emails' },
      { status: 500 }
    )
  }
}
