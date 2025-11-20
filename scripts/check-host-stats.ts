// scripts/check-host-stats.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkHostStats() {
  const hostId = 'cmfj0oxqm004udomy7qivgt18'
  
  console.log('🔍 Checking host statistics...\n')

  // Get host info
  const host = await prisma.rentalHost.findUnique({
    where: { id: hostId },
    select: {
      id: true,
      name: true,
      createdAt: true,
      suspendedAt: true,
    }
  })

  if (!host) {
    console.log('❌ Host not found')
    return
  }

  console.log('👤 Host:', host.name)
  console.log('📅 Joined:', host.createdAt.toLocaleDateString())
  console.log('⚠️  Suspended:', host.suspendedAt ? 'YES' : 'NO')
  console.log('')

  // Get all bookings
  const allBookings = await prisma.rentalBooking.findMany({
    where: { hostId },
    select: {
      id: true,
      status: true,
      startDate: true,
      cancelledBy: true,
    },
    orderBy: { startDate: 'asc' }
  })

  const completed = allBookings.filter(b => b.status === 'COMPLETED')
  const hostCancelled = allBookings.filter(b => b.status === 'CANCELLED' && b.cancelledBy === 'HOST')

  console.log('📊 ALL TIME STATS:')
  console.log('   Total Bookings:', allBookings.length)
  console.log('   Completed:', completed.length)
  console.log('   Host Cancelled:', hostCancelled.length)
  console.log('')

  if (completed.length > 0) {
    const firstBooking = completed[0].startDate
    const daysSinceFirst = Math.floor((Date.now() - firstBooking.getTime()) / (1000 * 60 * 60 * 24))
    
    console.log('🎯 QUALIFICATION DATA:')
    console.log('   First Booking:', firstBooking.toLocaleDateString())
    console.log('   Days Since First:', daysSinceFirst, 'days')
    console.log('   6 Months Active?', daysSinceFirst >= 180 ? '✅ YES' : `❌ NO (${180 - daysSinceFirst} days left)`)
    console.log('')

    // Last 6 months
    const sixMonthsAgo = new Date()
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6)

    const recentCompleted = completed.filter(b => b.startDate >= sixMonthsAgo)
    const recentCancelled = hostCancelled.filter(b => b.startDate >= sixMonthsAgo)

    console.log('📅 LAST 6 MONTHS:')
    console.log('   Completed Trips:', recentCompleted.length)
    console.log('   Host Cancellations:', recentCancelled.length)
    console.log('')

    console.log('🏆 PATH A QUALIFICATION (6 months + 10 trips):')
    console.log('   Time Requirement:', daysSinceFirst >= 180 ? '✅ MET' : '❌ NOT MET')
    console.log('   Trip Requirement:', recentCompleted.length >= 10 ? '✅ MET' : `❌ NOT MET (${recentCompleted.length}/10)`)
    console.log('   Cancellations:', recentCancelled.length <= 3 ? '✅ OK' : '❌ TOO MANY')
    console.log('   Warnings:', !host.suspendedAt ? '✅ NONE' : '❌ HAS WARNINGS')
    const pathA = (daysSinceFirst >= 180) && (recentCompleted.length >= 10) && (recentCancelled.length <= 3) && !host.suspendedAt
    console.log('   Result:', pathA ? '✅ QUALIFIED' : '❌ NOT QUALIFIED')
    console.log('')

    console.log('🏆 PATH B QUALIFICATION (50 trips in 6 months):')
    console.log('   Trip Requirement:', recentCompleted.length >= 50 ? '✅ MET' : `❌ NOT MET (${recentCompleted.length}/50)`)
    console.log('   Cancellations:', recentCancelled.length <= 3 ? '✅ OK' : '❌ TOO MANY')
    console.log('   Warnings:', !host.suspendedAt ? '✅ NONE' : '❌ HAS WARNINGS')
    const pathB = (recentCompleted.length >= 50) && (recentCancelled.length <= 3) && !host.suspendedAt
    console.log('   Result:', pathB ? '✅ QUALIFIED' : '❌ NOT QUALIFIED')
    console.log('')

    if (pathA || pathB) {
      console.log('💰 LOSS WAGE PAYOUT:')
      const dailyRate = 299 // From booking
      const payout = Math.floor(dailyRate * 0.25 * 10)
      console.log('   Daily Rate: $' + dailyRate)
      console.log('   25% of Daily: $' + Math.floor(dailyRate * 0.25))
      console.log('   Payout (10 days): $' + payout)
    } else {
      console.log('💰 LOSS WAGE PAYOUT: Not qualified yet')
    }
  } else {
    console.log('❌ No completed bookings found')
  }

  await prisma.$disconnect()
}

checkHostStats()