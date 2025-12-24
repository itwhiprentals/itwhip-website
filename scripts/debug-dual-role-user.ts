// scripts/debug-dual-role-user.ts
// Debug script to investigate dual-role user data structure

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function debugDualRoleUser() {
  const targetEmail = 'hxris007@gmail.com'

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🔍 DUAL-ROLE USER DEBUG')
  console.log(`📧 Email: ${targetEmail}`)
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')

  // 1. Find User record
  console.log('1️⃣ Checking User table...')
  const user = await prisma.user.findUnique({
    where: { email: targetEmail },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      emailVerified: true
    }
  })

  if (!user) {
    console.log('❌ User not found!')
    return
  }

  console.log('✅ User found:')
  console.log(JSON.stringify(user, null, 2))
  console.log()

  // 2. Find RentalHost record
  console.log('2️⃣ Checking RentalHost table...')

  // Try by userId
  const hostByUserId = await prisma.rentalHost.findFirst({
    where: { userId: user.id },
    select: {
      id: true,
      userId: true,
      email: true,
      name: true,
      phone: true,
      approvalStatus: true,
      approvedAt: true
    }
  })

  // Try by email
  const hostByEmail = await prisma.rentalHost.findFirst({
    where: { email: targetEmail },
    select: {
      id: true,
      userId: true,
      email: true,
      name: true,
      phone: true,
      approvalStatus: true,
      approvedAt: true
    }
  })

  console.log('By userId:', hostByUserId ? '✅ Found' : '❌ Not found')
  if (hostByUserId) {
    console.log(JSON.stringify(hostByUserId, null, 2))
  }

  console.log('\nBy email:', hostByEmail ? '✅ Found' : '❌ Not found')
  if (hostByEmail && hostByEmail.id !== hostByUserId?.id) {
    console.log('⚠️  DIFFERENT RECORD THAN USERID QUERY!')
    console.log(JSON.stringify(hostByEmail, null, 2))
  }
  console.log()

  // 3. Find ReviewerProfile record
  console.log('3️⃣ Checking ReviewerProfile table...')

  // Try by userId (findUnique)
  let guestByUserId
  try {
    guestByUserId = await prisma.reviewerProfile.findUnique({
      where: { userId: user.id },
      select: {
        id: true,
        userId: true,
        email: true,
        name: true,
        phoneNumber: true,
        profilePhotoUrl: true
      }
    })
  } catch (err: any) {
    console.log('❌ findUnique by userId failed:', err.message)
  }

  // Try by userId (findFirst)
  const guestByUserIdFirst = await prisma.reviewerProfile.findFirst({
    where: { userId: user.id },
    select: {
      id: true,
      userId: true,
      email: true,
      name: true,
      phoneNumber: true,
      profilePhotoUrl: true
    }
  })

  // Try by email
  const guestByEmail = await prisma.reviewerProfile.findFirst({
    where: { email: targetEmail },
    select: {
      id: true,
      userId: true,
      email: true,
      name: true,
      phoneNumber: true,
      profilePhotoUrl: true
    }
  })

  console.log('By userId (findUnique):', guestByUserId ? '✅ Found' : '❌ Not found')
  if (guestByUserId) {
    console.log(JSON.stringify(guestByUserId, null, 2))
  }

  console.log('\nBy userId (findFirst):', guestByUserIdFirst ? '✅ Found' : '❌ Not found')
  if (guestByUserIdFirst) {
    console.log(JSON.stringify(guestByUserIdFirst, null, 2))
  }

  console.log('\nBy email:', guestByEmail ? '✅ Found' : '❌ Not found')
  if (guestByEmail) {
    console.log(JSON.stringify(guestByEmail, null, 2))
    if (guestByEmail.id !== guestByUserId?.id && guestByEmail.id !== guestByUserIdFirst?.id) {
      console.log('⚠️  DIFFERENT RECORD THAN USERID QUERY!')
    }
  }
  console.log()

  // 4. Summary
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📊 SUMMARY')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log(`User ID: ${user.id}`)
  console.log(`Has Host Profile: ${!!(hostByUserId || hostByEmail)}`)
  console.log(`Has Guest Profile: ${!!(guestByUserId || guestByUserIdFirst || guestByEmail)}`)
  console.log(`\nHost userId matches User: ${hostByUserId?.userId === user.id}`)
  console.log(`Guest userId matches User: ${(guestByUserId?.userId || guestByUserIdFirst?.userId) === user.id}`)

  if (!guestByUserId && !guestByUserIdFirst && guestByEmail) {
    console.log('\n⚠️  ISSUE IDENTIFIED:')
    console.log('ReviewerProfile exists with matching email but DIFFERENT userId!')
    console.log(`Expected userId: ${user.id}`)
    console.log(`Actual userId: ${guestByEmail.userId}`)
  }

  if (!guestByEmail && !guestByUserId && !guestByUserIdFirst) {
    console.log('\n⚠️  ISSUE IDENTIFIED:')
    console.log('No ReviewerProfile found for this user!')
    console.log('User might not have signed up as a guest yet.')
  }

  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n')
}

debugDualRoleUser()
  .then(() => {
    console.log('✅ Debug complete')
    process.exit(0)
  })
  .catch((error) => {
    console.error('❌ Debug failed:', error)
    process.exit(1)
  })
