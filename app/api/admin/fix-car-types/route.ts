// app/api/admin/fix-car-types/route.ts
// Admin API to fix carType values for existing cars in database
// Run once to populate missing/incorrect carType values

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { getCarTypeFromDatabase, normalizeCarType } from '@/app/lib/utils/getCarType'

export async function POST(request: NextRequest) {
  try {
    // Verify admin access (you may want to add proper auth here)
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.ADMIN_API_KEY}`) {
      // For now, allow without auth in development
      if (process.env.NODE_ENV === 'production') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
    }

    // Get all cars without carType or with default 'SEDAN'
    const carsToFix = await prisma.rentalCar.findMany({
      where: {
        OR: [
          { carType: null as any },
          { carType: '' },
          { carType: 'OTHER' },
          { carType: 'UNKNOWN' }
        ]
      },
      select: {
        id: true,
        make: true,
        model: true,
        carType: true
      }
    })

    console.log(`Found ${carsToFix.length} cars to potentially fix`)

    const updates: { id: string; oldType: string | null; newType: string; make: string; model: string }[] = []
    const failures: { id: string; make: string; model: string; reason: string }[] = []

    for (const car of carsToFix) {
      const inferredType = getCarTypeFromDatabase(car.make, car.model)

      if (inferredType) {
        const normalizedType = normalizeCarType(inferredType)

        await prisma.rentalCar.update({
          where: { id: car.id },
          data: { carType: normalizedType }
        })

        updates.push({
          id: car.id,
          oldType: car.carType,
          newType: normalizedType,
          make: car.make,
          model: car.model
        })
      } else {
        failures.push({
          id: car.id,
          make: car.make,
          model: car.model,
          reason: 'Could not determine carType from database or patterns'
        })
      }
    }

    return NextResponse.json({
      success: true,
      summary: {
        totalProcessed: carsToFix.length,
        updated: updates.length,
        failed: failures.length
      },
      updates,
      failures
    })
  } catch (error) {
    console.error('Error fixing car types:', error)
    return NextResponse.json(
      { error: 'Failed to fix car types', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}

// GET endpoint to preview what would be fixed
export async function GET(request: NextRequest) {
  try {
    // Get all cars and check their carType
    const allCars = await prisma.rentalCar.findMany({
      where: { isActive: true },
      select: {
        id: true,
        make: true,
        model: true,
        carType: true
      },
      orderBy: { make: 'asc' }
    })

    // Analyze carType distribution
    const carTypeCount: Record<string, number> = {}
    const carsWithIssues: { id: string; make: string; model: string; currentType: string | null; suggestedType: string | null }[] = []

    for (const car of allCars) {
      const currentType = car.carType || 'NULL'
      carTypeCount[currentType] = (carTypeCount[currentType] || 0) + 1

      // Check if carType might be wrong
      const inferredType = getCarTypeFromDatabase(car.make, car.model)
      const normalizedInferred = inferredType ? normalizeCarType(inferredType) : null
      const normalizedCurrent = car.carType ? car.carType.toUpperCase() : null

      if (normalizedInferred && normalizedCurrent !== normalizedInferred) {
        carsWithIssues.push({
          id: car.id,
          make: car.make,
          model: car.model,
          currentType: car.carType,
          suggestedType: normalizedInferred
        })
      }
    }

    return NextResponse.json({
      success: true,
      totalCars: allCars.length,
      carTypeDistribution: carTypeCount,
      carsWithPotentialIssues: carsWithIssues.length,
      issues: carsWithIssues.slice(0, 50) // Show first 50 issues
    })
  } catch (error) {
    console.error('Error analyzing car types:', error)
    return NextResponse.json(
      { error: 'Failed to analyze car types', message: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    )
  }
}
