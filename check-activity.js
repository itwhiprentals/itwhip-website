const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkActivity() {
  const userId = 'cmikwxr6j000tdojht8n8jieu';

  // Check recent activity logs
  const logs = await prisma.activityLog.findMany({
    where: {
      OR: [
        { userId: userId },
        { entityId: userId }
      ]
    },
    orderBy: { createdAt: 'desc' },
    take: 20
  });

  console.log('\n📋 Recent Activity Logs:');
  logs.forEach(log => {
    console.log(`  ${log.createdAt.toISOString()} | ${log.action} | ${log.entityType}`);
  });

  // Check login attempts
  const logins = await prisma.loginAttempt.findMany({
    where: { userId: userId },
    orderBy: { timestamp: 'desc' },
    take: 10
  });

  console.log('\n📋 Recent Login Attempts:');
  logins.forEach(l => {
    console.log(`  ${l.timestamp.toISOString()} | ${l.success ? '✅' : '❌'} | ${l.reason}`);
  });

  await prisma.$disconnect();
}

checkActivity().catch(console.error);
