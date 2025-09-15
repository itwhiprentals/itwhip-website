import { PrismaClient } from '@prisma/client'
const prisma = new PrismaClient()

async function main() {
  const hosts = await prisma.rentalHost.findMany()
  console.log('Found hosts:', hosts.length)
  hosts.forEach(host => {
    console.log(`- ${host.name} (${host.email})`)
  })
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())