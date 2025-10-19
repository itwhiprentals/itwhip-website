// scripts/reset-tiers-to-null.ts
import prisma from '../app/lib/database/prisma'

async function resetTiersToNull() {
  console.log('🔄 Resetting all earningsTier to NULL (auto-calculate)...')
  
  const result = await prisma.rentalHost.updateMany({
    data: {
      earningsTier: null  // Let determineHostTier() calculate it
    }
  })
  
  console.log(`✅ Reset ${result.count} hosts`)
  console.log('✨ Tiers will now be calculated from insurance status')
}

resetTiersToNull()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })