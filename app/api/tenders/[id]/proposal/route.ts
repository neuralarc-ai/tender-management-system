import { NextResponse } from 'next/server';
import { tenderService } from '@/lib/tenderService';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const updatedTender = tenderService.updateProposal(params.id, body);
    
    if (!updatedTender) {
      return NextResponse.json({ error: 'Tender not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedTender);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to update proposal' }, { status: 500 });
  }
}

