'use client';

import { 
  RiUser3Line, 
  RiMore2Fill, 
  RiArrowRightUpLine, 
  RiCheckboxCircleLine, 
  RiFileListLine,
  RiBriefcaseLine, 
  RiCalendarLine,
  RiRobot2Line,
  RiAddLine,
  RiSearchLine,
  RiSettings4Line,
  RiTimeLine,
  RiFlashlightLine,
  RiPulseLine
} from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { SimpleBarChart, ScoreRadialChart } from './Charts';
import { Tender } from '@/types';
import { format } from 'date-fns';

interface DashboardStats {
  totalTenders: number;
  openTenders: number;
  submittedProposals: number;
  avgAiScore: number;
}

export function WelcomeBanner({ stats, role, onPostTender }: { stats: DashboardStats, role: string, onPostTender?: () => void }) {
  const isClient = role === 'client';
  const today = format(new Date(), 'EEEE, MMMM do');
  
  return (
    <div className="mb-8 font-sans">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-6">
          <div>
              <p className="text-gray-500 text-sm font-medium mb-1 uppercase tracking-wider">{today}</p>
              <h1 className="text-4xl font-normal text-neural">
                Welcome back, <span className="font-bold capitalize">{isClient ? 'Partner' : 'Admin'}</span>
              </h1>
          </div>
          {isClient && onPostTender && (
            <button
              onClick={onPostTender}
              className="flex items-center gap-4 bg-passion hover:bg-passion-dark text-white px-5 py-3 rounded-[24px] shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] cursor-pointer"
            >
              <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center shadow-sm">
                <RiAddLine size={20} className="text-white" />
              </div>
              <div className="text-left">
                <div className="font-bold text-sm text-white uppercase tracking-tight">Post Tender</div>
                <div className="text-[9px] text-white/70 font-bold uppercase tracking-widest">Initial project intake</div>
              </div>
            </button>
          )}
      </div>

      <div className="flex gap-4 overflow-x-auto pb-4 hide-scrollbar">
        <StatsPill 
          label="Total Tenders" 
          value={stats.totalTenders.toString()} 
          color="bg-neural text-white" 
        />
        <StatsPill 
          label="Open Opportunities" 
          value={stats.openTenders.toString()} 
          color="bg-aurora text-neural" 
        />
        <StatsPill 
          label="Avg. AI Match" 
          value={`${stats.avgAiScore}%`} 
          color="bg-white text-neural border border-gray-100 shadow-sm" 
          width="w-48" 
          striped 
        />
        <StatsPill 
          label={isClient ? "My Proposals" : "Received"} 
          value={stats.submittedProposals.toString()} 
          color="bg-white text-gray-500 border border-gray-100 shadow-sm" 
        />
        
        <div className="ml-auto flex gap-8 items-center px-4 shrink-0">
            <div className="text-center">
                <div className="text-3xl font-light">{stats.totalTenders}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Active</div>
            </div>
            <div className="w-px h-8 bg-gray-200" />
            <div className="text-center">
                <div className="text-3xl font-light">{stats.submittedProposals}</div>
                <div className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Proposals</div>
            </div>
        </div>
      </div>
    </div>
  );
}

function StatsPill({ label, value, color, width = "w-32", striped = false }: { label: string, value: string, color: string, width?: string, striped?: boolean }) {
  return (
    <div className="flex flex-col gap-1 shrink-0">
      <span className="text-[10px] font-bold text-gray-400 ml-3 uppercase tracking-widest">{label}</span>
      <div className={`h-12 rounded-full flex items-center justify-center font-bold text-lg ${color} ${width} ${striped ? 'bg-[url("data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xIDNMMyAxIiBzdHJva2U9IiNlZWUiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==")]' : ''}`}>
        {value}
      </div>
    </div>
  );
}

export function ProfileCard({ role }: { role: string }) {
  return (
    <Card className="p-6 rounded-[40px] bg-white border-none shadow-xl h-full relative overflow-hidden group font-sans">
      <div className="absolute top-6 right-6 z-10">
        <button className="bg-gray-100 p-2 rounded-full hover:bg-gray-200 transition-colors">
            <RiMore2Fill className="text-neural" />
        </button>
      </div>
      <div className="h-full flex flex-col">
        <div className="relative mb-6">
            <div className="w-24 h-24 rounded-full bg-gray-100 flex items-center justify-center overflow-hidden border-4 border-white shadow-lg">
                <RiUser3Line className="w-12 h-12 text-gray-300" />
            </div>
            <div className="absolute bottom-0 right-0 w-6 h-6 bg-verdant border-4 border-white rounded-full"></div>
        </div>
        
        <div className="flex-1">
            <div className="bg-aurora/20 text-aurora-dark text-[10px] font-bold px-3 py-1 rounded-full inline-block mb-3 uppercase tracking-wider">
                {role === 'admin' ? 'Strategic Admin' : 'Premium Partner'}
            </div>
            <h3 className="text-2xl font-bold text-neural mb-1 capitalize">
                {role === 'admin' ? 'Alex Neural' : 'DCS Corporation'}
            </h3>
            <p className="text-gray-500 text-sm mb-6 flex items-center gap-2">
                <RiBriefcaseLine /> {role === 'admin' ? 'Head of Operations' : 'Innovation Partner'}
            </p>
        </div>

        <div className="grid grid-cols-2 gap-4 mt-auto">
            <div className="bg-gray-50 p-4 rounded-3xl">
                <div className="text-[10px] text-gray-400 mb-1 uppercase font-bold tracking-widest">Tasks</div>
                <div className="text-xl font-bold text-neural">12</div>
            </div>
            <div className="bg-gray-50 p-4 rounded-3xl">
                <div className="text-[10px] text-gray-400 mb-1 uppercase font-bold tracking-widest">Rating</div>
                <div className="text-xl font-bold text-aurora flex items-center gap-1">4.9</div>
            </div>
        </div>
      </div>
    </Card>
  );
}

export function PerformanceMetricsCard({ tenders, role, onViewAll }: { tenders?: any[], role?: string, onViewAll?: () => void }) {
    const isPartner = role === 'client';
    
    if (isPartner && tenders) {
        // Partner metrics: Their tender submission activity
        const totalSubmitted = tenders.length;
        const awaitingResponse = tenders.filter(t => t.proposal?.status === 'draft').length;
        const receivedProposals = tenders.filter(t => t.proposal?.status === 'submitted').length;
        const responseRate = totalSubmitted > 0 ? (receivedProposals / totalSubmitted) * 100 : 0;
        
        return (
            <Card className="p-6 rounded-[32px] bg-white border-none shadow-sm h-full flex flex-col font-sans">
                <div className="flex justify-between items-start mb-6">
                    <div>
                        <h3 className="text-lg font-bold text-neural">Tender Activity</h3>
                        <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Your Submissions</p>
                    </div>
                    <div className="bg-passion-light/30 text-passion p-2 rounded-2xl">
                        <RiArrowRightUpLine size={20} />
                    </div>
                </div>

                <div className="flex-1 flex flex-col justify-center space-y-6">
                    <div>
                        <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest text-gray-400">
                            <span>PROPOSALS RECEIVED</span>
                            <span className="text-verdant">{receivedProposals}/{totalSubmitted}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-verdant rounded-full shadow-sm shadow-green-200" style={{ width: `${responseRate}%` }} />
                        </div>
                    </div>
                    <div>
                        <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest text-gray-400">
                            <span>AWAITING RESPONSE</span>
                            <span className="text-aurora">{awaitingResponse}</span>
                        </div>
                        <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                            <div className="h-full bg-aurora/100 rounded-full shadow-sm shadow-aurora/20" style={{ width: `${totalSubmitted > 0 ? (awaitingResponse / totalSubmitted) * 100 : 0}%` }} />
                        </div>
                    </div>
                </div>

                <div className="mt-6 pt-6 border-t border-dashed flex justify-between items-center">
                    <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                        <RiPulseLine className="text-indigo-500" /> {totalSubmitted} Total
                    </div>
                    <button 
                        onClick={onViewAll}
                        className="text-[10px] font-black text-neural underline uppercase tracking-widest hover:text-passion transition-colors"
                    >
                        View All
                    </button>
                </div>
            </Card>
        );
    }
    
    // Admin metrics: Win rate and response time
    return (
        <Card className="p-6 rounded-[32px] bg-white border-none shadow-sm h-full flex flex-col font-sans">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <h3 className="text-lg font-bold text-neural">Proposal Efficacy</h3>
                    <p className="text-[10px] text-gray-400 mt-1 uppercase font-bold tracking-widest">Win Rate vs Submission</p>
                </div>
                <div className="bg-verdant/20 text-verdant p-2 rounded-2xl">
                    <RiArrowRightUpLine size={20} />
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-center space-y-6">
                <div>
                    <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest text-gray-400">
                        <span>WIN RATE</span>
                        <span className="text-verdant">78%</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-verdant rounded-full shadow-sm shadow-green-200" style={{ width: '78%' }} />
                    </div>
                </div>
                <div>
                    <div className="flex justify-between text-[10px] font-black mb-2 uppercase tracking-widest text-gray-400">
                        <span>RESPONSE TIME</span>
                        <span className="text-passion">4.2h</span>
                    </div>
                    <div className="h-3 bg-gray-100 rounded-full overflow-hidden">
                        <div className="h-full bg-passion rounded-full shadow-sm shadow-blue-200" style={{ width: '92%' }} />
                    </div>
                </div>
            </div>

            <div className="mt-6 pt-6 border-t border-dashed flex justify-between items-center">
                <div className="flex items-center gap-2 text-[10px] font-black text-gray-500 uppercase tracking-widest">
                    <RiPulseLine className="text-verdant" /> +12% this month
                </div>
                <button className="text-[10px] font-black text-neural underline uppercase tracking-widest">View Report</button>
            </div>
        </Card>
    );
}

export function ProjectProgressCard({ tender }: { tender?: Tender }) {
    if (!tender) return (
        <Card className="p-6 rounded-[32px] bg-indigo-600 text-white border-none shadow-xl h-full flex flex-col items-center justify-center text-center font-sans">
            <RiFlashlightLine size={48} className="mb-4 opacity-30" />
            <h3 className="text-xl font-bold mb-2">No Active Projects</h3>
            <p className="text-indigo-100 text-sm">Submit your first tender to track progress here.</p>
        </Card>
    );

    const steps = [
        { name: 'Analysis', completed: true, active: false },
        { name: 'Proposal', completed: tender.proposal?.status !== 'draft', active: tender.proposal?.status === 'draft' },
        { name: 'Review', completed: ['accepted', 'rejected'].includes(tender.proposal?.status), active: tender.proposal?.status === 'submitted' },
        { name: 'Award', completed: tender.status === 'awarded', active: tender.proposal?.status === 'accepted' }
    ];

    return (
        <Card className="p-6 rounded-[32px] bg-white border-none shadow-sm h-full flex flex-col font-sans">
            <div className="flex justify-between items-start mb-6">
                <div>
                    <div className="bg-indigo-100 text-indigo-600 text-[10px] font-black px-3 py-1 rounded-full uppercase mb-2 inline-block tracking-widest">Current Project</div>
                    <h3 className="text-lg font-bold truncate max-w-[200px] text-neural">{tender.title}</h3>
                </div>
                <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-indigo-600">
                    <RiTimeLine />
                </div>
            </div>

            <div className="flex-1 flex flex-col justify-between">
                <div className="flex justify-between relative px-2">
                    <div className="absolute top-3 left-6 right-6 h-px bg-gray-100 -z-0" />
                    {steps.map((step, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 relative z-10">
                            <div className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-black ${
                                step.completed ? 'bg-verdant text-white shadow-sm shadow-green-200' : 
                                step.active ? 'bg-passion text-white ring-4 ring-indigo-50 shadow-sm shadow-indigo-200' : 'bg-gray-100 text-gray-400'
                            }`}>
                                {step.completed ? '✓' : i + 1}
                            </div>
                            <span className={`text-[10px] font-black uppercase tracking-tighter ${
                                step.active ? 'text-indigo-600' : 'text-gray-400'
                            }`}>{step.name}</span>
                        </div>
                    ))}
                </div>

                <div className="mt-8 bg-gray-50 rounded-3xl p-4 flex items-center justify-between">
                    <div>
                        <div className="text-[10px] font-bold text-gray-400 uppercase mb-1 tracking-widest">Status</div>
                        <div className="text-sm font-bold capitalize text-neural">{tender.proposal?.status || tender.status}</div>
                    </div>
                    <Button variant="ghost" size="sm" className="rounded-full bg-white shadow-sm border border-gray-100 h-8 text-[10px] font-black uppercase tracking-widest">
                        View
                    </Button>
                </div>
            </div>
        </Card>
    );
}

export function StatusDistributionCard({ data }: { data: { name: string; value: number }[] }) {
  return (
    <Card className="p-5 rounded-[32px] bg-white border-none shadow-sm h-full flex flex-col font-sans overflow-hidden">
      <div className="flex justify-between items-start mb-3 flex-shrink-0">
        <div>
            <h3 className="text-base font-bold text-verdant">Pipeline Alpha</h3>
            <p className="text-[9px] text-gray-400 mt-0.5 uppercase font-bold tracking-widest">Global Distribution</p>
        </div>
        <div className="bg-verdant/10 p-1.5 rounded-full">
            <RiArrowRightUpLine className="text-verdant" size={16} />
        </div>
      </div>
      
      <div className="flex-1 min-h-0">
        <SimpleBarChart data={data} />
      </div>
    </Card>
  );
}

export function AIAnalysisCard({ score }: { score: number }) {
  return (
    <Card className="p-5 rounded-[32px] bg-neural text-white border-none shadow-xl h-full flex flex-col font-sans overflow-hidden">
      <div className="flex justify-between items-start mb-3 flex-shrink-0">
        <div>
            <h3 className="text-base font-bold text-white">Neural Core</h3>
            <p className="text-[9px] text-aurora mt-0.5 uppercase font-bold tracking-widest">AI Match Engine</p>
        </div>
        <div className="bg-white/10 p-1.5 rounded-full">
            <RiRobot2Line className="text-aurora" size={16} />
        </div>
      </div>
      
      <div className="flex-1 relative flex items-center justify-center min-h-0">
        <ScoreRadialChart score={score} label="Engine Precision" />
      </div>
      
      <div className="mt-3 pt-3 border-t border-white/10 flex justify-between items-center text-[9px] font-bold text-white/40 uppercase tracking-widest flex-shrink-0">
        <span>AUTO-ANALYSIS</span>
        <span className="text-verdant animate-pulse">LIVE</span>
      </div>
    </Card>
  );
}

export function RecentTendersWidget({ tenders, onSelect }: { tenders: Tender[], onSelect: (id: string) => void }) {
  const recentTenders = tenders.slice(0, 5);
  const completedCount = tenders.filter(t => t.status === 'closed' || t.status === 'awarded').length;
  const progress = (completedCount / Math.max(tenders.length, 1)) * 100;

  return (
    <div className="space-y-4 h-full flex flex-col font-sans">
        <Card className="p-6 rounded-[32px] bg-white border-none shadow-sm">
            <div className="flex justify-between mb-4">
                <div>
                    <h3 className="text-base font-bold text-neural">Velocity</h3>
                    <p className="text-[9px] text-gray-400 uppercase tracking-widest font-bold">Total thru-put</p>
                </div>
                <span className="text-2xl font-light text-neural">{Math.round(progress)}<span className="text-xs font-bold">%</span></span>
            </div>
            <div className="flex gap-1 h-12 bg-gray-50 rounded-2xl p-1">
                <div className="bg-aurora rounded-xl flex items-center justify-center text-[10px] font-black uppercase tracking-tighter shadow-sm" style={{ width: `${Math.max(progress, 20)}%` }}>Closed</div>
                <div className="flex-1" />
            </div>
        </Card>

        <Card className="p-5 rounded-[32px] bg-neural text-white border-none shadow-sm flex-1 flex flex-col overflow-hidden min-h-[510px]">
            <div className="flex justify-between items-center mb-6 px-1">
                <div>
                    <h3 className="text-lg font-bold text-white">Stream</h3>
                    <p className="text-[10px] text-white/30 uppercase tracking-widest font-bold">Latest Events</p>
                </div>
                <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-sm font-bold text-white border border-white/5">
                    {tenders.length}
                </div>
            </div>

            <div className="space-y-6 flex-1 overflow-y-auto pr-2 custom-scrollbar">
                {recentTenders.map(tender => (
                    <TenderItem 
                        key={tender.id}
                        icon={tender.status === 'open' ? <RiFileListLine /> : <RiBriefcaseLine />} 
                        title={tender.title}
                        subtitle={tender.status}
                        time={format(new Date(tender.createdAt), 'MMM dd')}
                        completed={tender.status === 'closed' || tender.status === 'awarded'}
                        onClick={() => onSelect(tender.id)}
                    />
                ))}
            </div>
            
            <button className="mt-6 w-full py-3 rounded-2xl bg-white/5 border border-white/10 text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-colors text-white/60">
                View Full Logs
            </button>
        </Card>
    </div>
  );
}

function TenderItem({ icon, title, subtitle, time, completed = false, onClick }: { icon: any, title: string, subtitle: string, time: string, completed?: boolean, onClick: () => void }) {
    return (
        <div className="flex items-center gap-4 group cursor-pointer" onClick={onClick}>
            <div className={`p-2 rounded-xl transition-all ${completed ? 'bg-neural-light text-gray-500' : 'bg-white text-neural group-hover:scale-110'}`}>
                {icon}
            </div>
            <div className="flex-1 min-w-0">
                <h4 className={`text-sm font-bold truncate transition-colors ${completed ? 'text-gray-500 line-through' : 'text-white group-hover:text-aurora'}`}>{title}</h4>
                <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">{subtitle}</p>
            </div>
            <div className="text-[10px] text-gray-500 font-bold">{time}</div>
            {completed ? (
                <RiCheckboxCircleLine className="text-aurora text-xl" />
            ) : (
                <div className="w-4 h-4 rounded-full border-2 border-gray-700 group-hover:border-aurora transition-colors" />
            )}
        </div>
    )
}

export function CalendarWidget({ tenders }: { tenders: Tender[] }) {
    const today = new Date();
    const currentMonth = format(today, 'MMMM yyyy');
    const upcomingDeadlines = tenders
        .filter(t => new Date(t.submissionDeadline) > today)
        .sort((a, b) => new Date(a.submissionDeadline).getTime() - new Date(b.submissionDeadline).getTime())
        .slice(0, 4);

    return (
        <Card className="p-6 rounded-[32px] bg-white border-none shadow-sm h-full flex flex-col font-sans">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h3 className="text-lg font-bold text-neural uppercase tracking-tighter">Radar</h3>
                    <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">{currentMonth}</p>
                </div>
                <div className="flex gap-2">
                    <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center text-gray-400">
                        <RiCalendarLine size={18} />
                    </div>
                </div>
            </div>

            <div className="flex-1 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {upcomingDeadlines.length > 0 ? upcomingDeadlines.map((tender, i) => (
                        <div key={tender.id} className="bg-gray-50 p-6 rounded-[28px] flex flex-col justify-between hover:bg-gray-100 transition-all cursor-pointer border border-transparent hover:border-gray-200 hover:shadow-sm">
                        <div>
                            <div className="text-[10px] font-black text-gray-400 uppercase mb-4 tracking-widest">
                                {format(new Date(tender.submissionDeadline), 'EEEE')}
                            </div>
                            <div className="text-4xl font-black text-neural mb-1 tracking-tighter">
                                {format(new Date(tender.submissionDeadline), 'dd')}
                            </div>
                            <div className="text-[10px] font-black text-aurora uppercase tracking-[0.2em]">
                                {format(new Date(tender.submissionDeadline), 'MMM')}
                            </div>
                        </div>
                        <div className="mt-8">
                            <div className="text-[10px] font-bold text-neural truncate mb-0.5 uppercase tracking-tight">{tender.title}</div>
                            <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Submission Deadline</div>
                        </div>
                    </div>
                )) : (
                    <div className="col-span-4 flex flex-col items-center justify-center text-gray-400 py-10">
                        <RiCalendarLine className="w-12 h-12 mb-2 opacity-20" />
                        <p className="font-bold text-xs uppercase tracking-[0.3em] opacity-40">No Signals Detected</p>
                    </div>
                )}
            </div>
        </Card>
    )
}

export function QuickActions({ role, onAction }: { role: string, onAction: (action: string) => void }) {
    return (
        <div className="space-y-4 font-sans">
             {role === 'admin' && (
               <Card 
                  className="p-5 rounded-[28px] bg-passion text-white border-none shadow-xl flex justify-between items-center cursor-pointer hover:bg-passion-dark transition-all hover:scale-[1.02] shadow-passion/10"
                  onClick={() => onAction('proposals')}
              >
                  <div className="flex items-center gap-4">
                      <div className="bg-white/20 p-2 rounded-xl">
                          <RiFileTextLine size={24} />
                      </div>
                      <div>
                        <span className="font-black text-lg block leading-tight uppercase tracking-tighter">Proposal Center</span>
                        <span className="text-[10px] text-white/60 font-bold uppercase tracking-widest">Manage submissions</span>
                      </div>
                  </div>
                  <RiArrowRightUpLine className="text-white/40" />
               </Card>
             )}

             <div className="space-y-3">
                 <div className="px-4 text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Navigation</div>
                 <Card 
                    className="p-4 rounded-[24px] bg-white border-none shadow-sm flex items-center gap-4 cursor-pointer hover:bg-gray-50 transition-colors"
                    onClick={() => onAction('tenders')}
                 >
                    <div className="w-10 h-10 bg-aurora/20 rounded-xl flex items-center justify-center text-aurora shadow-sm shadow-aurora/10">
                        <RiSearchLine size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-sm text-neural uppercase tracking-tight">View All Tenders</div>
                        <div className="text-[9px] text-gray-400 font-bold uppercase tracking-widest">Browse opportunities</div>
                    </div>
                    <RiMore2Fill className="ml-auto text-gray-300" />
                 </Card>
             </div>
             
             <Card 
               className="p-4 rounded-[24px] bg-white border-none shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
               onClick={() => onAction('settings')}
             >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-verdant/10 rounded-xl flex items-center justify-center text-verdant shadow-sm shadow-green-50">
                        <RiPulseLine size={20} />
                    </div>
                    <div>
                        <div className="font-bold text-sm text-neural uppercase tracking-tight">System Status</div>
                        <div className="text-[9px] text-verdant font-bold uppercase tracking-widest">Optimal Sync</div>
                    </div>
                </div>
                <div className="w-2 h-2 rounded-full bg-verdant animate-pulse"></div>
             </Card>
             
             <Card 
               className="p-4 rounded-[24px] bg-white border-none shadow-sm flex justify-between items-center cursor-pointer hover:bg-gray-50 transition-colors"
               onClick={() => onAction('config')}
             >
                <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                        <RiSettings4Line size={20} />
                    </div>
                    <div className="font-bold text-sm text-neural uppercase tracking-tight">Configuration</div>
                </div>
                <RiMore2Fill className="text-gray-300" />
             </Card>
        </div>
    )
}
