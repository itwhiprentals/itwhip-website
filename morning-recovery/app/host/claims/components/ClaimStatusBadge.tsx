// app/host/claims/components/ClaimStatusBadge.tsx
'use client'

import { 
  IoTimeOutline, 
  IoEyeOutline, 
  IoCheckmarkCircleOutline, 
  IoCloseCircleOutline,
  IoCashOutline,
  IoAlertCircleOutline,
  IoCheckmarkDoneOutline
} from 'react-icons/io5'

type ClaimStatus = 
  | 'PENDING' 
  | 'UNDER_REVIEW' 
  | 'APPROVED' 
  | 'DENIED' 
  | 'PAID' 
  | 'DISPUTED' 
  | 'RESOLVED'

interface ClaimStatusBadgeProps {
  status: ClaimStatus
  size?: 'sm' | 'md' | 'lg'
  showIcon?: boolean
  className?: string
}

export default function ClaimStatusBadge({ 
  status, 
  size = 'md',
  showIcon = true,
  className = ''
}: ClaimStatusBadgeProps) {
  
  // Get status config (colors, text, icon)
  const getStatusConfig = () => {
    switch (status) {
      case 'PENDING':
        return {
          bg: 'bg-yellow-100 dark:bg-yellow-900/30',
          text: 'text-yellow-800 dark:text-yellow-300',
          border: 'border-yellow-200 dark:border-yellow-800',
          label: 'Pending Review',
          icon: IoTimeOutline,
          description: 'Awaiting initial review'
        }
      
      case 'UNDER_REVIEW':
        return {
          bg: 'bg-blue-100 dark:bg-blue-900/30',
          text: 'text-blue-800 dark:text-blue-300',
          border: 'border-blue-200 dark:border-blue-800',
          label: 'Under Review',
          icon: IoEyeOutline,
          description: 'Being reviewed by our team'
        }
      
      case 'APPROVED':
        return {
          bg: 'bg-green-100 dark:bg-green-900/30',
          text: 'text-green-800 dark:text-green-300',
          border: 'border-green-200 dark:border-green-800',
          label: 'Approved',
          icon: IoCheckmarkCircleOutline,
          description: 'Claim approved, awaiting payout'
        }
      
      case 'DENIED':
        return {
          bg: 'bg-red-100 dark:bg-red-900/30',
          text: 'text-red-800 dark:text-red-300',
          border: 'border-red-200 dark:border-red-800',
          label: 'Denied',
          icon: IoCloseCircleOutline,
          description: 'Claim was denied'
        }
      
      case 'PAID':
        return {
          bg: 'bg-emerald-100 dark:bg-emerald-900/30',
          text: 'text-emerald-800 dark:text-emerald-300',
          border: 'border-emerald-200 dark:border-emerald-800',
          label: 'Paid',
          icon: IoCashOutline,
          description: 'Payout completed'
        }
      
      case 'DISPUTED':
        return {
          bg: 'bg-orange-100 dark:bg-orange-900/30',
          text: 'text-orange-800 dark:text-orange-300',
          border: 'border-orange-200 dark:border-orange-800',
          label: 'Disputed',
          icon: IoAlertCircleOutline,
          description: 'Under dispute review'
        }
      
      case 'RESOLVED':
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-800 dark:text-gray-300',
          border: 'border-gray-200 dark:border-gray-700',
          label: 'Resolved',
          icon: IoCheckmarkDoneOutline,
          description: 'Claim finalized'
        }
      
      default:
        return {
          bg: 'bg-gray-100 dark:bg-gray-800',
          text: 'text-gray-800 dark:text-gray-300',
          border: 'border-gray-200 dark:border-gray-700',
          label: status,
          icon: IoAlertCircleOutline,
          description: 'Unknown status'
        }
    }
  }

  const config = getStatusConfig()
  const Icon = config.icon

  // Size classes
  const sizeClasses = {
    sm: {
      container: 'px-2 py-0.5 text-xs',
      icon: 'w-3 h-3',
      gap: 'gap-1'
    },
    md: {
      container: 'px-3 py-1 text-sm',
      icon: 'w-4 h-4',
      gap: 'gap-1.5'
    },
    lg: {
      container: 'px-4 py-1.5 text-base',
      icon: 'w-5 h-5',
      gap: 'gap-2'
    }
  }

  const currentSize = sizeClasses[size]

  return (
    <span
      className={`
        inline-flex items-center font-medium rounded-full border
        ${config.bg} ${config.text} ${config.border}
        ${currentSize.container} ${currentSize.gap}
        ${className}
      `}
      title={config.description}
    >
      {showIcon && <Icon className={currentSize.icon} />}
      <span>{config.label}</span>
    </span>
  )
}

// Export helper function for status colors (can be used elsewhere)
export function getStatusColor(status: ClaimStatus): string {
  switch (status) {
    case 'PENDING':
      return 'yellow'
    case 'UNDER_REVIEW':
      return 'blue'
    case 'APPROVED':
      return 'green'
    case 'DENIED':
      return 'red'
    case 'PAID':
      return 'emerald'
    case 'DISPUTED':
      return 'orange'
    case 'RESOLVED':
      return 'gray'
    default:
      return 'gray'
  }
}