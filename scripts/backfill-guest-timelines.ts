// scripts/backfill-guest-timelines.ts

/**
 * ============================================================================
 * GUEST TIMELINE BACKFILL MIGRATION SCRIPT (APPEND MODE)
 * ============================================================================
 * 
 * Purpose: Adds booking/trip/review activity to existing GuestProfileStatus timelines
 * 
 * What It Does:
 * - Finds all ReviewerProfile records
 * - Extracts booking/trip/review events from database
 * - MERGES with existing moderation history
 * - Re-sorts everything chronologically
 * - Updates GuestProfileStatus.statusHistory
 * 
 * Events Added:
 * 1. ACCOUNT_CREATED (from ReviewerProfile.memberSince)
 * 2. BOOKING_CREATED (from RentalBooking.createdAt)
 * 3. DOCUMENT_UPLOADED (if documents exist)
 * 4. DOCUMENT_VERIFIED (from ReviewerProfile.documentVerifiedAt)
 * 5. TRIP_STARTED (from RentalBooking.tripStartedAt)
 * 6. TRIP_ENDED (from RentalBooking.tripEndedAt)
 * 7. REVIEW_SUBMITTED (from RentalReview.createdAt)
 * 
 * Usage:
 *   # Dry run (preview only)
 *   node scripts/backfill-guest-timelines.js --dry-run
 * 
 *   # Actual execution
 *   node scripts/backfill-guest-timelines.js
 * 
 * Safe Features:
 * - Preserves existing moderation history
 * - Merges and sorts all events
 * - Error handling (continues on failure)
 * - Progress tracking
 * ============================================================================
 */

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Check if dry-run mode
const DRY_RUN = process.argv.includes('--dry-run')

interface MigrationStats {
  totalGuests: number
  processed: number
  success: number
  skipped: number
  errors: number
  totalEventsAdded: number
  errorDetails: Array<{ guest: string; error: string }>
}

interface TimelineEvent {
  timestamp: Date | string
  action: string
  description: string
  performedBy?: string
  metadata?: Record<string, any>
  category?: string
  reason?: string
  internalNotes?: string
  expiresAt?: string | null
  suspensionLevel?: string
  relatedBookingId?: string
  relatedClaimId?: string
}

async function backfillGuestTimelines() {
  console.log('\n🚀 Guest Timeline Backfill Migration (APPEND MODE)')
  console.log('=' .repeat(60))
  
  if (DRY_RUN) {
    console.log('🔍 DRY RUN MODE - No data will be written')
  } else {
    console.log('⚠️  LIVE MODE - Data will be written to database')
  }
  
  console.log('=' .repeat(60))
  console.log('')

  const stats: MigrationStats = {
    totalGuests: 0,
    processed: 0,
    success: 0,
    skipped: 0,
    errors: 0,
    totalEventsAdded: 0,
    errorDetails: []
  }

  try {
    // ========================================================================
    // STEP 1: Fetch All ReviewerProfiles
    // ========================================================================
    console.log('📊 Step 1: Fetching all guest profiles...')
    
    const guests = await prisma.reviewerProfile.findMany({
      include: {
        user: true,
        profileStatus: true // Get existing status
      },
      orderBy: {
        memberSince: 'asc'
      }
    })

    stats.totalGuests = guests.length
    console.log(`✅ Found ${stats.totalGuests} guest profiles\n`)

    // ========================================================================
    // STEP 2: Process Each Guest
    // ========================================================================
    console.log('🔄 Step 2: Processing guest timelines...\n')

    for (const guest of guests) {
      stats.processed++
      
      try {
        // Get existing timeline
        const existingStatus = guest.profileStatus
        
        if (!existingStatus) {
          console.log(`⚠️  Guest ${stats.processed}/${stats.totalGuests} (${guest.name}): No GuestProfileStatus - skipping`)
          stats.skipped++
          continue
        }

        // Parse existing history
        let existingHistory: TimelineEvent[] = []
        try {
          existingHistory = (existingStatus.statusHistory as any[]) || []
        } catch (e) {
          existingHistory = []
        }

        // ====================================================================
        // Extract NEW Booking/Trip/Review Events
        // ====================================================================
        const newEvents: TimelineEvent[] = []

        // 1. ACCOUNT_CREATED (if not already in history)
        const hasAccountCreated = existingHistory.some(e => 
          e.action === 'ACCOUNT_CREATED' || e.action === 'NOTE_ADDED'
        )
        
        if (!hasAccountCreated && guest.memberSince) {
          newEvents.push({
            timestamp: guest.memberSince.toISOString(),
            action: 'ACCOUNT_CREATED',
            description: 'Account created - Welcome to ItWhip!',
            performedBy: 'SYSTEM',
            metadata: {
              email: guest.email,
              name: guest.name,
              city: guest.city,
              state: guest.state
            }
          })
        }

        // ====================================================================
        // Find All Bookings for This Guest
        // ====================================================================
        const bookings = await prisma.rentalBooking.findMany({
          where: {
            OR: [
              { reviewerProfileId: guest.id },
              { guestEmail: guest.email || '' }
            ]
          },
          include: {
            car: {
              select: {
                year: true,
                make: true,
                model: true
              }
            },
            tripCharges: {
              select: {
                mileageCharge: true,
                fuelCharge: true,
                lateCharge: true,
                damageCharge: true,
                cleaningCharge: true,
                totalCharges: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        })

        // Process each booking
        for (const booking of bookings) {
          const carName = `${booking.car?.year} ${booking.car?.make} ${booking.car?.model}`

          // 2. BOOKING_CREATED
          newEvents.push({
            timestamp: booking.createdAt.toISOString(),
            action: 'BOOKING_CREATED',
            description: `Booked ${carName} for ${booking.startDate.toLocaleDateString()} - ${booking.endDate.toLocaleDateString()}`,
            performedBy: 'GUEST',
            metadata: {
              bookingId: booking.id,
              carName: carName,
              startDate: booking.startDate.toISOString(),
              endDate: booking.endDate.toISOString(),
              totalAmount: booking.totalAmount,
              status: booking.status
            }
          })

          // 3. DOCUMENT_UPLOADED (if documents exist and booking is first one)
          if (bookings.indexOf(booking) === 0 && 
              (guest.governmentIdUrl || guest.driversLicenseUrl || guest.selfieUrl)) {
            const uploadTime = new Date(booking.createdAt.getTime() + 5 * 60 * 1000)
            
            const documentsUploaded = []
            if (guest.governmentIdUrl) documentsUploaded.push('Government ID')
            if (guest.driversLicenseUrl) documentsUploaded.push('Driver\'s License')
            if (guest.selfieUrl) documentsUploaded.push('Verification Selfie')

            newEvents.push({
              timestamp: uploadTime.toISOString(),
              action: 'DOCUMENT_UPLOADED',
              description: `Documents uploaded: ${documentsUploaded.join(', ')}`,
              performedBy: 'GUEST',
              metadata: {
                documentsUploaded: documentsUploaded,
                count: documentsUploaded.length,
                governmentIdType: guest.governmentIdType
              }
            })
          }

          // 4. DOCUMENT_VERIFIED (only once, for first booking)
          if (bookings.indexOf(booking) === 0 && guest.documentVerifiedAt) {
            newEvents.push({
              timestamp: guest.documentVerifiedAt.toISOString(),
              action: 'DOCUMENT_VERIFIED',
              description: 'Documents verified by admin - Instant book enabled',
              performedBy: 'ADMIN',
              metadata: {
                verifiedBy: guest.documentVerifiedBy,
                documentsVerified: true
              }
            })
          }

          // 5. TRIP_STARTED
          if (booking.tripStartedAt) {
            newEvents.push({
              timestamp: booking.tripStartedAt.toISOString(),
              action: 'TRIP_STARTED',
              description: `Trip started for ${carName}`,
              performedBy: 'GUEST',
              metadata: {
                bookingId: booking.id,
                carName: carName,
                startMileage: booking.startMileage,
                fuelLevelStart: booking.fuelLevelStart
              }
            })
          }

          // 6. TRIP_ENDED
          if (booking.tripEndedAt) {
            const milesDriven = booking.endMileage && booking.startMileage 
              ? booking.endMileage - booking.startMileage 
              : null

            const tripCharge = booking.tripCharges?.[0]
            const totalCharges = tripCharge ? Number(tripCharge.totalCharges) : 0

            let chargeDescription = 'No additional charges'
            if (totalCharges > 0) {
              chargeDescription = `$${totalCharges.toFixed(2)} in additional charges`
            }

            newEvents.push({
              timestamp: booking.tripEndedAt.toISOString(),
              action: 'TRIP_ENDED',
              description: `Trip ended for ${carName} - ${chargeDescription}`,
              performedBy: 'GUEST',
              metadata: {
                bookingId: booking.id,
                carName: carName,
                milesDriven: milesDriven,
                endMileage: booking.endMileage,
                fuelLevelEnd: booking.fuelLevelEnd,
                totalCharges: totalCharges,
                mileageCharge: tripCharge ? Number(tripCharge.mileageCharge) : 0,
                fuelCharge: tripCharge ? Number(tripCharge.fuelCharge) : 0,
                lateCharge: tripCharge ? Number(tripCharge.lateCharge) : 0
              }
            })
          }
        }

        // ====================================================================
        // Find All Reviews for This Guest
        // ====================================================================
        const reviews = await prisma.rentalReview.findMany({
          where: {
            reviewerProfileId: guest.id
          },
          include: {
            car: {
              select: {
                year: true,
                make: true,
                model: true
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        })

        // 7. REVIEW_SUBMITTED
        for (const review of reviews) {
          const carName = `${review.car?.year} ${review.car?.make} ${review.car?.model}`
          const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating)

          newEvents.push({
            timestamp: review.createdAt.toISOString(),
            action: 'REVIEW_SUBMITTED',
            description: `Review submitted for ${carName} - ${stars} (${review.rating}/5)`,
            performedBy: 'GUEST',
            metadata: {
              reviewId: review.id,
              bookingId: review.bookingId,
              carName: carName,
              rating: review.rating,
              title: review.title,
              hasComment: !!review.comment
            }
          })
        }

        // ====================================================================
        // Merge and Sort All Events
        // ====================================================================
        const mergedHistory = [...existingHistory, ...newEvents]
        
        // Sort by timestamp
        mergedHistory.sort((a, b) => {
          const timeA = typeof a.timestamp === 'string' ? new Date(a.timestamp) : a.timestamp
          const timeB = typeof b.timestamp === 'string' ? new Date(b.timestamp) : b.timestamp
          return timeA.getTime() - timeB.getTime()
        })

        stats.totalEventsAdded += newEvents.length

        // ====================================================================
        // Update Database (if not dry run)
        // ====================================================================
        if (!DRY_RUN && newEvents.length > 0) {
          await prisma.guestProfileStatus.update({
            where: { guestId: guest.id },
            data: {
              statusHistory: mergedHistory as any,
              updatedAt: new Date()
            }
          })
        }

        // ====================================================================
        // Log Progress
        // ====================================================================
        const percentage = ((stats.processed / stats.totalGuests) * 100).toFixed(1)
        if (newEvents.length > 0) {
          console.log(`✅ Guest ${stats.processed}/${stats.totalGuests} (${percentage}%) - ${guest.name}: ${newEvents.length} new events added (${mergedHistory.length} total)`)
          stats.success++
        } else {
          console.log(`⏭️  Guest ${stats.processed}/${stats.totalGuests} (${percentage}%) - ${guest.name}: No new events to add`)
        }

      } catch (error) {
        stats.errors++
        const errorMessage = error instanceof Error ? error.message : 'Unknown error'
        stats.errorDetails.push({
          guest: `${guest.name} (${guest.email})`,
          error: errorMessage
        })
        console.log(`❌ Guest ${stats.processed}/${stats.totalGuests} - ${guest.name}: ERROR - ${errorMessage}`)
      }
    }

    // ========================================================================
    // STEP 3: Summary Report
    // ========================================================================
    console.log('\n' + '='.repeat(60))
    console.log('📊 MIGRATION COMPLETE - SUMMARY REPORT')
    console.log('='.repeat(60))
    console.log('')
    console.log(`Total Guests:           ${stats.totalGuests}`)
    console.log(`Processed:              ${stats.processed}`)
    console.log(`✅ Success:             ${stats.success} (${((stats.success/stats.totalGuests)*100).toFixed(1)}%)`)
    console.log(`⏭️  No Changes:          ${stats.processed - stats.success - stats.errors - stats.skipped}`)
    console.log(`⏭️  Skipped:             ${stats.skipped} (no status record)`)
    console.log(`❌ Errors:              ${stats.errors}`)
    console.log(`📝 Total Events Added:   ${stats.totalEventsAdded}`)
    console.log('')

    if (stats.errors > 0) {
      console.log('❌ ERRORS ENCOUNTERED:')
      console.log('-'.repeat(60))
      stats.errorDetails.forEach(({ guest, error }) => {
        console.log(`   Guest: ${guest}`)
        console.log(`   Error: ${error}`)
        console.log('')
      })
    }

    if (DRY_RUN) {
      console.log('🔍 DRY RUN COMPLETE - No data was written to database')
      console.log('   Run without --dry-run flag to execute migration')
    } else {
      console.log('🎉 MIGRATION COMPLETE - Guest timelines have been updated!')
      console.log('   Check the Status Tab for any guest to see their complete timeline')
    }
    
    console.log('')
    console.log('='.repeat(60))

  } catch (error) {
    console.error('\n❌ FATAL ERROR:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// ============================================================================
// RUN MIGRATION
// ============================================================================
backfillGuestTimelines()
  .then(() => {
    console.log('✅ Script completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    process.exit(1)
  })