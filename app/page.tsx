'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function Page() {
  const router = useRouter();

  useEffect(() => {
    // Redirect to PIN authentication page
    router.push('/auth/pin');
  }, [router]);

  return <div className="min-h-screen bg-black"></div>;
}
