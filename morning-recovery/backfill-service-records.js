// backfill-service-records.js
const { PrismaClient } = require('@prisma/client');
const prisma = new PrismaClient();

async function backfillServiceRecords() {
  try {
    console.log('🚀 BACKFILL - Updating service records...\n');
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
            host: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log(`\n📊 Found ${records.length} records to update\n`);

    if (records.length === 0) {
      console.log('✅ No records need updating! All are already attributed.');
      await prisma.$disconnect();
      return;
    }

    // Track results
    let successCount = 0;
    let errorCount = 0;
    const errors = [];

    // Update each record
    for (const record of records) {
      try {
        const updated = await prisma.vehicleServiceRecord.update({
          where: { id: record.id },
          data: {
            addedBy: record.car.host.id,
            addedByType: 'HOST'
          }
        });

        successCount++;
        console.log(`✅ Updated: ${record.serviceType} - ${record.car.year} ${record.car.make} ${record.car.model}`);
        console.log(`   Host: ${record.car.host.name}`);
        console.log(`   Changed from: "SYSTEM" → "${record.car.host.id}"`);
        console.log('');

      } catch (error) {
        errorCount++;
        errors.push({
          recordId: record.id,
          error: error.message
        });
        console.error(`❌ Failed to update record ${record.id}:`, error.message);
      }
    }

    // Final summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 BACKFILL COMPLETE');
    console.log('='.repeat(60));
    console.log(`✅ Successfully updated: ${successCount} records`);
    if (errorCount > 0) {
      console.log(`❌ Failed to update: ${errorCount} records`);
      console.log('\nErrors:');
      errors.forEach(err => {
        console.log(`  • Record ${err.recordId}: ${err.error}`);
      });
    }
    console.log('='.repeat(60) + '\n');

    // Create activity log entry for this backfill
    await prisma.activityLog.create({
      data: {
        action: 'SERVICE_RECORDS_BACKFILLED',
        entityType: 'SYSTEM',
        entityId: 'backfill-script',
        metadata: {
          recordsUpdated: successCount,
          recordsFailed: errorCount,
          timestamp: new Date().toISOString(),
          script: 'backfill-service-records.js'
        }
      }
    });

    console.log('✅ Activity log entry created');
    console.log('🎉 Backfill process complete!\n');

  } catch (error) {
    console.error('\n❌ Fatal Error:', error.message);
    console.error(error);
  } finally {
    await prisma.$disconnect();
  }
}

backfillServiceRecords();