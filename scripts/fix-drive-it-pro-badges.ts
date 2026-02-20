// Fix partnerBadges vs partnerBenefits confusion
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing Drive It Pro badges/benefits...\n')

  const host = await prisma.rentalHost.findFirst({
    where: { email: 'Alex@driveitpro.com' }
  })

  if (!host) {
    console.error('❌ Drive It Pro host not found!')
    return
  }

  // Update: Set partnerBadges to null (no trust badge logos)
  // Keep partnerBenefits as the string array it is
  await prisma.rentalHost.update({
    where: { id: host.id },
    data: {
      partnerBadges: null, // No trust badge logos like BBB, insurance companies
      // partnerBenefits stays as is (string array)
    }
  })

  console.log('✅ Fixed! partnerBadges set to null (TrustBadges will not render)')
  console.log('✅ partnerBenefits kept as string array')
  console.log('\nThe features (No Credit Checks, In-House Maintenance, etc.)')
  console.log('will display in the PartnerBenefits component.')
}

main().finally(() => prisma.$disconnect())
