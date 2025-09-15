const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkStatuses() {
  const bookings = await prisma.rentalBooking.findMany({
    select: {
      verificationStatus: true,
      paymentStatus: true,
      tripStatus: true,
      bookingCode: true
    }
  })
  
  console.log('Current status values:')
  bookings.forEach(b => {
    console.log(`${b.bookingCode}: verify=${b.verificationStatus}, payment=${b.paymentStatus}, trip=${b.tripStatus}`)
  })
}

checkStatuses()