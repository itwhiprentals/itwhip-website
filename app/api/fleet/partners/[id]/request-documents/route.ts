// app/api/fleet/partners/[id]/request-documents/route.ts
// POST /api/fleet/partners/[id]/request-documents - Request specific documents from a partner

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { sendEmail } from '@/app/lib/email/sender'
import { getPartnerDocumentRequestTemplate } from '@/app/lib/email/templates/partner-document-request'

// Document type mapping for display names
const DOCUMENT_TYPE_NAMES: Record<string, string> = {
  'BUSINESS_LICENSE': 'Business License',
  'INSURANCE_CERTIFICATE': 'Insurance Certificate',
  'COMMERCIAL_AUTO_POLICY': 'Commercial Auto Policy',
  'BACKGROUND_CHECK': 'Background Check',
  'W9_FORM': 'W-9 Form',
  'ARTICLES_OF_INCORPORATION': 'Articles of Incorporation'
}

// Default instructions for each document type
const DOCUMENT_INSTRUCTIONS: Record<string, string> = {
  'BUSINESS_LICENSE': 'Please upload a valid business license or permit for your company',
  'INSURANCE_CERTIFICATE': 'Please upload your general liability insurance certificate',
  'COMMERCIAL_AUTO_POLICY': 'Please upload your commercial auto insurance policy covering fleet vehicles',
  'BACKGROUND_CHECK': 'Please upload your background check clearance document',
  'W9_FORM': 'Please upload a completed IRS W-9 form for tax reporting',
  'ARTICLES_OF_INCORPORATION': 'Please upload your articles of incorporation or business formation documents'
}

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Verify fleet access
    const key = request.nextUrl.searchParams.get('key')
    if (key !== 'phoenix-fleet-2847' && !request.headers.get('authorization')) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { id: partnerId } = await params
    const body = await request.json()
    const { documentTypes, message, deadline } = body

    // Validate required fields
    if (!documentTypes || !Array.isArray(documentTypes) || documentTypes.length === 0) {
      return NextResponse.json(
        { error: 'At least one document type must be specified' },
        { status: 400 }
      )
    }

    // Validate document types
    const validDocumentTypes = Object.keys(DOCUMENT_TYPE_NAMES)
    const invalidDocs = documentTypes.filter((type: string) => !validDocumentTypes.includes(type))
    if (invalidDocs.length > 0) {
      return NextResponse.json(
        { error: `Invalid document types: ${invalidDocs.join(', ')}` },
        { status: 400 }
      )
    }

    // Get partner details
    const partner = await prisma.rentalHost.findUnique({
      where: { id: partnerId },
      select: {
        id: true,
        name: true,
        email: true,
        partnerCompanyName: true,
        hostType: true,
        approvalStatus: true
      }
    })

    if (!partner) {
      return NextResponse.json(
        { error: 'Partner not found' },
        { status: 404 }
      )
    }

    // Ensure this is a partner account (FLEET_PARTNER or PARTNER)
    if (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER') {
      return NextResponse.json(
        { error: 'This account is not a partner account' },
        { status: 400 }
      )
    }

    // Calculate deadline (default 7 days)
    const deadlineDate = deadline
      ? new Date(deadline)
      : new Date(Date.now() + (7 * 24 * 60 * 60 * 1000))

    const deadlineDays = Math.ceil((deadlineDate.getTime() - Date.now()) / (1000 * 60 * 60 * 24))

    // Format document issues for email
    const documentIssues = documentTypes.map((type: string) => ({
      documentType: type,
      displayName: DOCUMENT_TYPE_NAMES[type] || type,
      issue: 'This document is required for your partner account',
      instructions: DOCUMENT_INSTRUCTIONS[type] || 'Please upload a clear, readable copy of this document'
    }))

    // Create activity log entry
    await prisma.activityLog.create({
      data: {
        id: crypto.randomUUID(),
        entityType: 'HOST',
        entityId: partnerId,
        hostId: partnerId,
        action: 'PARTNER_DOCUMENTS_REQUESTED',
        metadata: {
          partnerId,
          partnerName: partner.partnerCompanyName || partner.name,
          documentsRequested: documentTypes,
          deadline: deadlineDate.toISOString(),
          message: message || null,
          requestedBy: 'FLEET_ADMIN'
        }
      }
    })

    // Send email notification
    let emailSent = false
    if (partner.email) {
      try {
        const template = getPartnerDocumentRequestTemplate({
          partnerName: partner.name || 'Partner',
          companyName: partner.partnerCompanyName || undefined,
          documentIssues,
          uploadUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://itwhip.com'}/partner/dashboard`,
          deadline: `${deadlineDays} days`,
          requestedBy: 'Fleet Admin',
          supportEmail: process.env.SUPPORT_EMAIL || 'partners@itwhip.com'
        })
        const result = await sendEmail(partner.email, template.subject, template.html, template.text)
        emailSent = result.success
        if (!result.success) {
          console.error('Failed to send partner document request email:', result.error)
        }
      } catch (emailError) {
        console.error('Error sending partner document request email:', emailError)
      }
    }

    return NextResponse.json({
      success: true,
      message: `Document request sent to ${partner.partnerCompanyName || partner.name}`,
      data: {
        partnerId,
        partnerName: partner.partnerCompanyName || partner.name,
        partnerEmail: partner.email,
        documentsRequested: documentTypes.map((type: string) => ({
          type,
          displayName: DOCUMENT_TYPE_NAMES[type]
        })),
        deadline: deadlineDate.toISOString(),
        emailSent
      }
    })

  } catch (error: any) {
    console.error('Request partner documents error:', error)
    return NextResponse.json(
      { error: 'Failed to request documents', details: error?.message },
      { status: 500 }
    )
  }
}
