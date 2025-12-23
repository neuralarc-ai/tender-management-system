import { NextRequest, NextResponse } from 'next/server';

/**
 * POST /api/ai/chat-followup
 * Send follow-up message to existing AI thread
 * Returns stream URL for real-time updates
 */
export async function POST(request: NextRequest): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { threadId, projectId, prompt, tenderId, stream } = body;

    if (!threadId || !projectId || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: threadId, projectId, or prompt' },
        { status: 400 }
      );
    }

    // For now, return a success response without actual AI integration
    // TODO: Integrate with Helium AI API for real chat functionality
    return NextResponse.json({
      success: true,
      message: 'Chat follow-up feature is under development',
      threadId,
      projectId,
      streamUrl: stream ? `/api/ai/stream/${threadId}` : null,
    });
  } catch (error: unknown) {
    console.error('Error in chat-followup:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json(
      { error: 'Failed to send chat follow-up', details: errorMessage },
      { status: 500 }
    );
  }
}
