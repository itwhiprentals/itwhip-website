const { PrismaClient } = require('@prisma/client');
const p = new PrismaClient();

p.rentalBooking.findUnique({ 
  where: { id: 'cmf4ufwtt000bdoxmvacjc0ir' },
  select: { 
    bookingCode: true, 
    status: true, 
    tripStatus: true, 
    pickupWindowStart: true, 
    pickupWindowEnd: true 
  }
}).then(b => {
  const now = new Date();
  const canStart = now >= new Date(b.pickupWindowStart) && now <= new Date(b.pickupWindowEnd);
  
  console.log('=== Trip Start Readiness ===');
  console.log('Booking:', b.bookingCode);
  console.log('Status:', b.status);
  console.log('Trip Status:', b.tripStatus);
  console.log('Pickup Window:', new Date(b.pickupWindowStart).toLocaleString());
  console.log('Can Start Now?', canStart ? 'YES' : 'NO (outside window)');
  
  if (!canStart && b.pickupWindowStart) {
    const timeUntil = new Date(b.pickupWindowStart) - now;
    const hoursUntil = Math.floor(timeUntil / (1000 * 60 * 60));
    const minutesUntil = Math.floor((timeUntil % (1000 * 60 * 60)) / (1000 * 60));
    console.log('Time until window opens:', hoursUntil, 'hours', minutesUntil, 'minutes');
  }
}).finally(() => p.$disconnect());
