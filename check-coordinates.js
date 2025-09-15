const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function checkCoordinates() {
  const totalCars = await prisma.rentalCar.count();
  const carsWithCoords = await prisma.rentalCar.count({
    where: {
      AND: [
        { latitude: { not: null } },
        { longitude: { not: null } }
      ]
    }
  });
  
  console.log(`Total cars: ${totalCars}`);
  console.log(`Cars with coordinates: ${carsWithCoords}`);
  console.log(`Cars missing coordinates: ${totalCars - carsWithCoords}`);
  
  // Get sample of cars without coords
  const sampleCars = await prisma.rentalCar.findMany({
    where: {
      OR: [
        { latitude: null },
        { longitude: null }
      ]
    },
    take: 3,
    select: {
      id: true,
      make: true,
      model: true,
      address: true,
      city: true,
      state: true
    }
  });
  
  console.log('\nSample cars needing geocoding:');
  sampleCars.forEach(car => {
    console.log(`- ${car.make} ${car.model}: ${car.address}, ${car.city}, ${car.state}`);
  });
}

checkCoordinates()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
