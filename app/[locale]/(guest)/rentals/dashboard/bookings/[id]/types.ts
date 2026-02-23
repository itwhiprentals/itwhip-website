// app/(guest)/rentals/dashboard/bookings/[id]/types.ts

export interface Booking {
    id: string
    bookingCode: string
    status: 'PENDING' | 'CONFIRMED' | 'ACTIVE' | 'COMPLETED' | 'CANCELLED'
    verificationStatus?: string
    guestEmail?: string
    guestPhone?: string
    guestName?: string
    car: {
      id: string
      make: string
      model: string
      year: number
      type: string
      carType?: string
      transmission: string
      seats: number
      photos: Array<{ url: string; caption?: string }>
      location: string
      address?: string
      city?: string
      state?: string
      zipCode?: string
      latitude?: number | null
      longitude?: number | null
      dailyRate?: number
      rating?: number
      totalTrips?: number
      estimatedValue?: number | null
    }
    host: {
      name: string
      email: string
      phone: string
      rating: number
      responseTime: number
      profilePhoto?: string | null
    }
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    pickupLocation: string
    pickupType: 'host' | 'delivery' | 'airport' | 'hotel'
    totalAmount: number
    dailyRate: number
    numberOfDays?: number
    subtotal?: number
    serviceFee: number
    insuranceFee: number
    insuranceType?: string
    deliveryFee: number
    deliveryType?: string
    deliveryAddress?: string | null
    returnLocation?: string | null
    taxes: number
    depositAmount: number
    creditsApplied?: number
    bonusApplied?: number
    chargeAmount?: number
    walletApplied?: number
    isMinimumHold?: boolean
    depositFromWallet?: number
    depositFromCard?: number
    cardBrand?: string | null
    cardLast4?: string | null
    paymentStatus: string
    tripStatus?: string
    tripStartedAt?: string | Date | null
    tripEndedAt?: string | Date | null
    documentsSubmittedAt?: string | Date | null
    reviewedAt?: string | Date | null
    reviewedBy?: string | null
    agreementAcceptedAt?: string | Date | null
    bookingIpAddress?: string | null
    createdAt?: string | Date
    guestToken?: string
    licenseVerified?: boolean
    licensePhotoUrl?: string
    licenseBackPhotoUrl?: string
    insurancePhotoUrl?: string
    onboardingCompletedAt?: string | Date | null
    guestStripeVerified?: boolean
    guestInsuranceOnFile?: boolean
    insuranceSelection?: string
    refuelService?: boolean
    additionalDriver?: boolean
    extraMilesPackage?: boolean
    vipConcierge?: boolean
    enhancementsTotal?: number
    exactAddress?: string
    parkingInstructions?: string
    keyboxCode?: string
    hasKeybox?: boolean
    handoffStatus?: string | null
    hostFinalReviewStatus?: string | null
    hostFinalReviewDeadline?: string | null
    cancelledAt?: string | Date | null
    cancelledBy?: string | null
    cancellationReason?: string | null
  }
  
  export interface Message {
    id: string
    senderId: string
    senderType: string
    senderName: string
    message: string
    createdAt: string
    isRead: boolean
    hasAttachment?: boolean
    attachmentUrl?: string
    attachmentName?: string
    category?: string
  }
  
  export interface PrePickupChecklistItem {
    id: string
    label: string
    completed: boolean
  }
  
  export interface RefundCalculation {
    refundAmount: number
    serviceFeeRefund: number
    totalRefund: number
    refundPercentage: number
    penaltyAmount: number
    tier: 'free' | 'moderate' | 'late' | 'no_refund'
    depositRefunded: boolean
    label: string
    // Payment source breakdown (when credits/bonus were used)
    cardRefund: number
    creditsRestored: number
    bonusRestored: number
    penaltyFromCard: number
    penaltyFromCredits: number
    penaltyFromBonus: number
    // Deposit source tracking
    depositFromCard: number
    depositFromWallet: number
    totalCardRefund: number  // cardRefund + depositFromCard (matches actual Stripe refund)
    // Non-refundable fees (service + insurance + delivery — always kept by platform)
    nonRefundableFees: number
  }
  
  export interface TimelineStep {
    name: string
    status: 'complete' | 'current' | 'upcoming'
    icon: React.ComponentType<{ className?: string }>
  }