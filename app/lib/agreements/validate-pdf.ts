// app/lib/agreements/validate-pdf.ts
// AI-powered PDF rental agreement validation using Claude
// With rule-based fallback when AI is unavailable

import Anthropic from '@anthropic-ai/sdk'
import { validatePdfWithRules } from './rule-based-validator'

export interface ValidationIssue {
  severity: 'error' | 'warning' | 'info'
  message: string
}

export interface ValidationResult {
  isValid: boolean
  score: number
  documentType: 'rental_agreement' | 'lease_agreement' | 'unknown' | 'not_agreement'
  hasSignatureSection: boolean
  issues: ValidationIssue[]
  suggestions: string[]
  summary: string
}

export interface ValidationResponse {
  validation: ValidationResult
  aiValidated: boolean
  tokensUsed?: number
  rulesVersion?: string  // Present when rule-based validation was used
}

// Validation prompt for Claude
const VALIDATION_PROMPT = `You are a legal document analyst for ItWhip, a peer-to-peer car rental marketplace.

Analyze this PDF document and determine if it's a legitimate VEHICLE RENTAL AGREEMENT.

CRITICAL EVALUATION CRITERIA:

1. **Is this a VEHICLE rental/lease agreement?**
   - MUST be specifically for renting/leasing a vehicle (car, truck, etc.)
   - MUST contain rental terms (dates, rates, conditions)
   - REJECT if it's: IRS forms, tax documents, government notices, receipts, invoices, bank statements, insurance cards, registration papers, title documents, or ANY document that is NOT a rental agreement
   - Be VERY STRICT - if uncertain, it's probably NOT a rental agreement

2. **Document Structure (only if it IS a rental agreement)**
   - Should have clear sections (parties, vehicle info, terms, conditions)
   - Should identify parties (renter and owner/company)
   - Should have rental terms (dates, rates, or placeholders for them)

3. **No Prohibited Content**
   - No discriminatory language
   - No illegal terms
   - No deceptive practices

4. **Signature Section**
   - Should have a designated signature area

Return your analysis as JSON with this EXACT structure:
{
  "isValid": boolean,
  "score": number (0-100),
  "documentType": "rental_agreement" | "lease_agreement" | "unknown" | "not_agreement",
  "hasSignatureSection": boolean,
  "issues": [
    {
      "severity": "error" | "warning" | "info",
      "message": "Description of the issue"
    }
  ],
  "suggestions": ["Suggestion 1", "Suggestion 2"],
  "summary": "Brief 1-2 sentence description of what this document IS"
}

SCORING GUIDE:
- 80-100: Good rental agreement, ready to use
- 60-79: Acceptable rental agreement with minor issues
- 40-59: Usable but has concerns
- 20-39: Poor quality or questionable document
- 0-19: NOT a rental agreement - REJECT

CRITICAL: If the document is NOT a vehicle rental agreement (e.g., IRS forms, tax documents, government letters, receipts, bank statements, etc.), you MUST:
- Set isValid: false
- Set score: 0-19
- Set documentType: "not_agreement"
- Add an error issue explaining what the document actually is

Return ONLY the JSON object, no other text.`

/**
 * Validate a PDF using Claude AI, with rule-based fallback
 *
 * @param pdfUrl - Public URL to the PDF (e.g., Cloudinary URL)
 * @param fileName - Original filename for logging
 * @param pdfBuffer - Optional PDF buffer for rule-based fallback validation
 * @returns Validation result with method indicator
 */
export async function validateAgreementPdf(
  pdfUrl: string,
  fileName?: string,
  pdfBuffer?: Buffer
): Promise<ValidationResponse> {
  // Check if Anthropic API key is configured
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[Agreement Validation] ANTHROPIC_API_KEY not configured')

    // Use rule-based fallback if we have the PDF buffer
    if (pdfBuffer) {
      console.log('[Agreement Validation] Using rule-based fallback (no API key)')
      const ruleResult = await validatePdfWithRules(pdfBuffer, fileName)
      return {
        validation: ruleResult.validation,
        aiValidated: false,
        rulesVersion: ruleResult.rulesVersion
      }
    }

    // No buffer available, return generic acceptance
    return {
      validation: {
        isValid: true,
        score: 70,
        documentType: 'unknown',
        hasSignatureSection: true,
        issues: [
          {
            severity: 'info',
            message: 'AI validation unavailable - document accepted without review'
          }
        ],
        suggestions: [],
        summary: 'Document accepted (AI validation not configured)'
      },
      aiValidated: false
    }
  }

  console.log(`[Agreement Validation] Analyzing PDF: ${fileName || 'unnamed'}`)
  console.log(`[Agreement Validation] URL: ${pdfUrl.substring(0, 80)}...`)

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    // Call Claude API with PDF URL
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'url',
                url: pdfUrl
              }
            },
            {
              type: 'text',
              text: VALIDATION_PROMPT
            }
          ]
        }
      ]
    })

    // Extract the response text
    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : ''

    console.log('[Agreement Validation] Claude response:', responseText.substring(0, 300))

    // Parse JSON from response
    let validation: ValidationResult
    try {
      // Try to extract JSON from the response (Claude might include markdown)
      const jsonMatch = responseText.match(/\{[\s\S]*\}/)
      if (jsonMatch) {
        validation = JSON.parse(jsonMatch[0])
      } else {
        throw new Error('No JSON found in response')
      }
    } catch (parseError) {
      console.error('[Agreement Validation] Failed to parse Claude response:', parseError)
      // Return a conservative fallback that requires review
      validation = {
        isValid: false,
        score: 30,
        documentType: 'unknown',
        hasSignatureSection: false,
        issues: [
          {
            severity: 'warning',
            message: 'Could not fully analyze document - please verify this is a rental agreement'
          }
        ],
        suggestions: ['Please ensure your document is a vehicle rental agreement'],
        summary: 'Document analysis incomplete - manual review recommended'
      }
    }

    // Log validation result
    console.log(`[Agreement Validation] Result: isValid=${validation.isValid}, score=${validation.score}, type=${validation.documentType}`)

    return {
      validation,
      aiValidated: true,
      tokensUsed: (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0)
    }

  } catch (error: unknown) {
    console.error('[Agreement Validation] Error:', error)

    // Handle specific Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 400 && error.message.includes('Could not process')) {
        return {
          validation: {
            isValid: false,
            score: 0,
            documentType: 'not_agreement',
            hasSignatureSection: false,
            issues: [
              {
                severity: 'error',
                message: 'Could not read PDF - file may be corrupted, password-protected, or not a valid PDF'
              }
            ],
            suggestions: [
              'Please upload a valid, unprotected PDF file',
              'Try re-exporting your document as a PDF'
            ],
            summary: 'Unable to read the uploaded file'
          },
          aiValidated: true
        }
      }

      if (error.status === 413) {
        return {
          validation: {
            isValid: false,
            score: 0,
            documentType: 'unknown',
            hasSignatureSection: false,
            issues: [
              {
                severity: 'error',
                message: 'PDF file is too large (max 32MB / 100 pages)'
              }
            ],
            suggestions: [
              'Please upload a smaller PDF file',
              'Consider compressing the PDF or removing unnecessary pages'
            ],
            summary: 'File too large to process'
          },
          aiValidated: true
        }
      }
    }

    // Generic error - use rule-based fallback if buffer available
    if (pdfBuffer) {
      console.log('[Agreement Validation] AI failed, using rule-based fallback')
      try {
        const ruleResult = await validatePdfWithRules(pdfBuffer, fileName)
        return {
          validation: ruleResult.validation,
          aiValidated: false,
          rulesVersion: ruleResult.rulesVersion
        }
      } catch (ruleError) {
        console.error('[Agreement Validation] Rule-based fallback also failed:', ruleError)
      }
    }

    // No fallback available, return conservative result
    return {
      validation: {
        isValid: false,
        score: 30,
        documentType: 'unknown',
        hasSignatureSection: false,
        issues: [
          {
            severity: 'warning',
            message: 'Validation temporarily unavailable - please try again'
          }
        ],
        suggestions: ['Try uploading again in a moment'],
        summary: 'Validation error occurred'
      },
      aiValidated: false
    }
  }
}
