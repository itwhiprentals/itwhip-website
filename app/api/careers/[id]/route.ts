// app/api/careers/[id]/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET - Fetch single job posting by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Await params for Next.js 15
    const { id } = await params

    // Validate ID
    if (!id) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Job ID is required' 
        },
        { status: 400 }
      )
    }

    // Fetch job posting with application count
    const job = await prisma.jobPosting.findUnique({
      where: { 
        id: id,
        isActive: true // Only show active jobs
      },
      include: {
        _count: {
          select: {
            applications: true
          }
        }
      }
    })

    // Handle not found
    if (!job) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Job posting not found' 
        },
        { status: 404 }
      )
    }

    // Check if job has closed
    if (job.closingDate && new Date(job.closingDate) < new Date()) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'This position has closed' 
        },
        { status: 410 } // Gone
      )
    }

    // Get similar jobs for "Other Openings" section
    const similarJobs = await prisma.jobPosting.findMany({
      where: {
        isActive: true,
        id: { not: id },
        OR: [
          { department: job.department },
          { location: job.location }
        ]
      },
      take: 3,
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        type: true,
        salaryMin: true,
        salaryMax: true,
        showSalary: true,
        equity: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Increment view count (async, don't await)
    prisma.jobPosting.update({
      where: { id },
      data: { views: { increment: 1 } }
    }).catch(err => console.error('Failed to increment view count:', err))

    // Format response
    const response = {
      success: true,
      job: {
        id: job.id,
        title: job.title,
        department: job.department,
        location: job.location,
        type: job.type,
        description: job.description,
        requirements: job.requirements,
        responsibilities: job.responsibilities,
        salaryRange: job.showSalary && job.salaryMin && job.salaryMax
          ? `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax / 1000).toFixed(0)}k`
          : null,
        salaryPeriod: job.salaryPeriod,
        equity: job.equity,
        showSalary: job.showSalary,
        isFeatured: job.isFeatured,
        openPositions: job.openPositions,
        applicationCount: job._count.applications,
        views: job.views,
        createdAt: job.createdAt,
        updatedAt: job.updatedAt,
        closingDate: job.closingDate,
        daysOpen: Math.floor((Date.now() - new Date(job.createdAt).getTime()) / (1000 * 60 * 60 * 24))
      },
      similarJobs: similarJobs.map(sj => ({
        ...sj,
        salaryRange: sj.showSalary && sj.salaryMin && sj.salaryMax
          ? `$${(sj.salaryMin / 1000).toFixed(0)}k - $${(sj.salaryMax / 1000).toFixed(0)}k${sj.equity ? ' + equity' : ''}`
          : sj.equity || 'Competitive'
      }))
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Failed to fetch job posting:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load job posting' 
      },
      { status: 500 }
    )
  }
}

// PUT - Update job posting (Admin only - add auth later)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check here
    // if (!isAdmin) return unauthorized response

    const { id } = await params
    const data = await request.json()

    // Update job posting
    const job = await prisma.jobPosting.update({
      where: { id },
      data: {
        title: data.title,
        department: data.department,
        location: data.location,
        type: data.type,
        description: data.description,
        requirements: data.requirements,
        responsibilities: data.responsibilities,
        salaryMin: data.salaryMin,
        salaryMax: data.salaryMax,
        salaryPeriod: data.salaryPeriod,
        showSalary: data.showSalary,
        equity: data.equity,
        isActive: data.isActive,
        isFeatured: data.isFeatured,
        openPositions: data.openPositions,
        closingDate: data.closingDate ? new Date(data.closingDate) : null
      }
    })

    return NextResponse.json({
      success: true,
      job
    })

  } catch (error) {
    console.error('Failed to update job posting:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to update job posting' 
      },
      { status: 500 }
    )
  }
}

// DELETE - Delete job posting (Admin only - add auth later)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // TODO: Add authentication check here
    // if (!isAdmin) return unauthorized response

    const { id } = await params

    // Soft delete by setting isActive to false
    await prisma.jobPosting.update({
      where: { id },
      data: { isActive: false }
    })

    return NextResponse.json({
      success: true,
      message: 'Job posting deleted successfully'
    })

  } catch (error) {
    console.error('Failed to delete job posting:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to delete job posting' 
      },
      { status: 500 }
    )
  }
}