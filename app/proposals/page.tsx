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
  fileId?: string;
  fileType?: string;
  fileSize?: number;
  toolName?: string;
  toolInput?: any;
  toolResult?: any;
  isStreaming?: boolean;
  status?: 'running' | 'completed' | 'failed';
}

interface GeneratedFile {
  file_id: string;
  file_name: string;
  file_type: string;
  file_size: number;
  file_path?: string;
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
  const [fileViewerOpen, setFileViewerOpen] = useState(false);
  const [selectedFile, setSelectedFile] = useState<GeneratedFile | null>(null);
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [loadingFile, setLoadingFile] = useState(false);
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

  const addMessage = (type: ChatMessage['type'], content: string, fileId?: string, fileName?: string, fileType?: string, fileSize?: number) => {
    setChatMessages(prev => [...prev, {
      id: Date.now().toString() + Math.random(),
      type,
      content,
      timestamp: new Date(),
      fileId,
      fileName,
      fileType,
      fileSize
    }]);
  };

  // Function to fetch and view a generated file
  const viewGeneratedFile = async (fileId: string, fileName: string, fileType: string) => {
    if (!currentThreadId || !currentProjectId) {
      console.error('Missing thread or project ID');
      return;
    }

    setLoadingFile(true);
    setFileViewerOpen(true);
    setSelectedFile({ file_id: fileId, file_name: fileName, file_type: fileType, file_size: 0 });

    try {
      console.log('📁 Fetching file:', { fileId, fileName, fileType });
      
      // Call Get Specific File API endpoint
      const response = await axios.get(
        `/api/ai/get-file?file_id=${encodeURIComponent(fileId)}&project_id=${currentProjectId}&thread_id=${currentThreadId}`
      );

      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to fetch file');
      }

      const fileData = response.data.file;
      
      console.log('✅ File data received:', {
        fileName: fileData.file_name,
        fileType: fileData.file_type,
        hasContent: !!fileData.content,
        includedInline: fileData.included_inline
      });

      // Handle different file types
      if (fileType.startsWith('image/')) {
        // For images, decode base64 if needed or use content directly
        if (fileData.content) {
          const blobUrl = `data:${fileType};base64,${fileData.content}`;
          setFileContent(blobUrl);
        } else {
          throw new Error('Image content not available');
        }
      } else if (fileType === 'application/pdf') {
        // For PDFs, create blob URL
        if (fileData.content) {
          const binaryString = atob(fileData.content);
          const bytes = new Uint8Array(binaryString.length);
          for (let i = 0; i < binaryString.length; i++) {
            bytes[i] = binaryString.charCodeAt(i);
          }
          const blob = new Blob([bytes], { type: 'application/pdf' });
          const blobUrl = URL.createObjectURL(blob);
          setFileContent(blobUrl);
        } else {
          throw new Error('PDF content not available');
        }
      } else if (fileType.startsWith('text/') || fileType === 'application/json') {
        // For text files, display content directly
        const content = fileData.content || 'No content available';
        setFileContent(content);
      } else {
        // For other types, show as text
        setFileContent(fileData.content || 'File content not available for inline viewing. Please download.');
      }
      
    } catch (error: any) {
      console.error('❌ Error loading file:', error);
      const errorMessage = error.response?.data?.error || error.message;
      setFileContent(`Error loading file: ${errorMessage}`);
    } finally {
      setLoadingFile(false);
    }
  };

  const generateProposal = async (tenderId: string) => {
    setIsGenerating(true);
    addMessage('user', '🚀 Generate comprehensive proposal with AI');
    addMessage('system', '⏳ Initiating AI generation...');
    
    try {
      // Step 1: Call Quick Action API to start generation
      console.log('📤 Calling Quick Action API...');
      const response = await axios.post(`/api/tenders/${tenderId}/generate-proposal`);
      
      if (!response.data.success) {
        throw new Error(response.data.error || 'Failed to start AI generation');
      }

      const { project_id, thread_id, agent_run_id } = response.data;
      
      console.log('✅ AI generation started:', { project_id, thread_id, agent_run_id });
      
      addMessage('system', `✅ AI task created successfully`);
      addMessage('system', `⏳ AI is processing... We'll check back in 3 minutes...`);
      
      // Store thread info for follow-ups
      setCurrentThreadId(thread_id);
      setCurrentProjectId(project_id);
      
      // Step 2: Wait 180 seconds (3 minutes) before checking for response
      console.log('⏰ Waiting 180 seconds before checking response...');
      await new Promise(resolve => setTimeout(resolve, 180000)); // 180 seconds = 3 minutes
      
      console.log('✅ 3 minutes passed, now checking for AI response...');
      addMessage('system', `🔍 Checking for AI response...`);
      
      // Step 3: Now check for the response
      const getResponseUrl = `/api/ai/get-response?thread_id=${thread_id}&project_id=${project_id}`;
      console.log('📡 Getting AI response:', getResponseUrl);
      
      const aiResponse = await axios.get(getResponseUrl);
      
      if (!aiResponse.data.success) {
        throw new Error(aiResponse.data.error || 'Failed to get AI response');
      }

      const responseData = aiResponse.data;
      
      console.log('✅ Response received:', {
        status: responseData.status,
        hasContent: !!responseData.response?.content,
        hasFiles: responseData.has_files,
        filesCount: responseData.files?.length || 0
      });
      
      // Extract content from response
      const content = responseData.response?.content || '';
      
      if (content && content.length > 0) {
        // Display AI response content with proper formatting
        addMessage('assistant', content);
        addMessage('system', `✅ Generation completed`);
        
        // Parse and save the proposal
        if (content.length > 100) {
          addMessage('system', `💾 Parsing and saving proposal...`);
          
          try {
            await parseAndSaveProposal(tenderId, content, thread_id, project_id);
            addMessage('system', `✅ Proposal saved successfully`);
          } catch (parseError: any) {
            console.error('Failed to save proposal:', parseError);
            addMessage('system', `⚠️ Content generated but save failed: ${parseError.message}`);
          }
        }
      } else {
        addMessage('system', `⚠️ No content received from AI`);
      }
      
      // Handle files from response
      if (responseData.has_files && responseData.files && responseData.files.length > 0) {
        console.log('📁 Files received:', responseData.files.length);
        
        responseData.files.forEach((file: any) => {
          addMessage(
            'file',
            `📎 ${file.file_name}`,
            file.file_id,
            file.file_name,
            file.file_type,
            file.file_size
          );
        });
      }
      
      setIsGenerating(false);
      
      // Refresh tender data and show local files
      setTimeout(async () => {
        try {
          await queryClient.invalidateQueries({ queryKey: ['tenders'] });
          const filesResponse = await axios.get(`/api/tenders/${tenderId}`);
          if (filesResponse.data.proposal?.executiveSummary) {
            addMessage('file', '🌐 View Proposal Website', `/api/tenders/${tenderId}/proposal-website`, 'website.html', 'text/html', 0);
            addMessage('file', '📄 Download Proposal PDF', `/api/tenders/${tenderId}/proposal-pdf`, 'proposal.pdf', 'application/pdf', 0);
          }
        } catch (err) {
          console.error('Failed to load proposal files:', err);
        }
      }, 1000);
      
    } catch (error: any) {
      console.error('❌ Generation error:', error);
      const errorMessage = error.response?.data?.details || error.response?.data?.error || error.message;
      addMessage('system', `❌ Failed to generate proposal: ${errorMessage}`);
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

  // Helper function to parse AI response and save proposal
  const parseAndSaveProposal = async (
    tenderId: string, 
    content: string, 
    threadId: string, 
    projectId: string
  ) => {
    console.log('🔍 Parsing AI response:', content.substring(0, 200) + '...');
    
    // Parse sections from markdown content
    const sections = {
      executiveSummary: extractSection(content, 'EXECUTIVE SUMMARY') || 
                       extractSection(content, 'Executive Summary') || 
                       content.substring(0, Math.min(1000, content.length)),
      requirementsUnderstanding: extractSection(content, 'REQUIREMENTS UNDERSTANDING') || 
                                extractSection(content, 'Requirements Understanding') || '',
      technicalApproach: extractSection(content, 'TECHNICAL APPROACH') || 
                        extractSection(content, 'Technical Approach') || '',
      scopeCoverage: extractSection(content, 'SCOPE') || 
                    extractSection(content, 'Scope & Deliverables') || '',
      timeline: extractSection(content, 'TIMELINE') || 
               extractSection(content, 'Timeline') || '',
      commercialDetails: extractSection(content, 'INVESTMENT') || 
                        extractSection(content, 'Commercial Details') || 
                        extractSection(content, 'Investment') || ''
    };
    
    // Extract HTML if present
    const htmlMatch = content.match(/```html\s*([\s\S]*?)```/i);
    const websiteHtml = htmlMatch ? htmlMatch[1].trim() : null;
    
    console.log('📋 Extracted sections:', {
      executiveSummary: sections.executiveSummary.length,
      requirementsUnderstanding: sections.requirementsUnderstanding.length,
      technicalApproach: sections.technicalApproach.length,
      websiteHtml: websiteHtml ? websiteHtml.length : 0
    });
    
    // Save to database
    await axios.post(`/api/tenders/${tenderId}/save-proposal`, {
      ...sections,
      websiteHtml,
      metadata: {
        threadId,
        projectId,
        generatedAt: new Date().toISOString()
      }
    });
  };
  
  // Helper to extract section from markdown
  const extractSection = (text: string, heading: string): string => {
    // Try with ## heading
    const regex1 = new RegExp(`##\\s*${heading}\\s*\n([\\s\\S]*?)(?=\n##|$)`, 'i');
    const match1 = text.match(regex1);
    if (match1) return match1[1].trim();
    
    // Try with # heading
    const regex2 = new RegExp(`#\\s*${heading}\\s*\n([\\s\\S]*?)(?=\n#|$)`, 'i');
    const match2 = text.match(regex2);
    if (match2) return match2[1].trim();
    
    // Try with **heading**
    const regex3 = new RegExp(`\\*\\*${heading}\\*\\*\\s*\n([\\s\\S]*?)(?=\n\\*\\*|$)`, 'i');
    const match3 = text.match(regex3);
    if (match3) return match3[1].trim();
    
    return '';
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
      <div className="min-h-full bg-gradient-to-br from-[#F8F7F4] via-[#FFF9F0] to-[#FFFAF2] p-4 md:p-6">
        <div className="max-w-[1800px] mx-auto">
          {/* Keep existing header - don't change navbar */}
          <header className="flex justify-between items-center bg-transparent py-2 mb-6">
            <div className="flex items-center gap-8">
              <div className="text-2xl font-black tracking-tighter rounded-full border border-gray-300 px-6 py-2 bg-white/80 backdrop-blur-md shadow-sm">
                VECTOR<span className="text-passion">.</span>
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
               <Button onClick={logout} variant="ghost" size="icon" className="rounded-full bg-white/90 backdrop-blur-md border border-gray-200 h-12 w-12 text-passion hover:text-white hover:bg-passion transition-all shadow-sm hover:shadow-md">
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
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-drift to-quantum flex items-center justify-center text-white shadow-lg">
                    <RiRobot2Line size={20} />
                  </div>
                  <div className="flex-1">
                    <h1 className="text-lg font-black text-neural">AI Generator</h1>
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
                          ? 'bg-gradient-to-br from-drift/10 to-quantum/10 border-2 border-drift shadow-md scale-[1.02]' 
                          : 'bg-gray-50/80 border border-gray-200/60 hover:border-passion-light hover:bg-passion-light/10/30 hover:shadow-sm'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-black transition-all ${
                          selectedTenderId === t.id 
                            ? 'bg-passion text-white shadow-md' 
                            : 'bg-gray-200/60 text-gray-600 group-hover:bg-passion-light/30'
                        }`}>
                          {t.aiAnalysis?.overallScore}%
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-bold text-sm mb-1 line-clamp-2 leading-tight text-neural">{t.title}</h3>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="text-[10px] text-gray-500 font-medium bg-gray-100/80 px-2 py-0.5 rounded-full">
                              {t.createdBy === 'dcs' ? 'DCS Corp' : 'Client'}
                            </span>
                            {t.proposal?.executiveSummary && (
                              <span className="text-[9px] text-verdant font-bold flex items-center gap-1 bg-verdant/10 px-2 py-0.5 rounded-full">
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
                            <h2 className="text-base font-black text-neural leading-tight">{selectedTender.title}</h2>
                            <p className="text-xs text-gray-500 font-medium flex items-center gap-2 mt-0.5">
                              <span className="w-1.5 h-1.5 rounded-full bg-verdant"></span>
                              {selectedTender.createdBy === 'dcs' ? 'DCS Corporation' : 'Client'} • Match {selectedTender.aiAnalysis?.overallScore}%
                            </p>
                          </div>
                        </div>
                        <Button
                          onClick={() => generateProposal(selectedTender.id)}
                          disabled={isGenerating}
                          className="rounded-2xl bg-gradient-to-r from-passion to-aurora hover:from-passion-dark hover:to-aurora-dark h-11 font-bold gap-2 px-6 shadow-lg hover:shadow-xl transition-all"
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
                        <ChatMessageBubble 
                          key={msg.id} 
                          message={msg} 
                          tenderId={selectedTender.id}
                          onViewFile={viewGeneratedFile}
                        />
                      ))}
                      <div ref={chatEndRef} />
                      
                      {chatMessages.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-full">
                          <div className="w-24 h-24 rounded-3xl bg-gradient-to-br from-drift/20 to-quantum/20 flex items-center justify-center mb-5 shadow-xl">
                            <RiRobot2Line className="w-12 h-12 text-passion" />
                          </div>
                          <p className="text-xl font-black text-neural mb-2">AI Proposal Assistant</p>
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
                          className="flex-1 px-5 py-3.5 rounded-2xl border-2 border-gray-200/80 outline-none focus:border-drift focus:ring-4 focus:ring-drift/10 bg-white disabled:bg-gray-100 disabled:cursor-not-allowed transition-all font-medium text-sm placeholder:text-gray-400"
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
                          <span className="text-[10px] text-verdant font-bold flex items-center gap-1.5 bg-verdant/10 px-3 py-1 rounded-full">
                            <span className="w-1.5 h-1.5 rounded-full bg-verdant animate-pulse"></span>
                            Connected to AI - Live streaming enabled
                          </span>
                        ) : (
                          <span className="text-[10px] text-aurora font-medium flex items-center gap-1.5 bg-aurora/10 px-3 py-1 rounded-full">
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
                    <p className="text-2xl font-black text-neural mb-2">Select a Tender</p>
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
                    <span className="text-xs font-black text-passion bg-passion-light/10 px-3 py-1 rounded-full">Helium AI</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Status</span>
                    {isGenerating ? (
                      <span className="text-xs font-bold text-verdant flex items-center gap-1.5 bg-verdant/10 px-3 py-1 rounded-full">
                        <span className="w-1.5 h-1.5 rounded-full bg-verdant animate-pulse"></span>
                        Generating
                      </span>
                    ) : (
                      <span className="text-xs font-medium text-gray-500 bg-gray-100 px-3 py-1 rounded-full">Idle</span>
                    )}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-600">Mode</span>
                    <span className="text-xs font-bold text-quantum bg-quantum/10 px-3 py-1 rounded-full">Streaming</span>
                  </div>
                </div>
              </div>

              {/* Quick Actions */}
              {selectedTender && (
                <div className="bg-gradient-to-br from-yellow-50 to-amber-50 backdrop-blur-xl rounded-3xl p-5 border border-solar-light/50/50 shadow-lg">
                  <h3 className="text-xs font-bold uppercase tracking-widest text-aurora-dark mb-4">Quick Actions</h3>
                  <div className="space-y-2">
                    <Button
                      onClick={() => window.open(`/api/tenders/${selectedTender.id}/proposal-website`, '_blank')}
                      variant="outline"
                      className="w-full rounded-xl bg-white/80 border-2 border-solar-light/50 hover:bg-solar/10 hover:border-solar font-bold text-sm py-5 gap-2 transition-all"
                      disabled={!selectedTender.proposal?.executiveSummary}
                    >
                      <RiGlobalLine size={18} />
                      View Website
                    </Button>
                    <Button
                      onClick={() => window.open(`/api/tenders/${selectedTender.id}/proposal-pdf`, '_blank')}
                      variant="outline"
                      className="w-full rounded-xl bg-white/80 border-2 border-solar-light/50 hover:bg-solar/10 hover:border-solar font-bold text-sm py-5 gap-2 transition-all"
                      disabled={!selectedTender.proposal?.executiveSummary}
                    >
                      <RiDownloadLine size={18} />
                      Download PDF
                    </Button>
                  </div>
                </div>
              )}

              {/* Info Card */}
              <div className="flex-1 bg-gradient-to-br from-drift/10 to-quantum/10 backdrop-blur-xl rounded-3xl p-5 border border-drift/20 shadow-lg">
                <h3 className="text-xs font-bold uppercase tracking-widest text-passion-dark mb-3">About</h3>
                <div className="space-y-3 text-xs text-gray-600 leading-relaxed">
                  <p className="font-medium">
                    <span className="font-black text-passion">Real-time AI streaming</span> powered by Helium API
                  </p>
                  <p>Watch proposals generate live with instant feedback</p>
                  <div className="pt-2 mt-2 border-t border-drift/20">
                    <p className="text-[10px] text-gray-500">
                      References: <span className="font-mono text-passion">ipc.he2.ai</span>, <span className="font-mono text-passion">ers.he2.ai</span>
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* File Viewer Modal */}
        {fileViewerOpen && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setFileViewerOpen(false)}>
            <div className="bg-white rounded-3xl shadow-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden" onClick={(e) => e.stopPropagation()}>
              {/* Modal Header */}
              <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gradient-to-r from-drift/10 to-quantum/10">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-gradient-to-br from-passion to-aurora rounded-xl flex items-center justify-center text-white">
                    <RiFileTextLine size={20} />
                  </div>
                  <div>
                    <h3 className="font-black text-lg text-neural">{selectedFile?.file_name}</h3>
                    <p className="text-xs text-gray-500">{selectedFile?.file_type}</p>
                  </div>
                </div>
                <button
                  onClick={() => setFileViewerOpen(false)}
                  className="w-10 h-10 rounded-xl bg-gray-100 hover:bg-gray-200 flex items-center justify-center transition-colors"
                >
                  <span className="text-2xl text-gray-600">×</span>
                </button>
              </div>

              {/* Modal Content */}
              <div className="p-6 overflow-auto max-h-[calc(90vh-140px)]">
                {loadingFile ? (
                  <div className="flex flex-col items-center justify-center py-20">
                    <RiLoaderLine className="w-12 h-12 text-passion animate-spin mb-4" />
                    <p className="text-gray-600">Loading file...</p>
                  </div>
                ) : selectedFile?.file_type.startsWith('image/') ? (
                  <div className="flex justify-center">
                    <img src={fileContent || ''} alt={selectedFile.file_name} className="max-w-full h-auto rounded-xl shadow-lg" />
                  </div>
                ) : selectedFile?.file_type === 'application/pdf' ? (
                  <iframe
                    src={fileContent || ''}
                    className="w-full h-[70vh] rounded-xl"
                    title={selectedFile.file_name}
                  />
                ) : (
                  <pre className="bg-gray-50 p-6 rounded-xl overflow-auto text-sm font-mono whitespace-pre-wrap">
                    {fileContent}
                  </pre>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    </ProtectedRoute>
  );
}

function ChatMessageBubble({ message, tenderId, onViewFile }: { 
  message: ChatMessage, 
  tenderId: string,
  onViewFile?: (fileId: string, fileName: string, fileType: string) => void
}) {
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
    // Determine file icon and color based on type
    const getFileIcon = () => {
      if (message.fileType?.startsWith('image/')) {
        return {
          icon: <RiFileTextLine size={28} />,
          gradient: 'from-drift to-drift-dark',
          bgGradient: 'from-drift/10 to-drift/5',
          borderColor: 'border-drift/20'
        };
      } else if (message.fileName?.includes('html') || message.fileType === 'text/html') {
        return {
          icon: <RiGlobalLine size={28} />,
          gradient: 'from-verdant to-verdant-dark',
          bgGradient: 'from-verdant/10 to-verdant/5',
          borderColor: 'border-verdant/20'
        };
      } else if (message.fileType === 'application/pdf') {
        return {
          icon: <RiFileTextLine size={28} />,
          gradient: 'from-passion to-passion-dark',
          bgGradient: 'from-passion/10 to-passion/5',
          borderColor: 'border-passion/20'
        };
      } else {
        return {
          icon: <RiFileTextLine size={28} />,
          gradient: 'from-quantum to-quantum-dark',
          bgGradient: 'from-quantum/10 to-quantum/5',
          borderColor: 'border-quantum/20'
        };
      }
    };
    
    const fileDisplay = getFileIcon();
    
    return (
      <div className="flex justify-center my-3">
        <button
          onClick={() => {
            if (message.fileId && message.fileName && message.fileType && onViewFile) {
              onViewFile(message.fileId, message.fileName, message.fileType);
            } else if (message.fileUrl) {
              // Fallback to old behavior for local files
              window.open(message.fileUrl, '_blank');
            }
          }}
          className={`group max-w-md bg-gradient-to-br ${fileDisplay.bgGradient} border-2 ${fileDisplay.borderColor} rounded-2xl p-4 shadow-md hover:shadow-xl transition-all cursor-pointer hover:scale-[1.02]`}
        >
          <div className="flex items-center gap-4">
            <div className={`w-16 h-16 bg-gradient-to-br ${fileDisplay.gradient} rounded-xl flex items-center justify-center text-white shadow-lg group-hover:scale-110 transition-transform`}>
              {fileDisplay.icon}
            </div>
            <div className="flex-1 text-left">
              <p className="font-black text-sm text-gray-900 mb-1 group-hover:text-passion transition-colors">
                {message.fileName || 'File'}
              </p>
              <div className="flex items-center gap-2 flex-wrap">
                <p className="text-xs text-gray-600 font-medium bg-white/60 px-2 py-0.5 rounded-full">
                  {message.fileType || 'Unknown type'}
                </p>
                {message.fileSize && message.fileSize > 0 && (
                  <p className="text-xs text-gray-500 font-medium">
                    {(message.fileSize / 1024).toFixed(1)} KB
                  </p>
                )}
              </div>
              <p className="text-xs text-gray-500 mt-1.5 font-medium">
                Click to view/download
              </p>
            </div>
            <div className="text-2xl text-gray-400 group-hover:text-passion transition-colors">
              →
            </div>
          </div>
        </button>
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
        <div className="px-4 py-2.5 rounded-2xl bg-gradient-to-r from-quantum/10 to-drift/10 border-2 border-quantum/20 text-quantum-dark text-xs font-bold max-w-2xl flex items-center gap-2 shadow-md">
          <div className="flex gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-quantum animate-bounce" style={{ animationDelay: '0ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-passion animate-bounce" style={{ animationDelay: '150ms' }}></span>
            <span className="w-1.5 h-1.5 rounded-full bg-quantum animate-bounce" style={{ animationDelay: '300ms' }}></span>
          </div>
          <span>🔧 {message.content}</span>
        </div>
      </div>
    );
  }

  if (message.type === 'streaming' || message.type === 'assistant') {
    const isStreaming = message.isStreaming === true;
    
    // Format content with proper line breaks and sections
    const formatContent = (text: string): JSX.Element[] => {
      const lines = text.split('\n');
      const elements: JSX.Element[] = [];
      
      lines.forEach((line, idx) => {
        // Detect headings
        if (line.startsWith('# ')) {
          elements.push(
            <h1 key={idx} className="text-xl font-black text-neural mt-4 mb-2">
              {line.substring(2)}
            </h1>
          );
        } else if (line.startsWith('## ')) {
          elements.push(
            <h2 key={idx} className="text-lg font-bold text-neural mt-3 mb-2">
              {line.substring(3)}
            </h2>
          );
        } else if (line.startsWith('### ')) {
          elements.push(
            <h3 key={idx} className="text-base font-bold text-gray-800 mt-2 mb-1">
              {line.substring(4)}
            </h3>
          );
        } else if (line.startsWith('**') && line.endsWith('**')) {
          // Bold text
          elements.push(
            <p key={idx} className="font-bold text-neural my-1">
              {line.substring(2, line.length - 2)}
            </p>
          );
        } else if (line.startsWith('- ') || line.startsWith('* ')) {
          // Bullet points
          elements.push(
            <div key={idx} className="flex gap-2 my-1">
              <span className="text-passion mt-1">•</span>
              <span className="flex-1">{line.substring(2)}</span>
            </div>
          );
        } else if (line.match(/^\d+\. /)) {
          // Numbered lists
          const match = line.match(/^(\d+)\. (.*)$/);
          if (match) {
            elements.push(
              <div key={idx} className="flex gap-2 my-1">
                <span className="text-passion font-bold">{match[1]}.</span>
                <span className="flex-1">{match[2]}</span>
              </div>
            );
          }
        } else if (line.trim() === '') {
          // Empty line - add spacing
          elements.push(<div key={idx} className="h-2"></div>);
        } else {
          // Regular text
          elements.push(
            <p key={idx} className="my-1 leading-relaxed">
              {line}
            </p>
          );
        }
      });
      
      return elements;
    };
    
    return (
      <div className="flex justify-start">
        <div className="flex gap-3 max-w-3xl">
          <div className="w-10 h-10 bg-gradient-to-br from-passion to-aurora rounded-2xl flex items-center justify-center text-white flex-shrink-0 shadow-lg">
            <RiRobot2Line size={18} />
          </div>
          <div className={`rounded-3xl rounded-tl-md px-5 py-4 shadow-lg transition-all ${
            isStreaming 
              ? 'bg-gradient-to-br from-drift/10 via-quantum/10 to-passion/10 border-2 border-passion-light' 
              : 'bg-gradient-to-br from-drift/10 to-quantum/10 border border-drift/20'
          }`}>
            {isStreaming && (
              <div className="flex items-center gap-2 mb-3 pb-2 border-b border-drift/20">
                <div className="flex gap-1">
                  <span className="w-2 h-2 rounded-full bg-passion animate-bounce" style={{ animationDelay: '0ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-quantum animate-bounce" style={{ animationDelay: '150ms' }}></span>
                  <span className="w-2 h-2 rounded-full bg-aurora animate-bounce" style={{ animationDelay: '300ms' }}></span>
                </div>
                <span className="text-xs font-black text-passion uppercase tracking-wider animate-pulse">Streaming...</span>
              </div>
            )}
            <div className="prose prose-sm max-w-none">
              <div className="text-sm text-neural leading-relaxed font-medium">
                {formatContent(message.content)}
                {isStreaming && <span className="inline-block w-2 h-4 bg-passion ml-1 animate-pulse"></span>}
              </div>
            </div>
            {!isStreaming && (
              <p className="text-[10px] text-gray-400 mt-3 pt-2 border-t border-drift/10 font-medium">
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
        active ? 'text-white bg-neural shadow-lg scale-105' : 'text-gray-400 hover:text-neural hover:bg-gray-100'
      }`}
    >
      {icon} {label}
    </button>
  );
}
