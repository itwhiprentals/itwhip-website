const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function addDocuments() {
  await prisma.rentalHost.update({
    where: { id: 'cmfj0oxqm004udomy7qivgt18' },
    data: {
      governmentIdUrl: 'https://example.com/gov-id.jpg',
      driversLicenseUrl: 'https://example.com/license.jpg',
      insuranceDocUrl: 'https://example.com/insurance.jpg'
    }
  })
  console.log('Documents added!')
}

addDocuments()