'use client';

import { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import axios from 'axios';
import { RiBrainLine, RiShieldCheckLine, RiInboxArchiveLine } from 'react-icons/ri';
import { TenderSidebar } from '@/components/admin/TenderSidebar';
import { TenderDetail } from '@/components/admin/TenderDetail';
import { Tender } from '@/types';

export default function AdminPortal() {
  const [selectedTenderId, setSelectedTenderId] = useState<string | null>(null);

  const { data: tenders = [], isLoading } = useQuery({
    queryKey: ['tenders'],
    queryFn: async () => {
      const response = await axios.get('/api/tenders');
      return response.data as Tender[];
    },
    refetchInterval: 2000,
  });

  // Auto-select first tender
  useEffect(() => {
    if (tenders.length > 0 && !selectedTenderId) {
      setSelectedTenderId(tenders[0].id);
    }
  }, [tenders, selectedTenderId]);

  const selectedTender = tenders.find(t => t.id === selectedTenderId);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 to-slate-900 p-6 font-sans">
      <div className="max-w-[1800px] mx-auto space-y-6">
        {/* Header */}
        <div className="bg-white rounded-2xl p-6 shadow-xl flex justify-between items-center">
          <h1 className="text-2xl font-bold text-blue-900 flex items-center gap-3">
            <RiBrainLine className="text-blue-600" />
            Neural Arc Inc - Admin Portal
          </h1>
          <div className="flex items-center gap-2 bg-blue-100 text-blue-800 px-4 py-2 rounded-lg font-semibold text-sm">
            <RiShieldCheckLine />
            Tender Applicant
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-[400px_1fr] gap-6 h-[calc(100vh-140px)]">
          {/* Sidebar */}
          <div className="bg-white rounded-2xl shadow-xl p-6 overflow-y-auto">
            <h2 className="text-lg font-bold text-gray-900 mb-6 flex items-center gap-2">
              <RiInboxArchiveLine className="text-blue-600" />
              Available Tenders
            </h2>
            {isLoading ? (
              <div className="flex justify-center py-10">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <TenderSidebar 
                tenders={tenders} 
                selectedId={selectedTenderId} 
                onSelect={setSelectedTenderId} 
              />
            )}
          </div>

          {/* Main Content */}
          <div className="bg-white rounded-2xl shadow-xl p-8 overflow-y-auto">
            {selectedTender ? (
              <TenderDetail tender={selectedTender} />
            ) : (
              <div className="h-full flex flex-col items-center justify-center text-gray-400">
                <RiInboxArchiveLine className="w-24 h-24 mb-4 opacity-20" />
                <p>Select a tender to view details</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

