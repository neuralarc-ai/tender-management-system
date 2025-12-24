'use client';

import { useState } from 'react';
import { Tender } from '@/types';
import { format } from 'date-fns';
import { Countdown } from '@/components/ui/countdown';
import { 
  RiSearchLine, 
  RiFilter3Line, 
  RiAddLine, 
  RiDownloadLine, 
  RiArrowUpDownLine,
  RiGlobalLine,
  RiNotification3Fill,
  RiSendPlaneFill,
  RiCheckDoubleLine
} from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';

export function TenderListView({ tenders, role, onSelect, viewType, onAddTender }: { 
  tenders: Tender[], 
  role: string, 
  onSelect?: (id: string) => void,
  viewType?: 'tenders' | 'proposals',
  onAddTender?: () => void
}) {
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submittingId, setSubmittingId] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [clientFilter, setClientFilter] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'deadline' | 'created' | 'match'>('created');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const queryClient = useQueryClient();

  const isProposalsView = viewType === 'proposals';
  const pageTitle = isProposalsView ? 'Proposals & Responses' : 'Tenders & Opportunities';

  const handleSelect = (id: string) => {
    setSelectedId(id === selectedId ? null : id);
    if (onSelect) onSelect(id);
  };

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

  const filteredTenders = tenders
    .filter(t => {
      // Search filter
      const matchesSearch = t.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                           t.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      // Status filter
      const matchesStatus = statusFilter === 'all' || t.status === statusFilter;
      
      // Client filter
      const matchesClient = clientFilter === 'all' || t.createdBy === clientFilter;
      
      return matchesSearch && matchesStatus && matchesClient;
    })
    .sort((a, b) => {
      let comparison = 0;
      
      switch (sortBy) {
        case 'deadline':
          comparison = new Date(a.submissionDeadline).getTime() - new Date(b.submissionDeadline).getTime();
          break;
        case 'match':
          comparison = (a.aiAnalysis?.overallScore || 0) - (b.aiAnalysis?.overallScore || 0);
          break;
        case 'created':
        default:
          comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Get unique clients for filter
  const uniqueClients = Array.from(new Set(tenders.map(t => t.createdBy)));

  const handleSort = (column: 'deadline' | 'created' | 'match') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(column);
      setSortOrder('asc');
    }
  };

  const handleExport = () => {
    // Create CSV
    const headers = ['Tender ID', 'Title', 'Client', 'Status', 'Deadline', 'AI Match %'];
    const rows = filteredTenders.map(t => [
      t.id,
      t.title,
      t.createdBy,
      t.status,
      format(new Date(t.submissionDeadline), 'yyyy-MM-dd'),
      t.aiAnalysis?.overallScore || 0
    ]);

    const csv = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
    ].join('\n');

    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `tenders-export-${format(new Date(), 'yyyy-MM-dd')}.csv`;
    a.click();
    window.URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex flex-col gap-2">
        <h2 className="text-4xl font-normal text-neural">{pageTitle}</h2>
        
        {/* Stats Row */}
        <div className="flex gap-4 overflow-x-auto pb-2 text-sm">
           <div className="flex items-center gap-2 px-4 py-2 bg-neural text-white rounded-full">
              <span className="font-bold">{tenders.length}</span> Total
           </div>
           {isProposalsView ? (
             <>
               <div className="flex items-center gap-2 px-4 py-2 bg-drift/20 text-passion-dark rounded-full">
                  <span className="font-bold">{tenders.filter(t => t.proposal?.status === 'submitted').length}</span> Submitted
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-verdant/20 text-verdant-dark rounded-full">
                  <span className="font-bold">{tenders.filter(t => t.proposal?.status === 'accepted').length}</span> Accepted
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-passion-light/30 text-passion-dark rounded-full">
                  <span className="font-bold">{tenders.filter(t => t.proposal?.status === 'rejected').length}</span> Rejected
               </div>
             </>
           ) : (
             <>
               <div className="flex items-center gap-2 px-4 py-2 bg-aurora text-neural rounded-full">
                  <span className="font-bold">{tenders.filter(t => t.status === 'open').length}</span> Open
               </div>
               <div className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 text-gray-500 rounded-full">
                  <span className="font-bold">{tenders.filter(t => t.status === 'closed' || t.status === 'awarded').length}</span> Closed
               </div>
             </>
           )}
        </div>
      </div>

      <div className="bg-white rounded-[32px] p-6 shadow-sm">
        {/* Toolbar */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 mb-6">
            <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
                <FilterButton 
                  label="All" 
                  active={statusFilter === 'all'}
                  onClick={() => setStatusFilter('all')}
                />
                <FilterButton 
                  label="Open" 
                  active={statusFilter === 'open'}
                  onClick={() => setStatusFilter('open')}
                />
                <FilterButton 
                  label="Closed" 
                  active={statusFilter === 'closed'}
                  onClick={() => setStatusFilter('closed')}
                />
                
                {/* Client Filter Dropdown */}
                <select 
                  value={clientFilter}
                  onChange={(e) => setClientFilter(e.target.value)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer outline-none"
                >
                  <option value="all">All Clients</option>
                  {uniqueClients.map(client => (
                    <option key={client} value={client}>
                      {client === 'dcs' ? 'DCS Corp' : client === 'acme_corp' ? 'Acme Inc' : client === 'globex_finance' ? 'Globex' : 'Stark Industries'}
                    </option>
                  ))}
                </select>

                {/* Sort Dropdown */}
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="px-4 py-2 bg-white border border-gray-200 rounded-full text-sm font-medium text-gray-600 hover:bg-gray-50 cursor-pointer outline-none"
                >
                  <option value="created">Sort: Created</option>
                  <option value="deadline">Sort: Deadline</option>
                  {role === 'admin' && <option value="match">Sort: Match %</option>}
                </select>
            </div>

            <div className="flex items-center gap-4 w-full md:w-auto">
                <div className="relative flex-1 md:w-64">
                    <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                        type="text" 
                        placeholder="Search tenders..." 
                        className="w-full pl-10 pr-4 py-2 bg-gray-50 border-none rounded-full focus:ring-2 focus:ring-gray-200 outline-none text-sm"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {role === 'client' && (
                        <Button 
                          size="icon" 
                          onClick={onAddTender}
                          className="rounded-full bg-aurora/20 text-aurora-dark hover:bg-aurora/30 h-10 w-10"
                        >
                            <RiAddLine />
                        </Button>
                    )}
                    <Button 
                      size="icon" 
                      variant="outline" 
                      onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
                      className="rounded-full border-gray-200 h-10 w-10"
                      title={`Sort ${sortOrder === 'asc' ? 'Descending' : 'Ascending'}`}
                    >
                        <RiFilter3Line />
                    </Button>
                    <Button 
                      variant="outline" 
                      onClick={handleExport}
                      className="rounded-full border-gray-200 gap-2 h-10 text-xs hover:bg-neural hover:text-white transition-colors"
                    >
                        <RiDownloadLine /> Export
                    </Button>
                </div>
            </div>
        </div>

        {/* Proper Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-dashed border-gray-200">
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                  <input type="checkbox" className="rounded border-gray-300" />
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600">
                  Tender Name <RiArrowUpDownLine className="inline" />
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600">
                  Client <RiArrowUpDownLine className="inline" />
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600">
                  Location <RiArrowUpDownLine className="inline" />
                </th>
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => handleSort('deadline')}>
                  Deadline <RiArrowUpDownLine className="inline" />
                </th>
                {role === 'admin' && (
                  <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600" onClick={() => handleSort('match')}>
                    Match <RiArrowUpDownLine className="inline" />
                  </th>
                )}
                <th className="text-left py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider cursor-pointer hover:text-gray-600">
                  Status <RiArrowUpDownLine className="inline" />
                </th>
                {role === 'admin' && (
                  <th className="text-right py-3 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">
                    Action
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {filteredTenders.map((tender, index) => (
                <tr 
                  key={tender.id}
                  onClick={() => handleSelect(tender.id)}
                  className={`border-b border-gray-100 cursor-pointer transition-all ${
                    selectedId === tender.id 
                      ? 'bg-aurora/20' 
                      : 'hover:bg-gray-50'
                  }`}
                >
                  <td className="py-4 px-4">
                    <input 
                      type="checkbox" 
                      checked={selectedId === tender.id}
                      readOnly
                      className="rounded border-gray-300"
                    />
                  </td>
                  
                  <td className="py-4 px-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold relative ${
                        selectedId === tender.id ? 'bg-neural text-white' : 'bg-gray-100 text-gray-600'
                      }`}>
                        {tender.title.substring(0, 2).toUpperCase()}
                        {role === 'admin' && index < 2 && tender.status === 'open' && (
                          <span className="absolute -top-1 -right-1 flex h-3 w-3">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-passion/50 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-3 w-3 bg-passion"></span>
                          </span>
                        )}
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <div className="font-bold text-sm text-neural truncate max-w-xs">
                            {tender.title}
                          </div>
                          {role === 'admin' && index < 2 && tender.status === 'open' && (
                            <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-drift/20 text-passion-dark flex-shrink-0">NEW</span>
                          )}
                        </div>
                        <div className="text-xs text-gray-500">{tender.id}</div>
                      </div>
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="text-sm font-medium text-neural">
                      {tender.createdBy === 'dcs' ? 'DCS Corp' : tender.createdBy === 'acme_corp' ? 'Acme Inc' : 'Global Tech'}
                    </div>
                    <div className="text-xs text-gray-400">Enterprise</div>
                  </td>

                  <td className="py-4 px-4">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <RiGlobalLine className="text-gray-400" />
                      Remote / US
                    </div>
                  </td>

                  <td className="py-4 px-4">
                    {role === 'client' && tender.status === 'open' ? (
                      <Countdown targetDate={tender.submissionDeadline} />
                    ) : (
                      <span className="text-sm font-medium text-gray-600">
                        {format(new Date(tender.submissionDeadline), 'MMM dd')}
                      </span>
                    )}
                  </td>

                  {role === 'admin' && (
                    <td className="py-4 px-4">
                      <span className={`text-sm font-bold ${
                        tender.aiAnalysis?.overallScore > 80 ? 'text-verdant' : 
                        tender.aiAnalysis?.overallScore > 50 ? 'text-solar-dark' : 'text-passion'
                      }`}>
                        {tender.aiAnalysis?.overallScore || 0}%
                      </span>
                    </td>
                  )}

                  <td className="py-4 px-4">
                    <StatusBadge status={tender.proposal?.status === 'submitted' ? 'submitted' : tender.status} />
                  </td>

                  {role === 'admin' && (
                    <td className="py-4 px-4 text-right">
                      {tender.proposal?.status === 'draft' && tender.status === 'open' ? (
                        <Button 
                          size="sm" 
                          className="h-8 rounded-full bg-neural text-white hover:bg-neural-light gap-2 text-xs px-4"
                          onClick={(e) => handleQuickSubmit(e, tender.id)}
                          disabled={submittingId === tender.id}
                        >
                          {submittingId === tender.id ? (
                            <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                          ) : (
                            <>Submit <RiSendPlaneFill /></>
                          )}
                        </Button>
                      ) : tender.proposal?.status === 'submitted' ? (
                        <div className="inline-flex items-center gap-1 text-verdant text-xs font-medium bg-verdant/10 px-3 py-1 rounded-full">
                          <RiCheckDoubleLine /> Sent
                        </div>
                      ) : (
                        <span className="text-xs text-gray-400">-</span>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {filteredTenders.length === 0 && (
          <div className="text-center py-12 text-gray-400">
            <p className="text-sm font-bold uppercase">No tenders found</p>
          </div>
        )}
      </div>
    </div>
  );
}

function FilterButton({ label, active, onClick }: { label: string, active?: boolean, onClick?: () => void }) {
    return (
        <button 
          onClick={onClick}
          className={`flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all ${
            active 
              ? 'bg-neural text-white shadow-sm' 
              : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
          }`}
        >
            {label}
        </button>
    )
}

function StatusBadge({ status }: { status: string }) {
    let colorClass = '';
    let dotClass = '';
    
    switch (status) {
        case 'open':
            colorClass = 'bg-verdant/20 text-verdant-dark';
            dotClass = 'bg-verdant';
            break;
        case 'submitted':
            colorClass = 'bg-drift/20 text-passion-dark';
            dotClass = 'bg-passion';
            break;
        case 'closed':
            colorClass = 'bg-gray-100 text-gray-600';
            dotClass = 'bg-gray-400';
            break;
        default:
            colorClass = 'bg-gray-100 text-gray-600';
            dotClass = 'bg-gray-400';
    }

    return (
        <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium ${colorClass}`}>
            <div className={`w-1.5 h-1.5 rounded-full ${dotClass}`} />
            <span className="capitalize">{status}</span>
        </div>
    )
}
