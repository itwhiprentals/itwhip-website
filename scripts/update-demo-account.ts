// scripts/update-demo-account.ts
// Updates demo account for Smartcar meeting with Jordan Black

import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'
import * as argon2 from 'argon2'

const prisma = new PrismaClient()

const OLD_EMAIL = 'nickpattt86@gmail.com'
const NEW_EMAIL = 'jordan@smartcardemo.com'
const NEW_PASSWORD = 'Jordan2026!'
const NEW_NAME = 'Jordan Black'

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Updating Demo Account for Smartcar Meeting')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  // Find existing host by old email
  const host = await prisma.rentalHost.findFirst({
    where: { email: OLD_EMAIL }
  })

  if (!host) {
    console.log(`No host found with email: ${OLD_EMAIL}`)
    console.log('Trying to find by new email in case already updated...')
    const existingHost = await prisma.rentalHost.findFirst({
      where: { email: NEW_EMAIL }
    })
    if (existingHost) {
      console.log(`Account already updated to ${NEW_EMAIL}`)
    } else {
      console.log('No account found. You may need to run create-itwhip-partner.ts first.')
    }
    return
  }

  console.log(`Found host: ${host.id} (${host.email})`)
  console.log(`User ID: ${host.userId}`)
  console.log('')

  // Hash new password
  const passwordHash = await hash(NEW_PASSWORD, {
    type: argon2.argon2id,
    memoryCost: 65536,
    timeCost: 3,
    parallelism: 4,
    hashLength: 32,
    saltLength: 16
  })

  // Update User record
  if (host.userId) {
    console.log('Updating User record...')
    await prisma.user.update({
      where: { id: host.userId },
      data: {
        email: NEW_EMAIL,
        name: NEW_NAME,
        passwordHash,
        emailVerified: true,
        isActive: true,
      }
    })
    console.log('  User updated')
  }

  // Update RentalHost record
  console.log('Updating RentalHost record...')
  await prisma.rentalHost.update({
    where: { id: host.id },
    data: {
      email: NEW_EMAIL,
      name: NEW_NAME,
      partnerSupportEmail: NEW_EMAIL,
      active: true,
      dashboardAccess: true,
      approvalStatus: 'APPROVED',
      isVerified: true,
    }
  })
  console.log('  RentalHost updated')

  // Update PartnerApplication if exists
  const app = await prisma.partnerApplication.findFirst({
    where: { hostId: host.id }
  })
  if (app) {
    console.log('Updating PartnerApplication...')
    await prisma.partnerApplication.update({
      where: { id: app.id },
      data: {
        contactName: NEW_NAME,
        contactEmail: NEW_EMAIL,
        status: 'APPROVED',
      }
    })
    console.log('  PartnerApplication updated')
  }

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('Demo Account Updated!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log(`  Email: ${NEW_EMAIL}`)
  console.log(`  Password: ${NEW_PASSWORD}`)
  console.log(`  Name: ${NEW_NAME}`)
  console.log(`  Login URL: /partner/login`)
  console.log('')
}

main()
  .catch((e) => {
    console.error('Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
