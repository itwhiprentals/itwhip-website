// app/fleet/api/choe/anthropic-usage/route.ts
// Fleet API for Anthropic Admin API usage and cost data

import { NextRequest, NextResponse } from 'next/server';
import {
  isAdminApiConfigured,
  getQuickStats,
  getUsageSummary,
} from '@/app/lib/ai-booking/anthropic-admin';

const FLEET_KEY = 'phoenix-fleet-2847';

function validateApiKey(request: NextRequest): boolean {
  const key = request.nextUrl.searchParams.get('key');
  return key === FLEET_KEY;
}

export async function GET(request: NextRequest) {
  if (!validateApiKey(request)) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Check if Admin API is configured
  if (!isAdminApiConfigured()) {
    return NextResponse.json({
      success: false,
      error: 'Anthropic Admin API not configured',
      configured: false,
    }, { status: 503 });
  }

  try {
    const searchParams = request.nextUrl.searchParams;
    const view = searchParams.get('view') || 'quick';

    // Quick stats view (default)
    if (view === 'quick') {
      const stats = await getQuickStats();
      return NextResponse.json({
        success: true,
        configured: true,
        data: stats,
      });
    }

    // Detailed view with date range
    if (view === 'detailed') {
      const startDateStr = searchParams.get('start');
      const endDateStr = searchParams.get('end');

      const endDate = endDateStr ? new Date(endDateStr) : new Date();
      const startDate = startDateStr
        ? new Date(startDateStr)
        : new Date(endDate.getTime() - 30 * 24 * 60 * 60 * 1000); // Default: last 30 days

      const summary = await getUsageSummary(startDate, endDate);
      return NextResponse.json({
        success: true,
        configured: true,
        data: summary,
      });
    }

    return NextResponse.json({
      success: false,
      error: 'Invalid view parameter. Use "quick" or "detailed"',
    }, { status: 400 });

  } catch (error) {
    console.error('[fleet/api/choe/anthropic-usage] Error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch usage data',
      configured: true,
    }, { status: 500 });
  }
}
