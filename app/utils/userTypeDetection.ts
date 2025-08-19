// app/utils/userTypeDetection.ts

export type UserType = 'rider' | 'hotel' | 'unknown'

interface DetectionContext {
  referrer?: string
  searchParams?: URLSearchParams
  userAgent?: string
  hostname?: string
  pathname?: string
}

/**
 * Get user type from cookie
 */
export function getUserTypeCookie(): UserType | null {
  if (typeof document === 'undefined') return null
  
  const match = document.cookie.match(/itwhip_user_type=([^;]+)/)
  return match ? (match[1] as UserType) : null
}

/**
 * Set user type cookie (1 year expiry)
 */
export function setUserTypeCookie(type: UserType): void {
  const maxAge = 365 * 24 * 60 * 60 // 1 year in seconds
  document.cookie = `itwhip_user_type=${type}; path=/; max-age=${maxAge}; SameSite=Lax`
}

/**
 * Clear user type cookie
 */
export function clearUserTypeCookie(): void {
  document.cookie = 'itwhip_user_type=; path=/; max-age=0'
}

/**
 * Smart detection based on context signals
 */
export function detectUserTypeFromContext(context: DetectionContext): UserType {
  const { referrer = '', searchParams, userAgent = '', pathname = '' } = context

  // 1. HIGHEST PRIORITY: Explicit URL parameters
  const viewParam = searchParams?.get('view')
  if (viewParam === 'hotel' || viewParam === 'partner') return 'hotel'
  if (viewParam === 'rider' || viewParam === 'ride') return 'rider'
  
  // Check for hotel-specific UTM campaigns
  const utmSource = searchParams?.get('utm_source')
  const utmCampaign = searchParams?.get('utm_campaign')
  if (utmSource?.includes('hotel') || utmCampaign?.includes('hotel')) return 'hotel'
  if (utmSource?.includes('rider') || utmCampaign?.includes('rider')) return 'rider'

  // 2. Check referrer patterns
  const hotelReferrers = [
    'linkedin.com',
    'hospitalitynet.org',
    'hotelmanagement.net',
    'hotelnewsresource.com',
    '/partners',
    '/hotels',
    'omnihotels.com',
    'fourseasons.com',
    'fairmont.com',
    'marriott.com',
    'hilton.com'
  ]
  
  const riderReferrers = [
    'instagram.com',
    'facebook.com',
    'twitter.com',
    'reddit.com',
    'google.com/maps',
    'apple.com/maps'
  ]

  // Check if referrer matches hotel patterns
  if (hotelReferrers.some(pattern => referrer.toLowerCase().includes(pattern))) {
    return 'hotel'
  }

  // Check if referrer matches rider patterns
  if (riderReferrers.some(pattern => referrer.toLowerCase().includes(pattern))) {
    return 'rider'
  }

  // 3. Search query analysis (if came from Google)
  if (referrer.includes('google.com')) {
    const hotelKeywords = ['hotel shuttle', 'hotel transportation', 'shuttle alternative', 'hotel revenue']
    const riderKeywords = ['airport ride', 'uber alternative', 'cheap ride', 'no surge']
    
    // Try to extract search query from referrer
    const queryMatch = referrer.match(/[?&]q=([^&]+)/)
    if (queryMatch) {
      const query = decodeURIComponent(queryMatch[1]).toLowerCase()
      
      if (hotelKeywords.some(keyword => query.includes(keyword))) return 'hotel'
      if (riderKeywords.some(keyword => query.includes(keyword))) return 'rider'
    }
  }

  // 4. Time and device-based detection
  const now = new Date()
  const hour = now.getHours()
  const day = now.getDay()
  const isWeekday = day >= 1 && day <= 5
  const isBusinessHours = hour >= 9 && hour <= 17
  const isMobile = /iPhone|iPad|iPod|Android/i.test(userAgent)

  // Business hours on weekday + desktop = likely hotel
  if (isWeekday && isBusinessHours && !isMobile) {
    return 'hotel'
  }

  // Evening/weekend + mobile = likely rider
  if ((hour >= 18 || hour <= 6 || !isWeekday) && isMobile) {
    return 'rider'
  }

  // 5. Path-based detection
  if (pathname.includes('hotel') || pathname.includes('partner')) return 'hotel'
  if (pathname.includes('ride') || pathname.includes('book')) return 'rider'

  // Default: unknown (show split screen)
  return 'unknown'
}

/**
 * Initialize user type detection
 */
export function initializeUserType(): UserType {
  // Check cookie first
  const cookieType = getUserTypeCookie()
  if (cookieType) return cookieType

  // Detect from context
  const detectedType = detectUserTypeFromContext({
    referrer: document.referrer,
    searchParams: new URLSearchParams(window.location.search),
    userAgent: navigator.userAgent,
    pathname: window.location.pathname
  })

  // If we detected a specific type, save it
  if (detectedType !== 'unknown') {
    setUserTypeCookie(detectedType)
  }

  return detectedType
}

/**
 * Track user type selection for analytics
 */
export function trackUserTypeSelection(type: UserType, source: string = 'split_hero'): void {
  // Google Analytics 4 event
  if (typeof window !== 'undefined' && (window as any).gtag) {
    (window as any).gtag('event', 'user_type_selected', {
      user_type: type,
      selection_source: source
    })
  }

  // You can add other analytics platforms here
  console.log('[Analytics] User type selected:', { type, source })
}

/**
 * Get marketing messaging based on user type
 */
export function getMessagingForUserType(type: UserType) {
  const messaging = {
    rider: {
      headline: 'Skip The Surge',
      subheadline: 'Luxury rides at fixed prices',
      cta: 'Book a Ride',
      features: [
        'No surge pricing ever',
        'Luxury vehicles only',
        'Flight tracking included'
      ]
    },
    hotel: {
      headline: 'Turn Rides Into Revenue',
      subheadline: 'Make $300K/year from guest transportation',
      cta: 'Calculate Revenue',
      features: [
        'Zero investment required',
        '30% of every ride',
        'Full integration support'
      ]
    },
    unknown: {
      headline: 'Phoenix Premium Rides',
      subheadline: 'The transportation network that pays you back',
      cta: 'Get Started',
      features: []
    }
  }

  return messaging[type]
}