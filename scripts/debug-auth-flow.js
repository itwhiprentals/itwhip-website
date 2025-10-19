const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function debugAuthFlow() {
  console.log('=== DEBUGGING LEIGH AUTH FLOW ===\n')
  
  try {
    // 1. Check Leigh's User record
    const leigh = await prisma.user.findUnique({
      where: { email: 'leigh.c2@guest.itwhip.com' },
      select: {
        id: true,
        email: true,
        role: true,
        reviewerProfile: {
          select: {
            id: true,
            bookings: {
              select: {
                id: true,
                bookingCode: true,
                guestEmail: true,
                renterId: true,
                status: true
              }
            }
          }
        }
      }
    })
    
    console.log('=== LEIGH USER ACCOUNT ===')
    console.log('User ID:', leigh.id)
    console.log('Email:', leigh.email)
    console.log('Role:', leigh.role)
    
    // 2. Check Sessions for Leigh
    const sessions = await prisma.session.findMany({
      where: { userId: leigh.id },
      select: {
        id: true,
        token: true,
        refreshToken: true,
        expiresAt: true,
        createdAt: true
      },
      orderBy: { createdAt: 'desc' },
      take: 3
    })
    
    console.log('\n=== ACTIVE SESSIONS ===')
    console.log(`Found ${sessions.length} sessions`)
    sessions.forEach((s, i) => {
      console.log(`Session ${i + 1}:`)
      console.log('  Token exists:', !!s.token)
      console.log('  RefreshToken exists:', !!s.refreshToken)
      console.log('  Expires:', s.expiresAt)
      console.log('  Valid:', s.expiresAt > new Date())
    })
    
    // 3. Check Bookings linked to Leigh
    const bookingsByEmail = await prisma.rentalBooking.findMany({
      where: { guestEmail: 'leigh.c2@guest.itwhip.com' },
      select: {
        id: true,
        bookingCode: true,
        guestEmail: true,
        renterId: true,
        status: true,
        car: {
          select: {
            make: true,
            model: true,
            year: true
          }
        }
      }
    })
    
    console.log('\n=== BOOKINGS BY EMAIL ===')
    console.log(`Found ${bookingsByEmail.length} bookings with guestEmail: leigh.c2@guest.itwhip.com`)
    bookingsByEmail.forEach((b, i) => {
      console.log(`${i + 1}. ${b.bookingCode}`)
      console.log(`   Car: ${b.car.year} ${b.car.make} ${b.car.model}`)
      console.log(`   RenterId: ${b.renterId || 'NULL (not linked to User)'}`)
      console.log(`   Status: ${b.status}`)
    })
    
    // 4. Check if renterId needs to be set
    const bookingsWithoutRenter = bookingsByEmail.filter(b => !b.renterId)
    
    if (bookingsWithoutRenter.length > 0) {
      console.log('\n=== ISSUE FOUND ===')
      console.log(`❌ ${bookingsWithoutRenter.length} bookings have no renterId`)
      console.log('These bookings are not linked to the User account!')
      console.log('\n=== FIX NEEDED ===')
      console.log('Update bookings to link them to User ID:')
      console.log(`UPDATE RentalBooking SET renterId = '${leigh.id}' WHERE guestEmail = 'leigh.c2@guest.itwhip.com';`)
    } else {
      console.log('\n✅ All bookings are properly linked')
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

debugAuthFlow()
