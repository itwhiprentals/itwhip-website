import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function getOrCreateToken() {
  const bookingId = 'cmf4ufwtt000bdoxmvacjc0ir'
  
  // First try to find existing token
  let token = await prisma.guestAccessToken.findFirst({
    where: { bookingId: bookingId }
  })
  
  // If no token exists, create one
  if (!token) {
    token = await prisma.guestAccessToken.create({
      data: {
        token: 'test-' + Math.random().toString(36).substring(7),
        bookingId: bookingId,
        email: 'guest@example.com', // Use actual guest email
        expiresAt: new Date('2025-12-31')
      }
    })
    console.log('Created new token')
  } else {
    console.log('Found existing token')
  }
  
  console.log('\nGuest Tracking URL:')
  console.log('http://localhost:3000/rentals/track/' + token.token)
  
  await prisma.$disconnect()
}

getOrCreateToken()