// app/lib/booking/ai/license-analyzer.ts
// AI-powered driver's license verification using Claude Vision
// Reference: https://platform.claude.com/docs/en/docs/build-with-claude/vision
//
// Improvements over v1:
// - State-specific DL rules (AZ expiration until 65, etc.)
// - Structured Outputs for guaranteed JSON schema
// - Separate critical vs informational flags
// - Better name comparison (handles LAST FIRST MIDDLE format)
// - Photo quality tolerance for phone-captured photos
// - Per-field confidence and extraction detail

import Anthropic from '@anthropic-ai/sdk'
import { jaroWinkler } from 'jaro-winkler-typescript'
import { buildStateRulesPrompt, buildAllStateRulesPrompt, getStateDLRules } from './dl-state-rules'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// ─── Types ──────────────────────────────────────────────────────────────────

export interface ExtractedField {
  value: string | null
  confidence: number // 0-100
  rawText?: string   // What was literally seen on the card
}

export interface SecurityFeaturesResult {
  detected: string[]
  notDetected: string[]
  obscured: string[]
  assessment: 'PASS' | 'REVIEW' | 'FAIL'
}

export interface PhotoQualityResult {
  lighting: 'good' | 'adequate' | 'poor'
  angle: 'straight' | 'slight_tilt' | 'severe_angle'
  focus: 'clear' | 'slightly_blurry' | 'blurry'
  glare: 'none' | 'minor' | 'significant'
  cropping: 'full_card' | 'partial' | 'zoomed'
}

export interface StateSpecificChecks {
  formatValid: boolean
  expirationNormal: boolean
  cardOrientation: string
  realIdCompliant: boolean | null
  notes: string
}

export interface LicenseAnalysisResult {
  success: boolean
  confidence: number // 0-100
  data?: {
    fullName: string
    firstName?: string
    lastName?: string
    dateOfBirth: string
    licenseNumber: string
    expirationDate: string
    stateOrCountry: string
    address?: string
    licenseClass?: string
    restrictions?: string[]
  }
  extractedFields?: Record<string, ExtractedField>
  securityFeatures?: SecurityFeaturesResult
  photoQuality?: PhotoQualityResult
  stateSpecificChecks?: StateSpecificChecks
  validation: {
    isExpired: boolean
    isValid: boolean
    redFlags: string[]           // All flags (backward compatible)
    criticalFlags: string[]      // Blockers: altered, fake, unreadable
    informationalFlags: string[] // Non-blockers: slight glare, minor angle
  }
  error?: string
  model?: string
}

export interface NameComparisonResult {
  match: boolean
  dlParsed: { first: string; middle?: string; last: string; raw: string }
  bookingParsed: { first: string; last: string; raw: string }
  mismatchDetails?: string
}

// ─── JSON Schema for Structured Outputs ─────────────────────────────────────

const DL_ANALYSIS_SCHEMA = {
  type: 'object' as const,
  properties: {
    confidence: { type: 'integer' as const },
    extractedFields: {
      type: 'object' as const,
      properties: {
        fullName: {
          type: 'object' as const,
          properties: {
            value: { type: 'string' as const },
            confidence: { type: 'integer' as const },
            rawText: { type: 'string' as const },
          },
          required: ['value', 'confidence', 'rawText'] as const,
          additionalProperties: false,
        },
        dateOfBirth: {
          type: 'object' as const,
          properties: {
            value: { type: 'string' as const },
            confidence: { type: 'integer' as const },
            rawText: { type: 'string' as const },
          },
          required: ['value', 'confidence', 'rawText'] as const,
          additionalProperties: false,
        },
        expirationDate: {
          type: 'object' as const,
          properties: {
            value: { type: 'string' as const },
            confidence: { type: 'integer' as const },
            rawText: { type: 'string' as const },
          },
          required: ['value', 'confidence', 'rawText'] as const,
          additionalProperties: false,
        },
        licenseNumber: {
          type: 'object' as const,
          properties: {
            value: { type: 'string' as const },
            confidence: { type: 'integer' as const },
            rawText: { type: 'string' as const },
          },
          required: ['value', 'confidence', 'rawText'] as const,
          additionalProperties: false,
        },
        state: {
          type: 'object' as const,
          properties: {
            value: { type: 'string' as const },
            confidence: { type: 'integer' as const },
            rawText: { type: 'string' as const },
          },
          required: ['value', 'confidence', 'rawText'] as const,
          additionalProperties: false,
        },
        address: {
          type: 'object' as const,
          properties: {
            value: { type: 'string' as const },
            confidence: { type: 'integer' as const },
            rawText: { type: 'string' as const },
          },
          required: ['value', 'confidence', 'rawText'] as const,
          additionalProperties: false,
        },
      },
      required: ['fullName', 'dateOfBirth', 'expirationDate', 'licenseNumber', 'state', 'address'] as const,
      additionalProperties: false,
    },
    securityFeatures: {
      type: 'object' as const,
      properties: {
        detected: { type: 'array' as const, items: { type: 'string' as const } },
        notDetected: { type: 'array' as const, items: { type: 'string' as const } },
        obscured: { type: 'array' as const, items: { type: 'string' as const } },
        assessment: { type: 'string' as const, enum: ['PASS', 'REVIEW', 'FAIL'] as const },
      },
      required: ['detected', 'notDetected', 'obscured', 'assessment'] as const,
      additionalProperties: false,
    },
    photoQuality: {
      type: 'object' as const,
      properties: {
        lighting: { type: 'string' as const, enum: ['good', 'adequate', 'poor'] as const },
        angle: { type: 'string' as const, enum: ['straight', 'slight_tilt', 'severe_angle'] as const },
        focus: { type: 'string' as const, enum: ['clear', 'slightly_blurry', 'blurry'] as const },
        glare: { type: 'string' as const, enum: ['none', 'minor', 'significant'] as const },
        cropping: { type: 'string' as const, enum: ['full_card', 'partial', 'zoomed'] as const },
      },
      required: ['lighting', 'angle', 'focus', 'glare', 'cropping'] as const,
      additionalProperties: false,
    },
    stateSpecificChecks: {
      type: 'object' as const,
      properties: {
        formatValid: { type: 'boolean' as const },
        expirationNormal: { type: 'boolean' as const },
        cardOrientation: { type: 'string' as const },
        realIdCompliant: { type: 'boolean' as const },
        notes: { type: 'string' as const },
      },
      required: ['formatValid', 'expirationNormal', 'cardOrientation', 'realIdCompliant', 'notes'] as const,
      additionalProperties: false,
    },
    isExpired: { type: 'boolean' as const },
    isAuthentic: { type: 'boolean' as const },
    criticalFlags: { type: 'array' as const, items: { type: 'string' as const } },
    informationalFlags: { type: 'array' as const, items: { type: 'string' as const } },
  },
  required: [
    'confidence', 'extractedFields', 'securityFeatures', 'photoQuality',
    'stateSpecificChecks', 'isExpired', 'isAuthentic', 'criticalFlags', 'informationalFlags',
  ] as const,
  additionalProperties: false,
}

// ─── Image Optimization ─────────────────────────────────────────────────────

/**
 * Optimize Cloudinary images before sending to Claude.
 * Phone photos are typically 2200x1500+ — Claude auto-resizes anything over 1568px
 * on a side, but doing it via Cloudinary URL transform avoids the latency penalty.
 * Non-Cloudinary URLs are returned unchanged.
 */
function optimizeImageForClaude(url: string): string {
  if (!url.includes('cloudinary.com')) return url
  // Insert resize transform into Cloudinary URL: c_limit keeps aspect ratio,
  // w/h 1568 matches Claude's max, q_90 reduces file size with minimal quality loss,
  // f_jpg converts HEIC/HEIF (unsupported by Claude Vision API) to JPEG on the fly
  return url.replace('/upload/', '/upload/c_limit,w_1568,h_1568,q_90,f_jpg/')
}

// ─── Main Verification Function ─────────────────────────────────────────────

/**
 * Quick verify driver's license during booking
 * Uses Claude Vision with state-specific rules, structured output,
 * and separate critical/informational flags.
 *
 * Cost: ~$0.02 per verification (less with prompt caching)
 */
export async function quickVerifyDriverLicense(
  frontImageUrl: string,
  backImageUrl?: string,
  options?: {
    stateHint?: string  // 2-letter state code if known (from barcode or user input)
    expectedName?: string
  }
): Promise<LicenseAnalysisResult> {
  try {
    // Build image content — images BEFORE text (Claude Vision best practice)
    const content: Anthropic.ContentBlockParam[] = []

    // Optimize image sizes via Cloudinary transform (avoids Claude's auto-resize latency)
    const optimizedFront = optimizeImageForClaude(frontImageUrl)
    const optimizedBack = backImageUrl ? optimizeImageForClaude(backImageUrl) : undefined

    content.push({ type: 'text' as const, text: 'Image 1: Driver\'s License Front' })
    content.push({
      type: 'image' as const,
      source: { type: 'url' as const, url: optimizedFront },
    })

    if (optimizedBack) {
      content.push({ type: 'text' as const, text: 'Image 2: Driver\'s License Back' })
      content.push({
        type: 'image' as const,
        source: { type: 'url' as const, url: optimizedBack },
      })
    }

    // Build the analysis instructions
    const stateRules = buildStateRulesPrompt(options?.stateHint)
    const today = new Date().toISOString().split('T')[0]

    content.push({
      type: 'text' as const,
      text: `Analyze the driver's license image(s) above. Today's date is ${today}.

ACCEPTED DOCUMENTS:
- ONLY state-issued driver's licenses are accepted.
- If the document says "IDENTIFICATION CARD" instead of "DRIVER LICENSE", it is NOT a valid document for rental verification. Flag this as a critical issue: "Document is a state identification card, not a driver's license. A valid driver's license is required to rent a vehicle."

EXTRACTION: For each field, report what you see (rawText) and your parsed value. Give confidence 0-100.

${stateRules}

"NOT VALID FOR OFFICIAL FEDERAL PURPOSES":
This text appears on all non-REAL ID compliant driver's licenses. It is COMPLETELY NORMAL and does NOT indicate the card is fake or invalid. Do NOT flag this as any kind of issue — not critical, not informational. Ignore it entirely.

PHOTO QUALITY TOLERANCE:
These photos are taken by phone cameras. Minor blurriness, slight angles, glare, wear marks, scratches, and resolution limitations are ALL EXPECTED and NORMAL.
Do NOT mention any of these as informational flags — they add noise and no value.
Only flag photo quality if it makes a specific critical field (name, DOB, expiration, license number) COMPLETELY UNREADABLE — and that would be a critical flag, not informational.

FLAG CLASSIFICATION:
- criticalFlags: ONLY for genuinely serious issues: document is not a driver's license (e.g. state ID card), document is clearly digitally fabricated/photoshopped, a screenshot of a photo, completely unreadable text on all fields, or a non-government-issued document. "Not valid for federal purposes" is NOT a critical flag.
- informationalFlags: ONLY for genuinely unusual observations not covered by critical flags (e.g. two different names on front vs back). Do NOT include photo quality notes, card wear, resolution limitations, or camera artifacts. In most verifications, this array should be EMPTY.
- Do NOT flag "non-REAL ID compliant" or "no gold star" — REAL ID status is irrelevant for car rental verification.

IMPORTANT — DO NOT over-flag:
- Do NOT flag "formatting inconsistencies" unless you can point to a SPECIFIC field that appears digitally altered
- Do NOT flag "physical card appearance" concerns for normal wear, standard state card designs, or expected card features
- Do NOT flag the card design as suspicious if it matches the issuing state's known format
- Do NOT invent vague concerns like "multiple formatting inconsistencies" or "card condition raises concerns" without specific evidence
- "Recently issued" is NOT suspicious — people get new licenses all the time
- Do NOT flag "minor blurriness" or "slightly blurry text" — phone photos are always somewhat blurry
- Do NOT flag "card wear", "scratches", or "surface condition" — normal for carried cards
- Do NOT flag "security features not visible due to photo resolution" — phone cameras cannot capture microprinting
- Do NOT flag anything about photo quality as informational — it is expected and adds noise
- When in doubt, do NOT flag it at all

EXPIRATION — TWO CASES:
1. If the EXP field shows a date → compare it to today (${today}). If before today, isExpired=true.
2. If the EXP field is BLANK or missing → use state rules to calculate:
   - Arizona (AZ): Valid until age 65. Calculate expiration = DOB + 65 years. If that calculated date is before today, isExpired=true. Set expirationDate to the calculated 65th birthday.
   - Most other states: Set expirationDate to "N/A" and isExpired to false (cannot determine from card).
- A far-future expiration (e.g. 2051) on an AZ license for someone born in 1986 is COMPLETELY NORMAL. Do NOT flag this.
- Do NOT hallucinate or invent an expiration date that isn't printed on the card. Only report dates you can actually read in the EXP field.
- CRITICAL: The large date at the BOTTOM of many state cards (especially AZ) is the DATE OF BIRTH repeated. Look at the specifically labeled "4b EXP" or "EXP" field for expiration. These are DIFFERENT fields — never confuse them.

SECURITY FEATURES:
- "detected": features you can clearly see
- "notDetected": features you cannot see (may be due to photo limitations, NOT necessarily suspicious)
- "obscured": features partially visible but not clear
- assessment: PASS if the document looks like a genuine state-issued driver's license. REVIEW only if multiple features appear digitally altered. FAIL only if document is clearly fabricated.

NAME FORMAT — US DRIVER'S LICENSE FIELD LAYOUT:
On US driver's licenses, names are displayed in numbered fields:
- Field 1 (labeled "1"): LAST NAME (family name)
- Field 2 (labeled "2"): FIRST NAME and MIDDLE NAME (given names)

Example — Arizona DL showing:
  1  KIRVEN
  2  JEMIEA
     SHERAE
→ fullName = "Jemiea Sherae Kirven" (First Middle Last — natural order)

IMPORTANT: Always return fullName in NATURAL ORDER: "First Middle Last"
- rawText: Report exactly what you see on each field (e.g., "1 KIRVEN  2 JEMIEA SHERAE")
- value: Combine as "First Middle Last" (e.g., "Jemiea Sherae Kirven")
- If the card uses comma format (e.g., "KIRVEN, JEMIEA SHERAE"), parse the same way.
- Do NOT return the name in DL field order (last first middle) — always natural order.

COMMON OCR CONFUSIONS IN SMALL DL TEXT — READ CAREFULLY:
- "m" (two humps) vs "ni" or "rn" (two separate chars) — if you see "ni" in a name, check if it's actually "m"
- "rn" vs "m" — if you see "m", verify it's not actually "rn"
- "cl" vs "d", "I" vs "l" vs "1", "0" vs "O"
Examine each character in the name field carefully. If ambiguous, use context (e.g., is it a real name?).

LICENSE NUMBER VALIDATION:
After identifying the state, validate the license number format:
- Arizona (AZ): 1 letter + 8 digits (e.g., D01699143) or 9 digits. Field labeled "4d DLN".
  The letter is typically (but not always) the first letter of the last name.
  For ID cards, the field is labeled "4d IDN" instead of "4d DLN" — this confirms it's NOT a driver's license.
- If the license number doesn't match the expected format for the identified state, note as informational.

BACK OF CARD VERIFICATION:
When a back image is provided, perform these critical checks:

1. CARD MATCH: Verify the back appears to be from the SAME physical card as the front:
   - Same card design/generation (e.g., 2023+ polycarbonate vs older PVC)
   - Same state issuer
   - DOB printed on back should match DOB on front
   - If these don't match, add a critical flag: "Front and back appear to be from different cards"

2. ID CARD REJECTION (BACK): Look for the text "FOR IDENTIFICATION ONLY" or
   "NOT FOR OPERATION OF A MOTOR VEHICLE" printed on the back of the card.
   If present, this CONFIRMS the document is a state ID card, not a driver's license.
   Add critical flag: "Back of card states 'FOR IDENTIFICATION ONLY, NOT FOR OPERATION OF A MOTOR VEHICLE' — this is a state identification card, not a driver's license."
   Note: Driver's licenses do NOT have this text on the back.

3. BARCODE PRESENCE: The back should have a PDF417 2D barcode (large rectangular barcode).
   If no barcode is visible, note as informational: "No PDF417 barcode detected on back of card."`,
    })

    // Build system prompt with state rules (cacheable)
    const systemPrompt: Anthropic.MessageCreateParams['system'] = [
      {
        type: 'text' as const,
        text: `You are an expert document verification specialist with extensive knowledge of US driver's licenses across all 50 states. You have deep knowledge of each state's unique license format, security features, and expiration rules.

Your task is to extract information from driver's license photos and assess their authenticity. You are thorough but fair — minor photo quality issues from phone cameras are expected and should not be treated as red flags.

${buildAllStateRulesPrompt()}`,
        cache_control: { type: 'ephemeral' as const },
      },
    ]

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2048,
      system: systemPrompt,
      messages: [{ role: 'user', content }],
      output_config: {
        format: {
          type: 'json_schema',
          schema: DL_ANALYSIS_SCHEMA,
        },
      },
    })

    // Log token usage for cost tracking
    const usage = (response as any).usage
    if (usage) {
      const inputCost = (usage.input_tokens / 1_000_000) * 3
      const outputCost = (usage.output_tokens / 1_000_000) * 15
      const cacheRead = usage.cache_read_input_tokens || 0
      const cacheSavings = cacheRead > 0 ? ((cacheRead / 1_000_000) * 2.7).toFixed(4) : '0'
      console.log(`[license-analyzer] Usage: ${usage.input_tokens} in, ${usage.output_tokens} out, cache_read: ${cacheRead} | Cost: $${(inputCost + outputCost).toFixed(4)} (saved $${cacheSavings} from cache)`)
    }

    // With Structured Outputs, response is guaranteed valid JSON
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return {
        success: false,
        confidence: 0,
        validation: { isExpired: false, isValid: false, redFlags: ['No response from AI'], criticalFlags: ['No response from AI'], informationalFlags: [] },
        error: 'Failed to get AI response',
      }
    }

    let parsed = JSON.parse(textContent.text)

    // ── Extended Thinking Retry ──────────────────────────────────────────
    // If confidence is low but no critical flags, retry with extended thinking
    // for deeper analysis. This helps with edge cases (bad lighting, unusual
    // state formats) without slowing down the happy path.
    if (
      parsed.confidence < 70 &&
      (!parsed.criticalFlags || parsed.criticalFlags.length === 0)
    ) {
      try {
        console.log(`[license-analyzer] Low confidence (${parsed.confidence}), retrying with extended thinking...`)

        const retryResponse = await anthropic.messages.create({
          model: 'claude-sonnet-4-5-20250929',
          max_tokens: 16000,
          thinking: { type: 'enabled', budget_tokens: 8000 },
          system: typeof systemPrompt === 'string'
            ? systemPrompt
            : systemPrompt.map(b => b.type === 'text' ? b.text : '').join('\n'),
          messages: [
            {
              role: 'user',
              content: [
                ...content,
                {
                  type: 'text' as const,
                  text: `\n\nIMPORTANT: Respond ONLY with a JSON object matching this exact schema (no markdown, no code fences):\n${JSON.stringify(DL_ANALYSIS_SCHEMA, null, 2)}`,
                },
              ],
            },
          ],
          // Note: structured outputs not compatible with thinking, parse manually
        })

        const retryText = retryResponse.content.find((b) => b.type === 'text')
        if (retryText && retryText.type === 'text') {
          // Extract JSON from response (may have thinking blocks before it)
          const jsonMatch = retryText.text.match(/\{[\s\S]*\}/)
          if (jsonMatch) {
            const retryParsed = JSON.parse(jsonMatch[0])
            // Use retry result only if confidence improved
            if (retryParsed.confidence > parsed.confidence) {
              console.log(`[license-analyzer] Extended thinking improved confidence: ${parsed.confidence} → ${retryParsed.confidence}`)
              parsed = retryParsed
            } else {
              console.log(`[license-analyzer] Extended thinking did not improve confidence (${retryParsed.confidence}), keeping original`)
            }
          }
        }
      } catch (retryErr) {
        console.error('[license-analyzer] Extended thinking retry failed:', retryErr)
        // Keep original result on retry failure
      }
    }

    // Extract first/last name from the parsed data
    const nameField = parsed.extractedFields?.fullName
    const parsedName = nameField?.value ? parseDLName(nameField.value) : null

    // Combine critical + informational for backward compatibility
    const allFlags = [...(parsed.criticalFlags || []), ...(parsed.informationalFlags || [])]

    return {
      success: true,
      confidence: parsed.confidence || 0,
      data: {
        fullName: nameField?.value || '',
        firstName: parsedName?.first || undefined,
        lastName: parsedName?.last || undefined,
        dateOfBirth: parsed.extractedFields?.dateOfBirth?.value || '',
        licenseNumber: parsed.extractedFields?.licenseNumber?.value || '',
        expirationDate: parsed.extractedFields?.expirationDate?.value || '',
        stateOrCountry: parsed.extractedFields?.state?.value || '',
        address: parsed.extractedFields?.address?.value || undefined,
      },
      extractedFields: parsed.extractedFields,
      securityFeatures: parsed.securityFeatures,
      photoQuality: parsed.photoQuality,
      stateSpecificChecks: parsed.stateSpecificChecks,
      validation: {
        isExpired: parsed.isExpired || false,
        isValid: parsed.isAuthentic && !parsed.isExpired && parsed.confidence >= 70,
        redFlags: allFlags,
        criticalFlags: parsed.criticalFlags || [],
        informationalFlags: parsed.informationalFlags || [],
      },
      model: 'claude-sonnet-4-5-20250929',
    }
  } catch (error) {
    console.error('[license-analyzer] Error:', error)
    return {
      success: false,
      confidence: 0,
      validation: {
        isExpired: false,
        isValid: false,
        redFlags: ['Analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error')],
        criticalFlags: ['Analysis failed: ' + (error instanceof Error ? error.message : 'Unknown error')],
        informationalFlags: [],
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

// ─── Name Parsing & Comparison ──────────────────────────────────────────────

/**
 * Parse a DL name into first/middle/last components.
 * Our AI prompt instructs Claude to return names in "FIRST MIDDLE LAST" (natural order).
 * Also handles comma format: "LAST, FIRST MIDDLE"
 */
function parseDLName(dlName: string): { first: string; middle?: string; last: string } {
  const cleaned = dlName.trim()

  // Check for comma-separated format: "LAST, FIRST MIDDLE"
  if (cleaned.includes(',')) {
    const [lastPart, ...restParts] = cleaned.split(',')
    const rest = restParts.join(',').trim().split(/\s+/)
    return {
      last: lastPart.trim(),
      first: rest[0] || '',
      middle: rest.slice(1).join(' ') || undefined,
    }
  }

  // Default: "FIRST MIDDLE LAST" (natural order — matching our prompt instruction)
  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) {
    return { first: parts[0], last: parts[0] }
  }
  if (parts.length === 2) {
    return { first: parts[0], last: parts[1] }
  }
  // 3+ parts: "FIRST MIDDLE... LAST"
  return {
    first: parts[0],
    middle: parts.slice(1, -1).join(' ') || undefined,
    last: parts[parts.length - 1],
  }
}

/**
 * Compare name from DL to provided booking name.
 * Handles multiple name orderings and formats:
 *   - DL "DOE JOHN A" vs booking "John Doe" → MATCH
 *   - DL "DOE, JOHN ANDREW" vs booking "John Doe" → MATCH
 *   - DL "JOHN DOE" vs booking "John Doe" → MATCH
 *
 * Returns detailed comparison for admin visibility.
 */
export function compareNames(dlName: string, bookingName: string): NameComparisonResult {
  const normalize = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z\s]/g, '')
      .replace(/\s+/g, ' ')

  const dlNorm = normalize(dlName)
  const bookingNorm = normalize(bookingName)

  // Parse booking name (assumed "FIRST LAST" or "FIRST MIDDLE LAST")
  const bookingParts = bookingNorm.split(' ')
  const bookingFirst = bookingParts[0]
  const bookingLast = bookingParts[bookingParts.length - 1]

  // Exact match
  if (dlNorm === bookingNorm) {
    return {
      match: true,
      dlParsed: { first: bookingFirst, last: bookingLast, raw: dlName },
      bookingParsed: { first: bookingFirst, last: bookingLast, raw: bookingName },
    }
  }

  const dlParts = dlNorm.split(' ')

  // Remove common suffixes for matching
  const suffixes = ['jr', 'sr', 'ii', 'iii', 'iv', 'v']
  const stripSuffix = (parts: string[]) => parts.filter(p => !suffixes.includes(p))

  const dlClean = stripSuffix(dlParts)
  const bookingClean = stripSuffix(bookingParts)

  // Strategy 1: DL is "FIRST [MIDDLE] LAST" (natural order — our prompt instruction)
  if (dlClean.length >= 2) {
    const dlFirst = dlClean[0]
    const dlLast = dlClean[dlClean.length - 1]
    if (dlFirst === bookingFirst && dlLast === bookingLast) {
      return {
        match: true,
        dlParsed: { first: dlFirst, middle: dlClean.slice(1, -1).join(' ') || undefined, last: dlLast, raw: dlName },
        bookingParsed: { first: bookingFirst, last: bookingLast, raw: bookingName },
      }
    }
  }

  // Strategy 2: DL is "LAST FIRST [MIDDLE]" (legacy DL format, in case AI returns it)
  if (dlClean.length >= 2) {
    const dlLast = dlClean[0]
    const dlFirst = dlClean[1]
    if (dlFirst === bookingFirst && dlLast === bookingLast) {
      return {
        match: true,
        dlParsed: { first: dlFirst, middle: dlClean.slice(2).join(' ') || undefined, last: dlLast, raw: dlName },
        bookingParsed: { first: bookingFirst, last: bookingLast, raw: bookingName },
      }
    }
  }

  // Strategy 3: Handle comma format "LAST, FIRST MIDDLE"
  if (dlName.includes(',')) {
    const parsed = parseDLName(dlName)
    const pFirst = normalize(parsed.first)
    const pLast = normalize(parsed.last)
    if (pFirst === bookingFirst && pLast === bookingLast) {
      return {
        match: true,
        dlParsed: { first: pFirst, middle: parsed.middle, last: pLast, raw: dlName },
        bookingParsed: { first: bookingFirst, last: bookingLast, raw: bookingName },
      }
    }
  }

  // Strategy 4: Middle-name-tolerant matching
  // DL has "First Middle Last" but booking only has "First Last" — ignore middle
  // e.g., DL "Christian M Haguma" vs booking "Christian Haguma" → match
  if (dlClean.length > bookingClean.length && bookingClean.length >= 2) {
    // Try: first word matches + last word matches (DL has extra middle name parts)
    if (dlClean[0] === bookingFirst && dlClean[dlClean.length - 1] === bookingLast) {
      return {
        match: true,
        dlParsed: { first: dlClean[0], middle: dlClean.slice(1, -1).join(' ') || undefined, last: dlClean[dlClean.length - 1], raw: dlName },
        bookingParsed: { first: bookingFirst, last: bookingLast, raw: bookingName },
      }
    }
    // Also try reversed (DL in LAST FIRST MIDDLE order with extra parts)
    if (dlClean[dlClean.length - 1] === bookingFirst && dlClean[0] === bookingLast) {
      return {
        match: true,
        dlParsed: { first: dlClean[dlClean.length - 1], middle: dlClean.slice(1, -1).join(' ') || undefined, last: dlClean[0], raw: dlName },
        bookingParsed: { first: bookingFirst, last: bookingLast, raw: bookingName },
      }
    }
  }

  // Strategy 5: Check if all booking name parts exist somewhere in DL name parts
  const allBookingPartsInDL = bookingClean.every(part => dlClean.includes(part))
  if (allBookingPartsInDL && bookingClean.length >= 2) {
    return {
      match: true,
      dlParsed: { first: dlClean[0], last: dlClean[dlClean.length - 1], raw: dlName },
      bookingParsed: { first: bookingFirst, last: bookingLast, raw: bookingName },
    }
  }

  // Strategy 6: Jaro-Winkler fuzzy matching for OCR errors
  // Handles cases like "HAGUMA" → "HAGUNIA" (m/ni confusion), edit distance 2
  // Industry standard: Jaro-Winkler >= 0.85 for identity verification (Onfido, AML screening)
  const FUZZY_THRESHOLD = 0.85
  if (dlClean.length >= 2 && bookingClean.length >= 2) {
    // Try natural order: first matches first, last matches last
    const jwFirst = jaroWinkler(dlClean[0], bookingFirst, { caseSensitive: false })
    const jwLast = jaroWinkler(dlClean[dlClean.length - 1], bookingLast, { caseSensitive: false })

    if (jwFirst >= FUZZY_THRESHOLD && jwLast >= FUZZY_THRESHOLD) {
      return {
        match: true,
        dlParsed: { first: dlClean[0], middle: dlClean.length > 2 ? dlClean.slice(1, -1).join(' ') : undefined, last: dlClean[dlClean.length - 1], raw: dlName },
        bookingParsed: { first: bookingFirst, last: bookingLast, raw: bookingName },
        mismatchDetails: `Fuzzy match (Jaro-Winkler): first=${jwFirst.toFixed(2)}, last=${jwLast.toFixed(2)} (threshold: ${FUZZY_THRESHOLD})`,
      }
    }

    // Try reversed order (DL might be LAST FIRST)
    const jwFirstRev = jaroWinkler(dlClean[dlClean.length - 1], bookingFirst, { caseSensitive: false })
    const jwLastRev = jaroWinkler(dlClean[0], bookingLast, { caseSensitive: false })

    if (jwFirstRev >= FUZZY_THRESHOLD && jwLastRev >= FUZZY_THRESHOLD) {
      return {
        match: true,
        dlParsed: { first: dlClean[dlClean.length - 1], middle: dlClean.length > 2 ? dlClean.slice(1, -1).join(' ') : undefined, last: dlClean[0], raw: dlName },
        bookingParsed: { first: bookingFirst, last: bookingLast, raw: bookingName },
        mismatchDetails: `Fuzzy match reversed (Jaro-Winkler): first=${jwFirstRev.toFixed(2)}, last=${jwLastRev.toFixed(2)} (threshold: ${FUZZY_THRESHOLD})`,
      }
    }
  }

  // No match found
  const dlParsed = parseDLName(dlName)
  return {
    match: false,
    dlParsed: { first: normalize(dlParsed.first), middle: dlParsed.middle, last: normalize(dlParsed.last), raw: dlName },
    bookingParsed: { first: bookingFirst, last: bookingLast, raw: bookingName },
    mismatchDetails: `DL name "${dlName}" does not match booking name "${bookingName}". ` +
      `DL parts: [${dlParts.join(', ')}], Booking parts: [${bookingParts.join(', ')}]`,
  }
}

/**
 * Validate that date of birth makes renter at least 18 years old
 */
export function validateAge(dateOfBirth: string, minimumAge: number = 18): boolean {
  const dob = new Date(dateOfBirth)
  const today = new Date()
  let age = today.getFullYear() - dob.getFullYear()
  const monthDiff = today.getMonth() - dob.getMonth()

  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < dob.getDate())) {
    age--
  }

  return age >= minimumAge
}
