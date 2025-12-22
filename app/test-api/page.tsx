'use client';

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { RiCheckLine, RiCloseLine, RiLoaderLine } from 'react-icons/ri';

export default function APITestPage() {
  const [testing, setTesting] = useState(false);
  const [result, setResult] = useState<any>(null);

  const runTest = async () => {
    setTesting(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/ai/test-connection');
      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({ error: 'Failed to connect to test endpoint' });
    } finally {
      setTesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#F3F2EE] p-8">
      <div className="max-w-4xl mx-auto">
        <Card className="p-8 rounded-[32px] bg-white shadow-lg">
          <h1 className="text-3xl font-black mb-2">🧪 API Connection Test</h1>
          <p className="text-gray-500 mb-8">Test Helium AI API configuration</p>

          <Button 
            onClick={runTest}
            disabled={testing}
            className="w-full rounded-full bg-indigo-600 hover:bg-indigo-700 h-14 text-lg font-bold mb-8"
          >
            {testing ? (
              <>
                <RiLoaderLine className="animate-spin mr-2" /> Testing...
              </>
            ) : (
              'Run API Test'
            )}
          </Button>

          {result && (
            <div className="space-y-4">
              <div className={`p-6 rounded-2xl ${result.readyForProduction ? 'bg-green-50 border-2 border-green-200' : 'bg-red-50 border-2 border-red-200'}`}>
                <div className="flex items-center gap-3 mb-4">
                  {result.readyForProduction ? (
                    <RiCheckLine className="w-8 h-8 text-green-600" />
                  ) : (
                    <RiCloseLine className="w-8 h-8 text-red-600" />
                  )}
                  <div>
                    <h2 className="text-xl font-bold">{result.overall}</h2>
                    <p className="text-sm text-gray-600">{result.message}</p>
                  </div>
                </div>
              </div>

              <Card className="p-6 bg-gray-50">
                <h3 className="font-bold mb-4">Configuration</h3>
                <div className="space-y-2 text-sm font-mono">
                  <div className="flex justify-between">
                    <span className="text-gray-600">API Key:</span>
                    <span className={result.apiKeyConfigured ? 'text-green-600' : 'text-red-600'}>
                      {result.apiKeyPreview}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Endpoint:</span>
                    <span className="text-gray-900">{result.apiEndpoint}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-600">Time:</span>
                    <span className="text-gray-900">{result.timestamp}</span>
                  </div>
                </div>
              </Card>

              {result.tests && result.tests.length > 0 && (
                <Card className="p-6 bg-gray-50">
                  <h3 className="font-bold mb-4">Test Results</h3>
                  <div className="space-y-3">
                    {result.tests.map((test: any, i: number) => (
                      <div key={i} className="p-4 bg-white rounded-xl">
                        <div className="flex justify-between items-center mb-2">
                          <span className="font-bold text-sm">{test.test}</span>
                          <span className="text-sm">{test.status}</span>
                        </div>
                        {test.details && (
                          <pre className="text-xs text-gray-600 mt-2 overflow-x-auto">
                            {JSON.stringify(test.details, null, 2)}
                          </pre>
                        )}
                        {test.error && (
                          <p className="text-xs text-red-600 mt-2">{test.error}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </Card>
              )}

              <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6">
                <h3 className="font-bold text-amber-900 mb-2">📝 Next Steps</h3>
                {result.readyForProduction ? (
                  <div className="text-sm text-amber-800 space-y-1">
                    <p>✅ API is working perfectly!</p>
                    <p>✅ You can now generate proposals</p>
                    <p>✅ Go to Admin → Proposals to start</p>
                  </div>
                ) : (
                  <div className="text-sm text-amber-800 space-y-2">
                    <p>❌ API connection failed</p>
                    <p><strong>Fix:</strong></p>
                    <ol className="list-decimal ml-4 space-y-1">
                      <li>Create <code className="bg-white px-2 py-0.5 rounded">.env.local</code> in project root</li>
                      <li>Add: <code className="bg-white px-2 py-0.5 rounded">AI_API_KEY=he-sQkuIjqHHoiUDZEju891ZTlQcfnzIoxc6pgC</code></li>
                      <li>Restart dev server</li>
                      <li>Test again</li>
                    </ol>
                  </div>
                )}
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  );
}

