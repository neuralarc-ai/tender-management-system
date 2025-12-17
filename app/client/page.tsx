'use client';

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { RiBuilding2Line, RiAddLine, RiFolderOpenLine, RiArchiveLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { NewTenderModal } from '@/components/client/NewTenderModal';
import { ReviewModal } from '@/components/client/ReviewModal';
import { TenderList } from '@/components/client/TenderList';
import { Tender } from '@/types';

export default function ClientPortal() {
  const [activeTab, setActiveTab] = useState<'active' | 'all'>('active');
  const [isNewTenderModalOpen, setIsNewTenderModalOpen] = useState(false);
  const [reviewTenderId, setReviewTenderId] = useState<string | null>(null);

  const { data: tenders = [], isLoading } = useQuery({
    queryKey: ['tenders'],
    queryFn: async () => {
      const response = await axios.get('/api/tenders');
      return response.data as Tender[];
    },
    refetchInterval: 2000, // Poll every 2 seconds for real-time sync
  });

  const activeTenders = tenders.filter(t => t.status === 'open');
  const displayTenders = activeTab === 'active' ? activeTenders : tenders;

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-500 to-purple-600 p-6 font-sans">
      <div className="max-w-6xl mx-auto space-y-8">
        {/* Header */}
        <div className="bg-white rounded-2xl p-8 shadow-xl flex flex-col md:flex-row justify-between items-center gap-4">
          <h1 className="text-3xl font-bold text-indigo-600 flex items-center gap-3">
            <RiBuilding2Line />
            TCS/DCS Client Portal
          </h1>
          <Button 
            onClick={() => setIsNewTenderModalOpen(true)} 
            className="bg-indigo-600 hover:bg-indigo-700 text-white shadow-lg shadow-indigo-200"
            size="lg"
          >
            <RiAddLine className="mr-2 h-5 w-5" />
            Submit New Tender
          </Button>
        </div>

        {/* Content */}
        <div className="bg-white rounded-2xl p-8 shadow-xl min-h-[600px]">
          {/* Tabs */}
          <div className="flex gap-6 border-b mb-8">
            <button
              onClick={() => setActiveTab('active')}
              className={`pb-4 px-2 text-lg font-semibold flex items-center gap-2 transition-colors relative ${
                activeTab === 'active' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <RiFolderOpenLine />
              Active Tenders
              {activeTab === 'active' && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('all')}
              className={`pb-4 px-2 text-lg font-semibold flex items-center gap-2 transition-colors relative ${
                activeTab === 'all' ? 'text-indigo-600' : 'text-gray-400 hover:text-gray-600'
              }`}
            >
              <RiArchiveLine />
              All Tenders
              {activeTab === 'all' && (
                <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-600 rounded-t-full" />
              )}
            </button>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
          ) : (
            <TenderList tenders={displayTenders} onReview={setReviewTenderId} />
          )}
        </div>
      </div>

      <NewTenderModal 
        isOpen={isNewTenderModalOpen} 
        onClose={() => setIsNewTenderModalOpen(false)} 
      />
      
      <ReviewModal 
        isOpen={!!reviewTenderId} 
        onClose={() => setReviewTenderId(null)} 
        tenderId={reviewTenderId}
      />
    </div>
  );
}

