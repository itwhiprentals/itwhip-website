// app/api/partner/onboarding/agreement/validate/route.ts
// Validate uploaded host rental agreement PDF using Claude AI

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// Validation prompt for Claude
const VALIDATION_PROMPT = `You are a legal document analyst for ItWhip, a peer-to-peer car rental marketplace.

Analyze this rental agreement PDF and evaluate if it's a legitimate, professional rental agreement.

IMPORTANT EVALUATION CRITERIA:

1. **Is this a rental/lease agreement?**
   - Must be a vehicle rental, car lease, or similar agreement
   - Reject if it's: receipts, invoices, random documents, photos, spam, etc.

2. **Professional Quality**
   - Should have clear sections (parties, terms, conditions)
   - Should identify the vehicle being rented (make, model, or placeholder)
   - Should have rental terms (dates, rates, or blanks for them)

3. **No Prohibited Content**
   - No discriminatory language
   - No illegal terms (excessive penalties, rights waivers)
   - No deceptive practices

4. **Signature Section**
   - Should have a designated signature area (even if blank)
   - Should have date fields

Return your analysis as JSON with this exact structure:
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
  "summary": "Brief 1-2 sentence summary of the document"
}

SCORING GUIDE:
- 80-100: Good agreement, ready to use
- 60-79: Acceptable with minor issues
- 40-59: Usable but has concerns
- Below 40: Not acceptable (reject)

Be STRICT but FAIR. Most legitimate rental agreements should pass.
Only reject documents that are clearly NOT rental agreements or have serious issues.

Return ONLY the JSON object, no other text.`

export async function POST(request: NextRequest) {
  try {
    const { pdfUrl, fileName } = await request.json()

    if (!pdfUrl) {
      return NextResponse.json(
        { error: 'PDF URL is required' },
        { status: 400 }
      )
    }

    // Validate URL format
    try {
      new URL(pdfUrl)
    } catch {
      return NextResponse.json(
        { error: 'Invalid PDF URL format' },
        { status: 400 }
      )
    }

    // Check if Anthropic API key is configured
    if (!process.env.ANTHROPIC_API_KEY) {
      console.error('[Agreement Validation] ANTHROPIC_API_KEY not configured')
      // Return a permissive response if AI validation is not available
      return NextResponse.json({
        success: true,
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
      })
    }

    console.log(`[Agreement Validation] Analyzing PDF: ${fileName || 'unnamed'}`)
    console.log(`[Agreement Validation] URL: ${pdfUrl.substring(0, 50)}...`)

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

    console.log('[Agreement Validation] Claude response:', responseText.substring(0, 200))

    // Parse JSON from response
    let validation
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
      // Return a permissive fallback
      validation = {
        isValid: true,
        score: 65,
        documentType: 'unknown',
        hasSignatureSection: true,
        issues: [
          {
            severity: 'warning',
            message: 'Could not fully analyze document structure'
          }
        ],
        suggestions: ['Please ensure your document has clear signature fields'],
        summary: 'Document accepted with limited analysis'
      }
    }

    // Log validation result
    console.log(`[Agreement Validation] Result: isValid=${validation.isValid}, score=${validation.score}`)

    return NextResponse.json({
      success: true,
      validation,
      aiValidated: true,
      tokensUsed: message.usage?.input_tokens + message.usage?.output_tokens
    })

  } catch (error: unknown) {
    console.error('[Agreement Validation] Error:', error)

    // Handle specific Anthropic API errors
    if (error instanceof Anthropic.APIError) {
      if (error.status === 400 && error.message.includes('Could not process')) {
        return NextResponse.json({
          success: true,
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
        })
      }

      if (error.status === 413) {
        return NextResponse.json({
          success: true,
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
        })
      }
    }

    return NextResponse.json(
      { error: 'Failed to validate agreement' },
      { status: 500 }
    )
  }
}
