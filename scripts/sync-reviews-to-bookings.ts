// scripts/sync-reviews-to-bookings.ts

/**
 * MASTER SYNC SCRIPT - FIXED VERSION
 * 
 * This script converts orphaned reviews into complete bookings with:
 * - Generated booking codes (P2PR format)
 * - Calculated amounts (using car daily rates)
 * - Auto-generated guest emails
 * - Created user accounts for guests
 * - Historical PAID payouts for hosts
 * - Proper linkage between all entities
 * 
 * FIXED: Removed paymentMethod field that doesn't exist in schema
 */

import { prisma } from '../app/lib/database/prisma'
import { generateBookingCode } from '../app/lib/utils/booking-code-generator'
import { generateUniqueGuestEmail } from '../app/lib/utils/guest-email-generator'
import { createHistoricalPayout } from '../app/lib/payouts/create-historical-payout'
import * as bcrypt from 'bcryptjs'

// Configuration
const DRY_RUN = process.argv.includes('--dry-run')
const LIMIT = process.argv.includes('--limit') 
  ? parseInt(process.argv[process.argv.indexOf('--limit') + 1] || '0')
  : 0
const DEFAULT_PASSWORD = 'Welcome2024!' // Temporary password for all guests

// Statistics tracking
interface SyncStats {
  reviewsProcessed: number
  bookingsCreated: number
  emailsGenerated: number
  usersCreated: number
  payoutsCreated: number
  errors: number
  totalHostEarnings: number
  totalPlatformRevenue: number
}

const stats: SyncStats = {
  reviewsProcessed: 0,
  bookingsCreated: 0,
  emailsGenerated: 0,
  usersCreated: 0,
  payoutsCreated: 0,
  errors: 0,
  totalHostEarnings: 0,
  totalPlatformRevenue: 0
}

/**
 * Calculate booking amount based on trip duration and car daily rate
 */
function calculateBookingAmount(
  tripStartDate: Date,
  tripEndDate: Date,
  dailyRate: number
): number {
  // Calculate number of days
  const days = Math.ceil(
    (tripEndDate.getTime() - tripStartDate.getTime()) / (1000 * 60 * 60 * 24)
  )
  
  // Ensure at least 1 day
  const numberOfDays = Math.max(days, 1)
  
  // Calculate total
  return numberOfDays * dailyRate
}

/**
 * Step 1: Fix ReviewerProfile emails
 */
async function fixReviewerEmails() {
  console.log('\n📧 Step 1: Fixing ReviewerProfile emails...')
  
  // Get all reviewers with null or generated emails
  const reviewers = await prisma.reviewerProfile.findMany({
    where: {
      OR: [
        { email: null },
        { email: { contains: 'guest_' } }
      ]
    }
  })
  
  console.log(`Found ${reviewers.length} reviewers needing email updates`)
  
  // Get existing emails to avoid duplicates
  const existingEmails = await prisma.reviewerProfile.findMany({
    where: {
      email: { not: null }
    },
    select: { email: true }
  })
  
  const existingEmailList = existingEmails
    .map(r => r.email)
    .filter((e): e is string => e !== null)
  
  for (const reviewer of reviewers) {
    const email = generateUniqueGuestEmail(reviewer.name, existingEmailList)
    
    console.log(`  ${reviewer.name} → ${email}`)
    
    if (!DRY_RUN) {
      await prisma.reviewerProfile.update({
        where: { id: reviewer.id },
        data: { email }
      })
    }
    
    existingEmailList.push(email)
    stats.emailsGenerated++
  }
  
  console.log(`✅ Generated ${stats.emailsGenerated} emails`)
}

/**
 * Step 2: Create User accounts for ReviewerProfiles
 */
async function createUserAccounts() {
  console.log('\n👤 Step 2: Creating User accounts for guests...')
  
  // Get all reviewers with valid emails but no user account
  const reviewers = await prisma.reviewerProfile.findMany({
    where: {
      email: { not: null },
      userId: null
    }
  })
  
  console.log(`Found ${reviewers.length} reviewers needing user accounts`)
  
  // Hash password once (same for all)
  const hashedPassword = await bcrypt.hash(DEFAULT_PASSWORD, 10)
  
  for (const reviewer of reviewers) {
    if (!reviewer.email) continue
    
    try {
      // Check if user already exists with this email
      const existingUser = await prisma.user.findUnique({
        where: { email: reviewer.email }
      })
      
      let userId: string
      
      if (existingUser) {
        console.log(`  User exists: ${reviewer.email}`)
        userId = existingUser.id
      } else {
        console.log(`  Creating user: ${reviewer.email}`)
        
        if (!DRY_RUN) {
          const newUser = await prisma.user.create({
            data: {
              email: reviewer.email,
              name: reviewer.name,
              passwordHash: hashedPassword,  // ✅ FIXED: Use passwordHash instead of password
              role: 'ANONYMOUS',
              isActive: true
            }
          })
          userId = newUser.id
          stats.usersCreated++
        } else {
          userId = 'dry-run-user-id'
        }
      }
      
      // Link user to reviewer profile
      if (!DRY_RUN && userId) {
        await prisma.reviewerProfile.update({
          where: { id: reviewer.id },
          data: { userId }
        })
      }
      
    } catch (error) {
      console.error(`  ❌ Error creating user for ${reviewer.email}:`, error)
      stats.errors++
    }
  }
  
  console.log(`✅ Created ${stats.usersCreated} user accounts`)
}

/**
 * Step 3: Generate bookings from reviews
 */
async function generateBookingsFromReviews() {
  console.log('\n📦 Step 3: Generating bookings from reviews...')
  
  // Get all reviews without bookings
  const reviews = await prisma.rentalReview.findMany({
    where: {
      bookingId: null
    },
    include: {
      car: {
        select: {
          id: true,
          make: true,
          model: true,
          year: true,
          dailyRate: true,
          city: true,
          state: true
        }
      },
      host: {
        select: {
          id: true,
          name: true,
          email: true
        }
      },
      reviewerProfile: {
        select: {
          id: true,
          name: true,
          email: true,
          userId: true
        }
      }
    },
    take: LIMIT > 0 ? LIMIT : undefined,
    orderBy: {
      createdAt: 'asc'
    }
  })
  
  console.log(`Processing ${reviews.length} reviews...`)
  
  // Get existing booking codes to avoid duplicates
  const existingBookings = await prisma.rentalBooking.findMany({
    select: { bookingCode: true }
  })
  const existingCodes = existingBookings.map(b => b.bookingCode)
  
  for (const review of reviews) {
    try {
      if (!review.car || !review.host || !review.reviewerProfile) {
        console.log(`  ⚠️  Review ${review.id} missing car/host/reviewer, skipping`)
        stats.errors++
        continue
      }
      
      if (!review.tripStartDate || !review.tripEndDate) {
        console.log(`  ⚠️  Review ${review.id} missing trip dates, skipping`)
        stats.errors++
        continue
      }
      
      // Generate unique booking code
      let bookingCode: string
      let attempts = 0
      do {
        bookingCode = generateBookingCode({
          carMake: review.car.make,
          carModel: review.car.model,
          state: review.car.state || 'AZ',
          tripStartDate: review.tripStartDate
        })
        attempts++
      } while (existingCodes.includes(bookingCode) && attempts < 10)
      
      if (existingCodes.includes(bookingCode)) {
        console.log(`  ❌ Could not generate unique booking code for review ${review.id}`)
        stats.errors++
        continue
      }
      
      existingCodes.push(bookingCode)
      
      // Calculate booking amount
      const dailyRate = review.car.dailyRate || 200 // Fallback to $200/day
      const totalAmount = calculateBookingAmount(
        review.tripStartDate,
        review.tripEndDate,
        dailyRate
      )
      
      // Calculate number of days
      const numberOfDays = Math.max(
        Math.ceil((review.tripEndDate.getTime() - review.tripStartDate.getTime()) / (1000 * 60 * 60 * 24)),
        1
      )
      
      console.log(`  Creating booking: ${bookingCode}`)
      console.log(`    Guest: ${review.reviewerProfile.name}`)
      console.log(`    Car: ${review.car.year} ${review.car.make} ${review.car.model}`)
      console.log(`    Dates: ${review.tripStartDate.toISOString().split('T')[0]} to ${review.tripEndDate.toISOString().split('T')[0]}`)
      console.log(`    Amount: $${totalAmount.toFixed(2)}`)
      
      if (!DRY_RUN) {
        // Create the booking with ALL required fields
        // ✅ FIXED: Removed paymentMethod field that doesn't exist in schema
        const booking = await prisma.rentalBooking.create({
          data: {
            bookingCode,
            carId: review.carId,
            hostId: review.hostId,
            renterId: review.reviewerProfile.userId,
            
            // Guest info
            guestName: review.reviewerProfile.name,
            guestEmail: review.reviewerProfile.email,
            
            // Dates
            startDate: review.tripStartDate,
            endDate: review.tripEndDate,
            startTime: '10:00 AM',
            endTime: '10:00 AM',
            
            // Pickup/Delivery - REQUIRED FIELDS
            pickupLocation: `${review.car.city}, ${review.car.state}`,
            pickupType: 'host',
            returnLocation: `${review.car.city}, ${review.car.state}`,
            
            // Pricing - ALL REQUIRED FIELDS
            dailyRate,
            numberOfDays,
            subtotal: totalAmount,
            deliveryFee: 0,
            insuranceFee: 0,
            serviceFee: 0,
            taxes: 0,
            totalAmount,
            depositAmount: 500,
            
            // Security deposit - REQUIRED FIELDS
            securityDeposit: 500,
            depositHeld: 500,
            
            // Status - completed and reviewed
            status: 'COMPLETED',
            tripStatus: 'COMPLETED',
            tripStartedAt: review.tripStartDate,
            tripEndedAt: review.createdAt, // Trip ended when review was created
            reviewedAt: review.createdAt,
            
            // Verification
            verificationStatus: 'APPROVED',
            
            // Payment - FIXED: Only use fields that exist
            paymentStatus: 'PAID'
            // ❌ REMOVED: paymentMethod: 'CARD' - This field doesn't exist in schema
          }
        })
        
        stats.bookingsCreated++
        
        // Link review to booking
        await prisma.rentalReview.update({
          where: { id: review.id },
          data: { bookingId: booking.id }
        })
        
        // Create historical payout with correct 75% host earnings (25% platform fee)
        const payoutResult = await createHistoricalPayout({
          bookingId: booking.id,
          hostId: review.hostId,
          bookingTotal: totalAmount,
          tripStartDate: review.tripStartDate,
          tripEndDate: review.tripEndDate,
          reviewCreatedAt: review.createdAt,
          useChaufferRate: false // Default to 25% commission (75% host earnings)
        })
        
        if (payoutResult.success && payoutResult.calculation) {
          stats.payoutsCreated++
          stats.totalHostEarnings += payoutResult.calculation.hostEarnings
          stats.totalPlatformRevenue += payoutResult.calculation.platformRevenue
          console.log(`    ✅ Payout: Host earns $${payoutResult.calculation.hostEarnings.toFixed(2)} (75%)`)
        } else {
          console.log(`    ⚠️  Failed to create payout: ${payoutResult.error}`)
        }
      }
      
      stats.reviewsProcessed++
      
    } catch (error) {
      console.error(`  ❌ Error processing review ${review.id}:`, error)
      stats.errors++
    }
  }
  
  console.log(`✅ Created ${stats.bookingsCreated} bookings`)
}

/**
 * Main execution
 */
async function main() {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║        MASTER SYNC: Reviews → Bookings (FIXED)            ║')
  console.log('╚════════════════════════════════════════════════════════════╝')
  
  if (DRY_RUN) {
    console.log('\n⚠️  DRY RUN MODE - No changes will be made to database\n')
  }
  
  if (LIMIT > 0) {
    console.log(`\n📊 LIMIT MODE - Processing only ${LIMIT} reviews\n`)
  }
  
  try {
    // Execute sync steps
    await fixReviewerEmails()
    await createUserAccounts()
    await generateBookingsFromReviews()
    
    // Print final statistics
    console.log('\n')
    console.log('╔════════════════════════════════════════════════════════════╗')
    console.log('║                    SYNC COMPLETE                           ║')
    console.log('╚════════════════════════════════════════════════════════════╝')
    console.log('\n📊 Statistics:')
    console.log(`   Reviews processed:     ${stats.reviewsProcessed}`)
    console.log(`   Bookings created:      ${stats.bookingsCreated}`)
    console.log(`   Emails generated:      ${stats.emailsGenerated}`)
    console.log(`   User accounts created: ${stats.usersCreated}`)
    console.log(`   Payouts created:       ${stats.payoutsCreated}`)
    console.log(`   Errors:                ${stats.errors}`)
    console.log('\n💰 Financial Summary:')
    console.log(`   Total host earnings:   $${stats.totalHostEarnings.toFixed(2)}`)
    console.log(`   Total platform revenue: $${stats.totalPlatformRevenue.toFixed(2)}`)
    console.log(`   Total bookings value:   $${(stats.totalHostEarnings + stats.totalPlatformRevenue).toFixed(2)}`)
    
    if (DRY_RUN) {
      console.log('\n⚠️  This was a DRY RUN - no changes were made')
      console.log('   Run without --dry-run to apply changes')
    } else {
      console.log('\n✅ All changes have been committed to the database')
    }
    
  } catch (error) {
    console.error('\n❌ Fatal error during sync:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run the script
main()
  .then(() => {
    console.log('\n✨ Sync script completed successfully\n')
    process.exit(0)
  })
  .catch((error) => {
    console.error('\n💥 Sync script failed:', error)
    process.exit(1)
  })