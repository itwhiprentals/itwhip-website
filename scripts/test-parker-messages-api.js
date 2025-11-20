const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testParkerMessagesAPI() {
  const hostId = 'cmfj0oxqm004udomy7qivgt18' // Parker Mills
  
  console.log('🔍 TESTING PARKER MESSAGES API LOGIC...\n')
  
  // This mimics what the API does
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      hostId: hostId
    },
    select: {
      id: true,
      bookingCode: true,
      status: true,
      startDate: true,
      endDate: true,
      guestName: true,
      guestEmail: true,
      car: {
        select: {
          make: true,
          model: true,
          year: true,
          photos: {
            take: 1,
            select: { url: true }
          }
        }
      },
      messages: {
        orderBy: { createdAt: 'desc' },
        select: {
          id: true,
          senderId: true,
          senderType: true,
          senderName: true,
          senderEmail: true,
          message: true,
          isRead: true,
          isUrgent: true,
          category: true,
          hasAttachment: true,
          attachmentUrl: true,
          attachmentName: true,
          createdAt: true,
          updatedAt: true
        }
      }
    },
    orderBy: { createdAt: 'desc' }
  })
  
  console.log(`📦 Found ${bookings.length} bookings for Parker Mills\n`)
  
  bookings.forEach((booking, idx) => {
    console.log(`${idx + 1}. ${booking.bookingCode}`)
    console.log(`   Car: ${booking.car.make} ${booking.car.model}`)
    console.log(`   Guest: ${booking.guestName || booking.guestEmail}`)
    console.log(`   Status: ${booking.status}`)
    console.log(`   Messages: ${booking.messages.length}`)
    console.log('')
  })
  
  // Transform into message threads
  const messageThreads = bookings
    .filter(booking => booking.messages.length > 0)
    .map(booking => {
      const lastMessage = booking.messages[0]
      const unreadCount = booking.messages.filter(m => 
        !m.isRead && m.senderType !== 'host'
      ).length

      return {
        id: booking.id,
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        type: 'booking',
        subject: `Booking #${booking.bookingCode}`,
        preview: lastMessage.message.substring(0, 100),
        sender: booking.guestName,
        senderEmail: booking.guestEmail,
        category: lastMessage.category,
        isRead: unreadCount === 0,
        isUrgent: booking.messages.some(m => m.isUrgent),
        timestamp: lastMessage.createdAt.toISOString(),
        unreadCount,
        messageCount: booking.messages.length,
        carInfo: `${booking.car.make} ${booking.car.model} ${booking.car.year}`,
        carImage: booking.car.photos[0]?.url || null,
        bookingStatus: booking.status,
        tripDates: {
          start: booking.startDate.toISOString(),
          end: booking.endDate.toISOString()
        },
        messages: booking.messages.map(msg => ({
          id: msg.id,
          senderId: msg.senderId,
          senderType: msg.senderType,
          senderName: msg.senderName,
          message: msg.message,
          isRead: msg.isRead,
          isUrgent: msg.isUrgent,
          hasAttachment: msg.hasAttachment,
          attachmentUrl: msg.attachmentUrl,
          attachmentName: msg.attachmentName,
          createdAt: msg.createdAt.toISOString()
        }))
      }
    })
  
  console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n`)
  console.log(`💬 Message threads created: ${messageThreads.length}\n`)
  
  if (messageThreads.length === 0) {
    console.log('❌ NO MESSAGE THREADS FOUND!')
    console.log('This means bookings have no messages.')
  } else {
    console.log('✅ MESSAGE THREADS FOUND:\n')
    messageThreads.forEach((thread, idx) => {
      console.log(`${idx + 1}. ${thread.bookingCode}`)
      console.log(`   Car: ${thread.carInfo}`)
      console.log(`   Guest: ${thread.sender}`)
      console.log(`   Messages: ${thread.messageCount}`)
      console.log(`   Unread: ${thread.unreadCount}`)
      console.log(`   Status: ${thread.bookingStatus}`)
      console.log(`   Dates: ${thread.tripDates.start.split('T')[0]} to ${thread.tripDates.end.split('T')[0]}`)
      console.log('')
    })
  }
  
  // Calculate counts
  const counts = {
    all: messageThreads.length,
    unread: messageThreads.filter(t => !t.isRead).length,
    urgent: messageThreads.filter(t => t.isUrgent).length
  }
  
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  console.log('📊 COUNTS:')
  console.log(`   All: ${counts.all}`)
  console.log(`   Unread: ${counts.unread}`)
  console.log(`   Urgent: ${counts.urgent}`)
  console.log('')
  
  console.log('✅ This is what the API should return!')
  console.log('If host messages page is empty, the problem is in the frontend.\n')
  
  await prisma.$disconnect()
}

testParkerMessagesAPI().catch(console.error)
