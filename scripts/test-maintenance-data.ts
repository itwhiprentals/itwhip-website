import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMaintenanceData() {
  const hostId = 'cmfj0oxqm004udomy7qivgt18';
  
  console.log('🔍 Testing ESG Maintenance Data Pipeline...\n');
  
  try {
    // Step 1: Check host exists
    console.log('1️⃣ Checking host account...');
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: {
        id: true,
        email: true,
        name: true,
      }
    });
    
    if (!host) {
      console.log('   ❌ Host not found!');
      return;
    }
    
    console.log(`   ✅ Found: ${host.name} (${host.email})\n`);
    
    // Step 2: Check vehicles
    console.log('2️⃣ Checking vehicles...');
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId },
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        isActive: true,
      }
    });
    
    console.log(`   ✅ Found ${vehicles.length} vehicle(s):`);
    vehicles.forEach(v => {
      console.log(`      • ${v.year} ${v.make} ${v.model} (${v.isActive ? 'Active' : 'Inactive'})`);
    });
    console.log('');
    
    // Step 3: Check maintenance records using carId
    console.log('3️⃣ Checking maintenance records...');
    const carIds = vehicles.map(v => v.id);
    
    const maintenanceRecords = await prisma.vehicleServiceRecord.findMany({
      where: {
        carId: {
          in: carIds
        }
      },
      orderBy: {
        serviceDate: 'desc'
      }
    });
    
    if (maintenanceRecords.length === 0) {
      console.log('   ❌ No maintenance records found!\n');
      console.log('💡 This is the problem! ESG needs maintenance data.');
      console.log('   To fix: Add maintenance records in the system.\n');
      return;
    }
    
    console.log(`   ✅ Found ${maintenanceRecords.length} maintenance record(s):\n`);
    
    for (const record of maintenanceRecords) {
      const car = vehicles.find(v => v.id === record.carId);
      const serviceDate = new Date(record.serviceDate);
      const daysAgo = Math.floor((Date.now() - serviceDate.getTime()) / (1000 * 60 * 60 * 24));
      
      console.log(`   Record:`);
      console.log(`      Vehicle: ${car?.make || 'Unknown'} ${car?.model || 'Unknown'}`);
      console.log(`      Type: ${record.serviceType}`);
      console.log(`      Date: ${serviceDate.toLocaleDateString()} (${daysAgo} days ago)`);
      console.log(`      Mileage: ${record.mileageAtService?.toLocaleString() || 'N/A'} miles`);
      console.log(`      Cost: $${record.costTotal?.toFixed(2) || '0.00'}`);
      console.log('');
    }
    
    // Step 4: Calculate what the score SHOULD be
    console.log('4️⃣ Calculating expected maintenance score...');
    
    const mostRecent = maintenanceRecords[0];
    const lastServiceDate = new Date(mostRecent.serviceDate);
    const daysSinceService = Math.floor((Date.now() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const isOverdue = daysSinceService > 180;
    const overdueCount = isOverdue ? 1 : 0;
    
    // Calculate score
    let baseScore = 100;
    if (isOverdue) {
      const daysOverdue = daysSinceService - 180;
      const penalty = Math.min(30, daysOverdue / 10);
      baseScore -= penalty;
    }
    
    // Bonus for multiple recent services
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const recentCount = maintenanceRecords.filter(
      r => new Date(r.serviceDate) >= oneYearAgo
    ).length;
    
    const proactiveBonus = recentCount >= 2 ? 10 : recentCount === 1 ? 5 : 0;
    const finalScore = Math.max(0, Math.min(100, baseScore + proactiveBonus));
    
    console.log(`   Last Service: ${lastServiceDate.toLocaleDateString()}`);
    console.log(`   Days Since: ${daysSinceService}`);
    console.log(`   Status: ${isOverdue ? '🔴 OVERDUE' : '🟢 CURRENT'}`);
    console.log(`   Overdue Count: ${overdueCount}`);
    console.log(`   Recent Services (1yr): ${recentCount}`);
    console.log(`   Expected Score: ${finalScore}/100\n`);
    
    // Step 5: Check current ESG profile
    console.log('5️⃣ Checking current ESG profile...');
    const esgProfile = await prisma.hostESGProfile.findUnique({
      where: { hostId },
      select: {
        maintenanceScore: true,
        lastMaintenanceDate: true,
        overdueMaintenanceCount: true,
        lastCalculatedAt: true,
      }
    });
    
    if (!esgProfile) {
      console.log('   ⚠️  No ESG profile exists yet');
      console.log('   💡 It will be created on next dashboard load\n');
    } else {
      console.log(`   Current Maintenance Score: ${esgProfile.maintenanceScore}/100`);
      console.log(`   Last Maintenance Date: ${esgProfile.lastMaintenanceDate ? new Date(esgProfile.lastMaintenanceDate).toLocaleDateString() : 'NULL ❌'}`);
      console.log(`   Overdue Count: ${esgProfile.overdueMaintenanceCount}`);
      console.log(`   Last Calculated: ${new Date(esgProfile.lastCalculatedAt).toLocaleString()}\n`);
      
      // Compare expected vs actual
      if (esgProfile.lastMaintenanceDate === null) {
        console.log('   🚨 PROBLEM FOUND:');
        console.log('      lastMaintenanceDate is NULL in database');
        console.log('      But we have maintenance records!');
        console.log('      The scoring function is NOT querying the data correctly.\n');
      } else {
        console.log('   ✅ ESG profile has maintenance data!\n');
      }
    }
    
    // Step 6: Check if maintenance-tracker exists
    console.log('6️⃣ Checking maintenance-tracker.ts...');
    const fs = require('fs');
    const path = require('path');
    const trackerPath = path.join(process.cwd(), 'app/lib/esg/maintenance-tracker.ts');
    
    if (fs.existsSync(trackerPath)) {
      console.log('   ✅ maintenance-tracker.ts exists\n');
    } else {
      console.log('   ❌ maintenance-tracker.ts MISSING');
      console.log('   💡 This file is imported by scoring.ts but doesn\'t exist!\n');
    }
    
    // Step 7: Summary
    console.log('━'.repeat(80));
    console.log('📊 SUMMARY\n');
    
    if (maintenanceRecords.length > 0 && (!esgProfile || esgProfile.lastMaintenanceDate === null)) {
      console.log('❌ ISSUE IDENTIFIED:');
      console.log('   • Maintenance records exist in database');
      console.log('   • But ESG profile shows NULL for lastMaintenanceDate');
      console.log('   • The calculateMaintenanceScore() function is not working\n');
      console.log('🔧 SOLUTION:');
      console.log('   1. Delete ESG profile (already done)');
      console.log('   2. Check if maintenance-tracker.ts exists');
      console.log('   3. Restart dev server');
      console.log('   4. Refresh dashboard to trigger recalculation\n');
    } else if (maintenanceRecords.length === 0) {
      console.log('⚠️  NO MAINTENANCE DATA:');
      console.log('   Add maintenance records to test the system\n');
    } else {
      console.log('✅ EVERYTHING LOOKS GOOD:');
      console.log('   Maintenance data exists and ESG profile has it!\n');
    }
    
  } catch (error) {
    console.error('\n❌ Error during test:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMaintenanceData();
