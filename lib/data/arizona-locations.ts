// lib/data/arizona-locations.ts
// Complete Arizona location data for rental car search
// Includes all major airports and cities with coordinates for radius-based search

export type LocationType = 'airport' | 'city'

export interface Location {
  id: string
  name: string
  type: LocationType
  city: string
  state: string
  latitude: number
  longitude: number
  iataCode?: string // For airports
  searchTerms: string[] // Alternative names for better search
}

// ============================================================================
// ARIZONA AIRPORTS
// ============================================================================

export const ARIZONA_AIRPORTS: Location[] = [
  {
    id: 'phx',
    name: 'Phoenix Sky Harbor International Airport',
    type: 'airport',
    city: 'Phoenix',
    state: 'AZ',
    latitude: 33.4342,
    longitude: -112.0116,
    iataCode: 'PHX',
    searchTerms: ['sky harbor', 'phoenix airport', 'phx airport', 'sky harbor airport']
  },
  {
    id: 'tus',
    name: 'Tucson International Airport',
    type: 'airport',
    city: 'Tucson',
    state: 'AZ',
    latitude: 32.1161,
    longitude: -110.9410,
    iataCode: 'TUS',
    searchTerms: ['tucson airport', 'tus airport']
  },
  {
    id: 'flg',
    name: 'Flagstaff Pulliam Airport',
    type: 'airport',
    city: 'Flagstaff',
    state: 'AZ',
    latitude: 35.1385,
    longitude: -111.6713,
    iataCode: 'FLG',
    searchTerms: ['flagstaff airport', 'pulliam airport', 'flg airport']
  },
  {
    id: 'aza',
    name: 'Phoenix-Mesa Gateway Airport',
    type: 'airport',
    city: 'Mesa',
    state: 'AZ',
    latitude: 33.3078,
    longitude: -111.6547,
    iataCode: 'AZA',
    searchTerms: ['mesa airport', 'gateway airport', 'phoenix mesa', 'aza airport']
  },
  {
    id: 'yum',
    name: 'Yuma International Airport',
    type: 'airport',
    city: 'Yuma',
    state: 'AZ',
    latitude: 32.6566,
    longitude: -114.6060,
    iataCode: 'YUM',
    searchTerms: ['yuma airport', 'yum airport']
  },
  {
    id: 'prc',
    name: 'Prescott Regional Airport',
    type: 'airport',
    city: 'Prescott',
    state: 'AZ',
    latitude: 34.6545,
    longitude: -112.4196,
    iataCode: 'PRC',
    searchTerms: ['prescott airport', 'prc airport', 'ernest love field']
  },
  {
    id: 'gcn',
    name: 'Grand Canyon National Park Airport',
    type: 'airport',
    city: 'Grand Canyon',
    state: 'AZ',
    latitude: 35.9524,
    longitude: -112.1470,
    iataCode: 'GCN',
    searchTerms: ['grand canyon airport', 'gcn airport']
  },
  {
    id: 'igm',
    name: 'Kingman Airport',
    type: 'airport',
    city: 'Kingman',
    state: 'AZ',
    latitude: 35.2595,
    longitude: -113.9380,
    iataCode: 'IGM',
    searchTerms: ['kingman airport', 'igm airport']
  }
]

// ============================================================================
// ARIZONA CITIES
// ============================================================================

export const ARIZONA_CITIES: Location[] = [
  // Phoenix Metro Area (Major)
  {
    id: 'phoenix',
    name: 'Phoenix',
    type: 'city',
    city: 'Phoenix',
    state: 'AZ',
    latitude: 33.4484,
    longitude: -112.0740,
    searchTerms: ['downtown phoenix', 'phx']
  },
  {
    id: 'scottsdale',
    name: 'Scottsdale',
    type: 'city',
    city: 'Scottsdale',
    state: 'AZ',
    latitude: 33.4942,
    longitude: -111.9261,
    searchTerms: ['old town scottsdale']
  },
  {
    id: 'tempe',
    name: 'Tempe',
    type: 'city',
    city: 'Tempe',
    state: 'AZ',
    latitude: 33.4255,
    longitude: -111.9400,
    searchTerms: ['asu', 'arizona state university', 'mill avenue']
  },
  {
    id: 'mesa',
    name: 'Mesa',
    type: 'city',
    city: 'Mesa',
    state: 'AZ',
    latitude: 33.4152,
    longitude: -111.8315,
    searchTerms: ['downtown mesa']
  },
  {
    id: 'chandler',
    name: 'Chandler',
    type: 'city',
    city: 'Chandler',
    state: 'AZ',
    latitude: 33.3062,
    longitude: -111.8413,
    searchTerms: ['downtown chandler']
  },
  {
    id: 'gilbert',
    name: 'Gilbert',
    type: 'city',
    city: 'Gilbert',
    state: 'AZ',
    latitude: 33.3528,
    longitude: -111.7890,
    searchTerms: ['gilbert town']
  },
  {
    id: 'glendale',
    name: 'Glendale',
    type: 'city',
    city: 'Glendale',
    state: 'AZ',
    latitude: 33.5387,
    longitude: -112.1860,
    searchTerms: ['westgate', 'state farm stadium']
  },
  {
    id: 'peoria',
    name: 'Peoria',
    type: 'city',
    city: 'Peoria',
    state: 'AZ',
    latitude: 33.5806,
    longitude: -112.2374,
    searchTerms: ['peoria az']
  },
  {
    id: 'surprise',
    name: 'Surprise',
    type: 'city',
    city: 'Surprise',
    state: 'AZ',
    latitude: 33.6292,
    longitude: -112.3679,
    searchTerms: ['surprise az']
  },
  {
    id: 'avondale',
    name: 'Avondale',
    type: 'city',
    city: 'Avondale',
    state: 'AZ',
    latitude: 33.4356,
    longitude: -112.3496,
    searchTerms: ['avondale az']
  },
  {
    id: 'goodyear',
    name: 'Goodyear',
    type: 'city',
    city: 'Goodyear',
    state: 'AZ',
    latitude: 33.4353,
    longitude: -112.3576,
    searchTerms: ['goodyear az']
  },
  {
    id: 'buckeye',
    name: 'Buckeye',
    type: 'city',
    city: 'Buckeye',
    state: 'AZ',
    latitude: 33.3703,
    longitude: -112.5838,
    searchTerms: ['buckeye az']
  },

  // Tucson Area
  {
    id: 'tucson',
    name: 'Tucson',
    type: 'city',
    city: 'Tucson',
    state: 'AZ',
    latitude: 32.2226,
    longitude: -110.9747,
    searchTerms: ['downtown tucson', 'university of arizona']
  },
  {
    id: 'oro-valley',
    name: 'Oro Valley',
    type: 'city',
    city: 'Oro Valley',
    state: 'AZ',
    latitude: 32.3910,
    longitude: -110.9665,
    searchTerms: ['oro valley']
  },
  {
    id: 'marana',
    name: 'Marana',
    type: 'city',
    city: 'Marana',
    state: 'AZ',
    latitude: 32.4367,
    longitude: -111.2251,
    searchTerms: ['marana az']
  },

  // Northern Arizona
  {
    id: 'flagstaff',
    name: 'Flagstaff',
    type: 'city',
    city: 'Flagstaff',
    state: 'AZ',
    latitude: 35.1983,
    longitude: -111.6513,
    searchTerms: ['downtown flagstaff', 'nau', 'northern arizona university']
  },
  {
    id: 'sedona',
    name: 'Sedona',
    type: 'city',
    city: 'Sedona',
    state: 'AZ',
    latitude: 34.8697,
    longitude: -111.7610,
    searchTerms: ['sedona red rocks', 'uptown sedona']
  },
  {
    id: 'prescott',
    name: 'Prescott',
    type: 'city',
    city: 'Prescott',
    state: 'AZ',
    latitude: 34.5400,
    longitude: -112.4685,
    searchTerms: ['downtown prescott', 'prescott az']
  },
  {
    id: 'prescott-valley',
    name: 'Prescott Valley',
    type: 'city',
    city: 'Prescott Valley',
    state: 'AZ',
    latitude: 34.6100,
    longitude: -112.3157,
    searchTerms: ['prescott valley']
  },

  // Eastern Arizona
  {
    id: 'casa-grande',
    name: 'Casa Grande',
    type: 'city',
    city: 'Casa Grande',
    state: 'AZ',
    latitude: 32.8795,
    longitude: -111.7573,
    searchTerms: ['casa grande']
  },
  {
    id: 'apache-junction',
    name: 'Apache Junction',
    type: 'city',
    city: 'Apache Junction',
    state: 'AZ',
    latitude: 33.4151,
    longitude: -111.5496,
    searchTerms: ['apache junction', 'superstition mountains']
  },

  // Western Arizona
  {
    id: 'yuma',
    name: 'Yuma',
    type: 'city',
    city: 'Yuma',
    state: 'AZ',
    latitude: 32.6927,
    longitude: -114.6277,
    searchTerms: ['yuma az', 'downtown yuma']
  },
  {
    id: 'lake-havasu-city',
    name: 'Lake Havasu City',
    type: 'city',
    city: 'Lake Havasu City',
    state: 'AZ',
    latitude: 34.4839,
    longitude: -114.3224,
    searchTerms: ['lake havasu', 'london bridge']
  },
  {
    id: 'bullhead-city',
    name: 'Bullhead City',
    type: 'city',
    city: 'Bullhead City',
    state: 'AZ',
    latitude: 35.1359,
    longitude: -114.5283,
    searchTerms: ['bullhead city']
  },
  {
    id: 'kingman',
    name: 'Kingman',
    type: 'city',
    city: 'Kingman',
    state: 'AZ',
    latitude: 35.1894,
    longitude: -114.0530,
    searchTerms: ['kingman az', 'route 66']
  },

  // Southern Arizona
  {
    id: 'sierra-vista',
    name: 'Sierra Vista',
    type: 'city',
    city: 'Sierra Vista',
    state: 'AZ',
    latitude: 31.5455,
    longitude: -110.2773,
    searchTerms: ['sierra vista']
  },
  {
    id: 'nogales',
    name: 'Nogales',
    type: 'city',
    city: 'Nogales',
    state: 'AZ',
    latitude: 31.3404,
    longitude: -110.9342,
    searchTerms: ['nogales az']
  },

  // Other Notable Cities
  {
    id: 'fountain-hills',
    name: 'Fountain Hills',
    type: 'city',
    city: 'Fountain Hills',
    state: 'AZ',
    latitude: 33.6117,
    longitude: -111.7174,
    searchTerms: ['fountain hills']
  },
  {
    id: 'paradise-valley',
    name: 'Paradise Valley',
    type: 'city',
    city: 'Paradise Valley',
    state: 'AZ',
    latitude: 33.5298,
    longitude: -111.9428,
    searchTerms: ['paradise valley']
  },
  {
    id: 'cave-creek',
    name: 'Cave Creek',
    type: 'city',
    city: 'Cave Creek',
    state: 'AZ',
    latitude: 33.8328,
    longitude: -111.9510,
    searchTerms: ['cave creek']
  },
  {
    id: 'carefree',
    name: 'Carefree',
    type: 'city',
    city: 'Carefree',
    state: 'AZ',
    latitude: 33.8242,
    longitude: -111.9187,
    searchTerms: ['carefree az']
  }
]

// ============================================================================
// COMBINED LOCATIONS
// ============================================================================

export const ALL_ARIZONA_LOCATIONS: Location[] = [
  ...ARIZONA_AIRPORTS,
  ...ARIZONA_CITIES
]

// ============================================================================
// SEARCH & FILTER UTILITIES
// ============================================================================

/**
 * Search locations by query string
 * Returns locations matching the search term in name, city, or searchTerms
 */
export function searchLocations(query: string): Location[] {
  if (!query || query.trim().length === 0) {
    return []
  }

  const searchTerm = query.toLowerCase().trim()

  return ALL_ARIZONA_LOCATIONS.filter(location => {
    // Check main name
    if (location.name.toLowerCase().includes(searchTerm)) {
      return true
    }

    // Check city name
    if (location.city.toLowerCase().includes(searchTerm)) {
      return true
    }

    // Check IATA code
    if (location.iataCode && location.iataCode.toLowerCase() === searchTerm) {
      return true
    }

    // Check search terms
    return location.searchTerms.some(term => 
      term.toLowerCase().includes(searchTerm)
    )
  })
}

/**
 * Get grouped locations (airports first, then cities)
 * Used for displaying organized search results
 */
export function getGroupedLocations(query: string): {
  airports: Location[]
  cities: Location[]
} {
  const results = searchLocations(query)

  return {
    airports: results.filter(loc => loc.type === 'airport'),
    cities: results.filter(loc => loc.type === 'city')
  }
}

/**
 * Get location by ID
 */
export function getLocationById(id: string): Location | undefined {
  return ALL_ARIZONA_LOCATIONS.find(loc => loc.id === id)
}

/**
 * Get location by name (exact match)
 */
export function getLocationByName(name: string): Location | undefined {
  return ALL_ARIZONA_LOCATIONS.find(
    loc => loc.name.toLowerCase() === name.toLowerCase()
  )
}

/**
 * Format location for display
 */
export function formatLocationDisplay(location: Location): string {
  if (location.type === 'airport') {
    return `${location.iataCode} - ${location.name}`
  }
  return `${location.name}, ${location.state}`
}

/**
 * Get default/popular locations for initial display
 */
export function getPopularLocations(): Location[] {
  const popularIds = [
    'phx', // Phoenix Sky Harbor
    'phoenix', // Phoenix
    'scottsdale',
    'tempe',
    'tus', // Tucson Airport
    'tucson',
    'aza', // Mesa Gateway
    'mesa',
    'chandler',
    'gilbert',
    'flg', // Flagstaff Airport
    'flagstaff',
    'sedona'
  ]

  return popularIds
    .map(id => getLocationById(id))
    .filter(Boolean) as Location[]
}