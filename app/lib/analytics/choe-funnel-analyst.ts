// app/lib/analytics/choe-funnel-analyst.ts
// Choé funnel analyst — feeds real data to Claude Haiku for conversion insights.
// Pure function: takes data → builds prompt → calls API → returns structured analysis.

import Anthropic from '@anthropic-ai/sdk'

export interface AnalysisRequest {
  funnel: { step: string; label: string; count: number; dropOff: number }[]
  summary: { topOfFunnel: number; bottomOfFunnel: number; overallConversion: number; errorCount: number; abandonedCount: number }
  topPages: { path: string; views: number }[]
  devices: { device: string; views: number }[]
  cities: { city: string; views: number }[]
  carPriceRange: { min: number; max: number }
  recentBookings: number
  totalViews: number
}

export interface AnalysisResponse {
  summary: string
  recommendations: {
    priority: 'critical' | 'high' | 'medium'
    title: string
    detail: string
    expectedImpact: string
  }[]
  keyInsight: string
}

const SYSTEM_PROMPT = `You are Choé, ITWhip's AI conversion rate optimization expert. ITWhip is a peer-to-peer car rental marketplace in Phoenix, Arizona (like Turo but local).

You analyze booking funnel data and give specific, actionable recommendations. You know this business — the cars, the market, the customers.

Rules:
- Be specific to THIS data, not generic advice
- Reference actual numbers from the data
- Prioritize by revenue impact
- Keep recommendations actionable — what to change, where, and why
- If data is limited (<50 views), say so and suggest what to track
- Never suggest rebuilding the platform — suggest tweaks and optimizations
- Format your response as valid JSON matching the schema exactly`

export async function analyzeWithChoe(data: AnalysisRequest): Promise<AnalysisResponse> {
  const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY })

  const funnelText = data.funnel
    .map(s => `  ${s.label}: ${s.count}${s.dropOff > 0 ? ` (${s.dropOff}% drop-off)` : ''}`)
    .join('\n')

  const topPagesText = data.topPages.slice(0, 10)
    .map(p => `  ${p.path}: ${p.views} views`)
    .join('\n')

  const devicesText = data.devices
    .map(d => `  ${d.device}: ${d.views} views`)
    .join('\n')

  const citiesText = data.cities.slice(0, 10)
    .map(c => `  ${c.city}: ${c.views} views`)
    .join('\n')

  const userPrompt = `Analyze this booking funnel data and give me 3-5 specific recommendations.

FUNNEL (last 7 days):
${funnelText}

SUMMARY:
  Top of funnel: ${data.summary.topOfFunnel} car views
  Bottom of funnel: ${data.summary.bottomOfFunnel} bookings confirmed
  Overall conversion: ${data.summary.overallConversion}%
  Checkout errors: ${data.summary.errorCount}
  Abandoned sessions: ${data.summary.abandonedCount}

TOP PAGES:
${topPagesText}

DEVICES:
${devicesText}

VISITOR CITIES:
${citiesText}

CAR PRICING:
  Range: $${data.carPriceRange.min}/day to $${data.carPriceRange.max}/day
  Recent bookings (7 days): ${data.recentBookings}
  Total page views: ${data.totalViews}

Respond with ONLY valid JSON in this exact format:
{
  "summary": "2-3 sentence overview of the funnel health",
  "recommendations": [
    {
      "priority": "critical",
      "title": "Short title",
      "detail": "Specific explanation with numbers",
      "expectedImpact": "Could increase bookings by X/week"
    }
  ],
  "keyInsight": "One surprising or non-obvious finding from the data"
}`

  const response = await client.messages.create({
    model: 'claude-haiku-4-5-20251001',
    max_tokens: 2048,
    system: SYSTEM_PROMPT,
    messages: [{ role: 'user', content: userPrompt }],
  })

  const text = response.content[0].type === 'text' ? response.content[0].text : ''

  // Extract JSON — handle markdown code blocks, partial JSON, etc.
  let jsonStr = text

  // Strip markdown code fences
  const jsonMatch = text.match(/```(?:json)?\s*([\s\S]*?)```/)
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim()
  } else {
    // Try to find JSON object directly
    const braceMatch = text.match(/\{[\s\S]*\}/)
    if (braceMatch) {
      jsonStr = braceMatch[0]
    }
  }

  try {
    const parsed = JSON.parse(jsonStr) as AnalysisResponse
    return parsed
  } catch {
    // If JSON parsing still fails, extract what we can from the raw text
    // Remove any JSON artifacts and present as readable text
    const cleanText = text
      .replace(/```json\s*/g, '').replace(/```/g, '')
      .replace(/^\s*\{[\s\S]*$/, '') // remove partial JSON
      .trim()

    return {
      summary: cleanText.slice(0, 800) || 'Choé analyzed your funnel but the response format was unexpected.',
      recommendations: [],
      keyInsight: '',
    }
  }
}
