import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Import the tier calculator (we'll simulate it here since we can't import directly)
function calculateHostTier(host: any) {
  const hasActiveCommercial = host.commercialInsuranceStatus === 'ACTIVE';
  const hasActiveP2P = host.p2pInsuranceStatus === 'ACTIVE';
  
  if (hasActiveCommercial) {
    return {
      tier: 'PREMIUM',
      hostEarnings: 0.90,
      platformCommission: 0.10,
      source: 'COMMERCIAL',
      insuranceType: 'commercial'
    };
  } else if (hasActiveP2P) {
    return {
      tier: 'STANDARD',
      hostEarnings: 0.75,
      platformCommission: 0.25,
      source: 'P2P',
      insuranceType: 'p2p'
    };
  } else {
    return {
      tier: 'BASIC',
      hostEarnings: 0.40,
      platformCommission: 0.60,
      source: 'NONE',
      insuranceType: 'none'
    };
  }
}

async function recalculateHostTier() {
  const hostId = 'cmfj0oxqm004udomy7qivgt18';
  
  console.log('========================================');
  console.log('🔄 RECALCULATING HOST TIER');
  console.log('========================================\n');
  
  try {
    // 1. Get current host data
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        earningsTier: true,
        insuranceType: true,
        revenueSplit: true,
        p2pInsuranceStatus: true,
        p2pInsuranceActive: true,
        p2pInsuranceProvider: true,
        commercialInsuranceStatus: true,
        commercialInsuranceActive: true,
        commercialInsuranceProvider: true,
        hostInsuranceStatus: true,
        usingLegacyInsurance: true
      }
    });
    
    if (!host) {
      console.log('❌ Host not found');
      return;
    }
    
    console.log('📊 CURRENT STATE:');
    console.log('----------------------------------------');
    console.log(`   Host: ${host.name}`);
    console.log(`   Current Tier: ${host.earningsTier}`);
    console.log(`   Current Insurance Type: ${host.insuranceType || 'none'}`);
    console.log(`   Current Revenue Split: ${host.revenueSplit}%`);
    console.log('\n   Insurance Statuses:');
    console.log(`     P2P Status: ${host.p2pInsuranceStatus}`);
    console.log(`     P2P Provider: ${host.p2pInsuranceProvider || 'None'}`);
    console.log(`     Commercial Status: ${host.commercialInsuranceStatus}`);
    console.log(`     Commercial Provider: ${host.commercialInsuranceProvider || 'None'}`);
    console.log('\n');
    
    // 2. Calculate what the tier SHOULD be
    const calculatedTier = calculateHostTier(host);
    
    console.log('🎯 CALCULATED TIER:');
    console.log('----------------------------------------');
    console.log(`   Should Be Tier: ${calculatedTier.tier}`);
    console.log(`   Should Be Insurance Type: ${calculatedTier.insuranceType}`);
    console.log(`   Should Be Revenue Split: ${calculatedTier.hostEarnings * 100}%`);
    console.log(`   Source: ${calculatedTier.source}`);
    console.log('\n');
    
    // 3. Check if update is needed
    const needsUpdate = 
      host.earningsTier !== calculatedTier.tier ||
      host.insuranceType !== calculatedTier.insuranceType ||
      host.revenueSplit !== (calculatedTier.hostEarnings * 100);
    
    if (!needsUpdate) {
      console.log('✅ Tier is already correct!');
      return;
    }
    
    // 4. Update the host with correct values
    console.log('🔧 UPDATING HOST:');
    console.log('----------------------------------------');
    
    const updatedHost = await prisma.rentalHost.update({
      where: { id: hostId },
      data: {
        earningsTier: calculatedTier.tier as any,
        insuranceType: calculatedTier.insuranceType,
        revenueSplit: calculatedTier.hostEarnings * 100,
        // Also sync the active flags based on status
        commercialInsuranceActive: host.commercialInsuranceStatus === 'ACTIVE',
        p2pInsuranceActive: host.p2pInsuranceStatus === 'ACTIVE',
        lastTierChange: new Date(),
        tierChangeReason: 'System recalculation based on insurance status',
        tierChangeBy: 'system_recalculation',
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Host updated successfully');
    console.log('\n');
    
    // 5. Log the activity
    await prisma.activityLog.create({
      data: {
        entityType: 'HOST',
        entityId: hostId,
        hostId: hostId,
        action: 'TIER_RECALCULATED',
        category: 'INSURANCE',
        severity: 'INFO',
        oldValue: JSON.stringify({
          earningsTier: host.earningsTier,
          insuranceType: host.insuranceType,
          revenueSplit: host.revenueSplit
        }),
        newValue: JSON.stringify({
          earningsTier: calculatedTier.tier,
          insuranceType: calculatedTier.insuranceType,
          revenueSplit: calculatedTier.hostEarnings * 100
        }),
        metadata: JSON.stringify({
          description: `Tier recalculated from ${host.earningsTier} to ${calculatedTier.tier}`,
          reason: 'system_recalculation',
          source: calculatedTier.source,
          timestamp: new Date().toISOString()
        })
      }
    });
    
    console.log('📊 FINAL STATE:');
    console.log('----------------------------------------');
    console.log(`   Tier: ${updatedHost.earningsTier}`);
    console.log(`   Insurance Type: ${updatedHost.insuranceType}`);
    console.log(`   Revenue Split: ${updatedHost.revenueSplit}%`);
    console.log(`   Commercial Active: ${updatedHost.commercialInsuranceActive}`);
    console.log(`   P2P Active: ${updatedHost.p2pInsuranceActive}`);
    console.log('\n');
    
    // 6. Fix vehicle claim status
    console.log('🚗 CHECKING VEHICLE CLAIM STATUS:');
    console.log('----------------------------------------');
    
    const activeClaim = await prisma.claim.findFirst({
      where: {
        booking: {
          carId: 'cmfn3fdhf0001l8040ao0a3h8'
        },
        status: {
          in: ['PENDING', 'UNDER_REVIEW', 'GUEST_RESPONSE_PENDING']
        }
      }
    });
    
    if (activeClaim) {
      await prisma.rentalCar.update({
        where: { id: 'cmfn3fdhf0001l8040ao0a3h8' },
        data: {
          hasActiveClaim: true,
          activeClaimId: activeClaim.id,
          isActive: false,
          updatedAt: new Date()
        }
      });
      console.log('✅ Vehicle claim status updated');
      console.log(`   Active Claim: ${activeClaim.id}`);
      console.log(`   Vehicle Status: INACTIVE (due to claim)`);
    } else {
      console.log('⚠️ No active claims found but vehicle is inactive');
      console.log('   Vehicle may be manually deactivated');
    }
    
    console.log('\n');
    console.log('========================================');
    console.log('✅ TIER RECALCULATION COMPLETE!');
    console.log('========================================');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

recalculateHostTier();
