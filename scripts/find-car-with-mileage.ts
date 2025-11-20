import prisma from '../app/lib/database/prisma'

async function findCarWithMileage() {
  const cars = await prisma.rentalCar.findMany({
    where: {
      totalTrips: { gt: 0 },
      avgMilesPerTrip: { not: null, gt: 0 }
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      totalTrips: true,
      avgMilesPerTrip: true,
      currentMileage: true
    },
    take: 5
  })

  console.log('🚗 Vehicles with mileage data:')
  console.table(cars)
}

findCarWithMileage()
  .then(() => process.exit(0))
  .catch(console.error)
