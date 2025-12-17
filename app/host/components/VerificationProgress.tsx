// app/host/components/VerificationProgress.tsx
'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import {
  IoCheckmarkCircle,
  IoCloseCircle,
  IoTimeOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCardOutline,
  IoChevronForwardOutline,
  IoCarSportOutline,
  IoInformationCircleOutline
} from 'react-icons/io5'

interface VerificationStep {
  id: string
  title: string
  description: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'PENDING_REVIEW'
  icon: any
  actionUrl?: string
  actionLabel?: string
  estimatedTime?: string
  priority: 'HIGH' | 'MEDIUM' | 'LOW'
  tierInfo?: {
    tier: 'BASIC' | 'STANDARD' | 'PREMIUM' | null
    percentage: number
  }
}

interface CarData {
  id: string
  dailyRate: number
  vin: string | null
  licensePlate: string | null
  photoCount: number
}

interface VerificationProgressProps {
  hostId: string
  approvalStatus: string
  documentStatuses?: any
  backgroundCheckStatus?: string
  pendingActions?: string[]
  // These can still be passed but we'll also fetch directly
  hasIncompleteCar?: boolean
  incompleteCarId?: string
  onActionClick?: (stepId: string) => void
}

// Helper to check car completion
function isCarComplete(car: CarData): boolean {
  const hasPhotos = car.photoCount >= 6
  const hasVin = car.vin && car.vin.length >= 17
  const hasLicensePlate = car.licensePlate && car.licensePlate.length >= 2
  const hasPricing = car.dailyRate && car.dailyRate > 0
  
  return hasPhotos && hasVin && hasLicensePlate && hasPricing
}

export default function VerificationProgress({
  hostId,
  approvalStatus,
  documentStatuses = {},
  backgroundCheckStatus = 'NOT_STARTED',
  pendingActions = [],
  hasIncompleteCar: hasIncompleteCarProp,
  incompleteCarId: incompleteCarIdProp,
  onActionClick
}: VerificationProgressProps) {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<VerificationStep[]>([])
  const [loading, setLoading] = useState(true)
  
  // Local state for car completion - fetched directly
  const [hasIncompleteCar, setHasIncompleteCar] = useState(false)
  const [incompleteCarId, setIncompleteCarId] = useState<string | null>(null)
  const [carsFetched, setCarsFetched] = useState(false)
  const [cars, setCars] = useState<any[]>([])
  
  // Local state for profile data - fetched to check completion
  const [profileData, setProfileData] = useState<{
    name?: string
    phone?: string
    bio?: string
    profilePhoto?: string
  } | null>(null)
  const [profileFetched, setProfileFetched] = useState(false)

  // Fetch cars directly to check completion status
  useEffect(() => {
    const fetchCars = async () => {
      console.log('[VerificationProgress] Fetching cars for hostId:', hostId)
      try {
        const response = await fetch(`/api/host/cars?hostId=${hostId}`, {
          credentials: 'include'
        })

        console.log('[VerificationProgress] /api/host/cars response status:', response.status)

        if (response.ok) {
          const data = await response.json()
          console.log('[VerificationProgress] /api/host/cars raw response:', JSON.stringify(data, null, 2))
          const carsData = data.cars || data.data || []
          console.log('[VerificationProgress] Extracted carsData:', carsData.length, 'cars')
          setCars(carsData)
          
          if (carsData.length > 0) {
            // Check each car for completion
            const incompleteCar = carsData.find((car: any) => {
              const photoCount = car.photoCount || car._count?.photos || (car.photos?.length || 0)
              const carData: CarData = {
                id: car.id,
                dailyRate: car.dailyRate || 0,
                vin: car.vin,
                licensePlate: car.licensePlate,
                photoCount: photoCount
              }
              return !isCarComplete(carData)
            })
            
            if (incompleteCar) {
              setHasIncompleteCar(true)
              setIncompleteCarId(incompleteCar.id)
            } else {
              setHasIncompleteCar(false)
              setIncompleteCarId(null)
            }
          } else {
            // No cars at all - host needs to add a car
            setHasIncompleteCar(true)
            setIncompleteCarId(null)
          }
        }
      } catch (error) {
        console.error('Error fetching cars for verification:', error)
        // On error, assume incomplete (safer default)
        setHasIncompleteCar(true)
        setIncompleteCarId(incompleteCarIdProp || null)
      } finally {
        setCarsFetched(true)
      }
    }
    
    if (hostId) {
      fetchCars()
    }
  }, [hostId, hasIncompleteCarProp, incompleteCarIdProp])

  // Fetch profile data to check completion
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await fetch('/api/host/profile', {
          credentials: 'include'
        })
        
        if (response.ok) {
          const data = await response.json()
          const profile = data.profile || data
          setProfileData({
            name: profile.name,
            phone: profile.phone,
            bio: profile.bio,
            profilePhoto: profile.profilePhoto || profile.image
          })
        } else {
          setProfileData(null)
        }
      } catch (error) {
        console.error('Error fetching profile for verification:', error)
        setProfileData(null)
      } finally {
        setProfileFetched(true)
      }
    }
    
    fetchProfile()
  }, [])

  // Build steps after cars AND profile are fetched
  useEffect(() => {
    if (!carsFetched || !profileFetched) return

    buildVerificationSteps()
  }, [carsFetched, profileFetched, hasIncompleteCar, incompleteCarId, cars, approvalStatus, backgroundCheckStatus, documentStatuses, profileData])

  // Helper function to check if host has selected insurance tier
  const checkInsuranceTierSelected = async (): Promise<{ selected: boolean; tier: 'BASIC' | 'STANDARD' | 'PREMIUM' | null; percentage: number }> => {
    try {
      const response = await fetch(`/api/host/profile`, {
        credentials: 'include'
      })

      if (response.ok) {
        const data = await response.json()
        const profile = data.profile

        // Check tier priority: PREMIUM > STANDARD > BASIC
        if (profile.earningsTier === 'PREMIUM' || profile.commercialInsuranceActive === true) {
          return { selected: true, tier: 'PREMIUM', percentage: 90 }
        } else if (profile.earningsTier === 'STANDARD' || profile.p2pInsuranceActive === true) {
          return { selected: true, tier: 'STANDARD', percentage: 75 }
        } else if (profile.earningsTier === 'BASIC') {
          return { selected: true, tier: 'BASIC', percentage: 40 }
        }

        return { selected: false, tier: null, percentage: 0 }
      }

      return { selected: false, tier: null, percentage: 0 }
    } catch (error) {
      console.error('Error checking insurance tier:', error)
      return { selected: false, tier: null, percentage: 0 }
    }
  }

  const buildVerificationSteps = async () => {
    try {
      setLoading(true)

      const verificationSteps: VerificationStep[] = []

      // Step 1: Profile Completion - Dynamic check based on actual fields
      // Check for truthy values AND non-empty strings
      const isProfileComplete = !!(
        profileData?.name &&
        profileData?.bio && profileData.bio.length > 0 &&
        profileData?.profilePhoto
      )
      
      verificationSteps.push({
        id: 'profile',
        title: 'Complete Your Profile',
        description: 'Add your bio, profile photo, and basic information',
        status: isProfileComplete ? 'COMPLETED' : 'IN_PROGRESS',
        icon: IoDocumentTextOutline,
        actionUrl: !isProfileComplete ? '/host/profile?tab=profile' : undefined,
        actionLabel: 'Complete Profile',
        priority: 'HIGH'
      })

      // Step 2: Document Upload
      const docsStatus = determineDocumentStatus(documentStatuses)
      verificationSteps.push({
        id: 'documents',
        title: 'Upload Required Documents',
        description: 'Government ID, Driver\'s License, and Insurance Certificate',
        status: docsStatus,
        icon: IoDocumentTextOutline,
        actionUrl: docsStatus !== 'COMPLETED' ? '/host/profile' : undefined,
        actionLabel: docsStatus === 'FAILED' ? 'Re-upload Documents' : 'Upload Documents',
        estimatedTime: '5 minutes',
        priority: 'HIGH'
      })

      // Step 3: Vehicle Listing Completion - ALWAYS show this step
      const vehicleStatus = hasIncompleteCar ? 'IN_PROGRESS' : 'COMPLETED'

      // Route to edit page if car exists, otherwise leave undefined (handleStepClick will route to /add)
      const vehicleEditUrl = incompleteCarId
        ? `/host/cars/${incompleteCarId}/edit`
        : cars.length > 0
          ? `/host/cars/${cars[0].id}/edit`
          : undefined

      verificationSteps.push({
        id: 'vehicle',
        title: 'Complete Your Vehicle Listing',
        description: hasIncompleteCar
          ? 'Add photos, VIN, pricing to finish your listing'
          : 'Your vehicle listing is complete and ready for review',
        status: vehicleStatus,
        icon: IoCarSportOutline,
        actionUrl: vehicleEditUrl,
        actionLabel: 'Complete Listing',
        estimatedTime: '10 minutes',
        priority: 'HIGH'
      })

      // Step 4: Bank Account Setup
      verificationSteps.push({
        id: 'bank_account',
        title: 'Connect Bank Account',
        description: 'Add your payout method to receive earnings',
        status: approvalStatus === 'APPROVED' ? 'COMPLETED' : 'NOT_STARTED',
        icon: IoCardOutline,
        actionUrl: '/host/earnings',
        actionLabel: 'Add Bank Account',
        estimatedTime: '3 minutes',
        priority: 'MEDIUM'
      })

      // Step 5: Insurance Tier Selection
      // Host must select earnings tier to complete verification
      // BASIC (40%) - No insurance, STANDARD (75%) - P2P, PREMIUM (90%) - Commercial
      const tierStatus = await checkInsuranceTierSelected()
      verificationSteps.push({
        id: 'insurance_tier',
        title: 'Select Insurance Tier',
        description: tierStatus.selected
          ? 'Your earnings tier is configured'
          : 'Choose your earnings tier: BASIC (40%), STANDARD (75%), or PREMIUM (90%)',
        status: tierStatus.selected ? 'COMPLETED' : 'NOT_STARTED',
        icon: IoShieldCheckmarkOutline,
        actionUrl: '/host/profile?tab=insurance',
        actionLabel: 'Select Tier',
        estimatedTime: '5 minutes',
        priority: 'HIGH',
        tierInfo: tierStatus.selected ? {
          tier: tierStatus.tier,
          percentage: tierStatus.percentage
        } : undefined
      })

      setSteps(verificationSteps)

      // Calculate progress percentage
      const completedSteps = verificationSteps.filter(s => s.status === 'COMPLETED').length
      const totalSteps = verificationSteps.length
      const progressPercentage = Math.round((completedSteps / totalSteps) * 100)
      setProgress(progressPercentage)

    } catch (error) {
      console.error('Error building verification steps:', error)
    } finally {
      setLoading(false)
    }
  }

  // Handle navigation when a step is clicked
  const handleStepClick = (step: VerificationStep) => {
    let route = ''

    switch (step.id) {
      case 'profile':
        route = '/host/profile?tab=profile'
        break
      case 'documents':
        route = '/host/profile?tab=documents'
        break
      case 'vehicle':
        // Try multiple sources for the car ID - prioritize what we have
        const carId = incompleteCarId || incompleteCarIdProp || cars[0]?.id
        console.log('[VerificationProgress] Vehicle click - carId sources:', {
          incompleteCarId,
          incompleteCarIdProp,
          firstCarId: cars[0]?.id,
          selectedCarId: carId,
          carsLength: cars.length
        })
        if (carId) {
          route = `/host/cars/${carId}/edit`
        } else {
          // No car exists - go to add page
          route = '/host/cars/add'
        }
        break
      case 'bank_account':
        route = '/host/profile?tab=banking'
        break
      case 'insurance_tier':
        route = '/host/profile?tab=insurance'
        break
      default:
        // If step has actionUrl, use it
        if (step.actionUrl) {
          route = step.actionUrl
        }
        break
    }

    console.log('[VerificationProgress] handleStepClick navigation:', {
      stepId: step.id,
      route,
      hasOnActionClick: !!onActionClick
    })

    // Navigate if we have a route
    if (route) {
      // Call parent callback for analytics/tracking only - NOT for navigation
      if (onActionClick) {
        onActionClick(step.id)
      }
      console.log('[VerificationProgress] Calling router.push with route:', route)
      router.push(route)
    } else if (onActionClick) {
      // Fallback: let parent handle navigation if no internal route
      console.log('[VerificationProgress] No route, calling onActionClick')
      onActionClick(step.id)
    }
  }

  const determineDocumentStatus = (statuses: any): VerificationStep['status'] => {
    if (!statuses || Object.keys(statuses).length === 0) {
      return 'NOT_STARTED'
    }

    const statusValues = Object.values(statuses)

    if (statusValues.every(s => s === 'APPROVED')) {
      return 'COMPLETED'
    }

    if (statusValues.some(s => s === 'REJECTED')) {
      return 'FAILED'
    }

    if (statusValues.some(s => s === 'PENDING')) {
      return 'PENDING_REVIEW'
    }

    if (statusValues.some(s => s === 'UPLOADED' || s === 'SUBMITTED')) {
      return 'PENDING_REVIEW'
    }

    return 'IN_PROGRESS'
  }

  const getStatusColor = (status: VerificationStep['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'text-green-600 dark:text-green-400'
      case 'FAILED':
        return 'text-red-600 dark:text-red-400'
      case 'IN_PROGRESS':
      case 'PENDING_REVIEW':
        return 'text-blue-600 dark:text-blue-400'
      default:
        return 'text-gray-500 dark:text-gray-400'
    }
  }

  const getStatusLabel = (status: VerificationStep['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'Completed'
      case 'FAILED':
        return 'Action Required'
      case 'IN_PROGRESS':
        return 'In Progress'
      case 'PENDING_REVIEW':
        return 'Under Review'
      default:
        return 'Not Started'
    }
  }

  if (loading || !carsFetched || !profileFetched) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3, 4].map(i => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-800 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Verification Progress
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Complete all steps to start accepting bookings
        </p>
      </div>

      {/* Progress Bar */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-700 dark:text-gray-300">
            {progress}% Complete
          </span>
          <span className="text-xs text-gray-500 dark:text-gray-400">
            {steps.filter(s => s.status === 'COMPLETED').length} of {steps.length} steps
          </span>
        </div>
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2 overflow-hidden">
          <div 
            className="bg-gradient-to-r from-purple-500 to-purple-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const isLastStep = index === steps.length - 1
          
          return (
            <div key={step.id} className="relative">
              {/* Connecting Line */}
              {!isLastStep && (
                <div className="absolute left-3 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -mb-4" />
              )}
              
              {/* Step Card - Fully Clickable */}
              <button
                onClick={() => handleStepClick(step)}
                className={`group relative rounded-lg p-4 border shadow-md hover:shadow-lg transition-all w-full text-left cursor-pointer
                  hover:border-purple-400 dark:hover:border-purple-600
                  ${
                    step.status === 'FAILED'
                      ? 'border-red-300 bg-red-50 dark:bg-red-900 dark:border-red-700'
                      : step.status === 'COMPLETED'
                      ? 'border-green-300 bg-green-50 dark:bg-green-900 dark:border-green-700'
                      : step.status === 'IN_PROGRESS' || step.status === 'PENDING_REVIEW'
                      ? 'border-blue-300 bg-blue-50 dark:bg-blue-900 dark:border-blue-700'
                      : 'border-gray-200 bg-gray-50 dark:bg-gray-800 dark:border-gray-600'
                  }`}
              >
                <div className="flex items-start gap-4">
                  {/* Status Icon / Step Number */}
                  <div className="flex-shrink-0 relative z-10">
                    {step.status === 'COMPLETED' ? (
                      <IoCheckmarkCircle className="w-6 h-6 text-green-500" />
                    ) : step.status === 'FAILED' ? (
                      <IoCloseCircle className="w-6 h-6 text-red-500" />
                    ) : step.status === 'IN_PROGRESS' || step.status === 'PENDING_REVIEW' ? (
                      <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                    ) : (
                      <div className="w-6 h-6 bg-gray-400 rounded-full flex items-center justify-center text-sm font-semibold text-white">
                        {index + 1}
                      </div>
                    )}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <div className="flex-1">
                        <h4 className="font-semibold text-gray-900 dark:text-white">
                          {step.title}
                        </h4>

                        {/* Tier Display for Insurance Step */}
                        {step.id === 'insurance_tier' && step.tierInfo && (
                          <div className="mt-1">
                            <span className={`text-sm font-semibold ${
                              step.tierInfo.tier === 'BASIC'
                                ? 'text-green-600 dark:text-green-400'
                                : step.tierInfo.tier === 'STANDARD'
                                ? 'text-purple-600 dark:text-purple-400'
                                : 'text-yellow-600 dark:text-yellow-400'
                            }`}>
                              {step.tierInfo.tier} ({step.tierInfo.percentage}%)
                            </span>
                          </div>
                        )}

                        {/* Not Selected Display */}
                        {step.id === 'insurance_tier' && !step.tierInfo && step.status !== 'COMPLETED' && (
                          <div className="mt-1">
                            <span className="text-sm text-gray-500 dark:text-gray-400">
                              Not selected
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`text-xs font-medium whitespace-nowrap ${getStatusColor(step.status)}`}>
                          {getStatusLabel(step.status)}
                        </span>

                        {/* Arrow Icon - Indicates clickable */}
                        <IoChevronForwardOutline
                          className="w-4 h-4 text-gray-400 group-hover:text-purple-600 dark:group-hover:text-purple-400 transition-colors"
                        />
                      </div>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {step.description}
                    </p>

                    {/* Estimated Time */}
                    {step.estimatedTime && step.status !== 'COMPLETED' && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                        <IoTimeOutline className="w-3.5 h-3.5" />
                        <span>Est. {step.estimatedTime}</span>
                      </div>
                    )}
                  </div>
                </div>
              </button>
            </div>
          )
        })}
      </div>

      {/* Approval Status Message */}
      {approvalStatus === 'APPROVED' && progress === 100 && (
        <div className="mt-6 p-4 bg-green-50 dark:bg-green-900/20 border border-green-200 dark:border-green-800 rounded-lg">
          <div className="flex items-start gap-3">
            <IoCheckmarkCircle className="w-6 h-6 text-green-600 dark:text-green-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-green-900 dark:text-green-100 mb-1">
                You're All Set!
              </h4>
              <p className="text-sm text-green-700 dark:text-green-300">
                Your host account is fully verified. You can now list your vehicles and start earning!
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Review Message - Show when not all steps complete */}
      {progress < 100 && (
        <div className="mt-6 p-4 bg-gray-50 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-600 dark:text-gray-400">
            <IoInformationCircleOutline className="w-5 h-5 flex-shrink-0" />
            <span>Your account will be reviewed once all steps are completed</span>
          </div>
        </div>
      )}


      {/* Pending Actions Alert */}
      {pendingActions && pendingActions.length > 0 && !hasIncompleteCar && (
        <div className="mt-6 p-4 bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg">
          <div className="flex items-start gap-3">
            <IoTimeOutline className="w-5 h-5 text-yellow-600 dark:text-yellow-400 flex-shrink-0 mt-0.5" />
            <div>
              <h4 className="font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                Action Required
              </h4>
              <p className="text-sm text-yellow-700 dark:text-yellow-300 mb-2">
                Please complete the following actions to continue your verification:
              </p>
              <ul className="text-sm text-yellow-700 dark:text-yellow-300 space-y-1">
                {pendingActions.map((action, index) => (
                  <li key={index}>• {action.replace(/_/g, ' ').toLowerCase()}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}