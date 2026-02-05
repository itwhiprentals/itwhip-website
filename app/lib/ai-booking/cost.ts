// app/lib/ai-booking/cost.ts
// Cost calculation utilities for Choé AI

// =============================================================================
// COST PER MODEL (per 1M tokens)
// =============================================================================

export const COST_PER_1M_TOKENS: Record<string, number> = {
  // Claude 4.5 Series (2025)
  'claude-haiku-4-5-20251001': 1,      // $1/M input, $5/M output
  'claude-sonnet-4-5-20250929': 3,     // $3/M input, $15/M output
  'claude-opus-4-5-20251101': 15,      // $15/M input, $75/M output
  // Claude 3.5 Series (Legacy)
  'claude-3-5-haiku-20241022': 0.25,   // $0.25/M input, $1.25/M output
  'claude-3-5-sonnet-20241022': 3,     // $3/M input, $15/M output
  'claude-3-opus-20240229': 15,        // $15/M input, $75/M output
}

// Prompt caching discount (cached tokens cost 10% of normal)
export const CACHE_DISCOUNT = 0.1

// Output tokens are typically 5x input cost
export const OUTPUT_MULTIPLIER = 5

// Batch API discount (50% off)
export const BATCH_DISCOUNT = 0.5

// =============================================================================
// COST CALCULATION FUNCTIONS
// =============================================================================

/**
 * Calculate cost with full breakdown (input, output, cached tokens)
 */
export function calculateCost(
  inputTokens: number,
  outputTokens: number,
  model: string,
  cachedTokens: number = 0
): number {
  const inputCostPer1M = COST_PER_1M_TOKENS[model] || 1
  const outputCostPer1M = inputCostPer1M * OUTPUT_MULTIPLIER

  // Regular input tokens (non-cached)
  const regularInputTokens = inputTokens - cachedTokens
  const inputCost = (regularInputTokens / 1_000_000) * inputCostPer1M

  // Cached tokens (90% discount)
  const cacheCost = (cachedTokens / 1_000_000) * inputCostPer1M * CACHE_DISCOUNT

  // Output tokens
  const outputCost = (outputTokens / 1_000_000) * outputCostPer1M

  return inputCost + cacheCost + outputCost
}

/**
 * Simple cost calculation (total tokens only, for backwards compatibility)
 */
export function calculateCostSimple(tokens: number, model: string): number {
  const costPer1M = COST_PER_1M_TOKENS[model] || 1
  return (tokens / 1_000_000) * costPer1M
}

/**
 * Calculate cost for batch API (50% discount)
 */
export function calculateBatchCost(
  inputTokens: number,
  outputTokens: number,
  model: string
): number {
  const normalCost = calculateCost(inputTokens, outputTokens, model, 0)
  return normalCost * BATCH_DISCOUNT
}

/**
 * Format cost as USD string
 */
export function formatCost(cost: number): string {
  if (cost < 0.01) {
    return `$${(cost * 1000).toFixed(3)} (${(cost * 100).toFixed(4)}¢)`
  }
  return `$${cost.toFixed(4)}`
}

/**
 * Estimate cost for a conversation based on message count
 * Useful for forecasting and budgeting
 */
export function estimateConversationCost(
  messageCount: number,
  avgTokensPerMessage: number = 200,
  model: string = 'claude-haiku-4-5-20251001'
): number {
  // Rough estimate: input tokens grow with conversation, output is ~200 per response
  const inputTokens = messageCount * avgTokensPerMessage
  const outputTokens = Math.ceil(messageCount / 2) * avgTokensPerMessage // ~half are assistant messages

  return calculateCost(inputTokens, outputTokens, model, 0)
}

/**
 * Get cost tier for a model
 */
export function getModelCostTier(model: string): 'budget' | 'standard' | 'premium' {
  const cost = COST_PER_1M_TOKENS[model] || 1

  if (cost <= 0.5) return 'budget'
  if (cost <= 5) return 'standard'
  return 'premium'
}
