// app/components/StatusBadge.tsx
'use client'

import {
  IoCheckmarkCircleOutline,
  IoTimeOutline,
  IoWarningOutline,
  IoCloseCircleOutline,
  IoBanOutline,
  IoAlertCircleOutline
} from 'react-icons/io5'

type Status = 
  | 'PENDING' 
  | 'NEEDS_ATTENTION' 
  | 'APPROVED' 
  | 'SUSPENDED' 
  | 'REJECTED' 
  | 'BLACKLISTED'
  | 'ACTIVE'
  | 'INACTIVE'
  | 'VERIFIED'
  | 'UNVERIFIED'
  | 'SUBMITTED'
  | 'IN_PROGRESS'
  | 'COMPLETED'
  | 'FAILED'
  | 'PASS'
  | 'FAIL'

interface StatusBadgeProps {
  status: Status | string
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export default function StatusBadge({ 
  status, 
  size = 'md', 
  showIcon = true,
  className = '' 
}: StatusBadgeProps) {
  
  const getStatusConfig = (status: string) => {
    const normalizedStatus = status.toUpperCase()
    
    switch (normalizedStatus) {
      // Host Lifecycle Statuses
      case 'PENDING':
        return {
          label: 'Pending',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          icon: IoTimeOutline
        }
      case 'NEEDS_ATTENTION':
        return {
          label: 'Needs Attention',
          color: 'bg-orange-100 text-orange-800 dark:bg-orange-900/20 dark:text-orange-400',
          icon: IoWarningOutline
        }
      case 'APPROVED':
        return {
          label: 'Approved',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: IoCheckmarkCircleOutline
        }
      case 'SUSPENDED':
        return {
          label: 'Suspended',
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          icon: IoBanOutline
        }
      case 'REJECTED':
        return {
          label: 'Rejected',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          icon: IoCloseCircleOutline
        }
      case 'BLACKLISTED':
        return {
          label: 'Blacklisted',
          color: 'bg-black text-white dark:bg-gray-900 dark:text-white',
          icon: IoBanOutline
        }
      
      // General Statuses
      case 'ACTIVE':
        return {
          label: 'Active',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: IoCheckmarkCircleOutline
        }
      case 'INACTIVE':
        return {
          label: 'Inactive',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          icon: IoTimeOutline
        }
      case 'VERIFIED':
        return {
          label: 'Verified',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          icon: IoCheckmarkCircleOutline
        }
      case 'UNVERIFIED':
        return {
          label: 'Unverified',
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          icon: IoWarningOutline
        }
      
      // Document/Process Statuses
      case 'SUBMITTED':
        return {
          label: 'Submitted',
          color: 'bg-blue-100 text-blue-800 dark:bg-blue-900/20 dark:text-blue-400',
          icon: IoCheckmarkCircleOutline
        }
      case 'IN_PROGRESS':
        return {
          label: 'In Progress',
          color: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/20 dark:text-yellow-400',
          icon: IoTimeOutline
        }
      case 'COMPLETED':
        return {
          label: 'Completed',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: IoCheckmarkCircleOutline
        }
      case 'FAILED':
        return {
          label: 'Failed',
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          icon: IoCloseCircleOutline
        }
      case 'PASS':
        return {
          label: 'Pass',
          color: 'bg-green-100 text-green-800 dark:bg-green-900/20 dark:text-green-400',
          icon: IoCheckmarkCircleOutline
        }
      case 'FAIL':
        return {
          label: 'Fail',
          color: 'bg-red-100 text-red-800 dark:bg-red-900/20 dark:text-red-400',
          icon: IoCloseCircleOutline
        }
      
      // Default
      default:
        return {
          label: status.charAt(0) + status.slice(1).toLowerCase(),
          color: 'bg-gray-100 text-gray-800 dark:bg-gray-900/20 dark:text-gray-400',
          icon: IoAlertCircleOutline
        }
    }
  }

  const config = getStatusConfig(status)
  const Icon = config.icon

  // Size configurations
  const sizeClasses = {
    sm: {
      container: 'px-2 py-0.5 text-xs',
      icon: 'w-3 h-3'
    },
    md: {
      container: 'px-2.5 py-1 text-xs',
      icon: 'w-3.5 h-3.5'
    },
    lg: {
      container: 'px-3 py-1.5 text-sm',
      icon: 'w-4 h-4'
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <span 
      className={`inline-flex items-center rounded-full font-medium ${config.color} ${currentSize.container} ${className}`}
    >
      {showIcon && (
        <Icon className={`${currentSize.icon} mr-1`} />
      )}
      {config.label}
    </span>
  )
}

// Export type for use in other components
export type { Status }