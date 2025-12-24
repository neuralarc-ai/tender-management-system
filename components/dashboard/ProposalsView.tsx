'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tender } from '@/types';
import { RiMessage2Line, RiPhoneLine, RiMore2Fill, RiSearchLine, RiFilter3Line } from 'react-icons/ri';

export function ProposalsView({ tenders }: { tenders: Tender[] }) {
  // Filter for tenders that have some proposal activity or represent potential matches
  const activeProposals = tenders.filter(t => t.status === 'open' || t.proposal.status !== 'draft');

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      <div className="flex justify-between items-center">
        <div>
           <h2 className="text-3xl font-bold text-neural">Proposals Pipeline</h2>
           <p className="text-gray-500">Manage your active applications and matches</p>
        </div>
        <div className="flex gap-3">
             <Button variant="outline" className="rounded-full border-gray-200">
                <RiFilter3Line className="mr-2" /> Filter
             </Button>
             <div className="relative">
                <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                    type="text" 
                    placeholder="Search proposals..." 
                    className="pl-10 pr-4 py-2 rounded-full border border-gray-200 focus:outline-none focus:ring-2 focus:ring-gray-900 bg-white"
                />
             </div>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeProposals.map((tender) => (
          <ProposalCard key={tender.id} tender={tender} />
        ))}
      </div>
    </div>
  );
}

function ProposalCard({ tender }: { tender: Tender }) {
    const matchRate = tender.aiAnalysis.overallScore || 0;
    
    return (
        <Card className="p-6 rounded-[32px] border-none shadow-sm hover:shadow-md transition-shadow bg-white">
            <div className="flex justify-between items-start mb-4">
                <div className="flex gap-4">
                    <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-xl font-bold text-gray-600">
                        {tender.createdBy === 'client' ? 'C' : 'A'}
                    </div>
                    <div>
                        <h3 className="font-semibold text-neural line-clamp-1">{tender.title}</h3>
                        <p className="text-sm text-gray-500">{tender.status}</p>
                    </div>
                </div>
                <button className="text-gray-400 hover:text-gray-600">
                    <RiMore2Fill />
                </button>
            </div>

            <div className="space-y-4 mb-6">
                <div>
                    <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-500">Match Rate</span>
                        <span className="font-semibold">{matchRate}%</span>
                    </div>
                    <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div 
                            className="h-full bg-aurora rounded-full" 
                            style={{ width: `${matchRate}%` }}
                        />
                    </div>
                </div>
                
                <div className="flex gap-2">
                    <span className="px-3 py-1 bg-gray-50 rounded-full text-xs text-gray-600 border border-gray-100">
                        {tender.aiAnalysis.relevanceScore}% Relevance
                    </span>
                     <span className="px-3 py-1 bg-gray-50 rounded-full text-xs text-gray-600 border border-gray-100">
                        {tender.aiAnalysis.feasibilityScore}% Feasibility
                    </span>
                </div>
            </div>

            <div className="flex gap-3">
                <Button className="flex-1 rounded-full bg-neural text-white hover:bg-neural-light">
                    View Details
                </Button>
                <Button variant="outline" size="icon" className="rounded-full border-gray-200">
                    <RiMessage2Line />
                </Button>
                <Button variant="outline" size="icon" className="rounded-full border-gray-200">
                    <RiPhoneLine />
                </Button>
            </div>
        </Card>
    )
}


