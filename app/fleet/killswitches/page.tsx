'use client'

import { useState, useEffect } from 'react'
import { IoPowerOutline, IoWarning, IoCheckmarkCircle, IoSkull } from 'react-icons/io5'

interface KillswitchData {
  id: string
  feature: string
  active: boolean
  reason: string | null
  killedAt: string | null
  killedBy: string | null
}

interface KillswitchMeta {
  label: string
  desc: string
  impact: string
}

export default function KillswitchesPage() {
  const [switches, setSwitches] = useState<KillswitchData[]>([])
  const [info, setInfo] = useState<Record<string, KillswitchMeta>>({})
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/fleet/api/killswitches')
      .then(r => r.json())
      .then(data => {
        setSwitches(data.switches || [])
        setInfo(data.info || {})
      })
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleSwitch = async (feature: string, activate: boolean) => {
    const meta = info[feature]
    if (activate) {
      const reason = prompt(`⚠️ KILL ${meta?.label || feature}?\n\nImpact: ${meta?.impact || 'Feature will be disabled.'}\n\nEnter reason:`)
      if (!reason) return
      setSaving(feature)
      try {
        await fetch('/fleet/api/killswitches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature, active: true, reason }),
        })
        setSwitches(prev => {
          const exists = prev.find(s => s.feature === feature)
          if (exists) return prev.map(s => s.feature === feature ? { ...s, active: true, reason, killedAt: new Date().toISOString(), killedBy: 'fleet-admin' } : s)
          return [...prev, { id: feature, feature, active: true, reason, killedAt: new Date().toISOString(), killedBy: 'fleet-admin' }]
        })
      } catch {} finally { setSaving(null) }
    } else {
      if (!confirm(`Revive ${meta?.label || feature}?`)) return
      setSaving(feature)
      try {
        await fetch('/fleet/api/killswitches', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ feature, active: false }),
        })
        setSwitches(prev => prev.map(s => s.feature === feature ? { ...s, active: false, reason: null, killedAt: null } : s))
      } catch {} finally { setSaving(null) }
    }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading killswitches...</div>

  const features = Object.keys(info)
  const switchMap = new Map(switches.map(s => [s.feature, s]))
  const killedCount = features.filter(f => switchMap.get(f)?.active).length

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-2">
        <IoPowerOutline className="text-3xl text-red-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Killswitches</h1>
        {killedCount > 0 && (
          <span className="px-2 py-0.5 bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-400 text-xs font-bold rounded-full">
            {killedCount} KILLED
          </span>
        )}
      </div>
      <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
        Emergency controls. Killswitches override feature flags — killing a feature immediately returns 503 to all requests. Use for outages, security incidents, or emergency maintenance. Fleet admins receive a push notification when any switch is activated.
      </p>

      <div className="space-y-3">
        {features.map(feature => {
          const sw = switchMap.get(feature)
          const isKilled = sw?.active || false
          const meta = info[feature]
          return (
            <div key={feature} className={`rounded-lg border overflow-hidden ${isKilled ? 'bg-red-50 dark:bg-red-900/20 border-red-300 dark:border-red-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
              <div className="flex items-start justify-between px-4 py-4 gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    {isKilled
                      ? <IoSkull className="text-red-500 text-lg flex-shrink-0" />
                      : <IoCheckmarkCircle className="text-green-500 text-lg flex-shrink-0" />
                    }
                    <span className="font-semibold text-sm text-gray-900 dark:text-white">{meta?.label || feature}</span>
                    <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${isKilled ? 'bg-red-200 dark:bg-red-800 text-red-800 dark:text-red-200' : 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-400'}`}>
                      {isKilled ? 'KILLED' : 'LIVE'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{meta?.desc}</p>

                  {/* Impact warning */}
                  {!isKilled && (
                    <div className="flex items-start gap-1.5 mt-2 text-xs text-amber-700 dark:text-amber-400">
                      <IoWarning className="flex-shrink-0 mt-0.5" />
                      <span>If killed: {meta?.impact}</span>
                    </div>
                  )}

                  {/* Killed details */}
                  {isKilled && sw?.reason && (
                    <div className="mt-2 px-2 py-1.5 bg-red-100 dark:bg-red-900/30 rounded text-xs text-red-700 dark:text-red-300">
                      <strong>Reason:</strong> {sw.reason}
                    </div>
                  )}
                  {isKilled && sw?.killedAt && (
                    <p className="text-xs text-gray-400 mt-1">
                      Killed {sw.killedBy ? `by ${sw.killedBy}` : ''} · {new Date(sw.killedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}
                    </p>
                  )}
                </div>

                <button
                  onClick={() => toggleSwitch(feature, !isKilled)}
                  disabled={saving === feature}
                  className={`px-4 py-2 rounded-lg text-sm font-bold transition-colors flex-shrink-0 ${saving === feature ? 'opacity-50' : ''} ${
                    isKilled
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : 'bg-red-600 text-white hover:bg-red-700'
                  }`}
                >
                  {isKilled ? 'REVIVE' : 'KILL'}
                </button>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
