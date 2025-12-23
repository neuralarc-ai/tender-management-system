'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Tender } from '@/types';
import { useState, useEffect, useRef } from 'react';
import { 
  RiRobot2Line, RiSendPlaneFill, RiFileTextLine, RiGlobalLine, RiDownloadLine,
  RiCheckLine, RiErrorWarningLine, RiLoaderLine, RiArrowLeftLine,
  RiSettings4Line, RiNotification3Line, RiLogoutBoxRLine,
  RiDashboardLine, RiTeamLine, RiApps2Line
} from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/auth-context';

interface ChatMessage {
  id: string;
  type: 'user' | 'assistant' | 'system' | 'file' | 'tool' | 'streaming';
  content: string;
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
  toolName?: string;
  toolInput?: any;
  toolResult?: any;
  isStreaming?: boolean;
  status?: 'running' | 'completed' | 'failed';
}

export default function AIProposalGeneratorPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const queryClient = useQueryClient();
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [currentThreadId, setCurrentThreadId] = useState<string | null>(null);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const chatEndRef = useRef<HTMLDivElement>(null);

  const { data: tenders = [] } = useQuery({
    queryKey: ['tenders'],
    queryFn: async () => {
      const response = await axios.get('/api/tenders');
      return response.data as Tender[];
    },
    refetchInterval: 5000,
  });

  const readyTenders = tenders.filter(t => t.aiAnalysis?.status === 'completed' && t.status === 'open');
  const selectedTender = readyTenders.find(t => t.id === selectedTenderId);

  // Auto-scroll chat
  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const addMessage = (type: ChatMessage['type'], content: string, fileUrl?: string, fileName?: string) => {
    setChatMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      type,
      content,
      timestamp: new Date(),
      fileUrl,
      fileName
    }]);
  };

  const generateProposal = async (tenderId: string) => {
    setIsGenerating(true);
    addMessage('user', '🚀 Generate comprehensive proposal with AI');
    
    try {
      const response = await axios.post(`/api/tenders/${tenderId}/generate-proposal`);
      
      if (response.data.success && response.data.proposal?.metadata) {
        const { threadId, projectId } = response.data.proposal.metadata;
        
        // Track streaming message
        let streamingMessageId: string | null = null;
        let accumulatedContent = '';
        
        const eventSource = new EventSource(`/api/ai/stream/${threadId}?projectId=${projectId}`);
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
              case 'status':
                // Show AI status
                if (data.status === 'running') {
                  if (!streamingMessageId) {
                    addMessage('system', `🤖 AI is thinking... (${data.elapsed || 0}s)`);
                  }
                } else if (data.status === 'completed') {
                  addMessage('system', `✅ Generation completed in ${data.elapsed || 0}s`);
                  
                  // Check for files
                  setTimeout(async () => {
                    try {
                      const filesResponse = await axios.get(`/api/tenders/${tenderId}`);
                      if (filesResponse.data.proposal?.executiveSummary) {
                        addMessage('file', '🌐 View Proposal Website', `/api/tenders/${tenderId}/proposal-website`, 'website.html');
                        addMessage('file', '📄 Download Proposal PDF', `/api/tenders/${tenderId}/proposal-pdf`, 'proposal.pdf');
                      }
                    } catch (err) {
                      console.error('Failed to check files:', err);
                    }
                  }, 1000);
                  
                  eventSource.close();
                  setIsGenerating(false);
                  queryClient.invalidateQueries({ queryKey: ['tenders'] });
                }
                break;
                
              case 'content':
                // Real-time content streaming
                accumulatedContent += data.content || '';
                
                if (streamingMessageId) {
                  // Update existing streaming message
                  setChatMessages(prev => prev.map(msg => 
                    msg.id === streamingMessageId
                      ? { ...msg, content: accumulatedContent, isStreaming: true }
                      : msg
                  ));
                } else {
                  // Create new streaming message
                  const newMsg: ChatMessage = {
                    id: 'streaming-' + Date.now(),
                    type: 'streaming',
                    content: accumulatedContent,
                    timestamp: new Date(),
                    isStreaming: true
                  };
                  streamingMessageId = newMsg.id;
                  setChatMessages(prev => [...prev, newMsg]);
                }
                break;
                
              case 'tool':
                // AI is using a tool
                addMessage('tool', data.tool_name || 'Using tool', undefined, undefined);
                break;
                
              case 'tool_result':
                // Tool execution result
                if (data.success) {
                  addMessage('system', `✅ ${data.tool_name} completed`);
                }
                break;
                
              case 'error':
                addMessage('system', `❌ ${data.message || 'Error occurred'}`);
                eventSource.close();
                setIsGenerating(false);
                break;
            }
          } catch (err) {
            console.error('Stream parse error:', err);
          }
        };
        
        eventSource.onerror = () => {
          addMessage('system', '⚠️ Connection lost');
          eventSource.close();
          setIsGenerating(false);
        };
        
        setCurrentThreadId(threadId);
        setCurrentProjectId(projectId);
      }
    } catch (error: any) {
      addMessage('system', `❌ ${error.response?.data?.details || error.message}`);
      setIsGenerating(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !selectedTender) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Add user message to chat
    addMessage('user', userMessage);
    
    // If we have a thread ID, use follow-up endpoint with streaming
    if (currentThreadId && currentProjectId) {
      setIsGenerating(true);
      
      try {
        // Send follow-up to existing thread (request streaming mode)
        const response = await axios.post('/api/ai/chat-followup', {
          threadId: currentThreadId,
          projectId: currentProjectId,
          prompt: userMessage, // Send raw user message, let AI interpret it
          tenderId: selectedTender.id,
          stream: true // Request streaming mode
        });
        
        if (response.data.success && response.data.streamUrl) {
          // Connect to SSE stream for real-time updates
          let streamingContent = '';
          let streamingMessageId: string | null = null;
          
          const eventSource = new EventSource(`${response.data.streamUrl}`);
          
          eventSource.onmessage = (event) => {
            try {
              const data = JSON.parse(event.data);
              
              switch (data.type) {
                case 'connected':
                case 'status':
                case 'status_update':
                case 'progress':
                  // System messages from stream
                  if (data.message) {
                    addMessage('system', data.message);
                  }
                  break;
                  
                case 'content_chunk':
                  // Real-time streaming content chunk
                  streamingContent += data.content || '';
                  
                  // Update or create streaming message
                  if (streamingMessageId) {
                    setChatMessages(prev => prev.map(msg => 
                      msg.id === streamingMessageId
                        ? { ...msg, content: `✍️ **AI is writing...**\n\n${streamingContent}` }
                        : msg
                    ));
                  } else {
                    const newMsg = {
                      id: 'streaming-' + Date.now(),
                      type: 'assistant' as const,
                      content: `✍️ **AI is writing...**\n\n${streamingContent}`,
                      timestamp: new Date()
                    };
                    streamingMessageId = newMsg.id;
                    setChatMessages(prev => [...prev, newMsg]);
                  }
                  break;
                  
                case 'files':
                  // Files information from stream
                  if (data.files && Array.isArray(data.files)) {
                    data.files.forEach((file: any) => {
                      const isWebsite = file.file_name?.includes('.html') || file.file_type === 'text/html';
                      const isPdf = file.file_name?.includes('.pdf');
                      
                      if (isWebsite) {
                        addMessage('file', '🌐 View Updated Website', `/api/tenders/${selectedTender.id}/proposal-website`, file.file_name);
                      } else if (isPdf) {
                        addMessage('file', '📄 Download Updated PDF', `/api/tenders/${selectedTender.id}/proposal-pdf`, file.file_name);
                      }
                    });
                  }
                  break;
                  
                case 'complete':
                  // Finalize streaming message
                  if (streamingMessageId && streamingContent) {
                    setChatMessages(prev => prev.map(msg => 
                      msg.id === streamingMessageId
                        ? { ...msg, content: streamingContent }
                        : msg
                    ));
                  } else if (data.content) {
                    addMessage('assistant', data.content);
                  }
                  
                  // Add files if available
                  if (data.files || selectedTender.proposal?.executiveSummary) {
                    addMessage('file', '🌐 View Updated Website', `/api/tenders/${selectedTender.id}/proposal-website`, 'website.html');
                    addMessage('file', '📄 Download Updated PDF', `/api/tenders/${selectedTender.id}/proposal-pdf`, 'proposal.pdf');
                  }
                  
                  queryClient.invalidateQueries({ queryKey: ['tenders'] });
                  eventSource.close();
                  setIsGenerating(false);
                  break;
                  
                case 'error':
                  addMessage('system', data.message || '❌ Error occurred');
                  eventSource.close();
                  setIsGenerating(false);
                  break;
                  
                case 'warning':
                case 'parse_error':
                  if (data.message) {
                    addMessage('system', data.message);
                  }
                  break;
              }
            } catch (err) {
              console.error('Stream parse error:', err);
            }
          };
          
          eventSource.onerror = (error) => {
            console.error('EventSource error:', error);
            addMessage('system', '⚠️ Stream connection lost');
            eventSource.close();
            setIsGenerating(false);
          };
        } else if (response.data.success) {
          // Non-streaming response (fallback)
          addMessage('assistant', response.data.message || 'Update completed');
          queryClient.invalidateQueries({ queryKey: ['tenders'] });
          setIsGenerating(false);
        }
      } catch (error: any) {
        addMessage('system', `⚠️ ${error.response?.data?.details || error.message}`);
        setIsGenerating(false);
      }
    } else {
      // No active thread
      addMessage('assistant', '💡 Please generate the initial proposal first using the "Generate with AI" button.');
    }
  };

  const selectTender = (tender: Tender) => {
    setSelectedTenderId(tender.id);
    setChatMessages([]);
    setCurrentThreadId(null);
    setCurrentProjectId(null);
    setChatInput('');
    
    // Check if proposal has thread metadata
    if ((tender.proposal as any)?.metadata?.threadId) {
      setCurrentThreadId((tender.proposal as any).metadata.threadId);
      setCurrentProjectId((tender.proposal as any).metadata.projectId);
    }
    
    // Add initial context message
    addMessage('system', `Selected: ${tender.title}`);
    addMessage('system', `Client: ${tender.createdBy === 'dcs' ? 'DCS Corporation' : 'Client'} • Match Score: ${tender.aiAnalysis?.overallScore}%`);
    
    // If proposal exists, show files
    if (tender.proposal?.executiveSummary && tender.proposal.executiveSummary.length > 100) {
      addMessage('system', '✅ Proposal already generated');
      addMessage('file', '🌐 View Proposal Website', `/api/tenders/${tender.id}/proposal-website`, 'website.html');
      addMessage('file', '📄 Download Proposal PDF', `/api/tenders/${tender.id}/proposal-pdf`, 'proposal.pdf');
      
      // Show AI hint if thread is available
      if ((tender.proposal as any)?.metadata?.threadId) {
        addMessage('assistant', '💬 You can ask me to modify any section or regenerate the proposal.');
      }
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-gradient-to-br from-[#F8F7F4] via-[#FFF9F0] to-[#FFFAF2] p-4 md:p-6">
        <div className="max-w-[1800px] mx-auto">
          {/* Keep existing header - don't change navbar */}
          <header className="flex justify-between items-center bg-transparent py-2 mb-6">
            <div className="flex items-center gap-8">
              <div className="text-2xl font-black tracking-tighter rounded-full border border-gray-300 px-6 py-2 bg-white/80 backdrop-blur-md shadow-sm">
                VECTOR<span className="text-indigo-600">.</span>
              </div>
              
              <nav className="hidden lg:flex items-center gap-3 bg-white/80 backdrop-blur-md px-3 py-2 rounded-full border border-gray-200/70 shadow-sm">
                <NavButton icon={<RiDashboardLine />} label="Home" onClick={() => router.push('/admin')} />
                <NavButton icon={<RiTeamLine />} label="Tenders" onClick={() => router.push('/admin')} />
                <NavButton icon={<RiRobot2Line />} label="AI Proposals" active onClick={() => {}} />
                <NavButton icon={<RiApps2Line />} label="Intelligence" onClick={() => router.push('/admin')} />
              </nav>
            </div>

            <div className="flex items-center gap-3">
               <Button variant="ghost" size="lg" className="rounded-full bg-white/80 backdrop-blur-md border border-gray-200/70 gap-2 px-6 font-bold text-xs uppercase tracking-widest shadow-sm hover:shadow-md transition-all">
                  <RiSettings4Line /> Config
               </Button>
               <Button variant="ghost" size="icon" className="rounded-full bg-white/80 backdrop-blur-md border border-gray-200/70 h-12 w-12 shadow-sm hover:shadow-md transition-all">
                  <RiNotification3Line className="h-5 w-5" />
               </Button>
               <Button onClick={logout} variant="ghost" size="icon" className="rounded-full bg-white/90 backdrop-blur-md border border-gray-200 h-12 w-12 text-red-500 hover:text-white hover:bg-red-500 transition-all shadow-sm hover:shadow-md">
                  <RiLogoutBoxRLine className="h-5 w-5" />
               </Button>
            </div>
          </header>

          {/* Main Content - Modern 3-Column Layout */}
          <div className="grid grid-cols-12 gap-4 h-[calc(100vh-120px)]">
            {/* Left Column - Tender List */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
              {/* Header Card */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 border border-gray-200/50 shadow-lg">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center text-white shadow-lg">
                    <RiRobot2Line size={20} />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-lg font-black text-gray-900">AI Generator</h1>
                    <p className="text-[10px] font-medium text-gray-500 uppercase tracking-wider">Powered by Helium</p>
                  </div>
                </div>
              </div>

              {/* Tender Selection Card */}
              <div className="flex-1 bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-lg overflow-hidden flex flex-col">
                <div className="p-4 border-b border-gray-100/80">
                  <h2 className="font-bold text-xs uppercase tracking-widest text-gray-400">Available Tenders</h2>
                  <p className="text-[10px] text-gray-400 mt-1">{readyTenders.length} ready for generation</p>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2.5">
                  {readyTenders.map(t => (
                    <button
                      key={t.id}
                      onClick={() => selectTender(t)}
                      className={`w-full text-left p-4 rounded-2xl transition-all duration-200 group ${
                        selectedTenderId === t.id 
                          ? 'bg-gradient-to-br from-indigo-50 to-purple-50 border-2 border-indigo-400 shadow-md scale-[1.02]' 
                          : 'bg-gray-50/80 border border-gray-200/60 hover:border-indigo-300 hover:bg-indigo-50/30 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                          selectedTenderId === t.id 
                            ? 'bg-indigo-500 text-white shadow-md' 
                            : 'bg-gray-200/60 text-gray-600 group-hover:bg-indigo-100'
                        }`}>
                          {t.aiAnalysis?.overallScore}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm mb-1 line-clamp-2 leading-tight text-gray-900">{t.title}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-gray-500 font-medium bg-gray-100/80 px-2 py-0.5 rounded-full">
                              {t.createdBy === 'dcs' ? 'DCS Corp' : 'Client'}
                            </span>
                            {t.proposal?.executiveSummary && (
                              <span className="text-[9px] text-green-600 font-bold flex items-center gap-1 bg-green-50 px-2 py-0.5 rounded-full">
                                <RiCheckLine size={10} /> Generated
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Main Column - Chat Interface */}
            <div className="col-span-12 lg:col-span-6">
              <div className="h-full bg-white/90 backdrop-blur-xl rounded-3xl border border-gray-200/50 shadow-2xl flex flex-col overflow-hidden">
                {selectedTender ? (
                  <>
                    {/* Modern Chat Header */}
                    <div className="px-6 py-4 border-b border-gray-100/80 bg-gradient-to-r from-white to-gray-50/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-800 to-gray-900 flex items-center justify-center text-white font-black text-sm shadow-lg">
                            {selectedTender.title.substring(0, 2).toUpperCase()}
                          </div>
                          <div>
                            <h2 className="text-base font-black text-gray-900 leading-tight">{selectedTender.title}</h2>
                            <p className="text-xs text-gray-500 font-medium flex items-center gap-2 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-green-500"></span>
                              {selectedTender.createdBy === 'dcs' ? 'DCS Corporation' : 'Client'} • Match {selectedTender.aiAnalysis?.overallScore}%
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => generateProposal(selectedTender.id)}
                          disabled={isGenerating}
                          className="rounded-2xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 h-11 font-bold gap-2 px-6 shadow-lg hover:shadow-xl transition-all"
                        >
                          {isGenerating ? (
                            <>
                              <RiLoaderLine className="animate-spin" size={18} />
                              <span>Generating...</span>
                            </>
                          ) : (
                            <>
                              <RiRobot2Line size={18} />
                              <span>Generate with AI</span>
                            </>
                          )}
                        </Button>
                      </div>
                    </div>

                    {/* Chat Messages Area */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gradient-to-b from-transparent to-gray-50/30">
                      {chatMessages.map((msg) => (
                        <ChatMessageBubble key={msg.id} message={msg} tenderId={selectedTender.id} />
                      ))}
                      <div ref={chatEndRef} />
                      
                      {chatMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-indigo-100 to-purple-100 flex items-center justify-center mb-5 shadow-xl">
                            <RiRobot2Line className="w-12 h-12 text-indigo-600" />
                          </div>
                          <p className="text-xl font-black text-gray-900 mb-2">AI Proposal Assistant</p>
                          <p className="text-sm text-gray-500 text-center max-w-md">
                            Click "Generate with AI" to create a comprehensive proposal with real-time streaming
                          </p>
                        </div>
                      )}
                    </div>

                    {/* Modern Chat Input */}
                    <div className="p-4 border-t border-gray-100/80 bg-white/60 backdrop-blur-sm">
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                          placeholder={currentThreadId ? "Ask AI to modify the proposal..." : "Generate proposal first to enable chat..."}
                          disabled={isGenerating}
                          className="flex-1 px-5 py-3.5 rounded-2xl border-2 border-gray-200/80 outline-none focus:border-indigo-400 focus:ring-4 focus:ring-indigo-100 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-all font-medium text-sm placeholder:text-gray-400"
                        />
                        <Button 
                          onClick={sendChatMessage}
                          className="rounded-2xl h-12 w-12 bg-gradient-to-br from-gray-900 to-gray-800 hover:from-gray-800 hover:to-gray-700 shadow-lg hover:shadow-xl transition-all disabled:opacity-50" 
                          disabled={isGenerating || !chatInput.trim()}
                        >
                          {isGenerating ? <RiLoaderLine className="animate-spin" size={20} /> : <RiSendPlaneFill size={20} />}
                        </Button>
                      </div>
                      <div className="flex items-center justify-center mt-2.5">
                        {currentThreadId ? (
                          <span className="text-[10px] text-green-600 font-bold flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                            Connected to AI - Live streaming enabled
                          </span>
                        ) : (
                          <span className="text-[10px] text-amber-600 font-medium flex items-center gap-1.5 bg-amber-50 px-3 py-1 rounded-full">
                            <RiErrorWarningLine size={12} />
                            Generate proposal first to enable chat
                          </span>
                        )}
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-gray-100 to-gray-200 flex items-center justify-center mb-6 shadow-2xl">
                      <RiFileTextLine className="w-16 h-16 text-gray-400" />
                    </div>
                    <p className="text-2xl font-black text-gray-900 mb-2">Select a Tender</p>
                    <p className="text-gray-500">Choose from the left panel to start AI generation</p>
                  </div>
                )}
              </div>
            </div>

            {/* Right Column - Statistics & Info */}
            <div className="col-span-12 lg:col-span-3 flex flex-col gap-4">
              {/* Status Card */}
              <div className="bg-white/90 backdrop-blur-xl rounded-3xl p-5 border border-gray-200/50 shadow-lg">
                <h3 className="text-xs font-bold uppercase tracking-widest text-gray-400 mb-4">Generation Status</h3>
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">AI Model</span>
                    <span className="text-xs font-black text-indigo-600 bg-indigo-50 px-3 py-1 rounded-full">Helium AI</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Status</span>
                    {isGenerating ? (
                      <span className="text-xs font-bold text-green-600 flex items-center gap-1.5 bg-green-50 px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></span>
                        Generating
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Idle</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Mode</span>
                    <span className="text-xs font-bold text-purple-600 bg-purple-50 px-3 py-1 rounded-full">Streaming</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {selectedTender && (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 backdrop-blur-xl rounded-3xl p-5 border border-yellow-200/50 shadow-lg">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-amber-700 mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      onClick={() => window.open(`/api/tenders/${selectedTender.id}/proposal-website`, '_blank')}
                      variant="outline"
                      className="w-full rounded-xl bg-white/80 border-2 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 font-bold text-sm py-5 gap-2 transition-all"
                      disabled={!selectedTender.proposal?.executiveSummary}
                    >
                      <RiGlobalLine size={18} />
                      View Website
                    </Button>
                    <Button
                      onClick={() => window.open(`/api/tenders/${selectedTender.id}/proposal-pdf`, '_blank')}
                      variant="outline"
                      className="w-full rounded-xl bg-white/80 border-2 border-yellow-200 hover:bg-yellow-50 hover:border-yellow-300 font-bold text-sm py-5 gap-2 transition-all"
                      disabled={!selectedTender.proposal?.executiveSummary}
                    >
                      <RiDownloadLine size={18} />
                      Download PDF
                    </Button>
                  </div>
                </div>
              )}

              {/* Info Card */}
              <div className="flex-1 bg-gradient-to-br from-indigo-50 to-purple-50 backdrop-blur-xl rounded-3xl p-5 border border-indigo-200/50 shadow-lg">
                <h3 className="text-xs font-bold uppercase tracking-widest text-indigo-700 mb-3">About</h3>
                <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
                  <p className="font-medium">
                    <span className="font-black text-indigo-600">Real-time AI streaming</span> powered by Helium API
                  </p>
                  <p>Watch proposals generate live with instant feedback</p>
                  <div className="pt-2 mt-2 border-t border-indigo-100">
                    <p className="text-[10px] text-gray-500">
                      References: <span className="font-mono text-indigo-600">ipc.he2.ai</span>, <span className="font-mono text-indigo-600">ers.he2.ai</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ProtectedRoute>
  );
}

function ChatMessageBubble({ message, tenderId }: { message: ChatMessage, tenderId: string }) {
  if (message.type === 'user') {
    return (
      <div className="flex justify-end">
        <div className="flex gap-3 max-w-2xl">
          <div className="bg-gradient-to-br from-gray-900 to-gray-800 text-white rounded-3xl rounded-tr-md px-5 py-4 shadow-lg">
            <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
            <p className="text-[10px] text-gray-400 mt-2 font-medium">{message.timestamp.toLocaleTimeString()}</p>
          </div>
          <div className="w-10 h-10 bg-gradient-to-br from-gray-900 to-gray-800 rounded-2xl flex items-center justify-center text-white flex-shrink-0 font-black text-xs shadow-lg">
            U
          </div>
        </div>
      </div>
    );
  }
  
  if (message.type === 'file') {
    return (
      <div className="flex justify-start">
        <div className="max-w-md bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200/60 rounded-3xl p-4 shadow-lg hover:shadow-xl transition-all">
          <div className="flex items-center gap-4">
            {message.fileName?.includes('website') || message.fileName?.includes('html') ? (
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-md">
                <RiGlobalLine size={28} />
              </div>
            ) : (
              <div className="w-14 h-14 bg-gradient-to-br from-green-500 to-emerald-600 rounded-2xl flex items-center justify-center text-white shadow-md">
                <RiFileTextLine size={28} />
              </div>
            )}
            <div className="flex-1">
              <p className="font-black text-sm text-green-900 mb-1">{message.content}</p>
              <p className="text-xs text-green-700 font-medium bg-green-100/70 px-2 py-0.5 rounded-full inline-block">{message.fileName}</p>
            </div>
            <Button
              size="sm"
              onClick={() => window.open(message.fileUrl, '_blank')}
              className="rounded-xl bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white h-10 px-5 text-xs font-black shadow-md hover:shadow-lg transition-all"
            >
              Open
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (message.type === 'system') {
    return (
      <div className="flex justify-center">
        <div className="px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-md border border-gray-200/60 text-gray-600 text-xs font-bold max-w-3xl text-center shadow-sm">
          {message.content}
        </div>
      </div>
    );
  }
  
  if (message.type === 'tool') {
    return (
      <div className="flex justify-center">
        <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-purple-50 to-indigo-50 border-2 border-purple-200/60 text-purple-800 text-xs font-bold max-w-2xl flex items-center gap-2 shadow-md">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
          <span>🔧 {message.content}</span>
        </div>
      </div>
    );
  }

  if (message.type === 'streaming' || message.type === 'assistant') {
    const isStreaming = message.isStreaming === true;
    
    return (
      <div className="flex justify-start">
        <div className="flex gap-3 max-w-3xl">
          <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
            <RiRobot2Line size={18} />
          </div>
          <div className={`rounded-3xl rounded-tl-md px-5 py-4 shadow-lg transition-all ${
            isStreaming 
              ? 'bg-gradient-to-br from-indigo-50 via-purple-50 to-pink-50 border-2 border-indigo-300' 
              : 'bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-100'
          }`}>
            {isStreaming && (
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-indigo-200/50">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-indigo-500 animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-purple-500 animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-pink-500 animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-xs font-black text-indigo-600 uppercase tracking-wider animate-pulse">Streaming...</span>
              </div>
            )}
            <div className="prose prose-sm max-w-none">
              <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed font-medium">
                {message.content}
                {isStreaming && <span className="inline-block w-2 h-4 bg-indigo-600 ml-1 animate-pulse"></span>}
              </p>
            </div>
            {!isStreaming && (
              <p className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-indigo-100/50 font-medium">
                {message.timestamp.toLocaleTimeString()}
              </p>
            )}
          </div>
        </div>
      </div>
    );
  }

  return null;
}

function NavButton({ icon, label, active, onClick }: { icon: React.ReactNode, label: string, active?: boolean, onClick: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-6 py-2 rounded-full ${
        active ? 'text-white bg-gray-900 shadow-lg scale-105' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-100'
      }`}
    >
      {icon} {label}
    </button>
  );
}
