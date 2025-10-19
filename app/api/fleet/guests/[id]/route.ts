// app/api/fleet/guests/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { updateProfileStatus } from '@/lib/helpers/guestProfileStatus'

// ============================================================================
// HELPER TYPES & FUNCTIONS FOR WARNING SYSTEM
// ============================================================================

type WarningCategory = 
  | 'LATE_RETURNS'
  | 'VEHICLE_DAMAGE'
  | 'CLEANLINESS_ISSUES'
  | 'MILEAGE_VIOLATIONS'
  | 'POLICY_VIOLATIONS'
  | 'FRAUDULENT_ACTIVITY'
  | 'PAYMENT_ISSUES'
  | 'COMMUNICATION_ISSUES'
  | 'INAPPROPRIATE_BEHAVIOR'
  | 'UNAUTHORIZED_DRIVER'
  | 'SMOKING_VIOLATION'
  | 'PET_VIOLATION'
  | 'FUEL_VIOLATIONS'
  | 'DOCUMENTATION_ISSUES'
  | 'OTHER'

type RestrictionType = 'INSTANT_BOOK' | 'LUXURY_CARS' | 'PREMIUM_CARS' | 'MANUAL_APPROVAL'

type DurationType = '1_WEEK' | '2_WEEKS' | '1_MONTH' | '3_MONTHS' | '6_MONTHS' | '1_YEAR' | 'PERMANENT' | 'CUSTOM'

/**
 * Calculate warning expiration date based on duration
 */
function calculateWarningExpiration(duration: DurationType, customDays?: number): Date | null {
  if (duration === 'PERMANENT') return null
  
  const now = new Date()
  
  switch (duration) {
    case '1_WEEK':
      return new Date(now.setDate(now.getDate() + 7))
    case '2_WEEKS':
      return new Date(now.setDate(now.getDate() + 14))
    case '1_MONTH':
      return new Date(now.setMonth(now.getMonth() + 1))
    case '3_MONTHS':
      return new Date(now.setMonth(now.getMonth() + 3))
    case '6_MONTHS':
      return new Date(now.setMonth(now.getMonth() + 6))
    case '1_YEAR':
      return new Date(now.setFullYear(now.getFullYear() + 1))
    case 'CUSTOM':
      return customDays ? new Date(now.setDate(now.getDate() + customDays)) : null
    default:
      return new Date(now.setMonth(now.getMonth() + 1)) // Default 1 month
  }
}

/**
 * Validate warning category
 */
function isValidWarningCategory(category: string): category is WarningCategory {
  const validCategories: WarningCategory[] = [
    'LATE_RETURNS', 'VEHICLE_DAMAGE', 'CLEANLINESS_ISSUES', 'MILEAGE_VIOLATIONS',
    'POLICY_VIOLATIONS', 'FRAUDULENT_ACTIVITY', 'PAYMENT_ISSUES', 'COMMUNICATION_ISSUES',
    'INAPPROPRIATE_BEHAVIOR', 'UNAUTHORIZED_DRIVER', 'SMOKING_VIOLATION', 'PET_VIOLATION',
    'FUEL_VIOLATIONS', 'DOCUMENTATION_ISSUES', 'OTHER'
  ]
  return validCategories.includes(category as WarningCategory)
}

/**
 * Validate restriction type
 */
function isValidRestriction(restriction: string): restriction is RestrictionType {
  return ['INSTANT_BOOK', 'LUXURY_CARS', 'PREMIUM_CARS', 'MANUAL_APPROVAL'].includes(restriction)
}

// ============================================================================
// GET - Fetch single guest details
// ============================================================================
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verify fleet access
    const urlKey = request.nextUrl.searchParams.get('key')
    const headerKey = request.headers.get('x-fleet-key')
    const phoenixKey = 'phoenix-fleet-2847'
    
    if (urlKey !== phoenixKey && headerKey !== phoenixKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Fetch guest with all related data
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id },
      include: {
        user: {
          select: {
            id: true,
            email: true,
            name: true,
            role: true,
            isActive: true,
            emailVerified: true,
            createdAt: true,
            lastActive: true
          }
        },
        bookings: {
          include: {
            car: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                dailyRate: true,
                photos: {
                  where: { isHero: true },
                  select: { url: true },
                  take: 1
                }
              }
            },
            host: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        reviews: {
          include: {
            car: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true
              }
            },
            booking: {
              select: {
                id: true,
                bookingCode: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        },
        moderationHistory: {
          orderBy: {
            takenAt: 'desc'
          },
          take: 20
        },
        appeals: {
          orderBy: {
            submittedAt: 'desc'
          },
          take: 10
        },
        _count: {
          select: {
            bookings: true,
            reviews: true,
            moderationHistory: true,
            appeals: true
          }
        }
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    // Calculate stats
    const completedBookings = guest.bookings.filter(b => b.status === 'COMPLETED').length
    const totalSpent = guest.bookings
      .filter(b => b.status === 'COMPLETED')
      .reduce((sum, b) => sum + b.totalAmount, 0)
    
    const averageRating = guest.reviews.length > 0
      ? guest.reviews.reduce((sum, r) => sum + r.rating, 0) / guest.reviews.length
      : 0

    // Count pending appeals
    const pendingAppeals = guest.appeals.filter(a => a.status === 'PENDING').length

    // Format response
    const response = {
      id: guest.id,
      email: guest.email,
      name: guest.name,
      profilePhotoUrl: guest.profilePhotoUrl,
      city: guest.city,
      state: guest.state,
      tripCount: guest.tripCount,
      reviewCount: guest.reviewCount,
      isVerified: guest.isVerified,
      fullyVerified: guest.fullyVerified,
      canInstantBook: guest.canInstantBook,
      documentsVerified: guest.documentsVerified,
      insuranceVerified: guest.insuranceVerified,
      memberSince: guest.memberSince,
      userId: guest.userId,
      user: guest.user,
      
      // Suspension/Ban fields
      suspensionLevel: guest.suspensionLevel,
      suspendedAt: guest.suspendedAt,
      suspendedReason: guest.suspendedReason,
      suspendedBy: guest.suspendedBy,
      suspensionExpiresAt: guest.suspensionExpiresAt,
      autoReactivate: guest.autoReactivate,
      bannedAt: guest.bannedAt,
      banReason: guest.banReason,
      bannedBy: guest.bannedBy,
      warningCount: guest.warningCount,
      activeWarningCount: guest.activeWarningCount || 0,
      lastWarningAt: guest.lastWarningAt,
      
      // NEW: Restriction flags
      canBookLuxury: guest.canBookLuxury,
      canBookPremium: guest.canBookPremium,
      requiresManualApproval: guest.requiresManualApproval,
      
      // Document URLs
      governmentIdUrl: guest.governmentIdUrl,
      driversLicenseUrl: guest.driversLicenseUrl,
      selfieUrl: guest.selfieUrl,
      insuranceCardUrl: guest.insuranceCardUrl,
      documentVerifiedAt: guest.documentVerifiedAt,
      documentVerifiedBy: guest.documentVerifiedBy,
      insuranceVerifiedAt: guest.insuranceVerifiedAt,
      
      // Stats
      stats: {
        totalBookings: guest._count.bookings,
        completedBookings,
        totalReviews: guest._count.reviews,
        totalSpent,
        averageRating: Math.round(averageRating * 10) / 10,
        moderationActions: guest._count.moderationHistory,
        pendingAppeals
      },
      
      // Related data
      bookings: guest.bookings.map(b => ({
        id: b.id,
        bookingCode: b.bookingCode,
        car: {
          id: b.car.id,
          name: `${b.car.year} ${b.car.make} ${b.car.model}`,
          heroPhoto: b.car.photos[0]?.url || null
        },
        startDate: b.startDate,
        endDate: b.endDate,
        status: b.status,
        totalAmount: b.totalAmount,
        createdAt: b.createdAt
      })),
      reviews: guest.reviews,
      moderationHistory: guest.moderationHistory,
      appeals: guest.appeals,
      
      createdAt: guest.createdAt,
      updatedAt: guest.updatedAt
    }

    return NextResponse.json({
      success: true,
      guest: response
    })

  } catch (error) {
    console.error('Fleet guest detail fetch error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch guest details' },
      { status: 500 }
    )
  }
}

// ============================================================================
// PATCH - Update guest permissions, status, and verification
// ============================================================================
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verify fleet access
    const urlKey = request.nextUrl.searchParams.get('key')
    const headerKey = request.headers.get('x-fleet-key')
    const phoenixKey = 'phoenix-fleet-2847'
    
    if (urlKey !== phoenixKey && headerKey !== phoenixKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    
    // Fetch current guest
    const currentGuest = await prisma.reviewerProfile.findUnique({
      where: { id },
      include: { user: true }
    })

    if (!currentGuest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    // Prepare update data
    const reviewerUpdateData: any = {}
    
    // Verification fields
    if (body.isVerified !== undefined) {
      reviewerUpdateData.isVerified = body.isVerified
    }
    if (body.fullyVerified !== undefined) {
      reviewerUpdateData.fullyVerified = body.fullyVerified
    }
    if (body.documentsVerified !== undefined) {
      reviewerUpdateData.documentsVerified = body.documentsVerified
      if (body.documentsVerified) {
        reviewerUpdateData.documentVerifiedAt = new Date()
        reviewerUpdateData.documentVerifiedBy = 'fleet-admin'
      }
    }
    if (body.insuranceVerified !== undefined) {
      reviewerUpdateData.insuranceVerified = body.insuranceVerified
      if (body.insuranceVerified) {
        reviewerUpdateData.insuranceVerifiedAt = new Date()
      }
    }
    
    // Privileges
    if (body.canInstantBook !== undefined) {
      reviewerUpdateData.canInstantBook = body.canInstantBook
    }
    
    // Basic info
    if (body.name !== undefined) reviewerUpdateData.name = body.name
    if (body.city !== undefined) reviewerUpdateData.city = body.city
    if (body.state !== undefined) reviewerUpdateData.state = body.state

    // Update ReviewerProfile
    const updatedGuest = await prisma.reviewerProfile.update({
      where: { id },
      data: {
        ...reviewerUpdateData,
        updatedAt: new Date()
      }
    })

    // Update User.isActive if specified
    if (body.isActive !== undefined && currentGuest.userId) {
      await prisma.user.update({
        where: { id: currentGuest.userId },
        data: { isActive: body.isActive }
      })
      
      // Cancel pending bookings if suspending
      if (!body.isActive) {
        await prisma.rentalBooking.updateMany({
          where: {
            renterId: currentGuest.userId,
            status: 'PENDING',
            startDate: { gt: new Date() }
          },
          data: {
            status: 'CANCELLED',
            cancellationReason: 'Guest account suspended by admin',
            cancelledBy: 'ADMIN',
            cancelledAt: new Date()
          }
        })
      }
    }

    console.log('✅ Guest permissions updated:', {
      guestId: id,
      changes: body,
      timestamp: new Date().toISOString()
    })

    return NextResponse.json({
      success: true,
      guest: updatedGuest,
      message: 'Guest updated successfully'
    })

  } catch (error) {
    console.error('Fleet guest update error:', error)
    return NextResponse.json(
      { error: 'Failed to update guest' },
      { status: 500 }
    )
  }
}

// ============================================================================
// DELETE - Enhanced suspension system with WARNING CATEGORIZATION + HELPER FUNCTIONS
// ============================================================================
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Verify fleet access
    const urlKey = request.nextUrl.searchParams.get('key')
    const headerKey = request.headers.get('x-fleet-key')
    const phoenixKey = 'phoenix-fleet-2847'
    
    if (urlKey !== phoenixKey && headerKey !== phoenixKey) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const {
      action = 'suspend',
      level = 'HARD',
      reason,
      internalNotes,
      expiresAt,
      autoReactivate = false,
      relatedBookingId,
      relatedClaimId,
      // NEW FIELDS FOR WARNING SYSTEM
      warningCategory,
      restrictions = [],
      duration = '1_MONTH',
      customDays
    } = body

    if (!reason) {
      return NextResponse.json(
        { error: 'Reason is required' },
        { status: 400 }
      )
    }

    // Fetch guest
    const guest = await prisma.reviewerProfile.findUnique({
      where: { id },
      include: {
        user: true,
        bookings: {
          select: {
            id: true,
            bookingCode: true,
            status: true,
            startDate: true,
            endDate: true,
            totalAmount: true
          }
        }
      }
    })

    if (!guest) {
      return NextResponse.json(
        { error: 'Guest not found' },
        { status: 404 }
      )
    }

    const now = new Date()
    let moderationAction
    let cancelledBookings = 0

    // ========================================================================
    // 🆕 ENHANCED WARNING SYSTEM WITH HELPER FUNCTIONS
    // ========================================================================
    switch (action) {
      case 'warn':
        // Validate warning category
        if (warningCategory && !isValidWarningCategory(warningCategory)) {
          return NextResponse.json(
            { error: 'Invalid warning category' },
            { status: 400 }
          )
        }

        // Validate restrictions
        const validRestrictions = restrictions.filter(isValidRestriction)
        if (restrictions.length > 0 && validRestrictions.length === 0) {
          return NextResponse.json(
            { error: 'Invalid restriction types' },
            { status: 400 }
          )
        }

        // Calculate expiration date
        const warningExpiresAt = calculateWarningExpiration(duration, customDays)

        await prisma.$transaction(async (tx) => {
          // Create moderation record (for audit trail)
          moderationAction = await tx.guestModeration.create({
            data: {
              guestId: id,
              actionType: 'WARNING',
              suspensionLevel: null,
              warningCategory: warningCategory || null,
              restrictionsApplied: validRestrictions,
              publicReason: reason,
              internalNotes: internalNotes || null,
              internalNotesOnly: false,
              takenBy: 'fleet-admin',
              takenAt: now,
              expiresAt: warningExpiresAt,
              relatedBookingId: relatedBookingId || null,
              relatedClaimId: relatedClaimId || null
            }
          })

          // 🆕 UPDATE USING HELPER FUNCTION
          await updateProfileStatus(id, {
            action: 'WARNING',
            category: warningCategory,
            restrictions: validRestrictions,
            reason: reason,
            internalNotes: internalNotes,
            issuedBy: 'fleet-admin',
            expiresAt: warningExpiresAt,
            relatedBookingId,
            relatedClaimId
          })

          // Prepare restriction flag updates for ReviewerProfile
          const restrictionUpdates: any = {}
          
          if (validRestrictions.includes('INSTANT_BOOK')) {
            restrictionUpdates.canInstantBook = false
          }
          if (validRestrictions.includes('LUXURY_CARS')) {
            restrictionUpdates.canBookLuxury = false
          }
          if (validRestrictions.includes('PREMIUM_CARS')) {
            restrictionUpdates.canBookPremium = false
          }
          if (validRestrictions.includes('MANUAL_APPROVAL')) {
            restrictionUpdates.requiresManualApproval = true
          }

          // Update ReviewerProfile restriction flags
          await tx.reviewerProfile.update({
            where: { id },
            data: {
              warningCount: { increment: 1 },
              activeWarningCount: { increment: 1 },
              lastWarningAt: now,
              ...restrictionUpdates,
              notificationSent: false,
              updatedAt: now
            }
          })
        })

        console.log('⚠️ Enhanced warning issued:', {
          guestId: id,
          guestName: guest.name,
          category: warningCategory || 'NONE',
          restrictions: validRestrictions,
          expiresAt: warningExpiresAt,
          reason,
          warningCount: guest.warningCount + 1,
          activeWarningCount: (guest.activeWarningCount || 0) + 1,
          timestamp: now.toISOString()
        })

        return NextResponse.json({
          success: true,
          action: 'warned',
          message: 'Warning issued successfully',
          details: {
            guestId: id,
            guestName: guest.name,
            warningCategory: warningCategory || null,
            restrictions: validRestrictions,
            expiresAt: warningExpiresAt,
            warningCount: guest.warningCount + 1,
            activeWarningCount: (guest.activeWarningCount || 0) + 1,
            moderationId: moderationAction.id
          }
        })

      // ========================================================================
      // SUSPEND - SOFT/HARD (Unchanged)
      // ========================================================================
      case 'suspend':
        const suspensionLevel = ['SOFT', 'HARD'].includes(level) ? level : 'HARD'
        const expirationDate = expiresAt ? new Date(expiresAt) : null

        const activeBookings = guest.bookings.filter(b => 
          b.status === 'ACTIVE' && b.endDate > now
        )
        const futureBookings = guest.bookings.filter(b => 
          ['PENDING', 'CONFIRMED'].includes(b.status) && b.startDate > now
        )

        await prisma.$transaction(async (tx) => {
          moderationAction = await tx.guestModeration.create({
            data: {
              guestId: id,
              actionType: 'SUSPEND',
              suspensionLevel,
              publicReason: reason,
              internalNotes: internalNotes || null,
              internalNotesOnly: false,
              takenBy: 'fleet-admin',
              takenAt: now,
              expiresAt: expirationDate,
              relatedBookingId: relatedBookingId || null,
              relatedClaimId: relatedClaimId || null
            }
          })

          await tx.reviewerProfile.update({
            where: { id },
            data: {
              suspensionLevel,
              suspendedAt: now,
              suspendedReason: reason,
              suspendedBy: 'fleet-admin',
              suspensionExpiresAt: expirationDate,
              autoReactivate,
              canInstantBook: false,
              notificationSent: false,
              notifiedAt: null,
              updatedAt: now
            }
          })

          if (guest.userId) {
            await tx.user.update({
              where: { id: guest.userId },
              data: { isActive: true }
            })
          }

          if (suspensionLevel === 'HARD' && futureBookings.length > 0) {
            const result = await tx.rentalBooking.updateMany({
              where: { id: { in: futureBookings.map(b => b.id) } },
              data: {
                status: 'CANCELLED',
                cancellationReason: `Account suspended: ${reason}`,
                cancelledBy: 'ADMIN',
                cancelledAt: now
              }
            })
            cancelledBookings = result.count
          }
        })

        console.log(`🚫 Guest suspended (${suspensionLevel}):`, {
          guestId: id,
          level: suspensionLevel,
          expiresAt: expirationDate,
          cancelledBookings
        })

        return NextResponse.json({
          success: true,
          action: 'suspended',
          level: suspensionLevel,
          message: `Guest suspended (${suspensionLevel}) successfully`,
          details: {
            guestId: id,
            guestName: guest.name,
            suspensionLevel,
            expiresAt: expirationDate,
            activeBookings: activeBookings.length,
            cancelledBookings,
            moderationId: moderationAction.id
          }
        })

      // ========================================================================
      // BAN - Complete Ban (Unchanged)
      // ========================================================================
      case 'ban':
        const allFutureBookings = guest.bookings.filter(b => 
          b.startDate > now || (b.status === 'ACTIVE' && b.endDate > now)
        )

        await prisma.$transaction(async (tx) => {
          moderationAction = await tx.guestModeration.create({
            data: {
              guestId: id,
              actionType: 'BAN',
              suspensionLevel: 'BANNED',
              publicReason: reason,
              internalNotes: internalNotes || null,
              internalNotesOnly: false,
              takenBy: 'fleet-admin',
              takenAt: now,
              relatedBookingId: relatedBookingId || null,
              relatedClaimId: relatedClaimId || null
            }
          })

          await tx.reviewerProfile.update({
            where: { id },
            data: {
              suspensionLevel: 'BANNED',
              suspendedAt: now,
              suspendedReason: reason,
              suspendedBy: 'fleet-admin',
              bannedAt: now,
              banReason: reason,
              bannedBy: 'fleet-admin',
              canInstantBook: false,
              isVerified: false,
              fullyVerified: false,
              notificationSent: false,
              notifiedAt: null,
              updatedAt: now
            }
          })

          if (guest.userId) {
            await tx.user.update({
              where: { id: guest.userId },
              data: { isActive: true }
            })
          }

          if (allFutureBookings.length > 0) {
            const result = await tx.rentalBooking.updateMany({
              where: { id: { in: allFutureBookings.map(b => b.id) } },
              data: {
                status: 'CANCELLED',
                cancellationReason: `Account banned: ${reason}`,
                cancelledBy: 'ADMIN',
                cancelledAt: now,
                refundAmount: allFutureBookings.reduce((sum, b) => sum + b.totalAmount, 0)
              }
            })
            cancelledBookings = result.count
          }
        })

        console.log('🔨 Guest BANNED:', {
          guestId: id,
          cancelledBookings,
          timestamp: now.toISOString()
        })

        return NextResponse.json({
          success: true,
          action: 'banned',
          level: 'BANNED',
          message: 'Guest banned successfully',
          details: {
            guestId: id,
            guestName: guest.name,
            cancelledBookings,
            totalRefund: allFutureBookings.reduce((sum, b) => sum + b.totalAmount, 0),
            moderationId: moderationAction.id
          }
        })

      // ========================================================================
      // UNSUSPEND - Reactivate Account (Unchanged)
      // ========================================================================
      case 'unsuspend':
        await prisma.$transaction(async (tx) => {
          moderationAction = await tx.guestModeration.create({
            data: {
              guestId: id,
              actionType: 'UNSUSPEND',
              suspensionLevel: null,
              publicReason: reason,
              internalNotes: internalNotes || null,
              internalNotesOnly: false,
              takenBy: 'fleet-admin',
              takenAt: now
            }
          })

          await tx.reviewerProfile.update({
            where: { id },
            data: {
              suspensionLevel: null,
              suspendedAt: null,
              suspendedReason: null,
              suspendedBy: null,
              suspensionExpiresAt: null,
              autoReactivate: false,
              bannedAt: null,
              banReason: null,
              bannedBy: null,
              notificationSent: false,
              notifiedAt: null,
              updatedAt: now
            }
          })

          if (guest.userId) {
            await tx.user.update({
              where: { id: guest.userId },
              data: { isActive: true }
            })
          }
        })

        console.log('✅ Guest unsuspended:', {
          guestId: id,
          timestamp: now.toISOString()
        })

        return NextResponse.json({
          success: true,
          action: 'unsuspended',
          message: 'Guest reactivated successfully',
          details: {
            guestId: id,
            guestName: guest.name,
            moderationId: moderationAction.id
          }
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: warn, suspend, ban, or unsuspend' },
          { status: 400 }
        )
    }

  } catch (error) {
    console.error('Fleet guest moderation error:', error)
    return NextResponse.json(
      { error: 'Failed to process moderation action' },
      { status: 500 }
    )
  }
}