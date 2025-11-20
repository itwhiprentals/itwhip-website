const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function findHosts() {
  const hosts = await prisma.rentalHost.findMany({
    select: {
      id: true,
      email: true,
      name: true,
      approvalStatus: true
    }
  })
  
  console.log('HOSTS IN DATABASE:')
  hosts.forEach((h, i) => {
    console.log(`${i + 1}. ${h.email} (${h.name}) - ${h.approvalStatus}`)
    console.log(`   ID: ${h.id}\n`)
  })
  
  await prisma.$disconnect()
}

findHosts()
