const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getAuthHeaders() {
  const hostId = 'cmfj0oxqm004udomy7qivgt18'
  
  const host = await prisma.rentalHost.findUnique({
    where: { id: hostId },
    select: { 
      id: true,
      userId: true,
      name: true
    }
  })
  
  if (!host) {
    console.log('❌ Host not found')
    return
  }
  
  console.log('✅ Host found:', host.name)
  console.log('\n🧪 Test Host Bookings API:')
  console.log(`curl -X GET "http://localhost:3000/api/host/bookings/cmgj3guxx00iddoigpd5mzd6w" \\`)
  console.log(`  -H "x-host-id: ${host.id}" \\`)
  console.log(`  -H "x-user-id: ${host.userId}"`)
  
  await prisma.$disconnect()
}

getAuthHeaders().catch(console.error)