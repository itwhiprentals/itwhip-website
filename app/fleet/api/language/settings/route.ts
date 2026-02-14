// app/fleet/api/language/settings/route.ts
// Language Settings API — enable/disable languages, get config
// Phase 4 of Fleet Language Admin

import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'
import { validateFleetKey } from '../../choe/auth'

const LANGUAGE_META: Record<string, { label: string; flag: string }> = {
  en: { label: 'English', flag: '🇺🇸' },
  es: { label: 'Español', flag: '🇪🇸' },
  fr: { label: 'Français', flag: '🇫🇷' },
  de: { label: 'Deutsch', flag: '🇩🇪' },
  it: { label: 'Italiano', flag: '🇮🇹' },
  pt: { label: 'Português', flag: '🇵🇹' },
  'pt-BR': { label: 'Português (Brasil)', flag: '🇧🇷' },
  ja: { label: '日本語', flag: '🇯🇵' },
  ko: { label: '한국어', flag: '🇰🇷' },
  'zh-CN': { label: '简体中文', flag: '🇨🇳' },
  'zh-TW': { label: '繁體中文', flag: '🇹🇼' },
  ar: { label: 'العربية', flag: '🇸🇦' },
  'es-MX': { label: 'Español (México)', flag: '🇲🇽' },
  'en-GB': { label: 'English (UK)', flag: '🇬🇧' },
}

interface LanguageSettings {
  languages: {
    code: string
    label: string
    flag: string
    enabled: boolean
    isDefault: boolean
  }[]
  defaultLanguage: string
  enabledLanguages: string[]
}

function getSettingsPath(): string {
  return path.join(process.cwd(), 'messages', '.settings.json')
}

function loadSettings(): LanguageSettings {
  const settingsPath = getSettingsPath()
  try {
    if (fs.existsSync(settingsPath)) {
      return JSON.parse(fs.readFileSync(settingsPath, 'utf-8'))
    }
  } catch { /* build from files */ }

  // Build from available files
  const messagesDir = path.join(process.cwd(), 'messages')
  const files = fs.readdirSync(messagesDir).filter(f => f.endsWith('.json') && !f.startsWith('.'))
  const codes = files.map(f => f.replace('.json', ''))

  const languages = codes.map(code => {
    const meta = LANGUAGE_META[code] || { label: code, flag: '🏳️' }
    return {
      code,
      label: meta.label,
      flag: meta.flag,
      enabled: true,
      isDefault: code === 'en',
    }
  })

  return {
    languages,
    defaultLanguage: 'en',
    enabledLanguages: codes,
  }
}

function saveSettings(settings: LanguageSettings) {
  fs.writeFileSync(getSettingsPath(), JSON.stringify(settings, null, 2) + '\n', 'utf-8')
}

export async function GET(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const settings = loadSettings()
    return NextResponse.json(settings)
  } catch (error) {
    console.error('[Language Settings API] Error:', error)
    return NextResponse.json({ error: 'Failed to load settings' }, { status: 500 })
  }
}

export async function POST(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { action, code, enabled, isDefault } = body as {
      action: 'toggle' | 'setDefault'
      code: string
      enabled?: boolean
      isDefault?: boolean
    }

    if (!action || !code) {
      return NextResponse.json(
        { error: 'Missing required fields: action, code' },
        { status: 400 }
      )
    }

    const settings = loadSettings()
    const lang = settings.languages.find(l => l.code === code)

    if (!lang) {
      return NextResponse.json({ error: `Language ${code} not found in settings` }, { status: 404 })
    }

    if (action === 'toggle') {
      if (code === 'en') {
        return NextResponse.json({ error: 'Cannot disable the default language' }, { status: 400 })
      }
      lang.enabled = enabled !== undefined ? enabled : !lang.enabled
      settings.enabledLanguages = settings.languages.filter(l => l.enabled).map(l => l.code)
    }

    if (action === 'setDefault') {
      if (isDefault) {
        // Set as default
        settings.languages.forEach(l => { l.isDefault = l.code === code })
        settings.defaultLanguage = code
        // Ensure default is enabled
        lang.enabled = true
        settings.enabledLanguages = settings.languages.filter(l => l.enabled).map(l => l.code)
      }
    }

    saveSettings(settings)

    return NextResponse.json({
      success: true,
      settings,
    })
  } catch (error) {
    console.error('[Language Settings API] Error:', error)
    return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 })
  }
}
