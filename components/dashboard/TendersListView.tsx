'use client';

import { useState } from 'react';
import { Tender } from '@/types';
import { 
  RiSearchLine, 
  RiAddLine, 
  RiDownloadLine, 
  RiFilter3Line, 
  RiArrowDownSLine,
  RiBuildingLine,
  RiMapPinLine,
  RiMoneyDollarCircleLine,
  RiCalendarLine,
  RiCheckboxBlankCircleLine,
  RiCheckboxCircleLine
} from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { format } from 'date-fns';

export function TendersListView({ tenders, onSelect }: { tenders: Tender[], onSelect: (id: string) => void }) {
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set());

  const toggleSelection = (id: string) => {
    const newSelected = new Set(selectedIds);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedIds(newSelected);
  };

  const toggleAll = () => {
    if (selectedIds.size === tenders.length) {
      setSelectedIds(new Set());
    } else {
      setSelectedIds(new Set(tenders.map(t => t.id)));
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-300">
      
      {/* Header Stats Area */}
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-6">Tenders</h2>
        
        <div className="flex gap-4 items-center mb-8">
            {/* Custom Progress Bar / Stats Pill */}
            <div className="bg-white rounded-full p-1 pr-6 flex items-center gap-4 shadow-sm border border-gray-100">
                <div className="flex items-center">
                    <div className="bg-[#1F2937] text-white px-6 py-3 rounded-full text-sm font-medium">
                        Open
                    </div>
                    <div className="bg-[#FCD34D] text-gray-900 px-6 py-3 rounded-r-full -ml-4 z-0 pl-8 text-sm font-medium">
                        Analyzed
                    </div>
                </div>
                <div className="flex flex-col gap-1 w-32">
                    <div className="flex justify-between text-[10px] text-gray-400 uppercase font-semibold">
                        <span>Project Time</span>
                        <span>Output</span>
                    </div>
                    <div className="flex gap-1 h-2">
                        <div className="w-1/3 bg-gray-200 rounded-full overflow-hidden relative">
                             <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNCIgaGVpZ2h0PSI0IiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciPjxwYXRoIGQ9Ik0xIDNMMyAxIiBzdHJva2U9IiNjY2MiIHN0cm9rZS13aWR0aD0iMSIvPjwvc3ZnPg==')] opacity-50"></div>
                        </div>
                        <div className="w-1/4 bg-gray-200 rounded-full border border-gray-300"></div>
                    </div>
                </div>
            </div>

            <div className="ml-auto flex gap-3">
                <Button variant="outline" className="rounded-full border-gray-200 bg-white">
                    Directory <RiArrowDownSLine className="ml-2" />
                </Button>
                <Button variant="outline" className="rounded-full border-gray-200 bg-white">
                    Insights <RiArrowDownSLine className="ml-2" />
                </Button>
            </div>
        </div>
      </div>

      {/* Main Table Card */}
      <Card className="bg-[#FDFDFD] rounded-[40px] p-2 shadow-sm border-none">
        <div className="bg-white rounded-[32px] p-6 min-h-[600px]">
            
            {/* Toolbar */}
            <div className="flex flex-wrap justify-between items-center gap-4 mb-8">
                <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
                    <FilterPill label="Columns" />
                    <FilterPill label="Category" />
                    <FilterPill label="Location" />
                    <FilterPill label="Status" />
                    <FilterPill label="Budget" />
                </div>

                <div className="flex items-center gap-3 ml-auto">
                    <div className="relative">
                        <RiSearchLine className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                        <input 
                            type="text" 
                            placeholder="Search..." 
                            className="pl-10 pr-4 py-2.5 rounded-full border border-gray-200 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-900 w-64 text-sm"
                        />
                    </div>
                    <Button size="icon" className="rounded-full bg-[#FCD34D] text-gray-900 hover:bg-[#fbbf24] w-10 h-10 shadow-sm">
                        <RiAddLine size={20} />
                    </Button>
                    <Button size="icon" variant="outline" className="rounded-full border-gray-200 w-10 h-10">
                        <RiFilter3Line size={18} />
                    </Button>
                    <Button variant="outline" className="rounded-full border-gray-200 gap-2">
                        <RiDownloadLine /> Export
                    </Button>
                </div>
            </div>

            {/* Table */}
            <div className="w-full overflow-x-auto">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="text-gray-400 text-xs uppercase tracking-wider border-b border-gray-100 border-dashed">
                            <th className="pb-4 pl-4 w-12">
                                <div 
                                    className={`w-5 h-5 rounded-[6px] border-2 cursor-pointer flex items-center justify-center transition-colors ${selectedIds.size === tenders.length && tenders.length > 0 ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}
                                    onClick={toggleAll}
                                >
                                    {selectedIds.size === tenders.length && tenders.length > 0 && <RiCheckboxBlankCircleLine className="text-white w-3 h-3" />}
                                </div>
                            </th>
                            <th className="pb-4 font-medium">Name</th>
                            <th className="pb-4 font-medium">Client</th>
                            <th className="pb-4 font-medium">Category</th>
                            <th className="pb-4 font-medium">Location</th>
                            <th className="pb-4 font-medium">Budget</th>
                            <th className="pb-4 font-medium">Deadline</th>
                            <th className="pb-4 font-medium">Status</th>
                        </tr>
                    </thead>
                    <tbody className="text-sm">
                        <tr className="h-4"></tr> {/* Spacer */}
                        {tenders.map((tender) => {
                            const isSelected = selectedIds.has(tender.id);
                            return (
                                <tr 
                                    key={tender.id} 
                                    className={`
                                        group transition-all duration-200 cursor-pointer
                                        ${isSelected ? 'bg-[#FCD34D] shadow-sm' : 'hover:bg-gray-50'}
                                    `}
                                    style={{ borderRadius: '16px' }}
                                    onClick={() => onSelect(tender.id)}
                                >
                                    {/* Need to use separate td styles to simulate rounded row because tr border-radius doesn't work well in standard tables without collapse separate */}
                                    <td className={`py-4 pl-4 rounded-l-2xl ${isSelected ? '' : ''}`}>
                                        <div 
                                            className={`w-5 h-5 rounded-[6px] border-2 cursor-pointer flex items-center justify-center transition-colors ${isSelected ? 'bg-gray-900 border-gray-900' : 'border-gray-300'}`}
                                            onClick={(e) => { e.stopPropagation(); toggleSelection(tender.id); }}
                                        >
                                            {isSelected && <RiCheckboxBlankCircleLine className="text-white w-3 h-3" />}
                                        </div>
                                    </td>
                                    
                                    <td className="py-4 font-medium text-gray-900">
                                        <div className="flex items-center gap-3">
                                            {/* Avatar Placeholder */}
                                            <div className="w-8 h-8 rounded-full bg-gray-200 flex items-center justify-center text-xs font-bold text-gray-500">
                                                {tender.title.substring(0, 2).toUpperCase()}
                                            </div>
                                            <span className="line-clamp-1 max-w-[200px]">{tender.title}</span>
                                        </div>
                                    </td>
                                    
                                    <td className="py-4 text-gray-600">
                                        {tender.createdBy === 'client' || tender.createdBy === 'dcs' ? 'DCS Corp' : 'External'}
                                    </td>
                                    
                                    <td className="py-4 text-gray-600">
                                        Technology
                                    </td>
                                    
                                    <td className="py-4 text-gray-600">
                                        <div className="flex items-center gap-1">
                                            <div className="w-4 h-3 rounded-[2px] bg-blue-100 overflow-hidden relative">
                                                <div className="absolute top-0 bottom-0 left-0 w-1.5 bg-blue-500"></div>
                                            </div>
                                            Remote
                                        </div>
                                    </td>
                                    
                                    <td className="py-4 text-gray-900 font-medium">
                                        $120,000
                                    </td>
                                    
                                    <td className="py-4 text-gray-600">
                                        {format(new Date(tender.submissionDeadline), 'MMM dd, yyyy')}
                                    </td>
                                    
                                    <td className={`py-4 rounded-r-2xl ${isSelected ? '' : ''}`}>
                                        <div className="flex items-center gap-1.5">
                                            <div className={`w-2 h-2 rounded-full ${tender.status === 'open' ? 'bg-green-500' : 'bg-gray-400'}`}></div>
                                            <span className="text-gray-600 capitalize">{tender.status}</span>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                
                {/* Spacer between rows effect hack */}
                <style jsx>{`
                    tbody tr {
                        border-bottom: 8px solid transparent;
                    }
                `}</style>
            </div>
        </div>
      </Card>
    </div>
  );
}

function FilterPill({ label }: { label: string }) {
    return (
        <button className="px-4 py-2 rounded-full bg-white border border-gray-200 text-sm font-medium text-gray-600 flex items-center gap-2 hover:bg-gray-50 whitespace-nowrap">
            {label} <RiArrowDownSLine className="text-gray-400" />
        </button>
    )
}

