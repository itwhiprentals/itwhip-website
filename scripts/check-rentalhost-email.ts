// scripts/check-rentalhost-email.ts
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function checkRentalHost() {
  const host = await prisma.rentalHost.findFirst({
    where: { userId: 'cmg3j3ppi0002do48f2253dw7' },
    select: {
      id: true,
      userId: true,
      email: true,
      name: true
    }
  })

  console.log('RentalHost record:')
  console.log(JSON.stringify(host, null, 2))

  const user = await prisma.user.findUnique({
    where: { id: 'cmg3j3ppi0002do48f2253dw7' },
    select: { email: true }
  })

  console.log('\nUser email:', user?.email)
  console.log('RentalHost email:', host?.email)
  console.log('MATCH:', user?.email === host?.email)
}

checkRentalHost()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('Error:', error)
    process.exit(1)
  })
