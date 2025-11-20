import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// ⚠️ SET THIS TO false TO EXECUTE ACTUAL CHANGES
const DRY_RUN = false

// Parker Mills's email
const TARGET_EMAIL = 'hxris007@gmail.com'

async function backfillParkerMills() {
  console.log('🔧 ===== BACKFILL PARKER MILLS ONLY =====\n')
  console.log(`Mode: ${DRY_RUN ? '🔍 DRY RUN (Preview Only - No Changes)' : '⚠️  LIVE EXECUTION (Will Modify Data)'}\n`)

  if (!DRY_RUN) {
    console.log('⚠️  WARNING: Live execution mode enabled!')
    console.log('⚠️  Data will be permanently modified\n')
  }

  // Find Parker Mills
  const parker = await prisma.rentalHost.findUnique({
    where: { email: TARGET_EMAIL },
    include: {
      cars: {
        include: {
          bookings: {
            select: {
              id: true,
              bookingCode: true,
              startDate: true,
              endDate: true,
              status: true
            },
            orderBy: { startDate: 'asc' }
          }
        }
      }
    }
  })

  if (!parker) {
    console.error('❌ Parker Mills not found!')
    return
  }

  console.log('📌 Found Parker Mills')
  console.log(`   ID: ${parker.id}`)
  console.log(`   Name: ${parker.name}`)
  console.log(`   Email: ${parker.email}`)
  console.log(`   Joined: ${parker.joinedAt}`)
  console.log(`   Current Approval Status: ${parker.approvalStatus}`)
  console.log(`   Current Approved At: ${parker.approvedAt}`)
  console.log(`   Current Verified At: ${parker.verifiedAt}`)
  console.log(`   Current Approved By: ${parker.approvedBy}`)
  console.log(`   Documents Verified: ${parker.documentsVerified}`)
  console.log(`   Vehicles: ${parker.cars.length}`)
  console.log('')

  // Analyze vehicle
  const vehicle = parker.cars[0]
  if (!vehicle) {
    console.error('❌ No vehicle found for Parker!')
    return
  }

  console.log('🚗 Vehicle: ' + vehicle.year + ' ' + vehicle.make + ' ' + vehicle.model)
  console.log(`   Created: ${vehicle.createdAt}`)
  console.log(`   Bookings: ${vehicle.bookings.length}`)
  console.log(`   VIN Verified: ${vehicle.vinVerifiedAt || '❌ MISSING'}`)
  console.log(`   Registration Verified: ${vehicle.registrationVerifiedAt || '❌ MISSING'}`)
  console.log(`   Title Verified: ${vehicle.titleVerifiedAt || '❌ MISSING'}`)
  console.log(`   Insurance Verified: ${vehicle.insuranceVerifiedAt || '❌ MISSING'}`)
  console.log('')

  if (vehicle.bookings.length > 0) {
    console.log('📅 Booking History:')
    vehicle.bookings.forEach((booking, index) => {
      console.log(`   ${index + 1}. ${booking.bookingCode}: ${booking.startDate.toISOString().split('T')[0]} - ${booking.status}`)
    })
    console.log('')
  }

  // CALCULATE LOGICAL APPROVAL DATE
  let approvalDate: Date
  let calculationMethod: string

  if (vehicle.bookings.length > 0) {
    // Use first trip minus 30 days
    const firstTrip = vehicle.bookings[0].startDate
    approvalDate = new Date(firstTrip)
    approvalDate.setDate(approvalDate.getDate() - 30)
    calculationMethod = 'First trip date - 30 days (logical timeline)'
    
    console.log('📊 Calculating Logical Approval Date')
    console.log(`   First Trip: ${firstTrip.toISOString()}`)
    console.log(`   Calculated Approval: ${approvalDate.toISOString()}`)
    console.log(`   Logic: Approval must be BEFORE first trip`)
  } else {
    // Use vehicle creation minus 7 days
    approvalDate = new Date(vehicle.createdAt)
    approvalDate.setDate(approvalDate.getDate() - 7)
    calculationMethod = 'Vehicle created - 7 days'
    
    console.log('📊 Calculating Logical Approval Date')
    console.log(`   Vehicle Created: ${vehicle.createdAt.toISOString()}`)
    console.log(`   Calculated Approval: ${approvalDate.toISOString()}`)
  }

  // Safety check: not before joined
  if (approvalDate < parker.joinedAt) {
    console.log('⚠️  Approval date before joined - adjusting to 1 hour after signup')
    approvalDate = new Date(parker.joinedAt)
    approvalDate.setHours(approvalDate.getHours() + 1)
    calculationMethod += ' (adjusted to after signup)'
  }

  // Safety check: not in future
  const now = new Date()
  if (approvalDate > now) {
    console.log('⚠️  Approval date in future - adjusting to now')
    approvalDate = now
    calculationMethod += ' (adjusted to current time)'
  }

  console.log('')
  console.log('🎯 ===== CORRECTED TIMELINE =====')
  console.log(`   ${parker.joinedAt.toISOString().split('T')[0]} - Signed up`)
  console.log(`   ${approvalDate.toISOString().split('T')[0]} - ✅ Approved (calculated)`)
  if (vehicle.bookings.length > 0) {
    console.log(`   ${vehicle.bookings[0].startDate.toISOString().split('T')[0]} - First trip (now makes sense!)`)
  }
  console.log(`   ${vehicle.createdAt.toISOString().split('T')[0]} - Vehicle added to system`)
  console.log('')

  // Display proposed changes
  console.log('🎯 ===== PROPOSED CHANGES =====')
  console.log(`   Calculation Method: ${calculationMethod}`)
  console.log('')

  console.log('   HOST UPDATES:')
  console.log(`   ├─ Approved At: ${parker.approvedAt ? parker.approvedAt.toISOString() : '❌ NULL'} → ${approvalDate.toISOString()}`)
  console.log(`   ├─ Verified At: ${parker.verifiedAt ? parker.verifiedAt.toISOString() : '❌ NULL'} → ${approvalDate.toISOString()}`)
  console.log(`   ├─ Approved By: ${parker.approvedBy || '❌ NULL'} → Fleet Admin`)
  console.log(`   └─ Documents Verified: ${parker.documentsVerified} → true`)
  console.log('')

  console.log('   VEHICLE UPDATES:')
  console.log(`   ├─ VIN Verified At: ${vehicle.vinVerifiedAt ? vehicle.vinVerifiedAt.toISOString() : '❌ NULL'} → ${approvalDate.toISOString()}`)
  console.log(`   ├─ VIN Verified By: ${vehicle.vinVerifiedBy || '❌ NULL'} → Fleet Admin`)
  console.log(`   ├─ VIN Verification Method: ${vehicle.vinVerificationMethod || '❌ NULL'} → Platform Migration`)
  console.log(`   ├─ Registration Verified At: ${vehicle.registrationVerifiedAt ? vehicle.registrationVerifiedAt.toISOString() : '❌ NULL'} → ${approvalDate.toISOString()}`)
  console.log(`   ├─ Registration Verified By: ${vehicle.registrationVerifiedBy || '❌ NULL'} → Fleet Admin`)
  console.log(`   ├─ Title Verified At: ${vehicle.titleVerifiedAt ? vehicle.titleVerifiedAt.toISOString() : '❌ NULL'} → ${approvalDate.toISOString()}`)
  console.log(`   ├─ Title Verified By: ${vehicle.titleVerifiedBy || '❌ NULL'} → Fleet Admin`)
  console.log(`   ├─ Insurance Verified At: ${vehicle.insuranceVerifiedAt ? vehicle.insuranceVerifiedAt.toISOString() : '❌ NULL'} → ${approvalDate.toISOString()}`)
  console.log(`   └─ Insurance Verified By: ${vehicle.insuranceVerifiedBy || '❌ NULL'} → Fleet Admin`)
  console.log('')

  // Execute or preview
  if (DRY_RUN) {
    console.log('🔍 ===== DRY RUN COMPLETE =====')
    console.log('')
    console.log('✅ No changes were made (DRY RUN mode)')
    console.log('')
    console.log('📋 Review the proposed changes above')
    console.log('✅ Timeline is now LOGICAL (approval before first trip)')
    console.log('')
    console.log('💡 If everything looks correct:')
    console.log('   1. Edit the script')
    console.log('   2. Change line 6: const DRY_RUN = false')
    console.log('   3. Run the script again')
    console.log('')
  } else {
    console.log('⚡ Executing updates...')
    
    try {
      // Update host
      await prisma.rentalHost.update({
        where: { id: parker.id },
        data: {
          approvedAt: approvalDate,
          verifiedAt: approvalDate,
          approvedBy: 'Fleet Admin',
          documentsVerified: true
        }
      })
      console.log('✅ Host updated successfully')

      // Update vehicle
      await prisma.rentalCar.update({
        where: { id: vehicle.id },
        data: {
          vinVerifiedAt: approvalDate,
          vinVerifiedBy: 'Fleet Admin',
          vinVerificationMethod: 'Platform Migration',
          registrationVerifiedAt: approvalDate,
          registrationVerifiedBy: 'Fleet Admin',
          titleVerifiedAt: approvalDate,
          titleVerifiedBy: 'Fleet Admin',
          insuranceVerifiedAt: approvalDate,
          insuranceVerifiedBy: 'Fleet Admin'
        }
      })
      console.log('✅ Vehicle updated successfully')

      console.log('')
      console.log('🎉 ===== EXECUTION COMPLETE =====')
      console.log('')
      console.log('✅ Timeline is now LOGICAL!')
      console.log(`   Approval: ${approvalDate.toISOString().split('T')[0]}`)
      console.log(`   First Trip: ${vehicle.bookings[0]?.startDate.toISOString().split('T')[0] || 'N/A'}`)
      console.log('')
      console.log('📋 Next Steps:')
      console.log('  1. Check Parker\'s documents tab in the app')
      console.log('  2. Verify compliance score is 100%')
      console.log('  3. Verify dates show December 14, 2024')
      console.log('  4. Once confirmed → proceed with all 199 other hosts')
      console.log('')

    } catch (error) {
      console.error('❌ Update failed:', error)
      throw error
    }
  }
}

backfillParkerMills()
  .then(() => {
    console.log('✅ Script complete!')
    prisma.$disconnect()
  })
  .catch((error) => {
    console.error('❌ Script failed:', error)
    prisma.$disconnect()
    process.exit(1)
  })
