const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

const HOST_ID = 'cmfj0oxqm004udomy7qivgt18'

async function forceRefresh() {
  console.log('🗑️  Deleting old ESG profile to force recalculation...')
  
  try {
    const deleted = await prisma.hostESGProfile.deleteMany({
      where: { hostId: HOST_ID }
    })
    
    console.log(`✅ Deleted ${deleted.count} old profile(s)`)
    console.log('\n🔄 Now triggering fresh calculation...')
    
    // Import and run the calculation function directly
    const { updateHostESGProfile } = require('../app/lib/esg/calculate-host-esg.ts')
    
    await updateHostESGProfile(HOST_ID)
    
    console.log('✅ ESG profile recalculated with new fields!')
    console.log('\n📊 Run the test now:')
    console.log('node scripts/test-esg-accuracy.js "<TOKEN>"')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
    console.log('\nTrying alternative method...')
    
    // Just delete and let the API endpoint handle recalculation
    try {
      await prisma.hostESGProfile.deleteMany({
        where: { hostId: HOST_ID }
      })
      console.log('✅ Profile deleted')
      console.log('\n📝 Visit http://localhost:3000/host/esg in browser to trigger recalculation')
    } catch (e) {
      console.error('Failed:', e.message)
    }
  } finally {
    await prisma.$disconnect()
  }
}

forceRefresh()
