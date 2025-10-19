const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixGuestRoles() {
  console.log('=== FIXING GUEST ACCOUNT ROLES ===\n')
  
  try {
    // Update all guest accounts from ANONYMOUS to CLAIMED
    const result = await prisma.user.updateMany({
      where: {
        email: {
          contains: '@guest.itwhip.com'
        },
        role: 'ANONYMOUS'
      },
      data: {
        role: 'CLAIMED'
      }
    })
    
    console.log(`✅ Updated ${result.count} guest accounts from ANONYMOUS to CLAIMED role`)
    
    // Verify Leigh's account specifically
    const leigh = await prisma.user.findUnique({
      where: { email: 'leigh.c2@guest.itwhip.com' },
      select: {
        email: true,
        role: true,
        name: true
      }
    })
    
    console.log('\n=== VERIFICATION ===')
    console.log(`Leigh's account:`)
    console.log(`Email: ${leigh.email}`)
    console.log(`Role: ${leigh.role}`)
    console.log(`Name: ${leigh.name}`)
    
    console.log('\n✅ Guest accounts fixed! Try logging in again.')
    console.log('Email: leigh.c2@guest.itwhip.com')
    console.log('Password: TestGuest123!')
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

fixGuestRoles()
