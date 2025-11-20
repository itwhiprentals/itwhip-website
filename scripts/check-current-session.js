const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function checkCurrentSession() {
  console.log('🔐 CHECKING ACTIVE HOST SESSIONS...\n')

  // Get all active sessions
  const sessions = await prisma.session.findMany({
    where: {
      expiresAt: {
        gt: new Date()
      }
    },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true
        }
      }
    },
    orderBy: {
      createdAt: 'desc'
    },
    take: 10
  })

  console.log(`Found ${sessions.length} active sessions:\n`)

  for (const session of sessions) {
    // Check if this user is a host
    const host = await prisma.rentalHost.findUnique({
      where: { userId: session.user.id },
      select: {
        id: true,
        email: true,
        name: true,
        approvalStatus: true
      }
    })

    if (host) {
      console.log('🏠 HOST SESSION:')
      console.log(`   Host: ${host.name} (${host.email})`)
      console.log(`   Host ID: ${host.id}`)
      console.log(`   Status: ${host.approvalStatus}`)
      console.log(`   Session expires: ${session.expiresAt}`)
      console.log(`   IP: ${session.ipAddress}`)
      console.log(`   Token: ${session.token.substring(0, 30)}...`)
      console.log('')

      // Check bookings
      const bookingCount = await prisma.rentalBooking.count({
        where: { hostId: host.id }
      })
      
      const messagesCount = await prisma.rentalBooking.count({
        where: {
          hostId: host.id,
          messages: {
            some: {}
          }
        }
      })

      console.log(`   📊 Stats:`)
      console.log(`      Total bookings: ${bookingCount}`)
      console.log(`      Bookings with messages: ${messagesCount}`)
      console.log('')
    }
  }

  await prisma.$disconnect()
}

checkCurrentSession().catch(console.error)
