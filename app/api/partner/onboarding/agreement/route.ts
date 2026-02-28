// app/api/partner/onboarding/agreement/route.ts
// Upload and validate host rental agreement PDF

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { cookies } from 'next/headers'
import { verify } from 'jsonwebtoken'
import { v2 as cloudinary } from 'cloudinary'
import { validateAgreementPdf } from '@/app/lib/agreements/validate-pdf'
import { extractAgreementSections } from '@/app/lib/agreements/extract-sections'

const JWT_SECRET = process.env.JWT_SECRET!

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

// Helper to get current host from auth
async function getCurrentHost(request?: NextRequest) {
  // Check Authorization header first (mobile app), then fall back to cookies
  let token: string | undefined
  const authHeader = request?.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  if (!token) {
    const cookieStore = await cookies()
    token = cookieStore.get('partner_token')?.value
      || cookieStore.get('hostAccessToken')?.value
      || cookieStore.get('accessToken')?.value
  }

  if (!token) return null

  try {
    const decoded = verify(token, JWT_SECRET) as { hostId?: string; userId?: string }
    const hostId = decoded.hostId

    if (!hostId) return null

    return await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: {
        convertedFromProspect: {
          include: {
            request: true
          }
        }
      }
    })
  } catch {
    return null
  }
}

// GET - Get current agreement status
export async function GET(request: NextRequest) {
  try {
    const host = await getCurrentHost(request)

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!host.recruitedVia) {
      return NextResponse.json(
        { error: 'Not a recruited host' },
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

    return NextResponse.json({
      success: true,
      agreement: {
        uploaded: prospect.agreementUploaded,
        url: prospect.hostAgreementUrl,
        fileName: prospect.hostAgreementName,
        validationScore: prospect.agreementValidationScore,
        validationSummary: prospect.agreementValidationSummary,
        sections: prospect.hostAgreementSections || null
      }
    })
  } catch (error) {
    console.error('[Agreement GET] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch agreement status' },
      { status: 500 }
    )
  }
}

// POST - Upload new agreement
export async function POST(request: NextRequest) {
  try {
    const host = await getCurrentHost(request)

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    if (!host.recruitedVia) {
      return NextResponse.json(
        { error: 'Not a recruited host' },
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

    // Get form data with PDF file
    const formData = await request.formData()
    const file = formData.get('file') as File | null

    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      )
    }

    // Validate file type
    if (file.type !== 'application/pdf') {
      return NextResponse.json(
        { error: 'Only PDF files are accepted' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    console.log(`[Agreement Upload] Uploading ${file.name} for host ${host.id}`)

    // Convert file to base64 for Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: 'itwhip/agreements',
      resource_type: 'raw',
      public_id: `agreement_${host.id}_${Date.now()}`,
      format: 'pdf'
    })

    const pdfUrl = uploadResult.secure_url
    console.log(`[Agreement Upload] Uploaded to: ${pdfUrl}`)

    // Validate the PDF using AI (with rule-based fallback)
    // Pass the buffer so rule-based validation can work if AI fails
    const validationResult = await validateAgreementPdf(pdfUrl, file.name, buffer)
    const validation = validationResult.validation

    // Log validation method and result
    const validationMethod = validationResult.aiValidated
      ? 'AI'
      : validationResult.rulesVersion
        ? `Rule-based v${validationResult.rulesVersion}`
        : 'Fallback'
    console.log(`[Agreement Upload] Validation (${validationMethod}): score=${validation.score}, isValid=${validation.isValid}, type=${validation.documentType}`)

    // Reject if: not valid, low score, or explicitly not a rental agreement
    const shouldReject = !validation.isValid ||
      validation.score < 40 ||
      validation.documentType === 'not_agreement'

    if (shouldReject) {
      // Delete from Cloudinary since we're rejecting
      try {
        await cloudinary.uploader.destroy(uploadResult.public_id, { resource_type: 'raw' })
      } catch {
        // Ignore deletion errors
      }

      return NextResponse.json({
        success: false,
        error: 'Agreement validation failed',
        validation
      }, { status: 400 })
    }

    // Extract structured sections from the PDF for accordion preview
    let sections = null
    try {
      sections = await extractAgreementSections(pdfUrl)
      console.log(`[Agreement Upload] Extracted ${sections?.length || 0} sections`)
    } catch (extractError) {
      console.error('[Agreement Upload] Section extraction failed (non-blocking):', extractError)
    }

    // Update prospect with agreement info + extracted sections
    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        hostAgreementUrl: pdfUrl,
        hostAgreementName: file.name,
        agreementUploaded: true,
        agreementValidationScore: validation.score,
        agreementValidationSummary: validation.summary,
        hostAgreementSections: sections && sections.length > 0 ? sections : undefined,
        lastActivityAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      agreement: {
        url: pdfUrl,
        fileName: file.name,
        validation,
        validationMethod: validationResult.aiValidated ? 'ai' : 'rules',
        rulesVersion: validationResult.rulesVersion,
        sections
      },
      message: validation.score >= 80
        ? 'Agreement uploaded and validated successfully!'
        : 'Agreement uploaded. Please review the suggestions below.'
    })

  } catch (error: unknown) {
    console.error('[Agreement Upload] Error:', error)
    return NextResponse.json(
      { error: 'Failed to upload agreement' },
      { status: 500 }
    )
  }
}

// DELETE - Remove agreement
export async function DELETE(request: NextRequest) {
  try {
    const host = await getCurrentHost(request)

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

    // Remove from Cloudinary if exists
    if (prospect.hostAgreementUrl) {
      try {
        // Extract public_id from URL
        const urlParts = prospect.hostAgreementUrl.split('/')
        const fileName = urlParts[urlParts.length - 1]
        const publicId = `itwhip/agreements/${fileName.replace('.pdf', '')}`
        await cloudinary.uploader.destroy(publicId, { resource_type: 'raw' })
      } catch {
        // Ignore deletion errors
      }
    }

    // Update prospect
    await prisma.hostProspect.update({
      where: { id: prospect.id },
      data: {
        hostAgreementUrl: null,
        hostAgreementName: null,
        agreementUploaded: false,
        agreementValidationScore: null,
        agreementValidationSummary: null,
        hostAgreementSections: null,
        lastActivityAt: new Date()
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Agreement removed'
    })

  } catch (error) {
    console.error('[Agreement DELETE] Error:', error)
    return NextResponse.json(
      { error: 'Failed to delete agreement' },
      { status: 500 }
    )
  }
}
