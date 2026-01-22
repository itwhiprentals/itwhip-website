// app/lib/agreements/rule-based-validator.ts
// Rule-based PDF validation fallback when AI is unavailable
// Version: 1.0.0

// Using pdf-parse v1.x for stable server-side PDF text extraction
// Import directly from lib to avoid test file loading issue
// eslint-disable-next-line @typescript-eslint/no-require-imports
const pdfParse = require('pdf-parse/lib/pdf-parse')
import {
  VALIDATION_RULES,
  RULES_VERSION,
  textContainsKeyword,
  type DocumentType
} from './validation-rules'
import type { ValidationResult, ValidationIssue } from './validate-pdf'

export interface RuleBasedValidationResult {
  validation: ValidationResult
  rulesVersion: string
  keywordsFound: {
    rental: string[]
    blocklist: string[]
  }
  textLength: number
}

/**
 * Validate a PDF using rule-based keyword analysis
 * This is the fallback when Claude AI is unavailable
 *
 * @param pdfBuffer - Raw PDF file as a Buffer
 * @param fileName - Original filename for logging
 * @returns Validation result with rule details
 */
export async function validatePdfWithRules(
  pdfBuffer: Buffer,
  fileName?: string
): Promise<RuleBasedValidationResult> {
  console.log(`[Rule-Based Validation] Analyzing: ${fileName || 'unnamed'}`)

  let text: string
  let textLength: number

  // Extract text from PDF using pdf-parse v1.x API
  try {
    const result = await pdfParse(pdfBuffer)
    text = result.text
    textLength = text.length
    console.log(`[Rule-Based Validation] Extracted ${textLength} characters`)

    // Check if PDF is likely a scanned image (very little text extracted)
    if (textLength < 50) {
      console.log(`[Rule-Based Validation] PDF appears to be scanned/image-based (only ${textLength} chars)`)
      return {
        validation: {
          isValid: false,
          score: 0,
          documentType: 'unknown',
          hasSignatureSection: false,
          issues: [{
            severity: 'error',
            message: 'This PDF appears to be a scanned image - we cannot read the text content'
          }],
          suggestions: [
            'Please upload a text-based PDF (not a scanned image)',
            'If you have a scanned document, use OCR software to convert it to a searchable PDF',
            'You can use free tools like Adobe Scan or Microsoft Lens to create a searchable PDF'
          ],
          summary: 'Cannot read scanned/image PDF - please upload a text-based PDF'
        },
        rulesVersion: RULES_VERSION,
        keywordsFound: { rental: [], blocklist: [] },
        textLength
      }
    }
  } catch (error) {
    console.error('[Rule-Based Validation] PDF parsing error:', error)
    return {
      validation: {
        isValid: false,
        score: 0,
        documentType: 'not_agreement',
        hasSignatureSection: false,
        issues: [{
          severity: 'error',
          message: 'Could not read PDF content - file may be corrupted, password-protected, or not a valid PDF'
        }],
        suggestions: [
          'Please upload a valid, unprotected PDF file',
          'Try re-exporting your document as a PDF'
        ],
        summary: 'Unable to read the uploaded file'
      },
      rulesVersion: RULES_VERSION,
      keywordsFound: { rental: [], blocklist: [] },
      textLength: 0
    }
  }

  const lowerText = text.toLowerCase()
  const issues: ValidationIssue[] = []
  const rentalKeywordsFound: string[] = []
  const blocklistKeywordsFound: string[] = []

  let score = VALIDATION_RULES.scoring.baseScore

  // ═══════════════════════════════════════════════════════════════
  // STEP 1: Check CRITICAL blocklist (instant rejection)
  // ═══════════════════════════════════════════════════════════════

  // Housing/residential lease keywords
  const housingKeywords = [
    'residential lease', 'residential lease agreement', 'landlord', 'tenant',
    'dwelling', 'apartment lease', 'house lease', 'premises is to be occupied',
    'residential dwelling', 'lead-based paint', 'lead paint disclosure',
    'habitability', 'eviction', 'month-to-month lease', 'subletting', 'right of entry'
  ]

  for (const keyword of VALIDATION_RULES.blocklist.critical) {
    if (textContainsKeyword(lowerText, keyword)) {
      console.log(`[Rule-Based Validation] CRITICAL blocklist match: "${keyword}"`)
      blocklistKeywordsFound.push(keyword)

      // Determine if it's a housing lease or tax document for better messaging
      const isHousingLease = housingKeywords.some(hk => keyword.toLowerCase().includes(hk.toLowerCase()))

      const errorMessage = isHousingLease
        ? `This appears to be a RESIDENTIAL/HOUSING lease, not a VEHICLE rental agreement (detected: "${keyword}")`
        : `This appears to be a tax/government document, not a vehicle rental agreement (detected: "${keyword}")`

      const suggestion = isHousingLease
        ? 'Please upload your VEHICLE rental agreement (for cars/trucks), not a housing/apartment lease'
        : 'Please upload your vehicle rental agreement, not tax documents'

      return {
        validation: {
          isValid: false,
          score: 0,
          documentType: 'not_agreement',
          hasSignatureSection: false,
          issues: [{
            severity: 'error',
            message: errorMessage
          }],
          suggestions: [suggestion],
          summary: `Rejected: Document contains "${keyword}" - this is not a vehicle rental agreement`
        },
        rulesVersion: RULES_VERSION,
        keywordsFound: { rental: [], blocklist: blocklistKeywordsFound },
        textLength
      }
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 2: Check HIGH blocklist (-50 points each)
  // ═══════════════════════════════════════════════════════════════
  for (const keyword of VALIDATION_RULES.blocklist.high) {
    if (textContainsKeyword(lowerText, keyword)) {
      score -= 50
      blocklistKeywordsFound.push(keyword)
      issues.push({
        severity: 'error',
        message: `Document contains "${keyword}" which is typically not in rental agreements`
      })
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 3: Check MEDIUM blocklist (-20 points each)
  // ═══════════════════════════════════════════════════════════════
  for (const keyword of VALIDATION_RULES.blocklist.medium) {
    if (textContainsKeyword(lowerText, keyword)) {
      score -= 20
      blocklistKeywordsFound.push(keyword)
      issues.push({
        severity: 'warning',
        message: `Document contains "${keyword}" - verify this is a rental agreement`
      })
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 4: Check rental keywords (positive points)
  // ═══════════════════════════════════════════════════════════════

  // High-value rental keywords (+15 each)
  for (const keyword of VALIDATION_RULES.rentalKeywords.high) {
    if (textContainsKeyword(lowerText, keyword)) {
      score += 15
      rentalKeywordsFound.push(keyword)
    }
  }

  // Medium-value rental keywords (+8 each)
  for (const keyword of VALIDATION_RULES.rentalKeywords.medium) {
    if (textContainsKeyword(lowerText, keyword)) {
      score += 8
      rentalKeywordsFound.push(keyword)
    }
  }

  // Low-value rental keywords (+3 each)
  for (const keyword of VALIDATION_RULES.rentalKeywords.low) {
    if (textContainsKeyword(lowerText, keyword)) {
      score += 3
      rentalKeywordsFound.push(keyword)
    }
  }

  console.log(`[Rule-Based Validation] Found ${rentalKeywordsFound.length} rental keywords, ${blocklistKeywordsFound.length} blocklist matches`)

  // ═══════════════════════════════════════════════════════════════
  // STEP 5: Check document structure
  // ═══════════════════════════════════════════════════════════════

  // Check minimum length
  if (textLength < VALIDATION_RULES.structure.minLength) {
    score -= 30
    issues.push({
      severity: 'warning',
      message: 'Document appears too short for a complete rental agreement'
    })
  }

  // Check maximum length (sanity check)
  if (textLength > VALIDATION_RULES.structure.maxLength) {
    issues.push({
      severity: 'info',
      message: 'Document is unusually long - may contain multiple documents'
    })
  }

  // Check for date patterns (optional)
  if (VALIDATION_RULES.structure.requiresDatePattern) {
    const datePattern = /\b\d{1,2}[\/\-]\d{1,2}[\/\-]\d{2,4}\b|\b(january|february|march|april|may|june|july|august|september|october|november|december)\s+\d{1,2},?\s+\d{4}\b/i
    if (!datePattern.test(text)) {
      score -= 10
      issues.push({
        severity: 'info',
        message: 'No date patterns detected in document'
      })
    }
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 6: Check for signature section
  // ═══════════════════════════════════════════════════════════════
  const hasSignature = /\b(sign|signature|signed|witness|notary)\b/i.test(text)
  if (!hasSignature) {
    issues.push({
      severity: 'info',
      message: 'No signature section detected'
    })
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 7: Determine document type
  // ═══════════════════════════════════════════════════════════════
  let documentType: DocumentType

  if (score < 20) {
    documentType = 'not_agreement'
  } else if (textContainsKeyword(lowerText, 'lease agreement')) {
    documentType = 'lease_agreement'
  } else if (rentalKeywordsFound.length >= 3) {
    documentType = 'rental_agreement'
  } else {
    documentType = 'unknown'
  }

  // ═══════════════════════════════════════════════════════════════
  // STEP 8: Finalize score and build result
  // ═══════════════════════════════════════════════════════════════

  // Cap score between 0-100
  score = Math.max(
    VALIDATION_RULES.scoring.minScore,
    Math.min(VALIDATION_RULES.scoring.maxScore, score)
  )

  // Build summary
  let summary: string
  if (score >= VALIDATION_RULES.scoring.highConfidenceScore) {
    summary = `Document appears to be a valid rental agreement (${rentalKeywordsFound.length} rental terms found) [Rule-based validation]`
  } else if (score >= VALIDATION_RULES.scoring.minValidScore) {
    summary = `Document may be a rental agreement but lacks some expected terms [Rule-based validation]`
  } else {
    summary = `Document does not appear to be a rental agreement [Rule-based validation]`
  }

  // Add info note that this was rule-based validation
  if (issues.length === 0 || !issues.some(i => i.message.includes('rule-based'))) {
    issues.push({
      severity: 'info',
      message: 'Validated using rule-based analysis (AI validation was unavailable)'
    })
  }

  const isValid = score >= VALIDATION_RULES.scoring.minValidScore

  console.log(`[Rule-Based Validation] Final: score=${score}, isValid=${isValid}, type=${documentType}`)

  return {
    validation: {
      isValid,
      score,
      documentType,
      hasSignatureSection: hasSignature,
      issues,
      suggestions: score < VALIDATION_RULES.scoring.highConfidenceScore
        ? ['Ensure your document is a vehicle rental agreement with rental terms, dates, and signatures']
        : [],
      summary
    },
    rulesVersion: RULES_VERSION,
    keywordsFound: {
      rental: rentalKeywordsFound,
      blocklist: blocklistKeywordsFound
    },
    textLength
  }
}

/**
 * Quick check if a PDF buffer might be a tax/government document
 * Uses only critical blocklist for fast rejection
 */
export async function quickRejectCheck(pdfBuffer: Buffer): Promise<{
  shouldReject: boolean
  reason?: string
}> {
  try {
    const result = await pdfParse(pdfBuffer)
    const lowerText = result.text.toLowerCase()

    for (const keyword of VALIDATION_RULES.blocklist.critical) {
      if (textContainsKeyword(lowerText, keyword)) {
        return {
          shouldReject: true,
          reason: `Document contains "${keyword}" - appears to be a tax/government document`
        }
      }
    }

    return { shouldReject: false }
  } catch {
    return { shouldReject: false }
  }
}
