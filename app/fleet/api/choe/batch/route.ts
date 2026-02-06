// app/fleet/api/choe/batch/route.ts
// API endpoint for batch analytics jobs (50% cost reduction)
// Supports: conversation summaries, quality scoring, training data extraction

import { NextRequest, NextResponse } from 'next/server'
import {
  createConversationSummaryBatch,
  createQualityScoringBatch,
  createTrainingDataBatch,
  checkBatchStatus,
  getBatchResults,
  cancelBatch,
  listBatchJobs,
  getRecentConversationsForAnalytics,
  getSuccessfulConversationsForTraining,
  getStoredBatchJobs,
  syncBatchJobStatus,
} from '@/app/lib/ai-booking/batch-analytics'

const FLEET_KEY = 'phoenix-fleet-2847'

// =============================================================================
// GET /fleet/api/choe/batch - List batch jobs or get specific job status
// =============================================================================

export async function GET(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  if (key !== FLEET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const batchId = searchParams.get('batchId')
  const action = searchParams.get('action')

  try {
    // Get results for a specific batch
    if (batchId && action === 'results') {
      const results = await getBatchResults(batchId)
      return NextResponse.json({ results })
    }

    // Sync and get status for a specific batch
    if (batchId && action === 'sync') {
      await syncBatchJobStatus(batchId)
      const status = await checkBatchStatus(batchId)
      return NextResponse.json({ synced: true, ...status })
    }

    // Get status for a specific batch
    if (batchId) {
      const status = await checkBatchStatus(batchId)
      return NextResponse.json(status)
    }

    // Get source of jobs
    const source = searchParams.get('source')

    // List jobs from database (persisted)
    if (source === 'db') {
      const storedJobs = await getStoredBatchJobs(20)
      return NextResponse.json({ jobs: storedJobs, source: 'database' })
    }

    // List jobs from Anthropic API (live status)
    const apiJobs = await listBatchJobs(20)

    // Also get stored jobs for cost tracking
    const storedJobs = await getStoredBatchJobs(20)

    return NextResponse.json({
      jobs: apiJobs,
      storedJobs,
      source: 'api+database'
    })

  } catch (error) {
    console.error('[batch-api] GET error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to fetch batch info' },
      { status: 500 }
    )
  }
}

// =============================================================================
// POST /fleet/api/choe/batch - Create a new batch job
// =============================================================================

interface BatchCreateRequest {
  type: 'summary' | 'quality' | 'training'
  hoursAgo?: number
  limit?: number
}

export async function POST(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  if (key !== FLEET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const body = (await request.json()) as BatchCreateRequest
    const { type, hoursAgo = 24, limit = 100 } = body

    let batchId: string
    let conversationCount: number

    switch (type) {
      case 'summary': {
        const conversations = await getRecentConversationsForAnalytics(hoursAgo, limit)
        if (conversations.length === 0) {
          return NextResponse.json(
            { error: 'No conversations found for analysis' },
            { status: 404 }
          )
        }
        conversationCount = conversations.length
        batchId = await createConversationSummaryBatch(conversations)
        break
      }

      case 'quality': {
        const conversations = await getRecentConversationsForAnalytics(hoursAgo, limit)
        if (conversations.length === 0) {
          return NextResponse.json(
            { error: 'No conversations found for quality scoring' },
            { status: 404 }
          )
        }
        conversationCount = conversations.length
        batchId = await createQualityScoringBatch(conversations)
        break
      }

      case 'training': {
        const conversations = await getSuccessfulConversationsForTraining(limit)
        if (conversations.length === 0) {
          return NextResponse.json(
            { error: 'No successful conversations found for training data' },
            { status: 404 }
          )
        }
        conversationCount = conversations.length
        batchId = await createTrainingDataBatch(conversations)
        break
      }

      default:
        return NextResponse.json(
          { error: 'Invalid batch type. Use: summary, quality, or training' },
          { status: 400 }
        )
    }

    return NextResponse.json({
      batchId,
      type,
      conversationCount,
      message: `Batch job created. Processing ${conversationCount} conversations at 50% cost.`,
    })

  } catch (error) {
    console.error('[batch-api] POST error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to create batch job' },
      { status: 500 }
    )
  }
}

// =============================================================================
// DELETE /fleet/api/choe/batch - Cancel a batch job
// =============================================================================

export async function DELETE(request: NextRequest) {
  const key = request.nextUrl.searchParams.get('key')
  if (key !== FLEET_KEY) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const batchId = searchParams.get('batchId')

  if (!batchId) {
    return NextResponse.json(
      { error: 'batchId is required' },
      { status: 400 }
    )
  }

  try {
    await cancelBatch(batchId)
    return NextResponse.json({ success: true, message: `Batch ${batchId} cancelled` })
  } catch (error) {
    console.error('[batch-api] DELETE error:', error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to cancel batch' },
      { status: 500 }
    )
  }
}
