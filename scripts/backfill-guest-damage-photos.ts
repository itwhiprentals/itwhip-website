// scripts/backfill-guest-damage-photos.ts
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillGuestDamagePhotos() {
  console.log('👤 Starting guest damage photos backfill...\n');

  // Get all claims with their bookings
  const claims = await prisma.claim.findMany({
    include: {
      booking: {
        include: {
          car: {
            include: {
              photos: true,
            },
          },
        },
      },
    },
  });

  console.log(`📊 Found ${claims.length} claims\n`);

  for (const claim of claims) {
    const carPhotos = claim.booking.car.photos;

    if (carPhotos.length === 0) {
      console.log(`⚠️  Claim ${claim.id} - No car photos available`);
      continue;
    }

    // Use car photos as guest damage photos (for testing)
    // In reality, these would be different photos uploaded by the guest
    const guestDamagePhotoUrls = carPhotos.slice(0, 3).map(p => p.url);

    // Update the booking with guest damage info
    await prisma.rentalBooking.update({
      where: { id: claim.bookingId },
      data: {
        damageReported: true,
        damageDescription: 'Guest noticed minor scratches on the front bumper and a small dent on the passenger door during trip completion.',
        damagePhotos: JSON.stringify(guestDamagePhotoUrls),
      },
    });

    console.log(`✅ Added ${guestDamagePhotoUrls.length} guest damage photos to booking ${claim.booking.bookingCode}`);
  }

  console.log('\n🎉 Guest damage photos backfilled successfully!');
}

backfillGuestDamagePhotos()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });