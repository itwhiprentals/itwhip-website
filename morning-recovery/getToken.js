const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getToken() {
  const bookingId = 'cmf4ufwtt000bdoxmvacjc0ir' // Your current booking
  
  let token = await prisma.guestAccessToken.findFirst({
    where: { bookingId: bookingId }
  })
  
  if (!token) {
    // Create one if it doesn't exist
    token = await prisma.guestAccessToken.create({
      data: {
        token: 'test-' + Math.random().toString(36).substring(7),
        bookingId: bookingId,
        email: 'guest@example.com',
        expiresAt: new Date('2025-12-31')
      }
    })
    console.log('Created new token')
  } else {
    console.log('Found existing token')
  }
  
  console.log('Token:', token.token)
  console.log('\nTracking URL:')
  console.log('http://localhost:3000/rentals/track/' + token.token)
  
  await prisma.$disconnect()
}

getToken()
