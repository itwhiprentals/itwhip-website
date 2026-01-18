// app/partner/landing/components/types.ts
// Shared types for landing page editor

export interface Policies {
  refundPolicy: string
  cancellationPolicy: string
  bookingRequirements: string
  additionalTerms: string
}

export interface FAQ {
  id: string
  question: string
  answer: string
}

export interface PublishingRequirements {
  hasApproval: boolean
  hasValidSlug: boolean
  hasVehicles: boolean
  hasService: boolean
  canPublish: boolean
  vehicleCount: number
}

export interface LandingPageData {
  slug: string
  companyName: string
  logo: string | null
  heroImage: string | null
  headline: string
  subheadline: string
  bio: string
  supportEmail: string
  supportPhone: string
  primaryColor: string
  faqs: FAQ[]
  isPublished: boolean
  publishingRequirements?: PublishingRequirements
  // Social Media & Website
  website: string
  instagram: string
  facebook: string
  twitter: string
  linkedin: string
  tiktok: string
  youtube: string
  // Visibility Settings
  showEmail: boolean
  showPhone: boolean
  showWebsite: boolean
  // Policies
  policies: Policies
  // Service Settings - which tabs appear on landing page
  enableRideshare: boolean
  enableRentals: boolean
  enableSales: boolean
  enableLeasing: boolean
  enableRentToOwn: boolean
}

export type TabType = 'content' | 'social' | 'branding' | 'services' | 'policies' | 'faqs'

export const DEFAULT_POLICIES: Policies = {
  refundPolicy: '',
  cancellationPolicy: '',
  bookingRequirements: '',
  additionalTerms: ''
}

export const DEFAULT_LANDING_DATA: LandingPageData = {
  slug: '',
  companyName: '',
  logo: null,
  heroImage: null,
  headline: '',
  subheadline: '',
  bio: '',
  supportEmail: '',
  supportPhone: '',
  primaryColor: '#f97316',
  faqs: [],
  isPublished: false,
  website: '',
  instagram: '',
  facebook: '',
  twitter: '',
  linkedin: '',
  tiktok: '',
  youtube: '',
  showEmail: true,
  showPhone: true,
  showWebsite: true,
  policies: DEFAULT_POLICIES,
  enableRideshare: true,
  enableRentals: false,
  enableSales: false,
  enableLeasing: false,
  enableRentToOwn: false
}
