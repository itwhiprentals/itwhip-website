// app/api/partner/revenue/chart/route.ts
import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET!
)

export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    // Accept both partner_token AND hostAccessToken for unified portal
    const token = cookieStore.get('partner_token')?.value ||
                  cookieStore.get('hostAccessToken')?.value

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const { searchParams } = new URL(request.url)
    const months = parseInt(searchParams.get('months') || '6')

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId },
      include: { cars: { select: { id: true } } }
    })

    if (!partner) {
      return NextResponse.json({ error: 'Partner not found' }, { status: 404 })
    }

    const vehicleIds = partner.cars.map(c => c.id)
    const commissionRate = partner.currentCommissionRate || 0.25

    // Get bookings for last N months
    const startDate = new Date()
    startDate.setMonth(startDate.getMonth() - months)

    const bookings = await prisma.rentalBooking.findMany({
      where: {
        carId: { in: vehicleIds },
        status: 'COMPLETED',
        createdAt: { gte: startDate }
      },
      select: {
        totalAmount: true,
        createdAt: true
      }
    })

    // Group by month
    const chartData: { month: string; gross: number; net: number; commission: number }[] = []

    for (let i = months - 1; i >= 0; i--) {
      const date = new Date()
      date.setMonth(date.getMonth() - i)
      const monthKey = date.toLocaleString('en-US', { month: 'short' })
      const monthNum = date.getMonth()
      const yearNum = date.getFullYear()

      const monthBookings = bookings.filter(b => {
        const bookingDate = new Date(b.createdAt)
        return bookingDate.getMonth() === monthNum && bookingDate.getFullYear() === yearNum
      })

      const gross = monthBookings.reduce((sum, b) => sum + b.totalAmount, 0)
      const commission = gross * commissionRate
      const net = gross - commission

      chartData.push({ month: monthKey, gross, net, commission })
    }

    return NextResponse.json({
      success: true,
      data: chartData
    })
  } catch (error) {
    console.error('[Partner Revenue Chart] Error:', error)
    return NextResponse.json({ error: 'Failed to fetch chart data' }, { status: 500 })
  }
}
