// app/lib/data/use-cases.ts
// Use case data for rental scenario pages

export interface UseCaseData {
  slug: string
  title: string
  h1: string
  metaTitle: string
  metaDescription: string
  heroSubtitle: string
  content: string
  benefits: string[]
  priceRange: string
  durationSuggestion: string
  idealCarTypes: string[]
  filters: {
    minDays?: number
    maxDays?: number
    carTypes?: string[]
    features?: string[]
    priceMax?: number
  }
  faqs: Array<{ question: string; answer: string }>
  tips: string[]
}

export const USE_CASE_DATA: Record<string, UseCaseData> = {
  'long-term': {
    slug: 'long-term',
    title: 'Long-Term Car Rentals',
    h1: 'Long-Term Car Rentals in Phoenix | Weekly & Monthly',
    metaTitle: 'Long-Term Car Rentals Phoenix | Weekly & Monthly | ItWhip',
    metaDescription: 'Save up to 30% on long-term car rentals in Phoenix. Weekly and monthly rates from local owners. SUVs, sedans, luxury cars. No contracts, flexible terms.',
    heroSubtitle: 'Need a car for a week, month, or longer? Save big with our long-term rental rates.',
    content: 'Whether you\'re relocating to Phoenix, here for an extended work assignment, or just need wheels for a few weeks, long-term rentals offer the best value. Our hosts offer significant discounts for weekly and monthly bookings - typically 10-20% off daily rates for weekly, and 20-30% off for monthly rentals.',
    benefits: [
      'Save 20-30% with monthly rates',
      'No long-term contracts required',
      'Flexible pickup and return',
      'Insurance included on all rentals',
      'Wide variety of vehicles available',
      'Free delivery to your location'
    ],
    priceRange: '$45-150/day (with discounts)',
    durationSuggestion: '7-30+ days',
    idealCarTypes: ['SEDAN', 'SUV', 'ELECTRIC'],
    filters: {
      minDays: 7,
      carTypes: ['SEDAN', 'SUV', 'ELECTRIC']
    },
    faqs: [
      {
        question: 'How much can I save with a long-term rental?',
        answer: 'Most hosts offer 10-20% off for weekly rentals (7+ days) and 20-30% off for monthly rentals (30+ days). The exact discount is shown on each listing.'
      },
      {
        question: 'Is there a maximum rental duration?',
        answer: 'Most hosts allow rentals up to 30 days, and many are happy to extend beyond that. Just message the host to arrange longer rentals.'
      },
      {
        question: 'Can I extend my long-term rental?',
        answer: 'Yes! Contact your host through the app to request an extension. Subject to availability, most extensions are approved within hours.'
      },
      {
        question: 'What\'s included in a long-term rental?',
        answer: 'All rentals include $1M liability insurance. Most include a daily mileage allowance (typically 150-250 miles/day). Additional miles and protection plans are optional.'
      },
      {
        question: 'Do I need to sign a contract?',
        answer: 'No long-term contracts! Your rental agreement covers your booking period. Extend or end early with flexible policies.'
      }
    ],
    tips: [
      'Book 7+ days to unlock weekly discounts',
      'Message hosts about monthly rates',
      'Consider sedans for best fuel efficiency',
      'Check mileage limits for extended trips'
    ]
  },

  'weekend': {
    slug: 'weekend',
    title: 'Weekend Car Rentals',
    h1: 'Weekend Car Rentals in Phoenix | Friday-Sunday Specials',
    metaTitle: 'Weekend Car Rentals Phoenix | Fri-Sun Deals | ItWhip',
    metaDescription: 'Weekend car rentals in Phoenix from $49/day. Perfect for getaways to Sedona, Grand Canyon, or Scottsdale nightlife. Sports cars, convertibles, SUVs available.',
    heroSubtitle: 'Escape for the weekend in style. Pick up Friday, return Sunday.',
    content: 'Phoenix weekends are made for adventure. Head to Sedona\'s red rocks, explore the Grand Canyon, hit the Scottsdale clubs, or just cruise the desert highways. Our weekend rentals give you the freedom to make the most of your days off - whether you want a convertible to feel the Arizona sun or an SUV for a camping trip.',
    benefits: [
      'Special weekend-only pricing',
      'Wide selection of fun vehicles',
      'Convertibles perfect for AZ weather',
      'SUVs for outdoor adventures',
      'Sports cars for special nights out',
      'Pick up Friday, return Sunday'
    ],
    priceRange: '$49-299/day',
    durationSuggestion: '2-3 days',
    idealCarTypes: ['CONVERTIBLE', 'SPORTS', 'SUV'],
    filters: {
      maxDays: 3,
      carTypes: ['CONVERTIBLE', 'SPORTS', 'SUV']
    },
    faqs: [
      {
        question: 'What\'s a typical weekend rental cost?',
        answer: 'Weekend rentals start around $49/day for sedans, $79/day for SUVs, and $150+/day for sports cars and convertibles. Many hosts offer special weekend rates.'
      },
      {
        question: 'Can I pick up on Friday evening?',
        answer: 'Yes! Many hosts offer flexible pickup times including evening pickups. Coordinate with your host through the app for the best time.'
      },
      {
        question: 'What about late Sunday returns?',
        answer: 'Return times are flexible. Most hosts are accommodating with Sunday evening returns. Just confirm the time when you book.'
      },
      {
        question: 'What cars are best for a Sedona trip?',
        answer: 'SUVs and crossovers are ideal for Sedona\'s terrain and any off-road exploration. Convertibles are great for scenic drives if you\'re sticking to paved roads.'
      }
    ],
    tips: [
      'Book convertibles early - they go fast on weekends',
      'Check if host offers airport pickup for flying visitors',
      'Consider an SUV for Grand Canyon trips',
      'Message hosts about flexible return times'
    ]
  },

  'airport-delivery': {
    slug: 'airport-delivery',
    title: 'Airport Delivery Car Rentals',
    h1: 'Airport Delivery Car Rentals | PHX, AZA, SDL',
    metaTitle: 'Airport Car Delivery Phoenix | PHX Pickup | ItWhip',
    metaDescription: 'Skip the rental counter. Get your car delivered curbside at Phoenix Sky Harbor, Mesa Gateway, or Scottsdale Airport. Free delivery available.',
    heroSubtitle: 'Land, text your host, and get your car delivered curbside. No shuttles, no lines.',
    content: 'Forget the rental car shuttle and endless counter lines. With ItWhip\'s airport delivery, your host brings the car directly to you at the terminal. Just text when you land, and meet your host curbside in the arrivals area. It\'s the fastest, most convenient way to get moving after your flight.',
    benefits: [
      'Curbside delivery at arrivals',
      'No shuttle buses or long walks',
      'Skip the rental counter lines',
      'Free delivery from many hosts',
      'Works at PHX, AZA, and SDL',
      'Text coordination with your host'
    ],
    priceRange: '$0-50 delivery fee',
    durationSuggestion: 'Any duration',
    idealCarTypes: ['SEDAN', 'SUV', 'LUXURY'],
    filters: {
      features: ['airportPickup']
    },
    faqs: [
      {
        question: 'How does airport pickup work?',
        answer: 'When you land, text your host through the ItWhip app. They\'ll meet you curbside at arrivals - usually within 10-15 minutes. Quick vehicle walkthrough, sign digitally, and you\'re on your way.'
      },
      {
        question: 'Is airport delivery free?',
        answer: 'Many hosts offer free airport delivery. Others charge $15-50 depending on the airport and time. The fee is clearly shown on each listing.'
      },
      {
        question: 'What if my flight is delayed?',
        answer: 'Just message your host through the app. They\'ll adjust to your actual arrival time. Communication is key - hosts are very understanding about flight delays.'
      },
      {
        question: 'Which Phoenix airports are covered?',
        answer: 'Most hosts with airport delivery serve Phoenix Sky Harbor (PHX). Many also cover Mesa Gateway (AZA) and Scottsdale Airport (SDL) for private aviation.'
      },
      {
        question: 'Can I return the car at the airport?',
        answer: 'Yes! Most hosts with airport pickup also offer airport return. Coordinate the drop-off location and time with your host before your flight.'
      }
    ],
    tips: [
      'Text your host when you land',
      'Meet at arrivals, not departures',
      'Have your license ready for quick handoff',
      'Check delivery fee before booking'
    ]
  },

  'road-trip': {
    slug: 'road-trip',
    title: 'Road Trip Car Rentals',
    h1: 'Road Trip Car Rentals from Phoenix | Unlimited Miles',
    metaTitle: 'Road Trip Car Rentals Phoenix | High Mileage | ItWhip',
    metaDescription: 'Road trip car rentals in Phoenix with high mileage limits. SUVs, sedans, and comfortable vehicles for Grand Canyon, Vegas, LA, and beyond.',
    heroSubtitle: 'Hit the open road. Rent vehicles built for adventure with generous mileage.',
    content: 'Phoenix is the perfect starting point for epic road trips. Grand Canyon is 4 hours north, Vegas is 5 hours northwest, San Diego and LA are within a day\'s drive. Our road trip rentals offer generous mileage allowances and comfortable vehicles perfect for highway cruising. Many hosts offer unlimited mileage for the ultimate road trip freedom.',
    benefits: [
      'High mileage limits (200-300 miles/day)',
      'Some hosts offer unlimited mileage',
      'Comfortable highway cruisers',
      'SUVs for gear and passengers',
      'Fuel-efficient options available',
      'Roadside assistance included'
    ],
    priceRange: '$55-150/day',
    durationSuggestion: '3-7 days',
    idealCarTypes: ['SUV', 'SEDAN', 'ELECTRIC'],
    filters: {
      minDays: 3,
      carTypes: ['SUV', 'SEDAN']
    },
    faqs: [
      {
        question: 'What\'s the typical mileage limit?',
        answer: 'Most rentals include 150-250 miles per day. Many hosts offer higher limits for road trips, and some offer unlimited mileage. Check each listing for details.'
      },
      {
        question: 'What happens if I go over the mileage limit?',
        answer: 'Extra miles are charged at the rate shown on the listing - typically $0.25-0.75 per mile. Some hosts offer mileage packages for road trips.'
      },
      {
        question: 'Can I take the car out of Arizona?',
        answer: 'Most hosts allow travel to neighboring states (CA, NV, UT, NM). Check the listing rules or message the host to confirm. Some restrict Mexico travel.'
      },
      {
        question: 'What\'s the best car for a Grand Canyon trip?',
        answer: 'SUVs are popular for their comfort and cargo space. If you\'re visiting in summer, make sure you have reliable A/C. 4WD isn\'t needed for the main routes.'
      },
      {
        question: 'Should I get an electric car for a road trip?',
        answer: 'Teslas are great for in-state trips with Supercharger coverage. For trips to remote areas, a gas vehicle offers more flexibility.'
      }
    ],
    tips: [
      'Check mileage limits before booking',
      'Message host about multi-state travel',
      'Consider SUV for comfort on long drives',
      'Book a few days early for best selection'
    ]
  },

  'business': {
    slug: 'business',
    title: 'Business Travel Car Rentals',
    h1: 'Business Travel Car Rentals in Phoenix | Professional Vehicles',
    metaTitle: 'Business Car Rentals Phoenix | Corporate Travel | ItWhip',
    metaDescription: 'Professional car rentals for business travel in Phoenix. Luxury sedans, SUVs for client meetings. Expense-friendly receipts, corporate accounts available.',
    heroSubtitle: 'Make the right impression. Professional vehicles for corporate travel.',
    content: 'First impressions matter in business. Whether you\'re meeting clients in Scottsdale, presenting at a Phoenix conference, or commuting to the office for a few weeks, we have the professional vehicles to match your image. Our luxury sedans and premium SUVs offer the comfort and style expected in business settings.',
    benefits: [
      'Professional luxury vehicles',
      'Detailed receipts for expenses',
      'Corporate accounts available',
      'Airport delivery for executives',
      'Clean, well-maintained cars',
      'Flexible booking terms'
    ],
    priceRange: '$75-250/day',
    durationSuggestion: '1-14 days',
    idealCarTypes: ['LUXURY', 'SEDAN', 'SUV'],
    filters: {
      carTypes: ['LUXURY', 'SEDAN']
    },
    faqs: [
      {
        question: 'Can I get an invoice for expense reports?',
        answer: 'Yes! All bookings include detailed receipts showing dates, vehicle, and total cost. You can also download invoices from your account at any time.'
      },
      {
        question: 'Do you offer corporate accounts?',
        answer: 'Yes, we offer corporate accounts for businesses with recurring travel needs. Contact us for volume discounts and centralized billing.'
      },
      {
        question: 'What cars are best for client meetings?',
        answer: 'For the best impression, consider a Mercedes-Benz, BMW, or Audi sedan. For groups, a luxury SUV like a BMW X5 or Mercedes GLS works well.'
      },
      {
        question: 'Is same-day booking available?',
        answer: 'Many hosts offer instant booking and same-day availability. Filter by "Instant Book" for vehicles you can reserve immediately.'
      }
    ],
    tips: [
      'Book luxury sedans for client-facing meetings',
      'Request airport delivery for seamless travel',
      'Download receipts from your account',
      'Consider weekly rates for extended assignments'
    ]
  },

  'snowbird': {
    slug: 'snowbird',
    title: 'Snowbird Car Rentals',
    h1: 'Snowbird Car Rentals in Phoenix | Seasonal Winter Rentals',
    metaTitle: 'Snowbird Car Rentals Phoenix | Winter Season | ItWhip',
    metaDescription: 'Seasonal car rentals for snowbirds in Phoenix. Monthly rates, long-term discounts. Perfect for winter visitors escaping the cold. Golf, shopping, warm weather.',
    heroSubtitle: 'Welcome to the Valley of the Sun. Your winter escape deserves great wheels.',
    content: 'Escape the cold and enjoy Arizona\'s perfect winter weather. Whether you\'re here for a month or the whole season, our snowbird rentals give you the freedom to explore without shipping your car. Golf courses, hiking trails, shopping, and sunshine - it\'s all waiting for you. Our hosts offer special monthly rates perfect for seasonal visitors.',
    benefits: [
      'Deep monthly discounts (20-30% off)',
      'Multi-month availability',
      'No need to ship your car',
      'Golf-friendly vehicles (SUVs for clubs)',
      'Explore all of Arizona',
      'Flexible start/end dates'
    ],
    priceRange: '$1,200-3,500/month',
    durationSuggestion: '30-120 days',
    idealCarTypes: ['SEDAN', 'SUV', 'CONVERTIBLE'],
    filters: {
      minDays: 30,
      carTypes: ['SEDAN', 'SUV', 'CONVERTIBLE']
    },
    faqs: [
      {
        question: 'What\'s the typical monthly rate?',
        answer: 'Monthly rates typically range from $1,200-2,500 for sedans and SUVs, with luxury vehicles higher. This is often 50-60% less than daily rates.'
      },
      {
        question: 'Can I rent for the entire winter season?',
        answer: 'Yes! Many hosts welcome season-long rentals (3-4 months). Message hosts directly to arrange multi-month bookings at the best rates.'
      },
      {
        question: 'Is there enough mileage for snowbird activities?',
        answer: 'Most rentals include 150-250 miles/day, which is plenty for local errands, golf, and day trips. For extensive travel, ask about unlimited mileage options.'
      },
      {
        question: 'What about insurance for long stays?',
        answer: 'All rentals include $1M liability coverage. For stays over 30 days, we recommend adding your own insurance as primary for potential savings.'
      },
      {
        question: 'Can I have the car delivered to my winter home?',
        answer: 'Yes! Many hosts deliver to homes, condos, and resorts throughout the Phoenix metro area. Delivery fees vary by location.'
      }
    ],
    tips: [
      'Book early - winter is peak season',
      'Ask hosts about multi-month discounts',
      'Consider a convertible for perfect weather',
      'Get an SUV if you golf regularly'
    ]
  },

  'spring-training': {
    slug: 'spring-training',
    title: 'Spring Training Car Rentals',
    h1: 'Spring Training Car Rentals | Cactus League Phoenix',
    metaTitle: 'Spring Training Car Rentals Phoenix | Cactus League | ItWhip',
    metaDescription: 'Car rentals for Cactus League Spring Training in Phoenix. Visit all 10 stadiums across the Valley. SUVs, convertibles, family vehicles available.',
    heroSubtitle: 'Catch every game. Rent a car to visit all 10 Cactus League stadiums.',
    content: 'Spring Training brings 15 MLB teams and millions of fans to the Phoenix metro area. With 10 stadiums spread across the Valley - from Peoria to Scottsdale to Goodyear - you need wheels to catch all the action. Our Spring Training rentals give you the freedom to hop between games, explore Arizona\'s baseball culture, and enjoy the perfect February-March weather.',
    benefits: [
      'Visit all 10 Cactus League stadiums',
      'Convertibles for perfect spring weather',
      'SUVs for groups of fans',
      'Airport delivery for out-of-towners',
      'Flexible multi-day rentals',
      'Navigate the Valley with ease'
    ],
    priceRange: '$55-199/day',
    durationSuggestion: '3-14 days',
    idealCarTypes: ['SUV', 'CONVERTIBLE', 'SEDAN'],
    filters: {
      carTypes: ['SUV', 'CONVERTIBLE', 'SEDAN']
    },
    faqs: [
      {
        question: 'When is Spring Training in Arizona?',
        answer: 'Cactus League games run from late February through late March. The busiest weeks are typically mid-March when all teams are in full swing.'
      },
      {
        question: 'How far apart are the stadiums?',
        answer: 'Stadiums are spread across the Valley - from Goodyear in the west to Scottsdale and Mesa in the east. Expect 30-60 minute drives between most venues.'
      },
      {
        question: 'Should I book early for Spring Training?',
        answer: 'Absolutely! Spring Training is one of the busiest times in Phoenix. Book your car at least 2-3 weeks in advance for the best selection.'
      },
      {
        question: 'What\'s the best vehicle for stadium hopping?',
        answer: 'An SUV or crossover works great for groups. For couples, a convertible is perfect for enjoying the spring weather between games.'
      },
      {
        question: 'Can I tailgate at the stadiums?',
        answer: 'Tailgating policies vary by stadium. Most allow it in some capacity. An SUV or truck gives you space for coolers and gear.'
      }
    ],
    tips: [
      'Book 2-3 weeks ahead during Spring Training',
      'Get a convertible for the perfect weather',
      'SUVs are great for groups of fans',
      'Check stadium parking before each game'
    ]
  }
}

export function getUseCaseBySlug(slug: string): UseCaseData | undefined {
  return USE_CASE_DATA[slug]
}

export function getAllUseCaseSlugs(): string[] {
  return Object.keys(USE_CASE_DATA)
}

export const USE_CASE_LIST = Object.values(USE_CASE_DATA)
