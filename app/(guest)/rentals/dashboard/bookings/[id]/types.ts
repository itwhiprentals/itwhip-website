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
      transmission: string
      seats: number
      photos: Array<{ url: string; caption?: string }>
      location: string
      address?: string
      city?: string
      state?: string
    }
    host: {
      name: string
      email: string
      phone: string
      rating: number
      responseTime: number
    }
    startDate: string
    endDate: string
    startTime: string
    endTime: string
    pickupLocation: string
    pickupType: 'host' | 'delivery' | 'airport' | 'hotel'
    totalAmount: number
    dailyRate: number
    serviceFee: number
    insuranceFee: number
    deliveryFee: number
    taxes: number
    depositAmount: number
    paymentStatus: string
    licenseVerified?: boolean
    insurancePhotoUrl?: string
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
    label: string
  }
  
  export interface TimelineStep {
    name: string
    status: 'complete' | 'current' | 'upcoming'
    icon: React.ComponentType<{ className?: string }>
  }