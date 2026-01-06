// app/sys-2847/fleet/edit/components/VehicleSpecs.tsx
'use client'

import { useState } from 'react'

interface VehicleSpecsProps {
  make?: string
  model?: string
  year?: number
  color?: string
  vin?: string
  licensePlate?: string
  transmission?: string
  fuelType?: string
  carType?: string
  seats?: number
  doors?: number
  mpgCity?: number
  mpgHighway?: number
  currentMileage?: number
  engineSize?: string
  driveType?: string
  // Location fields
  address?: string
  city?: string
  state?: string
  zipCode?: string
  locationLat?: number
  locationLng?: number
  pickupInstructions?: string
  onChange: (field: string, value: any) => void
}

const TRANSMISSION_TYPES = [
  { value: 'AUTOMATIC', label: 'Automatic' },
  { value: 'MANUAL', label: 'Manual' },
  { value: 'SEMI_AUTOMATIC', label: 'Semi-Automatic' },
  { value: 'CVT', label: 'CVT' }
]

const FUEL_TYPES = [
  { value: 'REGULAR', label: 'Regular Gas' },
  { value: 'PREMIUM', label: 'Premium Gas' },
  { value: 'DIESEL', label: 'Diesel' },
  { value: 'ELECTRIC', label: 'Electric' },
  { value: 'HYBRID', label: 'Hybrid' },
  { value: 'PLUGIN_HYBRID', label: 'Plug-in Hybrid' }
]

const CAR_TYPES = [
  { value: 'SEDAN', label: 'Sedan' },
  { value: 'SUV', label: 'SUV' },
  { value: 'TRUCK', label: 'Truck' },
  { value: 'VAN', label: 'Van' },
  { value: 'MINIVAN', label: 'Minivan' },
  { value: 'COUPE', label: 'Coupe' },
  { value: 'CONVERTIBLE', label: 'Convertible' },
  { value: 'SPORTS', label: 'Sports Car' },
  { value: 'LUXURY', label: 'Luxury' },
  { value: 'EXOTIC', label: 'Exotic' },
  { value: 'HATCHBACK', label: 'Hatchback' },
  { value: 'WAGON', label: 'Wagon' }
]

const DRIVE_TYPES = [
  { value: 'FWD', label: 'Front-Wheel Drive' },
  { value: 'RWD', label: 'Rear-Wheel Drive' },
  { value: 'AWD', label: 'All-Wheel Drive' },
  { value: '4WD', label: '4-Wheel Drive' }
]

// Real Phoenix Metro location references - 50 locations across Maricopa County
const PHOENIX_LOCATIONS = [
  // Downtown Phoenix
  { name: 'Phoenix - Sheraton Downtown', lat: 33.4518, lng: -112.0695, address: '340 N 3rd St', zip: '85004' },
  { name: 'Phoenix - Convention Center', lat: 33.4495, lng: -112.0721, address: '100 N 1st St', zip: '85004' },
  { name: 'Phoenix - CityScape', lat: 33.4483, lng: -112.0704, address: '2 E Jefferson St', zip: '85004' },
  { name: 'Phoenix - Chase Field', lat: 33.4455, lng: -112.0667, address: '401 E Jefferson St', zip: '85004' },
  { name: 'Phoenix - Roosevelt Row', lat: 33.4566, lng: -112.0685, address: '625 N 4th Ave', zip: '85003' },
  
  // North Phoenix
  { name: 'Phoenix - Biltmore Fashion Park', lat: 33.5095, lng: -112.0083, address: '2502 E Camelback Rd', zip: '85016' },
  { name: 'Phoenix - Desert Ridge', lat: 33.6784, lng: -111.9778, address: '21001 N Tatum Blvd', zip: '85050' },
  { name: 'Phoenix - Paradise Valley Mall', lat: 33.6119, lng: -111.9658, address: '4568 E Cactus Rd', zip: '85032' },
  { name: 'Phoenix - Metrocenter', lat: 33.6089, lng: -112.1128, address: '9617 N Metro Pkwy', zip: '85051' },
  { name: 'Phoenix - Christown Spectrum', lat: 33.5167, lng: -112.0983, address: '1703 W Bethany Home Rd', zip: '85015' },
  { name: 'Phoenix - Moon Valley', lat: 33.6297, lng: -112.0356, address: '13615 N 7th St', zip: '85022' },
  
  // Phoenix Airport Area
  { name: 'Phoenix - Sky Harbor Terminal 4', lat: 33.4373, lng: -112.0078, address: '3400 E Sky Harbor Blvd', zip: '85034' },
  { name: 'Phoenix - Rental Car Center', lat: 33.4312, lng: -111.9998, address: '1805 E Sky Harbor Circle', zip: '85034' },
  
  // Scottsdale
  { name: 'Scottsdale - Fashion Square', lat: 33.5031, lng: -111.9138, address: '7014 E Camelback Rd', zip: '85251' },
  { name: 'Scottsdale - Old Town', lat: 33.4942, lng: -111.9261, address: '3965 N Brown Ave', zip: '85251' },
  { name: 'Scottsdale - Kierland Commons', lat: 33.6242, lng: -111.9401, address: '15205 N Kierland Blvd', zip: '85254' },
  { name: 'Scottsdale - Quarter', lat: 33.6225, lng: -111.9244, address: '15059 N Scottsdale Rd', zip: '85254' },
  { name: 'Scottsdale - Talking Stick Resort', lat: 33.5397, lng: -111.8736, address: '9800 E Talking Stick Way', zip: '85256' },
  { name: 'Scottsdale - Princess Resort', lat: 33.6477, lng: -111.9178, address: '7575 E Princess Dr', zip: '85255' },
  { name: 'Scottsdale - Promenade', lat: 33.5573, lng: -111.8903, address: '16495 N Scottsdale Rd', zip: '85260' },
  
  // Tempe
  { name: 'Tempe - ASU Campus', lat: 33.4242, lng: -111.9281, address: '1151 S Forest Ave', zip: '85281' },
  { name: 'Tempe - Mill Avenue', lat: 33.4307, lng: -111.9399, address: '414 S Mill Ave', zip: '85281' },
  { name: 'Tempe - Marketplace', lat: 33.4334, lng: -111.8958, address: '2000 E Rio Salado Pkwy', zip: '85281' },
  { name: 'Tempe - Town Lake', lat: 33.4329, lng: -111.9252, address: '620 N Mill Ave', zip: '85281' },
  
  // Chandler
  { name: 'Chandler - Fashion Center', lat: 33.3014, lng: -111.8967, address: '3111 W Chandler Blvd', zip: '85226' },
  { name: 'Chandler - Downtown', lat: 33.3028, lng: -111.8413, address: '178 E Commonwealth Ave', zip: '85225' },
  { name: 'Chandler - Ocotillo', lat: 33.2408, lng: -111.8692, address: '9160 S Alma School Rd', zip: '85248' },
  { name: 'Chandler - SanTan Village', lat: 33.2138, lng: -111.7905, address: '2218 E Williams Field Rd', zip: '85286' },
  
  // Gilbert
  { name: 'Gilbert - Heritage District', lat: 33.3528, lng: -111.7890, address: '222 N Ash St', zip: '85234' },
  { name: 'Gilbert - Town Square', lat: 33.3181, lng: -111.7431, address: '5875 S Cooper Rd', zip: '85298' },
  { name: 'Gilbert - SanTan Pavilions', lat: 33.2703, lng: -111.7431, address: '2200 E Williams Field Rd', zip: '85295' },
  { name: 'Gilbert - Crossroads Towne Center', lat: 33.3759, lng: -111.7545, address: '1661 S Val Vista Dr', zip: '85296' },
  
  // Mesa
  { name: 'Mesa - Downtown', lat: 33.4152, lng: -111.8315, address: '120 N Center St', zip: '85201' },
  { name: 'Mesa - Superstition Springs', lat: 33.3907, lng: -111.6954, address: '6555 E Southern Ave', zip: '85206' },
  { name: 'Mesa - Mesa Riverview', lat: 33.4302, lng: -111.7182, address: '1011 N Dobson Rd', zip: '85201' },
  { name: 'Mesa - Gateway Airport', lat: 33.3078, lng: -111.6550, address: '5835 S Sossaman Rd', zip: '85212' },
  
  // Glendale
  { name: 'Glendale - Westgate', lat: 33.6395, lng: -112.2614, address: '6751 N Sunset Blvd', zip: '85305' },
  { name: 'Glendale - Downtown', lat: 33.5386, lng: -112.1859, address: '5850 W Glendale Ave', zip: '85301' },
  { name: 'Glendale - Arrowhead Mall', lat: 33.6422, lng: -112.2253, address: '7700 W Arrowhead Towne Ctr', zip: '85308' },
  { name: 'Glendale - Sports District', lat: 33.5276, lng: -112.2626, address: '5000 W Camelback Rd', zip: '85301' },
  
  // Peoria
  { name: 'Peoria - Park West', lat: 33.6638, lng: -112.2433, address: '9804 N 83rd Ave', zip: '85345' },
  { name: 'Peoria - Old Town', lat: 33.5805, lng: -112.2374, address: '8402 W Washington St', zip: '85345' },
  { name: 'Peoria - Lake Pleasant', lat: 33.6469, lng: -112.1267, address: '11015 N 91st Ave', zip: '85345' },
  { name: 'Peoria - Vistancia', lat: 33.7589, lng: -112.3186, address: '30125 N Vistancia Blvd', zip: '85383' },
  
  // Surprise
  { name: 'Surprise - Town Center', lat: 33.6292, lng: -112.3679, address: '16126 N Civic Center Plaza', zip: '85374' },
  { name: 'Surprise - Prasada', lat: 33.6758, lng: -112.3775, address: '13764 W Bell Rd', zip: '85374' },
  
  // Avondale & Goodyear
  { name: 'Avondale - Gateway Pavilions', lat: 33.4404, lng: -112.3488, address: '1475 N Litchfield Rd', zip: '85392' },
  { name: 'Goodyear - Palm Valley', lat: 33.4354, lng: -112.3935, address: '14175 W Indian School Rd', zip: '85395' },
  { name: 'Goodyear - Estrella Falls', lat: 33.3895, lng: -112.3775, address: '15280 W McDowell Rd', zip: '85395' },
  
  // Queen Creek & San Tan Valley
  { name: 'Queen Creek - Marketplace', lat: 33.2481, lng: -111.6388, address: '21372 S Ellsworth Rd', zip: '85142' },
  { name: 'San Tan Valley - The Promenade', lat: 33.1714, lng: -111.5296, address: '3935 S Arizona Ave', zip: '85140' },
  
  // Cave Creek & Carefree
  { name: 'Cave Creek - Town Center', lat: 33.8356, lng: -111.9789, address: '6005 E Cave Creek Rd', zip: '85331' },
  { name: 'Carefree - Downtown', lat: 33.8225, lng: -111.9186, address: '100 Easy St', zip: '85377' }
]

const CITIES_ARIZONA = [
  'Phoenix', 'Scottsdale', 'Tempe', 'Mesa', 'Chandler', 'Gilbert', 
  'Glendale', 'Peoria', 'Surprise', 'Avondale', 'Goodyear', 
  'Queen Creek', 'Cave Creek', 'Carefree', 'Paradise Valley'
]

export function VehicleSpecs({
  make = '',
  model = '',
  year,
  color = '',
  vin = '',
  licensePlate = '',
  transmission = 'AUTOMATIC',
  fuelType = 'REGULAR',
  carType = 'SEDAN',
  seats = 5,
  doors = 4,
  mpgCity,
  mpgHighway,
  currentMileage,
  engineSize = '',
  driveType = 'FWD',
  // Location fields
  address = '',
  city = 'Phoenix',
  state = 'AZ',
  zipCode = '',
  locationLat,
  locationLng,
  pickupInstructions = '',
  onChange
}: VehicleSpecsProps) {
  const [showAdvanced, setShowAdvanced] = useState(false)
  const [showLocationHelper, setShowLocationHelper] = useState(false)

  // Calculate combined MPG
  const combinedMPG = mpgCity && mpgHighway 
    ? Math.round((mpgCity + mpgHighway) / 2)
    : null

  // Get fuel efficiency rating
  const getFuelEfficiencyRating = () => {
    if (!combinedMPG) return null
    
    if (fuelType === 'ELECTRIC') return 'Electric'
    if (combinedMPG >= 40) return 'Excellent'
    if (combinedMPG >= 30) return 'Very Good'
    if (combinedMPG >= 25) return 'Good'
    if (combinedMPG >= 20) return 'Average'
    return 'Below Average'
  }

  const fuelRating = getFuelEfficiencyRating()

  const applyLocationPreset = (location: typeof PHOENIX_LOCATIONS[0]) => {
    onChange('address', location.address)
    onChange('zipCode', location.zip)
    onChange('locationLat', location.lat)
    onChange('locationLng', location.lng)
    setShowLocationHelper(false)
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg p-4 sm:p-6 border border-gray-200 dark:border-gray-700 shadow-sm">
      <h3 className="text-lg font-semibold mb-4 text-gray-900 dark:text-white">
        Vehicle Specifications
      </h3>

      <div className="space-y-4">
        {/* Basic Info */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Basic Information
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Make *
              </label>
              <input
                type="text"
                value={make}
                onChange={(e) => onChange('make', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Toyota"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Model *
              </label>
              <input
                type="text"
                value={model}
                onChange={(e) => onChange('model', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Camry"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Year *
              </label>
              <input
                type="number"
                value={year || ''}
                onChange={(e) => onChange('year', parseInt(e.target.value))}
                min="1900"
                max={new Date().getFullYear() + 1}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="2024"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Color
              </label>
              <input
                type="text"
                value={color}
                onChange={(e) => onChange('color', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Silver"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Vehicle Type *
              </label>
              <select
                value={carType}
                onChange={(e) => onChange('carType', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {CAR_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Current Mileage
              </label>
              <input
                type="number"
                value={currentMileage || ''}
                onChange={(e) => onChange('currentMileage', parseInt(e.target.value))}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="25000"
              />
            </div>
          </div>
        </div>

        {/* Technical Specs */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Technical Specifications
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Transmission *
              </label>
              <select
                value={transmission}
                onChange={(e) => onChange('transmission', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {TRANSMISSION_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Fuel Type *
              </label>
              <select
                value={fuelType}
                onChange={(e) => onChange('fuelType', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {FUEL_TYPES.map(type => (
                  <option key={type.value} value={type.value}>{type.label}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Seats *
              </label>
              <input
                type="number"
                value={seats}
                onChange={(e) => onChange('seats', parseInt(e.target.value))}
                min="1"
                max="12"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Doors *
              </label>
              <input
                type="number"
                value={doors}
                onChange={(e) => onChange('doors', parseInt(e.target.value))}
                min="2"
                max="5"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>
        </div>

        {/* Fuel Economy */}
        <div>
          <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-3">
            Fuel Economy
          </h4>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                City MPG
              </label>
              <input
                type="number"
                value={mpgCity || ''}
                onChange={(e) => onChange('mpgCity', parseInt(e.target.value))}
                min="0"
                max="150"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="25"
                disabled={fuelType === 'ELECTRIC'}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Highway MPG
              </label>
              <input
                type="number"
                value={mpgHighway || ''}
                onChange={(e) => onChange('mpgHighway', parseInt(e.target.value))}
                min="0"
                max="150"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="35"
                disabled={fuelType === 'ELECTRIC'}
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Combined MPG
              </label>
              <div className="px-3 py-2 bg-gray-100 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded">
                <span className="text-gray-900 dark:text-white">
                  {fuelType === 'ELECTRIC' ? 'N/A - Electric' : (combinedMPG || '--')}
                </span>
                {fuelRating && (
                  <span className={`ml-2 text-xs ${
                    fuelRating === 'Excellent' || fuelRating === 'Electric' ? 'text-green-600 dark:text-green-400' :
                    fuelRating === 'Very Good' ? 'text-blue-600 dark:text-blue-400' :
                    fuelRating === 'Good' ? 'text-blue-500 dark:text-blue-300' :
                    fuelRating === 'Average' ? 'text-yellow-600 dark:text-yellow-400' :
                    'text-red-600 dark:text-red-400'
                  }`}>
                    ({fuelRating})
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Location & Pickup Information */}
        <div>
          <div className="flex justify-between items-center mb-3">
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Vehicle Location
            </h4>
            <button
              type="button"
              onClick={() => setShowLocationHelper(!showLocationHelper)}
              className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
            >
              {showLocationHelper ? 'Hide' : 'Use'} Phoenix Preset ({PHOENIX_LOCATIONS.length} locations)
            </button>
          </div>
          
          {/* Location Helper - 50 LOCATIONS */}
          {showLocationHelper && (
            <div className="mb-4 p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg max-h-64 overflow-y-auto">
              <p className="text-xs font-medium text-blue-900 dark:text-blue-300 mb-2">Quick Fill - Real Phoenix Metro Locations:</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-1">
                {PHOENIX_LOCATIONS.map(loc => (
                  <button
                    key={loc.name}
                    type="button"
                    onClick={() => applyLocationPreset(loc)}
                    className="text-xs text-left p-2 bg-white dark:bg-gray-800 rounded hover:bg-blue-100 dark:hover:bg-blue-900/40 transition-colors border border-gray-200 dark:border-gray-700"
                  >
                    <div className="font-medium text-gray-900 dark:text-white">{loc.name}</div>
                    <div className="text-gray-500 dark:text-gray-400">{loc.address}, {loc.zip}</div>
                  </button>
                ))}
              </div>
            </div>
          )}
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Pickup Address *
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => onChange('address', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="340 N 3rd St"
                required
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                City
              </label>
              <select
                value={city}
                onChange={(e) => onChange('city', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
              >
                {CITIES_ARIZONA.map(cityName => (
                  <option key={cityName} value={cityName}>{cityName}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                ZIP Code
              </label>
              <input
                type="text"
                value={zipCode}
                onChange={(e) => onChange('zipCode', e.target.value)}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="85004"
              />
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Latitude *
              </label>
              <input
                type="number"
                value={locationLat || ''}
                onChange={(e) => onChange('locationLat', parseFloat(e.target.value))}
                step="0.000001"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="33.4518"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Phoenix area: 33.1xxx to 33.8xxx</p>
            </div>

            <div>
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Longitude *
              </label>
              <input
                type="number"
                value={locationLng || ''}
                onChange={(e) => onChange('locationLng', parseFloat(e.target.value))}
                step="0.000001"
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="-112.0695"
                required
              />
              <p className="text-xs text-gray-500 mt-1">Phoenix area: -111.5xxx to -112.4xxx</p>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                Pickup Instructions
              </label>
              <textarea
                value={pickupInstructions}
                onChange={(e) => onChange('pickupInstructions', e.target.value)}
                rows={2}
                className="w-full px-3 py-2 bg-gray-50 dark:bg-gray-900 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500"
                placeholder="Meet at Sheraton Downtown Phoenix lobby. Text upon arrival. Valet parking on Level 2."
              />
            </div>
          </div>
        </div>

        {/* Advanced Specs */}
        <div>
          <button
            type="button"
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="flex items-center gap-2 text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            <svg 
              className={`w-4 h-4 transition-transform ${showAdvanced ? 'rotate-90' : ''}`} 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
            Advanced Specifications
          </button>

          {showAdvanced && (
            <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 p-4 bg-gray-50 dark:bg-gray-900 rounded">
              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  VIN
                </label>
                <input
                  type="text"
                  value={vin}
                  onChange={(e) => onChange('vin', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  placeholder="1HGBH41JXMN109186"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  License Plate
                </label>
                <input
                  type="text"
                  value={licensePlate}
                  onChange={(e) => onChange('licensePlate', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  placeholder="ABC-1234"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Engine Size
                </label>
                <input
                  type="text"
                  value={engineSize}
                  onChange={(e) => onChange('engineSize', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                  placeholder="2.5L 4-Cylinder"
                />
              </div>

              <div>
                <label className="block text-sm text-gray-600 dark:text-gray-400 mb-1">
                  Drive Type
                </label>
                <select
                  value={driveType}
                  onChange={(e) => onChange('driveType', e.target.value)}
                  className="w-full px-3 py-2 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-700 rounded text-gray-900 dark:text-white"
                >
                  {DRIVE_TYPES.map(type => (
                    <option key={type.value} value={type.value}>{type.label}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
        </div>

        {/* Info Box */}
        <div className="p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
          <p className="text-xs text-blue-800 dark:text-blue-300">
            <strong>Note:</strong> Accurate vehicle specifications and location help guests make informed decisions. 
            Proper coordinates ensure your car appears at the correct location on the map with accurate distance calculations.
          </p>
        </div>
      </div>
    </div>
  )
}