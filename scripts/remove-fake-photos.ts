import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function removeFakePhotos() {
  try {
    // Remove only the fake randomuser.me photos
    const result = await prisma.rentalHost.updateMany({
      where: {
        profilePhoto: {
          contains: 'randomuser.me'
        }
      },
      data: {
        profilePhoto: null
      }
    })
    
    console.log(`✅ Removed fake photos from ${result.count} hosts`)
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

removeFakePhotos()
