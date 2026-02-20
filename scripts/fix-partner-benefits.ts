// Fix partnerBenefits format for Drive It Pro
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Fixing Drive It Pro benefits format...\n')

  const host = await prisma.rentalHost.findFirst({
    where: { email: 'Alex@driveitpro.com' }
  })

  if (!host) {
    console.error('❌ Drive It Pro host not found!')
    return
  }

  // Set partnerBenefits to the correct format with icon key/title/description
  const benefits = [
    {
      icon: 'checkmark',
      title: 'No Credit Checks',
      description: 'Get approved regardless of credit history - we eliminate traditional barriers to make transportation accessible.'
    },
    {
      icon: 'maintenance',
      title: 'In-House Maintenance',
      description: 'Full-service garage with mechanics available 6 days/week. All maintenance costs included in your rental.'
    },
    {
      icon: 'fuel',
      title: '40-50+ MPG Efficiency',
      description: 'Save $20-$50 weekly on fuel with our exclusive fleet of fuel-efficient Toyota Prius hybrids.'
    },
    {
      icon: 'insurance',
      title: '99% Uptime Guarantee',
      description: 'Less than 1% downtime for maintenance - reliable vehicles that keep you earning.'
    },
    {
      icon: 'home',
      title: 'Rent-to-Own Available',
      description: '48-month path to vehicle ownership. $25 enrollment fee, then own the car or get $5,000 credit.'
    },
    {
      icon: 'calendar',
      title: 'Open Saturdays',
      description: 'Only rideshare rental company open weekends. Mon-Fri 9AM-5PM, Sat 9AM-2PM.'
    },
    {
      icon: 'cash',
      title: 'Lowest Entry Cost',
      description: '$225 down payment to get started. Weekly rate $325 + tax = $352.95 total.'
    },
    {
      icon: 'infinite',
      title: 'Unlimited Mileage',
      description: 'Drive as much as you need on all platforms - no mileage restrictions or overage fees.'
    }
  ]

  await prisma.rentalHost.update({
    where: { id: host.id },
    data: {
      partnerBenefits: benefits as any
    }
  })

  console.log('✅ Fixed! partnerBenefits now has', benefits.length, 'items with icon/title/description')
  console.log('\nBenefits will now display in the "Why Book With Drive It Pro?" section')
}

main().finally(() => prisma.$disconnect())
