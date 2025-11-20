import { PrismaClient } from '@prisma/client';
import * as fs from 'fs';
import * as path from 'path';

const prisma = new PrismaClient();

async function fixMaintenanceTracker() {
  console.log('🔧 Fixing maintenance-tracker.ts type error...\n');
  
  const filePath = path.join(process.cwd(), 'app/lib/esg/maintenance-tracker.ts');
  
  // Read the file
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Find the problematic line (around line 342)
  const problemPattern = /const recommendations = generateFleetMaintenanceRecommendations\(\{[\s\S]*?\}\)/;
  
  // Replace with fixed version
  const fixedCode = `const recommendations = generateFleetMaintenanceRecommendations({
    totalVehicles: cars.length,
    excellentCount,
    goodCount,
    fairCount,
    overdueCount,
    criticalCount,
    averageComplianceRate,
    totalOverdueDays,
    recommendations: [], // ✅ Added missing property
  })`;
  
  if (content.match(problemPattern)) {
    content = content.replace(problemPattern, fixedCode);
    
    // Write back
    fs.writeFileSync(filePath, content, 'utf8');
    
    console.log('✅ Fixed! Added missing "recommendations: []" property\n');
    console.log('🚀 Now try running the test again:');
    console.log('   npx ts-node --compiler-options \'{"module":"commonjs"}\' scripts/test-tracker-function.ts\n');
  } else {
    console.log('⚠️  Could not find the exact pattern to fix.');
    console.log('📝 Manual fix needed at line 342 in maintenance-tracker.ts\n');
    console.log('Add this property to the object:');
    console.log('   recommendations: []\n');
  }
  
  await prisma.$disconnect();
}

fixMaintenanceTracker();
