import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedInsuranceProvider() {
  console.log('🔧 Seeding Tint insurance provider...');

  // Check if Tint already exists
  const existingTint = await prisma.insuranceProvider.findFirst({
    where: { name: 'Tint' }
  });

  if (existingTint) {
    console.log('✅ Tint provider already exists, skipping seed');
    return;
  }

  // Create Tint provider with coverage tiers and pricing
  const tintProvider = await prisma.insuranceProvider.create({
    data: {
      id: crypto.randomUUID(),
      updatedAt: new Date(),
      name: 'Tint',
      type: 'EMBEDDED',
      isActive: true,
      isPrimary: true,
      revenueShare: 0.30,
      
      // Coverage tiers configuration
      coverageTiers: {
        MINIMUM: {
          liability: 750000,
          collision: 0,
          deductible: 0,
          description: 'Platform liability only - high security deposit required'
        },
        BASIC: {
          liability: 750000,
          collision: 'vehicle_value',
          deductible: 1000,
          description: 'Standard protection - $750k liability, full collision, $1k deductible'
        },
        PREMIUM: {
          liability: 1000000,
          collision: 'vehicle_value',
          deductible: 500,
          description: 'Enhanced protection - $1M liability, full collision, $500 deductible'
        },
        LUXURY: {
          liability: 2000000,
          collision: 'vehicle_value_plus_diminished',
          deductible: 0,
          description: 'Premium protection - $2M liability, full collision + diminished value, $0 deductible'
        }
      },
      
      // Pricing rules by vehicle value range
      pricingRules: {
        under25k: {
          MINIMUM: 0,
          BASIC: 15,
          PREMIUM: 25,
          LUXURY: 40
        },
        '25to50k': {
          MINIMUM: 0,
          BASIC: 25,
          PREMIUM: 35,
          LUXURY: 50
        },
        '50to100k': {
          MINIMUM: 0,
          BASIC: 40,
          PREMIUM: 50,
          LUXURY: 70
        },
        over100k: {
          MINIMUM: 0,
          BASIC: 60,
          PREMIUM: 80,
          LUXURY: 120
        }
      },
      
      // API integration placeholders (will be filled when integrating with Tint)
      apiKey: null,
      apiEndpoint: null,
      webhookUrl: null,
      
      // Contract details
      contractStart: new Date(),
      contractEnd: null,
      contractTerms: 'Platform insurance provider - integration pending'
    } as any
  });

  console.log('✅ Tint provider created successfully');
  console.log('📊 Provider ID:', tintProvider.id);
  console.log('🎯 Coverage Tiers: MINIMUM, BASIC, PREMIUM, LUXURY');
  console.log('💰 Platform Revenue Share: 30%');
}

async function main() {
  try {
    await seedInsuranceProvider();
    console.log('✅ Insurance seeding completed');
  } catch (error) {
    console.error('❌ Error seeding insurance provider:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

main()
  .catch((error) => {
    console.error(error);
    process.exit(1);
  });