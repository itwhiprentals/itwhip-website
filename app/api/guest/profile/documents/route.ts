// app/api/guest/profile/documents/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { uploadPrivateDocument, generateKey } from '@/app/lib/storage/s3'

// ========== 🆕 ACTIVITY TRACKING IMPORT ==========
import { trackActivity } from '@/lib/helpers/guestProfileStatus'

// POST: Upload identity documents
export async function POST(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = user.email
    const userId = user.id

    // Find profile
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      }
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    // Get form data
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // governmentId, driversLicense, selfie
    const idType = formData.get('idType') as string | null // passport, state_id, national_id

    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      )
    }

    if (!type || !['governmentId', 'driversLicense', 'selfie', 'additionalDocument'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document type' },
        { status: 400 }
      )
    }

    // Validate file type
    if (!file.type.startsWith('image/')) {
      return NextResponse.json(
        { success: false, error: 'File must be an image (JPG, PNG)' },
        { status: 400 }
      )
    }

    // Validate file size (max 10MB for documents)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { success: false, error: 'File must be less than 10MB' },
        { status: 400 }
      )
    }

    // Convert file to buffer
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)

    // Determine S3 key type based on document type
    const keyTypeMap: Record<string, 'dl' | 'identity'> = {
      governmentId: 'identity',
      driversLicense: 'dl',
      selfie: 'identity',
      additionalDocument: 'identity'
    }

    const keyType = keyTypeMap[type as keyof typeof keyTypeMap]
    const key = generateKey(keyType, profile.id, type)

    // Upload to S3 (private)
    const documentUrl = await uploadPrivateDocument(key, buffer, file.type)

    // Update profile based on document type
    const updateData: any = {}

    if (type === 'governmentId') {
      updateData.governmentIdUrl = documentUrl
      if (idType) {
        updateData.governmentIdType = idType.toUpperCase()
      }
    } else if (type === 'driversLicense') {
      updateData.driversLicenseUrl = documentUrl
    } else if (type === 'selfie') {
      updateData.selfieUrl = documentUrl
    } else if (type === 'additionalDocument') {
      updateData.additionalDocumentUrl = documentUrl
      const additionalType = formData.get('additionalType') as string
      if (additionalType) {
        updateData.additionalDocumentType = additionalType
      }
    }

    // Update profile
    await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: updateData
    })

    // Check if all required documents are uploaded
    const updatedProfile = await prisma.reviewerProfile.findUnique({
      where: { id: profile.id }
    })

    const allDocsUploaded = !!(
      updatedProfile?.governmentIdUrl &&
      updatedProfile?.driversLicenseUrl &&
      updatedProfile?.selfieUrl
    )

    // ========== 🆕 TRACK DOCUMENT UPLOAD ACTIVITY ==========
    try {
      // Create human-readable document name
      const documentNames: Record<string, string> = {
        governmentId: idType ? `${idType.replace('_', ' ')} ID` : 'Government ID',
        driversLicense: "Driver's License",
        selfie: 'Verification Selfie',
        additionalDocument: 'Additional Document'
      }

      const documentName = documentNames[type] || type

      // Build description
      let description = `${documentName} uploaded`
      if (allDocsUploaded) {
        description += ' - All verification documents complete'
      }

      await trackActivity(profile.id, {
        action: 'DOCUMENT_UPLOADED',
        description,
        metadata: {
          documentType: type,
          documentName,
          idType: idType || null,
          fileSize: file.size,
          fileType: file.type,
          fileName: file.name,
          s3Key: documentUrl,
          allDocsUploaded,
          uploadedAt: new Date().toISOString(),
          // Document completion status
          documentsStatus: {
            governmentId: !!updatedProfile?.governmentIdUrl,
            driversLicense: !!updatedProfile?.driversLicenseUrl,
            selfie: !!updatedProfile?.selfieUrl,
            complete: allDocsUploaded
          }
        }
      })

      console.log('✅ Document upload tracked in guest timeline:', {
        guestId: profile.id,
        documentType: type,
        allDocsUploaded
      })
    } catch (trackingError) {
      console.error('❌ Failed to track document upload activity:', trackingError)
      // Continue without breaking - tracking is non-critical
    }
    // ========== END ACTIVITY TRACKING ==========

    return NextResponse.json({
      success: true,
      url: documentUrl,
      message: `${type === 'governmentId' ? 'Government ID' : type === 'driversLicense' ? 'Driver\'s License' : 'Selfie'} uploaded successfully. We will review it within 24 hours.`,
      allDocsUploaded
    })

  } catch (error) {
    console.error('Error uploading document:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to upload document' },
      { status: 500 }
    )
  }
}

// DELETE: Remove a document (optional)
export async function DELETE(request: NextRequest) {
  try {
    // Get authenticated user
    const user = await verifyRequest(request)

    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userEmail = user.email
    const userId = user.id

    // Find profile
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      }
    })

    if (!profile) {
      return NextResponse.json(
        { success: false, error: 'Profile not found' },
        { status: 404 }
      )
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type')

    if (!type || !['governmentId', 'driversLicense', 'selfie', 'additionalDocument'].includes(type)) {
      return NextResponse.json(
        { success: false, error: 'Invalid document type' },
        { status: 400 }
      )
    }

    // Update profile to remove document
    const updateData: any = {
      documentsVerified: false,
      documentVerifiedAt: null,
      fullyVerified: false,
      canInstantBook: false
    }

    if (type === 'governmentId') {
      updateData.governmentIdUrl = null
      updateData.governmentIdType = null
    } else if (type === 'driversLicense') {
      updateData.driversLicenseUrl = null
    } else if (type === 'selfie') {
      updateData.selfieUrl = null
    } else if (type === 'additionalDocument') {
      updateData.additionalDocumentUrl = null
      updateData.additionalDocumentType = null
    }

    await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: updateData
    })

    // ========== 🆕 TRACK DOCUMENT REMOVAL (OPTIONAL) ==========
    try {
      const documentNames: Record<string, string> = {
        governmentId: 'Government ID',
        driversLicense: "Driver's License",
        selfie: 'Verification Selfie',
        additionalDocument: 'Additional Document'
      }

      const documentName = documentNames[type] || type

      await trackActivity(profile.id, {
        action: 'PROFILE_UPDATED',
        description: `${documentName} removed - Verification reset`,
        metadata: {
          documentType: type,
          documentRemoved: true,
          verificationReset: true,
          removedAt: new Date().toISOString()
        }
      })

      console.log('✅ Document removal tracked in guest timeline:', {
        guestId: profile.id,
        documentType: type
      })
    } catch (trackingError) {
      console.error('❌ Failed to track document removal activity:', trackingError)
      // Continue without breaking - tracking is non-critical
    }
    // ========== END ACTIVITY TRACKING ==========

    return NextResponse.json({
      success: true,
      message: 'Document removed successfully'
    })

  } catch (error) {
    console.error('Error removing document:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to remove document' },
      { status: 500 }
    )
  }
}