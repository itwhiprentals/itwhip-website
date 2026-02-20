// scripts/run-drive-it-pro-setup.ts
// Execute Drive It Pro migration using Prisma

import { PrismaClient } from '@prisma/client'
import * as fs from 'fs'
import * as path from 'path'

const prisma = new PrismaClient()

async function main() {
  console.log('🚀 Starting Drive It Pro migration...\n')

  try {
    // Read the SQL file
    const sqlPath = path.join(__dirname, 'setup-drive-it-pro.sql')
    const sql = fs.readFileSync(sqlPath, 'utf-8')

    // Split by SQL statement delimiter and filter out comments/empty lines
    const statements = sql
      .split(';')
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--') && !s.startsWith('/*'))

    console.log(`📝 Found ${statements.length} SQL statements to execute\n`)

    let successCount = 0
    let errorCount = 0

    // Execute each statement
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i]

      // Skip verification queries and comments
      if (
        statement.includes('VERIFICATION QUERIES') ||
        statement.includes('POST-MIGRATION TASKS') ||
        statement.trim().length < 10
      ) {
        continue
      }

      try {
        console.log(`⏳ Executing statement ${i + 1}/${statements.length}...`)

        await prisma.$executeRawUnsafe(statement + ';')

        successCount++
        console.log(`✅ Success\n`)
      } catch (error: any) {
        // Ignore "ON CONFLICT DO NOTHING" errors
        if (error.message.includes('duplicate') || error.message.includes('conflict')) {
          console.log(`⚠️  Skipped (already exists)\n`)
          successCount++
        } else {
          console.error(`❌ Error: ${error.message}\n`)
          errorCount++
        }
      }
    }

    console.log('\n' + '='.repeat(60))
    console.log(`✅ Migration completed: ${successCount} successful, ${errorCount} errors`)
    console.log('='.repeat(60) + '\n')

    // Run verification queries
    console.log('🔍 Running verification queries...\n')

    // Verify RentalHost
    const host = await prisma.$queryRaw`
      SELECT
        email,
        name,
        "partnerCompanyName",
        "partnerSlug",
        "isBusinessHost",
        "businessApprovalStatus",
        "hostType",
        "approvalStatus"
      FROM "RentalHost"
      WHERE email = 'Alex@driveitpro.com'
    `
    console.log('📊 RentalHost:', host)

    // Verify vehicles
    const vehicles = await prisma.$queryRaw`
      SELECT
        COUNT(*) as vehicle_count,
        MIN("weeklyRate") as min_weekly_rate,
        MAX("weeklyRate") as max_weekly_rate,
        "vehicleType"
      FROM "RentalCar"
      WHERE "hostId" = (SELECT id FROM "RentalHost" WHERE email = 'Alex@driveitpro.com')
      GROUP BY "vehicleType"
    `
    console.log('📊 Vehicles:', vehicles)

    // Verify discount
    const discounts = await prisma.$queryRaw`
      SELECT code, title, percentage, description, "isActive"
      FROM partner_discounts
      WHERE "hostId" = (SELECT id FROM "RentalHost" WHERE email = 'Alex@driveitpro.com')
    `
    console.log('📊 Discounts:', discounts)

    // Verify FAQs
    const faqs = await prisma.$queryRaw`
      SELECT COUNT(*) as faq_count
      FROM partner_faqs
      WHERE "hostId" = (SELECT id FROM "RentalHost" WHERE email = 'Alex@driveitpro.com')
    `
    console.log('📊 FAQs:', faqs)

    console.log('\n✅ Migration and verification complete!\n')
    console.log('📝 Next steps:')
    console.log('   1. Upload Drive It Pro logo to Cloudinary')
    console.log('   2. Update partnerLogo field with Cloudinary URL')
    console.log('   3. Set password for Alex@driveitpro.com')
    console.log('   4. Test login at /partner/login')
    console.log('   5. Visit /rideshare to see Drive It Pro as main partner')
    console.log('   6. Visit /fleet/business to verify approved business listing')

  } catch (error) {
    console.error('❌ Migration failed:', error)
    process.exit(1)
  } finally {
    await prisma.$disconnect()
  }
}

main()
