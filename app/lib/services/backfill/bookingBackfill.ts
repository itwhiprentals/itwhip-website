// app/lib/services/backfill/bookingBackfill.ts
// Service to recalculate and backfill booking financials with correct values

import { PrismaClient } from '@prisma/client'
import { createCalculatorFromDatabase, FinancialCalculator } from '../financialCalculator'
import { BackfillResult, BackfillSummary } from '../types/financial'

interface BackfillOptions {
  dryRun: boolean
  includePayouts?: boolean  // NEW: Create RentalPayout records for completed bookings
  startDate?: Date
  endDate?: Date
  batchSize: number
  hostId?: string
}

interface PayoutBackfillResult {
  bookingId: string
  bookingCode: string
  hostId: string
  grossEarnings: number
  platformFee: number
  processingFee: number
  netPayout: number
  eligibleAt: Date
  status: 'created' | 'skipped' | 'error'
  error?: string
}

export interface PayoutBackfillSummary {
  payoutsCreated: number
  payoutsSkipped: number
  payoutErrors: number
  totalGrossEarnings: number
  totalPlatformFees: number
  totalProcessingFees: number
  totalNetPayouts: number
  hostsUpdated: number
  payoutResults: PayoutBackfillResult[]
}

interface BookingForBackfill {
  id: string
  bookingCode: string
  totalAmount: number
  subtotal: number
  serviceFee: number
  taxes: number
  deliveryFee: number
  insuranceFee: number
  dailyRate: number
  numberOfDays: number
  hostId: string
  car: {
    city: string
    state: string
  } | null
  host: {
    id: string
    _count: {
      cars: number
    }
  }
}

// Extended booking interface for payout backfill
interface BookingForPayout {
  id: string
  bookingCode: string
  status: string
  paymentStatus: string
  subtotal: number
  dailyRate: number
  numberOfDays: number
  startDate: Date
  endDate: Date
  hostId: string
  host: {
    id: string
    _count: {
      cars: number
    }
  }
  RentalPayout: { id: string }[]  // Relation name from schema
}

export class BookingBackfillService {
  private prisma: PrismaClient
  private calculator: FinancialCalculator | null = null

  constructor(prisma: PrismaClient) {
    this.prisma = prisma
  }

  private async getCalculator(): Promise<FinancialCalculator> {
    if (!this.calculator) {
      this.calculator = await createCalculatorFromDatabase(this.prisma)
    }
    return this.calculator
  }

  async backfillBookings(options: BackfillOptions): Promise<BackfillSummary> {
    const { dryRun, startDate, endDate, batchSize, hostId } = options

    const calculator = await this.getCalculator()

    // Build where clause
    const where: any = {}
    if (startDate) {
      where.createdAt = { ...where.createdAt, gte: startDate }
    }
    if (endDate) {
      where.createdAt = { ...where.createdAt, lte: endDate }
    }
    if (hostId) {
      where.hostId = hostId
    }

    // Get total count
    const totalCount = await this.prisma.rentalBooking.count({ where })

    const results: BackfillResult[] = []
    let processed = 0
    let updated = 0
    let skipped = 0
    let errors = 0
    let totalPlatformRevenue = 0
    let totalHostPayouts = 0
    let totalTaxesCollected = 0

    // Process in batches
    let skip = 0
    while (skip < totalCount) {
      const bookings = await this.prisma.rentalBooking.findMany({
        where,
        include: {
          car: {
            select: {
              city: true,
              state: true
            }
          },
          host: {
            select: {
              id: true,
              _count: {
                select: { cars: true }
              }
            }
          }
        },
        skip,
        take: batchSize,
        orderBy: { createdAt: 'asc' }
      }) as unknown as BookingForBackfill[]

      for (const booking of bookings) {
        try {
          const result = await this.processBooking(booking, calculator, dryRun)
          results.push(result)

          if (result.status === 'updated') {
            updated++
            // Sum up the recalculated values for summary
            const financials = calculator.calculateBookingFinancials({
              baseRental: Number(booking.subtotal) || Number(booking.dailyRate) * booking.numberOfDays,
              deliveryFee: Number(booking.deliveryFee) || 0,
              insuranceFee: Number(booking.insuranceFee) || 0,
              insuranceType: Number(booking.insuranceFee) > 0 ? 'basic' : 'none',
              numberOfDays: booking.numberOfDays,
              city: booking.car?.city || 'Phoenix',
              state: booking.car?.state || 'AZ',
              hostFleetSize: booking.host?._count?.cars || 1
            })
            totalPlatformRevenue += financials.totalPlatformRevenue
            totalHostPayouts += financials.hostNetPayout
            totalTaxesCollected += financials.taxesCollected
          } else if (result.status === 'skipped') {
            skipped++
          }
        } catch (error: any) {
          errors++
          results.push({
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            originalTotal: Number(booking.totalAmount),
            recalculatedTotal: 0,
            changes: [],
            status: 'error',
            error: error.message
          })
        }
        processed++
      }

      skip += batchSize
    }

    return {
      processed,
      updated,
      skipped,
      errors,
      totalPlatformRevenue,
      totalHostPayouts,
      totalTaxesCollected,
      results
    }
  }

  private async processBooking(
    booking: BookingForBackfill,
    calculator: FinancialCalculator,
    dryRun: boolean
  ): Promise<BackfillResult> {
    // Get base rental amount
    const baseRental = Number(booking.subtotal) || Number(booking.dailyRate) * booking.numberOfDays
    const deliveryFee = Number(booking.deliveryFee) || 0
    const insuranceFee = Number(booking.insuranceFee) || 0
    const city = booking.car?.city || 'Phoenix'
    const state = booking.car?.state || 'AZ'
    const fleetSize = booking.host?._count?.cars || 1

    // Calculate correct financials
    const financials = calculator.calculateBookingFinancials({
      baseRental,
      deliveryFee,
      insuranceFee,
      insuranceType: insuranceFee > 0 ? 'basic' : 'none',
      numberOfDays: booking.numberOfDays,
      city,
      state,
      hostFleetSize: fleetSize
    })

    // Compare with existing values
    const changes: { field: string; oldValue: number; newValue: number }[] = []

    const currentServiceFee = Number(booking.serviceFee) || 0
    const currentTaxes = Number(booking.taxes) || 0
    const currentTotal = Number(booking.totalAmount) || 0

    if (Math.abs(currentServiceFee - financials.guestServiceFee) > 0.01) {
      changes.push({
        field: 'serviceFee',
        oldValue: currentServiceFee,
        newValue: financials.guestServiceFee
      })
    }

    if (Math.abs(currentTaxes - financials.taxAmount) > 0.01) {
      changes.push({
        field: 'taxes',
        oldValue: currentTaxes,
        newValue: financials.taxAmount
      })
    }

    if (Math.abs(currentTotal - financials.guestTotal) > 0.01) {
      changes.push({
        field: 'totalAmount',
        oldValue: currentTotal,
        newValue: financials.guestTotal
      })
    }

    // If no changes needed, skip
    if (changes.length === 0) {
      return {
        bookingId: booking.id,
        bookingCode: booking.bookingCode,
        originalTotal: currentTotal,
        recalculatedTotal: financials.guestTotal,
        changes: [],
        status: 'skipped'
      }
    }

    // If not dry run, update the booking
    if (!dryRun) {
      await this.prisma.rentalBooking.update({
        where: { id: booking.id },
        data: {
          serviceFee: financials.guestServiceFee,
          taxes: financials.taxAmount,
          totalAmount: financials.guestTotal
        }
      })

      // Create audit log
      await this.prisma.activityLog.create({
        data: {
          id: `al_backfill_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
          entityType: 'RentalBooking',
          entityId: booking.id,
          action: 'BACKFILL_FINANCIALS',
          metadata: {
            changes,
            calculator: {
              taxRate: financials.taxRate,
              commissionRate: financials.commissionRate,
              commissionTier: financials.commissionTier.name
            },
            timestamp: new Date().toISOString()
          }
        }
      })
    }

    return {
      bookingId: booking.id,
      bookingCode: booking.bookingCode,
      originalTotal: currentTotal,
      recalculatedTotal: financials.guestTotal,
      changes,
      status: 'updated'
    }
  }

  async getBackfillPreview(options: Omit<BackfillOptions, 'dryRun'>): Promise<{
    totalBookings: number
    estimatedChanges: number
    sampleChanges: BackfillResult[]
  }> {
    const summary = await this.backfillBookings({
      ...options,
      dryRun: true,
      batchSize: Math.min(options.batchSize, 50) // Limit preview to 50 bookings
    })

    return {
      totalBookings: summary.processed,
      estimatedChanges: summary.updated,
      sampleChanges: summary.results.slice(0, 10)
    }
  }

  // ========================================
  // PAYOUT SIMULATION BACKFILL
  // ========================================

  /**
   * Create RentalPayout records for all completed bookings that don't have payouts.
   * Also updates host totals (totalPayoutsAmount, totalPayoutsCount, totalTrips).
   *
   * Payout Calculation:
   * - grossEarnings = booking.subtotal
   * - platformFee = grossEarnings × 25% (Standard tier)
   * - processingFee = $1.50 fixed
   * - netPayout = grossEarnings - platformFee - processingFee
   * - eligibleAt = tripEndDate + 3 days
   */
  async backfillPayouts(options: BackfillOptions): Promise<PayoutBackfillSummary> {
    const { dryRun, startDate, endDate, batchSize, hostId } = options

    const calculator = await this.getCalculator()

    // Build where clause for COMPLETED bookings
    // We'll filter out those with payouts in the loop instead of using { none: {} }
    // because Prisma's relation filter may not work as expected with empty relations
    const where: any = {
      status: 'COMPLETED',
      paymentStatus: 'PAID'
    }

    if (startDate) {
      where.endDate = { ...where.endDate, gte: startDate }
    }
    if (endDate) {
      where.endDate = { ...where.endDate, lte: endDate }
    }
    if (hostId) {
      where.hostId = hostId
    }

    // Get total count of eligible bookings
    const totalCount = await this.prisma.rentalBooking.count({ where })

    const payoutResults: PayoutBackfillResult[] = []
    let payoutsCreated = 0
    let payoutsSkipped = 0
    let payoutErrors = 0
    let totalGrossEarnings = 0
    let totalPlatformFees = 0
    let totalProcessingFees = 0
    let totalNetPayouts = 0

    // Track per-host totals for updating
    const hostPayoutTotals: Map<string, {
      payoutSum: number
      payoutCount: number
      tripCount: number
    }> = new Map()

    // Process in batches
    let skip = 0
    while (skip < totalCount) {
      const bookings = await this.prisma.rentalBooking.findMany({
        where,
        include: {
          host: {
            select: {
              id: true,
              _count: { select: { cars: true } }
            }
          },
          RentalPayout: { select: { id: true } }
        },
        skip,
        take: batchSize,
        orderBy: { endDate: 'asc' }
      }) as unknown as BookingForPayout[]

      for (const booking of bookings) {
        try {
          // Skip if already has a payout (double check)
          if (booking.RentalPayout && booking.RentalPayout.length > 0) {
            payoutsSkipped++
            payoutResults.push({
              bookingId: booking.id,
              bookingCode: booking.bookingCode,
              hostId: booking.hostId,
              grossEarnings: 0,
              platformFee: 0,
              processingFee: 0,
              netPayout: 0,
              eligibleAt: new Date(),
              status: 'skipped',
              error: 'Payout already exists'
            })
            continue
          }

          // Calculate payout amounts
          const grossEarnings = Number(booking.subtotal) || (Number(booking.dailyRate) * booking.numberOfDays)
          const fleetSize = booking.host?._count?.cars || 1
          const commissionRate = calculator.getHostCommissionRate(fleetSize)
          const platformFee = grossEarnings * commissionRate
          const processingFee = 1.50  // Fixed $1.50
          const netPayout = grossEarnings - platformFee - processingFee

          // Calculate eligibility date (3 days after trip end)
          const eligibleAt = new Date(booking.endDate)
          eligibleAt.setDate(eligibleAt.getDate() + 3)

          // For completed trips, processedAt = eligibleAt (simulating it was paid on time)
          const processedAt = eligibleAt

          if (!dryRun) {
            // Create the RentalPayout record
            await this.prisma.rentalPayout.create({
              data: {
                id: `payout_${booking.id}_${Date.now()}`,
                hostId: booking.hostId,
                amount: netPayout,
                currency: 'USD',
                status: 'COMPLETED',
                startDate: booking.startDate,
                endDate: booking.endDate,
                bookingCount: 1,
                grossEarnings: grossEarnings,
                platformFee: platformFee,
                processingFee: processingFee,
                netPayout: netPayout,
                paymentMethod: 'SIMULATED_BACKFILL',
                bookingId: booking.id,
                eligibleAt: eligibleAt,
                processedAt: processedAt,
                updatedAt: new Date()
              }
            })

            // Create audit log
            await this.prisma.activityLog.create({
              data: {
                id: `al_payout_backfill_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`,
                entityType: 'RentalPayout',
                entityId: booking.id,
                action: 'BACKFILL_PAYOUT_CREATED',
                metadata: {
                  bookingCode: booking.bookingCode,
                  grossEarnings,
                  platformFee,
                  processingFee,
                  netPayout,
                  commissionRate,
                  eligibleAt: eligibleAt.toISOString(),
                  timestamp: new Date().toISOString()
                }
              }
            })
          }

          // Track host totals
          const hostId = booking.hostId
          if (!hostPayoutTotals.has(hostId)) {
            hostPayoutTotals.set(hostId, { payoutSum: 0, payoutCount: 0, tripCount: 0 })
          }
          const hostTotals = hostPayoutTotals.get(hostId)!
          hostTotals.payoutSum += netPayout
          hostTotals.payoutCount += 1
          hostTotals.tripCount += 1

          // Update summary totals
          totalGrossEarnings += grossEarnings
          totalPlatformFees += platformFee
          totalProcessingFees += processingFee
          totalNetPayouts += netPayout
          payoutsCreated++

          payoutResults.push({
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            hostId: booking.hostId,
            grossEarnings,
            platformFee,
            processingFee,
            netPayout,
            eligibleAt,
            status: 'created'
          })

        } catch (error: any) {
          payoutErrors++
          payoutResults.push({
            bookingId: booking.id,
            bookingCode: booking.bookingCode,
            hostId: booking.hostId,
            grossEarnings: 0,
            platformFee: 0,
            processingFee: 0,
            netPayout: 0,
            eligibleAt: new Date(),
            status: 'error',
            error: error.message
          })
        }
      }

      skip += batchSize
    }

    // Update host totals
    let hostsUpdated = 0
    if (!dryRun) {
      for (const [hostId, totals] of hostPayoutTotals.entries()) {
        try {
          await this.prisma.rentalHost.update({
            where: { id: hostId },
            data: {
              totalPayoutsAmount: { increment: totals.payoutSum },
              totalPayoutsCount: { increment: totals.payoutCount },
              totalTrips: { increment: totals.tripCount }
            }
          })
          hostsUpdated++
        } catch (error: any) {
          console.error(`Failed to update host ${hostId}:`, error.message)
        }
      }
    } else {
      hostsUpdated = hostPayoutTotals.size
    }

    return {
      payoutsCreated,
      payoutsSkipped,
      payoutErrors,
      totalGrossEarnings,
      totalPlatformFees,
      totalProcessingFees,
      totalNetPayouts,
      hostsUpdated,
      payoutResults: payoutResults.slice(0, 50) // Limit results for response size
    }
  }

  // ========================================
  // SYNC HOST TOTALS FROM EXISTING PAYOUTS
  // ========================================

  /**
   * Updates host totalPayoutsAmount, totalPayoutsCount based on existing RentalPayout records.
   * Use this when payouts exist but host totals weren't properly updated.
   */
  async syncHostTotalsFromPayouts(dryRun: boolean = true): Promise<{
    hostsUpdated: number
    totalPayoutsSum: number
    totalPayoutsCount: number
    details: Array<{
      hostId: string
      hostName: string
      payoutSum: number
      payoutCount: number
      previousSum: number
      previousCount: number
    }>
  }> {
    // Aggregate all payouts by host
    const payoutsByHost = await this.prisma.rentalPayout.groupBy({
      by: ['hostId'],
      where: {
        status: { in: ['PAID', 'COMPLETED'] }
      },
      _sum: { netPayout: true },
      _count: { id: true }
    })

    let hostsUpdated = 0
    let totalPayoutsSum = 0
    let totalPayoutsCount = 0
    const details: Array<{
      hostId: string
      hostName: string
      payoutSum: number
      payoutCount: number
      previousSum: number
      previousCount: number
    }> = []

    for (const group of payoutsByHost) {
      const payoutSum = Number(group._sum.netPayout) || 0
      const payoutCount = group._count.id || 0

      totalPayoutsSum += payoutSum
      totalPayoutsCount += payoutCount

      // Get current host data
      const host = await this.prisma.rentalHost.findUnique({
        where: { id: group.hostId },
        select: {
          name: true,
          totalPayoutsAmount: true,
          totalPayoutsCount: true
        }
      })

      const previousSum = Number(host?.totalPayoutsAmount) || 0
      const previousCount = host?.totalPayoutsCount || 0

      details.push({
        hostId: group.hostId,
        hostName: host?.name || 'Unknown',
        payoutSum,
        payoutCount,
        previousSum,
        previousCount
      })

      if (!dryRun) {
        await this.prisma.rentalHost.update({
          where: { id: group.hostId },
          data: {
            totalPayoutsAmount: payoutSum,
            totalPayoutsCount: payoutCount
          }
        })
        hostsUpdated++
      } else {
        hostsUpdated++ // Count what would be updated in dry run
      }
    }

    return {
      hostsUpdated,
      totalPayoutsSum,
      totalPayoutsCount,
      details
    }
  }

  // ========================================
  // RECALCULATE HOST PAYOUTS FROM BOOKINGS
  // ========================================

  /**
   * Recalculates all host payouts based on their actual completed bookings.
   * Formula: netPayout = subtotal - (subtotal × 25%) - ($1.50 × bookingCount)
   *
   * This updates:
   * 1. Each RentalPayout record with correct amounts
   * 2. Each RentalHost's totalPayoutsAmount and totalPayoutsCount
   */
  async recalculateHostPayouts(dryRun: boolean = true): Promise<{
    hostsUpdated: number
    payoutsUpdated: number
    totalGrossEarnings: number
    totalPlatformFees: number
    totalProcessingFees: number
    totalNetPayouts: number
    previousTotalPayouts: number
    details: Array<{
      hostId: string
      hostName: string
      bookingCount: number
      grossEarnings: number
      platformFee: number
      processingFee: number
      netPayout: number
      previousPayout: number
      difference: number
    }>
  }> {
    const calculator = await this.getCalculator()

    // Get all hosts with completed bookings
    const bookingsByHost = await this.prisma.rentalBooking.groupBy({
      by: ['hostId'],
      where: { status: 'COMPLETED', paymentStatus: 'PAID' },
      _sum: { subtotal: true },
      _count: { id: true }
    })

    let hostsUpdated = 0
    let payoutsUpdated = 0
    let totalGrossEarnings = 0
    let totalPlatformFees = 0
    let totalProcessingFees = 0
    let totalNetPayouts = 0
    let previousTotalPayouts = 0

    const details: Array<{
      hostId: string
      hostName: string
      bookingCount: number
      grossEarnings: number
      platformFee: number
      processingFee: number
      netPayout: number
      previousPayout: number
      difference: number
    }> = []

    for (const group of bookingsByHost) {
      // Get host info
      const host = await this.prisma.rentalHost.findUnique({
        where: { id: group.hostId },
        select: {
          name: true,
          totalPayoutsAmount: true,
          totalPayoutsCount: true,
          _count: { select: { cars: true } }
        }
      })

      const grossEarnings = Number(group._sum.subtotal) || 0
      const bookingCount = group._count.id
      const fleetSize = host?._count?.cars || 1

      // Get commission rate based on fleet size
      const commissionRate = calculator.getHostCommissionRate(fleetSize)
      const platformFee = grossEarnings * commissionRate
      const processingFee = bookingCount * 1.50
      const netPayout = grossEarnings - platformFee - processingFee

      const previousPayout = Number(host?.totalPayoutsAmount) || 0
      const difference = netPayout - previousPayout

      totalGrossEarnings += grossEarnings
      totalPlatformFees += platformFee
      totalProcessingFees += processingFee
      totalNetPayouts += netPayout
      previousTotalPayouts += previousPayout

      details.push({
        hostId: group.hostId,
        hostName: host?.name || 'Unknown',
        bookingCount,
        grossEarnings,
        platformFee,
        processingFee,
        netPayout,
        previousPayout,
        difference
      })

      if (!dryRun) {
        // Update all payouts for this host
        const hostPayouts = await this.prisma.rentalPayout.findMany({
          where: { hostId: group.hostId, status: { in: ['PAID', 'COMPLETED'] } },
          include: { booking: { select: { subtotal: true } } }
        })

        for (const payout of hostPayouts) {
          const bookingSubtotal = Number(payout.booking?.subtotal) || 0
          const payoutPlatformFee = bookingSubtotal * commissionRate
          const payoutProcessingFee = 1.50
          const payoutNetAmount = bookingSubtotal - payoutPlatformFee - payoutProcessingFee

          await this.prisma.rentalPayout.update({
            where: { id: payout.id },
            data: {
              grossEarnings: bookingSubtotal,
              platformFee: payoutPlatformFee,
              processingFee: payoutProcessingFee,
              netPayout: payoutNetAmount,
              amount: payoutNetAmount,
              updatedAt: new Date()
            }
          })
          payoutsUpdated++
        }

        // Update host totals
        await this.prisma.rentalHost.update({
          where: { id: group.hostId },
          data: {
            totalPayoutsAmount: netPayout,
            totalPayoutsCount: bookingCount,
            totalTrips: bookingCount
          }
        })
        hostsUpdated++
      } else {
        hostsUpdated++
      }
    }

    return {
      hostsUpdated,
      payoutsUpdated,
      totalGrossEarnings,
      totalPlatformFees,
      totalProcessingFees,
      totalNetPayouts,
      previousTotalPayouts,
      details
    }
  }
}
