// app/lib/data/use-cases.ts
// Use case data for rental scenario pages
// Translatable strings use keys resolved via useTranslations('UseCases') at render time

export interface UseCaseData {
  slug: string
  titleKey: string
  h1Key: string
  metaTitle: string
  metaDescription: string
  heroSubtitleKey: string
  contentKey: string
  benefitKeys: string[]
  priceRangeKey: string
  durationSuggestionKey: string
  idealCarTypes: string[]
  filters: {
    minDays?: number
    maxDays?: number
    carTypes?: string[]
    features?: string[]
    priceMax?: number
  }
  faqKeys: Array<{ questionKey: string; answerKey: string }>
  tipKeys: string[]
}

export const USE_CASE_DATA: Record<string, UseCaseData> = {
  'long-term': {
    slug: 'long-term',
    titleKey: 'longTerm.title',
    h1Key: 'longTerm.h1',
    metaTitle: 'Long-Term Car Rentals Phoenix | Weekly & Monthly | ItWhip',
    metaDescription: 'Save up to 30% on long-term car rentals in Phoenix. Weekly and monthly rates from local owners. SUVs, sedans, luxury cars. No contracts, flexible terms.',
    heroSubtitleKey: 'longTerm.heroSubtitle',
    contentKey: 'longTerm.content',
    benefitKeys: [
      'longTerm.benefit1',
      'longTerm.benefit2',
      'longTerm.benefit3',
      'longTerm.benefit4',
      'longTerm.benefit5',
      'longTerm.benefit6'
    ],
    priceRangeKey: 'longTerm.priceRange',
    durationSuggestionKey: 'longTerm.durationSuggestion',
    idealCarTypes: ['SEDAN', 'SUV', 'ELECTRIC'],
    filters: {
      minDays: 7,
      carTypes: ['SEDAN', 'SUV', 'ELECTRIC']
    },
    faqKeys: [
      { questionKey: 'longTerm.faq1Question', answerKey: 'longTerm.faq1Answer' },
      { questionKey: 'longTerm.faq2Question', answerKey: 'longTerm.faq2Answer' },
      { questionKey: 'longTerm.faq3Question', answerKey: 'longTerm.faq3Answer' },
      { questionKey: 'longTerm.faq4Question', answerKey: 'longTerm.faq4Answer' },
      { questionKey: 'longTerm.faq5Question', answerKey: 'longTerm.faq5Answer' }
    ],
    tipKeys: [
      'longTerm.tip1',
      'longTerm.tip2',
      'longTerm.tip3',
      'longTerm.tip4'
    ]
  },

  'weekend': {
    slug: 'weekend',
    titleKey: 'weekend.title',
    h1Key: 'weekend.h1',
    metaTitle: 'Weekend Car Rentals Phoenix | Fri-Sun Deals | ItWhip',
    metaDescription: 'Weekend car rentals in Phoenix from $49/day. Perfect for getaways to Sedona, Grand Canyon, or Scottsdale nightlife. Sports cars, convertibles, SUVs available.',
    heroSubtitleKey: 'weekend.heroSubtitle',
    contentKey: 'weekend.content',
    benefitKeys: [
      'weekend.benefit1',
      'weekend.benefit2',
      'weekend.benefit3',
      'weekend.benefit4',
      'weekend.benefit5',
      'weekend.benefit6'
    ],
    priceRangeKey: 'weekend.priceRange',
    durationSuggestionKey: 'weekend.durationSuggestion',
    idealCarTypes: ['CONVERTIBLE', 'SPORTS', 'SUV'],
    filters: {
      maxDays: 3,
      carTypes: ['CONVERTIBLE', 'SPORTS', 'SUV']
    },
    faqKeys: [
      { questionKey: 'weekend.faq1Question', answerKey: 'weekend.faq1Answer' },
      { questionKey: 'weekend.faq2Question', answerKey: 'weekend.faq2Answer' },
      { questionKey: 'weekend.faq3Question', answerKey: 'weekend.faq3Answer' },
      { questionKey: 'weekend.faq4Question', answerKey: 'weekend.faq4Answer' }
    ],
    tipKeys: [
      'weekend.tip1',
      'weekend.tip2',
      'weekend.tip3',
      'weekend.tip4'
    ]
  },

  'airport-delivery': {
    slug: 'airport-delivery',
    titleKey: 'airportDelivery.title',
    h1Key: 'airportDelivery.h1',
    metaTitle: 'Airport Car Delivery Phoenix | PHX Pickup | ItWhip',
    metaDescription: 'Skip the rental counter. Get your car delivered curbside at Phoenix Sky Harbor, Mesa Gateway, or Scottsdale Airport. Free delivery available.',
    heroSubtitleKey: 'airportDelivery.heroSubtitle',
    contentKey: 'airportDelivery.content',
    benefitKeys: [
      'airportDelivery.benefit1',
      'airportDelivery.benefit2',
      'airportDelivery.benefit3',
      'airportDelivery.benefit4',
      'airportDelivery.benefit5',
      'airportDelivery.benefit6'
    ],
    priceRangeKey: 'airportDelivery.priceRange',
    durationSuggestionKey: 'airportDelivery.durationSuggestion',
    idealCarTypes: ['SEDAN', 'SUV', 'LUXURY'],
    filters: {
      features: ['airportPickup']
    },
    faqKeys: [
      { questionKey: 'airportDelivery.faq1Question', answerKey: 'airportDelivery.faq1Answer' },
      { questionKey: 'airportDelivery.faq2Question', answerKey: 'airportDelivery.faq2Answer' },
      { questionKey: 'airportDelivery.faq3Question', answerKey: 'airportDelivery.faq3Answer' },
      { questionKey: 'airportDelivery.faq4Question', answerKey: 'airportDelivery.faq4Answer' },
      { questionKey: 'airportDelivery.faq5Question', answerKey: 'airportDelivery.faq5Answer' }
    ],
    tipKeys: [
      'airportDelivery.tip1',
      'airportDelivery.tip2',
      'airportDelivery.tip3',
      'airportDelivery.tip4'
    ]
  },

  'road-trip': {
    slug: 'road-trip',
    titleKey: 'roadTrip.title',
    h1Key: 'roadTrip.h1',
    metaTitle: 'Road Trip Car Rentals Phoenix | High Mileage | ItWhip',
    metaDescription: 'Road trip car rentals in Phoenix with high mileage limits. SUVs, sedans, and comfortable vehicles for Grand Canyon, Vegas, LA, and beyond.',
    heroSubtitleKey: 'roadTrip.heroSubtitle',
    contentKey: 'roadTrip.content',
    benefitKeys: [
      'roadTrip.benefit1',
      'roadTrip.benefit2',
      'roadTrip.benefit3',
      'roadTrip.benefit4',
      'roadTrip.benefit5',
      'roadTrip.benefit6'
    ],
    priceRangeKey: 'roadTrip.priceRange',
    durationSuggestionKey: 'roadTrip.durationSuggestion',
    idealCarTypes: ['SUV', 'SEDAN', 'ELECTRIC'],
    filters: {
      minDays: 3,
      carTypes: ['SUV', 'SEDAN']
    },
    faqKeys: [
      { questionKey: 'roadTrip.faq1Question', answerKey: 'roadTrip.faq1Answer' },
      { questionKey: 'roadTrip.faq2Question', answerKey: 'roadTrip.faq2Answer' },
      { questionKey: 'roadTrip.faq3Question', answerKey: 'roadTrip.faq3Answer' },
      { questionKey: 'roadTrip.faq4Question', answerKey: 'roadTrip.faq4Answer' },
      { questionKey: 'roadTrip.faq5Question', answerKey: 'roadTrip.faq5Answer' }
    ],
    tipKeys: [
      'roadTrip.tip1',
      'roadTrip.tip2',
      'roadTrip.tip3',
      'roadTrip.tip4'
    ]
  },

  'business': {
    slug: 'business',
    titleKey: 'business.title',
    h1Key: 'business.h1',
    metaTitle: 'Business Car Rentals Phoenix | Corporate Travel | ItWhip',
    metaDescription: 'Professional car rentals for business travel in Phoenix. Luxury sedans, SUVs for client meetings. Expense-friendly receipts, corporate accounts available.',
    heroSubtitleKey: 'business.heroSubtitle',
    contentKey: 'business.content',
    benefitKeys: [
      'business.benefit1',
      'business.benefit2',
      'business.benefit3',
      'business.benefit4',
      'business.benefit5',
      'business.benefit6'
    ],
    priceRangeKey: 'business.priceRange',
    durationSuggestionKey: 'business.durationSuggestion',
    idealCarTypes: ['LUXURY', 'SEDAN', 'SUV'],
    filters: {
      carTypes: ['LUXURY', 'SEDAN']
    },
    faqKeys: [
      { questionKey: 'business.faq1Question', answerKey: 'business.faq1Answer' },
      { questionKey: 'business.faq2Question', answerKey: 'business.faq2Answer' },
      { questionKey: 'business.faq3Question', answerKey: 'business.faq3Answer' },
      { questionKey: 'business.faq4Question', answerKey: 'business.faq4Answer' }
    ],
    tipKeys: [
      'business.tip1',
      'business.tip2',
      'business.tip3',
      'business.tip4'
    ]
  },

  'snowbird': {
    slug: 'snowbird',
    titleKey: 'snowbird.title',
    h1Key: 'snowbird.h1',
    metaTitle: 'Snowbird Car Rentals Phoenix | Winter Season | ItWhip',
    metaDescription: 'Seasonal car rentals for snowbirds in Phoenix. Monthly rates, long-term discounts. Perfect for winter visitors escaping the cold. Golf, shopping, warm weather.',
    heroSubtitleKey: 'snowbird.heroSubtitle',
    contentKey: 'snowbird.content',
    benefitKeys: [
      'snowbird.benefit1',
      'snowbird.benefit2',
      'snowbird.benefit3',
      'snowbird.benefit4',
      'snowbird.benefit5',
      'snowbird.benefit6'
    ],
    priceRangeKey: 'snowbird.priceRange',
    durationSuggestionKey: 'snowbird.durationSuggestion',
    idealCarTypes: ['SEDAN', 'SUV', 'CONVERTIBLE'],
    filters: {
      minDays: 30,
      carTypes: ['SEDAN', 'SUV', 'CONVERTIBLE']
    },
    faqKeys: [
      { questionKey: 'snowbird.faq1Question', answerKey: 'snowbird.faq1Answer' },
      { questionKey: 'snowbird.faq2Question', answerKey: 'snowbird.faq2Answer' },
      { questionKey: 'snowbird.faq3Question', answerKey: 'snowbird.faq3Answer' },
      { questionKey: 'snowbird.faq4Question', answerKey: 'snowbird.faq4Answer' },
      { questionKey: 'snowbird.faq5Question', answerKey: 'snowbird.faq5Answer' }
    ],
    tipKeys: [
      'snowbird.tip1',
      'snowbird.tip2',
      'snowbird.tip3',
      'snowbird.tip4'
    ]
  },

  'spring-training': {
    slug: 'spring-training',
    titleKey: 'springTraining.title',
    h1Key: 'springTraining.h1',
    metaTitle: 'Spring Training Car Rentals Phoenix | Cactus League | ItWhip',
    metaDescription: 'Car rentals for Cactus League Spring Training in Phoenix. Visit all 10 stadiums across the Valley. SUVs, convertibles, family vehicles available.',
    heroSubtitleKey: 'springTraining.heroSubtitle',
    contentKey: 'springTraining.content',
    benefitKeys: [
      'springTraining.benefit1',
      'springTraining.benefit2',
      'springTraining.benefit3',
      'springTraining.benefit4',
      'springTraining.benefit5',
      'springTraining.benefit6'
    ],
    priceRangeKey: 'springTraining.priceRange',
    durationSuggestionKey: 'springTraining.durationSuggestion',
    idealCarTypes: ['SUV', 'CONVERTIBLE', 'SEDAN'],
    filters: {
      carTypes: ['SUV', 'CONVERTIBLE', 'SEDAN']
    },
    faqKeys: [
      { questionKey: 'springTraining.faq1Question', answerKey: 'springTraining.faq1Answer' },
      { questionKey: 'springTraining.faq2Question', answerKey: 'springTraining.faq2Answer' },
      { questionKey: 'springTraining.faq3Question', answerKey: 'springTraining.faq3Answer' },
      { questionKey: 'springTraining.faq4Question', answerKey: 'springTraining.faq4Answer' },
      { questionKey: 'springTraining.faq5Question', answerKey: 'springTraining.faq5Answer' }
    ],
    tipKeys: [
      'springTraining.tip1',
      'springTraining.tip2',
      'springTraining.tip3',
      'springTraining.tip4'
    ]
  },

  'hourly': {
    slug: 'hourly',
    titleKey: 'hourly.title',
    h1Key: 'hourly.h1',
    metaTitle: 'Hourly Car Rentals Phoenix | Pay Per Hour | ItWhip',
    metaDescription: 'Rent a car by the hour in Phoenix. Perfect for quick errands, appointments, or short trips. No full-day commitment required. Starting from $15/hour.',
    heroSubtitleKey: 'hourly.heroSubtitle',
    contentKey: 'hourly.content',
    benefitKeys: [
      'hourly.benefit1',
      'hourly.benefit2',
      'hourly.benefit3',
      'hourly.benefit4',
      'hourly.benefit5',
      'hourly.benefit6'
    ],
    priceRangeKey: 'hourly.priceRange',
    durationSuggestionKey: 'hourly.durationSuggestion',
    idealCarTypes: ['SEDAN', 'SUV', 'ELECTRIC'],
    filters: {
      maxDays: 1,
      carTypes: ['SEDAN', 'SUV']
    },
    faqKeys: [
      { questionKey: 'hourly.faq1Question', answerKey: 'hourly.faq1Answer' },
      { questionKey: 'hourly.faq2Question', answerKey: 'hourly.faq2Answer' },
      { questionKey: 'hourly.faq3Question', answerKey: 'hourly.faq3Answer' },
      { questionKey: 'hourly.faq4Question', answerKey: 'hourly.faq4Answer' }
    ],
    tipKeys: [
      'hourly.tip1',
      'hourly.tip2',
      'hourly.tip3',
      'hourly.tip4'
    ]
  },

  'daily': {
    slug: 'daily',
    titleKey: 'daily.title',
    h1Key: 'daily.h1',
    metaTitle: 'Daily Car Rentals Phoenix | 24-Hour Rentals | ItWhip',
    metaDescription: 'Rent a car for the day in Phoenix. Sedans from $35/day, SUVs from $55/day. Flexible pickup times, no hidden fees. All cars include insurance.',
    heroSubtitleKey: 'daily.heroSubtitle',
    contentKey: 'daily.content',
    benefitKeys: [
      'daily.benefit1',
      'daily.benefit2',
      'daily.benefit3',
      'daily.benefit4',
      'daily.benefit5',
      'daily.benefit6'
    ],
    priceRangeKey: 'daily.priceRange',
    durationSuggestionKey: 'daily.durationSuggestion',
    idealCarTypes: ['SEDAN', 'SUV', 'TRUCK', 'LUXURY'],
    filters: {
      carTypes: ['SEDAN', 'SUV', 'TRUCK']
    },
    faqKeys: [
      { questionKey: 'daily.faq1Question', answerKey: 'daily.faq1Answer' },
      { questionKey: 'daily.faq2Question', answerKey: 'daily.faq2Answer' },
      { questionKey: 'daily.faq3Question', answerKey: 'daily.faq3Answer' },
      { questionKey: 'daily.faq4Question', answerKey: 'daily.faq4Answer' }
    ],
    tipKeys: [
      'daily.tip1',
      'daily.tip2',
      'daily.tip3',
      'daily.tip4'
    ]
  },

  'corporate-travel': {
    slug: 'corporate-travel',
    titleKey: 'corporateTravel.title',
    h1Key: 'corporateTravel.h1',
    metaTitle: 'Corporate Car Rentals Phoenix | Business Travel | ItWhip',
    metaDescription: 'Corporate car rentals in Phoenix for business travelers. Premium vehicles, expense receipts, volume discounts. Serving Fortune 500 companies.',
    heroSubtitleKey: 'corporateTravel.heroSubtitle',
    contentKey: 'corporateTravel.content',
    benefitKeys: [
      'corporateTravel.benefit1',
      'corporateTravel.benefit2',
      'corporateTravel.benefit3',
      'corporateTravel.benefit4',
      'corporateTravel.benefit5',
      'corporateTravel.benefit6'
    ],
    priceRangeKey: 'corporateTravel.priceRange',
    durationSuggestionKey: 'corporateTravel.durationSuggestion',
    idealCarTypes: ['LUXURY', 'SEDAN', 'SUV'],
    filters: {
      carTypes: ['LUXURY', 'SEDAN', 'SUV']
    },
    faqKeys: [
      { questionKey: 'corporateTravel.faq1Question', answerKey: 'corporateTravel.faq1Answer' },
      { questionKey: 'corporateTravel.faq2Question', answerKey: 'corporateTravel.faq2Answer' },
      { questionKey: 'corporateTravel.faq3Question', answerKey: 'corporateTravel.faq3Answer' },
      { questionKey: 'corporateTravel.faq4Question', answerKey: 'corporateTravel.faq4Answer' },
      { questionKey: 'corporateTravel.faq5Question', answerKey: 'corporateTravel.faq5Answer' }
    ],
    tipKeys: [
      'corporateTravel.tip1',
      'corporateTravel.tip2',
      'corporateTravel.tip3',
      'corporateTravel.tip4'
    ]
  },

  'hotel-delivery': {
    slug: 'hotel-delivery',
    titleKey: 'hotelDelivery.title',
    h1Key: 'hotelDelivery.h1',
    metaTitle: 'Hotel Car Delivery Phoenix | Scottsdale Hotels | ItWhip',
    metaDescription: 'Get your rental car delivered to your Phoenix or Scottsdale hotel. Free delivery available. Skip the rental counter and start your vacation immediately.',
    heroSubtitleKey: 'hotelDelivery.heroSubtitle',
    contentKey: 'hotelDelivery.content',
    benefitKeys: [
      'hotelDelivery.benefit1',
      'hotelDelivery.benefit2',
      'hotelDelivery.benefit3',
      'hotelDelivery.benefit4',
      'hotelDelivery.benefit5',
      'hotelDelivery.benefit6'
    ],
    priceRangeKey: 'hotelDelivery.priceRange',
    durationSuggestionKey: 'hotelDelivery.durationSuggestion',
    idealCarTypes: ['SEDAN', 'SUV', 'LUXURY', 'CONVERTIBLE'],
    filters: {
      features: ['delivery']
    },
    faqKeys: [
      { questionKey: 'hotelDelivery.faq1Question', answerKey: 'hotelDelivery.faq1Answer' },
      { questionKey: 'hotelDelivery.faq2Question', answerKey: 'hotelDelivery.faq2Answer' },
      { questionKey: 'hotelDelivery.faq3Question', answerKey: 'hotelDelivery.faq3Answer' },
      { questionKey: 'hotelDelivery.faq4Question', answerKey: 'hotelDelivery.faq4Answer' },
      { questionKey: 'hotelDelivery.faq5Question', answerKey: 'hotelDelivery.faq5Answer' }
    ],
    tipKeys: [
      'hotelDelivery.tip1',
      'hotelDelivery.tip2',
      'hotelDelivery.tip3',
      'hotelDelivery.tip4'
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
