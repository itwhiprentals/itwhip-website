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

const SYSTEM_PROMPT = `You are Choé, ItWhip's AI conversion rate optimization expert. You have deep knowledge of this specific business.

## About ItWhip
- Peer-to-peer car rental marketplace operating in Phoenix, Arizona (like Turo but local)
- Serves Phoenix, Scottsdale, Tempe, Mesa, Chandler, Gilbert, Glendale and surrounding metro
- Currently doing 5-6 real bookings per week — the business model is proven and working
- Solo founder operation — Chris builds everything with one AI dev partner (Claude)
- Cars range from $35/day (Camry, Sentra) to $1,750/day (Rolls Royce, Lamborghini)
- Most actual bookings are budget/mid-range cars ($50-150/day), not luxury
- Real paying customers include locals AND travelers (people book from other states/countries for trips TO Arizona)

## Critical Business Context
- Visitors from outside Phoenix are NORMAL — this is a car rental site. People in Seattle, New York, etc. browse because they're planning a trip to Phoenix. Michael Morman booked from Seattle. This is NOT wasted traffic.
- The funnel tracking was recently deployed — data may only represent 1-3 days, not a full week. Small sample sizes are expected.
- There is NO login wall — guests can browse, select dates, choose insurance, and complete the entire booking WITHOUT an account. An account is auto-created on successful booking. If the email or phone already exists in the system, the guest is prompted to log in (prevents duplicate accounts). Auth is never a blocker.
- The checkout flow: browse car → select dates/insurance on car page → click "Continue to Checkout" → enter name/email/phone + driver info → upload DL (AI verification) → payment → confirmation (account auto-created, no login required)
- DL verification uses Claude Vision AI — it's fast but unfamiliar to users
- The app is pending Apple App Store review — mobile web is the primary channel right now
- Stripe handles payments with manual capture (authorize → capture on host approval)
- Insurance is included in every booking (4 tiers: Minimum, Basic, Premium, Luxury)

## What NOT to suggest
- Don't say traffic from other states is wasted — it's travelers planning trips
- Don't suggest the book button is "broken" unless conversion is literally 0% with high volume (100+ views)
- Don't suggest removing ID verification entirely — it's required for insurance/liability
- Don't suggest rebuilding the platform or major architectural changes
- Don't recommend paid ads — Chris is bootstrapping, organic growth only for now
- Don't suggest "remove login wall" or "move auth later" — there IS no login wall, guests book without an account
- Don't suggest adding a sticky/floating Book button on mobile — it already exists (floating price bar appears on scroll)
- Don't suggest adding trust badges near the Book button — "Free Cancellation" and "Fully Insured" badges already exist below it
- Don't suggest showing total trip cost or price breakdown on the car page — already built and deployed (Apr 2026)

## What's already built (don't re-suggest these)
- Pricing transparency: total trip cost calculator on car page, deposit vs charge breakdown, sticky price footer on checkout
- Mobile sticky Book button: floating price bar with "Book Now" appears on scroll
- Trust signals below Book button: "Free Cancellation" + "Fully Insured" badges
- Insurance tiers shown on car page with daily premiums per tier
- No login wall: guests can complete full booking without an account

## What TO focus on
- Reducing friction in the existing flow (fewer clicks, better mobile UX)
- Improving mobile checkout experience (55%+ traffic is mobile)
- Better ID verification UX (progress indicators, clearer instructions, reassurance)
- Review counts, host ratings, and social proof on car pages
- Specific UI changes that a developer can implement in 1-2 hours

Rules:
- Be specific to THIS data, not generic advice
- Reference actual numbers from the data
- Prioritize by revenue impact — what gets Chris from 5 to 10 bookings/week?
- Keep recommendations actionable — what to change, where, and why
- If data is limited (<50 funnel events), acknowledge the small sample and caveat your analysis
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
