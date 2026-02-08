// app/host/cars/[id]/edit/page.tsx
'use client'

import { useState, useEffect, useMemo } from 'react'
import { useRouter, useParams } from 'next/navigation'
import Link from 'next/link'
import Image from 'next/image'
import Header from '@/app/components/Header'
import Footer from '@/app/components/Footer'
import ServiceHistoryList from '@/app/components/host/ServiceHistoryList'
import ServiceDueAlerts from '@/app/components/host/ServiceDueAlerts'
import AddServiceRecordModal from '@/app/components/host/AddServiceRecordModal'
import {
  getAllMakes,
  getModelsByMake,
  getTrimsByModel,
  getYears,
  getPopularMakes
} from '@/app/lib/data/vehicles'
import { decodeVIN, isValidVIN } from '@/app/lib/utils/vin-decoder'
import { getVehicleFeatures, mapBodyClassToCarType, groupFeaturesByCategory } from '@/app/lib/data/vehicle-features'
import VehicleBadge from '@/app/components/VehicleBadge'
import { getVehicleClass, formatFuelTypeBadge } from '@/app/lib/utils/vehicleClassification'
import { getVehicleSpecData } from '@/app/lib/utils/vehicleSpec'
import AddressAutocomplete from './components/AddressAutocomplete'
import HostAvailabilityCalendar from './components/HostAvailabilityCalendar'
import {
  IoArrowBackOutline,
  IoArrowForwardOutline,
  IoCarOutline,
  IoCarSportOutline,
  IoLocationOutline,
  IoCashOutline,
  IoImageOutline,
  IoCheckmarkCircleOutline,
  IoCheckmarkCircle,
  IoCloseCircleOutline,
  IoTrashOutline,
  IoAddOutline,
  IoStarOutline,
  IoStar,
  IoReorderThreeOutline,
  IoWarningOutline,
  IoSaveOutline,
  IoShieldOutline,
  IoLockClosedOutline,
  IoDocumentTextOutline,
  IoInformationCircleOutline,
  IoCalendarOutline,
  IoSparklesOutline,
  IoEnterOutline,
  IoCogOutline,
  IoPeopleOutline
} from 'react-icons/io5'

interface CarPhoto {
  id: string
  url: string
  isHero: boolean
  order: number
}

interface CarDetails {
  id: string
  make: string
  model: string
  year: number
  trim?: string
  color: string
  licensePlate?: string
  vin?: string
  
  // Specifications
  carType: string
  seats: number
  doors: number
  transmission: string
  fuelType: string
  driveType?: string  // AWD, FWD, RWD, 4WD
  mpgCity?: number
  mpgHighway?: number
  currentMileage?: number
  
  // Pricing
  dailyRate: number
  weeklyRate?: number
  monthlyRate?: number
  weeklyDiscount?: number
  monthlyDiscount?: number
  deliveryFee: number
  
  // Features
  features: string[]
  
  // Location
  address: string
  city: string
  state: string
  zipCode: string
  latitude?: number
  longitude?: number
  
  // Delivery options
  airportPickup: boolean
  hotelDelivery: boolean
  homeDelivery: boolean
  
  // Availability
  isActive: boolean
  instantBook: boolean
  advanceNotice: number
  minTripDuration: number
  maxTripDuration: number
  
  // Rules
  rules?: string[]
  
  // Insurance
  insuranceIncluded: boolean
  insuranceDaily: number
  
  // Photos
  photos: CarPhoto[]
  
  // Stats
  totalTrips: number
  rating: number
  
  // Description
  description?: string
  
  // Registration & Documentation Fields
  registeredOwner?: string
  registrationState?: string
  registrationExpiryDate?: string
  titleStatus?: string
  garageAddress?: string
  garageCity?: string
  garageState?: string
  garageZip?: string
  estimatedValue?: number
  hasLien?: boolean
  lienholderName?: string
  lienholderAddress?: string
  hasAlarm?: boolean
  hasTracking?: boolean
  hasImmobilizer?: boolean
  isModified?: boolean
  modifications?: string
  annualMileage?: number
  primaryUse?: string
  
  // Claim information
  hasActiveClaim?: boolean
  activeClaimCount?: number
  activeClaim?: {
    id: string
    type: string
    status: string
    createdAt: string
    bookingCode: string
  }

  // Host approval status (for locking availability until approved)
  hostApprovalStatus?: 'PENDING' | 'APPROVED' | 'REJECTED' | 'SUSPENDED'

  // Inspection status (for validation)
  hasStateInspection?: boolean
}

const carTypes = [
  { value: 'economy', label: 'Economy' },
  { value: 'compact', label: 'Compact' },
  { value: 'midsize', label: 'Midsize' },
  { value: 'fullsize', label: 'Full Size' },
  { value: 'suv', label: 'SUV' },
  { value: 'luxury', label: 'Luxury' },
  { value: 'convertible', label: 'Convertible' },
  { value: 'minivan', label: 'Minivan' },
  { value: 'truck', label: 'Truck' },
  { value: 'exotic', label: 'Exotic' }
]

const titleStatuses = [
  { value: 'Clean', label: 'Clean Title' },
  { value: 'Salvage', label: 'Salvage Title' },
  { value: 'Rebuilt', label: 'Rebuilt Title' },
  { value: 'Lemon', label: 'Lemon Law Buyback' },
  { value: 'Flood', label: 'Flood Damage' }
]

const usStates = [
  'AL', 'AK', 'AZ', 'AR', 'CA', 'CO', 'CT', 'DE', 'FL', 'GA',
  'HI', 'ID', 'IL', 'IN', 'IA', 'KS', 'KY', 'LA', 'ME', 'MD',
  'MA', 'MI', 'MN', 'MS', 'MO', 'MT', 'NE', 'NV', 'NH', 'NJ',
  'NM', 'NY', 'NC', 'ND', 'OH', 'OK', 'OR', 'PA', 'RI', 'SC',
  'SD', 'TN', 'TX', 'UT', 'VT', 'VA', 'WA', 'WV', 'WI', 'WY'
]

const features = [
  'Bluetooth',
  'Backup Camera',
  'Apple CarPlay',
  'Android Auto',
  'USB Charger',
  'Aux Input',
  'GPS Navigation',
  'Cruise Control',
  'Heated Seats',
  'Leather Seats',
  'Sunroof',
  'All-Wheel Drive',
  'Keyless Entry',
  'Remote Start',
  'Third Row Seating',
  'Bike Rack',
  'Roof Rack',
  'Tow Hitch',
  'Pet Friendly',
  'Child Seat'
]

const rules = [
  'No smoking',
  'No pets',
  'Return with same fuel level',
  'Clean return required',
  'No off-roading',
  'Valid license required',
  'Insurance required',
  'Age 21+ only',
  'Age 25+ only',
  'Local renters only',
  'Maximum 500 miles per day',
  'No commercial use'
]

// Color options for dropdown
const CAR_COLORS = [
  'Black', 'White', 'Silver', 'Gray', 'Red', 'Blue',
  'Navy Blue', 'Brown', 'Beige', 'Green', 'Gold',
  'Orange', 'Yellow', 'Purple', 'Burgundy', 'Champagne',
  'Pearl White', 'Midnight Blue', 'Other'
]

// Error field mapping for clickable navigation
// Maps error keys to their tab and field ID for scrolling
const ERROR_FIELD_MAP: Record<string, { tab: string; fieldId: string }> = {
  // Details tab
  vin: { tab: 'details', fieldId: 'field-vin' },
  licensePlate: { tab: 'details', fieldId: 'field-licensePlate' },
  make: { tab: 'details', fieldId: 'field-make' },
  model: { tab: 'details', fieldId: 'field-model' },
  year: { tab: 'details', fieldId: 'field-year' },
  color: { tab: 'details', fieldId: 'field-color' },
  description: { tab: 'details', fieldId: 'field-description' },
  address: { tab: 'details', fieldId: 'field-address' },
  zipCode: { tab: 'details', fieldId: 'field-zipCode' },
  // Registration tab
  registrationState: { tab: 'registration', fieldId: 'field-registrationState' },
  registrationExpiryDate: { tab: 'registration', fieldId: 'field-registrationExpiryDate' },
  registeredOwner: { tab: 'registration', fieldId: 'field-registeredOwner' },
  titleStatus: { tab: 'registration', fieldId: 'field-titleStatus' },
  estimatedValue: { tab: 'registration', fieldId: 'field-estimatedValue' },
  garageAddress: { tab: 'registration', fieldId: 'field-garageAddress' },
  garageCity: { tab: 'registration', fieldId: 'field-garageCity' },
  garageState: { tab: 'registration', fieldId: 'field-garageState' },
  garageZip: { tab: 'registration', fieldId: 'field-garageZip' },
  lienholderName: { tab: 'registration', fieldId: 'field-lienholderName' },
  currentMileage: { tab: 'registration', fieldId: 'field-currentMileage' },
  primaryUse: { tab: 'registration', fieldId: 'field-primaryUse' },
  // Pricing tab
  dailyRate: { tab: 'pricing', fieldId: 'field-dailyRate' },
  // Photos tab
  photos: { tab: 'photos', fieldId: 'field-photos' },
  // Service/Maintenance tab
  inspection: { tab: 'service', fieldId: 'field-inspection' }
}

export default function EditCarPage() {
  const router = useRouter()
  const params = useParams()
  const carId = params.id as string
  
  const [car, setCar] = useState<CarDetails | null>(null)
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingPhoto, setUploadingPhoto] = useState(false)
  const [activeTab, setActiveTab] = useState('details')
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [successMessage, setSuccessMessage] = useState('')
  const [showAddServiceModal, setShowAddServiceModal] = useState(false)

  // Dropdown state for vehicle selection
  const [availableModels, setAvailableModels] = useState<string[]>([])
  const [availableTrims, setAvailableTrims] = useState<string[]>([])
  const years = getYears()

  // VIN decoder state
  const [vinDecoding, setVinDecoding] = useState(false)
  const [vinError, setVinError] = useState('')
  const [vinDecoded, setVinDecoded] = useState(false)

  // Validation errors state
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({})

  // Navigate to a specific error field
  const navigateToField = (errorKey: string) => {
    const fieldInfo = ERROR_FIELD_MAP[errorKey]
    if (!fieldInfo) return

    // Switch to the correct tab
    setActiveTab(fieldInfo.tab)

    // Wait for tab to render, then scroll to field
    setTimeout(() => {
      const element = document.getElementById(fieldInfo.fieldId)
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }, 100)
  }

  // Form state
  const [formData, setFormData] = useState({
    // Basic details
    make: '',
    model: '',
    year: new Date().getFullYear(),
    trim: '',
    color: '',
    licensePlate: '',
    vin: '',
    
    // Specifications
    carType: 'midsize',
    seats: 5,
    doors: 4,
    transmission: 'automatic',
    fuelType: 'gas',
    driveType: '',
    mpgCity: 0,
    mpgHighway: 0,
    currentMileage: 0,
    
    // Pricing
    dailyRate: 0,
    weeklyRate: 0,
    monthlyRate: 0,
    weeklyDiscount: 15,
    monthlyDiscount: 30,
    deliveryFee: 35,
    
    // Features
    features: [] as string[],
    
    // Location
    address: '',
    city: 'Phoenix',
    state: 'AZ',
    zipCode: '',
    latitude: 0,
    longitude: 0,

    // Delivery
    airportPickup: false,
    hotelDelivery: true,
    homeDelivery: false,
    
    // Availability
    isActive: true,
    instantBook: true,
    advanceNotice: 2,
    minTripDuration: 1,
    maxTripDuration: 30,
    
    // Rules
    rules: [] as string[],
    
    // Insurance
    insuranceIncluded: false,
    insuranceDaily: 25,
    
    // Description
    description: '',
    
    // Registration & Documentation Fields
    registeredOwner: '',
    registrationState: 'AZ',
    registrationExpiryDate: '',
    titleStatus: 'Clean',
    garageAddress: '',
    garageCity: '',
    garageState: 'AZ',
    garageZip: '',
    estimatedValue: 0,
    hasLien: false,
    lienholderName: '',
    lienholderAddress: '',
    hasAlarm: false,
    hasTracking: false,
    hasImmobilizer: false,
    isModified: false,
    modifications: '',
    annualMileage: 12000,
    primaryUse: 'Rental'
  })
  
  const [photos, setPhotos] = useState<CarPhoto[]>([])

  useEffect(() => {
    fetchCarDetails()
  }, [carId])

  // Initialize dropdowns when car data is loaded
  useEffect(() => {
    if (car) {
      // Initialize available models based on existing make
      if (car.make) {
        setAvailableModels(getModelsByMake(car.make))
      }
      // Initialize available trims
      if (car.make && car.model && car.year) {
        setAvailableTrims(getTrimsByModel(car.make, car.model, String(car.year)))
      }
    }
  }, [car])

  // Cascading dropdown handlers
  const handleMakeChange = (make: string) => {
    setFormData(prev => ({ ...prev, make, model: '', trim: '' }))
    setAvailableModels(make ? getModelsByMake(make) : [])
    setAvailableTrims([])
    // Clear any make/model validation errors
    setValidationErrors(prev => {
      const { make: _, model: __, ...rest } = prev
      return rest
    })
  }

  const handleModelChange = (model: string) => {
    setFormData(prev => ({ ...prev, model, trim: '' }))
    if (formData.make && formData.year) {
      setAvailableTrims(getTrimsByModel(formData.make, model, String(formData.year)))
    }
    // Clear model validation error
    setValidationErrors(prev => {
      const { model: _, ...rest } = prev
      return rest
    })
  }

  const handleYearChange = (year: number) => {
    setFormData(prev => ({ ...prev, year }))
    if (formData.make && formData.model) {
      setAvailableTrims(getTrimsByModel(formData.make, formData.model, String(year)))
    }
    // Clear year validation error
    setValidationErrors(prev => {
      const { year: _, ...rest } = prev
      return rest
    })
  }

  // Track which fields were populated by VIN decode
  const [vinDecodedFields, setVinDecodedFields] = useState<string[]>([])

  // Compute effective vehicle specs from database lookup (make/model/year)
  // PRIORITY: Vehicle database lookup > VIN-decoded values
  // Reason: VIN decoder counts hatch as door (5 doors), we want passenger doors (4)
  // Our vehicle database has customer-friendly specs that match what Carvana shows
  const effectiveSpecs = useMemo(() => {
    if (!formData.make || !formData.model || !formData.year) {
      return { seats: null, doors: null, carType: null, fuelType: null, transmission: null }
    }

    const lookupSpecs = getVehicleSpecData(formData.make, formData.model, String(formData.year))

    return {
      // ALWAYS prefer vehicle database lookup if available
      // Falls back to formData (database) only if lookup returns null
      seats: lookupSpecs.seats ?? formData.seats,
      doors: lookupSpecs.doors ?? formData.doors,
      carType: lookupSpecs.carType ?? formData.carType,
      fuelType: lookupSpecs.fuelType ?? formData.fuelType,
      transmission: formData.transmission,
      driveType: formData.driveType
    }
  }, [formData.make, formData.model, formData.year, formData.seats, formData.doors, formData.carType, formData.fuelType, formData.transmission, formData.driveType])

  // Helper function to convert text to Title Case
  const toTitleCase = (str: string): string => {
    return str
      .toLowerCase()
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1))
      .join(' ')
  }

  // Helper function to find best matching make from our database (NHTSA returns UPPERCASE)
  const findMatchingMake = (decodedMake: string): string => {
    const allMakes = getAllMakes()
    const normalizedDecoded = decodedMake.toUpperCase()
    const exactMatch = allMakes.find(make => make.toUpperCase() === normalizedDecoded)
    if (exactMatch) return exactMatch
    return toTitleCase(decodedMake)
  }

  // Helper function to find best matching model from our database
  const findMatchingModel = (make: string, decodedModel: string): string => {
    const models = getModelsByMake(make)
    const normalizedDecoded = decodedModel.toUpperCase()
    const exactMatch = models.find(model => model.toUpperCase() === normalizedDecoded)
    if (exactMatch) return exactMatch
    return toTitleCase(decodedModel)
  }

  // VIN decoder handler
  const handleVinDecode = async () => {
    const vin = formData.vin?.trim()
    if (!vin || vin.length !== 17) {
      setVinError('VIN must be 17 characters')
      return
    }

    if (!isValidVIN(vin)) {
      setVinError('Invalid VIN format (no I, O, or Q)')
      return
    }

    setVinDecoding(true)
    setVinError('')

    try {
      const result = await decodeVIN(vin)

      if (result && result.make) {
        // Normalize make/model to match our dropdown values (NHTSA returns UPPERCASE)
        const normalizedMake = findMatchingMake(result.make)
        const normalizedModel = result.model ? findMatchingModel(normalizedMake, result.model) : ''
        const normalizedTrim = result.trim ? toTitleCase(result.trim) : ''

        // Update dropdowns with normalized make
        const models = getModelsByMake(normalizedMake)
        setAvailableModels(models)

        // Track which fields were decoded
        const decodedFields: string[] = ['make', 'model', 'year']

        // Build updated form data with all available VIN-decoded fields
        const updates: Partial<typeof formData> = {
          make: normalizedMake,
          model: normalizedModel || formData.model,
          year: parseInt(result.year) || formData.year,
        }

        // Add trim if available
        if (result.trim) {
          updates.trim = normalizedTrim
          decodedFields.push('trim')
        }

        // Add doors if available
        if (result.doors) {
          updates.doors = parseInt(result.doors) || formData.doors
          decodedFields.push('doors')
        }

        // Add transmission if available
        if (result.transmission) {
          updates.transmission = result.transmission.toLowerCase().includes('automatic') ? 'automatic' : 'manual'
          decodedFields.push('transmission')
        }

        // Add fuel type if available
        if (result.fuelType) {
          const fuelLower = result.fuelType.toLowerCase()
          if (fuelLower.includes('electric')) updates.fuelType = 'electric'
          else if (fuelLower.includes('hybrid')) updates.fuelType = 'hybrid'
          else if (fuelLower.includes('diesel')) updates.fuelType = 'diesel'
          else updates.fuelType = 'gas'
          decodedFields.push('fuelType')
        }

        // Map body class to car type
        if (result.bodyClass) {
          const mappedType = mapBodyClassToCarType(result.bodyClass, normalizedMake, normalizedModel)
          if (mappedType) {
            updates.carType = mappedType.toLowerCase()
            decodedFields.push('carType')
          }
        }

        // Add drive type if available (AWD, FWD, RWD, 4WD)
        if (result.driveType) {
          const driveLower = result.driveType.toLowerCase()
          if (driveLower.includes('all') || driveLower.includes('awd')) updates.driveType = 'AWD'
          else if (driveLower.includes('front') || driveLower.includes('fwd')) updates.driveType = 'FWD'
          else if (driveLower.includes('rear') || driveLower.includes('rwd')) updates.driveType = 'RWD'
          else if (driveLower.includes('4x4') || driveLower.includes('4wd') || driveLower.includes('four')) updates.driveType = '4WD'
          else updates.driveType = result.driveType.toUpperCase()
          decodedFields.push('driveType')
        }

        // Update form data
        setFormData(prev => ({
          ...prev,
          ...updates
        }))

        // Update trims if all fields available
        if (normalizedMake && normalizedModel && result.year) {
          setAvailableTrims(getTrimsByModel(normalizedMake, normalizedModel, result.year))
        }

        setVinDecodedFields(decodedFields)
        setVinDecoded(true)
      } else {
        setVinError('Could not decode VIN')
      }
    } catch (error) {
      setVinError('VIN decode failed')
    } finally {
      setVinDecoding(false)
    }
  }

  const fetchCarDetails = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/host/cars/${carId}`, {
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })
      
      if (response.ok) {
        const data = await response.json()
        const carData = data.car
        setCar(carData)
        setPhotos(carData.photos || [])
        
        // Populate form with existing data
      setFormData({
        make: carData.make,
        model: carData.model,
        year: carData.year,
        trim: carData.trim || '',
        color: carData.color,
        licensePlate: carData.licensePlate || '',
        vin: carData.vin || '',
        carType: carData.carType,
        seats: carData.seats,
        doors: carData.doors,
        transmission: carData.transmission,
        fuelType: carData.fuelType,
        driveType: carData.driveType || '',
        mpgCity: carData.mpgCity || 0,
        mpgHighway: carData.mpgHighway || 0,
        currentMileage: carData.currentMileage || 0,
        dailyRate: carData.dailyRate,
        weeklyRate: carData.weeklyRate || carData.dailyRate * 6.5,
        monthlyRate: carData.monthlyRate || carData.dailyRate * 25,
        weeklyDiscount: carData.weeklyDiscount || 15,
        monthlyDiscount: carData.monthlyDiscount || 30,
        deliveryFee: carData.deliveryFee || 35,
        features: carData.features || [],
        address: carData.address,
        city: carData.city,
        state: carData.state,
        zipCode: carData.zipCode,
        latitude: carData.latitude || 0,
        longitude: carData.longitude || 0,
        airportPickup: carData.airportPickup,
        hotelDelivery: carData.hotelDelivery,
        homeDelivery: carData.homeDelivery,
        isActive: carData.isActive,
        instantBook: carData.instantBook,
        advanceNotice: carData.advanceNotice,
        minTripDuration: carData.minTripDuration,
        maxTripDuration: carData.maxTripDuration,
        rules: carData.rules || [],
        insuranceIncluded: carData.insuranceIncluded,
        insuranceDaily: carData.insuranceDaily,
        // Description
        description: carData.description || '',
        // ✅ FIXED: Registration fields with proper date formatting
        registeredOwner: carData.registeredOwner || '',
        registrationState: carData.registrationState || 'AZ',
        registrationExpiryDate: carData.registrationExpiryDate 
          ? new Date(carData.registrationExpiryDate).toISOString().split('T')[0]
          : '',
        titleStatus: carData.titleStatus || 'Clean',
        garageAddress: carData.garageAddress || '',
        garageCity: carData.garageCity || '',
        garageState: carData.garageState || 'AZ',
        garageZip: carData.garageZip || '',
        estimatedValue: carData.estimatedValue || 0,
        hasLien: carData.hasLien || false,
        lienholderName: carData.lienholderName || '',
        lienholderAddress: carData.lienholderAddress || '',
        hasAlarm: carData.hasAlarm || false,
        hasTracking: carData.hasTracking || false,
        hasImmobilizer: carData.hasImmobilizer || false,
        isModified: carData.isModified || false,
        modifications: carData.modifications || '',
        annualMileage: carData.annualMileage || 12000,
        primaryUse: carData.primaryUse || 'Rental'
      })

        // If car already has a valid VIN, assume core fields were VIN-decoded
        // and should be locked (VIN as source of truth)
        if (carData.vin && carData.vin.length === 17) {
          setVinDecodedFields(['make', 'model', 'year', 'trim', 'doors', 'transmission', 'fuelType', 'carType'])
          setVinDecoded(true)
        }
      } else if (response.status === 404) {
        router.push('/host/cars')
      } else if (response.status === 403) {
        const errorData = await response.json()
        if (errorData.reason === 'ACTIVE_CLAIM') {
          setErrors({ 
            claim: `Cannot edit vehicle - ${errorData.claimCount} active claim${errorData.claimCount > 1 ? 's' : ''}`
          })
        }
      }
    } catch (error) {
      console.error('Failed to fetch car details:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSave = async () => {
    if (car?.hasActiveClaim) {
      alert('Cannot save changes while vehicle has an active claim. Please wait for claim resolution.')
      return
    }

    // Comprehensive validation - ALL fields with (*) must be filled
    const errors: Record<string, string> = {}

    // === VEHICLE DETAILS TAB ===
    // VIN is required
    if (!formData.vin?.trim()) {
      errors.vin = 'VIN is required'
    } else if (formData.vin.length !== 17) {
      errors.vin = 'VIN must be exactly 17 characters'
    }

    // License plate is required
    if (!formData.licensePlate?.trim()) errors.licensePlate = 'License plate is required'

    // Basic vehicle info
    if (!formData.make) errors.make = 'Make is required'
    if (!formData.model) errors.model = 'Model is required'
    if (!formData.year) errors.year = 'Year is required'
    if (!formData.color) errors.color = 'Color is required'

    // Vehicle description minimum 50 characters
    if (!formData.description || formData.description.length < 50) {
      errors.description = 'Description must be at least 50 characters'
    }

    // Location
    if (!formData.address?.trim()) errors.address = 'Street address is required'
    if (!formData.zipCode?.trim()) errors.zipCode = 'ZIP code is required'

    // === DOCUMENTATION TAB ===
    // Registration info
    if (!formData.registrationState?.trim()) errors.registrationState = 'State of registration is required'
    if (!formData.registrationExpiryDate?.trim()) errors.registrationExpiryDate = 'Registration expiration date is required'
    if (!formData.registeredOwner?.trim()) errors.registeredOwner = 'Registered owner name is required'
    if (!formData.titleStatus?.trim()) errors.titleStatus = 'Title status is required'
    if (!formData.estimatedValue || formData.estimatedValue <= 0) errors.estimatedValue = 'Estimated vehicle value is required'

    // Garage address (required)
    if (!formData.garageAddress?.trim()) errors.garageAddress = 'Garage address is required'
    if (!formData.garageCity?.trim()) errors.garageCity = 'Garage city is required'
    if (!formData.garageState?.trim()) errors.garageState = 'Garage state is required'
    if (!formData.garageZip?.trim()) errors.garageZip = 'Garage ZIP is required'

    // Lienholder info (only if hasLien is true)
    if (formData.hasLien && !formData.lienholderName?.trim()) {
      errors.lienholderName = 'Lienholder name is required when vehicle has a lien'
    }

    // Current odometer reading (required)
    if (!formData.currentMileage || formData.currentMileage <= 0) {
      errors.currentMileage = 'Current odometer reading is required'
    }

    // Primary use/declaration (required)
    if (!formData.primaryUse?.trim()) {
      errors.primaryUse = 'Primary use declaration is required'
    }

    // === PRICING TAB ===
    if (!formData.dailyRate || formData.dailyRate <= 0) errors.dailyRate = 'Daily rate is required'

    // === PHOTOS TAB ===
    // Minimum 3 photos required
    if (photos.length < 3) {
      errors.photos = 'At least 3 photos are required for your listing'
    }

    // === SERVICE/MAINTENANCE TAB ===
    // First inspection is required
    if (!car?.hasStateInspection) {
      errors.inspection = 'No inspection record found - first inspection required'
    }

    if (Object.keys(errors).length > 0) {
      setValidationErrors(errors)
      // Scroll to top to show error summary
      window.scrollTo({ top: 0, behavior: 'smooth' })
      return
    }

    setValidationErrors({})
    setSaving(true)
    setErrors({})
    
    try {
      const response = await fetch(`/api/host/cars/${carId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'x-host-id': localStorage.getItem('hostId') || ''
        },
        body: JSON.stringify(formData)
      })
      
      if (response.ok) {
        setSuccessMessage('Car details updated successfully!')
        setTimeout(() => setSuccessMessage(''), 3000)
        await fetchCarDetails()
      } else {
        const data = await response.json()
        if (data.reason === 'ACTIVE_CLAIM') {
          setErrors({ general: `Cannot edit vehicle - ${data.claimCount} active claim${data.claimCount > 1 ? 's' : ''}` })
        } else {
          setErrors({ general: data.error || 'Failed to update car' })
        }
      }
    } catch (error) {
      console.error('Failed to save car:', error)
      setErrors({ general: 'An error occurred while saving' })
    } finally {
      setSaving(false)
    }
  }

  // ✅ FIXED: Photo upload with type field and multiple file support
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return
    
    setUploadingPhoto(true)
    
    try {
      const uploadFormData = new FormData()
      
      // ✅ Support multiple files
      for (let i = 0; i < files.length; i++) {
        uploadFormData.append('file', files[i])
      }
      
      uploadFormData.append('carId', carId)
      uploadFormData.append('type', 'carPhoto')  // ✅ THIS WAS MISSING!
      
      const response = await fetch('/api/host/upload', {
        method: 'POST',
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        },
        body: uploadFormData
      })
      
      if (response.ok) {
        const data = await response.json()
        
        // Handle multiple photos response
        if (data.photos && Array.isArray(data.photos)) {
          const newPhotos: CarPhoto[] = data.photos.map((p: any) => ({
            id: p.id,
            url: p.url,
            isHero: p.isHero,
            order: p.order
          }))
          setPhotos([...photos, ...newPhotos])
        } else if (data.photo) {
          // Single photo backward compatibility
          const newPhoto: CarPhoto = {
            id: data.photo.id,
            url: data.photo.url,
            isHero: photos.length === 0,
            order: photos.length
          }
          setPhotos([...photos, newPhoto])
        }
      } else {
        const errorData = await response.json()
        console.error('Upload failed:', errorData.error)
        alert(errorData.error || 'Failed to upload photo')
      }
    } catch (error) {
      console.error('Failed to upload photo:', error)
      alert('Failed to upload photo. Please try again.')
    } finally {
      setUploadingPhoto(false)
      // Reset the input so the same file can be uploaded again if needed
      e.target.value = ''
    }
  }

  const handleSetHeroPhoto = async (photoId: string) => {
    try {
      const response = await fetch(`/api/host/cars/${carId}/photos/${photoId}/hero`, {
        method: 'POST',
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })
      
      if (response.ok) {
        setPhotos(photos.map(p => ({
          ...p,
          isHero: p.id === photoId
        })))
      }
    } catch (error) {
      console.error('Failed to set hero photo:', error)
    }
  }

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Delete this photo?')) return
    
    try {
      const response = await fetch(`/api/host/cars/${carId}/photos/${photoId}`, {
        method: 'DELETE',
        headers: {
          'x-host-id': localStorage.getItem('hostId') || ''
        }
      })
      
      if (response.ok) {
        setPhotos(photos.filter(p => p.id !== photoId))
      }
    } catch (error) {
      console.error('Failed to delete photo:', error)
    }
  }

  const toggleFeature = (feature: string) => {
    if (car?.hasActiveClaim) return
    const currentFeatures = formData.features || []
    setFormData({
      ...formData,
      features: currentFeatures.includes(feature)
        ? currentFeatures.filter(f => f !== feature)
        : [...currentFeatures, feature]
    })
  }

  const toggleRule = (rule: string) => {
    if (car?.hasActiveClaim) return
    const currentRules = formData.rules || []
    setFormData({
      ...formData,
      rules: currentRules.includes(rule)
        ? currentRules.filter(r => r !== rule)
        : [...currentRules, rule]
    })
  }

  if (loading) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-purple-600 mx-auto mb-4"></div>
              <p className="text-gray-600 dark:text-gray-400">Loading car details...</p>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  if (!car) {
    return (
      <>
        <Header />
        <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-24">
          <div className="p-6 flex items-center justify-center min-h-[400px]">
            <div className="text-center">
              <IoWarningOutline className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-lg font-semibold">Car not found</p>
              <Link href="/host/cars" className="text-purple-600 hover:underline mt-2 inline-block">
                Back to My Cars
              </Link>
            </div>
          </div>
        </div>
        <Footer />
      </>
    )
  }

  const isLocked = car.hasActiveClaim || false
  const isApproved = (car as any).status === 'APPROVED' || (car as any).isApproved === true

  // Lock availability options if host is not approved yet (PENDING, REJECTED, SUSPENDED)
  const isHostNotApproved = car.hostApprovalStatus && car.hostApprovalStatus !== 'APPROVED'
  const isAvailabilityLocked = isLocked || isHostNotApproved

  // Fields that should be locked after approval
  const isFieldLocked = (fieldName: string) => {
    const lockedAfterApproval = ['make', 'model', 'year', 'color', 'vin', 'licensePlate', 'registrationState']

    // Lock if: active claim OR approved field OR VIN-decoded field
    // Note: VIN itself is NOT locked after decode (only after approval) so host can re-enter if mistake
    return isLocked ||
           (isApproved && lockedAfterApproval.includes(fieldName)) ||
           (vinDecodedFields.includes(fieldName) && fieldName !== 'vin')
  }

  // Check if a field was VIN-decoded (for showing badge)
  const isVinVerified = (fieldName: string) => {
    return vinDecodedFields.includes(fieldName)
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 pt-20">
        <div className="p-4 sm:p-6 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            {/* Top row: Back button + Save button */}
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/host/cars"
                className="inline-flex items-center gap-2 text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200"
              >
                <IoArrowBackOutline className="w-5 h-5" />
                Back to My Cars
              </Link>

              <button
                onClick={handleSave}
                disabled={saving || isLocked}
                className={`px-6 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                  isLocked
                    ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                    : 'bg-purple-600 text-white hover:bg-purple-700'
                } ${saving ? 'opacity-50' : ''}`}
              >
                {isLocked ? (
                  <>
                    <IoLockClosedOutline className="w-5 h-5" />
                    Locked
                  </>
                ) : (
                  <>
                    <IoSaveOutline className="w-5 h-5" />
                    {saving ? 'Saving...' : 'Save Changes'}
                  </>
                )}
              </button>
            </div>

            {/* Car info (left) + Hero image (right) */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              {/* Left: Car details */}
              <div className="flex-1 text-center sm:text-left order-2 sm:order-1">
                {/* Year + Make */}
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-1">
                  {isLocked && <IoLockClosedOutline className="w-6 h-6 text-red-500" />}
                  <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
                    {formData.year} {formData.make}
                  </h1>
                </div>

                {/* Model + Trim + Drivetrain */}
                <p className="text-lg text-gray-600 dark:text-gray-400 mb-2">
                  {formData.model}{formData.trim ? ` ${formData.trim}` : ''}{effectiveSpecs.driveType ? ` ${effectiveSpecs.driveType.toUpperCase()}` : ''}
                </p>

                {/* Badges Row - using effectiveSpecs for accurate data */}
                <div className="flex items-center justify-center sm:justify-start gap-2 flex-wrap mb-2">
                  {getVehicleClass(formData.make, formData.model, effectiveSpecs.carType as any) && (
                    <VehicleBadge label={getVehicleClass(formData.make, formData.model, effectiveSpecs.carType as any)!} />
                  )}
                  {formatFuelTypeBadge(effectiveSpecs.fuelType) && (
                    <VehicleBadge label={formatFuelTypeBadge(effectiveSpecs.fuelType)!} />
                  )}
                  {effectiveSpecs.carType && (
                    <VehicleBadge label={String(effectiveSpecs.carType).charAt(0).toUpperCase() + String(effectiveSpecs.carType).slice(1)} />
                  )}
                </div>

                {/* Specs Row: Doors • Transmission • DriveType • Seats - using effectiveSpecs */}
                <div className="flex items-center justify-center sm:justify-start gap-3 text-sm text-gray-600 dark:text-gray-400 mb-2 flex-wrap">
                  {effectiveSpecs.doors && (
                    <span className="flex items-center gap-1">
                      <IoEnterOutline className="w-4 h-4" />
                      {effectiveSpecs.doors} Doors
                    </span>
                  )}
                  {effectiveSpecs.doors && effectiveSpecs.transmission && (
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                  )}
                  {effectiveSpecs.transmission && (
                    <span className="flex items-center gap-1 capitalize">
                      <IoCogOutline className="w-4 h-4" />
                      {effectiveSpecs.transmission}
                    </span>
                  )}
                  {effectiveSpecs.transmission && effectiveSpecs.driveType && (
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                  )}
                  {effectiveSpecs.driveType && (
                    <span className="uppercase">{effectiveSpecs.driveType}</span>
                  )}
                  {(effectiveSpecs.driveType || effectiveSpecs.transmission) && effectiveSpecs.seats && (
                    <span className="text-gray-300 dark:text-gray-600">•</span>
                  )}
                  {effectiveSpecs.seats && (
                    <span className="flex items-center gap-1">
                      <IoPeopleOutline className="w-4 h-4" />
                      {effectiveSpecs.seats} Seats
                    </span>
                  )}
                </div>

                {/* Trip stats */}
                <div className="flex items-center justify-center sm:justify-start gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>{car.totalTrips} trips completed</span>
                  <span className="flex items-center gap-1">
                    <IoStar className="w-4 h-4 text-yellow-500" />
                    {car.rating.toFixed(1)} rating
                  </span>
                </div>
              </div>

              {/* Right: Hero image */}
              {photos.length > 0 && (
                <div className="w-full sm:w-48 md:w-56 lg:w-64 flex-shrink-0 order-1 sm:order-2">
                  <div className="relative aspect-[4/3] rounded-lg overflow-hidden bg-gray-200 dark:bg-gray-700 shadow-md">
                    <Image
                      src={photos.find(p => p.isHero)?.url || photos[0]?.url}
                      alt={`${formData.year} ${formData.make} ${formData.model}`}
                      fill
                      className="object-cover"
                    />
                    {/* Declaration Badge - Top Right Corner */}
                    {formData.primaryUse && (
                      <div className={`absolute top-2 right-2 px-2 py-1 rounded text-xs font-semibold shadow-md ${
                        formData.primaryUse === 'Rental'
                          ? 'bg-green-500 text-white'
                          : formData.primaryUse === 'Personal'
                          ? 'bg-blue-500 text-white'
                          : 'bg-purple-500 text-white'
                      }`}>
                        {formData.primaryUse === 'Rental' ? 'Rental Only' :
                         formData.primaryUse === 'Personal' ? 'Personal & Rental' :
                         formData.primaryUse === 'Business' ? 'Business Use' : formData.primaryUse}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Claim Warning Banner */}
          {isLocked && car.activeClaim && (
            <div className="mb-6 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-sm p-4 sm:p-6">
              <div className="flex items-start gap-3">
                <IoShieldOutline className="w-6 h-6 text-red-600 dark:text-red-400 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-red-800 dark:text-red-300 mb-2">
                    Vehicle Editing Locked - Active Claim
                  </h3>
                  <p className="text-sm text-red-700 dark:text-red-400 mb-3">
                    This vehicle cannot be edited while a claim is active. All form fields are read-only until the claim is resolved.
                  </p>
                  <div className="bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 p-3 mb-3">
                    <div className="grid sm:grid-cols-2 gap-2 text-sm">
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Claim Status:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {car.activeClaim.status.replace('_', ' ')}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-600 dark:text-gray-400">Booking:</span>
                        <span className="ml-2 font-medium text-gray-900 dark:text-white">
                          {car.activeClaim.bookingCode}
                        </span>
                      </div>
                      {(car.activeClaimCount ?? 0) > 1 && (
                        <div className="sm:col-span-2">
                          <span className="text-gray-600 dark:text-gray-400">Total Active Claims:</span>
                          <span className="ml-2 font-medium text-gray-900 dark:text-white">
                            {car.activeClaimCount}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="flex flex-wrap gap-3">
                    <Link
                      href={`/host/claims/${car.activeClaim.id}`}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg text-sm font-medium transition-colors"
                    >
                      View Claim Details →
                    </Link>
                    <button
                      onClick={() => router.push('/host/claims')}
                      className="inline-flex items-center gap-2 px-4 py-2 bg-white dark:bg-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 border border-gray-300 dark:border-gray-600 rounded-lg text-sm font-medium transition-colors"
                    >
                      View All Claims
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Success/Error Messages */}
          {successMessage && (
            <div className="mb-4 p-4 bg-green-100 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg shadow-sm">
              <p className="text-green-700 dark:text-green-300 flex items-center gap-2">
                <IoCheckmarkCircleOutline className="w-5 h-5" />
                {successMessage}
              </p>
            </div>
          )}
          
          {errors.general && (
            <div className="mb-4 p-4 bg-red-100 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg shadow-sm">
              <p className="text-red-700 dark:text-red-300">{errors.general}</p>
            </div>
          )}

          {/* Validation Errors Summary */}
          {Object.keys(validationErrors).length > 0 && (
            <div className="mb-4 p-4 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
              <div className="flex items-center gap-2 text-red-700 dark:text-red-400 mb-2">
                <IoCloseCircleOutline className="w-5 h-5" />
                <span className="font-medium">Please fix the following errors before saving:</span>
              </div>
              <div className="space-y-2">
                {Object.entries(validationErrors).map(([field, error]) => (
                  <button
                    key={field}
                    onClick={() => navigateToField(field)}
                    className="w-full flex items-center justify-between gap-2 px-3 py-2 text-sm text-left text-red-700 dark:text-red-300 bg-white dark:bg-gray-800 rounded-lg border border-red-200 dark:border-red-700 hover:bg-red-100 dark:hover:bg-red-900/30 transition-colors group"
                  >
                    <span>{error}</span>
                    <IoArrowForwardOutline className="w-4 h-4 flex-shrink-0 opacity-50 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Approved Vehicle Warning */}
          {isApproved && !isLocked && (
            <div className="mb-4 p-4 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800 rounded-lg">
              <div className="flex items-center gap-2 text-amber-700 dark:text-amber-400 text-sm">
                <IoLockClosedOutline className="w-4 h-4" />
                <span>Some fields (Make, Model, Year, Color, VIN, License Plate, Registration State) are locked because this vehicle has been approved.</span>
              </div>
            </div>
          )}

          {/* Tabs */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 mb-6 overflow-hidden">
            <div className="flex items-center overflow-x-auto">
              {['details', 'registration', 'pricing', 'photos', 'features', 'availability', 'service'].map((tab, index, arr) => (
                <div key={tab} className="flex items-center">
                  <button
                    onClick={() => setActiveTab(tab)}
                    className={`px-4 py-3 text-sm font-medium capitalize transition-colors whitespace-nowrap ${
                      activeTab === tab
                        ? 'bg-purple-50 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 border-b-2 border-purple-600'
                        : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
                    }`}
                  >
                    {tab === 'registration' ? 'Registration' : tab === 'service' ? 'Service & Maintenance' : tab}
                  </button>
                  {index < arr.length - 1 && (
                    <span className="text-gray-300 dark:text-gray-600 px-1">|</span>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Tab Content */}
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 p-4 sm:p-6">
            {activeTab === 'details' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Vehicle Details</h3>

                {/* VIN and License Plate - Vehicle Identification */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pb-4 border-b border-gray-200 dark:border-gray-700">
                  <div id="field-vin">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      VIN (Vehicle Identification Number) <span className="text-red-500">*</span>
                      {isFieldLocked('vin') && (
                        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                          <IoLockClosedOutline className="inline w-3 h-3 mr-0.5" />
                          Locked
                        </span>
                      )}
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        value={formData.vin}
                        onChange={(e) => {
                          setFormData({ ...formData, vin: e.target.value.toUpperCase() })
                          setVinDecoded(false)
                          setVinError('')
                        }}
                        disabled={isFieldLocked('vin')}
                        maxLength={17}
                        className={`w-full px-3 py-2 pr-28 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white font-mono uppercase ${
                          validationErrors.vin || vinError ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } ${isFieldLocked('vin') ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`}
                        placeholder="17-character VIN"
                      />
                      {!isFieldLocked('vin') && formData.vin?.length === 17 && (
                        <button
                          type="button"
                          onClick={handleVinDecode}
                          disabled={vinDecoding}
                          className={`absolute right-2 top-1/2 -translate-y-1/2 px-3 py-1 text-white text-xs rounded font-medium transition-colors ${
                            vinDecoded
                              ? 'bg-emerald-500'
                              : vinDecoding
                                ? 'bg-purple-400'
                                : 'bg-purple-600 hover:bg-purple-700'
                          }`}
                        >
                          {vinDecoding ? 'Decoding...' : vinDecoded ? 'Decoded!' : 'Decode VIN'}
                        </button>
                      )}
                    </div>
                    {vinError && <p className="text-xs text-red-500 mt-1">{vinError}</p>}
                    {validationErrors.vin && <p className="text-xs text-red-500 mt-1">{validationErrors.vin}</p>}
                    <p className="text-xs text-gray-500 mt-1">Enter VIN and click "Decode" to auto-fill vehicle details</p>
                  </div>

                  <div id="field-licensePlate">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      License Plate Number <span className="text-red-500">*</span>
                      {isFieldLocked('licensePlate') && (
                        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                          <IoLockClosedOutline className="inline w-3 h-3 mr-0.5" />
                          Locked
                        </span>
                      )}
                    </label>
                    <input
                      type="text"
                      value={formData.licensePlate}
                      onChange={(e) => setFormData({ ...formData, licensePlate: e.target.value.toUpperCase() })}
                      disabled={isFieldLocked('licensePlate')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white uppercase ${validationErrors.licensePlate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${isFieldLocked('licensePlate') ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`}
                      placeholder="ABC1234"
                    />
                    {validationErrors.licensePlate && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.licensePlate}</p>
                    )}
                  </div>
                </div>

                {/* Vehicle Information Policy Note - shown when VIN is decoded */}
                {vinDecoded && vinDecodedFields.length > 0 && (
                  <div className="p-3 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-700 rounded-lg">
                    <div className="flex items-start gap-2">
                      <IoInformationCircleOutline className="w-5 h-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm text-blue-800 dark:text-blue-300">
                          <strong>Vehicle Information Policy:</strong> Your vehicle details have been verified through VIN
                          decoding to ensure accuracy for insurance and guest safety. If your vehicle has custom
                          modifications (different color, aftermarket parts, etc.), please{' '}
                          <a
                            href="mailto:support@itwhip.com?subject=Vehicle Information Update Request"
                            className="underline font-medium hover:text-blue-900 dark:hover:text-blue-200"
                          >
                            contact support
                          </a>{' '}
                          to request changes.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div id="field-make">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Make <span className="text-red-500">*</span>
                      {isVinVerified('make') && !isApproved && (
                        <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                          <IoCheckmarkCircle className="inline w-3 h-3 mr-0.5" />
                          VIN Verified
                        </span>
                      )}
                      {isFieldLocked('make') && (
                        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                          <IoLockClosedOutline className="inline w-3 h-3 mr-0.5" />
                          Locked
                        </span>
                      )}
                    </label>
                    <select
                      value={formData.make}
                      onChange={(e) => handleMakeChange(e.target.value)}
                      disabled={isFieldLocked('make')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        validationErrors.make ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } ${isFieldLocked('make') ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`}
                    >
                      <option value="">Select Make</option>
                      <optgroup label="Popular Brands">
                        {getPopularMakes().map(make => (
                          <option key={make} value={make}>{make}</option>
                        ))}
                      </optgroup>
                      <optgroup label="All Brands">
                        {getAllMakes().filter(m => !getPopularMakes().includes(m)).map(make => (
                          <option key={make} value={make}>{make}</option>
                        ))}
                      </optgroup>
                    </select>
                    {validationErrors.make && <p className="text-red-500 text-xs mt-1">{validationErrors.make}</p>}
                  </div>

                  <div id="field-model">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Model <span className="text-red-500">*</span>
                      {isVinVerified('model') && !isApproved && (
                        <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                          <IoCheckmarkCircle className="inline w-3 h-3 mr-0.5" />
                          VIN Verified
                        </span>
                      )}
                      {isFieldLocked('model') && (
                        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                          <IoLockClosedOutline className="inline w-3 h-3 mr-0.5" />
                          Locked
                        </span>
                      )}
                    </label>
                    <select
                      value={formData.model}
                      onChange={(e) => handleModelChange(e.target.value)}
                      disabled={!formData.make || isFieldLocked('model')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        validationErrors.model ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } ${(!formData.make || isFieldLocked('model')) ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`}
                    >
                      <option value="">{formData.make ? 'Select Model' : 'Select Make First'}</option>
                      {/* Include car's existing model if not in our database (e.g., discontinued models like Ford Fusion) */}
                      {formData.model && !availableModels.includes(formData.model) && (
                        <option key={formData.model} value={formData.model}>
                          {formData.model}
                        </option>
                      )}
                      {availableModels.map(model => (
                        <option key={model} value={model}>{model}</option>
                      ))}
                    </select>
                    {validationErrors.model && <p className="text-red-500 text-xs mt-1">{validationErrors.model}</p>}
                  </div>

                  <div id="field-year">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Year <span className="text-red-500">*</span>
                      {isVinVerified('year') && !isApproved && (
                        <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                          <IoCheckmarkCircle className="inline w-3 h-3 mr-0.5" />
                          VIN Verified
                        </span>
                      )}
                      {isFieldLocked('year') && (
                        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                          <IoLockClosedOutline className="inline w-3 h-3 mr-0.5" />
                          Locked
                        </span>
                      )}
                    </label>
                    <select
                      value={formData.year}
                      onChange={(e) => handleYearChange(parseInt(e.target.value))}
                      disabled={isFieldLocked('year')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        validationErrors.year ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } ${isFieldLocked('year') ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`}
                    >
                      <option value="">Select Year</option>
                      {years.map(year => (
                        <option key={year} value={year}>{year}</option>
                      ))}
                    </select>
                    {validationErrors.year && <p className="text-red-500 text-xs mt-1">{validationErrors.year}</p>}
                  </div>

                  <div id="field-trim">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Trim
                      {isVinVerified('trim') && !isApproved && (
                        <span className="ml-2 text-xs text-emerald-600 dark:text-emerald-400">
                          <IoCheckmarkCircle className="inline w-3 h-3 mr-0.5" />
                          VIN Verified
                        </span>
                      )}
                      {isFieldLocked('trim') && (
                        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                          <IoLockClosedOutline className="inline w-3 h-3 mr-0.5" />
                          Locked
                        </span>
                      )}
                    </label>
                    <select
                      value={formData.trim}
                      onChange={(e) => setFormData({ ...formData, trim: e.target.value })}
                      disabled={!formData.model || isFieldLocked('trim')}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        (!formData.model || isFieldLocked('trim')) ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''
                      }`}
                    >
                      <option value="">{formData.model ? 'Select Trim (Optional)' : 'Select Model First'}</option>
                      {/* Include car's existing trim if not in our database (e.g., VIN-decoded trims) */}
                      {formData.trim && !availableTrims.includes(formData.trim) && (
                        <option key={formData.trim} value={formData.trim}>
                          {formData.trim}
                        </option>
                      )}
                      {availableTrims.map(trim => (
                        <option key={trim} value={trim}>{trim}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">Auto-filled from VIN or select manually</p>
                  </div>

                  <div id="field-color">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Color <span className="text-red-500">*</span>
                      {isFieldLocked('color') && (
                        <span className="ml-2 text-xs text-amber-600 dark:text-amber-400">
                          <IoLockClosedOutline className="inline w-3 h-3 mr-0.5" />
                          Locked
                        </span>
                      )}
                    </label>
                    <select
                      value={formData.color}
                      onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                      disabled={isFieldLocked('color')}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                        validationErrors.color ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } ${isFieldLocked('color') ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`}
                    >
                      <option value="">Select Color</option>
                      {CAR_COLORS.map(color => (
                        <option key={color} value={color}>{color}</option>
                      ))}
                    </select>
                    {validationErrors.color && <p className="text-red-500 text-xs mt-1">{validationErrors.color}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Vehicle Type
                    </label>
                    <select
                      value={formData.carType}
                      onChange={(e) => setFormData({ ...formData, carType: e.target.value })}
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                    >
                      {carTypes.map(type => (
                        <option key={type.value} value={type.value}>{type.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Transmission
                    </label>
                    <select
                      value={formData.transmission}
                      onChange={(e) => setFormData({ ...formData, transmission: e.target.value })}
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                    >
                      <option value="automatic">Automatic</option>
                      <option value="manual">Manual</option>
                    </select>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Vehicle Description</h4>
                  <div id="field-description">
                    <label className="flex justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span>Description <span className="text-red-500">*</span></span>
                      <span className={`text-xs ${
                        (formData.description?.length || 0) < 50
                          ? 'text-red-500'
                          : 'text-gray-500'
                      }`}>
                        {formData.description?.length || 0}/50 min
                      </span>
                    </label>
                    <textarea
                      value={formData.description}
                      onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                      disabled={isLocked}
                      rows={4}
                      minLength={50}
                      maxLength={2000}
                      placeholder="Describe your vehicle to potential renters. Highlight special features, recent upgrades, or what makes it a great choice... (minimum 50 characters)"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white resize-none ${
                        validationErrors.description ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                      } ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                    />
                    {validationErrors.description && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.description}</p>
                    )}
                    {(formData.description?.length || 0) < 50 && !validationErrors.description && (
                      <p className="text-xs text-amber-500 mt-1">
                        {50 - (formData.description?.length || 0)} more characters needed
                      </p>
                    )}
                    <p className="text-xs text-gray-500 mt-1">
                      {formData.description?.length || 0}/2000 characters
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Pickup Location</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    This is where guests will pick up your vehicle. Search for an address to auto-populate all location fields.
                  </p>

                  {/* Arizona Location Notice */}
                  <div className="p-3 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-700 rounded-lg mb-4">
                    <p className="text-xs text-amber-800 dark:text-amber-300">
                      <strong>Note:</strong> Non-Arizona listings may not be displayed or approved.
                      Vehicle must be located in Arizona at the time of approval.{' '}
                      <a href="/terms" className="underline font-medium hover:text-amber-900 dark:hover:text-amber-200">
                        Terms & Conditions
                      </a>{' '}apply.
                    </p>
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div id="field-address" className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Street Address <span className="text-red-500">*</span>
                      </label>
                      <AddressAutocomplete
                        value={formData.address}
                        city={formData.city}
                        state={formData.state}
                        zipCode={formData.zipCode}
                        onAddressSelect={(address) => {
                          setFormData(prev => ({
                            ...prev,
                            address: address.streetAddress,
                            city: address.city,
                            state: address.state,
                            zipCode: address.zipCode,
                            latitude: address.latitude,
                            longitude: address.longitude
                          }))
                        }}
                        disabled={isLocked}
                        placeholder="Start typing to search for an address..."
                        hasError={!!validationErrors.address}
                      />
                      {validationErrors.address && <p className="text-red-500 text-xs mt-1">{validationErrors.address}</p>}
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City
                      </label>
                      <input
                        type="text"
                        value={formData.city}
                        readOnly
                        disabled={isLocked}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white cursor-not-allowed ${isLocked ? 'opacity-60' : ''}`}
                        placeholder="Auto-filled from address"
                      />
                      <p className="text-xs text-gray-500 mt-1">Auto-filled from address selection</p>
                    </div>

                    <div className="flex gap-2">
                      <div className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          State
                        </label>
                        <input
                          type="text"
                          value={formData.state}
                          readOnly
                          disabled={isLocked}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white cursor-not-allowed ${isLocked ? 'opacity-60' : ''}`}
                          placeholder="Auto-filled"
                        />
                      </div>

                      <div id="field-zipCode" className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ZIP Code <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.zipCode}
                          readOnly
                          disabled={isLocked}
                          className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white cursor-not-allowed ${
                            validationErrors.zipCode ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                          } ${isLocked ? 'opacity-60' : ''}`}
                          placeholder="Auto-filled"
                        />
                        {validationErrors.zipCode && <p className="text-red-500 text-xs mt-1">{validationErrors.zipCode}</p>}
                      </div>
                    </div>

                    {/* Coordinates display - only show if coordinates are valid (not 0,0) */}
                    {formData.latitude != null && formData.longitude != null &&
                     (formData.latitude !== 0 || formData.longitude !== 0) && (
                      <div className="md:col-span-2 p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
                        <div className="flex items-center gap-2 text-sm text-green-700 dark:text-green-400">
                          <IoCheckmarkCircle className="w-4 h-4" />
                          <span>Location verified: {formData.latitude.toFixed(4)}, {formData.longitude.toFixed(4)}</span>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'registration' && (
              <div className="space-y-6">
                <div className="flex items-start gap-3 p-4 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800 rounded-lg">
                  <IoInformationCircleOutline className="w-6 h-6 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                  <div>
                    <h4 className="text-sm font-semibold text-blue-900 dark:text-blue-200 mb-1">
                      Registration & Documentation Information
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-300">
                      This information is required for insurance claims and regulatory compliance. Complete vehicle registration details ensure smooth claim processing and legal compliance with DMV/ADOT requirements.
                    </p>
                  </div>
                </div>

                {isLocked && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Registration information cannot be modified while vehicle has an active claim
                    </p>
                  </div>
                )}
                
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Registration & Ownership</h3>

                {/* Primary Use Declaration - Required for insurance rating */}
                <div id="field-primaryUse" className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Primary Vehicle Use <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.primaryUse}
                    onChange={(e) => setFormData({ ...formData, primaryUse: e.target.value })}
                    disabled={isLocked}
                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${validationErrors.primaryUse ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                  >
                    <option value="">Select primary use...</option>
                    <option value="Rental">Rental Only</option>
                    <option value="Personal">Personal & Rental</option>
                    <option value="Business">Business Use</option>
                  </select>
                  {validationErrors.primaryUse ? (
                    <p className="text-xs text-red-500 mt-1">{validationErrors.primaryUse}</p>
                  ) : (
                    <p className="text-xs text-gray-500 dark:text-gray-400 mt-2">
                      <strong>Rental Only:</strong> Vehicle exclusively for platform rentals •
                      <strong> Personal & Rental:</strong> Mixed personal and rental use •
                      <strong> Business Use:</strong> Commercial/fleet operations
                    </p>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div id="field-registrationState">
                    <label className="flex items-center justify-between text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      <span>State of Registration <span className="text-red-500">*</span></span>
                      {isFieldLocked('registrationState') && isApproved && (
                        <span className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400 font-normal">
                          <IoLockClosedOutline className="w-3 h-3" />
                          Locked
                        </span>
                      )}
                    </label>
                    <select
                      value={formData.registrationState}
                      onChange={(e) => setFormData({ ...formData, registrationState: e.target.value })}
                      disabled={isFieldLocked('registrationState')}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isFieldLocked('registrationState') ? 'opacity-60 cursor-not-allowed bg-gray-100 dark:bg-gray-900' : ''}`}
                    >
                      {usStates.map(state => (
                        <option key={state} value={state}>{state}</option>
                      ))}
                    </select>
                    <p className="text-xs text-gray-500 mt-1">State where vehicle is registered</p>
                  </div>

                  <div id="field-registrationExpiryDate" className="min-w-0">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Registration Expiration Date <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="date"
                      value={formData.registrationExpiryDate}
                      onChange={(e) => setFormData({ ...formData, registrationExpiryDate: e.target.value })}
                      disabled={isLocked}
                      placeholder="MM/DD/YYYY"
                      style={{ textAlign: 'left', WebkitAppearance: 'none' }}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent bg-white dark:bg-gray-700 dark:text-white text-left [&::-webkit-datetime-edit]:text-left [&::-webkit-datetime-edit-fields-wrapper]:text-left [&::-webkit-date-and-time-value]:text-left ${validationErrors.registrationExpiryDate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${!formData.registrationExpiryDate ? 'text-gray-400' : ''} ${isLocked ? 'opacity-60 cursor-not-allowed !bg-gray-50 dark:!bg-gray-900' : ''}`}
                    />
                    {validationErrors.registrationExpiryDate ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.registrationExpiryDate}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">
                        {formData.registrationExpiryDate ? 'Date shown on registration card' : 'Select the expiration date from your registration card'}
                      </p>
                    )}
                  </div>

                  <div id="field-registeredOwner">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Registered Owner Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={formData.registeredOwner}
                      onChange={(e) => setFormData({ ...formData, registeredOwner: e.target.value })}
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${validationErrors.registeredOwner ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      placeholder="Name exactly as shown on title"
                    />
                    {validationErrors.registeredOwner ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.registeredOwner}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Must match vehicle title</p>
                    )}
                  </div>
                  
                  <div id="field-titleStatus">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Title Status <span className="text-red-500">*</span>
                    </label>
                    <select
                      value={formData.titleStatus}
                      onChange={(e) => setFormData({ ...formData, titleStatus: e.target.value })}
                      disabled={isLocked}
                      className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                    >
                      {titleStatuses.map(status => (
                        <option key={status.value} value={status.value}>{status.label}</option>
                      ))}
                    </select>
                  </div>
                  
                  <div id="field-estimatedValue">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Estimated Vehicle Value <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.estimatedValue}
                        onChange={(e) => setFormData({ ...formData, estimatedValue: parseFloat(e.target.value) })}
                        disabled={isLocked}
                        min="0"
                        step="1000"
                        className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${validationErrors.estimatedValue ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                        placeholder="Current market value"
                      />
                    </div>
                    {validationErrors.estimatedValue ? (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.estimatedValue}</p>
                    ) : (
                      <p className="text-xs text-gray-500 mt-1">Current fair market value</p>
                    )}
                  </div>
                  
                  <div id="field-currentMileage">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Current Odometer Reading <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="number"
                      value={formData.currentMileage}
                      onChange={(e) => setFormData({ ...formData, currentMileage: parseInt(e.target.value) })}
                      disabled={isLocked}
                      min="0"
                      className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${validationErrors.currentMileage ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      placeholder="Miles"
                    />
                    {validationErrors.currentMileage && (
                      <p className="text-xs text-red-500 mt-1">{validationErrors.currentMileage}</p>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Garage/Storage Location</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">Where the vehicle is normally parked overnight (Required for insurance)</p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div id="field-garageAddress" className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Garage Address <span className="text-red-500">*</span>
                      </label>
                      <AddressAutocomplete
                        value={formData.garageAddress || ''}
                        city={formData.garageCity}
                        state={formData.garageState}
                        zipCode={formData.garageZip}
                        onAddressSelect={(address) => {
                          setFormData(prev => ({
                            ...prev,
                            garageAddress: address.streetAddress,
                            garageCity: address.city,
                            garageState: address.state,
                            garageZip: address.zipCode
                          }))
                        }}
                        disabled={isLocked}
                        placeholder="Search for garage/storage address..."
                        hasError={!!validationErrors.garageAddress}
                      />
                    </div>

                    <div id="field-garageCity">
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        City <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={formData.garageCity}
                        readOnly
                        disabled={isLocked}
                        className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white cursor-not-allowed ${validationErrors.garageCity ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${isLocked ? 'opacity-60' : ''}`}
                        placeholder="Auto-filled"
                      />
                      {validationErrors.garageCity && (
                        <p className="text-xs text-red-500 mt-1">{validationErrors.garageCity}</p>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <div id="field-garageState" className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          State <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.garageState}
                          readOnly
                          disabled={isLocked}
                          className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white cursor-not-allowed ${validationErrors.garageState ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${isLocked ? 'opacity-60' : ''}`}
                          placeholder="Auto-filled"
                        />
                        {validationErrors.garageState && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors.garageState}</p>
                        )}
                      </div>

                      <div id="field-garageZip" className="flex-1">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          ZIP <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          value={formData.garageZip}
                          readOnly
                          disabled={isLocked}
                          maxLength={10}
                          className={`w-full px-3 py-2 border rounded-lg bg-gray-50 dark:bg-gray-900 dark:text-white cursor-not-allowed ${validationErrors.garageZip ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${isLocked ? 'opacity-60' : ''}`}
                          placeholder="Auto-filled"
                        />
                        {validationErrors.garageZip && (
                          <p className="text-xs text-red-500 mt-1">{validationErrors.garageZip}</p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Lien Information</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">If vehicle is financed or leased</p>
                  
                  <div className="space-y-4">
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.hasLien}
                        onChange={(e) => setFormData({ ...formData, hasLien: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Vehicle has a lien (financed/leased)</span>
                    </label>
                    
                    {formData.hasLien && (
                      <div className="ml-7 grid md:grid-cols-2 gap-4 mt-4">
                        <div id="field-lienholderName">
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Lienholder Name <span className="text-red-500">*</span>
                          </label>
                          <input
                            type="text"
                            value={formData.lienholderName}
                            onChange={(e) => setFormData({ ...formData, lienholderName: e.target.value })}
                            disabled={isLocked}
                            className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${validationErrors.lienholderName ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'} ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                            placeholder="e.g., Chase Auto Finance"
                          />
                          {validationErrors.lienholderName && (
                            <p className="text-xs text-red-500 mt-1">{validationErrors.lienholderName}</p>
                          )}
                        </div>
                        
                        <div>
                          <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                            Lienholder Address
                          </label>
                          <input
                            type="text"
                            value={formData.lienholderAddress}
                            onChange={(e) => setFormData({ ...formData, lienholderAddress: e.target.value })}
                            disabled={isLocked}
                            className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                            placeholder="Lienholder's mailing address"
                          />
                        </div>
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Safety & Anti-Theft Features</h4>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">These features may reduce insurance premiums</p>
                  
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.hasAlarm}
                        onChange={(e) => setFormData({ ...formData, hasAlarm: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Car Alarm System</span>
                    </label>
                    
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.hasTracking}
                        onChange={(e) => setFormData({ ...formData, hasTracking: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">GPS Tracking Device</span>
                    </label>
                    
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.hasImmobilizer}
                        onChange={(e) => setFormData({ ...formData, hasImmobilizer: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Engine Immobilizer</span>
                    </label>
                  </div>
                </div>
                
                <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Vehicle Modifications</h4>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Annual Mileage Estimate
                      </label>
                      <input
                        type="number"
                        value={formData.annualMileage}
                        onChange={(e) => setFormData({ ...formData, annualMileage: parseInt(e.target.value) })}
                        disabled={isLocked}
                        min="0"
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                        placeholder="Miles driven per year"
                      />
                    </div>
                    
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.isModified}
                        onChange={(e) => setFormData({ ...formData, isModified: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Vehicle has aftermarket modifications</span>
                    </label>
                    
                    {formData.isModified && (
                      <div className="ml-7">
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                          Describe Modifications
                        </label>
                        <textarea
                          value={formData.modifications}
                          onChange={(e) => setFormData({ ...formData, modifications: e.target.value })}
                          disabled={isLocked}
                          rows={3}
                          className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                          placeholder="List modifications (engine, suspension, body kit, etc.)"
                        />
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'pricing' && (
              <div className="space-y-6">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Pricing & Fees</h3>
                
                <div className="grid md:grid-cols-3 gap-4">
                  <div id="field-dailyRate">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Daily Rate <span className="text-red-500">*</span>
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.dailyRate}
                        onChange={(e) => setFormData({ ...formData, dailyRate: parseFloat(e.target.value) })}
                        min="0"
                        step="10"
                        disabled={isLocked}
                        className={`w-full pl-8 pr-3 py-2 border rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${
                          validationErrors.dailyRate ? 'border-red-500' : 'border-gray-300 dark:border-gray-600'
                        } ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      />
                    </div>
                    {validationErrors.dailyRate && <p className="text-red-500 text-xs mt-1">{validationErrors.dailyRate}</p>}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Weekly Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.weeklyRate}
                        onChange={(e) => setFormData({ ...formData, weeklyRate: parseFloat(e.target.value) })}
                        min="0"
                        step="10"
                        disabled={isLocked}
                        className={`w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Suggested: ${(formData.dailyRate * 6.5).toFixed(0)}
                    </p>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Monthly Rate
                    </label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.monthlyRate}
                        onChange={(e) => setFormData({ ...formData, monthlyRate: parseFloat(e.target.value) })}
                        min="0"
                        step="10"
                        disabled={isLocked}
                        className={`w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Suggested: ${(formData.dailyRate * 25).toFixed(0)}
                    </p>
                  </div>
                </div>

                <div className="border-t border-gray-200 dark:border-gray-700 pt-4">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Delivery Options</h4>
                  <div className="space-y-3">
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.airportPickup}
                        onChange={(e) => setFormData({ ...formData, airportPickup: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Airport Pickup Available</span>
                    </label>
                    
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.hotelDelivery}
                        onChange={(e) => setFormData({ ...formData, hotelDelivery: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Hotel Delivery Available</span>
                    </label>
                    
                    <label className={`flex items-center gap-3 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.homeDelivery}
                        onChange={(e) => setFormData({ ...formData, homeDelivery: e.target.checked })}
                        disabled={isLocked}
                        className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <span className="text-gray-700 dark:text-gray-300">Home Delivery Available</span>
                    </label>
                  </div>
                  
                  <div className="mt-4">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Delivery Fee
                    </label>
                    <div className="relative max-w-xs">
                      <span className="absolute left-3 top-2 text-gray-500">$</span>
                      <input
                        type="number"
                        value={formData.deliveryFee}
                        onChange={(e) => setFormData({ ...formData, deliveryFee: parseFloat(e.target.value) })}
                        min="0"
                        step="5"
                        disabled={isLocked}
                        className={`w-full pl-8 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'photos' && (
              <div id="field-photos" className="space-y-6">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">Vehicle Photos</h3>
                  <label className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 ${
                    isLocked
                      ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                      : 'bg-purple-600 text-white hover:bg-purple-700 cursor-pointer'
                  }`}>
                    <IoAddOutline className="w-5 h-5" />
                    {uploadingPhoto ? 'Uploading...' : 'Add Photos'}
                    <input
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={handlePhotoUpload}
                      className="hidden"
                      disabled={uploadingPhoto || isLocked}
                    />
                  </label>
                </div>
                
                {isLocked && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                    <p className="text-sm text-yellow-800 dark:text-yellow-300">
                      Photo uploads are disabled while vehicle has an active claim
                    </p>
                  </div>
                )}

                {/* Photo count indicator */}
                <div className={`flex items-center justify-between mb-4 p-3 rounded-lg ${
                  photos.length >= 3
                    ? 'bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800'
                }`}>
                  <div className="flex items-center gap-2">
                    {photos.length >= 3 ? (
                      <IoCheckmarkCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
                    ) : (
                      <IoWarningOutline className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                    )}
                    <span className={`text-sm font-medium ${
                      photos.length >= 3
                        ? 'text-emerald-800 dark:text-emerald-300'
                        : 'text-amber-800 dark:text-amber-300'
                    }`}>
                      {photos.length} of 3 minimum photos uploaded
                    </span>
                  </div>
                  {photos.length < 3 && (
                    <span className="text-xs text-amber-600 dark:text-amber-400">
                      {3 - photos.length} more required
                    </span>
                  )}
                </div>

                {validationErrors.photos && (
                  <div className="mb-4 p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg">
                    <p className="text-sm text-red-700 dark:text-red-300 flex items-center gap-2">
                      <IoWarningOutline className="w-4 h-4" />
                      {validationErrors.photos}
                    </p>
                  </div>
                )}

                {photos.length === 0 ? (
                  <div className="text-center py-12 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg">
                    <IoImageOutline className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                    <p className="text-gray-600 dark:text-gray-400">No photos uploaded yet</p>
                    <p className="text-sm text-gray-500 mt-1">Add photos to showcase your vehicle</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
                    {photos.map((photo) => (
                      <div key={photo.id} className="relative group">
                        <Image
                          src={photo.url}
                          alt="Car photo"
                          width={300}
                          height={200}
                          className="w-full h-40 object-cover rounded-lg"
                        />
                        {!isLocked && (
                          <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                            <button
                              onClick={() => handleSetHeroPhoto(photo.id)}
                              className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800"
                              title="Set as main photo"
                            >
                              {photo.isHero ? (
                                <IoStar className="w-5 h-5 text-yellow-500" />
                              ) : (
                                <IoStarOutline className="w-5 h-5 text-gray-700 dark:text-gray-300" />
                              )}
                            </button>
                            <button
                              onClick={() => handleDeletePhoto(photo.id)}
                              className="p-2 bg-white/90 dark:bg-gray-800/90 rounded-lg hover:bg-white dark:hover:bg-gray-800"
                              title="Delete photo"
                            >
                              <IoTrashOutline className="w-5 h-5 text-red-500" />
                            </button>
                          </div>
                        )}
                        {photo.isHero && (
                          <div className="absolute bottom-2 left-2 px-2 py-1 bg-purple-600 text-white text-xs rounded">
                            Main Photo
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'features' && (
              <div className="space-y-6">
                {/* Auto-populated Features Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center gap-2">
                      <IoSparklesOutline className="w-5 h-5 text-purple-600" />
                      <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                        Vehicle Features
                      </h3>
                    </div>
                    <span className="text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 px-2 py-1 rounded-full">
                      Auto-detected
                    </span>
                  </div>

                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-4">
                    Features are automatically determined based on your {formData.year} {formData.make} {formData.model}'s type and year.
                    Uncheck any features that are not working or unavailable on your vehicle.
                  </p>

                  {/* Display auto-populated features by category with toggles */}
                  {(() => {
                    const autoFeatures = getVehicleFeatures(
                      formData.carType || 'SEDAN',
                      formData.year,
                      formData.fuelType,
                      formData.make,
                      formData.model
                    )
                    const groupedFeatures = groupFeaturesByCategory(autoFeatures)

                    // Track disabled features in formData.features (inverted - features array contains ACTIVE features)
                    const currentFeatures = formData.features || []
                    const activeFeatures = currentFeatures.length > 0 ? currentFeatures : autoFeatures

                    return (
                      <div className="space-y-4">
                        {Object.entries(groupedFeatures).map(([category, categoryFeatures]) => (
                          <div key={category}>
                            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2 flex items-center gap-2">
                              {category === 'safety' && <IoShieldOutline className="w-4 h-4 text-blue-600" />}
                              {category === 'comfort' && <IoCarOutline className="w-4 h-4 text-purple-600" />}
                              {category === 'technology' && <IoInformationCircleOutline className="w-4 h-4 text-green-600" />}
                              {category === 'utility' && <IoReorderThreeOutline className="w-4 h-4 text-orange-600" />}
                              <span className="capitalize">{category === 'safety' ? 'Safety' : category === 'comfort' ? 'Comfort & Interior' : category === 'technology' ? 'Technology' : 'Utility'}</span>
                            </h4>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                              {categoryFeatures.map(feature => {
                                const isActive = activeFeatures.includes(feature)
                                return (
                                  <label
                                    key={feature}
                                    className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                                      isActive
                                        ? 'bg-green-50 dark:bg-green-900/20 hover:bg-green-100 dark:hover:bg-green-900/30'
                                        : 'bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 opacity-60'
                                    } ${isLocked ? 'cursor-not-allowed' : ''}`}
                                  >
                                    <input
                                      type="checkbox"
                                      checked={isActive}
                                      onChange={() => {
                                        if (isLocked) return
                                        const newFeatures = isActive
                                          ? activeFeatures.filter(f => f !== feature)
                                          : [...activeFeatures, feature]
                                        setFormData(prev => ({ ...prev, features: newFeatures }))
                                      }}
                                      disabled={isLocked}
                                      className="w-4 h-4 text-green-600 rounded focus:ring-green-500"
                                    />
                                    <span className={`text-sm ${isActive ? 'text-gray-700 dark:text-gray-300' : 'text-gray-500 dark:text-gray-400 line-through'}`}>
                                      {feature}
                                    </span>
                                  </label>
                                )
                              })}
                            </div>
                          </div>
                        ))}

                        <div className="text-center text-sm text-gray-500 dark:text-gray-400 pt-2">
                          {activeFeatures.length} of {autoFeatures.length} features active
                        </div>
                      </div>
                    )
                  })()}

                  {/* Missing features button */}
                  <div className="mt-4 flex items-center justify-between p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                    <p className="text-sm text-blue-700 dark:text-blue-400">
                      Missing a feature your vehicle has?
                    </p>
                    <a
                      href="mailto:support@itwhip.com?subject=Feature Request for My Vehicle"
                      className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300"
                    >
                      Contact Support
                    </a>
                  </div>
                </div>

                {/* Rental Rules Section */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h4 className="font-medium text-gray-900 dark:text-white mb-4">Rental Rules</h4>

                  {isLocked && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-3 mb-4">
                      <p className="text-sm text-yellow-800 dark:text-yellow-300">
                        Rules cannot be modified while vehicle has an active claim
                      </p>
                    </div>
                  )}

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {rules.map((rule) => (
                      <label key={rule} className={`flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${isLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                        <input
                          type="checkbox"
                          checked={(formData.rules || []).includes(rule)}
                          onChange={() => toggleRule(rule)}
                          disabled={isLocked}
                          className="w-4 h-4 text-purple-600 rounded focus:ring-purple-600"
                        />
                        <span className="text-gray-700 dark:text-gray-300">{rule}</span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'availability' && (
              <div className="space-y-6">
                {/* Availability Settings Card */}
                <div className="bg-white dark:bg-gray-800 rounded-lg p-6 border border-gray-200 dark:border-gray-700">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">Availability Settings</h3>

                  {isAvailabilityLocked && (
                    <div className="bg-yellow-50 dark:bg-yellow-900/20 border-2 border-yellow-400 dark:border-yellow-600 rounded-lg p-4 mb-4">
                      <div className="flex items-start gap-3">
                        <IoLockClosedOutline className="w-6 h-6 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <h4 className="font-semibold text-yellow-800 dark:text-yellow-300 mb-1">
                            {isLocked ? 'Locked - Active Claim' : 'Pending Car Approval'}
                          </h4>
                          <p className="text-sm text-yellow-700 dark:text-yellow-400">
                            {isLocked
                              ? 'Availability settings cannot be modified while vehicle has an active claim.'
                              : 'Your car cannot go live until your car is approved. You can still configure all settings - they will take effect once approved.'
                            }
                          </p>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-4">
                    <label className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${isAvailabilityLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.isActive}
                        onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
                        disabled={isAvailabilityLocked}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">Car is Active</span>
                          {isHostNotApproved && <IoLockClosedOutline className="w-4 h-4 text-yellow-600" />}
                        </div>
                        <p className="text-sm text-gray-500">Make this car available for booking</p>
                      </div>
                    </label>

                    <label className={`flex items-center gap-3 p-3 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 ${isAvailabilityLocked ? 'opacity-60 cursor-not-allowed' : 'cursor-pointer'}`}>
                      <input
                        type="checkbox"
                        checked={formData.instantBook}
                        onChange={(e) => setFormData({ ...formData, instantBook: e.target.checked })}
                        disabled={isAvailabilityLocked}
                        className="w-5 h-5 text-purple-600 rounded focus:ring-purple-600"
                      />
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-gray-700 dark:text-gray-300 font-medium">Instant Book</span>
                          {isHostNotApproved && <IoLockClosedOutline className="w-4 h-4 text-yellow-600" />}
                        </div>
                        <p className="text-sm text-gray-500">Allow guests to book without your approval</p>
                      </div>
                    </label>
                  </div>

                  <div className="grid md:grid-cols-3 gap-4 pt-4 border-t border-gray-200 dark:border-gray-700 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Advance Notice (hours)
                      </label>
                      <input
                        type="number"
                        value={formData.advanceNotice}
                        onChange={(e) => setFormData({ ...formData, advanceNotice: parseInt(e.target.value) })}
                        min="0"
                        max="72"
                        disabled={isLocked}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      />
                      <p className="text-xs text-gray-500 mt-1">How far in advance can guests book</p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Minimum Trip (days)
                      </label>
                      <input
                        type="number"
                        value={formData.minTripDuration}
                        onChange={(e) => setFormData({ ...formData, minTripDuration: parseInt(e.target.value) })}
                        min="1"
                        max="30"
                        disabled={isLocked}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                        Maximum Trip (days)
                      </label>
                      <input
                        type="number"
                        value={formData.maxTripDuration}
                        onChange={(e) => setFormData({ ...formData, maxTripDuration: parseInt(e.target.value) })}
                        min="1"
                        max="365"
                        disabled={isLocked}
                        className={`w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-purple-600 focus:border-transparent dark:bg-gray-700 dark:text-white ${isLocked ? 'opacity-60 cursor-not-allowed bg-gray-50 dark:bg-gray-900' : ''}`}
                      />
                    </div>
                  </div>
                </div>

                {/* Full Availability Calendar */}
                <HostAvailabilityCalendar
                  carId={car?.id || ''}
                  isLocked={isLocked}
                />
              </div>
            )}

            {activeTab === 'service' && (
              <div id="field-inspection" className="space-y-6">
                {/* Header with Add Button */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      Service & Maintenance History
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                      Track all vehicle maintenance for compliance and insurance claims
                    </p>
                  </div>
                  <button
                    onClick={() => setShowAddServiceModal(true)}
                    disabled={isLocked}
                    className={`px-4 py-2 rounded-lg transition-colors flex items-center gap-2 whitespace-nowrap ${
                      isLocked
                        ? 'bg-gray-300 dark:bg-gray-700 text-gray-500 cursor-not-allowed'
                        : 'bg-purple-600 text-white hover:bg-purple-700'
                    }`}
                  >
                    <IoAddOutline className="w-5 h-5" />
                    Add Service Record
                  </button>
                </div>

                {/* Lock Warning (if vehicle has active claim) */}
                {isLocked && (
                  <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                    <div className="flex items-start gap-3">
                      <IoWarningOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-sm font-medium text-yellow-800 dark:text-yellow-300">
                          Service records locked during active claim
                        </p>
                        <p className="text-xs text-yellow-700 dark:text-yellow-400 mt-1">
                          You cannot add or modify service records while this vehicle has an active insurance claim.
                        </p>
                      </div>
                    </div>
                  </div>
                )}

                {/* Service Due Alerts */}
                <ServiceDueAlerts carId={carId} />

                {/* Service History List */}
                <ServiceHistoryList carId={carId} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Add Service Record Modal */}
      {showAddServiceModal && (
        <AddServiceRecordModal
          carId={carId}
          onClose={() => setShowAddServiceModal(false)}
          onSuccess={() => {
            setShowAddServiceModal(false)
            fetchCarDetails()
          }}
        />
      )}

      <Footer />
    </>
  )
}
