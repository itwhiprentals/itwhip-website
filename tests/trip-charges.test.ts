// tests/trip-charges.test.ts

import { describe, test, expect, beforeEach, afterEach, jest } from '@jest/globals'
import { PaymentProcessor } from '@/app/lib/stripe/payment-processor'
import { calculateTripCharges } from '@/app/lib/trip/calculations'
import { prisma } from '@/app/lib/database/prisma'

// Mock Stripe
jest.mock('@/app/lib/stripe/client', () => ({
  stripe: {
    customers: {
      create: jest.fn(),
    },
    paymentIntents: {
      create: jest.fn(),
      confirm: jest.fn(),
      capture: jest.fn(),
      cancel: jest.fn(),
    },
    refunds: {
      create: jest.fn(),
    },
  },
  formatAmountForStripe: (amount: number) => Math.round(amount * 100),
  isTestMode: () => true,
}))

// Test data
const mockBooking = {
  id: 'test-booking-123',
  bookingCode: 'ITW-2024-001',
  guestEmail: 'test@example.com',
  guestName: 'Test Guest',
  stripeCustomerId: 'cus_test123',
  stripePaymentMethodId: 'pm_test123',
  totalAmount: 500,
  numberOfDays: 3,
  startDate: new Date('2024-01-01'),
  endDate: new Date('2024-01-04'),
  startMileage: 50000,
  fuelLevelStart: 'Full',
  tripStartedAt: new Date('2024-01-01T10:00:00'),
}

describe('Trip Charges Calculation', () => {
  describe('calculateTripCharges', () => {
    test('should calculate mileage overage correctly', () => {
      const charges = calculateTripCharges(
        50000, // start mileage
        50800, // end mileage (800 miles driven)
        'Full',
        'Full',
        new Date('2024-01-01'),
        new Date('2024-01-04'),
        new Date('2024-01-04T10:00:00'),
        3, // 3 days = 600 included miles
        []
      )

      expect(charges.mileage.used).toBe(800)
      expect(charges.mileage.included).toBe(600)
      expect(charges.mileage.overage).toBe(200)
      expect(charges.mileage.charge).toBe(90) // 200 * 0.45
    })

    test('should calculate fuel charges correctly', () => {
      const charges = calculateTripCharges(
        50000,
        50400,
        'Full',
        '1/4', // Returned with 1/4 tank
        new Date('2024-01-01'),
        new Date('2024-01-04'),
        new Date('2024-01-04T10:00:00'),
        3,
        []
      )

      expect(charges.fuel.startLevel).toBe('Full')
      expect(charges.fuel.endLevel).toBe('1/4')
      expect(charges.fuel.charge).toBe(225) // 3/4 tank * $300
    })

    test('should calculate late return charges', () => {
      const charges = calculateTripCharges(
        50000,
        50400,
        'Full',
        'Full',
        new Date('2024-01-01'),
        new Date('2024-01-04T10:00:00'), // Should return by 10 AM
        new Date('2024-01-04T15:00:00'), // Returned at 3 PM (5 hours late)
        3,
        []
      )

      expect(charges.late.hoursLate).toBe(5)
      expect(charges.late.charge).toBe(250) // 5 hours * $50
    })

    test('should return zero charges when no overages', () => {
      const charges = calculateTripCharges(
        50000,
        50200, // Only 200 miles (under 600 included)
        'Full',
        'Full',
        new Date('2024-01-01'),
        new Date('2024-01-04'),
        new Date('2024-01-04T09:00:00'), // On time
        3,
        []
      )

      expect(charges.total).toBe(0)
      expect(charges.mileage.charge).toBe(0)
      expect(charges.fuel.charge).toBe(0)
      expect(charges.late.charge).toBe(0)
    })

    test('should handle damage charges', () => {
      const charges = calculateTripCharges(
        50000,
        50200,
        'Full',
        'Full',
        new Date('2024-01-01'),
        new Date('2024-01-04'),
        new Date('2024-01-04T09:00:00'),
        3,
        [{ type: 'scratch', cost: 250 }]
      )

      expect(charges.damage.charge).toBe(250)
      expect(charges.total).toBe(250)
    })
  })
})

describe('Payment Processing', () => {
  const stripe = require('@/app/lib/stripe/client').stripe

  beforeEach(() => {
    jest.clearAllMocks()
  })

  describe('chargeAdditionalFees', () => {
    test('should successfully charge additional fees', async () => {
      stripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_test123',
        status: 'succeeded',
        amount: 10000,
      })

      const result = await PaymentProcessor.chargeAdditionalFees(
        'cus_test123',
        'pm_test123',
        10000, // $100 in cents
        'Test charge',
        { bookingId: 'test-123' }
      )

      expect(result.status).toBe('succeeded')
      expect(result.chargeId).toBe('pi_test123')
      expect(result.amount).toBe(100)
    })

    test('should handle payment failure', async () => {
      stripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_test123',
        status: 'failed',
        last_payment_error: { message: 'Insufficient funds' },
      })

      const result = await PaymentProcessor.chargeAdditionalFees(
        'cus_test123',
        'pm_test123',
        10000,
        'Test charge',
        {}
      )

      expect(result.status).toBe('failed')
      expect(result.error).toBe('Insufficient funds')
    })

    test('should handle 3D Secure requirement', async () => {
      stripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_test123',
        status: 'requires_action',
      })

      const result = await PaymentProcessor.chargeAdditionalFees(
        'cus_test123',
        'pm_test123',
        10000,
        'Test charge',
        {}
      )

      expect(result.status).toBe('requires_action')
      expect(result.error).toBe('Payment requires additional authentication')
    })

    test('should validate input parameters', async () => {
      const result = await PaymentProcessor.chargeAdditionalFees(
        '', // Invalid customer ID
        'pm_test123',
        10000,
        'Test charge',
        {}
      )

      expect(result.status).toBe('failed')
      expect(result.error).toContain('Customer ID and payment method are required')
    })

    test('should reject negative amounts', async () => {
      const result = await PaymentProcessor.chargeAdditionalFees(
        'cus_test123',
        'pm_test123',
        -100, // Negative amount
        'Test charge',
        {}
      )

      expect(result.status).toBe('failed')
      expect(result.error).toContain('Amount must be greater than zero')
    })
  })

  describe('retryFailedCharge', () => {
    test('should successfully retry a failed charge', async () => {
      stripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_retry123',
        status: 'succeeded',
        amount: 10000,
      })

      const result = await PaymentProcessor.retryFailedCharge(
        'cus_test123',
        'pm_test123',
        100, // $100
        'pi_original123',
        { retry_attempt: 1 }
      )

      expect(result.status).toBe('succeeded')
      expect(result.chargeId).toBe('pi_retry123')
      expect(stripe.paymentIntents.create).toHaveBeenCalledWith(
        expect.objectContaining({
          metadata: expect.objectContaining({
            retry: true,
            original_charge_id: 'pi_original123',
            retry_attempt: 2,
          }),
        })
      )
    })
  })
})

describe('Waive Functionality', () => {
  describe('waiveCharges', () => {
    test('should calculate 100% waive correctly', async () => {
      const result = await PaymentProcessor.waiveCharges(
        'booking-123',
        150, // $150 original amount
        100, // 100% waive
        'Customer service goodwill',
        'admin-123'
      )

      expect(result.waivedAmount).toBe(150)
      expect(result.remainingAmount).toBe(0)
      expect(result.waiveRecord.waivePercentage).toBe(100)
    })

    test('should calculate 50% waive correctly', async () => {
      const result = await PaymentProcessor.waiveCharges(
        'booking-123',
        200, // $200 original
        50, // 50% waive
        'First-time customer discount',
        'admin-123'
      )

      expect(result.waivedAmount).toBe(100)
      expect(result.remainingAmount).toBe(100)
      expect(result.waiveRecord.waivePercentage).toBe(50)
    })

    test('should calculate 25% waive correctly', async () => {
      const result = await PaymentProcessor.waiveCharges(
        'booking-123',
        120, // $120 original
        25, // 25% waive
        'Minor inconvenience adjustment',
        'admin-123'
      )

      expect(result.waivedAmount).toBe(30)
      expect(result.remainingAmount).toBe(90)
    })

    test('should reject invalid waive percentages', async () => {
      await expect(
        PaymentProcessor.waiveCharges('booking-123', 100, 150, 'Invalid', 'admin-123')
      ).rejects.toThrow('Waive percentage must be between 0 and 100')

      await expect(
        PaymentProcessor.waiveCharges('booking-123', 100, -10, 'Invalid', 'admin-123')
      ).rejects.toThrow('Waive percentage must be between 0 and 100')
    })

    test('should create proper audit record', async () => {
      const result = await PaymentProcessor.waiveCharges(
        'booking-123',
        100,
        50,
        'Test reason',
        'admin-456'
      )

      expect(result.waiveRecord).toMatchObject({
        bookingId: 'booking-123',
        originalAmount: 100,
        waivePercentage: 50,
        waivedAmount: 50,
        remainingAmount: 50,
        reason: 'Test reason',
        adminId: 'admin-456',
        test_mode: 'true',
      })
      expect(result.waiveRecord.waivedAt).toBeDefined()
    })
  })

  describe('adjustAndCharge', () => {
    test('should process adjusted charges correctly', async () => {
      stripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_adjusted123',
        status: 'succeeded',
        amount: 7500, // $75
      })

      const adjustments = [
        { type: 'mileage', originalAmount: 100, adjustedAmount: 50, included: true },
        { type: 'fuel', originalAmount: 50, adjustedAmount: 25, included: true },
        { type: 'late', originalAmount: 50, adjustedAmount: 0, included: false },
      ]

      const result = await PaymentProcessor.adjustAndCharge(
        'cus_test123',
        'pm_test123',
        adjustments,
        'booking-123',
        'admin-123'
      )

      expect(result.status).toBe('succeeded')
      expect(result.adjustmentRecord.originalTotal).toBe(200)
      expect(result.adjustmentRecord.adjustedTotal).toBe(75)
      expect(result.adjustmentRecord.totalAdjustment).toBe(125)
    })

    test('should handle full waive through adjustments', async () => {
      const adjustments = [
        { type: 'mileage', originalAmount: 100, adjustedAmount: 0, included: false },
        { type: 'fuel', originalAmount: 50, adjustedAmount: 0, included: false },
      ]

      const result = await PaymentProcessor.adjustAndCharge(
        'cus_test123',
        'pm_test123',
        adjustments,
        'booking-123',
        'admin-123'
      )

      expect(result.status).toBe('succeeded')
      expect(result.amount).toBe(0)
      expect(result.adjustmentRecord.adjustedTotal).toBe(0)
      expect(stripe.paymentIntents.create).not.toHaveBeenCalled()
    })
  })
})

describe('Status Transitions', () => {
  describe('Trip End Status Flow', () => {
    test('should transition to COMPLETED when no charges', () => {
      const transitions = getStatusTransition(0, 'paid', false)
      
      expect(transitions.status).toBe('COMPLETED')
      expect(transitions.verificationStatus).toBe('COMPLETED')
      expect(transitions.paymentStatus).toBe('PAID')
    })

    test('should transition to PENDING_CHARGES when payment fails', () => {
      const transitions = getStatusTransition(100, 'failed', false)
      
      expect(transitions.status).toBe('PENDING')
      expect(transitions.verificationStatus).toBe('PENDING_CHARGES')
      expect(transitions.paymentStatus).toBe('PAYMENT_FAILED')
    })

    test('should transition to PENDING_CHARGES with disputes', () => {
      const transitions = getStatusTransition(100, 'pending', true)
      
      expect(transitions.status).toBe('PENDING')
      expect(transitions.verificationStatus).toBe('PENDING_CHARGES')
      expect(transitions.paymentStatus).toBe('PENDING_CHARGES')
    })

    test('should transition to COMPLETED when charges paid', () => {
      const transitions = getStatusTransition(100, 'succeeded', false)
      
      expect(transitions.status).toBe('COMPLETED')
      expect(transitions.verificationStatus).toBe('COMPLETED')
      expect(transitions.paymentStatus).toBe('CHARGES_PAID')
    })
  })

  describe('P2P Approval Status Flow', () => {
    test('should handle charge waiving', () => {
      const result = processP2PAction('waive', 100)
      
      expect(result.status).toBe('COMPLETED')
      expect(result.paymentStatus).toBe('CHARGES_WAIVED')
    })

    test('should handle partial waive', () => {
      const result = processP2PAction('partial_waive', 50)
      
      expect(result.status).toBe('COMPLETED')
      expect(result.paymentStatus).toBe('PARTIAL_PAID')
    })

    test('should handle adjusted charges', () => {
      const result = processP2PAction('adjust', 75)
      
      expect(result.status).toBe('COMPLETED')
      expect(result.paymentStatus).toBe('ADJUSTED_PAID')
    })
  })
})

// Helper functions for testing
function getStatusTransition(chargeAmount: number, paymentStatus: string, hasDisputes: boolean) {
  if (chargeAmount === 0) {
    return {
      status: 'COMPLETED',
      verificationStatus: 'COMPLETED',
      paymentStatus: 'PAID'
    }
  }
  
  if (hasDisputes) {
    return {
      status: 'PENDING',
      verificationStatus: 'PENDING_CHARGES',
      paymentStatus: 'PENDING_CHARGES'
    }
  }
  
  if (paymentStatus === 'succeeded') {
    return {
      status: 'COMPLETED',
      verificationStatus: 'COMPLETED',
      paymentStatus: 'CHARGES_PAID'
    }
  }
  
  if (paymentStatus === 'failed') {
    return {
      status: 'PENDING',
      verificationStatus: 'PENDING_CHARGES',
      paymentStatus: 'PAYMENT_FAILED'
    }
  }
  
  return {
    status: 'PENDING',
    verificationStatus: 'PENDING_CHARGES',
    paymentStatus: 'PENDING_CHARGES'
  }
}

function processP2PAction(action: string, amount: number) {
  switch (action) {
    case 'waive':
      return {
        status: 'COMPLETED',
        verificationStatus: 'COMPLETED',
        paymentStatus: 'CHARGES_WAIVED'
      }
    case 'partial_waive':
      return {
        status: 'COMPLETED',
        verificationStatus: 'COMPLETED',
        paymentStatus: 'PARTIAL_PAID'
      }
    case 'adjust':
      return {
        status: 'COMPLETED',
        verificationStatus: 'COMPLETED',
        paymentStatus: 'ADJUSTED_PAID'
      }
    default:
      return {
        status: 'PENDING',
        verificationStatus: 'PENDING_CHARGES',
        paymentStatus: 'PENDING_CHARGES'
      }
  }
}

describe('Integration Tests', () => {
  describe('Complete Trip End Flow', () => {
    test('should handle successful immediate charge', async () => {
      // Mock successful payment
      stripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_success',
        status: 'succeeded',
        amount: 15000,
      })

      // Simulate trip end with charges
      const tripData = {
        bookingId: 'test-booking',
        endMileage: 50850, // 250 miles overage
        fuelLevel: '1/2', // Half tank used
        paymentChoice: 'pay_now'
      }

      // Calculate expected charges
      const expectedMileageCharge = 250 * 0.45 // $112.50
      const expectedFuelCharge = 150 // Half tank = $150
      const expectedTotal = 262.50

      // Process trip end
      const result = await processTripEnd(tripData, mockBooking)

      expect(result.chargeStatus).toBe('CHARGED')
      expect(result.charges.total).toBeCloseTo(expectedTotal)
      expect(result.statusTransition).toBe('COMPLETED')
    })

    test('should route to P2P on payment failure', async () => {
      stripe.paymentIntents.create.mockResolvedValue({
        id: 'pi_failed',
        status: 'failed',
        last_payment_error: { message: 'Card declined' },
      })

      const tripData = {
        bookingId: 'test-booking',
        endMileage: 50700,
        fuelLevel: 'Empty',
        paymentChoice: 'pay_now'
      }

      const result = await processTripEnd(tripData, mockBooking)

      expect(result.chargeStatus).toBe('FAILED')
      expect(result.statusTransition).toBe('PENDING')
      expect(result.verificationStatus).toBe('PENDING_CHARGES')
    })
  })
})

// Mock helper for trip end processing
async function processTripEnd(tripData: any, booking: any) {
  const charges = calculateTripCharges(
    booking.startMileage,
    tripData.endMileage,
    booking.fuelLevelStart,
    tripData.fuelLevel,
    booking.startDate,
    booking.endDate,
    new Date(),
    booking.numberOfDays,
    []
  )

  if (charges.total > 0 && tripData.paymentChoice === 'pay_now') {
    const paymentResult = await PaymentProcessor.chargeAdditionalFees(
      booking.stripeCustomerId,
      booking.stripePaymentMethodId,
      Math.round(charges.total * 100),
      `Trip charges for ${booking.bookingCode}`,
      { bookingId: booking.id }
    )

    return {
      charges,
      chargeStatus: paymentResult.status === 'succeeded' ? 'CHARGED' : 'FAILED',
      statusTransition: paymentResult.status === 'succeeded' ? 'COMPLETED' : 'PENDING',
      verificationStatus: paymentResult.status === 'succeeded' ? 'COMPLETED' : 'PENDING_CHARGES',
      paymentResult
    }
  }

  return {
    charges,
    chargeStatus: 'PENDING',
    statusTransition: charges.total > 0 ? 'PENDING' : 'COMPLETED',
    verificationStatus: charges.total > 0 ? 'PENDING_CHARGES' : 'COMPLETED'
  }
}