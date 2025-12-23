'use client';

import {
  BarChart,
  Bar,
  XAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
  RadialBarChart,
  RadialBar,
  PolarAngleAxis,
} from 'recharts';

export function SimpleBarChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data) return null;
  return (
    <div className="h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart data={data} barSize={24}>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F3F4F6" />
          <XAxis 
            dataKey="name" 
            axisLine={false} 
            tickLine={false} 
            tick={{ fill: '#9CA3AF', fontSize: 10, fontWeight: 700 }} 
            dy={10}
            interval={0}
          />
          <Tooltip 
            cursor={{ fill: '#F9FAFB' }}
            contentStyle={{ 
                borderRadius: '16px', 
                border: 'none', 
                boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)',
                fontSize: '12px',
                fontWeight: '700'
            }}
          />
          <Bar dataKey="value" radius={[6, 6, 6, 6]}>
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.value > 0 ? '#4A6A6A' : '#E8DDD1'} 
              />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}

export function ScoreRadialChart({ score, label }: { score: number, label: string }) {
  const data = [
    { name: 'Score', value: score, fill: '#88B5B8' },
  ];

  return (
    <div className="h-full w-full relative">
      <ResponsiveContainer width="100%" height="100%">
        <RadialBarChart 
          innerRadius="65%" 
          outerRadius="95%" 
          barSize={10} 
          data={data} 
          startAngle={90} 
          endAngle={-270}
        >
          <PolarAngleAxis
            type="number"
            domain={[0, 100]}
            angleAxisId={0}
            tick={false}
          />
          <RadialBar
            background={{ fill: 'rgba(255, 255, 255, 0.05)' }}
            dataKey="value"
            cornerRadius={10}
          />
        </RadialBarChart>
      </ResponsiveContainer>
      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none px-4">
        <span className="text-3xl font-black text-white mb-1">{score}%</span>
        <div className="text-[8px] font-bold text-amber-300 uppercase tracking-[0.15em] text-center leading-[1.3]">
          {label.split(' ').map((word, i) => (
            <div key={i}>{word}</div>
          ))}
        </div>
      </div>
    </div>
  );
}
