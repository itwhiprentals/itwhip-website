// app/api/host/verification-status/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verify } from 'jsonwebtoken'

const JWT_SECRET = process.env.JWT_SECRET!

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
    
    // Verify host exists
    const host = await prisma.rentalHost.findUnique({
      where: { id: decoded.hostId },
      select: {
        id: true,
        email: true,
        name: true,
        approvalStatus: true,
        hostType: true
      }
    })
    
    return host
  } catch (error) {
    console.error('Host token verification failed:', error)
    return null
  }
}

// GET - Get detailed verification status
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
    
    // Platform Fleet hosts bypass all verification
    if (host.hostType === 'MANAGED') {
      return NextResponse.json({
        success: true,
        data: {
          overallStatus: 'APPROVED',
          statusMessage: 'Platform managed host - verification not required',
          verificationProgress: 100,
          isFullyVerified: true,
          canListCars: true,
          requirements: {
            documents: { required: false, completed: true },
            backgroundCheck: { required: false, completed: true },
            bankAccount: { required: false, completed: true },
            profile: { required: false, completed: true }
          },
          nextSteps: [],
          estimatedCompletionTime: null
        }
      })
    }
    
    // Get complete host verification data
    const fullHost = await prisma.rentalHost.findUnique({
      where: { id: host.id },
      include: {
        cars: {
          select: {
            id: true,
            isActive: true
          }
        }
      }
    })
    
    if (!fullHost) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }
    
    // Calculate verification progress
    const verificationSteps = {
      profile: {
        required: true,
        completed: !!(fullHost.name && fullHost.email && fullHost.phone),
        weight: 10
      },
      governmentId: {
        required: true,
        completed: false,
        status: 'NOT_UPLOADED',
        message: null,
        weight: 25
      },
      driversLicense: {
        required: true,
        completed: false,
        status: 'NOT_UPLOADED',
        message: null,
        weight: 25
      },
      insurance: {
        required: true,
        completed: false,
        status: 'NOT_UPLOADED',
        message: null,
        weight: 20
      },
      backgroundCheck: {
        required: true,
        completed: false,
        status: 'NOT_STARTED',
        message: null,
        weight: 15
      },
      bankAccount: {
        required: true,
        completed: fullHost.bankVerified || false,
        weight: 5
      }
    }
    
    // Check document statuses from JSON field
    const documentStatuses = fullHost.documentStatuses as any || {}
    
    // Government ID status
    if (fullHost.governmentIdUrl) {
      const govIdStatus = documentStatuses.governmentId || {}
      verificationSteps.governmentId.completed = govIdStatus.status === 'APPROVED'
      verificationSteps.governmentId.status = govIdStatus.status || 'PENDING_REVIEW'
      verificationSteps.governmentId.message = govIdStatus.reviewNotes
    }
    
    // Driver's License status
    if (fullHost.driversLicenseUrl) {
      const licenseStatus = documentStatuses.driversLicense || {}
      verificationSteps.driversLicense.completed = licenseStatus.status === 'APPROVED'
      verificationSteps.driversLicense.status = licenseStatus.status || 'PENDING_REVIEW'
      verificationSteps.driversLicense.message = licenseStatus.reviewNotes
    }
    
    // Insurance status
    if (fullHost.insuranceDocUrl) {
      const insuranceStatus = documentStatuses.insurance || {}
      verificationSteps.insurance.completed = insuranceStatus.status === 'APPROVED'
      verificationSteps.insurance.status = insuranceStatus.status || 'PENDING_REVIEW'
      verificationSteps.insurance.message = insuranceStatus.reviewNotes
    }
    
    // Background check status from JSON field
    const bgCheckStatus = fullHost.backgroundCheckStatus as any
    if (bgCheckStatus && typeof bgCheckStatus === 'object') {
      verificationSteps.backgroundCheck.completed = bgCheckStatus.overallStatus === 'PASSED'
      verificationSteps.backgroundCheck.status = bgCheckStatus.overallStatus || 'NOT_STARTED'
      verificationSteps.backgroundCheck.message = bgCheckStatus.notes
    }
    
    // Calculate overall progress
    const totalWeight = Object.values(verificationSteps).reduce((sum, step) => sum + step.weight, 0)
    const completedWeight = Object.values(verificationSteps).reduce((sum, step) => {
      return sum + (step.completed ? step.weight : 0)
    }, 0)
    const verificationProgress = Math.round((completedWeight / totalWeight) * 100)
    
    // Determine next steps
    const nextSteps = []
    const pendingActions = (fullHost.pendingActions as string[]) || []
    
    if (!verificationSteps.profile.completed) {
      nextSteps.push({
        action: 'Complete Profile',
        description: 'Add your name and phone number',
        url: '/host/profile',
        priority: 'HIGH'
      })
    }
    
    if (verificationSteps.governmentId.status === 'NOT_UPLOADED') {
      nextSteps.push({
        action: 'Upload Government ID',
        description: 'Provide a clear photo of your government-issued ID',
        url: '/host/profile',
        priority: 'HIGH'
      })
    } else if (verificationSteps.governmentId.status === 'REJECTED') {
      nextSteps.push({
        action: 'Resubmit Government ID',
        description: verificationSteps.governmentId.message || 'Your ID was rejected. Please upload a clearer photo.',
        url: '/host/profile',
        priority: 'HIGH'
      })
    }
    
    if (verificationSteps.driversLicense.status === 'NOT_UPLOADED') {
      nextSteps.push({
        action: 'Upload Driver\'s License',
        description: 'Provide a clear photo of your valid driver\'s license',
        url: '/host/profile',
        priority: 'HIGH'
      })
    } else if (verificationSteps.driversLicense.status === 'REJECTED') {
      nextSteps.push({
        action: 'Resubmit Driver\'s License',
        description: verificationSteps.driversLicense.message || 'Your license was rejected. Please upload a clearer photo.',
        url: '/host/profile',
        priority: 'HIGH'
      })
    }
    
    if (verificationSteps.insurance.status === 'NOT_UPLOADED') {
      nextSteps.push({
        action: 'Upload Insurance Document',
        description: 'Provide proof of valid auto insurance',
        url: '/host/profile',
        priority: 'HIGH'
      })
    } else if (verificationSteps.insurance.status === 'REJECTED') {
      nextSteps.push({
        action: 'Resubmit Insurance',
        description: verificationSteps.insurance.message || 'Your insurance document was rejected. Please upload a current policy.',
        url: '/host/profile',
        priority: 'HIGH'
      })
    }
    
    if (!verificationSteps.bankAccount.completed) {
      nextSteps.push({
        action: 'Add Bank Account',
        description: 'Connect your bank account to receive payouts',
        url: '/host/earnings',
        priority: 'MEDIUM'
      })
    }
    
    // Determine overall status message
    let statusMessage = ''
    let estimatedCompletionTime = null
    
    switch (fullHost.approvalStatus) {
      case 'PENDING':
        if (verificationProgress < 50) {
          statusMessage = 'Please complete all required documents to begin verification'
          estimatedCompletionTime = '2-3 days after all documents are submitted'
        } else if (verificationProgress < 100) {
          statusMessage = 'Your application is being reviewed. Some items still need attention.'
          estimatedCompletionTime = '1-2 days'
        } else {
          statusMessage = 'All requirements met! Final review in progress.'
          estimatedCompletionTime = 'Within 24 hours'
        }
        break
        
      case 'APPROVED':
        statusMessage = 'Congratulations! You are approved to list vehicles.'
        break
        
      case 'SUSPENDED':
        statusMessage = fullHost.suspendedReason || 'Your account is temporarily suspended. Please contact support.'
        break
        
      case 'REJECTED':
        statusMessage = fullHost.rejectedReason || 'Your application was not approved. You may reapply after addressing the issues.'
        break
        
      case 'NEEDS_ATTENTION':
        statusMessage = 'Action required: Please address the items listed below to continue.'
        break
        
      default:
        statusMessage = 'Verification in progress'
    }
    
    // Check what permissions are currently available
    const permissions = {
      canListCars: fullHost.approvalStatus === 'APPROVED' && fullHost.dashboardAccess,
      canViewBookings: fullHost.canViewBookings || false,
      canEditCalendar: fullHost.canEditCalendar || false,
      canSetPricing: fullHost.canSetPricing || false,
      canMessageGuests: fullHost.canMessageGuests || false,
      canWithdrawFunds: fullHost.canWithdrawFunds || false,
      instantBookEnabled: fullHost.autoApproveBookings || false
    }
    
    return NextResponse.json({
      success: true,
      data: {
        hostId: fullHost.id,
        overallStatus: fullHost.approvalStatus,
        statusMessage,
        verificationProgress,
        isFullyVerified: verificationProgress === 100,
        requirements: verificationSteps,
        nextSteps: nextSteps.sort((a, b) => {
          const priorityOrder: Record<string, number> = { HIGH: 0, MEDIUM: 1, LOW: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        }),
        permissions,
        restrictions: (fullHost.restrictionReasons as string[]) || [],
        documentsRequestedAt: fullHost.documentsRequestedAt,
        documentsResubmittedAt: fullHost.documentsResubmittedAt,
        estimatedCompletionTime,
        stats: {
          totalCars: fullHost.cars.length,
          activeCars: fullHost.cars.filter(c => c.isActive).length,
          pendingNotifications: 0
        }
      }
    })
    
  } catch (error) {
    console.error('Get verification status error:', error)
    return NextResponse.json(
      { error: 'Failed to get verification status' },
      { status: 500 }
    )
  }
}