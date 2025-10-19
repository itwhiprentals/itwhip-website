import prisma from '../app/lib/database/prisma'
import { calculateHostTier, getInsuranceStatuses } from '../app/lib/insurance/tier-calculator'

async function debugHostProfile(hostId: string) {
  const host = await prisma.rentalHost.findUnique({
    where: { id: hostId },
    include: {
      user: true,
      insuranceProvider: true
    }
  })
  
  if (!host) {
    console.log('Host not found')
    return
  }
  
  const currentTier = calculateHostTier(host)
  const statuses = getInsuranceStatuses(host)
  
  console.log('\n📊 What HostInsuranceSection should receive:')
  console.log('==========================================')
  console.log('Profile prop:')
  console.log({
    id: host.id,
    earningsTier: host.earningsTier,
    usingLegacyInsurance: host.usingLegacyInsurance,
    // P2P
    p2pInsuranceStatus: host.p2pInsuranceStatus,
    p2pInsuranceProvider: host.p2pInsuranceProvider,
    p2pPolicyNumber: host.p2pPolicyNumber,
    p2pInsuranceExpires: host.p2pInsuranceExpires,
    // Commercial
    commercialInsuranceStatus: host.commercialInsuranceStatus,
    commercialInsuranceProvider: host.commercialInsuranceProvider,
    commercialPolicyNumber: host.commercialPolicyNumber,
    commercialInsuranceExpires: host.commercialInsuranceExpires,
    // Legacy
    hostInsuranceStatus: host.hostInsuranceStatus,
    hostInsuranceProvider: host.hostInsuranceProvider,
    hostPolicyNumber: host.hostPolicyNumber,
    hostInsuranceExpires: host.hostInsuranceExpires
  })
  
  console.log('\n🎯 Calculated values:')
  console.log('Current Tier:', currentTier)
  console.log('\nInsurance Statuses:', statuses)
}

debugHostProfile('cmfj0oxqm004udomy7qivgt18')
  .then(() => process.exit(0))
  .catch(console.error)
