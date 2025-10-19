// scripts/fix-dual-active-insurance.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function fixDualActiveInsurance() {
  console.log('🔍 Finding hosts with both insurances ACTIVE...')
  
  const hosts = await prisma.rentalHost.findMany({
    where: {
      AND: [
        { commercialInsuranceStatus: 'ACTIVE' },
        { 
          OR: [
            { p2pInsuranceStatus: 'ACTIVE' },
            { hostInsuranceStatus: 'ACTIVE' }
          ]
        }
      ]
    },
    select: {
      id: true,
      name: true,
      email: true,
      p2pInsuranceStatus: true,
      commercialInsuranceStatus: true,
      usingLegacyInsurance: true
    }
  })
  
  console.log(`Found ${hosts.length} hosts with dual ACTIVE insurance`)
  
  for (const host of hosts) {
    console.log(`\n🔄 Fixing ${host.name} (${host.email})`)
    console.log(`   Before: P2P=${host.p2pInsuranceStatus}, Commercial=${host.commercialInsuranceStatus}`)
    
    // Set P2P to INACTIVE since Commercial should take priority
    const updateData: any = {
      p2pInsuranceStatus: 'INACTIVE'
    }
    
    if (host.usingLegacyInsurance) {
      updateData.hostInsuranceStatus = 'INACTIVE'
    }
    
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: updateData
    })
    
    console.log(`   After: P2P=INACTIVE, Commercial=ACTIVE ✅`)
  }
  
  console.log(`\n✅ Fixed ${hosts.length} hosts!`)
}

fixDualActiveInsurance()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('❌ Error:', error)
    process.exit(1)
  })