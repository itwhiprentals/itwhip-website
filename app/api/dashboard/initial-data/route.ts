// app/api/dashboard/initial-data/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { verifyRequest } from '@/app/lib/auth/verify-request'
import { prisma } from '@/app/lib/database/prisma'

/**
 * Unified Dashboard API
 * Replaces 6 separate API calls with 1 optimized call
 * Returns all dashboard data in a single request
 * ✅ UPDATED: Now returns document URLs for verification alert
 */
export async function GET(request: NextRequest) {
  try {
    // ========== AUTHENTICATION (Once, not 6 times!) ==========
    const user = await verifyRequest(request)
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const userId = user.id
    const userEmail = user.email

    console.log('[DASHBOARD API] Fetching data for user:', userEmail)

    // ========== PARALLEL DATA FETCHING ==========
    // All 7 queries run AT THE SAME TIME (not sequential!)
    const [
      userProfile,
      reviewerProfile,
      bookingsRaw,
      bookingStats,
      appealNotifications,
      notificationDismissals,
      paymentMethods
    ] = await Promise.all([
      
      // Query 1: User Profile (Basic info)
      prisma.user.findUnique({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          name: true,
          avatar: true,
          phone: true,
          role: true,
          twoFactorEnabled: true,
          emailVerified: true,
          phoneVerified: true,
          isActive: true,
          lastActive: true,
          createdAt: true
        }
      }),

      // Query 2: Reviewer Profile (Guest details)
      prisma.reviewerProfile.findFirst({
        where: {
          OR: [
            { userId },
            { email: userEmail }
          ]
        },
        select: {
          id: true,
          name: true,
          email: true,
          profilePhotoUrl: true,
          phoneNumber: true,
          city: true,
          state: true,
          zipCode: true,
          bio: true,
          memberSince: true,
          emailVerified: true,
          phoneVerified: true,
          documentsVerified: true,
          driversLicenseUrl: true,    // ✅ KEEP - Required for verification alert
          selfieUrl: true,             // ✅ KEEP - Required for verification alert
          insuranceProvider: true,
          insuranceVerified: true,
          suspensionLevel: true,
          suspendedAt: true,
          suspendedReason: true,
          bannedAt: true,
          warningCount: true,
          activeWarningCount: true,
          canBookLuxury: true,
          canBookPremium: true,
          totalTrips: true,
          averageRating: true,
          loyaltyPoints: true,
          memberTier: true
        }
      }),

      // Query 3: Recent Bookings (Optimized with raw SQL)
      prisma.$queryRawUnsafe(`
        SELECT 
          b.id,
          b."bookingCode",
          b.status,
          b."verificationStatus",
          b."tripStatus",
          b."startDate",
          b."endDate",
          b."startTime",
          b."endTime",
          b."numberOfDays",
          b."dailyRate",
          b.subtotal,
          b."totalAmount",
          b."paymentStatus",
          b."createdAt",
          b."guestName",
          b."guestEmail",
          
          -- Car details
          json_build_object(
            'id', c.id,
            'make', c.make,
            'model', c.model,
            'year', c.year,
            'type', c."carType",
            'photo', (
              SELECT url 
              FROM "RentalCarPhoto" 
              WHERE "carId" = c.id 
              ORDER BY "order" 
              LIMIT 1
            ),
            'location', CONCAT(c.city, ', ', c.state)
          ) as car,
          
          -- Host details
          json_build_object(
            'id', h.id,
            'name', h.name,
            'rating', h.rating,
            'photo', h."profilePhoto"
          ) as host,
          
          -- Unread message count
          COALESCE((
            SELECT COUNT(*)::int
            FROM "RentalMessage" m
            WHERE m."bookingId" = b.id 
              AND m."isRead" = false
              AND m."senderType" NOT IN ('guest', 'renter')
          ), 0) as "unreadMessages"
          
        FROM "RentalBooking" b
        LEFT JOIN "RentalCar" c ON c.id = b."carId"
        LEFT JOIN "RentalHost" h ON h.id = b."hostId"
        WHERE (b."renterId" = '${userId}' OR b."guestEmail" = '${userEmail}')
        ORDER BY b."createdAt" DESC
        LIMIT 10
      `),

      // Query 4: Booking Stats (Count by status)
      prisma.rentalBooking.groupBy({
        by: ['status'],
        where: {
          OR: [
            { renterId: userId },
            { guestEmail: userEmail }
          ]
        },
        _count: { id: true }
      }),

      // Query 5: Appeal Notifications (Unread only)
      prisma.appealNotification.findMany({
        where: {
          guest: {
            OR: [
              { userId },
              { email: userEmail }
            ]
          },
          seen: false,
          dismissedAt: null
        },
        include: {
          appeal: {
            select: {
              id: true,
              status: true,
              reason: true,
              submittedAt: true,
              reviewedAt: true,
              reviewNotes: true
            }
          }
        },
        orderBy: { createdAt: 'desc' },
        take: 5
      }),

      // Query 6: Notification Dismissals (Last 30 days)
      prisma.notificationDismissal.findMany({
        where: {
          userId,
          dismissedAt: {
            gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)
          }
        },
        select: {
          id: true,
          notificationType: true,
          dismissedAt: true,
          completedAt: true
        }
      }),

      // Query 7: Payment Methods (First 3)
      prisma.paymentMethod.findMany({
        where: { userId },
        select: {
          id: true,
          type: true,
          last4: true,
          brand: true,
          expiryMonth: true,
          expiryYear: true,
          isDefault: true,
          isVerified: true
        },
        orderBy: { isDefault: 'desc' },
        take: 3
      })
    ])

    // ========== GUARD CHECK: User must have ReviewerProfile for guest dashboard ==========
    if (!reviewerProfile) {
      console.log('[DASHBOARD API] No ReviewerProfile found for user:', userEmail)

      // Check if user has a host profile instead
      const hostProfile = await prisma.rentalHost.findFirst({
        where: {
          OR: [
            { userId },
            { email: userEmail }
          ]
        },
        select: { id: true, name: true }
      })

      if (hostProfile) {
        // HOST trying to access GUEST dashboard → Show guard
        console.log('[DASHBOARD API] User is HOST-only, returning guard response')
        return NextResponse.json({
          success: false,
          guard: {
            type: 'host-on-guest',
            title: 'Host Account Detected',
            message: 'You are logged in with your host account. Create a guest account to rent cars.',
            actions: {
              primary: { label: 'Go to Host Dashboard', url: '/host/dashboard' },
              secondary: { label: 'Create Guest Account', url: '/auth/signup?roleHint=guest' }
            }
          }
        }, { status: 403 })
      } else {
        // No profile at all → Needs to complete signup
        console.log('[DASHBOARD API] User has no profile, returning guard response')
        return NextResponse.json({
          success: false,
          guard: {
            type: 'no-profile',
            title: 'Profile Not Found',
            message: 'Please complete your account setup to continue.',
            actions: {
              primary: { label: 'Complete Setup', url: '/auth/complete-profile?roleHint=guest' }
            }
          }
        }, { status: 403 })
      }
    }

    // ========== PROCESS & CALCULATE STATS ==========
    
    // Calculate booking stats from grouped data
    const statusCounts = bookingStats.reduce((acc, stat) => {
      acc[stat.status] = stat._count.id
      return acc
    }, {} as Record<string, number>)

    // Calculate upcoming bookings
    const now = new Date()
    const upcomingCount = (bookingsRaw as any[]).filter(b => 
      new Date(b.startDate) > now && 
      !['CANCELLED', 'COMPLETED'].includes(b.status)
    ).length

    // Calculate active rentals
    const activeCount = (bookingsRaw as any[]).filter(b => 
      new Date(b.startDate) <= now &&
      new Date(b.endDate) >= now &&
      b.status === 'ACTIVE'
    ).length

    // Calculate total unread messages
    const totalUnreadMessages = (bookingsRaw as any[]).reduce((sum, b) => 
      sum + (b.unreadMessages || 0), 0
    )

    // ========================================================================
    // ✅ CRITICAL FIX: Check verification status based on documentsVerified flag
    // Don't check individual file URLs - admin may have verified without files
    // Old logic was too strict and showed false "verification required" alerts
    // ========================================================================
    const isFullyVerified = !!(
      reviewerProfile?.emailVerified &&
      reviewerProfile?.phoneVerified &&
      reviewerProfile?.documentsVerified
    )

    console.log('[DASHBOARD API] Verification status:', {
      email: reviewerProfile?.emailVerified,
      phone: reviewerProfile?.phoneVerified,
      documents: reviewerProfile?.documentsVerified,
      driversLicense: !!reviewerProfile?.driversLicenseUrl,
      selfie: !!reviewerProfile?.selfieUrl,
      isFullyVerified
    })

    // ========================================================================
    // ✅ CRITICAL FIX: Check for ACTIVE warnings, not total warnings
    // Use activeWarningCount instead of warningCount to avoid showing expired warnings
    // This prevents false "Account Warning" banners for resolved issues
    // ========================================================================
    const hasActiveWarning = !!(
      (reviewerProfile?.suspensionLevel && reviewerProfile?.suspensionLevel !== 'NONE') ||
      (reviewerProfile?.activeWarningCount && reviewerProfile?.activeWarningCount > 0)
    )

    console.log('[DASHBOARD API] Warning status:', {
      suspensionLevel: reviewerProfile?.suspensionLevel,
      totalWarnings: reviewerProfile?.warningCount,
      activeWarnings: reviewerProfile?.activeWarningCount,
      hasActiveWarning
    })

    // ========== BUILD RESPONSE ==========
    const dashboardData = {
      // User info
      user: {
        id: userProfile?.id,
        name: userProfile?.name,
        email: userProfile?.email,
        avatar: userProfile?.avatar || reviewerProfile?.profilePhotoUrl,
        phone: userProfile?.phone || reviewerProfile?.phoneNumber,
        role: userProfile?.role,
        twoFactorEnabled: userProfile?.twoFactorEnabled,
        lastActive: userProfile?.lastActive,
        memberSince: reviewerProfile?.memberSince || userProfile?.createdAt
      },

      // Profile details
      profile: {
        id: reviewerProfile?.id,
        name: reviewerProfile?.name,
        city: reviewerProfile?.city,
        state: reviewerProfile?.state,
        bio: reviewerProfile?.bio,
        profilePhoto: reviewerProfile?.profilePhotoUrl,
        memberTier: reviewerProfile?.memberTier || 'Bronze',
        loyaltyPoints: reviewerProfile?.loyaltyPoints || 0,
        totalTrips: reviewerProfile?.totalTrips || 0,
        averageRating: reviewerProfile?.averageRating || 0,
        isFullyVerified,
        hasActiveWarning,
        activeWarningCount: reviewerProfile?.activeWarningCount || 0,
        suspensionLevel: reviewerProfile?.suspensionLevel,
        suspendedUntil: reviewerProfile?.suspendedAt,
        canBookLuxury: reviewerProfile?.canBookLuxury ?? true,
        canBookPremium: reviewerProfile?.canBookPremium ?? true,
        
        // ✅ NEW: Document verification fields for VerificationAlert
        emailVerified: reviewerProfile?.emailVerified || false,
        phoneVerified: reviewerProfile?.phoneVerified || false,
        phoneNumber: reviewerProfile?.phoneNumber || userProfile?.phone || null,  // ✅ FIXED: Include phone number for verification check
        documentsVerified: reviewerProfile?.documentsVerified || false,
        driversLicenseUrl: reviewerProfile?.driversLicenseUrl || null,
        selfieUrl: reviewerProfile?.selfieUrl || null
      },

      // Bookings
      bookings: (bookingsRaw as any[]).map(b => ({
        id: b.id,
        bookingCode: b.bookingCode,
        status: b.status,
        verificationStatus: b.verificationStatus,
        tripStatus: b.tripStatus,
        startDate: b.startDate,
        endDate: b.endDate,
        startTime: b.startTime,
        endTime: b.endTime,
        numberOfDays: b.numberOfDays,
        dailyRate: parseFloat(b.dailyRate),
        subtotal: parseFloat(b.subtotal),
        totalAmount: parseFloat(b.totalAmount),
        paymentStatus: b.paymentStatus,
        car: b.car,
        host: b.host,
        unreadMessages: b.unreadMessages || 0,
        createdAt: b.createdAt
      })),

      // Stats
      stats: {
        totalBookings: (bookingsRaw as any[]).length,
        activeRentals: activeCount,
        upcomingTrips: upcomingCount,
        completedTrips: statusCounts['COMPLETED'] || 0,
        cancelledTrips: statusCounts['CANCELLED'] || 0,
        totalSpent: (bookingsRaw as any[])
          .filter(b => b.status === 'COMPLETED')
          .reduce((sum, b) => sum + parseFloat(b.totalAmount || 0), 0),
        loyaltyPoints: reviewerProfile?.loyaltyPoints || 0,
        memberTier: reviewerProfile?.memberTier || 'Bronze',
        unreadMessages: totalUnreadMessages
      },

      // Notifications
      notifications: {
        appeals: appealNotifications.map(n => ({
          id: n.id,
          type: n.type,
          message: n.message,
          appeal: n.appeal,
          createdAt: n.createdAt
        })),
        dismissed: notificationDismissals,
        hasUnreadAppeals: appealNotifications.length > 0
      },

      // Payment methods
      paymentMethods: paymentMethods.map(pm => ({
        id: pm.id,
        type: pm.type,
        last4: pm.last4,
        brand: pm.brand,
        expiry: `${pm.expiryMonth}/${pm.expiryYear}`,
        isDefault: pm.isDefault,
        isVerified: pm.isVerified
      })),

      // ✅ FIXED: Flags for UI (now uses corrected verification logic)
      flags: {
        needsVerification: !isFullyVerified,  // Now correctly checks documentsVerified flag
        hasUnreadMessages: totalUnreadMessages > 0,
        hasUpcomingTrips: upcomingCount > 0,
        hasActiveWarning,  // Now correctly checks activeWarningCount
        needsPaymentMethod: paymentMethods.length === 0
      }
    }

    console.log('[DASHBOARD API] ✅ Data fetched successfully:', {
      bookings: (bookingsRaw as any[]).length,
      appeals: appealNotifications.length,
      payments: paymentMethods.length,
      documentUrls: {
        driversLicense: !!reviewerProfile?.driversLicenseUrl,
        selfie: !!reviewerProfile?.selfieUrl
      }
    })

    return NextResponse.json({
      success: true,
      data: dashboardData,
      timestamp: new Date().toISOString()
    })

  } catch (error) {
    console.error('[DASHBOARD API] ❌ Error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load dashboard data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}