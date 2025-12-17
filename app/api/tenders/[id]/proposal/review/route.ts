import { NextResponse } from 'next/server';
import { tenderService } from '@/lib/tenderService';

export async function PUT(request: Request, { params }: { params: { id: string } }) {
  try {
    const body = await request.json();
    const { status, feedback } = body;
    
    if (status !== 'accepted' && status !== 'rejected') {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    const updatedTender = tenderService.reviewProposal(params.id, status, feedback);
    
    if (!updatedTender) {
      return NextResponse.json({ error: 'Tender not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedTender);
  } catch (error) {
    return NextResponse.json({ error: 'Failed to review proposal' }, { status: 500 });
  }
}

