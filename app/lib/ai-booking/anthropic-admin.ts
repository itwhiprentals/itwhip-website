// app/lib/ai-booking/anthropic-admin.ts
// Service for Anthropic Admin API (Usage & Cost tracking)
// https://docs.anthropic.com/en/api/usage-cost-api

// =============================================================================
// TYPES
// =============================================================================

export interface UsageResult {
  model: string;
  input_tokens: number;
  output_tokens: number;
  request_count: number;
  cache_creation_input_tokens?: number;
  cache_read_input_tokens?: number;
  workspace_id?: string;
}

export interface UsageBucket {
  starting_at: string;
  ending_at: string;
  results: UsageResult[];
}

export interface UsageResponse {
  data: UsageBucket[];
  has_more: boolean;
  next_page: string | null;
}

export interface CostResult {
  service_tier: string;
  cost_usd: number;
  workspace_id?: string;
}

export interface CostBucket {
  starting_at: string;
  ending_at: string;
  results: CostResult[];
}

export interface CostResponse {
  data: CostBucket[];
  has_more: boolean;
  next_page: string | null;
}

export interface DailyUsageSummary {
  date: string;
  inputTokens: number;
  outputTokens: number;
  cacheCreationTokens: number;
  cacheReadTokens: number;
  requestCount: number;
  costUsd: number;
  byModel: Record<string, {
    inputTokens: number;
    outputTokens: number;
    requestCount: number;
  }>;
}

export interface UsageSummary {
  period: {
    start: string;
    end: string;
  };
  totals: {
    inputTokens: number;
    outputTokens: number;
    cacheCreationTokens: number;
    cacheReadTokens: number;
    totalTokens: number;
    requestCount: number;
    costUsd: number;
    estimatedSavings: number; // From cache
  };
  daily: DailyUsageSummary[];
  byModel: Record<string, {
    inputTokens: number;
    outputTokens: number;
    requestCount: number;
    costUsd: number;
  }>;
}

// =============================================================================
// CONSTANTS
// =============================================================================

const ADMIN_API_BASE = 'https://api.anthropic.com/v1/organizations';
const ANTHROPIC_VERSION = '2023-06-01';

// Token pricing per million tokens (as of Jan 2025)
const MODEL_PRICING: Record<string, { input: number; output: number; cacheWrite: number; cacheRead: number }> = {
  'claude-haiku-4-5-20251001': { input: 1.00, output: 5.00, cacheWrite: 1.25, cacheRead: 0.10 },
  'claude-3-5-haiku-20241022': { input: 1.00, output: 5.00, cacheWrite: 1.25, cacheRead: 0.10 },
  'claude-sonnet-4-5-20250929': { input: 3.00, output: 15.00, cacheWrite: 3.75, cacheRead: 0.30 },
  'claude-3-5-sonnet-20241022': { input: 3.00, output: 15.00, cacheWrite: 3.75, cacheRead: 0.30 },
  'claude-opus-4-5-20251101': { input: 15.00, output: 75.00, cacheWrite: 18.75, cacheRead: 1.50 },
};

// =============================================================================
// HELPERS
// =============================================================================

function getAdminApiKey(): string {
  const key = process.env.ANTHROPIC_ADMIN_API_KEY;
  if (!key) {
    throw new Error('ANTHROPIC_ADMIN_API_KEY not configured');
  }
  return key;
}

async function fetchFromAdminApi<T>(endpoint: string, params: Record<string, string>): Promise<T> {
  const url = new URL(`${ADMIN_API_BASE}/${endpoint}`);
  Object.entries(params).forEach(([key, value]) => url.searchParams.append(key, value));

  const response = await fetch(url.toString(), {
    method: 'GET',
    headers: {
      'x-api-key': getAdminApiKey(),
      'anthropic-version': ANTHROPIC_VERSION,
    },
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Admin API error: ${response.status} - ${error}`);
  }

  return response.json() as Promise<T>;
}

function formatDateForApi(date: Date): string {
  return date.toISOString().replace(/\.\d{3}Z$/, 'Z');
}

function calculateCacheSavings(cacheReadTokens: number, regularInputPrice: number, cacheReadPrice: number): number {
  // Cache reads cost 90% less than regular input
  const regularCost = (cacheReadTokens / 1_000_000) * regularInputPrice;
  const cacheCost = (cacheReadTokens / 1_000_000) * cacheReadPrice;
  return regularCost - cacheCost;
}

// =============================================================================
// API FUNCTIONS
// =============================================================================

/**
 * Fetch usage report for messages API
 */
export async function getUsageReport(
  startDate: Date,
  endDate: Date,
  bucketWidth: '1h' | '1d' | '1w' | '1mo' = '1d'
): Promise<UsageResponse> {
  return fetchFromAdminApi<UsageResponse>('usage_report/messages', {
    starting_at: formatDateForApi(startDate),
    ending_at: formatDateForApi(endDate),
    bucket_width: bucketWidth,
  });
}

/**
 * Fetch cost report
 */
export async function getCostReport(
  startDate: Date,
  endDate: Date,
  bucketWidth: '1d' | '1w' | '1mo' = '1d'
): Promise<CostResponse> {
  return fetchFromAdminApi<CostResponse>('cost_report', {
    starting_at: formatDateForApi(startDate),
    ending_at: formatDateForApi(endDate),
    bucket_width: bucketWidth,
  });
}

/**
 * Get combined usage and cost summary
 */
export async function getUsageSummary(
  startDate: Date,
  endDate: Date
): Promise<UsageSummary> {
  const [usageData, costData] = await Promise.all([
    getUsageReport(startDate, endDate, '1d'),
    getCostReport(startDate, endDate, '1d'),
  ]);

  // Build cost lookup by date
  const costByDate = new Map<string, number>();
  for (const bucket of costData.data) {
    const dateKey = bucket.starting_at.split('T')[0];
    const totalCost = bucket.results.reduce((sum, r) => sum + r.cost_usd, 0);
    costByDate.set(dateKey, totalCost);
  }

  // Process usage data
  const totals = {
    inputTokens: 0,
    outputTokens: 0,
    cacheCreationTokens: 0,
    cacheReadTokens: 0,
    totalTokens: 0,
    requestCount: 0,
    costUsd: 0,
    estimatedSavings: 0,
  };

  const byModel: Record<string, { inputTokens: number; outputTokens: number; requestCount: number; costUsd: number }> = {};
  const daily: DailyUsageSummary[] = [];

  for (const bucket of usageData.data) {
    const dateKey = bucket.starting_at.split('T')[0];
    const dayCost = costByDate.get(dateKey) || 0;

    const dayStats: DailyUsageSummary = {
      date: dateKey,
      inputTokens: 0,
      outputTokens: 0,
      cacheCreationTokens: 0,
      cacheReadTokens: 0,
      requestCount: 0,
      costUsd: dayCost,
      byModel: {},
    };

    for (const result of bucket.results) {
      // Day stats
      dayStats.inputTokens += result.input_tokens;
      dayStats.outputTokens += result.output_tokens;
      dayStats.cacheCreationTokens += result.cache_creation_input_tokens || 0;
      dayStats.cacheReadTokens += result.cache_read_input_tokens || 0;
      dayStats.requestCount += result.request_count;

      if (!dayStats.byModel[result.model]) {
        dayStats.byModel[result.model] = { inputTokens: 0, outputTokens: 0, requestCount: 0 };
      }
      dayStats.byModel[result.model].inputTokens += result.input_tokens;
      dayStats.byModel[result.model].outputTokens += result.output_tokens;
      dayStats.byModel[result.model].requestCount += result.request_count;

      // Totals
      totals.inputTokens += result.input_tokens;
      totals.outputTokens += result.output_tokens;
      totals.cacheCreationTokens += result.cache_creation_input_tokens || 0;
      totals.cacheReadTokens += result.cache_read_input_tokens || 0;
      totals.requestCount += result.request_count;

      // By model totals
      if (!byModel[result.model]) {
        byModel[result.model] = { inputTokens: 0, outputTokens: 0, requestCount: 0, costUsd: 0 };
      }
      byModel[result.model].inputTokens += result.input_tokens;
      byModel[result.model].outputTokens += result.output_tokens;
      byModel[result.model].requestCount += result.request_count;

      // Estimate cache savings
      const pricing = MODEL_PRICING[result.model] || MODEL_PRICING['claude-haiku-4-5-20251001'];
      const cacheReadTokens = result.cache_read_input_tokens || 0;
      totals.estimatedSavings += calculateCacheSavings(cacheReadTokens, pricing.input, pricing.cacheRead);
    }

    totals.costUsd += dayCost;
    daily.push(dayStats);
  }

  totals.totalTokens = totals.inputTokens + totals.outputTokens;

  // Distribute cost by model (proportional to usage)
  const totalTokensForCostCalc = totals.inputTokens + totals.outputTokens;
  if (totalTokensForCostCalc > 0) {
    for (const model of Object.keys(byModel)) {
      const modelTokens = byModel[model].inputTokens + byModel[model].outputTokens;
      byModel[model].costUsd = (modelTokens / totalTokensForCostCalc) * totals.costUsd;
    }
  }

  return {
    period: {
      start: startDate.toISOString(),
      end: endDate.toISOString(),
    },
    totals,
    daily,
    byModel,
  };
}

/**
 * Quick summary for dashboard display
 */
export async function getQuickStats(): Promise<{
  today: { tokens: number; cost: number; requests: number };
  week: { tokens: number; cost: number; requests: number };
  month: { tokens: number; cost: number; requests: number };
  cacheSavings: number;
}> {
  const now = new Date();

  // Start of today (UTC)
  const todayStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));

  // Start of week (Sunday)
  const dayOfWeek = now.getUTCDay();
  const weekStart = new Date(todayStart);
  weekStart.setUTCDate(weekStart.getUTCDate() - dayOfWeek);

  // Start of month
  const monthStart = new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1));

  const [todaySummary, weekSummary, monthSummary] = await Promise.all([
    getUsageSummary(todayStart, now).catch(() => null),
    getUsageSummary(weekStart, now).catch(() => null),
    getUsageSummary(monthStart, now).catch(() => null),
  ]);

  return {
    today: {
      tokens: todaySummary?.totals.totalTokens || 0,
      cost: todaySummary?.totals.costUsd || 0,
      requests: todaySummary?.totals.requestCount || 0,
    },
    week: {
      tokens: weekSummary?.totals.totalTokens || 0,
      cost: weekSummary?.totals.costUsd || 0,
      requests: weekSummary?.totals.requestCount || 0,
    },
    month: {
      tokens: monthSummary?.totals.totalTokens || 0,
      cost: monthSummary?.totals.costUsd || 0,
      requests: monthSummary?.totals.requestCount || 0,
    },
    cacheSavings: monthSummary?.totals.estimatedSavings || 0,
  };
}

/**
 * Check if Admin API is configured
 */
export function isAdminApiConfigured(): boolean {
  return !!process.env.ANTHROPIC_ADMIN_API_KEY;
}
