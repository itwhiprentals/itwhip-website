// scripts/dry-run-drive-it-pro.ts
// Dry run to show what will be changed without actually changing anything

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🔍 DRY RUN: Drive It Pro Migration Preview')
  console.log('=' .repeat(70) + '\n')

  try {
    // Check if jordan@smartcardemo.com exists
    const existingHost = await prisma.rentalHost.findFirst({
      where: { email: 'jordan@smartcardemo.com' },
      include: {
        cars: {
          where: { isActive: true },
          select: { id: true, make: true, model: true, year: true, weeklyRate: true, vehicleType: true }
        }
      }
    })

    if (!existingHost) {
      console.log('❌ ERROR: jordan@smartcardemo.com not found in database')
      console.log('   Cannot proceed with migration.\n')
      return
    }

    console.log('✅ Found existing account: jordan@smartcardemo.com\n')
    console.log('📋 Current Account Details:')
    console.log('   Email:', existingHost.email)
    console.log('   Name:', existingHost.name)
    console.log('   Partner Company:', existingHost.partnerCompanyName || 'None')
    console.log('   Partner Slug:', existingHost.partnerSlug || 'None')
    console.log('   Business Host:', existingHost.isBusinessHost)
    console.log('   Business Approval:', existingHost.businessApprovalStatus)
    console.log('   Host Type:', existingHost.hostType)
    console.log('   Approval Status:', existingHost.approvalStatus)
    console.log('   Active Vehicles:', existingHost.cars.length)
    console.log()

    // Check for existing Drive It Pro account
    const driveItProExists = await prisma.rentalHost.findFirst({
      where: { email: 'Alex@driveitpro.com' }
    })

    if (driveItProExists) {
      console.log('⚠️  WARNING: Alex@driveitpro.com already exists in database!')
      console.log('   This migration will UPDATE the existing record.\n')
    } else {
      console.log('✅ Alex@driveitpro.com does not exist yet (new account will be created)\n')
    }

    // Check existing discounts
    const existingDiscounts = await prisma.partner_discounts.findMany({
      where: { hostId: existingHost.id }
    })

    console.log('📋 Existing Discounts:', existingDiscounts.length)
    if (existingDiscounts.length > 0) {
      existingDiscounts.forEach(d => {
        console.log(`   - ${d.code}: ${d.percentage}% off (${d.isActive ? 'active' : 'inactive'})`)
      })
    }
    console.log()

    // Check existing FAQs
    const existingFAQs = await prisma.partner_faqs.findMany({
      where: { hostId: existingHost.id }
    })

    console.log('📋 Existing FAQs:', existingFAQs.length)
    console.log()

    console.log('=' .repeat(70))
    console.log('📝 PROPOSED CHANGES:')
    console.log('=' .repeat(70) + '\n')

    console.log('1️⃣  RentalHost Account Update:')
    console.log('   ✏️  email: jordan@smartcardemo.com → Alex@driveitpro.com')
    console.log('   ✏️  name:', existingHost.name, '→ Alex Rodriguez')
    console.log('   ✏️  phone:', existingHost.phone, '→ +16022229619')
    console.log('   ✏️  partnerCompanyName: → Drive It Pro')
    console.log('   ✏️  partnerSlug: → drive-it-pro')
    console.log('   ✏️  isBusinessHost: → true')
    console.log('   ✏️  businessApprovalStatus: → APPROVED')
    console.log('   ✏️  hostType: → FLEET_PARTNER')
    console.log('   ✏️  approvalStatus: → APPROVED')
    console.log('   ✏️  + All partner profile fields (bio, hero, badges, benefits, policies, etc.)')
    console.log()

    console.log('2️⃣  Vehicle Pricing Update:')
    console.log(`   📊 ${existingHost.cars.length} vehicles will be updated:`)
    existingHost.cars.slice(0, 5).forEach(car => {
      console.log(`      ${car.year} ${car.make} ${car.model}:`)
      console.log(`         weeklyRate: $${car.weeklyRate} → $325.00`)
      console.log(`         vehicleType: ${car.vehicleType} → RIDESHARE`)
    })
    if (existingHost.cars.length > 5) {
      console.log(`      ... and ${existingHost.cars.length - 5} more vehicles`)
    }
    console.log()

    console.log('3️⃣  Discount Creation:')
    const newDriverExists = existingDiscounts.find(d => d.code === 'NEWDRIVER')
    if (newDriverExists) {
      console.log('   ⚠️  NEWDRIVER code already exists - will skip creation')
    } else {
      console.log('   ➕ New discount code: NEWDRIVER')
      console.log('      - Title: New Driver Discount')
      console.log('      - Percentage: 30% off')
      console.log('      - Description: New customer discount - $106-$128 off first week')
      console.log('      - Expires: 1 year from now')
      console.log('      - Max uses: Unlimited')
    }
    console.log()

    console.log('4️⃣  FAQs Creation:')
    if (existingFAQs.length > 0) {
      console.log(`   ⚠️  ${existingFAQs.length} FAQs already exist - will skip if duplicates`)
    }
    console.log('   ➕ 5 new FAQs will be added:')
    console.log('      1. Do you require a credit check?')
    console.log('      2. What vehicles do you offer?')
    console.log('      3. What is your rent-to-own program?')
    console.log('      4. Do you offer maintenance?')
    console.log('      5. What are your hours?')
    console.log()

    console.log('=' .repeat(70))
    console.log('🎯 EXPECTED RESULTS:')
    console.log('=' .repeat(70) + '\n')

    console.log('✅ Drive It Pro will appear at /rideshare as main partner (250+ fleet size)')
    console.log('✅ Drive It Pro will appear at /fleet/business as approved business')
    console.log('✅ Partner landing page will be live at /rideshare/drive-it-pro')
    console.log('✅ All vehicles priced at $325/week (+ tax = $352.95 total)')
    console.log('✅ NEWDRIVER discount code (30% off) will be available')
    console.log('✅ 5 FAQs will display on landing page')
    console.log()

    console.log('⚠️  IMPORTANT:')
    console.log('   - Login credentials will change to: Alex@driveitpro.com / Alex2026!')
    console.log('   - Logo must be uploaded separately to Cloudinary')
    console.log('   - Password must be set via password reset or manual update')
    console.log()

    console.log('=' .repeat(70))
    console.log('💡 To proceed with actual migration, run:')
    console.log('   npx tsx scripts/run-drive-it-pro-setup.ts')
    console.log('=' .repeat(70))

  } catch (error) {
    console.error('❌ Error during dry run:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()
