import { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { 
  RiSendPlaneLine, 
  RiAttachmentLine, 
  RiFileTextLine, 
  RiTimeLine, 
  RiUserLine,
  RiCheckDoubleLine,
  RiHistoryLine,
  RiRefreshLine,
  RiErrorWarningLine,
  RiCheckLine,
  RiCloseLine
} from 'react-icons/ri';
import { formatDistanceToNow } from 'date-fns';
import { TenderMessage, AIRegenerationLog } from '@/types';

interface CommunicationTabProps {
  tenderId: string;
  currentUserId: string;
  currentUserRole: 'admin' | 'client';
}

export function CommunicationTab({ tenderId, currentUserId, currentUserRole }: CommunicationTabProps) {
  const [message, setMessage] = useState('');
  const [uploadingFiles, setUploadingFiles] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState<any[]>([]);
  const [activeView, setActiveView] = useState<'messages' | 'ai-logs'>('messages');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch messages
  const { data: messagesData, isLoading: loadingMessages } = useQuery({
    queryKey: ['tender-messages', tenderId],
    queryFn: async () => {
      const response = await axios.get(`/api/tenders/${tenderId}/messages`);
      return response.data;
    },
    refetchInterval: 10000 // Refetch every 10 seconds for real-time feel
  });

  // Fetch AI logs
  const { data: aiLogsData, isLoading: loadingLogs } = useQuery({
    queryKey: ['ai-logs', tenderId],
    queryFn: async () => {
      const response = await axios.get(`/api/tenders/${tenderId}/ai-logs`);
      return response.data;
    },
    refetchInterval: 5000 // Refetch every 5 seconds when AI is running
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (data: { content: string; attachments: any[] }) => {
      const response = await axios.post(`/api/tenders/${tenderId}/messages`, {
        sender_id: currentUserId,
        content: data.content,
        message_type: data.attachments.length > 0 ? 'file' : 'text',
        attachments: data.attachments
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tender-messages', tenderId] });
      setMessage('');
      setUploadedFiles([]);
    }
  });

  // Mark messages as read
  useEffect(() => {
    if (messagesData?.messages?.length > 0) {
      axios.patch(`/api/tenders/${tenderId}/messages`, {
        user_id: currentUserId
      });
    }
  }, [messagesData, tenderId, currentUserId]);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messagesData]);

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setUploadingFiles(true);
    const newFiles: any[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        newFiles.push({
          file_name: response.data.name,
          file_url: response.data.url,
          file_size: response.data.size,
          file_type: file.type
        });
      } catch (error) {
        console.error('Upload failed', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setUploadingFiles(false);
  };

  const handleSendMessage = () => {
    if (!message.trim() && uploadedFiles.length === 0) return;
    
    sendMessageMutation.mutate({
      content: message || '📎 Attached files',
      attachments: uploadedFiles
    });
  };

  const messages: TenderMessage[] = messagesData?.messages || [];
  const aiLogs: AIRegenerationLog[] = aiLogsData?.logs || [];

  return (
    <div className="flex flex-col h-[600px] bg-white rounded-3xl border border-gray-100 overflow-hidden">
      {/* Header with tabs */}
      <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100 bg-gray-50">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveView('messages')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeView === 'messages'
                ? 'bg-passion text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <RiSendPlaneLine className="inline mr-1" />
            Messages {messages.length > 0 && `(${messages.length})`}
          </button>
          <button
            onClick={() => setActiveView('ai-logs')}
            className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
              activeView === 'ai-logs'
                ? 'bg-passion text-white shadow-md'
                : 'bg-white text-gray-600 hover:bg-gray-100'
            }`}
          >
            <RiHistoryLine className="inline mr-1" />
            AI Logs {aiLogs.length > 0 && `(${aiLogs.length})`}
          </button>
        </div>
      </div>

      {/* Messages View */}
      {activeView === 'messages' && (
        <>
          {/* Messages list */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {loadingMessages ? (
              <div className="flex items-center justify-center h-full">
                <div className="w-8 h-8 border-4 border-drift-light border-t-drift rounded-full animate-spin"></div>
              </div>
            ) : messages.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-full text-gray-300">
                <RiSendPlaneLine className="w-16 h-16 mb-4 opacity-20" />
                <p className="text-sm font-bold uppercase tracking-wider">No messages yet</p>
                <p className="text-xs uppercase tracking-widest mt-2">Start the conversation below</p>
              </div>
            ) : (
              <>
                {messages.map((msg) => {
                  const isOwnMessage = msg.sender_id === currentUserId;
                  const isSystem = msg.message_type === 'system';

                  if (isSystem) {
                    return (
                      <div key={msg.id} className="flex justify-center">
                        <div className="bg-gray-100 text-gray-500 px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider">
                          {msg.content}
                        </div>
                      </div>
                    );
                  }

                  return (
                    <div key={msg.id} className={`flex ${isOwnMessage ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[70%] ${isOwnMessage ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
                        {/* Sender info */}
                        <div className="flex items-center gap-2 px-2">
                          <RiUserLine className="text-gray-400 text-xs" />
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest font-bold">
                            {msg.sender_name} • {msg.sender_role}
                          </span>
                        </div>

                        {/* Message bubble */}
                        <div className={`rounded-2xl px-4 py-3 ${
                          isOwnMessage
                            ? 'bg-passion text-white'
                            : 'bg-gray-100 text-neural'
                        }`}>
                          <p className="text-sm whitespace-pre-wrap break-words">{msg.content}</p>
                          
                          {/* Attachments */}
                          {msg.attachments.length > 0 && (
                            <div className="mt-3 space-y-2">
                              {msg.attachments.map((att) => (
                                <a
                                  key={att.id}
                                  href={att.file_url}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`flex items-center gap-2 p-2 rounded-xl ${
                                    isOwnMessage
                                      ? 'bg-passion-dark hover:bg-passion-dark'
                                      : 'bg-white hover:bg-gray-50'
                                  }`}
                                >
                                  <RiFileTextLine />
                                  <span className="text-xs flex-1">{att.file_name}</span>
                                  <span className="text-[10px] opacity-70">
                                    {(att.file_size / 1024).toFixed(1)} KB
                                  </span>
                                </a>
                              ))}
                            </div>
                          )}
                        </div>

                        {/* Timestamp */}
                        <div className="flex items-center gap-2 px-2">
                          <RiTimeLine className="text-gray-400 text-xs" />
                          <span className="text-[10px] text-gray-400 uppercase tracking-widest">
                            {formatDistanceToNow(new Date(msg.created_at), { addSuffix: true })}
                          </span>
                          {isOwnMessage && msg.is_read && (
                            <RiCheckDoubleLine className="text-passion text-xs" title="Read" />
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </>
            )}
          </div>

          {/* Message input */}
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            {/* File preview */}
            {uploadedFiles.length > 0 && (
              <div className="mb-3 flex flex-wrap gap-2">
                {uploadedFiles.map((file, idx) => (
                  <div key={idx} className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200">
                    <RiFileTextLine className="text-passion" />
                    <span className="text-xs">{file.file_name}</span>
                    <button
                      onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                      className="text-passion/60 hover:text-passion"
                    >
                      <RiCloseLine />
                    </button>
                  </div>
                ))}
              </div>
            )}

            <div className="flex gap-2">
              <input
                type="file"
                ref={fileInputRef}
                onChange={handleFileUpload}
                multiple
                className="hidden"
              />
              <button
                onClick={() => fileInputRef.current?.click()}
                disabled={uploadingFiles}
                className="px-4 py-3 bg-white border-2 border-gray-200 rounded-2xl hover:border-passion-light text-gray-600 hover:text-passion transition-all disabled:opacity-50"
              >
                {uploadingFiles ? (
                  <div className="w-5 h-5 border-2 border-gray-300 border-t-passion rounded-full animate-spin" />
                ) : (
                  <RiAttachmentLine size={20} />
                )}
              </button>
              <input
                type="text"
                value={message}
                onChange={(e) => setMessage(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSendMessage();
                  }
                }}
                placeholder="Type your message..."
                className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-2xl focus:border-passion focus:outline-none font-medium"
              />
              <button
                onClick={handleSendMessage}
                disabled={sendMessageMutation.isPending || (!message.trim() && uploadedFiles.length === 0)}
                className="px-6 py-3 bg-passion text-white rounded-2xl hover:bg-passion-dark font-bold flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {sendMessageMutation.isPending ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                ) : (
                  <>
                    <RiSendPlaneLine />
                    Send
                  </>
                )}
              </button>
            </div>
          </div>
        </>
      )}

      {/* AI Logs View */}
      {activeView === 'ai-logs' && (
        <div className="flex-1 overflow-y-auto p-6">
          {loadingLogs ? (
            <div className="flex items-center justify-center h-full">
              <div className="w-8 h-8 border-4 border-drift-light border-t-drift rounded-full animate-spin"></div>
            </div>
          ) : aiLogs.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-gray-300">
              <RiHistoryLine className="w-16 h-16 mb-4 opacity-20" />
              <p className="text-sm font-bold uppercase tracking-wider">No AI regenerations yet</p>
              <p className="text-xs uppercase tracking-widest mt-2">Regeneration history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {aiLogs.map((log) => (
                <div key={log.id} className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        log.status === 'completed' ? 'bg-verdant/20 text-verdant' :
                        log.status === 'failed' ? 'bg-passion-light/30 text-passion' :
                        'bg-drift/20 text-passion'
                      }`}>
                        {log.status === 'completed' ? <RiCheckLine size={20} /> :
                         log.status === 'failed' ? <RiErrorWarningLine size={20} /> :
                         <RiRefreshLine size={20} className="animate-spin" />}
                      </div>
                      <div>
                        <p className="font-bold text-neural">AI Proposal Regeneration</p>
                        <p className="text-xs text-gray-500 uppercase tracking-wider">
                          By {log.regenerated_by_name} • {formatDistanceToNow(new Date(log.created_at), { addSuffix: true })}
                        </p>
                      </div>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${
                      log.status === 'completed' ? 'bg-verdant/20 text-verdant-dark' :
                      log.status === 'failed' ? 'bg-passion-light/30 text-passion-dark' :
                      'bg-drift/20 text-passion-dark'
                    }`}>
                      {log.status}
                    </span>
                  </div>

                  {log.reason && (
                    <div className="bg-white p-4 rounded-xl mb-3">
                      <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-2">Reason</p>
                      <p className="text-sm text-neural-light">{log.reason}</p>
                    </div>
                  )}

                  {log.error_message && (
                    <div className="bg-passion-light/10 border border-passion-light/50 p-4 rounded-xl">
                      <p className="text-xs font-bold text-passion uppercase tracking-widest mb-2">Error</p>
                      <p className="text-sm text-passion-dark">{log.error_message}</p>
                    </div>
                  )}

                  {log.helium_thread_id && (
                    <div className="flex gap-4 text-xs text-gray-500 mt-3">
                      <div>
                        <span className="font-bold uppercase tracking-wider">Thread:</span> {log.helium_thread_id.substring(0, 8)}...
                      </div>
                      {log.completed_at && (
                        <div>
                          <span className="font-bold uppercase tracking-wider">Completed:</span>{' '}
                          {formatDistanceToNow(new Date(log.completed_at), { addSuffix: true })}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

