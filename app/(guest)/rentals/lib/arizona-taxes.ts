// Arizona P2P Car Rental Tax Rates (2025)
// P2P platforms are EXEMPT from county surcharges (Maricopa $2.50/3.25%, Pima $3.50 flat)
// Source: Arizona Department of Revenue TPT rates

export const ARIZONA_STATE_TPT = 0.056 // 5.6% State Transaction Privilege Tax

// City-specific privilege tax rates for car rentals
// Total rate = State TPT (5.6%) + City TPT
export const ARIZONA_CITY_TPT: Record<string, number> = {
  // Maricopa County cities
  'phoenix': 0.028,           // 2.8% (as of July 2025) → Total: 8.4%
  'scottsdale': 0.0175,       // 1.75% → Total: 7.35%
  'tempe': 0.025,             // 2.5% → Total: 8.1%
  'mesa': 0.027,              // 2.7% → Total: 8.3%
  'gilbert': 0.015,           // 1.5% → Total: 7.1%
  'chandler': 0.015,          // 1.5% → Total: 7.1%
  'glendale': 0.029,          // 2.9% → Total: 8.5%
  'peoria': 0.023,            // 2.3% → Total: 7.9%
  'surprise': 0.022,          // 2.2% → Total: 7.8%
  'goodyear': 0.025,          // 2.5% → Total: 8.1%
  'avondale': 0.025,          // 2.5% → Total: 8.1%
  'buckeye': 0.03,            // 3.0% → Total: 8.6%
  'fountain hills': 0.018,    // 1.8% → Total: 7.4%
  'cave creek': 0.03,         // 3.0% → Total: 8.6%
  'paradise valley': 0.025,   // 2.5% → Total: 8.1%
  'queen creek': 0.022,       // 2.2% → Total: 7.8%
  'litchfield park': 0.02,    // 2.0% → Total: 7.6%
  'tolleson': 0.03,           // 3.0% → Total: 8.6%
  'el mirage': 0.025,         // 2.5% → Total: 8.1%
  'youngtown': 0.025,         // 2.5% → Total: 8.1%

  // Pima County cities
  'tucson': 0.026,            // 2.6% → Total: 8.2%
  'oro valley': 0.025,        // 2.5% → Total: 8.1%
  'marana': 0.025,            // 2.5% → Total: 8.1%
  'south tucson': 0.04,       // 4.0% → Total: 9.6%
  'sahuarita': 0.03,          // 3.0% → Total: 8.6%

  // Pinal County cities
  'casa grande': 0.02,        // 2.0% → Total: 7.6%
  'apache junction': 0.028,   // 2.8% → Total: 8.4%
  'florence': 0.02,           // 2.0% → Total: 7.6%
  'eloy': 0.025,              // 2.5% → Total: 8.1%
  'coolidge': 0.03,           // 3.0% → Total: 8.6%
  'maricopa': 0.02,           // 2.0% → Total: 7.6%

  // Coconino County cities
  'flagstaff': 0.022,         // 2.2% → Total: 7.8%
  'sedona': 0.03,             // 3.0% → Total: 8.6%

  // Yavapai County cities
  'prescott': 0.0225,         // 2.25% → Total: 7.85%
  'prescott valley': 0.0275,  // 2.75% → Total: 8.35%
  'cottonwood': 0.025,        // 2.5% → Total: 8.1%
  'camp verde': 0.025,        // 2.5% → Total: 8.1%

  // Mohave County cities
  'lake havasu city': 0.0225, // 2.25% → Total: 7.85%
  'kingman': 0.02,            // 2.0% → Total: 7.6%
  'bullhead city': 0.02,      // 2.0% → Total: 7.6%

  // Yuma County cities
  'yuma': 0.0185,             // 1.85% → Total: 7.45%
  'san luis': 0.025,          // 2.5% → Total: 8.1%

  // Default for unincorporated areas (state tax only)
  'default': 0.0              // 0% city → Total: 5.6% (state only)
}

/**
 * Get the total tax rate for a city in Arizona
 * @param city - The city name (case-insensitive)
 * @returns Object with rate (decimal) and display string
 */
export function getTaxRate(city: string): { rate: number; display: string } {
  const normalizedCity = city.toLowerCase().trim()
  const cityRate = ARIZONA_CITY_TPT[normalizedCity] ?? ARIZONA_CITY_TPT['default']
  const totalRate = ARIZONA_STATE_TPT + cityRate

  return {
    rate: totalRate,
    display: `${(totalRate * 100).toFixed(1)}%`
  }
}

/**
 * Extract city name from an address string
 * @param address - Full address string (e.g., "123 Main St, Phoenix, AZ 85001")
 * @returns The detected city name, defaults to 'phoenix' if not found
 */
export function getCityFromAddress(address: string): string {
  if (!address) return 'phoenix'

  const normalized = address.toLowerCase()

  // Check each city name in the address
  // Sort by length (longest first) to match "fountain hills" before "hills"
  const cities = Object.keys(ARIZONA_CITY_TPT)
    .filter(city => city !== 'default')
    .sort((a, b) => b.length - a.length)

  for (const city of cities) {
    // Use word boundary check to avoid partial matches
    const regex = new RegExp(`\\b${city}\\b`, 'i')
    if (regex.test(normalized)) {
      return city
    }
  }

  // Default to Phoenix if no city match found
  return 'phoenix'
}

/**
 * Calculate taxes for a rental amount
 * @param amount - The taxable amount (rental + insurance + fees)
 * @param city - The city name for tax rate lookup
 * @returns Object with tax amount and rate info
 */
export function calculateTax(amount: number, city: string): {
  taxAmount: number
  rate: number
  display: string
  city: string
} {
  const { rate, display } = getTaxRate(city)
  const taxAmount = Math.round(amount * rate * 100) / 100 // Round to cents

  return {
    taxAmount,
    rate,
    display,
    city: city.toLowerCase().trim()
  }
}
