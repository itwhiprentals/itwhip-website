// app/fleet/language/page.tsx
// i18n Language Management Dashboard — Phases 1-4
'use client'

import { useEffect, useState, useCallback } from 'react'
import Link from 'next/link'
import TranslationEditor from '../components/TranslationEditor'
import AddKeyModal from '../components/AddKeyModal'
import BulkTranslateReview from '../components/BulkTranslateReview'

// ─── Types ───────────────────────────────────────────────

interface LanguageInfo {
  code: string
  label: string
  flag: string
  totalKeys: number
  completion: number
  enabled: boolean
  isDefault: boolean
  lastModified: string | null
}

interface NamespaceInfo {
  name: string
  en: number
  [locale: string]: unknown
  status: string
  missing: Record<string, string[]>
  usedBy: string[]
}

interface PageInfo {
  path: string
  namespaces: string[]
  status: string
}

interface CoverageData {
  languages: LanguageInfo[]
  namespaces: NamespaceInfo[]
  pages: PageInfo[]
  summary: {
    totalNamespaces: number
    activeNamespaces: number
    unusedNamespaces: number
    totalKeys: Record<string, number>
    totalMissingKeys: Record<string, number>
  }
}

interface QualityIssue {
  severity: 'error' | 'warning' | 'info'
  check: string
  locale: string
  namespace: string
  key: string
  enValue: string
  localeValue: string
  message: string
}

interface QualityData {
  issues: QualityIssue[]
  summary: {
    total: number
    errors: number
    warnings: number
    info: number
    byLocale: Record<string, number>
    byCheck: Record<string, number>
  }
}

interface LookupResult {
  namespace: string
  key: string
  values: Record<string, string>
}

const FLEET_KEY = 'phoenix-fleet-2847'

// ─── Component ───────────────────────────────────────────

export default function LanguageDashboard() {
  const [coverage, setCoverage] = useState<CoverageData | null>(null)
  const [quality, setQuality] = useState<QualityData | null>(null)
  const [loading, setLoading] = useState(true)
  const [qualityLoading, setQualityLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Section state
  const [expandedNs, setExpandedNs] = useState<string | null>(null)
  const [nsFilter, setNsFilter] = useState<'all' | 'issues'>('all')
  const [pageFilter, setPageFilter] = useState<'all' | 'translated' | 'incomplete'>('all')
  const [qualityExpanded, setQualityExpanded] = useState(false)

  // Live Tester state
  const [testerNs, setTesterNs] = useState('')
  const [testerKey, setTesterKey] = useState('')
  const [testerResult, setTesterResult] = useState<LookupResult | null>(null)
  const [testerLoading, setTesterLoading] = useState(false)
  const [nsKeys, setNsKeys] = useState<string[]>([])

  // Editor state (Phase 2)
  const [editorOpen, setEditorOpen] = useState(false)
  const [editorNs, setEditorNs] = useState('')
  const [editorKey, setEditorKey] = useState('')
  const [addKeyOpen, setAddKeyOpen] = useState(false)
  const [deleteConfirm, setDeleteConfirm] = useState<{ ns: string; key: string } | null>(null)
  const [deleting, setDeleting] = useState(false)

  // AI Translation state (Phase 3)
  const [bulkReviewOpen, setBulkReviewOpen] = useState(false)
  const [bulkReviewLocale, setBulkReviewLocale] = useState('')
  const [bulkTranslations, setBulkTranslations] = useState<{ namespace: string; key: string; englishValue: string; translation: string }[]>([])
  const [aiGenerating, setAiGenerating] = useState(false)

  const handleTranslateMissing = async (locale: string) => {
    setAiGenerating(true)
    try {
      const res = await fetch(`/fleet/api/language/generate-missing?key=${FLEET_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ targetLocale: locale, namespaces: 'all' }),
      })
      if (!res.ok) throw new Error('Failed to generate')
      const data = await res.json()
      if (data.translations && data.translations.length > 0) {
        setBulkTranslations(data.translations)
        setBulkReviewLocale(locale)
        setBulkReviewOpen(true)
      }
    } catch (err) {
      console.error('AI translate failed:', err)
    } finally {
      setAiGenerating(false)
    }
  }

  const openEditor = (ns: string, key: string) => {
    setEditorNs(ns)
    setEditorKey(key)
    setEditorOpen(true)
  }

  const handleDelete = async () => {
    if (!deleteConfirm) return
    setDeleting(true)
    try {
      const res = await fetch(`/fleet/api/language/delete?key=${FLEET_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ namespace: deleteConfirm.ns, key: deleteConfirm.key }),
      })
      if (res.ok) {
        setDeleteConfirm(null)
        await fetchCoverage()
        await fetchQuality()
      }
    } catch { /* ignore */ }
    setDeleting(false)
  }

  const refreshAll = async () => {
    await Promise.all([fetchCoverage(), fetchQuality()])
  }

  const fetchCoverage = useCallback(async () => {
    try {
      const res = await fetch(`/fleet/api/language?key=${FLEET_KEY}`)
      if (!res.ok) throw new Error('Failed to fetch coverage')
      const data = await res.json()
      setCoverage(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    }
  }, [])

  const fetchQuality = useCallback(async () => {
    setQualityLoading(true)
    try {
      const res = await fetch(`/fleet/api/language/quality?key=${FLEET_KEY}`)
      if (!res.ok) throw new Error('Failed to fetch quality data')
      const data = await res.json()
      setQuality(data)
    } catch (err) {
      console.error('Quality check failed:', err)
    } finally {
      setQualityLoading(false)
    }
  }, [])

  useEffect(() => {
    const init = async () => {
      setLoading(true)
      await Promise.all([fetchCoverage(), fetchQuality()])
      setLoading(false)
    }
    init()
  }, [fetchCoverage, fetchQuality])

  // Live Tester: load keys when namespace changes
  useEffect(() => {
    if (!testerNs) {
      setNsKeys([])
      return
    }
    const loadKeys = async () => {
      try {
        const res = await fetch(`/fleet/api/language/lookup?key=${FLEET_KEY}&namespace=${testerNs}`)
        if (res.ok) {
          const data = await res.json()
          setNsKeys(data.keys || [])
        }
      } catch { /* ignore */ }
    }
    loadKeys()
  }, [testerNs])

  const lookupKey = async () => {
    if (!testerNs || !testerKey) return
    setTesterLoading(true)
    try {
      const res = await fetch(`/fleet/api/language/lookup?key=${FLEET_KEY}&namespace=${testerNs}&key=${testerKey}`)
      if (res.ok) {
        const data = await res.json()
        setTesterResult(data)
      }
    } catch { /* ignore */ }
    setTesterLoading(false)
  }

  const exportReport = () => {
    if (!coverage) return
    const blob = new Blob([JSON.stringify(coverage, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `itwhip-i18n-report-${new Date().toISOString().split('T')[0]}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  if (loading) {
    return (
      <div className="flex justify-center items-center p-12">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600 dark:border-gray-400" />
      </div>
    )
  }

  if (error || !coverage) {
    return (
      <div className="p-6 text-red-600 dark:text-red-400">
        Error: {error || 'Failed to load data'}
      </div>
    )
  }

  const nonEnLocales = coverage.languages.filter(l => l.code !== 'en').map(l => l.code)
  const allNamespaces = coverage.namespaces.map(ns => ns.name)
  const totalMissing = Object.values(coverage.summary.totalMissingKeys).reduce((a, b) => a + b, 0)

  // Filter namespaces
  const filteredNamespaces = nsFilter === 'issues'
    ? coverage.namespaces.filter(ns => ns.status === 'incomplete')
    : coverage.namespaces

  // Filter pages
  const filteredPages = pageFilter === 'all'
    ? coverage.pages
    : coverage.pages.filter(p => p.status === pageFilter)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">i18n Language Management</h1>
          <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">
            {coverage.summary.totalNamespaces} namespaces &middot; {coverage.languages.length} languages &middot; {coverage.summary.totalKeys['en']?.toLocaleString()} keys
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setAddKeyOpen(true)}
            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
          >
            + Add Key
          </button>
          <Link
            href="/fleet/language/changelog"
            className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300 inline-flex items-center"
          >
            Changelog
          </Link>
          <div className="relative group">
            <button
              onClick={exportReport}
              className="px-3 py-1.5 text-sm bg-white dark:bg-gray-800 border border-gray-300 dark:border-gray-600 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-gray-700 dark:text-gray-300"
            >
              Export
            </button>
            <div className="absolute right-0 mt-1 w-40 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-10">
              <button onClick={exportReport} className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-t-lg">
                JSON (Full Report)
              </button>
              <button
                onClick={() => window.open(`/fleet/api/language/export?key=${FLEET_KEY}&format=csv`, '_blank')}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                CSV (Spreadsheet)
              </button>
              <button
                onClick={() => window.open(`/fleet/api/language/export?key=${FLEET_KEY}&format=xliff&locale=es`, '_blank')}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
              >
                XLIFF (ES)
              </button>
              <button
                onClick={() => window.open(`/fleet/api/language/export?key=${FLEET_KEY}&format=xliff&locale=fr`, '_blank')}
                className="w-full text-left px-3 py-2 text-xs text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 rounded-b-lg"
              >
                XLIFF (FR)
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Section 1: Language Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {coverage.languages.map(lang => (
          <div
            key={lang.code}
            className="bg-white dark:bg-gray-800 rounded-lg p-4 border border-gray-200 dark:border-gray-700 shadow-sm"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">{lang.flag}</span>
                <div>
                  <span className="font-medium text-gray-900 dark:text-white">{lang.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{lang.code}</span>
                </div>
              </div>
              {lang.isDefault && (
                <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                  Default
                </span>
              )}
            </div>

            <div className="text-2xl font-bold text-gray-900 dark:text-white mb-1">
              {lang.totalKeys.toLocaleString()}
              <span className="text-sm font-normal text-gray-500 dark:text-gray-400 ml-1">keys</span>
            </div>

            {/* Completion bar */}
            <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mb-2">
              <div
                className={`h-1.5 rounded-full ${lang.completion === 100 ? 'bg-green-500' : lang.completion >= 95 ? 'bg-yellow-500' : 'bg-red-500'}`}
                style={{ width: `${lang.completion}%` }}
              />
            </div>

            <div className="flex items-center justify-between text-xs text-gray-500 dark:text-gray-400">
              <span>
                {lang.isDefault ? (
                  <span className="text-green-600 dark:text-green-400">Baseline</span>
                ) : lang.completion === 100 ? (
                  <span className="text-green-600 dark:text-green-400">Complete</span>
                ) : (
                  <span className="text-amber-600 dark:text-amber-400">
                    {coverage.summary.totalMissingKeys[lang.code] || 0} missing
                  </span>
                )}
              </span>
              <span>
                {lang.lastModified
                  ? new Date(lang.lastModified).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                  : '—'}
              </span>
            </div>

            {/* AI Translate Missing button */}
            {!lang.isDefault && lang.completion < 100 && (coverage.summary.totalMissingKeys[lang.code] || 0) > 0 && (
              <button
                onClick={() => handleTranslateMissing(lang.code)}
                disabled={aiGenerating}
                className="mt-2 w-full text-xs py-1.5 bg-purple-50 dark:bg-purple-900/20 text-purple-700 dark:text-purple-300 border border-purple-200 dark:border-purple-700 rounded-md hover:bg-purple-100 dark:hover:bg-purple-900/40 transition-colors disabled:opacity-50"
              >
                {aiGenerating ? 'Generating...' : `AI Translate ${coverage.summary.totalMissingKeys[lang.code]} Missing`}
              </button>
            )}
          </div>
        ))}
      </div>

      {/* Section 2: Quality Report */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Quality Report</h2>
          <button
            onClick={fetchQuality}
            disabled={qualityLoading}
            className="px-3 py-1 text-xs bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors text-gray-700 dark:text-gray-300"
          >
            {qualityLoading ? 'Checking...' : 'Run Check'}
          </button>
        </div>

        <div className="p-4">
          {!quality ? (
            <p className="text-sm text-gray-500 dark:text-gray-400">Loading quality data...</p>
          ) : quality.summary.total === 0 ? (
            <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-sm font-medium">All translations pass quality checks</span>
            </div>
          ) : (
            <div className="space-y-3">
              {/* Summary badges */}
              <div className="flex flex-wrap gap-2">
                {quality.summary.errors > 0 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-red-100 dark:bg-red-900/30 text-red-700 dark:text-red-300">
                    {quality.summary.errors} errors
                  </span>
                )}
                {quality.summary.warnings > 0 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-amber-100 dark:bg-amber-900/30 text-amber-700 dark:text-amber-300">
                    {quality.summary.warnings} warnings
                  </span>
                )}
                {quality.summary.info > 0 && (
                  <span className="px-2 py-1 text-xs rounded-full bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300">
                    {quality.summary.info} info
                  </span>
                )}
              </div>

              {/* Top issues summary */}
              <div className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                {Object.entries(quality.summary.byCheck).slice(0, 4).map(([check, count]) => (
                  <div key={check} className="flex items-center gap-2">
                    <span className={`w-1.5 h-1.5 rounded-full ${
                      ['missing_variables', 'icu_syntax'].includes(check) ? 'bg-red-500' :
                      ['empty', 'untranslated', 'html_mismatch'].includes(check) ? 'bg-amber-500' : 'bg-blue-500'
                    }`} />
                    <span>{count} {check.replace(/_/g, ' ')}</span>
                  </div>
                ))}
              </div>

              {/* Expandable issue list */}
              <button
                onClick={() => setQualityExpanded(!qualityExpanded)}
                className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
              >
                {qualityExpanded ? 'Hide Details' : `View All ${quality.summary.total} Issues`}
              </button>

              {qualityExpanded && (
                <div className="mt-3 space-y-2 max-h-96 overflow-y-auto">
                  {quality.issues.map((issue, i) => (
                    <div
                      key={i}
                      className={`p-3 rounded-md text-xs border ${
                        issue.severity === 'error'
                          ? 'bg-red-50 dark:bg-red-900/10 border-red-200 dark:border-red-800'
                          : issue.severity === 'warning'
                          ? 'bg-amber-50 dark:bg-amber-900/10 border-amber-200 dark:border-amber-800'
                          : 'bg-blue-50 dark:bg-blue-900/10 border-blue-200 dark:border-blue-800'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-mono font-medium text-gray-900 dark:text-gray-100">
                          {issue.namespace}.{issue.key}
                        </span>
                        <span className="text-gray-500 dark:text-gray-400 uppercase">{issue.locale}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-gray-600 dark:text-gray-400">{issue.message}</span>
                        <button
                          onClick={(e) => { e.stopPropagation(); openEditor(issue.namespace, issue.key) }}
                          className="text-blue-500 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium ml-2 flex-shrink-0"
                        >
                          Edit
                        </button>
                      </div>
                      <div className="mt-1 grid grid-cols-2 gap-2">
                        <div>
                          <span className="text-gray-400">EN:</span>{' '}
                          <span className="text-gray-700 dark:text-gray-300 break-all">{issue.enValue.slice(0, 80)}{issue.enValue.length > 80 ? '...' : ''}</span>
                        </div>
                        <div>
                          <span className="text-gray-400">{issue.locale.toUpperCase()}:</span>{' '}
                          <span className="text-gray-700 dark:text-gray-300 break-all">{issue.localeValue.slice(0, 80)}{issue.localeValue.length > 80 ? '...' : ''}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Section 3: Namespace Coverage Table */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Namespace Coverage
            <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
              ({filteredNamespaces.length} of {coverage.namespaces.length})
            </span>
          </h2>
          <select
            value={nsFilter}
            onChange={e => setNsFilter(e.target.value as 'all' | 'issues')}
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-md text-gray-700 dark:text-gray-300"
          >
            <option value="all">All Namespaces</option>
            <option value="issues">Issues Only</option>
          </select>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 dark:bg-gray-900/50 text-left text-xs text-gray-500 dark:text-gray-400">
                <th className="px-4 py-2 font-medium">Namespace</th>
                <th className="px-4 py-2 font-medium text-right">EN</th>
                {nonEnLocales.map(locale => (
                  <th key={locale} className="px-4 py-2 font-medium text-right">{locale.toUpperCase()}</th>
                ))}
                <th className="px-4 py-2 font-medium">Status</th>
                <th className="px-4 py-2 font-medium">Used By</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {filteredNamespaces.map(ns => {
                const isExpanded = expandedNs === ns.name
                const hasMissing = ns.status === 'incomplete'

                return (
                  <tr
                    key={ns.name}
                    className={`hover:bg-gray-50 dark:hover:bg-gray-700/30 cursor-pointer transition-colors ${isExpanded ? 'bg-gray-50 dark:bg-gray-700/20' : ''}`}
                    onClick={() => setExpandedNs(isExpanded ? null : ns.name)}
                  >
                    <td className="px-4 py-2 font-mono text-xs text-gray-900 dark:text-gray-100">
                      <div className="flex items-center gap-1">
                        <svg className={`w-3 h-3 text-gray-400 transition-transform ${isExpanded ? 'rotate-90' : ''}`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                        </svg>
                        {ns.name}
                      </div>
                      {/* Expanded row: show missing keys with edit buttons */}
                      {isExpanded && (
                        <div className="mt-2 ml-4 space-y-2" onClick={e => e.stopPropagation()}>
                          {nonEnLocales.map(locale => {
                            const missing = ns.missing?.[locale] || []
                            if (missing.length === 0) return null
                            return (
                              <div key={locale} className="text-xs">
                                <span className="text-amber-600 dark:text-amber-400 font-medium">{locale.toUpperCase()} missing:</span>
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {missing.slice(0, 15).map(k => (
                                    <button
                                      key={k}
                                      onClick={() => openEditor(ns.name, k)}
                                      className="px-1.5 py-0.5 bg-amber-50 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300 rounded border border-amber-200 dark:border-amber-700 hover:bg-amber-100 dark:hover:bg-amber-900/40 transition-colors font-mono"
                                    >
                                      {k}
                                    </button>
                                  ))}
                                  {missing.length > 15 && (
                                    <span className="px-1.5 py-0.5 text-gray-400">+{missing.length - 15} more</span>
                                  )}
                                </div>
                              </div>
                            )
                          })}
                          {!hasMissing && (
                            <span className="text-xs text-green-600 dark:text-green-400">All keys present in all languages</span>
                          )}
                        </div>
                      )}
                    </td>
                    <td className="px-4 py-2 text-right text-gray-600 dark:text-gray-400 tabular-nums">{ns.en}</td>
                    {nonEnLocales.map(locale => {
                      const count = (ns[locale] as number) || 0
                      const isMissing = count < ns.en
                      return (
                        <td key={locale} className={`px-4 py-2 text-right tabular-nums ${isMissing ? 'text-amber-600 dark:text-amber-400 font-medium' : 'text-gray-600 dark:text-gray-400'}`}>
                          {count}
                        </td>
                      )
                    })}
                    <td className="px-4 py-2">
                      {hasMissing ? (
                        <span className="text-xs text-amber-600 dark:text-amber-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          Missing
                        </span>
                      ) : (
                        <span className="text-xs text-green-600 dark:text-green-400 flex items-center gap-1">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          Complete
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-2 text-xs text-gray-400 dark:text-gray-500 max-w-[150px] truncate">
                      {ns.usedBy.length > 0 ? ns.usedBy.slice(0, 2).join(', ') : '—'}
                      {ns.usedBy.length > 2 && ` +${ns.usedBy.length - 2}`}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Section 4: Live Translation Tester */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Live Translation Tester</h2>
        </div>
        <div className="p-4 space-y-3">
          <div className="flex flex-col sm:flex-row gap-3">
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Namespace</label>
              <select
                value={testerNs}
                onChange={e => { setTesterNs(e.target.value); setTesterKey(''); setTesterResult(null) }}
                className="w-full text-sm px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
              >
                <option value="">Select namespace...</option>
                {allNamespaces.map(ns => (
                  <option key={ns} value={ns}>{ns}</option>
                ))}
              </select>
            </div>
            <div className="flex-1">
              <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Key</label>
              <div className="flex gap-2">
                <select
                  value={testerKey}
                  onChange={e => { setTesterKey(e.target.value); setTesterResult(null) }}
                  disabled={!testerNs}
                  className="flex-1 text-sm px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 disabled:opacity-50"
                >
                  <option value="">Select key...</option>
                  {nsKeys.map(k => (
                    <option key={k} value={k}>{k}</option>
                  ))}
                </select>
                <button
                  onClick={lookupKey}
                  disabled={!testerNs || !testerKey || testerLoading}
                  className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-50"
                >
                  {testerLoading ? '...' : 'Lookup'}
                </button>
              </div>
            </div>
          </div>

          {testerResult && (
            <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-3 space-y-2">
              {coverage.languages.map(lang => (
                <div key={lang.code} className="flex items-start gap-3 text-sm">
                  <span className="w-6 text-center flex-shrink-0">{lang.flag}</span>
                  <span className="text-gray-500 dark:text-gray-400 w-6 flex-shrink-0 uppercase text-xs pt-0.5">{lang.code}</span>
                  <span className={`flex-1 ${testerResult.values[lang.code] ? 'text-gray-900 dark:text-gray-100' : 'text-red-400 dark:text-red-500 italic'}`}>
                    {testerResult.values[lang.code] || '(missing)'}
                  </span>
                </div>
              ))}
              <div className="pt-2 border-t border-gray-200 dark:border-gray-700 flex gap-2">
                <button
                  onClick={() => openEditor(testerNs, testerKey)}
                  className="text-xs text-blue-600 dark:text-blue-400 hover:underline"
                >
                  Edit this key
                </button>
                <button
                  onClick={() => setDeleteConfirm({ ns: testerNs, key: testerKey })}
                  className="text-xs text-red-500 dark:text-red-400 hover:underline"
                >
                  Delete
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Section 5: Page Translation Status */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            Page Translation Status
            <span className="text-gray-500 dark:text-gray-400 font-normal ml-2">
              ({filteredPages.length})
            </span>
          </h2>
          <select
            value={pageFilter}
            onChange={e => setPageFilter(e.target.value as 'all' | 'translated' | 'incomplete')}
            className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 border-0 rounded-md text-gray-700 dark:text-gray-300"
          >
            <option value="all">All Pages</option>
            <option value="translated">Translated</option>
            <option value="incomplete">Incomplete</option>
          </select>
        </div>

        <div className="divide-y divide-gray-100 dark:divide-gray-700/50 max-h-64 overflow-y-auto">
          {filteredPages.map(page => (
            <div key={page.path} className="px-4 py-2 flex items-center justify-between text-sm">
              <div className="flex items-center gap-2 min-w-0">
                <span className="font-mono text-xs text-gray-700 dark:text-gray-300 truncate">{page.path}</span>
                <span className="text-xs text-gray-400 dark:text-gray-500 hidden sm:inline">
                  ({page.namespaces.join(', ')})
                </span>
              </div>
              <span className={`flex-shrink-0 text-xs flex items-center gap-1 ${
                page.status === 'translated'
                  ? 'text-green-600 dark:text-green-400'
                  : 'text-amber-600 dark:text-amber-400'
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full ${page.status === 'translated' ? 'bg-green-500' : 'bg-amber-500'}`} />
                {page.status === 'translated' ? 'Translated' : 'Incomplete'}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Section 6: Language Management */}
      <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 shadow-sm">
        <div className="p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Language Management</h2>
        </div>
        <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
          {coverage.languages.map(lang => (
            <div key={lang.code} className="px-4 py-3 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-xl">{lang.flag}</span>
                <div>
                  <span className="text-sm font-medium text-gray-900 dark:text-white">{lang.label}</span>
                  <span className="text-xs text-gray-500 dark:text-gray-400 ml-2">{lang.code}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {lang.isDefault && (
                  <span className="text-xs px-2 py-0.5 bg-blue-100 dark:bg-blue-900/30 text-blue-700 dark:text-blue-300 rounded-full">
                    Default
                  </span>
                )}
                <span className="text-xs px-2 py-0.5 bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300 rounded-full">
                  Enabled
                </span>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 border-t border-gray-200 dark:border-gray-700">
          <Link
            href="/fleet/language/add"
            className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 hover:underline"
          >
            + Add Language
          </Link>
        </div>
      </div>

      {/* Summary Footer */}
      <div className="text-center text-xs text-gray-400 dark:text-gray-500 pb-4">
        {totalMissing === 0 ? (
          <span className="text-green-500">All translations complete across {coverage.languages.length} languages</span>
        ) : (
          <span>{totalMissing} total missing keys across all languages</span>
        )}
        {' '}&middot; Last scanned: {new Date().toLocaleString()}
      </div>

      {/* Translation Editor Modal (Phase 2) */}
      <TranslationEditor
        isOpen={editorOpen}
        onClose={() => setEditorOpen(false)}
        namespace={editorNs}
        keyPath={editorKey}
        languages={coverage.languages.map(l => ({ code: l.code, label: l.label, flag: l.flag }))}
        onSaved={refreshAll}
      />

      {/* Add Key Modal (Phase 2) */}
      <AddKeyModal
        isOpen={addKeyOpen}
        onClose={() => setAddKeyOpen(false)}
        languages={coverage.languages.map(l => ({ code: l.code, label: l.label, flag: l.flag }))}
        namespaces={allNamespaces}
        onAdded={refreshAll}
      />

      {/* Bulk Translate Review Modal (Phase 3) */}
      <BulkTranslateReview
        isOpen={bulkReviewOpen}
        onClose={() => { setBulkReviewOpen(false); setBulkTranslations([]) }}
        targetLocale={bulkReviewLocale}
        translations={bulkTranslations}
        onApproved={refreshAll}
      />

      {/* Delete Confirmation Dialog (Phase 2) */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm" onClick={() => setDeleteConfirm(null)}>
          <div
            className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-sm mx-4 p-6"
            onClick={e => e.stopPropagation()}
          >
            <h3 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Delete Translation Key</h3>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-1">
              Are you sure you want to delete:
            </p>
            <p className="text-sm font-mono text-red-600 dark:text-red-400 mb-4">
              {deleteConfirm.ns}.{deleteConfirm.key}
            </p>
            <p className="text-xs text-gray-500 dark:text-gray-400 mb-4">
              This will remove the key from all {coverage.languages.length} language files. This can be undone from the changelog.
            </p>
            <div className="flex justify-end gap-2">
              <button
                onClick={() => setDeleteConfirm(null)}
                className="px-3 py-1.5 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleDelete}
                disabled={deleting}
                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-md transition-colors disabled:opacity-50"
              >
                {deleting ? 'Deleting...' : 'Delete Key'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
