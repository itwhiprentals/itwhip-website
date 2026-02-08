// app/api/host/earnings/report/route.ts

import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/app/lib/database/prisma'
import { headers } from 'next/headers'
import { 
  PLATFORM_COMMISSION,
  HOST_PROTECTION_PLANS,
  PAYOUT_CONFIG
} from '@/app/fleet/financial-constants'

// Helper to get host from headers
async function getHostFromHeaders() {
  const headersList = await headers()
  const hostId = headersList.get('x-host-id')
  const userId = headersList.get('x-user-id')
  
  if (!hostId && !userId) return null
  
  const host = await prisma.rentalHost.findFirst({
    where: hostId ? { id: hostId } : { userId: userId }
  })
  
  return host
}

// Helper to format date for CSV
function formatDate(date: Date | null): string {
  if (!date) return ''
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  })
}

// Helper to format currency
function formatCurrency(amount: number): string {
  return amount.toFixed(2)
}

export async function GET(request: NextRequest) {
  try {
    const host = await getHostFromHeaders()
    
    if (!host) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Check if host is approved
    if (host.approvalStatus !== 'APPROVED') {
      return NextResponse.json(
        { error: 'Only approved hosts can generate reports' },
        { status: 403 }
      )
    }

    // Get query parameters for date range
    const searchParams = request.nextUrl.searchParams
    const period = searchParams.get('period') || 'month'
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')
    const reportType = searchParams.get('type') || 'summary' // summary, detailed, tax

    // Calculate date range based on period
    let dateFilter: any = {}
    let payoutDateFilter: any = {}
    const now = new Date()
    
    if (startDate && endDate) {
      dateFilter = {
        tripEndedAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
      payoutDateFilter = {
        createdAt: {
          gte: new Date(startDate),
          lte: new Date(endDate)
        }
      }
    } else {
      switch (period) {
        case 'week':
          const weekAgo = new Date()
          weekAgo.setDate(weekAgo.getDate() - 7)
          dateFilter = { tripEndedAt: { gte: weekAgo } }
          payoutDateFilter = { createdAt: { gte: weekAgo } }
          break
        case 'month':
          const monthAgo = new Date()
          monthAgo.setMonth(monthAgo.getMonth() - 1)
          dateFilter = { tripEndedAt: { gte: monthAgo } }
          payoutDateFilter = { createdAt: { gte: monthAgo } }
          break
        case 'quarter':
          const quarterAgo = new Date()
          quarterAgo.setMonth(quarterAgo.getMonth() - 3)
          dateFilter = { tripEndedAt: { gte: quarterAgo } }
          payoutDateFilter = { createdAt: { gte: quarterAgo } }
          break
        case 'year':
          const yearAgo = new Date()
          yearAgo.setFullYear(yearAgo.getFullYear() - 1)
          dateFilter = { tripEndedAt: { gte: yearAgo } }
          payoutDateFilter = { createdAt: { gte: yearAgo } }
          break
        case 'ytd':
          const yearStart = new Date(now.getFullYear(), 0, 1)
          dateFilter = { tripEndedAt: { gte: yearStart } }
          payoutDateFilter = { createdAt: { gte: yearStart } }
          break
        case 'all':
        default:
          dateFilter = {}
          payoutDateFilter = {}
      }
    }

    // Get bookings with earnings data
    const bookings = await prisma.rentalBooking.findMany({
      where: {
        hostId: host.id,
        status: 'COMPLETED' as any,
        tripStatus: 'COMPLETED' as any,
        paymentStatus: 'PAID' as any,
        ...dateFilter
      },
      include: {
        car: {
          select: {
            make: true,
            model: true,
            year: true,
            licensePlate: true
          }
        },
        tripCharges: true,
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        tripEndedAt: 'desc'
      }
    }) as any[]

    // Get host's commission rate
    const protectionPlan = host.protectionPlan || 'BASIC'
    const commissionRate = (HOST_PROTECTION_PLANS as any)[protectionPlan]?.commission || PLATFORM_COMMISSION

    // Get payouts for the same period - fixed to use correct date filter
    const payouts = await prisma.rentalPayout.findMany({
      where: {
        hostId: host.id,
        ...payoutDateFilter
      },
      orderBy: {
        createdAt: 'desc'
      }
    })

    // Generate CSV based on report type
    let csvContent = ''
    let filename = ''

    if (reportType === 'detailed') {
      // Detailed transaction report
      csvContent = 'Date,Booking ID,Guest Name,Car,Days,Gross Amount,Platform Fee,Processing Fee,Net Earnings,Additional Charges,Payout Status,Payout Date\n'
      
      for (const booking of bookings) {
        const bookingAmount = Number(booking.totalAmount || 0)
        const platformFee = bookingAmount * commissionRate
        const processingFee = (bookingAmount * PAYOUT_CONFIG.PROCESSING_FEE_PERCENT) + PAYOUT_CONFIG.PROCESSING_FEE_FIXED
        const additionalCharges = booking.tripCharges.reduce((sum: any, charge: any) =>
          sum + Number(charge.finalAmount || 0), 0
        )
        const netEarnings = bookingAmount - platformFee - processingFee + additionalCharges
        
        const tripDays = booking.startDate && booking.endDate ? 
          Math.ceil((new Date(booking.endDate).getTime() - new Date(booking.startDate).getTime()) / (1000 * 60 * 60 * 24)) : 0
        
        const guestName = booking.guestName || 'Guest'
        const carName = booking.car ? `${booking.car.year} ${booking.car.make} ${booking.car.model}` : 'N/A'
        const payoutStatus = booking.payoutProcessed ? 'Paid' : 'Pending'
        const payoutDate = booking.payoutProcessed && booking.updatedAt ? formatDate(booking.updatedAt) : ''
        
        csvContent += `${formatDate(booking.tripEndedAt)},${booking.bookingCode},${guestName},"${carName}",${tripDays},${formatCurrency(bookingAmount)},${formatCurrency(platformFee)},${formatCurrency(processingFee)},${formatCurrency(netEarnings)},${formatCurrency(additionalCharges)},${payoutStatus},${payoutDate}\n`
      }
      
      filename = `earnings-detailed-${period}-${new Date().getTime()}.csv`
      
    } else if (reportType === 'tax') {
      // Tax report (simplified for 1099)
      csvContent = 'Period,Total Gross Earnings,Platform Fees,Processing Fees,Net Earnings,Total Payouts Received\n'
      
      const totalGross = bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)
      const totalPlatformFees = totalGross * commissionRate
      const totalProcessingFees = bookings.length * PAYOUT_CONFIG.PROCESSING_FEE_FIXED + 
                                  (totalGross * PAYOUT_CONFIG.PROCESSING_FEE_PERCENT)
      const totalNet = totalGross - totalPlatformFees - totalProcessingFees
      const totalPayouts = payouts.reduce((sum, p) => sum + Number(p.netPayout || 0), 0)
      
      const periodLabel = startDate && endDate ? 
        `${startDate} to ${endDate}` : 
        `${period.charAt(0).toUpperCase() + period.slice(1)}`
      
      csvContent += `"${periodLabel}",${formatCurrency(totalGross)},${formatCurrency(totalPlatformFees)},${formatCurrency(totalProcessingFees)},${formatCurrency(totalNet)},${formatCurrency(totalPayouts)}\n`
      
      // Add monthly breakdown if year or YTD
      if (period === 'year' || period === 'ytd') {
        csvContent += '\nMonthly Breakdown:\nMonth,Gross Earnings,Net Earnings,Bookings\n'
        
        // Group by month
        const monthlyData: { [key: string]: { gross: number, net: number, count: number } } = {}
        
        for (const booking of bookings) {
          const month = booking.tripEndedAt ? 
            new Date(booking.tripEndedAt).toLocaleDateString('en-US', { year: 'numeric', month: 'short' }) : 
            'Unknown'
          
          if (!monthlyData[month]) {
            monthlyData[month] = { gross: 0, net: 0, count: 0 }
          }
          
          const bookingAmount = Number(booking.totalAmount || 0)
          const fees = (bookingAmount * commissionRate) + 
                      (bookingAmount * PAYOUT_CONFIG.PROCESSING_FEE_PERCENT) + 
                      PAYOUT_CONFIG.PROCESSING_FEE_FIXED
          
          monthlyData[month].gross += bookingAmount
          monthlyData[month].net += bookingAmount - fees
          monthlyData[month].count += 1
        }
        
        for (const [month, data] of Object.entries(monthlyData)) {
          csvContent += `${month},${formatCurrency(data.gross)},${formatCurrency(data.net)},${data.count}\n`
        }
      }
      
      filename = `tax-report-${period}-${new Date().getTime()}.csv`
      
    } else {
      // Summary report (default)
      csvContent = 'Summary Report\n\n'
      csvContent += `Host:,${host.name}\n`
      csvContent += `Email:,${host.email}\n`
      csvContent += `Report Period:,${period}\n`
      csvContent += `Generated:,${new Date().toLocaleDateString()}\n\n`
      
      csvContent += 'Metrics,Value\n'
      
      const totalGross = bookings.reduce((sum, b) => sum + Number(b.totalAmount || 0), 0)
      const totalPlatformFees = totalGross * commissionRate
      const totalProcessingFees = bookings.length * PAYOUT_CONFIG.PROCESSING_FEE_FIXED + 
                                  (totalGross * PAYOUT_CONFIG.PROCESSING_FEE_PERCENT)
      const totalAdditional = bookings.reduce((sum: any, b: any) =>
        sum + b.tripCharges.reduce((s: any, c: any) => s + Number(c.finalAmount || 0), 0), 0
      )
      const totalNet = totalGross - totalPlatformFees - totalProcessingFees + totalAdditional
      const avgBookingValue = bookings.length > 0 ? totalGross / bookings.length : 0
      const totalMessages = bookings.reduce((sum, b) => sum + b._count.messages, 0)
      
      csvContent += `Total Bookings,${bookings.length}\n`
      csvContent += `Gross Earnings,$${formatCurrency(totalGross)}\n`
      csvContent += `Platform Fees (${(commissionRate * 100).toFixed(0)}%),$${formatCurrency(totalPlatformFees)}\n`
      csvContent += `Processing Fees,$${formatCurrency(totalProcessingFees)}\n`
      csvContent += `Additional Charges,$${formatCurrency(totalAdditional)}\n`
      csvContent += `Net Earnings,$${formatCurrency(totalNet)}\n`
      csvContent += `Average Booking Value,$${formatCurrency(avgBookingValue)}\n`
      csvContent += `Total Messages,${totalMessages}\n`
      csvContent += `Payouts Processed,${payouts.length}\n`
      
      // Add top performing cars
      csvContent += '\nTop Performing Cars:\n'
      csvContent += 'Car,Bookings,Revenue\n'
      
      const carStats: { [key: string]: { count: number, revenue: number } } = {}
      for (const booking of bookings) {
        if (booking.car) {
          const carName = `${booking.car.year} ${booking.car.make} ${booking.car.model}`
          if (!carStats[carName]) {
            carStats[carName] = { count: 0, revenue: 0 }
          }
          carStats[carName].count += 1
          carStats[carName].revenue += Number(booking.totalAmount || 0)
        }
      }
      
      const topCars = Object.entries(carStats)
        .sort((a, b) => b[1].revenue - a[1].revenue)
        .slice(0, 5)
      
      for (const [carName, stats] of topCars) {
        csvContent += `"${carName}",${stats.count},$${formatCurrency(stats.revenue)}\n`
      }
      
      filename = `earnings-summary-${period}-${new Date().getTime()}.csv`
    }

    // Log report generation
    await prisma.activityLog.create({
      data: {
        action: 'REPORT_GENERATED',
        entityType: 'earnings_report',
        entityId: host.id,
        metadata: {
          reportType: reportType,
          period: period,
          bookingCount: bookings.length
        }
      } as any
    })

    // Return CSV file
    return new NextResponse(csvContent, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv',
        'Content-Disposition': `attachment; filename="${filename}"`,
        'Cache-Control': 'no-cache'
      }
    })

  } catch (error) {
    console.error('Report generation error:', error)
    return NextResponse.json(
      { error: 'Failed to generate report' },
      { status: 500 }
    )
  }
}