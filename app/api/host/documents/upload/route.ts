// app/api/host/documents/upload/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verify } from 'jsonwebtoken'
import { sendHostDocumentRequest } from '@/app/lib/email'
import { v2 as cloudinary } from 'cloudinary'

const JWT_SECRET = process.env.JWT_SECRET!

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Valid photo ID types and their required pages
const PHOTO_ID_TYPES = {
  GOVERNMENT_ID: { label: 'Government ID', pages: ['front', 'back'] },
  DRIVERS_LICENSE: { label: "Driver's License", pages: ['front', 'back'] },
  PASSPORT: { label: 'Passport', pages: ['photo', 'info', 'lastPage'] }
} as const

type PhotoIdType = keyof typeof PHOTO_ID_TYPES

// Helper function to verify host token
async function verifyHostToken(request: NextRequest) {
  try {
    // Check for token in cookies or headers
    const cookieToken = request.cookies.get('hostAccessToken')?.value
    const headerToken = request.headers.get('authorization')?.replace('Bearer ', '')

    const token = cookieToken || headerToken

    if (!token) {
      return null
    }

    const decoded = verify(token, JWT_SECRET) as any

    // Verify host exists and is active
    const host = await (prisma.rentalHost.findUnique as any)({
      where: { id: decoded.hostId },
      select: {
        id: true,
        email: true,
        name: true,
        approvalStatus: true,
        documentsVerified: true,
        governmentIdUrl: true,
        driversLicenseUrl: true,
        insuranceDocUrl: true,
        photoIdType: true,
        photoIdUrls: true,
        photoIdVerified: true,
        photoIdSubmittedAt: true,
        documentStatuses: true,
        documentStatusRecords: true
      }
    })

    return host
  } catch (error) {
    console.error('Host token verification failed:', error)
    return null
  }
}

// POST - Upload/resubmit documents
export async function POST(request: NextRequest) {
  try {
    console.log('📤 Document upload request received')

    // Verify host authentication
    const host = await verifyHostToken(request)

    if (!host) {
      console.log('❌ Document upload failed: No host authentication')
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    console.log('✅ Host authenticated:', host.id, host.email)

    // Check if host is in a state where they can upload documents
    if (host.approvalStatus === 'APPROVED' && host.documentsVerified && host.photoIdVerified) {
      return NextResponse.json(
        { error: 'Documents already verified. Contact support if you need to update documents.' },
        { status: 400 }
      )
    }

    if (host.approvalStatus === 'REJECTED' || host.approvalStatus === 'BLACKLISTED') {
      return NextResponse.json(
        { error: 'Account status does not allow document updates.' },
        { status: 403 }
      )
    }

    // Parse FormData (file upload)
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    let documentType = formData.get('documentType') as string | null
    const photoIdType = formData.get('photoIdType') as PhotoIdType | null  // NEW: GOVERNMENT_ID, DRIVERS_LICENSE, PASSPORT
    const documentSide = formData.get('documentSide') as string | null      // NEW: front, back, photo, info, lastPage

    // Map client document IDs to server document types (legacy support)
    const documentTypeMap: Record<string, string> = {
      'government_id': 'governmentId',
      'drivers_license': 'driversLicense',
      'insurance': 'insurance',
      'proof_of_address': 'proofOfAddress',
      'bank_statement': 'bankStatement',
      'photo_id': 'photoId'  // NEW: multi-page photo ID
    }

    // Convert underscored names to camelCase if needed
    if (documentType && documentTypeMap[documentType]) {
      documentType = documentTypeMap[documentType]
    }

    // Validate required fields
    if (!file) {
      return NextResponse.json(
        { error: 'File is required' },
        { status: 400 }
      )
    }

    if (!documentType) {
      return NextResponse.json(
        { error: 'Document type is required' },
        { status: 400 }
      )
    }

    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images (JPG, PNG) and PDFs are allowed.' },
        { status: 400 }
      )
    }

    // Validate file size (10MB max)
    const maxSize = 10 * 1024 * 1024
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }

    // ========================================
    // NEW: Handle multi-page Photo ID uploads
    // ========================================
    if (documentType === 'photoId') {
      // Validate photo ID type
      if (!photoIdType || !PHOTO_ID_TYPES[photoIdType]) {
        return NextResponse.json(
          { error: 'Invalid photo ID type. Must be GOVERNMENT_ID, DRIVERS_LICENSE, or PASSPORT.' },
          { status: 400 }
        )
      }

      // Validate document side
      const validSides = PHOTO_ID_TYPES[photoIdType].pages as readonly string[]
      if (!documentSide || !validSides.includes(documentSide)) {
        return NextResponse.json(
          { error: `Invalid document side. For ${photoIdType}, valid sides are: ${validSides.join(', ')}` },
          { status: 400 }
        )
      }

      // Upload to Cloudinary
      const bytes = await file.arrayBuffer()
      const buffer = Buffer.from(bytes)
      const base64 = buffer.toString('base64')
      const dataUri = `data:${file.type};base64,${base64}`

      const folder = `host-documents/photo-id/${photoIdType.toLowerCase()}`
      const publicId = `${host.id}-${photoIdType.toLowerCase()}-${documentSide}-${Date.now()}`

      const uploadResult = await cloudinary.uploader.upload(dataUri, {
        folder: folder,
        public_id: publicId,
        resource_type: 'auto'
      })

      const documentUrl = uploadResult.secure_url

      // Update photoIdUrls JSON field
      const currentPhotoIdUrls = (host.photoIdUrls as Record<string, string>) || {}
      currentPhotoIdUrls[documentSide] = documentUrl

      // Check if all required pages are uploaded
      const requiredPages = PHOTO_ID_TYPES[photoIdType].pages
      const uploadedPages = Object.keys(currentPhotoIdUrls).filter(key => currentPhotoIdUrls[key])
      const allPagesUploaded = requiredPages.every(page => uploadedPages.includes(page))

      // Update host record
      await prisma.rentalHost.update({
        where: { id: host.id },
        data: {
          photoIdType: photoIdType,
          photoIdUrls: currentPhotoIdUrls,
          photoIdVerified: false, // Reset verification when new page uploaded
          documentsResubmittedAt: new Date()
        }
      })

      // Create admin notification only when all pages are uploaded
      if (allPagesUploaded) {
        await (prisma.adminNotification.create as any)({
          data: {
            type: 'DOCUMENT_RESUBMITTED',
            title: 'Host Photo ID Complete',
            message: `${host.name} has uploaded all pages of their ${PHOTO_ID_TYPES[photoIdType].label}`,
            priority: 'medium',
            status: 'unread',
            metadata: {
              hostId: host.id,
              hostName: host.name,
              photoIdType,
              uploadedPages: requiredPages,
              uploadedAt: new Date().toISOString()
            }
          }
        })
      }

      // Log activity
      await (prisma.activityLog.create as any)({
        data: {
          entityType: 'HOST',
          entityId: host.id,
          action: 'PHOTO_ID_PAGE_UPLOADED',
          metadata: {
            photoIdType,
            documentSide,
            hostId: host.id,
            hostName: host.name,
            allPagesUploaded
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return NextResponse.json({
        success: true,
        message: `${documentSide} page uploaded successfully`,
        url: documentUrl,
        data: {
          documentType: 'photoId',
          photoIdType,
          documentSide,
          uploadedPages: uploadedPages.concat(documentSide).filter((v, i, a) => a.indexOf(v) === i),
          requiredPages,
          allPagesUploaded,
          status: allPagesUploaded ? 'UNDER_REVIEW' : 'INCOMPLETE',
          uploadedAt: new Date().toISOString()
        }
      })
    }

    // ========================================
    // LEGACY: Handle single-page documents (insurance, etc.)
    // ========================================
    const validTypes = ['governmentId', 'driversLicense', 'insurance', 'proofOfAddress', 'bankStatement']
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      )
    }

    // Upload to Cloudinary
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`

    const folder = `host-documents/${documentType}`
    const publicId = `${host.id}-${documentType}-${Date.now()}`

    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: folder,
      public_id: publicId,
      resource_type: 'auto'
    })

    const documentUrl = uploadResult.secure_url

    // Start transaction
    const result = await prisma.$transaction(async (tx) => {
      // Update the specific document URL
      const updateData: any = {
        documentsResubmittedAt: new Date()
      }

      // Map document type to database field
      switch (documentType) {
        case 'governmentId':
          updateData.governmentIdUrl = documentUrl
          break
        case 'driversLicense':
          updateData.driversLicenseUrl = documentUrl
          break
        case 'insurance':
          updateData.insuranceDocUrl = documentUrl
          break
        case 'proofOfAddress':
          updateData.proofOfAddressUrl = documentUrl
          break
        case 'bankStatement':
          updateData.bankStatementUrl = documentUrl
          break
      }

      // Update document statuses JSON
      const currentStatuses = (host.documentStatuses as any) || {}
      currentStatuses[documentType] = {
        status: 'UNDER_REVIEW',
        uploadedAt: new Date().toISOString(),
        reviewedAt: null,
        reviewNotes: null
      }
      updateData.documentStatuses = currentStatuses

      // Remove from pending actions if this document was requested
      const currentPendingActions = (host as any).pendingActions || []
      const updatedPendingActions = currentPendingActions.filter(
        (action: string) => !action.includes(documentType)
      )
      if (updatedPendingActions.length !== currentPendingActions.length) {
        updateData.pendingActions = updatedPendingActions
      }

      // Update host record
      const updatedHost = await tx.rentalHost.update({
        where: { id: host.id },
        data: updateData
      })

      // Create or update document status record
      await (tx.hostDocumentStatus.upsert as any)({
        where: {
          hostId_documentType: {
            hostId: host.id,
            documentType: documentType
          }
        },
        update: {
          documentUrl: documentUrl,
          uploadedAt: new Date(),
          status: 'UNDER_REVIEW',
          reviewStatus: 'PENDING',
          feedback: null,
          rejectionReason: null,
          isExpired: false,
          verificationScore: null
        },
        create: {
          hostId: host.id,
          documentType: documentType,
          documentUrl: documentUrl,
          uploadedAt: new Date(),
          status: 'UNDER_REVIEW',
          reviewStatus: 'PENDING'
        }
      })

      // Create notification record
      await (tx.hostNotification.create as any)({
        data: {
          hostId: host.id,
          type: 'DOCUMENT_UPLOADED',
          category: 'DOCUMENT',
          subject: 'Document Uploaded Successfully',
          message: `Your ${documentType} has been uploaded and is pending review.`,
          status: 'SENT',
          metadata: {
            documentType,
            uploadedAt: new Date().toISOString()
          }
        }
      })

      // Create admin notification
      await (tx.adminNotification.create as any)({
        data: {
          type: 'DOCUMENT_RESUBMITTED',
          title: 'Host Document Resubmitted',
          message: `${host.name} has resubmitted their ${documentType}`,
          priority: 'medium',
          status: 'unread',
          metadata: {
            hostId: host.id,
            hostName: host.name,
            documentType,
            uploadedAt: new Date().toISOString()
          }
        }
      })

      // Log activity
      await (tx.activityLog.create as any)({
        data: {
          entityType: 'HOST',
          entityId: host.id,
          action: 'DOCUMENT_UPLOADED',
          metadata: {
            documentType,
            hostId: host.id,
            hostName: host.name,
            previousStatus: host.approvalStatus
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return updatedHost
    })

    return NextResponse.json({
      success: true,
      message: 'Document uploaded successfully',
      url: documentUrl,
      data: {
        documentType,
        status: 'UNDER_REVIEW',
        uploadedAt: new Date().toISOString()
      }
    })

  } catch (error) {
    console.error('Document upload error:', error)
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    return NextResponse.json(
      { error: 'Failed to upload document', details: errorMessage },
      { status: 500 }
    )
  }
}

// GET - Get document upload status
export async function GET(request: NextRequest) {
  try {
    // Verify host authentication
    const host = await verifyHostToken(request)

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    // Get all document status records for this host
    const documentRecords = await prisma.hostDocumentStatus.findMany({
      where: { hostId: host.id },
      orderBy: { uploadedAt: 'desc' }
    })

    // Build photoId status (NEW multi-page system)
    const photoIdUrls = (host.photoIdUrls as Record<string, string>) || {}
    const photoIdType = host.photoIdType as keyof typeof PHOTO_ID_TYPES | null
    let photoIdStatus: {
      type: string | null
      typeLabel: string | null
      urls: Record<string, string>
      requiredPages: string[]
      uploadedPages: string[]
      allPagesUploaded: boolean
      verified: boolean
      submitted: boolean
      submittedAt: Date | null
      status: string
    } = {
      type: null,
      typeLabel: null,
      urls: {},
      requiredPages: [],
      uploadedPages: [],
      allPagesUploaded: false,
      verified: host.photoIdVerified || false,
      submitted: false,
      submittedAt: null,
      status: 'NOT_STARTED'
    }

    if (photoIdType && PHOTO_ID_TYPES[photoIdType]) {
      const requiredPages = [...PHOTO_ID_TYPES[photoIdType].pages]
      const uploadedPages = Object.keys(photoIdUrls).filter(key => photoIdUrls[key])
      const allPagesUploaded = requiredPages.every(page => uploadedPages.includes(page))
      const isSubmitted = !!host.photoIdSubmittedAt

      // Determine status:
      // - VERIFIED: Admin has verified the documents
      // - UNDER_REVIEW: User clicked Submit, waiting for admin review
      // - PENDING_SUBMISSION: All pages uploaded but user hasn't clicked Submit yet
      // - INCOMPLETE: Not all pages uploaded
      let status = 'INCOMPLETE'
      if (host.photoIdVerified) {
        status = 'VERIFIED'
      } else if (allPagesUploaded && isSubmitted) {
        status = 'UNDER_REVIEW'
      } else if (allPagesUploaded) {
        status = 'PENDING_SUBMISSION'
      }

      photoIdStatus = {
        type: photoIdType,
        typeLabel: PHOTO_ID_TYPES[photoIdType].label,
        urls: photoIdUrls,
        requiredPages,
        uploadedPages,
        allPagesUploaded,
        verified: host.photoIdVerified || false,
        submitted: isSubmitted,
        submittedAt: host.photoIdSubmittedAt,
        status
      }
    }

    // Build legacy document status (for insurance, etc.)
    const documentStatus = {
      insurance: {
        url: host.insuranceDocUrl,
        status: (host.documentStatuses as any)?.insurance?.status || 'NOT_UPLOADED',
        record: documentRecords.find(r => r.documentType === 'insurance') || null
      }
    }

    // Check if any documents need attention
    const needsAction = documentRecords.some(
      record => (record.reviewStatus as string) === 'NEEDS_RESUBMISSION' || record.isExpired
    )

    return NextResponse.json({
      success: true,
      data: {
        approvalStatus: host.approvalStatus,
        documentsVerified: host.documentsVerified,
        photoId: photoIdStatus,
        documents: documentStatus,
        needsAction,
        pendingActions: (host as any).pendingActions || []
      }
    })

  } catch (error) {
    console.error('Get document status error:', error)
    return NextResponse.json(
      { error: 'Failed to get document status' },
      { status: 500 }
    )
  }
}

// PUT - Submit documents for review
export async function PUT(request: NextRequest) {
  try {
    // Verify host authentication
    const host = await verifyHostToken(request)

    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { action } = body

    if (action === 'submit_photo_id') {
      // Check if all pages are uploaded
      const photoIdUrls = (host.photoIdUrls as Record<string, string>) || {}
      const photoIdType = host.photoIdType as keyof typeof PHOTO_ID_TYPES | null

      if (!photoIdType || !PHOTO_ID_TYPES[photoIdType]) {
        return NextResponse.json(
          { error: 'No photo ID type selected' },
          { status: 400 }
        )
      }

      const requiredPages = PHOTO_ID_TYPES[photoIdType].pages
      const uploadedPages = Object.keys(photoIdUrls).filter(key => photoIdUrls[key])
      const allPagesUploaded = requiredPages.every(page => uploadedPages.includes(page))

      if (!allPagesUploaded) {
        return NextResponse.json(
          { error: 'Please upload all required pages before submitting' },
          { status: 400 }
        )
      }

      // Check if already submitted
      if (host.photoIdSubmittedAt) {
        return NextResponse.json(
          { error: 'Documents have already been submitted for review' },
          { status: 400 }
        )
      }

      // Mark as submitted
      await prisma.rentalHost.update({
        where: { id: host.id },
        data: {
          photoIdSubmittedAt: new Date()
        }
      })

      // Create admin notification for review
      await (prisma.adminNotification.create as any)({
        data: {
          type: 'DOCUMENT_SUBMITTED',
          title: 'Photo ID Submitted for Review',
          message: `${host.name} has submitted their ${PHOTO_ID_TYPES[photoIdType].label} for verification`,
          priority: 'HIGH',
          status: 'UNREAD',
          actionRequired: true,
          metadata: {
            hostId: host.id,
            hostName: host.name,
            hostEmail: host.email,
            photoIdType,
            uploadedPages: requiredPages,
            submittedAt: new Date().toISOString()
          }
        }
      })

      // Log activity
      await (prisma.activityLog.create as any)({
        data: {
          entityType: 'HOST',
          entityId: host.id,
          action: 'PHOTO_ID_SUBMITTED',
          metadata: {
            photoIdType,
            hostId: host.id,
            hostName: host.name,
            submittedAt: new Date().toISOString()
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return NextResponse.json({
        success: true,
        message: 'Documents submitted for review',
        data: {
          status: 'UNDER_REVIEW',
          submittedAt: new Date().toISOString()
        }
      })
    }

    // Cancel submission and allow re-upload
    if (action === 'cancel_photo_id_submission') {
      // Check if actually submitted
      if (!host.photoIdSubmittedAt) {
        return NextResponse.json(
          { error: 'No submission to cancel' },
          { status: 400 }
        )
      }

      // Don't allow cancellation if already verified
      if (host.photoIdVerified) {
        return NextResponse.json(
          { error: 'Cannot cancel - documents have already been verified' },
          { status: 400 }
        )
      }

      const { clearPhotos } = body

      // Clear submission timestamp (and optionally clear photos)
      const updateData: any = {
        photoIdSubmittedAt: null
      }

      if (clearPhotos) {
        updateData.photoIdUrls = {}
        updateData.photoIdType = null
      }

      await prisma.rentalHost.update({
        where: { id: host.id },
        data: updateData
      })

      // Log activity
      await (prisma.activityLog.create as any)({
        data: {
          entityType: 'HOST',
          entityId: host.id,
          action: 'PHOTO_ID_SUBMISSION_CANCELLED',
          metadata: {
            hostId: host.id,
            hostName: host.name,
            clearedPhotos: !!clearPhotos,
            cancelledAt: new Date().toISOString()
          },
          ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
          userAgent: request.headers.get('user-agent') || 'unknown'
        }
      })

      return NextResponse.json({
        success: true,
        message: clearPhotos ? 'Submission cancelled and photos cleared' : 'Submission cancelled - you can now edit your photos',
        data: {
          status: clearPhotos ? 'NOT_STARTED' : 'PENDING_SUBMISSION',
          clearedPhotos: !!clearPhotos
        }
      })
    }

    return NextResponse.json(
      { error: 'Invalid action' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Submit documents error:', error)
    return NextResponse.json(
      { error: 'Failed to submit documents' },
      { status: 500 }
    )
  }
}