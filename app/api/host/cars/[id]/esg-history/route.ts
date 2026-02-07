// app/api/host/cars/[id]/esg-history/route.ts

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id: carId } = await params

    // TODO: Fetch ESG score history for charts

    return NextResponse.json({
      success: true,
      message: 'ESG History API - Coming soon'
    })
  } catch (error) {
    console.error('Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ESG history' },
      { status: 500 }
    )
  }
}