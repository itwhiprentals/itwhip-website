// scripts/migrate-payout-settings.ts
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

async function migratePayoutSettings() {
  console.log('🔄 Starting payout settings migration...\n')
  
  const hosts = await prisma.rentalHost.findMany({
    where: {
      stripeConnectAccountId: { not: null }
    },
    select: {
      id: true,
      name: true,
      email: true,
      stripeConnectAccountId: true
    }
  })
  
  console.log(`Found ${hosts.length} host(s) with Stripe Connect accounts\n`)
  
  if (hosts.length === 0) {
    console.log('✅ No hosts to migrate. Exiting.')
    return
  }
  
  let successCount = 0
  let failCount = 0
  let alreadyConfigured = 0
  const results: Array<{ 
    host: string
    status: string
    before?: any
    after?: any
    error?: string 
  }> = []
  
  for (const host of hosts) {
    try {
      console.log(`Checking: ${host.name} (${host.email})`)
      console.log(`  Account ID: ${host.stripeConnectAccountId}`)
      
      const account = await stripe.accounts.retrieve(host.stripeConnectAccountId!)
      const currentSettings = account.settings?.payouts?.schedule
      
      console.log(`  Current: interval=${currentSettings?.interval}, delay=${currentSettings?.delay_days}`)
      
      // Check if already manual
      if (currentSettings?.interval === 'manual') {
        console.log(`  ⏭️  Already set to manual, skipping\n`)
        alreadyConfigured++
        results.push({
          host: host.name,
          status: 'ALREADY_CONFIGURED',
          before: currentSettings
        })
        continue
      }
      
      // Update to manual interval ONLY (no delay_days)
      const updated = await stripe.accounts.update(host.stripeConnectAccountId!, {
        settings: {
          payouts: {
            schedule: {
              interval: 'manual'  // Only set interval, delay_days controlled by our code
            }
          }
        }
      })
      
      console.log(`  ✅ Migrated to manual payouts\n`)
      successCount++
      results.push({
        host: host.name,
        status: 'SUCCESS',
        before: currentSettings,
        after: updated.settings?.payouts?.schedule
      })
      
    } catch (error: any) {
      console.error(`  ❌ Failed: ${error.message}\n`)
      failCount++
      results.push({
        host: host.name,
        status: 'FAILED',
        error: error.message
      })
    }
  }
  
  console.log('━'.repeat(60))
  console.log('MIGRATION SUMMARY')
  console.log('━'.repeat(60))
  console.log(`Total hosts: ${hosts.length}`)
  console.log(`✅ Migrated: ${successCount}`)
  console.log(`⏭️  Already configured: ${alreadyConfigured}`)
  console.log(`❌ Failed: ${failCount}`)
  console.log('')
  
  if (successCount > 0) {
    console.log('ℹ️  Note: delay_days is NOT set when interval=manual')
    console.log('   The 3-day hold is controlled by your cron job timing\n')
  }
  
  if (failCount > 0) {
    console.log('Failed migrations:')
    results
      .filter(r => r.status === 'FAILED')
      .forEach(r => console.log(`  - ${r.host}: ${r.error}`))
  }
  
  console.log('\n✨ Migration complete!')
}

migratePayoutSettings()
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })