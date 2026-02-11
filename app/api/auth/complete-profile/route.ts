// app/api/auth/complete-profile/route.ts
// API endpoint to save phone number after OAuth signup
// For NEW users (pending OAuth): Creates User + Account + ReviewerProfile in transaction
// For EXISTING users: Just updates phone number

import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/app/lib/auth/next-auth-config'
import { prisma } from '@/app/lib/database/prisma'
import { Prisma } from '@prisma/client'
import { sign } from 'jsonwebtoken'
import { nanoid } from 'nanoid'
import crypto from 'crypto'
import { sendOAuthWelcomeEmail } from '@/app/lib/email/oauth-welcome-sender'
import { sendHostOAuthWelcomeEmail } from '@/app/lib/email/host-oauth-welcome-sender'
import { getVehicleSpecData } from '@/app/lib/utils/vehicleSpec'

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

// JWT secrets (same as oauth-redirect)
const JWT_SECRET = process.env.JWT_SECRET!
const JWT_REFRESH_SECRET = process.env.JWT_REFRESH_SECRET!

// Helper to generate HOST JWT tokens (for rental hosts)
function generateHostTokens(host: {
  id: string
  userId: string
  email: string
  name: string
  approvalStatus: string
}) {
  const accessToken = sign(
    {
      userId: host.userId,
      hostId: host.id,
      email: host.email,
      name: host.name,
      role: 'BUSINESS',
      isRentalHost: true,
      approvalStatus: host.approvalStatus
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = sign(
    {
      userId: host.userId,
      hostId: host.id,
      email: host.email,
      type: 'refresh'
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

// Helper to generate GUEST JWT tokens (for regular users)
function generateGuestTokens(user: {
  id: string
  email: string
  name: string | null
  role: string
}) {
  const tokenId = nanoid()
  const refreshTokenId = nanoid()

  const accessToken = sign(
    {
      userId: user.id,
      email: user.email,
      name: user.name,
      role: user.role,
      jti: tokenId
    },
    JWT_SECRET,
    { expiresIn: '15m' }
  )

  const refreshToken = sign(
    {
      userId: user.id,
      jti: refreshTokenId
    },
    JWT_REFRESH_SECRET,
    { expiresIn: '7d' }
  )

  return { accessToken, refreshToken }
}

export async function POST(request: NextRequest) {
  try {
    // Get the authenticated session
    const session = await getServerSession(authOptions)

    if (!session?.user?.email) {
      return NextResponse.json(
        { error: 'Not authenticated' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const { phone, roleHint, carData, hostRole, vehiclePhotoUrls } = body

    // Phone is optional - only validate format if provided
    let digitsOnly = ''
    if (phone && phone.trim() !== '') {
      digitsOnly = phone.replace(/\D/g, '')
      if (digitsOnly.length !== 10) {
        return NextResponse.json(
          { error: 'Invalid phone number format' },
          { status: 400 }
        )
      }
    }

    // Validate car data for hosts who own cars (not manage-only fleet managers)
    if (roleHint === 'host' && hostRole !== 'manage') {
      // Only require car data for hosts who own cars ('own' or 'both')
      if (!carData) {
        return NextResponse.json(
          { error: 'Vehicle information is required for hosts who own cars' },
          { status: 400 }
        )
      }

      const { make, model, year, color, city, state, zipCode } = carData

      if (!make || !model || !year || !color) {
        return NextResponse.json(
          { error: 'Vehicle make, model, year, and color are required' },
          { status: 400 }
        )
      }

      if (!city || !state || !zipCode) {
        return NextResponse.json(
          { error: 'Vehicle location (city, state, zip code) is required' },
          { status: 400 }
        )
      }

      if (!/^\d{5}$/.test(zipCode)) {
        return NextResponse.json(
          { error: 'Invalid zip code format. Must be 5 digits.' },
          { status: 400 }
        )
      }

      const yearNum = parseInt(year)
      const currentYear = new Date().getFullYear()
      if (yearNum < 1990 || yearNum > currentYear + 1) {
        return NextResponse.json(
          { error: `Invalid vehicle year. Must be between 1990 and ${currentYear + 1}.` },
          { status: 400 }
        )
      }
    }

    const pendingOAuth = (session.user as any).pendingOAuth
    const isProfileComplete = (session.user as any).isProfileComplete

    // ========================================================================
    // PENDING OAUTH USER - Create new user with phone
    // ========================================================================
    if (pendingOAuth && !isProfileComplete) {
      console.log(`[Complete Profile] Creating new user from pending OAuth: ${pendingOAuth.email}`)

      // Check if user already exists with this email (edge case - might have been created elsewhere)
      const existingUser = await prisma.user.findUnique({
        where: { email: pendingOAuth.email }
      })

      if (existingUser) {
        console.log(`[Complete Profile] User already exists - updating phone and linking account`)

        // Update existing user's phone
        const updatedUser = await prisma.user.update({
          where: { id: existingUser.id },
          data: {
            phone: digitsOnly || null,
            phoneVerified: false,
            image: pendingOAuth.image || existingUser.image,
            name: pendingOAuth.name || existingUser.name
          }
        })

        // Check if OAuth account link exists
        const existingAccount = await prisma.account.findUnique({
          where: {
            provider_providerAccountId: {
              provider: pendingOAuth.provider,
              providerAccountId: pendingOAuth.providerAccountId
            }
          }
        })

        if (!existingAccount) {
          // Create account link
          await prisma.account.create({
            data: {
              id: crypto.randomUUID(),
              userId: existingUser.id,
              type: 'oauth',
              provider: pendingOAuth.provider,
              providerAccountId: pendingOAuth.providerAccountId,
              access_token: pendingOAuth.access_token,
              refresh_token: pendingOAuth.refresh_token,
              expires_at: pendingOAuth.expires_at,
              token_type: pendingOAuth.token_type,
              scope: pendingOAuth.scope,
              id_token: pendingOAuth.id_token
            }
          })
          console.log(`[Complete Profile] Created OAuth account link for existing user`)
        }

        // Generate tokens and return response with cookies
        return await createSuccessResponse(updatedUser, digitsOnly)
      }

      // Create NEW user with phone - USE TRANSACTION
      console.log(`[Complete Profile] Creating new user in transaction`)

      let newUser
      try {
        newUser = await prisma.$transaction(async (tx: Prisma.TransactionClient) => {
        // 1. Create User
        const user = await tx.user.create({
          data: {
            id: crypto.randomUUID(),
            email: pendingOAuth.email,
            name: pendingOAuth.name,
            image: pendingOAuth.image,
            phone: digitsOnly || null,
            phoneVerified: false,
            emailVerified: true, // OAuth email is verified
            role: 'CLAIMED',
            updatedAt: new Date()
          }
        })
        console.log(`[Complete Profile] Created User: ${user.id}`)

        // 2. Create Account (OAuth link)
        await tx.account.create({
          data: {
            id: crypto.randomUUID(),
            userId: user.id,
            type: 'oauth',
            provider: pendingOAuth.provider,
            providerAccountId: pendingOAuth.providerAccountId,
            access_token: pendingOAuth.access_token,
            refresh_token: pendingOAuth.refresh_token,
            expires_at: pendingOAuth.expires_at,
            token_type: pendingOAuth.token_type,
            scope: pendingOAuth.scope,
            id_token: pendingOAuth.id_token
          }
        })
        console.log(`[Complete Profile] Created Account link`)

        // 3. Create profile based on roleHint
        if (roleHint === 'host') {
          // Create RentalHost for host signup
          // Note: Host will still need approval, this just creates the profile
          // For manage-only hosts, they don't have car data so we use empty location
          const isManageOnly = hostRole === 'manage'

          const host = await tx.rentalHost.create({
            data: {
              id: crypto.randomUUID(),
              userId: user.id,
              email: pendingOAuth.email,
              name: pendingOAuth.name || '',
              phone: digitsOnly || '',
              profilePhoto: pendingOAuth.image,

              // Location from car data (empty for manage-only fleet managers)
              city: isManageOnly ? '' : carData!.city,
              state: isManageOnly ? '' : carData!.state,
              zipCode: isManageOnly ? '' : carData!.zipCode,

              // Status
              approvalStatus: 'PENDING',
              isVerified: true, // OAuth email is verified
              active: false,
              dashboardAccess: false,

              // Permissions (all false initially)
              canViewBookings: false,
              canEditCalendar: false,
              canSetPricing: false,
              canMessageGuests: false,
              canWithdrawFunds: false,

              // Default commission
              commissionRate: 0.20,
              hostType: 'REAL',

              // Host role fields from signup selection
              isHostManager: hostRole === 'manage' || hostRole === 'both',
              managesOwnCars: hostRole === 'own' || hostRole === 'both',
              managesOthersCars: hostRole === 'manage' || hostRole === 'both',

              updatedAt: new Date()
            }
          })
          console.log(`[Complete Profile] Created RentalHost profile (pending approval) - isManageOnly: ${isManageOnly}`)

          // 4. Create Car - ONLY for hosts who own cars (not manage-only fleet managers)
          if (!isManageOnly && carData) {
            const txSpecs = getVehicleSpecData(carData.make, carData.model, carData.year)
            const newCar = await tx.rentalCar.create({
              data: {
                id: crypto.randomUUID(),
                hostId: host.id,

                // Vehicle info from form
                make: carData.make,
                model: carData.model,
                year: parseInt(carData.year),
                trim: carData.trim || null,
                color: carData.color,

                // Location (matches host)
                city: carData.city,
                state: carData.state,
                zipCode: carData.zipCode,
                address: carData.address || '',

                // Status - NOT ACTIVE until fully completed
                isActive: false,

                // VIN-decoded specs (with sensible defaults)
                carType: mapBodyClassToCarType(carData.bodyClass) || txSpecs?.carType || 'midsize',
                seats: txSpecs?.seats || 5,
                doors: carData.doors ? parseInt(carData.doors) : (txSpecs?.doors || 4),
                transmission: normalizeTransmission(carData.transmission) || 'automatic',
                fuelType: carData.fuelType || txSpecs?.fuelType || 'gas',
                driveType: carData.driveType || undefined,

                // Pricing - must be set before activation
                dailyRate: 0,
                weeklyRate: 0,
                monthlyRate: 0,
                weeklyDiscount: 15,
                monthlyDiscount: 30,
                deliveryFee: 35,

                // Delivery options
                airportPickup: true,
                hotelDelivery: true,
                homeDelivery: false,

                // Availability
                instantBook: false,
                advanceNotice: 24,
                minTripDuration: 1,
                maxTripDuration: 30,

                // Insurance
                insuranceIncluded: false,
                insuranceDaily: 25,

                // Stats
                totalTrips: 0,
                rating: 0,

                // JSON fields
                features: '[]',
                rules: '[]',

                // Required fields (VIN and address may be provided at signup)
                vin: carData.vin || null,
                licensePlate: null,
                description: null,
                currentMileage: null,
                registeredOwner: null,
                registrationState: carData.state,
                registrationExpiryDate: null,
                titleStatus: 'Clean',
                garageAddress: null,

                updatedAt: new Date()
              } as any
            })
            console.log(`[Complete Profile] Created RentalCar for host: ${newCar.id}`)

            // 5. Create vehicle photos if provided
            if (vehiclePhotoUrls && Array.isArray(vehiclePhotoUrls) && vehiclePhotoUrls.length > 0) {
              await tx.rentalCarPhoto.createMany({
                data: vehiclePhotoUrls.map((url: string, index: number) => ({
                  id: crypto.randomUUID(),
                  carId: newCar.id,
                  url: url,
                  isHero: index === 0, // First photo is the hero/main photo
                  order: index,
                  uploadedBy: host.id,
                  uploadedByType: 'HOST' as const,
                  photoContext: 'LISTING' as const
                }))
              })
              console.log(`[Complete Profile] Created ${vehiclePhotoUrls.length} photos for car`)
            }
          } else if (isManageOnly) {
            console.log(`[Complete Profile] Skipping RentalCar creation for manage-only fleet manager`)
          }
        } else if (roleHint === 'guest') {
          // SECURITY: Block guest profile creation for existing HOST users
          const existingHost = await tx.rentalHost.findFirst({
            where: { email: pendingOAuth.email }
          })

          if (existingHost) {
            console.log(`[Complete Profile] ⚠️ BLOCKED: Existing HOST user tried to create guest profile`)
            throw new Error('HOST_EXISTS')
          }

          // Create ReviewerProfile ONLY for explicit guest signup
          // ⚠️ CRITICAL: No auto-creation - must explicitly specify roleHint='guest'
          const reviewerProfile = await tx.reviewerProfile.create({
            data: {
              id: crypto.randomUUID(),
              userId: user.id,
              email: pendingOAuth.email,
              name: pendingOAuth.name || '',
              phoneNumber: digitsOnly || null,
              profilePhotoUrl: pendingOAuth.image,
              memberSince: new Date(),
              city: '',
              state: 'AZ',
              zipCode: '',
              emailVerified: true,
              updatedAt: new Date()
            }
          })
          console.log(`[Complete Profile] Created ReviewerProfile for GUEST`)

          // Create AdminNotification for Fleet/Admin visibility (OAuth signup)
          await tx.adminNotification.create({
            data: {
              id: crypto.randomUUID(),
              type: 'NEW_GUEST_SIGNUP',
              title: 'New Guest Registered (OAuth)',
              message: `${pendingOAuth.name || pendingOAuth.email} signed up via ${pendingOAuth.provider}`,
              priority: 'LOW',
              status: 'UNREAD',
              actionRequired: false,
              actionUrl: `/fleet/guests/${reviewerProfile.id}`,
              relatedId: reviewerProfile.id,
              relatedType: 'REVIEWER_PROFILE',
              metadata: {
                guestEmail: pendingOAuth.email,
                guestName: pendingOAuth.name || null,
                guestPhone: digitsOnly || null,
                signupSource: pendingOAuth.provider,
                oauthVerified: true
              },
              updatedAt: new Date()
            }
          })
          console.log(`[Complete Profile] AdminNotification created for OAuth guest: ${reviewerProfile.id}`)
        } else {
          console.log(`[Complete Profile] ⚠️ No profile created - roleHint: ${roleHint || 'NOT PROVIDED'}`)
          console.log(`[Complete Profile] User must complete proper guest/host signup flow`)
        }

        return user
      })

      console.log(`[Complete Profile] Transaction complete - new user created: ${newUser.id}`)

      // Send role-specific welcome email
      if (newUser.email) {
        const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'
        try {
          if (roleHint === 'host') {
            // Send host OAuth welcome email with verification checklist
            await sendHostOAuthWelcomeEmail(newUser.email, {
              userName: newUser.name || 'Host',
              userEmail: newUser.email,
              profileUrl: `${appUrl}/host/profile?tab=profile`,
              documentsUrl: `${appUrl}/host/profile?tab=documents`,
              carsUrl: `${appUrl}/host/cars`,
              earningsUrl: `${appUrl}/host/earnings`,
              insuranceUrl: `${appUrl}/host/profile?tab=insurance`,
              dashboardUrl: `${appUrl}/host/dashboard`
            })
            console.log(`[Complete Profile] Sent host OAuth welcome email to: ${newUser.email}`)
          } else {
            // Send guest OAuth welcome email
            await sendOAuthWelcomeEmail(newUser.email, {
              userName: newUser.name || 'Guest',
              userEmail: newUser.email,
              documentsUrl: `${appUrl}/profile?tab=documents`,
              insuranceUrl: `${appUrl}/profile?tab=insurance`,
              dashboardUrl: `${appUrl}/dashboard`
            })
            console.log(`[Complete Profile] Sent guest OAuth welcome email to: ${newUser.email}`)
          }
        } catch (emailError) {
          // Don't fail the signup if email fails - just log it
          console.error(`[Complete Profile] Failed to send welcome email:`, emailError)
        }
      }

      // Generate tokens and return response with cookies
      return await createSuccessResponse(newUser, digitsOnly, roleHint || 'guest')
      } catch (error: any) {
        // Handle HOST_EXISTS error specifically
        if (error.message === 'HOST_EXISTS') {
          return NextResponse.json({
            success: false,
            error: 'You already have a Host account. Use account linking to add guest capabilities.',
            requiresAccountLinking: true
          }, { status: 409 })
        }
        // Re-throw other errors
        throw error
      }
    }

    // ========================================================================
    // EXISTING USER - Just update phone number
    // NOTE: This does NOT create profiles automatically. Users must use the
    // account linking flow to become dual-role (HOST + GUEST).
    // ========================================================================
    const userId = (session.user as any).id
    const email = session.user.email

    console.log(`[Complete Profile] Updating phone for existing user: ${userId}, phone: ${digitsOnly || 'none'}`)

    // Update user's phone number
    const updatedUser = await prisma.user.update({
      where: { id: userId },
      data: {
        phone: digitsOnly || null,
        phoneVerified: false
      }
    })
    console.log(`[Complete Profile] User.update result:`, {
      id: updatedUser.id,
      phone: updatedUser.phone,
      phoneVerified: updatedUser.phoneVerified
    })

    // ========================================================================
    // HOST UPGRADE CHECK - Must come FIRST before generic profile handling
    // This allows existing guests (with ReviewerProfile) to also become hosts
    // Supports both hosts with cars AND manage-only fleet managers
    // ========================================================================
    if (roleHint === 'host') {
      console.log(`[Complete Profile] Host upgrade check for existing user: ${userId}, hostRole: ${hostRole}`)

      // Check if user already has host profile
      const existingHost = await prisma.rentalHost.findFirst({
        where: {
          OR: [
            { userId: userId },
            { email: email }
          ]
        }
      })

      if (existingHost) {
        // Already a host, just return success with host tokens
        console.log(`[Complete Profile] User already has host profile - returning success`)
        return await createSuccessResponse(updatedUser, digitsOnly, 'host')
      }

      // Create RentalHost for existing user (guest-to-host upgrade)
      console.log(`[Complete Profile] Guest-to-Host upgrade for existing user: ${userId}`)
      const isManageOnly = hostRole === 'manage'

      const host = await prisma.rentalHost.create({
        data: {
          id: crypto.randomUUID(),
          userId: userId,
          email: email || '',
          name: updatedUser.name || '',
          phone: digitsOnly || '',
          profilePhoto: updatedUser.image,

          // Location from car data (empty for manage-only fleet managers)
          city: isManageOnly ? '' : (carData?.city || ''),
          state: isManageOnly ? '' : (carData?.state || ''),
          zipCode: isManageOnly ? '' : (carData?.zipCode || ''),

          // Status
          approvalStatus: 'PENDING',
          isVerified: true, // OAuth email is verified
          active: false,
          dashboardAccess: false,

          // Permissions (all false initially)
          canViewBookings: false,
          canEditCalendar: false,
          canSetPricing: false,
          canMessageGuests: false,
          canWithdrawFunds: false,

          // Default commission
          commissionRate: 0.20,
          hostType: 'REAL',

          // Host role fields from signup selection
          isHostManager: hostRole === 'manage' || hostRole === 'both',
          managesOwnCars: hostRole === 'own' || hostRole === 'both',
          managesOthersCars: hostRole === 'manage' || hostRole === 'both',

          updatedAt: new Date()
        }
      })
      console.log(`[Complete Profile] Created RentalHost for guest upgrade: ${host.id} - isManageOnly: ${isManageOnly}`)

      // Create RentalCar - ONLY for hosts who own cars (not manage-only fleet managers)
      if (!isManageOnly && carData) {
        const specs = getVehicleSpecData(carData.make, carData.model, carData.year)
        const newCar = await prisma.rentalCar.create({
          data: {
            hostId: host.id,

            // Vehicle info from form
            make: carData.make,
            model: carData.model,
            year: parseInt(carData.year),
            trim: carData.trim || null,
            color: carData.color,

            // Location (matches host)
            city: carData.city,
            state: carData.state,
            zipCode: carData.zipCode,
            address: carData.address || '',

            // Status - NOT ACTIVE until fully completed
            isActive: false,

            // VIN-decoded specs (with sensible defaults)
            carType: mapBodyClassToCarType(carData.bodyClass) || specs?.carType || 'midsize',
            seats: specs?.seats || 5,
            doors: carData.doors ? parseInt(carData.doors) : (specs?.doors || 4),
            transmission: normalizeTransmission(carData.transmission) || 'automatic',
            fuelType: carData.fuelType || specs?.fuelType || 'gas',
            driveType: carData.driveType || undefined,

            // Pricing - must be set before activation
            dailyRate: 0,
            weeklyRate: 0,
            monthlyRate: 0,
            weeklyDiscount: 15,
            monthlyDiscount: 30,
            deliveryFee: 35,

            // Delivery options
            airportPickup: true,
            hotelDelivery: true,
            homeDelivery: false,

            // Availability
            instantBook: false,
            advanceNotice: 24,
            minTripDuration: 1,
            maxTripDuration: 30,

            // Insurance
            insuranceIncluded: false,
            insuranceDaily: 25,

            // Stats
            totalTrips: 0,
            rating: 0,

            // JSON fields
            features: '[]',
            rules: '[]',

            // Required fields
            vin: carData.vin || null,
            licensePlate: null,
            description: null,
            currentMileage: null,
            registeredOwner: null,
            registrationState: carData.state,
            registrationExpiryDate: null,
            titleStatus: 'Clean',
            garageAddress: null
          } as any
        })
        console.log(`[Complete Profile] Created RentalCar for guest upgrade: ${newCar.id}`)

        // Create vehicle photos if provided
        if (vehiclePhotoUrls && Array.isArray(vehiclePhotoUrls) && vehiclePhotoUrls.length > 0) {
          await prisma.rentalCarPhoto.createMany({
            data: vehiclePhotoUrls.map((url: string, index: number) => ({
              id: crypto.randomUUID(),
              carId: newCar.id,
              url: url,
              isHero: index === 0,
              order: index,
              uploadedBy: host.id,
              uploadedByType: 'HOST',
              photoContext: 'LISTING'
            })) as any
          })
          console.log(`[Complete Profile] Created ${vehiclePhotoUrls.length} photos for car`)
        }
      } else if (isManageOnly) {
        console.log(`[Complete Profile] Skipping RentalCar creation for manage-only fleet manager upgrade`)
      }

      // Create AdminNotification for Fleet visibility
      await prisma.adminNotification.create({
        data: {
          id: crypto.randomUUID(),
          type: 'NEW_HOST_SIGNUP',
          title: 'Guest Upgraded to Host (OAuth)',
          message: `${updatedUser.name || email} upgraded from guest to host`,
          priority: 'MEDIUM',
          status: 'UNREAD',
          actionRequired: true,
          actionUrl: `/fleet/hosts/${host.id}`,
          relatedId: host.id,
          relatedType: 'RENTAL_HOST',
          metadata: {
            hostEmail: email,
            hostName: updatedUser.name || null,
            hostPhone: digitsOnly || null,
            signupSource: 'oauth-guest-upgrade',
            wasGuestFirst: true
          },
          updatedAt: new Date()
        } as any
      })
      console.log(`[Complete Profile] AdminNotification created for guest-to-host upgrade`)

      // Send host welcome email
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'
      try {
        await sendHostOAuthWelcomeEmail(email || '', {
          userName: updatedUser.name || 'Host',
          userEmail: email || '',
          profileUrl: `${appUrl}/host/profile?tab=profile`,
          documentsUrl: `${appUrl}/host/profile?tab=documents`,
          carsUrl: `${appUrl}/host/cars`,
          earningsUrl: `${appUrl}/host/earnings`,
          insuranceUrl: `${appUrl}/host/profile?tab=insurance`,
          dashboardUrl: `${appUrl}/host/dashboard`
        })
        console.log(`[Complete Profile] Sent host OAuth welcome email to: ${email}`)
      } catch (emailError) {
        console.error(`[Complete Profile] Failed to send welcome email:`, emailError)
      }

      // Generate host tokens and return response with cookies
      const tokens = generateHostTokens({
        id: host.id,
        userId: userId,
        email: email || '',
        name: updatedUser.name || '',
        approvalStatus: host.approvalStatus
      })

      const response = NextResponse.json({
        success: true,
        message: 'Host profile created successfully',
        isNewHost: true,
        approvalStatus: host.approvalStatus
      })

      // Set host cookies
      response.cookies.set('hostAccessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,
        path: '/'
      })

      response.cookies.set('hostRefreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
      })

      // Also set standard tokens for dual-role access
      response.cookies.set('accessToken', tokens.accessToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 15 * 60,
        path: '/'
      })

      response.cookies.set('refreshToken', tokens.refreshToken, {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'lax',
        maxAge: 7 * 24 * 60 * 60,
        path: '/'
      })

      console.log(`[Complete Profile] Guest-to-Host upgrade complete - host tokens set`)
      return response
    }

    // ========================================================================
    // GUEST PROFILE HANDLING (after host upgrade check)
    // ========================================================================

    // Check if ReviewerProfile exists
    let existingProfile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          { userId: userId },
          { email: email }
        ]
      }
    })

    if (existingProfile) {
      // Update existing profile
      await prisma.reviewerProfile.update({
        where: { id: existingProfile.id },
        data: { phoneNumber: digitsOnly || null }
      })
      console.log(`[Complete Profile] ReviewerProfile.update result: ${existingProfile.id}`)
    } else if (roleHint === 'guest') {
      // Check if user is a HOST - they must use Account Linking, not auto-create
      const existingHost = await prisma.rentalHost.findFirst({
        where: {
          OR: [
            { userId: userId },
            { email: email }
          ]
        }
      })

      if (existingHost) {
        console.log(`[Complete Profile] ⚠️ BLOCKED: Existing HOST tried to create guest profile - must use Account Linking`)
        return NextResponse.json({
          success: false,
          error: 'You already have a Host account. Please use Account Linking to add guest capabilities, or go to your Host Dashboard.',
          requiresAccountLinking: true,
          isHost: true,
          hostDashboardUrl: '/host/dashboard'
        }, { status: 409 })
      }

      // CREATE ReviewerProfile for existing user who wants guest access (non-hosts only)
      console.log(`[Complete Profile] Creating ReviewerProfile for existing user with roleHint=guest`)

      const newProfile = await prisma.reviewerProfile.create({
        data: {
          id: crypto.randomUUID(),
          userId: userId,
          email: email || '',
          name: updatedUser.name || '',
          phoneNumber: digitsOnly || null,
          memberSince: new Date(),
          city: '',
          state: 'AZ',
          emailVerified: true, // OAuth is verified
          documentsVerified: false,
          insuranceVerified: false,
          fullyVerified: false,
          canInstantBook: false,
          totalTrips: 0,
          averageRating: 0,
          updatedAt: new Date()
        } as any
      })
      console.log(`[Complete Profile] Created ReviewerProfile: ${newProfile.id}`)

      // Create AdminNotification for Fleet visibility
      await prisma.adminNotification.create({
        data: {
          id: crypto.randomUUID(),
          type: 'NEW_GUEST_SIGNUP',
          title: 'Existing User Added Guest Profile',
          message: `${updatedUser.name || email} created a guest profile`,
          priority: 'LOW',
          status: 'UNREAD',
          actionRequired: false,
          actionUrl: `/fleet/guests/${newProfile.id}`,
          relatedId: newProfile.id,
          relatedType: 'REVIEWER_PROFILE',
          metadata: {
            guestEmail: email,
            guestName: updatedUser.name || null,
            guestPhone: digitsOnly || null,
            signupSource: 'oauth-existing-user',
            wasExistingUser: true
          },
          updatedAt: new Date()
        } as any
      })
      console.log(`[Complete Profile] AdminNotification created for guest profile`)

      // Send welcome email
      const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'https://itwhip.com'
      try {
        await sendOAuthWelcomeEmail(email || '', {
          userName: updatedUser.name || 'Guest',
          userEmail: email || '',
          documentsUrl: `${appUrl}/profile?tab=documents`,
          insuranceUrl: `${appUrl}/profile?tab=insurance`,
          dashboardUrl: `${appUrl}/dashboard`
        })
        console.log(`[Complete Profile] Welcome email sent to: ${email}`)
      } catch (emailError) {
        console.error(`[Complete Profile] Failed to send welcome email:`, emailError)
      }
    } else {
      console.log(`[Complete Profile] No ReviewerProfile and roleHint=${roleHint || 'none'} - not creating`)
    }

    // Also update RentalHost if exists (phone sync only - NO creation)
    try {
      const updatedHost = await prisma.rentalHost.updateMany({
        where: { userId: userId },
        data: {
          phone: digitsOnly || ''
        }
      })
      console.log(`[Complete Profile] RentalHost.updateMany result:`, {
        count: updatedHost.count
      })
    } catch (err) {
      // RentalHost might not exist, that's okay
      console.log(`[Complete Profile] No RentalHost to update (this is OK)`)
    }

    console.log(`[Complete Profile] Profile saved successfully for existing user ${email}${digitsOnly ? `, phone: ${digitsOnly}` : ''}`)

    // For existing users, just return success (they already have JWT cookies)
    return NextResponse.json({
      success: true,
      message: 'Phone number saved successfully'
    })

  } catch (error) {
    console.error('[Complete Profile] Error:', error)
    return NextResponse.json(
      { error: 'Failed to complete profile' },
      { status: 500 }
    )
  }
}

// Helper function to create response with JWT cookies for new users
async function createSuccessResponse(user: any, phone: string, roleHint: string = 'guest') {
  let tokens: { accessToken: string; refreshToken: string }
  let isHost = false

  // Generate role-specific tokens
  if (roleHint === 'host') {
    // Fetch the RentalHost profile to get hostId and approvalStatus
    const hostProfile = await prisma.rentalHost.findFirst({
      where: { userId: user.id },
      select: {
        id: true,
        approvalStatus: true
      }
    })

    if (hostProfile) {
      tokens = generateHostTokens({
        id: hostProfile.id,
        userId: user.id,
        email: user.email,
        name: user.name || '',
        approvalStatus: hostProfile.approvalStatus
      })
      isHost = true
      console.log(`[Complete Profile] Generated HOST tokens with approvalStatus: ${hostProfile.approvalStatus}`)
    } else {
      // Fallback to guest tokens if host profile not found
      tokens = generateGuestTokens({
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role || 'CLAIMED'
      })
      console.log(`[Complete Profile] Host profile not found, generated guest tokens`)
    }
  } else {
    // Generate guest tokens
    tokens = generateGuestTokens({
      id: user.id,
      email: user.email,
      name: user.name,
      role: user.role || 'CLAIMED'
    })
    console.log(`[Complete Profile] Generated GUEST tokens`)
  }

  // New OAuth users always require phone verification
  const response = NextResponse.json({
    success: true,
    message: 'Profile completed successfully',
    user: {
      id: user.id,
      email: user.email,
      name: user.name,
      phone: phone
    },
    isNewUser: true, // Flag for frontend to know this was a new user creation
    requiresPhoneVerification: false, // Phone verification removed - not part of login flow
    phone: phone // Phone number for redirect
  })

  // Set standard JWT cookies
  response.cookies.set('accessToken', tokens.accessToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 15 * 60, // 15 minutes
    path: '/'
  })

  response.cookies.set('refreshToken', tokens.refreshToken, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 7 * 24 * 60 * 60, // 7 days
    path: '/'
  })

  // ALSO set host-specific cookies if this is a host
  if (isHost) {
    response.cookies.set('hostAccessToken', tokens.accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 15 * 60, // 15 minutes
      path: '/'
    })

    response.cookies.set('hostRefreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60, // 7 days
      path: '/'
    })
    console.log(`[Complete Profile] Set both accessToken AND hostAccessToken cookies for host`)
  }

  console.log(`[Complete Profile] Generated JWT tokens for new user: ${user.id}`)

  return response
}
