// app/(guest)/rentals/lib/amadeus-cars.ts
// Amadeus car rental API integration

import { 
    AmadeusCarData, 
    AmadeusSearchParams, 
    RentalCarWithDetails,
    RentalSearchParams,
    CarType
  } from '@/app/types/rental'
  import { AMADEUS_CONFIG, PRICING_CONFIG } from './constants'
  import { prisma } from '@/app/lib/database/prisma'
  
  // ============================================================================
  // AMADEUS CLIENT CONFIGURATION
  // ============================================================================
  
  class AmadeusClient {
    private accessToken: string | null = null
    private tokenExpiry: Date | null = null
    private baseUrl: string
    private apiKey: string
    private apiSecret: string
  
    constructor() {
      this.baseUrl = process.env.AMADEUS_BASE_URL || 'https://test.api.amadeus.com'
      this.apiKey = process.env.AMADEUS_API_KEY || ''
      this.apiSecret = process.env.AMADEUS_API_SECRET || ''
    }
  
    /**
     * Get or refresh access token
     */
    private async getAccessToken(): Promise<string> {
      // Check if we have a valid token
      if (this.accessToken && this.tokenExpiry && new Date() < this.tokenExpiry) {
        return this.accessToken
      }
  
      // Get new token
      try {
        const response = await fetch(`${this.baseUrl}/v1/security/oauth2/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded'
          },
          body: new URLSearchParams({
            grant_type: 'client_credentials',
            client_id: this.apiKey,
            client_secret: this.apiSecret
          })
        })
  
        if (!response.ok) {
          throw new Error(`Amadeus auth failed: ${response.statusText}`)
        }
  
        const data = await response.json()
        this.accessToken = data.access_token
        this.tokenExpiry = new Date(Date.now() + (data.expires_in * 1000))
        
        return this.accessToken
      } catch (error) {
        console.error('Amadeus authentication error:', error)
        throw error
      }
    }
  
    /**
     * Make authenticated API request
     */
    async request(endpoint: string, params?: Record<string, any>) {
      const token = await this.getAccessToken()
      const url = new URL(`${this.baseUrl}${endpoint}`)
      
      if (params) {
        Object.keys(params).forEach(key => {
          if (params[key] !== undefined && params[key] !== null) {
            url.searchParams.append(key, params[key])
          }
        })
      }
  
      const response = await fetch(url.toString(), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      })
  
      if (!response.ok) {
        const error = await response.text()
        console.error('Amadeus API error:', error)
        throw new Error(`Amadeus API error: ${response.statusText}`)
      }
  
      return response.json()
    }
  }
  
  // Create singleton instance
  const amadeusClient = new AmadeusClient()
  
  // ============================================================================
  // CAR SEARCH FUNCTIONS
  // ============================================================================
  
  /**
   * Search for cars using Amadeus API
   */
  export async function searchAmadeusCars(params: RentalSearchParams): Promise<AmadeusCarData[]> {
    try {
      // Check cache first
      const cacheKey = JSON.stringify(params)
      const cached = await getCachedSearch(cacheKey)
      if (cached) {
        console.log('🎯 Using cached Amadeus results')
        return cached
      }
  
      // In TEST environment, return mock data
      if (process.env.AMADEUS_ENV === 'test') {
        console.log('🧪 Using Amadeus TEST environment - returning mock data')
        return getMockAmadeusData(params)
      }
  
      // Convert our params to Amadeus format
      const amadeusParams = {
        latitude: params.latitude,
        longitude: params.longitude,
        radius: params.radius || AMADEUS_CONFIG.DEFAULT_RADIUS_MILES,
        pickUpDateTime: formatAmadeusDateTime(params.pickupDate, params.pickupTime),
        dropOffDateTime: formatAmadeusDateTime(params.returnDate, params.returnTime),
        providers: AMADEUS_CONFIG.SUPPORTED_PROVIDERS.join(','),
        max: AMADEUS_CONFIG.MAX_RESULTS
      }
  
      // Make API request
      const response = await amadeusClient.request(
        '/v1/shopping/car-rentals',
        amadeusParams
      )
  
      // Transform and cache results
      const cars = transformAmadeusResponse(response.data || [])
      await cacheSearch(cacheKey, cars)
      
      return cars
    } catch (error) {
      console.error('Amadeus car search error:', error)
      // Return mock data as fallback
      return getMockAmadeusData(params)
    }
  }
  
  /**
   * Get car availability from Amadeus
   */
  export async function checkAmadeusAvailability(
    carId: string,
    pickupDate: Date,
    returnDate: Date
  ): Promise<boolean> {
    // In test mode, always return available
    if (process.env.AMADEUS_ENV === 'test') {
      return true
    }
  
    try {
      // This would be a real availability check in production
      // For now, we'll simulate with random availability
      return Math.random() > 0.1 // 90% available
    } catch (error) {
      console.error('Amadeus availability check error:', error)
      return false
    }
  }
  
  // ============================================================================
  // DATA TRANSFORMATION
  // ============================================================================
  
  /**
   * Transform Amadeus response to our format
   */
  function transformAmadeusResponse(amadeusData: any[]): AmadeusCarData[] {
    return amadeusData.map(item => ({
      provider: item.provider?.name || 'Partner',
      vehicleCode: item.vehicle?.code || 'UNKNOWN',
      vehicleCategory: mapAmadeusCategory(item.vehicle?.category),
      vehicleClass: item.vehicle?.class || 'standard',
      doors: item.vehicle?.doors || 4,
      seats: item.vehicle?.seats || 5,
      transmission: item.vehicle?.transmission || 'automatic',
      fuelType: mapFuelType(item.vehicle?.fuel),
      airConditioning: item.vehicle?.airConditioning !== false,
      mileage: {
        unlimited: item.mileage?.unlimited || false,
        included: item.mileage?.included || 200,
        unit: item.mileage?.unit || 'MILE'
      },
      pricing: {
        daily: parseFloat(item.pricing?.daily || 50),
        weekly: item.pricing?.weekly ? parseFloat(item.pricing.weekly) : undefined,
        currency: item.pricing?.currency || 'USD'
      },
      location: {
        code: item.location?.code || 'PHX',
        name: item.location?.name || 'Airport',
        address: item.location?.address || '',
        latitude: item.location?.latitude || 0,
        longitude: item.location?.longitude || 0
      }
    }))
  }
  
  /**
   * Convert Amadeus data to our RentalCar format
   */
  export function amadeusToRentalCar(
    amadeusCar: AmadeusCarData,
    searchParams: RentalSearchParams
  ): RentalCarWithDetails {
    // Apply our markup to Amadeus prices
    const markedUpDaily = amadeusCar.pricing.daily * (1 + PRICING_CONFIG.AMADEUS_MARKUP)
    const markedUpWeekly = amadeusCar.pricing.weekly 
      ? amadeusCar.pricing.weekly * (1 + PRICING_CONFIG.AMADEUS_MARKUP)
      : undefined
  
    // Create a mock RentalCar object
    const rentalCar: RentalCarWithDetails = {
      id: `amadeus-${amadeusCar.vehicleCode}-${Date.now()}`,
      hostId: 'amadeus-host',
      source: 'amadeus',
      externalId: amadeusCar.vehicleCode,
      make: getVehicleMake(amadeusCar.vehicleCategory),
      model: getVehicleModel(amadeusCar.vehicleCategory),
      year: new Date().getFullYear(),
      color: 'Various',
      licensePlate: null,
      vin: null,
      carType: amadeusCar.vehicleCategory as CarType,
      seats: amadeusCar.seats,
      doors: amadeusCar.doors,
      transmission: amadeusCar.transmission as any,
      fuelType: amadeusCar.fuelType as any,
      mpgCity: null,
      mpgHighway: null,
      currentMileage: null,
      dailyRate: markedUpDaily,
      weeklyRate: markedUpWeekly || markedUpDaily * 6,
      monthlyRate: markedUpDaily * 25,
      deliveryFee: 0, // Included at airport
      weeklyDiscount: 0.15,
      monthlyDiscount: 0.30,
      features: JSON.stringify(getStandardFeatures(amadeusCar)),
      address: amadeusCar.location.address,
      city: getCityFromLocation(amadeusCar.location.name),
      state: 'AZ',
      zipCode: '85034',
      latitude: amadeusCar.location.latitude,
      longitude: amadeusCar.location.longitude,
      airportPickup: true,
      hotelDelivery: false,
      homeDelivery: false,
      isActive: true,
      instantBook: true,
      advanceNotice: 2,
      minTripDuration: 1,
      maxTripDuration: 30,
      rules: JSON.stringify(['No smoking', 'Return with same fuel level']),
      insuranceIncluded: false,
      insuranceDaily: 25,
      totalTrips: Math.floor(Math.random() * 100) + 20,
      rating: 4.2 + Math.random() * 0.5,
      createdAt: new Date(),
      updatedAt: new Date(),
      
      // Relations
      host: {
        id: 'amadeus-host',
        userId: null,
        email: 'partners@amadeus.com',
        name: amadeusCar.provider,
        phone: '1-800-AMADEUS',
        profilePhoto: null,
        bio: null,
        isVerified: true,
        verifiedAt: new Date(),
        verificationLevel: 'partner',
        responseTime: 5,
        responseRate: 100,
        acceptanceRate: 95,
        totalTrips: 1000,
        rating: 4.5,
        city: 'Phoenix',
        state: 'AZ',
        zipCode: '85034',
        active: true,
        joinedAt: new Date('2020-01-01'),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      photos: [
        {
          id: '1',
          carId: '',
          url: `/images/cars/${amadeusCar.vehicleCategory}-generic-1.jpg`,
          caption: null,
          isHero: true,
          order: 0,
          createdAt: new Date()
        },
        {
          id: '2',
          carId: '',
          url: `/images/cars/${amadeusCar.vehicleCategory}-generic-2.jpg`,
          caption: null,
          isHero: false,
          order: 1,
          createdAt: new Date()
        }
      ],
      availability: [],
      reviews: [],
      amadeusData: amadeusCar
    }
  
    return rentalCar
  }
  
  // ============================================================================
  // MOCK DATA FOR TESTING
  // ============================================================================
  
  /**
   * Get mock Amadeus data for testing
   */
  function getMockAmadeusData(params: RentalSearchParams): AmadeusCarData[] {
    const mockCars: AmadeusCarData[] = [
      {
        provider: 'Hertz',
        vehicleCode: 'ECAR',
        vehicleCategory: 'economy',
        vehicleClass: 'economy',
        doors: 4,
        seats: 5,
        transmission: 'automatic',
        fuelType: 'gas',
        airConditioning: true,
        mileage: {
          unlimited: false,
          included: 200,
          unit: 'MILE'
        },
        pricing: {
          daily: 32,
          weekly: 180,
          currency: 'USD'
        },
        location: {
          code: 'PHX',
          name: 'Phoenix Sky Harbor Airport',
          address: '3400 E Sky Harbor Blvd, Phoenix, AZ',
          latitude: 33.4342,
          longitude: -112.0080
        }
      },
      {
        provider: 'Enterprise',
        vehicleCode: 'CCAR',
        vehicleCategory: 'compact',
        vehicleClass: 'compact',
        doors: 4,
        seats: 5,
        transmission: 'automatic',
        fuelType: 'gas',
        airConditioning: true,
        mileage: {
          unlimited: false,
          included: 200,
          unit: 'MILE'
        },
        pricing: {
          daily: 38,
          weekly: 210,
          currency: 'USD'
        },
        location: {
          code: 'PHX',
          name: 'Phoenix Sky Harbor Airport',
          address: '3400 E Sky Harbor Blvd, Phoenix, AZ',
          latitude: 33.4342,
          longitude: -112.0080
        }
      },
      {
        provider: 'Budget',
        vehicleCode: 'ICAR',
        vehicleCategory: 'midsize',
        vehicleClass: 'intermediate',
        doors: 4,
        seats: 5,
        transmission: 'automatic',
        fuelType: 'gas',
        airConditioning: true,
        mileage: {
          unlimited: true,
          included: 0,
          unit: 'MILE'
        },
        pricing: {
          daily: 45,
          weekly: 250,
          currency: 'USD'
        },
        location: {
          code: 'PHX',
          name: 'Phoenix Sky Harbor Airport',
          address: '3400 E Sky Harbor Blvd, Phoenix, AZ',
          latitude: 33.4342,
          longitude: -112.0080
        }
      },
      {
        provider: 'Avis',
        vehicleCode: 'SCAR',
        vehicleCategory: 'fullsize',
        vehicleClass: 'standard',
        doors: 4,
        seats: 5,
        transmission: 'automatic',
        fuelType: 'gas',
        airConditioning: true,
        mileage: {
          unlimited: true,
          included: 0,
          unit: 'MILE'
        },
        pricing: {
          daily: 52,
          weekly: 290,
          currency: 'USD'
        },
        location: {
          code: 'PHX',
          name: 'Phoenix Sky Harbor Airport',
          address: '3400 E Sky Harbor Blvd, Phoenix, AZ',
          latitude: 33.4342,
          longitude: -112.0080
        }
      },
      {
        provider: 'National',
        vehicleCode: 'IFAR',
        vehicleCategory: 'suv',
        vehicleClass: 'suv-intermediate',
        doors: 4,
        seats: 7,
        transmission: 'automatic',
        fuelType: 'gas',
        airConditioning: true,
        mileage: {
          unlimited: false,
          included: 300,
          unit: 'MILE'
        },
        pricing: {
          daily: 68,
          weekly: 380,
          currency: 'USD'
        },
        location: {
          code: 'PHX',
          name: 'Phoenix Sky Harbor Airport',
          address: '3400 E Sky Harbor Blvd, Phoenix, AZ',
          latitude: 33.4342,
          longitude: -112.0080
        }
      },
      {
        provider: 'Hertz',
        vehicleCode: 'PCAR',
        vehicleCategory: 'luxury',
        vehicleClass: 'premium',
        doors: 4,
        seats: 5,
        transmission: 'automatic',
        fuelType: 'gas',
        airConditioning: true,
        mileage: {
          unlimited: false,
          included: 200,
          unit: 'MILE'
        },
        pricing: {
          daily: 85,
          weekly: 475,
          currency: 'USD'
        },
        location: {
          code: 'PHX',
          name: 'Phoenix Sky Harbor Airport',
          address: '3400 E Sky Harbor Blvd, Phoenix, AZ',
          latitude: 33.4342,
          longitude: -112.0080
        }
      }
    ]
  
    // Filter by location if needed
    if (params.location && !params.location.toLowerCase().includes('phoenix')) {
      return [] // Return empty for non-Phoenix in test mode
    }
  
    return mockCars
  }
  
  // ============================================================================
  // HELPER FUNCTIONS
  // ============================================================================
  
  /**
   * Format date/time for Amadeus API
   */
  function formatAmadeusDateTime(date: Date | string, time?: string): string {
    const d = new Date(date)
    const dateStr = d.toISOString().split('T')[0]
    const timeStr = time || '10:00:00'
    return `${dateStr}T${timeStr}`
  }
  
  /**
   * Map Amadeus category to our car type
   */
  function mapAmadeusCategory(category?: string): CarType {
    if (!category) return 'midsize'
    
    const mapping = AMADEUS_CONFIG.VEHICLE_CATEGORIES as any
    return mapping[category.toUpperCase()] || 'midsize'
  }
  
  /**
   * Map fuel type
   */
  function mapFuelType(fuel?: string): string {
    if (!fuel) return 'gas'
    
    const fuelMap: Record<string, string> = {
      'GASOLINE': 'gas',
      'DIESEL': 'diesel',
      'ELECTRIC': 'electric',
      'HYBRID': 'hybrid'
    }
    
    return fuelMap[fuel.toUpperCase()] || 'gas'
  }
  
  /**
   * Get vehicle make from category
   */
  function getVehicleMake(category: string): string {
    const makes: Record<string, string> = {
      'economy': 'Nissan',
      'compact': 'Toyota',
      'midsize': 'Honda',
      'fullsize': 'Chevrolet',
      'suv': 'Ford',
      'luxury': 'BMW',
      'convertible': 'Ford',
      'minivan': 'Chrysler'
    }
    return makes[category] || 'Various'
  }
  
  /**
   * Get vehicle model from category
   */
  function getVehicleModel(category: string): string {
    const models: Record<string, string> = {
      'economy': 'Versa or similar',
      'compact': 'Corolla or similar',
      'midsize': 'Accord or similar',
      'fullsize': 'Malibu or similar',
      'suv': 'Explorer or similar',
      'luxury': '3 Series or similar',
      'convertible': 'Mustang or similar',
      'minivan': 'Pacifica or similar'
    }
    return models[category] || 'Standard'
  }
  
  /**
   * Get standard features for car type
   */
  function getStandardFeatures(car: AmadeusCarData): string[] {
    const features = ['Air Conditioning', 'Power Windows', 'Power Locks']
    
    if (car.transmission === 'automatic') features.push('Automatic Transmission')
    if (car.mileage.unlimited) features.push('Unlimited Mileage')
    if (car.seats >= 7) features.push('7+ Seats')
    if (car.vehicleCategory === 'luxury') {
      features.push('Leather Seats', 'Premium Audio', 'Navigation')
    }
    if (car.vehicleCategory === 'suv') {
      features.push('All-Wheel Drive', 'Cargo Space')
    }
    
    return features
  }
  
  /**
   * Get city from location name
   */
  function getCityFromLocation(locationName: string): string {
    if (locationName.includes('Phoenix')) return 'Phoenix'
    if (locationName.includes('Scottsdale')) return 'Scottsdale'
    if (locationName.includes('Tempe')) return 'Tempe'
    if (locationName.includes('Mesa')) return 'Mesa'
    return 'Phoenix'
  }
  
  // ============================================================================
  // CACHING
  // ============================================================================
  
  /**
   * Get cached search results
   */
  async function getCachedSearch(key: string): Promise<AmadeusCarData[] | null> {
    try {
      const cached = await prisma.amadeusCarCache.findFirst({
        where: {
          location: key,
          expiresAt: {
            gt: new Date()
          }
        },
        orderBy: {
          id: 'desc'
        }
      })
      
      if (cached && cached.carData) {
        return JSON.parse(cached.carData as string)
      }
    } catch (error) {
      console.error('Cache retrieval error:', error)
    }
    
    return null
  }
  
  /**
   * Cache search results
   */
  async function cacheSearch(key: string, data: AmadeusCarData[]) {
    try {
      const expiresAt = new Date(Date.now() + AMADEUS_CONFIG.CACHE_DURATION_MINUTES * 60 * 1000)
      
      await prisma.amadeusCarCache.create({
        data: {
          location: key,
          searchDate: new Date(),
          carData: JSON.stringify(data),
          expiresAt
        }
      })
    } catch (error) {
      console.error('Cache storage error:', error)
    }
  }