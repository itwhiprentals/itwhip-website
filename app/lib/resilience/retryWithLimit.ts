// app/lib/resilience/retryWithLimit.ts
// Retry external calls with exponential backoff and max attempts

const RETRY_LIMITS: Record<string, number> = {
  PUSH_NOTIFICATION: 3,
  EMAIL_SEND: 3,
  PAYOUT_TRANSFER: 2,
  STRIPE_WEBHOOK: 5,
  S3_UPLOAD: 3,
  CHOE_API_CALL: 2,
}

export async function retryWithLimit<T>(
  action: string,
  fn: () => Promise<T>,
  maxRetries?: number
): Promise<T> {
  const limit = maxRetries ?? RETRY_LIMITS[action] ?? 3
  let lastError: Error | undefined

  for (let attempt = 0; attempt <= limit; attempt++) {
    try {
      return await fn()
    } catch (err) {
      lastError = err instanceof Error ? err : new Error(String(err))
      if (attempt < limit) {
        const delay = Math.pow(2, attempt) * 1000 // 1s, 2s, 4s
        console.warn(`[Retry] ${action} attempt ${attempt + 1}/${limit + 1} failed, retrying in ${delay}ms:`, lastError.message)
        await new Promise(resolve => setTimeout(resolve, delay))
      }
    }
  }

  console.error(`[Retry] ${action} exhausted all ${limit + 1} attempts`)
  throw lastError!
}

export { RETRY_LIMITS }
