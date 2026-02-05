// app/api/ai/booking/conversation/[sessionId]/route.ts
// Load conversation state for resuming AI chat sessions

import { NextRequest, NextResponse } from 'next/server';
import { loadConversation } from '@/app/lib/ai-booking/conversation-service';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ sessionId: string }> }
) {
  try {
    const { sessionId } = await params;

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      );
    }

    const conversation = await loadConversation(sessionId);

    if (!conversation) {
      return NextResponse.json(
        { success: false, error: 'Conversation not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: {
        sessionId: conversation.sessionId,
        session: conversation.session,
        messages: conversation.messages,
        vehicles: conversation.vehicles,
        totalTokens: conversation.totalTokens,
        estimatedCost: conversation.estimatedCost,
        lastActivityAt: conversation.lastActivityAt.toISOString(),
      },
    });
  } catch (error) {
    console.error('[api/ai/booking/conversation] Error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to load conversation' },
      { status: 500 }
    );
  }
}
