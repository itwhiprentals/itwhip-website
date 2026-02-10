// app/lib/booking/ai/batch-verification.ts
// Batch DL verification using Anthropic Message Batches API (50% cost reduction)
// Follows the same pattern as app/lib/ai-booking/batch-analytics.ts

import Anthropic from '@anthropic-ai/sdk'
import { prisma } from '@/app/lib/database/prisma'
import { buildAllStateRulesPrompt, buildStateRulesPrompt } from './dl-state-rules'

const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')
  return new Anthropic({ apiKey })
}

// ─── Types ──────────────────────────────────────────────────────────────────

interface VerificationInput {
  bookingId: string
  frontImageUrl: string
  backImageUrl?: string
  stateHint?: string
  guestName?: string
}

// JSON schema (same as license-analyzer.ts real-time verification)
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

// ─── Helpers ────────────────────────────────────────────────────────────────

function optimizeImageForClaude(url: string): string {
  if (!url.includes('cloudinary.com')) return url
  return url.replace('/upload/', '/upload/c_limit,w_1568,h_1568,q_90/')
}

// Shared system prompt (same as real-time verification)
function getSystemPrompt(): string {
  return `You are an expert document verification specialist with extensive knowledge of US driver's licenses across all 50 states. You have deep knowledge of each state's unique license format, security features, and expiration rules.

Your task is to extract information from driver's license photos and assess their authenticity. You are thorough but fair — minor photo quality issues from phone cameras are expected and should not be treated as red flags.

${buildAllStateRulesPrompt()}`
}

function buildAnalysisInstructions(stateHint?: string): string {
  const stateRules = buildStateRulesPrompt(stateHint)
  const today = new Date().toISOString().split('T')[0]

  return `Analyze the driver's license image(s) above. Today's date is ${today}.

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

NAME FORMAT:
DL names are typically in "LAST FIRST MIDDLE" or "LAST, FIRST MIDDLE" format.
Parse the name and report both the raw text and the parsed first/last name.`
}

// ─── Batch Job Creator ──────────────────────────────────────────────────────

/**
 * Create a batch DL verification job for multiple bookings.
 * 50% cost savings vs real-time ($1.50/MTok vs $3/MTok input).
 */
export async function createDLVerificationBatch(
  inputs: VerificationInput[]
): Promise<string> {
  const client = getClient()
  const systemPrompt = getSystemPrompt()

  const requests = inputs.map((input) => {
    const content: Anthropic.MessageParam['content'] = []
    const front = optimizeImageForClaude(input.frontImageUrl)

    // Images first, then instructions (Claude Vision best practice)
    ;(content as any[]).push({ type: 'text', text: 'Image 1: Driver\'s License Front' })
    ;(content as any[]).push({
      type: 'image',
      source: { type: 'url', url: front },
    })

    if (input.backImageUrl) {
      const back = optimizeImageForClaude(input.backImageUrl)
      ;(content as any[]).push({ type: 'text', text: 'Image 2: Driver\'s License Back' })
      ;(content as any[]).push({
        type: 'image',
        source: { type: 'url', url: back },
      })
    }

    ;(content as any[]).push({
      type: 'text',
      text: buildAnalysisInstructions(input.stateHint),
    })

    return {
      custom_id: `verify-${input.bookingId}`,
      params: {
        model: 'claude-sonnet-4-5-20250929',
        max_tokens: 2048,
        system: systemPrompt,
        messages: [{ role: 'user' as const, content }],
        output_config: {
          format: {
            type: 'json_schema' as const,
            schema: DL_ANALYSIS_SCHEMA,
          },
        },
      },
    }
  })

  const batch = await client.messages.batches.create({ requests })

  // Persist to ClaudeBatchJob table
  const estimatedCost = (inputs.length * 2000) / 1_000_000 * 1.5 // ~2K tokens/req at batch pricing
  await prisma.claudeBatchJob.create({
    data: {
      batchId: batch.id,
      type: 'dl_verification',
      status: 'processing',
      totalRequests: inputs.length,
      estimatedCost,
      expiresAt: new Date(Date.now() + 29 * 24 * 60 * 60 * 1000),
    },
  })

  console.log(`[batch-verification] Created batch: ${batch.id} (${inputs.length} verifications)`)
  return batch.id
}

// ─── Batch Results Processing ───────────────────────────────────────────────

/**
 * Process completed batch results and update booking records.
 */
export async function processDLVerificationBatchResults(batchId: string): Promise<{
  processed: number
  succeeded: number
  failed: number
}> {
  const client = getClient()

  const batch = await client.messages.batches.retrieve(batchId)
  if (batch.processing_status !== 'ended') {
    throw new Error(`Batch ${batchId} is not complete. Status: ${batch.processing_status}`)
  }

  let processed = 0
  let succeeded = 0
  let failed = 0

  for await (const result of await client.messages.batches.results(batchId)) {
    processed++
    const bookingId = result.custom_id.replace('verify-', '')

    if (result.result.type === 'succeeded') {
      const message = result.result.message
      const textContent = message.content.find((c) => c.type === 'text')
      if (!textContent || textContent.type !== 'text') {
        failed++
        continue
      }

      try {
        const parsed = JSON.parse(textContent.text)
        const allFlags = [...(parsed.criticalFlags || []), ...(parsed.informationalFlags || [])]
        const isValid = parsed.isAuthentic && !parsed.isExpired && parsed.confidence >= 70

        // Build result object matching real-time verification format
        const verificationResult = {
          success: true,
          confidence: parsed.confidence,
          data: {
            fullName: parsed.extractedFields?.fullName?.value || '',
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
            isValid,
            redFlags: allFlags,
            criticalFlags: parsed.criticalFlags || [],
            informationalFlags: parsed.informationalFlags || [],
          },
          model: 'claude-sonnet-4-5-20250929',
          batchId,
        }

        // Update booking record (same fields as real-time verify-dl route)
        await prisma.rentalBooking.update({
          where: { id: bookingId },
          data: {
            aiVerificationResult: verificationResult as any,
            aiVerificationScore: parsed.confidence,
            aiVerificationAt: new Date(),
            aiVerificationModel: 'claude-sonnet-4-5-20250929 (batch)',
          },
        })

        succeeded++
      } catch (err) {
        console.error(`[batch-verification] Failed to parse result for booking ${bookingId}:`, err)
        failed++
      }
    } else {
      console.error(`[batch-verification] Request failed for booking ${bookingId}:`, result.result)
      failed++
    }
  }

  // Update batch job record
  await prisma.claudeBatchJob.update({
    where: { batchId },
    data: {
      status: 'ended',
      completedCount: succeeded,
      failedCount: failed,
      completedAt: new Date(),
    },
  })

  console.log(`[batch-verification] Batch ${batchId} complete: ${succeeded} succeeded, ${failed} failed`)
  return { processed, succeeded, failed }
}

// ─── Helpers for fetching pending bookings ──────────────────────────────────

/**
 * Get bookings that have DL images but haven't been AI-verified yet.
 */
export async function getPendingVerificationBookings(limit: number = 50): Promise<VerificationInput[]> {
  const bookings = await prisma.rentalBooking.findMany({
    where: {
      documentsSubmittedAt: { not: null },
      licensePhotoUrl: { not: null },
      aiVerificationAt: null, // Not yet verified by AI
      status: { notIn: ['CANCELLED'] },
    },
    select: {
      id: true,
      licensePhotoUrl: true,
      licenseBackPhotoUrl: true,
      licenseState: true,
      guestName: true,
    },
    orderBy: { createdAt: 'desc' },
    take: limit,
  })

  return bookings
    .filter((b) => b.licensePhotoUrl) // Ensure front image exists
    .map((b) => ({
      bookingId: b.id,
      frontImageUrl: b.licensePhotoUrl!,
      backImageUrl: b.licenseBackPhotoUrl || undefined,
      stateHint: b.licenseState || undefined,
      guestName: b.guestName || undefined,
    }))
}

/**
 * Check batch status and sync with Anthropic API.
 */
export async function syncVerificationBatchStatus(batchId: string) {
  const client = getClient()
  const batch = await client.messages.batches.retrieve(batchId)

  await prisma.claudeBatchJob.update({
    where: { batchId },
    data: {
      status: batch.processing_status,
      completedCount: batch.request_counts.succeeded,
      failedCount: batch.request_counts.errored,
      resultsUrl: batch.results_url || null,
      completedAt: batch.ended_at ? new Date(batch.ended_at) : null,
    },
  })

  return {
    status: batch.processing_status,
    requestCounts: batch.request_counts,
    createdAt: batch.created_at,
    endedAt: batch.ended_at || undefined,
  }
}
