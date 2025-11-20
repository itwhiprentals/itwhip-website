import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runCompleteHostTest() {
  const hostId = 'cmfj0oxqm004udomy7qivgt18';
  const carId = 'cmfn3fdhf0001l8040ao0a3h8';
  
  console.log('========================================');
  console.log('🚀 COMPLETE HOST SYSTEM TEST');
  console.log('========================================\n');
  
  try {
    // 1. HOST PROFILE & VERIFICATION
    console.log('👤 TEST 1: HOST PROFILE & VERIFICATION');
    console.log('----------------------------------------');
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        name: true,
        email: true,
        isVerified: true,
        verificationLevel: true,
        approvalStatus: true,
        documentsVerified: true,
        governmentIdUrl: true,
        driversLicenseUrl: true,
        insuranceDocUrl: true,
        backgroundCheckStatus: true,
        active: true,
        suspendedAt: true,
        totalTrips: true,
        rating: true,
        responseRate: true,
        acceptanceRate: true
      }
    });
    
    console.log('✅ Host Profile:');
    console.log(`   Name: ${host?.name}`);
    console.log(`   Email: ${host?.email}`);
    console.log(`   Verified: ${host?.isVerified ? 'YES' : 'NO'}`);
    console.log(`   Verification Level: ${host?.verificationLevel || 'NONE'}`);
    console.log(`   Approval Status: ${host?.approvalStatus}`);
    console.log(`   Documents Verified: ${host?.documentsVerified ? 'YES' : 'NO'}`);
    console.log(`   Background Check: ${host?.backgroundCheckStatus || 'NOT DONE'}`);
    console.log(`   Active: ${host?.active ? 'YES' : 'NO'}`);
    console.log(`   Total Trips: ${host?.totalTrips}`);
    console.log(`   Rating: ${host?.rating || 0}/5`);
    console.log('\n');
    
    // 2. INSURANCE & EARNINGS TIER
    console.log('🛡️ TEST 2: INSURANCE & EARNINGS TIER');
    console.log('----------------------------------------');
    const insurance = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        earningsTier: true,
        insuranceType: true,
        revenueSplit: true,
        p2pInsuranceStatus: true,
        p2pInsuranceProvider: true,
        p2pPolicyNumber: true,
        p2pInsuranceExpires: true,
        p2pInsuranceActive: true,
        commercialInsuranceStatus: true,
        commercialInsuranceProvider: true,
        commercialPolicyNumber: true,
        commercialInsuranceExpires: true,
        commercialInsuranceActive: true,
        insuranceProviderId: true,
        insurancePolicyNumber: true,
        insuranceActive: true
      }
    });
    
    console.log('✅ Insurance Status:');
    console.log(`   Earnings Tier: ${insurance?.earningsTier}`);
    console.log(`   Insurance Type: ${insurance?.insuranceType || 'NONE'}`);
    console.log(`   Revenue Split: ${insurance?.revenueSplit}%`);
    console.log('\n   P2P Insurance:');
    console.log(`     Status: ${insurance?.p2pInsuranceStatus}`);
    console.log(`     Provider: ${insurance?.p2pInsuranceProvider || 'None'}`);
    console.log(`     Policy: ${insurance?.p2pPolicyNumber || 'None'}`);
    console.log(`     Active: ${insurance?.p2pInsuranceActive ? 'YES' : 'NO'}`);
    console.log('\n   Commercial Insurance:');
    console.log(`     Status: ${insurance?.commercialInsuranceStatus}`);
    console.log(`     Provider: ${insurance?.commercialInsuranceProvider || 'None'}`);
    console.log(`     Policy: ${insurance?.commercialPolicyNumber || 'None'}`);
    console.log(`     Active: ${insurance?.commercialInsuranceActive ? 'YES' : 'NO'}`);
    console.log('\n');
    
    // 3. STRIPE & FINANCIALS
    console.log('💳 TEST 3: STRIPE & FINANCIALS');
    console.log('----------------------------------------');
    const financials = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        stripeConnectAccountId: true,
        stripeAccountStatus: true,
        stripePayoutsEnabled: true,
        stripeChargesEnabled: true,
        stripeDetailsSubmitted: true,
        currentBalance: true,
        pendingBalance: true,
        totalEarnings: true,
        totalPayoutsAmount: true,
        payoutsEnabled: true,
        bankVerified: true,
        taxIdProvided: true,
        w9Submitted: true
      }
    });
    
    console.log('✅ Financial Status:');
    console.log(`   Stripe Account: ${financials?.stripeConnectAccountId || 'NOT CONNECTED'}`);
    console.log(`   Account Status: ${financials?.stripeAccountStatus || 'NOT SET UP'}`);
    console.log(`   Payouts Enabled: ${financials?.stripePayoutsEnabled ? 'YES' : 'NO'}`);
    console.log(`   Charges Enabled: ${financials?.stripeChargesEnabled ? 'YES' : 'NO'}`);
    console.log(`   Current Balance: $${financials?.currentBalance || 0}`);
    console.log(`   Pending Balance: $${financials?.pendingBalance || 0}`);
    console.log(`   Total Earnings: $${financials?.totalEarnings || 0}`);
    console.log(`   Bank Verified: ${financials?.bankVerified ? 'YES' : 'NO'}`);
    console.log(`   Tax ID Provided: ${financials?.taxIdProvided ? 'YES' : 'NO'}`);
    console.log(`   W9 Submitted: ${financials?.w9Submitted ? 'YES' : 'NO'}`);
    console.log('\n');
    
    // 4. VEHICLE STATUS
    console.log('🚗 TEST 4: VEHICLE STATUS');
    console.log('----------------------------------------');
    const vehicle = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: {
        make: true,
        model: true,
        year: true,
        isActive: true,
        hasActiveClaim: true,
        totalTrips: true,
        totalClaimsCount: true,
        declarationType: true,
        primaryUse: true,
        insuranceEligible: true,
        insuranceCategory: true,
        vinVerifiedAt: true,
        registrationVerifiedAt: true,
        insuranceVerifiedAt: true,
        esgScore: true,
        esgMaintenanceScore: true,
        avgMilesPerTrip: true,
        currentMileage: true,
        lastRentalEndMileage: true
      }
    });
    
    // Get vehicle's host insurance for tier calculation
    const hostInsurance = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        insuranceType: true,
        revenueSplit: true
      }
    });
    
    console.log('✅ Vehicle:');
    console.log(`   Vehicle: ${vehicle?.year} ${vehicle?.make} ${vehicle?.model}`);
    console.log(`   Active: ${vehicle?.isActive ? 'YES' : 'NO'}`);
    console.log(`   Has Active Claim: ${vehicle?.hasActiveClaim ? 'YES ⚠️' : 'NO'}`);
    console.log(`   Total Trips: ${vehicle?.totalTrips}`);
    console.log(`   Total Claims: ${vehicle?.totalClaimsCount}`);
    console.log(`   Declaration Type: ${vehicle?.declarationType || vehicle?.primaryUse || 'Not Set'}`);
    console.log(`   Host Insurance Type: ${hostInsurance?.insuranceType || 'Platform'}`);
    console.log(`   Host Revenue Split: ${hostInsurance?.revenueSplit}%`);
    console.log(`   Insurance Eligible: ${vehicle?.insuranceEligible ? 'YES' : 'NO'}`);
    console.log(`   VIN Verified: ${vehicle?.vinVerifiedAt ? 'YES' : 'NO'}`);
    console.log(`   Registration Verified: ${vehicle?.registrationVerifiedAt ? 'YES' : 'NO'}`);
    console.log(`   Insurance Verified: ${vehicle?.insuranceVerifiedAt ? 'YES' : 'NO'}`);
    console.log(`   ESG Score: ${vehicle?.esgScore || 'Not Calculated'}`);
    console.log(`   Maintenance Score: ${vehicle?.esgMaintenanceScore || 'Not Calculated'}`);
    console.log('\n');
    
    // 5. ACTIVE CLAIMS
    console.log('⚠️ TEST 5: CLAIMS STATUS');
    console.log('----------------------------------------');
    const claims = await prisma.claim.findMany({
      where: {
        booking: {
          carId: carId
        }
      },
      include: {
        booking: {
          select: {
            id: true,
            bookingCode: true,
            carId: true,
            startDate: true,
            endDate: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    console.log(`✅ Found ${claims.length} claim(s):`);
    claims.forEach((claim, index) => {
      console.log(`\n   Claim ${index + 1}:`);
      console.log(`     ID: ${claim.id}`);
      console.log(`     Status: ${claim.status} ${claim.status === 'PENDING' || claim.status === 'UNDER_REVIEW' ? '🔴 ACTIVE' : ''}`);
      console.log(`     Type: ${claim.type}`);
      console.log(`     Amount: $${claim.estimatedCost || 0}`);
      console.log(`     Filed: ${new Date(claim.createdAt).toLocaleDateString()}`);
      console.log(`     Guest Response Text: ${claim.guestResponseText ? 'YES' : 'NO'}`);
      console.log(`     Vehicle Deactivated: ${claim.vehicleDeactivated ? 'YES' : 'NO'}`);
    });
    console.log('\n');
    
    // 6. BOOKINGS & TRIPS
    console.log('📅 TEST 6: BOOKINGS & TRIPS');
    console.log('----------------------------------------');
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        carId: carId
      },
      select: {
        id: true,
        status: true,
        startDate: true,
        endDate: true,
        startMileage: true,
        endMileage: true,
        dailyRate: true,
        serviceFee: true,
        deliveryFee: true,
        insuranceFee: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 5
    });
    
    console.log(`✅ Recent Bookings (Last 5):`);
    bookings.forEach((booking, index) => {
      const tripMiles = (booking.endMileage || 0) - (booking.startMileage || 0);
      const totalPrice = booking.dailyRate + (booking.serviceFee || 0) + (booking.deliveryFee || 0) + (booking.insuranceFee || 0);
      console.log(`\n   Booking ${index + 1}:`);
      console.log(`     Status: ${booking.status}`);
      console.log(`     Dates: ${new Date(booking.startDate).toLocaleDateString()} - ${new Date(booking.endDate).toLocaleDateString()}`);
      console.log(`     Mileage: ${booking.startMileage || 0} → ${booking.endMileage || 0} (${tripMiles} miles)`);
      console.log(`     Daily Rate: $${booking.dailyRate}`);
      console.log(`     Total Price: $${totalPrice}`);
    });
    console.log('\n');
    
    // 7. ESG PROFILE
    console.log('🌱 TEST 7: ESG PROFILE');
    console.log('----------------------------------------');
    const esgProfile = await prisma.hostESGProfile.findUnique({
      where: { hostId },
      select: {
        compositeScore: true,
        maintenanceScore: true,
        safetyScore: true,
        emissionsScore: true,
        complianceScore: true,
        totalMilesDriven: true,
        avgMilesPerTrip: true,
        totalTrips: true,
        incidentFreeTrips: true,
        lastMaintenanceDate: true,
        maintenanceOnTime: true,
        fraudRiskLevel: true,
        insuranceTier: true
      }
    });
    
    if (esgProfile) {
      console.log('✅ ESG Profile:');
      console.log(`   Composite Score: ${esgProfile.compositeScore}/100`);
      console.log(`   Maintenance Score: ${esgProfile.maintenanceScore}/100`);
      console.log(`   Safety Score: ${esgProfile.safetyScore}/100`);
      console.log(`   Emissions Score: ${esgProfile.emissionsScore}/100`);
      console.log(`   Compliance Score: ${esgProfile.complianceScore}/100`);
      console.log(`   Total Miles: ${esgProfile.totalMilesDriven}`);
      console.log(`   Avg Miles/Trip: ${esgProfile.avgMilesPerTrip}`);
      console.log(`   Incident-Free Trips: ${esgProfile.incidentFreeTrips}/${esgProfile.totalTrips}`);
      console.log(`   Maintenance On Time: ${esgProfile.maintenanceOnTime ? 'YES' : 'NO'}`);
      console.log(`   Fraud Risk: ${esgProfile.fraudRiskLevel || 'LOW'}`);
    } else {
      console.log('⚠️ No ESG profile found');
    }
    console.log('\n');
    
    // 8. MAINTENANCE RECORDS
    console.log('🔧 TEST 8: MAINTENANCE RECORDS');
    console.log('----------------------------------------');
    const maintenance = await prisma.vehicleServiceRecord.findMany({
      where: { carId },
      orderBy: { serviceDate: 'desc' },
      take: 3
    });
    
    console.log(`✅ Recent Maintenance (Last 3):`);
    maintenance.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.serviceType} - ${new Date(record.serviceDate).toLocaleDateString()}`);
      console.log(`      Mileage: ${record.mileageAtService}`);
      console.log(`      Shop: ${record.shopName}`);
    });
    
    // Calculate maintenance status
    if (maintenance.length > 0) {
      const lastService = new Date(maintenance[0].serviceDate);
      const now = new Date();
      const daysSince = Math.floor((now.getTime() - lastService.getTime()) / (1000 * 60 * 60 * 24));
      console.log(`\n   Days Since Last Service: ${daysSince}`);
      console.log(`   Status: ${daysSince > 180 ? 'OVERDUE ⚠️' : 'CURRENT ✅'}`);
    }
    console.log('\n');
    
    // 9. SYSTEM HEALTH CHECK
    console.log('💚 TEST 9: SYSTEM HEALTH CHECK');
    console.log('----------------------------------------');
    
    const issues = [];
    
    // Check for issues
    if (!host?.isVerified) issues.push('Host not verified');
    if (!host?.documentsVerified) issues.push('Documents not verified');
    if (!insurance?.earningsTier || insurance.earningsTier === 'BASIC') issues.push('Basic tier only (40%)');
    if (!financials?.stripeConnectAccountId) issues.push('Stripe not connected');
    if (!financials?.bankVerified) issues.push('Bank not verified');
    if (vehicle?.hasActiveClaim) issues.push('Active claim on vehicle');
    if (!vehicle?.isActive) issues.push('Vehicle inactive');
    if (!esgProfile) issues.push('No ESG profile');
    if (esgProfile && esgProfile.maintenanceScore < 100) issues.push('Maintenance score not optimal');
    
    if (issues.length === 0) {
      console.log('✅ ALL SYSTEMS OPERATIONAL!');
      console.log('   Host is fully verified and ready for operations');
    } else {
      console.log('⚠️ ISSUES FOUND:');
      issues.forEach(issue => {
        console.log(`   - ${issue}`);
      });
    }
    
    console.log('\n');
    console.log('========================================');
    console.log('✅ COMPLETE HOST TEST FINISHED');
    console.log('========================================');
    
  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runCompleteHostTest();
