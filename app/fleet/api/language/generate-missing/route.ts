// app/fleet/api/language/generate-missing/route.ts
// AI Translate All Missing Keys — batch Claude translation
// Phase 3 of Fleet Language Admin

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
  ja: 'Use polite Japanese (です/ます form).',
  ko: 'Use polite Korean (합니다 form).',
  'zh-CN': 'Use Simplified Chinese.',
  ar: 'Use Modern Standard Arabic.',
}

// Get all leaf key paths from a nested object
function getLeafKeyPaths(obj: Record<string, unknown>, prefix = ''): string[] {
  const keys: string[] = []
  for (const key of Object.keys(obj)) {
    const fullKey = prefix ? `${prefix}.${key}` : key
    const val = obj[key]
    if (typeof val === 'object' && val !== null && !Array.isArray(val)) {
      keys.push(...getLeafKeyPaths(val as Record<string, unknown>, fullKey))
    } else {
      keys.push(fullKey)
    }
  }
  return keys
}

function getNestedValue(obj: Record<string, unknown>, keyPath: string): unknown {
  const parts = keyPath.split('.')
  let current: unknown = obj
  for (const part of parts) {
    if (typeof current !== 'object' || current === null) return undefined
    current = (current as Record<string, unknown>)[part]
  }
  return current
}

export async function POST(request: NextRequest) {
  try {
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const apiKey = process.env.ANTHROPIC_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'ANTHROPIC_API_KEY not configured' }, { status: 500 })
    }

    const body = await request.json()
    const { targetLocale, namespaces: nsFilter } = body as {
      targetLocale: string
      namespaces?: string[] | 'all'
    }

    if (!targetLocale) {
      return NextResponse.json({ error: 'Missing required field: targetLocale' }, { status: 400 })
    }

    const messagesDir = path.join(process.cwd(), 'messages')
    const enMessages = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf-8'))

    const localeFilePath = path.join(messagesDir, `${targetLocale}.json`)
    if (!fs.existsSync(localeFilePath)) {
      return NextResponse.json({ error: `Language file not found: ${targetLocale}.json` }, { status: 404 })
    }
    const localeMessages = JSON.parse(fs.readFileSync(localeFilePath, 'utf-8'))

    // Find missing keys
    const allNamespaces = Object.keys(enMessages)
    const targetNamespaces = nsFilter === 'all' || !nsFilter ? allNamespaces : nsFilter

    const missingEntries: { namespace: string; key: string; englishValue: string }[] = []

    for (const ns of targetNamespaces) {
      if (!enMessages[ns]) continue
      const enKeys = getLeafKeyPaths(enMessages[ns] as Record<string, unknown>)
      const localeNs = (localeMessages[ns] as Record<string, unknown>) || {}
      const localeKeys = getLeafKeyPaths(localeNs)

      for (const k of enKeys) {
        if (!localeKeys.includes(k)) {
          const enVal = getNestedValue(enMessages[ns] as Record<string, unknown>, k)
          if (typeof enVal === 'string') {
            missingEntries.push({ namespace: ns, key: k, englishValue: enVal })
          }
        }
      }
    }

    if (missingEntries.length === 0) {
      return NextResponse.json({ success: true, translations: [], message: 'No missing keys found' })
    }

    // Batch translate (groups of 25)
    const anthropic = new Anthropic({ apiKey })
    const localeInstruction = LOCALE_INSTRUCTIONS[targetLocale] || `Translate to locale: ${targetLocale}.`
    const BATCH_SIZE = 25
    const translations: { namespace: string; key: string; englishValue: string; translation: string }[] = []
    let totalTokens = 0

    for (let i = 0; i < missingEntries.length; i += BATCH_SIZE) {
      const batch = missingEntries.slice(i, i + BATCH_SIZE)

      const keysText = batch.map((e, idx) => `${idx + 1}. [${e.namespace}.${e.key}] "${e.englishValue}"`).join('\n')

      const response = await anthropic.messages.create({
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 4000,
        system: `You are a professional translator for ITWhip, a peer-to-peer car rental platform in Arizona. ${localeInstruction} Translate UI strings naturally. Respond with ONLY numbered translations matching the input, one per line. Format: "1. translation text" — no quotes, no key names, just the number and translated text.`,
        messages: [
          {
            role: 'user',
            content: `Translate these ${batch.length} UI strings to ${targetLocale}:\n\n${keysText}`,
          },
        ],
      })

      totalTokens += response.usage.input_tokens + response.usage.output_tokens

      const textBlock = response.content.find(b => b.type === 'text')
      const responseText = textBlock?.text || ''

      // Parse numbered responses
      const lines = responseText.split('\n').filter(l => l.trim())
      for (const line of lines) {
        const match = line.match(/^(\d+)\.\s*(.+)$/)
        if (match) {
          const idx = parseInt(match[1]) - 1
          if (idx >= 0 && idx < batch.length) {
            translations.push({
              ...batch[idx],
              translation: match[2].trim().replace(/^["']|["']$/g, ''),
            })
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      targetLocale,
      totalMissing: missingEntries.length,
      translated: translations.length,
      translations,
      tokensUsed: totalTokens,
    })
  } catch (error) {
    console.error('[Language Generate Missing API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate translations' },
      { status: 500 }
    )
  }
}
