// scripts/verify-sync-results.ts

/**
 * VERIFICATION SCRIPT
 * 
 * Validates that the sync completed successfully by checking:
 * - All reviews are linked to bookings
 * - All reviewers have valid emails
 * - All reviewers have user accounts
 * - All bookings have payouts
 * - Data integrity and consistency
 */

import { prisma } from '../app/lib/database/prisma'
import { isValidEmail } from '../app/lib/utils/guest-email-generator'
import { isValidBookingCode } from '../app/lib/utils/booking-code-generator'

interface VerificationResults {
  passed: boolean
  checks: CheckResult[]
  summary: {
    totalReviews: number
    linkedReviews: number
    orphanedReviews: number
    totalReviewers: number
    reviewersWithEmail: number
    reviewersWithUser: number
    totalBookings: number
    bookingsWithPayouts: number
    totalPayouts: number
    totalErrors: number
  }
}

interface CheckResult {
  name: string
  passed: boolean
  message: string
  details?: any
}

/**
 * Check 1: All reviews should be linked to bookings
 */
async function checkReviewsLinkedToBookings(): Promise<CheckResult> {
  const orphanedReviews = await prisma.rentalReview.findMany({
    where: { bookingId: null },
    select: {
      id: true,
      carId: true,
      hostId: true,
      createdAt: true
    }
  })
  
  const passed = orphanedReviews.length === 0
  
  return {
    name: 'Reviews Linked to Bookings',
    passed,
    message: passed 
      ? '✅ All reviews are linked to bookings'
      : `❌ Found ${orphanedReviews.length} orphaned reviews`,
    details: passed ? null : orphanedReviews
  }
}

/**
 * Check 2: All reviewers should have valid emails
 */
async function checkReviewerEmails(): Promise<CheckResult> {
  const reviewersWithoutEmail = await prisma.reviewerProfile.findMany({
    where: {
      OR: [
        { email: null },
        { email: '' }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true
    }
  })
  
  // Check for invalid email formats
  const allReviewers = await prisma.reviewerProfile.findMany({
    where: { email: { not: null } },
    select: { id: true, name: true, email: true }
  })
  
  const invalidEmails = allReviewers.filter(r => 
    r.email && !isValidEmail(r.email)
  )
  
  const passed = reviewersWithoutEmail.length === 0 && invalidEmails.length === 0
  
  return {
    name: 'Reviewer Emails Valid',
    passed,
    message: passed
      ? '✅ All reviewers have valid emails'
      : `❌ Found ${reviewersWithoutEmail.length} without email, ${invalidEmails.length} with invalid format`,
    details: {
      withoutEmail: reviewersWithoutEmail,
      invalidFormat: invalidEmails
    }
  }
}

/**
 * Check 3: All reviewers should have user accounts
 */
async function checkReviewerUserAccounts(): Promise<CheckResult> {
  const reviewersWithoutUser = await prisma.reviewerProfile.findMany({
    where: { userId: null },
    select: {
      id: true,
      name: true,
      email: true
    }
  })
  
  const passed = reviewersWithoutUser.length === 0
  
  return {
    name: 'Reviewer User Accounts',
    passed,
    message: passed
      ? '✅ All reviewers have user accounts'
      : `❌ Found ${reviewersWithoutUser.length} reviewers without user accounts`,
    details: passed ? null : reviewersWithoutUser
  }
}

/**
 * Check 4: All bookings should have valid booking codes
 */
async function checkBookingCodes(): Promise<CheckResult> {
  const bookings = await prisma.rentalBooking.findMany({
    select: {
      id: true,
      bookingCode: true
    }
  })
  
  const invalidCodes = bookings.filter(b => !isValidBookingCode(b.bookingCode))
  const passed = invalidCodes.length === 0
  
  return {
    name: 'Booking Codes Valid',
    passed,
    message: passed
      ? '✅ All booking codes are valid P2PR format'
      : `❌ Found ${invalidCodes.length} bookings with invalid codes`,
    details: passed ? null : invalidCodes
  }
}

/**
 * Check 5: All bookings should have payouts
 */
async function checkBookingPayouts(): Promise<CheckResult> {
  const bookingsWithoutPayouts = await prisma.rentalBooking.findMany({
    where: {
      status: 'COMPLETED',
      payouts: {
        none: {}
      }
    },
    select: {
      id: true,
      bookingCode: true,
      totalAmount: true
    }
  })
  
  const passed = bookingsWithoutPayouts.length === 0
  
  return {
    name: 'Booking Payouts Created',
    passed,
    message: passed
      ? '✅ All completed bookings have payouts'
      : `❌ Found ${bookingsWithoutPayouts.length} completed bookings without payouts`,
    details: passed ? null : bookingsWithoutPayouts
  }
}

/**
 * Check 6: Payout amounts should be reasonable
 */
async function checkPayoutAmounts(): Promise<CheckResult> {
  const payouts = await prisma.rentalPayout.findMany({
    include: {
      booking: {
        select: {
          totalAmount: true
        }
      }
    }
  })
  
  const invalidPayouts = payouts.filter(p => {
    if (!p.booking) return true
    
    const hostEarnings = p.amount
    const bookingTotal = p.booking.totalAmount
    const percentage = hostEarnings / bookingTotal
    
    // Host should earn between 60% and 75%
    return percentage < 0.59 || percentage > 0.76
  })
  
  const passed = invalidPayouts.length === 0
  
  return {
    name: 'Payout Amounts Reasonable',
    passed,
    message: passed
      ? '✅ All payout amounts are within expected range (60-75%)'
      : `❌ Found ${invalidPayouts.length} payouts with unusual amounts`,
    details: passed ? null : invalidPayouts.map(p => ({
      id: p.id,
      amount: p.amount,
      bookingTotal: p.booking?.totalAmount,
      percentage: p.booking ? (p.amount / p.booking.totalAmount * 100).toFixed(1) + '%' : 'N/A'
    }))
  }
}

/**
 * Check 7: All payouts should be marked as PAID
 */
async function checkPayoutStatus(): Promise<CheckResult> {
  const nonPaidPayouts = await prisma.rentalPayout.findMany({
    where: {
      status: { not: 'PAID' }
    },
    select: {
      id: true,
      status: true,
      bookingId: true
    }
  })
  
  const passed = nonPaidPayouts.length === 0
  
  return {
    name: 'Historical Payouts Marked PAID',
    passed,
    message: passed
      ? '✅ All historical payouts are marked as PAID'
      : `❌ Found ${nonPaidPayouts.length} payouts not marked as PAID`,
    details: passed ? null : nonPaidPayouts
  }
}

/**
 * Check 8: Data consistency - bookings should have reviewedAt date
 */
async function checkBookingReviewDates(): Promise<CheckResult> {
  const bookingsWithoutReviewDate = await prisma.rentalBooking.findMany({
    where: {
      status: 'COMPLETED',
      reviewedAt: null
    },
    select: {
      id: true,
      bookingCode: true
    }
  })
  
  const passed = bookingsWithoutReviewDate.length === 0
  
  return {
    name: 'Bookings Have Review Dates',
    passed,
    message: passed
      ? '✅ All completed bookings have reviewedAt dates'
      : `❌ Found ${bookingsWithoutReviewDate.length} completed bookings without reviewedAt`,
    details: passed ? null : bookingsWithoutReviewDate
  }
}

/**
 * Get summary statistics
 */
async function getSummaryStatistics() {
  const [
    totalReviews,
    linkedReviews,
    totalReviewers,
    reviewersWithEmail,
    reviewersWithUser,
    totalBookings,
    totalPayouts,
    bookingsWithPayouts
  ] = await Promise.all([
    prisma.rentalReview.count(),
    prisma.rentalReview.count({ where: { bookingId: { not: null } } }),
    prisma.reviewerProfile.count(),
    prisma.reviewerProfile.count({ where: { email: { not: null } } }),
    prisma.reviewerProfile.count({ where: { userId: { not: null } } }),
    prisma.rentalBooking.count(),
    prisma.rentalPayout.count(),
    prisma.rentalBooking.count({
      where: {
        payouts: {
          some: {}
        }
      }
    })
  ])
  
  return {
    totalReviews,
    linkedReviews,
    orphanedReviews: totalReviews - linkedReviews,
    totalReviewers,
    reviewersWithEmail,
    reviewersWithUser,
    totalBookings,
    bookingsWithPayouts,
    totalPayouts,
    totalErrors: 0 // Will be calculated from checks
  }
}

/**
 * Main verification function
 */
async function verifySync(): Promise<VerificationResults> {
  console.log('╔════════════════════════════════════════════════════════════╗')
  console.log('║              SYNC VERIFICATION REPORT                      ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')
  
  // Run all checks
  const checks: CheckResult[] = await Promise.all([
    checkReviewsLinkedToBookings(),
    checkReviewerEmails(),
    checkReviewerUserAccounts(),
    checkBookingCodes(),
    checkBookingPayouts(),
    checkPayoutAmounts(),
    checkPayoutStatus(),
    checkBookingReviewDates()
  ])
  
  // Get summary statistics
  const summary = await getSummaryStatistics()
  summary.totalErrors = checks.filter(c => !c.passed).length
  
  // Print results
  console.log('🔍 Running Checks:\n')
  checks.forEach((check, index) => {
    console.log(`${index + 1}. ${check.name}`)
    console.log(`   ${check.message}`)
    if (!check.passed && check.details) {
      console.log(`   Details: ${JSON.stringify(check.details, null, 2).substring(0, 200)}...`)
    }
    console.log('')
  })
  
  // Print summary
  console.log('\n╔════════════════════════════════════════════════════════════╗')
  console.log('║                   SUMMARY STATISTICS                       ║')
  console.log('╚════════════════════════════════════════════════════════════╝\n')
  console.log(`📊 Reviews:`)
  console.log(`   Total:        ${summary.totalReviews}`)
  console.log(`   Linked:       ${summary.linkedReviews}`)
  console.log(`   Orphaned:     ${summary.orphanedReviews}`)
  console.log('')
  console.log(`👤 Reviewers:`)
  console.log(`   Total:        ${summary.totalReviewers}`)
  console.log(`   With email:   ${summary.reviewersWithEmail}`)
  console.log(`   With user:    ${summary.reviewersWithUser}`)
  console.log('')
  console.log(`📦 Bookings:`)
  console.log(`   Total:        ${summary.totalBookings}`)
  console.log(`   With payouts: ${summary.bookingsWithPayouts}`)
  console.log('')
  console.log(`💰 Payouts:`)
  console.log(`   Total:        ${summary.totalPayouts}`)
  console.log('')
  
  const allPassed = checks.every(c => c.passed)
  
  if (allPassed) {
    console.log('✅ ALL CHECKS PASSED - Sync completed successfully!\n')
  } else {
    console.log(`❌ ${summary.totalErrors} CHECK(S) FAILED - Review details above\n`)
  }
  
  return {
    passed: allPassed,
    checks,
    summary
  }
}

/**
 * Main execution
 */
async function main() {
  try {
    const results = await verifySync()
    
    if (!results.passed) {
      console.log('⚠️  Some checks failed. You may need to:')
      console.log('   1. Review the error details above')
      console.log('   2. Re-run the sync script if needed')
      console.log('   3. Manually fix data inconsistencies')
      process.exit(1)
    }
    
    process.exit(0)
    
  } catch (error) {
    console.error('\n❌ Verification failed with error:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

// Run verification
main()