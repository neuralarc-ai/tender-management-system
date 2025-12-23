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
            // Use standard JSON polling (NOT SSE)
            const responseUrl = `${API_BASE_URL}/threads/${params.threadId}/response?project_id=${projectId}&timeout=30&include_file_content=true`;
            
            const response = await fetch(responseUrl, {
              headers: { 
                'X-API-Key': AI_API_KEY,
                'Accept': 'application/json' // Request JSON format
              }
            });

            if (response.ok) {
              const contentType = response.headers.get('content-type');
              let data: any;
              
              // Handle different content types
              if (contentType?.includes('application/json')) {
                data = await response.json();
              } else if (contentType?.includes('text/event-stream')) {
                // Parse SSE format if server sends it
                const text = await response.text();
                const lines = text.split('\n').filter(line => line.startsWith('data: '));
                if (lines.length > 0) {
                  const lastDataLine = lines[lines.length - 1];
                  const jsonStr = lastDataLine.substring(6);
                  data = JSON.parse(jsonStr);
                } else {
                  send({ type: 'warning', message: `⚠️ No data in SSE response - Retrying...` });
                  await new Promise(resolve => setTimeout(resolve, 10000));
                  continue;
                }
              } else {
                send({ type: 'warning', message: `⚠️ Unexpected content type: ${contentType} - Retrying...` });
                await new Promise(resolve => setTimeout(resolve, 10000));
                continue;
              }
              
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
              const errorText = await response.text();
              send({ type: 'warning', message: `⚠️ HTTP ${response.status}: ${errorText.substring(0, 100)} - Retrying...` });
            }
          } catch (error: any) {
            // Better error handling for JSON parsing issues
            if (error.message.includes('JSON') || error.message.includes('Unexpected token')) {
              send({ type: 'warning', message: `⚠️ JSON parse error (API may be in SSE mode) - Retrying...` });
            } else {
              send({ type: 'warning', message: `⚠️ Error: ${error.message} - Continuing...` });
            }
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

