// scripts/clear-test-stripe-accounts.ts
// Run with: npx ts-node scripts/clear-test-stripe-accounts.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearTestStripeAccounts() {
  console.log('🔍 Finding hosts with test-mode Stripe Connect accounts...\n')

  // Find all hosts with Stripe Connect accounts
  const hostsWithStripe = await prisma.rentalHost.findMany({
    where: {
      stripeConnectAccountId: { not: null }
    },
    select: {
      id: true,
      name: true,
      email: true,
      stripeConnectAccountId: true,
      stripeCustomerId: true,
      stripeAccountStatus: true
    }
  })

  if (hostsWithStripe.length === 0) {
    console.log('✅ No hosts found with Stripe Connect accounts.')
    return
  }

  console.log(`Found ${hostsWithStripe.length} host(s) with Stripe data:\n`)

  for (const host of hostsWithStripe) {
    console.log(`  - ${host.name} (${host.email})`)
    console.log(`    Connect Account: ${host.stripeConnectAccountId}`)
    console.log(`    Customer ID: ${host.stripeCustomerId || 'None'}`)
    console.log('')
  }

  console.log('🧹 Clearing test-mode Stripe data...\n')

  // Clear all test Stripe data
  const result = await prisma.rentalHost.updateMany({
    where: {
      stripeConnectAccountId: { not: null }
    },
    data: {
      stripeConnectAccountId: null,
      stripeCustomerId: null,
      stripeAccountStatus: 'pending',
      stripePayoutsEnabled: false,
      stripeChargesEnabled: false,
      stripeDetailsSubmitted: false,
      stripeOnboardingLink: null,
      stripeTosAcceptanceDate: null,
      stripeTosAcceptanceIp: null,
      payoutsEnabled: false
    }
  })

  console.log(`✅ Cleared Stripe data for ${result.count} host(s)`)
  console.log('\n📋 Next steps:')
  console.log('   1. Hosts can now go to Profile → Banking')
  console.log('   2. Click "Set Up Payouts" to create a NEW live-mode Stripe account')
  console.log('   3. Complete Stripe Connect onboarding with real identity verification')
}

clearTestStripeAccounts()
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
