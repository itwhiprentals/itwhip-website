// scripts/verify-payout-migration.ts
import { prisma } from '@/app/lib/database/prisma'
import { stripe } from '@/app/lib/stripe'

async function verifyPayoutMigration() {
  console.log('🔍 Verifying payout settings migration...\n')
  
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
  
  console.log(`Checking ${hosts.length} host(s)...\n`)
  
  let correctCount = 0
  let incorrectCount = 0
  const issues: Array<{ host: string; problem: string; current: any }> = []
  
  for (const host of hosts) {
    try {
      const account = await stripe.accounts.retrieve(host.stripeConnectAccountId!)
      
      const interval = account.settings?.payouts?.schedule?.interval
      const delayDays = account.settings?.payouts?.schedule?.delay_days
      const isCorrect = interval === 'manual'  // Only check interval
      
      if (isCorrect) {
        console.log(`✅ ${host.name}`)
        console.log(`   Settings: interval='${interval}'`)
        console.log(`   Note: delay_days=${delayDays} (stored but not used for manual payouts)\n`)
        correctCount++
      } else {
        console.log(`❌ ${host.name}`)
        console.log(`   Current:  interval='${interval || 'NOT SET'}'`)
        console.log(`   Expected: interval='manual'\n`)
        incorrectCount++
        
        issues.push({
          host: host.name,
          problem: 'Payout interval is not manual',
          current: { interval, delayDays }
        })
      }
    } catch (error: any) {
      console.error(`❌ ${host.name}: ${error.message}\n`)
      incorrectCount++
      
      issues.push({
        host: host.name,
        problem: `Stripe API error: ${error.message}`,
        current: null
      })
    }
  }
  
  console.log('━'.repeat(60))
  console.log('VERIFICATION SUMMARY')
  console.log('━'.repeat(60))
  console.log(`Total hosts:     ${hosts.length}`)
  console.log(`✅ Correct:      ${correctCount}`)
  console.log(`❌ Incorrect:    ${incorrectCount}`)
  console.log('')
  
  if (correctCount === hosts.length) {
    console.log('🎉 All hosts migrated successfully!')
    console.log('')
    console.log('Next steps:')
    console.log('  1. Deploy File 1 (connect/route.ts) to production')
    console.log('  2. New hosts will automatically get manual payout settings')
    console.log('  3. Your automated payout system is ready to build')
  } else {
    console.log('⚠️  Manual intervention required\n')
    console.log('Issues found:')
    issues.forEach(issue => {
      console.log(`  • ${issue.host}`)
      console.log(`    Problem: ${issue.problem}`)
      if (issue.current) {
        console.log(`    Current: ${JSON.stringify(issue.current)}`)
      }
    })
    console.log('')
    console.log('Fix by running:')
    console.log('  npx tsx scripts/migrate-payout-settings.ts')
  }
}

verifyPayoutMigration()
  .catch(error => {
    console.error('Fatal error:', error)
    process.exit(1)
  })
  .finally(() => {
    prisma.$disconnect()
  })