// app/fleet/api/language/add-language/route.ts
// Add New Language API — creates a new language file
// Phase 4 of Fleet Language Admin

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import fs from 'fs'
import path from 'path'
import { validateFleetKey } from '../../choe/auth'

const LOCALE_INSTRUCTIONS: Record<string, string> = {
  es: 'Use Latin American Spanish. Informal "tú" form.',
  fr: 'Use standard French (Metropolitan). Formal "vous" form.',
  de: 'Use standard German. Formal "Sie" form.',
  it: 'Use standard Italian.',
  'pt-BR': 'Use Brazilian Portuguese. Informal "você" form.',
  'pt-PT': 'Use European Portuguese. Formal "você" form.',
  ja: 'Use polite Japanese (です/ます form).',
  ko: 'Use polite Korean (합니다 form).',
  'zh-CN': 'Use Simplified Chinese.',
  'zh-TW': 'Use Traditional Chinese.',
  ar: 'Use Modern Standard Arabic.',
  'es-MX': 'Use Mexican Spanish. Informal "tú" form.',
  'en-GB': 'Use British English spelling and conventions.',
}

// Create empty structure matching EN
function createEmptyStructure(obj: unknown): unknown {
  if (typeof obj === 'object' && obj !== null && !Array.isArray(obj)) {
    const result: Record<string, unknown> = {}
    for (const [key, val] of Object.entries(obj as Record<string, unknown>)) {
      result[key] = createEmptyStructure(val)
    }
    return result
  }
  return '' // leaf value → empty string
}

function getLeafEntries(obj: Record<string, unknown>, prefix = ''): [string, string][] {
  const entries: [string, string][] = []
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const val = obj[key]
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      entries.push(...getLeafEntries(val as Record<string, unknown>, fullKey))
    } else if (typeof val === 'string') {
      entries.push([fullKey, val])
    }
  }
  return entries
}

function setNestedValue(obj: Record<string, unknown>, keyPath: string, value: string): void {
  const parts = keyPath.split('.')
  let current: Record<string, unknown> = obj
  for (let i = 0; i < parts.length - 1; i++) {
    if (typeof current[parts[i]] !== 'object' || current[parts[i]] === null) {
      current[parts[i]] = {}
    }
    current = current[parts[i]] as Record<string, unknown>
  }
  current[parts[parts.length - 1]] = value
}

// Append to changelog
function appendChangelog(entry: Record<string, unknown>) {
  const changelogPath = path.join(process.cwd(), 'messages', '.changelog.json')
  let changelog: Record<string, unknown>[] = []
  try {
    if (fs.existsSync(changelogPath)) {
      changelog = JSON.parse(fs.readFileSync(changelogPath, 'utf-8'))
    }
  } catch { /* start fresh */ }
  changelog.unshift({ id: `chg_${Date.now()}`, timestamp: new Date().toISOString(), ...entry })
  if (changelog.length > 500) changelog = changelog.slice(0, 500)
  fs.writeFileSync(changelogPath, JSON.stringify(changelog, null, 2), 'utf-8')
}

export async function POST(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { code, label, flag, region, styleNote, translationStrategy } = body as {
      code: string
      label: string
      flag: string
      region?: string
      styleNote?: string
      translationStrategy: 'ai-auto' | 'empty' | 'import'
    }

    if (!code || !label || !flag) {
      return NextResponse.json(
        { error: 'Missing required fields: code, label, flag' },
        { status: 400 }
      )
    }

    // Validate BCP 47 format
    if (!/^[a-z]{2,3}(-[A-Z]{2})?$/.test(code) && !/^[a-z]{2,3}-[A-Z][a-z]{3}$/.test(code)) {
      return NextResponse.json(
        { error: 'Invalid locale code. Use BCP 47 format: e.g. "de", "pt-BR", "zh-CN"' },
        { status: 400 }
      )
    }

    const messagesDir = path.join(process.cwd(), 'messages')
    const filePath = path.join(messagesDir, `${code}.json`)

    if (fs.existsSync(filePath)) {
      return NextResponse.json(
        { error: `Language file already exists: ${code}.json` },
        { status: 409 }
      )
    }

    // Load EN as base
    const enMessages = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf-8'))
    const totalKeys = getLeafEntries(enMessages).length

    // Create empty structure
    const newMessages = createEmptyStructure(enMessages) as Record<string, unknown>

    if (translationStrategy === 'ai-auto') {
      const apiKey = process.env.ANTHROPIC_API_KEY
      if (!apiKey) {
        // Fall back to empty if no API key
        fs.writeFileSync(filePath, JSON.stringify(newMessages, null, 2) + '\n', 'utf-8')
        appendChangelog({
          action: 'add-language',
          code, label, flag, region,
          strategy: 'empty (API key missing)',
          totalKeys,
        })
        return NextResponse.json({
          success: true,
          code, label, flag,
          totalKeys,
          translated: 0,
          strategy: 'empty',
          message: 'Language created with empty values (ANTHROPIC_API_KEY not configured)',
          manualSteps: getManualSteps(code),
        })
      }

      const anthropic = new Anthropic({ apiKey })
      const localeInstruction = styleNote || LOCALE_INSTRUCTIONS[code] || `Translate to ${label} (${code}).`
      const namespaces = Object.keys(enMessages)
      let totalTranslated = 0
      let totalTokens = 0
      const BATCH_SIZE = 30

      for (const ns of namespaces) {
        const entries = getLeafEntries(enMessages[ns] as Record<string, unknown>)
        if (entries.length === 0) continue

        for (let i = 0; i < entries.length; i += BATCH_SIZE) {
          const batch = entries.slice(i, i + BATCH_SIZE)
          const keysText = batch.map(([k, v], idx) => `${idx + 1}. [${k}] "${v}"`).join('\n')

          try {
            const response = await anthropic.messages.create({
              model: 'claude-sonnet-4-5-20250929',
              max_tokens: 4000,
              system: `You are a professional translator for ITWhip, a peer-to-peer car rental platform in Arizona. ${localeInstruction} Translate UI strings naturally. Keep translations concise. Respond with ONLY numbered translations. Format: "1. translated text"`,
              messages: [
                { role: 'user', content: `Translate these ${batch.length} strings from "${ns}" to ${code}:\n\n${keysText}` },
              ],
            })

            totalTokens += response.usage.input_tokens + response.usage.output_tokens

            const textBlock = response.content.find(b => b.type === 'text')
            const responseText = textBlock?.text || ''
            const lines = responseText.split('\n').filter(l => l.trim())

            for (const line of lines) {
              const match = line.match(/^(\d+)\.\s*(.+)$/)
              if (match) {
                const idx = parseInt(match[1]) - 1
                if (idx >= 0 && idx < batch.length) {
                  const nsObj = (newMessages[ns] as Record<string, unknown>) || {}
                  setNestedValue(nsObj, batch[idx][0], match[2].trim().replace(/^["']|["']$/g, ''))
                  newMessages[ns] = nsObj
                  totalTranslated++
                }
              }
            }
          } catch (err) {
            console.error(`[Add Language] Translation error in ${ns} batch ${i}:`, err)
          }
        }
      }

      fs.writeFileSync(filePath, JSON.stringify(newMessages, null, 2) + '\n', 'utf-8')

      appendChangelog({
        action: 'add-language',
        code, label, flag, region,
        strategy: 'ai-auto',
        totalKeys,
        translated: totalTranslated,
        tokensUsed: totalTokens,
      })

      return NextResponse.json({
        success: true,
        code, label, flag,
        totalKeys,
        translated: totalTranslated,
        strategy: 'ai-auto',
        tokensUsed: totalTokens,
        manualSteps: getManualSteps(code),
      })
    }

    // Strategy: empty
    fs.writeFileSync(filePath, JSON.stringify(newMessages, null, 2) + '\n', 'utf-8')

    appendChangelog({
      action: 'add-language',
      code, label, flag, region,
      strategy: translationStrategy,
      totalKeys,
    })

    return NextResponse.json({
      success: true,
      code, label, flag,
      totalKeys,
      translated: 0,
      strategy: translationStrategy,
      manualSteps: getManualSteps(code),
    })
  } catch (error) {
    console.error('[Add Language API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to add language' },
      { status: 500 }
    )
  }
}

function getManualSteps(code: string): string[] {
  return [
    `Add '${code}' to locales array in i18n/routing.ts`,
    `Add '${code}' to locale detection in middleware.ts`,
    `Add ${code} option to LanguageSwitcher.tsx`,
    `Add ${code} option to PortalLanguageSwitcher.tsx`,
    'Deploy changes to apply',
  ]
}
