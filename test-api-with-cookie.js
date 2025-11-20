const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testAPI() {
  console.log('🧪 Testing API by checking database directly...\n')
  
  const bookingId = 'cmgj3guxx00iddoigpd5mzd6w'
  
  // Get booking with claims
  const booking = await prisma.rentalBooking.findUnique({
    where: { id: bookingId },
    include: {
      claims: {
        select: {
          id: true,
          type: true,
          status: true,
          estimatedCost: true,
          createdAt: true,
          vehicleDeactivated: true
        },
        orderBy: { createdAt: 'desc' }
      }
    }
  })
  
  if (!booking) {
    console.log('❌ Booking not found')
    return
  }
  
  console.log('✅ Booking found:', booking.bookingCode)
  console.log('📋 Claims count:', booking.claims.length)
  console.log('🔍 Claims:', JSON.stringify(booking.claims, null, 2))
  
  await prisma.$disconnect()
}

testAPI().catch(console.error)