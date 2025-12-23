'use client';

import { useState } from 'react';
import { Tender } from '@/types';
import { format } from 'date-fns';
import { 
  RiSearchLine, 
  RiDownloadLine,
  RiCheckDoubleLine,
  RiTimeLine,
  RiFileTextLine,
  RiEyeLine,
  RiThumbUpLine,
  RiThumbDownLine,
  RiDraftLine,
  RiSendPlaneFill,
  RiArrowRightLine
} from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function ProposalsListView({ tenders, role, onSelect }: { 
  tenders: Tender[], 
  role: string, 
  onSelect?: (id: string) => void 
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<'all' | 'draft' | 'submitted' | 'decided'>('all');
  const queryClient = useQueryClient();

  const submitProposal = useMutation({
    mutationFn: async (id: string) => {
        setSubmittingId(id);
        const response = await axios.post(`/api/tenders/${id}/proposal/submit`);
        return response.data;
    },
    onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['tenders'] });
        setSubmittingId(null);
    },
    onError: () => {
        setSubmittingId(null);
    }
  });

  const handleQuickSubmit = (e: React.MouseEvent, id: string) => {
      e.stopPropagation();
      if (confirm('Submit this proposal to the client?')) {
        submitProposal.mutate(id);
      }
  };

  const filteredTenders = tenders.filter(t => 
    t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.id.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Apply status filter
  const statusFilteredTenders = statusFilter === 'all' 
    ? filteredTenders
    : statusFilter === 'draft'
    ? filteredTenders.filter(t => t.proposal?.status === 'draft')
    : statusFilter === 'submitted'
    ? filteredTenders.filter(t => t.proposal?.status === 'submitted')
    : filteredTenders.filter(t => t.proposal?.status === 'accepted' || t.proposal?.status === 'rejected');

  // Group by status for Kanban columns
  const groupedTenders = {
    draft: statusFilteredTenders.filter(t => t.proposal?.status === 'draft' && t.aiAnalysis?.status === 'completed'),
    submitted: statusFilteredTenders.filter(t => t.proposal?.status === 'submitted'),
    accepted: statusFilteredTenders.filter(t => t.proposal?.status === 'accepted'),
    rejected: statusFilteredTenders.filter(t => t.proposal?.status === 'rejected')
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-normal text-neural mb-2">Proposal Workflow</h2>
          <p className="text-gray-500 text-sm">Track proposals from creation to decision</p>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          {/* Filter Pills */}
          <div className="flex gap-2">
            <FilterPill 
              label="All" 
              active={statusFilter === 'all'}
              onClick={() => setStatusFilter('all')}
            />
            <FilterPill 
              label="Draft" 
              active={statusFilter === 'draft'}
              onClick={() => setStatusFilter('draft')}
            />
            <FilterPill 
              label="Submitted" 
              active={statusFilter === 'submitted'}
              onClick={() => setStatusFilter('submitted')}
            />
            <FilterPill 
              label="Decided" 
              active={statusFilter === 'decided'}
              onClick={() => setStatusFilter('decided')}
            />
          </div>

          <div className="relative">
            <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search proposals..." 
              className="pl-10 pr-4 py-2 bg-white border border-gray-200 rounded-full focus:ring-2 focus:ring-indigo-200 outline-none text-sm w-64"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>
          <Button variant="outline" className="rounded-full border-gray-200 gap-2 h-10 text-xs">
            <RiDownloadLine /> Export
          </Button>
        </div>
      </div>

      {/* Kanban Board */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Column 1: Draft */}
        <ProposalColumn
          title="Ready to Submit"
          count={groupedTenders.draft.length}
          color="amber"
          icon={<RiDraftLine />}
        >
          {groupedTenders.draft.map((tender) => (
            <ProposalCard
              key={tender.id}
              tender={tender}
              role={role}
              onSelect={() => onSelect?.(tender.id)}
              onQuickSubmit={(e) => handleQuickSubmit(e, tender.id)}
              isSubmitting={submittingId === tender.id}
              statusColor="amber"
            />
          ))}
        </ProposalColumn>

        {/* Column 2: Submitted */}
        <ProposalColumn
          title="Awaiting Review"
          count={groupedTenders.submitted.length}
          color="blue"
          icon={<RiSendPlaneFill />}
        >
          {groupedTenders.submitted.map((tender) => (
            <ProposalCard
              key={tender.id}
              tender={tender}
              role={role}
              onSelect={() => onSelect?.(tender.id)}
              statusColor="blue"
            />
          ))}
        </ProposalColumn>

        {/* Column 3: Accepted */}
        <ProposalColumn
          title="Accepted"
          count={groupedTenders.accepted.length}
          color="green"
          icon={<RiThumbUpLine />}
        >
          {groupedTenders.accepted.map((tender) => (
            <ProposalCard
              key={tender.id}
              tender={tender}
              role={role}
              onSelect={() => onSelect?.(tender.id)}
              statusColor="green"
            />
          ))}
        </ProposalColumn>

        {/* Column 4: Rejected */}
        <ProposalColumn
          title="Rejected"
          count={groupedTenders.rejected.length}
          color="red"
          icon={<RiThumbDownLine />}
        >
          {groupedTenders.rejected.map((tender) => (
            <ProposalCard
              key={tender.id}
              tender={tender}
              role={role}
              onSelect={() => onSelect?.(tender.id)}
              statusColor="red"
            />
          ))}
        </ProposalColumn>
      </div>
    </div>
  );
}

function ProposalColumn({ title, count, color, icon, children }: {
  title: string,
  count: number,
  color: 'amber' | 'blue' | 'green' | 'red',
  icon: React.ReactNode,
  children: React.ReactNode
}) {
  const colorClasses = {
    amber: 'bg-aurora/10 border-aurora-light/50 text-aurora-dark',
    blue: 'bg-drift/10 border-drift-light/50 text-passion-dark',
    green: 'bg-verdant/10 border-verdant-light/50 text-verdant-dark',
    red: 'bg-passion-light/10 border-passion-light/50 text-passion-dark'
  };

  return (
    <div className="flex flex-col h-full">
      <div className={`px-4 py-3 rounded-t-3xl border-2 border-b-0 ${colorClasses[color]} flex items-center justify-between`}>
        <div className="flex items-center gap-2">
          <span className="text-lg">{icon}</span>
          <span className="font-bold text-sm uppercase tracking-wider">{title}</span>
        </div>
        <span className="bg-white px-2 py-0.5 rounded-full text-xs font-black">{count}</span>
      </div>
      <div className="bg-gray-50 rounded-b-3xl p-4 space-y-3 min-h-[600px] border-2 border-t-0 border-gray-100">
        {children}
        {count === 0 && (
          <div className="flex flex-col items-center justify-center py-12 text-gray-300">
            <div className="text-4xl mb-2">-</div>
            <p className="text-xs uppercase tracking-wider">No proposals</p>
          </div>
        )}
      </div>
    </div>
  );
}

function ProposalCard({ tender, role, onSelect, onQuickSubmit, isSubmitting, statusColor }: {
  tender: Tender,
  role: string,
  onSelect: () => void,
  onQuickSubmit?: (e: React.MouseEvent) => void,
  isSubmitting?: boolean,
  statusColor: 'amber' | 'blue' | 'green' | 'red'
}) {
  const aiScore = tender.aiAnalysis?.overallScore || 0;
  
  const colorClasses = {
    amber: 'hover:border-amber-300',
    blue: 'hover:border-blue-300',
    green: 'hover:border-green-300',
    red: 'hover:border-red-300'
  };

  return (
    <Card 
      className={`p-4 rounded-2xl border-2 border-gray-200 bg-white cursor-pointer transition-all hover:shadow-md ${colorClasses[statusColor]}`}
      onClick={onSelect}
    >
      {/* Title */}
      <h3 className="font-bold text-sm text-neural mb-2 line-clamp-2 leading-tight min-h-[40px]">
        {tender.title}
      </h3>

      {/* Meta Info */}
      <div className="flex items-center justify-between mb-3 pb-3 border-b border-gray-100">
        <span className="text-xs text-gray-500">
          {tender.createdBy === 'dcs' ? 'DCS' : tender.createdBy === 'acme_corp' ? 'Acme' : 'Global'}
        </span>
        <span className={`text-xs font-black ${
          aiScore > 80 ? 'text-verdant' : aiScore > 50 ? 'text-aurora' : 'text-passion'
        }`}>
          {aiScore}%
        </span>
      </div>

      {/* Deadline */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-3">
        <RiTimeLine />
        <span>{format(new Date(tender.submissionDeadline), 'MMM dd, yyyy')}</span>
      </div>

      {/* Action */}
      {role === 'admin' && tender.proposal?.status === 'draft' && onQuickSubmit ? (
        <Button 
          size="sm" 
          className="w-full rounded-full bg-neural text-white hover:bg-neural-light h-9 text-xs font-bold gap-2"
          onClick={onQuickSubmit}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
          ) : (
            <>
              Submit Proposal <RiArrowRightLine />
            </>
          )}
        </Button>
      ) : (
        <Button 
          size="sm" 
          variant="outline"
          className="w-full rounded-full border-gray-200 text-neural-light h-9 text-xs font-bold gap-2"
          onClick={(e) => { e.stopPropagation(); onSelect(); }}
        >
          <RiEyeLine /> View Details
        </Button>
      )}
    </Card>
  );
}

function FilterPill({ label, active, onClick }: { label: string, active?: boolean, onClick?: () => void }) {
  return (
    <button 
      onClick={onClick}
      className={`px-4 py-2 rounded-full text-xs font-bold uppercase tracking-wider transition-all ${
        active 
          ? 'bg-neural text-white shadow-sm' 
          : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
      }`}
    >
      {label}
    </button>
  );
}
