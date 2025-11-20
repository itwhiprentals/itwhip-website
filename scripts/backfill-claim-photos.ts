import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function backfillClaimPhotos() {
  console.log('📸 Starting claim photos backfill...\n');

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

    // Create ClaimDamagePhoto records from car photos
    const damagePhotos = await prisma.claimDamagePhoto.createMany({
      data: carPhotos.slice(0, 5).map((photo, index) => ({
        claimId: claim.id,
        url: photo.url,
        caption: `Damage photo ${index + 1}`,
        order: index,
        uploadedBy: 'HOST',
      })),
    });

    console.log(`✅ Created ${damagePhotos.count} damage photos for claim ${claim.id}`);
  }

  console.log('\n🎉 Claim photos backfilled successfully!');
}

backfillClaimPhotos()
  .catch((e) => {
    console.error('❌ Error:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });