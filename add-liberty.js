const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const liberty = await prisma.insuranceProvider.create({
    data: {
      name: 'Liberty Mutual',
      type: 'TRADITIONAL',
      isActive: true,
      isPrimary: false,
      revenueShare: 0.25,
      coverageTiers: {},
      pricingRules: {},
      apiEndpoint: 'https://api.libertymutual.com/fnol/v1',
      apiKey: 'sk_live_liberty_demo_key_abc123xyz789',
      contactEmail: 'partners@libertymutual.com',
      contactPhone: '1-800-LIBERTY',
      contractStart: new Date(),
      contractTerms: 'Commercial fleet insurance partnership - Arizona pilot program'
    }
  })
  console.log('✅ Liberty Mutual added:', liberty.id)
}

main().catch(console.error).finally(() => prisma.$disconnect())
