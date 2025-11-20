import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function fix() {
  const hostId = 'cmfj0oxqm004udomy7qivgt18';
  
  console.log('🔧 Fixing Parker\'s ESG System...\n');
  
  console.log('1️⃣ Deleting old ESG profile...');
  const deleted = await prisma.hostESGProfile.deleteMany({
    where: { hostId }
  });
  console.log(`   ✅ Deleted ${deleted.count} profile(s)\n`);
  
  console.log('2️⃣ Deleting old snapshots...');
  const deletedSnapshots = await prisma.eSGSnapshot.deleteMany({
    where: {
      profile: {
        hostId
      }
    }
  });
  console.log(`   ✅ Deleted ${deletedSnapshots.count} snapshot(s)\n`);
  
  console.log('✨ Done! Now fix scoring.ts and refresh the dashboard.');
  
  await prisma.$disconnect();
}

fix();
