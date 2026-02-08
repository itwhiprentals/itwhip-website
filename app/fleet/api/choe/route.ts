// app/fleet/api/choe/route.ts
// Choé AI Settings API - GET settings, PATCH update settings

import { NextRequest, NextResponse } from 'next/server'
import prisma from '@/app/lib/database/prisma'
import { clearChoeSettingsCache } from '@/app/lib/ai-booking/choe-settings'
import { validateFleetKey } from './auth'

// =============================================================================
// GET - Fetch Choé AI Settings
// =============================================================================

export async function GET(request: NextRequest) {
  try {
    // Validate API key
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    // Fetch or create settings
    let settings = await prisma.choeAISettings.findUnique({
      where: { id: 'global' }
    })

    if (!settings) {
      settings = await prisma.choeAISettings.create({
        data: { id: 'global' }
      })
    }

    return NextResponse.json({
      success: true,
      settings,
      updatedAt: settings.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('[Choé Settings API] Error:', error)
    return NextResponse.json(
      { error: 'Failed to fetch settings' },
      { status: 500 }
    )
  }
}

// =============================================================================
// PATCH - Update Choé AI Settings
// =============================================================================

export async function PATCH(request: NextRequest) {
  try {
    // Validate API key
    if (!validateFleetKey(request)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await request.json()
    const { updatedBy, ...updateData } = body

    // Validate numeric fields
    const numericValidations: { field: string; min?: number; max?: number }[] = [
      { field: 'maxTokens', min: 256, max: 4096 },
      { field: 'temperature', min: 0, max: 1 },
      { field: 'serviceFeePercent', min: 0, max: 0.5 },
      { field: 'taxRateDefault', min: 0, max: 0.2 },
      { field: 'messagesPerWindow', min: 1, max: 100 },
      { field: 'rateLimitWindowMins', min: 1, max: 60 },
      { field: 'dailyApiLimit', min: 10, max: 10000 },
      { field: 'sessionMessageLimit', min: 5, max: 200 },
      { field: 'maxMessageLength', min: 50, max: 2000 },
      { field: 'anonymousTimeSeconds', min: 60, max: 3600 },
      { field: 'anonymousMaxMessages', min: 5, max: 100 },
      { field: 'highRiskThreshold', min: 0, max: 100 },
      { field: 'verificationThreshold', min: 0, max: 100 },
    ]

    for (const validation of numericValidations) {
      if (validation.field in updateData) {
        const value = updateData[validation.field]
        if (typeof value !== 'number') {
          return NextResponse.json(
            { error: `${validation.field} must be a number` },
            { status: 400 }
          )
        }
        if (validation.min !== undefined && value < validation.min) {
          return NextResponse.json(
            { error: `${validation.field} must be at least ${validation.min}` },
            { status: 400 }
          )
        }
        if (validation.max !== undefined && value > validation.max) {
          return NextResponse.json(
            { error: `${validation.field} must be at most ${validation.max}` },
            { status: 400 }
          )
        }
      }
    }

    // Validate model ID
    const validModels = [
      // Claude 4.5 Series (2025)
      'claude-haiku-4-5-20251001',
      'claude-sonnet-4-5-20250929',
      'claude-opus-4-5-20251101',
      // Claude 3.5 Series (Legacy - some deprecated)
      'claude-3-5-haiku-20241022',
      'claude-3-5-sonnet-20241022',
      'claude-3-opus-20240229',
    ]
    if (updateData.modelId && !validModels.includes(updateData.modelId)) {
      return NextResponse.json(
        { error: 'Invalid model ID' },
        { status: 400 }
      )
    }

    // Validate brand name
    if (updateData.brandName && typeof updateData.brandName !== 'string') {
      return NextResponse.json(
        { error: 'Brand name must be a string' },
        { status: 400 }
      )
    }

    // Update settings
    const settings = await prisma.choeAISettings.upsert({
      where: { id: 'global' },
      update: {
        ...updateData,
        updatedBy: updatedBy || null,
      },
      create: {
        id: 'global',
        ...updateData,
        updatedBy: updatedBy || null,
      }
    })

    // Clear the cache
    clearChoeSettingsCache()

    // Note: Full AuditLog requires hash chaining for compliance integrity.
    // For now, just log to console. TODO: Use AuditService for proper logging.
    console.log('[Choé Settings] Updated by:', updatedBy || 'system', 'Fields:', Object.keys(updateData))

    return NextResponse.json({
      success: true,
      message: 'Settings updated successfully',
      settings,
      updatedAt: settings.updatedAt.toISOString(),
    })
  } catch (error) {
    console.error('[Choé Settings API] Update error:', error)
    return NextResponse.json(
      { error: 'Failed to update settings' },
      { status: 500 }
    )
  }
}
