// app/fleet/language/add/page.tsx
// Add Language Wizard — 4-step flow to add a new language
// Phase 4 of Fleet Language Admin
'use client'

import { useState } from 'react'
import Link from 'next/link'

const FLEET_KEY = 'phoenix-fleet-2847'

const COMMON_LANGUAGES = [
  { code: 'de', label: 'Deutsch', flag: '🇩🇪', region: 'German' },
  { code: 'it', label: 'Italiano', flag: '🇮🇹', region: 'Italian' },
  { code: 'pt-BR', label: 'Português', flag: '🇧🇷', region: 'Brazilian Portuguese' },
  { code: 'pt-PT', label: 'Português', flag: '🇵🇹', region: 'European Portuguese' },
  { code: 'ja', label: '日本語', flag: '🇯🇵', region: 'Japanese' },
  { code: 'ko', label: '한국어', flag: '🇰🇷', region: 'Korean' },
  { code: 'zh-CN', label: '简体中文', flag: '🇨🇳', region: 'Simplified Chinese' },
  { code: 'zh-TW', label: '繁體中文', flag: '🇹🇼', region: 'Traditional Chinese' },
  { code: 'ar', label: 'العربية', flag: '🇸🇦', region: 'Arabic' },
  { code: 'es-MX', label: 'Español (México)', flag: '🇲🇽', region: 'Mexican Spanish' },
  { code: 'en-GB', label: 'English (UK)', flag: '🇬🇧', region: 'British English' },
  { code: 'nl', label: 'Nederlands', flag: '🇳🇱', region: 'Dutch' },
  { code: 'ru', label: 'Русский', flag: '🇷🇺', region: 'Russian' },
  { code: 'hi', label: 'हिन्दी', flag: '🇮🇳', region: 'Hindi' },
  { code: 'sv', label: 'Svenska', flag: '🇸🇪', region: 'Swedish' },
  { code: 'pl', label: 'Polski', flag: '🇵🇱', region: 'Polish' },
]

type Step = 1 | 2 | 3 | 4

interface AddResult {
  success: boolean
  code: string
  label: string
  totalKeys: number
  translated: number
  strategy: string
  tokensUsed?: number
  manualSteps: string[]
}

export default function AddLanguagePage() {
  const [step, setStep] = useState<Step>(1)

  // Step 1 — Language Selection
  const [code, setCode] = useState('')
  const [label, setLabel] = useState('')
  const [flag, setFlag] = useState('')
  const [region, setRegion] = useState('')
  const [styleNote, setStyleNote] = useState('')
  const [isCustom, setIsCustom] = useState(false)

  // Step 2 — Strategy
  const [strategy, setStrategy] = useState<'ai-auto' | 'empty'>('ai-auto')

  // Step 3 — Progress
  const [adding, setAdding] = useState(false)
  const [progress, setProgress] = useState('')
  const [error, setError] = useState<string | null>(null)

  // Step 4 — Result
  const [result, setResult] = useState<AddResult | null>(null)

  const selectPreset = (lang: typeof COMMON_LANGUAGES[0]) => {
    setCode(lang.code)
    setLabel(lang.label)
    setFlag(lang.flag)
    setRegion(lang.region)
    setIsCustom(false)
  }

  const canProceedStep1 = code && label && flag
  const canProceedStep2 = true

  const handleAddLanguage = async () => {
    setAdding(true)
    setError(null)
    setProgress('Creating language file and translating...')

    try {
      const res = await fetch(`/fleet/api/language/add-language?key=${FLEET_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          code,
          label,
          flag,
          region,
          styleNote,
          translationStrategy: strategy,
        }),
      })

      const data = await res.json()

      if (!res.ok) {
        throw new Error(data.error || 'Failed to add language')
      }

      setResult(data)
      setStep(4)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to add language')
    } finally {
      setAdding(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <Link
          href="/fleet/language"
          className="text-sm text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
        >
          &larr; Back
        </Link>
        <h1 className="text-xl font-semibold text-gray-900 dark:text-white">Add New Language</h1>
      </div>

      {/* Step indicator */}
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4].map(s => (
          <div key={s} className="flex items-center gap-2">
            <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium ${
              s === step ? 'bg-blue-600 text-white' :
              s < step ? 'bg-green-500 text-white' :
              'bg-gray-200 dark:bg-gray-700 text-gray-500 dark:text-gray-400'
            }`}>
              {s < step ? '✓' : s}
            </div>
            {s < 4 && <div className={`w-8 h-0.5 ${s < step ? 'bg-green-500' : 'bg-gray-200 dark:bg-gray-700'}`} />}
          </div>
        ))}
        <span className="text-xs text-gray-400 dark:text-gray-500 ml-2">
          {step === 1 ? 'Language' : step === 2 ? 'Strategy' : step === 3 ? 'Translating' : 'Done'}
        </span>
      </div>

      {/* Step 1: Language Selection */}
      {step === 1 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-6">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Select Language</h2>

          {/* Preset grid */}
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {COMMON_LANGUAGES.map(lang => (
              <button
                key={lang.code}
                onClick={() => selectPreset(lang)}
                className={`p-3 rounded-lg border text-left text-sm transition-colors ${
                  code === lang.code && !isCustom
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
                }`}
              >
                <span className="text-lg mr-2">{lang.flag}</span>
                <span className="text-gray-900 dark:text-gray-100 font-medium">{lang.label}</span>
                <div className="text-xs text-gray-500 dark:text-gray-400 mt-0.5">{lang.code}</div>
              </button>
            ))}
          </div>

          {/* Custom option */}
          <div>
            <button
              onClick={() => { setIsCustom(true); setCode(''); setLabel(''); setFlag(''); setRegion('') }}
              className={`text-xs ${isCustom ? 'text-blue-600 dark:text-blue-400 font-medium' : 'text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'}`}
            >
              + Custom language code
            </button>
          </div>

          {isCustom && (
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Code (BCP 47)</label>
                <input
                  value={code}
                  onChange={e => setCode(e.target.value)}
                  placeholder="pt-BR"
                  className="w-full text-sm px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 font-mono"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Display Name</label>
                <input
                  value={label}
                  onChange={e => setLabel(e.target.value)}
                  placeholder="Português"
                  className="w-full text-sm px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Flag Emoji</label>
                <input
                  value={flag}
                  onChange={e => setFlag(e.target.value)}
                  placeholder="🇧🇷"
                  className="w-full text-sm px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">Region/Variant</label>
                <input
                  value={region}
                  onChange={e => setRegion(e.target.value)}
                  placeholder="Brazilian Portuguese"
                  className="w-full text-sm px-3 py-1.5 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100"
                />
              </div>
            </div>
          )}

          {/* Style note */}
          <div>
            <label className="block text-xs text-gray-500 dark:text-gray-400 mb-1">
              Translation Style Note (optional — guides the AI translator)
            </label>
            <textarea
              value={styleNote}
              onChange={e => setStyleNote(e.target.value)}
              rows={2}
              placeholder='e.g. "Use Brazilian Portuguese, informal "você" form. Target audience: Brazilian tourists visiting Arizona."'
              className="w-full text-sm px-3 py-2 bg-white dark:bg-gray-900 border border-gray-300 dark:border-gray-600 rounded-md text-gray-900 dark:text-gray-100 resize-y"
            />
          </div>

          <div className="flex justify-end">
            <button
              onClick={() => setStep(2)}
              disabled={!canProceedStep1}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-30"
            >
              Next &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 2: Translation Strategy */}
      {step === 2 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">Translation Strategy</h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Adding <span className="font-medium text-gray-900 dark:text-white">{flag} {label}</span> ({code})
          </p>

          <div className="space-y-3">
            <label
              className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                strategy === 'ai-auto'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <input
                type="radio"
                name="strategy"
                checked={strategy === 'ai-auto'}
                onChange={() => setStrategy('ai-auto')}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <span className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center ${
                  strategy === 'ai-auto' ? 'border-blue-600' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {strategy === 'ai-auto' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">
                    AI Auto-Translate All (recommended)
                  </div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    Claude will translate all keys to {label}. You review before publishing.
                  </div>
                </div>
              </div>
            </label>

            <label
              className={`block p-4 rounded-lg border cursor-pointer transition-colors ${
                strategy === 'empty'
                  ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                  : 'border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <input
                type="radio"
                name="strategy"
                checked={strategy === 'empty'}
                onChange={() => setStrategy('empty')}
                className="sr-only"
              />
              <div className="flex items-start gap-3">
                <span className={`w-4 h-4 mt-0.5 rounded-full border-2 flex items-center justify-center ${
                  strategy === 'empty' ? 'border-blue-600' : 'border-gray-300 dark:border-gray-600'
                }`}>
                  {strategy === 'empty' && <span className="w-2 h-2 rounded-full bg-blue-600" />}
                </span>
                <div>
                  <div className="text-sm font-medium text-gray-900 dark:text-white">Start Empty</div>
                  <div className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                    All keys will be blank. Translate manually or in batches later.
                  </div>
                </div>
              </div>
            </label>
          </div>

          <div className="flex justify-between">
            <button
              onClick={() => setStep(1)}
              className="px-4 py-2 text-sm text-gray-700 dark:text-gray-300 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-md transition-colors"
            >
              &larr; Back
            </button>
            <button
              onClick={() => { setStep(3); handleAddLanguage() }}
              disabled={!canProceedStep2}
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors disabled:opacity-30"
            >
              {strategy === 'ai-auto' ? 'Start Translation' : 'Create Language'} &rarr;
            </button>
          </div>
        </div>
      )}

      {/* Step 3: Progress */}
      {step === 3 && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <h2 className="text-sm font-semibold text-gray-900 dark:text-white">
            {adding ? 'Translating...' : error ? 'Error' : 'Complete'}
          </h2>

          {adding && (
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-600" />
                <span className="text-sm text-gray-600 dark:text-gray-400">{progress}</span>
              </div>
              <p className="text-xs text-gray-400">
                {strategy === 'ai-auto'
                  ? 'This may take a few minutes. Claude is translating all keys across every namespace.'
                  : 'Creating language file...'}
              </p>
            </div>
          )}

          {error && (
            <div className="space-y-3">
              <div className="p-3 bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-md text-sm text-red-700 dark:text-red-300">
                {error}
              </div>
              <button
                onClick={() => { setError(null); handleAddLanguage() }}
                className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
              >
                Retry
              </button>
            </div>
          )}
        </div>
      )}

      {/* Step 4: Result */}
      {step === 4 && result && (
        <div className="bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-6 space-y-4">
          <div className="flex items-center gap-2 text-green-600 dark:text-green-400">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
            <h2 className="text-sm font-semibold">Language Added Successfully</h2>
          </div>

          <div className="bg-gray-50 dark:bg-gray-900/50 rounded-md p-4 space-y-2">
            <div className="text-sm text-gray-900 dark:text-gray-100">
              <span className="text-xl mr-2">{flag}</span>
              <span className="font-medium">{label}</span>
              <span className="text-gray-400 ml-2">({code})</span>
            </div>
            <div className="text-xs text-gray-500 dark:text-gray-400 space-y-1">
              <div>Total keys: {result.totalKeys.toLocaleString()}</div>
              <div>Translated: {result.translated.toLocaleString()}</div>
              {result.tokensUsed && <div>Tokens used: {result.tokensUsed.toLocaleString()}</div>}
              <div>Strategy: {result.strategy}</div>
            </div>
          </div>

          {result.manualSteps.length > 0 && (
            <div>
              <h3 className="text-xs font-semibold text-gray-900 dark:text-white mb-2">Manual Steps Required:</h3>
              <div className="space-y-1.5">
                {result.manualSteps.map((step, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-gray-600 dark:text-gray-400">
                    <span className="w-4 h-4 rounded border border-gray-300 dark:border-gray-600 flex-shrink-0 mt-0.5" />
                    <span>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex gap-2 pt-2">
            <Link
              href="/fleet/language"
              className="px-4 py-2 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors"
            >
              Go to Dashboard
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}
