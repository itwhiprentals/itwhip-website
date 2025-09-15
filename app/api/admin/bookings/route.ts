import { NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'

export async function GET() {
  try {
    const bookings = await prisma.rentalBooking.findMany({
      include: {
        car: {
          include: {
            photos: true,
            host: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    return NextResponse.json({ 
      success: true,
      bookings 
    })
  } catch (error) {
    console.error('Error fetching bookings:', error)
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 })
  }
}