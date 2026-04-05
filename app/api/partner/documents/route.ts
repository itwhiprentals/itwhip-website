// app/api/partner/documents/route.ts
// Host document upload — inspection papers (front/back) + title → private S3

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import { uploadPrivateDocument, getPrivateDocumentUrl, generateKey } from '@/app/lib/storage/s3'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

const VALID_DOC_TYPES = ['INSPECTION_FRONT', 'INSPECTION_BACK', 'TITLE']

async function getHostFromToken(request: NextRequest) {
  let token: string | undefined
  const authHeader = request.headers.get('authorization')
  if (authHeader?.startsWith('Bearer ')) {
    token = authHeader.substring(7)
  }
  if (!token) {
    const cookieStore = await cookies()
    token = cookieStore.get('partner_token')?.value || cookieStore.get('hostAccessToken')?.value
  }
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string
    const host = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      select: { id: true, email: true },
    })
    return host
  } catch {
    return null
  }
}

// GET - List documents for a vehicle owned by this host
export async function GET(request: NextRequest) {
  const host = await getHostFromToken(request)
  if (!host) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  const carId = request.nextUrl.searchParams.get('carId')
  if (!carId) return NextResponse.json({ error: 'carId required' }, { status: 400 })

  // Verify ownership
  const car = await prisma.rentalCar.findFirst({ where: { id: carId, hostId: host.id } })
  if (!car) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })

  try {
    const docs = await prisma.rentalCarDocument.findMany({
      where: { carId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })

    const docsWithUrls = await Promise.all(
      docs.map(async (doc) => ({
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
        verified: doc.verified,
        createdAt: doc.createdAt.toISOString(),
        url: await getPrivateDocumentUrl(doc.s3Key),
      }))
    )

    return NextResponse.json({ success: true, documents: docsWithUrls })
  } catch (error) {
    console.error('[Partner Documents] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

// POST - Host uploads a document for their vehicle
export async function POST(request: NextRequest) {
  const host = await getHostFromToken(request)
  if (!host) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })

  try {
    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const carId = formData.get('carId') as string | null
    const docType = formData.get('type') as string | null

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }
    if (!carId) {
      return NextResponse.json({ error: 'carId required' }, { status: 400 })
    }
    if (!docType || !VALID_DOC_TYPES.includes(docType)) {
      return NextResponse.json({ error: `Invalid document type. Must be one of: ${VALID_DOC_TYPES.join(', ')}` }, { status: 400 })
    }

    // Verify ownership
    const car = await prisma.rentalCar.findFirst({ where: { id: carId, hostId: host.id } })
    if (!car) return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
    const maxSize = 10 * 1024 * 1024

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 })
    }
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum 10MB.' }, { status: 400 })
    }

    // Upload to private S3
    const buffer = Buffer.from(await file.arrayBuffer())
    const keyType = docType.startsWith('INSPECTION') ? 'inspection' : 'vehicle-doc'
    const key = generateKey(keyType, carId, docType.toLowerCase())
    await uploadPrivateDocument(key, buffer, file.type || 'image/jpeg')

    // Create DB record
    const doc = await prisma.rentalCarDocument.create({
      data: {
        id: crypto.randomUUID(),
        carId,
        type: docType,
        s3Key: key,
        fileName: file.name,
        mimeType: file.type,
        uploadedBy: host.id,
        uploadedByType: 'HOST',
      }
    })

    const url = await getPrivateDocumentUrl(key)

    return NextResponse.json({
      success: true,
      document: {
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
        url,
        createdAt: doc.createdAt.toISOString(),
      }
    })
  } catch (error) {
    console.error('[Partner Documents] POST error:', error)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}
