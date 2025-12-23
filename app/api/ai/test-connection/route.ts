import { NextResponse } from 'next/server';

/**
 * Comprehensive Helium API Connection Tester
 * GET /api/ai/test-connection
 * 
 * Tests:
 * 1. Environment configuration
 * 2. Network connectivity
 * 3. API key validation
 * 4. Quick action endpoint
 * 5. Response polling
 * 6. File retrieval
 * 7. SSE streaming
 */
export async function GET() {
  const AI_API_KEY = process.env.AI_API_KEY;
  const API_BASE_URL = process.env.AI_API_ENDPOINT || 'https://api.he2.site/api/v1/public';

  const results = {
    timestamp: new Date().toISOString(),
    environment: {
      apiKeyConfigured: !!AI_API_KEY,
      apiKeyPreview: AI_API_KEY ? `${AI_API_KEY.substring(0, 15)}...${AI_API_KEY.slice(-4)}` : 'NOT SET',
      apiKeyLength: AI_API_KEY?.length || 0,
      apiKeyFormat: AI_API_KEY ? (AI_API_KEY.startsWith('he-') ? '✅ Valid Format' : '⚠️ Invalid Format (should start with "he-")') : '❌ Not Set',
      apiEndpoint: API_BASE_URL,
      nodeEnv: process.env.NODE_ENV,
    },
    tests: [] as Array<{
      test: string;
      status: string;
      duration?: number;
      details?: any;
      error?: string;
      recommendation?: string;
    }>
  };

  // Test 1: Environment Configuration
  results.tests.push({
    test: '1. Environment Configuration',
    status: AI_API_KEY ? '✅ PASSED' : '❌ FAILED',
    details: {
      hasApiKey: !!AI_API_KEY,
      hasEndpoint: !!API_BASE_URL,
      endpoint: API_BASE_URL
    },
    recommendation: !AI_API_KEY ? 'Add AI_API_KEY to .env.local file' : undefined
  });

  if (!AI_API_KEY) {
    return NextResponse.json({
      ...results,
      overall: '❌ Configuration Error',
      message: 'AI_API_KEY not found in environment variables',
      recommendation: 'Create .env.local file and add: AI_API_KEY=your_key_here',
      readyForProduction: false
    }, { status: 500 });
  }

  // Test 2: Network Connectivity
  const networkTestStart = Date.now();
  try {
    // Test if we can reach the API endpoint (any response means network is working)
    const response = await fetch('https://api.he2.site', { 
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    
    const duration = Date.now() - networkTestStart;
    
    results.tests.push({
      test: '2. Network Connectivity',
      status: '✅ PASSED',
      duration,
      details: {
        reachable: true,
        httpStatus: response.status,
        latency: `${duration}ms`,
        note: 'API endpoint is reachable'
      }
    });
  } catch (error: any) {
    results.tests.push({
      test: '2. Network Connectivity',
      status: '❌ FAILED',
      duration: Date.now() - networkTestStart,
      error: error.message,
      recommendation: 'Check internet connection and firewall settings'
    });
    
    return NextResponse.json({
      ...results,
      overall: '❌ Network Error',
      message: 'Cannot reach Helium API endpoint',
      readyForProduction: false
    }, { status: 500 });
  }

  // Test 3: API Key Validation (Quick Action)
  const quickActionStart = Date.now();
  let threadId: string | null = null;
  let projectId: string | null = null;
  
  try {
    const testPrompt = 'Test connection. Please reply with: "Connection successful"';
    const formData = new FormData();
    formData.append('prompt', testPrompt);
    formData.append('source', 'connection-test');
    
    const quickActionResponse = await fetch(`${API_BASE_URL}/quick-action`, {
      method: 'POST',
      headers: {
        'X-API-Key': AI_API_KEY
      },
      body: formData,
      signal: AbortSignal.timeout(30000)
    });

    const quickActionDuration = Date.now() - quickActionStart;

    if (!quickActionResponse.ok) {
      const errorText = await quickActionResponse.text();
      let errorDetails: any;
      try {
        errorDetails = JSON.parse(errorText);
      } catch {
        errorDetails = { raw: errorText };
      }

      results.tests.push({
        test: '3. API Key Validation',
        status: '❌ FAILED',
        duration: quickActionDuration,
        details: {
          httpStatus: quickActionResponse.status,
          statusText: quickActionResponse.statusText
        },
        error: errorDetails.message || errorText,
        recommendation: quickActionResponse.status === 401 || quickActionResponse.status === 403 
          ? 'API key is invalid. Check your AI_API_KEY in .env.local'
          : 'Check API endpoint URL and network connectivity'
      });

      return NextResponse.json({
        ...results,
        overall: '❌ Authentication Failed',
        message: 'API key validation failed',
        readyForProduction: false
      }, { status: 500 });
    }

    const data = await quickActionResponse.json();
    threadId = data.thread_id;
    projectId = data.project_id;
    
    results.tests.push({
      test: '3. API Key Validation',
      status: '✅ PASSED',
      duration: quickActionDuration,
      details: {
        success: data.success,
        projectId: projectId,
        threadId: threadId,
        agentRunId: data.agent_run_id,
        message: data.message
      }
    });

  } catch (error: any) {
    results.tests.push({
      test: '3. API Key Validation',
      status: '❌ FAILED',
      duration: Date.now() - quickActionStart,
      error: error.message,
      recommendation: 'Check API key format and network connectivity'
    });
    
    return NextResponse.json({
      ...results,
      overall: '❌ API Error',
      message: 'Failed to create quick action',
      readyForProduction: false
    }, { status: 500 });
  }

  // Test 4: Response Polling (Standard Mode)
  const pollStart = Date.now();
  let pollingSuccess = false;
  
  if (threadId && projectId) {
    try {
      // Wait a bit for processing
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      const responseUrl = `${API_BASE_URL}/threads/${threadId}/response?project_id=${projectId}&timeout=10`;
      const pollResponse = await fetch(responseUrl, {
        method: 'GET',
        headers: { 
          'X-API-Key': AI_API_KEY
        },
        signal: AbortSignal.timeout(15000)
      });

      const pollDuration = Date.now() - pollStart;

      if (pollResponse.ok) {
        const pollData = await pollResponse.json();
        pollingSuccess = true;
        
        results.tests.push({
          test: '4. Response Polling',
          status: pollData.status === 'completed' ? '✅ PASSED' : '⏳ IN PROGRESS',
          duration: pollDuration,
          details: {
            status: pollData.status,
            hasResponse: !!pollData.response,
            hasContent: !!pollData.response?.content,
            waitedSeconds: pollData.waited_seconds,
            responsePreview: pollData.response?.content?.substring(0, 100) || 'N/A'
          }
        });
      } else {
        const errorText = await pollResponse.text();
        results.tests.push({
          test: '4. Response Polling',
          status: '⚠️ DEGRADED',
          duration: pollDuration,
          details: {
            httpStatus: pollResponse.status,
            statusText: pollResponse.statusText
          },
          error: errorText,
          recommendation: 'Polling endpoint accessible but returned error'
        });
      }
    } catch (error: any) {
      results.tests.push({
        test: '4. Response Polling',
        status: '⚠️ DEGRADED',
        duration: Date.now() - pollStart,
        error: error.message,
        recommendation: 'Consider using SSE streaming instead of polling'
      });
    }
  }

  // Test 5: SSE Streaming Mode
  const sseStart = Date.now();
  if (threadId && projectId) {
    try {
      const sseUrl = `${API_BASE_URL}/threads/${threadId}/response?project_id=${projectId}&realtime=true&timeout=5`;
      const sseResponse = await fetch(sseUrl, {
        method: 'GET',
        headers: {
          'X-API-Key': AI_API_KEY,
          'Accept': 'text/event-stream'
        },
        signal: AbortSignal.timeout(10000)
      });

      const sseDuration = Date.now() - sseStart;
      
      if (sseResponse.ok) {
        // Try to parse as JSON (non-streaming response)
        const contentType = sseResponse.headers.get('content-type');
        const isJson = contentType?.includes('application/json');
        
        if (isJson) {
          const data = await sseResponse.json();
          results.tests.push({
            test: '5. SSE Streaming Mode',
            status: '✅ PASSED',
            duration: sseDuration,
            details: {
              mode: 'realtime',
              supportsSSE: true,
              status: data.status,
              contentType: contentType
            }
          });
        } else {
          results.tests.push({
            test: '5. SSE Streaming Mode',
            status: '✅ PASSED',
            duration: sseDuration,
            details: {
              mode: 'realtime',
              supportsSSE: true,
              contentType: contentType
            }
          });
        }
      } else {
        results.tests.push({
          test: '5. SSE Streaming Mode',
          status: '⚠️ NOT SUPPORTED',
          duration: sseDuration,
          details: {
            httpStatus: sseResponse.status
          },
          recommendation: 'Use standard polling instead'
        });
      }
    } catch (error: any) {
      results.tests.push({
        test: '5. SSE Streaming Mode',
        status: '⚠️ NOT TESTED',
        error: error.message
      });
    }
  }

  // Test 6: Files Endpoint
  const filesStart = Date.now();
  if (threadId && projectId) {
    try {
      const filesUrl = `${API_BASE_URL}/threads/${threadId}/files?project_id=${projectId}`;
      const filesResponse = await fetch(filesUrl, {
        method: 'GET',
        headers: { 'X-API-Key': AI_API_KEY },
        signal: AbortSignal.timeout(10000)
      });

      const filesDuration = Date.now() - filesStart;

      if (filesResponse.ok) {
        const filesData = await filesResponse.json();
        results.tests.push({
          test: '6. Files Endpoint',
          status: '✅ PASSED',
          duration: filesDuration,
          details: {
            accessible: true,
            filesCount: filesData.files?.length || 0,
            hasFiles: filesData.files && filesData.files.length > 0
          }
        });
      } else {
        results.tests.push({
          test: '6. Files Endpoint',
          status: '⚠️ DEGRADED',
          duration: filesDuration,
          details: {
            httpStatus: filesResponse.status
          }
        });
      }
    } catch (error: any) {
      results.tests.push({
        test: '6. Files Endpoint',
        status: '⚠️ ERROR',
        duration: Date.now() - filesStart,
        error: error.message
      });
    }
  }

  // Overall Assessment
  const passedTests = results.tests.filter(t => t.status.includes('✅')).length;
  const totalTests = results.tests.length;
  const criticalTests = results.tests.slice(0, 3); // First 3 are critical
  const allCriticalPassed = criticalTests.every(t => t.status.includes('✅'));

  const overallStatus = allCriticalPassed 
    ? `✅ All Critical Tests Passed (${passedTests}/${totalTests})`
    : `❌ Critical Tests Failed (${passedTests}/${totalTests})`;

  return NextResponse.json({
    ...results,
    overall: overallStatus,
    summary: {
      totalTests,
      passed: passedTests,
      failed: results.tests.filter(t => t.status.includes('❌')).length,
      warnings: results.tests.filter(t => t.status.includes('⚠️')).length,
      allCriticalPassed,
      readyForProduction: allCriticalPassed
    },
    message: allCriticalPassed 
      ? 'Helium API is properly configured and ready for use!' 
      : 'Some tests failed. Please review recommendations.',
    recommendations: results.tests
      .filter(t => t.recommendation)
      .map(t => ({ test: t.test, recommendation: t.recommendation }))
  });
}

