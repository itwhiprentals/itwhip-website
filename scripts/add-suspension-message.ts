// scripts/add-suspension-message.ts
import { prisma } from '@/app/lib/database/prisma'

async function addSuspensionMessage() {
  const claimId = 'cmh6ohqop0005doilht4bag3z'
  const carId = 'cmfn3fdhf0001l8040ao0a3h8'

  try {
    // Get current rules
    const car = await prisma.rentalCar.findUnique({
      where: { id: carId },
      select: { rules: true }
    })

    if (!car) {
      console.log('❌ Car not found')
      return
    }

    const rules = car.rules ? JSON.parse(car.rules as string) : {}

    // Add suspension message
    rules.suspensionMessage = 'Insurance claim filed: ACCIDENT - Vehicle offline pending review'

    // Update
    await prisma.rentalCar.update({
      where: { id: carId },
      data: {
        rules: JSON.stringify(rules)
      }
    })

    console.log('✅ Suspension message added!')
  } catch (error) {
    console.error('❌ Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

addSuspensionMessage()