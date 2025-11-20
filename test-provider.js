const { PrismaClient } = require('@prisma/client')
const prisma = new PrismaClient()

async function main() {
  const providers = await prisma.insuranceProvider.findMany({
    select: { id: true, name: true, type: true, isActive: true }
  })
  
  console.log('📋 Insurance Providers:')
  providers.forEach(p => {
    console.log(`  ${p.name} (${p.type}) - ${p.isActive ? '✅ Active' : '❌ Inactive'}`)
    console.log(`  ID: ${p.id}`)
    console.log('')
  })
  
  if (providers.length === 0) {
    console.log('❌ No providers found. Run seed script first.')
  }
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect())
