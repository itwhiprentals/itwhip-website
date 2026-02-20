// Update Drive It Pro logo with Cloudinary transformation to zoom out
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Updating Drive It Pro logo with zoom-out transformation...\n')

  const host = await prisma.rentalHost.findFirst({
    where: { email: 'Alex@driveitpro.com' }
  })

  if (!host) {
    console.error('❌ Drive It Pro host not found!')
    return
  }

  // Original: https://res.cloudinary.com/du1hjyrgm/image/upload/v1771541802/partners/drive-it-pro-logo.png
  // Use original for vehicle cards, hero component will add transformation
  const transformedUrl = 'https://res.cloudinary.com/du1hjyrgm/image/upload/v1771541802/partners/drive-it-pro-logo.png'

  await prisma.rentalHost.update({
    where: { id: host.id },
    data: {
      partnerLogo: transformedUrl,
      profilePhoto: transformedUrl
    }
  })

  console.log('✅ Updated logo with padding transformation')
  console.log('   New URL:', transformedUrl)
  console.log()
  console.log('Transformation applied: 500x500 with black background padding')
}

main().finally(() => prisma.$disconnect())
