// Check recent SMS logs for failures
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 Checking recent SMS logs...\n')

  // Get recent SMS logs
  const recentSms = await prisma.smsLog.findMany({
    where: {
      type: 'SYSTEM',
      createdAt: {
        gte: new Date(Date.now() - 24 * 60 * 60 * 1000) // Last 24 hours
      }
    },
    orderBy: { createdAt: 'desc' },
    take: 10,
    select: {
      id: true,
      to: true,
      status: true,
      type: true,
      errorCode: true,
      errorMessage: true,
      twilioSid: true,
      createdAt: true,
      hostId: true,
    }
  })

  console.log(`Found ${recentSms.length} SYSTEM SMS in last 24h:\n`)

  for (const sms of recentSms) {
    console.log(`[${sms.createdAt.toISOString()}] ${sms.status}`)
    console.log(`  To: ${sms.to}`)
    console.log(`  Type: ${sms.type}`)
    console.log(`  SID: ${sms.twilioSid || 'none'}`)
    if (sms.errorMessage) {
      console.log(`  ❌ Error: ${sms.errorMessage} (${sms.errorCode})`)
    }
    console.log()
  }

  // Check host phone numbers
  console.log('\n📞 Checking hosts with vehicles...\n')
  const hosts = await prisma.rentalHost.findMany({
    where: {
      cars: {
        some: {}
      }
    },
    select: {
      id: true,
      name: true,
      email: true,
      phone: true,
      _count: {
        select: { cars: true }
      }
    },
    take: 5
  })

  for (const host of hosts) {
    console.log(`${host.name} (${host._count.cars} cars)`)
    console.log(`  Email: ${host.email}`)
    console.log(`  Phone: ${host.phone || '❌ MISSING'}`)
    console.log()
  }
}

main().finally(() => prisma.$disconnect())
