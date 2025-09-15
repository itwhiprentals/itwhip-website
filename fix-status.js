const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixStatuses() {
  try {
    // Get all bookings with raw query to bypass enum validation
    const bookings = await prisma.$queryRaw`
      SELECT id, "verificationStatus", "paymentStatus", "tripStatus", status 
      FROM "RentalBooking"
    `
    
    console.log(`Found ${bookings.length} bookings to update`)
    
    // Update each booking to uppercase values
    for (const booking of bookings) {
      await prisma.$executeRaw`
        UPDATE "RentalBooking" 
        SET 
          "verificationStatus" = UPPER(${booking.verificationStatus}),
          "paymentStatus" = UPPER(${booking.paymentStatus}),
          "tripStatus" = UPPER(${booking.tripStatus}),
          status = UPPER(${booking.status})
        WHERE id = ${booking.id}
      `
    }
    
    console.log('All bookings updated to uppercase status values!')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixStatuses()