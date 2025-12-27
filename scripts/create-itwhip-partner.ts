// scripts/create-itwhip-partner.ts
// Creates ItWhip as a PENDING Fleet Partner application
// Email: nickpattt86@gmail.com (partner receives notifications)
// System sends emails FROM info@itwhip.com

// Load environment variables first
import * as dotenv from 'dotenv'
import * as path from 'path'
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

import { PrismaClient } from '@prisma/client'
import { hash } from 'argon2'

const prisma = new PrismaClient()

const PARTNER_EMAIL = 'nickpattt86@gmail.com'
const COMPANY_NAME = 'ItWhip'
const PARTNER_SLUG = 'itwhip'

async function main() {
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('🧹 Cleaning Up Existing ItWhip Data')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  // Find existing hosts to clean up
  const existingHosts = await prisma.rentalHost.findMany({
    where: {
      OR: [
        { email: PARTNER_EMAIL },
        { partnerSlug: PARTNER_SLUG }
      ]
    },
    select: { id: true }
  })

  const hostIds = existingHosts.map(h => h.id)

  if (hostIds.length > 0) {
    // Delete partner applications (references host)
    const deletedApps = await prisma.partnerApplication.deleteMany({
      where: { hostId: { in: hostIds } }
    })
    if (deletedApps.count > 0) console.log(`   Deleted ${deletedApps.count} partner applications`)

    // Delete partner FAQs
    const deletedFaqs = await prisma.partnerFAQ.deleteMany({
      where: { hostId: { in: hostIds } }
    })
    if (deletedFaqs.count > 0) console.log(`   Deleted ${deletedFaqs.count} FAQs`)

    // Delete partner documents
    const deletedDocs = await prisma.partnerDocument.deleteMany({
      where: { hostId: { in: hostIds } }
    })
    if (deletedDocs.count > 0) console.log(`   Deleted ${deletedDocs.count} partner documents`)

    // Delete rental cars (references host)
    const deletedCars = await prisma.rentalCar.deleteMany({
      where: { hostId: { in: hostIds } }
    })
    if (deletedCars.count > 0) console.log(`   Deleted ${deletedCars.count} rental cars`)

    // Delete rental hosts
    const deletedHosts = await prisma.rentalHost.deleteMany({
      where: { id: { in: hostIds } }
    })
    if (deletedHosts.count > 0) console.log(`   Deleted ${deletedHosts.count} rental hosts`)
  }

  // Delete users with this email
  const deletedUsers = await prisma.user.deleteMany({
    where: { email: PARTNER_EMAIL }
  })
  if (deletedUsers.count > 0) console.log(`   Deleted ${deletedUsers.count} users`)

  console.log('✅ Cleanup complete')

  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('📝 Creating ItWhip Fleet Partner')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')

  // Generate temporary password hash (will be reset after approval)
  const tempPassword = 'ItWhipTemp2024!'
  const passwordHash = await hash(tempPassword)

  // Step 1: Create User
  console.log('Creating User...')
  const user = await prisma.user.create({
    data: {
      email: PARTNER_EMAIL,
      name: 'ItWhip Fleet Manager',
      role: 'BUSINESS',
      status: 'ACTIVE',
      passwordHash,
      emailVerified: false,
      phoneVerified: false,
      isActive: false,
      phone: '(602) 555-RIDE',
    }
  })
  console.log(`   ✅ User created: ${user.id}`)

  // Step 2: Create RentalHost with PENDING status
  console.log('Creating RentalHost...')
  const host = await prisma.rentalHost.create({
    data: {
      userId: user.id,
      email: PARTNER_EMAIL,
      name: 'ItWhip Fleet Manager',
      phone: '(602) 555-RIDE',
      city: 'Phoenix',
      state: 'Arizona',
      zipCode: '85001',
      bio: 'ItWhip is Arizona\'s premier peer-to-peer car rental and rideshare vehicle marketplace.',

      // FLEET_PARTNER type with pending approval
      hostType: 'FLEET_PARTNER',  // ✅ Correct - identifies this as a partner
      approvalStatus: 'PENDING',  // Still awaiting approval
      isVerified: false,
      dashboardAccess: false,
      active: false,

      // Partner Identity
      partnerCompanyName: COMPANY_NAME,
      partnerSlug: PARTNER_SLUG,
      partnerBio: 'Your trusted partner for rideshare vehicle rentals in the Phoenix metro area. Whether you drive for Uber, Lyft, DoorDash, or other gig platforms, we have the perfect vehicle to help you maximize your earnings.',
      partnerSupportEmail: PARTNER_EMAIL,
      partnerSupportPhone: '(602) 555-RIDE',

      // Commission Tiers (will be set on approval)
      currentCommissionRate: 0.25,
      tier1VehicleCount: 10,
      tier1CommissionRate: 0.20,
      tier2VehicleCount: 50,
      tier2CommissionRate: 0.15,
      tier3VehicleCount: 100,
      tier3CommissionRate: 0.10,

      // Partner Fleet Settings
      partnerFleetSize: 0,
      autoApproveListings: false,
      autoApproveBookings: false,
    }
  })
  console.log(`   ✅ RentalHost created: ${host.id}`)

  // Step 3: Create PartnerApplication with SUBMITTED status
  console.log('Creating PartnerApplication...')
  const application = await prisma.partnerApplication.create({
    data: {
      hostId: host.id,

      // Company Info
      companyName: COMPANY_NAME,
      businessType: 'CORPORATION',
      yearsInBusiness: 2,

      // Contact Info (using correct field names from schema)
      contactName: 'ItWhip Fleet Manager',
      contactEmail: PARTNER_EMAIL,
      contactPhone: '(602) 555-RIDE',

      // Fleet Info
      fleetSize: 200,
      vehicleTypes: ['SEDAN', 'SUV', 'LUXURY', 'ELECTRIC', 'ECONOMY'],
      operatingCities: ['Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Gilbert', 'Glendale'],

      // Application Status - SUBMITTED for review
      status: 'SUBMITTED',
      currentStep: 6,
      submittedAt: new Date(),
    }
  })
  console.log(`   ✅ PartnerApplication created: ${application.id}`)

  // Print summary
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('✅ ItWhip Fleet Partner Created!')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
  console.log('')
  console.log('📋 Application Details:')
  console.log(`   Application ID: ${application.id}`)
  console.log(`   Company: ${COMPANY_NAME}`)
  console.log(`   Partner Email: ${PARTNER_EMAIL}`)
  console.log(`   Status: SUBMITTED (awaiting approval)`)
  console.log(`   Partner URL: /rideshare/${PARTNER_SLUG}`)
  console.log('')
  console.log('📧 Email Flow:')
  console.log('   System sends FROM: info@itwhip.com')
  console.log('   Partner receives TO: nickpattt86@gmail.com')
  console.log('')
  console.log('🔜 Next Steps:')
  console.log('   1. Go to /fleet/login and login')
  console.log('   2. Navigate to /fleet/partners/applications')
  console.log('   3. Badge should show (1) on Partners button')
  console.log('   4. Review and approve ItWhip application')
  console.log('   5. Welcome email sent to nickpattt86@gmail.com')
  console.log('   6. Use password reset link to set password')
  console.log('   7. Login at /partner/login')
  console.log('')
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
