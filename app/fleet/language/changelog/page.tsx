// app/fleet/language/changelog/page.tsx
// Translation Change Log + Version History — Phase 5
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'

const FLEET_KEY = 'phoenix-fleet-2847'

interface ChangelogEntry {
  id: string
  timestamp: string
  action: string
  locale: string
  namespace: string
  key: string
  oldValue: string
  newValue: string
  author: string
  source: string
}

interface Snapshot {
  filename: string
  locale: string
  timestamp: string
  sizeKB: number
}

interface DiffResult {
  locale: string
  snapshotDate: string
  snapshotKeys: number
  currentKeys: number
  added: number
  removed: number
  changed: number
  details: {
    added: string[]
    removed: string[]
    changed: { key: string; from: string; to: string }[]
  }
}

export default function ChangelogPage() {
  const [entries, setEntries] = useState<ChangelogEntry[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [snapshots, setSnapshots] = useState<Snapshot[]>([])
  const [snapshotsLoading, setSnapshotsLoading] = useState(true)

  // Filters
  const [filterLocale, setFilterLocale] = useState('')
  const [filterAction, setFilterAction] = useState('')
  const [filterSource, setFilterSource] = useState('')

  // Diff modal
  const [diffData, setDiffData] = useState<DiffResult | null>(null)
  const [diffFilename, setDiffFilename] = useState('')
  const [diffLoading, setDiffLoading] = useState(false)
  const [rolling, setRolling] = useState(false)

  // Undo state
  const [undoing, setUndoing] = useState<string | null>(null)

  // Create snapshot
  const [snapshotting, setSnapshotting] = useState(false)

  const fetchChangelog = useCallback(async () => {
    setLoading(true)
    try {
      const params = new URLSearchParams({ key: FLEET_KEY, limit: '200' })
      if (filterLocale) params.set('locale', filterLocale)
      if (filterAction) params.set('action', filterAction)
      if (filterSource) params.set('source', filterSource)

      const res = await fetch(`/fleet/api/language/changelog?${params}`)
      if (res.ok) {
        const data = await res.json()
        setEntries(data.entries || [])
        setTotal(data.total || 0)
      }
    } catch { /* ignore */ }
    setLoading(false)
  }, [filterLocale, filterAction, filterSource])

  const fetchSnapshots = useCallback(async () => {
    setSnapshotsLoading(true)
    try {
      const res = await fetch(`/fleet/api/language/snapshot?key=${FLEET_KEY}`)
      if (res.ok) {
        const data = await res.json()
        setSnapshots(data.snapshots || [])
      }
    } catch { /* ignore */ }
    setSnapshotsLoading(false)
  }, [])

  useEffect(() => {
    fetchChangelog()
    fetchSnapshots()
  }, [fetchChangelog, fetchSnapshots])

  const handleUndo = async (entryId: string) => {
    setUndoing(entryId)
    try {
      const res = await fetch(`/fleet/api/language/changelog?key=${FLEET_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ entryId }),
      })
      if (res.ok) {
        await fetchChangelog()
      }
    } catch { /* ignore */ }
    setUndoing(null)
  }

  const handleCreateSnapshot = async () => {
    setSnapshotting(true)
    try {
      const res = await fetch(`/fleet/api/language/snapshot?key=${FLEET_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({}),
      })
      if (res.ok) {
        await fetchSnapshots()
      }
    } catch { /* ignore */ }
    setSnapshotting(false)
  }

  const handlePreviewDiff = async (filename: string) => {
    setDiffLoading(true)
    setDiffFilename(filename)
    try {
      const res = await fetch(`/fleet/api/language/rollback?key=${FLEET_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename, preview: true }),
      })
      if (res.ok) {
        const data = await res.json()
        setDiffData(data.diff)
      }
    } catch { /* ignore */ }
    setDiffLoading(false)
  }

  const handleRollback = async () => {
    if (!diffFilename) return
    setRolling(true)
    try {
      const res = await fetch(`/fleet/api/language/rollback?key=${FLEET_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ filename: diffFilename, preview: false }),
      })
      if (res.ok) {
        setDiffData(null)
        setDiffFilename('')
        await Promise.all([fetchChangelog(), fetchSnapshots()])
      }
    } catch { /* ignore */ }
    setRolling(false)
  }

  const actionColor = (action: string) => {
    switch (action) {
      case 'update': return 'bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300'
      case 'add': return 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
      case 'delete': return 'bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300'
      case 'rollback': return 'bg-purple-100 dark:bg-purple-900/30 text-purple-700 dark:text-purple-300'
      case 'import': return 'bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300'
      case 'bulk-update': return 'bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300'
      default: return 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
    }
  }

  const sourceIcon = (source: string) => {
    switch (source) {
      case 'ai-generated': return 'AI'
      case 'manual': return 'M'
      case 'imported': return 'IMP'
      case 'system': return 'SYS'
      default: return source.slice(0, 3).toUpperCase()
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Link href="/fleet/language" className="text-sm text-blue-600 dark:text-blue-400 hover:underline">
              Language
            </Link>
            <span className="text-gray-400">/</span>
            <span className="text-sm text-gray-900 dark:text-white">Changelog</span>
          </div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Translation Change Log</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {total} entries recorded
          </p>
        </div>
        <button
          onClick={handleCreateSnapshot}
          disabled={snapshotting}
          className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {snapshotting ? 'Creating...' : 'Create Snapshot'}
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-3">
        <select
          value={filterLocale}
          onChange={e => setFilterLocale(e.target.value)}
          className="text-xs px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
        >
          <option value="">All Locales</option>
          <option value="en">EN</option>
          <option value="es">ES</option>
          <option value="fr">FR</option>
        </select>
        <select
          value={filterAction}
          onChange={e => setFilterAction(e.target.value)}
          className="text-xs px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
        >
          <option value="">All Actions</option>
          <option value="update">Update</option>
          <option value="add">Add</option>
          <option value="delete">Delete</option>
          <option value="rollback">Rollback</option>
          <option value="import">Import</option>
          <option value="bulk-update">Bulk Update</option>
        </select>
        <select
          value={filterSource}
          onChange={e => setFilterSource(e.target.value)}
          className="text-xs px-2 py-1.5 bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-md text-gray-700 dark:text-gray-300"
        >
          <option value="">All Sources</option>
          <option value="manual">Manual</option>
          <option value="ai-generated">AI Generated</option>
          <option value="imported">Imported</option>
          <option value="system">System</option>
        </select>
      </div>

      {/* Changelog Entries */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Recent Changes</h2>
        </div>

        {loading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 dark:border-gray-400 mx-auto" />
          </div>
        ) : entries.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No changelog entries found. Changes will appear here as translations are edited.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50 max-h-[500px] overflow-y-auto">
            {entries.map(entry => (
              <div key={entry.id} className="px-4 py-3 text-sm">
                <div className="flex items-center justify-between mb-1">
                  <div className="flex items-center gap-2">
                    <span className={`px-1.5 py-0.5 text-xs rounded ${actionColor(entry.action)}`}>
                      {entry.action}
                    </span>
                    <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded">
                      {sourceIcon(entry.source)}
                    </span>
                    <span className="font-mono text-xs text-gray-900 dark:text-gray-100">
                      {entry.namespace}.{entry.key}
                    </span>
                    <span className="text-xs text-gray-400 uppercase">{entry.locale}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">
                      {new Date(entry.timestamp).toLocaleString('en-US', {
                        month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
                      })}
                    </span>
                    {entry.action !== 'rollback' && entry.action !== 'import' && (
                      <button
                        onClick={() => handleUndo(entry.id)}
                        disabled={undoing === entry.id}
                        className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                      >
                        {undoing === entry.id ? 'Undoing...' : 'Undo'}
                      </button>
                    )}
                  </div>
                </div>

                {/* Value changes */}
                {entry.oldValue && entry.newValue && entry.key !== '*' && (
                  <div className="mt-1 grid grid-cols-2 gap-2 text-xs">
                    <div className="bg-red-50 dark:bg-red-900/10 px-2 py-1 rounded text-red-700 dark:text-red-300 truncate">
                      - {entry.oldValue.slice(0, 100)}
                    </div>
                    <div className="bg-green-50 dark:bg-green-900/10 px-2 py-1 rounded text-green-700 dark:text-green-300 truncate">
                      + {entry.newValue.slice(0, 100)}
                    </div>
                  </div>
                )}

                {/* Bulk/import summary */}
                {entry.key === '*' && entry.newValue && (
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    {entry.newValue}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Version Snapshots */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Version Snapshots</h2>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Automatic backups created before each write operation. Max 20 per language.
          </p>
        </div>

        {snapshotsLoading ? (
          <div className="p-6 text-center">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-gray-600 dark:border-gray-400 mx-auto" />
          </div>
        ) : snapshots.length === 0 ? (
          <div className="p-6 text-center text-sm text-gray-500 dark:text-gray-400">
            No snapshots yet. Snapshots are created automatically when translations are modified.
          </div>
        ) : (
          <div className="divide-y divide-gray-100 dark:divide-gray-700/50 max-h-[400px] overflow-y-auto">
            {snapshots.map(snap => (
              <div key={snap.filename} className="px-4 py-2.5 flex items-center justify-between text-sm">
                <div className="flex items-center gap-3">
                  <span className="text-xs px-1.5 py-0.5 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded uppercase">
                    {snap.locale}
                  </span>
                  <span className="text-xs text-gray-700 dark:text-gray-300">
                    {new Date(snap.timestamp).toLocaleString('en-US', {
                      month: 'short', day: 'numeric', year: 'numeric',
                      hour: '2-digit', minute: '2-digit'
                    })}
                  </span>
                  <span className="text-xs text-gray-400">{snap.sizeKB} KB</span>
                </div>
                <button
                  onClick={() => handlePreviewDiff(snap.filename)}
                  disabled={diffLoading && diffFilename === snap.filename}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline disabled:opacity-50"
                >
                  {diffLoading && diffFilename === snap.filename ? 'Loading...' : 'Diff & Rollback'}
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Diff Modal */}
      {diffData && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => { setDiffData(null); setDiffFilename('') }}>
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl mx-4 max-h-[80vh] overflow-y-auto"
            onClick={e => e.stopPropagation()}
          >
            <div className="p-4 border-b border-gray-200 dark:border-gray-700">
              <h3 className="text-sm font-semibold text-gray-900 dark:text-white">
                Rollback Preview — {diffData.locale.toUpperCase()}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                Snapshot from {new Date(diffData.snapshotDate).toLocaleString()}
              </p>
            </div>

            <div className="p-4 space-y-4">
              {/* Summary */}
              <div className="grid grid-cols-3 gap-3">
                <div className="text-center p-3 bg-green-50 dark:bg-green-900/10 rounded-lg">
                  <div className="text-lg font-bold text-green-700 dark:text-green-300">{diffData.added}</div>
                  <div className="text-xs text-green-600 dark:text-green-400">Keys to restore</div>
                </div>
                <div className="text-center p-3 bg-red-50 dark:bg-red-900/10 rounded-lg">
                  <div className="text-lg font-bold text-red-700 dark:text-red-300">{diffData.removed}</div>
                  <div className="text-xs text-red-600 dark:text-red-400">Keys to remove</div>
                </div>
                <div className="text-center p-3 bg-blue-50 dark:bg-blue-900/10 rounded-lg">
                  <div className="text-lg font-bold text-blue-700 dark:text-blue-300">{diffData.changed}</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">Values changed</div>
                </div>
              </div>

              <div className="text-xs text-gray-500 dark:text-gray-400">
                Current: {diffData.currentKeys} keys | Snapshot: {diffData.snapshotKeys} keys
              </div>

              {/* Changed details */}
              {diffData.details.changed.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-2">Changed Values</h4>
                  <div className="space-y-1 max-h-48 overflow-y-auto">
                    {diffData.details.changed.map((c, i) => (
                      <div key={i} className="text-xs font-mono bg-gray-50 dark:bg-gray-900/50 p-2 rounded">
                        <div className="text-gray-600 dark:text-gray-400 mb-1">{c.key}</div>
                        <div className="text-red-600 dark:text-red-400 truncate">- {c.from}</div>
                        <div className="text-green-600 dark:text-green-400 truncate">+ {c.to}</div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Added/removed keys */}
              {diffData.details.added.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Keys to Restore ({diffData.added})</h4>
                  <div className="text-xs text-green-600 dark:text-green-400 font-mono space-y-0.5 max-h-24 overflow-y-auto">
                    {diffData.details.added.map(k => <div key={k}>+ {k}</div>)}
                  </div>
                </div>
              )}

              {diffData.details.removed.length > 0 && (
                <div>
                  <h4 className="text-xs font-medium text-gray-700 dark:text-gray-300 mb-1">Keys to Remove ({diffData.removed})</h4>
                  <div className="text-xs text-red-600 dark:text-red-400 font-mono space-y-0.5 max-h-24 overflow-y-auto">
                    {diffData.details.removed.map(k => <div key={k}>- {k}</div>)}
                  </div>
                </div>
              )}

              {diffData.added === 0 && diffData.removed === 0 && diffData.changed === 0 && (
                <div className="text-center text-sm text-green-600 dark:text-green-400 py-4">
                  No differences found — this snapshot matches the current state.
                </div>
              )}
            </div>

            <div className="p-4 border-t border-gray-200 dark:border-gray-700 flex justify-end gap-2">
              <button
                onClick={() => { setDiffData(null); setDiffFilename('') }}
                className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              {(diffData.added > 0 || diffData.removed > 0 || diffData.changed > 0) && (
                <button
                  onClick={handleRollback}
                  disabled={rolling}
                  className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  {rolling ? 'Rolling back...' : 'Apply Rollback'}
                </button>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
