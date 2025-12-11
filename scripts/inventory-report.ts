// scripts/inventory-report.ts
// Run: npx ts-node scripts/inventory-report.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('\n=== ITWHIP INVENTORY REPORT ===\n')

  // 1. Total cars
  const totalCars = await prisma.rentalCar.count({ where: { isActive: true } })
  console.log(`Total Active Cars: ${totalCars}\n`)

  // 2. Cars by Make
  console.log('--- CARS BY MAKE ---')
  const byMake = await prisma.rentalCar.groupBy({
    by: ['make'],
    where: { isActive: true },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  })
  byMake.forEach(m => console.log(`${m.make}: ${m._count.id}`))

  // 3. Cars by City
  console.log('\n--- CARS BY CITY ---')
  const byCity = await prisma.rentalCar.groupBy({
    by: ['city'],
    where: { isActive: true },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  })
  byCity.forEach(c => console.log(`${c.city}: ${c._count.id}`))

  // 4. Cars by Type
  console.log('\n--- CARS BY TYPE ---')
  const byType = await prisma.rentalCar.groupBy({
    by: ['carType'],
    where: { isActive: true },
    _count: { id: true },
    orderBy: { _count: { id: 'desc' } }
  })
  byType.forEach(t => console.log(`${t.carType}: ${t._count.id}`))

  // 5. Cars with Airport Pickup
  console.log('\n--- AIRPORT PICKUP ---')
  const withAirport = await prisma.rentalCar.count({
    where: { isActive: true, airportPickup: true }
  })
  console.log(`Cars with Airport Pickup: ${withAirport}`)

  // 6. Price Range
  const priceStats = await prisma.rentalCar.aggregate({
    where: { isActive: true },
    _min: { dailyRate: true },
    _max: { dailyRate: true },
    _avg: { dailyRate: true }
  })
  console.log('\n--- PRICE RANGE ---')
  console.log(`Min Daily: $${priceStats._min.dailyRate}`)
  console.log(`Max Daily: $${priceStats._max.dailyRate}`)
  console.log(`Avg Daily: $${Math.round(priceStats._avg.dailyRate || 0)}`)

  // 7. Sample cars
  console.log('\n--- SAMPLE CARS (first 10) ---')
  const sampleCars = await prisma.rentalCar.findMany({
    where: { isActive: true },
    select: { make: true, model: true, year: true, city: true, dailyRate: true, carType: true },
    take: 10
  })
  sampleCars.forEach(c => console.log(`${c.year} ${c.make} ${c.model} | ${c.city} | $${c.dailyRate}/day | ${c.carType}`))

  console.log('\n=== END REPORT ===\n')
}

main()
  .catch(e => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(() => prisma.$disconnect())
