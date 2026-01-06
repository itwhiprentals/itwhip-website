// app/lib/partners/types.ts

export interface PartnerLocation {
    id: string
    name: string
    type: PartnerLocationType
    address: string
    latitude: number
    longitude: number
    phone?: string
    hours: BusinessHours
    amenities: string[]
    parkingInstructions?: string
    accessCode?: string
    contactPerson?: string
    commission: number // Percentage we pay to partner
    isActive: boolean
    createdAt: Date
    updatedAt: Date
   }
   
   export type PartnerLocationType = 
    | 'gas_station'
    | 'hotel'
    | 'gym'
    | 'grocery_store'
    | 'shopping_mall'
    | 'airport_parking'
    | 'office_building'
    | 'residential_complex'
    | 'public_parking'
   
   export interface BusinessHours {
    monday: DayHours
    tuesday: DayHours
    wednesday: DayHours
    thursday: DayHours
    friday: DayHours
    saturday: DayHours
    sunday: DayHours
    holidays?: HolidayHours[]
   }
   
   export interface DayHours {
    isOpen: boolean
    openTime?: string // "09:00"
    closeTime?: string // "17:00"
    breaks?: TimeSlot[]
   }
   
   export interface TimeSlot {
    start: string
    end: string
   }
   
   export interface HolidayHours {
    date: string // "2024-12-25"
    name: string // "Christmas"
    hours: DayHours
   }
   
   export interface PartnerAgreement {
    partnerId: string
    startDate: Date
    endDate?: Date
    commissionRate: number
    paymentTerms: PaymentTerms
    status: 'active' | 'pending' | 'expired' | 'terminated'
    signedBy: string
    signedAt: Date
   }
   
   export type PaymentTerms = 'weekly' | 'biweekly' | 'monthly' | 'per_transaction'
   
   export interface PartnerTransaction {
    id: string
    partnerId: string
    bookingId: string
    type: 'pickup' | 'dropoff' | 'both'
    amount: number // Commission amount
    status: 'pending' | 'paid' | 'cancelled'
    processedAt?: Date
    payoutId?: string
   }
   
   export interface PartnerMetrics {
    partnerId: string
    period: 'day' | 'week' | 'month' | 'year'
    startDate: Date
    endDate: Date
    totalTransactions: number
    totalCommission: number
    averageRating: number
    pickupCount: number
    dropoffCount: number
    complaints: number
   }
   
   export interface PartnerNotification {
    id: string
    partnerId: string
    bookingId: string
    type: 'new_pickup' | 'new_dropoff' | 'cancellation' | 'delay'
    message: string
    sentAt: Date
    readAt?: Date
    actionRequired: boolean
    actionUrl?: string
   }
   
   // Helper types for finding partners
   export interface PartnerSearchCriteria {
    location?: {
      lat: number
      lng: number
      radiusMeters: number
    }
    type?: PartnerLocationType[]
    isOpen?: boolean
    amenities?: string[]
   }
   
   export interface PartnerDistance {
    partner: PartnerLocation
    distanceMeters: number
    estimatedDriveTime?: number // in minutes
   }
   
   // Constants for partner features
   export const PARTNER_AMENITIES = {
    RESTROOM: 'restroom',
    WIFI: 'wifi',
    SECURITY_CAMERA: 'security_camera',
    COVERED_PARKING: 'covered_parking',
    VALET: 'valet',
    EV_CHARGING: 'ev_charging',
    CAR_WASH: 'car_wash',
    ATTENDED: 'attended_24_7',
    KEY_DROP: 'key_drop_box',
    LOUNGE: 'waiting_lounge'
   } as const
   
   export const PARTNER_COMMISSION_RATES = {
    gas_station: 5,
    hotel: 7,
    gym: 5,
    grocery_store: 4,
    shopping_mall: 6,
    airport_parking: 10,
    office_building: 5,
    residential_complex: 4,
    public_parking: 3
   } as const
   
   // Validation helpers
   export interface PartnerValidation {
    isValidLocation: (location: PartnerLocation) => boolean
    isOpenNow: (location: PartnerLocation, time?: Date) => boolean
    canHandlePickup: (location: PartnerLocation) => boolean
    canHandleDropoff: (location: PartnerLocation) => boolean
    calculateCommission: (location: PartnerLocation, bookingAmount: number) => number
   }