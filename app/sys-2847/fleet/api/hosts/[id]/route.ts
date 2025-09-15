// app/sys-2847/fleet/api/hosts/[id]/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    const host = await prisma.rentalHost.findUnique({
      where: { id }
    })

    if (!host) {
      return NextResponse.json(
        { success: false, error: 'Host not found' },
        { status: 404 }
      )
    }

    // Transform the data to match what the frontend expects
    const transformedHost = {
      ...host,
      verificationStatus: host.verificationLevel || '', // Map verificationLevel to verificationStatus
      memberSince: host.joinedAt // Ensure memberSince is available
    }

    return NextResponse.json({
      success: true,
      data: transformedHost
    })
  } catch (error) {
    console.error('Error fetching host:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch host' },
      { status: 500 }
    )
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()
    
    console.log('Updating host with data:', body)
    console.log('Verification status received:', body.verificationStatus)
    
    // Prepare the update data
    const updateData: any = {
      name: body.name,
      phone: body.phone,
      bio: body.bio,
      profilePhoto: body.profilePhoto,
      city: body.city,
      state: body.state,
      responseTime: body.responseTime ? parseInt(body.responseTime) : null,
      responseRate: body.responseRate ? parseFloat(body.responseRate) : null,
      totalTrips: body.totalTrips ? parseInt(body.totalTrips) : 0,
      rating: body.rating ? parseFloat(body.rating) : null,
      // Store verificationStatus in verificationLevel field (that's what exists in schema)
      verificationLevel: body.verificationStatus || null,
      // Handle member since / joined at date
      joinedAt: body.memberSince ? new Date(body.memberSince) : 
                body.joinedAt ? new Date(body.joinedAt) : undefined
    }
    
    // Remove undefined values to avoid Prisma errors
    Object.keys(updateData).forEach(key => {
      if (updateData[key] === undefined) {
        delete updateData[key]
      }
    })
    
    const updatedHost = await prisma.rentalHost.update({
      where: { id },
      data: updateData
    })
    
    // Transform the response to match frontend expectations
    const transformedHost = {
      ...updatedHost,
      verificationStatus: updatedHost.verificationLevel || '', // Map back for frontend
      memberSince: updatedHost.joinedAt,
      // Include the additional fields that might be used by frontend
      languages: body.languages || [],
      education: body.education || '',
      work: body.work || '',
      totalReviews: body.totalReviews || 0,
      badge: body.badge || null
    }

    console.log('Host updated successfully:', transformedHost.id)

    return NextResponse.json({
      success: true,
      data: transformedHost,
      message: 'Host profile updated successfully'
    })
  } catch (error) {
    console.error('Error updating host:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to update host',
        details: error 
      },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    
    // Soft delete - just mark as inactive
    const host = await prisma.rentalHost.update({
      where: { id },
      data: {
        active: false
      }
    })

    return NextResponse.json({
      success: true,
      message: 'Host deactivated successfully'
    })
  } catch (error) {
    console.error('Error deleting host:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to delete host' },
      { status: 500 }
    )
  }
}