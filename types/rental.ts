// types/rental.ts
export interface RentalCarWithDetails {
    id: string
    make: string
    model: string
    year: number
    dailyRate: number
    [key: string]: any // Allow any other properties
  }