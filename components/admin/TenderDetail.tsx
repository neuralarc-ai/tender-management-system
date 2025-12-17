import { useState } from 'react';
import { Tender } from '@/types';
import { RiFileTextLine, RiBrainLine, RiEditLine, RiCalendarLine, RiUserLine, RiTimeLine } from 'react-icons/ri';
import { AnalysisView } from './AnalysisView';
import { ProposalEditor } from './ProposalEditor';
import { formatDistanceToNow } from 'date-fns';

export function TenderDetail({ tender }: { tender: Tender }) {
  const [activeTab, setActiveTab] = useState<'overview' | 'analysis' | 'proposal'>('overview');

  const isExpired = new Date(tender.submissionDeadline) < new Date();
  const deadlineText = isExpired 
    ? 'Expired' 
    : formatDistanceToNow(new Date(tender.submissionDeadline), { addSuffix: true });

  return (
    <div>
      {/* Header */}
      <div className="flex justify-between items-start mb-8 pb-6 border-b">
        <div>
          <h2 className="text-3xl font-bold text-gray-900 mb-2">{tender.title}</h2>
          <div className="flex gap-6 text-gray-500 text-sm">
            <span className="flex items-center gap-2"><RiCalendarLine /> Submitted: {new Date(tender.createdAt).toLocaleDateString()}</span>
            <span className="flex items-center gap-2"><RiUserLine /> Client: TCS/DCS</span>
          </div>
        </div>
        <div className={`px-4 py-2 rounded-lg font-semibold flex items-center gap-2 ${isExpired ? 'bg-red-100 text-red-700' : 'bg-amber-100 text-amber-800'}`}>
          <RiTimeLine />
          {deadlineText}
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 border-b mb-8">
        <TabButton 
          active={activeTab === 'overview'} 
          onClick={() => setActiveTab('overview')} 
          icon={<RiFileTextLine />} 
          label="Overview" 
        />
        <TabButton 
          active={activeTab === 'analysis'} 
          onClick={() => setActiveTab('analysis')} 
          icon={<RiBrainLine />} 
          label="AI Analysis" 
        />
        <TabButton 
          active={activeTab === 'proposal'} 
          onClick={() => setActiveTab('proposal')} 
          icon={<RiEditLine />} 
          label="Proposal Draft" 
        />
      </div>

      {/* Content */}
      <div className="min-h-[500px]">
        {activeTab === 'overview' && (
          <div className="space-y-8 animate-in fade-in duration-300">
            <DetailSection title="Description" content={tender.description} icon={<RiFileTextLine />} />
            <DetailSection title="Scope of Work" content={tender.scopeOfWork} icon={<RiFileTextLine />} />
            <DetailSection title="Technical Requirements" content={tender.technicalRequirements} icon={<RiBrainLine />} />
            <DetailSection title="Functional Requirements" content={tender.functionalRequirements} icon={<RiFileTextLine />} />
            <DetailSection title="Eligibility Criteria" content={tender.eligibilityCriteria} icon={<RiUserLine />} />
            
            {tender.documents.length > 0 && (
              <div className="bg-gray-50 p-6 rounded-lg">
                <h3 className="font-semibold mb-4 flex items-center gap-2"><RiFileTextLine /> Supporting Documents</h3>
                <div className="space-y-2">
                  {tender.documents.map((doc, i) => (
                    <a key={i} href={doc.url} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 text-blue-600 hover:underline">
                      <RiFileTextLine /> {doc.name} <span className="text-gray-400 text-sm">({(doc.size / 1024).toFixed(1)} KB)</span>
                    </a>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="animate-in fade-in duration-300">
            <AnalysisView analysis={tender.aiAnalysis} />
          </div>
        )}

        {activeTab === 'proposal' && (
          <div className="animate-in fade-in duration-300">
            <ProposalEditor 
              tenderId={tender.id} 
              proposal={tender.proposal} 
              isAnalysisComplete={tender.aiAnalysis.status === 'completed'} 
            />
          </div>
        )}
      </div>
    </div>
  );
}

function TabButton({ active, onClick, icon, label }: { active: boolean, onClick: () => void, icon: React.ReactNode, label: string }) {
  return (
    <button
      onClick={onClick}
      className={`px-6 py-3 font-medium flex items-center gap-2 border-b-2 transition-colors ${
        active 
          ? 'border-blue-600 text-blue-600' 
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {icon} {label}
    </button>
  );
}

function DetailSection({ title, content, icon }: { title: string, content: string, icon: React.ReactNode }) {
  return (
    <div className="space-y-3">
      <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
        {icon} {title}
      </h3>
      <div className="bg-white border rounded-lg p-5 text-gray-700 whitespace-pre-wrap leading-relaxed shadow-sm">
        {content}
      </div>
    </div>
  );
}

