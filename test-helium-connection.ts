#!/usr/bin/env ts-node
/**
 * Helium API Connection Test Script
 * 
 * This script tests the Helium API connectivity and configuration
 * Run with: npx ts-node test-helium-connection.ts
 */

import * as dotenv from 'dotenv';
import * as path from 'path';

// Load environment variables
dotenv.config({ path: path.join(__dirname, '.env.local') });

interface TestResult {
  test: string;
  status: 'PASS' | 'FAIL' | 'WARN';
  message: string;
  duration?: number;
  details?: any;
}

const results: TestResult[] = [];

function log(emoji: string, message: string): void {
  console.log(`${emoji} ${message}`);
}

function addResult(result: TestResult): void {
  results.push(result);
  const symbol = result.status === 'PASS' ? '✅' : result.status === 'FAIL' ? '❌' : '⚠️';
  log(symbol, `${result.test}: ${result.message}`);
  if (result.details) {
    console.log('   Details:', JSON.stringify(result.details, null, 2));
  }
}

async function testEnvironmentConfig(): Promise<void> {
  log('🔍', 'Testing environment configuration...');
  
  const apiKey = process.env.AI_API_KEY;
  const apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.he2.site/api/v1/public';
  
  if (!apiKey) {
    addResult({
      test: 'Environment Configuration',
      status: 'FAIL',
      message: 'AI_API_KEY not found in environment',
      details: {
        envFile: '.env.local',
        recommendation: 'Create .env.local and add AI_API_KEY=your_key_here'
      }
    });
    return;
  }
  
  const isValidFormat = apiKey.startsWith('he-');
  addResult({
    test: 'Environment Configuration',
    status: isValidFormat ? 'PASS' : 'WARN',
    message: isValidFormat ? 'API key configured correctly' : 'API key format may be invalid',
    details: {
      keyLength: apiKey.length,
      keyPreview: `${apiKey.substring(0, 15)}...${apiKey.slice(-4)}`,
      validFormat: isValidFormat,
      endpoint: apiEndpoint
    }
  });
}

async function testNetworkConnectivity(): Promise<void> {
  log('🌐', 'Testing network connectivity...');
  
  const start = Date.now();
  try {
    const response = await fetch('https://api.he2.site', {
      method: 'HEAD',
      signal: AbortSignal.timeout(5000)
    });
    
    const duration = Date.now() - start;
    
    addResult({
      test: 'Network Connectivity',
      status: 'PASS',
      message: 'Network connection successful',
      duration,
      details: {
        httpStatus: response.status,
        latency: `${duration}ms`,
        note: 'API endpoint is reachable'
      }
    });
  } catch (error: any) {
    addResult({
      test: 'Network Connectivity',
      status: 'FAIL',
      message: 'Cannot reach Helium API',
      duration: Date.now() - start,
      details: {
        error: error.message,
        recommendation: 'Check internet connection and firewall settings'
      }
    });
  }
}

async function testAPIKey(): Promise<{ threadId?: string; projectId?: string }> {
  log('🔑', 'Testing API key authentication...');
  
  const apiKey = process.env.AI_API_KEY;
  const apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.he2.site/api/v1/public';
  
  if (!apiKey) {
    addResult({
      test: 'API Key Authentication',
      status: 'FAIL',
      message: 'No API key to test',
      details: {}
    });
    return {};
  }
  
  const start = Date.now();
  try {
    const formData = new FormData();
    formData.append('prompt', 'Test connection. Reply with: "Connection successful"');
    formData.append('source', 'connection-test-cli');
    
    const response = await fetch(`${apiEndpoint}/quick-action`, {
      method: 'POST',
      headers: {
        'X-API-Key': apiKey
      },
      body: formData,
      signal: AbortSignal.timeout(30000)
    });
    
    const duration = Date.now() - start;
    
    if (!response.ok) {
      const errorText = await response.text();
      addResult({
        test: 'API Key Authentication',
        status: 'FAIL',
        message: 'API key authentication failed',
        duration,
        details: {
          httpStatus: response.status,
          error: errorText.substring(0, 200),
          recommendation: response.status === 401 || response.status === 403
            ? 'API key is invalid. Check your AI_API_KEY'
            : 'Check API endpoint URL'
        }
      });
      return {};
    }
    
    const data = await response.json();
    addResult({
      test: 'API Key Authentication',
      status: 'PASS',
      message: 'API key is valid',
      duration,
      details: {
        projectId: data.project_id,
        threadId: data.thread_id,
        agentRunId: data.agent_run_id
      }
    });
    
    return {
      threadId: data.thread_id,
      projectId: data.project_id
    };
  } catch (error: any) {
    addResult({
      test: 'API Key Authentication',
      status: 'FAIL',
      message: 'Failed to authenticate',
      duration: Date.now() - start,
      details: {
        error: error.message
      }
    });
    return {};
  }
}

async function testResponsePolling(threadId: string, projectId: string): Promise<void> {
  log('📡', 'Testing response polling...');
  
  const apiKey = process.env.AI_API_KEY!;
  const apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.he2.site/api/v1/public';
  
  // Wait a bit for processing
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  const start = Date.now();
  try {
    const responseUrl = `${apiEndpoint}/threads/${threadId}/response?project_id=${projectId}&timeout=10`;
    const response = await fetch(responseUrl, {
      method: 'GET',
      headers: {
        'X-API-Key': apiKey,
        'Accept': 'application/json'
      },
      signal: AbortSignal.timeout(15000)
    });
    
    const duration = Date.now() - start;
    
    if (response.ok) {
      const contentType = response.headers.get('content-type');
      let data: any;
      
      if (contentType?.includes('application/json')) {
        data = await response.json();
      } else if (contentType?.includes('text/event-stream')) {
        const text = await response.text();
        const lines = text.split('\n').filter(line => line.startsWith('data: '));
        if (lines.length > 0) {
          const jsonStr = lines[lines.length - 1].substring(6);
          data = JSON.parse(jsonStr);
        }
      }
      
      addResult({
        test: 'Response Polling',
        status: 'PASS',
        message: `Polling successful (status: ${data.status})`,
        duration,
        details: {
          status: data.status,
          hasContent: !!data.response?.content,
          contentType: contentType
        }
      });
    } else {
      addResult({
        test: 'Response Polling',
        status: 'WARN',
        message: 'Polling endpoint returned error',
        duration,
        details: {
          httpStatus: response.status,
          statusText: response.statusText
        }
      });
    }
  } catch (error: any) {
    addResult({
      test: 'Response Polling',
      status: 'WARN',
      message: 'Polling test failed',
      duration: Date.now() - start,
      details: {
        error: error.message
      }
    });
  }
}

async function testFilesEndpoint(threadId: string, projectId: string): Promise<void> {
  log('📁', 'Testing files endpoint...');
  
  const apiKey = process.env.AI_API_KEY!;
  const apiEndpoint = process.env.AI_API_ENDPOINT || 'https://api.he2.site/api/v1/public';
  
  const start = Date.now();
  try {
    const filesUrl = `${apiEndpoint}/threads/${threadId}/files?project_id=${projectId}`;
    const response = await fetch(filesUrl, {
      method: 'GET',
      headers: { 'X-API-Key': apiKey },
      signal: AbortSignal.timeout(10000)
    });
    
    const duration = Date.now() - start;
    
    if (response.ok) {
      const data = await response.json();
      addResult({
        test: 'Files Endpoint',
        status: 'PASS',
        message: 'Files endpoint accessible',
        duration,
        details: {
          filesCount: data.files?.length || 0
        }
      });
    } else {
      addResult({
        test: 'Files Endpoint',
        status: 'WARN',
        message: 'Files endpoint returned error',
        duration,
        details: {
          httpStatus: response.status
        }
      });
    }
  } catch (error: any) {
    addResult({
      test: 'Files Endpoint',
      status: 'WARN',
      message: 'Files endpoint test failed',
      duration: Date.now() - start,
      details: {
        error: error.message
      }
    });
  }
}

async function main(): Promise<void> {
  console.log('\n' + '='.repeat(60));
  console.log('🧪 HELIUM API CONNECTION TEST');
  console.log('='.repeat(60) + '\n');
  
  const startTime = Date.now();
  
  // Run tests sequentially
  await testEnvironmentConfig();
  console.log('');
  
  const hasApiKey = !!process.env.AI_API_KEY;
  if (!hasApiKey) {
    log('❌', 'Cannot proceed without API key. Please configure .env.local');
    return;
  }
  
  await testNetworkConnectivity();
  console.log('');
  
  const { threadId, projectId } = await testAPIKey();
  console.log('');
  
  if (threadId && projectId) {
    await testResponsePolling(threadId, projectId);
    console.log('');
    
    await testFilesEndpoint(threadId, projectId);
    console.log('');
  }
  
  // Summary
  console.log('='.repeat(60));
  console.log('📊 TEST SUMMARY');
  console.log('='.repeat(60));
  
  const passed = results.filter(r => r.status === 'PASS').length;
  const failed = results.filter(r => r.status === 'FAIL').length;
  const warnings = results.filter(r => r.status === 'WARN').length;
  const total = results.length;
  
  console.log(`\nTotal Tests: ${total}`);
  console.log(`✅ Passed: ${passed}`);
  console.log(`❌ Failed: ${failed}`);
  console.log(`⚠️  Warnings: ${warnings}`);
  console.log(`⏱️  Duration: ${Date.now() - startTime}ms`);
  
  const critical = results.slice(0, 3);
  const allCriticalPassed = critical.every(r => r.status === 'PASS');
  
  console.log('\n' + '='.repeat(60));
  if (allCriticalPassed && failed === 0) {
    log('✅', 'All tests passed! Helium API is ready to use.');
  } else if (failed > 0) {
    log('❌', 'Some tests failed. Please review the errors above.');
  } else {
    log('⚠️', 'Tests completed with warnings. API may work with limitations.');
  }
  console.log('='.repeat(60) + '\n');
  
  // Exit with appropriate code
  process.exit(failed > 0 ? 1 : 0);
}

// Run the tests
main().catch((error) => {
  console.error('❌ Fatal error:', error);
  process.exit(1);
});

