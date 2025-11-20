const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function backfillClaimLocation() {
  try {
    console.log('🔄 Updating claim with incident location...')
    
    const updatedClaim = await prisma.claim.update({
      where: {
        id: 'cmh6ohqop0005doilht4bag3z'
      },
      data: {
        incidentAddress: '1234 E Main Street',
        incidentCity: 'Phoenix',
        incidentState: 'AZ',
        incidentZip: '85001',
        // ✅ Removed incidentDescription - doesn't exist in schema
        updatedAt: new Date()
      }
    })
    
    console.log('✅ Claim updated successfully!')
    console.log('📍 Location:', {
      address: updatedClaim.incidentAddress,
      city: updatedClaim.incidentCity,
      state: updatedClaim.incidentState,
      zip: updatedClaim.incidentZip
    })
    
  } catch (error) {
    console.error('❌ Error updating claim:', error)
  } finally {
    await prisma.$disconnect()
  }
}

backfillClaimLocation()
