import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const hostsToCreate = [
    { name: 'Jenny Wilson', email: 'jenny.wilson@itwhip.com' },
    { name: 'Michael Chen', email: 'michael.chen@itwhip.com' },
    { name: 'Sarah Williams', email: 'sarah.williams@itwhip.com' },
    { name: 'David Martinez', email: 'david.martinez@itwhip.com' },
    { name: 'Phoenix Auto Group', email: 'group@itwhip.com' },
  ]

  for (const hostData of hostsToCreate) {
    const existing = await prisma.rentalHost.findUnique({
      where: { email: hostData.email }
    })
    
    if (existing) {
      console.log(`Host ${hostData.name} already exists`)
    } else {
      const newHost = await prisma.rentalHost.create({
        data: {
          name: hostData.name,
          email: hostData.email,
          phone: '602-555-' + Math.floor(1000 + Math.random() * 9000),
          city: 'Phoenix',
          state: 'AZ',
          zipCode: '85001',
          isVerified: true,
          responseTime: 30,
          responseRate: 95,
          totalTrips: 0,
          rating: 5.0,
          active: true,
          bio: 'Premium car host in Phoenix area'
        }
      })
      console.log(`✅ Created host: ${newHost.name}`)
    }
  }
  
  // Show final count
  const total = await prisma.rentalHost.count()
  console.log(`\nTotal hosts in database: ${total}`)
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })