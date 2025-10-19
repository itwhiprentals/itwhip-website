import { prisma } from '../app/lib/database/prisma'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-11-20.acacia'
})

async function backfillStripeCustomers() {
  console.log('Finding hosts without Stripe Customer IDs...\n')

  const hostsNeedingCustomer = await prisma.rentalHost.findMany({
    where: {
      stripeConnectAccountId: { not: null },
      stripeCustomerId: null
    },
    select: {
      id: true,
      email: true,
      name: true,
      stripeConnectAccountId: true
    }
  })

  if (hostsNeedingCustomer.length === 0) {
    console.log('All hosts already have Stripe Customer IDs')
    return
  }

  console.log(`Found ${hostsNeedingCustomer.length} hosts needing Customer IDs:\n`)

  for (const host of hostsNeedingCustomer) {
    try {
      console.log(`Creating Customer for: ${host.name} (${host.email})`)

      const customer = await stripe.customers.create({
        email: host.email,
        name: host.name,
        description: `ItWhip Rental Host - ${host.name}`,
        metadata: {
          hostId: host.id,
          platform: 'itwhip'
        }
      })

      await prisma.rentalHost.update({
        where: { id: host.id },
        data: {
          stripeCustomerId: customer.id
        }
      })

      console.log(`Created Customer: ${customer.id}\n`)
    } catch (error: any) {
      console.error(`Failed for ${host.email}:`, error.message, '\n')
    }
  }

  console.log('Backfill complete!')
}

backfillStripeCustomers()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
