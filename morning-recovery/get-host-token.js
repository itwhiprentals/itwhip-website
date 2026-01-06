// get-host-token.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getHostToken() {
  // Get the most recent host session
  const session = await prisma.session.findFirst({
    where: {
      user: {
        role: 'BUSINESS',
        rentalHost: {
          isNot: null
        }
      },
      revokedAt: null,
      expiresAt: {
        gte: new Date()
      }
    },
    orderBy: {
      lastActivity: 'desc'
    },
    include: {
      user: {
        include: {
          rentalHost: true
        }
      }
    }
  })
  
  if (!session) {
    console.log('❌ No active host session found')
    console.log('🔑 Please log in as a host first at: http://localhost:3000/host/login')
    await prisma.$disconnect()
    return
  }
  
  console.log('✅ Found active host session!')
  console.log('Host:', session.user.rentalHost.name)
  console.log('Email:', session.user.email)
  console.log('Token:', session.token)
  console.log('\n📋 Copy this curl command:\n')
  console.log(`curl -H "Cookie: hostAccessToken=${session.token}" \\`)
  console.log(`  http://localhost:3000/api/host/cars/cmfn3fdhf0001l8040ao0a3h8 | jq '.car.registrationExpiryDate'`)
  
  await prisma.$disconnect()
}

getHostToken()