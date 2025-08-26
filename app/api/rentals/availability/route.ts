// app/api/rentals/availability/route.ts
import { NextRequest, NextResponse } from 'next/server'  // Remove "scholars"

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const carId = searchParams.get('carId')
  const startDate = searchParams.get('startDate')
  const endDate = searchParams.get('endDate')
  
  if (!carId || !startDate || !endDate) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    )
  }
  
  return NextResponse.json({ 
    available: true,
    carId,
    startDate,
    endDate,
    message: 'Car is available'
  })
}