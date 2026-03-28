import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  const cars = await p.rentalCar.findMany({
    select: { id: true, year: true, make: true, model: true, trim: true },
    orderBy: [{ make: 'asc' }, { model: 'asc' }]
  })

  console.log('=== ALL CAR TRIMS ===')
  cars.forEach(c => {
    const bad = c.trim && c.trim.includes('/') ? ' *** BAD ***' : ''
    console.log(`${c.year} ${c.make} ${c.model} | trim: ${c.trim || '(none)'}${bad}`)
  })

  const badCount = cars.filter(c => c.trim && c.trim.includes('/')).length
  const noTrim = cars.filter(c => !c.trim).length
  const goodTrim = cars.filter(c => c.trim && !c.trim.includes('/')).length
  console.log(`\nTotal: ${cars.length} | Good trim: ${goodTrim} | Bad trim (has /): ${badCount} | No trim: ${noTrim}`)

  await p.$disconnect()
}
main()
