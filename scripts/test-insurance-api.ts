import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

// Simulate the tier calculation
function calculateHostTier(host: any) {
  const hasActiveCommercial = host.commercialInsuranceStatus === 'ACTIVE';
  const hasActiveP2P = host.p2pInsuranceStatus === 'ACTIVE';
  
  if (hasActiveCommercial) {
    return {
      tier: 'PREMIUM',
      hostEarnings: 0.90,
      platformCommission: 0.10,
      source: 'COMMERCIAL'
    };
  } else if (hasActiveP2P) {
    return {
      tier: 'STANDARD',
      hostEarnings: 0.75,
      platformCommission: 0.25,
      source: 'P2P'
    };
  } else {
    return {
      tier: 'BASIC',
      hostEarnings: 0.40,
      platformCommission: 0.60,
      source: 'NONE'
    };
  }
}

async function testInsuranceAPI() {
  const hostId = 'cmfj0oxqm004udomy7qivgt18';
  
  console.log('========================================');
  console.log('🔍 TESTING INSURANCE API RESPONSE');
  console.log('========================================\n');
  
  try {
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        earningsTier: true,
        insuranceType: true,
        revenueSplit: true,
        p2pInsuranceStatus: true,
        p2pInsuranceProvider: true,
        commercialInsuranceStatus: true,
        commercialInsuranceProvider: true,
        hostInsuranceStatus: true,
        usingLegacyInsurance: true
      }
    });
    
    if (!host) {
      console.log('❌ Host not found');
      return;
    }
    
    // Calculate tier (like the API does)
    const currentTier = calculateHostTier(host);
    
    console.log('📊 DATABASE VALUES:');
    console.log('----------------------------------------');
    console.log(`   earningsTier: ${host.earningsTier}`);
    console.log(`   insuranceType: ${host.insuranceType || 'none'}`);
    console.log(`   revenueSplit: ${host.revenueSplit}%`);
    console.log('\n');
    
    console.log('🎯 CALCULATED VALUES (What API Returns):');
    console.log('----------------------------------------');
    console.log(`   currentTier: ${currentTier.tier}`);
    console.log(`   hostEarnings: ${currentTier.hostEarnings * 100}%`);
    console.log(`   source: ${currentTier.source}`);
    console.log('\n');
    
    console.log('🔍 INSURANCE STATUSES:');
    console.log('----------------------------------------');
    console.log(`   Commercial Status: ${host.commercialInsuranceStatus}`);
    console.log(`   Commercial Provider: ${host.commercialInsuranceProvider || 'None'}`);
    console.log(`   P2P Status: ${host.p2pInsuranceStatus}`);
    console.log(`   P2P Provider: ${host.p2pInsuranceProvider || 'None'}`);
    console.log('\n');
    
    // Simulate what the UI would show
    const uiWouldShow = {
      tier: currentTier.tier,
      percentage: currentTier.hostEarnings * 100,
      insuranceType: currentTier.source.toLowerCase()
    };
    
    console.log('💻 WHAT UI WOULD DISPLAY:');
    console.log('----------------------------------------');
    console.log(`   Tier: ${uiWouldShow.tier}`);
    console.log(`   Earnings: ${uiWouldShow.percentage}%`);
    console.log(`   Insurance Type: ${uiWouldShow.insuranceType}`);
    console.log('\n');
    
    const needsFix = 
      host.earningsTier !== currentTier.tier ||
      host.insuranceType !== currentTier.source.toLowerCase() ||
      host.revenueSplit !== currentTier.hostEarnings * 100;
    
    if (needsFix) {
      console.log('⚠️ DATABASE FIELDS INCONSISTENT!');
      console.log('   The UI is calculating correctly from status fields,');
      console.log('   but the stored values are wrong.');
      console.log('\n   To fix, run: npx ts-node scripts/recalculate-host-tier.ts');
    } else {
      console.log('✅ All fields are consistent!');
    }
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testInsuranceAPI();
