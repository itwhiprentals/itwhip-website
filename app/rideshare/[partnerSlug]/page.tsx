// app/rideshare/[partnerSlug]/page.tsx
// Enhanced Partner Landing Page with all sections

import { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { cookies } from 'next/headers'
import { jwtVerify } from 'jose'
import { prisma } from '@/app/lib/database/prisma'
import PartnerHero from '../components/PartnerHero'
import DiscountBanner from '../components/DiscountBanner'
import TrustBadges from '../components/TrustBadges'
import PartnerBenefits from '../components/PartnerBenefits'
import PartnerServices from '../components/PartnerServices'
import PartnerReviews from '../components/PartnerReviews'
import PartnerPolicies from '../components/PartnerPolicies'
import FAQAccordion from '../components/FAQAccordion'
import PartnerVehicleGrid from './PartnerVehicleGrid'
import PreviewBanner from './PreviewBanner'
import DraftPage from './DraftPage'
import EditModeWrapper from './EditModeWrapper'
import Footer from '@/app/components/Footer'
import Header from '@/app/components/Header'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || 'your-secret-key'
)

interface PageProps {
  params: Promise<{ partnerSlug: string }>
  searchParams: Promise<{ preview?: string; key?: string; preview_token?: string }>
}

interface PreviewTokenPayload {
  type: string
  hostId: string
  slug: string
  editMode?: boolean
}

// Validate preview token and return payload if valid
// SECURITY: Also verifies host is currently logged in (token alone is not enough)
async function validatePreviewToken(token: string, expectedSlug: string): Promise<PreviewTokenPayload | null> {
  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)

    // Check it's a preview token
    if (payload.type !== 'preview') return null

    // Check slug matches
    if (payload.slug !== expectedSlug) return null

    // SECURITY: Verify host is currently logged in
    // Preview tokens should only work when host has an active session
    const cookieStore = await cookies()
    const partnerToken = cookieStore.get('partner_token')?.value
    const hostAccessToken = cookieStore.get('hostAccessToken')?.value

    if (!partnerToken && !hostAccessToken) {
      // Host is logged out - reject preview token
      console.log('[Preview Token] Rejected - host not logged in')
      return null
    }

    // Verify the logged-in host matches the preview token's host
    try {
      const sessionToken = partnerToken || hostAccessToken
      const { payload: sessionPayload } = await jwtVerify(sessionToken!, JWT_SECRET)
      if (sessionPayload.hostId !== payload.hostId) {
        // Different host is logged in - reject
        console.log('[Preview Token] Rejected - different host logged in')
        return null
      }
    } catch {
      // Session token invalid/expired - reject preview
      console.log('[Preview Token] Rejected - session token invalid')
      return null
    }

    return payload as unknown as PreviewTokenPayload
  } catch {
    return null
  }
}

// Fleet preview key for unapproved partners
const FLEET_PREVIEW_KEY = 'phoenix-fleet-2847'

// Helper: Get display name for landing page
// Use company name as-is, or extract first name only from personal names for privacy
function getDisplayName(companyName: string | null, personalName: string | null): string {
  // If company name exists, use it as-is
  if (companyName && companyName.trim()) {
    return companyName.trim()
  }
  // If personal name exists, extract first name only for privacy
  if (personalName && personalName.trim()) {
    const firstName = personalName.trim().split(' ')[0]
    return firstName
  }
  return 'Partner'
}

// Fetch reviews for a partner (by hostId)
// Special case: ItWhip (the platform) shows ALL reviews
async function getPartnerReviews(hostId: string, isPlatform: boolean = false) {
  try {
    // Build where clause - platform sees all reviews, partners see only their own
    const whereClause: any = { isVisible: true }
    if (!isPlatform) {
      whereClause.hostId = hostId
    }

    const reviews = await prisma.rentalReview.findMany({
      where: whereClause,
      orderBy: { createdAt: 'desc' },
      take: 20, // Limit for performance
      select: {
        id: true,
        rating: true,
        comment: true,
        title: true,
        createdAt: true,
        isVerified: true,
        helpfulCount: true,
        hostResponse: true,
        hostRespondedAt: true,
        reviewerProfile: {
          select: {
            id: true,
            name: true,
            profilePhotoUrl: true
          }
        },
        car: {
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            city: true
          }
        }
      }
    })
    return reviews
  } catch (error) {
    console.error('[Partner Landing] Error fetching reviews:', error)
    return []
  }
}

// Get review stats for a partner
// Special case: ItWhip (the platform) shows stats for ALL reviews
async function getPartnerReviewStats(hostId: string, isPlatform: boolean = false) {
  try {
    // Build where clause - platform sees all reviews, partners see only their own
    const whereClause: any = { isVisible: true }
    if (!isPlatform) {
      whereClause.hostId = hostId
    }

    const [count, stats] = await Promise.all([
      prisma.rentalReview.count({ where: whereClause }),
      prisma.rentalReview.aggregate({
        where: whereClause,
        _avg: { rating: true }
      })
    ])
    return {
      totalReviews: count,
      avgRating: stats._avg.rating || 0
    }
  } catch (error) {
    console.error('[Partner Landing] Error fetching review stats:', error)
    return { totalReviews: 0, avgRating: 0 }
  }
}

// Fetch ALL rental cars from the platform (for Rentals tab)
async function getPlatformRentalCars() {
  try {
    const cars = await prisma.rentalCar.findMany({
      where: {
        isActive: true,
        vehicleType: 'RENTAL',
        host: {
          approvalStatus: 'APPROVED',
          active: true
        }
      },
      orderBy: { createdAt: 'desc' },
      take: 50, // Limit for performance
      select: {
        id: true,
        make: true,
        model: true,
        year: true,
        dailyRate: true,
        weeklyRate: true,
        monthlyRate: true,
        photos: true,
        city: true,
        state: true,
        instantBook: true,
        transmission: true,
        fuelType: true,
        seats: true,
        carType: true,
        description: true,
        features: true,
        rating: true,
        totalTrips: true,
        vehicleType: true,
        minTripDuration: true,
        host: {
          select: {
            name: true,
            partnerCompanyName: true,
            profilePhoto: true,
            partnerLogo: true
          }
        }
      }
    })
    return cars
  } catch (error) {
    console.error('[Partner Landing] Error fetching platform rentals:', error)
    return []
  }
}

// Check if a partner exists by slug (regardless of approval status)
// Used to show "draft" page instead of 404 when host exists but isn't published
async function checkPartnerExists(slug: string) {
  try {
    const partner = await prisma.rentalHost.findFirst({
      where: { partnerSlug: slug },
      select: {
        id: true,
        name: true,
        partnerCompanyName: true,
        approvalStatus: true,
        active: true,
        enableRideshare: true,
        enableRentals: true,
        _count: {
          select: { cars: true }
        }
      }
    })
    return partner
  } catch {
    return null
  }
}

async function getPartner(slug: string, isFleetPreview: boolean = false) {
  try {
    // Build where clause based on preview mode
    // Allow all host types since we've unified the portals
    const whereClause: any = {
      partnerSlug: slug
    }

    // Only require approved + active for public access (not fleet preview)
    if (!isFleetPreview) {
      whereClause.approvalStatus = 'APPROVED'
      whereClause.active = true
    }

    const partner = await prisma.rentalHost.findFirst({
      where: whereClause,
      include: {
        cars: {
          where: {
            isActive: true
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            make: true,
            model: true,
            year: true,
            dailyRate: true,
            weeklyRate: true,
            monthlyRate: true,
            photos: true,
            city: true,
            state: true,
            instantBook: true,
            transmission: true,
            fuelType: true,
            seats: true,
            description: true,
            features: true,
            rating: true,
            totalTrips: true,
            vehicleType: true,
            minTripDuration: true
          }
        },
        partnerDiscounts: {
          where: {
            isActive: true,
            OR: [
              { expiresAt: null },
              { expiresAt: { gte: new Date() } }
            ]
          },
          orderBy: { createdAt: 'desc' },
          select: {
            id: true,
            code: true,
            title: true,
            description: true,
            percentage: true,
            expiresAt: true,
            maxUses: true,
            usedCount: true
          }
        },
        partnerFaqs: {
          orderBy: { order: 'asc' },
          select: {
            id: true,
            question: true,
            answer: true
          }
        }
      }
    })

    return partner
  } catch (error) {
    console.error('[Partner Landing] Error:', error)
    return null
  }
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { partnerSlug } = await params
  const partner = await getPartner(partnerSlug)

  if (!partner) {
    return {
      title: 'Partner Not Found | ItWhip'
    }
  }

  const companyName = getDisplayName(partner.partnerCompanyName, partner.name)
  const vehicleCount = partner.cars.length
  const prices = partner.cars.map((c: any) => c.dailyRate).filter((p: number) => p > 0)
  const minPrice = prices.length > 0 ? Math.min(...prices) : 0

  const description = partner.partnerBio ||
    `Rent rideshare-ready vehicles from ${companyName}. ${vehicleCount} vehicles available starting at $${minPrice}/day.`

  return {
    title: `${companyName} - Rideshare Rentals | ItWhip`,
    description,
    openGraph: {
      title: `${companyName} - Rideshare Rentals | ItWhip`,
      description,
      type: 'website',
      images: partner.partnerHeroImage || partner.partnerLogo ? [partner.partnerHeroImage || partner.partnerLogo!] : []
    },
    twitter: {
      card: 'summary_large_image',
      title: `${companyName} - Rideshare Rentals`,
      description
    }
  }
}

export default async function PartnerLandingPage({ params, searchParams }: PageProps) {
  const { partnerSlug } = await params
  const { preview, key, preview_token } = await searchParams

  // Check if fleet preview mode (allows viewing unapproved partners)
  const isFleetPreview = preview === 'true' && key === FLEET_PREVIEW_KEY

  // Check for host preview token
  let previewTokenPayload: PreviewTokenPayload | null = null
  if (preview_token) {
    previewTokenPayload = await validatePreviewToken(preview_token, partnerSlug)
  }

  // Allow viewing if: fleet preview OR valid host preview token
  const isPreviewMode = isFleetPreview || !!previewTokenPayload
  const isEditMode = previewTokenPayload?.editMode === true

  const partner = await getPartner(partnerSlug, isPreviewMode)

  if (!partner) {
    // Partner not found with current criteria - check if they exist at all
    const existingPartner = await checkPartnerExists(partnerSlug)

    if (!existingPartner) {
      // Partner slug doesn't exist at all
      notFound()
    }

    // Partner exists but isn't published - show draft page
    const missingRequirements = {
      needsApproval: existingPartner.approvalStatus !== 'APPROVED',
      needsActivation: !existingPartner.active,
      needsCars: existingPartner._count.cars === 0,
      needsService: !existingPartner.enableRideshare && !existingPartner.enableRentals
    }

    return (
      <DraftPage
        hostName={existingPartner.partnerCompanyName || existingPartner.name || 'Partner'}
        missingRequirements={missingRequirements}
      />
    )
  }

  // Check if partner is not yet approved/active
  const isNotPublished = partner.approvalStatus !== 'APPROVED' || !partner.active

  // If not published and no valid preview mode, show draft page
  if (isNotPublished && !isPreviewMode) {
    const missingRequirements = {
      needsApproval: partner.approvalStatus !== 'APPROVED',
      needsActivation: !partner.active,
      needsCars: partner.cars.length === 0,
      needsService: !partner.enableRideshare && !partner.enableRentals
    }

    return (
      <DraftPage
        hostName={partner.partnerCompanyName || partner.name || 'Partner'}
        missingRequirements={missingRequirements}
      />
    )
  }

  // Fetch platform rental cars if rentals is enabled
  const platformRentalCars = partner.enableRentals ? await getPlatformRentalCars() : []

  // Check if this is the ItWhip platform page (shows ALL reviews)
  const isPlatform = partnerSlug === 'itwhip'

  // Fetch reviews and review stats for this partner
  // ItWhip (platform) sees all reviews, other partners see only their own
  const [partnerReviews, reviewStats] = await Promise.all([
    getPartnerReviews(partner.id, isPlatform),
    getPartnerReviewStats(partner.id, isPlatform)
  ])

  // Check if partner is not yet approved (only visible in preview mode)
  const isPendingApproval = partner.approvalStatus !== 'APPROVED' || !partner.active

  // Host preview mode (with edit capabilities)
  const isHostPreview = !!previewTokenPayload

  const companyName = getDisplayName(partner.partnerCompanyName, partner.name)

  // Calculate stats
  const operatingCities = [...new Set(partner.cars.map((c: any) => c.city ? `${c.city}, ${c.state}` : null).filter(Boolean))]
  const totalTrips = partner.cars.reduce((sum: number, c: any) => sum + (c.totalTrips || 0), 0)
  const totalReviews = reviewStats.totalReviews

  // Calculate avg rating - prefer review-based rating, fallback to car ratings
  const carsWithTrips = partner.cars.filter((c: any) => c.totalTrips > 0 && c.rating > 0)
  const avgRating = reviewStats.avgRating > 0
    ? reviewStats.avgRating
    : (partner.partnerAvgRating ||
      (carsWithTrips.length > 0
        ? carsWithTrips.reduce((sum: number, c: any) => sum + c.rating, 0) / carsWithTrips.length
        : 0))
  const prices = partner.cars.map((c: any) => c.dailyRate).filter((p: number) => p > 0)
  const priceRange = {
    min: prices.length > 0 ? Math.min(...prices) : 0,
    max: prices.length > 0 ? Math.max(...prices) : 0
  }

  const stats = {
    fleetSize: partner.cars.length,
    avgRating,
    totalTrips,
    totalReviews,
    operatingCities: operatingCities.length,
    operatingCityNames: operatingCities as string[],
    priceRange
  }

  const discounts = partner.partnerDiscounts.map(d => ({
    id: d.id,
    code: d.code,
    title: d.title,
    description: d.description,
    percentage: d.percentage,
    expiresAt: d.expiresAt?.toISOString() || null,
    remaining: d.maxUses ? d.maxUses - d.usedCount : null
  }))

  const faqs = partner.partnerFaqs.map(f => ({
    id: f.id,
    question: f.question,
    answer: f.answer
  }))

  // Parse JSON fields
  const badges = partner.partnerBadges as { name: string; imageUrl: string }[] | null
  const benefits = partner.partnerBenefits as { icon: string; title: string; description: string }[] | null
  const policies = partner.partnerPolicies as {
    refundPolicy?: string
    cancellationPolicy?: string
    bookingRequirements?: string
    additionalTerms?: string
  } | null

  // Parse services if available
  const services = partner.partnerServices as {
    id: string
    name: string
    description: string
    icon?: string
    platforms?: string[]
    priceRange?: string
  }[] | null

  // Get available makes from both partner vehicles and platform rentals
  const partnerMakes = partner.cars.map(c => c.make)
  const platformMakes = platformRentalCars.map(c => c.make)
  const availableMakes = [...new Set([...partnerMakes, ...platformMakes])]

  // Calculate vehicle counts by type for tabs
  const rideshareCars = partner.cars.filter(c => c.vehicleType === 'RIDESHARE')
  // For rentals, use platform rental cars (showcasing ALL platform rentals)
  const rentalCarsCount = platformRentalCars.length

  // Service settings - determine which tabs to show
  const serviceSettings = {
    enableRideshare: partner.enableRideshare ?? true,
    enableRentals: partner.enableRentals ?? false,
    rideshareCount: rideshareCars.length,
    rentalCount: rentalCarsCount
  }

  // Transform partner's rideshare vehicles
  const transformedPartnerVehicles = partner.cars
    .filter(c => c.vehicleType === 'RIDESHARE')
    .map(car => {
      const photos = (car.photos as any[])?.filter(p => p?.url).map(p => ({ url: p.url })) || []
      let features: string[] = []
      if (typeof car.features === 'string') {
        try { features = JSON.parse(car.features) } catch { features = [] }
      } else if (Array.isArray(car.features)) {
        features = car.features
      }

      return {
        id: car.id,
        make: car.make,
        model: car.model,
        year: car.year,
        dailyRate: car.dailyRate,
        weeklyRate: car.weeklyRate,
        monthlyRate: car.monthlyRate,
        photos,
        city: car.city,
        state: car.state,
        instantBook: car.instantBook,
        transmission: car.transmission,
        fuelType: car.fuelType,
        seats: car.seats,
        carType: null,
        description: car.description,
        features,
        rating: car.rating,
        totalTrips: car.totalTrips,
        vehicleType: car.vehicleType,
        minTripDuration: car.minTripDuration,
        host: {
          name: companyName,
          profilePhoto: partner.partnerLogo || null
        }
      }
    })

  // Transform platform rental vehicles
  const transformedRentalVehicles = platformRentalCars.map(car => {
    const photos = (car.photos as any[])?.filter(p => p?.url).map(p => ({ url: p.url })) || []
    let features: string[] = []
    if (typeof car.features === 'string') {
      try { features = JSON.parse(car.features) } catch { features = [] }
    } else if (Array.isArray(car.features)) {
      features = car.features
    }

    return {
      id: car.id,
      make: car.make,
      model: car.model,
      year: car.year,
      dailyRate: car.dailyRate,
      weeklyRate: car.weeklyRate,
      monthlyRate: car.monthlyRate,
      photos,
      city: car.city,
      state: car.state,
      instantBook: car.instantBook,
      transmission: car.transmission,
      fuelType: car.fuelType,
      seats: car.seats,
      carType: car.carType,
      description: car.description,
      features,
      rating: car.rating,
      totalTrips: car.totalTrips,
      vehicleType: car.vehicleType,
      minTripDuration: car.minTripDuration,
      host: {
        name: car.host?.partnerCompanyName || car.host?.name || 'Host',
        profilePhoto: car.host?.partnerLogo || car.host?.profilePhoto || null
      }
    }
  })

  // Combine: partner's rideshare + platform rentals
  const transformedVehicles = [...transformedPartnerVehicles, ...transformedRentalVehicles]

  // JSON-LD Structured Data
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'LocalBusiness',
    name: companyName,
    description: partner.partnerBio,
    image: partner.partnerHeroImage || partner.partnerLogo,
    email: partner.partnerSupportEmail || partner.email,
    telephone: partner.partnerSupportPhone || partner.phone,
    address: partner.location ? {
      '@type': 'PostalAddress',
      addressLocality: partner.location
    } : undefined,
    aggregateRating: avgRating > 0 ? {
      '@type': 'AggregateRating',
      ratingValue: avgRating.toFixed(1),
      reviewCount: totalReviews
    } : undefined,
    priceRange: `$${priceRange.min} - $${priceRange.max}`
  }

  return (
    <EditModeWrapper isEditMode={isEditMode} hostId={partner.id}>
      {/* JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Main Site Header */}
      <Header />

      {/* Host Preview Banner - Shown when host is previewing with token */}
      {isHostPreview && (
        <PreviewBanner
          slug={partnerSlug}
          isPublished={!isPendingApproval}
          editMode={isEditMode}
          companyName={companyName}
        />
      )}

      {/* Fleet Preview Banner - Only shown to fleet admins previewing unapproved partners */}
      {isFleetPreview && !isHostPreview && isPendingApproval && (
        <div className="bg-purple-600 text-white px-4 py-3 text-center">
          <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-center gap-2 sm:gap-4">
            <span className="font-medium">
              Fleet Preview Mode - Status: {partner.approvalStatus}
            </span>
            <span className="text-purple-200 text-sm">
              This page is not visible to the public until approved
            </span>
            <a
              href={`/fleet/partners/${partner.id}?key=${FLEET_PREVIEW_KEY}`}
              className="px-3 py-1 bg-white text-purple-600 rounded-lg text-sm font-medium hover:bg-purple-50"
            >
              Back to Partner Details
            </a>
          </div>
        </div>
      )}

      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-16">
        {/* Breadcrumb - Hidden in preview mode */}
        {!isHostPreview && (
          <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 sm:py-3">
              <nav className="flex items-center gap-1.5 sm:gap-2 text-xs sm:text-sm text-gray-500 dark:text-gray-400">
                <Link href="/" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Home
                </Link>
                <span className="text-gray-300 dark:text-gray-600">/</span>
                <Link href="/rideshare" className="hover:text-orange-600 dark:hover:text-orange-400 transition-colors">
                  Rideshare
                </Link>
                <span className="text-gray-300 dark:text-gray-600">/</span>
                <span className="text-gray-900 dark:text-white font-medium truncate max-w-[150px] sm:max-w-none">{companyName}</span>
              </nav>
            </div>
          </div>
        )}

        {/* Partner Hero - FULL WIDTH, no container */}
        <PartnerHero
            companyName={companyName}
            logo={partner.partnerLogo || partner.profilePhoto}
            heroImage={partner.partnerHeroImage}
            bio={partner.partnerBio}
            location={partner.location}
            supportEmail={partner.partnerSupportEmail || partner.email}
            supportPhone={partner.partnerSupportPhone || partner.phone}
            businessHours={partner.businessHours}
            yearEstablished={partner.yearEstablished}
            stats={stats}
            socialLinks={{
              website: partner.partnerWebsite,
              instagram: partner.partnerInstagram,
              facebook: partner.partnerFacebook,
              twitter: partner.partnerTwitter,
              linkedin: partner.partnerLinkedIn,
              tiktok: partner.partnerTikTok,
              youtube: partner.partnerYouTube
            }}
            visibility={{
              showEmail: partner.partnerShowEmail ?? true,
              showPhone: partner.partnerShowPhone ?? true,
              showWebsite: partner.partnerShowWebsite ?? true
            }}
            isStripeVerified={Boolean(partner.stripePayoutsEnabled && partner.stripeDetailsSubmitted)}
          />

        {/* Main Content - WITH container */}
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          {/* Trust Badges */}
          {badges && badges.length > 0 && (
            <TrustBadges badges={badges} />
          )}

          {/* Discount Banner */}
          {discounts.length > 0 && (
            <section className="mt-6">
              <DiscountBanner discounts={discounts} variant="hero" />
            </section>
          )}

          {/* Vehicles Grid with Filters - Client Component */}
          <section className="mt-2">
            <PartnerVehicleGrid
              vehicles={transformedVehicles}
              availableMakes={availableMakes}
              serviceSettings={serviceSettings}
            />
          </section>

          {/* Why Book With Us - Benefits */}
          <PartnerBenefits
            benefits={benefits}
            companyName={companyName}
          />

          {/* Services Offered */}
          <PartnerServices
            services={services}
            companyName={companyName}
            enabledServices={{
              rideshare: partner.enableRideshare ?? true,
              rentals: partner.enableRentals ?? false,
              sales: partner.enableSales ?? false,
              leasing: partner.enableLeasing ?? false,
              rentToOwn: partner.enableRentToOwn ?? false
            }}
          />

          {/* Policies Section */}
          <PartnerPolicies
            policies={policies}
            companyName={companyName}
          />

          {/* FAQs */}
          {faqs.length > 0 && (
            <section className="mt-6 sm:mt-12">
              <FAQAccordion faqs={faqs} />
            </section>
          )}

          {/* Customer Reviews - At bottom for social proof */}
          <PartnerReviews
            reviews={partnerReviews.map(review => {
              // Extract first name only (never show last name)
              const fullName = review.reviewerProfile?.name || 'Guest'
              const firstName = fullName.split(' ')[0]

              return {
                id: review.id,
                reviewerName: firstName,
                reviewerProfileId: review.reviewerProfile?.id || null,
                reviewerPhoto: review.reviewerProfile?.profilePhotoUrl || null,
                rating: review.rating,
                comment: review.comment || '',
                date: review.createdAt.toISOString(),
                // Car info for clickable link
                car: review.car ? {
                  id: review.car.id,
                  make: review.car.make,
                  model: review.car.model,
                  year: review.car.year,
                  city: review.car.city || 'Phoenix'
                } : null,
                helpful: review.helpfulCount,
                // Host response if exists
                hostResponse: review.hostResponse || null,
                hostRespondedAt: review.hostRespondedAt?.toISOString() || null
              }
            })}
            avgRating={avgRating}
            totalReviews={totalReviews}
            companyName={companyName}
          />

          {/* Back to Marketplace */}
          <div className="mt-6 sm:mt-12 text-center">
            <Link
              href="/rideshare"
              className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 dark:text-orange-400 font-medium"
            >
              ← Back to Rideshare Marketplace
            </Link>
          </div>
        </main>
      </div>

      {/* Footer */}
      <Footer />
    </EditModeWrapper>
  )
}
