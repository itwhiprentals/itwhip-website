// app/host/profile/components/tabs/BankingTab.tsx
'use client'

import { IoLockClosedOutline } from 'react-icons/io5'
import EmbeddedBanking from '@/app/host/components/EmbeddedBanking'
import { TabType } from '../TabNavigation'

interface HostProfile {
  id: string
  approvalStatus: 'PENDING' | 'NEEDS_ATTENTION' | 'APPROVED' | 'SUSPENDED' | 'REJECTED'
}

interface BankingTabProps {
  profile: HostProfile
  isApproved: boolean
  onTabChange: (tab: TabType) => void
}

export default function BankingTab({
  profile,
  isApproved,
  onTabChange
}: BankingTabProps) {
  // If approved, show the banking component
  if (isApproved) {
    return (
      <div className="p-4 sm:p-6">
        <EmbeddedBanking hostId={profile.id} />
      </div>
    )
  }

  // If not approved, show locked state
  return (
    <div className="p-4 sm:p-6">
      <div className="text-center py-12">
        <IoLockClosedOutline className="w-16 h-16 text-gray-400 dark:text-gray-500 mx-auto mb-4" />
        
        <h3 className="text-lg sm:text-xl font-semibold text-gray-900 dark:text-white mb-2">
          Banking Access Locked
        </h3>
        
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 mb-6 max-w-md mx-auto px-4">
          Complete your account verification to access banking features and receive payouts.
        </p>
        
        <button
          onClick={() => onTabChange('documents')}
          className="px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors"
        >
          Complete Verification
        </button>
      </div>
    </div>
  )
}