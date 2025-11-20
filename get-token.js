const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getToken() {
  const bookingId = 'cmgj3guxx00iddoigpd5mzd6w' // Your booking ID
  
  let token = await prisma.guestAccessToken.findFirst({
    where: { bookingId: bookingId }
  })
  
  if (!token) {
    // Get the booking to extract guest email
    const booking = await prisma.rentalBooking.findUnique({
      where: { id: bookingId },
      select: { guestEmail: true }
    })
    
    // Create token
    token = await prisma.guestAccessToken.create({
      data: {
        token: 'test-' + Math.random().toString(36).substring(7),
        bookingId: bookingId,
        email: booking?.guestEmail || 'guest@example.com',
        expiresAt: new Date('2025-12-31')
      }
    })
    console.log('✅ Created new token')
  } else {
    console.log('✅ Found existing token')
  }
  
  console.log('\n📋 Token:', token.token)
  console.log('\n🔗 Guest Tracking URL:')
  console.log('http://localhost:3000/rentals/track/' + token.token)
  console.log('\n🧪 Test API with curl:')
  console.log(`curl "http://localhost:3000/api/guest/bookings/${token.token}" | jq .`)
  
  await prisma.$disconnect()
}

getToken().catch(console.error)