'use client'

import { useState, useEffect } from 'react'
import { IoPowerOutline } from 'react-icons/io5'

interface KillswitchData {
  id: string
  feature: string
  active: boolean
  reason: string | null
  killedAt: string | null
  killedBy: string | null
}

export default function KillswitchesPage() {
  const [switches, setSwitches] = useState<KillswitchData[]>([])
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState<string | null>(null)

  useEffect(() => {
    fetch('/fleet/api/killswitches')
      .then(r => r.json())
      .then(data => setSwitches(data.switches || []))
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  const toggleSwitch = async (feature: string, activate: boolean) => {
    const reason = activate ? prompt('Reason for killing this feature:') : null
    if (activate && !reason) return
    setSaving(feature)
    try {
      await fetch('/fleet/api/killswitches', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ feature, active: activate, reason }),
      })
      setSwitches(prev => prev.map(s =>
        s.feature === feature ? { ...s, active: activate, reason, killedAt: activate ? new Date().toISOString() : null } : s
      ))
    } catch {}
    finally { setSaving(null) }
  }

  if (loading) return <div className="p-8 text-center text-gray-500">Loading killswitches...</div>

  const features = ['STRIPE_PAYMENTS', 'PUSH_NOTIFICATIONS', 'EMAIL_SERVICE', 'CHOE_ENABLED', 'PHONE_AUTH', 'S3_UPLOADS', 'GUEST_SIGNUP', 'HOST_SIGNUP']
  const switchMap = new Map(switches.map(s => [s.feature, s]))

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="flex items-center gap-3 mb-6">
        <IoPowerOutline className="text-3xl text-red-600" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Killswitches</h1>
        <span className="text-sm text-gray-500 dark:text-gray-400">Emergency feature control</span>
      </div>

      <div className="grid gap-3">
        {features.map(feature => {
          const sw = switchMap.get(feature)
          const isKilled = sw?.active || false
          return (
            <div key={feature} className={`flex items-center justify-between px-4 py-4 rounded-lg border ${isKilled ? 'bg-red-50 dark:bg-red-900/20 border-red-200 dark:border-red-800' : 'bg-white dark:bg-gray-800 border-gray-200 dark:border-gray-700'}`}>
              <div>
                <span className="font-mono text-sm font-medium text-gray-900 dark:text-white">{feature}</span>
                {isKilled && sw?.reason && (
                  <p className="text-xs text-red-600 dark:text-red-400 mt-1">{sw.reason}</p>
                )}
                {isKilled && sw?.killedAt && (
                  <p className="text-xs text-gray-500 mt-0.5">Killed: {new Date(sw.killedAt).toLocaleString()}</p>
                )}
              </div>
              <button
                onClick={() => toggleSwitch(feature, !isKilled)}
                disabled={saving === feature}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${saving === feature ? 'opacity-50' : ''} ${
                  isKilled
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-red-600 text-white hover:bg-red-700'
                }`}
              >
                {isKilled ? 'Revive' : 'Kill'}
              </button>
            </div>
          )
        })}
      </div>
    </div>
  )
}
