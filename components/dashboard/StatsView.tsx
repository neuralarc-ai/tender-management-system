'use client';

import { Card } from '@/components/ui/card';
import { Tender } from '@/types';
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from 'recharts';
import { RiArrowRightUpLine } from 'react-icons/ri';

export function StatsView({ tenders }: { tenders: Tender[] }) {
    // Calculate stats
    const openCount = tenders.filter(t => t.status === 'open').length;
    const closedCount = tenders.filter(t => t.status === 'closed').length;
    const awardedCount = tenders.filter(t => t.status === 'awarded').length;
    
    const chartData = [
        { name: 'Open', value: openCount, color: '#E8C4A8' }, // Muted peachy beige
        { name: 'Closed', value: closedCount, color: '#3D4A4A' }, // Muted dark teal
        { name: 'Awarded', value: awardedCount, color: '#A599C4' }, // Muted lavender
    ];

    return (
        <div className="space-y-6 animate-in fade-in duration-300">
            <div>
               <h2 className="text-3xl font-bold text-neural">Analysis & Reports</h2>
               <p className="text-gray-500">System-wide performance metrics</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 h-[400px]">
                {/* Stats Grid Card */}
                <Card className="p-8 rounded-[32px] border-none shadow-sm bg-neural text-white flex flex-col">
                    <div className="flex justify-between items-start mb-8">
                        <div>
                            <h3 className="text-xl font-medium">Activity Report</h3>
                            <div className="flex items-baseline gap-2 mt-2">
                                <span className="text-4xl font-light">{tenders.length}</span>
                                <span className="text-sm text-gray-400">Total Records</span>
                            </div>
                        </div>
                        <button className="p-2 bg-white/10 rounded-full hover:bg-white/20 transition-colors">
                            <RiArrowRightUpLine />
                        </button>
                    </div>

                    {/* Dot Grid Visualization */}
                    <div className="flex-1 grid grid-cols-10 gap-2 content-center opacity-80">
                        {Array.from({ length: 40 }).map((_, i) => (
                            <div 
                                key={i} 
                                className={`w-2 h-2 rounded-full ${i < (openCount * 2) ? 'bg-aurora' : 'bg-gray-600'}`}
                            />
                        ))}
                    </div>

                    <div className="mt-8 flex gap-8">
                        <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-aurora" />
                            <span className="text-sm text-gray-400">Active</span>
                        </div>
                         <div className="flex items-center gap-2">
                            <div className="w-2 h-2 rounded-full bg-gray-600" />
                            <span className="text-sm text-gray-400">Inactive</span>
                        </div>
                    </div>
                </Card>

                {/* Donut Chart Card */}
                <Card className="p-8 rounded-[32px] border-none shadow-sm bg-white flex flex-col">
                    <div className="flex justify-between items-start mb-4">
                        <h3 className="text-xl font-medium">Tender Composition</h3>
                        <button className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                            <RiArrowRightUpLine />
                        </button>
                    </div>

                    <div className="flex-1 relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={chartData}
                                    innerRadius={80}
                                    outerRadius={120}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        {/* Center Text */}
                        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                            <span className="text-4xl font-bold text-neural">{tenders.length}</span>
                            <span className="text-sm text-gray-500">Total</span>
                        </div>
                    </div>

                    <div className="mt-4 flex justify-center gap-6">
                         {chartData.map((entry) => (
                            <div key={entry.name} className="flex items-center gap-2">
                                <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
                                <span className="text-sm text-gray-600">{entry.name}</span>
                            </div>
                        ))}
                    </div>
                </Card>
            </div>
        </div>
    );
}


