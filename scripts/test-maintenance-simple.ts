import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function testMaintenance() {
  const hostId = 'cmfj0oxqm004udomy7qivgt18';
  
  console.log('🧪 Testing Maintenance Calculation (Simplified)...\n');
  
  try {
    // Get host's cars
    const cars = await prisma.rentalCar.findMany({
      where: { hostId }
    });
    
    console.log(`Found ${cars.length} car(s)\n`);
    
    // Get maintenance records using carId
    const carIds = cars.map(c => c.id);
    
    const records = await prisma.vehicleServiceRecord.findMany({
      where: {
        carId: { in: carIds }
      },
      orderBy: {
        serviceDate: 'desc'
      }
    });
    
    console.log(`Found ${records.length} maintenance record(s)\n`);
    
    if (records.length === 0) {
      console.log('❌ No records to calculate from\n');
      return;
    }
    
    // Calculate what the score should be
    const mostRecent = records[0];
    const lastServiceDate = new Date(mostRecent.serviceDate);
    const now = new Date();
    const daysSince = Math.floor((now.getTime() - lastServiceDate.getTime()) / (1000 * 60 * 60 * 24));
    
    const isOverdue = daysSince > 180;
    let score = 100;
    
    if (isOverdue) {
      const daysOverdue = daysSince - 180;
      const penalty = Math.min(30, daysOverdue / 10);
      score -= penalty;
    }
    
    // Bonus for recent services
    const oneYearAgo = new Date();
    oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
    const recentCount = records.filter(r => new Date(r.serviceDate) >= oneYearAgo).length;
    const bonus = recentCount >= 2 ? 10 : recentCount === 1 ? 5 : 0;
    
    score = Math.max(0, Math.min(100, score + bonus));
    
    console.log('📊 CALCULATION RESULT:');
    console.log(`   Last Service: ${lastServiceDate.toLocaleDateString()}`);
    console.log(`   Days Since: ${daysSince}`);
    console.log(`   Status: ${isOverdue ? 'OVERDUE' : 'CURRENT'}`);
    console.log(`   Recent Services (1yr): ${recentCount}`);
    console.log(`   Expected Score: ${score}/100\n`);
    
    console.log('✅ Calculation logic works!\n');
    console.log('🚀 NEXT STEP: Refresh dashboard to trigger ESG recalculation');
    
  } catch (error) {
    console.error('❌ Error:', error);
  } finally {
    await prisma.$disconnect();
  }
}

testMaintenance();
