'use client'

import {
  IoFunnelOutline,
  IoCheckmarkCircleOutline,
  IoAlertCircleOutline,
  IoTimeOutline
} from 'react-icons/io5'

import {
  TotalStage,
  DraftStage,
  SentStage,
  OpenedStage,
  ClickedStage,
  ConvertedStage,
  StageArrow
} from './funnel'

// ============================================
// Types
// ============================================

export interface FunnelStats {
  total: number
  draft: number
  emailSent: number
  emailOpened: number
  linkClicked: number
  converted: number
  expired: number
  last7DaysConverted: number
  conversionRate: number
}

// ============================================
// Summary Stats Components
// ============================================

function Last7DaysConverted({ count }: { count: number }) {
  if (count <= 0) return null

  return (
    <div className="flex items-center gap-1 text-sm text-gray-600 dark:text-gray-400">
      <IoCheckmarkCircleOutline className="w-4 h-4 text-green-600" />
      <span>
        <span className="font-medium text-green-600 dark:text-green-400">{count}</span> converted in last 7 days
      </span>
    </div>
  )
}

function ExpiredInvites({ count }: { count: number }) {
  if (count <= 0) return null

  return (
    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400">
      <IoTimeOutline className="w-4 h-4 text-red-500" />
      <span>
        <span className="font-medium text-red-500">{count}</span> expired invites
      </span>
    </div>
  )
}

function PendingOutreach({ count, total }: { count: number; total: number }) {
  if (total <= 0 || count <= 0) return null

  return (
    <div className="flex items-center gap-1 text-sm text-gray-500 dark:text-gray-400 ml-auto">
      <IoAlertCircleOutline className="w-4 h-4 text-yellow-500" />
      <span>
        <span className="font-medium">{count}</span> pending outreach
      </span>
    </div>
  )
}

function ConversionRate({ rate }: { rate: number }) {
  if (rate <= 0) return null

  return (
    <span className="text-sm text-green-600 dark:text-green-400 ml-auto font-medium">
      {rate.toFixed(1)}% conversion rate
    </span>
  )
}

function FunnelSummary({ stats }: { stats: FunnelStats }) {
  const hasAnyStats = stats.last7DaysConverted > 0 || stats.expired > 0 || (stats.total > 0 && stats.draft > 0)

  if (!hasAnyStats) return null

  return (
    <div className="flex flex-wrap items-center gap-x-4 gap-y-2 mt-3 pt-3 border-t border-gray-100 dark:border-gray-700">
      <Last7DaysConverted count={stats.last7DaysConverted} />
      <ExpiredInvites count={stats.expired} />
      <PendingOutreach count={stats.draft} total={stats.total} />
    </div>
  )
}

// ============================================
// Main Conversion Funnel Component
// ============================================

interface ConversionFunnelProps {
  stats: FunnelStats
}

export default function ConversionFunnel({ stats }: ConversionFunnelProps) {
  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4">
      {/* Header */}
      <div className="flex items-center gap-2 mb-3">
        <IoFunnelOutline className="w-5 h-5 text-orange-600" />
        <h2 className="font-medium text-gray-900 dark:text-white">Conversion Funnel</h2>
        <ConversionRate rate={stats.conversionRate} />
      </div>

      {/* Funnel Stages - Each stage is its own component file */}
      <div className="flex items-center gap-1 overflow-x-auto pb-2 scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600">
        {/* Stage 1: Total */}
        <TotalStage value={stats.total} />
        <StageArrow fromValue={stats.total} toValue={stats.draft} />

        {/* Stage 2: Draft */}
        <DraftStage value={stats.draft} />
        <StageArrow fromValue={stats.draft} toValue={stats.emailSent} />

        {/* Stage 3: Email Sent */}
        <SentStage value={stats.emailSent} />
        <StageArrow fromValue={stats.emailSent} toValue={stats.emailOpened} />

        {/* Stage 4: Email Opened */}
        <OpenedStage value={stats.emailOpened} />
        <StageArrow fromValue={stats.emailOpened} toValue={stats.linkClicked} />

        {/* Stage 5: Link Clicked */}
        <ClickedStage value={stats.linkClicked} />
        <StageArrow fromValue={stats.linkClicked} toValue={stats.converted} />

        {/* Stage 6: Converted */}
        <ConvertedStage value={stats.converted} />
      </div>

      {/* Summary Stats */}
      <FunnelSummary stats={stats} />
    </div>
  )
}
