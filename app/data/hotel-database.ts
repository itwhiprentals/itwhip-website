// app/data/hotel-database.ts

export interface Hotel {
  gdsCode: string
  name: string
  address: string
  city: string
  chainCode: string
  chainName: string
  tier: 'PREMIUM' | 'STANDARD' | 'BASIC'
  status: 'ALREADY_EARNING' | 'LOSING_MONEY' | 'NOT_ACTIVATED'
  monthlyRevenue: number
  monthlyPotential: number
  competitors: string[]
  missedBookings: number
  guestComplaints: string[]
}

// Real Arizona Hotels Database
export const arizonaHotels: Record<string, Hotel> = {
  // SCOTTSDALE - LUXURY TIER (Premium - Already Earning)
  'SCF0001PH': {
    gdsCode: 'SCF0001PH',
    name: 'The Phoenician',
    address: '6000 E Camelback Rd, Scottsdale, AZ 85251',
    city: 'Scottsdale',
    chainCode: 'PH',
    chainName: 'Luxury Collection',
    tier: 'PREMIUM',
    status: 'ALREADY_EARNING',
    monthlyRevenue: 87433,
    monthlyPotential: 0,
    competitors: ['SCF0002FS', 'SCF0003FM', 'SCF0004OM'],
    missedBookings: 0,
    guestComplaints: []
  },
  
  'SCF0002FS': {
    gdsCode: 'SCF0002FS',
    name: 'Four Seasons Resort Scottsdale',
    address: '10600 E Crescent Moon Dr, Scottsdale, AZ 85262',
    city: 'Scottsdale',
    chainCode: 'FS',
    chainName: 'Four Seasons',
    tier: 'PREMIUM',
    status: 'ALREADY_EARNING',
    monthlyRevenue: 92847,
    monthlyPotential: 0,
    competitors: ['SCF0001PH', 'SCF0003FM', 'SCF0005AD'],
    missedBookings: 0,
    guestComplaints: []
  },
  
  'SCF0003FM': {
    gdsCode: 'SCF0003FM',
    name: 'Fairmont Scottsdale Princess',
    address: '7575 E Princess Dr, Scottsdale, AZ 85255',
    city: 'Scottsdale',
    chainCode: 'FM',
    chainName: 'Fairmont',
    tier: 'PREMIUM',
    status: 'ALREADY_EARNING',
    monthlyRevenue: 78234,
    monthlyPotential: 0,
    competitors: ['SCF0001PH', 'SCF0002FS', 'SCF0004OM'],
    missedBookings: 0,
    guestComplaints: []
  },
  
  'SCF0004OM': {
    gdsCode: 'SCF0004OM',
    name: 'Omni Scottsdale Resort & Spa',
    address: '4949 E Lincoln Dr, Scottsdale, AZ 85253',
    city: 'Scottsdale',
    chainCode: 'OM',
    chainName: 'Omni Hotels',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 67433,
    competitors: ['SCF0001PH', 'SCF0002FS', 'SCF0003FM'],
    missedBookings: 847,
    guestComplaints: [
      'Four Seasons offers instant rides but Omni doesn\'t',
      'Had to wait 45 minutes for Uber surge pricing',
      'Why doesn\'t Omni have the instant ride feature?',
      'Fairmont picked us up in a Tesla, very disappointed'
    ]
  },
  
  'SCF0005AD': {
    gdsCode: 'SCF0005AD',
    name: 'ADERO Scottsdale Resort',
    address: '13225 N Eagle Ridge Dr, Scottsdale, AZ 85268',
    city: 'Scottsdale',
    chainCode: 'AD',
    chainName: 'Autograph Collection',
    tier: 'PREMIUM',
    status: 'ALREADY_EARNING',
    monthlyRevenue: 56789,
    monthlyPotential: 0,
    competitors: ['SCF0002FS', 'SCF0006AZ', 'SCF0007SR'],
    missedBookings: 0,
    guestComplaints: []
  },
  
  'SCF0006AZ': {
    gdsCode: 'SCF0006AZ',
    name: 'Andaz Scottsdale Resort & Bungalows',
    address: '6114 N Scottsdale Rd, Paradise Valley, AZ 85253',
    city: 'Paradise Valley',
    chainCode: 'AZ',
    chainName: 'Andaz',
    tier: 'PREMIUM',
    status: 'ALREADY_EARNING',
    monthlyRevenue: 63421,
    monthlyPotential: 0,
    competitors: ['SCF0005AD', 'SCF0007SR', 'SCF0008MS'],
    missedBookings: 0,
    guestComplaints: []
  },
  
  'SCF0007SR': {
    gdsCode: 'SCF0007SR',
    name: 'The Scottsdale Resort & Spa',
    address: '7700 E McCormick Pkwy, Scottsdale, AZ 85258',
    city: 'Scottsdale',
    chainCode: 'SR',
    chainName: 'Curio Collection',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 45678,
    competitors: ['SCF0005AD', 'SCF0006AZ', 'SCF0009WK'],
    missedBookings: 567,
    guestComplaints: [
      'Other resorts have instant luxury rides',
      'Spent $150 on surge pricing to airport',
      'Disappointed no Tesla service like Four Seasons'
    ]
  },
  
  'SCF0008MS': {
    gdsCode: 'SCF0008MS',
    name: 'Mountain Shadows Resort',
    address: '5445 E Lincoln Dr, Paradise Valley, AZ 85253',
    city: 'Paradise Valley',
    chainCode: 'MS',
    chainName: 'Independent',
    tier: 'PREMIUM',
    status: 'ALREADY_EARNING',
    monthlyRevenue: 51234,
    monthlyPotential: 0,
    competitors: ['SCF0006AZ', 'SCF0009WK', 'SCF0010JW'],
    missedBookings: 0,
    guestComplaints: []
  },
  
  'SCF0009WK': {
    gdsCode: 'SCF0009WK',
    name: 'The Westin Kierland Resort & Spa',
    address: '6902 E Greenway Pkwy, Scottsdale, AZ 85254',
    city: 'Scottsdale',
    chainCode: 'WI',
    chainName: 'Westin',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 58901,
    competitors: ['SCF0007SR', 'SCF0008MS', 'SCF0010JW'],
    missedBookings: 723,
    guestComplaints: [
      'No instant ride option available',
      'Had to use expensive Uber during surge'
    ]
  },
  
  'SCF0010JW': {
    gdsCode: 'SCF0010JW',
    name: 'JW Marriott Scottsdale Camelback Inn',
    address: '5402 E Lincoln Dr, Scottsdale, AZ 85253',
    city: 'Scottsdale',
    chainCode: 'JW',
    chainName: 'JW Marriott',
    tier: 'PREMIUM',
    status: 'ALREADY_EARNING',
    monthlyRevenue: 71234,
    monthlyPotential: 0,
    competitors: ['SCF0008MS', 'SCF0009WK', 'SCF0011SC'],
    missedBookings: 0,
    guestComplaints: []
  },
  
  'SCF0011SC': {
    gdsCode: 'SCF0011SC',
    name: 'Sanctuary Camelback Mountain Resort',
    address: '5700 E McDonald Dr, Paradise Valley, AZ 85253',
    city: 'Paradise Valley',
    chainCode: 'SC',
    chainName: 'Sanctuary',
    tier: 'PREMIUM',
    status: 'ALREADY_EARNING',
    monthlyRevenue: 83456,
    monthlyPotential: 0,
    competitors: ['SCF0010JW', 'PHX0001AB', 'PHX0002RP'],
    missedBookings: 0,
    guestComplaints: []
  },
  
  // PHOENIX - LUXURY
  'PHX0001AB': {
    gdsCode: 'PHX0001AB',
    name: 'Arizona Biltmore',
    address: '2400 E Missouri Ave, Phoenix, AZ 85016',
    city: 'Phoenix',
    chainCode: 'WA',
    chainName: 'Waldorf Astoria',
    tier: 'PREMIUM',
    status: 'ALREADY_EARNING',
    monthlyRevenue: 95678,
    monthlyPotential: 0,
    competitors: ['SCF0011SC', 'PHX0002RP', 'PHX0003JW'],
    missedBookings: 0,
    guestComplaints: []
  },
  
  'PHX0002RP': {
    gdsCode: 'PHX0002RP',
    name: 'Royal Palms Resort and Spa',
    address: '5200 E Camelback Rd, Phoenix, AZ 85018',
    city: 'Phoenix',
    chainCode: 'RP',
    chainName: 'Hyatt',
    tier: 'PREMIUM',
    status: 'ALREADY_EARNING',
    monthlyRevenue: 68901,
    monthlyPotential: 0,
    competitors: ['PHX0001AB', 'PHX0003JW', 'PHX0004CM'],
    missedBookings: 0,
    guestComplaints: []
  },
  
  'PHX0003JW': {
    gdsCode: 'PHX0003JW',
    name: 'JW Marriott Phoenix Desert Ridge',
    address: '5350 E Marriott Dr, Phoenix, AZ 85054',
    city: 'Phoenix',
    chainCode: 'JW',
    chainName: 'JW Marriott',
    tier: 'PREMIUM',
    status: 'ALREADY_EARNING',
    monthlyRevenue: 76543,
    monthlyPotential: 0,
    competitors: ['PHX0001AB', 'PHX0002RP', 'PHX0004CM'],
    missedBookings: 0,
    guestComplaints: []
  },
  
  'PHX0004CM': {
    gdsCode: 'PHX0004CM',
    name: 'The Camby, Autograph Collection',
    address: '2401 E Camelback Rd, Phoenix, AZ 85016',
    city: 'Phoenix',
    chainCode: 'CM',
    chainName: 'Autograph Collection',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 41234,
    competitors: ['PHX0001AB', 'PHX0002RP', 'PHX0003JW'],
    missedBookings: 512,
    guestComplaints: [
      'No instant ride service available',
      'Other luxury hotels offer Tesla pickups'
    ]
  },
  
  // DOWNTOWN PHOENIX - STANDARD TIER
  'PHX0005HR': {
    gdsCode: 'PHX0005HR',
    name: 'Hyatt Regency Phoenix',
    address: '122 N 2nd St, Phoenix, AZ 85004',
    city: 'Phoenix',
    chainCode: 'HY',
    chainName: 'Hyatt',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 52345,
    competitors: ['PHX0006WP', 'PHX0007KP', 'PHX0008SP'],
    missedBookings: 634,
    guestComplaints: [
      'Convention attendees complaining about surge pricing',
      'Lost group booking to Westin with instant rides',
      'Business travelers prefer hotels with guaranteed pricing'
    ]
  },
  
  'PHX0006WP': {
    gdsCode: 'PHX0006WP',
    name: 'The Westin Phoenix Downtown',
    address: '333 N Central Ave, Phoenix, AZ 85004',
    city: 'Phoenix',
    chainCode: 'WI',
    chainName: 'Westin',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 48765,
    competitors: ['PHX0005HR', 'PHX0007KP', 'PHX0008SP'],
    missedBookings: 589,
    guestComplaints: [
      'Guests asking why we don\'t have instant rides',
      'Lost corporate contract to competitor with ride service'
    ]
  },
  
  'PHX0007KP': {
    gdsCode: 'PHX0007KP',
    name: 'Kimpton Hotel Palomar Phoenix',
    address: '2 E Jefferson St, Phoenix, AZ 85004',
    city: 'Phoenix',
    chainCode: 'KI',
    chainName: 'Kimpton',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 43210,
    competitors: ['PHX0005HR', 'PHX0006WP', 'PHX0008SP'],
    missedBookings: 498,
    guestComplaints: [
      'Other downtown hotels offer ride services',
      'Paid triple for Uber during Suns game'
    ]
  },
  
  'PHX0008SP': {
    gdsCode: 'PHX0008SP',
    name: 'Sheraton Phoenix Downtown',
    address: '340 N 3rd St, Phoenix, AZ 85004',
    city: 'Phoenix',
    chainCode: 'SI',
    chainName: 'Sheraton',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 55432,
    competitors: ['PHX0005HR', 'PHX0006WP', 'PHX0007KP'],
    missedBookings: 701,
    guestComplaints: [
      'Convention groups choosing hotels with transportation',
      'Airport surge pricing complaints daily'
    ]
  },
  
  'PHX0009RP': {
    gdsCode: 'PHX0009RP',
    name: 'Renaissance Phoenix Downtown Hotel',
    address: '100 N 1st St, Phoenix, AZ 85004',
    city: 'Phoenix',
    chainCode: 'BR',
    chainName: 'Renaissance',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 39876,
    competitors: ['PHX0008SP', 'PHX0010HG', 'PHX0011AC'],
    missedBookings: 456,
    guestComplaints: [
      'Guests frustrated with transportation costs'
    ]
  },
  
  'PHX0010HG': {
    gdsCode: 'PHX0010HG',
    name: 'Hilton Garden Inn Phoenix Downtown',
    address: '15 E Monroe St, Phoenix, AZ 85004',
    city: 'Phoenix',
    chainCode: 'GI',
    chainName: 'Hilton Garden Inn',
    tier: 'BASIC',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 28765,
    competitors: ['PHX0009RP', 'PHX0011AC', 'PHX0012HI'],
    missedBookings: 345,
    guestComplaints: [
      'Budget travelers still need affordable rides'
    ]
  },
  
  'PHX0011AC': {
    gdsCode: 'PHX0011AC',
    name: 'AC Hotel Phoenix Downtown',
    address: '414 S 3rd St, Phoenix, AZ 85004',
    city: 'Phoenix',
    chainCode: 'AC',
    chainName: 'AC Hotels',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 31234,
    competitors: ['PHX0009RP', 'PHX0010HG', 'PHX0012HI'],
    missedBookings: 389,
    guestComplaints: []
  },
  
  'PHX0012HI': {
    gdsCode: 'PHX0012HI',
    name: 'Hampton Inn & Suites Phoenix Downtown',
    address: '151 E Washington St, Phoenix, AZ 85004',
    city: 'Phoenix',
    chainCode: 'HX',
    chainName: 'Hampton Inn',
    tier: 'BASIC',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 24567,
    competitors: ['PHX0010HG', 'PHX0011AC', 'PHX0013HP'],
    missedBookings: 298,
    guestComplaints: []
  },
  
  'PHX0013HP': {
    gdsCode: 'PHX0013HP',
    name: 'Hyatt Place Phoenix/Downtown',
    address: '150 W Adams St, Phoenix, AZ 85003',
    city: 'Phoenix',
    chainCode: 'PH',
    chainName: 'Hyatt Place',
    tier: 'BASIC',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 26789,
    competitors: ['PHX0012HI', 'PHX0014SS', 'PHX0015RI'],
    missedBookings: 312,
    guestComplaints: []
  },
  
  // TEMPE/ASU AREA
  'TMP0001OM': {
    gdsCode: 'TMP0001OM',
    name: 'Omni Tempe Hotel at ASU',
    address: '7 East University Dr, Tempe, AZ 85281',
    city: 'Tempe',
    chainCode: 'OM',
    chainName: 'Omni Hotels',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 61234,
    competitors: ['TMP0002TM', 'TMP0003GT', 'TMP0004WT'],
    missedBookings: 756,
    guestComplaints: [
      'Parents weekend - families need rides to campus',
      'ASU games create surge pricing nightmares',
      'Mill Avenue visitors stuck with high Uber costs'
    ]
  },
  
  'TMP0002TM': {
    gdsCode: 'TMP0002TM',
    name: 'Tempe Mission Palms',
    address: '60 E 5th St, Tempe, AZ 85281',
    city: 'Tempe',
    chainCode: 'TM',
    chainName: 'Destination Hotels',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 54321,
    competitors: ['TMP0001OM', 'TMP0003GT', 'TMP0004WT'],
    missedBookings: 623,
    guestComplaints: [
      'Graduation weekend surge pricing was insane',
      'Business travelers avoiding us for hotels with rides'
    ]
  },
  
  'TMP0003GT': {
    gdsCode: 'TMP0003GT',
    name: 'Graduate Tempe',
    address: '225 E Apache Blvd, Tempe, AZ 85281',
    city: 'Tempe',
    chainCode: 'GT',
    chainName: 'Graduate Hotels',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 43210,
    competitors: ['TMP0001OM', 'TMP0002TM', 'TMP0004WT'],
    missedBookings: 512,
    guestComplaints: [
      'Parents asking about airport transportation',
      'Game day transportation is a nightmare'
    ]
  },
  
  'TMP0004WT': {
    gdsCode: 'TMP0004WT',
    name: 'The Westin Tempe',
    address: '11 E 7th Street, Tempe, AZ 85281',
    city: 'Tempe',
    chainCode: 'WI',
    chainName: 'Westin',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 57890,
    competitors: ['TMP0001OM', 'TMP0002TM', 'TMP0003GT'],
    missedBookings: 689,
    guestComplaints: [
      'Corporate groups choosing hotels with guaranteed rides'
    ]
  },
  
  'TMP0005AC': {
    gdsCode: 'TMP0005AC',
    name: 'AC Hotel Phoenix Tempe/Downtown',
    address: '100 E Rio Salado Pkwy, Tempe, AZ 85281',
    city: 'Tempe',
    chainCode: 'AC',
    chainName: 'AC Hotels',
    tier: 'BASIC',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 32145,
    competitors: ['TMP0004WT', 'TMP0006CB', 'TMP0007DT'],
    missedBookings: 398,
    guestComplaints: []
  },
  
  'TMP0006CB': {
    gdsCode: 'TMP0006CB',
    name: 'Canopy by Hilton Tempe Downtown',
    address: '108 E University Dr, Tempe, AZ 85281',
    city: 'Tempe',
    chainCode: 'CN',
    chainName: 'Canopy',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 38765,
    competitors: ['TMP0005AC', 'TMP0007DT', 'TMP0008HH'],
    missedBookings: 445,
    guestComplaints: []
  },
  
  // CHANDLER
  'CHA0001SG': {
    gdsCode: 'CHA0001SG',
    name: 'Sheraton Grand at Wild Horse Pass',
    address: '5594 W Wild Horse Pass Blvd, Chandler, AZ 85048',
    city: 'Chandler',
    chainCode: 'SI',
    chainName: 'Sheraton',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 72345,
    competitors: ['CHA0002CS', 'CHA0003HC', 'PHX0001AB'],
    missedBookings: 891,
    guestComplaints: [
      'Remote location makes ride costs excessive',
      'Conference attendees frustrated with transportation',
      'Casino visitors need reliable ride options'
    ]
  },
  
  'CHA0002CS': {
    gdsCode: 'CHA0002CS',
    name: 'Crowne Plaza San Marcos Resort',
    address: 'One San Marcos Place, Chandler, AZ 85224',
    city: 'Chandler',
    chainCode: 'CP',
    chainName: 'Crowne Plaza',
    tier: 'STANDARD',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 49876,
    competitors: ['CHA0001SG', 'CHA0003HC', 'CHA0004CY'],
    missedBookings: 598,
    guestComplaints: [
      'Golf groups need transportation to courses',
      'Tech conference attendees choosing other hotels'
    ]
  },
  
  'CHA0003HC': {
    gdsCode: 'CHA0003HC',
    name: 'Hilton Phoenix Chandler',
    address: '2929 W Frye Rd, Chandler, AZ 85224',
    city: 'Chandler',
    chainCode: 'HI',
    chainName: 'Hilton',
    tier: 'BASIC',
    status: 'LOSING_MONEY',
    monthlyRevenue: 0,
    monthlyPotential: 31234,
    competitors: ['CHA0001SG', 'CHA0002CS', 'CHA0004CY'],
    missedBookings: 367,
    guestComplaints: []
  }
}

// Chain code mappings for fuzzy matching
export const chainCodeMap: Record<string, string[]> = {
  'OM': ['SCF0004OM', 'TMP0001OM'], // Omni Hotels
  'FS': ['SCF0002FS'], // Four Seasons
  'FM': ['SCF0003FM'], // Fairmont
  'HY': ['PHX0005HR', 'PHX0013HP'], // Hyatt
  'HI': ['CHA0003HC'], // Hilton
  'WI': ['SCF0009WK', 'PHX0006WP', 'TMP0004WT'], // Westin
  'SI': ['PHX0008SP', 'CHA0001SG'], // Sheraton
  'JW': ['SCF0010JW', 'PHX0003JW'], // JW Marriott
  'AC': ['PHX0011AC', 'TMP0005AC'], // AC Hotels
  'PH': ['SCF0001PH', 'PHX0013HP'], // Phoenician/Hyatt Place
}

// City code mappings
export const cityCodeMap: Record<string, string[]> = {
  'PHX': Object.keys(arizonaHotels).filter(code => code.startsWith('PHX')),
  'SCF': Object.keys(arizonaHotels).filter(code => code.startsWith('SCF')),
  'TMP': Object.keys(arizonaHotels).filter(code => code.startsWith('TMP')),
  'CHA': Object.keys(arizonaHotels).filter(code => code.startsWith('CHA')),
}

// Guest complaint templates
export const complaintTemplates = [
  '{competitor} offers instant luxury rides but {hotel} doesn\'t',
  'Had to pay ${surgePrice} for Uber during surge pricing',
  'Why doesn\'t {hotel} have instant rides like other hotels?',
  'Disappointed {hotel} doesn\'t offer Tesla service',
  'Lost a group booking to {competitor} because they have transportation',
  'Convention attendees complaining about surge pricing',
  'Business travelers prefer hotels with guaranteed ride pricing',
  'Parents weekend created surge pricing nightmares',
  'Game day transportation was impossible',
  'Airport surge pricing cost more than the room',
  'Other hotels in the area offer complimentary luxury rides',
  'Spent ${surgePrice} just to get to the airport',
  'My company is moving all bookings to hotels with instant rides',
  'The {competitor} picked us up in a Tesla Model S',
  'Missed my flight waiting for affordable transportation'
]

// Dynamic metric generators
export const generateMetrics = (hotelCode: string) => {
  const hotel = arizonaHotels[hotelCode]
  if (!hotel) return null
  
  const baseMetrics = {
    currentSurge: parseFloat((Math.random() * 2 + 1.5).toFixed(1)),
    activeRequests: Math.floor(Math.random() * 30) + 15,
    driversNearby: Math.floor(Math.random() * 8) + 3,
    averageWait: Math.floor(Math.random() * 15) + 8,
    todaysMissedRevenue: hotel.monthlyPotential ? 
      Math.floor(hotel.monthlyPotential / 30 * (0.8 + Math.random() * 0.4)) : 0,
    competitorJustActivated: getRandomCompetitor(hotel.competitors),
    lastGuestComplaint: getRandomComplaint(hotel.name, hotel.competitors[0])
  }
  
  return baseMetrics
}

// Get random competitor
export const getRandomCompetitor = (competitors: string[]): string | null => {
  if (!competitors || competitors.length === 0) return null
  const competitorCode = competitors[Math.floor(Math.random() * competitors.length)]
  return arizonaHotels[competitorCode]?.name || null
}

// Generate random complaint
export const getRandomComplaint = (hotelName: string, competitorCode?: string): string => {
  const template = complaintTemplates[Math.floor(Math.random() * complaintTemplates.length)]
  const competitorName = competitorCode ? arizonaHotels[competitorCode]?.name : 'Four Seasons'
  const surgePrice = Math.floor(Math.random() * 100) + 50
  
  return template
    .replace('{hotel}', hotelName)
    .replace('{competitor}', competitorName || 'Four Seasons')
    .replace('{surgePrice}', surgePrice.toString())
}

// Fuzzy search function
export const fuzzySearchHotel = (input: string): string[] => {
  const query = input.toUpperCase().trim()
  let matches: string[] = []
  
  // Check if it's a chain code
  if (chainCodeMap[query]) {
    matches = chainCodeMap[query]
  }
  // Check if it's a city code
  else if (cityCodeMap[query]) {
    matches = cityCodeMap[query]
  }
  // Check for partial matches
  else {
    matches = Object.keys(arizonaHotels).filter(code => 
      code.includes(query) || 
      arizonaHotels[code].name.toUpperCase().includes(query) ||
      arizonaHotels[code].city.toUpperCase().includes(query)
    )
  }
  
  return matches.slice(0, 10) // Return max 10 matches
}

// Get hotel by code
export const getHotelByCode = (code: string): Hotel | null => {
  return arizonaHotels[code] || null
}

// Check if code exists
export const isValidHotelCode = (code: string): boolean => {
  return !!arizonaHotels[code]
}