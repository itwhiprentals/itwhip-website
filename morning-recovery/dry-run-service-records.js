// dry-run-service-records.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function dryRunServiceRecords() {
  try {
    console.log('🔍 DRY RUN - Finding records to backfill...\n');
    console.log('='.repeat(60));
    
    // Get all service records with SYSTEM attribution
    const records = await prisma.vehicleServiceRecord.findMany({
      where: {
        addedBy: 'SYSTEM'
      },
      include: {
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            licensePlate: true,
            host: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        serviceDate: 'desc'
      }
    });

    console.log(`\n📊 FOUND ${records.length} SERVICE RECORDS TO BACKFILL\n`);

    if (records.length === 0) {
      console.log('✅ No records need backfilling! All are already attributed.');
      return;
    }

    // Show each record in detail
    records.forEach((record, index) => {
      console.log(`\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`📝 RECORD #${index + 1}`);
      console.log(`━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`);
      console.log(`Record ID:       ${record.id}`);
      console.log(`Service Type:    ${record.serviceType}`);
      console.log(`Service Date:    ${record.serviceDate.toLocaleDateString()}`);
      console.log(`Mileage:         ${record.mileageAtService.toLocaleString()} mi`);
      console.log(`Shop:            ${record.shopName}`);
      console.log(`Cost:            $${record.costTotal}`);
      console.log(`\n🚗 VEHICLE:`);
      console.log(`   ${record.car.year} ${record.car.make} ${record.car.model}`);
      console.log(`   License: ${record.car.licensePlate || 'N/A'}`);
      console.log(`   Car ID: ${record.car.id}`);
      console.log(`\n👤 HOST (Owner):`);
      console.log(`   Name:  ${record.car.host.name}`);
      console.log(`   Email: ${record.car.host.email}`);
      console.log(`   ID:    ${record.car.host.id}`);
      console.log(`\n📋 CURRENT VALUES:`);
      console.log(`   addedBy:     "${record.addedBy}" ❌ (will change)`);
      console.log(`   addedByType: "${record.addedByType}" ✅ (correct)`);
      console.log(`\n✏️  WILL CHANGE TO:`);
      console.log(`   addedBy:     "${record.car.host.id}" ✅`);
      console.log(`   addedByType: "HOST" ✅`);
    });

    console.log('\n\n' + '='.repeat(60));
    console.log('📊 SUMMARY');
    console.log('='.repeat(60));
    console.log(`Total records to update: ${records.length}`);
    console.log(`\nUnique hosts affected:`);
    
    const uniqueHosts = [...new Set(records.map(r => r.car.host.id))];
    uniqueHosts.forEach(hostId => {
      const host = records.find(r => r.car.host.id === hostId).car.host;
      const count = records.filter(r => r.car.host.id === hostId).length;
      console.log(`   • ${host.name} (${count} record${count > 1 ? 's' : ''})`);
    });

    console.log(`\n✅ This is a DRY RUN - no changes made to database`);
    console.log(`\n🚀 To apply changes, run: node backfill-service-records.js`);
    console.log('='.repeat(60) + '\n');

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

dryRunServiceRecords();