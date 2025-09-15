import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Array of placeholder profile photos (you can use AI-generated faces)
const profilePhotos = [
  'https://randomuser.me/api/portraits/men/1.jpg',
  'https://randomuser.me/api/portraits/women/1.jpg',
  'https://randomuser.me/api/portraits/men/2.jpg',
  'https://randomuser.me/api/portraits/women/2.jpg',
  'https://randomuser.me/api/portraits/men/3.jpg',
  'https://randomuser.me/api/portraits/women/3.jpg',
  'https://randomuser.me/api/portraits/men/4.jpg',
  'https://randomuser.me/api/portraits/women/4.jpg',
  'https://randomuser.me/api/portraits/men/5.jpg',
  'https://randomuser.me/api/portraits/women/5.jpg',
]

async function updateHostPhotos() {
  try {
    const hosts = await prisma.rentalHost.findMany({
      where: {
        OR: [
          { profilePhoto: null },
          { profilePhoto: '' }
        ]
      }
    })
    
    console.log(`Found ${hosts.length} hosts without profile photos`)
    
    for (let i = 0; i < hosts.length; i++) {
      const photoUrl = profilePhotos[i % profilePhotos.length]
      
      await prisma.rentalHost.update({
        where: { id: hosts[i].id },
        data: { profilePhoto: photoUrl }
      })
      
      console.log(`Updated ${hosts[i].name} with photo`)
    }
    
    console.log('✅ All hosts updated with profile photos')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

updateHostPhotos()
