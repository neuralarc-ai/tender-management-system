'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { useRouter } from 'next/navigation';
import { 
  RiDashboardLine, 
  RiTeamLine, 
  RiUserAddLine, 
  RiApps2Line, 
  RiMoneyDollarCircleLine, 
  RiSettings4Line, 
  RiNotification3Line, 
  RiLogoutBoxRLine,
  RiAddLine,
  RiCloseLine,
  RiTimeLine,
  RiCheckLine
} from 'react-icons/ri';
import { 
  WelcomeBanner, 
  ProfileCard, 
  StatusDistributionCard, 
  AIAnalysisCard, 
  RecentTendersWidget, 
  CalendarWidget, 
  QuickActions,
  ProjectProgressCard,
  PerformanceMetricsCard
} from './DashboardWidgets';
import { StatsView } from './StatsView';
import { PlansView } from './PlansView';
import { TenderListView } from './TenderListView';
import { ProposalsListView } from './ProposalsListView';
import { DocumentGenerationView } from './DocumentGenerationView';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/auth-context';
import { useSettings } from '@/contexts/settings-context';
import { Tender } from '@/types';
import { Notification } from '@/types/notifications';
import { formatDateWithTimezone, getTimezoneAbbreviation } from '@/lib/timezone';
import { NewTenderModal } from '@/components/client/NewTenderModal';
import { TenderDetail } from '@/components/admin/TenderDetail';
import { Dialog, DialogContent } from '@/components/ui/dialog';
import { format } from 'date-fns';

type ViewType = 'dashboard' | 'tenders' | 'proposals' | 'analysis' | 'calendar' | 'plans';

export function DashboardView() {
  const { authState, logout } = useAuth();
  const { settings, updateSetting, saveSettings: saveSettingsToContext } = useSettings();
  const role = authState.role || 'client';
  const router = useRouter();
  
  const [activeView, setActiveView] = useState<ViewType>('dashboard');
  const [isNewTenderModalOpen, setIsNewTenderModalOpen] = useState(false);
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [readNotifications, setReadNotifications] = useState<string[]>([]);

  // Load read notifications from localStorage on mount
  useEffect(() => {
    const readNotifs = localStorage.getItem('axisReadNotifications');
    if (readNotifs) {
      try {
        setReadNotifications(JSON.parse(readNotifs));
      } catch (e) {
        console.error('Failed to load read notifications');
      }
    }
  }, []);

  const toggleSetting = (key: keyof typeof settings) => {
    updateSetting(key, !settings[key]);
  };

  const saveSettings = async () => {
    try {
      await saveSettingsToContext();
      setShowSettings(false);
      alert('✓ Settings saved successfully!');
    } catch (error) {
      alert('✗ Failed to save settings. Please try again.');
    }
  };

  const markAsRead = async (notificationId: string) => {
    try {
      await axios.patch('/api/notifications', { notificationId }, {
        params: { role }
      });
      refetchNotifications();
    } catch (error) {
      console.error('Failed to mark notification as read:', error);
    }
  };

  const markAllAsRead = async () => {
    try {
      await axios.patch(`/api/notifications?role=${role}&action=mark-all-read`);
      refetchNotifications();
      setShowNotifications(false);
    } catch (error) {
      console.error('Failed to mark all as read:', error);
    }
  };

  const { data: tenders = [], isLoading } = useQuery({
    queryKey: ['tenders', role, authState.userId],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (role === 'client' && authState.userId) {
        params.append('userId', authState.userId);
      }
      params.append('role', role);
      const response = await axios.get(`/api/tenders?${params.toString()}`);
      return response.data as Tender[];
    },
    refetchInterval: 5000,
  });

  // Fetch notifications for current role
  const { data: notifications = [], refetch: refetchNotifications } = useQuery({
    queryKey: ['notifications', role],
    queryFn: async () => {
      const response = await axios.get(`/api/notifications?role=${role}`);
      return response.data as Notification[];
    },
    refetchInterval: 5000,
  });

  const unreadCount = notifications.filter(n => !n.readBy.includes(role)).length;

  // Tenders are already filtered by the database based on role and userId
  // No need for additional client-side filtering
  const displayTenders = tenders;

  const selectedTender = displayTenders.find(t => t.id === selectedTenderId);
  const latestTender = displayTenders[0];

  // Calculate Stats
  const stats = {
    totalTenders: displayTenders.length,
    openTenders: displayTenders.filter(t => t.status === 'open').length,
    submittedProposals: displayTenders.filter(t => t.proposal?.status === 'submitted').length,
    avgAiScore: Math.round(
      displayTenders.reduce((acc, t) => acc + (t.aiAnalysis?.overallScore || 0), 0) / (displayTenders.length || 1)
    )
  };

  const statusData = [
    { name: 'Open', value: stats.openTenders },
    { name: 'Draft', value: displayTenders.filter(t => t.proposal?.status === 'draft').length },
    { name: 'Submitted', value: stats.submittedProposals },
    { name: 'Review', value: displayTenders.filter(t => t.proposal?.status === 'under_review').length },
    { name: 'Closed', value: displayTenders.filter(t => t.status === 'closed' || t.status === 'awarded').length },
  ];

  // Notifications are now from API
  const handleAction = (action: string) => {
    if (action === 'new' && role === 'client') {
      setIsNewTenderModalOpen(true);
    } else if (action === 'tenders') {
      setActiveView('tenders');
    } else if (action === 'settings' || action === 'config') {
      setShowSettings(true);
    } else if (action === 'proposals' && role === 'admin') {
      router.push('/proposals');
    }
  };

  return (
    <div className="min-h-[calc(100vh-80px)] bg-background p-6 pb-20 font-sans text-neural selection:bg-passion/20">
      <div className="max-w-[1600px] mx-auto space-y-8">
        {/* Top Navigation */}
        <header className="flex justify-between items-center bg-transparent py-2">
          <div className="flex items-center gap-12">
            <div className="text-2xl font-black tracking-tighter rounded-full border border-gray-300 px-6 py-2 bg-white/50 backdrop-blur-sm shadow-sm">
              VECTOR<span className="text-passion">.</span>
            </div>
            
            <nav className="hidden lg:flex items-center gap-4 bg-white/50 backdrop-blur-sm px-4 py-2 rounded-full border border-gray-200/50 shadow-sm">
              <NavLink 
                icon={<RiDashboardLine />} 
                label="Home" 
                active={activeView === 'dashboard'} 
                onClick={() => {
                  setActiveView('dashboard');
                  setSelectedTenderId(null); // Close any open tender modal
                }} 
              />
              <NavLink 
                icon={<RiTeamLine />} 
                label="Tenders" 
                active={activeView === 'tenders'} 
                onClick={() => {
                  setActiveView('tenders');
                  setSelectedTenderId(null); // Close any open tender modal
                }}
              />
              {/* Commented out: AI Proposals navigation */}
              {/* {role === 'admin' && (
                <NavLink 
                  icon={<RiUserAddLine />} 
                  label="Proposals" 
                  active={false}
                  onClick={() => router.push('/proposals')}
                />
              )} */}
              {role === 'admin' && (
                <NavLink 
                  icon={<RiApps2Line />} 
                  label="Intelligence" 
                  active={activeView === 'analysis'} 
                  onClick={() => {
                    setActiveView('analysis');
                    setSelectedTenderId(null); // Close any open tender modal
                  }}
                />
              )}
            </nav>
          </div>

          <div className="flex items-center gap-4">
             <div className="relative">
                <Button 
                  variant="ghost" 
                  size="icon" 
                  onClick={() => setShowNotifications(true)}
                  className="rounded-full bg-white/50 backdrop-blur-sm border border-gray-200/50 h-12 w-12 shadow-sm hover:bg-white"
                >
                    <RiNotification3Line className="h-5 w-5" />
                </Button>
                {unreadCount > 0 && (
                  <span className="absolute top-0 right-0 w-5 h-5 bg-passion border-2 border-[#F3F2EE] rounded-full flex items-center justify-center text-white text-[9px] font-bold">
                    {unreadCount}
                  </span>
                )}
             </div>
             <Button 
                onClick={logout}
                variant="ghost" 
                size="icon" 
                className="rounded-full bg-white/80 backdrop-blur-sm border border-gray-200 h-12 w-12 text-passion hover:text-white hover:bg-passion transition-all shadow-sm"
                title="Logout"
             >
                <RiLogoutBoxRLine className="h-5 w-5" />
             </Button>
          </div>
        </header>

        {/* Content View Switcher */}
        {activeView === 'dashboard' && (
          <div className="animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Section */}
            <WelcomeBanner stats={stats} role={role} onPostTender={() => handleAction('new')} />

            {/* Dashboard Grid */}
            <div className="grid grid-cols-12 gap-6 h-[666px] mb-16">
                {/* Column 1: Profile & Actions */}
                <div className="col-span-12 lg:col-span-3 flex flex-col">
                    <div className="h-[400px] flex-shrink-0">
                        <ProfileCard 
                          role={role} 
                          activeTasks={
                            role === 'admin' 
                              ? displayTenders.filter(t => !t.proposal || t.proposal.status === 'draft').length 
                              : displayTenders.filter(t => t.status === 'open' || (t.proposal?.status === 'submitted')).length
                          } 
                        />
                    </div>
                    <div className="flex-1 mt-6 overflow-hidden">
                        <QuickActions role={role} onAction={handleAction} />
                    </div>
                </div>

                {/* Column 2: Center Content */}
                <div className="col-span-12 lg:col-span-6 flex flex-col gap-6">
                    {role === 'admin' ? (
                        <>
                            <div className="grid grid-cols-2 gap-6 flex-shrink-0">
                                <div className="h-[280px] overflow-hidden">
                                    <StatusDistributionCard data={statusData} />
                                </div>
                                <div className="h-[280px] overflow-hidden">
                                    <AIAnalysisCard score={stats.avgAiScore} />
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <CalendarWidget tenders={tenders} />
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 gap-6 flex-shrink-0">
                                <div className="h-[280px] overflow-hidden">
                                    <ProjectProgressCard tender={latestTender} />
                                </div>
                                <div className="h-[280px] overflow-hidden">
                                    <PerformanceMetricsCard 
                                        tenders={displayTenders} 
                                        role={role}
                                        onViewAll={() => setActiveView('tenders')}
                                    />
                                </div>
                            </div>
                            <div className="flex-1 overflow-hidden">
                                <CalendarWidget tenders={displayTenders} />
                            </div>
                        </>
                    )}
                </div>

                {/* Column 3: Right Sidebar */}
                <div className="col-span-12 lg:col-span-3">
                    <RecentTendersWidget tenders={displayTenders} onSelect={setSelectedTenderId} />
                </div>
            </div>
          </div>
        )}

        {/* Other Views */}
        {activeView === 'tenders' && (
           <TenderListView 
             tenders={displayTenders} 
             role={role} 
             onSelect={setSelectedTenderId}
             viewType="tenders"
             onAddTender={() => setIsNewTenderModalOpen(true)}
           />
        )}
        
        {activeView === 'proposals' && (
           <ProposalsListView
             tenders={role === 'admin' 
               ? displayTenders.filter(t => 
                   // Admin: Show tenders with active proposal work
                   (t.aiAnalysis?.status === 'completed' && t.proposal?.status === 'draft') || // Ready to submit
                   t.proposal?.status === 'submitted' || // Awaiting client
                   t.proposal?.status === 'accepted' || // Won
                   t.proposal?.status === 'rejected' // Lost
                 )
               : displayTenders.filter(t =>
                   // Partner: Show only tenders where they received a proposal
                   t.proposal?.status === 'submitted' ||
                   t.proposal?.status === 'accepted' ||
                   t.proposal?.status === 'rejected'
                 )
             } 
             role={role} 
             onSelect={setSelectedTenderId}
           />
        )}

        {activeView === 'analysis' && (
           <DocumentGenerationView tenders={displayTenders} />
        )}

        {activeView === 'plans' && (
           <PlansView />
        )}

      </div>

      {/* Modals */}
      <NewTenderModal 
        isOpen={isNewTenderModalOpen} 
        onClose={() => setIsNewTenderModalOpen(false)} 
      />

      {/* Notifications Panel */}
      <Dialog open={showNotifications} onOpenChange={setShowNotifications}>
        <DialogContent hideCloseButton className="max-w-md max-h-[80vh] overflow-y-auto rounded-[32px] border-none p-0 bg-white shadow-2xl">
          <div className="p-6">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-100">
              <div>
                <h2 className="text-2xl font-black uppercase tracking-tight text-neural">Activity</h2>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">Recent Updates</p>
              </div>
              <button 
                onClick={() => setShowNotifications(false)}
                className="bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <RiCloseLine size={20} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-3">
              {notifications.length > 0 ? (
                notifications.map((notification) => {
                  const isUnread = !notification.readBy.includes(role);
                  const roleTimezone = role as 'admin' | 'client';
                  
                  return (
                    <div 
                      key={notification.id} 
                      className={`p-4 rounded-2xl transition-all cursor-pointer border ${
                        isUnread 
                          ? 'bg-passion-light/10 border-passion/20 hover:bg-passion-light/30' 
                          : 'bg-gray-50 border-gray-100 hover:bg-gray-100'
                      }`}
                      onClick={async () => {
                        await markAsRead(notification.id);
                        setSelectedTenderId(notification.tenderId);
                        setShowNotifications(false);
                      }}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
                          isUnread ? 'bg-passion' : 'bg-gray-300'
                        }`}>
                          <RiTimeLine className="text-white" size={18} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2 mb-1">
                            <h3 className="font-bold text-sm text-neural">{notification.title}</h3>
                            {isUnread && (
                              <div className="w-2 h-2 bg-passion rounded-full flex-shrink-0 mt-1 animate-pulse"></div>
                            )}
                          </div>
                          <p className="text-xs text-gray-600 font-medium mb-2 leading-relaxed">
                            {notification.message}
                          </p>
                          <div className="flex items-center gap-2">
                            <p className="text-[9px] text-gray-400 font-bold uppercase tracking-wider">
                              {formatDateWithTimezone(notification.createdAt, roleTimezone, 'MMM dd, yyyy • hh:mm a')}
                            </p>
                            <span className="text-[8px] text-gray-400 font-bold uppercase tracking-widest">
                              {getTimezoneAbbreviation(roleTimezone)}
                            </span>
                          </div>
                        </div>
                        <div className={`px-2.5 py-1 rounded-full text-[8px] font-bold uppercase tracking-wider flex-shrink-0 ${
                          notification.type === 'tender_created' 
                            ? 'bg-drift/20 text-passion-dark' 
                            : notification.type === 'proposal_submitted'
                            ? 'bg-verdant/20 text-verdant-dark'
                            : notification.type === 'proposal_accepted'
                            ? 'bg-emerald-100 text-emerald-700'
                            : 'bg-passion-light/30 text-passion-dark'
                        }`}>
                          {notification.type.split('_').join(' ')}
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="py-16 text-center">
                  <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <RiCheckLine className="w-10 h-10 text-gray-300" />
                  </div>
                  <p className="text-sm font-bold text-gray-400 uppercase tracking-wider">All Caught Up</p>
                  <p className="text-[10px] text-gray-300 uppercase tracking-widest mt-2">No new notifications</p>
                </div>
              )}
            </div>

            {notifications.length > 0 && (
              <div className="mt-6 pt-4 border-t border-gray-100">
                <button 
                  className="w-full py-3 text-[10px] font-black uppercase tracking-widest text-gray-400 hover:text-neural transition-colors bg-gray-50 rounded-2xl hover:bg-gray-100"
                  onClick={markAllAsRead}
                >
                  Mark All As Read
                </button>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Settings Panel */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent hideCloseButton className="max-w-2xl max-h-[85vh] overflow-y-auto rounded-[32px] border-none p-0 bg-white shadow-2xl">
          <div className="p-8">
            <div className="flex justify-between items-center mb-8 pb-6 border-b border-gray-100">
              <div>
                <h2 className="text-3xl font-black uppercase tracking-tight text-neural">System Status</h2>
                <p className="text-[10px] uppercase tracking-widest text-gray-400 font-bold mt-1">Application Information</p>
              </div>
              <button 
                onClick={() => setShowSettings(false)}
                className="bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition-colors"
              >
                <RiCloseLine size={24} className="text-gray-600" />
              </button>
            </div>

            <div className="space-y-6">
              {/* System Section */}
              <div className="bg-gray-50 rounded-3xl p-6 border border-gray-100">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-400 mb-5 flex items-center gap-2">
                  <div className="w-6 h-6 bg-verdant/20 rounded-lg flex items-center justify-center">
                    <span className="text-verdant font-black text-xs">✓</span>
                  </div>
                  System Information
                </h3>
                <div className="space-y-4">
                  <SettingRow label="Version" value="v1.0.0" />
                  <SettingRow label="Session Started" value={format(new Date(), 'hh:mm a')} />
                  <SettingRow label="Local Storage" value="Available" badge="green" />
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-4 pt-4">
                <Button 
                  variant="ghost" 
                  onClick={() => setShowSettings(false)}
                  className="flex-1 rounded-full h-12 font-black text-[11px] uppercase tracking-wider border-2 border-gray-200 hover:bg-gray-100"
                >
                  Close
                </Button>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Tender Detail Modal */}
      <Dialog open={!!selectedTenderId} onOpenChange={(open) => !open && setSelectedTenderId(null)}>
        <DialogContent hideCloseButton className="max-w-4xl max-h-[90vh] overflow-y-auto rounded-[40px] border-none p-0 bg-white shadow-2xl">
          {selectedTender && (
             <div className="p-8 relative">
                <button 
                  onClick={() => setSelectedTenderId(null)}
                  className="absolute top-6 right-6 bg-gray-100 p-2.5 rounded-xl hover:bg-gray-200 transition-colors z-10"
                >
                  <RiCloseLine size={20} className="text-gray-600" />
                </button>
                <TenderDetail 
                  tender={selectedTender} 
                  role={role} 
                  currentUserId={role === 'admin' ? '22222222-2222-2222-2222-222222222222' : '11111111-1111-1111-1111-111111111111'}
                />
             </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

function NavLink({ icon, label, active = false, onClick }: { icon: any, label: string, active?: boolean, onClick: () => void }) {
    return (
        <button 
            onClick={onClick}
            className={`flex items-center gap-2 text-[10px] font-black uppercase tracking-widest transition-all px-6 py-2 rounded-full ${
                active 
                ? 'text-white bg-neural shadow-lg scale-105' 
                : 'text-gray-400 hover:text-neural hover:bg-gray-100'
            }`}
        >
            {icon}
            {label}
        </button>
    )
}

function SettingRow({ label, value, badge }: { label: string, value: string, badge?: string }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm font-bold text-gray-600 uppercase tracking-tight">{label}</span>
      <div className="flex items-center gap-2">
        <span className="text-sm font-black text-neural">{value}</span>
        {badge === 'green' && (
          <div className="w-2 h-2 bg-verdant rounded-full animate-pulse"></div>
        )}
      </div>
    </div>
  );
}

function SettingToggle({ label, enabled, onToggle }: { label: string, enabled: boolean, onToggle: () => void }) {
  return (
    <div className="flex justify-between items-center py-2">
      <span className="text-sm font-bold text-gray-600 uppercase tracking-tight">{label}</span>
      <button 
        onClick={onToggle}
        className={`relative w-14 h-7 rounded-full transition-all duration-300 ${
          enabled ? 'bg-verdant shadow-lg shadow-verdant/20' : 'bg-gray-300'
        }`}
      >
        <div className={`absolute top-0.5 w-6 h-6 bg-white rounded-full shadow-md transition-all duration-300 ${
          enabled ? 'translate-x-7' : 'translate-x-0.5'
        }`} />
      </button>
    </div>
  );
}
