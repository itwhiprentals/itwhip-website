import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function approveBooking() {
  const bookingId = 'cmewh3hz30002dodjbim841fn'
  
  try {
    // Update booking to approved
    const updated = await prisma.rentalBooking.update({
      where: { id: bookingId },
      data: {
        status: 'CONFIRMED',
        verificationStatus: 'approved',
        licenseVerified: true,
        selfieVerified: true,
        reviewedAt: new Date(),
        reviewedBy: 'admin@itwhip.com',
        verificationNotes: 'Documents verified successfully',
        paymentStatus: 'completed'
      }
    })
    
    console.log('✅ Booking approved successfully!')
    console.log('Status:', updated.status)
    console.log('Verification:', updated.verificationStatus)
    console.log('Payment Status:', updated.paymentStatus)
    console.log('\nBooking Details:')
    console.log('Code:', updated.bookingCode)
    console.log('Guest:', updated.guestName)
    console.log('Total:', '$' + updated.totalAmount)
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

approveBooking()
