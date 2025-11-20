// scripts/check-claim-state.ts
import { prisma } from '@/app/lib/database/prisma'

async function checkClaimState() {
  try {
    console.log('🔍 Checking pending claim state...\n')

    // 1. Get pending claim
    const claim = await prisma.claim.findFirst({
      where: { status: 'PENDING' },
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
                rules: true
              }
            }
          }
        }
      },
      orderBy: { createdAt: 'desc' }
    })

    if (!claim) {
      console.log('❌ No pending claim found')
      return
    }

    console.log('✅ CLAIM FOUND')
    console.log('  ID:', claim.id)
    console.log('  Type:', claim.type)
    console.log('  Status:', claim.status)
    console.log('  Estimated Cost:', claim.estimatedCost)
    console.log('  Created:', claim.createdAt)
    console.log('  Has FNOL Data:', !!claim.incidentAddress)
    console.log()

    // 2. Check vehicle
    if (claim.booking.car) {
      const car = claim.booking.car
      console.log('✅ VEHICLE FOUND')
      console.log('  ID:', car.id)
      console.log('  Car:', car.year, car.make, car.model)
      console.log('  Is Active:', car.isActive)
      
      if (car.rules) {
        const rules = JSON.parse(car.rules as string)
        console.log('  Deactivation Reason:', rules.deactivationReason || 'NONE')
        console.log('  Claim ID in Rules:', rules.claimId || 'NONE')
        console.log('  Suspension Message:', rules.suspensionMessage || 'NONE')
      }
      console.log()
    }

    // 3. Check AuditLog (✅ FIXED: Uses timestamp instead of createdAt)
    const auditLogs = await prisma.auditLog.findMany({
      where: {
        OR: [
          { resource: 'CLAIM', resourceId: claim.id },
          { resource: 'RENTAL_CAR', resourceId: claim.booking.car?.id }
        ]
      },
      orderBy: { timestamp: 'asc' } // ✅ FIXED: timestamp instead of createdAt
    })

    console.log('📋 AUDIT LOGS:', auditLogs.length, 'entries')
    if (auditLogs.length > 0) {
      auditLogs.forEach(log => {
        console.log(`  - ${log.eventType} (${log.severity}) at ${log.timestamp}`) // ✅ FIXED
      })
    } else {
      console.log('  ⚠️  No audit logs found - may need backfill')
    }
    console.log()

    // 4. Check ESG Event
    const esgEvent = await prisma.eSGEvent.findFirst({
      where: { relatedClaimId: claim.id }
    })

    if (esgEvent) {
      console.log('✅ ESG EVENT FOUND')
      console.log('  Event Type:', esgEvent.eventType)
      console.log('  Created:', esgEvent.createdAt)
    } else {
      console.log('❌ NO ESG EVENT')
    }
    console.log()

    // 5. Summary
    console.log('📊 SUMMARY')
    console.log('  Claim exists:', '✅')
    console.log('  Vehicle deactivated:', claim.booking.car?.isActive === false ? '✅' : '❌')
    
    // Check if suspension message exists
    const hasSuspensionMsg = claim.booking.car?.rules 
      ? !!(JSON.parse(claim.booking.car.rules as string).suspensionMessage)
      : false
    console.log('  Suspension message:', hasSuspensionMsg ? '✅' : '⚠️  MISSING')
    
    console.log('  AuditLog entries:', auditLogs.length > 0 ? `✅ (${auditLogs.length})` : '❌')
    console.log('  ESG event:', esgEvent ? '✅' : '❌')
    console.log()

    // Determine if ready to test
    const hasAllRequirements = 
      claim.booking.car?.isActive === false && 
      auditLogs.length > 0 && 
      esgEvent &&
      hasSuspensionMsg

    if (hasAllRequirements) {
      console.log('🎉 CLAIM IS FULLY CONFIGURED - READY TO TEST!')
      console.log()
      console.log('Next steps:')
      console.log('  1. Test guest experience (car detail page)')
      console.log('  2. Test host experience (claims page)')
      console.log('  3. Verify email notifications')
    } else {
      console.log('⚠️  BACKFILL NEEDED')
      console.log()
      console.log('Missing items:')
      if (claim.booking.car?.isActive !== false) {
        console.log('  ❌ Vehicle not deactivated')
      }
      if (!hasSuspensionMsg) {
        console.log('  ⚠️  Suspension message missing (optional for internal use)')
      }
      if (auditLogs.length === 0) {
        console.log('  ❌ No audit logs (compliance required)')
      }
      if (!esgEvent) {
        console.log('  ❌ No ESG event (safety tracking)')
      }
      console.log()
      console.log('Run backfill script to fix missing items.')
    }

    // Output claim and car IDs for easy reference
    console.log()
    console.log('📌 Reference IDs:')
    console.log('  Claim ID:', claim.id)
    console.log('  Car ID:', claim.booking.car?.id)
    console.log('  Booking ID:', claim.bookingId)

  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkClaimState()