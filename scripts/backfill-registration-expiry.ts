import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ⚠️ SET THIS TO false TO EXECUTE ACTUAL CHANGES
const DRY_RUN = false

async function backfillRegistrationExpiry() {
  console.log('🔧 ===== BACKFILL REGISTRATION EXPIRY DATES =====\n')
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (Preview Only - No Changes)' : '⚠️  LIVE EXECUTION (Will Modify Data)'}\n`)

  if (!DRY_RUN) {
    console.log('⚠️  WARNING: Live execution mode enabled!')
    console.log('⚠️  Data will be permanently modified\n')
  }

  // Find all cars WITHOUT registrationExpiryDate
  const carsNeedingExpiry = await prisma.rentalCar.findMany({
    where: {
      registrationExpiryDate: null
    },
    include: {
      host: {
        select: {
          id: true,
          name: true,
          approvedAt: true
        }
      }
    }
  })

  console.log(`📊 Found ${carsNeedingExpiry.length} vehicles needing registration expiry dates\n`)

  const stats = {
    processed: 0,
    updated: 0,
    errors: [] as string[]
  }

  for (const car of carsNeedingExpiry) {
    stats.processed++

    try {
      // LOGIC: Set registration expiry to 1 year from host approval date
      // OR if no approval date, set to 1 year from vehicle creation
      // This is a conservative estimate - most states require annual registration
      
      let baseDate: Date
      let calculationMethod: string

      if (car.host.approvedAt) {
        baseDate = new Date(car.host.approvedAt)
        calculationMethod = 'Host approval date + 1 year'
      } else {
        baseDate = new Date(car.createdAt)
        calculationMethod = 'Vehicle creation date + 1 year'
      }

      // Add 1 year to base date
      const expiryDate = new Date(baseDate)
      expiryDate.setFullYear(expiryDate.getFullYear() + 1)

      console.log(`\n📌 ${car.year} ${car.make} ${car.model}`)
      console.log(`   Owner: ${car.host.name}`)
      console.log(`   Base Date: ${baseDate.toISOString().split('T')[0]}`)
      console.log(`   Calculated Expiry: ${expiryDate.toISOString().split('T')[0]}`)
      console.log(`   Method: ${calculationMethod}`)

      if (!DRY_RUN) {
        await prisma.rentalCar.update({
          where: { id: car.id },
          data: {
            registrationExpiryDate: expiryDate
          }
        })
        console.log(`   ✅ Updated`)
        stats.updated++
      } else {
        console.log(`   🔍 Would update`)
      }

    } catch (error) {
      const errorMsg = `Failed to process ${car.make} ${car.model}: ${error}`
      stats.errors.push(errorMsg)
      console.error(`   ❌ ${errorMsg}`)
    }
  }

  // SUMMARY
  console.log('\n\n📊 ===== BACKFILL SUMMARY =====\n')
  console.log(`Mode: ${DRY_RUN ? 'DRY RUN' : 'LIVE EXECUTION'}`)
  console.log(`Vehicles Processed: ${stats.processed}`)
  console.log(`Vehicles Updated: ${stats.updated}`)
  console.log(`Errors: ${stats.errors.length}`)

  if (stats.errors.length > 0) {
    console.log('\n⚠️  Errors encountered:')
    stats.errors.forEach(err => console.log(`  - ${err}`))
  }

  if (DRY_RUN) {
    console.log('\n💡 This was a DRY RUN - no data was changed')
    console.log('Set DRY_RUN = false at the top of the script to execute')
  } else {
    console.log('\n✅ Backfill complete!')
  }

  console.log('\n===== END =====\n')
}

backfillRegistrationExpiry()
  .then(() => {
    console.log('✅ Script complete!')
    prisma.$disconnect()
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    prisma.$disconnect()
    process.exit(1)
  })
