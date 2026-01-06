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
  IoInformationCircleOutline,
  IoPersonOutline,
  IoLockClosedOutline,
  IoSparkles,
  IoRocketOutline
} from 'react-icons/io5'

interface VerificationStep {
  id: string
  title: string
  description: string
  status: 'NOT_STARTED' | 'IN_PROGRESS' | 'COMPLETED' | 'FAILED' | 'PENDING_REVIEW' | 'LOCKED'
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
  hasIncompleteCar?: boolean
  incompleteCarId?: string
  onActionClick?: (stepId: string) => void
  managesOwnCars?: boolean  // If false, hide vehicle-related steps (manage-only fleet managers)
}

// Helper to check car completion
function isCarComplete(car: CarData): boolean {
  const hasPhotos = car.photoCount >= 6
  const hasVin = car.vin && car.vin.length >= 17
  const hasLicensePlate = car.licensePlate && car.licensePlate.length >= 2
  const hasPricing = car.dailyRate && car.dailyRate > 0

  return hasPhotos && hasVin && hasLicensePlate && hasPricing
}

// Get step-specific icon
function getStepIcon(stepId: string) {
  switch (stepId) {
    case 'profile':
      return IoPersonOutline
    case 'documents':
      return IoDocumentTextOutline
    case 'vehicle':
      return IoCarSportOutline
    case 'bank_account':
      return IoCardOutline
    case 'insurance_tier':
      return IoShieldCheckmarkOutline
    default:
      return IoDocumentTextOutline
  }
}

// Get status-specific card styles
function getCardStyles(status: VerificationStep['status']) {
  switch (status) {
    case 'COMPLETED':
      return {
        container: 'border-l-4 border-l-emerald-500 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40',
        iconBg: 'bg-emerald-100 dark:bg-emerald-900/50',
        iconColor: 'text-emerald-600 dark:text-emerald-400',
        textMuted: true
      }
    case 'FAILED':
      return {
        container: 'border-l-4 border-l-red-500 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800/40',
        iconBg: 'bg-red-100 dark:bg-red-900/50',
        iconColor: 'text-red-600 dark:text-red-400',
        textMuted: false
      }
    case 'PENDING_REVIEW':
      return {
        container: 'border-l-4 border-l-amber-500 bg-amber-50 dark:bg-amber-900/20 border border-amber-200 dark:border-amber-800/40',
        iconBg: 'bg-amber-100 dark:bg-amber-900/50',
        iconColor: 'text-amber-600 dark:text-amber-400',
        textMuted: false
      }
    case 'IN_PROGRESS':
      return {
        container: 'border-l-4 border-l-blue-500 bg-blue-50 dark:bg-blue-900/20 border border-blue-200 dark:border-blue-800/40',
        iconBg: 'bg-blue-100 dark:bg-blue-900/50',
        iconColor: 'text-blue-600 dark:text-blue-400',
        textMuted: false
      }
    case 'LOCKED':
      return {
        container: 'border-l-4 border-l-gray-300 dark:border-l-gray-600 bg-gray-100 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 opacity-60',
        iconBg: 'bg-gray-200 dark:bg-gray-700',
        iconColor: 'text-gray-400 dark:text-gray-500',
        textMuted: true
      }
    default: // NOT_STARTED
      return {
        container: 'border-l-4 border-l-gray-300 dark:border-l-gray-600 bg-white dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700',
        iconBg: 'bg-gray-100 dark:bg-gray-700',
        iconColor: 'text-gray-500 dark:text-gray-400',
        textMuted: false
      }
  }
}

// Get status badge component
function StatusBadge({ status }: { status: VerificationStep['status'] }) {
  switch (status) {
    case 'COMPLETED':
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300 rounded-full text-xs font-medium">
          <IoCheckmarkCircle className="w-3.5 h-3.5" />
          <span>Done</span>
        </div>
      )
    case 'FAILED':
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-red-100 dark:bg-red-900/50 text-red-700 dark:text-red-300 rounded-full text-xs font-medium animate-pulse">
          <IoCloseCircle className="w-3.5 h-3.5" />
          <span>Fix Required</span>
        </div>
      )
    case 'PENDING_REVIEW':
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300 rounded-full text-xs font-medium">
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-500 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
          </span>
          <span>Under Review</span>
        </div>
      )
    case 'IN_PROGRESS':
      return (
        <div className="flex items-center gap-1 px-2.5 py-1 bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 rounded-full text-xs font-medium">
          <span>Continue</span>
          <IoChevronForwardOutline className="w-3 h-3" />
        </div>
      )
    case 'LOCKED':
      return (
        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-500 dark:text-gray-400 rounded-full text-xs font-medium">
          <IoLockClosedOutline className="w-3 h-3" />
          <span>Locked</span>
        </div>
      )
    default: // NOT_STARTED
      return (
        <div className="flex items-center gap-1 px-2.5 py-1 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-300 rounded-full text-xs font-medium group-hover:bg-purple-100 dark:group-hover:bg-purple-900/50 group-hover:text-purple-700 dark:group-hover:text-purple-300 transition-colors">
          <span>Start</span>
          <IoChevronForwardOutline className="w-3 h-3 transition-transform group-hover:translate-x-0.5" />
        </div>
      )
  }
}

// Progress bar gradient based on progress
function getProgressGradient(progress: number) {
  if (progress >= 80) return 'from-emerald-500 via-emerald-400 to-green-400'
  if (progress >= 60) return 'from-green-500 via-amber-400 to-amber-500'
  if (progress >= 40) return 'from-amber-500 via-amber-400 to-yellow-400'
  if (progress >= 20) return 'from-blue-500 via-blue-400 to-cyan-400'
  return 'from-gray-400 via-gray-300 to-blue-400'
}

// Motivational message based on progress
function getMotivationalMessage(progress: number, completedSteps: number, totalSteps: number) {
  if (progress === 100) return { icon: IoCheckmarkCircle, iconColor: 'text-emerald-500', text: "You're all set! Ready to start earning." }
  if (progress >= 80) return { icon: IoRocketOutline, iconColor: 'text-purple-500', text: "Almost there! Just a few more steps." }
  if (progress >= 60) return { icon: IoSparkles, iconColor: 'text-amber-500', text: "Great momentum! Keep going." }
  if (progress >= 40) return { icon: IoCheckmarkCircle, iconColor: 'text-blue-500', text: "Nice progress! You're halfway there." }
  if (progress >= 20) return { icon: IoRocketOutline, iconColor: 'text-blue-500', text: "Good start! Let's keep moving." }
  return { icon: IoPersonOutline, iconColor: 'text-gray-500', text: "Welcome! Let's get your account set up." }
}

export default function VerificationProgress({
  hostId,
  approvalStatus,
  documentStatuses = {},
  backgroundCheckStatus = 'NOT_STARTED',
  pendingActions = [],
  hasIncompleteCar: hasIncompleteCarProp,
  incompleteCarId: incompleteCarIdProp,
  onActionClick,
  managesOwnCars = true  // Default to true for backwards compatibility
}: VerificationProgressProps) {
  const router = useRouter()
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<VerificationStep[]>([])
  const [loading, setLoading] = useState(true)

  const [hasIncompleteCar, setHasIncompleteCar] = useState(false)
  const [incompleteCarId, setIncompleteCarId] = useState<string | null>(null)
  const [carsFetched, setCarsFetched] = useState(false)
  const [cars, setCars] = useState<any[]>([])

  const [profileData, setProfileData] = useState<{
    name?: string
    phone?: string
    bio?: string
    profilePhoto?: string
    photoIdUrls?: { front?: string; back?: string; info?: string; lastPage?: string } | null
    photoIdVerified?: boolean
    photoIdSubmittedAt?: string | null
    photoIdRejected?: boolean
  } | null>(null)
  const [profileFetched, setProfileFetched] = useState(false)

  // Fetch cars
  useEffect(() => {
    const fetchCars = async () => {
      try {
        const response = await fetch(`/api/host/cars?hostId=${hostId}`, {
          credentials: 'include'
        })

        if (response.ok) {
          const data = await response.json()
          const carsData = data.cars || data.data || []
          setCars(carsData)

          if (carsData.length > 0) {
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
            setHasIncompleteCar(true)
            setIncompleteCarId(null)
          }
        }
      } catch (error) {
        console.error('Error fetching cars:', error)
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

  // Fetch profile
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
            profilePhoto: profile.profilePhoto || profile.image,
            photoIdUrls: profile.photoIdUrls,
            photoIdVerified: profile.photoIdVerified,
            photoIdSubmittedAt: profile.photoIdSubmittedAt,
            photoIdRejected: profile.photoIdRejected
          })
        } else {
          setProfileData(null)
        }
      } catch (error) {
        console.error('Error fetching profile:', error)
        setProfileData(null)
      } finally {
        setProfileFetched(true)
      }
    }

    fetchProfile()
  }, [])

  // Build steps
  useEffect(() => {
    if (!carsFetched || !profileFetched) return
    buildVerificationSteps()
  }, [carsFetched, profileFetched, hasIncompleteCar, incompleteCarId, cars, approvalStatus, backgroundCheckStatus, documentStatuses, profileData, managesOwnCars])

  const checkInsuranceTierSelected = async (): Promise<{ selected: boolean; tier: 'BASIC' | 'STANDARD' | 'PREMIUM' | null; percentage: number }> => {
    try {
      const response = await fetch(`/api/host/profile`, { credentials: 'include' })

      if (response.ok) {
        const data = await response.json()
        const profile = data.profile

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

  const determinePhotoIdStatus = (): VerificationStep['status'] => {
    const photoIdUrls = profileData?.photoIdUrls
    const photoIdVerified = profileData?.photoIdVerified
    const photoIdSubmittedAt = profileData?.photoIdSubmittedAt
    const photoIdRejected = profileData?.photoIdRejected

    if (photoIdVerified) return 'COMPLETED'
    if (photoIdRejected) return 'FAILED'
    if (!photoIdUrls || (typeof photoIdUrls === 'object' && Object.keys(photoIdUrls).length === 0)) {
      return 'NOT_STARTED'
    }

    const hasFront = !!(photoIdUrls.front)
    const hasBack = !!(photoIdUrls.back)

    if (hasFront && hasBack) {
      if (photoIdSubmittedAt) return 'PENDING_REVIEW'
      return 'IN_PROGRESS'
    }

    if (hasFront || hasBack) return 'IN_PROGRESS'
    return 'NOT_STARTED'
  }

  const buildVerificationSteps = async () => {
    try {
      setLoading(true)
      const verificationSteps: VerificationStep[] = []

      const photoIdUrls = profileData?.photoIdUrls
      const hasPhotoIdUploaded = !!(photoIdUrls && photoIdUrls.front && photoIdUrls.back)

      const isProfileComplete = !!(
        profileData?.name &&
        profileData?.bio && profileData.bio.length > 0 &&
        profileData?.profilePhoto &&
        hasPhotoIdUploaded
      )

      verificationSteps.push({
        id: 'profile',
        title: 'Complete Your Profile',
        description: hasPhotoIdUploaded
          ? 'Add your bio, profile photo, and basic information'
          : 'Add your bio and profile photo',
        status: isProfileComplete ? 'COMPLETED' : 'IN_PROGRESS',
        icon: IoPersonOutline,
        actionUrl: !isProfileComplete ? '/host/profile?tab=profile' : undefined,
        actionLabel: 'Complete Profile',
        priority: 'HIGH'
      })

      const docsStatus = determinePhotoIdStatus()
      verificationSteps.push({
        id: 'documents',
        title: 'Verify Your Identity',
        description: docsStatus === 'COMPLETED'
          ? 'Identity verified'
          : docsStatus === 'FAILED'
          ? 'Verification failed - please re-upload'
          : docsStatus === 'PENDING_REVIEW'
          ? 'Identity verification in progress'
          : 'Upload Photo ID to verify your identity',
        status: docsStatus,
        icon: IoDocumentTextOutline,
        actionUrl: docsStatus !== 'COMPLETED' ? '/host/profile?tab=documents' : undefined,
        actionLabel: docsStatus === 'FAILED' ? 'Re-upload ID' : 'Verify Identity',
        estimatedTime: '5 min',
        priority: 'HIGH'
      })

      // Only show vehicle step for hosts who manage their own cars (not manage-only fleet managers)
      if (managesOwnCars !== false) {
        const vehicleStatus = hasIncompleteCar ? 'IN_PROGRESS' : 'COMPLETED'
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
            : 'Your vehicle listing is complete',
          status: vehicleStatus,
          icon: IoCarSportOutline,
          actionUrl: vehicleEditUrl,
          actionLabel: 'Complete Listing',
          estimatedTime: '10 min',
          priority: 'HIGH'
        })
      }

      const isHostApproved = approvalStatus === 'APPROVED'
      verificationSteps.push({
        id: 'bank_account',
        title: 'Connect Bank Account',
        description: isHostApproved
          ? 'Add your payout method to receive earnings'
          : 'Available after identity verification',
        status: isHostApproved ? 'NOT_STARTED' : 'LOCKED',
        icon: IoCardOutline,
        actionUrl: isHostApproved ? '/host/profile?tab=banking' : undefined,
        actionLabel: isHostApproved ? 'Add Bank Account' : undefined,
        estimatedTime: isHostApproved ? '3 min' : undefined,
        priority: 'MEDIUM'
      })

      // Only show insurance step for hosts who own their own cars (not manage-only fleet managers)
      if (managesOwnCars !== false) {
        const tierStatus = await checkInsuranceTierSelected()
        verificationSteps.push({
          id: 'insurance_tier',
          title: 'Select Insurance Tier',
          description: tierStatus.selected
            ? 'Your earnings tier is configured'
            : 'Choose your coverage level',
          status: tierStatus.selected ? 'COMPLETED' : 'NOT_STARTED',
          icon: IoShieldCheckmarkOutline,
          actionUrl: '/host/profile?tab=insurance',
          actionLabel: 'Select Tier',
          estimatedTime: '5 min',
          priority: 'HIGH',
          tierInfo: tierStatus.selected ? {
            tier: tierStatus.tier,
            percentage: tierStatus.percentage
          } : undefined
        })
      }

      setSteps(verificationSteps)

      const completedSteps = verificationSteps.filter(s => s.status === 'COMPLETED').length
      const totalSteps = verificationSteps.filter(s => s.status !== 'LOCKED').length
      const progressPercentage = Math.round((completedSteps / totalSteps) * 100)
      setProgress(progressPercentage)

    } catch (error) {
      console.error('Error building verification steps:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStepClick = (step: VerificationStep) => {
    if (step.status === 'LOCKED') return

    let route = ''

    switch (step.id) {
      case 'profile':
        route = '/host/profile?tab=profile'
        break
      case 'documents':
        route = '/host/profile?tab=documents'
        break
      case 'vehicle':
        const carId = incompleteCarId || incompleteCarIdProp || cars[0]?.id
        if (carId) {
          route = `/host/cars/${carId}/edit`
        } else {
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
        if (step.actionUrl) {
          route = step.actionUrl
        }
        break
    }

    if (route) {
      if (onActionClick) {
        onActionClick(step.id)
      }
      router.push(route)
    } else if (onActionClick) {
      onActionClick(step.id)
    }
  }

  if (loading || !carsFetched || !profileFetched) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm p-6">
        <div className="animate-pulse space-y-6">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 bg-gray-200 dark:bg-gray-700 rounded-lg"></div>
            <div className="space-y-2 flex-1">
              <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
              <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
            </div>
          </div>
          <div className="h-2.5 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-2.5">
            {[1, 2, 3, 4, 5].map(i => (
              <div key={i} className="h-20 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const completedSteps = steps.filter(s => s.status === 'COMPLETED').length
  const totalSteps = steps.filter(s => s.status !== 'LOCKED').length
  const motivational = getMotivationalMessage(progress, completedSteps, totalSteps)

  return (
    <div className="bg-white dark:bg-gray-900 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm overflow-hidden">
      {/* Header */}
      <div className="px-5 py-5 sm:px-6 sm:py-6 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-purple-600 flex items-center justify-center">
            <IoRocketOutline className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
              Get Started
            </h3>
            <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-1.5">
              <motivational.icon className={`w-4 h-4 ${motivational.iconColor}`} />
              <span>{motivational.text}</span>
            </p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="space-y-2">
          <div className="flex items-center justify-between text-sm">
            <span className="font-semibold text-gray-900 dark:text-white">
              {progress}% Complete
            </span>
            <span className="text-gray-500 dark:text-gray-400 flex items-center gap-1">
              <IoCheckmarkCircle className="w-4 h-4 text-emerald-500" />
              {completedSteps} of {totalSteps} steps
            </span>
          </div>

          <div className="relative">
            {/* Background track */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded h-2.5 overflow-hidden">
              {/* Progress fill */}
              <div
                className={`bg-gradient-to-r ${getProgressGradient(progress)} h-2.5 rounded transition-all duration-500 ease-out`}
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Milestone markers */}
            <div className="absolute top-0 left-0 right-0 h-2.5 flex items-center pointer-events-none">
              {[25, 50, 75].map((milestone) => (
                <div
                  key={milestone}
                  className="absolute h-2.5 w-px bg-white/40 dark:bg-gray-600/60"
                  style={{ left: `${milestone}%` }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Steps List */}
      <div className="p-4 sm:p-5 space-y-2.5">
        {steps.map((step, index) => {
          const styles = getCardStyles(step.status)
          const StepIcon = getStepIcon(step.id)
          const isLocked = step.status === 'LOCKED'

          return (
            <button
              key={step.id}
              onClick={() => handleStepClick(step)}
              disabled={isLocked}
              className={`group relative w-full text-left rounded-lg p-4 transition-all duration-150
                ${styles.container}
                ${!isLocked ? 'hover:shadow-md cursor-pointer' : 'cursor-not-allowed'}
              `}
            >
              <div className="flex items-start gap-3.5">
                {/* Icon Box */}
                <div className={`flex-shrink-0 w-10 h-10 rounded-lg ${styles.iconBg} flex items-center justify-center`}>
                  {step.status === 'COMPLETED' ? (
                    <IoCheckmarkCircle className="w-5 h-5 text-emerald-500" />
                  ) : step.status === 'FAILED' ? (
                    <IoCloseCircle className="w-5 h-5 text-red-500" />
                  ) : isLocked ? (
                    <IoLockClosedOutline className={`w-5 h-5 ${styles.iconColor}`} />
                  ) : (
                    <StepIcon className={`w-5 h-5 ${styles.iconColor}`} />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <h4 className={`font-semibold text-gray-900 dark:text-white ${styles.textMuted ? 'opacity-70' : ''}`}>
                        {step.title}
                      </h4>

                      {/* Tier Badge for Insurance */}
                      {step.id === 'insurance_tier' && step.tierInfo && (
                        <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-md text-xs font-medium ${
                          step.tierInfo.tier === 'PREMIUM'
                            ? 'bg-amber-100 dark:bg-amber-900/50 text-amber-700 dark:text-amber-300'
                            : step.tierInfo.tier === 'STANDARD'
                            ? 'bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300'
                            : 'bg-emerald-100 dark:bg-emerald-900/50 text-emerald-700 dark:text-emerald-300'
                        }`}>
                          {step.tierInfo.tier} Tier - {step.tierInfo.percentage}%
                        </span>
                      )}
                    </div>

                    {/* Status Badge */}
                    <StatusBadge status={step.status} />
                  </div>

                  <p className={`text-sm mt-1 ${styles.textMuted ? 'text-gray-400 dark:text-gray-500' : 'text-gray-600 dark:text-gray-400'}`}>
                    {step.description}
                  </p>

                  {/* Estimated Time */}
                  {step.estimatedTime && step.status !== 'COMPLETED' && step.status !== 'LOCKED' && (
                    <div className="flex items-center gap-1 mt-2 text-xs text-gray-400 dark:text-gray-500">
                      <IoTimeOutline className="w-3.5 h-3.5" />
                      <span>Est. {step.estimatedTime}</span>
                    </div>
                  )}
                </div>

                {/* Arrow for non-completed, non-locked steps */}
                {step.status !== 'COMPLETED' && !isLocked && (
                  <IoChevronForwardOutline className="w-5 h-5 text-gray-300 dark:text-gray-600 flex-shrink-0 transition-transform duration-200 group-hover:translate-x-1 group-hover:text-purple-500 dark:group-hover:text-purple-400" />
                )}
              </div>
            </button>
          )
        })}
      </div>

      {/* Footer Message */}
      {progress === 100 ? (
        <div className="mx-4 mb-4 sm:mx-5 sm:mb-5 p-4 bg-emerald-50 dark:bg-emerald-900/20 border border-emerald-200 dark:border-emerald-800/40 rounded-lg">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-emerald-100 dark:bg-emerald-900/50 flex items-center justify-center">
              <IoCheckmarkCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <h4 className="font-semibold text-emerald-900 dark:text-emerald-100">
                Verification Complete
              </h4>
              <p className="text-sm text-emerald-700 dark:text-emerald-300">
                {managesOwnCars === false
                  ? "Your account is ready. Start managing vehicles and earning commissions."
                  : "Your account is ready. Start listing your vehicles and earn."
                }
              </p>
            </div>
          </div>
        </div>
      ) : (
        <div className="mx-4 mb-4 sm:mx-5 sm:mb-5 p-3 bg-gray-50 dark:bg-gray-800/50 border border-gray-200 dark:border-gray-700 rounded-lg">
          <div className="flex items-center justify-center gap-2 text-sm text-gray-500 dark:text-gray-400">
            <IoInformationCircleOutline className="w-4 h-4 flex-shrink-0" />
            <span>
              {managesOwnCars === false
                ? "Complete all steps to activate your fleet manager account"
                : "Complete all steps to activate your host account"
              }
            </span>
          </div>
        </div>
      )}

    </div>
  )
}
