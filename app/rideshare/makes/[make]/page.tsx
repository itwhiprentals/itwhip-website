// app/rideshare/makes/[make]/page.tsx
import { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import CompactCarCard from '@/app/components/cards/CompactCarCard'
import prisma from '@/app/lib/database/prisma'
import { generateCarUrl } from '@/app/lib/utils/urls'
import {
  IoCarOutline,
  IoChevronForwardOutline,
  IoHomeOutline,
  IoShieldCheckmarkOutline,
  IoCheckmarkCircle,
  IoCarSportOutline,
  IoSpeedometerOutline,
  IoWalletOutline,
  IoCashOutline,
  IoLeafOutline,
  IoStarOutline
} from 'react-icons/io5'

// ISR - Revalidate every 60 seconds
export const revalidate = 60

// ============================================
// RIDESHARE MAKE SEO DATA
// ============================================
const RIDESHARE_MAKE_SEO_DATA: Record<string, {
  displayName: string
  dbValue: string
  description: string
  longDescription: string
  country: string
  keywords: string[]
  popularModels: string[]
  rideshareAdvantages: string[]
  weeklyPriceRange: string
  logo: string
  faqs: { question: string; answer: string }[]
}> = {
  'toyota': {
    displayName: 'Toyota',
    dbValue: 'Toyota',
    description: 'Rent Toyota rideshare vehicles in Phoenix. Camry, Corolla, and Prius approved for Uber & Lyft. Industry-leading reliability for gig drivers.',
    longDescription: 'Toyota is the #1 choice for rideshare drivers nationwide. Our Phoenix Toyota rideshare fleet includes the legendary Camry, fuel-efficient Prius, and reliable Corolla—all pre-approved for Uber and Lyft with full commercial insurance coverage.',
    country: 'Japan',
    keywords: ['toyota rideshare rental phoenix', 'camry uber rental', 'prius lyft rental phoenix', 'toyota uber car phoenix', 'rideshare car rental arizona', 'toyota gig driver rental'],
    popularModels: ['Camry', 'Corolla', 'Prius', 'RAV4', 'Camry Hybrid'],
    rideshareAdvantages: ['#1 rideshare choice nationwide', 'Industry-leading reliability', 'Excellent fuel economy', 'Low maintenance costs', 'High resale value'],
    weeklyPriceRange: '$299-399/week',
    logo: '/logos/makes/toyota.png',
    faqs: [
      { question: 'Why is Toyota the most popular brand for Uber and Lyft drivers?', answer: 'Toyota vehicles consistently rank #1 among rideshare drivers due to their legendary reliability, excellent fuel economy (especially hybrids like the Prius), low maintenance costs, and high passenger comfort ratings. The Camry and Prius are the two most common vehicles seen on Uber and Lyft platforms nationwide.' },
      { question: 'What Toyota models are approved for rideshare in Phoenix?', answer: 'All Toyota sedans and SUVs in our fleet are pre-approved for both Uber and Lyft in Phoenix. Popular choices include the Camry (most requested), Corolla (budget-friendly), Prius (best fuel economy), and RAV4 (for UberXL/Lyft XL). Each vehicle meets platform requirements for year, doors, and seating.' },
      { question: 'How much can I earn driving Uber/Lyft with a Toyota rental?', answer: 'Phoenix rideshare drivers typically earn $1,200-2,500+ per week gross before expenses. With a Toyota\'s excellent fuel economy (30-50+ MPG depending on model), your net earnings are maximized. Many drivers report covering their weekly rental cost within the first 2-3 days of driving.' },
      { question: 'Does the Toyota rideshare rental include insurance for Uber and Lyft?', answer: 'Yes! All our rideshare rentals include comprehensive commercial insurance that covers you while driving for Uber, Lyft, or both platforms simultaneously. This is full coverage—not a gap policy—so you\'re protected from pickup to dropoff.' },
      { question: 'Can I use this Toyota for both Uber and Lyft at the same time?', answer: 'Absolutely! Our rideshare rentals allow you to drive for multiple platforms including Uber, Lyft, DoorDash, Instacart, and Amazon Flex. Maximize your earnings by switching between apps based on demand and surge pricing.' },
      { question: 'What\'s included in the weekly Toyota rideshare rental?', answer: 'Every rental includes: commercial rideshare insurance, unlimited miles, 24/7 roadside assistance, regular maintenance, and vehicle registration. You just pay for gas. We also provide a pre-inspection report documenting the vehicle\'s condition for your protection.' }
    ]
  },
  'honda': {
    displayName: 'Honda',
    dbValue: 'Honda',
    description: 'Rent Honda rideshare vehicles in Phoenix. Accord and Civic approved for Uber & Lyft. Driver\'s choice for comfort and reliability.',
    longDescription: 'Honda is the driver\'s choice for rideshare. Our Phoenix Honda fleet features the spacious Accord, efficient Civic, and versatile CR-V—all approved for Uber and Lyft with comprehensive commercial insurance included.',
    country: 'Japan',
    keywords: ['honda rideshare rental phoenix', 'accord uber rental', 'civic lyft rental phoenix', 'honda uber car phoenix', 'rideshare honda arizona', 'honda gig driver rental'],
    popularModels: ['Accord', 'Civic', 'CR-V', 'Accord Hybrid', 'HR-V'],
    rideshareAdvantages: ['Excellent passenger comfort', 'Reliable VTEC engines', 'Smooth ride quality', 'Strong resale value', 'Low cost of ownership'],
    weeklyPriceRange: '$289-389/week',
    logo: '/logos/makes/honda.png',
    faqs: [
      { question: 'Why do rideshare drivers prefer Honda vehicles?', answer: 'Honda vehicles are prized by rideshare drivers for their exceptional reliability, smooth ride quality, and spacious interiors. The Accord consistently receives 5-star passenger ratings due to its comfortable back seat, quiet cabin, and refined driving experience. Honda\'s VTEC engines are known for longevity—many reach 300,000+ miles.' },
      { question: 'What Honda models work best for Uber and Lyft in Phoenix?', answer: 'The Honda Accord is our most popular rideshare vehicle—passengers love the spacious interior and smooth ride. The Civic offers excellent fuel economy for budget-conscious drivers, while the CR-V qualifies for UberXL/Lyft XL with its extra space. All Honda models in our fleet meet platform requirements.' },
      { question: 'How does Honda fuel economy compare for rideshare driving?', answer: 'Honda vehicles deliver excellent fuel economy: Civic averages 32-36 MPG, Accord 30-33 MPG, and Accord Hybrid reaches 48 MPG. In Phoenix\'s stop-and-go traffic, this translates to significant savings—typically $50-100+ per week compared to less efficient vehicles.' },
      { question: 'Is the Honda rental approved for both Uber and Lyft?', answer: 'Yes! Every Honda in our rideshare fleet is pre-approved for Uber, Lyft, and other gig platforms. We handle all the paperwork and ensure each vehicle meets platform requirements for year, condition, and safety features.' },
      { question: 'What insurance coverage comes with the Honda rideshare rental?', answer: 'All rentals include comprehensive commercial insurance covering rideshare driving. This includes liability, collision, comprehensive, and uninsured motorist coverage while you\'re on the platform. No gaps in coverage—you\'re protected from the moment you accept a ride until dropoff.' },
      { question: 'Can I switch between different gig apps with my Honda rental?', answer: 'Yes! Our rideshare rentals support multi-app driving. Use your Honda for Uber, Lyft, DoorDash, UberEats, Instacart, Amazon Flex, and more. Many drivers maximize earnings by running multiple apps based on demand.' }
    ]
  },
  'hyundai': {
    displayName: 'Hyundai',
    dbValue: 'Hyundai',
    description: 'Rent Hyundai rideshare vehicles in Phoenix. Elantra and Sonata approved for Uber & Lyft. Best value for new rideshare drivers.',
    longDescription: 'Hyundai offers the best value for rideshare drivers. Our Phoenix Hyundai fleet includes the efficient Elantra, refined Sonata, and spacious Santa Fe—all with modern features, excellent warranties, and full rideshare approval.',
    country: 'South Korea',
    keywords: ['hyundai rideshare rental phoenix', 'elantra uber rental', 'sonata lyft rental phoenix', 'hyundai uber car phoenix', 'cheap rideshare rental arizona', 'hyundai gig driver rental'],
    popularModels: ['Elantra', 'Sonata', 'Tucson', 'Elantra Hybrid', 'Santa Fe'],
    rideshareAdvantages: ['Best value pricing', 'Modern tech features', 'Excellent warranty coverage', 'Fuel efficient', 'Comfortable interiors'],
    weeklyPriceRange: '$269-359/week',
    logo: '/logos/makes/hyundai.png',
    faqs: [
      { question: 'Why is Hyundai a great choice for new rideshare drivers?', answer: 'Hyundai offers the best value entry point for rideshare. Their vehicles feature modern technology, excellent fuel economy, and comfortable interiors at lower price points than competitors. The Elantra and Sonata both earn high passenger ratings while keeping your operating costs low.' },
      { question: 'What Hyundai models are available for rideshare in Phoenix?', answer: 'Our Hyundai rideshare fleet includes the Elantra (most affordable option), Sonata (premium comfort), Tucson (for UberXL), and Elantra Hybrid (best fuel economy). All vehicles are 2020 or newer and meet Uber/Lyft requirements.' },
      { question: 'How much money can I save with Hyundai\'s fuel efficiency?', answer: 'Hyundai vehicles are engineered for efficiency. The Elantra achieves 33-37 MPG, Sonata 28-32 MPG, and Elantra Hybrid hits 54 MPG combined. At Phoenix gas prices, efficient drivers save $75-150 per week on fuel costs compared to older or larger vehicles.' },
      { question: 'Does the Hyundai rental include rideshare insurance?', answer: 'Yes! All Hyundai rideshare rentals include comprehensive commercial insurance covering Uber, Lyft, and delivery platforms. You\'re fully covered from pickup to dropoff with no gaps in protection.' },
      { question: 'What modern features do Hyundai rideshare vehicles include?', answer: 'Our Hyundai fleet includes vehicles with Apple CarPlay/Android Auto, backup cameras, blind spot monitoring, lane keeping assist, and USB charging ports for passengers. These features help you earn higher ratings and more tips.' },
      { question: 'Can I use the Hyundai for food delivery apps too?', answer: 'Absolutely! Your Hyundai rental can be used for Uber, Lyft, DoorDash, UberEats, Grubhub, Instacart, Shipt, and Amazon Flex. Mix rideshare with delivery to maximize your daily earnings.' }
    ]
  },
  'kia': {
    displayName: 'Kia',
    dbValue: 'Kia',
    description: 'Rent Kia rideshare vehicles in Phoenix. Forte and K5 approved for Uber & Lyft. Most affordable rideshare option in Arizona.',
    longDescription: 'Kia provides the most affordable path to rideshare driving. Our Phoenix Kia fleet features the budget-friendly Forte, stylish K5, and versatile Sportage—all with impressive features, great fuel economy, and full rideshare approval.',
    country: 'South Korea',
    keywords: ['kia rideshare rental phoenix', 'forte uber rental', 'k5 lyft rental phoenix', 'kia uber car phoenix', 'affordable rideshare rental arizona', 'cheapest uber rental phoenix'],
    popularModels: ['Forte', 'K5', 'Sportage', 'Soul', 'Seltos'],
    rideshareAdvantages: ['Most affordable rates', 'Award-winning design', 'Excellent standard features', 'Great fuel economy', 'Comprehensive warranty'],
    weeklyPriceRange: '$249-339/week',
    logo: '/logos/makes/kia.png',
    faqs: [
      { question: 'Why is Kia the most affordable rideshare rental option?', answer: 'Kia vehicles offer exceptional value with lower operating costs than competitors. The Forte and K5 deliver great fuel economy, low maintenance costs, and reliable performance at our lowest weekly rates. This means you keep more of every dollar you earn driving rideshare.' },
      { question: 'What Kia models qualify for Uber and Lyft?', answer: 'Our Kia rideshare fleet includes the Forte (most affordable), K5 (premium sedan), Sportage (for UberXL/Lyft XL), and Soul (compact and efficient). All vehicles meet platform age and condition requirements, with modern safety features included.' },
      { question: 'How quickly can I pay off my Kia rental with rideshare earnings?', answer: 'Most drivers cover their Kia rental in the first 2 days of driving. At $249/week, you only need 25-30 rides to break even. Everything after that is profit. Phoenix\'s strong rideshare demand means active drivers can earn $800-1,500+ per week after rental costs.' },
      { question: 'Is the Kia covered for rideshare insurance?', answer: 'Yes! Every Kia rental includes comprehensive commercial insurance for Uber, Lyft, and delivery platforms. No additional insurance purchase required—you\'re fully covered while working any gig app.' },
      { question: 'What features come standard in Kia rideshare vehicles?', answer: 'Kia vehicles punch above their weight in features. Expect Apple CarPlay/Android Auto, backup camera, USB ports for passengers, Bluetooth, and modern safety tech. The K5 adds a premium interior that earns higher passenger ratings.' },
      { question: 'Can I start driving immediately after picking up my Kia?', answer: 'Yes! We handle all the vehicle registration and insurance documentation. Once you pick up your Kia, you can immediately go online with Uber, Lyft, or any delivery app. We\'ll provide all documents needed for platform verification.' }
    ]
  },
  'nissan': {
    displayName: 'Nissan',
    dbValue: 'Nissan',
    description: 'Rent Nissan rideshare vehicles in Phoenix. Altima and Sentra approved for Uber & Lyft. Fleet-proven reliability for professional drivers.',
    longDescription: 'Nissan is fleet-proven for professional rideshare driving. Our Phoenix Nissan fleet includes the comfortable Altima, efficient Sentra, and spacious Rogue—trusted by commercial fleets and individual drivers alike.',
    country: 'Japan',
    keywords: ['nissan rideshare rental phoenix', 'altima uber rental', 'sentra lyft rental phoenix', 'nissan uber car phoenix', 'rideshare nissan arizona', 'nissan gig driver rental'],
    popularModels: ['Altima', 'Sentra', 'Rogue', 'Versa', 'Kicks'],
    rideshareAdvantages: ['Fleet-proven durability', 'CVT transmission efficiency', 'Comfortable seating', 'Good fuel economy', 'Affordable maintenance'],
    weeklyPriceRange: '$259-349/week',
    logo: '/logos/makes/nissan.png',
    faqs: [
      { question: 'Why do fleet operators choose Nissan for rideshare?', answer: 'Nissan vehicles are proven in commercial fleet applications. The Altima and Sentra offer durable CVT transmissions, comfortable interiors, and reliable performance over high mileage. Many fleet operators choose Nissan specifically for rideshare due to their balance of comfort, efficiency, and longevity.' },
      { question: 'What Nissan models are available for rideshare in Phoenix?', answer: 'Our Nissan rideshare fleet includes the Altima (mid-size comfort), Sentra (compact efficiency), Rogue (for UberXL/Lyft XL), and Kicks (urban nimble). All vehicles are rideshare-approved and maintained to fleet standards.' },
      { question: 'How does the Nissan CVT transmission perform for rideshare?', answer: 'Nissan\'s CVT transmission is optimized for fuel efficiency in stop-and-go driving—exactly what rideshare requires. Drivers report smooth acceleration, quiet operation, and fuel economy improvements of 10-15% compared to traditional automatics. Modern Nissan CVTs are proven reliable to 200,000+ miles.' },
      { question: 'Is my Nissan rental covered for Uber and Lyft driving?', answer: 'Yes! All Nissan rideshare rentals include comprehensive commercial insurance covering both platforms plus delivery apps. Full coverage from pickup to dropoff with no gaps in protection.' },
      { question: 'What technology features do Nissan rideshare vehicles include?', answer: 'Our Nissan fleet includes vehicles with NissanConnect infotainment, Apple CarPlay/Android Auto, Pro-PILOT assist (on select models), around-view monitor, and USB/wireless charging. These features enhance both driver convenience and passenger experience.' },
      { question: 'How does Nissan maintenance work with the rental?', answer: 'All routine maintenance is included in your rental—oil changes, tire rotations, brake inspections, and more. We maintain our Nissans to fleet standards, ensuring reliable performance. If any issue arises, our 24/7 roadside assistance has you covered.' }
    ]
  },
  'chevrolet': {
    displayName: 'Chevrolet',
    dbValue: 'Chevrolet',
    description: 'Rent Chevrolet rideshare vehicles in Phoenix. Malibu and Equinox approved for Uber & Lyft. American-made reliability for Arizona drivers.',
    longDescription: 'Chevrolet brings American reliability to rideshare. Our Phoenix Chevy fleet includes the smooth-riding Malibu, versatile Equinox, and efficient Trax—American-made vehicles trusted by rideshare drivers across the country.',
    country: 'USA',
    keywords: ['chevrolet rideshare rental phoenix', 'malibu uber rental', 'equinox lyft rental phoenix', 'chevy uber car phoenix', 'american rideshare car arizona', 'chevrolet gig driver rental'],
    popularModels: ['Malibu', 'Equinox', 'Trax', 'Cruze', 'Bolt EV'],
    rideshareAdvantages: ['American-made quality', 'Comfortable ride', 'Good fuel economy', 'Strong dealer network', 'Reliable performance'],
    weeklyPriceRange: '$269-369/week',
    logo: '/logos/makes/chevrolet.png',
    faqs: [
      { question: 'Why choose Chevrolet for rideshare driving?', answer: 'Chevrolet offers American-made reliability with a strong dealer network for support. The Malibu provides a smooth, quiet ride that passengers appreciate, while the Equinox offers extra space for UberXL/Lyft XL earnings. Chevy vehicles are known for dependable performance and comfortable interiors.' },
      { question: 'What Chevrolet models are approved for rideshare in Phoenix?', answer: 'Our Chevrolet rideshare fleet includes the Malibu (sedan comfort), Equinox (versatile SUV), Trax (compact efficient), and select Bolt EVs (zero gas costs). All meet Uber and Lyft platform requirements and are maintained to professional fleet standards.' },
      { question: 'How does the Chevy Malibu perform for full-time rideshare?', answer: 'The Malibu is engineered for comfort on long drives. Features like a quiet cabin, smooth suspension, and spacious rear seat earn high passenger ratings. The turbocharged engine delivers good power while achieving 29-36 MPG, making it economical for full-time rideshare work.' },
      { question: 'Is the Chevrolet rental covered for commercial rideshare use?', answer: 'Yes! All Chevrolet rentals include comprehensive commercial insurance covering Uber, Lyft, DoorDash, and other gig platforms. You\'re protected with full coverage—liability, collision, and comprehensive—while working.' },
      { question: 'What about the Chevy Bolt EV for rideshare?', answer: 'Select locations offer the Bolt EV for rideshare drivers wanting zero gas costs. With 259 miles of range, you can complete a full day of driving on one charge. Combined with Phoenix\'s charging infrastructure and our included insurance, the Bolt offers a unique proposition for eco-conscious drivers.' },
      { question: 'What support does Chevrolet\'s dealer network provide?', answer: 'Chevrolet has one of the largest dealer networks in America, meaning parts and service are readily available. For routine maintenance included in your rental, we handle everything at certified facilities. For unexpected issues, 24/7 roadside assistance gets you back on the road fast.' }
    ]
  }
}

// Get other makes for related section
const getRelatedMakes = (currentMake: string) => {
  return Object.entries(RIDESHARE_MAKE_SEO_DATA)
    .filter(([key]) => key !== currentMake)
    .map(([key, data]) => ({
      slug: key,
      name: data.displayName,
      logo: data.logo,
      price: data.weeklyPriceRange.split('-')[0]
    }))
}

// No generateStaticParams — pages render on-demand via ISR (revalidate = 60)

// Generate metadata
export async function generateMetadata({
  params
}: {
  params: Promise<{ make: string }>
}): Promise<Metadata> {
  const { make } = await params
  const makeData = RIDESHARE_MAKE_SEO_DATA[make.toLowerCase()]

  if (!makeData) {
    return { title: 'Make Not Found - ItWhip Rideshare' }
  }

  const title = `${makeData.displayName} Rideshare Rentals Phoenix | Uber & Lyft Approved | ItWhip`
  const description = makeData.description

  return {
    title,
    description,
    keywords: makeData.keywords,
    openGraph: {
      title,
      description,
      url: `https://itwhip.com/rideshare/makes/${make}`,
      siteName: 'ItWhip',
      locale: 'en_US',
      type: 'website',
      images: [{
        url: 'https://itwhip.com/og-rideshare.jpg',
        width: 1200,
        height: 630,
        alt: `${makeData.displayName} Rideshare Rentals Phoenix`
      }]
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: ['https://itwhip.com/og-rideshare.jpg']
    },
    alternates: {
      canonical: `https://itwhip.com/rideshare/makes/${make}`
    },
    robots: {
      index: true,
      follow: true
    }
  }
}

// Page component
export default async function RideshareMakePage({
  params
}: {
  params: Promise<{ make: string }>
}) {
  const { make } = await params
  const makeData = RIDESHARE_MAKE_SEO_DATA[make.toLowerCase()]

  if (!makeData) {
    notFound()
  }

  // Fetch rideshare cars of this make from database
  const cars = await prisma.rentalCar.findMany({
    where: {
      isActive: true,
      vehicleType: 'RIDESHARE',
      make: {
        equals: makeData.dbValue,
        mode: 'insensitive'
      }
    },
    select: {
      id: true,
      make: true,
      model: true,
      year: true,
      carType: true,
      vehicleType: true,
      dailyRate: true,
      weeklyRate: true,
      city: true,
      state: true,
      latitude: true,
      longitude: true,
      rating: true,
      totalTrips: true,
      instantBook: true,
      fuelType: true,
      esgScore: true,
      photos: {
        select: { url: true },
        orderBy: { order: 'asc' },
        take: 1
      },
      host: {
        select: {
          id: true,
          name: true,
          profilePhoto: true,
          rating: true
        }
      }
    },
    orderBy: [
      { weeklyRate: 'asc' },
      { rating: 'desc' }
    ],
    take: 24
  })

  // Transform cars for display
  const transformedCars = cars.map(car => ({
    ...car,
    url: generateCarUrl(car)
  }))

  const relatedMakes = getRelatedMakes(make.toLowerCase())
  const minWeeklyRate = cars.length > 0
    ? Math.min(...cars.filter(c => c.weeklyRate).map(c => c.weeklyRate!))
    : null

  // JSON-LD Schemas
  const breadcrumbSchema = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: 'https://itwhip.com' },
      { '@type': 'ListItem', position: 2, name: 'Rideshare', item: 'https://itwhip.com/rideshare' },
      { '@type': 'ListItem', position: 3, name: makeData.displayName, item: `https://itwhip.com/rideshare/makes/${make}` }
    ]
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: makeData.faqs.map(faq => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer
      }
    }))
  }

  const autoRentalSchema = {
    '@context': 'https://schema.org',
    '@type': 'AutoRental',
    name: `ItWhip ${makeData.displayName} Rideshare Rentals`,
    description: makeData.description,
    url: `https://itwhip.com/rideshare/makes/${make}`,
    areaServed: {
      '@type': 'City',
      name: 'Phoenix',
      containedInPlace: { '@type': 'State', name: 'Arizona' }
    },
    priceRange: makeData.weeklyPriceRange,
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: '4.8',
      reviewCount: '156'
    }
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(autoRentalSchema) }}
      />

      <Header />

      <main className="min-h-screen bg-gray-50 dark:bg-black">
        {/* Breadcrumbs */}
        <div className="bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-3">
            <nav className="flex items-center text-sm text-gray-500 dark:text-gray-400">
              <Link href="/" className="hover:text-gray-700 dark:hover:text-gray-300 flex items-center">
                <IoHomeOutline className="w-4 h-4" />
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 mx-2" />
              <Link href="/rideshare" className="hover:text-gray-700 dark:hover:text-gray-300">
                Rideshare
              </Link>
              <IoChevronForwardOutline className="w-4 h-4 mx-2" />
              <span className="text-gray-900 dark:text-white font-medium">{makeData.displayName}</span>
            </nav>
          </div>
        </div>

        {/* Hero Section */}
        <section className="bg-gradient-to-br from-orange-500 to-orange-600 text-white py-6 sm:py-8">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row items-center gap-4">
              {/* Logo */}
              <div className="w-20 h-20 sm:w-24 sm:h-24 flex items-center justify-center">
                <img
                  src={makeData.logo}
                  alt={`${makeData.displayName} logo`}
                  className="w-full h-full object-contain drop-shadow-lg"
                />
              </div>

              {/* Content */}
              <div className="text-center md:text-left flex-1">
                <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-1.5 mb-3">
                  <IoShieldCheckmarkOutline className="w-4 h-4" />
                  <span className="text-sm font-medium">Uber & Lyft Approved</span>
                </div>
                <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-2 leading-tight">
                  {makeData.displayName} Rideshare Rentals
                </h1>
                <p className="text-sm sm:text-base text-orange-100 max-w-xl mb-3">
                  {makeData.longDescription}
                </p>
                <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 text-xs sm:text-sm">
                  {minWeeklyRate && (
                    <div className="flex items-center gap-1.5 bg-white/20 rounded-lg px-3 py-1.5">
                      <span className="font-bold">From ${minWeeklyRate}</span>
                      <span className="text-orange-100">/week</span>
                    </div>
                  )}
                  <div className="flex items-center gap-1.5 text-orange-100">
                    <IoCarSportOutline className="w-4 h-4" />
                    <span>{cars.length} vehicles available</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Why This Make Section */}
        <section className="py-4 sm:py-5 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3 text-center">
              Why {makeData.displayName} for Rideshare?
            </h2>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-2 sm:gap-3">
              {makeData.rideshareAdvantages.map((advantage, idx) => (
                <div key={idx} className="flex items-center gap-1.5 bg-gray-50 dark:bg-gray-800 rounded-lg p-2 sm:p-2.5">
                  <IoCheckmarkCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                  <span className="text-xs sm:text-sm text-gray-700 dark:text-gray-300">{advantage}</span>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Vehicle Grid or No Cars Message */}
        <section className="py-4 sm:py-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white">
                Available {makeData.displayName} Rideshare Vehicles
              </h2>
              {cars.length > 0 && (
                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {cars.length} vehicles
                </span>
              )}
            </div>

            {transformedCars.length > 0 ? (
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                {transformedCars.map((car) => (
                  <CompactCarCard key={car.id} car={car} />
                ))}
              </div>
            ) : (
              <div className="text-center py-10 bg-white dark:bg-gray-900 rounded-lg">
                <IoCarOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <h3 className="text-base sm:text-lg font-semibold text-gray-900 dark:text-white mb-1.5">
                  No {makeData.displayName} Rideshare Vehicles Available
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-4 max-w-md mx-auto">
                  We&apos;re working on adding more {makeData.displayName} vehicles to our rideshare fleet.
                  Check back soon or browse other makes below.
                </p>
                <Link
                  href="/rideshare"
                  className="inline-flex items-center px-5 py-2.5 bg-orange-500 text-white rounded-lg text-sm font-semibold hover:bg-orange-600 transition"
                >
                  Browse All Rideshare Vehicles
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* Popular Models */}
        <section className="py-4 sm:py-5 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-3">
              Popular {makeData.displayName} Models for Rideshare
            </h2>
            <div className="flex flex-wrap gap-2">
              {makeData.popularModels.map((model) => (
                <div
                  key={model}
                  className="px-3 py-1.5 bg-orange-50 dark:bg-orange-900/20 text-orange-700 dark:text-orange-300 rounded-full text-sm font-medium"
                >
                  {makeData.displayName} {model}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section className="py-6 sm:py-8 bg-gray-50 dark:bg-black">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-lg sm:text-xl font-bold text-gray-900 dark:text-white mb-4 text-center">
              {makeData.displayName} Rideshare Rental FAQs
            </h2>
            <div className="space-y-3">
              {makeData.faqs.map((faq, idx) => (
                <div
                  key={idx}
                  className="bg-white dark:bg-gray-900 rounded-lg p-4 shadow-sm border border-gray-200 dark:border-gray-800"
                >
                  <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white mb-2">
                    {faq.question}
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-600 dark:text-gray-400 leading-relaxed">
                    {faq.answer}
                  </p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Related Makes */}
        <section className="py-4 sm:py-6 bg-white dark:bg-gray-900">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-base sm:text-lg font-bold text-gray-900 dark:text-white mb-4">
              Other Rideshare Makes
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-3">
              {relatedMakes.map((relMake) => (
                <Link
                  key={relMake.slug}
                  href={`/rideshare/makes/${relMake.slug}`}
                  className="group bg-gray-50 dark:bg-gray-800 rounded-lg p-3 text-center hover:bg-orange-50 dark:hover:bg-orange-900/20 transition border border-gray-200 dark:border-gray-700 hover:border-orange-300 dark:hover:border-orange-500"
                >
                  <div className="w-10 h-10 mx-auto mb-1.5">
                    <img
                      src={relMake.logo}
                      alt={relMake.name}
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white group-hover:text-orange-600 dark:group-hover:text-orange-400">
                    {relMake.name}
                  </div>
                  <div className="text-xs text-orange-600 dark:text-orange-400 font-semibold">
                    {relMake.price}/week
                  </div>
                </Link>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-6 sm:py-8 bg-gradient-to-r from-orange-500 to-orange-600">
          <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-lg sm:text-xl font-bold text-white mb-2">
              Ready to Start Earning with {makeData.displayName}?
            </h2>
            <p className="text-sm text-orange-100 mb-4">
              All rentals include commercial insurance, unlimited miles, and 24/7 support.
            </p>
            <div className="flex flex-col sm:flex-row gap-2 justify-center">
              <Link
                href="/rideshare"
                className="inline-block px-6 py-2.5 bg-white text-orange-600 rounded-lg text-sm font-bold hover:bg-orange-50 transition shadow-lg"
              >
                Browse All Rideshare Vehicles
              </Link>
              <Link
                href="/rideshare/apply"
                className="inline-block px-6 py-2.5 bg-orange-400 text-white rounded-lg text-sm font-bold hover:bg-orange-300 transition"
              >
                Apply to Drive
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </>
  )
}
