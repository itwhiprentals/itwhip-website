// app/lib/partners/locations.ts

import { 
    PartnerLocation, 
    PartnerDistance, 
    PartnerSearchCriteria,
    BusinessHours,
    DayHours,
    PartnerLocationType,
    PARTNER_COMMISSION_RATES
   } from './types'
   
   // Calculate distance between two coordinates in meters
   export function calculateDistance(
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number
   ): number {
    const R = 6371e3 // Earth's radius in meters
    const φ1 = lat1 * Math.PI / 180
    const φ2 = lat2 * Math.PI / 180
    const Δφ = (lat2 - lat1) * Math.PI / 180
    const Δλ = (lon2 - lon1) * Math.PI / 180
   
    const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
              Math.cos(φ1) * Math.cos(φ2) *
              Math.sin(Δλ / 2) * Math.sin(Δλ / 2)
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
   
    return R * c
   }
   
   // Check if a partner location is currently open
   export function isPartnerOpen(
    partner: PartnerLocation,
    checkTime: Date = new Date()
   ): boolean {
    const dayOfWeek = checkTime.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase() as keyof BusinessHours
    const currentTime = checkTime.toTimeString().slice(0, 5) // "HH:MM"
    
    const dayHours = partner.hours[dayOfWeek] as DayHours
    
    if (!dayHours || !dayHours.isOpen) {
      return false
    }
    
    if (!dayHours.openTime || !dayHours.closeTime) {
      return false
    }
    
    // Check if current time is within operating hours
    if (currentTime < dayHours.openTime || currentTime > dayHours.closeTime) {
      return false
    }
    
    // Check if we're in a break period
    if (dayHours.breaks && dayHours.breaks.length > 0) {
      for (const breakPeriod of dayHours.breaks) {
        if (currentTime >= breakPeriod.start && currentTime <= breakPeriod.end) {
          return false
        }
      }
    }
    
    return true
   }
   
   // Find partners near a location
   export function findNearbyPartners(
    partners: PartnerLocation[],
    criteria: PartnerSearchCriteria
   ): PartnerDistance[] {
    let filteredPartners = partners.filter(p => p.isActive)
    
    // Filter by type if specified
    if (criteria.type && criteria.type.length > 0) {
      filteredPartners = filteredPartners.filter(p => 
        criteria.type!.includes(p.type)
      )
    }
    
    // Filter by open status if specified
    if (criteria.isOpen !== undefined) {
      filteredPartners = filteredPartners.filter(p => 
        isPartnerOpen(p) === criteria.isOpen
      )
    }
    
    // Filter by amenities if specified
    if (criteria.amenities && criteria.amenities.length > 0) {
      filteredPartners = filteredPartners.filter(p => 
        criteria.amenities!.every(amenity => p.amenities.includes(amenity))
      )
    }
    
    // Calculate distances and filter by radius if location provided
    if (criteria.location) {
      const partnersWithDistance: PartnerDistance[] = filteredPartners.map(partner => {
        const distance = calculateDistance(
          criteria.location!.lat,
          criteria.location!.lng,
          partner.latitude,
          partner.longitude
        )
        
        return {
          partner,
          distanceMeters: distance,
          estimatedDriveTime: Math.ceil(distance / 500) // Rough estimate: 30km/h average
        }
      })
      
      // Filter by radius
      const filtered = partnersWithDistance.filter(
        pd => pd.distanceMeters <= criteria.location!.radiusMeters
      )
      
      // Sort by distance
      return filtered.sort((a, b) => a.distanceMeters - b.distanceMeters)
    }
    
    // No location criteria, return all filtered partners
    return filteredPartners.map(partner => ({
      partner,
      distanceMeters: 0,
      estimatedDriveTime: 0
    }))
   }
   
   // Get the best partner for a pickup/dropoff
   export function getBestPartner(
    partners: PartnerLocation[],
    userLat: number,
    userLng: number,
    preferredTypes?: PartnerLocationType[]
   ): PartnerLocation | null {
    const searchCriteria: PartnerSearchCriteria = {
      location: {
        lat: userLat,
        lng: userLng,
        radiusMeters: 5000 // 5km radius
      },
      isOpen: true,
      type: preferredTypes
    }
    
    const nearbyPartners = findNearbyPartners(partners, searchCriteria)
    
    if (nearbyPartners.length === 0) {
      // Expand search radius if no partners found
      searchCriteria.location!.radiusMeters = 10000 // 10km
      const expandedSearch = findNearbyPartners(partners, searchCriteria)
      return expandedSearch.length > 0 ? expandedSearch[0].partner : null
    }
    
    return nearbyPartners[0].partner
   }
   
   // Calculate commission for a partner
   export function calculatePartnerCommission(
    partner: PartnerLocation,
    bookingAmount: number
   ): number {
    const commissionRate = partner.commission || PARTNER_COMMISSION_RATES[partner.type] || 5
    return (bookingAmount * commissionRate) / 100
   }
   
   // Format partner hours for display
   export function formatPartnerHours(hours: BusinessHours): string[] {
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday']
    const formatted: string[] = []
    
    for (const day of days) {
      const dayHours = hours[day as keyof BusinessHours] as DayHours
      const dayName = day.charAt(0).toUpperCase() + day.slice(1)
      
      if (!dayHours || !dayHours.isOpen) {
        formatted.push(`${dayName}: Closed`)
      } else if (dayHours.openTime && dayHours.closeTime) {
        formatted.push(`${dayName}: ${formatTime(dayHours.openTime)} - ${formatTime(dayHours.closeTime)}`)
      } else {
        formatted.push(`${dayName}: Open`)
      }
    }
    
    return formatted
   }
   
   // Format time from 24h to 12h format
   function formatTime(time: string): string {
    const [hours, minutes] = time.split(':').map(Number)
    const period = hours >= 12 ? 'PM' : 'AM'
    const displayHours = hours === 0 ? 12 : hours > 12 ? hours - 12 : hours
    return `${displayHours}:${minutes.toString().padStart(2, '0')} ${period}`
   }
   
   // Validate partner location data
   export function validatePartnerLocation(location: Partial<PartnerLocation>): string[] {
    const errors: string[] = []
    
    if (!location.name) errors.push('Partner name is required')
    if (!location.type) errors.push('Partner type is required')
    if (!location.address) errors.push('Address is required')
    
    if (location.latitude !== undefined) {
      if (location.latitude < -90 || location.latitude > 90) {
        errors.push('Invalid latitude')
      }
    } else {
      errors.push('Latitude is required')
    }
    
    if (location.longitude !== undefined) {
      if (location.longitude < -180 || location.longitude > 180) {
        errors.push('Invalid longitude')
      }
    } else {
      errors.push('Longitude is required')
    }
    
    if (location.commission !== undefined) {
      if (location.commission < 0 || location.commission > 100) {
        errors.push('Commission must be between 0 and 100')
      }
    }
    
    return errors
   }
   
   // Get partner availability for a specific time range
   export function checkPartnerAvailability(
    partner: PartnerLocation,
    startTime: Date,
    endTime: Date
   ): { available: boolean; reason?: string } {
    // Check if partner is active
    if (!partner.isActive) {
      return { available: false, reason: 'Partner location is not active' }
    }
    
    // Check if partner is open during pickup time
    if (!isPartnerOpen(partner, startTime)) {
      return { available: false, reason: 'Partner is closed at pickup time' }
    }
    
    // Check if partner is open during return time (if same location)
    if (!isPartnerOpen(partner, endTime)) {
      return { available: false, reason: 'Partner is closed at return time' }
    }
    
    return { available: true }
   }