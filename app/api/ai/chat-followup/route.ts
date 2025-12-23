import { NextResponse } from 'next/server';
import { supabaseTenderService } from '@/lib/supabaseTenderService';

// Allow follow-up requests
export const maxDuration = 300; // 5 minutes (Vercel hobby plan limit)
export const dynamic = 'force-dynamic';

const AI_API_KEY = process.env.AI_API_KEY!;
const API_BASE_URL = process.env.AI_API_ENDPOINT || 'https://api.he2.site/api/v1/public';

if (!AI_API_KEY) {
  throw new Error('AI_API_KEY not configured. Please add to .env.local');
}

/**
 * POST /api/ai/chat-followup
 * Send follow-up message and return streaming response
 * Uses Helium's realtime SSE streaming for immediate feedback
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { threadId, projectId, prompt, tenderId, stream = false } = body;

    if (!threadId || !projectId || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: threadId, projectId, prompt' },
        { status: 400 }
      );
    }

    console.log('💬 Sending follow-up message to AI thread:', threadId);
    console.log('📝 User request:', prompt);

    // Send follow-up message ONCE
    const followUpUrl = `${API_BASE_URL}/threads/${threadId}/response?project_id=${projectId}`;
    
    const formData = new FormData();
    formData.append('prompt', prompt);
    
    const followUpResponse = await fetch(followUpUrl, {
      method: 'POST',
      headers: {
        'X-API-Key': AI_API_KEY
      },
      body: formData
    });

    if (!followUpResponse.ok) {
      const errorText = await followUpResponse.text();
      console.error('❌ Follow-up error response:', errorText);
      throw new Error(`Follow-up request failed: ${followUpResponse.status}`);
    }

    const followUpData = await followUpResponse.json();
    console.log('✅ Follow-up message sent successfully');
    console.log(`🆔 Agent Run ID: ${followUpData.agent_run_id}`);

    // If client requests streaming, return immediately and let them use SSE endpoint
    if (stream) {
      return NextResponse.json({
        success: true,
        message: 'Follow-up sent. Connect to SSE stream for real-time updates.',
        threadId,
        projectId,
        agentRunId: followUpData.agent_run_id,
        streamUrl: `/api/ai/stream/${threadId}?projectId=${projectId}`
      });
    }

    // Otherwise, use real-time SSE to get response and return when complete
    console.log('⏳ Connecting to real-time stream for response...');
    
    const responseUrl = `${API_BASE_URL}/threads/${threadId}/response?project_id=${projectId}&realtime=true&include_file_content=true`;
      
    const responseStream = await fetch(responseUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': AI_API_KEY,
        'Accept': 'text/event-stream'
      }
    });

    if (!responseStream.ok) {
      throw new Error(`Failed to connect to stream: ${responseStream.status}`);
    }

    // Process SSE stream
    const reader = responseStream.body?.getReader();
    const decoder = new TextDecoder();
    let buffer = '';
    let fullContent = '';

    if (!reader) {
      throw new Error('No reader available');
    }

    while (true) {
      const { done, value } = await reader.read();
      
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      const lines = buffer.split('\n');
      buffer = lines.pop() || '';

      for (const line of lines) {
        if (line.startsWith('data: ')) {
          const jsonStr = line.substring(6).trim();
          
          if (!jsonStr) continue;

          try {
            const eventData = JSON.parse(jsonStr);
            
            if (eventData.type === 'content') {
              fullContent += eventData.content || '';
              console.log(`✍️ Received content chunk: ${eventData.content?.length || 0} chars`);
            }
            else if (eventData.type === 'complete' || eventData.status === 'completed') {
              console.log(`✅ Stream complete! Total content: ${fullContent.length} chars`);
              
              // Update the proposal if the AI made changes
              if (tenderId && fullContent.length > 50) {
                const tender = await supabaseTenderService.getById(tenderId);
                if (tender) {
                  console.log('📝 AI response received');
                }
              }

              return NextResponse.json({
                success: true,
                message: fullContent || eventData.content || 'AI processing complete',
                status: 'completed',
                threadId,
                projectId
              });
            }
            else if (eventData.type === 'status') {
              console.log(`📊 Status: ${eventData.status}`);
            }
          } catch (parseError: any) {
            console.error(`⚠️ Parse error: ${parseError.message}`);
          }
        }
      }
    }

    // If stream ended without explicit completion
    return NextResponse.json({
      success: true,
      message: fullContent || 'AI processing complete',
      status: 'completed',
      threadId,
      projectId
    });

  } catch (error: any) {
    console.error('❌ Chat follow-up error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to process chat message',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

