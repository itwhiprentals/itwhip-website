#!/usr/bin/env npx tsx
/**
 * Backfill IdentityLinks for all existing users
 * This ensures the identity resolution system can detect duplicates for existing accounts
 *
 * Usage: npx tsx scripts/seed-identity-links.ts [--dry-run]
 */

import { prisma } from '../app/lib/database/prisma'
import { normalizePhone, normalizeEmail } from '../app/lib/services/identityResolution'

const dryRun = process.argv.includes('--dry-run')

async function main() {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`  SEED IDENTITY LINKS ${dryRun ? '(DRY RUN)' : '(LIVE)'}`)
  console.log(`${'='.repeat(60)}\n`)

  // Get all users with email or phone
  const users = await prisma.user.findMany({
    where: {
      OR: [
        { email: { not: null } },
        { phone: { not: null } },
      ],
      // Skip merged/deleted accounts
      NOT: { email: { contains: '@itwhip.deleted' } },
    },
    select: { id: true, email: true, phone: true, name: true },
  })

  console.log(`Found ${users.length} users to process`)

  // Also get ReviewerProfiles with DL info
  const profiles = await prisma.reviewerProfile.findMany({
    where: {
      driverLicenseNumber: { not: null },
      driverLicenseState: { not: null },
    },
    select: { userId: true, driverLicenseNumber: true, driverLicenseState: true },
  })

  const dlByUser = new Map<string, { state: string; number: string }>()
  for (const p of profiles) {
    if (p.userId && p.driverLicenseNumber && p.driverLicenseState) {
      dlByUser.set(p.userId, { state: p.driverLicenseState, number: p.driverLicenseNumber })
    }
  }

  let created = 0
  let skipped = 0
  let errors = 0

  for (const user of users) {
    const links: { type: string; value: string }[] = []

    // Email
    if (user.email && !user.email.includes('@itwhip.temp') && !user.email.includes('@itwhip.deleted')) {
      links.push({ type: 'email', value: normalizeEmail(user.email) })
    }

    // Phone
    if (user.phone) {
      const normalized = normalizePhone(user.phone)
      if (normalized.length === 10) {
        links.push({ type: 'phone', value: normalized })
      }
    }

    // Driver's license
    const dl = dlByUser.get(user.id)
    if (dl) {
      links.push({ type: 'driver_license', value: `${dl.state.toUpperCase()}-${dl.number.toUpperCase().replace(/\s/g, '')}` })
    }

    for (const link of links) {
      try {
        if (dryRun) {
          // Check if exists
          const existing = await prisma.identityLink.findUnique({
            where: { identifierType_identifierValue: { identifierType: link.type, identifierValue: link.value } }
          })
          if (existing) {
            if (existing.userId !== user.id) {
              console.log(`⚠ CONFLICT: ${link.type}=${link.value} → user ${existing.userId} (NOT ${user.id} ${user.email})`)
            }
            skipped++
          } else {
            console.log(`WOULD create: ${link.type}=${link.value} → ${user.id} (${user.email})`)
            created++
          }
        } else {
          await prisma.identityLink.upsert({
            where: { identifierType_identifierValue: { identifierType: link.type, identifierValue: link.value } },
            update: {}, // Don't overwrite if exists
            create: {
              id: `il_seed_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
              userId: user.id,
              identifierType: link.type,
              identifierValue: link.value,
            }
          })
          created++
        }
      } catch (e: any) {
        if (e.code === 'P2002') {
          skipped++ // Unique constraint — already exists
        } else {
          console.error(`❌ Error for ${user.email} ${link.type}: ${e.message}`)
          errors++
        }
      }
    }
  }

  console.log(`\n--- Results ---`)
  console.log(`Created: ${created}`)
  console.log(`Skipped (already exists): ${skipped}`)
  console.log(`Errors: ${errors}`)

  // Now handle known duplicates — add cross-links
  console.log(`\n--- Cross-linking known duplicates ---`)

  const crossLinks = [
    // Chris: christianhaguma@gmail.com → chrishaguma@yahoo.com
    { email: 'christianhaguma@gmail.com', primaryUserId: 'cmgj3g1p10034doig4dhzvlj8', note: 'Chris gmail → yahoo' },
    // Jake: jakemarjama@hotmail.com → jakemarjama@gmail.com
    { email: 'jakemarjama@hotmail.com', primaryUserId: 'ZZh9JSUVH0ZPc9HGucT7j', note: 'Jake hotmail → gmail' },
  ]

  for (const cl of crossLinks) {
    const value = normalizeEmail(cl.email)
    if (dryRun) {
      console.log(`WOULD cross-link: email=${value} → user ${cl.primaryUserId} (${cl.note})`)
    } else {
      try {
        await prisma.identityLink.upsert({
          where: { identifierType_identifierValue: { identifierType: 'email', identifierValue: value } },
          update: { userId: cl.primaryUserId }, // Override to point to primary
          create: {
            id: `il_xlink_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
            userId: cl.primaryUserId,
            identifierType: 'email',
            identifierValue: value,
          }
        })
        console.log(`✓ Cross-linked: ${cl.note}`)
      } catch (e: any) {
        console.error(`❌ Cross-link failed for ${cl.note}: ${e.message}`)
      }
    }
  }

  console.log(`\n✅ Done.\n`)
  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('❌ Failed:', e)
  await prisma.$disconnect()
  process.exit(1)
})
