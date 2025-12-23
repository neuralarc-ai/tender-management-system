import { NextRequest, NextResponse } from 'next/server';

/**
 * GET /api/ai/get-file
 * Fetches a file from Helium API
 * 
 * Query params:
 * - file_id: File ID from Helium
 * - project_id: Project ID
 * - thread_id: Thread ID
 */
export async function GET(request: NextRequest): Promise<Response> {
  const searchParams = request.nextUrl.searchParams;
  const fileId = searchParams.get('file_id');
  const projectId = searchParams.get('project_id');
  const threadId = searchParams.get('thread_id');

  if (!fileId || !projectId || !threadId) {
    return NextResponse.json(
      { 
        success: false, 
        error: 'Missing required parameters: file_id, project_id, and thread_id' 
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

  try {
    console.log(`📁 Fetching file: ${fileId} from project: ${projectId}, thread: ${threadId}`);

    const fileUrl = `${AI_API_ENDPOINT}/files/${encodeURIComponent(fileId)}?project_id=${projectId}&thread_id=${threadId}&download=false`;
    
    const response = await fetch(fileUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': AI_API_KEY
      }
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('❌ File fetch error:', errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: `Failed to fetch file: ${response.status}`,
          details: errorText
        },
        { status: response.status }
      );
    }

    const fileData = await response.json();
    
    console.log('✅ File fetched successfully:', fileData.file?.file_name);

    return NextResponse.json(fileData);

  } catch (error: any) {
    console.error('❌ Error fetching file:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch file',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

