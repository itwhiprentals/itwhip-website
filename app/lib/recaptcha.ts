// app/lib/recaptcha.ts
// Server-side reCAPTCHA v3 token verification
// Soft-fails when RECAPTCHA_SECRET_KEY is not set (dev environments)

interface RecaptchaVerifyResult {
  success: boolean
  score: number
  action?: string
  error?: string
}

const THRESHOLD = 0.5

/**
 * Verify a reCAPTCHA v3 token server-side.
 * Returns { success: true } if verification passes or if reCAPTCHA is not configured.
 * Returns { success: false } only when reCAPTCHA IS configured and the token fails.
 */
export async function verifyRecaptchaToken(token: string | undefined): Promise<RecaptchaVerifyResult> {
  const secretKey = process.env.RECAPTCHA_SECRET_KEY

  // Soft-fail: if secret key isn't configured, allow the request (dev/staging)
  if (!secretKey) {
    return { success: true, score: 1.0 }
  }

  // If reCAPTCHA is configured but no token was provided, reject
  if (!token) {
    return { success: false, score: 0, error: 'Missing reCAPTCHA token' }
  }

  try {
    const response = await fetch('https://www.google.com/recaptcha/api/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        secret: secretKey,
        response: token,
      }),
    })

    const data = await response.json()

    if (!data.success) {
      console.warn('[reCAPTCHA] Verification failed:', data['error-codes'])
      return { success: false, score: 0, error: 'reCAPTCHA verification failed' }
    }

    if (data.score < THRESHOLD) {
      console.warn(`[reCAPTCHA] Low score: ${data.score} (threshold: ${THRESHOLD})`)
      return { success: false, score: data.score, action: data.action, error: 'Suspected bot activity' }
    }

    return { success: true, score: data.score, action: data.action }
  } catch (error) {
    // Network error talking to Google — don't block the user
    console.error('[reCAPTCHA] Verification request failed:', error)
    return { success: true, score: 1.0 }
  }
}
