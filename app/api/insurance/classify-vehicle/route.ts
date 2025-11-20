// app/api/insurance/classify-vehicle/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { classifyVehicle, updateVehicleClassification } from '@/app/lib/insurance/classification-service'
import { checkVehicleEligibility } from '@/app/lib/insurance/eligibility-engine'
import prisma from '@/app/lib/database/prisma'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { make, model, year, trim, carId, providerId } = body
    
    // Validate required fields
    if (!make || !model || !year) {
      return NextResponse.json(
        { error: 'Make, model, and year are required' },
        { status: 400 }
      )
    }
    
    // Classify the vehicle
    const classification = await classifyVehicle({
      make,
      model,
      year: parseInt(year),
      trim
    })
    
    // If carId provided, update the car with classification
    if (carId) {
      const car = await prisma.rentalCar.findUnique({
        where: { id: carId }
      })
      
      if (car) {
        // Update car with classification data
        await prisma.rentalCar.update({
          where: { id: carId },
          data: {
            classificationId: classification.classificationId,
            insuranceEligible: classification.isInsurable,
            insuranceCategory: classification.category,
            insuranceRiskLevel: classification.riskLevel,
            estimatedValue: classification.estimatedValue,
            requiresManualUnderwriting: classification.requiresManualReview,
            insuranceNotes: classification.insurabilityReason
          }
        })
        
        // Check eligibility with provider if specified
        const eligibility = await checkVehicleEligibility(
          { ...car, classificationId: classification.classificationId },
          providerId
        )
        
        return NextResponse.json({
          classification,
          eligibility,
          carUpdated: true
        })
      }
    }
    
    // Return just classification if no car to update
    return NextResponse.json({
      classification,
      carUpdated: false
    })
    
  } catch (error) {
    console.error('Vehicle classification error:', error)
    return NextResponse.json(
      { error: 'Failed to classify vehicle' },
      { status: 500 }
    )
  }
}

// GET - Get classification for existing vehicle
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const carId = searchParams.get('carId')
    const make = searchParams.get('make')
    const model = searchParams.get('model')
    const year = searchParams.get('year')
    
    // Get classification for specific car
    if (carId) {
      const car = await prisma.rentalCar.findUnique({
        where: { id: carId },
        include: {
          classification: true
        }
      })
      
      if (!car) {
        return NextResponse.json(
          { error: 'Car not found' },
          { status: 404 }
        )
      }
      
      // If car has classification, return it
      if (car.classification) {
        const eligibility = await checkVehicleEligibility(car)
        
        return NextResponse.json({
          classification: {
            category: car.classification.category,
            riskLevel: car.classification.riskLevel,
            estimatedValue: Number(car.classification.currentValue),
            baseRateMultiplier: Number(car.classification.baseRateMultiplier),
            riskMultiplier: Number(car.classification.riskMultiplier),
            features: (car.classification.features as any)?.features || [],
            isInsurable: car.classification.isInsurable,
            insurabilityReason: car.classification.insurabilityReason,
            requiresManualReview: car.classification.requiresManualReview,
            classificationId: car.classification.id
          },
          eligibility
        })
      }
      
      // Classify if not already classified
      const classification = await classifyVehicle({
        make: car.make,
        model: car.model,
        year: car.year,
        trim: car.trim || undefined
      })
      
      // Update car with classification
      await prisma.rentalCar.update({
        where: { id: carId },
        data: {
          classificationId: classification.classificationId,
          insuranceEligible: classification.isInsurable,
          insuranceCategory: classification.category,
          insuranceRiskLevel: classification.riskLevel,
          estimatedValue: classification.estimatedValue,
          requiresManualUnderwriting: classification.requiresManualReview
        }
      })
      
      const eligibility = await checkVehicleEligibility(
        { ...car, classificationId: classification.classificationId }
      )
      
      return NextResponse.json({
        classification,
        eligibility
      })
    }
    
    // Get classification by make/model/year
    if (make && model && year) {
      const existingClassification = await prisma.vehicleClassification.findFirst({
        where: {
          make,
          model,
          year: parseInt(year),
          providerId: null
        }
      })
      
      if (existingClassification) {
        return NextResponse.json({
          classification: {
            category: existingClassification.category,
            riskLevel: existingClassification.riskLevel,
            estimatedValue: Number(existingClassification.currentValue),
            baseRateMultiplier: Number(existingClassification.baseRateMultiplier),
            riskMultiplier: Number(existingClassification.riskMultiplier),
            features: (existingClassification.features as any)?.features || [],
            isInsurable: existingClassification.isInsurable,
            insurabilityReason: existingClassification.insurabilityReason,
            requiresManualReview: existingClassification.requiresManualReview,
            classificationId: existingClassification.id
          }
        })
      }
      
      // Create new classification
      const classification = await classifyVehicle({
        make,
        model,
        year: parseInt(year)
      })
      
      return NextResponse.json({ classification })
    }
    
    return NextResponse.json(
      { error: 'Either carId or make/model/year required' },
      { status: 400 }
    )
    
  } catch (error) {
    console.error('Get classification error:', error)
    return NextResponse.json(
      { error: 'Failed to get classification' },
      { status: 500 }
    )
  }
}

// PATCH - Update classification
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json()
    const { classificationId, updates } = body
    
    if (!classificationId) {
      return NextResponse.json(
        { error: 'Classification ID required' },
        { status: 400 }
      )
    }
    
    const updatedClassification = await updateVehicleClassification(
      classificationId,
      updates
    )
    
    // Update any cars using this classification
    await prisma.rentalCar.updateMany({
      where: { classificationId },
      data: {
        insuranceEligible: updatedClassification.isInsurable,
        insuranceCategory: updatedClassification.category,
        insuranceRiskLevel: updatedClassification.riskLevel,
        estimatedValue: updatedClassification.estimatedValue,
        requiresManualUnderwriting: updatedClassification.requiresManualReview,
        insuranceNotes: updatedClassification.insurabilityReason
      }
    })
    
    return NextResponse.json({
      classification: updatedClassification,
      message: 'Classification updated successfully'
    })
    
  } catch (error) {
    console.error('Update classification error:', error)
    return NextResponse.json(
      { error: 'Failed to update classification' },
      { status: 500 }
    )
  }
}