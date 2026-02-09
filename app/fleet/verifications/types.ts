// app/fleet/verifications/types.ts

export interface StripeData {
  status: string | null
  verified: boolean
  verifiedAt: string | null
  reportId: string | null
  verifiedFirstName: string | null
  verifiedLastName: string | null
  verifiedDob: string | null
  verifiedIdNumber: string | null  // masked: ***1234
  verifiedIdExpiry: string | null
  verifiedAddress: string | null
  profileName: string | null
  profileEmail: string | null
  fullyVerified: boolean | null
}

export interface Verification {
  id: string
  bookingCode: string
  status: string
  verificationStatus: string
  guestName: string
  guestEmail: string
  guestPhone: string
  startDate: string
  endDate: string
  totalAmount: number
  createdAt: string
  documentsSubmittedAt: string | null
  verificationDeadline: string | null
  verificationNotes: string | null
  reviewedBy: string | null
  reviewedAt: string | null
  hasLicenseFront: boolean
  hasLicenseBack: boolean
  hasInsurance: boolean
  hasSelfie: boolean
  licensePhotoUrl: string | null
  licenseBackPhotoUrl: string | null
  insurancePhotoUrl: string | null
  licenseState: string | null
  licenseNumber: string | null
  dateOfBirth: string | null
  // AI verification
  aiScore: number | null
  aiPassed: boolean | null
  aiAt: string | null
  aiModel: string | null
  aiCriticalFlags: number
  aiInfoFlags: number
  aiRecommendation: 'APPROVE' | 'REVIEW' | 'REJECT' | null
  aiExtractedName: string | null
  aiNameMatch: boolean | null
  // Stripe Identity
  stripe: StripeData | null
  stripeVerified: boolean
  // Car & host
  car: { make: string; model: string; year: number; photoUrl?: string }
  hostName: string
}

export interface StripeGuestProfile {
  profileId: string
  name: string
  email: string | null
  phone: string | null
  photoUrl: string | null
  memberSince: string
  bookingCount: number
  stripe: {
    status: string | null
    verified: boolean
    verifiedAt: string | null
    reportId: string | null
    sessionId: string | null
    verifiedFirstName: string | null
    verifiedLastName: string | null
    verifiedDob: string | null
    verifiedIdNumber: string | null
    verifiedIdExpiry: string | null
    verifiedAddress: string | null
    documentType: string | null
    issuingCountry: string | null
  }
  documentsVerified: boolean
  fullyVerified: boolean
}

export interface VerificationStats {
  pending: number
  aiPassed: number
  stripeVerified: number
  stripeVerifiedProfiles: number
  totalStripeProfiles: number
  reviewedToday: number
  totalWithDocs: number
}

export type FilterTab = 'pending' | 'needs_review' | 'ai_passed' | 'stripe_verified' | 'reviewed' | 'all'
