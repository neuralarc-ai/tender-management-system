import { useState } from 'react';
import { Tender } from '@/types';
import { RiFileTextLine, RiBrainLine, RiEditLine, RiCalendarLine, RiUserLine, RiTimeLine, RiCheckLine, RiCloseLine, RiFileList3Line } from 'react-icons/ri';
import { AnalysisView } from './AnalysisView';
import { ProposalEditor } from './ProposalEditor';
import { DocumentsTab } from './DocumentsTab';
import { formatDistanceToNow } from 'date-fns';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function TenderDetail({ tender, role, currentUserId }: { tender: Tender, role?: string, currentUserId?: string }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'proposal' | 'documents'>('overview');
  const [isReviewing, setIsReviewing] = useState(false);
  const queryClient = useQueryClient();

  const isExpired = new Date(tender.submissionDeadline) < new Date();
  const deadlineText = isExpired 
    ? 'EXPIRED' 
    : formatDistanceToNow(new Date(tender.submissionDeadline), { addSuffix: true }).toUpperCase();

  const isClient = role === 'client';

  const reviewProposal = useMutation({
    mutationFn: async ({ status, feedback }: { status: 'accepted' | 'rejected', feedback: string }) => {
      const response = await axios.post(`/api/tenders/${tender.id}/proposal/review`, {
        status,
        feedback
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      alert(`✓ Proposal ${variables.status === 'accepted' ? 'accepted' : 'rejected'} successfully!`);
      setIsReviewing(false);
    },
    onError: () => {
      alert('✗ Failed to review proposal. Please try again.');
      setIsReviewing(false);
    }
  });

  const handleAccept = () => {
    if (confirm('Accept this proposal? This will notify Neural Arc of your decision.')) {
      setIsReviewing(true);
      reviewProposal.mutate({ 
        status: 'accepted', 
        feedback: 'Proposal accepted. Looking forward to working together!' 
      });
    }
  };

  const handleReject = () => {
    const feedback = prompt('Please provide feedback for rejection (optional):');
    if (feedback !== null) { // null means cancelled
      setIsReviewing(true);
      reviewProposal.mutate({ 
        status: 'rejected', 
        feedback: feedback || 'Proposal did not meet requirements.' 
      });
    }
  };

  return (
    <div className="font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start gap-4 mb-8 pb-6 border-b border-gray-100">
        <div>
          <h2 className="text-3xl font-black text-neural mb-3 uppercase tracking-tight">{tender.title}</h2>
          <div className="flex flex-wrap gap-4 text-gray-400 text-[10px] font-bold uppercase tracking-widest">
            <span className="flex items-center gap-2"><RiCalendarLine /> Submitted: {new Date(tender.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-2"><RiUserLine /> {isClient ? 'Neural Arc Inc.' : 'DCS Corporation'}</span>
          </div>
        </div>
        <div className={`px-6 py-3 rounded-full font-black text-[10px] flex items-center gap-2 uppercase tracking-widest ${
          isExpired 
            ? 'bg-passion-light/30 text-passion-dark animate-pulse' 
            : 'bg-aurora/20 text-aurora-dark'
        }`}>
          <RiTimeLine />
          {deadlineText}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-100 mb-8 overflow-x-auto">
        <TabButton 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')} 
          icon={<RiFileTextLine />} 
          label="Overview" 
        />
        {!isClient && (
        <TabButton 
          active={activeTab === 'analysis'} 
          onClick={() => setActiveTab('analysis')} 
          icon={<RiBrainLine />} 
          label="AI Analysis" 
        />
        )}
        <TabButton 
          active={activeTab === 'proposal'} 
          onClick={() => setActiveTab('proposal')} 
          icon={<RiEditLine />} 
          label={isClient ? "Received Proposal" : "Proposal Draft"} 
        />
        <TabButton 
          active={activeTab === 'documents'} 
          onClick={() => setActiveTab('documents')} 
          icon={<RiFileList3Line />} 
          label="Generated Documents" 
        />
        {/* Commented out: Communication tab */}
        {/* <TabButton 
          active={activeTab === 'communication'} 
          onClick={() => setActiveTab('communication')} 
          icon={<RiMessage3Line />} 
          label="Communication" 
        /> */}
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <div className="space-y-6 animate-in fade-in duration-300">
            <DetailSection title="Description" content={tender.description} icon={<RiFileTextLine />} />
            <DetailSection title="Scope of Work" content={tender.scopeOfWork} icon={<RiFileTextLine />} />
            <DetailSection title="Technical Requirements" content={tender.technicalRequirements} icon={<RiBrainLine />} />
            <DetailSection title="Functional Requirements" content={tender.functionalRequirements} icon={<RiFileTextLine />} />
            <DetailSection title="Eligibility Criteria" content={tender.eligibilityCriteria} icon={<RiUserLine />} />
            
            {tender.documents.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-3xl border border-gray-100">
                <h3 className="font-black text-[10px] uppercase tracking-widest text-gray-400 mb-4 flex items-center gap-2">
                  <RiFileTextLine /> Supporting Documents
                </h3>
                <div className="space-y-2">
                  {tender.documents.map((doc, i) => (
                    <a 
                      key={i} 
                      href={doc.url} 
                      target="_blank" 
                      rel="noopener noreferrer" 
                      className="flex items-center gap-3 text-passion hover:text-passion-dark font-medium p-3 hover:bg-passion-light/10 rounded-2xl transition-colors"
                    >
                      <RiFileTextLine className="flex-shrink-0" /> 
                      <span className="flex-1">{doc.name}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider">({(doc.size / 1024).toFixed(1)} KB)</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && !isClient && (
          <div className="animate-in fade-in duration-300">
            <AnalysisView analysis={tender.aiAnalysis} />
          </div>
        )}

        {activeTab === 'proposal' && (
          <div className="animate-in fade-in duration-300">
            {isClient ? (
                tender.proposal.status === 'submitted' || tender.proposal.status === 'accepted' || tender.proposal.status === 'rejected' ? (
                    <div className="bg-white border border-gray-100 rounded-3xl p-8 shadow-sm">
                        <h3 className="text-2xl font-black uppercase tracking-tight text-neural mb-6">Received Proposal</h3>
                        <div className="space-y-6">
                            <DetailSection title="Executive Summary" content={tender.proposal.executiveSummary} icon={<RiFileTextLine />} />
                            <DetailSection title="Technical Approach" content={tender.proposal.technicalApproach} icon={<RiBrainLine />} />
                            <DetailSection title="Timeline" content={tender.proposal.timeline} icon={<RiTimeLine />} />
                            
                            <div className="mt-8 pt-6 border-t border-gray-100 flex justify-end gap-4">
                                <button 
                                  onClick={handleAccept}
                                  disabled={isReviewing}
                                  className="px-8 py-3 bg-verdant text-white rounded-full hover:bg-verdant-dark font-black text-[11px] uppercase tracking-wider flex items-center gap-2 shadow-lg shadow-verdant/20 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  {isReviewing ? (
                                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                  ) : (
                                    <>
                                      <RiCheckLine size={18} /> Accept Proposal
                                    </>
                                  )}
                                </button>
                                <button 
                                  onClick={handleReject}
                                  disabled={isReviewing}
                                  className="px-8 py-3 border-2 border-passion-light/50 text-passion rounded-full hover:bg-passion-light/10 font-black text-[11px] uppercase tracking-wider flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                  <RiCloseLine size={18} /> Decline
                                </button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex flex-col items-center justify-center py-20 text-gray-300 bg-gray-50 rounded-3xl border-2 border-dashed border-gray-200">
                        <RiTimeLine className="w-20 h-20 mb-4 opacity-20" />
                        <p className="text-lg font-bold uppercase tracking-wider">Proposal In Progress</p>
                        <p className="text-[10px] uppercase tracking-widest mt-2">Neural Arc is preparing your proposal</p>
                    </div>
                )
            ) : (
            <ProposalEditor 
              tenderId={tender.id} 
              proposal={tender.proposal} 
              isAnalysisComplete={tender.aiAnalysis.status === 'completed'} 
            />
            )}
          </div>
        )}

        {activeTab === 'documents' && currentUserId && (
          <div className="animate-in fade-in duration-300">
            <DocumentsTab
              tenderId={tender.id}
              currentUserId={currentUserId}
              currentUserRole={role as 'admin' | 'client'}
            />
          </div>
        )}

        {/* Commented out: Communication tab content */}
        {/* {activeTab === 'communication' && currentUserId && (
          <div className="animate-in fade-in duration-300">
            <CommunicationTab 
              tenderId={tender.id}
              currentUserId={currentUserId}
              currentUserRole={role as 'admin' | 'client'}
            />
          </div>
        )} */}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-black text-[11px] uppercase tracking-wider flex items-center gap-2 border-b-4 transition-all ${
        active 
          ? 'border-passion text-passion' 
          : 'border-transparent text-gray-400 hover:text-neural hover:border-gray-200'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function DetailSection({ title, content, icon }: { title: string, content: string, icon: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-[10px] font-black text-gray-400 uppercase tracking-widest flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="bg-gray-50 border border-gray-100 rounded-2xl p-6 text-neural-light whitespace-pre-wrap leading-relaxed font-medium">
        {content}
      </div>
    </div>
  );
}
