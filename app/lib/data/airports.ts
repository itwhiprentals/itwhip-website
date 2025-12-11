// app/lib/data/airports.ts
// Airport data for SEO-optimized airport rental pages

export interface AirportData {
  slug: string
  code: string
  name: string
  fullName: string
  h1: string
  metaTitle: string
  metaDescription: string
  heroSubtitle: string
  description: string
  coordinates: { lat: number; lng: number }
  terminals: string[]
  pickupLocations: string[]
  nearbyAreas: string[]
  faqs: Array<{ question: string; answer: string }>
  tips: string[]
}

export const AIRPORT_DATA: Record<string, AirportData> = {
  'phoenix-sky-harbor': {
    slug: 'phoenix-sky-harbor',
    code: 'PHX',
    name: 'Phoenix Sky Harbor',
    fullName: 'Phoenix Sky Harbor International Airport',
    h1: 'Car Rentals at Phoenix Sky Harbor Airport (PHX)',
    metaTitle: 'Phoenix Sky Harbor Airport Car Rental | PHX Pickup | ItWhip',
    metaDescription: 'Skip the rental counter at Phoenix Sky Harbor. Get peer-to-peer car rentals delivered to PHX Terminal 4. Tesla, BMW, Porsche & more from $79/day. Free delivery available.',
    heroSubtitle: 'Skip the rental counter. Get your car delivered curbside at PHX.',
    description: 'Phoenix Sky Harbor International Airport (PHX) is the largest airport in Arizona and one of the busiest in the United States. With ItWhip, you can skip the long rental counter lines and have a local host deliver your car directly to the terminal. Choose from luxury vehicles, SUVs, sports cars, and economy options - all from trusted local owners.',
    coordinates: { lat: 33.4373, lng: -112.0078 },
    terminals: ['Terminal 3', 'Terminal 4'],
    pickupLocations: [
      'Terminal 4 Arrivals (Level 1)',
      'Terminal 3 Arrivals',
      'Rental Car Center',
      'PHX Sky Train Station'
    ],
    nearbyAreas: ['Tempe', 'Downtown Phoenix', 'Scottsdale', 'Mesa', 'Chandler'],
    faqs: [
      {
        question: 'How does airport pickup work at PHX?',
        answer: 'Your host will meet you at your terminal arrivals area. Simply text them when you land, and they\'ll bring the car to you curbside. No shuttle buses or rental counters required.'
      },
      {
        question: 'Is airport delivery free?',
        answer: 'Many hosts offer free delivery to PHX Sky Harbor. Check the listing for delivery fees - most range from free to $25 depending on the host.'
      },
      {
        question: 'What if my flight is delayed?',
        answer: 'Just message your host through the app. They\'ll adjust the pickup time to accommodate your actual arrival. Communication is key!'
      },
      {
        question: 'Can I return the car at the airport?',
        answer: 'Yes! Most hosts allow airport returns. Coordinate with your host for the best drop-off location at PHX.'
      },
      {
        question: 'How early should I book for airport pickup?',
        answer: 'We recommend booking at least 24-48 hours in advance for guaranteed availability, especially during peak travel seasons.'
      }
    ],
    tips: [
      'Book 24-48 hours in advance for best selection',
      'Text your host when you land for smooth pickup',
      'Terminal 4 is the busiest - allow extra time',
      'Consider off-peak hours for faster pickup'
    ]
  },

  'mesa-gateway': {
    slug: 'mesa-gateway',
    code: 'AZA',
    name: 'Mesa Gateway',
    fullName: 'Phoenix-Mesa Gateway Airport',
    h1: 'Car Rentals at Mesa Gateway Airport (AZA)',
    metaTitle: 'Mesa Gateway Airport Car Rental | AZA Pickup | ItWhip',
    metaDescription: 'Rent a car at Mesa Gateway Airport (AZA). Peer-to-peer rentals with curbside delivery. Perfect for East Valley access. Luxury & economy options from $59/day.',
    heroSubtitle: 'The easy alternative to PHX. Curbside delivery at AZA.',
    description: 'Phoenix-Mesa Gateway Airport (AZA) is the convenient alternative to Sky Harbor, serving the East Valley with growing flight options. Located in Mesa, it offers quick access to Gilbert, Chandler, Queen Creek, and Apache Junction. ItWhip hosts deliver directly to the terminal, making your arrival seamless.',
    coordinates: { lat: 33.3078, lng: -111.6550 },
    terminals: ['Main Terminal'],
    pickupLocations: [
      'Main Terminal Arrivals',
      'Short-term Parking Lot',
      'Cell Phone Lot'
    ],
    nearbyAreas: ['Mesa', 'Gilbert', 'Chandler', 'Queen Creek', 'Apache Junction', 'Superstition Mountains'],
    faqs: [
      {
        question: 'Why choose Mesa Gateway over Sky Harbor?',
        answer: 'Mesa Gateway is smaller, less crowded, and offers faster pickup times. It\'s perfect if you\'re staying in the East Valley - Mesa, Gilbert, Chandler, or Queen Creek.'
      },
      {
        question: 'What airlines fly into AZA?',
        answer: 'Allegiant Air is the primary carrier at Mesa Gateway, with Spirit and other carriers offering seasonal routes. Check your airline for current routes.'
      },
      {
        question: 'How far is Mesa Gateway from Phoenix?',
        answer: 'Mesa Gateway is about 30 miles southeast of downtown Phoenix, approximately 35-40 minutes by car depending on traffic.'
      },
      {
        question: 'Is there less wait time at Mesa Gateway?',
        answer: 'Yes! Mesa Gateway is significantly smaller than PHX, meaning shorter walks, less congestion, and faster overall pickup experience.'
      }
    ],
    tips: [
      'Great for East Valley destinations',
      'Usually less crowded than PHX',
      'Perfect for Superstition Mountains trips',
      'Check for spring training season availability'
    ]
  },

  'scottsdale-airport': {
    slug: 'scottsdale-airport',
    code: 'SDL',
    name: 'Scottsdale Airport',
    fullName: 'Scottsdale Airport',
    h1: 'Car Rentals at Scottsdale Airport (SDL)',
    metaTitle: 'Scottsdale Airport Car Rental | SDL Pickup | Luxury Rentals | ItWhip',
    metaDescription: 'Premium car rentals at Scottsdale Airport (SDL). Luxury vehicles, exotic cars & SUVs for private jet arrivals. Bentley, Porsche, BMW available. White-glove service.',
    heroSubtitle: 'Luxury car rentals for private aviation. Arrive in style.',
    description: 'Scottsdale Airport (SDL) is a premier general aviation facility serving private jets and charter flights. Located in the heart of Scottsdale\'s Airpark, it\'s the gateway to world-class resorts, golf courses, and the luxury lifestyle of North Scottsdale. ItWhip offers premium vehicles to match your arrival - from Bentleys to Porsches.',
    coordinates: { lat: 33.6229, lng: -111.9106 },
    terminals: ['General Aviation Terminal', 'FBO Terminals'],
    pickupLocations: [
      'FBO Cutter Aviation',
      'FBO Ross Aviation',
      'Scottsdale Airpark',
      'Main Terminal'
    ],
    nearbyAreas: ['North Scottsdale', 'Paradise Valley', 'Kierland', 'Grayhawk', 'DC Ranch', 'Troon'],
    faqs: [
      {
        question: 'Is Scottsdale Airport for commercial flights?',
        answer: 'Scottsdale Airport primarily serves private jets, charter flights, and general aviation. For commercial flights, you\'ll use Phoenix Sky Harbor (PHX) or Mesa Gateway (AZA).'
      },
      {
        question: 'What luxury cars are available at SDL?',
        answer: 'Our Scottsdale hosts offer premium vehicles including Bentley, Porsche, Mercedes-Benz, BMW, and exotic options like Ferrari and Lamborghini - perfect for the Scottsdale lifestyle.'
      },
      {
        question: 'Can you meet me at my FBO?',
        answer: 'Absolutely! Hosts can coordinate directly with your FBO (Cutter, Ross, etc.) to have your vehicle waiting when you arrive at the private terminal.'
      },
      {
        question: 'What\'s nearby Scottsdale Airport?',
        answer: 'SDL is surrounded by world-class resorts (Four Seasons, Fairmont Princess), championship golf courses (TPC Scottsdale), and upscale shopping at Kierland Commons.'
      }
    ],
    tips: [
      'Coordinate with your FBO for seamless handoff',
      'Book luxury vehicles in advance during events',
      'Perfect for golf trips and resort stays',
      'Consider a convertible for desert drives'
    ]
  }
}

export function getAirportBySlug(slug: string): AirportData | undefined {
  return AIRPORT_DATA[slug]
}

export function getAllAirportSlugs(): string[] {
  return Object.keys(AIRPORT_DATA)
}

export const AIRPORT_LIST = Object.values(AIRPORT_DATA)
