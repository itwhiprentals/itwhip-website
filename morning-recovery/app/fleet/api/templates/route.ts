// app/sys-2847/fleet/api/templates/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'

// Pre-defined templates for common luxury cars
const defaultTemplates = [
  {
    name: 'Lamborghini Huracan Template',
    data: {
      make: 'Lamborghini',
      model: 'Huracan',
      carType: 'CONVERTIBLE',
      seats: 2,
      doors: 2,
      transmission: 'AUTOMATIC',
      fuelType: 'PREMIUM',
      mpgCity: 14,
      mpgHighway: 21,
      dailyRate: 999,
      features: 'Convertible, Apple CarPlay, Bluetooth, Premium Sound, Leather Seats, Navigation, Backup Camera, Sport Mode, Carbon Fiber Interior',
      rules: "No smoking. Must be 25+ to book. Valid driver's license and insurance required. 200 miles/day included, $3/mile after."
    }
  },
  {
    name: 'Ferrari 488 Spider Template',
    data: {
      make: 'Ferrari',
      model: '488 Spider',
      carType: 'CONVERTIBLE',
      seats: 2,
      doors: 2,
      transmission: 'SEMI_AUTOMATIC',
      fuelType: 'PREMIUM',
      mpgCity: 15,
      mpgHighway: 22,
      dailyRate: 1299,
      features: 'Convertible, Racing Mode, Carbon Fiber, Premium Sound, Navigation, Sport Exhaust',
      rules: "No smoking. Must be 25+ to book. Valid driver's license and insurance required. 150 miles/day included, $4/mile after."
    }
  },
  {
    name: 'Tesla Model S Plaid Template',
    data: {
      make: 'Tesla',
      model: 'Model S Plaid',
      carType: 'SEDAN',
      seats: 5,
      doors: 4,
      transmission: 'AUTOMATIC',
      fuelType: 'ELECTRIC',
      mpgCity: 120,
      mpgHighway: 120,
      dailyRate: 599,
      features: 'Autopilot, Ludicrous Mode, Premium Audio, Glass Roof, Heated Seats, Gaming System',
      rules: "No smoking. Must be 21+ to book. Valid driver's license required. 250 miles/day included."
    }
  }
]

// GET - Fetch all templates
export async function GET(request: NextRequest) {
  try {
    // For now, return default templates
    // Later you can save custom templates to database
    return NextResponse.json({
      success: true,
      data: defaultTemplates
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to fetch templates' },
      { status: 500 }
    )
  }
}

// POST - Save custom template
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In production, save to database
    // For now, just return success
    return NextResponse.json({
      success: true,
      message: 'Template saved successfully',
      data: {
        name: body.name,
        data: body.data
      }
    })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: 'Failed to save template' },
      { status: 500 }
    )
  }
}