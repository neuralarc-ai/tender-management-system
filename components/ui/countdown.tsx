'use client';

import { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';
import { RiTimerLine, RiAlertLine } from 'react-icons/ri';

interface TimeSegment {
  value: number;
  label: string;
}

export function Countdown({ targetDate }: { targetDate: string }) {
  const [timeSegments, setTimeSegments] = useState<TimeSegment[]>([]);
  const [isExpired, setIsExpired] = useState(false);
  const [isUrgent, setIsUrgent] = useState(false);
  const [isCritical, setIsCritical] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = differenceInSeconds(new Date(targetDate), new Date());
      
      if (difference <= 0) {
        setIsExpired(true);
        setTimeSegments([]);
        return;
      }

      const days = Math.floor(difference / (3600 * 24));
      const hours = Math.floor((difference % (3600 * 24)) / 3600);
      const minutes = Math.floor((difference % 3600) / 60);
      const seconds = difference % 60;

      const segments: TimeSegment[] = [];
      
      if (days > 0) {
        segments.push({ value: days, label: 'D' });
        segments.push({ value: hours, label: 'H' });
        segments.push({ value: minutes, label: 'M' });
        setIsCritical(false);
        setIsUrgent(days < 2);
      } else if (hours > 0) {
        segments.push({ value: hours, label: 'H' });
        segments.push({ value: minutes, label: 'M' });
        segments.push({ value: seconds, label: 'S' });
        setIsCritical(hours < 2);
        setIsUrgent(true);
      } else {
        segments.push({ value: minutes, label: 'M' });
        segments.push({ value: seconds, label: 'S' });
        setIsCritical(true);
        setIsUrgent(true);
      }

      setTimeSegments(segments);
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  if (isExpired) {
    return (
      <div className="inline-flex items-center gap-2 px-3 py-2 rounded-xl bg-passion/10 border border-passion/30">
        <RiAlertLine className="text-passion animate-pulse" size={16} />
        <span className="font-mono text-xs font-black text-passion uppercase tracking-wider">
          EXPIRED
        </span>
      </div>
    );
  }

  return (
    <div className={`inline-flex items-center gap-2 px-3 py-2 rounded-xl transition-all ${
      isCritical
        ? 'bg-passion text-white shadow-lg shadow-passion/30 animate-pulse'
        : isUrgent
        ? 'bg-solar/20 text-solar-dark border border-solar/40'
        : 'bg-verdant/10 text-verdant-dark border border-verdant/20'
    }`}>
      <RiTimerLine 
        className={isCritical ? 'animate-spin' : ''} 
        size={14} 
      />
      <div className="flex items-center gap-1.5">
        {timeSegments.map((segment, index) => (
          <div key={index} className="flex items-baseline gap-0.5">
            <span className="font-mono text-sm font-black tabular-nums">
              {segment.value.toString().padStart(2, '0')}
            </span>
            <span className="font-mono text-[9px] font-bold opacity-70">
              {segment.label}
            </span>
            {index < timeSegments.length - 1 && (
              <span className="mx-0.5 opacity-50">:</span>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
