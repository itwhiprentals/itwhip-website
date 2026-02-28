// app/lib/agreements/extract-sections.ts
// AI-powered extraction of structured sections from rental agreement PDFs
// Uses Claude to read the PDF and return organized sections for accordion display

import Anthropic from '@anthropic-ai/sdk'

export interface AgreementSection {
  id: string      // slugified title (e.g., "parties", "payment-terms")
  title: string   // "Parties", "Vehicle Description", "Payment Terms"
  content: string // Full text content of the section
  icon: string    // Icon key for UI display
}

// Valid icon keys that map to react-icons/io5 components
const VALID_ICONS = [
  'people', 'car', 'wallet', 'shield', 'warning', 'document',
  'calendar', 'location', 'key', 'scale', 'close', 'lock',
  'create', 'globe', 'checkmark', 'time', 'call', 'mail'
] as const

const EXTRACTION_PROMPT = `You are a document analyst. Extract the main sections from this vehicle rental agreement PDF.

For each section, provide:
- "id": a URL-friendly slug (lowercase, hyphens, e.g., "payment-terms")
- "title": the section heading as it appears in the document
- "content": the FULL text content of that section, preserving the original wording exactly
- "icon": one of these icon keys that best matches the section content:
  people (parties/names), car (vehicle info), wallet (payment/fees), shield (insurance/protection),
  warning (restrictions/liability), document (general terms), calendar (dates/duration),
  location (pickup/return), key (access/keys), scale (legal/jurisdiction),
  close (cancellation), lock (deposit/security), create (signature), globe (general/platform),
  checkmark (requirements), time (schedule/hours), call (contact), mail (communication)

Rules:
- Extract ALL sections from the document, preserving their order
- Keep the original wording — do NOT summarize or paraphrase
- If a section has numbered items or bullet points, include them in the content
- Maximum 20 sections
- If content spans multiple paragraphs, join them with newline characters
- Do NOT include headers/footers or page numbers in the content

Return ONLY a JSON array of objects. No other text.
Example: [{"id":"parties","title":"Parties","content":"This agreement is between...","icon":"people"}]`

/**
 * Extract structured sections from a rental agreement PDF using Claude AI.
 * Called once at upload time — results are stored on the prospect record.
 *
 * @param pdfUrl - Public URL to the PDF (e.g., Cloudinary)
 * @returns Array of extracted sections, or empty array on failure
 */
export async function extractAgreementSections(pdfUrl: string): Promise<AgreementSection[]> {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.error('[Section Extraction] ANTHROPIC_API_KEY not configured')
    return []
  }

  console.log(`[Section Extraction] Extracting sections from: ${pdfUrl.substring(0, 80)}...`)

  try {
    const anthropic = new Anthropic({
      apiKey: process.env.ANTHROPIC_API_KEY
    })

    const message = await anthropic.messages.create({
      model: 'claude-sonnet-4-20250514',
      max_tokens: 4096,
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
              text: EXTRACTION_PROMPT
            }
          ]
        }
      ]
    })

    const responseText = message.content[0].type === 'text'
      ? message.content[0].text
      : ''

    console.log(`[Section Extraction] Response length: ${responseText.length} chars`)

    // Parse JSON array from response
    const jsonMatch = responseText.match(/\[[\s\S]*\]/)
    if (!jsonMatch) {
      console.error('[Section Extraction] No JSON array found in response')
      return []
    }

    const sections: AgreementSection[] = JSON.parse(jsonMatch[0])

    // Validate and sanitize sections
    const validSections = sections
      .filter(s => s.id && s.title && s.content)
      .slice(0, 20)
      .map(s => ({
        id: s.id.toLowerCase().replace(/[^a-z0-9-]/g, '-').slice(0, 50),
        title: s.title.trim(),
        content: s.content.trim(),
        icon: VALID_ICONS.includes(s.icon as typeof VALID_ICONS[number]) ? s.icon : 'document'
      }))

    console.log(`[Section Extraction] Extracted ${validSections.length} sections`)
    const tokens = (message.usage?.input_tokens || 0) + (message.usage?.output_tokens || 0)
    console.log(`[Section Extraction] Tokens used: ${tokens}`)

    return validSections

  } catch (error) {
    console.error('[Section Extraction] Error:', error)
    return []
  }
}
