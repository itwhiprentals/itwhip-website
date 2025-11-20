const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkAllHostsWithMessages() {
  console.log('🔍 FINDING ALL HOSTS WITH BOOKINGS & MESSAGES...\n')

  // Find all bookings with messages
  const bookingsWithMessages = await prisma.rentalBooking.findMany({
    where: {
      messages: {
        some: {}
      }
    },
    include: {
      host: {
        select: {
          id: true,
          email: true,
          name: true,
          approvalStatus: true
        }
      },
      car: {
        select: {
          make: true,
          model: true,
          year: true
        }
      },
      messages: {
        orderBy: {
          createdAt: 'desc'
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  console.log(`📋 FOUND ${bookingsWithMessages.length} BOOKINGS WITH MESSAGES\n`)

  // Group by host
  const hostMap = new Map()

  bookingsWithMessages.forEach(booking => {
    const hostId = booking.host.id
    if (!hostMap.has(hostId)) {
      hostMap.set(hostId, {
        host: booking.host,
        bookings: []
      })
    }
    hostMap.get(hostId).bookings.push(booking)
  })

  console.log(`👥 HOSTS WITH MESSAGES: ${hostMap.size}\n`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Display each host
  let count = 1
  for (const [hostId, data] of hostMap) {
    const { host, bookings } = data
    const totalMessages = bookings.reduce((sum, b) => sum + b.messages.length, 0)
    const totalUnread = bookings.reduce((sum, b) => {
      return sum + b.messages.filter(m => !m.isRead && m.senderType !== 'host').length
    }, 0)

    console.log(`${count}. 🏠 HOST: ${host.name} (${host.email})`)
    console.log(`   ID: ${host.id}`)
    console.log(`   Status: ${host.approvalStatus}`)
    console.log(`   📦 Bookings with messages: ${bookings.length}`)
    console.log(`   💬 Total messages: ${totalMessages}`)
    console.log(`   📬 Unread from guests: ${totalUnread}`)
    console.log('')

    bookings.forEach((booking, idx) => {
      console.log(`   ${idx + 1}. Booking: ${booking.bookingCode}`)
      console.log(`      Car: ${booking.car.make} ${booking.car.model} ${booking.car.year}`)
      console.log(`      Status: ${booking.status}`)
      console.log(`      Guest: ${booking.guestName || booking.guestEmail}`)
      console.log(`      Messages: ${booking.messages.length}`)
      
      const unreadCount = booking.messages.filter(m => !m.isRead && m.senderType !== 'host').length
      if (unreadCount > 0) {
        console.log(`      📬 Unread: ${unreadCount}`)
      }
      console.log('')
    })

    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
    count++
  }

  await prisma.$disconnect()
}

checkAllHostsWithMessages().catch(console.error)
