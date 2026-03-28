import { PrismaClient } from '@prisma/client'
const p = new PrismaClient()

async function main() {
  // Get the Prius Prime and Prius
  const cars = await p.rentalCar.findMany({
    where: { trim: { contains: '/' } },
    select: { id: true, year: true, make: true, model: true, trim: true, vin: true }
  })

  for (const car of cars) {
    console.log(`\n${car.year} ${car.make} ${car.model} | current trim: ${car.trim} | VIN: ${car.vin || '(none)'}`)

    if (car.vin) {
      const res = await fetch(`https://vpic.nhtsa.dot.gov/api/vehicles/decodevin/${car.vin}?format=json`)
      const data = await res.json()
      const results = data.Results as Array<{ Variable: string; Value: string | null }>

      const trimResult = results.find((r: any) => r.Variable === 'Trim')
      const seriesResult = results.find((r: any) => r.Variable === 'Series')
      const modelResult = results.find((r: any) => r.Variable === 'Model')

      console.log(`  NHTSA Trim: ${trimResult?.Value || '(none)'}`)
      console.log(`  NHTSA Series: ${seriesResult?.Value || '(none)'}`)
      console.log(`  NHTSA Model: ${modelResult?.Value || '(none)'}`)
    }
  }

  await p.$disconnect()
}
main()
