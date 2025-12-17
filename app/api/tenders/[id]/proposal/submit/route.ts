import { NextResponse } from 'next/server';
import { tenderService } from '@/lib/tenderService';

export async function POST(request: Request, { params }: { params: { id: string } }) {
  const updatedTender = tenderService.submitProposal(params.id);
  
  if (!updatedTender) {
    return NextResponse.json({ error: 'Tender not found' }, { status: 404 });
  }
  
  return NextResponse.json(updatedTender);
}

