import { NextResponse } from 'next/server';

// Allow indefinite streaming
export const maxDuration = 1800; // 30 minutes
export const dynamic = 'force-dynamic';

const AI_API_KEY = process.env.AI_API_KEY!;
const API_BASE_URL = process.env.AI_API_ENDPOINT || 'https://api.he2.site/api/v1/public';

if (!AI_API_KEY) {
  throw new Error('AI_API_KEY not configured. Please add to .env.local');
}

/**
 * GET /api/ai/stream/[threadId]
 * Server-Sent Events stream for real-time AI generation updates
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
        send({ type: 'status', message: '🔄 Connecting to AI stream...' });

        // Poll indefinitely until completion - NO STOPS
        let attempts = 0;
        let completed = false;

        while (!completed) {
          attempts++;
          send({ type: 'progress', message: `📡 Poll #${attempts} - Checking AI status...`, attempt: attempts });

          try {
            // Use real-time mode to keep thread alive
            const responseUrl = `${API_BASE_URL}/threads/${params.threadId}/response?project_id=${projectId}&realtime=true&timeout=30&include_file_content=true`;
            
            const response = await fetch(responseUrl, {
              headers: { 
                'X-API-Key': AI_API_KEY,
                'Accept': 'text/event-stream'
              }
            });

            if (response.ok) {
              const data = await response.json();
              
              send({ 
                type: 'api_response', 
                message: `📥 API Response: Status = ${data.status}`,
                status: data.status,
                hasContent: !!data.response?.content
              });

              if (data.status === 'completed') {
                const content = data.response?.content || data.content || data.message;
                
                if (content) {
                  send({ type: 'content', message: '✅ AI has completed generation!', content });
                  
                  if (data.has_files && data.files) {
                    send({ type: 'files', message: `📁 ${data.files.length} file(s) generated`, files: data.files });
                  }
                  
                  if (data.has_code && data.code_blocks) {
                    send({ type: 'code', message: `💻 ${data.code_blocks.length} code block(s) generated`, blocks: data.code_blocks });
                  }
                  
                  send({ type: 'complete', message: '🎉 Generation complete!', data });
                  completed = true;
                } else {
                  send({ type: 'warning', message: `⚠️ Status completed but no content, continuing to poll...` });
                }
              } else if (data.status === 'failed') {
                send({ type: 'error', message: '❌ AI generation failed, but will keep trying...' });
                // Don't set completed = true, keep polling
              } else if (data.status === 'running') {
                send({ type: 'running', message: `⏳ AI is still working... (${Math.floor(data.waited_seconds || 0)}s elapsed)` });
              } else {
                send({ type: 'info', message: `📊 Status: ${data.status}` });
              }
            } else {
              send({ type: 'warning', message: `⚠️ HTTP ${response.status} - Retrying...` });
            }
          } catch (error: any) {
            send({ type: 'warning', message: `⚠️ Error: ${error.message} - Continuing...` });
          }

          // Always wait before next poll (unless completed)
          if (!completed) {
            await new Promise(resolve => setTimeout(resolve, 5000));
          }
        }

        send({ type: 'done', message: '✨ Stream complete' });
        controller.close();
      } catch (error: any) {
        send({ type: 'error', message: `❌ Fatal error: ${error.message}` });
        controller.close();
      }
    }
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream',
      'Cache-Control': 'no-cache',
      'Connection': 'keep-alive',
    },
  });
}

