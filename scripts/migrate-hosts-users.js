// scripts/migrate-hosts-users.js
// Run with: node scripts/migrate-hosts-users.js

const { PrismaClient } = require('@prisma/client')
const bcrypt = require('bcryptjs')
const prisma = new PrismaClient()

async function migrateHosts() {
  console.log('🔄 Starting host migration...')
  
  try {
    // Find all hosts without a User record
    const hostsWithoutUsers = await prisma.rentalHost.findMany({
      where: {
        userId: null
      },
      select: {
        id: true,
        email: true,
        name: true,
        phone: true,
        profilePhoto: true,
        createdAt: true,
        approvalStatus: true,
        hostType: true
      }
    })

    console.log(`📊 Found ${hostsWithoutUsers.length} hosts without User records`)

    if (hostsWithoutUsers.length === 0) {
      console.log('✅ All hosts already have User records!')
      return
    }

    // Create User records for each host
    let created = 0
    let skipped = 0
    let errors = 0

    for (const host of hostsWithoutUsers) {
      try {
        // Check if a User with this email already exists
        const existingUser = await prisma.user.findUnique({
          where: { email: host.email }
        })

        if (existingUser) {
          console.log(`⚠️  User already exists for ${host.email}, linking to host...`)
          
          // Link existing user to host
          await prisma.rentalHost.update({
            where: { id: host.id },
            data: { userId: existingUser.id }
          })
          
          // Update user role to BUSINESS if needed
          if (existingUser.role !== 'BUSINESS') {
            await prisma.user.update({
              where: { id: existingUser.id },
              data: { role: 'BUSINESS' }
            })
            console.log(`   Updated role to BUSINESS for ${host.email}`)
          }
          
          skipped++
          continue
        }

        // Generate a temporary password (they'll need to reset it)
        const tempPassword = `ItWhip${host.id.slice(-6)}2025!`
        const hashedPassword = await bcrypt.hash(tempPassword, 12)

        // Create new User record with BUSINESS role
        const newUser = await prisma.user.create({
          data: {
            email: host.email,
            passwordHash: hashedPassword,
            role: 'BUSINESS', // Using BUSINESS role for rental hosts
            name: host.name,
            phone: host.phone,
            avatar: host.profilePhoto, // Changed from profileImage to avatar
            emailVerified: false,
            phoneVerified: false,
            isActive: true,
            createdAt: host.createdAt,
            lastActive: new Date()
          }
        })

        // Link the new User to the RentalHost
        await prisma.rentalHost.update({
          where: { id: host.id },
          data: { userId: newUser.id }
        })

        console.log(`✅ Created User for host: ${host.name} (${host.email})`)
        console.log(`   Temporary password: ${tempPassword}`)
        
        created++

        // Add to password reset queue
        await prisma.adminNotification.create({
          data: {
            type: 'HOST_MIGRATION',
            title: 'Host User Account Created',
            message: `User account created for host ${host.name}. Password reset email should be sent.`,
            priority: 'LOW',
            status: 'UNREAD',
            relatedId: host.id,
            relatedType: 'HOST',
            actionRequired: true,
            actionUrl: `/fleet/hosts/${host.id}/edit?key=phoenix-fleet-2847`,
            metadata: {
              hostEmail: host.email,
              tempPassword: tempPassword,
              needsPasswordReset: true
            }
          }
        })

      } catch (error) {
        console.error(`❌ Error processing host ${host.email}:`, error.message)
        errors++
      }
    }

    console.log('\n📊 Migration Summary:')
    console.log(`   ✅ Created: ${created} new User records`)
    console.log(`   ⚠️  Skipped: ${skipped} (already had users)`)
    console.log(`   ❌ Errors: ${errors}`)

    // Verify all hosts now have users
    const remainingWithoutUsers = await prisma.rentalHost.count({
      where: { userId: null }
    })

    if (remainingWithoutUsers === 0) {
      console.log('\n🎉 Success! All hosts now have User records.')
    } else {
      console.log(`\n⚠️  Warning: ${remainingWithoutUsers} hosts still without User records.`)
    }

    // List hosts that need password resets
    if (created > 0) {
      console.log('\n📧 Hosts needing password reset emails:')
      const needsReset = await prisma.rentalHost.findMany({
        where: {
          user: {
            emailVerified: false,
            role: 'BUSINESS'
          }
        },
        select: {
          name: true,
          email: true,
          approvalStatus: true
        }
      })

      needsReset.forEach(host => {
        console.log(`   - ${host.name} (${host.email}) - Status: ${host.approvalStatus}`)
      })
    }

  } catch (error) {
    console.error('❌ Migration failed:', error)
  } finally {
    await prisma.$disconnect()
  }
}

// Utility function to check host/user relationships
async function checkHostUserRelationships() {
  console.log('\n📊 Checking host/user relationships...')
  
  const stats = await prisma.rentalHost.groupBy({
    by: ['approvalStatus'],
    _count: {
      id: true,
      userId: true
    }
  })

  console.log('\nHosts by approval status:')
  stats.forEach(stat => {
    console.log(`   ${stat.approvalStatus}: ${stat._count.id} hosts (${stat._count.userId} with users)`)
  })

  // Find specific host (Parker Mills)
  const parkerMills = await prisma.rentalHost.findFirst({
    where: { email: 'parker.mills@itwhip.com' },
    include: { user: true }
  })

  if (parkerMills) {
    console.log('\n🔍 Parker Mills status:')
    console.log(`   Host ID: ${parkerMills.id}`)
    console.log(`   User ID: ${parkerMills.userId || 'NO USER RECORD'}`)
    console.log(`   Status: ${parkerMills.approvalStatus}`)
    if (parkerMills.user) {
      console.log(`   User Role: ${parkerMills.user.role}`)
      console.log(`   Can login: YES`)
    } else {
      console.log(`   ⚠️  Cannot login - no User record!`)
    }
  }
}

// Run the migration
async function main() {
  const args = process.argv.slice(2)
  
  if (args[0] === '--check') {
    await checkHostUserRelationships()
  } else if (args[0] === '--help') {
    console.log('Usage:')
    console.log('  node scripts/migrate-hosts-users.js        # Run migration')
    console.log('  node scripts/migrate-hosts-users.js --check # Check relationships only')
    console.log('  node scripts/migrate-hosts-users.js --help  # Show this help')
  } else {
    await migrateHosts()
    await checkHostUserRelationships()
  }
}

main().catch(console.error)