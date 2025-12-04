const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkHost() {
  const email = 'nickpattt86@gmail.com';
  
  console.log('\n🔍 Checking host:', email);
  
  // Find host
  const host = await prisma.rentalHost.findUnique({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      userId: true,
      active: true,
      approvalStatus: true,
    }
  });

  if (!host) {
    console.log('❌ Host not found');
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log('\n✅ Host found:');
  console.log(JSON.stringify(host, null, 2));

  if (!host.userId) {
    console.log('\n❌ PROBLEM: host.userId is NULL');
    await prisma.$disconnect();
    process.exit(1);
  }

  // Find user
  const user = await prisma.user.findUnique({
    where: { id: host.userId },
    select: {
      id: true,
      email: true,
      name: true,
      passwordHash: true,
    }
  });

  if (!user) {
    console.log('\n❌ PROBLEM: User not found for userId:', host.userId);
    await prisma.$disconnect();
    process.exit(1);
  }

  console.log('\n✅ User found:');
  console.log({
    id: user.id,
    email: user.email,
    name: user.name,
    hasPassword: !!user.passwordHash,
    passwordLength: user.passwordHash?.length || 0
  });

  if (!user.passwordHash) {
    console.log('\n❌ PROBLEM: passwordHash is NULL or empty');
  } else {
    console.log('\n✅ Password hash exists');
  }

  await prisma.$disconnect();
}

checkHost().catch(console.error);
