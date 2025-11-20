const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function testBooking() {
  const booking = await prisma.rentalBooking.findUnique({
    where: { id: 'cmgj3gidz00addoig9iy7imxi' },
    include: {
      claims: true,
      insurancePolicy: true
    }
  })
  
  console.log('Claims count:', booking?.claims?.length || 0)
  console.log('Has policy:', !!booking?.insurancePolicy)
  console.log('Insurance Hierarchy:', booking?.insuranceHierarchy || 'MISSING')
  
  await prisma.$disconnect()
}

testBooking().catch(console.error)