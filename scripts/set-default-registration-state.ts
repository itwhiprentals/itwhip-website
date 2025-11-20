import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

const DRY_RUN = false // Set to false to execute

async function setDefaultRegistrationState() {
  console.log('🔧 ===== SET DEFAULT REGISTRATION STATE =====\n')
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN' : '⚠️  LIVE EXECUTION'}\n`)

  const carsWithoutState = await prisma.rentalCar.findMany({
    where: {
      registrationState: null
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      state: true // Vehicle location state
    }
  })

  console.log(`📊 Found ${carsWithoutState.length} vehicles without registration state\n`)

  let updated = 0

  for (const car of carsWithoutState) {
    // Use vehicle's location state as default registration state
    const regState = car.state || 'AZ'
    
    console.log(`${car.year} ${car.make} ${car.model}`)
    console.log(`  Location State: ${car.state || 'Not set'}`)
    console.log(`  Will set Registration State: ${regState}`)
    
    if (!DRY_RUN) {
      await prisma.rentalCar.update({
        where: { id: car.id },
        data: { registrationState: regState }
      })
      console.log(`  ✅ Updated\n`)
      updated++
    } else {
      console.log(`  🔍 Would update\n`)
    }
  }

  console.log(`\n📊 Summary:`)
  console.log(`Processed: ${carsWithoutState.length}`)
  console.log(`Updated: ${updated}`)
  
  if (DRY_RUN) {
    console.log('\n💡 DRY RUN - Set DRY_RUN = false to execute')
  }
  
  await prisma.$disconnect()
}

setDefaultRegistrationState()
  .catch(console.error)
