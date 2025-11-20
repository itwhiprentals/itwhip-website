const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function backfillClaimDryRun() {
  try {
    console.log('🧪 DRY RUN MODE - No database changes will be made\n')
    console.log('═'.repeat(60))
    console.log('🔄 Starting backfill analysis...\n')
    
    // Get the existing claim
    const claim = await prisma.claim.findUnique({
      where: { id: 'cmh6ohqop0005doilht4bag3z' },
      include: {
        booking: {
          include: {
            car: {
              select: {
                id: true,
                make: true,
                model: true,
                year: true,
                isActive: true,
                rules: true,
                licensePlate: true
              }
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
      }
    })
    
    if (!claim) {
      console.log('❌ Claim not found with ID: cmh6ohqop0005doilht4bag3z')
      return
    }
    
    console.log('📋 CLAIM DETAILS:')
    console.log('   Claim ID:', claim.id)
    console.log('   Type:', claim.type)
    console.log('   Status:', claim.status)
    console.log('   Created:', claim.createdAt.toISOString())
    console.log('   Host:', claim.host?.name || 'Unknown')
    console.log('   Booking ID:', claim.bookingId)
    
    console.log('\n🚗 CURRENT VEHICLE STATE:')
    console.log('   Car ID:', claim.booking.car.id)
    console.log('   Vehicle:', claim.booking.car.year, claim.booking.car.make, claim.booking.car.model)
    console.log('   License Plate:', claim.booking.car.licensePlate || 'N/A')
    console.log('   isActive:', claim.booking.car.isActive, claim.booking.car.isActive ? '❌ (SHOULD BE FALSE)' : '✅')
    
    // Parse existing rules
    let existingRules = {}
    let hasDeactivationInfo = false
    
    if (claim.booking.car.rules) {
      try {
        existingRules = JSON.parse(claim.booking.car.rules)
        hasDeactivationInfo = !!existingRules.deactivationReason
        console.log('   Has rules:', 'Yes')
        console.log('   Has deactivation info:', hasDeactivationInfo ? 'Yes ✅' : 'No ❌')
        
        if (hasDeactivationInfo) {
          console.log('   Deactivation reason:', existingRules.deactivationReason)
          console.log('   Deactivated at:', existingRules.deactivatedAt)
          console.log('   Claim ID in rules:', existingRules.claimId)
        }
      } catch (e) {
        console.log('   Rules parsing error:', e.message)
      }
    } else {
      console.log('   Has rules:', 'No')
      console.log('   Has deactivation info:', 'No ❌')
    }
    
    console.log('\n' + '═'.repeat(60))
    console.log('📝 PROPOSED CHANGES (DRY RUN):\n')
    
    // Show what would be updated
    const newRules = {
      ...existingRules,
      deactivationReason: `Claim filed: ${claim.type}`,
      deactivatedAt: new Date().toISOString(),
      deactivatedBy: claim.hostId,
      claimId: claim.id,
      claimType: claim.type,
      previousActiveStatus: claim.booking.car.isActive,
      backfilled: true,
      backfilledAt: new Date().toISOString()
    }
    
    console.log('🔄 WOULD UPDATE RentalCar:')
    console.log('   WHERE: id =', claim.booking.car.id)
    console.log('   SET:')
    console.log('      isActive: false (currently:', claim.booking.car.isActive + ')')
    console.log('      rules: {')
    console.log('        ...existing rules,')
    console.log('        deactivationReason:', `"Claim filed: ${claim.type}"`)
    console.log('        deactivatedAt:', `"${new Date().toISOString()}"`)
    console.log('        deactivatedBy:', `"${claim.hostId}"`)
    console.log('        claimId:', `"${claim.id}"`)
    console.log('        claimType:', `"${claim.type}"`)
    console.log('        previousActiveStatus:', claim.booking.car.isActive)
    console.log('        backfilled: true')
    console.log('        backfilledAt:', `"${new Date().toISOString()}"`)
    console.log('      }')
    
    console.log('\n' + '═'.repeat(60))
    console.log('📊 IMPACT ANALYSIS:\n')
    
    console.log('✅ After backfill:')
    console.log('   • Car will be deactivated (isActive: false)')
    console.log('   • Car will NOT appear in search results')
    console.log('   • Car detail page will show "Unavailable" badge')
    console.log('   • Booking page "Continue to Checkout" will be disabled')
    console.log('   • Rules field will contain deactivation audit trail')
    
    console.log('\n⚠️  Things that will NOT change:')
    console.log('   • Claim status (remains:', claim.status + ')')
    console.log('   • Booking status (no change)')
    console.log('   • No new notifications created')
    console.log('   • No activity logs created')
    
    console.log('\n' + '═'.repeat(60))
    console.log('🎯 RECOMMENDATION:\n')
    
    if (claim.booking.car.isActive && !hasDeactivationInfo) {
      console.log('✅ PROCEED WITH BACKFILL')
      console.log('   Reason: Car is active and missing deactivation info')
      console.log('   This will put the system in the correct state')
      console.log('\n   To execute: node backfill-existing-claim.js')
    } else if (!claim.booking.car.isActive && hasDeactivationInfo) {
      console.log('⚠️  BACKFILL NOT NEEDED')
      console.log('   Reason: Car already deactivated with proper audit trail')
    } else if (!claim.booking.car.isActive && !hasDeactivationInfo) {
      console.log('⚠️  PARTIAL BACKFILL NEEDED')
      console.log('   Reason: Car is deactivated but missing audit trail')
      console.log('   This will add the deactivation info to rules field')
    } else {
      console.log('❓ UNEXPECTED STATE')
    }
    
    console.log('\n' + '═'.repeat(60))
    console.log('🧪 DRY RUN COMPLETE - No changes made to database')
    console.log('═'.repeat(60) + '\n')
    
  } catch (error) {
    console.error('\n❌ Error during dry run:', error.message)
    console.error('Stack:', error.stack)
  } finally {
    await prisma.$disconnect()
  }
}

backfillClaimDryRun()
