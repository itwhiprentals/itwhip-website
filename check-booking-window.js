const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.rentalBooking.findUnique({ 
  where: { id: 'cmf4ufwtt000bdoxmvacjc0ir' } 
}).then(b => {
  const now = new Date();
  console.log('Current Time:', now.toLocaleString());
  console.log('Pickup Window Start:', b.pickupWindowStart?.toLocaleString());
  console.log('Pickup Window End:', b.pickupWindowEnd?.toLocaleString());
  console.log('Start Date:', b.startDate);
  console.log('Start Time:', b.startTime);
  console.log('');
  
  const canStart = b.pickupWindowStart && b.pickupWindowEnd && 
                   now >= b.pickupWindowStart && now <= b.pickupWindowEnd;
  
  console.log('Can Start?', canStart ? 'YES' : 'NO');
  
  if (!canStart) {
    console.log('Why not?');
    if (!b.pickupWindowStart) console.log('- No pickup window start');
    if (!b.pickupWindowEnd) console.log('- No pickup window end');
    if (b.pickupWindowStart && now < b.pickupWindowStart) console.log('- Too early');
    if (b.pickupWindowEnd && now > b.pickupWindowEnd) console.log('- Too late');
  }
  
  console.log('\nDirect trip start URL:');
  console.log('http://localhost:3000/rentals/trip/start/' + b.id);
}).finally(() => p.$disconnect());
