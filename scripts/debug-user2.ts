// scripts/debug-user2.ts
// Check User 2 data

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugUser2() {
  const userId2 = 'cmg3j3ppi0002do48f2253dw7'

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 USER 2 DEBUG')
  console.log(`ID: ${userId2}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // Check User 2
  const user2 = await prisma.user.findUnique({
    where: { id: userId2 },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true
    }
  })

  console.log('User 2:')
  console.log(JSON.stringify(user2, null, 2))
  console.log()

  if (!user2) {
    console.log('❌ User 2 not found!')
    return
  }

  // Check RentalHost for User 2
  const hostByUserId = await prisma.rentalHost.findFirst({
    where: { userId: user2.id },
  })

  const hostByEmail = await prisma.rentalHost.findFirst({
    where: { email: user2.email },
  })

  console.log('RentalHost by userId:', hostByUserId ? '✅ Found' : '❌ Not found')
  console.log('RentalHost by email:', hostByEmail ? '✅ Found' : '❌ Not found')
  console.log()

  // Check ReviewerProfile for User 2
  const guestByUserId = await prisma.reviewerProfile.findFirst({
    where: { userId: user2.id },
  })

  const guestByEmail = await prisma.reviewerProfile.findFirst({
    where: { email: user2.email },
  })

  console.log('ReviewerProfile by userId:', guestByUserId ? '✅ Found' : '❌ Not found')
  console.log('ReviewerProfile by email:', guestByEmail ? '✅ Found' : '❌ Not found')
  console.log()

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('SUMMARY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`User 2 email: ${user2.email}`)
  console.log(`Has RentalHost: ${!!(hostByUserId || hostByEmail)}`)
  console.log(`Has ReviewerProfile: ${!!(guestByUserId || guestByEmail)}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

debugUser2()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
