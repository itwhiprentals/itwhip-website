// app/api/partner/settings/agreement/route.ts
// Manage host rental agreement preference and uploaded agreement

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { uploadPrivateDocument, deletePrivateDocument, generateKey, isS3Key } from '@/app/lib/storage/s3'
import { validateAgreementPdf } from '@/app/lib/agreements/validate-pdf'
import { extractAgreementSections } from '@/app/lib/agreements/extract-sections'

const JWT_SECRET = process.env.JWT_SECRET!

async function getCurrentHost(request?: NextRequest) {
  // Check Authorization header first (mobile app)
  const authHeader = request?.headers.get('authorization')
  let token: string | undefined
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  // Fall back to cookies (web)
  if (!token) {
    const cookieStore = await cookies()
    token = cookieStore.get('partner_token')?.value
      || cookieStore.get('hostAccessToken')?.value
      || cookieStore.get('accessToken')?.value
  }

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string }
    if (!decoded.hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: decoded.hostId }
    })
  } catch {
    return null
  }
}

// GET — Return current agreement preference + uploaded agreement info
export async function GET(request: NextRequest) {
  try {
    const host = await getCurrentHost(request)
    if (!host) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    return NextResponse.json({
      success: true,
      preference: host.agreementPreference || null,
      agreement: {
        url: host.hostAgreementUrl || null,
        fileName: host.hostAgreementName || null,
        validationScore: host.agreementValidationScore ?? null,
        validationSummary: host.agreementValidationSummary || null,
        sections: host.hostAgreementSections || null
      }
    })
  } catch (error) {
    console.error('[Settings Agreement GET] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch agreement' }, { status: 500 })
  }
}

// PUT — Update agreement preference
export async function PUT(request: NextRequest) {
  try {
    const host = await getCurrentHost(request)
    if (!host) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { preference } = await request.json()

    if (!preference || !['ITWHIP', 'OWN', 'BOTH'].includes(preference)) {
      return NextResponse.json(
        { error: 'Invalid preference. Must be ITWHIP, OWN, or BOTH.' },
        { status: 400 }
      )
    }

    await prisma.rentalHost.update({
      where: { id: host.id },
      data: { agreementPreference: preference }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Settings Agreement PUT] Error:', error)
    return NextResponse.json({ error: 'Failed to save preference' }, { status: 500 })
  }
}

// POST — Upload agreement PDF with AI validation
export async function POST(request: NextRequest) {
  try {
    const host = await getCurrentHost(request)
    if (!host) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 })
    }

    if (file.type !== 'application/pdf') {
      return NextResponse.json({ error: 'Only PDF files are accepted' }, { status: 400 })
    }

    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    console.log(`[Settings Agreement Upload] Uploading ${file.name} for host ${host.id}`)

    // Convert file to buffer for S3
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Upload to S3
    const key = generateKey('agreement', host.id)
    const pdfUrl = await uploadPrivateDocument(key, buffer, 'application/pdf')
    console.log(`[Settings Agreement Upload] Uploaded to S3: ${pdfUrl}`)

    // AI validation with rule-based fallback
    const validationResult = await validateAgreementPdf(pdfUrl, file.name, buffer)
    const validation = validationResult.validation

    const validationMethod = validationResult.aiValidated
      ? 'AI'
      : validationResult.rulesVersion
        ? `Rule-based v${validationResult.rulesVersion}`
        : 'Fallback'
    console.log(`[Settings Agreement Upload] Validation (${validationMethod}): score=${validation.score}, isValid=${validation.isValid}`)

    // Reject if invalid
    const shouldReject = !validation.isValid ||
      validation.score < 40 ||
      validation.documentType === 'not_agreement'

    if (shouldReject) {
      try {
        await deletePrivateDocument(key)
      } catch { /* ignore */ }

      return NextResponse.json({
        success: false,
        error: 'Agreement validation failed',
        validation
      }, { status: 400 })
    }

    // Extract sections for preview
    let sections = null
    try {
      sections = await extractAgreementSections(pdfUrl)
      console.log(`[Settings Agreement Upload] Extracted ${sections?.length || 0} sections`)
    } catch (extractError) {
      console.error('[Settings Agreement Upload] Section extraction failed (non-blocking):', extractError)
    }

    // Delete old agreement from S3 if exists
    if (host.hostAgreementUrl && isS3Key(host.hostAgreementUrl)) {
      try {
        await deletePrivateDocument(host.hostAgreementUrl)
      } catch { /* ignore */ }
    }

    // Save to RentalHost
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        hostAgreementUrl: pdfUrl,
        hostAgreementName: file.name,
        agreementValidationScore: validation.score,
        agreementValidationSummary: validation.summary,
        hostAgreementSections: sections && sections.length > 0 ? sections : undefined
      }
    })

    return NextResponse.json({
      success: true,
      agreement: {
        url: pdfUrl,
        fileName: file.name,
        validationScore: validation.score,
        validationSummary: validation.summary,
        sections
      },
      validation,
      message: validation.score >= 80
        ? 'Agreement uploaded and validated successfully!'
        : 'Agreement uploaded. Please review the suggestions below.'
    })
  } catch (error) {
    console.error('[Settings Agreement Upload] Error:', error)
    return NextResponse.json({ error: 'Failed to upload agreement' }, { status: 500 })
  }
}

// DELETE — Remove uploaded agreement
export async function DELETE() {
  try {
    const host = await getCurrentHost(request)
    if (!host) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    if (host.hostAgreementUrl && isS3Key(host.hostAgreementUrl)) {
      try {
        await deletePrivateDocument(host.hostAgreementUrl)
      } catch { /* ignore */ }
    }

    await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        hostAgreementUrl: null,
        hostAgreementName: null,
        agreementValidationScore: null,
        agreementValidationSummary: null,
        hostAgreementSections: null
      }
    })

    return NextResponse.json({ success: true, message: 'Agreement removed' })
  } catch (error) {
    console.error('[Settings Agreement DELETE] Error:', error)
    return NextResponse.json({ error: 'Failed to delete agreement' }, { status: 500 })
  }
}
