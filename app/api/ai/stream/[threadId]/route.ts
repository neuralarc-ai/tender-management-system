import { NextResponse } from 'next/server';

// Allow indefinite streaming
export const maxDuration = 1800; // 30 minutes
export const dynamic = 'force-dynamic';

const AI_API_KEY = process.env.AI_API_KEY!;
const API_BASE_URL = process.env.AI_API_ENDPOINT || 'https://api.he2.site/api/v1/public';

if (!AI_API_KEY) {
  throw new Error('AI_API_KEY not configured');
}

/**
 * GET /api/ai/stream/[threadId]
 * Pure pass-through of Helium's SSE stream with minimal processing
 * Let the AI speak for itself - no hardcoded messages
 */
export async function GET(
  request: Request,
  { params }: { params: { threadId: string } }
) {
  const { searchParams } = new URL(request.url);
  const projectId = searchParams.get('projectId');

  if (!projectId) {
    return NextResponse.json({ error: 'projectId required' }, { status: 400 });
  }

  const encoder = new TextEncoder();
  const stream = new ReadableStream({
    async start(controller) {
      const send = (data: any) => {
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(data)}\n\n`));
      };

      try {
        // Connect to Helium's realtime SSE stream
        const responseUrl = `${API_BASE_URL}/threads/${params.threadId}/response?project_id=${projectId}&realtime=true&include_file_content=true`;
        
        const response = await fetch(responseUrl, {
          headers: { 
            'X-API-Key': AI_API_KEY,
            'Accept': 'text/event-stream'
          }
        });

        if (!response.ok) {
          send({ 
            type: 'error', 
            message: `Failed to connect to Helium API: ${response.status}` 
          });
          controller.close();
          return;
        }

        const contentType = response.headers.get('content-type');
        
        // Handle SSE stream from Helium
        if (contentType?.includes('text/event-stream')) {
          const reader = response.body?.getReader();
          const decoder = new TextDecoder();
          let buffer = '';

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
                  
                  // Forward Helium events with minimal transformation
                  // Map Helium's event types to our UI types
                  if (eventData.type === 'status') {
                    send({
                      type: 'status',
                      status: eventData.status,
                      elapsed: eventData.elapsed || 0,
                      agent_run_id: eventData.agent_run_id
                    });
                  } 
                  else if (eventData.type === 'content') {
                    // This is the actual AI response content streaming
                    send({
                      type: 'content',
                      content: eventData.content || '',
                      chunk_id: eventData.chunk_id
                    });
                  }
                  else if (eventData.type === 'tool_call') {
                    // AI is using a tool (browsing, searching, etc.)
                    send({
                      type: 'tool',
                      tool_name: eventData.tool_name || eventData.name,
                      tool_input: eventData.tool_input || eventData.input,
                      status: eventData.status || 'running'
                    });
                  }
                  else if (eventData.type === 'tool_result') {
                    // Tool execution result
                    send({
                      type: 'tool_result',
                      tool_name: eventData.tool_name,
                      result: eventData.result,
                      success: eventData.success !== false
                    });
                  }
                  else {
                    // Forward any other events as-is
                    send(eventData);
                  }
                } catch (parseError: any) {
                  console.error('Parse error:', parseError.message);
                }
              }
            }
          }

          controller.close();
        } else {
          // Fallback: JSON response
          const data = await response.json();
          send({ type: 'complete', data });
          controller.close();
        }

      } catch (error: any) {
        send({ 
          type: 'error', 
          message: error.message
        });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache, no-transform',
      'Connection': 'keep-alive',
      'X-Accel-Buffering': 'no',
    },
  });
}
