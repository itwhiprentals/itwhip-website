// app/api/fleet/vehicles/[id]/documents/route.ts
// Fleet vehicle document management — upload, list, delete (inspection papers, title)

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { uploadPrivateDocument, getPrivateDocumentUrl, generateKey } from '@/app/lib/storage/s3'

const FLEET_KEY = 'phoenix-fleet-2847'

function validateFleetKey(request: NextRequest): boolean {
  const key = request.headers.get('x-fleet-key') ||
              request.nextUrl.searchParams.get('key')
  return key === FLEET_KEY
}

const VALID_DOC_TYPES = ['INSPECTION_FRONT', 'INSPECTION_BACK', 'TITLE']

// GET - List documents for a vehicle (with pre-signed URLs)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    const docs = await prisma.rentalCarDocument.findMany({
      where: { carId: id, deletedAt: null },
      orderBy: { createdAt: 'desc' },
    })

    // Generate pre-signed URLs for each doc
    const docsWithUrls = await Promise.all(
      docs.map(async (doc) => ({
        id: doc.id,
        type: doc.type,
        fileName: doc.fileName,
        mimeType: doc.mimeType,
        uploadedBy: doc.uploadedBy,
        uploadedByType: doc.uploadedByType,
        verified: doc.verified,
        verifiedAt: doc.verifiedAt?.toISOString() || null,
        verifiedBy: doc.verifiedBy,
        notes: doc.notes,
        createdAt: doc.createdAt.toISOString(),
        url: await getPrivateDocumentUrl(doc.s3Key),
      }))
    )

    return NextResponse.json({ success: true, documents: docsWithUrls })
  } catch (error) {
    console.error('[Fleet Vehicle Documents] GET error:', error)
    return NextResponse.json({ error: 'Failed to fetch documents' }, { status: 500 })
  }
}

// POST - Upload a document
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const { id } = await params

    // Verify vehicle exists
    const vehicle = await prisma.rentalCar.findUnique({ where: { id }, select: { id: true, hostId: true } })
    if (!vehicle) {
      return NextResponse.json({ error: 'Vehicle not found' }, { status: 404 })
    }

    const formData = await request.formData()
    const file = formData.get('file') as File | null
    const docType = formData.get('type') as string | null
    const adminId = formData.get('adminId') as string || 'fleet_admin'

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 })
    }

    if (!docType || !VALID_DOC_TYPES.includes(docType)) {
      return NextResponse.json({ error: `Invalid document type. Must be one of: ${VALID_DOC_TYPES.join(', ')}` }, { status: 400 })
    }

    // Validate file
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'image/heic', 'image/heif', 'application/pdf']
    const maxSize = 10 * 1024 * 1024 // 10MB

    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ error: `Invalid file type: ${file.type}` }, { status: 400 })
    }
    if (file.size > maxSize) {
      return NextResponse.json({ error: 'File too large. Maximum size is 10MB.' }, { status: 400 })
    }

    // Upload to private S3
    const buffer = Buffer.from(await file.arrayBuffer())
    const keyType = docType.startsWith('INSPECTION') ? 'inspection' : 'vehicle-doc'
    const key = generateKey(keyType, id, docType.toLowerCase())
    await uploadPrivateDocument(key, buffer, file.type || 'image/jpeg')

    // Create DB record
    const doc = await prisma.rentalCarDocument.create({
      data: {
        id: crypto.randomUUID(),
        carId: id,
        type: docType,
        s3Key: key,
        fileName: file.name,
        mimeType: file.type,
        uploadedBy: adminId,
        uploadedByType: 'ADMIN',
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
    console.error('[Fleet Vehicle Documents] POST error:', error)
    return NextResponse.json({ error: 'Failed to upload document' }, { status: 500 })
  }
}

// DELETE - Soft-delete a document
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!validateFleetKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const { documentId } = body

    if (!documentId) {
      return NextResponse.json({ error: 'documentId required' }, { status: 400 })
    }

    await prisma.rentalCarDocument.update({
      where: { id: documentId },
      data: { deletedAt: new Date() },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('[Fleet Vehicle Documents] DELETE error:', error)
    return NextResponse.json({ error: 'Failed to delete document' }, { status: 500 })
  }
}
