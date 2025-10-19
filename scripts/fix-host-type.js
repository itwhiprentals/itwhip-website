// scripts/fix-host-type.js
const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function fixHostType() {
  await prisma.rentalHost.update({
    where: { id: 'cmfj0oxqm004udomy7qivgt18' },
    data: {
      hostType: 'REAL'
    }
  })
  console.log('Host type updated to REAL!')
}

fixHostType()