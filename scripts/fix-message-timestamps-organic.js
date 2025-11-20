const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixMessageTimestampsOrganic(dryRun = true) {
  if (dryRun) {
    console.log('🔍 DRY RUN MODE - No changes will be made to the database\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  } else {
    console.log('⚠️  LIVE MODE - Changes will be written to the database!\n')
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }
  
  // Get all bookings with messages
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      messages: {
        some: {}
      }
    },
    include: {
      messages: {
        orderBy: {
          createdAt: 'asc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  console.log(`📦 Found ${bookings.length} bookings with messages\n`)
  
  let updatedCount = 0
  let changes = []
  
  for (const booking of bookings) {
    const bookingCreatedAt = new Date(booking.createdAt) // ✅ ORGANIC timestamp
    const startDate = new Date(booking.startDate)
    const endDate = new Date(booking.endDate)
    const updatedAt = new Date(booking.updatedAt)
    
    console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
    console.log(`${booking.bookingCode}:`)
    console.log(`  📅 Booking Created: ${bookingCreatedAt.toLocaleString()}`)
    console.log(`  🚗 Trip Dates: ${startDate.toISOString().split('T')[0]} to ${endDate.toISOString().split('T')[0]}`)
    console.log(`  📊 Status: ${booking.status} | Trip: ${booking.tripStatus}`)
    console.log(`  💬 Messages: ${booking.messages.length}`)
    console.log('')
    
    for (let i = 0; i < booking.messages.length; i++) {
      const message = booking.messages[i]
      const oldTimestamp = new Date(message.createdAt)
      let newTimestamp
      let source = ''
      
      // Use ORGANIC booking timestamps to set realistic message times
      if (message.category === 'booking_update' && message.message.includes('Confirmed')) {
        // Booking confirmation: Use the EXACT booking creation time
        newTimestamp = new Date(bookingCreatedAt)
        source = 'booking.createdAt'
      }
      else if (message.senderType === 'admin_as_host' && message.message.includes('Thank you for booking')) {
        // Host welcome: 20 minutes after booking was created
        newTimestamp = new Date(bookingCreatedAt)
        newTimestamp.setMinutes(newTimestamp.getMinutes() + 20)
        source = 'booking.createdAt + 20min'
      }
      else if (message.category === 'trip_update' && message.message.includes('Trip Active')) {
        // Trip started: Use the actual trip start date + start time from booking
        newTimestamp = new Date(startDate)
        if (booking.startTime) {
          const [hours, minutes] = booking.startTime.split(':')
          newTimestamp.setHours(parseInt(hours), parseInt(minutes), 0, 0)
          source = 'booking.startDate + startTime'
        } else {
          newTimestamp.setHours(10, 0, 0, 0)
          source = 'booking.startDate + 10:00 AM default'
        }
      }
      else if (message.category === 'trip_update' && message.message.includes('Trip Completed')) {
        // Trip completed: Use actual trip end date + end time from booking
        newTimestamp = new Date(endDate)
        if (booking.endTime) {
          const [hours, minutes] = booking.endTime.split(':')
          newTimestamp.setHours(parseInt(hours), parseInt(minutes), 0, 0)
          source = 'booking.endDate + endTime'
        } else {
          newTimestamp.setHours(18, 0, 0, 0)
          source = 'booking.endDate + 6:00 PM default'
        }
      }
      else if (message.category === 'booking_update' && message.message.includes('Cancelled')) {
        // Cancellation: Use the booking.updatedAt or cancelledAt timestamp
        if (booking.cancelledAt) {
          newTimestamp = new Date(booking.cancelledAt)
          source = 'booking.cancelledAt'
        } else {
          newTimestamp = new Date(updatedAt)
          source = 'booking.updatedAt'
        }
      }
      else {
        // Other messages: Space between booking and trip
        newTimestamp = new Date(bookingCreatedAt)
        newTimestamp.setHours(newTimestamp.getHours() + (i * 2))
        source = 'booking.createdAt + offset'
      }
      
      // Show the change
      const willChange = oldTimestamp.getTime() !== newTimestamp.getTime()
      const icon = willChange ? '🔄' : '✓'
      
      console.log(`  ${icon} [${message.senderType.toUpperCase()}] ${message.message.substring(0, 50)}...`)
      console.log(`     OLD: ${oldTimestamp.toLocaleString()}`)
      console.log(`     NEW: ${newTimestamp.toLocaleString()}`)
      console.log(`     Source: ${source}`)
      
      if (willChange) {
        changes.push({
          bookingCode: booking.bookingCode,
          messageId: message.id,
          old: oldTimestamp,
          new: newTimestamp,
          source
        })
      }
      
      // Update the message timestamp (only if NOT dry run)
      if (!dryRun) {
        await prisma.rentalMessage.update({
          where: { id: message.id },
          data: {
            createdAt: newTimestamp,
            updatedAt: newTimestamp
          }
        })
        updatedCount++
      }
    }
  }
  
  console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`)
  
  if (dryRun) {
    console.log(`\n🔍 DRY RUN COMPLETE - No changes made`)
    console.log(`\n📊 Summary:`)
    console.log(`   Total messages reviewed: ${changes.length + (bookings.reduce((sum, b) => sum + b.messages.length, 0) - changes.length)}`)
    console.log(`   Messages that would change: ${changes.length}`)
    console.log(`   Messages already correct: ${bookings.reduce((sum, b) => sum + b.messages.length, 0) - changes.length}`)
    console.log(`\n✅ To apply these changes, run:`)
    console.log(`   node scripts/fix-message-timestamps-organic.js --live`)
  } else {
    console.log(`\n✅ LIVE RUN COMPLETE - ${updatedCount} messages updated!`)
    console.log(`\n📊 All message timestamps now use organic booking data!`)
  }
  
  console.log(`\n📋 Timestamp Sources Used:`)
  console.log(`   • booking.createdAt - For confirmation messages`)
  console.log(`   • booking.startDate + startTime - For trip active`)
  console.log(`   • booking.endDate + endTime - For trip completed`)
  console.log(`   • booking.cancelledAt/updatedAt - For cancellations`)
  
  await prisma.$disconnect()
}

// Check command line arguments
const isLiveMode = process.argv.includes('--live')
fixMessageTimestampsOrganic(!isLiveMode).catch(console.error)
