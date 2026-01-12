// app/api/partner/export/route.ts
// Partner Export API - Export data to CSV

import { NextRequest, NextResponse } from 'next/server'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

async function getPartnerFromToken() {
  const cookieStore = await cookies()
  const token = cookieStore.get('partner_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const hostId = payload.hostId as string

    const partner = await prisma.rentalHost.findUnique({
      where: { id: hostId }
    })

    if (!partner || (partner.hostType !== 'FLEET_PARTNER' && partner.hostType !== 'PARTNER')) {
      return null
    }

    return partner
  } catch {
    return null
  }
}

function escapeCsvValue(value: any): string {
  if (value === null || value === undefined) return ''
  const str = String(value)
  // Escape quotes and wrap in quotes if contains comma, newline, or quote
  if (str.includes(',') || str.includes('\n') || str.includes('"')) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

function generateCsv(headers: string[], rows: any[][]): string {
  const headerLine = headers.map(escapeCsvValue).join(',')
  const dataLines = rows.map(row => row.map(escapeCsvValue).join(','))
  return [headerLine, ...dataLines].join('\n')
}

export async function GET(request: NextRequest) {
  try {
    const partner = await getPartnerFromToken()

    if (!partner) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { searchParams } = new URL(request.url)
    const type = searchParams.get('type') // bookings, fleet, revenue, payouts, reviews, customers
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    if (!type) {
      return NextResponse.json({ error: 'Export type is required' }, { status: 400 })
    }

    // Get partner's vehicle IDs
    const vehicles = await prisma.rentalCar.findMany({
      where: { hostId: partner.id },
      select: { id: true, make: true, model: true, year: true, vin: true, licensePlate: true }
    })
    const vehicleIds = vehicles.map(v => v.id)
    const vehicleMap = new Map(vehicles.map(v => [v.id, v]))

    let csv = ''
    let filename = ''

    const dateFilter = {
      ...(startDate && { gte: new Date(startDate) }),
      ...(endDate && { lte: new Date(endDate) })
    }

    switch (type) {
      case 'bookings': {
        const bookings = await prisma.rentalBooking.findMany({
          where: {
            carId: { in: vehicleIds },
            ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
          },
          include: {
            rentalCar: {
              select: { make: true, model: true, year: true }
            },
            user: {
              select: { firstName: true, lastName: true, email: true }
            }
          },
          orderBy: { createdAt: 'desc' }
        })

        const headers = [
          'Booking Code', 'Status', 'Guest Name', 'Guest Email',
          'Vehicle', 'Start Date', 'End Date', 'Total Amount',
          'Created At'
        ]

        const rows = bookings.map(b => [
          b.bookingCode || b.id.slice(0, 8),
          b.status,
          b.user ? `${b.user.firstName || ''} ${b.user.lastName || ''}`.trim() : b.guestName || '',
          b.user?.email || b.guestEmail || '',
          b.rentalCar ? `${b.rentalCar.year} ${b.rentalCar.make} ${b.rentalCar.model}` : '',
          b.startDate ? new Date(b.startDate).toLocaleDateString() : '',
          b.endDate ? new Date(b.endDate).toLocaleDateString() : '',
          b.totalAmount || 0,
          new Date(b.createdAt).toLocaleDateString()
        ])

        csv = generateCsv(headers, rows)
        filename = `bookings_export_${new Date().toISOString().split('T')[0]}.csv`
        break
      }

      case 'fleet': {
        const fleet = await prisma.rentalCar.findMany({
          where: { hostId: partner.id },
          orderBy: { createdAt: 'desc' }
        })

        const headers = [
          'Vehicle', 'Year', 'Make', 'Model', 'VIN', 'License Plate',
          'Status', 'Daily Rate', 'Weekly Rate', 'Monthly Rate',
          'Current Mileage', 'Vehicle Type', 'Created At'
        ]

        const rows = fleet.map(v => [
          `${v.year} ${v.make} ${v.model}`,
          v.year,
          v.make,
          v.model,
          v.vin || '',
          v.licensePlate || '',
          v.status,
          v.dailyRate || 0,
          v.weeklyRate || 0,
          v.monthlyRate || 0,
          v.currentMileage || 0,
          v.vehicleType || 'RENTAL',
          new Date(v.createdAt).toLocaleDateString()
        ])

        csv = generateCsv(headers, rows)
        filename = `fleet_export_${new Date().toISOString().split('T')[0]}.csv`
        break
      }

      case 'revenue': {
        const bookings = await prisma.rentalBooking.findMany({
          where: {
            carId: { in: vehicleIds },
            status: 'COMPLETED',
            ...(Object.keys(dateFilter).length > 0 && { endDate: dateFilter })
          },
          include: {
            rentalCar: {
              select: { make: true, model: true, year: true }
            },
            user: {
              select: { firstName: true, lastName: true }
            }
          },
          orderBy: { endDate: 'desc' }
        })

        const commissionRate = partner.currentCommissionRate || 0.25

        const headers = [
          'Booking Code', 'Guest', 'Vehicle', 'Completed Date',
          'Gross Revenue', 'Commission', 'Net Revenue'
        ]

        const rows = bookings.map(b => {
          const gross = b.totalAmount || 0
          const commission = gross * commissionRate
          const net = gross - commission
          return [
            b.bookingCode || b.id.slice(0, 8),
            b.user ? `${b.user.firstName || ''} ${b.user.lastName || ''}`.trim() : b.guestName || '',
            b.rentalCar ? `${b.rentalCar.year} ${b.rentalCar.make} ${b.rentalCar.model}` : '',
            b.endDate ? new Date(b.endDate).toLocaleDateString() : '',
            gross.toFixed(2),
            commission.toFixed(2),
            net.toFixed(2)
          ]
        })

        csv = generateCsv(headers, rows)
        filename = `revenue_export_${new Date().toISOString().split('T')[0]}.csv`
        break
      }

      case 'payouts': {
        const payouts = await prisma.partnerPayout.findMany({
          where: {
            hostId: partner.id,
            ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
          },
          orderBy: { createdAt: 'desc' }
        })

        const headers = [
          'Period', 'Bookings', 'Gross Revenue', 'Commission',
          'Net Payout', 'Status', 'Paid Date', 'Created Date'
        ]

        const rows = payouts.map(p => [
          p.period,
          p.bookingCount,
          p.grossRevenue.toFixed(2),
          p.commission.toFixed(2),
          p.netAmount.toFixed(2),
          p.status,
          p.paidAt ? new Date(p.paidAt).toLocaleDateString() : '',
          new Date(p.createdAt).toLocaleDateString()
        ])

        csv = generateCsv(headers, rows)
        filename = `payouts_export_${new Date().toISOString().split('T')[0]}.csv`
        break
      }

      case 'reviews': {
        const reviews = await prisma.rentalReview.findMany({
          where: {
            booking: {
              carId: { in: vehicleIds }
            },
            ...(Object.keys(dateFilter).length > 0 && { createdAt: dateFilter })
          },
          include: {
            booking: {
              include: {
                rentalCar: {
                  select: { make: true, model: true, year: true }
                },
                user: {
                  select: { firstName: true, lastName: true }
                }
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        })

        const headers = [
          'Date', 'Guest', 'Vehicle', 'Rating', 'Review',
          'Host Response', 'Response Date'
        ]

        const rows = reviews.map(r => [
          new Date(r.createdAt).toLocaleDateString(),
          r.booking?.user ? `${r.booking.user.firstName || ''} ${r.booking.user.lastName || ''}`.trim() : '',
          r.booking?.rentalCar ? `${r.booking.rentalCar.year} ${r.booking.rentalCar.make} ${r.booking.rentalCar.model}` : '',
          r.rating,
          r.review || '',
          r.hostResponse || '',
          r.hostRespondedAt ? new Date(r.hostRespondedAt).toLocaleDateString() : ''
        ])

        csv = generateCsv(headers, rows)
        filename = `reviews_export_${new Date().toISOString().split('T')[0]}.csv`
        break
      }

      case 'customers': {
        // Get unique guests from bookings
        const bookings = await prisma.rentalBooking.findMany({
          where: {
            carId: { in: vehicleIds }
          },
          include: {
            user: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                email: true,
                phoneNumber: true
              }
            }
          }
        })

        // Aggregate customer data
        const customerMap = new Map<string, {
          id: string
          name: string
          email: string
          phone: string
          bookingCount: number
          totalSpent: number
          lastBooking: Date
        }>()

        bookings.forEach(b => {
          const key = b.user?.id || b.guestEmail || ''
          if (!key) return

          const existing = customerMap.get(key)
          const name = b.user
            ? `${b.user.firstName || ''} ${b.user.lastName || ''}`.trim()
            : b.guestName || ''
          const email = b.user?.email || b.guestEmail || ''
          const phone = b.user?.phoneNumber || b.guestPhone || ''

          if (existing) {
            existing.bookingCount++
            existing.totalSpent += b.totalAmount || 0
            if (new Date(b.createdAt) > existing.lastBooking) {
              existing.lastBooking = new Date(b.createdAt)
            }
          } else {
            customerMap.set(key, {
              id: key,
              name,
              email,
              phone,
              bookingCount: 1,
              totalSpent: b.totalAmount || 0,
              lastBooking: new Date(b.createdAt)
            })
          }
        })

        const customers = Array.from(customerMap.values())
          .sort((a, b) => b.totalSpent - a.totalSpent)

        const headers = [
          'Name', 'Email', 'Phone', 'Total Bookings',
          'Total Spent', 'Last Booking'
        ]

        const rows = customers.map(c => [
          c.name,
          c.email,
          c.phone,
          c.bookingCount,
          c.totalSpent.toFixed(2),
          c.lastBooking.toLocaleDateString()
        ])

        csv = generateCsv(headers, rows)
        filename = `customers_export_${new Date().toISOString().split('T')[0]}.csv`
        break
      }

      case 'maintenance': {
        const records = await prisma.vehicleServiceRecord.findMany({
          where: {
            carId: { in: vehicleIds },
            ...(Object.keys(dateFilter).length > 0 && { serviceDate: dateFilter })
          },
          include: {
            car: {
              select: { make: true, model: true, year: true }
            }
          },
          orderBy: { serviceDate: 'desc' }
        })

        const headers = [
          'Vehicle', 'Service Type', 'Service Date', 'Mileage',
          'Shop Name', 'Shop Address', 'Technician', 'Invoice #',
          'Cost', 'Next Due Date', 'Next Due Mileage', 'Notes'
        ]

        const rows = records.map(r => [
          r.car ? `${r.car.year} ${r.car.make} ${r.car.model}` : '',
          r.serviceType,
          new Date(r.serviceDate).toLocaleDateString(),
          r.mileageAtService,
          r.shopName || '',
          r.shopAddress || '',
          r.technicianName || '',
          r.invoiceNumber || '',
          r.costTotal?.toFixed(2) || '0.00',
          r.nextServiceDue ? new Date(r.nextServiceDue).toLocaleDateString() : '',
          r.nextServiceMileage || '',
          r.notes || ''
        ])

        csv = generateCsv(headers, rows)
        filename = `maintenance_export_${new Date().toISOString().split('T')[0]}.csv`
        break
      }

      default:
        return NextResponse.json({ error: 'Invalid export type' }, { status: 400 })
    }

    // Return CSV file
    return new NextResponse(csv, {
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`
      }
    })

  } catch (error) {
    console.error('[Partner Export] Error:', error)
    return NextResponse.json({ error: 'Failed to generate export' }, { status: 500 })
  }
}
