// app/fleet/hosts/[id]/banking/components/HostBankingHeader.tsx
'use client'

import Link from 'next/link'
import { IoArrowBackOutline, IoRefreshOutline } from 'react-icons/io5'
import { BankingData } from '../types'

interface HostBankingHeaderProps {
  data: BankingData
  refreshing: boolean
  onRefresh: () => void
}

export function HostBankingHeader({ data, refreshing, onRefresh }: HostBankingHeaderProps) {
  return (
    <div className="flex flex-wrap items-center gap-3 sm:gap-4 mb-6">
      <Link
        href={`/fleet/hosts/${data.host.id}?key=phoenix-fleet-2847`}
        className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
      >
        <IoArrowBackOutline className="text-xl" />
      </Link>
      <div className="flex-1 min-w-0">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-white">
          Banking & Payments
        </h1>
        <p className="text-sm sm:text-base text-gray-600 dark:text-gray-400 truncate">
          {data.host.name} • {data.host.email}
        </p>
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <span className={`px-2 sm:px-3 py-1 rounded-full text-xs sm:text-sm whitespace-nowrap ${
          data.host.hostType === 'PLATFORM' ? 'bg-purple-100 text-purple-700' :
          'bg-blue-100 text-blue-700'
        }`}>
          {data.host.hostType === 'PLATFORM' ? 'Platform' : 'Partner'}
        </span>
        <button
          onClick={onRefresh}
          disabled={refreshing}
          className="p-2 hover:bg-gray-200 dark:hover:bg-gray-800 rounded-lg"
        >
          <IoRefreshOutline className={`text-xl ${refreshing ? 'animate-spin' : ''}`} />
        </button>
      </div>
    </div>
  )
}
