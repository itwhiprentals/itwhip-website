// app/lib/data/vehicle-features.ts
// Vehicle features database by carType and year
// Features auto-populate based on vehicle type - no manual host entry

export interface VehicleFeatureSet {
  standard: string[]      // Always included for this category
  common: string[]        // Usually included (80%+ of vehicles)
  yearBased: {            // Features that became standard in certain years
    [year: number]: string[]
  }
}

// Feature categories for display grouping
export const FEATURE_CATEGORIES = {
  safety: [
    'Airbags (Front & Side)',
    'Blind Spot Monitor',
    'Lane Departure Warning',
    'Forward Collision Warning',
    'Automatic Emergency Braking',
    'Adaptive Cruise Control',
    'Parking Sensors',
    'All-Wheel Drive',
    '4-Wheel Drive',
    'Traction Control',
    'Stability Control',
    'Child Safety Locks',
    'Roadside Assistance',
    'Regenerative Braking'
  ],
  comfort: [
    'Bluetooth',
    'Backup Camera',
    'Apple CarPlay',
    'Android Auto',
    'USB Charger',
    'Aux Input',
    'Heated Seats',
    'Leather Seats',
    'Sunroof/Moonroof',
    'Keyless Entry',
    'Push Button Start',
    'Remote Start',
    'GPS Navigation',
    'Third Row Seating',
    'Premium Sound System',
    'Convertible Top'
  ],
  technology: [
    'WiFi Hotspot',
    'Wireless Charging',
    'Satellite Radio',
    'DVD Player',
    'Dashboard Camera',
    'Heads-Up Display',
    'Night Vision',
    'Parking Camera',
    '360° Camera',
    'Automatic Parking',
    'Self-Driving Features',
    'Autopilot/Self-Driving Features',
    'Over-the-Air Updates',
    'Mobile App Control',
    'Trailer Assist'
  ],
  utility: [
    'Bike Rack',
    'Roof Rack',
    'Tow Hitch',
    'Bed Liner',
    'Snow Chains/Tires',
    'Pet Friendly',
    'Wheelchair Accessible',
    'Spare Tire',
    'First Aid Kit',
    'Phone Mount'
  ]
}

export const VEHICLE_FEATURES_BY_TYPE: Record<string, VehicleFeatureSet> = {
  // CAR TYPES from VIN decoder bodyClass mapping:
  // Sedan, Hatchback, SUV, Pickup, Van, Convertible, Coupe, Wagon

  SEDAN: {
    standard: [
      'Airbags (Front & Side)',
      'Traction Control',
      'Stability Control',
      'USB Charger',
      'Aux Input',
      'Child Safety Locks'
    ],
    common: [
      'Bluetooth',
      'Backup Camera',
      'Keyless Entry',
      'Spare Tire'
    ],
    yearBased: {
      2015: ['Bluetooth'],
      2018: ['Backup Camera'],  // Mandatory in US from 2018
      2020: ['Apple CarPlay', 'Android Auto'],
      2022: ['Wireless Charging', 'Adaptive Cruise Control'],
      2024: ['Blind Spot Monitor', 'Lane Departure Warning']
    }
  },

  SUV: {
    standard: [
      'Airbags (Front & Side)',
      'Traction Control',
      'Stability Control',
      'USB Charger',
      'Aux Input',
      'Child Safety Locks',
      'Spare Tire'
    ],
    common: [
      'Bluetooth',
      'Backup Camera',
      'Keyless Entry',
      'All-Wheel Drive',
      'Roof Rack',
      'Third Row Seating'
    ],
    yearBased: {
      2015: ['Bluetooth'],
      2018: ['Backup Camera'],
      2020: ['Apple CarPlay', 'Android Auto', 'Blind Spot Monitor'],
      2022: ['Wireless Charging', 'Adaptive Cruise Control', '360° Camera'],
      2024: ['Lane Departure Warning', 'Forward Collision Warning']
    }
  },

  LUXURY: {
    standard: [
      'Airbags (Front & Side)',
      'Traction Control',
      'Stability Control',
      'Leather Seats',
      'Heated Seats',
      'Sunroof/Moonroof',
      'Premium Sound System',
      'GPS Navigation',
      'Push Button Start',
      'Keyless Entry',
      'Remote Start',
      'USB Charger',
      'Child Safety Locks'
    ],
    common: [
      'Bluetooth',
      'Backup Camera',
      'Parking Sensors',
      'Adaptive Cruise Control',
      'Blind Spot Monitor',
      '360° Camera'
    ],
    yearBased: {
      2015: ['Bluetooth', 'Backup Camera'],
      2018: ['360° Camera', 'Parking Sensors'],
      2020: ['Apple CarPlay', 'Android Auto', 'WiFi Hotspot', 'Wireless Charging'],
      2022: ['Heads-Up Display', 'Night Vision', 'Automatic Parking'],
      2024: ['Self-Driving Features', 'Lane Departure Warning', 'Automatic Emergency Braking']
    }
  },

  SPORTS: {
    standard: [
      'Airbags (Front & Side)',
      'Traction Control',
      'Stability Control',
      'Leather Seats',
      'Premium Sound System',
      'Push Button Start',
      'Keyless Entry',
      'USB Charger'
    ],
    common: [
      'Bluetooth',
      'Backup Camera',
      'Sunroof/Moonroof',
      'GPS Navigation'
    ],
    yearBased: {
      2015: ['Bluetooth'],
      2018: ['Backup Camera'],
      2020: ['Apple CarPlay', 'Android Auto'],
      2022: ['Adaptive Cruise Control', 'Wireless Charging'],
      2024: ['Blind Spot Monitor', 'Parking Sensors']
    }
  },

  TRUCK: {
    standard: [
      'Airbags (Front & Side)',
      'Traction Control',
      'USB Charger',
      'Tow Hitch',
      'Child Safety Locks',
      'Spare Tire'
    ],
    common: [
      'Bluetooth',
      'Backup Camera',
      'Bed Liner',
      '4-Wheel Drive',
      'All-Wheel Drive'
    ],
    yearBased: {
      2015: ['Bluetooth'],
      2018: ['Backup Camera'],
      2020: ['Apple CarPlay', 'Android Auto'],
      2022: ['Blind Spot Monitor', 'Trailer Assist'],
      2024: ['360° Camera', 'Adaptive Cruise Control']
    }
  },

  CONVERTIBLE: {
    standard: [
      'Airbags (Front & Side)',
      'Traction Control',
      'Stability Control',
      'Convertible Top',
      'USB Charger'
    ],
    common: [
      'Bluetooth',
      'Backup Camera',
      'Leather Seats',
      'Premium Sound System',
      'Push Button Start',
      'Keyless Entry'
    ],
    yearBased: {
      2015: ['Bluetooth'],
      2018: ['Backup Camera'],
      2020: ['Apple CarPlay', 'Android Auto'],
      2022: ['Wireless Charging', 'GPS Navigation']
    }
  },

  ELECTRIC: {
    standard: [
      'Airbags (Front & Side)',
      'Regenerative Braking',
      'USB Charger',
      'Keyless Entry',
      'Push Button Start',
      'Traction Control',
      'Stability Control',
      'GPS Navigation',
      'Bluetooth'
    ],
    common: [
      'Autopilot/Self-Driving Features',
      'Premium Sound System',
      'WiFi Hotspot',
      'Wireless Charging',
      '360° Camera',
      'Backup Camera',
      'Heated Seats',
      'Remote Start',
      'Mobile App Control'
    ],
    yearBased: {
      2020: ['Apple CarPlay', 'Android Auto', 'Over-the-Air Updates'],
      2022: ['Automatic Parking', 'Self-Driving Features'],
      2024: ['Night Vision', 'Heads-Up Display']
    }
  },

  ECONOMY: {
    standard: [
      'Airbags (Front & Side)',
      'Traction Control',
      'USB Charger',
      'Child Safety Locks',
      'Spare Tire'
    ],
    common: [
      'Bluetooth',
      'Backup Camera',
      'Aux Input',
      'Keyless Entry'
    ],
    yearBased: {
      2015: ['Bluetooth'],
      2018: ['Backup Camera'],
      2020: ['Apple CarPlay', 'Android Auto'],
      2024: ['Blind Spot Monitor']
    }
  },

  VAN: {
    standard: [
      'Airbags (Front & Side)',
      'Traction Control',
      'Stability Control',
      'USB Charger',
      'Child Safety Locks',
      'Third Row Seating',
      'Spare Tire'
    ],
    common: [
      'Bluetooth',
      'Backup Camera',
      'Keyless Entry',
      'DVD Player',
      'Roof Rack'
    ],
    yearBased: {
      2015: ['Bluetooth'],
      2018: ['Backup Camera'],
      2020: ['Apple CarPlay', 'Android Auto'],
      2022: ['Blind Spot Monitor', '360° Camera'],
      2024: ['Wireless Charging', 'WiFi Hotspot']
    }
  }
}

// Map VIN bodyClass to our feature types
export const BODY_CLASS_MAPPING: Record<string, string> = {
  'Sedan': 'SEDAN',
  'Hatchback': 'SEDAN',
  'Hatchback/Liftback/Notchback': 'SEDAN',
  'SUV': 'SUV',
  'Sport Utility Vehicle': 'SUV',
  'Sport Utility Vehicle (SUV)': 'SUV',
  'Crossover Utility Vehicle (CUV)': 'SUV',
  'Pickup': 'TRUCK',
  'Truck': 'TRUCK',
  'Crew Cab Pickup': 'TRUCK',
  'Extended Cab Pickup': 'TRUCK',
  'Van': 'VAN',
  'Minivan': 'VAN',
  'Cargo Van': 'VAN',
  'Passenger Van': 'VAN',
  'Convertible': 'CONVERTIBLE',
  'Convertible/Cabriolet': 'CONVERTIBLE',
  'Coupe': 'SPORTS',
  'Roadster': 'CONVERTIBLE',
  'Wagon': 'SEDAN',
  'Station Wagon': 'SEDAN'
}

// Luxury brand detection for LUXURY feature set
export const LUXURY_BRANDS = [
  'BMW', 'Mercedes-Benz', 'Audi', 'Lexus', 'Porsche', 'Jaguar',
  'Land Rover', 'Maserati', 'Bentley', 'Rolls-Royce', 'Ferrari',
  'Lamborghini', 'Aston Martin', 'McLaren', 'Bugatti', 'Maybach',
  'Cadillac', 'Lincoln', 'Genesis', 'Infiniti', 'Acura', 'Volvo',
  'Alfa Romeo', 'Tesla'
]

// Sports car models detection
export const SPORTS_MODELS = [
  'Mustang', 'Camaro', 'Corvette', 'Challenger', 'Charger',
  '370Z', '350Z', 'GT-R', 'Supra', 'MX-5', 'Miata', 'BRZ',
  '86', 'WRX', 'STI', 'Type R', 'M3', 'M4', 'M5', 'RS3',
  'RS5', 'RS7', 'AMG', 'GT', 'Cayman', 'Boxster', '911'
]

/**
 * Get vehicle features based on car type, year, and optionally make/model
 */
export function getVehicleFeatures(
  carType: string,
  year: number,
  fuelType?: string,
  make?: string,
  model?: string
): string[] {
  let featureType = carType?.toUpperCase() || 'SEDAN'

  // Check if electric
  if (fuelType?.toLowerCase().includes('electric') || fuelType?.toLowerCase().includes('ev')) {
    featureType = 'ELECTRIC'
  }

  // Check if luxury brand
  if (make && LUXURY_BRANDS.some(brand =>
    make.toLowerCase().includes(brand.toLowerCase())
  )) {
    featureType = 'LUXURY'
  }

  // Check if sports model
  if (model && SPORTS_MODELS.some(sport =>
    model.toLowerCase().includes(sport.toLowerCase())
  )) {
    featureType = 'SPORTS'
  }

  // Map bodyClass to our type
  const mappedType = BODY_CLASS_MAPPING[carType] || featureType
  const featureSet = VEHICLE_FEATURES_BY_TYPE[mappedType] || VEHICLE_FEATURES_BY_TYPE['SEDAN']

  const features = new Set<string>()

  // Add standard features
  featureSet.standard.forEach(f => features.add(f))

  // Add common features
  featureSet.common.forEach(f => features.add(f))

  // Add year-based features
  Object.entries(featureSet.yearBased).forEach(([featureYear, yearFeatures]) => {
    if (year >= parseInt(featureYear)) {
      yearFeatures.forEach(f => features.add(f))
    }
  })

  return Array.from(features).sort()
}

/**
 * Map VIN decoder bodyClass to our carType
 */
export function mapBodyClassToCarType(bodyClass: string, make?: string, model?: string): string {
  // Check luxury brand first
  if (make && LUXURY_BRANDS.some(brand =>
    make.toLowerCase().includes(brand.toLowerCase())
  )) {
    return 'LUXURY'
  }

  // Check sports models
  if (model && SPORTS_MODELS.some(sport =>
    model.toLowerCase().includes(sport.toLowerCase())
  )) {
    return 'SPORTS'
  }

  // Use body class mapping
  return BODY_CLASS_MAPPING[bodyClass] || 'SEDAN'
}

/**
 * Get feature category for display grouping
 */
export function getFeatureCategory(feature: string): string {
  for (const [category, features] of Object.entries(FEATURE_CATEGORIES)) {
    if (features.includes(feature)) {
      return category
    }
  }
  return 'other'
}

/**
 * Group features by category for display
 */
export function groupFeaturesByCategory(features: string[]): Record<string, string[]> {
  const grouped: Record<string, string[]> = {
    safety: [],
    comfort: [],
    technology: [],
    utility: [],
    other: []
  }

  features.forEach(feature => {
    const category = getFeatureCategory(feature)
    grouped[category].push(feature)
  })

  // Remove empty categories
  Object.keys(grouped).forEach(key => {
    if (grouped[key].length === 0) {
      delete grouped[key]
    }
  })

  return grouped
}
