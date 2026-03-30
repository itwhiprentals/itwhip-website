// app/lib/storage/s3.ts
// S3 storage utility — private (pre-signed URLs) + public (CloudFront)

import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3'
import { getSignedUrl } from '@aws-sdk/s3-request-presigner'

const REGION = process.env.AWS_REGION || 'us-east-2'
const PRIVATE_BUCKET = process.env.AWS_S3_PRIVATE_BUCKET || 'itwhip-private-documents'
const PUBLIC_BUCKET = process.env.AWS_S3_PUBLIC_BUCKET || 'itwhip-public-assets'
const CLOUDFRONT_DOMAIN = process.env.AWS_CLOUDFRONT_DOMAIN || 'photos.itwhip.com'

const s3 = new S3Client({ region: REGION })

// ─── PRIVATE DOCUMENTS (DL, identity, agreements, claims) ─────────────

export async function uploadPrivateDocument(key: string, buffer: Buffer, contentType: string): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket: PRIVATE_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
  }))
  console.log(`[S3] Private upload: ${key} (${buffer.length} bytes)`)
  return key
}

export async function getPrivateDocumentUrl(key: string, expiresIn = 900): Promise<string> {
  const url = await getSignedUrl(s3, new GetObjectCommand({
    Bucket: PRIVATE_BUCKET,
    Key: key,
  }), { expiresIn })
  return url
}

export async function deletePrivateDocument(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: PRIVATE_BUCKET, Key: key }))
  console.log(`[S3] Private delete: ${key}`)
}

// ─── PUBLIC IMAGES (car photos, profiles, logos) ──────────────────────

export async function uploadPublicImage(key: string, buffer: Buffer, contentType: string): Promise<string> {
  await s3.send(new PutObjectCommand({
    Bucket: PUBLIC_BUCKET,
    Key: key,
    Body: buffer,
    ContentType: contentType,
    ServerSideEncryption: 'AES256',
    CacheControl: 'public, max-age=2592000', // 30 days
  }))
  const url = `https://${CLOUDFRONT_DOMAIN}/${key}`
  console.log(`[S3] Public upload: ${key} → ${url}`)
  return url
}

export function getPublicImageUrl(key: string): string {
  return `https://${CLOUDFRONT_DOMAIN}/${key}`
}

export async function deletePublicImage(key: string): Promise<void> {
  await s3.send(new DeleteObjectCommand({ Bucket: PUBLIC_BUCKET, Key: key }))
  console.log(`[S3] Public delete: ${key}`)
}

// ─── KEY GENERATORS ───────────────────────────────────────────────────

export function generateKey(type: 'car' | 'profile' | 'host-profile' | 'host-logo' | 'host-hero' | 'dl' | 'identity' | 'agreement' | 'claim' | 'inspection' | 'message', id: string, suffix?: string): string {
  const ts = Date.now()
  switch (type) {
    case 'car': return `cars/${id}/${ts}${suffix ? `-${suffix}` : ''}.jpg`
    case 'profile': return `profiles/${id}/${ts}.jpg`
    case 'host-profile': return `hosts/${id}/${ts}-profile.jpg`
    case 'host-logo': return `hosts/${id}/${ts}-logo.jpg`
    case 'host-hero': return `hosts/${id}/${ts}-hero.jpg`
    case 'dl': return `dl-photos/${id}/${ts}${suffix ? `-${suffix}` : ''}.jpg`
    case 'identity': return `identity/${id}/${ts}${suffix ? `-${suffix}` : ''}.jpg`
    case 'agreement': return `agreements/${id}/${ts}.pdf`
    case 'claim': return `claims/${id}/${ts}${suffix ? `-${suffix}` : ''}.jpg`
    case 'inspection': return `inspections/${id}/${ts}${suffix ? `-${suffix}` : ''}.jpg`
    case 'message': return `messages/${id}/${ts}${suffix ? `-${suffix}` : ''}`
    default: return `misc/${id}/${ts}`
  }
}

// ─── HELPERS ──────────────────────────────────────────────────────────

export function isS3Key(value: string): boolean {
  return !value.startsWith('http') && !value.startsWith('//')
}

export function isCloudinaryUrl(url: string): boolean {
  return url.includes('res.cloudinary.com') || url.includes('cloudinary.com')
}

// Extract S3 key from CloudFront URL
export function extractKeyFromUrl(url: string): string | null {
  if (url.includes(CLOUDFRONT_DOMAIN)) {
    return url.replace(`https://${CLOUDFRONT_DOMAIN}/`, '')
  }
  return null
}
