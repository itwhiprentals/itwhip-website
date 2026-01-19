// app/api/fleet/partners/[id]/documents/[docId]/verify/route.ts
// POST /api/fleet/partners/[id]/documents/[docId]/verify - Verify or reject a partner document

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; docId: string }> }
) {
  try {
    const { id, docId } = await params
    const body = await request.json()
    const { status, notes, verifiedBy } = body

    // Validate status
    if (!['VERIFIED', 'REJECTED'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be VERIFIED or REJECTED' },
        { status: 400 }
      )
    }

    // Check if document exists and belongs to this partner
    const document = await prisma.partner_documents.findFirst({
      where: {
        id: docId,
        hostId: id
      }
    })

    if (!document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      )
    }

    // Update document status
    const updatedDocument = await prisma.partner_documents.update({
      where: { id: docId },
      data: {
        status,
        reviewedAt: new Date(),
        reviewedBy: verifiedBy || 'Fleet Admin',
        rejectNote: status === 'REJECTED' ? (notes || null) : null
      }
    })

    // Create audit log
    await prisma.auditLog.create({
      data: {
        category: 'PARTNER_MANAGEMENT',
        eventType: 'document_verified',
        severity: 'INFO',
        adminEmail: verifiedBy || 'fleet-admin',
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: status === 'VERIFIED' ? 'approve' : 'reject',
        resource: 'partner_document',
        resourceId: docId,
        details: {
          partnerId: id,
          documentType: document.type,
          status,
          notes
        },
        hash: '',
        verified: false
      }
    })

    return NextResponse.json({
      success: true,
      message: `Document ${status.toLowerCase()} successfully`,
      document: updatedDocument
    })

  } catch (error: any) {
    console.error('[Partner Document Verify] Error:', error)
    return NextResponse.json(
      { error: 'Failed to verify document' },
      { status: 500 }
    )
  }
}
