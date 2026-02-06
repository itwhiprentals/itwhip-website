// app/lib/booking/ai/license-analyzer.ts
// AI-powered driver's license verification using Claude Vision
// Reference: https://platform.claude.com/docs/en/build-with-claude/vision

import Anthropic from '@anthropic-ai/sdk'

// Initialize Anthropic client
const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

// Types for license analysis
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
  validation: {
    isExpired: boolean
    isValid: boolean
    redFlags: string[]
  }
  error?: string
}

/**
 * Quick verify driver's license during booking
 * Uses Claude Vision to extract and validate DL information
 * Cost: ~$0.02 per verification
 */
export async function quickVerifyDriverLicense(
  frontImageUrl: string,
  backImageUrl?: string
): Promise<LicenseAnalysisResult> {
  try {
    const imageContent: Anthropic.ImageBlockParam[] = [
      {
        type: 'image',
        source: { type: 'url', url: frontImageUrl },
      },
    ]

    if (backImageUrl) {
      imageContent.push({
        type: 'image',
        source: { type: 'url', url: backImageUrl },
      })
    }

    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            ...imageContent,
            {
              type: 'text',
              text: `Analyze this driver's license image(s) and extract the following information.

REQUIRED EXTRACTION:
1. Full name (exactly as shown)
2. Date of birth (format: YYYY-MM-DD)
3. License number
4. Expiration date (format: YYYY-MM-DD)
5. State or country of issue
6. Address (if visible)
7. License class (if visible)
8. Any restrictions (if visible)

VALIDATION CHECKS:
- Is the license expired? (compare expiration to today: ${new Date().toISOString().split('T')[0]})
- Is this a real driver's license? (not a screenshot, not edited, proper formatting)
- Red flags: blurry, altered, damaged, suspicious formatting, mismatch between front/back

CONFIDENCE SCORING (0-100):
- 90-100: Clear, unobstructed, all fields readable
- 70-89: Minor issues but all critical fields readable
- 50-69: Some fields unclear or partially obscured
- Below 50: Cannot reliably extract information

Return ONLY valid JSON in this exact format:
{
  "confidence": <number>,
  "fullName": "<string>",
  "firstName": "<string or null>",
  "lastName": "<string or null>",
  "dateOfBirth": "<YYYY-MM-DD or null>",
  "licenseNumber": "<string>",
  "expirationDate": "<YYYY-MM-DD>",
  "stateOrCountry": "<string>",
  "address": "<string or null>",
  "licenseClass": "<string or null>",
  "restrictions": ["<string>"] or [],
  "isExpired": <boolean>,
  "isValid": <boolean>,
  "redFlags": ["<string>"] or []
}`,
            },
          ],
        },
      ],
    })

    // Extract text content from response
    const textContent = response.content.find((block) => block.type === 'text')
    if (!textContent || textContent.type !== 'text') {
      return {
        success: false,
        confidence: 0,
        validation: { isExpired: false, isValid: false, redFlags: ['No response from AI'] },
        error: 'Failed to get AI response',
      }
    }

    // Parse JSON response
    const jsonMatch = textContent.text.match(/\{[\s\S]*\}/)
    if (!jsonMatch) {
      return {
        success: false,
        confidence: 0,
        validation: { isExpired: false, isValid: false, redFlags: ['Invalid AI response format'] },
        error: 'Failed to parse AI response',
      }
    }

    const parsed = JSON.parse(jsonMatch[0])

    return {
      success: true,
      confidence: parsed.confidence || 0,
      data: {
        fullName: parsed.fullName || '',
        firstName: parsed.firstName || undefined,
        lastName: parsed.lastName || undefined,
        dateOfBirth: parsed.dateOfBirth || '',
        licenseNumber: parsed.licenseNumber || '',
        expirationDate: parsed.expirationDate || '',
        stateOrCountry: parsed.stateOrCountry || '',
        address: parsed.address || undefined,
        licenseClass: parsed.licenseClass || undefined,
        restrictions: parsed.restrictions || [],
      },
      validation: {
        isExpired: parsed.isExpired || false,
        isValid: parsed.isValid && !parsed.isExpired && parsed.confidence >= 70,
        redFlags: parsed.redFlags || [],
      },
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
      },
      error: error instanceof Error ? error.message : 'Unknown error',
    }
  }
}

/**
 * Compare name from DL to provided booking name
 * Returns true if names match (with fuzzy matching for common variations)
 */
export function compareNames(dlName: string, bookingName: string): boolean {
  const normalize = (name: string) =>
    name
      .toLowerCase()
      .trim()
      .replace(/[^a-z\s]/g, '')
      .replace(/\s+/g, ' ')

  const dlNormalized = normalize(dlName)
  const bookingNormalized = normalize(bookingName)

  // Exact match
  if (dlNormalized === bookingNormalized) return true

  // Check if booking name is contained in DL name (handles middle names)
  const dlParts = dlNormalized.split(' ')
  const bookingParts = bookingNormalized.split(' ')

  // First and last name must match
  const dlFirst = dlParts[0]
  const dlLast = dlParts[dlParts.length - 1]
  const bookingFirst = bookingParts[0]
  const bookingLast = bookingParts[bookingParts.length - 1]

  return dlFirst === bookingFirst && dlLast === bookingLast
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
