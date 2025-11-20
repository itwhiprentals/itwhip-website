const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkHostAndGuestTokens() {
  console.log('🔍 CHECKING HOST & GUEST MESSAGE ACCESS...\n')

  // 1. Find the host (the one you're logged in as)
  const host = await prisma.rentalHost.findFirst({
    where: {
      email: 'YOUR_HOST_EMAIL_HERE' // Replace with actual host email
    },
    select: {
      id: true,
      email: true,
      name: true,
      approvalStatus: true,
      userId: true
    }
  })

  if (!host) {
    console.log('❌ Host not found!')
    return
  }

  console.log('✅ HOST FOUND:')
  console.log('   ID:', host.id)
  console.log('   Email:', host.email)
  console.log('   Name:', host.name)
  console.log('   Status:', host.approvalStatus)
  console.log('   User ID:', host.userId)
  console.log('')

  // 2. Find all bookings for this host
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      hostId: host.id
    },
    include: {
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

  console.log(`📋 BOOKINGS FOR THIS HOST: ${bookings.length}\n`)

  if (bookings.length === 0) {
    console.log('❌ No bookings found for this host!')
    return
  }

  // 3. Check each booking for messages
  for (const booking of bookings) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📦 BOOKING: ${booking.bookingCode}`)
    console.log(`   ID: ${booking.id}`)
    console.log(`   Car: ${booking.car.make} ${booking.car.model} ${booking.car.year}`)
    console.log(`   Status: ${booking.status}`)
    console.log(`   Guest Email: ${booking.guestEmail}`)
    console.log(`   Guest Name: ${booking.guestName}`)
    console.log(`   Messages: ${booking.messages.length}`)
    console.log('')

    if (booking.messages.length > 0) {
      console.log('   💬 MESSAGE THREAD:')
      booking.messages.forEach((msg, idx) => {
        console.log(`   ${idx + 1}. [${msg.senderType}] ${msg.senderName}: "${msg.message.substring(0, 50)}..."`)
        console.log(`      └─ ${msg.createdAt.toISOString()} | Read: ${msg.isRead}`)
      })
      console.log('')

      // Count unread messages from guests
      const unreadFromGuest = booking.messages.filter(
        m => !m.isRead && m.senderType !== 'host'
      ).length
      console.log(`   📬 Unread messages from guest: ${unreadFromGuest}`)
      console.log('')
    }

    // 4. Check for guest access token
    const guestToken = await prisma.guestAccessToken.findFirst({
      where: {
        bookingId: booking.id
      }
    })

    if (guestToken) {
      console.log('   🎫 GUEST TOKEN:')
      console.log(`      Token: ${guestToken.token}`)
      console.log(`      Expires: ${guestToken.expiresAt}`)
      console.log(`      Guest URL: http://localhost:3000/rentals/track/${guestToken.token}`)
      console.log('')
    } else {
      console.log('   ⚠️  No guest access token found for this booking')
      console.log('')
    }
  }

  // 5. Get host session token info
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔐 HOST SESSION TOKENS:')
  const hostSession = await prisma.session.findFirst({
    where: {
      userId: host.userId
    },
    orderBy: {
      createdAt: 'desc'
    }
  })

  if (hostSession) {
    console.log('   ✅ Active session found')
    console.log(`   Token (first 20 chars): ${hostSession.token.substring(0, 20)}...`)
    console.log(`   Expires: ${hostSession.expiresAt}`)
    console.log(`   IP: ${hostSession.ipAddress}`)
    console.log('')
    console.log('   Use this in API requests:')
    console.log(`   -H "Cookie: hostAccessToken=${hostSession.token}"`)
    console.log('')
  } else {
    console.log('   ❌ No active session found - need to login')
    console.log('')
  }

  // 6. Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 SUMMARY:')
  const totalMessages = bookings.reduce((sum, b) => sum + b.messages.length, 0)
  const bookingsWithMessages = bookings.filter(b => b.messages.length > 0).length
  console.log(`   Total Bookings: ${bookings.length}`)
  console.log(`   Bookings with Messages: ${bookingsWithMessages}`)
  console.log(`   Total Messages: ${totalMessages}`)
  console.log('')

  // 7. Test the API endpoint
  console.log('🧪 TO TEST THE HOST MESSAGES API:')
  console.log(`curl -X GET "http://localhost:3000/api/host/messages?filter=all" \\`)
  console.log(`  -H "x-host-id: ${host.id}" \\`)
  if (hostSession) {
    console.log(`  -H "Cookie: hostAccessToken=${hostSession.token}" \\`)
  }
  console.log(`  -v`)
  console.log('')

  await prisma.$disconnect()
}

checkHostAndGuestTokens().catch(console.error)
