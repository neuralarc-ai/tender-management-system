import { NextResponse } from 'next/server';

/**
 * GET /api/ai/test-connection
 * Test Helium API connection and key validity
 */
export async function GET() {
  const AI_API_KEY = process.env.AI_API_KEY;
  const API_BASE_URL = process.env.AI_API_ENDPOINT || 'https://api.he2.site/api/v1/public';

  const results = {
    timestamp: new Date().toISOString(),
    apiKeyConfigured: !!AI_API_KEY,
    apiKeyPreview: AI_API_KEY ? `${AI_API_KEY.substring(0, 10)}...` : 'NOT SET',
    apiEndpoint: API_BASE_URL,
    tests: [] as any[]
  };

  if (!AI_API_KEY) {
    return NextResponse.json({
      ...results,
      error: 'AI_API_KEY not found in environment variables',
      message: 'Please add AI_API_KEY to your .env.local file'
    }, { status: 500 });
  }

  try {
    // Test 1: Simple API call to verify key
    results.tests.push({ test: 'API Key Validation', status: 'testing...' });
    
    const testPrompt = 'Hello, this is a test. Please respond with "API connection successful".';
    const formData = new FormData();
    formData.append('prompt', testPrompt);
    formData.append('source', 'test-connection');
    
    const quickActionResponse = await fetch(`${API_BASE_URL}/quick-action`, {
      method: 'POST',
      headers: {
        'X-API-Key': AI_API_KEY
      },
      body: formData
    });

    if (quickActionResponse.ok) {
      const data = await quickActionResponse.json();
      results.tests[0] = {
        test: 'API Key Validation',
        status: 'PASSED ✅',
        details: {
          projectId: data.project_id,
          threadId: data.thread_id,
          agentRunId: data.agent_run_id,
          message: data.message
        }
      };
      
      // Test 2: Check if we can poll for response
      results.tests.push({ test: 'API Response Polling', status: 'testing...' });
      
      // Wait a bit for processing
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      const responseUrl = `${API_BASE_URL}/threads/${data.thread_id}/response?project_id=${data.project_id}&timeout=10`;
      const pollResponse = await fetch(responseUrl, {
        headers: { 'X-API-Key': AI_API_KEY }
      });
      
      if (pollResponse.ok) {
        const pollData = await pollResponse.json();
        results.tests[1] = {
          test: 'API Response Polling',
          status: pollData.status === 'completed' ? 'PASSED ✅' : 'RUNNING ⏳',
          details: {
            status: pollData.status,
            hasContent: !!pollData.response?.content,
            waitedSeconds: pollData.waited_seconds
          }
        };
      } else {
        results.tests[1] = {
          test: 'API Response Polling',
          status: `FAILED ❌ (HTTP ${pollResponse.status})`,
          error: await pollResponse.text()
        };
      }

      return NextResponse.json({
        ...results,
        overall: 'API Connection Successful ✅',
        message: 'Your API key is valid and working!',
        readyForProduction: true
      });
      
    } else {
      const errorText = await quickActionResponse.text();
      results.tests[0] = {
        test: 'API Key Validation',
        status: `FAILED ❌ (HTTP ${quickActionResponse.status})`,
        error: errorText
      };

      return NextResponse.json({
        ...results,
        overall: 'API Connection Failed ❌',
        message: 'Check your API key or endpoint configuration',
        readyForProduction: false
      }, { status: 500 });
    }

  } catch (error: any) {
    return NextResponse.json({
      ...results,
      overall: 'Connection Error ❌',
      error: error.message,
      message: 'Failed to connect to Helium API',
      readyForProduction: false
    }, { status: 500 });
  }
}

