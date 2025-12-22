'use client';

import { useState, useEffect, useRef } from 'react';
import { Card } from '@/components/ui/card';
import { RiRobot2Line, RiCheckLine, RiErrorWarningLine, RiLoaderLine } from 'react-icons/ri';

interface AILog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'error' | 'progress';
  message: string;
}

export function AIGenerationLogger({ tenderId, isGenerating }: { tenderId: string, isGenerating: boolean }) {
  const [logs, setLogs] = useState<AILog[]>([]);
  const [isPolling, setIsPolling] = useState(false);
  const logsEndRef = useRef<HTMLDivElement>(null);

  // Poll for generation status
  useEffect(() => {
    if (!isGenerating && !isPolling) return;

    const pollInterval = setInterval(async () => {
      try {
        const response = await fetch(`/api/tenders/${tenderId}/generation-status`);
        if (response.ok) {
          const data = await response.json();
          if (data.logs && data.logs.length > 0) {
            setLogs(data.logs);
          }
          if (data.status === 'completed' || data.status === 'failed') {
            setIsPolling(false);
          }
        }
      } catch (error) {
        console.error('Failed to poll status:', error);
      }
    }, 2000); // Poll every 2 seconds

    return () => clearInterval(pollInterval);
  }, [tenderId, isGenerating, isPolling]);

  // Auto-scroll to bottom
  useEffect(() => {
    logsEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Start polling when generation begins
  useEffect(() => {
    if (isGenerating) {
      setIsPolling(true);
      setLogs([{
        id: Date.now().toString(),
        timestamp: new Date().toISOString(),
        type: 'info',
        message: '🤖 Starting AI proposal generation...'
      }]);
    }
  }, [isGenerating]);

  if (logs.length === 0) return null;

  return (
    <Card className="p-4 rounded-2xl bg-gray-900 text-white border-none shadow-lg mb-4">
      <div className="flex items-center gap-2 mb-3">
        <RiRobot2Line className="w-5 h-5 text-indigo-400" />
        <h3 className="font-bold text-sm uppercase tracking-wider">AI Generation Log</h3>
        {isPolling && (
          <div className="ml-auto">
            <div className="w-4 h-4 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
      </div>
      
      <div className="space-y-2 max-h-[300px] overflow-y-auto pr-2 custom-scrollbar">
        {logs.map((log) => (
          <LogEntry key={log.id} log={log} />
        ))}
        <div ref={logsEndRef} />
      </div>
    </Card>
  );
}

function LogEntry({ log }: { log: AILog }) {
  const icons = {
    info: <RiLoaderLine className="w-4 h-4 text-blue-400 animate-spin" />,
    success: <RiCheckLine className="w-4 h-4 text-green-400" />,
    error: <RiErrorWarningLine className="w-4 h-4 text-red-400" />,
    progress: <RiLoaderLine className="w-4 h-4 text-indigo-400" />
  };

  const colors = {
    info: 'text-blue-300',
    success: 'text-green-300',
    error: 'text-red-300',
    progress: 'text-indigo-300'
  };

  return (
    <div className="flex items-start gap-3 text-xs bg-white/5 rounded-lg p-2">
      <div className="flex-shrink-0 mt-0.5">
        {icons[log.type]}
      </div>
      <div className="flex-1 min-w-0">
        <div className={`font-mono ${colors[log.type]} leading-relaxed`}>
          {log.message}
        </div>
        <div className="text-gray-500 text-[10px] mt-1">
          {new Date(log.timestamp).toLocaleTimeString()}
        </div>
      </div>
    </div>
  );
}

