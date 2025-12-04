const { PrismaClient } = require('@prisma/client');
const argon2 = require('argon2');
const prisma = new PrismaClient();

async function testPassword() {
  const email = 'nickpattt86@gmail.com';
  const password = 'Test123!';

  console.log('\n🔍 Testing password with Argon2...');

  const host = await prisma.rentalHost.findUnique({
    where: { email },
    select: { userId: true }
  });

  const user = await prisma.user.findUnique({
    where: { id: host.userId },
    select: { passwordHash: true }
  });

  console.log('Hash type:', user.passwordHash.substring(0, 10) + '...');

  try {
    const isValid = await argon2.verify(user.passwordHash, password);
    
    if (isValid) {
      console.log('\n✅ PASSWORD CORRECT with Argon2!');
      console.log('Password "Test123!" is valid');
    } else {
      console.log('\n❌ PASSWORD INCORRECT');
    }
  } catch (err) {
    console.log('\n❌ Error:', err.message);
  }

  await prisma.$disconnect();
}

testPassword().catch(console.error);
