import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkPremiumHosts() {
  try {
    // Find hosts with PREMIUM earning tier
    const premiumHosts = await prisma.rentalHost.findMany({
      where: { earningsTier: 'PREMIUM' },
      select: {
        id: true,
        email: true,
        name: true,
        earningsTier: true,
        commercialInsuranceStatus: true,
        commercialInsuranceProvider: true
      }
    })
    
    console.log(`\n🔍 HOSTS WITH PREMIUM TIER:`)
    console.log('=' .repeat(60))
    
    if (premiumHosts.length === 0) {
      console.log('No hosts currently have PREMIUM tier set')
    } else {
      premiumHosts.forEach(host => {
        console.log(`\n📌 Host: ${host.name || 'Unnamed'}`)
        console.log(`   ID: ${host.id}`)
        console.log(`   Email: ${host.email}`)
        console.log(`   Tier: ${host.earningsTier}`)
        console.log(`   Commercial Insurance: ${host.commercialInsuranceStatus || 'NOT SET'}`)
        console.log(`   Provider: ${host.commercialInsuranceProvider || 'N/A'}`)
      })
    }
    
    // Also check the host you're logged in as (from the logs)
    const currentHost = await prisma.rentalHost.findUnique({
      where: { id: 'cmfj0oxqm004udomy7qivgt18' },
      select: {
        id: true,
        email: true,
        name: true,
        earningsTier: true,
        commercialInsuranceStatus: true
      }
    })
    
    if (currentHost) {
      console.log(`\n📍 CURRENT LOGGED-IN HOST:`)
      console.log(`   Name: ${currentHost.name}`)
      console.log(`   Email: ${currentHost.email}`)
      console.log(`   Current Tier: ${currentHost.earningsTier || 'NOT SET'}`)
      console.log(`   Commercial Insurance: ${currentHost.commercialInsuranceStatus || 'NOT SET'}`)
    }
    
    console.log('\n' + '=' .repeat(60))
    
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

checkPremiumHosts()
