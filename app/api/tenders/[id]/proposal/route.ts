import { NextResponse } from 'next/server';
import { supabaseTenderService } from '@/lib/supabaseTenderService';

/**
 * PUT /api/tenders/[id]/proposal
 * Update proposal content in database
 */
export async function PUT(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    
    const updatedProposal = await supabaseTenderService.updateProposal(params.id, body);
    
    if (!updatedProposal) {
      return NextResponse.json({ error: 'Tender not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedProposal);
  } catch (error: any) {
    console.error('Error updating proposal:', error);
    return NextResponse.json(
      { error: 'Failed to update proposal', details: error.message },
      { status: 500 }
    );
  }
}
