import prisma from '../app/lib/database/prisma'

async function inspectHosts() {
  console.log('🔍 Inspecting Host Data...\n')
  
  // Get sample of hosts to see their current state
  const hosts = await prisma.rentalHost.findMany({
    take: 5,
    select: {
      id: true,
      email: true,
      earningsTier: true,
      usingLegacyInsurance: true,
      hostInsuranceStatus: true,
      p2pInsuranceStatus: true,
      commercialInsuranceStatus: true,
      p2pInsuranceProvider: true,
      commercialInsuranceProvider: true,
      hostType: true,
      approvalStatus: true
    }
  })
  
  console.log('Sample Hosts:', JSON.stringify(hosts, null, 2))
  
  // Count by tier
  const tierCounts = await prisma.rentalHost.groupBy({
    by: ['earningsTier'],
    _count: true
  })
  
  console.log('\n📊 Hosts by Tier:')
  tierCounts.forEach(t => {
    console.log(`   ${t.earningsTier}: ${t._count} hosts`)
  })
  
  // Count by insurance status
  const withP2P = await prisma.rentalHost.count({
    where: { p2pInsuranceStatus: 'ACTIVE' }
  })
  
  const withCommercial = await prisma.rentalHost.count({
    where: { commercialInsuranceStatus: 'ACTIVE' }
  })
  
  const withLegacy = await prisma.rentalHost.count({
    where: { hostInsuranceStatus: 'ACTIVE' }
  })
  
  console.log('\n📋 Insurance Status:')
  console.log(`   Legacy Insurance: ${withLegacy} hosts`)
  console.log(`   P2P Insurance: ${withP2P} hosts`)
  console.log(`   Commercial Insurance: ${withCommercial} hosts`)
}

inspectHosts()
  .then(() => process.exit(0))
  .catch(console.error)
