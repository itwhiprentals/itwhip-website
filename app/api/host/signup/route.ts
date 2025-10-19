// app/api/host/signup/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import bcrypt from 'bcryptjs'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      email,
      password,
      phone,
      address,
      city,
      state,
      zipCode,
      bio,
      governmentIdUrl,
      driversLicenseUrl,
      insuranceDocUrl,
      bankName,
      accountNumber,
      routingNumber,
      hasVehicle,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      agreeToTerms,
      agreeToCommission
    } = body

    // Validation
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    if (!agreeToTerms || !agreeToCommission) {
      return NextResponse.json(
        { error: 'Must agree to terms and commission' },
        { status: 400 }
      )
    }

    // Check if email already exists
    const existingHost = await prisma.rentalHost.findUnique({
      where: { email }
    })

    if (existingHost) {
      return NextResponse.json(
        { error: 'Email already registered' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await bcrypt.hash(password, 10)

    // Encrypt banking info (simplified - in production use proper encryption)
    const bankingInfo = {
      bankName,
      accountNumber: accountNumber.slice(-4).padStart(accountNumber.length, '*'),
      routingNumber: routingNumber.slice(-4).padStart(routingNumber.length, '*')
    }

    // Create the host with PENDING status
    const newHost = await prisma.rentalHost.create({
      data: {
        name,
        email,
        phone,
        bio: bio || null,
        
        // Location
        city,
        state,
        zipCode: zipCode || null,
        
        // Documents
        governmentIdUrl: governmentIdUrl || null,
        driversLicenseUrl: driversLicenseUrl || null,
        insuranceDocUrl: insuranceDocUrl || null,
        
        // Banking (encrypted)
        bankAccountInfo: JSON.stringify(bankingInfo),
        bankVerified: false,
        documentsVerified: false,
        
        // Host type and status
        hostType: 'REAL',
        approvalStatus: 'PENDING',
        dashboardAccess: false,
        
        // Default permissions (all false for new hosts)
        canViewBookings: false,
        canEditCalendar: false,
        canSetPricing: false,
        canMessageGuests: false,
        canWithdrawFunds: false,
        
        // Default commission
        commissionRate: 0.20,
        
        // Status
        active: false, // Not active until approved
        isVerified: false,
        
        // Create associated User account for authentication
        user: {
          create: {
            email,
            name,
            phone,
            passwordHash,
            role: 'CLAIMED',
            emailVerified: false,
            isActive: true
          }
        }
      },
      include: {
        user: true
      }
    })

    // Create admin notification for new host application
    await prisma.adminNotification.create({
      data: {
        type: 'HOST_APPLICATION',
        title: 'New Host Application',
        message: `${name} has submitted a host application from ${city}, ${state}`,
        priority: 'HIGH',
        status: 'UNREAD',
        actionRequired: true,
        actionUrl: `/fleet/hosts/${newHost.id}/review`,
        relatedId: newHost.id,
        relatedType: 'RentalHost',
        metadata: {
          hostName: name,
          hostEmail: email,
          city,
          state,
          hasDocuments: !!(governmentIdUrl && driversLicenseUrl),
          hasVehicle
        }
      }
    })

    // Create audit log for tracking
    await prisma.auditLog.create({
      data: {
        category: 'HOST_MANAGEMENT',
        eventType: 'host_application_submitted',
        severity: 'INFO',
        userId: newHost.user?.id,
        adminId: null,
        adminEmail: null,
        ipAddress: request.headers.get('x-forwarded-for') || 'unknown',
        userAgent: request.headers.get('user-agent') || 'unknown',
        action: 'create',
        resource: 'host_application',
        resourceId: newHost.id,
        details: {
          hostName: name,
          hostEmail: email,
          location: `${city}, ${state}`,
          documentsUploaded: {
            governmentId: !!governmentIdUrl,
            driversLicense: !!driversLicenseUrl,
            insurance: !!insuranceDocUrl
          }
        },
        hash: '', // Would generate SHA-256 hash in production
        verified: false
      }
    })

    // Send welcome email (placeholder - implement your email service)
    // await sendEmail({
    //   to: email,
    //   subject: 'Welcome to ItWhip - Application Received',
    //   template: 'host-application-received',
    //   data: { name }
    // })

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        hostId: newHost.id,
        email: newHost.email,
        status: 'PENDING',
        nextSteps: 'Your application will be reviewed within 24-48 hours'
      }
    })

  } catch (error) {
    console.error('Host signup error:', error)
    
    // Check for specific Prisma errors
    if (error instanceof Error) {
      if (error.message.includes('Unique constraint')) {
        return NextResponse.json(
          { error: 'Email already registered' },
          { status: 409 }
        )
      }
    }
    
    return NextResponse.json(
      { error: 'Failed to process application. Please try again.' },
      { status: 500 }
    )
  }
}

// GET endpoint to check if email is available
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const email = searchParams.get('email')
    
    if (!email) {
      return NextResponse.json(
        { error: 'Email parameter required' },
        { status: 400 }
      )
    }
    
    const existingHost = await prisma.rentalHost.findUnique({
      where: { email },
      select: { id: true }
    })
    
    return NextResponse.json({
      available: !existingHost,
      email
    })
    
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    )
  }
}