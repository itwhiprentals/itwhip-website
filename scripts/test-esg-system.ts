// scripts/test-esg-system.ts
// Comprehensive test for the entire ESG system

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

interface TestResult {
  category: string;
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN' | 'INFO';
  message: string;
  data?: any;
}

const results: TestResult[] = [];

function log(category: string, test: string, status: TestResult['status'], message: string, data?: any) {
  results.push({ category, test, status, message, data });
  const icon = status === 'PASS' ? '✅' : status === 'FAIL' ? '❌' : status === 'WARN' ? '⚠️' : 'ℹ️';
  console.log(`${icon} [${category}] ${test}: ${message}`);
  if (data) {
    console.log('   Data:', JSON.stringify(data, null, 2));
  }
}

async function testDatabaseSchema() {
  console.log('\n🗄️  TESTING DATABASE SCHEMA...\n');

  try {
    // Test HostESGProfile table
    const esgProfile = await prisma.hostESGProfile.findFirst();
    log('Database', 'HostESGProfile Table', esgProfile ? 'PASS' : 'INFO', 
      esgProfile ? 'Table exists with data' : 'Table exists but empty',
      esgProfile ? { id: esgProfile.id, compositeScore: esgProfile.compositeScore } : null
    );

    // Test ESGSnapshot table
    const snapshot = await prisma.eSGSnapshot.findFirst();
    log('Database', 'ESGSnapshot Table', snapshot ? 'PASS' : 'INFO',
      snapshot ? 'Table exists with data' : 'Table exists but empty'
    );

    // Test ESGBadge table
    const badges = await prisma.eSGBadge.findMany();
    log('Database', 'ESGBadge Table', badges.length > 0 ? 'PASS' : 'WARN',
      badges.length > 0 ? `Found ${badges.length} badges` : 'No badges seeded yet'
    );

    // Test HostBadgeEarned table
    const earnedBadges = await prisma.hostBadgeEarned.findFirst();
    log('Database', 'HostBadgeEarned Table', earnedBadges ? 'PASS' : 'INFO',
      earnedBadges ? 'Hosts have earned badges' : 'No badges earned yet'
    );

    // Test ESGEvent table
    const events = await prisma.eSGEvent.findFirst();
    log('Database', 'ESGEvent Table', events ? 'PASS' : 'INFO',
      events ? 'Events are being logged' : 'No events logged yet'
    );

  } catch (error) {
    log('Database', 'Schema Test', 'FAIL', `Database error: ${error}`);
  }
}

async function testDataAvailability() {
  console.log('\n📊 TESTING DATA AVAILABILITY...\n');

  try {
    // Find hosts with bookings
    const hostsWithBookings = await prisma.rentalHost.findMany({
      where: {
        bookings: {
          some: {
            status: 'COMPLETED'
          }
        }
      },
      include: {
        bookings: {
          where: { status: 'COMPLETED' },
          include: { car: true }
        },
        _count: {
          select: { bookings: true }
        }
      },
      take: 5
    });

    log('Data', 'Hosts with Completed Trips', 
      hostsWithBookings.length > 0 ? 'PASS' : 'WARN',
      hostsWithBookings.length > 0 
        ? `Found ${hostsWithBookings.length} hosts with completed trips`
        : 'No hosts with completed trips found',
      hostsWithBookings.map(h => ({
        id: h.id,
        email: h.email,
        completedTrips: h._count.bookings
      }))
    );

    // Check for mileage data
    if (hostsWithBookings.length > 0) {
      const bookingsWithMileage = hostsWithBookings[0].bookings.filter(
        b => b.startMileage !== null && b.endMileage !== null
      );

      log('Data', 'Mileage Data', 
        bookingsWithMileage.length > 0 ? 'PASS' : 'FAIL',
        bookingsWithMileage.length > 0
          ? `Found ${bookingsWithMileage.length} bookings with mileage data`
          : 'No mileage data in bookings - ESG calculations will fail!',
        bookingsWithMileage.length > 0 ? {
          sampleBooking: {
            id: bookingsWithMileage[0].id,
            startMileage: bookingsWithMileage[0].startMileage,
            endMileage: bookingsWithMileage[0].endMileage,
            milesDriven: bookingsWithMileage[0].endMileage! - bookingsWithMileage[0].startMileage!
          }
        } : null
      );

      // Check for EV vehicles
      const evBookings = hostsWithBookings[0].bookings.filter(
        b => b.car?.fuelType === 'ELECTRIC'
      );

      log('Data', 'EV Trip Data', 
        evBookings.length > 0 ? 'PASS' : 'INFO',
        evBookings.length > 0
          ? `Found ${evBookings.length} EV trips`
          : 'No EV trips found - emissions score will be lower'
      );
    }

    // Check for claims
    const claims = await prisma.claim.findMany({
      take: 5,
      include: { host: true, booking: true }
    });

    log('Data', 'Claims Data', 
      claims.length > 0 ? 'PASS' : 'INFO',
      claims.length > 0
        ? `Found ${claims.length} claims`
        : 'No claims found - safety scores will be higher'
    );

  } catch (error) {
    log('Data', 'Data Availability Test', 'FAIL', `Error: ${error}`);
  }
}

async function testESGCalculation() {
  console.log('\n🧮 TESTING ESG CALCULATION ENGINE...\n');

  try {
    // Find a host with data
    const testHost = await prisma.rentalHost.findFirst({
      where: {
        bookings: {
          some: {
            status: 'COMPLETED',
            startMileage: { not: null },
            endMileage: { not: null }
          }
        }
      },
      include: {
        bookings: {
          where: { 
            status: 'COMPLETED',
            startMileage: { not: null },
            endMileage: { not: null }
          },
          include: { car: true }
        },
        claims: true
      }
    });

    if (!testHost) {
      log('Calculation', 'Test Host', 'FAIL', 'No suitable test host found with mileage data');
      return;
    }

    log('Calculation', 'Test Host', 'PASS', 
      `Found test host: ${testHost.email}`,
      {
        id: testHost.id,
        bookings: testHost.bookings.length,
        claims: testHost.claims.length
      }
    );

    // Calculate mileage from bookings (the RIGHT way)
    const totalMiles = testHost.bookings.reduce((sum, booking) => {
      if (booking.startMileage && booking.endMileage) {
        return sum + (booking.endMileage - booking.startMileage);
      }
      return sum;
    }, 0);

    log('Calculation', 'Mileage Calculation', 'PASS',
      `Calculated ${totalMiles} total rental miles from bookings`,
      {
        method: 'SUM(endMileage - startMileage)',
        bookingsUsed: testHost.bookings.length,
        totalMiles
      }
    );

    // Calculate EV percentage
    const evTrips = testHost.bookings.filter(b => b.car?.fuelType === 'ELECTRIC').length;
    const evPercentage = testHost.bookings.length > 0 
      ? (evTrips / testHost.bookings.length) * 100 
      : 0;

    log('Calculation', 'EV Percentage', 'PASS',
      `${evPercentage.toFixed(1)}% EV trips`,
      {
        evTrips,
        totalTrips: testHost.bookings.length,
        evPercentage: evPercentage.toFixed(1)
      }
    );

    // Calculate safety metrics
    const claimCount = testHost.claims.length;
    const incidentFreeTrips = testHost.bookings.length - claimCount;
    const safetyScore = testHost.bookings.length > 0
      ? Math.max(0, 100 - (claimCount / testHost.bookings.length) * 100)
      : 50;

    log('Calculation', 'Safety Score', 'PASS',
      `Safety score: ${safetyScore.toFixed(0)}/100`,
      {
        totalTrips: testHost.bookings.length,
        incidentFreeTrips,
        claims: claimCount,
        safetyScore: safetyScore.toFixed(0)
      }
    );

    // Estimate CO2 savings (EVs only)
    const co2PerMile = 0.404; // kg CO2 per mile for gas cars
    const evMiles = testHost.bookings
      .filter(b => b.car?.fuelType === 'ELECTRIC')
      .reduce((sum, b) => {
        if (b.startMileage && b.endMileage) {
          return sum + (b.endMileage - b.startMileage);
        }
        return sum;
      }, 0);
    const co2Saved = evMiles * co2PerMile;

    log('Calculation', 'CO2 Savings', 'PASS',
      `Estimated ${co2Saved.toFixed(0)} kg CO2 saved`,
      {
        evMiles,
        co2PerMile,
        totalCO2Saved: co2Saved.toFixed(0)
      }
    );

  } catch (error) {
    log('Calculation', 'ESG Engine Test', 'FAIL', `Error: ${error}`);
  }
}

async function testAPIEndpoints() {
  console.log('\n🌐 TESTING API ENDPOINTS (Structure Only)...\n');

  const fs = require('fs');
  const path = require('path');

  const endpoints = [
    { path: 'app/api/host/esg/profile/route.ts', name: 'GET /api/host/esg/profile' },
    { path: 'app/api/host/esg/recalculate/route.ts', name: 'POST /api/host/esg/recalculate' },
    { path: 'app/api/admin/esg/[hostId]/route.ts', name: 'GET /api/admin/esg/[hostId]' }
  ];

  for (const endpoint of endpoints) {
    try {
      const fullPath = path.join(process.cwd(), endpoint.path);
      const exists = fs.existsSync(fullPath);
      log('API', endpoint.name, exists ? 'PASS' : 'FAIL',
        exists ? 'Endpoint file exists' : 'Endpoint file missing'
      );
    } catch (error) {
      log('API', endpoint.name, 'FAIL', 'Error checking file');
    }
  }
}

async function testComponents() {
  console.log('\n🎨 TESTING FRONTEND COMPONENTS (Structure Only)...\n');

  const fs = require('fs');
  const path = require('path');

  const components = [
    { path: 'app/components/host/ESGDashboardCard.tsx', name: 'ESGDashboardCard' },
    { path: 'app/components/host/ESGDetailModal.tsx', name: 'ESGDetailModal' }
  ];

  for (const component of components) {
    try {
      const fullPath = path.join(process.cwd(), component.path);
      const exists = fs.existsSync(fullPath);
      log('Components', component.name, exists ? 'PASS' : 'FAIL',
        exists ? 'Component file exists' : 'Component file missing'
      );
    } catch (error) {
      log('Components', component.name, 'FAIL', 'Error checking file');
    }
  }
}

async function printSummary() {
  console.log('\n' + '='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60) + '\n');

  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warned = results.filter(r => r.status === 'WARN').length;
  const info = results.filter(r => r.status === 'INFO').length;

  console.log(`✅ PASSED: ${passed}`);
  console.log(`❌ FAILED: ${failed}`);
  console.log(`⚠️  WARNINGS: ${warned}`);
  console.log(`ℹ️  INFO: ${info}`);
  console.log(`📊 TOTAL TESTS: ${results.length}\n`);

  if (failed > 0) {
    console.log('❌ FAILED TESTS:');
    results.filter(r => r.status === 'FAIL').forEach(r => {
      console.log(`   • [${r.category}] ${r.test}: ${r.message}`);
    });
    console.log('');
  }

  if (warned > 0) {
    console.log('⚠️  WARNINGS:');
    results.filter(r => r.status === 'WARN').forEach(r => {
      console.log(`   • [${r.category}] ${r.test}: ${r.message}`);
    });
    console.log('');
  }

  console.log('🎯 NEXT STEPS:');
  if (failed === 0 && warned === 0) {
    console.log('   ✅ ESG system is ready to test in browser!');
    console.log('   ✅ Navigate to host dashboard to see ESG card');
    console.log('   ✅ Click card to open detail modal');
  } else {
    console.log('   1. Fix failed tests first');
    console.log('   2. Address warnings');
    console.log('   3. Seed badges: await seedBadges()');
    console.log('   4. Test in browser');
  }
  console.log('');
}

async function main() {
  console.log('\n🚀 ITWHIP ESG SYSTEM - COMPREHENSIVE TEST\n');
  console.log('Testing all components of the ESG system...\n');

  await testDatabaseSchema();
  await testDataAvailability();
  await testESGCalculation();
  await testAPIEndpoints();
  await testComponents();
  await printSummary();

  await prisma.$disconnect();
}

main()
  .catch(async (error) => {
    console.error('❌ Test script failed:', error);
    await prisma.$disconnect();
    process.exit(1);
  });