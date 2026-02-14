// app/fleet/api/language/generate-namespace/route.ts
// AI Translate Entire Namespace — batch translate all keys in a namespace
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
    const { namespace, targetLocales, contextDescription } = body as {
      namespace: string
      targetLocales: string[]
      contextDescription?: string
    }

    if (!namespace || !targetLocales || targetLocales.length === 0) {
      return NextResponse.json(
        { error: 'Missing required fields: namespace, targetLocales' },
        { status: 400 }
      )
    }

    const messagesDir = path.join(process.cwd(), 'messages')
    const enMessages = JSON.parse(fs.readFileSync(path.join(messagesDir, 'en.json'), 'utf-8'))

    if (!enMessages[namespace]) {
      return NextResponse.json({ error: `Namespace '${namespace}' not found` }, { status: 404 })
    }

    const enEntries = getLeafEntries(enMessages[namespace] as Record<string, unknown>)

    if (enEntries.length === 0) {
      return NextResponse.json({ success: true, results: {}, message: 'No keys in namespace' })
    }

    const anthropic = new Anthropic({ apiKey })
    const results: Record<string, { key: string; englishValue: string; translation: string }[]> = {}
    let totalTokens = 0
    const BATCH_SIZE = 30

    for (const locale of targetLocales) {
      const localeInstruction = LOCALE_INSTRUCTIONS[locale] || `Translate to locale: ${locale}.`
      results[locale] = []

      for (let i = 0; i < enEntries.length; i += BATCH_SIZE) {
        const batch = enEntries.slice(i, i + BATCH_SIZE)
        const keysText = batch.map(([k, v], idx) => `${idx + 1}. [${k}] "${v}"`).join('\n')

        const response = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 4000,
          system: `You are a professional translator for ITWhip, a peer-to-peer car rental platform. ${localeInstruction} Translate UI strings naturally — not literally. Keep translations concise. ${contextDescription ? `Context: ${contextDescription}` : ''} Respond with ONLY numbered translations, one per line. Format: "1. translated text" — no quotes around the number, just the translated text.`,
          messages: [
            {
              role: 'user',
              content: `Translate these ${batch.length} UI strings from the "${namespace}" section to ${locale}:\n\n${keysText}`,
            },
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
              results[locale].push({
                key: batch[idx][0],
                englishValue: batch[idx][1],
                translation: match[2].trim().replace(/^["']|["']$/g, ''),
              })
            }
          }
        }
      }
    }

    return NextResponse.json({
      success: true,
      namespace,
      targetLocales,
      totalKeys: enEntries.length,
      results,
      tokensUsed: totalTokens,
    })
  } catch (error) {
    console.error('[Language Generate Namespace API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate namespace translations' },
      { status: 500 }
    )
  }
}
