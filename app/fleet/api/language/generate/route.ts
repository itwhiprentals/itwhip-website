// app/fleet/api/language/generate/route.ts
// AI Translate Single Key — uses Claude to generate translation
// Phase 3 of Fleet Language Admin

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'
import { validateFleetKey } from '../../choe/auth'

const LOCALE_INSTRUCTIONS: Record<string, string> = {
  es: 'Use Latin American Spanish (not Castilian). Use informal "tú" form.',
  fr: 'Use standard French (Metropolitan). Use formal "vous" form for user-facing text.',
  de: 'Use standard German. Use formal "Sie" form.',
  it: 'Use standard Italian.',
  'pt-BR': 'Use Brazilian Portuguese. Use informal "você" form.',
  'pt-PT': 'Use European Portuguese.',
  ja: 'Use polite Japanese (です/ます form).',
  ko: 'Use polite Korean (합니다 form).',
  'zh-CN': 'Use Simplified Chinese.',
  'zh-TW': 'Use Traditional Chinese.',
  ar: 'Use Modern Standard Arabic.',
  'es-MX': 'Use Mexican Spanish. Use informal "tú" form.',
  'en-GB': 'Use British English spelling and conventions.',
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
    const { namespace, key, englishValue, targetLocale, context } = body

    if (!namespace || !key || !englishValue || !targetLocale) {
      return NextResponse.json(
        { error: 'Missing required fields: namespace, key, englishValue, targetLocale' },
        { status: 400 }
      )
    }

    const localeInstruction = LOCALE_INSTRUCTIONS[targetLocale] || `Translate to locale: ${targetLocale}.`

    const anthropic = new Anthropic({ apiKey })

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 500,
      system: `You are a professional translator for ITWhip, a peer-to-peer car rental platform in Arizona, USA. Translate UI strings naturally — not literally. ${localeInstruction} Keep translations concise for UI labels and buttons. Match the professional but approachable tone of the platform. Respond with ONLY the translated text, nothing else — no quotes, no explanation.`,
      messages: [
        {
          role: 'user',
          content: `Translate to ${targetLocale}:\nKey: ${namespace}.${key}\nEnglish: "${englishValue}"${context ? `\nContext: ${context}` : ''}`,
        },
      ],
    })

    const textBlock = response.content.find(b => b.type === 'text')
    const translation = textBlock?.text?.trim() || ''

    return NextResponse.json({
      success: true,
      namespace,
      key,
      targetLocale,
      englishValue,
      translation,
      model: 'claude-sonnet-4-5-20250929',
      tokensUsed: response.usage.input_tokens + response.usage.output_tokens,
    })
  } catch (error) {
    console.error('[Language Generate API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to generate translation' },
      { status: 500 }
    )
  }
}
