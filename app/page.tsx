'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to PIN authentication page
    router.push('/auth/pin');
  }, [router]);

  return (
    <div className="min-h-full bg-gradient-to-br from-drift via-neural to-quantum flex items-center justify-center">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-drift/30 border-t-drift rounded-full animate-spin"></div>
        <p className="text-drift/70 text-sm font-mono tracking-wider animate-pulse">INITIALIZING SYSTEM...</p>
      </div>
    </div>
  );
}
