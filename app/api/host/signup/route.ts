// app/api/host/signup/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { hash } from 'argon2'
import { getVehicleSpecData } from '@/app/lib/utils/vehicleSpec'
import { resolveIdentity, linkAllIdentifiers } from '@/app/lib/services/identityResolution'

// Helper to map NHTSA bodyClass to our carType
function mapBodyClassToCarType(bodyClass: string | null): string | null {
  if (!bodyClass) return null
  const bc = bodyClass.toLowerCase()
  if (bc.includes('sedan')) return 'sedan'
  if (bc.includes('coupe')) return 'coupe'
  if (bc.includes('convertible')) return 'convertible'
  if (bc.includes('hatchback')) return 'hatchback'
  if (bc.includes('wagon') || bc.includes('sport utility')) return 'suv'
  if (bc.includes('pickup') || bc.includes('truck')) return 'truck'
  if (bc.includes('van') || bc.includes('minivan')) return 'minivan'
  if (bc.includes('crossover')) return 'crossover'
  return null
}

// Helper to normalize NHTSA transmission values
function normalizeTransmission(transmission: string | null): string | null {
  if (!transmission) return null
  const t = transmission.toLowerCase()
  if (t.includes('automatic') || t.includes('auto')) return 'automatic'
  if (t.includes('manual')) return 'manual'
  if (t.includes('cvt')) return 'cvt'
  return 'automatic'  // Default to automatic if unclear
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const {
      name,
      email,
      password,
      phone,
      // Location info
      address,
      city,
      state,
      zipCode,
      // Vehicle info (basic)
      hasVehicle,
      vehicleVin,
      vehicleMake,
      vehicleModel,
      vehicleYear,
      vehicleTrim,
      vehicleColor,
      // VIN-decoded specs
      vehicleFuelType,
      vehicleDoors,
      vehicleBodyClass,
      vehicleTransmission,
      vehicleDriveType,
      // Vehicle photos
      vehiclePhotoUrls,
      // Terms
      agreeToTerms,
      // Host role flags
      isManageOnly,
      managesOwnCars,
      isHostManager,
      managesOthersCars,
      // OAuth
      isOAuthUser,
      oauthUserId
    } = body

    // Validation - essential fields (password not required for OAuth users)
    if (!name || !email) {
      return NextResponse.json(
        { error: 'Missing required fields: name and email are required' },
        { status: 400 }
      )
    }

    // Non-OAuth users require password and phone
    if (!isOAuthUser && (!password || !phone)) {
      return NextResponse.json(
        { error: 'Missing required fields: password and phone are required' },
        { status: 400 }
      )
    }

    // Validation - location fields only required for hosts with vehicles (not manage-only)
    if (!isManageOnly && (!city || !state || !zipCode)) {
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

    // Validate password length (only for non-OAuth users)
    if (!isOAuthUser && password && password.length < 8) {
      return NextResponse.json(
        { error: 'Password must be at least 8 characters' },
        { status: 400 }
      )
    }

    // Validate zip code format (only if provided - required for vehicle owners)
    if (zipCode && !/^\d{5}$/.test(zipCode)) {
      return NextResponse.json(
        { error: 'Please enter a valid 5-digit zip code' },
        { status: 400 }
      )
    }

    // ========================================================================
    // IDENTITY RESOLUTION - Check for suspensions and existing accounts
    // ========================================================================
    const resolution = await resolveIdentity({
      email: email.toLowerCase(),
      phone: phone || undefined,
      vin: vehicleVin || undefined
    })

    // Handle blocked (suspended) identifiers
    if (resolution.action === 'BLOCK_SUSPENDED') {
      console.log(`[Host Signup] BLOCKED: Suspended identifier detected for email: ${email}`)
      // SECURITY: Generic message - don't reveal which identifier triggered the block
      return NextResponse.json({
        error: 'Unable to create account',
        guard: {
          type: 'suspended-account',
          title: 'Unable to Create Account',
          message: 'Your account cannot be created at this time. Please contact support for assistance.',
          actions: {
            primary: { label: 'Contact Support', url: '/support' }
          }
        }
      }, { status: 403 })
    }

    // Handle conflict (multiple accounts matched different users)
    if (resolution.action === 'CONFLICT') {
      console.log(`[Host Signup] CONFLICT: Multiple accounts found for identifiers`)
      return NextResponse.json({
        error: 'Account conflict detected',
        guard: {
          type: 'identity-conflict',
          title: 'Account Issue Detected',
          message: resolution.message || 'There was an issue with your account. Please contact support.',
          actions: {
            primary: { label: 'Contact Support', url: '/support' }
          }
        }
      }, { status: 409 })
    }

    // Handle VIN already linked to another account (for non-OAuth users)
    if (resolution.action === 'LINK_TO_EXISTING' && resolution.matchedIdentifiers.includes('vin') && !isOAuthUser) {
      console.log(`[Host Signup] VIN already registered to another account`)
      return NextResponse.json({
        error: 'Vehicle already registered',
        guard: {
          type: 'vin-linked',
          title: 'Vehicle Already Registered',
          message: 'This vehicle (VIN) is already registered on ItWhip. If you recently purchased this vehicle, please contact support to transfer it to your account.',
          actions: {
            primary: { label: 'Contact Support', url: '/support' },
            secondary: { label: 'Use Different Vehicle', url: '/host/signup' }
          }
        }
      }, { status: 409 })
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

    // For OAuth users, we link to existing user
    // For non-OAuth users, user should not exist
    if (existingUser && !isOAuthUser) {
      return NextResponse.json(
        { error: 'Email already registered. Please login instead.' },
        { status: 409 }
      )
    }

    // Hash password (only for non-OAuth users)
    const passwordHash = !isOAuthUser && password ? await hash(password) : null

    // Create the host with PENDING status
    const newHost = await prisma.rentalHost.create({
      data: {
        name,
        email,
        phone: phone || '',

        // Location from form (required in schema - use placeholder for manage-only fleet managers)
        city: city || 'Not Set',
        state: state || 'N/A',
        zipCode: zipCode || null,

        // Host type and status
        hostType: 'REAL',
        approvalStatus: 'PENDING',
        dashboardAccess: false,

        // Host role flags
        managesOwnCars: managesOwnCars ?? true,
        isHostManager: isHostManager ?? false,
        managesOthersCars: managesOthersCars ?? false,

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
        // OAuth users have verified email already
        isVerified: isOAuthUser ? true : false,

        // Link to existing user (OAuth) or create new user
        ...(isOAuthUser && existingUser ? {
          user: {
            connect: { id: existingUser.id }
          }
        } : {
          user: {
            create: {
              email,
              name,
              phone: phone || null,
              passwordHash: passwordHash || '',
              role: 'CLAIMED',
              emailVerified: false,
              isActive: true
            }
          }
        })
      } as any,
      include: {
        user: true
      }
    }) as any

    // Variable to store created car ID
    let createdCarId: string | null = null

    // If vehicle info provided, CREATE ACTUAL CAR RECORD (not just activity log)
    // Handle hasVehicle as string "true" or boolean true
    const shouldCreateCar = (hasVehicle === true || hasVehicle === 'true') && vehicleMake && vehicleModel && vehicleYear

    if (shouldCreateCar) {
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
            
            // VIN-decoded specs (with sensible defaults)
            // Lookup seats from our vehicle specs database
            ...(() => {
              const specs = getVehicleSpecData(vehicleMake, vehicleModel, vehicleYear)
              return {
                carType: mapBodyClassToCarType(vehicleBodyClass) || specs?.carType || 'midsize',
                seats: specs?.seats || 5,
                doors: vehicleDoors ? parseInt(vehicleDoors) : (specs?.doors || 4),
                transmission: normalizeTransmission(vehicleTransmission) || 'automatic',
                fuelType: vehicleFuelType || specs?.fuelType || 'gas',
              }
            })(),
            driveType: vehicleDriveType || null,

            // Pricing defaults to 0 - MUST be set before going live
            dailyRate: 0,
            weeklyRate: 0,
            monthlyRate: 0,
            weeklyDiscount: 15,
            monthlyDiscount: 30,
            deliveryFee: 35,
            
            // Location - use host's signup location
            address: address || '',
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

            // Features and rules are stored as JSON strings
            features: '[]',
            rules: '[]',
            
            // VIN and license plate - VIN may be provided at signup
            vin: vehicleVin || null,
            licensePlate: null,
            
            // Description - MUST be added before going live
            description: null,
            
            // Mileage tracking
            currentMileage: null,
            
            // Registration fields - to be completed later
            registeredOwner: null,
            registrationState: state || null,
            registrationExpiryDate: null,
            titleStatus: 'Clean',
            garageAddress: null,
            garageCity: city || null,
            garageState: state || null,
            garageZip: zipCode || null,
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
          } as any
        })

        createdCarId = newCar.id

        // Create photo records if provided
        if (vehiclePhotoUrls && Array.isArray(vehiclePhotoUrls) && vehiclePhotoUrls.length > 0) {
          await prisma.rentalCarPhoto.createMany({
            data: vehiclePhotoUrls.map((url: string, index: number) => ({
              id: crypto.randomUUID(),
              carId: newCar.id,
              url,
              isHero: index === 0,
              order: index,
              uploadedBy: newHost.id,
              uploadedByType: 'HOST',
              photoContext: 'LISTING'
            }))
          })
        }

        // Log vehicle creation
        await (prisma.activityLog.create as any)({
          data: {
            action: 'SIGNUP_CAR_CREATED',
            entityType: 'CAR',
            entityId: newCar.id,
            hostId: newHost.id,
            category: 'VEHICLE',
            severity: 'INFO',
            metadata: {
              description: `Vehicle created during signup: ${vehicleYear} ${vehicleMake} ${vehicleModel}`,
              vehicleVin: vehicleVin || null,
              vehicleMake,
              vehicleModel,
              vehicleYear,
              vehicleTrim: vehicleTrim || null,
              vehicleColor: vehicleColor || null,
              photoCount: vehiclePhotoUrls?.length || 0,
              status: vehicleVin ? 'VIN_PROVIDED' : 'INCOMPLETE',
              note: vehicleVin
                ? 'Vehicle created during signup with VIN - needs pricing to complete listing'
                : 'Vehicle created during signup - needs VIN, pricing to complete listing'
            }
          }
        })

      } catch (carError) {
        // Log error but don't fail the signup
        console.error('Failed to create car during signup:', carError)

        // Still log the vehicle intent in activity log as fallback
        await (prisma.activityLog.create as any)({
          data: {
            action: 'SIGNUP_VEHICLE_INFO',
            entityType: 'HOST',
            entityId: newHost.id,
            metadata: {
              vehicleVin: vehicleVin || null,
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
    await (prisma.adminNotification.create as any)({
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
    await (prisma.auditLog.create as any)({
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
          vehicleInfo: hasVehicle ? { vin: vehicleVin || null, make: vehicleMake, model: vehicleModel, year: vehicleYear, trim: vehicleTrim, color: vehicleColor } : null,
          carCreated: !!createdCarId,
          carId: createdCarId
        },
        hash: '',
        verified: false
      }
    })

    // Link identifiers to the user for identity resolution
    if (newHost.user?.id) {
      try {
        await linkAllIdentifiers(newHost.user.id, {
          email: email.toLowerCase(),
          phone: phone || undefined,
          vin: vehicleVin || undefined
        })
        console.log(`[Host Signup] Identity links created for user: ${newHost.user.id}`)
      } catch (linkError) {
        console.error('[Host Signup] Failed to create identity links:', linkError)
        // Don't block signup if linking fails
      }
    }

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