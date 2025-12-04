const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkUsers() {
  const email = 'nickpattt86@gmail.com';

  // Find ALL users with this email
  const users = await prisma.user.findMany({
    where: { email },
    select: {
      id: true,
      email: true,
      name: true,
      role: true,
      passwordHash: true,
      createdAt: true,
      updatedAt: true
    }
  });

  console.log('\n📋 All Users with email:', email);
  console.log('Found:', users.length, 'user(s)\n');

  users.forEach((u, i) => {
    console.log(`User ${i + 1}:`);
    console.log('  ID:', u.id);
    console.log('  Role:', u.role);
    console.log('  Hash type:', u.passwordHash?.substring(0, 10) + '...');
    console.log('  Created:', u.createdAt);
    console.log('  Updated:', u.updatedAt);
    console.log('');
  });

  // Check host's userId
  const host = await prisma.rentalHost.findUnique({
    where: { email },
    select: { userId: true }
  });

  console.log('🔗 Host points to userId:', host?.userId);

  // Check if there's a Guest record
  const guest = await prisma.rentalGuest.findUnique({
    where: { email },
    select: { 
      id: true, 
      userId: true,
      createdAt: true 
    }
  });

  if (guest) {
    console.log('\n👤 Guest record found:');
    console.log('  Guest ID:', guest.id);
    console.log('  Guest userId:', guest.userId);
    console.log('  Created:', guest.createdAt);
  } else {
    console.log('\n👤 No Guest record found');
  }

  await prisma.$disconnect();
}

checkUsers().catch(console.error);
