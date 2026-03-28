import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  // Fix 2019 Prius Prime: "Plus/Premium/Advanced" → "Plus"
  const prime = await p.rentalCar.updateMany({
    where: { vin: 'JTDKARFP1K3118901' },
    data: { trim: 'Plus' }
  })
  console.log(`Prius Prime updated: ${prime.count}`)

  // Fix 2018 Prius: "One/Two" → "One"
  const prius = await p.rentalCar.updateMany({
    where: { vin: 'JTDKBRFU3J3064342' },
    data: { trim: 'One' }
  })
  console.log(`Prius updated: ${prius.count}`)

  await p.$disconnect()
}
main()
