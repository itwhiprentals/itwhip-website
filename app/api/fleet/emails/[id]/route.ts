// app/api/fleet/emails/[id]/route.ts
// GET /api/fleet/emails/[id] — single email detail with HTML body for fleet preview

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify fleet access
  const key = request.nextUrl.searchParams.get('key')
  const sessionCookie = request.cookies.get('fleet_session')?.value
  if (key !== 'phoenix-fleet-2847' && !sessionCookie) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { id } = await params

  const email = await prisma.emailLog.findUnique({ where: { id } })
  if (!email) {
    return NextResponse.json({ error: 'Email not found' }, { status: 404 })
  }

  return NextResponse.json({ success: true, email })
}
