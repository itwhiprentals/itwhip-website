// app/fleet/analytics/components/CityDrilldown/VisitorTable.tsx
// Sortable table of visitors with threat flags

'use client'

import { useState } from 'react'
import Link from 'next/link'
import { EnrichedVisitor } from '../shared/types'
import RiskBadge from '../shared/RiskBadge'
import ThreatFlags from '../shared/ThreatFlags'
import IpDisplay from '../shared/IpDisplay'
import TimeAgo from '../shared/TimeAgo'

interface VisitorTableProps {
  visitors: EnrichedVisitor[]
}

type SortKey = 'riskScore' | 'pageCount' | 'lastSeen'

export default function VisitorTable({ visitors }: VisitorTableProps) {
  const [sortBy, setSortBy] = useState<SortKey>('riskScore')
  const [sortDesc, setSortDesc] = useState(true)

  const sorted = [...visitors].sort((a, b) => {
    let cmp = 0
    if (sortBy === 'riskScore') cmp = a.riskScore - b.riskScore
    else if (sortBy === 'pageCount') cmp = a.pageCount - b.pageCount
    else if (sortBy === 'lastSeen') cmp = new Date(a.lastSeen).getTime() - new Date(b.lastSeen).getTime()
    return sortDesc ? -cmp : cmp
  })

  const toggleSort = (key: SortKey) => {
    if (sortBy === key) setSortDesc(!sortDesc)
    else { setSortBy(key); setSortDesc(true) }
  }

  const arrow = (key: SortKey) => sortBy === key ? (sortDesc ? ' ↓' : ' ↑') : ''

  return (
    <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 overflow-hidden">
      <div className="px-4 py-3 border-b border-gray-200 dark:border-gray-700">
        <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
          Visitors ({visitors.length})
        </h3>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <tr>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">IP / ISP</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Flags</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2 cursor-pointer hover:text-gray-700" onClick={() => toggleSort('riskScore')}>
                Risk{arrow('riskScore')}
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2 cursor-pointer hover:text-gray-700" onClick={() => toggleSort('pageCount')}>
                Pages{arrow('pageCount')}
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2">Device</th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2 cursor-pointer hover:text-gray-700" onClick={() => toggleSort('lastSeen')}>
                Last Seen{arrow('lastSeen')}
              </th>
              <th className="text-left text-xs font-medium text-gray-500 uppercase px-4 py-2"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
            {sorted.map(v => (
              <tr key={v.visitorId} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                <td className="px-4 py-2.5">
                  <IpDisplay ip={v.ip} />
                  {v.isp && (
                    <div className="text-[11px] text-gray-400 mt-0.5 truncate max-w-[180px]">{v.isp}</div>
                  )}
                </td>
                <td className="px-4 py-2.5">
                  <ThreatFlags isVpn={v.isVpn} isProxy={v.isProxy} isTor={v.isTor} isHosting={v.isHosting} />
                </td>
                <td className="px-4 py-2.5">
                  <RiskBadge score={v.riskScore} showLabel={false} />
                </td>
                <td className="px-4 py-2.5 text-sm text-gray-700 dark:text-gray-300">
                  {v.pageCount}
                </td>
                <td className="px-4 py-2.5">
                  <span className="text-xs text-gray-500">{v.device || '-'}</span>
                  {v.browser && <span className="text-xs text-gray-400 ml-1">/ {v.browser}</span>}
                </td>
                <td className="px-4 py-2.5">
                  <TimeAgo timestamp={v.lastSeen} />
                </td>
                <td className="px-4 py-2.5">
                  <Link
                    href={`/fleet/analytics/visitor/${encodeURIComponent(v.visitorId)}?key=phoenix-fleet-2847`}
                    className="text-xs text-blue-600 hover:text-blue-700 font-medium"
                  >
                    Profile →
                  </Link>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {visitors.length === 0 && (
        <div className="text-center py-8 text-gray-400 text-sm">No visitors from this location</div>
      )}
    </div>
  )
}
