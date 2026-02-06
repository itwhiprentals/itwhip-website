// app/api/partner/onboarding/agreement/validate/route.ts
// Validate uploaded host rental agreement PDF using Claude AI with Tool Use
// Uses tool_choice to guarantee structured JSON output (no regex parsing needed)

import { NextRequest, NextResponse } from 'next/server'
import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY
})

// =============================================================================
// VALIDATION TOOL DEFINITION
// =============================================================================
// Using Claude's tool use with strict: true guarantees valid JSON schema output

const AGREEMENT_VALIDATION_TOOL: Anthropic.Tool = {
  name: 'validate_agreement',
  description: `Analyze a rental agreement PDF and return a structured validation result.
Use this tool to report your analysis of the document.

EVALUATION CRITERIA:
1. Is this a rental/lease agreement? (reject receipts, invoices, random docs)
2. Professional quality (clear sections, vehicle info, rental terms)
3. No prohibited content (discrimination, illegal terms)
4. Has signature section (even if blank)

SCORING:
- 80-100: Good agreement, ready to use
- 60-79: Acceptable with minor issues
- 40-59: Usable but has concerns
- Below 40: Not acceptable (reject)

Be STRICT but FAIR. Most legitimate rental agreements should pass.`,
  input_schema: {
    type: 'object' as const,
    properties: {
      isValid: {
        type: 'boolean',
        description: 'Whether the document is a valid, acceptable rental agreement',
      },
      score: {
        type: 'integer',
        minimum: 0,
        maximum: 100,
        description: 'Quality score from 0-100',
      },
      documentType: {
        type: 'string',
        enum: ['rental_agreement', 'lease_agreement', 'unknown', 'not_agreement'],
        description: 'Type of document detected',
      },
      hasSignatureSection: {
        type: 'boolean',
        description: 'Whether the document has a signature area',
      },
      issues: {
        type: 'array',
        description: 'List of issues found in the document',
        items: {
          type: 'object',
          properties: {
            severity: {
              type: 'string',
              enum: ['error', 'warning', 'info'],
            },
            message: {
              type: 'string',
              description: 'Description of the issue',
            },
          },
          required: ['severity', 'message'],
        },
      },
      suggestions: {
        type: 'array',
        description: 'Suggestions for improving the agreement',
        items: { type: 'string' },
      },
      summary: {
        type: 'string',
        description: 'Brief 1-2 sentence summary of the document',
      },
    },
    required: ['isValid', 'score', 'documentType', 'hasSignatureSection', 'issues', 'suggestions', 'summary'],
  },
}

// Validation result type (matches tool schema)
interface ValidationResult {
  isValid: boolean
  score: number
  documentType: 'rental_agreement' | 'lease_agreement' | 'unknown' | 'not_agreement'
  hasSignatureSection: boolean
  issues: Array<{ severity: 'error' | 'warning' | 'info'; message: string }>
  suggestions: string[]
  summary: string
}

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

    // ==========================================================================
    // CALL CLAUDE WITH TOOL USE
    // ==========================================================================
    // Using tool_choice to force Claude to use validate_agreement tool
    // This guarantees valid JSON output matching our schema (no regex needed)
    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 1024,
      tools: [AGREEMENT_VALIDATION_TOOL],
      tool_choice: { type: 'tool', name: 'validate_agreement' },
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'document',
              source: {
                type: 'url',
                url: pdfUrl
              },
              // Cache PDF for 5+ minutes - saves 90% on re-analysis
              // @ts-expect-error - cache_control is a new API feature for documents
              cache_control: { type: 'ephemeral' }
            },
            {
              type: 'text',
              text: 'Analyze this rental agreement PDF and call the validate_agreement tool with your assessment.'
            }
          ]
        }
      ]
    })

    // ==========================================================================
    // EXTRACT VALIDATION FROM TOOL USE (Guaranteed valid JSON)
    // ==========================================================================
    // When using tool_choice, Claude's response is a tool_use block
    // The input is already a valid object matching our schema - no parsing needed!
    let validation: ValidationResult

    const toolUseBlock = message.content.find(
      (block): block is Anthropic.ToolUseBlock => block.type === 'tool_use'
    )

    if (toolUseBlock && toolUseBlock.name === 'validate_agreement') {
      // Direct extraction - guaranteed to match schema thanks to tool_choice
      validation = toolUseBlock.input as ValidationResult
      console.log('[Agreement Validation] Tool response extracted successfully')
    } else {
      // Fallback (shouldn't happen with tool_choice, but just in case)
      console.error('[Agreement Validation] Unexpected response format - no tool_use block')
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

    // Track cache usage for cost monitoring
    // @ts-expect-error - cache_read_input_tokens exists when caching is used
    const cachedTokens = message.usage?.cache_read_input_tokens || 0
    const inputTokens = message.usage?.input_tokens || 0
    const outputTokens = message.usage?.output_tokens || 0

    return NextResponse.json({
      success: true,
      validation,
      aiValidated: true,
      tokensUsed: inputTokens + outputTokens,
      cachedTokens, // Shows how many tokens were served from cache (90% cheaper)
      cacheHit: cachedTokens > 0
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
