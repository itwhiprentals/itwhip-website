const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function compareAccounts() {
  console.log('=== COMPARING USER ACCOUNTS ===\n')
  
  try {
    // Get the working account
    const workingUser = await prisma.user.findUnique({
      where: { email: 'me@me.com' },
      include: {
        reviewerProfile: true,
        rentalHost: true
      }
    })
    
    // Get the problematic guest account
    const guestUser = await prisma.user.findUnique({
      where: { email: 'leigh.c2@guest.itwhip.com' },
      include: {
        reviewerProfile: true,
        rentalHost: true
      }
    })
    
    console.log('=== WORKING ACCOUNT (me@me.com) ===')
    console.log('ID:', workingUser?.id)
    console.log('Role:', workingUser?.role)
    console.log('Email Verified:', workingUser?.emailVerified)
    console.log('Phone Verified:', workingUser?.phoneVerified)
    console.log('Is Active:', workingUser?.isActive)
    console.log('Has ReviewerProfile:', !!workingUser?.reviewerProfile)
    console.log('Has RentalHost:', !!workingUser?.rentalHost)
    console.log('Created:', workingUser?.createdAt)
    
    console.log('\n=== GUEST ACCOUNT (leigh.c2) ===')
    console.log('ID:', guestUser?.id)
    console.log('Role:', guestUser?.role)
    console.log('Email Verified:', guestUser?.emailVerified)
    console.log('Phone Verified:', guestUser?.phoneVerified)
    console.log('Is Active:', guestUser?.isActive)
    console.log('Has ReviewerProfile:', !!guestUser?.reviewerProfile)
    console.log('Has RentalHost:', !!guestUser?.rentalHost)
    console.log('Created:', guestUser?.createdAt)
    
    console.log('\n=== KEY DIFFERENCES ===')
    if (workingUser?.role !== guestUser?.role) {
      console.log(`Role: ${workingUser?.role} vs ${guestUser?.role}`)
    }
    
    // Check what fields are different
    const fields = ['name', 'phone', 'avatar', 'jobTitle', 'hotelId']
    fields.forEach(field => {
      if (workingUser?.[field] !== guestUser?.[field]) {
        console.log(`${field}: "${workingUser?.[field]}" vs "${guestUser?.[field]}"`)
      }
    })
    
    // Check for any null/undefined critical fields in guest
    console.log('\n=== POTENTIAL ISSUES ===')
    if (!guestUser?.name) console.log('❌ Guest missing name')
    if (guestUser?.role === 'ANONYMOUS') console.log('❌ Guest has ANONYMOUS role (might need GUEST or STARTER)')
    if (!guestUser?.emailVerified) console.log('⚠️ Guest email not verified')
    if (!guestUser?.phoneVerified) console.log('⚠️ Guest phone not verified')
    
    console.log('\n=== FIX SUGGESTION ===')
    if (guestUser?.role === 'ANONYMOUS') {
      console.log('Update guest role to match working account:')
      console.log(`UPDATE User SET role = '${workingUser?.role || 'GUEST'}' WHERE email = 'leigh.c2@guest.itwhip.com';`)
    }
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

compareAccounts()
