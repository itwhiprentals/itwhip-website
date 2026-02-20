// Upload Drive It Pro logo to Cloudinary
import { PrismaClient } from '@prisma/client'
import { v2 as cloudinary } from 'cloudinary'
import * as fs from 'fs'

const prisma = new PrismaClient()

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET
})

async function main() {
  console.log('📤 Uploading Drive It Pro logo to Cloudinary...\n')

  const logoPath = '/Users/macbookpro/Desktop/IMG_4854.PNG'

  try {
    // Upload to Cloudinary
    const result = await cloudinary.uploader.upload(logoPath, {
      folder: 'partners',
      public_id: 'drive-it-pro-logo',
      overwrite: true,
      resource_type: 'image'
    })

    console.log('✅ Uploaded to Cloudinary!')
    console.log('   URL:', result.secure_url)
    console.log('   Public ID:', result.public_id)
    console.log()

    // Update database
    const host = await prisma.rentalHost.findFirst({
      where: { email: 'Alex@driveitpro.com' }
    })

    if (!host) {
      console.error('❌ Drive It Pro host not found!')
      return
    }

    await prisma.rentalHost.update({
      where: { id: host.id },
      data: {
        partnerLogo: result.secure_url,
        profilePhoto: result.secure_url // Also set as profile photo
      }
    })

    console.log('✅ Updated database with logo URL')
    console.log()
    console.log('🎉 Done! Logo is now live at:')
    console.log('   /rideshare/drive-it-pro')
    console.log('   /rideshare (partner section)')
    console.log('   /fleet/business (approved businesses)')

  } catch (error) {
    console.error('❌ Upload failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
