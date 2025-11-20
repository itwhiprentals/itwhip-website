const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function createMessageThreadsForAllBookings() {
  console.log('🔄 CREATING MESSAGE THREADS FOR ALL BOOKINGS...\n')
  
  // Find all bookings that don't have any messages yet
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      messages: {
        none: {}
      }
    },
    include: {
      car: {
        select: {
          make: true,
          model: true,
          year: true
        }
      },
      host: {
        select: {
          id: true,
          name: true,
          email: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })
  
  console.log(`📋 Found ${bookings.length} bookings without message threads\n`)
  
  if (bookings.length === 0) {
    console.log('✅ All bookings already have message threads!')
    await prisma.$disconnect()
    return
  }
  
  let count = 0
  
  for (const booking of bookings) {
    console.log(`Creating thread for: ${booking.bookingCode}`)
    console.log(`  Host: ${booking.host.name}`)
    console.log(`  Guest: ${booking.guestName || booking.guestEmail}`)
    console.log(`  Car: ${booking.car.make} ${booking.car.model}`)
    console.log(`  Status: ${booking.status}`)
    
    // Message 1: System/Admin - Booking Confirmation
    await prisma.rentalMessage.create({
      data: {
        bookingId: booking.id,
        senderId: 'system',
        senderType: 'admin',
        senderName: 'ItWhip',
        senderEmail: 'system@itwhip.com',
        message: `🎉 Booking Confirmed! Your reservation for the ${booking.car.year} ${booking.car.make} ${booking.car.model} is all set. You can use this thread to communicate with your host about pickup details, questions, or any special requests.`,
        category: 'booking_update',
        isRead: true,
        isUrgent: false
      }
    })
    
    // Message 2: Host welcome message (auto-generated)
    await prisma.rentalMessage.create({
      data: {
        bookingId: booking.id,
        senderId: booking.host.id,
        senderType: 'admin_as_host',
        senderName: booking.host.name,
        senderEmail: booking.host.email,
        message: `Hi ${booking.guestName || 'there'}! Thank you for booking my ${booking.car.make} ${booking.car.model}. I'm looking forward to hosting you. Feel free to reach out if you have any questions about the vehicle or pickup arrangements!`,
        category: 'general',
        isRead: false,
        isUrgent: false
      }
    })
    
    // Message 3: If trip is completed, add completion message
    if (booking.status === 'COMPLETED' || booking.tripStatus === 'COMPLETED') {
      await prisma.rentalMessage.create({
        data: {
          bookingId: booking.id,
          senderId: 'system',
          senderType: 'admin',
          senderName: 'ItWhip',
          senderEmail: 'system@itwhip.com',
          message: `✅ Trip Completed! Thank you for using ItWhip. We hope you enjoyed your ride in the ${booking.car.make} ${booking.car.model}. Please take a moment to leave a review for your host!`,
          category: 'trip_update',
          isRead: false,
          isUrgent: false
        }
      })
    }
    
    // Message 4: If trip is active, add active message
    if (booking.status === 'ACTIVE' || booking.tripStatus === 'ACTIVE') {
      await prisma.rentalMessage.create({
        data: {
          bookingId: booking.id,
          senderId: 'system',
          senderType: 'admin',
          senderName: 'ItWhip',
          senderEmail: 'system@itwhip.com',
          message: `🚗 Trip Active! Your rental is now in progress. Have a great trip! If you need any assistance, feel free to reach out to your host or our support team.`,
          category: 'trip_update',
          isRead: false,
          isUrgent: false
        }
      })
    }
    
    // Message 5: If booking is cancelled, add cancellation message
    if (booking.status === 'CANCELLED') {
      await prisma.rentalMessage.create({
        data: {
          bookingId: booking.id,
          senderId: 'system',
          senderType: 'admin',
          senderName: 'ItWhip',
          senderEmail: 'system@itwhip.com',
          message: `❌ Booking Cancelled. This reservation has been cancelled. If you have any questions about the cancellation or refund, please contact our support team.`,
          category: 'booking_update',
          isRead: false,
          isUrgent: false
        }
      })
    }
    
    console.log(`  ✅ Created message thread\n`)
    count++
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`\n🎉 SUCCESS! Created message threads for ${count} bookings!\n`)
  
  // Show summary by host
  console.log('📊 SUMMARY BY HOST:\n')
  
  const hostsWithMessages = await prisma.rentalHost.findMany({
    select: {
      id: true,
      name: true,
      email: true,
      bookings: {
        where: {
          messages: {
            some: {}
          }
        },
        select: {
          id: true,
          bookingCode: true,
          _count: {
            select: {
              messages: true
            }
          }
        }
      }
    },
    where: {
      bookings: {
        some: {
          messages: {
            some: {}
          }
        }
      }
    }
  })
  
  hostsWithMessages.forEach(host => {
    console.log(`🏠 ${host.name} (${host.email})`)
    console.log(`   Total bookings with messages: ${host.bookings.length}`)
    
    const totalMessages = host.bookings.reduce((sum, b) => sum + b._count.messages, 0)
    console.log(`   Total messages: ${totalMessages}`)
    console.log('')
  })
  
  await prisma.$disconnect()
}

createMessageThreadsForAllBookings().catch(console.error)
