import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function deleteUser() {
  const userId = 'cmjldf9kn0000do2a92zzyk3g'
  const email = 'josedmurillo17@gmail.com'

  try {
    // Delete in order due to foreign keys
    const accounts = await prisma.account.deleteMany({ where: { userId } })
    console.log(`Deleted ${accounts.count} accounts`)

    const profiles = await prisma.reviewerProfile.deleteMany({
      where: { OR: [{ userId }, { email }] }
    })
    console.log(`Deleted ${profiles.count} reviewer profiles`)

    const users = await prisma.user.deleteMany({ where: { id: userId } })
    console.log(`Deleted ${users.count} users`)

    console.log('\n✅ Test user deleted successfully!')
  } catch (error) {
    console.error('Error:', error)
  } finally {
    await prisma.$disconnect()
  }
}

deleteUser()
