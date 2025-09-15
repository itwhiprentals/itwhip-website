// scripts/create-admin.ts
const bcrypt = require('bcryptjs')
const { PrismaClient } = require('@prisma/client')

const prisma = new PrismaClient()

async function createAdmin() {
  const hashedPassword = await bcrypt.hash('admin123', 10)
  
  const admin = await prisma.user.create({
    data: {
      email: 'admin@itwhip.com',
      passwordHash: hashedPassword,  // Changed from 'password' to 'passwordHash'
      name: 'Admin User',
      role: 'ADMIN',
      emailVerified: true  // Changed from 'isVerified' to 'emailVerified'
    }
  })
  
  console.log('Admin created:', admin.email)
  console.log('Password: admin123')
}

createAdmin()
  .catch(console.error)
  .finally(() => prisma.$disconnect())