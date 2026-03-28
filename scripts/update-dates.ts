import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  await p.reservationRequest.update({
    where: { id: 'cmm8d0z7d0000c9v0mw61xu31' },
    data: {
      startDate: new Date('2026-03-06T00:00:00.000Z'),
      endDate: new Date('2026-03-07T00:00:00.000Z'),
    }
  })
  console.log('Request dates updated: Mar 6-7')
  await p.$disconnect()
}
main()
