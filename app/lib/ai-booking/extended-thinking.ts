// app/lib/ai-booking/extended-thinking.ts
// Extended Thinking support for complex queries
// Beta feature - allows Claude to reason through complex requirements

// =============================================================================
// COMPLEXITY DETECTION
// =============================================================================

interface ComplexityIndicators {
  multipleRequirements: boolean
  comparisonNeeded: boolean
  budgetConstraints: boolean
  specialNeeds: boolean
  travelPlanning: boolean
  uncertainPreferences: boolean
}

/**
 * Detect if a user message is complex enough to benefit from extended thinking
 */
export function detectComplexQuery(message: string): {
  isComplex: boolean
  indicators: ComplexityIndicators
  score: number
} {
  const lower = message.toLowerCase()

  const indicators: ComplexityIndicators = {
    // Multiple requirements (e.g., "I need an SUV with 7 seats that's under $100/day")
    multipleRequirements: /(?:and|with|that|also|plus)/i.test(lower) &&
      (lower.match(/(?:seat|price|suv|sedan|electric|luxury|deposit|feature)/gi)?.length || 0) >= 2,

    // Needs comparison or recommendation (e.g., "which is better", "what do you recommend")
    comparisonNeeded: /(?:which|what.*(?:best|better|recommend)|compare|difference|versus|vs\.?)/i.test(lower),

    // Budget constraints with conditions
    budgetConstraints: /(?:under|less than|budget|afford|cheap.*but|save.*money)/i.test(lower),

    // Special needs (e.g., "road trip", "family vacation", "business")
    specialNeeds: /(?:road trip|family|vacation|wedding|business|event|camping|ski|hiking|golf)/i.test(lower),

    // Travel planning context
    travelPlanning: /(?:trip to|drive to|visit|travel.*to|going.*to|heading.*to)/i.test(lower) &&
      /(?:grand canyon|sedona|flagstaff|lake|mountain|park)/i.test(lower),

    // Uncertain preferences
    uncertainPreferences: /(?:not sure|don't know|maybe|either|whatever|surprise me|help me (?:decide|choose))/i.test(lower),
  }

  // Calculate complexity score (0-100)
  let score = 0
  if (indicators.multipleRequirements) score += 25
  if (indicators.comparisonNeeded) score += 20
  if (indicators.budgetConstraints) score += 15
  if (indicators.specialNeeds) score += 20
  if (indicators.travelPlanning) score += 15
  if (indicators.uncertainPreferences) score += 10

  // Bonus for long messages (likely detailed requirements)
  if (message.length > 150) score += 10
  if (message.length > 300) score += 10

  return {
    isComplex: score >= 40,
    indicators,
    score: Math.min(score, 100),
  }
}

// =============================================================================
// EXTENDED THINKING CONFIGURATION
// =============================================================================

export interface ExtendedThinkingConfig {
  enabled: boolean
  budgetTokens: number
}

/**
 * Get extended thinking configuration based on query complexity
 */
export function getExtendedThinkingConfig(
  complexityScore: number,
  modelSupportsThinking: boolean = false
): ExtendedThinkingConfig {
  // Extended thinking requires Claude 3.5 Sonnet or higher
  if (!modelSupportsThinking) {
    return { enabled: false, budgetTokens: 0 }
  }

  // Only enable for sufficiently complex queries
  if (complexityScore < 40) {
    return { enabled: false, budgetTokens: 0 }
  }

  // Scale budget tokens with complexity
  let budgetTokens = 1024 // Base budget

  if (complexityScore >= 60) {
    budgetTokens = 2048
  }

  if (complexityScore >= 80) {
    budgetTokens = 4096
  }

  return {
    enabled: true,
    budgetTokens,
  }
}

/**
 * Check if a model supports extended thinking
 * Currently available on Claude 3.5 Sonnet and Claude 3 Opus
 */
export function supportsExtendedThinking(modelId: string): boolean {
  const thinkingModels = [
    'claude-sonnet-4-5-20250929',
    'claude-opus-4-5-20251101',
    'claude-3-5-sonnet-20241022',
    'claude-3-opus-20240229',
  ]

  return thinkingModels.some(m => modelId.includes(m) || modelId === m)
}

// =============================================================================
// THINKING PROMPT ENHANCEMENT
// =============================================================================

/**
 * Enhance the system prompt to encourage structured thinking
 * Used when extended thinking is enabled
 */
export function enhancePromptForThinking(basePrompt: string): string {
  const thinkingGuidance = `

## Complex Query Handling

When the user has complex requirements (multiple constraints, comparisons, or special needs):

1. **Analyze Requirements**: Break down what they need:
   - Vehicle type and features
   - Budget constraints
   - Date/location flexibility
   - Special use case (road trip, business, family, etc.)

2. **Consider Trade-offs**: Think about:
   - What matches best for their use case?
   - What compromises might be acceptable?
   - Are there better alternatives they haven't considered?

3. **Prioritize**: Determine which requirements are:
   - Must-have (non-negotiable)
   - Nice-to-have (preferred but flexible)
   - Bonus (would be great but not expected)

4. **Recommend Thoughtfully**: Provide options that best match their needs with clear reasoning.
`

  return basePrompt + thinkingGuidance
}

// =============================================================================
// EXAMPLE COMPLEX QUERIES
// =============================================================================

export const EXAMPLE_COMPLEX_QUERIES = [
  "I need a car for a family road trip to the Grand Canyon next weekend. We're 5 people with luggage and camping gear. Budget is around $100/day but I want something comfortable for the long drive.",

  "What's the best option for a business trip? I'll be meeting clients so it needs to look professional, but I also want something fuel-efficient. Picking up in Scottsdale Friday and returning Monday.",

  "I'm not sure what I need - going to a wedding in Sedona, might be driving on dirt roads. Should I get an SUV or is a regular car fine? Also trying to keep costs low since I'm already paying for the hotel.",

  "Compare Teslas vs luxury sedans for a weekend trip. I want something impressive but also practical. Is the charging network good enough for driving around Arizona?",
]
