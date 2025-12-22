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
  type: 'user' | 'assistant' | 'system' | 'file';
  content: string;
  timestamp: Date;
  fileUrl?: string;
  fileName?: string;
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
    addMessage('system', '🤖 Initializing AI generation...');
    
    try {
      // Start generation
      const response = await axios.post(`/api/tenders/${tenderId}/generate-proposal`);
      
      if (response.data.success && response.data.proposal?.metadata) {
        const { threadId, projectId } = response.data.proposal.metadata;
        
        addMessage('system', '✅ AI task created successfully');
        addMessage('system', `📋 Thread ID: ${threadId.substring(0, 8)}...`);
        addMessage('system', '🔄 Opening real-time stream...');
        
        // Connect to real-time stream
        const eventSource = new EventSource(`/api/ai/stream/${threadId}?projectId=${projectId}`);
        
        eventSource.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            
            switch (data.type) {
              case 'progress':
              case 'running':
              case 'api_response':
                addMessage('system', data.message);
                break;
              case 'content':
                addMessage('assistant', '✅ Proposal content received!');
                addMessage('assistant', data.message);
                break;
              case 'files':
                addMessage('assistant', data.message);
                data.files.forEach((file: any) => {
                  addMessage('system', `📄 ${file.file_name} (${(file.file_size / 1024).toFixed(1)}KB)`);
                });
                break;
              case 'code':
                addMessage('assistant', data.message);
                break;
              case 'complete':
                addMessage('assistant', '🎉 Proposal generation complete!');
                addMessage('file', '🌐 View Proposal Website', `/api/tenders/${tenderId}/proposal-website`, 'website.html');
                addMessage('file', '📄 Download Proposal PDF', `/api/tenders/${tenderId}/proposal-pdf`, 'proposal.pdf');
                eventSource.close();
                setIsGenerating(false);
                queryClient.invalidateQueries({ queryKey: ['tenders'] });
                break;
              case 'error':
                addMessage('system', data.message);
                eventSource.close();
                setIsGenerating(false);
                break;
              case 'warning':
                addMessage('system', data.message);
                break;
            }
          } catch (err) {
            console.error('Stream parse error:', err);
          }
        };
        
        eventSource.onerror = () => {
          addMessage('system', '⚠️ Stream connection lost. Proposal may still be generating...');
          eventSource.close();
          setIsGenerating(false);
        };
        
        // Store thread info
        setCurrentThreadId(threadId);
        setCurrentProjectId(projectId);
      }
    } catch (error: any) {
      addMessage('system', `❌ Error: ${error.response?.data?.details || error.message}`);
      addMessage('assistant', '⚠️ Using template fallback. Files still available for download.');
      addMessage('file', '🌐 View Proposal Website', `/api/tenders/${tenderId}/proposal-website`, 'website.html');
      addMessage('file', '📄 Download Proposal PDF', `/api/tenders/${tenderId}/proposal-pdf`, 'proposal.pdf');
      setIsGenerating(false);
    }
  };

  const sendChatMessage = async () => {
    if (!chatInput.trim() || !selectedTender) return;
    
    const userMessage = chatInput.trim();
    setChatInput('');
    
    // Add user message to chat (visible)
    addMessage('user', userMessage);
    
    // If we have a thread ID, use follow-up endpoint
    if (currentThreadId && currentProjectId) {
      setIsGenerating(true);
      addMessage('system', '🤖 Processing your request...');
      
      try {
        // Send follow-up to existing thread
        const response = await axios.post('/api/ai/chat-followup', {
          threadId: currentThreadId,
          projectId: currentProjectId,
          prompt: `User request: ${userMessage}\n\nPlease update the proposal accordingly. If they ask to regenerate or create files, generate the HTML website and provide the updated proposal.`,
          tenderId: selectedTender.id
        });
        
        if (response.data.success) {
          addMessage('assistant', response.data.message || '✅ Updated successfully!');
          
          // Refresh outputs
          addMessage('file', '🌐 View Updated Website', `/api/tenders/${selectedTender.id}/proposal-website`, 'website.html');
          addMessage('file', '📄 Download Updated PDF', `/api/tenders/${selectedTender.id}/proposal-pdf`, 'proposal.pdf');
          
          // Refresh tender data
          queryClient.invalidateQueries({ queryKey: ['tenders'] });
        }
      } catch (error: any) {
        addMessage('system', `⚠️ ${error.response?.data?.details || 'Failed to process request'}`);
        addMessage('assistant', 'Sorry, I encountered an issue. Please try rephrasing your request.');
      } finally {
        setIsGenerating(false);
      }
    } else {
      // No active thread, suggest generating first
      addMessage('assistant', '💡 Please generate the initial proposal first using the "Generate with AI" button, then I can help you modify it.');
    }
  };

  const selectTender = (tender: Tender) => {
    setSelectedTenderId(tender.id);
    setChatMessages([]);
    setCurrentThreadId(null);
    setCurrentProjectId(null);
    setChatInput('');
    
    addMessage('system', `Selected: ${tender.title}`);
    addMessage('system', `Client: ${tender.createdBy === 'dcs' ? 'DCS Corporation' : 'Client'}`);
    addMessage('system', `AI Match Score: ${tender.aiAnalysis?.overallScore}%`);
    
    // Check if proposal has thread metadata
    if ((tender.proposal as any)?.metadata?.threadId) {
      setCurrentThreadId((tender.proposal as any).metadata.threadId);
      setCurrentProjectId((tender.proposal as any).metadata.projectId);
    }
    
    if (tender.proposal?.executiveSummary && tender.proposal.executiveSummary.length > 100) {
      addMessage('assistant', '✅ Proposal already generated for this tender.');
      addMessage('assistant', '💬 You can ask me to modify any section, add details, or change the approach.');
      addMessage('file', 'View Proposal Website', `/api/tenders/${tender.id}/proposal-website`, 'website');
      addMessage('file', 'Download Proposal PDF', `/api/tenders/${tender.id}/proposal-pdf`, 'pdf');
    } else {
      addMessage('assistant', '👋 Hi! I\'m ready to generate a professional proposal for this tender. Click "Generate with AI" to start, or describe what kind of proposal you need.');
    }
  };

  return (
    <ProtectedRoute allowedRoles={['admin']}>
      <div className="min-h-screen bg-[#F3F2EE] p-6">
        <div className="max-w-[1900px] mx-auto">
          {/* Header */}
          <header className="flex justify-between items-center bg-transparent py-2 mb-8">
            <div className="flex items-center gap-12">
              <div className="text-2xl font-black tracking-tighter rounded-full border border-gray-300 px-6 py-2 bg-white/50 backdrop-blur-sm shadow-sm">
                VECTOR<span className="text-indigo-600">.</span>
              </div>
              
              <nav className="hidden lg:flex items-center gap-4 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50 shadow-sm">
                <NavButton icon={<RiDashboardLine />} label="Home" onClick={() => router.push('/admin')} />
                <NavButton icon={<RiTeamLine />} label="Tenders" onClick={() => router.push('/admin')} />
                <NavButton icon={<RiRobot2Line />} label="AI Proposals" active onClick={() => {}} />
                <NavButton icon={<RiApps2Line />} label="Intelligence" onClick={() => router.push('/admin')} />
              </nav>
            </div>

            <div className="flex items-center gap-4">
               <Button variant="ghost" size="lg" className="rounded-full bg-white/50 backdrop-blur-sm border border-gray-200/50 gap-2 px-6 font-bold text-xs uppercase tracking-widest">
                  <RiSettings4Line /> Config
               </Button>
               <Button variant="ghost" size="icon" className="rounded-full bg-white/50 backdrop-blur-sm border border-gray-200/50 h-12 w-12">
                  <RiNotification3Line className="h-5 w-5" />
               </Button>
               <Button onClick={logout} variant="ghost" size="icon" className="rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 h-12 w-12 text-red-500 hover:text-white hover:bg-red-500 transition-all shadow-sm">
                  <RiLogoutBoxRLine className="h-5 w-5" />
               </Button>
            </div>
          </header>

          <h1 className="text-4xl font-bold mb-2 flex items-center gap-3">
            <RiRobot2Line className="text-indigo-600" />
            AI Proposal Generator
          </h1>
          <p className="text-gray-500 mb-8">Powered by Helium AI • References: ipc.he2.ai, ers.he2.ai</p>

          {/* 2-Column Layout */}
          <div className="grid grid-cols-12 gap-6">
            {/* Left - Tender Selection */}
            <div className="col-span-3">
              <Card className="p-4 rounded-[32px] bg-white shadow-sm">
                <h2 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">Select Tender</h2>
                <div className="space-y-3 max-h-[750px] overflow-y-auto">
                  {readyTenders.map(t => (
                    <button
                      key={t.id}
                      onClick={() => selectTender(t)}
                      className={`w-full text-left p-4 rounded-2xl transition-all ${
                        selectedTenderId === t.id 
                          ? 'bg-indigo-50 border-2 border-indigo-600' 
                          : 'bg-gray-50 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      <h3 className="font-bold text-sm mb-1 line-clamp-2">{t.title}</h3>
                      <div className="flex justify-between items-center mt-2">
                        <span className="text-xs text-gray-500">{t.createdBy === 'dcs' ? 'DCS' : 'Acme'}</span>
                        <span className="text-xs font-black text-indigo-600">{t.aiAnalysis?.overallScore}%</span>
                      </div>
                    </button>
                  ))}
                </div>
              </Card>
            </div>

            {/* Right - Chat Interface */}
            <div className="col-span-9">
              <Card className="rounded-[32px] bg-white shadow-lg h-[800px] flex flex-col">
                {selectedTender ? (
                  <>
                    {/* Chat Header */}
                    <div className="p-6 border-b border-gray-100">
                      <div className="flex justify-between items-center">
                        <div>
                          <h2 className="text-xl font-bold text-gray-900">{selectedTender.title}</h2>
                          <p className="text-sm text-gray-500">{selectedTender.createdBy === 'dcs' ? 'DCS Corporation' : 'Client'}</p>
                        </div>
                        <div className="flex gap-2">
                          <Button
                            onClick={() => generateProposal(selectedTender.id)}
                            disabled={isGenerating}
                            className="rounded-full bg-indigo-600 hover:bg-indigo-700 h-11 font-bold gap-2 px-6"
                          >
                            {isGenerating ? <RiLoaderLine className="animate-spin" /> : <RiRobot2Line />}
                            {isGenerating ? 'Generating...' : 'Generate with AI'}
                          </Button>
                        </div>
                      </div>
                    </div>

                    {/* Chat Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                      {chatMessages.map((msg) => (
                        <ChatMessageBubble key={msg.id} message={msg} tenderId={selectedTender.id} />
                      ))}
                      <div ref={chatEndRef} />
                      
                      {chatMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full text-gray-400">
                          <RiRobot2Line className="w-20 h-20 mb-4 opacity-20" />
                          <p className="text-lg font-bold mb-2">AI Proposal Assistant Ready</p>
                          <p className="text-sm">Click "Generate with AI" to create a comprehensive proposal</p>
                        </div>
                      )}
                    </div>

                    {/* Chat Input */}
                    <div className="p-4 border-t border-gray-100 bg-gray-50">
                      <div className="flex gap-3">
                        <input 
                          type="text" 
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyPress={(e) => e.key === 'Enter' && sendChatMessage()}
                          placeholder={currentThreadId ? "Ask AI to modify the proposal..." : "Generate proposal first, then ask questions..."}
                          disabled={isGenerating}
                          className="flex-1 px-4 py-3 rounded-full border border-gray-200 outline-none focus:ring-2 focus:ring-indigo-200 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed"
                        />
                        <Button 
                          onClick={sendChatMessage}
                          className="rounded-full h-12 px-6 bg-gray-900 hover:bg-gray-800" 
                          disabled={isGenerating || !chatInput.trim()}
                        >
                          {isGenerating ? <RiLoaderLine className="animate-spin" /> : <RiSendPlaneFill />}
                        </Button>
                      </div>
                      <p className="text-xs text-gray-400 mt-2 text-center">
                        {currentThreadId ? '💬 Connected to AI - You can request changes' : '⚠️ Generate proposal first to enable chat'}
                      </p>
                    </div>
                  </>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <RiFileTextLine className="w-24 h-24 mb-4 opacity-10" />
                    <p className="text-xl font-bold mb-2">Select a Tender</p>
                    <p>Choose from the left panel to start AI generation</p>
                  </div>
                )}
              </Card>
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
          <Card className="p-4 rounded-2xl bg-gray-900 text-white flex-1">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
            <p className="text-xs text-gray-400 mt-2">{message.timestamp.toLocaleTimeString()}</p>
          </Card>
          <div className="w-8 h-8 bg-gray-900 rounded-full flex items-center justify-center text-white flex-shrink-0 font-bold text-xs">
            You
          </div>
        </div>
      </div>
    );
  }
  
  if (message.type === 'file') {
    return (
      <div className="flex justify-start">
        <Card className="p-4 rounded-2xl bg-green-50 border-2 border-green-200 max-w-md">
          <div className="flex items-center gap-3">
            {message.fileName?.includes('website') || message.fileName?.includes('html') ? (
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white">
                <RiGlobalLine size={24} />
              </div>
            ) : (
              <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center text-white">
                <RiFileTextLine size={24} />
              </div>
            )}
            <div className="flex-1">
              <p className="font-bold text-sm text-green-900">{message.content}</p>
              <p className="text-xs text-green-700 mt-1">{message.fileName}</p>
            </div>
            <Button
              size="sm"
              onClick={() => window.open(message.fileUrl, '_blank')}
              className="rounded-full bg-green-600 hover:bg-green-700 text-white h-9 px-4 text-xs font-bold"
            >
              Open
            </Button>
          </div>
        </Card>
      </div>
    );
  }

  if (message.type === 'system') {
    return (
      <div className="flex justify-center">
        <div className="px-4 py-2 rounded-full bg-gray-100 border border-gray-200 text-gray-600 text-xs font-medium max-w-3xl text-center">
          {message.content}
        </div>
      </div>
    );
  }

  if (message.type === 'assistant') {
    return (
      <div className="flex justify-start">
        <div className="flex gap-3 max-w-3xl">
          <div className="w-8 h-8 bg-indigo-600 rounded-full flex items-center justify-center text-white flex-shrink-0">
            <RiRobot2Line />
          </div>
          <Card className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100 flex-1">
            <p className="text-sm text-gray-900 whitespace-pre-wrap leading-relaxed">{message.content}</p>
            <p className="text-xs text-gray-400 mt-2">{message.timestamp.toLocaleTimeString()}</p>
          </Card>
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
