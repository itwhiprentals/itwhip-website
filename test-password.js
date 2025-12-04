const { PrismaClient } = require('@prisma/client');
const { compare } = require('bcryptjs');
const prisma = new PrismaClient();

async function testPassword() {
  const email = 'nickpattt86@gmail.com';
  const password = process.argv[2];

  if (!password) {
    console.log('Usage: node test-password.js YOUR_PASSWORD');
    process.exit(1);
  }

  console.log('\n🔍 Testing login for:', email);

  // Get host
  const host = await prisma.rentalHost.findUnique({
    where: { email },
    select: { userId: true }
  });

  // Get user with password
  const user = await prisma.user.findUnique({
    where: { id: host.userId },
    select: { passwordHash: true }
  });

  console.log('\n📋 Password hash (first 20 chars):', user.passwordHash.substring(0, 20) + '...');

  // Test password
  const isValid = await compare(password, user.passwordHash);

  if (isValid) {
    console.log('\n✅ PASSWORD CORRECT - should login');
  } else {
    console.log('\n❌ PASSWORD INCORRECT - wrong password');
  }

  await prisma.$disconnect();
}

testPassword().catch(console.error);
