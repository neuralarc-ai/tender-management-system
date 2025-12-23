import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ai/get-response
 * Waits for AI response completion from Helium API
 * 
 * Query params:
 * - thread_id: Thread ID from quick action
 * - project_id: Project ID from quick action
 */

// Configure route for extended duration
export const maxDuration = 300;

export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams;
  const threadId = searchParams.get('thread_id');
  const projectId = searchParams.get('project_id');

  if (!threadId || !projectId) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Missing required parameters: thread_id and project_id' 
      },
      { status: 400 }
    );
  }

  const AI_API_KEY = process.env.AI_API_KEY;
  const AI_API_ENDPOINT = process.env.AI_API_ENDPOINT || 'https://api.he2.site/api/v1/public';

  if (!AI_API_KEY) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'AI service not configured' 
      },
      { status: 500 }
    );
  }

  console.log(`📡 Waiting for AI response: thread=${threadId}`);

  try {
    // Single request with short timeout - frontend already waited 180 seconds
    // Just check current status with minimal wait (30 seconds)
    const responseUrl = `${AI_API_ENDPOINT}/threads/${threadId}/response?project_id=${projectId}&timeout=30&include_file_content=true`;
    
    const response = await fetch(responseUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': AI_API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ API error:', errorText);
      
      return NextResponse.json(
        { 
          success: false,
          error: `Failed to get AI response: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const data = await response.json();
    console.log(`✅ Response status: ${data.status}`);
    
    return NextResponse.json(data);

  } catch (error: any) {
    console.error('❌ Error:', error);
    
    return NextResponse.json(
      { 
        success: false,
        error: 'Failed to get AI response',
        details: error.message
      },
      { status: 500 }
    );
  }
}

