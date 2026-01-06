import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

const booking = await prisma.rentalBooking.findUnique({
  where: { id: 'cmewh3hz30002dodjbim841fn' },
  select: {
    id: true,
    bookingCode: true,
    guestEmail: true,
    guestAccessTokens: {
      select: {
        id: true,
        token: true,
        expiresAt: true
      }
    }
  }
})

console.log('Booking:', booking)

if (booking?.guestAccessTokens?.length > 0) {
  console.log('Access token:', booking.guestAccessTokens[0].token)
  console.log('Track URL:', `http://localhost:3000/rentals/track/${booking.guestAccessTokens[0].token}`)
} else {
  console.log('No access tokens found. Need to create one.')
}

await prisma.$disconnect()
