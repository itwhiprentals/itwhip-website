// app/api/host/upload/route.ts - ENHANCED WITH PHOTO METADATA TRACKING

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
  
  // ✅ FIX: Check hostId first, then userId
  if (!hostId && !userId) {
    return null
  }
  
  const host = await prisma.rentalHost.findFirst({
    where: hostId ? { id: hostId } : { userId: userId! },
    select: {
      id: true,
      userId: true,
      name: true,
      email: true,
      approvalStatus: true
    }
  })
  
  return host
}

// Helper to extract EXIF metadata from photo
async function extractPhotoMetadata(file: File) {
  try {
    const metadata: Record<string, any> = {
      fileName: file.name,
      fileSize: file.size,
      fileType: file.type,
      uploadTimestamp: new Date().toISOString()
    }
    return metadata
  } catch (error) {
    console.error('Error extracting photo metadata:', error)
    return null
  }
}

// Log photo upload activity
async function logPhotoActivity(params: {
  carId?: string
  hostId: string
  hostName: string
  action: string
  photoUrl: string
  metadata?: Record<string, any>
}) {
  const { carId, hostId, hostName, action, photoUrl, metadata } = params

  let description = ''
  switch (action) {
    case 'UPLOAD_PHOTO':
      description = `Vehicle photo uploaded`
      break
    case 'UPLOAD_PHOTOS_BATCH':
      description = `${metadata?.count || 'Multiple'} vehicle photos uploaded`
      break
    case 'UPLOAD_PROFILE_PHOTO':
      description = `Profile photo updated`
      break
    case 'UPLOAD_DOCUMENT':
      description = `${metadata?.documentType || 'Document'} uploaded`
      break
    case 'DELETE_PHOTO':
      description = `Photo deleted`
      break
    case 'DELETE_DOCUMENT':
      description = `${metadata?.documentType || 'Document'} deleted`
      break
    default:
      description = action
  }

  try {
    await prisma.activityLog.create({
      data: {
        entityType: carId ? 'CAR' : 'HOST',
        entityId: carId || hostId,
        hostId: hostId,
        action: action,
        category: carId ? 'PHOTO' : 'DOCUMENT',
        severity: 'INFO',
        description: description,
        metadata: JSON.stringify({
          ...metadata,
          hostName,
          photoUrl,
          timestamp: new Date().toISOString()
        }),
        createdAt: new Date()
      }
    })
  } catch (err) {
    console.error('Failed to log activity:', err)
  }
}

// Helper to upload a single file to Cloudinary
async function uploadToCloudinary(
  file: File,
  folder: string,
  hostId: string,
  type: string,
  index?: number
): Promise<any> {
  const bytes = await file.arrayBuffer()
  const buffer = Buffer.from(bytes)
  const base64 = buffer.toString('base64')
  const dataUri = `data:${file.type};base64,${base64}`
  
  const publicId = index !== undefined 
    ? `${hostId}-${type}-${Date.now()}-${index}`
    : `${hostId}-${type}-${Date.now()}`

  const uploadResult = await cloudinary.uploader.upload(dataUri, {
    folder: folder,
    public_id: publicId,
    resource_type: 'auto',
    transformation: type === 'profile' ? [
      { width: 500, height: 500, crop: 'fill', gravity: 'face' }
    ] : undefined,
    exif: true,
    colors: true,
    image_metadata: true
  })

  return uploadResult
}

// POST - Upload file(s) - SUPPORTS MULTIPLE FILES
export async function POST(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      console.log('❌ Upload failed: No host found in headers')
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    console.log('📤 Upload request from host:', host.id, host.email)
    
    const formData = await request.formData()
    const type = formData.get('type') as string
    const carId = formData.get('carId') as string | null
    
    // ✅ Get all files from formData (supports multiple)
    const files: File[] = []
    const fileEntries = formData.getAll('file')
    const filesEntries = formData.getAll('files') // Alternative field name
    
    // Combine both possible field names
    for (const entry of [...fileEntries, ...filesEntries]) {
      if (entry instanceof File) {
        files.push(entry)
      }
    }

    console.log('📁 Files received:', files.length)
    
    if (files.length === 0) {
      return NextResponse.json(
        { error: 'No file provided' },
        { status: 400 }
      )
    }

    // Validate all files
    const allowedTypes = ['image/jpeg', 'image/png', 'image/jpg', 'image/webp', 'application/pdf']
    const maxSize = 10 * 1024 * 1024 // 10MB

    for (const file of files) {
      if (!allowedTypes.includes(file.type)) {
        return NextResponse.json(
          { error: `Invalid file type: ${file.name}. Only images and PDFs are allowed.` },
          { status: 400 }
        )
      }
      
      if (file.size > maxSize) {
        return NextResponse.json(
          { error: `File too large: ${file.name}. Maximum size is 10MB.` },
          { status: 400 }
        )
      }
    }
    
    // Set upload folder based on type
    let folder = 'host-documents'
    let fieldToUpdate = ''
    let isCarPhoto = false
    
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
      case 'carPhoto':
        folder = 'car-photos'
        isCarPhoto = true
        break
      default:
        return NextResponse.json(
          { error: 'Invalid upload type' },
          { status: 400 }
        )
    }
    
    // ✅ HANDLE CAR PHOTO UPLOAD (MULTIPLE)
    if (isCarPhoto && carId) {
      // Check if car belongs to host
      const car = await prisma.rentalCar.findFirst({
        where: {
          id: carId,
          hostId: host.id
        }
      })

      if (!car) {
        return NextResponse.json(
          { error: 'Car not found or unauthorized' },
          { status: 404 }
        )
      }

      // Check for active claims - but allow PENDING hosts to upload photos
      const activeClaims = await prisma.claim.findMany({
        where: {
          booking: { carId: carId },
          status: { in: ['PENDING', 'UNDER_REVIEW'] }
        }
      })

      if (activeClaims.length > 0) {
        return NextResponse.json({
          error: 'Cannot upload photos while vehicle has active claim',
          reason: 'ACTIVE_CLAIM'
        }, { status: 403 })
      }

      // Get current photo count for ordering
      const currentPhotoCount = await prisma.rentalCarPhoto.count({
        where: { carId, deletedAt: null }
      })

      // ✅ Upload all files in parallel
      const uploadPromises = files.map((file, index) => 
        uploadToCloudinary(file, folder, host.id, type, index)
      )
      
      const uploadResults = await Promise.all(uploadPromises)
      
      // Create photo records for all uploads
      const photoRecords = []
      
      for (let i = 0; i < uploadResults.length; i++) {
        const uploadResult = uploadResults[i]
        const file = files[i]
        const photoMetadata = await extractPhotoMetadata(file)
        
        const enrichedMetadata = {
          ...photoMetadata,
          cloudinaryPublicId: uploadResult.public_id,
          width: uploadResult.width,
          height: uploadResult.height,
          format: uploadResult.format,
          gpsLatitude: uploadResult.exif?.GPSLatitude || null,
          gpsLongitude: uploadResult.exif?.GPSLongitude || null,
          deviceMake: uploadResult.exif?.Make || null,
          deviceModel: uploadResult.exif?.Model || null,
          photoTimestamp: uploadResult.exif?.DateTime || null,
          colors: uploadResult.colors || null,
          predominantColor: uploadResult.predominant?.google?.[0]?.[0] || null
        }

        const photo = await prisma.rentalCarPhoto.create({
          data: {
            carId: carId,
            url: uploadResult.secure_url,
            isHero: currentPhotoCount === 0 && i === 0, // First photo of first batch is hero
            order: currentPhotoCount + i,
            uploadedBy: host.id,
            uploadedByType: 'HOST',
            metadata: enrichedMetadata,
            photoTimestamp: enrichedMetadata.photoTimestamp ? new Date(enrichedMetadata.photoTimestamp) : null,
            gpsLatitude: enrichedMetadata.gpsLatitude,
            gpsLongitude: enrichedMetadata.gpsLongitude,
            deviceMake: enrichedMetadata.deviceMake,
            deviceModel: enrichedMetadata.deviceModel,
            photoHash: uploadResult.etag || null
          }
        })

        photoRecords.push({
          id: photo.id,
          url: photo.url,
          isHero: photo.isHero,
          order: photo.order,
          metadata: enrichedMetadata
        })
      }

      // Log batch upload activity
      await logPhotoActivity({
        carId: carId,
        hostId: host.id,
        hostName: host.name || host.email,
        action: files.length > 1 ? 'UPLOAD_PHOTOS_BATCH' : 'UPLOAD_PHOTO',
        photoUrl: photoRecords[0]?.url || '',
        metadata: {
          count: files.length,
          photoIds: photoRecords.map(p => p.id),
          totalPhotos: currentPhotoCount + files.length,
          hasGPS: photoRecords.some(p => p.metadata?.gpsLatitude && p.metadata?.gpsLongitude)
        }
      })

      console.log('✅ Uploaded', files.length, 'photos for car:', carId)

      return NextResponse.json({
        success: true,
        photos: photoRecords,
        // Also return single photo for backward compatibility
        photo: photoRecords[0]
      })
    }

    // ✅ HANDLE DOCUMENT/PROFILE PHOTO UPLOAD (single file only)
    if (files.length > 1) {
      return NextResponse.json(
        { error: 'Only one file allowed for document uploads' },
        { status: 400 }
      )
    }

    const file = files[0]
    const uploadResult = await uploadToCloudinary(file, folder, host.id, type)
    
    const photoMetadata = await extractPhotoMetadata(file)
    const enrichedMetadata = {
      ...photoMetadata,
      cloudinaryPublicId: uploadResult.public_id,
      width: uploadResult.width,
      height: uploadResult.height,
      format: uploadResult.format
    }

    const updateData: Record<string, any> = {
      [fieldToUpdate]: uploadResult.secure_url,
      updatedAt: new Date()
    }
    
    if (type !== 'profile') {
      const currentHost = await prisma.rentalHost.findUnique({
        where: { id: host.id },
        select: {
          governmentIdUrl: true,
          driversLicenseUrl: true,
          insuranceDocUrl: true
        }
      })
      
      const willHaveAllDocs = 
        (type === 'governmentId' || currentHost?.governmentIdUrl) &&
        (type === 'license' || currentHost?.driversLicenseUrl) &&
        (type === 'insurance' || currentHost?.insuranceDocUrl)
      
      if (willHaveAllDocs) {
        updateData.documentsVerified = true
      }
    }
    
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: updateData
    })

    // Log document/profile upload
    await logPhotoActivity({
      hostId: host.id,
      hostName: host.name || host.email,
      action: type === 'profile' ? 'UPLOAD_PROFILE_PHOTO' : 'UPLOAD_DOCUMENT',
      photoUrl: uploadResult.secure_url,
      metadata: {
        documentType: type,
        fileName: file.name,
        fileSize: file.size,
        format: uploadResult.format,
        allDocsVerified: updateData.documentsVerified || false
      }
    })
    
    // Create admin notification for document uploads
    if (type !== 'profile') {
      await prisma.adminNotification.create({
        data: {
          type: 'DOCUMENT_UPLOADED',
          title: 'Host Document Uploaded',
          message: `${host.name || host.email} uploaded ${type} document`,
          priority: 'LOW',
          status: 'UNREAD',
          relatedId: host.id,
          relatedType: 'host',
          actionRequired: true,
          actionUrl: `/fleet/hosts/${host.id}/edit?key=phoenix-fleet-2847`,
          metadata: {
            hostName: host.name || host.email,
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
      type: type,
      metadata: enrichedMetadata
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
    const type = searchParams.get('type')
    const photoId = searchParams.get('photoId')
    
    // Handle car photo deletion
    if (photoId) {
      const photo = await prisma.rentalCarPhoto.findFirst({
        where: {
          id: photoId,
          car: {
            hostId: host.id
          }
        },
        include: {
          car: {
            select: {
              id: true,
              make: true,
              model: true,
              year: true
            }
          }
        }
      })

      if (!photo) {
        return NextResponse.json(
          { error: 'Photo not found or unauthorized' },
          { status: 404 }
        )
      }

      // Check for active claims
      const activeClaims = await prisma.claim.findMany({
        where: {
          booking: { carId: photo.car.id },
          status: { in: ['PENDING', 'UNDER_REVIEW'] }
        }
      })

      if (activeClaims.length > 0) {
        return NextResponse.json({
          error: 'Cannot delete photos while vehicle has active claim',
          reason: 'ACTIVE_CLAIM'
        }, { status: 403 })
      }

      // Soft delete
      await prisma.rentalCarPhoto.update({
        where: { id: photoId },
        data: {
          deletedAt: new Date(),
          deletedBy: host.id
        }
      })

      // Log deletion
      await logPhotoActivity({
        carId: photo.car.id,
        hostId: host.id,
        hostName: host.name || host.email,
        action: 'DELETE_PHOTO',
        photoUrl: photo.url,
        metadata: {
          photoId: photo.id,
          wasHero: photo.isHero,
          carInfo: `${photo.car.year} ${photo.car.make} ${photo.car.model}`
        }
      })

      // Delete from Cloudinary
      if (photo.url && photo.url.includes('cloudinary.com')) {
        try {
          const urlParts = photo.url.split('/')
          const publicIdWithExtension = urlParts.slice(-1)[0]
          const publicId = publicIdWithExtension.split('.')[0]
          const folder = urlParts.slice(-3, -1).join('/')
          await cloudinary.uploader.destroy(`${folder}/${publicId}`)
        } catch (cloudinaryError) {
          console.error('Cloudinary deletion error:', cloudinaryError)
        }
      }

      return NextResponse.json({
        success: true,
        message: 'Photo deleted successfully'
      })
    }

    // Handle document deletion
    if (!type) {
      return NextResponse.json(
        { error: 'Document type required' },
        { status: 400 }
      )
    }
    
    let fieldToClear = ''
    let currentUrl = ''
    
    const currentHost = await prisma.rentalHost.findUnique({
      where: { id: host.id }
    })

    if (!currentHost) {
      return NextResponse.json(
        { error: 'Host not found' },
        { status: 404 }
      )
    }
    
    switch (type) {
      case 'profile':
        fieldToClear = 'profilePhoto'
        currentUrl = currentHost.profilePhoto || ''
        break
      case 'governmentId':
        fieldToClear = 'governmentIdUrl'
        currentUrl = currentHost.governmentIdUrl || ''
        break
      case 'license':
        fieldToClear = 'driversLicenseUrl'
        currentUrl = currentHost.driversLicenseUrl || ''
        break
      case 'insurance':
        fieldToClear = 'insuranceDocUrl'
        currentUrl = currentHost.insuranceDocUrl || ''
        break
      default:
        return NextResponse.json(
          { error: 'Invalid document type' },
          { status: 400 }
        )
    }
    
    // Delete from Cloudinary
    if (currentUrl && currentUrl.includes('cloudinary.com')) {
      try {
        const urlParts = currentUrl.split('/')
        const publicIdWithExtension = urlParts.slice(-1)[0]
        const publicId = publicIdWithExtension.split('.')[0]
        const folder = urlParts.slice(-3, -1).join('/')
        await cloudinary.uploader.destroy(`${folder}/${publicId}`)
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError)
      }
    }
    
    const updateData: Record<string, any> = {
      [fieldToClear]: null,
      updatedAt: new Date()
    }
    
    if (type !== 'profile') {
      updateData.documentsVerified = false
    }
    
    await prisma.rentalHost.update({
      where: { id: host.id },
      data: updateData
    })

    // Log deletion
    await logPhotoActivity({
      hostId: host.id,
      hostName: host.name || host.email,
      action: 'DELETE_DOCUMENT',
      photoUrl: currentUrl,
      metadata: {
        documentType: type
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