const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHostUser() {
  const host = await prisma.rentalHost.findUnique({
    where: { email: 'nickpattt86@gmail.com' },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          name: true,
          role: true
        }
      }
    }
  });

  console.log('\n🔍 Host with User relation:');
  console.log(JSON.stringify(host, null, 2));

  if (!host) {
    console.log('\n❌ Host not found');
  } else if (!host.user) {
    console.log('\n❌ PROBLEM: host.user is NULL - relation broken');
  } else {
    console.log('\n✅ User relation exists');
  }

  await prisma.$disconnect();
}

checkHostUser().catch(console.error);
