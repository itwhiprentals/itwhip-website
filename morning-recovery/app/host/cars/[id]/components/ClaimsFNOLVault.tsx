// app/host/cars/[id]/components/ClaimsFNOLVault.tsx

'use client'

import { useState, useEffect } from 'react'
import Image from 'next/image'
import { 
  IoAlertCircleOutline,
  IoLocationOutline,
  IoDocumentTextOutline,
  IoImagesOutline,
  IoCalendarOutline,
  IoShieldCheckmarkOutline,
  IoWarningOutline,
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoCarOutline,
  IoPersonOutline,
  IoCloudyOutline,
  IoRainyOutline,
  IoSpeedometerOutline,
  IoCloseOutline,
  IoChevronForwardOutline,
  IoCallOutline,
  IoMailOutline,
  IoNavigateOutline,
  IoBusinessOutline,
  IoMedicalOutline,
  IoEyeOutline,
  IoTimerOutline,
  IoCashOutline
} from 'react-icons/io5'

interface Claim {
  id: string
  type: string
  status: string
  incidentDate: string
  description: string
  estimatedCost: number
  approvedAmount?: number
  deductible: number
  
  // FNOL - Incident Location
  incidentAddress?: string
  incidentCity?: string
  incidentState?: string
  incidentZip?: string
  incidentLatitude?: number
  incidentLongitude?: number
  incidentDescription?: string
  
  // FNOL - Conditions
  weatherConditions?: string
  weatherDescription?: string
  roadConditions?: string
  roadDescription?: string
  estimatedSpeed?: number
  trafficConditions?: string
  
  // FNOL - Police Report
  wasPoliceContacted: boolean
  policeReportNumber?: string
  policeDepartment?: string
  officerName?: string
  officerBadge?: string
  policeReportFiled: boolean
  policeReportDate?: string
  
  // FNOL - Vehicle Condition
  odometerAtIncident?: number
  vehicleDrivable: boolean
  vehicleLocation?: string
  
  // FNOL - Other Party
  otherPartyInvolved: boolean
  otherParty?: any
  
  // FNOL - Injuries
  wereInjuries: boolean
  injuries?: any
  
  // FNOL - Witnesses
  witnesses?: any
  
  // Review & Status
  reviewedBy?: string
  reviewedAt?: string
  reviewNotes?: string
  
  // Guest Response
  guestResponseText?: string
  guestResponseDate?: string
  guestResponseDeadline?: string
  guestResponsePhotos?: any
  guestRespondedAt?: string
  accountHoldApplied: boolean
  
  // Vehicle Status
  vehicleDeactivated: boolean
  vehicleReactivatedAt?: string
  vehicleReactivatedBy?: string
  
  // Insurance Routing
  primaryParty?: string
  severity?: string
  lockedCarState?: string
  submittedToInsurerAt?: string
  insurerClaimId?: string
  insurerStatus?: string
  
  // Photos
  damagePhotos: Array<{
    id: string
    url: string
    caption?: string
    uploadedBy: string
    uploadedAt: string
  }>
  
  // Booking Info
  booking: {
    id: string
    bookingCode: string
    startDate: string
    endDate: string
    guestName?: string
    guestEmail?: string
    guestPhone?: string
  }
  
  // Host Info
  host: {
    id: string
    name: string
    email: string
  }
  
  // Timestamps
  createdAt: string
  updatedAt: string
  resolvedAt?: string
}

interface ClaimsFNOLVaultProps {
  carId: string
}

export default function ClaimsFNOLVault({ carId }: ClaimsFNOLVaultProps) {
  const [claims, setClaims] = useState<Claim[]>([])
  const [statistics, setStatistics] = useState<any>(null)
  const [loading, setLoading] = useState(true)
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null)
  const [filter, setFilter] = useState<'all' | 'active' | 'resolved'>('all')
  const [selectedPhotoIndex, setSelectedPhotoIndex] = useState(0)

  useEffect(() => {
    fetchClaims()
  }, [carId, filter])

  const fetchClaims = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/host/cars/${carId}/claims?filter=${filter}`)
      if (response.ok) {
        const data = await response.json()
        setClaims(data.claims || [])
        setStatistics(data.statistics || null)
      }
    } catch (error) {
      console.error('Error fetching claims:', error)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'PENDING': 'bg-yellow-100 dark:bg-yellow-900/20 text-yellow-800 dark:text-yellow-400 border-yellow-200 dark:border-yellow-800',
      'UNDER_REVIEW': 'bg-blue-100 dark:bg-blue-900/20 text-blue-800 dark:text-blue-400 border-blue-200 dark:border-blue-800',
      'APPROVED': 'bg-green-100 dark:bg-green-900/20 text-green-800 dark:text-green-400 border-green-200 dark:border-green-800',
      'DENIED': 'bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 border-red-200 dark:border-red-800',
      'PAID': 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-800 dark:text-emerald-400 border-emerald-200 dark:border-emerald-800',
      'RESOLVED': 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600',
      'GUEST_RESPONSE_PENDING': 'bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 border-orange-200 dark:border-orange-800',
      'GUEST_RESPONDED': 'bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 border-purple-200 dark:border-purple-800'
    }
    return colors[status] || 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-gray-300 border-gray-200 dark:border-gray-600'
  }

  const getClaimTypeIcon = (type: string) => {
    const icons: Record<string, any> = {
      'ACCIDENT': IoAlertCircleOutline,
      'THEFT': IoShieldCheckmarkOutline,
      'VANDALISM': IoWarningOutline,
      'WEATHER': IoCloudyOutline,
      'MECHANICAL': IoCarOutline,
      'CLEANING': IoDocumentTextOutline
    }
    const Icon = icons[type] || IoDocumentTextOutline
    return <Icon className="h-5 w-5" />
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  const formatDateTime = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    })
  }

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="animate-pulse space-y-3">
          <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
          <div className="h-24 bg-gray-200 dark:bg-gray-700 rounded"></div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-3 md:space-y-4">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-4 md:p-6 border border-gray-200 dark:border-gray-700">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3 mb-3 md:mb-4">
          <div className="flex items-center gap-2 md:gap-3">
            <div className="p-1.5 md:p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <IoAlertCircleOutline className="h-4 w-4 md:h-5 md:w-5 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <h2 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white">Claims FNOL Vault</h2>
              <p className="text-xs text-gray-600 dark:text-gray-400">Complete First Notice of Loss documentation</p>
            </div>
          </div>
          
          {/* Filter Tabs */}
          <div className="flex gap-1.5 md:gap-2">
            {['all', 'active', 'resolved'].map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f as any)}
                className={`px-3 py-1.5 md:px-4 md:py-2 rounded-lg text-xs md:text-sm font-medium transition-colors ${
                  filter === f
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Stats */}
        {statistics && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3">
            <div className="p-2.5 md:p-3 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <div className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">{statistics.total}</div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Claims</div>
            </div>
            <div className="p-2.5 md:p-3 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
              <div className="text-lg md:text-2xl font-bold text-yellow-600 dark:text-yellow-400">
                {statistics.active}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Active</div>
            </div>
            <div className="p-2.5 md:p-3 bg-green-50 dark:bg-green-900/20 rounded-lg">
              <div className="text-lg md:text-2xl font-bold text-green-600 dark:text-green-400">
                {statistics.resolved}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Resolved</div>
            </div>
            <div className="p-2.5 md:p-3 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
              <div className="text-lg md:text-2xl font-bold text-blue-600 dark:text-blue-400">
                {formatCurrency(statistics.totalApproved)}
              </div>
              <div className="text-xs text-gray-600 dark:text-gray-400">Total Approved</div>
            </div>
          </div>
        )}
      </div>

      {/* Claims List */}
      {claims.length === 0 ? (
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-sm p-8 md:p-12 border border-gray-200 dark:border-gray-700 text-center">
          <IoCheckmarkCircleOutline className="h-12 w-12 md:h-16 md:w-16 text-green-500 mx-auto mb-3 md:mb-4" />
          <h3 className="text-base md:text-lg font-semibold text-gray-900 dark:text-white mb-1.5 md:mb-2">No Claims on Record</h3>
          <p className="text-sm text-gray-600 dark:text-gray-400">This vehicle has a clean claims history</p>
        </div>
      ) : (
        <div className="space-y-3 md:space-y-4">
          {claims.map((claim) => (
            <div
              key={claim.id}
              className="bg-white dark:bg-gray-800 rounded-lg shadow-sm border border-gray-200 dark:border-gray-700 hover:shadow-md transition-shadow cursor-pointer"
              onClick={() => {
                setSelectedClaim(claim)
                setSelectedPhotoIndex(0)
              }}
            >
              <div className="p-4 md:p-6">
                {/* Claim Header */}
                <div className="flex items-start justify-between mb-3 md:mb-4">
                  <div className="flex items-center gap-2 md:gap-3">
                    <div className="p-1.5 md:p-2 bg-gray-100 dark:bg-gray-700 rounded-lg">
                      {getClaimTypeIcon(claim.type)}
                    </div>
                    <div>
                      <div className="flex items-center gap-1.5 md:gap-2 flex-wrap">
                        <h3 className="text-sm md:text-base font-semibold text-gray-900 dark:text-white">
                          {claim.type.replace(/_/g, ' ')}
                        </h3>
                        <span className={`px-1.5 py-0.5 md:px-2 md:py-1 rounded-full text-xs font-medium border ${getStatusColor(claim.status)}`}>
                          {claim.status.replace(/_/g, ' ')}
                        </span>
                      </div>
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-0.5">
                        Booking: {claim.booking.bookingCode}
                      </p>
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-base md:text-lg font-bold text-gray-900 dark:text-white">
                      {formatCurrency(claim.approvedAmount || claim.estimatedCost)}
                    </div>
                    <div className="text-xs text-gray-600 dark:text-gray-400">
                      {claim.approvedAmount ? 'Approved' : 'Estimated'}
                    </div>
                  </div>
                </div>

                {/* Incident Details Grid */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 md:gap-3 mb-3 md:mb-4">
                  {/* Date */}
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <IoCalendarOutline className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Incident Date</div>
                      <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                        {formatDate(claim.incidentDate)}
                      </div>
                    </div>
                  </div>

                  {/* Location */}
                  {claim.incidentCity && (
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <IoLocationOutline className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Location</div>
                        <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {claim.incidentCity}, {claim.incidentState}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Police Report */}
                  {claim.wasPoliceContacted && (
                    <div className="flex items-center gap-1.5 md:gap-2">
                      <IoShieldCheckmarkOutline className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                      <div className="min-w-0">
                        <div className="text-xs text-gray-500 dark:text-gray-400">Police Report</div>
                        <div className="text-xs md:text-sm font-medium text-gray-900 dark:text-white truncate">
                          {claim.policeReportNumber || 'Filed'}
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Drivable Status */}
                  <div className="flex items-center gap-1.5 md:gap-2">
                    <IoCarOutline className="h-3 w-3 md:h-4 md:w-4 text-gray-400 flex-shrink-0" />
                    <div className="min-w-0">
                      <div className="text-xs text-gray-500 dark:text-gray-400">Vehicle Status</div>
                      <div className={`text-xs md:text-sm font-medium truncate ${claim.vehicleDrivable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {claim.vehicleDrivable ? 'Drivable' : 'Not Drivable'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Description */}
                <p className="text-xs md:text-sm text-gray-700 dark:text-gray-300 mb-3 md:mb-4 line-clamp-2">
                  {claim.description}
                </p>

                {/* Photos Preview */}
                {claim.damagePhotos.length > 0 && (
                  <div className="flex items-center gap-1.5 md:gap-2 mb-3 md:mb-4">
                    <IoImagesOutline className="h-3 w-3 md:h-4 md:w-4 text-gray-400" />
                    <span className="text-xs text-gray-600 dark:text-gray-400">
                      {claim.damagePhotos.length} photo{claim.damagePhotos.length !== 1 ? 's' : ''} attached
                    </span>
                  </div>
                )}

                {/* Warnings/Flags */}
                {(claim.otherPartyInvolved || claim.wereInjuries || !claim.vehicleDrivable) && (
                  <div className="flex flex-wrap gap-1.5 md:gap-2">
                    {claim.otherPartyInvolved && (
                      <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-900/20 text-orange-800 dark:text-orange-400 rounded-full text-xs font-medium">
                        Other Party Involved
                      </span>
                    )}
                    {claim.wereInjuries && (
                      <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/20 text-red-800 dark:text-red-400 rounded-full text-xs font-medium">
                        Injuries Reported
                      </span>
                    )}
                    {!claim.vehicleDrivable && (
                      <span className="px-2 py-0.5 bg-purple-100 dark:bg-purple-900/20 text-purple-800 dark:text-purple-400 rounded-full text-xs font-medium">
                        Vehicle Towed
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim Detail Modal */}
      {selectedClaim && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white dark:bg-gray-800 rounded-lg max-w-6xl w-full my-8 max-h-[90vh] overflow-hidden flex flex-col">
            
            {/* Modal Header */}
            <div className="p-4 md:p-6 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between sticky top-0 bg-white dark:bg-gray-800 z-10">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-red-100 dark:bg-red-900/20 rounded-lg">
                  {getClaimTypeIcon(selectedClaim.type)}
                </div>
                <div>
                  <h2 className="text-lg md:text-2xl font-bold text-gray-900 dark:text-white">
                    Complete FNOL Documentation
                  </h2>
                  <p className="text-sm text-gray-600 dark:text-gray-400">
                    Claim ID: {selectedClaim.id.slice(0, 8)}... • {selectedClaim.booking.bookingCode}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setSelectedClaim(null)}
                className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
              >
                <IoCloseOutline className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="p-4 md:p-6 overflow-y-auto flex-1">
              <div className="space-y-6">
                
                {/* Status Banner */}
                <div className={`p-4 rounded-lg border ${getStatusColor(selectedClaim.status)}`}>
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="font-semibold mb-1">Claim Status: {selectedClaim.status.replace(/_/g, ' ')}</p>
                      <p className="text-sm opacity-80">
                        Filed: {formatDateTime(selectedClaim.createdAt)}
                      </p>
                    </div>
                    {selectedClaim.approvedAmount && (
                      <div className="text-right">
                        <p className="text-2xl font-bold">{formatCurrency(selectedClaim.approvedAmount)}</p>
                        <p className="text-sm opacity-80">Approved Amount</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Damage Photos Gallery */}
                {selectedClaim.damagePhotos.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <IoImagesOutline className="h-5 w-5" />
                      Damage Documentation ({selectedClaim.damagePhotos.length} photos)
                    </h3>
                    
                    {/* Main Photo */}
                    <div className="relative h-64 md:h-96 bg-gray-200 dark:bg-gray-800 rounded-lg overflow-hidden mb-3">
                      <Image
                        src={selectedClaim.damagePhotos[selectedPhotoIndex].url}
                        alt="Damage photo"
                        fill
                        className="object-contain"
                      />
                    </div>

                    {/* Thumbnail Strip */}
                    <div className="grid grid-cols-4 md:grid-cols-6 gap-2">
                      {selectedClaim.damagePhotos.map((photo, index) => (
                        <div
                          key={photo.id}
                          onClick={() => setSelectedPhotoIndex(index)}
                          className={`relative h-16 md:h-20 rounded-lg overflow-hidden cursor-pointer border-2 transition-all ${
                            selectedPhotoIndex === index
                              ? 'border-blue-600 ring-2 ring-blue-600 ring-offset-2 dark:ring-offset-gray-800'
                              : 'border-gray-300 dark:border-gray-600 hover:border-blue-400'
                          }`}
                        >
                          <Image
                            src={photo.url}
                            alt={`Thumbnail ${index + 1}`}
                            fill
                            className="object-cover"
                          />
                        </div>
                      ))}
                    </div>

                    {/* Photo Info */}
                    {selectedClaim.damagePhotos[selectedPhotoIndex].caption && (
                      <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                        {selectedClaim.damagePhotos[selectedPhotoIndex].caption}
                      </p>
                    )}
                  </div>
                )}

                {/* Incident Details */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <IoAlertCircleOutline className="h-5 w-5" />
                    Incident Details
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Incident Date & Time</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {formatDateTime(selectedClaim.incidentDate)}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Claim Type</p>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {selectedClaim.type.replace(/_/g, ' ')}
                      </p>
                    </div>

                    {selectedClaim.estimatedCost && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estimated Cost</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(selectedClaim.estimatedCost)}
                        </p>
                      </div>
                    )}

                    {selectedClaim.deductible && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Deductible</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatCurrency(selectedClaim.deductible)}
                        </p>
                      </div>
                    )}

                    {selectedClaim.odometerAtIncident && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Odometer Reading</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedClaim.odometerAtIncident.toLocaleString()} miles
                        </p>
                      </div>
                    )}

                    {selectedClaim.estimatedSpeed && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Estimated Speed</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedClaim.estimatedSpeed} mph
                        </p>
                      </div>
                    )}
                  </div>

                  {selectedClaim.description && (
                    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-600">
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">Description</p>
                      <p className="text-sm text-gray-900 dark:text-white">{selectedClaim.description}</p>
                    </div>
                  )}
                </div>

                {/* Location Details */}
                {selectedClaim.incidentCity && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <IoLocationOutline className="h-5 w-5" />
                      Incident Location
                    </h3>
                    
                    <div className="space-y-3">
                      {selectedClaim.incidentAddress && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Address</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedClaim.incidentAddress}
                            {selectedClaim.incidentCity && `, ${selectedClaim.incidentCity}`}
                            {selectedClaim.incidentState && `, ${selectedClaim.incidentState}`}
                            {selectedClaim.incidentZip && ` ${selectedClaim.incidentZip}`}
                          </p>
                        </div>
                      )}

                      {selectedClaim.incidentDescription && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Location Details</p>
                          <p className="text-sm text-gray-900 dark:text-white">{selectedClaim.incidentDescription}</p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Conditions */}
                {(selectedClaim.weatherConditions || selectedClaim.roadConditions) && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <IoCloudyOutline className="h-5 w-5" />
                      Weather & Road Conditions
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedClaim.weatherConditions && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Weather</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedClaim.weatherConditions}
                          </p>
                          {selectedClaim.weatherDescription && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {selectedClaim.weatherDescription}
                            </p>
                          )}
                        </div>
                      )}

                      {selectedClaim.roadConditions && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Road Conditions</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedClaim.roadConditions}
                          </p>
                          {selectedClaim.roadDescription && (
                            <p className="text-xs text-gray-600 dark:text-gray-400 mt-1">
                              {selectedClaim.roadDescription}
                            </p>
                          )}
                        </div>
                      )}

                      {selectedClaim.trafficConditions && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Traffic</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedClaim.trafficConditions}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Police Report */}
                {selectedClaim.wasPoliceContacted && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <IoShieldCheckmarkOutline className="h-5 w-5" />
                      Police Report
                    </h3>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {selectedClaim.policeReportNumber && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Report Number</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedClaim.policeReportNumber}
                          </p>
                        </div>
                      )}

                      {selectedClaim.policeDepartment && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Department</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedClaim.policeDepartment}
                          </p>
                        </div>
                      )}

                      {selectedClaim.officerName && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Officer Name</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {selectedClaim.officerName}
                            {selectedClaim.officerBadge && ` (Badge: ${selectedClaim.officerBadge})`}
                          </p>
                        </div>
                      )}

                      {selectedClaim.policeReportDate && (
                        <div>
                          <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Report Date</p>
                          <p className="text-sm font-medium text-gray-900 dark:text-white">
                            {formatDateTime(selectedClaim.policeReportDate)}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Other Party */}
                {selectedClaim.otherPartyInvolved && selectedClaim.otherParty && (
                  <div className="bg-orange-50 dark:bg-orange-900/20 rounded-lg p-4 border border-orange-200 dark:border-orange-800">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <IoPersonOutline className="h-5 w-5" />
                      Other Party Involved
                    </h3>
                    
                    <div className="space-y-4">
                      {selectedClaim.otherParty.driver && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Driver Information</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {selectedClaim.otherParty.driver.name && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Name:</span>{' '}
                                <span className="text-gray-900 dark:text-white">{selectedClaim.otherParty.driver.name}</span>
                              </div>
                            )}
                            {selectedClaim.otherParty.driver.phone && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Phone:</span>{' '}
                                <span className="text-gray-900 dark:text-white">{selectedClaim.otherParty.driver.phone}</span>
                              </div>
                            )}
                            {selectedClaim.otherParty.driver.license && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">License:</span>{' '}
                                <span className="text-gray-900 dark:text-white">{selectedClaim.otherParty.driver.license}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedClaim.otherParty.vehicle && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Vehicle Information</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {selectedClaim.otherParty.vehicle.year && selectedClaim.otherParty.vehicle.make && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Vehicle:</span>{' '}
                                <span className="text-gray-900 dark:text-white">
                                  {selectedClaim.otherParty.vehicle.year} {selectedClaim.otherParty.vehicle.make} {selectedClaim.otherParty.vehicle.model}
                                </span>
                              </div>
                            )}
                            {selectedClaim.otherParty.vehicle.plate && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Plate:</span>{' '}
                                <span className="text-gray-900 dark:text-white">{selectedClaim.otherParty.vehicle.plate}</span>
                              </div>
                            )}
                            {selectedClaim.otherParty.vehicle.vin && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">VIN:</span>{' '}
                                <span className="text-gray-900 dark:text-white font-mono text-xs">{selectedClaim.otherParty.vehicle.vin}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}

                      {selectedClaim.otherParty.insurance && (
                        <div>
                          <p className="text-sm font-medium text-gray-900 dark:text-white mb-2">Insurance Information</p>
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                            {selectedClaim.otherParty.insurance.carrier && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Carrier:</span>{' '}
                                <span className="text-gray-900 dark:text-white">{selectedClaim.otherParty.insurance.carrier}</span>
                              </div>
                            )}
                            {selectedClaim.otherParty.insurance.policy && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Policy:</span>{' '}
                                <span className="text-gray-900 dark:text-white">{selectedClaim.otherParty.insurance.policy}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Injuries */}
                {selectedClaim.wereInjuries && selectedClaim.injuries && Array.isArray(selectedClaim.injuries) && selectedClaim.injuries.length > 0 && (
                  <div className="bg-red-50 dark:bg-red-900/20 rounded-lg p-4 border border-red-200 dark:border-red-800">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <IoMedicalOutline className="h-5 w-5" />
                      Injuries Reported
                    </h3>
                    
                    <div className="space-y-3">
                      {selectedClaim.injuries.map((injury: any, index: number) => (
                        <div key={index} className="bg-white dark:bg-gray-800 rounded-lg p-3">
                          <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                            {injury.person && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Person:</span>{' '}
                                <span className="text-gray-900 dark:text-white font-medium">{injury.person}</span>
                              </div>
                            )}
                            {injury.severity && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Severity:</span>{' '}
                                <span className="text-gray-900 dark:text-white font-medium">{injury.severity}</span>
                              </div>
                            )}
                            {injury.description && (
                              <div className="md:col-span-2">
                                <span className="text-gray-500 dark:text-gray-400">Description:</span>{' '}
                                <span className="text-gray-900 dark:text-white">{injury.description}</span>
                              </div>
                            )}
                            {injury.medicalAttention && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Medical Attention:</span>{' '}
                                <span className="text-gray-900 dark:text-white">{injury.medicalAttention}</span>
                              </div>
                            )}
                            {injury.hospital && (
                              <div>
                                <span className="text-gray-500 dark:text-gray-400">Hospital:</span>{' '}
                                <span className="text-gray-900 dark:text-white">{injury.hospital}</span>
                              </div>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Witnesses */}
                {selectedClaim.witnesses && Array.isArray(selectedClaim.witnesses) && selectedClaim.witnesses.length > 0 && (
                  <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                      <IoEyeOutline className="h-5 w-5" />
                      Witnesses
                    </h3>
                    
                    <div className="space-y-3">
                      {selectedClaim.witnesses.map((witness: any, index: number) => (
                        <div key={index} className="flex items-start gap-3 text-sm">
                          <div className="p-2 bg-gray-200 dark:bg-gray-700 rounded-full">
                            <IoPersonOutline className="h-4 w-4" />
                          </div>
                          <div className="flex-1">
                            <p className="font-medium text-gray-900 dark:text-white">{witness.name}</p>
                            {witness.phone && (
                              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                <IoCallOutline className="h-3 w-3" />
                                {witness.phone}
                              </p>
                            )}
                            {witness.email && (
                              <p className="text-gray-600 dark:text-gray-400 flex items-center gap-1 mt-0.5">
                                <IoMailOutline className="h-3 w-3" />
                                {witness.email}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Vehicle Status */}
                <div className="bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
                  <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-3 flex items-center gap-2">
                    <IoCarOutline className="h-5 w-5" />
                    Vehicle Status
                  </h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Drivability</p>
                      <p className={`text-sm font-medium ${selectedClaim.vehicleDrivable ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {selectedClaim.vehicleDrivable ? '✓ Vehicle is drivable' : '✗ Vehicle not drivable'}
                      </p>
                    </div>

                    {!selectedClaim.vehicleDrivable && selectedClaim.vehicleLocation && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Current Location</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {selectedClaim.vehicleLocation}
                        </p>
                      </div>
                    )}

                    <div>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Vehicle Deactivated</p>
                      <p className={`text-sm font-medium ${selectedClaim.vehicleDeactivated ? 'text-orange-600 dark:text-orange-400' : 'text-green-600 dark:text-green-400'}`}>
                        {selectedClaim.vehicleDeactivated ? 'Yes - Pending repair' : 'No - Still active'}
                      </p>
                    </div>

                    {selectedClaim.vehicleReactivatedAt && (
                      <div>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mb-1">Reactivated</p>
                        <p className="text-sm font-medium text-gray-900 dark:text-white">
                          {formatDateTime(selectedClaim.vehicleReactivatedAt)}
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Review Notes */}
                {selectedClaim.reviewNotes && (
                  <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-800">
                    <h3 className="text-base font-semibold text-gray-900 dark:text-white mb-2 flex items-center gap-2">
                      <IoDocumentTextOutline className="h-5 w-5" />
                      Fleet Review Notes
                    </h3>
                    <p className="text-sm text-gray-900 dark:text-white">{selectedClaim.reviewNotes}</p>
                    {selectedClaim.reviewedAt && (
                      <p className="text-xs text-gray-600 dark:text-gray-400 mt-2">
                        Reviewed: {formatDateTime(selectedClaim.reviewedAt)}
                      </p>
                    )}
                  </div>
                )}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}