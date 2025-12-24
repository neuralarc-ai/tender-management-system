'use client';

import { usePathname } from 'next/navigation';
import { Footer } from "@/components/ui/footer";

export function ConditionalFooter(): JSX.Element {
  const pathname = usePathname();
  
  // Hide footer on PIN auth page (has its own custom liquid glass footer)
  if (pathname === '/auth/pin') {
    return <></>;
  }
  
  // Use light variant on all other pages
  return <Footer variant="light" />;
}

