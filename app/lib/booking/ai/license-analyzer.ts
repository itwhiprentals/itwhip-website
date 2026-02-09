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

    content.push({ type: 'text' as const, text: 'Image 1: Driver\'s License Front' })
    content.push({
      type: 'image' as const,
      source: { type: 'url' as const, url: frontImageUrl },
    })

    if (backImageUrl) {
      content.push({ type: 'text' as const, text: 'Image 2: Driver\'s License Back' })
      content.push({
        type: 'image' as const,
        source: { type: 'url' as const, url: backImageUrl },
      })
    }

    // Build the analysis instructions
    const stateRules = buildStateRulesPrompt(options?.stateHint)
    const today = new Date().toISOString().split('T')[0]

    content.push({
      type: 'text' as const,
      text: `Analyze the driver's license image(s) above. Today's date is ${today}.

EXTRACTION: For each field, report what you see (rawText) and your parsed value. Give confidence 0-100.

${stateRules}

PHOTO QUALITY TOLERANCE:
Phone-captured photos will have minor lighting variations, slight angles, and occasional glare. These are NORMAL.
Only flag photo quality if critical fields (name, DOB, expiration, license number) are COMPLETELY UNREADABLE.
A slightly obscured security feature is informational, NOT a critical flag.

FLAG CLASSIFICATION:
- criticalFlags: ONLY for serious issues that indicate the document may be fraudulent, digitally altered, a screenshot of a photo, completely unreadable, or a non-driver's-license document. An expiration date that matches the state's rules is NOT a critical flag.
- informationalFlags: Minor photo quality notes (slight glare, minor angle tilt, partially obscured features). These do NOT indicate fraud.

EXPIRATION RULES:
- Arizona (AZ): Licenses are valid until the holder turns 65. A 2051 expiration on an AZ license for someone born in 1986 is COMPLETELY NORMAL. Do NOT flag this.
- Most other states: 4-8 year validity. Check against the state rules provided.
- Only mark isExpired=true if the expiration date is BEFORE today (${today}).

SECURITY FEATURES:
- "detected": features you can clearly see
- "notDetected": features you cannot see (may be due to photo limitations, NOT necessarily suspicious)
- "obscured": features partially visible but not clear
- assessment: PASS if the document looks genuine. REVIEW only if multiple features seem wrong. FAIL only if document appears fraudulent.

NAME FORMAT:
DL names are typically in "LAST FIRST MIDDLE" or "LAST, FIRST MIDDLE" format.
Parse the name and report both the raw text and the parsed first/last name.`,
    })

    // Build system prompt with state rules (cacheable)
    const systemPrompt: Anthropic.TextBlockParam[] = [
      {
        type: 'text' as const,
        text: `You are an expert document verification specialist with extensive knowledge of US driver's licenses across all 50 states. You have deep knowledge of each state's unique license format, security features, and expiration rules.

Your task is to extract information from driver's license photos and assess their authenticity. You are thorough but fair — minor photo quality issues from phone cameras are expected and should not be treated as red flags.

${buildAllStateRulesPrompt()}`,
        // Note: cache_control would be added here for prompt caching in production
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

    const parsed = JSON.parse(textContent.text)

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
 * Handles common DL formats:
 *   - "LAST FIRST MIDDLE" (most common on US DLs)
 *   - "LAST, FIRST MIDDLE" (comma-separated)
 *   - "FIRST MIDDLE LAST" (less common)
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

  // Default: assume "LAST FIRST MIDDLE" (most US DLs)
  const parts = cleaned.split(/\s+/)
  if (parts.length === 1) {
    return { first: parts[0], last: parts[0] }
  }
  if (parts.length === 2) {
    // Could be "LAST FIRST" or "FIRST LAST" — we'll try both in comparison
    return { last: parts[0], first: parts[1] }
  }
  // 3+ parts: "LAST FIRST MIDDLE..." is the DL convention
  return {
    last: parts[0],
    first: parts[1],
    middle: parts.slice(2).join(' ') || undefined,
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

  // Strategy 1: DL is "LAST FIRST [MIDDLE]" (most common US DL format)
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

  // Strategy 2: DL is "FIRST [MIDDLE] LAST" (same order as booking)
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

  // Strategy 4: Check if all booking name parts exist somewhere in DL name parts
  const allBookingPartsInDL = bookingClean.every(part => dlClean.includes(part))
  if (allBookingPartsInDL && bookingClean.length >= 2) {
    return {
      match: true,
      dlParsed: { first: dlClean[1] || dlClean[0], last: dlClean[0], raw: dlName },
      bookingParsed: { first: bookingFirst, last: bookingLast, raw: bookingName },
    }
  }

  // No match found
  return {
    match: false,
    dlParsed: { first: dlParts[1] || dlParts[0], last: dlParts[0], raw: dlName },
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
