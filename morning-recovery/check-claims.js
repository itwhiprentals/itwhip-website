const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkClaims() {
  const hostId = 'cmfj0oxqm004udomy7qivgt18'
  
  // Get all claims for this host
  const claims = await prisma.claim.findMany({
    where: { hostId: hostId },
    include: {
      booking: {
        select: {
          id: true,
          bookingCode: true,
          startDate: true,
          insuranceHierarchy: true
        }
      },
      policy: {
        select: {
          id: true,
          tier: true,
          status: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  console.log(`\n📊 CLAIMS FOUND: ${claims.length}\n`)
  
  if (claims.length === 0) {
    console.log('❌ No claims found for this host')
    console.log('💡 You may need to file a test claim first')
  } else {
    claims.forEach((claim, index) => {
      console.log(`\n🔍 CLAIM ${index + 1}:`)
      console.log('  ID:', claim.id)
      console.log('  Booking ID:', claim.bookingId)
      console.log('  Booking Code:', claim.booking.bookingCode)
      console.log('  Type:', claim.type)
      console.log('  Status:', claim.status)
      console.log('  Cost:', claim.estimatedCost)
      console.log('  Has Insurance Hierarchy:', !!claim.booking.insuranceHierarchy)
      console.log('  Has Policy:', !!claim.policy)
      console.log('  Vehicle Deactivated:', claim.vehicleDeactivated)
      console.log('  Created:', claim.createdAt.toISOString())
    })
  }
  
  await prisma.$disconnect()
}

checkClaims().catch(console.error)