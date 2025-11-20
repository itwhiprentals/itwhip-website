const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixConfirmationTimestamps(dryRun = true) {
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - Fixing booking confirmation timestamps\n')
  } else {
    console.log('⚠️  LIVE MODE - Updating confirmation timestamps\n')
  }
  
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      messages: {
        some: {}
      }
    },
    include: {
      messages: true
    }
  })
  
  console.log(`📦 Found ${bookings.length} bookings\n`)
  
  let updateCount = 0
  
  for (const booking of bookings) {
    const startDate = new Date(booking.startDate)
    
    // Booking confirmation should be 3-7 days before trip starts
    const daysBeforeTrip = Math.floor(Math.random() * 5) + 3 // 3-7 days
    const bookingConfirmationDate = new Date(startDate)
    bookingConfirmationDate.setDate(bookingConfirmationDate.getDate() - daysBeforeTrip)
    bookingConfirmationDate.setHours(14, 30, 0, 0) // 2:30 PM
    
    // Host welcome should be 30 min after confirmation
    const hostWelcomeDate = new Date(bookingConfirmationDate)
    hostWelcomeDate.setMinutes(hostWelcomeDate.getMinutes() + 30)
    
    console.log(`${booking.bookingCode}:`)
    console.log(`  Trip Start: ${startDate.toISOString().split('T')[0]}`)
    console.log(`  Confirmation should be: ${bookingConfirmationDate.toLocaleString()} (${daysBeforeTrip} days before trip)`)
    
    for (const message of booking.messages) {
      if (message.message.includes('Booking Confirmed')) {
        console.log(`  ✅ Updating confirmation: ${message.createdAt.toLocaleString()} → ${bookingConfirmationDate.toLocaleString()}`)
        
        if (!dryRun) {
          await prisma.rentalMessage.update({
            where: { id: message.id },
            data: {
              createdAt: bookingConfirmationDate,
              updatedAt: bookingConfirmationDate
            }
          })
        }
        updateCount++
      }
      else if (message.message.includes('Thank you for booking')) {
        console.log(`  👋 Updating host welcome: ${message.createdAt.toLocaleString()} → ${hostWelcomeDate.toLocaleString()}`)
        
        if (!dryRun) {
          await prisma.rentalMessage.update({
            where: { id: message.id },
            data: {
              createdAt: hostWelcomeDate,
              updatedAt: hostWelcomeDate
            }
          })
        }
        updateCount++
      }
    }
    console.log('')
  }
  
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  
  if (dryRun) {
    console.log(`\n🔍 DRY RUN: Would update ${updateCount} messages`)
    console.log(`\n✅ To apply changes: node scripts/fix-confirmation-timestamps.js --live`)
  } else {
    console.log(`\n✅ Updated ${updateCount} messages!`)
  }
  
  await prisma.$disconnect()
}

const isLive = process.argv.includes('--live')
fixConfirmationTimestamps(!isLive).catch(console.error)
