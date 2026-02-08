// types/rental.ts
export interface RentalCarWithDetails {
    id: string
    make: string
    model: string
    year: number
    dailyRate: number
    [key: string]: any // Allow any other properties
  }

export interface RentalSearchFilters {
    location?: string
    pickupDate?: string
    returnDate?: string
    carTypes?: string[]
    features?: string[]
    minPrice?: number
    maxPrice?: number
    seats?: number
    transmission?: string
    fuelType?: string
    instantBook?: boolean
    deliveryType?: string
    verifiedHost?: boolean
  }