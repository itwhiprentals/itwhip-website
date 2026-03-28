const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.rentalCar.findMany({
    where: { vehicleType: 'RIDESHARE' },
    select: { id: true, make: true, model: true, year: true, rules: true }
  });

  for (const car of cars) {
    let rules = [];
    try { rules = JSON.parse(car.rules || '[]'); } catch(e) {}
    if (!Array.isArray(rules)) rules = [];
    rules = rules.filter(r => r.indexOf('miles/day') === -1);
    if (rules.indexOf('Unlimited mileage') === -1) rules.push('Unlimited mileage');

    await prisma.rentalCar.update({
      where: { id: car.id },
      data: {
        mileageDaily: 99999,
        mileageWeekly: 99999,
        mileageMonthly: 99999,
        rules: JSON.stringify(rules)
      }
    });
    console.log('Updated:', car.year, car.make, car.model);
  }

  console.log('Done:', cars.length, 'rideshare cars updated');
}

main().then(() => prisma.$disconnect());
