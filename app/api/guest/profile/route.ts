// app/api/guest/profile/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { verifyRequest } from '@/app/lib/auth/verify-request'

// ========== 🆕 ACTIVITY TRACKING IMPORT ==========
import { trackActivity } from '@/lib/helpers/guestProfileStatus'

// ========== DUAL-ROLE SYNC IMPORTS ==========
import { syncEmailAcrossProfiles, syncPhoneAcrossProfiles } from '@/app/lib/dual-role/sync-profile'
import { sendEmailChangeNotification, sendPhoneChangeNotification } from '@/app/lib/dual-role/notifications'

// GET: Fetch guest profile
export async function GET(request: NextRequest) {
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

    // Find ReviewerProfile
    const profile = await prisma.reviewerProfile.findFirst({
      where: {
        OR: [
          ...(userId ? [{ userId }] : []),
          ...(userEmail ? [{ email: userEmail }] : [])
        ]
      },
      include: {
        user: {
          select: {
            email: true,
            avatar: true,
            status: true,
            deletionScheduledFor: true
          }
        }
      }
    })

    // If no profile exists, return 404 - profile must be created through explicit signup
    if (!profile) {
      console.log(`[Guest Profile] No ReviewerProfile found for user ${userId}`)
      return NextResponse.json(
        {
          success: false,
          error: 'Guest profile not found. Please complete guest signup first.',
          requiresSignup: true
        },
        { status: 404 }
      )
    }

    let profileData = profile

    // Calculate stats
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        OR: [
          { renterId: userId || '' },
          { guestEmail: userEmail || '' }
        ]
      }
    })

    const completedBookings = bookings.filter((b: { status: string }) => b.status === 'COMPLETED').length
    const totalTrips = completedBookings

    // Calculate loyalty points (10 points per completed trip)
    const loyaltyPoints = completedBookings * 10

    // Calculate member tier
    let memberTier = 'Bronze'
    if (completedBookings >= 20) {
      memberTier = 'Platinum'
    } else if (completedBookings >= 10) {
      memberTier = 'Gold'
    } else if (completedBookings >= 5) {
      memberTier = 'Silver'
    }

    // Get reviews to calculate average rating
    const reviews = await prisma.rentalReview.findMany({
      where: {
        reviewerProfileId: profileData.id
      }
    })

    const averageRating = reviews.length > 0
      ? reviews.reduce((sum: number, r: { rating: number }) => sum + r.rating, 0) / reviews.length
      : 0

    // Check if fully verified - requires all verification steps complete
    // Stripe Identity verification counts as documents verified (ID + Selfie)
    const isStripeVerified = profileData.stripeIdentityStatus === 'verified'
    const fullyVerified = !!(
      profileData.emailVerified &&
      profileData.phoneVerified &&
      (profileData.documentsVerified || isStripeVerified)
    )

    // PENDING STATUS: TRUE if profile is incomplete (onboarding not finished)
    // Pending until: phone is verified AND (Stripe Identity verified OR manual docs uploaded)
    const hasPhone = !!(profileData.phoneNumber && profileData.phoneNumber.length >= 10)
    const hasDriversLicense = !!profileData.driversLicenseUrl
    const hasSelfie = !!profileData.selfieUrl
    const hasIdentityVerification = isStripeVerified || (hasDriversLicense && hasSelfie)
    const pending = !hasPhone || !hasIdentityVerification

    // Can instant book if fully verified
    const canInstantBook = fullyVerified

    // Prepare response
    const guestProfile = {
      id: profileData.id,
      email: profileData.email || user.email,
      name: profileData.name,
      phone: profileData.phoneNumber,  // Maps DB field phoneNumber -> API field phone
      profilePhoto: profileData.profilePhotoUrl,
      bio: profileData.bio,
      city: profileData.city,
      state: profileData.state,
      zipCode: profileData.zipCode,
      dateOfBirth: profileData.dateOfBirth,

      // Account Status (GDPR)
      status: profileData.user?.status || 'ACTIVE',
      deletionScheduledFor: profileData.user?.deletionScheduledFor || null,

      // Emergency Contact
      emergencyContactName: profileData.emergencyContactName,
      emergencyContactPhone: profileData.emergencyContactPhone,
      emergencyContactRelation: profileData.emergencyContactRelation,

      // Verification
      emailVerified: profileData.emailVerified,
      phoneVerified: profileData.phoneVerified,
      governmentIdUrl: profileData.governmentIdUrl,
      governmentIdType: profileData.governmentIdType,
      driversLicenseUrl: profileData.driversLicenseUrl,
      selfieUrl: profileData.selfieUrl,
      // documentsVerified is true if Stripe Identity verified OR manual docs verified
      documentsVerified: profileData.documentsVerified || isStripeVerified,
      documentVerifiedAt: profileData.documentVerifiedAt || profileData.stripeIdentityVerifiedAt,
      fullyVerified,
      canInstantBook,
      pending,  // TRUE if onboarding incomplete (missing phone OR missing identity verification)

      // Insurance - ✅ CORRECTED FIELD NAMES
      insuranceProvider: profileData.insuranceProvider,
      insurancePolicyNumber: profileData.policyNumber,
      insuranceExpires: profileData.expiryDate,
      insuranceCardUrl: profileData.insuranceCardFrontUrl || profileData.insuranceCardBackUrl,
      insuranceVerified: profileData.insuranceVerified,
      insuranceVerifiedAt: profileData.insuranceVerifiedAt,

      // Stats
      totalTrips,
      averageRating,
      loyaltyPoints,
      memberTier,
      memberSince: profileData.memberSince,

      // Financial Balances
      creditBalance: profileData.creditBalance || 0,
      bonusBalance: profileData.bonusBalance || 0,
      depositWalletBalance: profileData.depositWalletBalance || 0,

      // Preferences
      preferredLanguage: profileData.preferredLanguage,
      preferredCurrency: profileData.preferredCurrency,
      emailNotifications: profileData.emailNotifications,
      smsNotifications: profileData.smsNotifications,
      pushNotifications: profileData.pushNotifications,

      // Stripe Identity Verification
      stripeIdentityStatus: profileData.stripeIdentityStatus,
      stripeIdentityVerifiedAt: profileData.stripeIdentityVerifiedAt,

      // Driver License Info
      driverLicenseNumber: profileData.driverLicenseNumber,
      driverLicenseState: profileData.driverLicenseState,
      driverLicenseExpiry: profileData.driverLicenseExpiry
    }

    // 🔍 DEBUG LOGGING - Remove after testing
    console.log('=' .repeat(80))
    console.log('🔍 DEBUG: Guest Profile API Response')
    console.log('=' .repeat(80))
    console.log('📧 User Email:', user.email)
    console.log('🆔 User ID:', user.id)
    console.log('📧 Profile Email:', profileData.email)
    console.log('👤 Profile Name:', profileData.name)
    console.log('📱 DB phoneNumber field value:', profileData.phoneNumber)
    console.log('📱 DB phoneNumber type:', typeof profileData.phoneNumber)
    console.log('📱 DB phoneNumber is null?:', profileData.phoneNumber === null)
    console.log('📱 DB phoneNumber is undefined?:', profileData.phoneNumber === undefined)
    console.log('---')
    console.log('📱 Mapped "phone" in response:', guestProfile.phone)
    console.log('📱 Mapped phone type:', typeof guestProfile.phone)
    console.log('📱 Mapped phone === null?:', guestProfile.phone === null)
    console.log('📱 Mapped phone === undefined?:', guestProfile.phone === undefined)
    console.log('---')
    console.log('📦 Full guestProfile object:')
    console.log(JSON.stringify(guestProfile, null, 2))
    console.log('=' .repeat(80))

    return NextResponse.json({
      success: true,
      profile: guestProfile
    })

  } catch (error) {
    console.error('Error fetching guest profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch profile' },
      { status: 500 }
    )
  }
}

// PUT: Update guest profile
export async function PUT(request: NextRequest) {
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

    const body = await request.json()

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

    // ========== DUAL-ROLE EMAIL/PHONE SYNC ==========
    // Handle email change - sync across User + RentalHost + ReviewerProfile
    if (body.email && body.email !== profile.email) {
      const oldEmail = profile.email || ''
      const result = await syncEmailAcrossProfiles(userId, body.email, oldEmail)

      if (!result.success) {
        console.error('[Guest Profile] Email sync failed:', result.error)
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to sync email across profiles' },
          { status: 500 }
        )
      }

      // Send security notifications to both old and new email addresses
      try {
        await sendEmailChangeNotification(
          user.name || 'User',
          oldEmail,
          body.email,
          request.headers.get('user-agent') || 'Unknown device',
          request.headers.get('x-forwarded-for') || 'Unknown IP'
        )
      } catch (emailError) {
        console.error('[Guest Profile] Email notification failed:', emailError)
        // Continue - don't block profile update if email fails
      }
    }

    // Handle phone change - sync across User + RentalHost + ReviewerProfile
    if (body.phone && body.phone !== profile.phoneNumber) {
      const result = await syncPhoneAcrossProfiles(userId, body.phone)

      if (!result.success) {
        console.error('[Guest Profile] Phone sync failed:', result.error)
        return NextResponse.json(
          { success: false, error: result.error || 'Failed to sync phone across profiles' },
          { status: 500 }
        )
      }

      // Send notification
      try {
        await sendPhoneChangeNotification(
          user.name || 'User',
          user.email,
          profile.phoneNumber || 'None',
          body.phone
        )
      } catch (emailError) {
        console.error('[Guest Profile] Phone notification failed:', emailError)
        // Continue - don't block profile update if email fails
      }
    }
    // ========== END DUAL-ROLE SYNC ==========

    // ========== 🆕 TRACK WHAT CHANGED (BEFORE UPDATE) ==========
    const changedFields: string[] = []
    const changeDetails: Record<string, any> = {}

    // Check each field for changes
    if (body.name && body.name !== profile.name) {
      changedFields.push('name')
      changeDetails.name = { from: profile.name, to: body.name }
    }
    if (body.phone && body.phone !== profile.phoneNumber) {
      changedFields.push('phone')
      changeDetails.phone = { from: profile.phoneNumber, to: body.phone }
    }
    if (body.bio !== undefined && body.bio !== profile.bio) {
      changedFields.push('bio')
      changeDetails.bio = { changed: true }
    }
    if (body.city && body.city !== profile.city) {
      changedFields.push('city')
      changeDetails.city = { from: profile.city, to: body.city }
    }
    if (body.state && body.state !== profile.state) {
      changedFields.push('state')
      changeDetails.state = { from: profile.state, to: body.state }
    }
    if (body.zipCode !== undefined && body.zipCode !== profile.zipCode) {
      changedFields.push('zipCode')
      changeDetails.zipCode = { from: profile.zipCode, to: body.zipCode }
    }
    if (body.dateOfBirth && new Date(body.dateOfBirth).getTime() !== profile.dateOfBirth?.getTime()) {
      changedFields.push('dateOfBirth')
      changeDetails.dateOfBirth = { changed: true }
    }
    
    // Emergency Contact
    if (body.emergencyContactName !== undefined && body.emergencyContactName !== profile.emergencyContactName) {
      changedFields.push('emergencyContactName')
      changeDetails.emergencyContact = { updated: true }
    }
    if (body.emergencyContactPhone !== undefined && body.emergencyContactPhone !== profile.emergencyContactPhone) {
      changedFields.push('emergencyContactPhone')
      if (!changeDetails.emergencyContact) changeDetails.emergencyContact = { updated: true }
    }
    if (body.emergencyContactRelation !== undefined && body.emergencyContactRelation !== profile.emergencyContactRelation) {
      changedFields.push('emergencyContactRelation')
      if (!changeDetails.emergencyContact) changeDetails.emergencyContact = { updated: true }
    }

    // Preferences
    if (body.preferredLanguage && body.preferredLanguage !== profile.preferredLanguage) {
      changedFields.push('preferredLanguage')
      changeDetails.preferredLanguage = { from: profile.preferredLanguage, to: body.preferredLanguage }
    }
    if (body.preferredCurrency && body.preferredCurrency !== profile.preferredCurrency) {
      changedFields.push('preferredCurrency')
      changeDetails.preferredCurrency = { from: profile.preferredCurrency, to: body.preferredCurrency }
    }
    if (body.emailNotifications !== undefined && body.emailNotifications !== profile.emailNotifications) {
      changedFields.push('emailNotifications')
      changeDetails.notifications = { emailChanged: true }
    }
    if (body.smsNotifications !== undefined && body.smsNotifications !== profile.smsNotifications) {
      changedFields.push('smsNotifications')
      if (!changeDetails.notifications) changeDetails.notifications = {}
      changeDetails.notifications.smsChanged = true
    }
    if (body.pushNotifications !== undefined && body.pushNotifications !== profile.pushNotifications) {
      changedFields.push('pushNotifications')
      if (!changeDetails.notifications) changeDetails.notifications = {}
      changeDetails.notifications.pushChanged = true
    }

    // Driver License fields
    if (body.driverLicenseNumber !== undefined && body.driverLicenseNumber !== profile.driverLicenseNumber) {
      changedFields.push('driverLicenseNumber')
      changeDetails.driverLicense = { numberChanged: true }
    }
    if (body.driverLicenseState !== undefined && body.driverLicenseState !== profile.driverLicenseState) {
      changedFields.push('driverLicenseState')
      if (!changeDetails.driverLicense) changeDetails.driverLicense = {}
      changeDetails.driverLicense.stateChanged = true
    }
    if (body.driverLicenseExpiry && new Date(body.driverLicenseExpiry).getTime() !== profile.driverLicenseExpiry?.getTime()) {
      changedFields.push('driverLicenseExpiry')
      if (!changeDetails.driverLicense) changeDetails.driverLicense = {}
      changeDetails.driverLicense.expiryChanged = true
    }

    // Update profile
    const updatedProfile = await prisma.reviewerProfile.update({
      where: { id: profile.id },
      data: {
        ...(body.name && { name: body.name }),
        ...(body.phone && { phoneNumber: body.phone }),
        ...(body.bio !== undefined && { bio: body.bio }),
        ...(body.city && { city: body.city }),
        ...(body.state && { state: body.state }),
        ...(body.zipCode !== undefined && { zipCode: body.zipCode }),
        ...(body.dateOfBirth && { dateOfBirth: new Date(body.dateOfBirth) }),
        
        // Emergency Contact
        ...(body.emergencyContactName !== undefined && { emergencyContactName: body.emergencyContactName }),
        ...(body.emergencyContactPhone !== undefined && { emergencyContactPhone: body.emergencyContactPhone }),
        ...(body.emergencyContactRelation !== undefined && { emergencyContactRelation: body.emergencyContactRelation }),

        // Preferences
        ...(body.preferredLanguage && { preferredLanguage: body.preferredLanguage }),
        ...(body.preferredCurrency && { preferredCurrency: body.preferredCurrency }),
        ...(body.emailNotifications !== undefined && { emailNotifications: body.emailNotifications }),
        ...(body.smsNotifications !== undefined && { smsNotifications: body.smsNotifications }),
        ...(body.pushNotifications !== undefined && { pushNotifications: body.pushNotifications }),

        // Driver License Info
        ...(body.driverLicenseNumber !== undefined && { driverLicenseNumber: body.driverLicenseNumber }),
        ...(body.driverLicenseState !== undefined && { driverLicenseState: body.driverLicenseState }),
        ...(body.driverLicenseExpiry && { driverLicenseExpiry: new Date(body.driverLicenseExpiry) })
      }
    })

    // Also update User.name if changed
    if (userId && body.name && body.name !== user.name) {
      await prisma.user.update({
        where: { id: userId },
        data: { name: body.name }
      })
    }

    // ========== 🆕 TRACK PROFILE UPDATE ACTIVITY ==========
    // Only track if there were actual changes
    if (changedFields.length > 0) {
      try {
        // Build human-readable description
        let description = 'Profile updated'
        
        // Categorize changes
        const personalInfoFields = ['name', 'phone', 'bio', 'city', 'state', 'zipCode', 'dateOfBirth']
        const emergencyFields = ['emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation']
        const preferenceFields = ['preferredLanguage', 'preferredCurrency', 'emailNotifications', 'smsNotifications', 'pushNotifications']
        const driverLicenseFields = ['driverLicenseNumber', 'driverLicenseState', 'driverLicenseExpiry']

        const personalChanges = changedFields.filter(f => personalInfoFields.includes(f))
        const emergencyChanges = changedFields.filter(f => emergencyFields.includes(f))
        const preferenceChanges = changedFields.filter(f => preferenceFields.includes(f))
        const driverLicenseChanges = changedFields.filter(f => driverLicenseFields.includes(f))

        const categories = []
        if (personalChanges.length > 0) categories.push('personal information')
        if (emergencyChanges.length > 0) categories.push('emergency contact')
        if (preferenceChanges.length > 0) categories.push('preferences')
        if (driverLicenseChanges.length > 0) categories.push('driver license')
        
        if (categories.length > 0) {
          description = `Profile updated - ${categories.join(', ')}`
        }

        await trackActivity(profile.id, {
          action: 'PROFILE_UPDATED',
          description,
          metadata: {
            fieldsChanged: changedFields,
            changeCount: changedFields.length,
            changeDetails,
            categories: {
              personalInfo: personalChanges.length > 0,
              emergencyContact: emergencyChanges.length > 0,
              preferences: preferenceChanges.length > 0,
              driverLicense: driverLicenseChanges.length > 0
            },
            timestamp: new Date().toISOString()
          }
        })

        console.log('✅ Profile update tracked in guest timeline:', {
          guestId: profile.id,
          fieldsChanged: changedFields.length,
          categories
        })
      } catch (trackingError) {
        console.error('❌ Failed to track profile update activity:', trackingError)
        // Continue without breaking - tracking is non-critical
      }
    }
    // ========== END ACTIVITY TRACKING ==========

    // Return updated profile (call GET logic)
    const getResponse = await GET(request)
    return getResponse

  } catch (error) {
    console.error('Error updating guest profile:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to update profile' },
      { status: 500 }
    )
  }
}