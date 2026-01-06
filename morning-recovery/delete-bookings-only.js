const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function deleteBookings() {
  const bookings = await prisma.rentalBooking.deleteMany({})
  console.log(`✅ Deleted ${bookings.count} bookings`)
  await prisma.$disconnect()
}

deleteBookings()
