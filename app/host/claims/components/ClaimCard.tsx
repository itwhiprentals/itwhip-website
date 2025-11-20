// app/host/claims/components/ClaimCard.tsx
'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import ClaimStatusBadge from './ClaimStatusBadge'
import { 
  IoCarOutline, 
  IoCalendarOutline, 
  IoCashOutline,
  IoDocumentTextOutline,
  IoChevronForwardOutline,
  IoPersonOutline,
  IoAlertCircleOutline,
  IoImageOutline,
  IoLockClosedOutline,
  IoCheckmarkCircleOutline,
  IoCloseOutline
} from 'react-icons/io5'

interface ClaimCardProps {
  claim: {
    id: string
    type: string
    status: string
    description: string
    estimatedCost: number
    approvedAmount: number | null
    deductible: number | null
    incidentDate: string | null
    createdAt: string
    damagePhotos?: string[]
    vehicleDeactivated?: boolean
    canCancel?: boolean
    booking: {
      id: string
      bookingCode: string
      car: {
        id?: string
        displayName: string
        heroPhoto: string | null
        isActive?: boolean
      } | null
      guest: {
        name: string
      } | null
    }
    netPayout?: number | null
    isPending?: boolean
    isApproved?: boolean
    isPaid?: boolean
  }
  onStatusChange?: () => void
  className?: string
}

export default function ClaimCard({ claim, onStatusChange, className = '' }: ClaimCardProps) {
  const [imageError, setImageError] = useState(false)
  const [cancelling, setCancelling] = useState(false)

  // Format currency
  const formatCurrency = (amount: number | null) => {
    if (amount === null || amount === undefined) return 'N/A'
    return `$${amount.toLocaleString()}`
  }

  // Format date
  const formatDate = (dateString: string | null) => {
    if (!dateString) return 'N/A'
    const date = new Date(dateString)
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    })
  }

  // Get claim type display name
  const getClaimTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      ACCIDENT: 'Accident',
      THEFT: 'Theft',
      VANDALISM: 'Vandalism',
      CLEANING: 'Cleaning',
      MECHANICAL: 'Mechanical',
      WEATHER: 'Weather Damage',
      OTHER: 'Other'
    }
    return labels[type] || type
  }

  // Get claim type icon color
  const getClaimTypeColor = (type: string) => {
    const colors: Record<string, string> = {
      ACCIDENT: 'text-red-600 dark:text-red-400',
      THEFT: 'text-purple-600 dark:text-purple-400',
      VANDALISM: 'text-orange-600 dark:text-orange-400',
      CLEANING: 'text-blue-600 dark:text-blue-400',
      MECHANICAL: 'text-yellow-600 dark:text-yellow-400',
      WEATHER: 'text-cyan-600 dark:text-cyan-400',
      OTHER: 'text-gray-600 dark:text-gray-400'
    }
    return colors[type] || 'text-gray-600 dark:text-gray-400'
  }

  const handleCancelClaim = async (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    
    if (!confirm('Are you sure you want to cancel this claim? This action cannot be undone.')) {
      return
    }

    setCancelling(true)
    try {
      const response = await fetch(`/api/host/claims/${claim.id}/cancel`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }
      })

      if (response.ok) {
        if (onStatusChange) {
          onStatusChange()
        }
      } else {
        alert('Failed to cancel claim. Please try again.')
      }
    } catch (error) {
      console.error('Error cancelling claim:', error)
      alert('An error occurred while cancelling the claim.')
    } finally {
      setCancelling(false)
    }
  }

  const carPhoto = claim.booking.car?.heroPhoto
  const hasPhotos = claim.damagePhotos && claim.damagePhotos.length > 0
  const vehicleIsActive = claim.booking.car?.isActive !== false
  const canBeCancelled = claim.canCancel !== false && claim.status === 'PENDING'

  return (
    <div className={`relative ${className}`}>
      <Link
        href={`/host/claims/${claim.id}`}
        className="block bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 hover:border-purple-300 dark:hover:border-purple-700 hover:shadow-md transition-all duration-200 group"
      >
        <div className="p-4 sm:p-5">
          {/* Header: Car image, status, and claim type */}
          <div className="flex gap-3 sm:gap-4 mb-4">
            {/* Car image */}
            <div className="flex-shrink-0">
              <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-lg overflow-hidden bg-gray-100 dark:bg-gray-700 relative">
                {carPhoto && !imageError ? (
                  <Image
                    src={carPhoto}
                    alt={claim.booking.car?.displayName || 'Car'}
                    fill
                    className="object-cover"
                    onError={() => setImageError(true)}
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <IoCarOutline className="w-8 h-8 text-gray-400 dark:text-gray-500" />
                  </div>
                )}
              </div>
            </div>

            {/* Info */}
            <div className="flex-1 min-w-0">
              {/* Car name and status */}
              <div className="flex items-start justify-between gap-2 mb-1">
                <h3 className="text-sm sm:text-base font-semibold text-gray-900 dark:text-white truncate">
                  {claim.booking.car?.displayName || 'Unknown Vehicle'}
                </h3>
                <div className="flex items-center gap-2 flex-shrink-0">
                  <ClaimStatusBadge status={claim.status as any} size="sm" />
                  {/* Cancel Button for Pending Claims */}
                  {canBeCancelled && (
                    <button
                      onClick={handleCancelClaim}
                      disabled={cancelling}
                      className="p-1.5 text-gray-400 hover:text-red-600 dark:hover:text-red-400 transition-colors disabled:opacity-50 rounded hover:bg-red-50 dark:hover:bg-red-900/20"
                      title="Cancel Claim"
                    >
                      <IoCloseOutline className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>

              {/* Booking code and claim type */}
              <div className="flex flex-wrap items-center gap-2 text-xs sm:text-sm text-gray-600 dark:text-gray-400 mb-2">
                <span className="font-medium">
                  {claim.booking.bookingCode}
                </span>
                <span>•</span>
                <span className={`flex items-center gap-1 font-medium ${getClaimTypeColor(claim.type)}`}>
                  <IoAlertCircleOutline className="w-4 h-4" />
                  {getClaimTypeLabel(claim.type)}
                </span>
              </div>

              {/* Guest name and Vehicle Status */}
              <div className="flex items-center gap-2 flex-wrap">
                {claim.booking.guest && (
                  <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                    <IoPersonOutline className="w-3 h-3" />
                    <span>{claim.booking.guest.name}</span>
                  </div>
                )}
                
                {/* Vehicle Status Badge */}
                {claim.vehicleDeactivated || !vehicleIsActive ? (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400">
                    <IoLockClosedOutline className="w-3 h-3" />
                    Deactivated
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 px-2 py-0.5 text-xs font-medium rounded-full bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400">
                    <IoCheckmarkCircleOutline className="w-3 h-3" />
                    Active
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Details grid */}
          <div className="grid grid-cols-2 gap-3 mb-4">
            {/* Incident date */}
            <div className="flex items-start gap-2">
              <IoCalendarOutline className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Incident Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {formatDate(claim.incidentDate)}
                </p>
              </div>
            </div>

            {/* Filed date */}
            <div className="flex items-start gap-2">
              <IoDocumentTextOutline className="w-4 h-4 text-gray-400 dark:text-gray-500 mt-0.5 flex-shrink-0" />
              <div className="min-w-0">
                <p className="text-xs text-gray-500 dark:text-gray-400">Filed Date</p>
                <p className="text-sm font-medium text-gray-900 dark:text-white truncate">
                  {formatDate(claim.createdAt)}
                </p>
              </div>
            </div>
          </div>

          {/* Financial info */}
          <div className="flex flex-wrap items-center gap-4 pt-4 border-t border-gray-100 dark:border-gray-700">
            {/* Estimated cost */}
            <div className="flex items-center gap-2">
              <IoCashOutline className="w-4 h-4 text-gray-400 dark:text-gray-500" />
              <div>
                <p className="text-xs text-gray-500 dark:text-gray-400">Estimated</p>
                <p className="text-sm font-semibold text-gray-900 dark:text-white">
                  {formatCurrency(claim.estimatedCost)}
                </p>
              </div>
            </div>

            {/* Deductible */}
            {claim.deductible !== null && (
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Deductible</p>
                  <p className="text-sm font-semibold text-gray-900 dark:text-white">
                    {formatCurrency(claim.deductible)}
                  </p>
                </div>
              </div>
            )}

            {/* Approved amount (if exists) */}
            {claim.approvedAmount !== null && (
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Approved</p>
                  <p className="text-sm font-semibold text-green-600 dark:text-green-400">
                    {formatCurrency(claim.approvedAmount)}
                  </p>
                </div>
              </div>
            )}

            {/* Net payout (if approved/paid) */}
            {claim.netPayout !== null && claim.netPayout !== undefined && claim.netPayout > 0 && (
              <div className="flex items-center gap-2">
                <div>
                  <p className="text-xs text-gray-500 dark:text-gray-400">Net Payout</p>
                  <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                    {formatCurrency(claim.netPayout)}
                  </p>
                </div>
              </div>
            )}

            {/* Damage photos indicator */}
            {hasPhotos && (
              <div className="ml-auto flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                <IoImageOutline className="w-4 h-4" />
                <span>{claim.damagePhotos!.length} photo{claim.damagePhotos!.length !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>

          {/* View details arrow (hover effect) */}
          <div className="flex items-center justify-end mt-3 text-sm text-purple-600 dark:text-purple-400 font-medium opacity-0 group-hover:opacity-100 transition-opacity">
            <span>View Details</span>
            <IoChevronForwardOutline className="w-4 h-4 ml-1 transform group-hover:translate-x-1 transition-transform" />
          </div>
        </div>
      </Link>
    </div>
  )
}