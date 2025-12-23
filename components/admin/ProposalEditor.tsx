import { useState, useEffect } from 'react';
import { Proposal } from '@/types';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { RiSaveLine, RiSendPlaneLine, RiFileEditLine, RiInformationLine, RiCheckLine, RiSparklingLine } from 'react-icons/ri';

interface ProposalEditorProps {
  tenderId: string;
  proposal: Proposal;
  isAnalysisComplete: boolean;
}

export function ProposalEditor({ tenderId, proposal, isAnalysisComplete }: ProposalEditorProps) {
  const [formData, setFormData] = useState(proposal);
  const [isGenerating, setIsGenerating] = useState(false);
  const queryClient = useQueryClient();

  useEffect(() => {
    setFormData(proposal);
  }, [proposal]);

  const generateWithAI = useMutation({
    mutationFn: async () => {
      setIsGenerating(true);
      
      // Create AI log entry before regeneration
      const logResponse = await axios.post(`/api/tenders/${tenderId}/ai-logs`, {
        regenerated_by: '22222222-2222-2222-2222-222222222222', // Admin user ID
        reason: 'Manual regeneration requested by admin',
        old_proposal_snapshot: formData,
        status: 'in_progress'
      });
      
      const logId = logResponse.data.log.id;
      
      try {
        const response = await axios.post(`/api/tenders/${tenderId}/generate-proposal`);
        
        // Update log as completed
        await axios.patch(`/api/tenders/${tenderId}/ai-logs`, {
          log_id: logId,
          status: 'completed',
          new_proposal_snapshot: response.data.proposal
        });
        
        return response.data;
      } catch (error) {
        // Update log as failed
        await axios.patch(`/api/tenders/${tenderId}/ai-logs`, {
          log_id: logId,
          status: 'failed',
          error_message: error instanceof Error ? error.message : 'Unknown error'
        });
        throw error;
      }
    },
    onSuccess: (data) => {
      setFormData(prev => ({
        ...prev,
        ...data.proposal
      }));
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      queryClient.invalidateQueries({ queryKey: ['ai-logs', tenderId] });
      setIsGenerating(false);
      alert('✅ AI proposal generated successfully! Review and edit as needed.');
    },
    onError: (error: any) => {
      setIsGenerating(false);
      queryClient.invalidateQueries({ queryKey: ['ai-logs', tenderId] });
      alert(`⚠️ AI generation had issues. Using template fallback.\n${error.response?.data?.details || ''}`);
    }
  });

  const saveDraft = useMutation({
    mutationFn: async (data: Partial<Proposal>) => {
      await axios.put(`/api/tenders/${tenderId}/proposal`, data);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      alert('Draft saved successfully');
    },
    onError: () => alert('Failed to save draft')
  });

  const submitProposal = useMutation({
    mutationFn: async () => {
      await saveDraft.mutateAsync(formData); // Save first
      await axios.post(`/api/tenders/${tenderId}/proposal/submit`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      alert('Proposal submitted successfully!');
    },
    onError: () => alert('Failed to submit proposal')
  });

  const handleChange = (field: keyof Proposal, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  if (!isAnalysisComplete) {
    return (
      <div className="bg-drift/10 text-passion-dark p-6 rounded-lg flex items-center gap-3">
        <RiInformationLine className="w-6 h-6" />
        <div>
          <p className="font-semibold">Analysis Pending</p>
          <p className="text-sm">Proposal draft will be generated automatically once AI analysis is complete.</p>
        </div>
      </div>
    );
  }

  if (proposal.status === 'submitted') {
     return (
       <div className="space-y-6">
         <div className="bg-verdant/10 text-verdant-dark p-6 rounded-lg flex items-center gap-3">
           <RiCheckLine className="w-6 h-6" />
           <div>
             <p className="font-semibold">Proposal Submitted</p>
             <p className="text-sm">Submitted on {new Date(proposal.submittedAt!).toLocaleString()}</p>
           </div>
         </div>
         <ProposalPreview proposal={proposal} />
       </div>
     );
  }

  return (
    <div className="space-y-6">
      <div className="bg-aurora/10 border border-aurora-light/50 text-aurora-dark p-4 rounded-lg flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <RiFileEditLine className="w-5 h-5" />
          <p className="text-sm font-medium">Review and edit the AI-generated proposal below. Add commercial details before submitting.</p>
        </div>
        <Button
          size="sm"
          onClick={() => generateWithAI.mutate()}
          disabled={isGenerating}
          className="rounded-full bg-passion hover:bg-passion-dark text-white gap-2 text-xs font-bold px-4 flex-shrink-0"
        >
          {isGenerating ? (
            <>
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <RiSparklingLine /> Regenerate with AI
            </>
          )}
        </Button>
      </div>

      {isGenerating && (
        <div className="bg-passion-light/10 border-2 border-indigo-200 text-passion-dark p-6 rounded-lg">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-8 h-8 border-3 border-passion-light border-t-indigo-600 rounded-full animate-spin"></div>
            <p className="font-bold">AI is analyzing the tender and generating proposal...</p>
          </div>
          <p className="text-sm text-passion">
            Using reference websites: <code className="bg-white px-2 py-0.5 rounded">ipc.he2.ai</code> and <code className="bg-white px-2 py-0.5 rounded">ers.he2.ai</code>
          </p>
          <p className="text-xs text-indigo-500 mt-2">This may take 10-30 seconds...</p>
        </div>
      )}

      <div className="space-y-6">
        <EditorSection label="Executive Summary" value={formData.executiveSummary} onChange={(v) => handleChange('executiveSummary', v)} />
        <EditorSection label="Understanding of Requirements" value={formData.requirementsUnderstanding} onChange={(v) => handleChange('requirementsUnderstanding', v)} />
        <EditorSection label="Technical Approach" value={formData.technicalApproach} onChange={(v) => handleChange('technicalApproach', v)} />
        <EditorSection label="Scope Coverage" value={formData.scopeCoverage} onChange={(v) => handleChange('scopeCoverage', v)} />
        <EditorSection label="Exclusions" value={formData.exclusions} onChange={(v) => handleChange('exclusions', v)} />
        <EditorSection label="Assumptions" value={formData.assumptions} onChange={(v) => handleChange('assumptions', v)} />
        <EditorSection label="Delivery Timeline" value={formData.timeline} onChange={(v) => handleChange('timeline', v)} />
        <EditorSection 
          label="Commercial Details (Pricing, Payment Terms)" 
          value={formData.commercialDetails} 
          onChange={(v) => handleChange('commercialDetails', v)} 
          placeholder="Add pricing, payment terms, and other commercial details..."
        />
      </div>

      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button variant="secondary" onClick={() => saveDraft.mutate(formData)} disabled={saveDraft.isPending}>
          <RiSaveLine className="mr-2" />
          Save Draft
        </Button>
        <Button variant="success" onClick={() => submitProposal.mutate()} disabled={submitProposal.isPending}>
          <RiSendPlaneLine className="mr-2" />
          Submit to Client
        </Button>
      </div>
    </div>
  );
}

function EditorSection({ label, value, onChange, placeholder }: { label: string, value: string, onChange: (v: string) => void, placeholder?: string }) {
  return (
    <div className="space-y-2">
      <label className="text-sm font-semibold text-neural-light">{label}</label>
      <Textarea 
        value={value} 
        onChange={(e) => onChange(e.target.value)} 
        placeholder={placeholder}
        className="min-h-[150px]" 
      />
    </div>
  );
}

function ProposalPreview({ proposal }: { proposal: Proposal }) {
  return (
    <div className="space-y-8 bg-gray-50 p-8 rounded-xl border">
      <h3 className="text-xl font-bold text-neural border-b pb-4">Submitted Proposal</h3>
      <PreviewSection title="Executive Summary" content={proposal.executiveSummary} />
      <PreviewSection title="Understanding of Requirements" content={proposal.requirementsUnderstanding} />
      <PreviewSection title="Technical Approach" content={proposal.technicalApproach} />
      <PreviewSection title="Scope Coverage" content={proposal.scopeCoverage} />
      <PreviewSection title="Exclusions" content={proposal.exclusions} />
      <PreviewSection title="Assumptions" content={proposal.assumptions} />
      <PreviewSection title="Delivery Timeline" content={proposal.timeline} />
      <PreviewSection title="Commercial Details" content={proposal.commercialDetails} />
    </div>
  );
}

function PreviewSection({ title, content }: { title: string, content: string }) {
  return (
    <div>
      <h4 className="font-semibold text-neural mb-2">{title}</h4>
      <div className="text-neural-light whitespace-pre-wrap leading-relaxed">{content}</div>
    </div>
  );
}

