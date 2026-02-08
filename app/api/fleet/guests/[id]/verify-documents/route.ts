// app/api/fleet/guests/[id]/verify-documents/route.ts
// ✅ ADMIN ENDPOINT: Verify Guest Documents
// POST /api/fleet/guests/[id]/verify-documents?key=phoenix-fleet-2847
// Sets documentsVerified = true and tracks activity
// ✅ UPDATED: Now only requires 2 documents (Driver's License + Selfie)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { trackActivity } from '@/lib/helpers/guestProfileStatus'

// ========== POST - Verify All Documents ==========
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // ========== VERIFY FLEET ADMIN ACCESS ==========
    const urlKey = request.nextUrl.searchParams.get('key')
    const headerKey = request.headers.get('x-fleet-key')
    const phoenixKey = 'phoenix-fleet-2847'
    
    if (urlKey !== phoenixKey && headerKey !== phoenixKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized - Fleet admin access required' 
        },
        { status: 401 }
      )
    }

    // ========== FETCH GUEST PROFILE ==========
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        driversLicenseUrl: true,
        selfieUrl: true,
        documentsVerified: true,
        documentVerifiedAt: true,
        documentVerifiedBy: true
      }
    })

    if (!guest) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Guest not found' 
        },
        { status: 404 }
      )
    }

    // ========== VALIDATION: Check required 2 documents are uploaded ==========
    if (!guest.driversLicenseUrl || !guest.selfieUrl) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Cannot verify - not all required documents have been uploaded',
          details: {
            driversLicenseUploaded: !!guest.driversLicenseUrl,
            selfieUploaded: !!guest.selfieUrl,
            message: 'Both driver\'s license and selfie are required'
          }
        },
        { status: 400 }
      )
    }

    // ========== CHECK IF ALREADY VERIFIED ==========
    if (guest.documentsVerified) {
      return NextResponse.json(
        { 
          success: true, 
          message: 'Documents already verified',
          alreadyVerified: true,
          verifiedAt: guest.documentVerifiedAt,
          verifiedBy: guest.documentVerifiedBy,
          guest: {
            id: guest.id,
            name: guest.name,
            documentsVerified: true
          }
        },
        { status: 200 }
      )
    }

    // ========== GET ADMIN INFO (optional from request body) ==========
    let adminName = 'fleet-admin'
    try {
      const body = await request.json()
      if (body.adminName) {
        adminName = body.adminName
      }
    } catch {
      // No body or invalid JSON - use default
    }

    const now = new Date()

    // ========== UPDATE GUEST PROFILE ==========
    const updatedGuest = await prisma.reviewerProfile.update({
      where: { id },
      data: {
        documentsVerified: true,
        documentVerifiedAt: now,
        documentVerifiedBy: adminName,
        isVerified: true,  // Basic verification also set
        updatedAt: now
      },
      select: {
        id: true,
        name: true,
        email: true,
        documentsVerified: true,
        documentVerifiedAt: true,
        documentVerifiedBy: true,
        driversLicenseUrl: true,
        selfieUrl: true,
        isVerified: true,
        fullyVerified: true
      }
    })

    // ========== TRACK ACTIVITY IN GUEST TIMELINE ==========
    try {
      await trackActivity(id, {
        action: 'DOCUMENT_VERIFIED' as any,
        description: `Documents verified by ${adminName}`,
        metadata: {
          verifiedBy: adminName,
          verifiedAt: now.toISOString(),
          documentsVerified: {
            driversLicense: true,
            selfie: true
          },
          adminAction: true
        }
      })

      console.log('✅ Guest timeline updated with document verification:', {
        guestId: id,
        guestName: guest.name,
        verifiedBy: adminName,
        timestamp: now.toISOString()
      })
    } catch (trackingError) {
      console.error('❌ Failed to track document verification activity:', trackingError)
      // Continue without breaking - tracking is non-critical
    }

    // ========== LOG SUCCESS ==========
    console.log('✅ Documents verified successfully:', {
      guestId: id,
      guestName: guest.name,
      verifiedBy: adminName,
      timestamp: now.toISOString(),
      documents: {
        driversLicense: !!guest.driversLicenseUrl,
        selfie: !!guest.selfieUrl
      }
    })

    // ========== RETURN SUCCESS RESPONSE ==========
    return NextResponse.json({
      success: true,
      message: `Documents verified successfully for ${guest.name}`,
      alreadyVerified: false,
      guest: {
        id: updatedGuest.id,
        name: updatedGuest.name,
        email: updatedGuest.email,
        documentsVerified: updatedGuest.documentsVerified,
        documentVerifiedAt: updatedGuest.documentVerifiedAt,
        documentVerifiedBy: updatedGuest.documentVerifiedBy,
        isVerified: updatedGuest.isVerified,
        fullyVerified: updatedGuest.fullyVerified,
        documents: {
          driversLicenseUrl: updatedGuest.driversLicenseUrl,
          selfieUrl: updatedGuest.selfieUrl
        }
      }
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Error verifying guest documents:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to verify documents. Please try again.',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}

// ========== GET - Check Verification Status ==========
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // ========== VERIFY FLEET ADMIN ACCESS ==========
    const urlKey = request.nextUrl.searchParams.get('key')
    const headerKey = request.headers.get('x-fleet-key')
    const phoenixKey = 'phoenix-fleet-2847'
    
    if (urlKey !== phoenixKey && headerKey !== phoenixKey) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Unauthorized - Fleet admin access required' 
        },
        { status: 401 }
      )
    }

    // ========== FETCH VERIFICATION STATUS ==========
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        driversLicenseUrl: true,
        selfieUrl: true,
        documentsVerified: true,
        documentVerifiedAt: true,
        documentVerifiedBy: true,
        isVerified: true,
        fullyVerified: true
      }
    })

    if (!guest) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Guest not found' 
        },
        { status: 404 }
      )
    }

    // ========== CALCULATE STATUS (2 required documents only) ==========
    const allDocsUploaded = !!(
      guest.driversLicenseUrl && 
      guest.selfieUrl
    )

    let status: 'NOT_UPLOADED' | 'PENDING_REVIEW' | 'VERIFIED'
    
    if (guest.documentsVerified) {
      status = 'VERIFIED'
    } else if (allDocsUploaded) {
      status = 'PENDING_REVIEW'
    } else {
      status = 'NOT_UPLOADED'
    }

    // ========== RETURN STATUS ==========
    return NextResponse.json({
      success: true,
      guest: {
        id: guest.id,
        name: guest.name,
        email: guest.email,
        status,
        documentsVerified: guest.documentsVerified,
        documentVerifiedAt: guest.documentVerifiedAt,
        documentVerifiedBy: guest.documentVerifiedBy,
        isVerified: guest.isVerified,
        fullyVerified: guest.fullyVerified,
        documents: {
          driversLicense: {
            uploaded: !!guest.driversLicenseUrl,
            url: guest.driversLicenseUrl
          },
          selfie: {
            uploaded: !!guest.selfieUrl,
            url: guest.selfieUrl
          }
        },
        canVerify: allDocsUploaded && !guest.documentsVerified
      }
    }, { status: 200 })

  } catch (error) {
    console.error('❌ Error fetching verification status:', error)
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch verification status',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}