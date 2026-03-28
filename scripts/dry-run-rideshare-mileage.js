const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function main() {
  const cars = await prisma.rentalCar.findMany({
    where: { vehicleType: 'RIDESHARE' },
    select: { id: true, make: true, model: true, year: true, rules: true, mileageDaily: true, mileageWeekly: true, mileageMonthly: true }
  });

  console.log('DRY RUN - ' + cars.length + ' rideshare cars would be updated:\n');

  for (const car of cars) {
    let rules = [];
    try { rules = JSON.parse(car.rules || '[]'); } catch(e) {}
    if (!Array.isArray(rules)) rules = [];
    const oldRules = JSON.stringify(rules);
    rules = rules.filter(r => r.indexOf('miles/day') === -1);
    if (rules.indexOf('Unlimited mileage') === -1) rules.push('Unlimited mileage');
    const newRules = JSON.stringify(rules);

    console.log(car.year + ' ' + car.make + ' ' + car.model);
    console.log('  mileage: ' + car.mileageDaily + '/' + car.mileageWeekly + '/' + car.mileageMonthly + ' -> 99999/99999/99999');
    console.log('  rules: ' + oldRules + ' -> ' + newRules);
    console.log('');
  }

  console.log('NO CHANGES MADE - dry run only');
}

main().then(() => prisma.$disconnect());
