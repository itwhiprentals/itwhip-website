// app/api/host/signup/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { hash } from 'argon2'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      email,
      password,
      phone,
      // Location info
      city,
      state,
      zipCode,
      // Vehicle info (basic)
      hasVehicle,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleTrim,
      vehicleColor,
      // Terms
      agreeToTerms
    } = body

    // Validation - essential fields
    if (!name || !email || !password || !phone) {
      return NextResponse.json(
        { error: 'Missing required fields: name, email, password, and phone are required' },
        { status: 400 }
      )
    }

    // Validation - location fields
    if (!city || !state || !zipCode) {
      return NextResponse.json(
        { error: 'Missing required fields: city, state, and zip code are required' },
        { status: 400 }
      )
    }

    if (!agreeToTerms) {
      return NextResponse.json(
        { error: 'You must agree to the Terms of Service' },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Please enter a valid email address' },
        { status: 400 }
      )
    }

    // Validate password length
    if (password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Validate zip code format
    if (!/^\d{5}$/.test(zipCode)) {
      return NextResponse.json(
        { error: 'Please enter a valid 5-digit zip code' },
        { status: 400 }
      )
    }

    // Check if email already exists in RentalHost
    const existingHost = await prisma.rentalHost.findUnique({
      where: { email }
    })

    if (existingHost) {
      // Check if they're unverified - offer to resend verification
      if (!existingHost.isVerified) {
        return NextResponse.json(
          { 
            error: 'Email already registered but not verified. Please check your email for verification code.',
            code: 'UNVERIFIED_EMAIL',
            hostId: existingHost.id
          },
          { status: 409 }
        )
      }
      return NextResponse.json(
        { error: 'Email already registered. Please login instead.' },
        { status: 409 }
      )
    }

    // Check if email exists in User table
    const existingUser = await prisma.user.findUnique({
      where: { email }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: 'Email already registered. Please login instead.' },
        { status: 409 }
      )
    }

    // Hash password
    const passwordHash = await hash(password)

    // Create the host with PENDING status
    const newHost = await prisma.rentalHost.create({
      data: {
        name,
        email,
        phone,
        
        // Location from form
        city,
        state,
        zipCode,
        
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
        
        // Default commission (will be set based on insurance tier later)
        commissionRate: 0.20,
        
        // Status - not active until verified and approved
        active: false,
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

    // Variable to store created car ID
    let createdCarId: string | null = null

    // If vehicle info provided, CREATE ACTUAL CAR RECORD (not just activity log)
    if (hasVehicle && vehicleMake && vehicleModel && vehicleYear) {
      try {
        const newCar = await prisma.rentalCar.create({
          data: {
            // Link to host
            hostId: newHost.id,
            
            // Basic vehicle info from signup
            make: vehicleMake,
            model: vehicleModel,
            year: parseInt(vehicleYear),
            trim: vehicleTrim || null,
            color: vehicleColor || 'Unknown',
            
            // Mark as INACTIVE - not ready for booking
            isActive: false,
            
            // Default values - host will complete these later
            carType: 'midsize',
            seats: 5,
            doors: 4,
            transmission: 'automatic',
            fuelType: 'gas',
            
            // Pricing defaults to 0 - MUST be set before going live
            dailyRate: 0,
            weeklyRate: 0,
            monthlyRate: 0,
            weeklyDiscount: 15,
            monthlyDiscount: 30,
            deliveryFee: 35,
            
            // Location - use host's signup location as default
            address: '',
            city: city,
            state: state,
            zipCode: zipCode,
            
            // Delivery options - defaults
            airportPickup: true,
            hotelDelivery: true,
            homeDelivery: false,
            
            // Availability settings
            instantBook: false,
            advanceNotice: 24,
            minTripDuration: 1,
            maxTripDuration: 30,
            
            // Insurance
            insuranceIncluded: false,
            insuranceDaily: 25,
            
            // Stats start at 0
            totalTrips: 0,
            rating: 0,
            
            // Empty arrays for features and rules
            features: [],
            rules: [],
            
            // VIN and license plate - MUST be added before going live
            vin: null,
            licensePlate: null,
            
            // Description - MUST be added before going live
            description: null,
            
            // Mileage tracking
            currentMileage: null,
            
            // Registration fields - to be completed later
            registeredOwner: null,
            registrationState: state,
            registrationExpiryDate: null,
            titleStatus: 'Clean',
            garageAddress: null,
            garageCity: city,
            garageState: state,
            garageZip: zipCode,
            estimatedValue: null,
            hasLien: false,
            lienholderName: null,
            lienholderAddress: null,
            hasAlarm: false,
            hasTracking: false,
            hasImmobilizer: false,
            isModified: false,
            modifications: null,
            annualMileage: 12000,
            primaryUse: 'Rental'
          }
        })

        createdCarId = newCar.id

        // Log vehicle creation
        await prisma.activityLog.create({
          data: {
            action: 'SIGNUP_CAR_CREATED',
            entityType: 'CAR',
            entityId: newCar.id,
            hostId: newHost.id,
            category: 'VEHICLE',
            severity: 'INFO',
            description: `Vehicle created during signup: ${vehicleYear} ${vehicleMake} ${vehicleModel}`,
            metadata: {
              vehicleMake,
              vehicleModel,
              vehicleYear,
              vehicleTrim: vehicleTrim || null,
              vehicleColor: vehicleColor || null,
              status: 'INCOMPLETE',
              note: 'Vehicle created during signup - needs photos, VIN, pricing to complete listing'
            }
          }
        })

      } catch (carError) {
        // Log error but don't fail the signup
        console.error('Failed to create car during signup:', carError)
        
        // Still log the vehicle intent in activity log as fallback
        await prisma.activityLog.create({
          data: {
            action: 'SIGNUP_VEHICLE_INFO',
            entityType: 'HOST',
            entityId: newHost.id,
            metadata: {
              vehicleMake,
              vehicleModel,
              vehicleYear,
              vehicleTrim: vehicleTrim || null,
              vehicleColor: vehicleColor || null,
              error: 'Failed to create car record - will need manual creation',
              note: 'Vehicle info provided during signup - car creation failed'
            }
          }
        })
      }
    }

    // Create admin notification for new host application
    await prisma.adminNotification.create({
      data: {
        type: 'HOST_APPLICATION',
        title: 'New Host Application',
        message: `${name} has submitted a host application${createdCarId ? ' with a vehicle' : ''}`,
        priority: 'HIGH',
        status: 'UNREAD',
        actionRequired: true,
        actionUrl: `/fleet/hosts/${newHost.id}/review`,
        relatedId: newHost.id,
        relatedType: 'RentalHost',
        metadata: {
          hostName: name,
          hostEmail: email,
          phone,
          city,
          state,
          zipCode,
          hasVehicle: hasVehicle || false,
          vehicleInfo: hasVehicle ? `${vehicleYear} ${vehicleMake} ${vehicleModel}` : null,
          carId: createdCarId
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
          location: { city, state, zipCode },
          hasVehicle: hasVehicle || false,
          vehicleInfo: hasVehicle ? { make: vehicleMake, model: vehicleModel, year: vehicleYear, trim: vehicleTrim, color: vehicleColor } : null,
          carCreated: !!createdCarId,
          carId: createdCarId
        },
        hash: '',
        verified: false
      }
    })

    // Return success response
    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      data: {
        hostId: newHost.id,
        email: newHost.email,
        status: 'PENDING',
        carId: createdCarId,
        hasVehicle: !!createdCarId,
        nextSteps: 'Please verify your email to continue'
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
      select: { id: true, isVerified: true }
    })
    
    return NextResponse.json({
      available: !existingHost,
      email,
      unverified: existingHost ? !existingHost.isVerified : false
    })
    
  } catch (error) {
    console.error('Email check error:', error)
    return NextResponse.json(
      { error: 'Failed to check email availability' },
      { status: 500 }
    )
  }
}