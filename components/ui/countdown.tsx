'use client';

import { useState, useEffect } from 'react';
import { differenceInSeconds } from 'date-fns';

export function Countdown({ targetDate }: { targetDate: string }) {
  const [timeLeft, setTimeLeft] = useState('');
  const [isUrgent, setIsUrgent] = useState(false);

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = differenceInSeconds(new Date(targetDate), new Date());
      
      if (difference <= 0) {
        setTimeLeft('EXPIRED');
        setIsUrgent(true);
        return;
      }

      const days = Math.floor(difference / (3600 * 24));
      const hours = Math.floor((difference % (3600 * 24)) / 3600);
      const minutes = Math.floor((difference % 3600) / 60);
      const seconds = difference % 60;

      // Format with leading zeros
      const pad = (n: number) => n.toString().padStart(2, '0');

      if (days > 0) {
        setTimeLeft(`${days}d ${pad(hours)}h`);
        setIsUrgent(days < 2);
      } else {
        setTimeLeft(`${pad(hours)}:${pad(minutes)}:${pad(seconds)}`);
        setIsUrgent(true);
      }
    };

    calculateTimeLeft();
    const timer = setInterval(calculateTimeLeft, 1000);

    return () => clearInterval(timer);
  }, [targetDate]);

  return (
    <div className={`font-mono text-xs font-black tracking-tight uppercase ${
      isUrgent 
        ? 'text-red-600 animate-pulse bg-red-50 px-2 py-1 rounded-full' 
        : 'text-gray-600'
    }`}>
      {timeLeft}
    </div>
  );
}
