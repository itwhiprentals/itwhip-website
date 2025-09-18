// app/api/careers/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// GET - Fetch all active job postings
export async function GET(request: NextRequest) {
  try {
    // Get query parameters for filtering
    const searchParams = request.nextUrl.searchParams
    const department = searchParams.get('department')
    const location = searchParams.get('location')
    const type = searchParams.get('type')

    // Build filter conditions
    const where: any = {
      isActive: true,
      // Only show jobs that haven't passed their closing date
      OR: [
        { closingDate: null },
        { closingDate: { gte: new Date() } }
      ]
    }

    // Add optional filters
    if (department) {
      where.department = department
    }
    if (location) {
      where.location = { contains: location, mode: 'insensitive' }
    }
    if (type) {
      where.type = type
    }

    // Fetch job postings from database
    const jobs = await prisma.jobPosting.findMany({
      where,
      orderBy: [
        { isFeatured: 'desc' },
        { createdAt: 'desc' }
      ],
      select: {
        id: true,
        title: true,
        department: true,
        location: true,
        type: true,
        description: true,
        requirements: true,
        responsibilities: true,
        salaryMin: true,
        salaryMax: true,
        salaryPeriod: true,
        showSalary: true,
        equity: true,
        isActive: true,
        isFeatured: true,
        openPositions: true,
        applicationCount: true,
        createdAt: true,
        closingDate: true
      }
    })

    // Get department counts for filters
    const departmentCounts = await prisma.jobPosting.groupBy({
      by: ['department'],
      where: { isActive: true },
      _count: true
    })

    // Get location counts for filters  
    const locationCounts = await prisma.jobPosting.groupBy({
      by: ['location'],
      where: { isActive: true },
      _count: true
    })

    // Format response
    const response = {
      success: true,
      jobs: jobs.map(job => ({
        ...job,
        salaryRange: job.showSalary && job.salaryMin && job.salaryMax
          ? `$${(job.salaryMin / 1000).toFixed(0)}k - $${(job.salaryMax / 1000).toFixed(0)}k${job.equity ? ' + equity' : ''}`
          : job.equity || 'Competitive',
        applicantCount: job.applicationCount || 0
      })),
      filters: {
        departments: departmentCounts.map(d => ({
          name: d.department,
          count: d._count
        })),
        locations: locationCounts.map(l => ({
          name: l.location,
          count: l._count
        })),
        totalJobs: jobs.length
      }
    }

    return NextResponse.json(response)

  } catch (error) {
    console.error('Failed to fetch job postings:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to load job postings' 
      },
      { status: 500 }
    )
  }
}

// POST - Create a new job posting (Admin only - add auth later)
export async function POST(request: NextRequest) {
  try {
    // TODO: Add authentication check here
    // if (!isAdmin) return unauthorized response

    const data = await request.json()

    // Validate required fields
    if (!data.title || !data.department || !data.location || !data.type) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Missing required fields' 
        },
        { status: 400 }
      )
    }

    // Create job posting
    const job = await prisma.jobPosting.create({
      data: {
        title: data.title,
        department: data.department,
        location: data.location,
        type: data.type,
        description: data.description || '',
        requirements: data.requirements || '',
        responsibilities: data.responsibilities || '',
        salaryMin: data.salaryMin || null,
        salaryMax: data.salaryMax || null,
        salaryPeriod: data.salaryPeriod || 'yearly',
        showSalary: data.showSalary !== false,
        equity: data.equity || null,
        isActive: data.isActive !== false,
        isFeatured: data.isFeatured || false,
        openPositions: data.openPositions || 1,
        closingDate: data.closingDate ? new Date(data.closingDate) : null
      }
    })

    return NextResponse.json({
      success: true,
      job
    })

  } catch (error) {
    console.error('Failed to create job posting:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create job posting' 
      },
      { status: 500 }
    )
  }
}