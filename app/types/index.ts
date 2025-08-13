// app/types/index.ts

export interface ServiceTab {
  id: string
  name: string
  icon: React.ReactNode
}

export interface BundleOptions {
  flight: boolean
  car: boolean
  restaurant: boolean
  events: boolean
}

export interface Destination {
  city: string
  price: string
  desc: string
  image?: string
}

export interface PartnerCard {
  id: number
  badge: 'Sponsored' | 'Featured' | 'Premium' | 'Exclusive'
  name: string
  rating: number
  reviews: number
  description: string
  price: number
  unit: 'person' | 'ticket' | 'day' | 'group'
  image: string
}

export interface Feature {
  icon: React.ReactNode
  title: string
  desc: string
}

export interface SearchFormData {
  destination: string
  checkIn: string
  checkOut: string
  travelers: string
}
