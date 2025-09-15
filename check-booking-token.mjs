import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const booking = await prisma.rentalBooking.findUnique({
  where: { id: 'cmewh3hz30002dodjbim841fn' },
  select: {
    id: true,
    bookingCode: true,
    accessToken: true
  }
})

console.log('Booking:', booking)

if (!booking.accessToken) {
  console.log('No access token found. Check if accessToken field exists in schema.')
}

await prisma.$disconnect()
