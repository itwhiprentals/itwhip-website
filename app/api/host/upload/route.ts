// app/api/host/upload/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'
import { v2 as cloudinary } from 'cloudinary'

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
})

// Helper to get host from headers
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  
  if (!userId) {
    return null
  }
  
  const host = await prisma.rentalHost.findFirst({
    where: hostId ? { id: hostId } : { userId: userId }
  })
  
  return host
}

// POST - Upload file (profile photo or documents)
export async function POST(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const formData = await request.formData()
    const file = formData.get('file') as File
    const type = formData.get('type') as string // 'profile', 'governmentId', 'license', 'insurance'
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json(
        { error: 'Invalid file type. Only images and PDFs are allowed.' },
        { status: 400 }
      )
    }
    
    // Validate file size (max 10MB)
    const maxSize = 10 * 1024 * 1024 // 10MB
    if (file.size > maxSize) {
      return NextResponse.json(
        { error: 'File too large. Maximum size is 10MB.' },
        { status: 400 }
      )
    }
    
    // Convert file to base64
    const bytes = await file.arrayBuffer()
    const buffer = Buffer.from(bytes)
    const base64 = buffer.toString('base64')
    const dataUri = `data:${file.type};base64,${base64}`
    
    // Set upload folder based on type
    let folder = 'host-documents'
    let fieldToUpdate = ''
    
    switch (type) {
      case 'profile':
        folder = 'host-profiles'
        fieldToUpdate = 'profilePhoto'
        break
      case 'governmentId':
        folder = 'host-documents/government-id'
        fieldToUpdate = 'governmentIdUrl'
        break
      case 'license':
        folder = 'host-documents/licenses'
        fieldToUpdate = 'driversLicenseUrl'
        break
      case 'insurance':
        folder = 'host-documents/insurance'
        fieldToUpdate = 'insuranceDocUrl'
        break
      default:
        return NextResponse.json(
          { error: 'Invalid upload type' },
          { status: 400 }
        )
    }
    
    // Upload to Cloudinary
    const uploadResult = await cloudinary.uploader.upload(dataUri, {
      folder: folder,
      public_id: `${host.id}-${type}-${Date.now()}`,
      resource_type: 'auto',
      transformation: type === 'profile' ? [
        { width: 500, height: 500, crop: 'fill', gravity: 'face' }
      ] : undefined,
      allowed_formats: type === 'profile' ? ['jpg', 'png', 'webp'] : ['jpg', 'png', 'pdf'],
    })
    
    // Update host record with new URL
    const updateData: any = {
      [fieldToUpdate]: uploadResult.secure_url,
      updatedAt: new Date()
    }
    
    // If all documents are uploaded, mark as verified
    if (type !== 'profile') {
      const currentHost = await prisma.rentalHost.findUnique({
        where: { id: host.id },
        select: {
          governmentIdUrl: true,
          driversLicenseUrl: true,
          insuranceDocUrl: true
        }
      })
      
      // Check if all documents will be present after this upload
      const willHaveAllDocs = 
        (type === 'governmentId' || currentHost?.governmentIdUrl) &&
        (type === 'license' || currentHost?.driversLicenseUrl) &&
        (type === 'insurance' || currentHost?.insuranceDocUrl)
      
      if (willHaveAllDocs) {
        updateData.documentsVerified = true
      }
    }
    
    // Update the host record
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: updateData
    })
    
    // Log the upload
    await prisma.activityLog.create({
      data: {
        userId: host.userId,
        action: 'document_uploaded',
        entityType: 'host',
        entityId: host.id,
        metadata: {
          documentType: type,
          fileName: file.name,
          fileSize: file.size,
          uploadUrl: uploadResult.secure_url
        }
      }
    })
    
    // Create admin notification for document uploads
    if (type !== 'profile') {
      await prisma.adminNotification.create({
        data: {
          type: 'DOCUMENT_UPLOADED',
          title: 'Host Document Uploaded',
          message: `${host.name} uploaded ${type} document`,
          priority: 'LOW',
          status: 'UNREAD',
          relatedId: host.id,
          relatedType: 'host',
          actionRequired: true,
          actionUrl: `/fleet/hosts/${host.id}/edit?key=phoenix-fleet-2847`,
          metadata: {
            hostName: host.name,
            documentType: type,
            uploadedAt: new Date().toISOString()
          }
        }
      })
    }
    
    return NextResponse.json({
      success: true,
      url: uploadResult.secure_url,
      publicId: uploadResult.public_id,
      type: type
    })
    
  } catch (error) {
    console.error('Upload error:', error)
    return NextResponse.json(
      { error: 'Failed to upload file' },
      { status: 500 }
    )
  }
}

// DELETE - Remove uploaded file
export async function DELETE(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }
    
    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // 'profile', 'governmentId', 'license', 'insurance'
    
    if (!type) {
      return NextResponse.json(
        { error: 'Document type required' },
        { status: 400 }
      )
    }
    
    // Determine which field to clear
    let fieldToClear = ''
    let currentUrl = ''
    
    switch (type) {
      case 'profile':
        fieldToClear = 'profilePhoto'
        currentUrl = host.profilePhoto || ''
        break
      case 'governmentId':
        fieldToClear = 'governmentIdUrl'
        currentUrl = host.governmentIdUrl || ''
        break
      case 'license':
        fieldToClear = 'driversLicenseUrl'
        currentUrl = host.driversLicenseUrl || ''
        break
      case 'insurance':
        fieldToClear = 'insuranceDocUrl'
        currentUrl = host.insuranceDocUrl || ''
        break
      default:
        return NextResponse.json(
          { error: 'Invalid document type' },
          { status: 400 }
        )
    }
    
    // Extract public ID from Cloudinary URL
    if (currentUrl && currentUrl.includes('cloudinary.com')) {
      const urlParts = currentUrl.split('/')
      const publicIdWithExtension = urlParts.slice(-1)[0]
      const publicId = publicIdWithExtension.split('.')[0]
      const folder = urlParts.slice(-3, -1).join('/')
      
      // Delete from Cloudinary
      try {
        await cloudinary.uploader.destroy(`${folder}/${publicId}`)
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError)
        // Continue even if Cloudinary deletion fails
      }
    }
    
    // Update host record
    const updateData: any = {
      [fieldToClear]: null,
      updatedAt: new Date()
    }
    
    // If removing a required document, mark as unverified
    if (type !== 'profile') {
      updateData.documentsVerified = false
    }
    
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: updateData
    })
    
    // Log the removal
    await prisma.activityLog.create({
      data: {
        userId: host.userId,
        action: 'document_removed',
        entityType: 'host',
        entityId: host.id,
        metadata: {
          documentType: type
        }
      }
    })
    
    return NextResponse.json({
      success: true,
      message: `${type} document removed successfully`
    })
    
  } catch (error) {
    console.error('Delete error:', error)
    return NextResponse.json(
      { error: 'Failed to remove document' },
      { status: 500 }
    )
  }
}