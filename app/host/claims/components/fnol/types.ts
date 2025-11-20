// app/host/claims/components/fnol/types.ts

/**
 * FNOL (First Notice of Loss) Type Definitions
 * Shared interfaces used across all FNOL claim form components
 */

// ============================================================================
// WITNESS INTERFACES
// ============================================================================

export interface Witness {
    name: string
    phone: string
    email: string
    statement: string
  }
  
  // ============================================================================
  // INJURY INTERFACES
  // ============================================================================
  
  export interface Injury {
    person: string
    description: string
    severity: 'Minor' | 'Moderate' | 'Severe' | 'Critical'
    medicalAttention: boolean
    hospital: string
  }
  
  // ============================================================================
  // OTHER PARTY INTERFACES
  // ============================================================================
  
  export interface OtherPartyDriver {
    name: string
    phone: string
    license: string
    licenseState: string
  }
  
  export interface OtherPartyVehicle {
    year: string
    make: string
    model: string
    plate: string
    vin: string
  }
  
  export interface OtherPartyInsurance {
    carrier: string
    policy: string
  }
  
  export interface OtherParty {
    driver: OtherPartyDriver
    vehicle: OtherPartyVehicle
    insurance: OtherPartyInsurance
  }
  
  // ============================================================================
  // COMPONENT PROPS INTERFACES
  // ============================================================================
  
  export interface VehicleConditionSectionProps {
    odometerAtIncident: string
    setOdometerAtIncident: (value: string) => void
    vehicleDrivable: boolean
    setVehicleDrivable: (value: boolean) => void
    vehicleLocation: string
    setVehicleLocation: (value: string) => void
    errors: Record<string, string>
    disabled?: boolean
  }
  
  export interface IncidentConditionsSectionProps {
    weatherConditions: string
    setWeatherConditions: (value: string) => void
    weatherDescription: string
    setWeatherDescription: (value: string) => void
    roadConditions: string
    setRoadConditions: (value: string) => void
    roadDescription: string
    setRoadDescription: (value: string) => void
    estimatedSpeed: string
    setEstimatedSpeed: (value: string) => void
    trafficConditions: string
    setTrafficConditions: (value: string) => void
    errors: Record<string, string>
    disabled?: boolean
  }
  
  export interface PoliceReportSectionProps {
    wasPoliceContacted: boolean
    setWasPoliceContacted: (value: boolean) => void
    policeDepartment: string
    setPoliceDepartment: (value: string) => void
    officerName: string
    setOfficerName: (value: string) => void
    officerBadge: string
    setOfficerBadge: (value: string) => void
    policeReportNumber: string
    setPoliceReportNumber: (value: string) => void
    policeReportFiled: boolean
    setPoliceReportFiled: (value: boolean) => void
    policeReportDate: string
    setPoliceReportDate: (value: string) => void
    errors: Record<string, string>
    disabled?: boolean
  }
  
  export interface WitnessSectionProps {
    witnesses: Witness[]
    setWitnesses: (witnesses: Witness[]) => void
    disabled?: boolean
  }
  
  export interface OtherPartySectionProps {
    otherPartyInvolved: boolean
    setOtherPartyInvolved: (value: boolean) => void
    
    // Driver
    otherPartyDriverName: string
    setOtherPartyDriverName: (value: string) => void
    otherPartyDriverPhone: string
    setOtherPartyDriverPhone: (value: string) => void
    otherPartyDriverLicense: string
    setOtherPartyDriverLicense: (value: string) => void
    otherPartyDriverLicenseState: string
    setOtherPartyDriverLicenseState: (value: string) => void
    
    // Vehicle
    otherPartyVehicleYear: string
    setOtherPartyVehicleYear: (value: string) => void
    otherPartyVehicleMake: string
    setOtherPartyVehicleMake: (value: string) => void
    otherPartyVehicleModel: string
    setOtherPartyVehicleModel: (value: string) => void
    otherPartyVehiclePlate: string
    setOtherPartyVehiclePlate: (value: string) => void
    otherPartyVehicleVin: string
    setOtherPartyVehicleVin: (value: string) => void
    
    // Insurance
    otherPartyInsuranceCarrier: string
    setOtherPartyInsuranceCarrier: (value: string) => void
    otherPartyInsurancePolicy: string
    setOtherPartyInsurancePolicy: (value: string) => void
    
    usStates: string[]
    disabled?: boolean
  }
  
  export interface InjurySectionProps {
    wereInjuries: boolean
    setWereInjuries: (value: boolean) => void
    injuries: Injury[]
    setInjuries: (injuries: Injury[]) => void
    disabled?: boolean
  }
  
  // ============================================================================
  // DROPDOWN OPTIONS
  // ============================================================================
  
  export const WEATHER_OPTIONS = [
    'Clear',
    'Rain',
    'Fog',
    'Snow',
    'Ice',
    'Sleet',
    'Hail',
    'Wind',
    'Other'
  ] as const
  
  export const ROAD_OPTIONS = [
    'Dry',
    'Wet',
    'Icy',
    'Construction',
    'Debris',
    'Flooded',
    'Other'
  ] as const
  
  export const TRAFFIC_OPTIONS = [
    'Light',
    'Moderate',
    'Heavy',
    'Stopped'
  ] as const
  
  export const INJURY_SEVERITY_OPTIONS = [
    'Minor',
    'Moderate',
    'Severe',
    'Critical'
  ] as const
  
  export const US_STATES = [
    'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
    'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
    'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
    'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
    'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
  ] as const
  
  // ============================================================================
  // UTILITY TYPES
  // ============================================================================
  
  export type WeatherCondition = typeof WEATHER_OPTIONS[number]
  export type RoadCondition = typeof ROAD_OPTIONS[number]
  export type TrafficCondition = typeof TRAFFIC_OPTIONS[number]
  export type InjurySeverity = typeof INJURY_SEVERITY_OPTIONS[number]
  export type USState = typeof US_STATES[number]
  
  // ============================================================================
  // FNOL DATA SUBMISSION INTERFACE (for API)
  // ============================================================================
  
  export interface FNOLData {
    // Vehicle Condition
    odometerAtIncident: number
    vehicleDrivable: boolean
    vehicleLocation: string | null
    
    // Incident Conditions
    weatherConditions: string
    weatherDescription: string | null
    roadConditions: string
    roadDescription: string | null
    estimatedSpeed: number | null
    trafficConditions: string | null
    
    // Police Report
    wasPoliceContacted: boolean
    policeDepartment: string | null
    officerName: string | null
    officerBadge: string | null
    policeReportNumber: string | null
    policeReportFiled: boolean
    policeReportDate: string | null
    
    // Witnesses
    witnesses: Array<{
      name: string
      phone: string
      email: string | null
      statement: string | null
    }>
    
    // Other Party
    otherPartyInvolved: boolean
    otherParty: {
      driver: {
        name: string
        phone: string
        license: string | null
        licenseState: string | null
      }
      vehicle: {
        year: number | null
        make: string | null
        model: string | null
        plate: string | null
        vin: string | null
      }
      insurance: {
        carrier: string | null
        policy: string | null
      }
    } | null
    
    // Injuries
    wereInjuries: boolean
    injuries: Array<{
      person: string
      description: string
      severity: string
      medicalAttention: boolean
      hospital: string | null
    }>
  }