// scripts/migrate-drive-it-pro.ts
// Execute Drive It Pro migration step by step

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting Drive It Pro migration...\n')

  try {
    // STEP 1: Update RentalHost account
    console.log('1️⃣  Updating RentalHost account...')
    const updateHost = await prisma.$executeRaw`
      UPDATE "RentalHost"
      SET
        email = 'Alex@driveitpro.com',
        name = 'Alex Rodriguez',
        phone = '+16022229619',
        "partnerCompanyName" = 'Drive It Pro',
        "partnerSlug" = 'drive-it-pro',
        "isBusinessHost" = true,
        "businessApprovalStatus" = 'APPROVED',
        "hostType" = 'FLEET_PARTNER',
        "approvalStatus" = 'APPROVED',
        active = true,
        "partnerSupportEmail" = 'info@driveitpro.com',
        "partnerSupportPhone" = '+16022229619',
        city = 'Phoenix',
        state = 'AZ',
        "zipCode" = '85009',
        "partnerWebsite" = 'https://driveitpro.com',
        "partnerShowWebsite" = true,
        "partnerShowPhone" = true,
        "partnerShowEmail" = true,
        "partnerFleetSize" = 250,
        "partnerHeroTitle" = 'Phoenix''s Premier Rideshare Vehicle Rentals',
        "partnerHeroSubtitle" = '250+ Fuel-Efficient Toyota Prius Hybrids | No Credit Checks | In-House Maintenance',
        "partnerBio" = 'Drive It Pro is Phoenix''s locally-owned rideshare car rental company, founded in 2014, specializing in accessible vehicle rentals for rideshare and delivery drivers. We eliminate traditional barriers with no credit checks, transparent pricing, and in-house maintenance. Our exclusive fleet of fuel-efficient Toyota Prius hybrids saves drivers $20-$50 weekly on fuel while providing 99% uptime guarantee.',
        "partnerPrimaryColor" = '#EA580C',
        "partnerServices" = '{"rideshare":{"enabled":true,"platforms":["Uber","Lyft","DoorDash","Instacart","Veyo"],"description":"All vehicles pre-approved for major rideshare and delivery platforms"},"rentals":{"enabled":false}}'::jsonb,
        "partnerBadges" = '[{"icon":"IoCheckmarkCircle","label":"No Credit Checks","description":"Get approved regardless of credit history"},{"icon":"IoConstruct","label":"In-House Maintenance","description":"Full-service garage with included repairs"},{"icon":"IoTrendingUp","label":"40-50+ MPG","description":"Fuel-efficient Toyota Prius hybrids only"},{"icon":"IoShieldCheckmark","label":"99% Uptime Guarantee","description":"Less than 1% downtime for maintenance"},{"icon":"IoHome","label":"Rent-to-Own Available","description":"48-month path to vehicle ownership"},{"icon":"IoCalendar","label":"Open Saturdays","description":"Only rideshare rental company open weekends"}]'::jsonb,
        "partnerBenefits" = '["Lowest entry cost: $225 down payment","Weekly rate: $325 + tax ($352.95 total)","New customer discount: $106-$128 off first week","Unlimited mileage on all platforms","Maintenance costs included in rental","Vacation hold program (up to 1 week)","16-hour daily customer support","Phone/text/WhatsApp booking"]'::jsonb,
        "partnerPolicies" = '{"cancellation":"Contact support for cancellation policies","insurance":"Drivers can obtain independent liability coverage ($60-$100/month)","maintenance":"All maintenance costs included. 6-day/week service available.","deposit":"$225 down payment required. Rent-to-own program available with $25 enrollment fee.","fuelPolicy":"Driver responsible for fuel. Hybrid efficiency saves $20-$50 weekly.","rentalTerms":"Weekly rentals only. 48-month rent-to-own option available."}'::jsonb,
        "updatedAt" = NOW()
      WHERE email = 'jordan@smartcardemo.com'
    `
    console.log(`✅ Updated ${updateHost} RentalHost record(s)\n`)

    // STEP 2: Update User table if exists
    console.log('2️⃣  Updating User table...')
    const updateUser = await prisma.$executeRaw`
      UPDATE "User"
      SET
        email = 'Alex@driveitpro.com',
        name = 'Alex Rodriguez',
        "updatedAt" = NOW()
      WHERE email = 'jordan@smartcardemo.com'
    `
    console.log(`✅ Updated ${updateUser} User record(s)\n`)

    // Get the hostId for Drive It Pro
    const host = await prisma.rentalHost.findFirst({
      where: { email: 'Alex@driveitpro.com' },
      select: { id: true }
    })

    if (!host) {
      throw new Error('Drive It Pro host not found after migration!')
    }

    console.log(`✅ Drive It Pro host ID: ${host.id}\n`)

    // STEP 3: Update vehicle pricing
    console.log('3️⃣  Updating vehicle pricing...')
    const updateVehicles = await prisma.$executeRaw`
      UPDATE "RentalCar"
      SET
        "dailyRate" = 50.42,
        "weeklyRate" = 325.00,
        "vehicleType" = 'RIDESHARE',
        "isActive" = true,
        "updatedAt" = NOW()
      WHERE "hostId" = ${host.id}
    `
    console.log(`✅ Updated ${updateVehicles} vehicle(s)\n`)

    // STEP 4: Create discount code
    console.log('4️⃣  Creating NEWDRIVER discount...')
    try {
      await prisma.partner_discounts.create({
        data: {
          id: crypto.randomUUID(),
          hostId: host.id,
          code: 'NEWDRIVER',
          title: 'New Driver Discount',
          description: 'New customer discount - $106-$128 off first week',
          percentage: 30.0,
          startsAt: new Date(),
          expiresAt: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
          isActive: true,
          maxUses: null,
          usedCount: 0,
          createdAt: new Date(),
          updatedAt: new Date()
        }
      })
      console.log('✅ Created NEWDRIVER discount\n')
    } catch (error: any) {
      if (error.code === 'P2002') {
        console.log('⚠️  NEWDRIVER discount already exists, skipping\n')
      } else {
        throw error
      }
    }

    // STEP 5: Create FAQs
    console.log('5️⃣  Creating FAQs...')
    const faqs = [
      {
        question: 'Do you require a credit check?',
        answer: 'No! Drive It Pro eliminates credit screening from our rental process, making reliable transportation accessible regardless of credit history.',
        order: 1
      },
      {
        question: 'What vehicles do you offer?',
        answer: 'We specialize exclusively in fuel-efficient Toyota Prius Gen III hybrid vehicles, all pre-approved for Uber, Lyft, DoorDash, Instacart, and Veyo.',
        order: 2
      },
      {
        question: 'What is your rent-to-own program?',
        answer: 'Our rent-to-own program requires a $25 one-time enrollment fee. After 48 months of on-time payments, you receive either the vehicle title OR a $5,000 account credit.',
        order: 3
      },
      {
        question: 'Do you offer maintenance?',
        answer: 'Yes! All maintenance costs are included in your rental agreement. We operate our own full-service garage with mechanics available 6 days a week, no appointments required. We maintain less than 1% downtime.',
        order: 4
      },
      {
        question: 'What are your hours?',
        answer: 'Monday-Friday: 9:00 AM - 5:00 PM, Saturday: 9:00 AM - 2:00 PM, Sunday: Closed. Customer support available ~16 hours daily via phone, text, WhatsApp, and live chat.',
        order: 5
      }
    ]

    for (const faq of faqs) {
      try {
        await prisma.partner_faqs.create({
          data: {
            id: crypto.randomUUID(),
            hostId: host.id,
            ...faq,
            isActive: true,
            createdAt: new Date(),
            updatedAt: new Date()
          }
        })
        console.log(`   ✅ Created FAQ: ${faq.question}`)
      } catch (error: any) {
        console.log(`   ⚠️  FAQ already exists: ${faq.question}`)
      }
    }
    console.log()

    // VERIFICATION
    console.log('=' .repeat(70))
    console.log('🔍 VERIFICATION')
    console.log('=' .repeat(70) + '\n')

    const verifyHost = await prisma.rentalHost.findFirst({
      where: { email: 'Alex@driveitpro.com' },
      select: {
        email: true,
        name: true,
        partnerCompanyName: true,
        partnerSlug: true,
        isBusinessHost: true,
        businessApprovalStatus: true,
        hostType: true,
        approvalStatus: true,
        _count: {
          select: {
            cars: true
          }
        }
      }
    })

    console.log('✅ RentalHost:')
    console.log('   Email:', verifyHost?.email)
    console.log('   Name:', verifyHost?.name)
    console.log('   Company:', verifyHost?.partnerCompanyName)
    console.log('   Slug:', verifyHost?.partnerSlug)
    console.log('   Business Host:', verifyHost?.isBusinessHost)
    console.log('   Business Approval:', verifyHost?.businessApprovalStatus)
    console.log('   Host Type:', verifyHost?.hostType)
    console.log('   Vehicles:', verifyHost?._count.cars)
    console.log()

    const verifyDiscounts = await prisma.partner_discounts.findMany({
      where: { hostId: host.id },
      select: { code: true, percentage: true, isActive: true }
    })
    console.log('✅ Discounts:', verifyDiscounts.length)
    verifyDiscounts.forEach(d => console.log(`   ${d.code}: ${d.percentage}% off (${d.isActive ? 'active' : 'inactive'})`))
    console.log()

    const verifyFAQs = await prisma.partner_faqs.count({
      where: { hostId: host.id }
    })
    console.log('✅ FAQs:', verifyFAQs)
    console.log()

    console.log('=' .repeat(70))
    console.log('🎉 MIGRATION COMPLETE!')
    console.log('=' .repeat(70))
    console.log()
    console.log('📝 Next steps:')
    console.log('   1. Upload Drive It Pro logo to Cloudinary')
    console.log('   2. Update partnerLogo field with URL')
    console.log('   3. Set password for Alex@driveitpro.com to: Alex2026!')
    console.log('   4. Visit /rideshare - Drive It Pro should appear as main partner')
    console.log('   5. Visit /fleet/business - Drive It Pro should be in approved list')
    console.log('   6. Visit /rideshare/drive-it-pro - Landing page should work')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
