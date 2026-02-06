// app/api/bookings/[id]/request-docs/route.ts
// Fleet API: Request additional documents from guest
// POST /api/bookings/[id]/request-docs

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { prisma } from '@/app/lib/database/prisma'
import { requestDocuments } from '@/app/lib/booking/services/fleet-approval'

// Valid document types that can be requested
const VALID_DOCUMENT_TYPES = [
  'LICENSE_FRONT',
  'LICENSE_BACK',
  'SELFIE',
  'INSURANCE',
  'PROOF_OF_ADDRESS',
  'CREDIT_CARD_AUTHORIZATION',
]

// Verify Fleet admin access
async function verifyFleetAccess(request: NextRequest): Promise<{ valid: boolean; adminId?: string; error?: string }> {
  const cookieStore = await cookies()
  const adminToken = cookieStore.get('admin_token')?.value

  if (!adminToken) {
    return { valid: false, error: 'Not authenticated' }
  }

  // Verify admin has fleet access
  const admin = await prisma.user.findFirst({
    where: {
      accessToken: adminToken,
      role: { in: ['admin', 'fleet_admin', 'super_admin'] },
    },
    select: { id: true, name: true, email: true },
  })

  if (!admin) {
    return { valid: false, error: 'Unauthorized - Fleet access required' }
  }

  return { valid: true, adminId: admin.id }
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: bookingId } = await params

    // Verify Fleet access
    const auth = await verifyFleetAccess(request)
    if (!auth.valid) {
      return NextResponse.json({ error: auth.error }, { status: 401 })
    }

    // Get request body
    const body = await request.json()
    const { documentsNeeded, message } = body

    // Validate documents requested
    if (!documentsNeeded || !Array.isArray(documentsNeeded) || documentsNeeded.length === 0) {
      return NextResponse.json(
        { error: 'At least one document type must be specified' },
        { status: 400 }
      )
    }

    // Validate document types
    const invalidTypes = documentsNeeded.filter((t: string) => !VALID_DOCUMENT_TYPES.includes(t))
    if (invalidTypes.length > 0) {
      return NextResponse.json(
        { error: `Invalid document types: ${invalidTypes.join(', ')}`, validTypes: VALID_DOCUMENT_TYPES },
        { status: 400 }
      )
    }

    // Request documents
    const result = await requestDocuments({
      bookingId,
      reviewedBy: auth.adminId!,
      documentsNeeded,
      message,
    })

    if (!result.success) {
      return NextResponse.json({ error: result.error }, { status: 400 })
    }

    return NextResponse.json({
      success: true,
      bookingId: result.bookingId,
      status: result.newStatus,
      documentsRequested: documentsNeeded,
      message: 'Document request sent to guest.',
    })
  } catch (error) {
    console.error('[API] Request docs error:', error)
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}
