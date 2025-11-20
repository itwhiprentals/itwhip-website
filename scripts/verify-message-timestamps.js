const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function verifyTimestamps() {
  const hostId = 'cmfj0oxqm004udomy7qivgt18' // Parker Mills
  
  console.log('🔍 VERIFYING MESSAGE TIMESTAMPS FOR PARKER MILLS...\n')
  
  const bookings = await prisma.rentalBooking.findMany({
    where: { hostId },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' }
      },
      car: {
        select: { make: true, model: true }
      }
    },
    orderBy: { startDate: 'asc' }
  })
  
  bookings.forEach(booking => {
    console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`${booking.bookingCode}`)
    console.log(`📅 Booking Created: ${booking.createdAt.toLocaleString()}`)
    console.log(`🚗 Trip: ${booking.startDate.toISOString().split('T')[0]} to ${booking.endDate.toISOString().split('T')[0]}`)
    console.log(`👤 Guest: ${booking.guestName}`)
    console.log(`\n💬 Messages (${booking.messages.length}):`)
    
    booking.messages.forEach((msg, idx) => {
      const timestamp = new Date(msg.createdAt)
      console.log(`\n  ${idx + 1}. [${msg.senderType.toUpperCase()}] ${msg.senderName}`)
      console.log(`     📅 ${timestamp.toLocaleString()}`)
      console.log(`     💬 "${msg.message.substring(0, 60)}..."`)
    })
    console.log('')
  })
  
  await prisma.$disconnect()
}

verifyTimestamps().catch(console.error)
