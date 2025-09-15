// scripts/import-all-hosts.js
const { PrismaClient } = require('@prisma/client')
const { DEFAULT_HOST_IDS } = require('../app/sys-2847/fleet/constants')

const prisma = new PrismaClient()

async function main() {
  console.log('Starting to import hosts...')
  
  let created = 0
  let skipped = 0
  
  for (const host of DEFAULT_HOST_IDS) {
    try {
      const existing = await prisma.rentalHost.findUnique({
        where: { email: host.email }
      })
      
      if (existing) {
        console.log(`Skipped: ${host.name} (already exists)`)
        skipped++
      } else {
        await prisma.rentalHost.create({
          data: {
            name: host.name,
            email: host.email,
            phone: '602-555-' + Math.floor(1000 + Math.random() * 9000),
            city: 'Phoenix',
            state: 'AZ',
            responseTime: Math.floor(10 + Math.random() * 50),
            responseRate: 95 + Math.random() * 5,
            acceptanceRate: 85 + Math.random() * 15,
            rating: 4.5 + Math.random() * 0.5,
            totalTrips: Math.floor(Math.random() * 50),
            isVerified: Math.random() > 0.3,
            active: true
          }
        })
        console.log(`Created: ${host.name}`)
        created++
      }
    } catch (error) {
      console.error(`Error creating ${host.name}:`, error)
    }
  }
  
  console.log(`\nComplete! Created ${created} hosts, skipped ${skipped} existing.`)
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())