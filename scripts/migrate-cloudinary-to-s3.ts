// scripts/migrate-cloudinary-to-s3.ts
// Migrate all existing Cloudinary URLs in the database to S3
// Usage: npx tsx scripts/migrate-cloudinary-to-s3.ts [--dry-run] [--batch-size=50]

import { PrismaClient } from '@prisma/client'
import { S3Client, PutObjectCommand } from '@aws-sdk/client-s3'

const prisma = new PrismaClient()
const s3 = new S3Client({ region: 'us-east-2' })

const PUBLIC_BUCKET = 'itwhip-public-assets'
const PRIVATE_BUCKET = 'itwhip-private-documents'
const CLOUDFRONT_DOMAIN = 'photos.itwhip.com'

const DRY_RUN = process.argv.includes('--dry-run')
const BATCH_SIZE = parseInt(process.argv.find(a => a.startsWith('--batch-size='))?.split('=')[1] || '50')

let migrated = 0, skipped = 0, failed = 0

function isCloudinaryUrl(url: string | null): boolean {
  return !!url && (url.includes('res.cloudinary.com') || url.includes('cloudinary.com/'))
}

async function downloadFile(url: string): Promise<Buffer> {
  const res = await fetch(url)
  if (!res.ok) throw new Error(`Download failed: ${res.status} ${url}`)
  return Buffer.from(await res.arrayBuffer())
}

function getContentType(url: string): string {
  if (url.includes('.pdf')) return 'application/pdf'
  if (url.includes('.png')) return 'image/png'
  if (url.includes('.webp')) return 'image/webp'
  return 'image/jpeg'
}

async function uploadToS3(key: string, buffer: Buffer, contentType: string, isPrivate: boolean): Promise<string> {
  const bucket = isPrivate ? PRIVATE_BUCKET : PUBLIC_BUCKET
  await s3.send(new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
    ...(isPrivate ? {} : { CacheControl: 'public, max-age=2592000' }),
  }))
  return isPrivate ? key : `https://${CLOUDFRONT_DOMAIN}/${key}`
}

async function migrateUrl(oldUrl: string, keyPrefix: string, id: string, isPrivate: boolean): Promise<string | null> {
  if (!isCloudinaryUrl(oldUrl)) { skipped++; return null }

  const ext = oldUrl.match(/\.(jpg|jpeg|png|webp|pdf|gif)(\?.*)?$/i)?.[1] || 'jpg'
  const key = `${keyPrefix}/${id}/${Date.now()}.${ext}`

  if (DRY_RUN) { migrated++; return isPrivate ? key : `https://${CLOUDFRONT_DOMAIN}/${key}` }

  try {
    const buffer = await downloadFile(oldUrl)
    const newUrl = await uploadToS3(key, buffer, getContentType(oldUrl), isPrivate)
    migrated++
    return newUrl
  } catch (err: any) {
    console.error(`  FAILED: ${oldUrl} → ${err.message}`)
    failed++
    return null
  }
}

async function main() {
  console.log(`\n${'='.repeat(60)}`)
  console.log(`Cloudinary → S3 Migration ${DRY_RUN ? '(DRY RUN)' : '(LIVE)'}`)
  console.log(`Batch size: ${BATCH_SIZE}`)
  console.log(`${'='.repeat(60)}\n`)

  // 1. Car Photos (PUBLIC)
  console.log('📸 Migrating car photos...')
  const photos = await prisma.rentalCarPhoto.findMany({ where: { url: { contains: 'cloudinary' } }, select: { id: true, url: true, carId: true } })
  console.log(`  Found: ${photos.length} Cloudinary car photos`)
  for (let i = 0; i < photos.length; i += BATCH_SIZE) {
    const batch = photos.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async (p) => {
      const newUrl = await migrateUrl(p.url, 'cars', p.carId, false)
      if (newUrl && !DRY_RUN) await prisma.rentalCarPhoto.update({ where: { id: p.id }, data: { url: newUrl } })
    }))
    console.log(`  Progress: ${Math.min(i + BATCH_SIZE, photos.length)}/${photos.length}`)
  }

  // 2. Host Profiles (PUBLIC)
  console.log('\n👤 Migrating host profiles...')
  const hosts = await prisma.rentalHost.findMany({
    where: { OR: [{ profilePhoto: { contains: 'cloudinary' } }, { partnerLogo: { contains: 'cloudinary' } }, { partnerHeroImage: { contains: 'cloudinary' } }] },
    select: { id: true, profilePhoto: true, partnerLogo: true, partnerHeroImage: true }
  })
  console.log(`  Found: ${hosts.length} hosts with Cloudinary URLs`)
  for (const h of hosts) {
    const updates: any = {}
    if (isCloudinaryUrl(h.profilePhoto)) { const u = await migrateUrl(h.profilePhoto!, 'hosts', h.id, false); if (u) updates.profilePhoto = u }
    if (isCloudinaryUrl(h.partnerLogo)) { const u = await migrateUrl(h.partnerLogo!, 'hosts', h.id, false); if (u) updates.partnerLogo = u }
    if (isCloudinaryUrl(h.partnerHeroImage)) { const u = await migrateUrl(h.partnerHeroImage!, 'hosts', h.id, false); if (u) updates.partnerHeroImage = u }
    if (Object.keys(updates).length > 0 && !DRY_RUN) await prisma.rentalHost.update({ where: { id: h.id }, data: updates })
  }

  // 3. Host Documents (PRIVATE)
  console.log('\n📄 Migrating host documents...')
  const hostDocs = await prisma.rentalHost.findMany({
    where: { OR: [{ governmentIdUrl: { contains: 'cloudinary' } }, { driversLicenseUrl: { contains: 'cloudinary' } }, { insuranceDocUrl: { contains: 'cloudinary' } }] },
    select: { id: true, governmentIdUrl: true, driversLicenseUrl: true, insuranceDocUrl: true }
  })
  console.log(`  Found: ${hostDocs.length} hosts with Cloudinary documents`)
  for (const h of hostDocs) {
    const updates: any = {}
    if (isCloudinaryUrl(h.governmentIdUrl)) { const u = await migrateUrl(h.governmentIdUrl!, 'identity', h.id, true); if (u) updates.governmentIdUrl = u }
    if (isCloudinaryUrl(h.driversLicenseUrl)) { const u = await migrateUrl(h.driversLicenseUrl!, 'dl-photos', h.id, true); if (u) updates.driversLicenseUrl = u }
    if (isCloudinaryUrl(h.insuranceDocUrl)) { const u = await migrateUrl(h.insuranceDocUrl!, 'identity', h.id, true); if (u) updates.insuranceDocUrl = u }
    if (Object.keys(updates).length > 0 && !DRY_RUN) await prisma.rentalHost.update({ where: { id: h.id }, data: updates })
  }

  // 4. Guest Profiles (PUBLIC photo, PRIVATE docs)
  console.log('\n👥 Migrating guest profiles...')
  const guests = await prisma.reviewerProfile.findMany({
    where: { OR: [{ profilePhotoUrl: { contains: 'cloudinary' } }, { governmentIdUrl: { contains: 'cloudinary' } }, { driversLicenseUrl: { contains: 'cloudinary' } }, { selfieUrl: { contains: 'cloudinary' } }] },
    select: { id: true, profilePhotoUrl: true, governmentIdUrl: true, driversLicenseUrl: true, selfieUrl: true }
  })
  console.log(`  Found: ${guests.length} guest profiles with Cloudinary URLs`)
  for (const g of guests) {
    const updates: any = {}
    if (isCloudinaryUrl(g.profilePhotoUrl)) { const u = await migrateUrl(g.profilePhotoUrl!, 'profiles', g.id, false); if (u) updates.profilePhotoUrl = u }
    if (isCloudinaryUrl(g.governmentIdUrl)) { const u = await migrateUrl(g.governmentIdUrl!, 'identity', g.id, true); if (u) updates.governmentIdUrl = u }
    if (isCloudinaryUrl(g.driversLicenseUrl)) { const u = await migrateUrl(g.driversLicenseUrl!, 'dl-photos', g.id, true); if (u) updates.driversLicenseUrl = u }
    if (isCloudinaryUrl(g.selfieUrl)) { const u = await migrateUrl(g.selfieUrl!, 'identity', g.id, true); if (u) updates.selfieUrl = u }
    if (Object.keys(updates).length > 0 && !DRY_RUN) await prisma.reviewerProfile.update({ where: { id: g.id }, data: updates })
  }

  // 5. Booking Documents (PRIVATE)
  console.log('\n📋 Migrating booking documents...')
  const bookings = await prisma.rentalBooking.findMany({
    where: { OR: [{ licensePhotoUrl: { contains: 'cloudinary' } }, { licenseBackPhotoUrl: { contains: 'cloudinary' } }, { agreementSignedPdfUrl: { contains: 'cloudinary' } }] },
    select: { id: true, licensePhotoUrl: true, licenseBackPhotoUrl: true, agreementSignedPdfUrl: true }
  })
  console.log(`  Found: ${bookings.length} bookings with Cloudinary documents`)
  for (const b of bookings) {
    const updates: any = {}
    if (isCloudinaryUrl(b.licensePhotoUrl)) { const u = await migrateUrl(b.licensePhotoUrl!, 'dl-photos', b.id, true); if (u) updates.licensePhotoUrl = u }
    if (isCloudinaryUrl(b.licenseBackPhotoUrl)) { const u = await migrateUrl(b.licenseBackPhotoUrl!, 'dl-photos', b.id, true); if (u) updates.licenseBackPhotoUrl = u }
    if (isCloudinaryUrl(b.agreementSignedPdfUrl)) { const u = await migrateUrl(b.agreementSignedPdfUrl!, 'agreements', b.id, true); if (u) updates.agreementSignedPdfUrl = u }
    if (Object.keys(updates).length > 0 && !DRY_RUN) await prisma.rentalBooking.update({ where: { id: b.id }, data: updates })
  }

  // 6. Inspection Photos (PUBLIC)
  console.log('\n📷 Migrating inspection photos...')
  const inspections = await prisma.inspectionPhoto.findMany({ where: { url: { contains: 'cloudinary' } }, select: { id: true, url: true, bookingId: true } })
  console.log(`  Found: ${inspections.length} inspection photos`)
  for (let i = 0; i < inspections.length; i += BATCH_SIZE) {
    const batch = inspections.slice(i, i + BATCH_SIZE)
    await Promise.all(batch.map(async (p) => {
      const newUrl = await migrateUrl(p.url, 'inspections', p.bookingId, false)
      if (newUrl && !DRY_RUN) await prisma.inspectionPhoto.update({ where: { id: p.id }, data: { url: newUrl } })
    }))
    console.log(`  Progress: ${Math.min(i + BATCH_SIZE, inspections.length)}/${inspections.length}`)
  }

  // 7. User avatars (PUBLIC)
  console.log('\n🖼️ Migrating user avatars...')
  const users = await prisma.user.findMany({ where: { avatar: { contains: 'cloudinary' } }, select: { id: true, avatar: true } })
  console.log(`  Found: ${users.length} user avatars`)
  for (const u of users) {
    const newUrl = await migrateUrl(u.avatar!, 'profiles', u.id, false)
    if (newUrl && !DRY_RUN) await prisma.user.update({ where: { id: u.id }, data: { avatar: newUrl } })
  }

  console.log(`\n${'='.repeat(60)}`)
  console.log(`COMPLETE ${DRY_RUN ? '(DRY RUN)' : ''}`)
  console.log(`  Migrated: ${migrated}`)
  console.log(`  Skipped:  ${skipped}`)
  console.log(`  Failed:   ${failed}`)
  console.log(`${'='.repeat(60)}\n`)

  await prisma.$disconnect()
}

main().catch(err => { console.error('Migration failed:', err); process.exit(1) })
