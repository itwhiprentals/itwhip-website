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
      dailyRate?: number
      rating?: number
      totalTrips?: number
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
    penaltyDays: number
    depositRefunded: boolean
    label: string
  }
  
  export interface TimelineStep {
    name: string
    status: 'complete' | 'current' | 'upcoming'
    icon: React.ComponentType<{ className?: string }>
  }