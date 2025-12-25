import { prisma } from '../app/lib/database/prisma'

async function checkProfiles() {
  console.log("🔍 Checking profiles for hxris007@gmail.com...\n")

  const user = await prisma.user.findUnique({
    where: { email: "hxris007@gmail.com" },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      role: true,
      legacyDualId: true
    }
  })

  if (user === null) {
    console.log("❌ User not found")
    await prisma.$disconnect()
    return
  }

  console.log("✅ User:", user)
  console.log()

  // Check for RentalHost
  const host = await prisma.rentalHost.findFirst({
    where: { userId: user.id },
    select: { id: true, email: true, approvalStatus: true }
  })

  console.log("🏠 RentalHost profile:", host ? host : "None")
  console.log()

  // Check for ReviewerProfile
  const guest = await prisma.reviewerProfile.findFirst({
    where: { userId: user.id },
    select: { id: true, email: true, phoneNumber: true }
  })

  console.log("👤 ReviewerProfile (Guest):", guest ? guest : "None")

  await prisma.$disconnect()
}

checkProfiles()
