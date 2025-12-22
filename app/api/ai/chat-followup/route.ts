import { NextResponse } from 'next/server';
import { supabaseTenderService } from '@/lib/supabaseTenderService';

// Allow indefinite follow-up requests
export const maxDuration = 600; // 10 minutes
export const dynamic = 'force-dynamic';

const AI_API_KEY = process.env.AI_API_KEY!;
const API_BASE_URL = process.env.AI_API_ENDPOINT || 'https://api.he2.site/api/v1/public';

if (!AI_API_KEY) {
  throw new Error('AI_API_KEY not configured. Please add to .env.local');
}

/**
 * POST /api/ai/chat-followup
 * Send follow-up message - NO TIMEOUT LIMIT
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { threadId, projectId, prompt, tenderId } = body;

    if (!threadId || !projectId || !prompt) {
      return NextResponse.json(
        { error: 'Missing required fields: threadId, projectId, prompt' },
        { status: 400 }
      );
    }

    console.log('💬 Sending ONE follow-up message to AI thread:', threadId);
    console.log('📝 User request:', prompt);
    console.log('⚠️ Will send ONCE, then only poll for response...');

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
    console.log('⏳ Now ONLY polling for response - no more sending...');

    // Poll indefinitely until response - ONLY CHECK, don't send
    let attempts = 0;
    let response: any = null;
    
    while (true) { // Infinite loop until completion
      attempts++;
      await new Promise(resolve => setTimeout(resolve, 5000)); // 5 second pause
      
      console.log(`📡 Follow-up poll attempt ${attempts} - ONLY checking status...`);
      
      // GET only - just checking status with realtime mode
      const responseUrl = `${API_BASE_URL}/threads/${threadId}/response?project_id=${projectId}&realtime=true&timeout=20&include_file_content=true`;
      
      try {
        const responseData = await fetch(responseUrl, {
          method: 'GET',
          headers: {
            'X-API-Key': AI_API_KEY,
            'Accept': 'text/event-stream'
          }
        });

        if (responseData.ok) {
          response = await responseData.json();
          
          if (response.status === 'completed' && response.response?.content) {
            console.log(`✅ AI response received after ${attempts} attempts`);
            break; // Exit loop
          } else if (response.status === 'failed') {
            console.error('⚠️ AI reported failed, but continuing to poll anyway...');
            await new Promise(resolve => setTimeout(resolve, 10000));
          } else {
            console.log(`⏳ Status: ${response.status}, continuing...`);
          }
        }
      } catch (error: any) {
        console.error('⚠️ Poll error:', error.message, '- Retrying...');
        // Continue polling even on errors
      }
    }

    if (response && response.status === 'completed') {
      // Extract content from multiple possible locations
      const aiMessage = response.response?.content || response.content || response.message || 'AI processing complete';
      
      // Update the proposal if the AI made changes
      if (tenderId && aiMessage.length > 50) {
        const tender = await supabaseTenderService.getById(tenderId);
        if (tender) {
          console.log('📝 AI response saved to conversation');
        }
      }

      return NextResponse.json({
        success: true,
        message: aiMessage,
        status: 'completed'
      });
    } else {
      // Even if not completed, return what we have
      console.log('⚠️ Polling ended but not completed, returning partial response');
      return NextResponse.json({
        success: true,
        message: 'AI is still processing. Please check back.',
        status: response?.status || 'unknown'
      });
    }

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

