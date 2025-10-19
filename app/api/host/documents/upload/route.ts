// app/api/host/documents/upload/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verify } from 'jsonwebtoken'
import { sendHostDocumentRequest } from '@/app/lib/email'

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production'

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
    const host = await prisma.rentalHost.findUnique({
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
    // Verify host authentication
    const host = await verifyHostToken(request)
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized. Please log in.' },
        { status: 401 }
      )
    }
    
    // Check if host is in a state where they can upload documents
    if (host.approvalStatus === 'APPROVED' && host.documentsVerified) {
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
    
    // Parse request body
    const body = await request.json()
    const { documentType, documentUrl, documentData } = body
    
    // Validate required fields
    if (!documentType || (!documentUrl && !documentData)) {
      return NextResponse.json(
        { error: 'Document type and either URL or data are required' },
        { status: 400 }
      )
    }
    
    // Validate document type
    const validTypes = ['governmentId', 'driversLicense', 'insurance', 'proofOfAddress', 'bankStatement']
    if (!validTypes.includes(documentType)) {
      return NextResponse.json(
        { error: 'Invalid document type' },
        { status: 400 }
      )
    }
    
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
        status: 'PENDING_REVIEW',
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
      await tx.hostDocumentStatus.upsert({
        where: {
          hostId_documentType: {
            hostId: host.id,
            documentType: documentType
          }
        },
        update: {
          uploadUrl: documentUrl,
          uploadedAt: new Date(),
          status: 'PENDING_REVIEW',
          reviewStatus: 'PENDING',
          reviewNotes: null,
          reviewedAt: null,
          reviewedBy: null,
          isExpired: false,
          qualityScore: null
        },
        create: {
          hostId: host.id,
          documentType: documentType,
          uploadUrl: documentUrl,
          uploadedAt: new Date(),
          status: 'PENDING_REVIEW',
          reviewStatus: 'PENDING'
        }
      })
      
      // Create notification record
      await tx.hostNotification.create({
        data: {
          hostId: host.id,
          type: 'DOCUMENT_UPLOADED',
          title: 'Document Uploaded Successfully',
          message: `Your ${documentType} has been uploaded and is pending review.`,
          status: 'SENT',
          priority: 'MEDIUM',
          metadata: {
            documentType,
            uploadedAt: new Date().toISOString()
          }
        }
      })
      
      // Create admin notification
      await tx.adminNotification.create({
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
      await tx.activityLog.create({
        data: {
          entityType: 'HOST',
          entityId: host.id,
          action: 'DOCUMENT_UPLOADED',
          details: {
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
      data: {
        documentType,
        status: 'PENDING_REVIEW',
        uploadedAt: new Date().toISOString()
      }
    })
    
  } catch (error) {
    console.error('Document upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload document' },
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
    
    // Build response with current document status
    const documentStatus = {
      governmentId: {
        url: host.governmentIdUrl,
        status: (host.documentStatuses as any)?.governmentId?.status || 'NOT_UPLOADED',
        record: documentRecords.find(r => r.documentType === 'governmentId') || null
      },
      driversLicense: {
        url: host.driversLicenseUrl,
        status: (host.documentStatuses as any)?.driversLicense?.status || 'NOT_UPLOADED',
        record: documentRecords.find(r => r.documentType === 'driversLicense') || null
      },
      insurance: {
        url: host.insuranceDocUrl,
        status: (host.documentStatuses as any)?.insurance?.status || 'NOT_UPLOADED',
        record: documentRecords.find(r => r.documentType === 'insurance') || null
      }
    }
    
    // Check if any documents need attention
    const needsAction = documentRecords.some(
      record => record.reviewStatus === 'NEEDS_RESUBMISSION' || record.isExpired
    )
    
    return NextResponse.json({
      success: true,
      data: {
        approvalStatus: host.approvalStatus,
        documentsVerified: host.documentsVerified,
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