const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const host = await prisma.rentalHost.findUnique({
    where: { id: 'cmfj0oxqm004udomy7qivgt18' },
    select: {
      id: true,
      name: true,
      partnerCompanyName: true,
      partnerSlug: true,
      approvalStatus: true,
      hostType: true,
      active: true,
      enableRideshare: true,
      enableRentals: true,
      profilePhoto: true,
      partnerLogo: true,
      partnerHeroImage: true,
    }
  })

  const carCount = await prisma.rentalCar.count({
    where: { hostId: 'cmfj0oxqm004udomy7qivgt18', isActive: true }
  })

  console.log('=== HOST STATUS ===')
  console.log('Name:', host.name)
  console.log('Company:', host.partnerCompanyName)
  console.log('Slug:', host.partnerSlug || 'NOT SET')
  console.log('Approved:', host.approvalStatus)
  console.log('Active:', host.active)
  console.log('Rideshare:', host.enableRideshare)
  console.log('Rentals:', host.enableRentals)
  console.log('Vehicles:', carCount)
  console.log('Profile Photo:', host.profilePhoto ? 'Set' : 'Not set')
  console.log('Partner Logo:', host.partnerLogo ? 'Set' : 'Not set')
  console.log('Hero Image:', host.partnerHeroImage ? 'Set' : 'Not set')

  const hasApproval = host.approvalStatus === 'APPROVED'
  const hasValidSlug = host.partnerSlug && host.partnerSlug !== 'your-company-slug'
  const hasVehicles = carCount > 0
  const hasService = host.enableRideshare || host.enableRentals

  console.log('')
  console.log('=== PUBLISHING REQUIREMENTS ===')
  console.log('Has Approval:', hasApproval ? '✅' : '❌')
  console.log('Has Valid Slug:', hasValidSlug ? '✅' : '❌', '(' + (host.partnerSlug || 'empty') + ')')
  console.log('Has Vehicles:', hasVehicles ? '✅' : '❌', '(' + carCount + ' active)')
  console.log('Has Service:', hasService ? '✅' : '❌', '(rideshare=' + host.enableRideshare + ', rentals=' + host.enableRentals + ')')

  const canPublish = hasApproval && hasValidSlug && hasVehicles && hasService
  console.log('')
  console.log('🚀 CAN PUBLISH:', canPublish ? '✅ YES' : '❌ NO')

  if (!canPublish) {
    console.log('')
    console.log('⚠️ MISSING:')
    if (!hasApproval) console.log('  - Need approval')
    if (!hasValidSlug) console.log('  - Need valid slug (set in Content tab)')
    if (!hasVehicles) console.log('  - Need at least one active vehicle')
    if (!hasService) console.log('  - Need to enable Rideshare or Rentals service')
  }

  await prisma.$disconnect()
}

main().catch(console.error)
