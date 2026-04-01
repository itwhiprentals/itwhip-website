// app/lib/security/promptInjection.ts
// Detect and block prompt injection attempts on Choé AI input

const PROMPT_INJECTION_PATTERNS = [
  /ignore\s+(all\s+)?previous\s+instructions/i,
  /ignore\s+(your\s+)?system\s+prompt/i,
  /you\s+are\s+now\s+(a|an)/i,
  /pretend\s+(you\s+are|to\s+be)/i,
  /act\s+as\s+(an?\s+)?admin/i,
  /override\s+(the\s+)?price/i,
  /set\s+(the\s+)?price\s+to\s+\$?0/i,
  /give\s+(me|it|us)\s+(for\s+)?free/i,
  /skip\s+(all\s+)?verification/i,
  /reveal\s+(your\s+)?(system\s+)?prompt/i,
  /repeat\s+everything\s+above/i,
  /what\s+are\s+your\s+(instructions|rules)/i,
  /bypass\s+(the\s+)?(security|payment|auth)/i,
  /disable\s+(the\s+)?(safety|guard|filter)/i,
  /forget\s+(all\s+)?(your\s+)?instructions/i,
  /new\s+instructions?\s*:/i,
  /system\s*:\s*/i, // trying to inject system role
  /\]\s*\}\s*\{/i, // JSON injection attempt
]

// These are legitimate questions that contain trigger-adjacent words — don't block
const FALSE_POSITIVE_PATTERNS = [
  /can\s+i\s+ignore\s+the\s+deposit/i,
  /can\s+i\s+skip\s+insurance/i,
  /is\s+verification\s+free/i,
  /what\s+are\s+your\s+prices/i,
  /what\s+are\s+your\s+hours/i,
  /what\s+are\s+your\s+cars/i,
]

export function checkPromptInjection(input: string): {
  safe: boolean
  pattern?: string
} {
  // Check false positives first — allow legitimate questions
  for (const fp of FALSE_POSITIVE_PATTERNS) {
    if (fp.test(input)) return { safe: true }
  }

  // Check injection patterns
  for (const pattern of PROMPT_INJECTION_PATTERNS) {
    if (pattern.test(input)) {
      return { safe: false, pattern: pattern.source }
    }
  }

  return { safe: true }
}

// Friendly response when injection detected — never reveal what was detected
export const INJECTION_RESPONSE = "I can only help with finding and booking cars. What kind of car are you looking for?"
