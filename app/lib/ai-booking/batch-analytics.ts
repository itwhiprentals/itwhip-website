// app/lib/ai-booking/batch-analytics.ts
// Message Batches API for analytics - 50% cost reduction for non-urgent tasks
// Used for: conversation summaries, quality scoring, training data generation

import Anthropic from '@anthropic-ai/sdk'
import prisma from '@/app/lib/database/prisma'
import { getModelConfig } from './choe-settings'

// =============================================================================
// ANTHROPIC CLIENT
// =============================================================================

const getClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY
  if (!apiKey) throw new Error('ANTHROPIC_API_KEY not configured')
  return new Anthropic({ apiKey })
}

// =============================================================================
// BATCH REQUEST TYPES
// =============================================================================

interface BatchRequest {
  custom_id: string
  params: {
    model: string
    max_tokens: number
    messages: Anthropic.MessageParam[]
    system?: string
  }
}

interface ConversationSummaryInput {
  conversationId: string
  messages: Array<{ role: string; content: string }>
  outcome?: string
  location?: string
}

interface QualityScoringInput {
  conversationId: string
  messages: Array<{ role: string; content: string }>
  outcome?: string
}

// =============================================================================
// BATCH JOB CREATORS
// =============================================================================

/**
 * Create a batch job for summarizing conversations
 * Use case: Nightly job to generate summaries for admin review
 */
export async function createConversationSummaryBatch(
  conversations: ConversationSummaryInput[]
): Promise<string> {
  const client = getClient()
  const modelConfig = await getModelConfig()

  const requests: BatchRequest[] = conversations.map((conv) => ({
    custom_id: `summary_${conv.conversationId}`,
    params: {
      model: modelConfig.modelId,
      max_tokens: 500,
      system: `You are an AI analyst reviewing car rental booking conversations.
Summarize the conversation in 2-3 sentences, noting:
- What the user was looking for
- Whether they found what they needed
- Any issues or friction points
- Final outcome (booked, abandoned, blocked)

Output as JSON: { "summary": "...", "keyPoints": ["..."], "sentiment": "positive|neutral|negative", "friction": "none|minor|major" }`,
      messages: [
        {
          role: 'user' as const,
          content: `Analyze this car rental conversation:\n\n${conv.messages
            .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
            .join('\n\n')}\n\nOutcome: ${conv.outcome || 'unknown'}\nLocation: ${conv.location || 'unknown'}`,
        },
      ],
    },
  }))

  // Create the batch
  const batch = await client.messages.batches.create({
    requests,
  })

  // Store batch job in database for tracking
  await storeBatchJob(batch.id, 'conversation_summary', conversations.length)

  return batch.id
}

/**
 * Create a batch job for quality scoring conversations
 * Use case: Evaluate AI response quality for improvement
 */
export async function createQualityScoringBatch(
  conversations: QualityScoringInput[]
): Promise<string> {
  const client = getClient()
  const modelConfig = await getModelConfig()

  const requests: BatchRequest[] = conversations.map((conv) => ({
    custom_id: `quality_${conv.conversationId}`,
    params: {
      model: modelConfig.modelId,
      max_tokens: 300,
      system: `You are evaluating AI assistant responses in car rental booking conversations.
Score each assistant response on:
- Helpfulness (1-5): Did it move the conversation forward?
- Accuracy (1-5): Was information correct?
- Tone (1-5): Was it friendly and professional?
- Efficiency (1-5): Did it avoid unnecessary back-and-forth?

Output as JSON: { "scores": { "helpfulness": N, "accuracy": N, "tone": N, "efficiency": N }, "avgScore": N, "issues": ["..."], "improvements": ["..."] }`,
      messages: [
        {
          role: 'user' as const,
          content: `Evaluate the AI assistant responses in this conversation:\n\n${conv.messages
            .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
            .join('\n\n')}\n\nFinal outcome: ${conv.outcome || 'unknown'}`,
        },
      ],
    },
  }))

  const batch = await client.messages.batches.create({
    requests,
  })

  await storeBatchJob(batch.id, 'quality_scoring', conversations.length)

  return batch.id
}

/**
 * Create a batch job for extracting training examples
 * Use case: Generate fine-tuning data from successful conversations
 */
export async function createTrainingDataBatch(
  conversations: ConversationSummaryInput[]
): Promise<string> {
  const client = getClient()
  const modelConfig = await getModelConfig()

  const requests: BatchRequest[] = conversations.map((conv) => ({
    custom_id: `training_${conv.conversationId}`,
    params: {
      model: modelConfig.modelId,
      max_tokens: 1000,
      system: `You are creating training examples from successful car rental booking conversations.
Extract the best user-assistant exchanges that demonstrate:
- Effective information gathering
- Clear vehicle recommendations
- Smooth booking flow

Output as JSON array: [{ "user": "...", "assistant": "...", "context": "...", "quality": "high|medium" }]
Only include exchanges rated "high" or "medium" quality.`,
      messages: [
        {
          role: 'user' as const,
          content: `Extract training examples from this successful conversation:\n\n${conv.messages
            .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
            .join('\n\n')}`,
        },
      ],
    },
  }))

  const batch = await client.messages.batches.create({
    requests,
  })

  await storeBatchJob(batch.id, 'training_data', conversations.length)

  return batch.id
}

// =============================================================================
// BATCH JOB MANAGEMENT
// =============================================================================

/**
 * Check the status of a batch job
 */
export async function checkBatchStatus(batchId: string): Promise<{
  status: string
  requestCounts: {
    processing: number
    succeeded: number
    errored: number
    canceled: number
    expired: number
  }
  createdAt: string
  endedAt?: string
}> {
  const client = getClient()
  const batch = await client.messages.batches.retrieve(batchId)

  return {
    status: batch.processing_status,
    requestCounts: batch.request_counts,
    createdAt: batch.created_at,
    endedAt: batch.ended_at || undefined,
  }
}

/**
 * Get results from a completed batch job
 */
export async function getBatchResults(batchId: string): Promise<Array<{
  customId: string
  result: unknown
  error?: string
}>> {
  const client = getClient()

  // Check if batch is complete
  const batch = await client.messages.batches.retrieve(batchId)
  if (batch.processing_status !== 'ended') {
    throw new Error(`Batch ${batchId} is not complete. Status: ${batch.processing_status}`)
  }

  // Get results
  const results: Array<{ customId: string; result: unknown; error?: string }> = []

  // Stream results from the batch
  for await (const result of await client.messages.batches.results(batchId)) {
    if (result.result.type === 'succeeded') {
      const message = result.result.message
      const textContent = message.content.find((c) => c.type === 'text')
      const text = textContent && 'text' in textContent ? textContent.text : ''

      // Try to parse as JSON
      let parsed: unknown = text
      try {
        parsed = JSON.parse(text)
      } catch {
        // Keep as string if not valid JSON
      }

      results.push({
        customId: result.custom_id,
        result: parsed,
      })
    } else if (result.result.type === 'errored') {
      results.push({
        customId: result.custom_id,
        result: null,
        error: result.result.error.message,
      })
    }
  }

  // Update batch job in database
  await updateBatchJobComplete(batchId, results.length)

  return results
}

/**
 * Cancel a batch job
 */
export async function cancelBatch(batchId: string): Promise<void> {
  const client = getClient()
  await client.messages.batches.cancel(batchId)
}

/**
 * List recent batch jobs
 */
export async function listBatchJobs(limit: number = 20): Promise<Array<{
  id: string
  status: string
  createdAt: string
  requestCounts: {
    processing: number
    succeeded: number
    errored: number
    canceled: number
    expired: number
  }
}>> {
  const client = getClient()
  const batches = await client.messages.batches.list({ limit })

  return batches.data.map((batch) => ({
    id: batch.id,
    status: batch.processing_status,
    createdAt: batch.created_at,
    requestCounts: batch.request_counts,
  }))
}

// =============================================================================
// DATABASE HELPERS
// =============================================================================

async function storeBatchJob(
  batchId: string,
  jobType: string,
  requestCount: number
): Promise<void> {
  try {
    // Store in a simple key-value format in Redis or use existing stats table
    // For now, log to console - can add DB table later if needed
    console.log(`[batch-analytics] Created batch job: ${batchId} (${jobType}, ${requestCount} requests)`)
  } catch (error) {
    console.error('[batch-analytics] Failed to store batch job:', error)
  }
}

async function updateBatchJobComplete(
  batchId: string,
  resultCount: number
): Promise<void> {
  try {
    console.log(`[batch-analytics] Batch job complete: ${batchId} (${resultCount} results)`)
  } catch (error) {
    console.error('[batch-analytics] Failed to update batch job:', error)
  }
}

// =============================================================================
// SCHEDULED ANALYTICS HELPERS
// =============================================================================

/**
 * Get conversations from the last N hours for batch processing
 */
export async function getRecentConversationsForAnalytics(
  hoursAgo: number = 24,
  limit: number = 100
): Promise<ConversationSummaryInput[]> {
  const since = new Date(Date.now() - hoursAgo * 60 * 60 * 1000)

  const conversations = await prisma.choeAIConversation.findMany({
    where: {
      startedAt: { gte: since },
      messageCount: { gte: 2 }, // At least one exchange
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
  })

  return conversations.map((conv) => ({
    conversationId: conv.id,
    messages: conv.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    outcome: conv.outcome || undefined,
    location: conv.location || undefined,
  }))
}

/**
 * Get successful conversations for training data extraction
 */
export async function getSuccessfulConversationsForTraining(
  limit: number = 50
): Promise<ConversationSummaryInput[]> {
  const conversations = await prisma.choeAIConversation.findMany({
    where: {
      outcome: { in: ['COMPLETED', 'CONVERTED'] },
      messageCount: { gte: 4 }, // At least 2 exchanges
    },
    include: {
      messages: {
        orderBy: { createdAt: 'asc' },
      },
    },
    orderBy: { startedAt: 'desc' },
    take: limit,
  })

  return conversations.map((conv) => ({
    conversationId: conv.id,
    messages: conv.messages.map((m) => ({
      role: m.role,
      content: m.content,
    })),
    outcome: conv.outcome || undefined,
    location: conv.location || undefined,
  }))
}
