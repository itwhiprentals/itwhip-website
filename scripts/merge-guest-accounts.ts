#!/usr/bin/env npx tsx
/**
 * Merge duplicate guest accounts
 * Usage: npx tsx scripts/merge-guest-accounts.ts --keep=email@keep.com --merge=email@merge.com [--dry-run]
 */

import prisma from '../app/lib/database/prisma'

const args = process.argv.slice(2)
const keepEmail = args.find(a => a.startsWith('--keep='))?.split('=')[1]
const mergeEmail = args.find(a => a.startsWith('--merge='))?.split('=')[1]
const dryRun = args.includes('--dry-run')

if (!keepEmail || !mergeEmail) {
  console.error('Usage: npx tsx scripts/merge-guest-accounts.ts --keep=email@keep.com --merge=email@merge.com [--dry-run]')
  process.exit(1)
}

async function main() {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`  MERGE GUEST ACCOUNTS ${dryRun ? '(DRY RUN)' : '(LIVE)'}`)
  console.log(`${'='.repeat(60)}`)
  console.log(`  Keep:  ${keepEmail}`)
  console.log(`  Merge: ${mergeEmail}`)
  console.log(`${'='.repeat(60)}\n`)

  // 1. Look up both accounts
  const keepUser = await prisma.user.findUnique({ where: { email: keepEmail }, select: { id: true, email: true, name: true, phone: true } })
  const mergeUser = await prisma.user.findUnique({ where: { email: mergeEmail }, select: { id: true, email: true, name: true, phone: true } })

  if (!keepUser) { console.error(`❌ Keep user not found: ${keepEmail}`); process.exit(1) }
  if (!mergeUser) { console.error(`❌ Merge user not found: ${mergeEmail}`); process.exit(1) }
  if (keepUser.id === mergeUser.id) { console.error(`❌ Same user! Nothing to merge.`); process.exit(1) }

  console.log(`Keep User:  ${keepUser.id} | ${keepUser.name} | ${keepUser.phone || 'no phone'}`)
  console.log(`Merge User: ${mergeUser.id} | ${mergeUser.name} | ${mergeUser.phone || 'no phone'}`)

  const keepProfile = await prisma.reviewerProfile.findFirst({ where: { userId: keepUser.id } })
  const mergeProfile = await prisma.reviewerProfile.findFirst({ where: { userId: mergeUser.id } })

  if (!keepProfile) { console.error(`❌ Keep profile not found for user ${keepUser.id}`); process.exit(1) }

  console.log(`\nKeep Profile:  ${keepProfile.id} | credits=$${(keepProfile as any).creditBalance || 0} | bonus=$${(keepProfile as any).bonusBalance || 0} | deposit=$${(keepProfile as any).depositWalletBalance || 0}`)
  if (mergeProfile) {
    console.log(`Merge Profile: ${mergeProfile.id} | credits=$${(mergeProfile as any).creditBalance || 0} | bonus=$${(mergeProfile as any).bonusBalance || 0} | deposit=$${(mergeProfile as any).depositWalletBalance || 0}`)
  } else {
    console.log(`Merge Profile: NONE (no ReviewerProfile)`)
  }

  // 2. Count records to move
  const bookingsByEmail = await prisma.rentalBooking.count({ where: { guestEmail: mergeEmail } })
  const bookingsByUser = mergeProfile ? await prisma.rentalBooking.count({ where: { reviewerProfileId: mergeProfile.id } }) : 0
  const notifications = mergeProfile ? await prisma.bookingNotification.count({ where: { recipientId: mergeProfile.id } }) : 0
  const identityLinks = await prisma.identityLink.count({ where: { userId: mergeUser.id } })

  console.log(`\n--- Records to move ---`)
  console.log(`Bookings (by email):   ${bookingsByEmail}`)
  console.log(`Bookings (by profile): ${bookingsByUser}`)
  console.log(`Notifications:         ${notifications}`)
  console.log(`Identity links:        ${identityLinks}`)

  // 3. Check balances to merge
  const mergeCredits = (mergeProfile as any)?.creditBalance || 0
  const mergeBonus = (mergeProfile as any)?.bonusBalance || 0
  const mergeDeposit = (mergeProfile as any)?.depositWalletBalance || 0
  const hasBalances = mergeCredits > 0 || mergeBonus > 0 || mergeDeposit > 0

  if (hasBalances) {
    console.log(`\n--- Balances to transfer ---`)
    console.log(`Credits: $${mergeCredits.toFixed(2)}`)
    console.log(`Bonus:   $${mergeBonus.toFixed(2)}`)
    console.log(`Deposit: $${mergeDeposit.toFixed(2)}`)
  }

  if (dryRun) {
    console.log(`\n--- DRY RUN: What would happen ---`)
    if (bookingsByEmail > 0) console.log(`WOULD move ${bookingsByEmail} bookings (by email) → ${keepEmail}`)
    if (bookingsByUser > 0) console.log(`WOULD move ${bookingsByUser} bookings (by profile) → ${keepProfile.id}`)
    if (notifications > 0) console.log(`WOULD move ${notifications} notifications → ${keepProfile.id}`)
    if (identityLinks > 0) console.log(`WOULD move ${identityLinks} identity links → ${keepUser.id}`)
    if (hasBalances) console.log(`WOULD add balances: +$${mergeCredits.toFixed(2)} credits, +$${mergeBonus.toFixed(2)} bonus, +$${mergeDeposit.toFixed(2)} deposit`)
    console.log(`WOULD add "${mergeEmail}" as IdentityLink on keep user`)
    if (mergeProfile) console.log(`WOULD set merge profile name to "MERGED → ${keepEmail}"`)
    console.log(`WOULD set merge user name to "MERGED → ${keepEmail}"`)
    console.log(`\n✅ Dry run complete. Run without --dry-run to execute.\n`)
    await prisma.$disconnect()
    return
  }

  // 4. Execute merge in transaction
  console.log(`\n--- EXECUTING MERGE ---`)

  await prisma.$transaction(async (tx) => {
    // Move bookings by email
    if (bookingsByEmail > 0) {
      const result = await tx.rentalBooking.updateMany({
        where: { guestEmail: mergeEmail },
        data: {
          guestEmail: keepEmail,
          ...(mergeProfile && keepProfile ? { reviewerProfileId: keepProfile.id } : {}),
        }
      })
      console.log(`✓ Moved ${result.count} bookings (by email)`)
    }

    // Move bookings by profile ID (in case guestEmail was different)
    if (mergeProfile && bookingsByUser > 0) {
      const result = await tx.rentalBooking.updateMany({
        where: { reviewerProfileId: mergeProfile.id },
        data: { reviewerProfileId: keepProfile.id }
      })
      console.log(`✓ Moved ${result.count} bookings (by profile)`)
    }

    // Move notifications
    if (mergeProfile && notifications > 0) {
      const result = await tx.bookingNotification.updateMany({
        where: { recipientId: mergeProfile.id },
        data: { recipientId: keepProfile.id }
      })
      console.log(`✓ Moved ${result.count} notifications`)
    }

    // Move identity links
    if (identityLinks > 0) {
      const result = await tx.identityLink.updateMany({
        where: { userId: mergeUser.id },
        data: { userId: keepUser.id }
      })
      console.log(`✓ Moved ${result.count} identity links`)
    }

    // Add merged email as identity link (so future logins with this email find the keep user)
    try {
      await tx.identityLink.create({
        data: {
          id: `il_merge_${Date.now()}`,
          userId: keepUser.id,
          identifierType: 'email',
          identifierValue: mergeEmail!.toLowerCase().trim(),
        }
      })
      console.log(`✓ Added "${mergeEmail}" as IdentityLink on keep user`)
    } catch (e: any) {
      if (e.code === 'P2002') {
        console.log(`⚠ IdentityLink for "${mergeEmail}" already exists, skipping`)
      } else {
        throw e
      }
    }

    // Transfer balances
    if (hasBalances && mergeProfile) {
      await tx.reviewerProfile.update({
        where: { id: keepProfile.id },
        data: {
          creditBalance: { increment: mergeCredits },
          bonusBalance: { increment: mergeBonus },
          depositWalletBalance: { increment: mergeDeposit },
        }
      })
      console.log(`✓ Transferred balances: +$${mergeCredits.toFixed(2)} credits, +$${mergeBonus.toFixed(2)} bonus, +$${mergeDeposit.toFixed(2)} deposit`)

      // Zero out merged profile balances
      await tx.reviewerProfile.update({
        where: { id: mergeProfile.id },
        data: { creditBalance: 0, bonusBalance: 0, depositWalletBalance: 0 }
      })
    }

    // Deactivate merged profile
    if (mergeProfile) {
      // Clear unique email constraint before deactivation
      await tx.reviewerProfile.update({
        where: { id: mergeProfile.id },
        data: {
          name: `MERGED → ${keepEmail}`,
          email: null, // Clear unique constraint
        }
      })
      console.log(`✓ Deactivated merge profile ${mergeProfile.id}`)
    }

    // Deactivate merged user
    // Clear unique constraints to avoid conflicts
    await tx.user.update({
      where: { id: mergeUser.id },
      data: {
        name: `MERGED → ${keepEmail}`,
        email: `merged_${Date.now()}@itwhip.deleted`,
        phone: null,
      }
    })
    console.log(`✓ Deactivated merge user ${mergeUser.id}`)
  })

  console.log(`\n${'='.repeat(60)}`)
  console.log(`  ✅ MERGE COMPLETE`)
  console.log(`  Primary account: ${keepEmail}`)
  console.log(`  Merged account:  ${mergeEmail} (deactivated)`)
  console.log(`${'='.repeat(60)}\n`)

  await prisma.$disconnect()
}

main().catch(async (e) => {
  console.error('❌ Merge failed:', e)
  await prisma.$disconnect()
  process.exit(1)
})
