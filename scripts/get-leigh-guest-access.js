const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function getLeighAccess() {
  console.log('🔍 FINDING LEIGH C. GUEST ACCOUNT...\n')
  
  const guestEmail = 'leigh.c2@guest.itwhip.com'
  
  // Find Leigh's reviewer profile
  const profile = await prisma.reviewerProfile.findUnique({
    where: { email: guestEmail },
    select: {
      id: true,
      email: true,
      name: true,
      phoneNumber: true
    }
  })
  
  if (profile) {
    console.log('✅ GUEST PROFILE FOUND:')
    console.log(`   Name: ${profile.name}`)
    console.log(`   Email: ${profile.email}`)
    console.log(`   Profile ID: ${profile.id}`)
    console.log('')
  }
  
  // Find all bookings for Leigh
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      OR: [
        { guestEmail: guestEmail },
        { reviewerProfileId: profile?.id }
      ]
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
          name: true,
          email: true,
          id: true
        }
      },
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
  
  console.log(`📦 BOOKINGS: ${bookings.length}\n`)
  
  for (const booking of bookings) {
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
    console.log(`📋 BOOKING: ${booking.bookingCode}`)
    console.log(`   ID: ${booking.id}`)
    console.log(`   Car: ${booking.car.make} ${booking.car.model} ${booking.car.year}`)
    console.log(`   Host: ${booking.host.name} (${booking.host.email})`)
    console.log(`   Host ID: ${booking.host.id}`)
    console.log(`   Status: ${booking.status}`)
    console.log(`   Trip Status: ${booking.tripStatus}`)
    console.log(`   Start: ${booking.startDate.toISOString().split('T')[0]}`)
    console.log(`   End: ${booking.endDate.toISOString().split('T')[0]}`)
    console.log(`   Messages: ${booking.messages.length}`)
    console.log('')
    
    if (booking.messages.length > 0) {
      console.log('   💬 MESSAGE THREAD (chronological):')
      booking.messages.forEach((msg, idx) => {
        const time = new Date(msg.createdAt).toLocaleString()
        console.log(`   ${idx + 1}. [${msg.senderType.toUpperCase()}] ${msg.senderName}`)
        console.log(`      "${msg.message.substring(0, 80)}${msg.message.length > 80 ? '...' : ''}"`)
        console.log(`      └─ ${time} | Read: ${msg.isRead} | Urgent: ${msg.isUrgent}`)
        console.log('')
      })
    }
    
    // Check for guest access token
    const token = await prisma.guestAccessToken.findFirst({
      where: { bookingId: booking.id }
    })
    
    if (token) {
      console.log('   🎫 GUEST ACCESS TOKEN:')
      console.log(`      Token: ${token.token}`)
      console.log(`      📱 Guest Tracking URL:`)
      console.log(`      http://192.168.0.97:3001/rentals/track/${token.token}`)
      console.log('')
    } else {
      console.log('   ⚠️  No guest access token - Creating one...')
      const newToken = await prisma.guestAccessToken.create({
        data: {
          token: 'guest-' + Math.random().toString(36).substring(7),
          bookingId: booking.id,
          email: guestEmail,
          expiresAt: new Date('2025-12-31')
        }
      })
      console.log(`   ✅ Created token: ${newToken.token}`)
      console.log(`   📱 Guest Tracking URL:`)
      console.log(`   http://192.168.0.97:3001/rentals/track/${newToken.token}`)
      console.log('')
    }
    
    console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
  }
  
  // Also check if Leigh can login directly
  console.log('🔐 CHECKING LEIGH\'S LOGIN ACCESS:')
  const user = await prisma.user.findUnique({
    where: { email: guestEmail },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true
    }
  })
  
  if (user) {
    console.log('   ✅ Leigh has a User account (can login directly)')
    console.log(`   User ID: ${user.id}`)
    console.log(`   Role: ${user.role}`)
    console.log(`   Has password: ${!!user.passwordHash}`)
    console.log('')
    console.log('   🌐 Login at: http://192.168.0.97:3001/rentals/login')
    console.log('   Or guest dashboard: http://192.168.0.97:3001/rentals/dashboard')
  } else {
    console.log('   ℹ️  Leigh is a guest-only user (uses token access)')
  }
  
  await prisma.$disconnect()
}

getLeighAccess().catch(console.error)
