// app/host/components/VerificationProgress.tsx
'use client'

import { useState, useEffect } from 'react'
import { 
  IoCheckmarkCircle, 
  IoCloseCircle, 
  IoTimeOutline,
  IoDocumentTextOutline,
  IoShieldCheckmarkOutline,
  IoCardOutline,
  IoChevronForwardOutline
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
}

interface VerificationProgressProps {
  hostId: string
  approvalStatus: string
  documentStatuses?: any
  backgroundCheckStatus?: string
  pendingActions?: string[]
  onActionClick?: (stepId: string) => void
}

export default function VerificationProgress({
  hostId,
  approvalStatus,
  documentStatuses = {},
  backgroundCheckStatus = 'NOT_STARTED',
  pendingActions = [],
  onActionClick
}: VerificationProgressProps) {
  const [progress, setProgress] = useState(0)
  const [steps, setSteps] = useState<VerificationStep[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchVerificationStatus()
  }, [hostId, approvalStatus, backgroundCheckStatus]) // Removed documentStatuses - it's an object that changes reference

  const fetchVerificationStatus = async () => {
    try {
      setLoading(true)

      // Build verification steps based on current status
      const verificationSteps: VerificationStep[] = []

      // Step 1: Profile Completion
      verificationSteps.push({
        id: 'profile',
        title: 'Complete Your Profile',
        description: 'Add your bio, profile photo, and basic information',
        status: 'COMPLETED', // Assumed completed if they're here
        icon: IoDocumentTextOutline,
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

      // Step 3: Document Review
      if (docsStatus === 'COMPLETED' || docsStatus === 'PENDING_REVIEW') {
        verificationSteps.push({
          id: 'document_review',
          title: 'Document Review',
          description: 'Our team is reviewing your submitted documents',
          status: docsStatus === 'COMPLETED' ? 'COMPLETED' : 'PENDING_REVIEW',
          icon: IoShieldCheckmarkOutline,
          estimatedTime: '1-2 business days',
          priority: 'MEDIUM'
        })
      }

      // Step 4: Background Check
      const bgStatus = determineBackgroundCheckStatus(backgroundCheckStatus)
      if (docsStatus === 'COMPLETED') {
        verificationSteps.push({
          id: 'background_check',
          title: 'Background Verification',
          description: 'Identity, DMV, and criminal record checks',
          status: bgStatus,
          icon: IoShieldCheckmarkOutline,
          estimatedTime: '2-3 business days',
          priority: 'HIGH'
        })
      }

      // Step 5: Bank Account Setup
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

      // Step 6: Final Approval
      if (docsStatus === 'COMPLETED' && bgStatus === 'COMPLETED') {
        verificationSteps.push({
          id: 'final_approval',
          title: 'Final Approval',
          description: approvalStatus === 'APPROVED' 
            ? 'Your account is approved! Start listing vehicles' 
            : 'Final review in progress',
          status: approvalStatus === 'APPROVED' ? 'COMPLETED' : 'PENDING_REVIEW',
          icon: IoCheckmarkCircle,
          estimatedTime: approvalStatus === 'APPROVED' ? undefined : '24 hours',
          priority: 'HIGH'
        })
      }

      setSteps(verificationSteps)

      // Calculate progress percentage
      const completedSteps = verificationSteps.filter(s => s.status === 'COMPLETED').length
      const totalSteps = verificationSteps.length
      const progressPercentage = Math.round((completedSteps / totalSteps) * 100)
      setProgress(progressPercentage)

    } catch (error) {
      console.error('Error fetching verification status:', error)
    } finally {
      setLoading(false)
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

  const determineBackgroundCheckStatus = (status: string): VerificationStep['status'] => {
    switch (status) {
      case 'PASSED':
      case 'COMPLETED':
        return 'COMPLETED'
      case 'FAILED':
        return 'FAILED'
      case 'IN_PROGRESS':
      case 'PENDING':
        return 'IN_PROGRESS'
      default:
        return 'NOT_STARTED'
    }
  }

  const getStatusIcon = (status: VerificationStep['status']) => {
    switch (status) {
      case 'COMPLETED':
        return <IoCheckmarkCircle className="w-6 h-6 text-green-500" />
      case 'FAILED':
        return <IoCloseCircle className="w-6 h-6 text-red-500" />
      case 'IN_PROGRESS':
      case 'PENDING_REVIEW':
        return (
          <div className="relative">
            <div className="w-6 h-6 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )
      default:
        return <div className="w-6 h-6 bg-gray-300 dark:bg-gray-600 rounded-full" />
    }
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

  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
        <div className="animate-pulse space-y-4">
          <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/3"></div>
          <div className="h-2 bg-gray-200 dark:bg-gray-700 rounded"></div>
          <div className="space-y-3">
            {[1, 2, 3].map(i => (
              <div key={i} className="h-16 bg-gray-100 dark:bg-gray-800 rounded-lg"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="bg-white dark:bg-gray-900 rounded-xl border border-gray-200 dark:border-gray-800 p-6">
      {/* Header */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-2">
          Verification Progress
        </h3>
        <p className="text-sm text-gray-600 dark:text-gray-400">
          Complete all steps to start listing vehicles
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
            className="bg-gradient-to-r from-blue-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>

      {/* Steps */}
      <div className="space-y-4">
        {steps.map((step, index) => {
          const Icon = step.icon
          const isLastStep = index === steps.length - 1
          
          return (
            <div key={step.id} className="relative">
              {/* Connecting Line */}
              {!isLastStep && (
                <div className="absolute left-3 top-12 bottom-0 w-0.5 bg-gray-200 dark:bg-gray-700 -mb-4" />
              )}
              
              {/* Step Card */}
              <div className={`relative bg-gray-50 dark:bg-gray-800 rounded-lg p-4 border-2 transition-all ${
                step.status === 'FAILED' 
                  ? 'border-red-200 dark:border-red-900'
                  : step.status === 'COMPLETED'
                  ? 'border-green-200 dark:border-green-900'
                  : step.status === 'IN_PROGRESS' || step.status === 'PENDING_REVIEW'
                  ? 'border-blue-200 dark:border-blue-900'
                  : 'border-gray-200 dark:border-gray-700'
              }`}>
                <div className="flex items-start gap-4">
                  {/* Status Icon */}
                  <div className="flex-shrink-0 relative z-10 bg-white dark:bg-gray-800 rounded-full p-1">
                    {getStatusIcon(step.status)}
                  </div>

                  {/* Content */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2 mb-1">
                      <h4 className="font-semibold text-gray-900 dark:text-white">
                        {step.title}
                      </h4>
                      <span className={`text-xs font-medium ${getStatusColor(step.status)}`}>
                        {getStatusLabel(step.status)}
                      </span>
                    </div>
                    
                    <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                      {step.description}
                    </p>

                    {/* Estimated Time */}
                    {step.estimatedTime && step.status !== 'COMPLETED' && (
                      <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400 mb-2">
                        <IoTimeOutline className="w-3.5 h-3.5" />
                        <span>Est. {step.estimatedTime}</span>
                      </div>
                    )}

                    {/* Action Button */}
                    {step.actionUrl && step.status !== 'COMPLETED' && (
                      <button
                        onClick={() => {
                          if (onActionClick) {
                            onActionClick(step.id)
                          } else if (step.actionUrl) {
                            window.location.href = step.actionUrl
                          }
                        }}
                        className={`inline-flex items-center gap-1 text-sm font-medium transition-colors ${
                          step.status === 'FAILED'
                            ? 'text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300'
                            : 'text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300'
                        }`}
                      >
                        {step.actionLabel || 'Take Action'}
                        <IoChevronForwardOutline className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              </div>
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

      {/* Pending Actions Alert */}
      {pendingActions && pendingActions.length > 0 && (
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