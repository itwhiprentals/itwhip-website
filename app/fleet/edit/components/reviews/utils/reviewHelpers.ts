// app/sys-2847/fleet/edit/components/reviews/utils/reviewHelpers.ts

export interface ReviewerProfile {
    id: string
    name: string
    profilePhotoUrl?: string
    city: string
    state: string
    memberSince: string
    tripCount: number
    reviewCount: number
    isVerified: boolean
  }
  
  export interface Review {
    id: string
    rating: number
    title?: string
    comment: string
    isVisible: boolean
    isPinned: boolean
    isVerified: boolean
    helpfulCount: number
    tripStartDate?: string
    tripEndDate?: string
    hostResponse?: string
    hostRespondedAt?: string
    supportResponse?: string
    supportRespondedAt?: string
    supportRespondedBy?: string
    createdAt: string
    updatedAt?: string
    reviewerProfile?: ReviewerProfile
    reviewer?: {
      name: string
      profilePhotoUrl?: string
      city?: string
      state?: string
    }
  }
  
  export interface ReviewStats {
    total: number
    average: number
    distribution: {
      rating: number
      count: number
      percentage: number
    }[]
  }
  
  export interface NewReviewData {
    rating: number
    title: string
    comment: string
    reviewerName: string
    profilePhotoUrl: string
    reviewerCity: string
    reviewerState: string
    tripStartDate: string
    tripEndDate: string
    isVerified: boolean
    isPinned: boolean
    helpfulCount: number
    createNewProfile: boolean
    selectedProfileId: string
    createdAt?: string  // For custom review date
  }
  
  // Helper functions
  export const calculateSuggestedResponseDate = (reviewDate: string, type: 'host' | 'support'): string => {
    const date = new Date(reviewDate)
    const daysToAdd = type === 'host' 
      ? Math.floor(Math.random() * 5) + 3  // 3-7 days
      : Math.floor(Math.random() * 6) + 5  // 5-10 days
    
    date.setDate(date.getDate() + daysToAdd)
    
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    
    return `${year}-${month}-${day}`
  }
  
  export const formatDate = (dateString: string): string => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }
  
  export const validateTripDates = (startDate: string, endDate: string): boolean => {
    if (!startDate || !endDate) return true // Allow empty dates
    const start = new Date(startDate)
    const end = new Date(endDate)
    return end >= start
  }
  
  export const validateReviewDate = (reviewDate: string, tripEndDate?: string): boolean => {
    if (!reviewDate) return true
    if (!tripEndDate) return true
    const review = new Date(reviewDate)
    const tripEnd = new Date(tripEndDate)
    return review >= tripEnd
  }