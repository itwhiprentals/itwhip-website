// app/fleet/analytics/visitor/[id]/page.tsx
// Visitor threat profile — thin shell, composes modular components

'use client'

import { useState, useEffect } from 'react'
import { useParams, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import VisitorCard from '../../components/VisitorProfile/VisitorCard'
import SessionTimeline from '../../components/VisitorProfile/SessionTimeline'
import SecurityEvents from '../../components/VisitorProfile/SecurityEvents'
import BehavioralSignals from '../../components/VisitorProfile/BehavioralSignals'
import ThreatAssessment from '../../components/VisitorProfile/ThreatAssessment'
import type { EnrichedVisitor, PageViewEntry, SecurityEventEntry } from '../../components/shared/types'

interface VisitorResponse {
  success: boolean
  visitor: EnrichedVisitor
  pageViews: PageViewEntry[]
  securityEvents: SecurityEventEntry[]
  loginAttempts: { id: string; identifier: string; success: boolean; reason: string | null; timestamp: string }[]
  behavioral: {
    totalPages: number
    avgTimeBetweenPages: number | null
    authPagesVisited: string[]
    sensitivePagesVisited: string[]
    sessionDurationMs: number | null
  }
}

export default function VisitorProfilePage() {
  const params = useParams()
  const searchParams = useSearchParams()
  const visitorId = decodeURIComponent(params.id as string)
  const apiKey = searchParams.get('key') || 'phoenix-fleet-2847'

  const [data, setData] = useState<VisitorResponse | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    setLoading(true)
    fetch(`/api/fleet/analytics/visitor/${encodeURIComponent(visitorId)}?key=${apiKey}`)
      .then(r => r.json())
      .then(d => { if (d.success) setData(d) })
      .catch(console.error)
      .finally(() => setLoading(false))
  }, [visitorId, apiKey])

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  if (!data) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <p className="text-gray-500">Visitor not found</p>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Nav */}
      <div className="bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 py-3 flex items-center gap-3">
          <Link href={`/fleet/analytics?key=${apiKey}`} className="text-gray-400 hover:text-gray-600">
            <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </Link>
          <span className="text-sm text-gray-500">Analytics</span>
          {data.visitor.city && (
            <>
              <span className="text-gray-300">/</span>
              <Link
                href={`/fleet/analytics/location/${encodeURIComponent(data.visitor.city)}?key=${apiKey}`}
                className="text-sm text-blue-600 hover:text-blue-700"
              >
                {data.visitor.city}
              </Link>
            </>
          )}
          <span className="text-gray-300">/</span>
          <span className="text-sm font-medium text-gray-900 dark:text-white font-mono truncate max-w-[200px]">
            {data.visitor.ip || visitorId}
          </span>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-7xl mx-auto px-4 py-6 space-y-6">
        {/* Threat assessment at top */}
        <ThreatAssessment
          visitor={data.visitor}
          behavioral={data.behavioral}
          blockedEventCount={data.securityEvents.filter(e => e.blocked).length}
          failedLoginCount={data.loginAttempts.filter(l => !l.success).length}
          totalSecurityEvents={data.securityEvents.length}
          totalLoginAttempts={data.loginAttempts.length}
        />

        {/* Visitor identity */}
        <VisitorCard visitor={data.visitor} />

        {/* Two-column layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-6">
            <SessionTimeline views={data.pageViews} />
          </div>
          <div className="space-y-6">
            <BehavioralSignals behavioral={data.behavioral} />
            <SecurityEvents events={data.securityEvents} loginAttempts={data.loginAttempts} />
          </div>
        </div>
      </div>
    </div>
  )
}
