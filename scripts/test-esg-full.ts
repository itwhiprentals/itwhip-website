import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function runFullESGTest() {
  const hostId = 'cmfj0oxqm004udomy7qivgt18';
  const carId = 'cmfn3fdhf0001l8040ao0a3h8';

  console.log('========================================');
  console.log('🚀 FULL ESG SYSTEM TEST');
  console.log('========================================\n');

  try {
    // Test 1: Vehicle Data
    console.log('📊 TEST 1: Vehicle Data');
    console.log('----------------------------------------');
    const car = await prisma.rentalCar.findUnique({
      where: { id: carId },
      include: {
        bookings: {
          where: {
            status: 'COMPLETED',
            startMileage: { not: null },
            endMileage: { not: null }
          }
        }
      }
    });

    if (!car) {
      console.log('❌ Vehicle not found');
      return;
    }

    console.log(`✅ Vehicle: ${car.make} ${car.model} (${car.year})`);
    console.log(`   Total Trips: ${car.totalTrips}`);
    console.log(`   ESG Score: ${car.esgScore || 'Not calculated'}`);
    console.log(`   Avg Miles/Trip: ${car.avgMilesPerTrip || 0}`);
    console.log('\n');

    // Test 2: Service Records
    console.log('🔧 TEST 2: Service Records');
    console.log('----------------------------------------');
    const serviceRecords = await prisma.vehicleServiceRecord.findMany({
      where: { carId },
      orderBy: { serviceDate: 'desc' },
      take: 3
    });

    console.log(`✅ Found ${serviceRecords.length} service records`);
    serviceRecords.forEach((record, index) => {
      console.log(`   ${index + 1}. ${record.serviceType} - ${new Date(record.serviceDate).toLocaleDateString()}`);
      console.log(`      Mileage: ${record.mileageAtService}`);
      console.log(`      Shop: ${record.shopName}`);
    });
    console.log('\n');

    // Test 3: Mileage Calculation
    console.log('🔍 TEST 3: Mileage Analysis');
    console.log('----------------------------------------');
    const completedBookings = car.bookings;
    const totalMiles = completedBookings.reduce((sum, booking) => {
      return sum + ((booking.endMileage || 0) - (booking.startMileage || 0));
    }, 0);

    console.log(`✅ Mileage Stats:`);
    console.log(`   Completed Trips: ${completedBookings.length}`);
    console.log(`   Total Miles: ${totalMiles}`);
    console.log(`   Avg Miles/Trip: ${completedBookings.length > 0 ? Math.round(totalMiles / completedBookings.length) : 0}`);
    
    // Show mileage gaps
    let previousEndMileage: number | null = null;
    completedBookings.forEach((booking, index) => {
      const tripMiles = (booking.endMileage || 0) - (booking.startMileage || 0);
      console.log(`   Trip ${index + 1}: ${tripMiles} miles`);
      
      if (previousEndMileage !== null && booking.startMileage) {
        const gap = booking.startMileage - previousEndMileage;
        console.log(`      Gap from previous: ${gap} miles`);
      }
      previousEndMileage = booking.endMileage;
    });
    console.log('\n');

    // Test 4: Host ESG Profile
    console.log('👤 TEST 4: Host ESG Profile');
    console.log('----------------------------------------');
    const hostProfile = await prisma.hostESGProfile.findUnique({
      where: { hostId }
    });

    if (hostProfile) {
      console.log('✅ Host ESG Profile:');
      console.log(`   Composite Score: ${hostProfile.compositeScore}`);
      console.log(`   Maintenance Score: ${hostProfile.maintenanceScore}`);
      console.log(`   Safety Score: ${hostProfile.safetyScore}`);
      console.log(`   Emissions Score: ${hostProfile.emissionsScore}`);
      console.log(`   Total Miles Driven: ${hostProfile.totalMilesDriven}`);
      console.log(`   Avg Miles/Trip: ${hostProfile.avgMilesPerTrip}`);
      console.log(`   Last Maintenance: ${hostProfile.lastMaintenanceDate ? new Date(hostProfile.lastMaintenanceDate).toLocaleDateString() : 'Never'}`);
    } else {
      console.log('⚠️ No ESG profile found');
    }
    console.log('\n');

    // Test 5: Fleet Stats
    console.log('🚗 TEST 5: Fleet Statistics');
    console.log('----------------------------------------');
    const allCars = await prisma.rentalCar.findMany({
      where: { hostId }
    });

    const activeCount = allCars.filter(c => c.isActive).length;
    const totalTrips = allCars.reduce((sum, c) => sum + c.totalTrips, 0);
    const avgESG = allCars.filter(c => c.esgScore !== null).reduce((sum, c) => sum + (c.esgScore || 0), 0) / allCars.filter(c => c.esgScore !== null).length || 0;

    console.log('✅ Fleet Summary:');
    console.log(`   Total Vehicles: ${allCars.length}`);
    console.log(`   Active: ${activeCount}`);
    console.log(`   Total Trips: ${totalTrips}`);
    console.log(`   Avg ESG Score: ${Math.round(avgESG)}`);
    console.log('\n');

    // Test 6: Maintenance Score Calculation
    console.log('🧮 TEST 6: Maintenance Score Calculation');
    console.log('----------------------------------------');
    if (serviceRecords.length > 0) {
      const mostRecent = serviceRecords[0];
      const lastServiceDate = new Date(mostRecent.serviceDate);
      const now = new Date();
      const daysSince = Math.floor((now.getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24));
      
      const isOverdue = daysSince > 180;
      let score = 100;
      
      if (isOverdue) {
        const daysOverdue = daysSince - 180;
        const penalty = Math.min(30, Math.floor(daysOverdue / 10));
        score -= penalty;
      }
      
      // Bonus for recent services
      const oneYearAgo = new Date();
      oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
      const recentCount = serviceRecords.filter(r => new Date(r.serviceDate) >= oneYearAgo).length;
      const bonus = recentCount >= 2 ? 10 : recentCount === 1 ? 5 : 0;
      
      score = Math.max(0, Math.min(100, score + bonus));
      
      console.log('✅ Maintenance Score Logic:');
      console.log(`   Last Service: ${lastServiceDate.toLocaleDateString()}`);
      console.log(`   Days Since: ${daysSince}`);
      console.log(`   Status: ${isOverdue ? 'OVERDUE' : 'CURRENT'}`);
      console.log(`   Recent Services (1yr): ${recentCount}`);
      console.log(`   Calculated Score: ${score}/100`);
    } else {
      console.log('⚠️ No maintenance records to calculate from');
    }
    
    console.log('\n');
    console.log('========================================');
    console.log('✅ ALL TESTS COMPLETED SUCCESSFULLY!');
    console.log('========================================');

  } catch (error) {
    console.error('❌ Test failed:', error);
  } finally {
    await prisma.$disconnect();
  }
}

runFullESGTest();
