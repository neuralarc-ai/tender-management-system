import { NextResponse } from 'next/server';
import { supabaseTenderService } from '@/lib/supabaseTenderService';

/**
 * POST /api/tenders/[id]/proposal/submit
 * Submit proposal to client (updates status and creates notification)
 */
export async function POST(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const updatedProposal = await supabaseTenderService.submitProposal(params.id);
    
    if (!updatedProposal) {
      return NextResponse.json({ error: 'Tender not found' }, { status: 404 });
    }
    
    return NextResponse.json(updatedProposal);
  } catch (error: any) {
    console.error('Error submitting proposal:', error);
    return NextResponse.json(
      { error: 'Failed to submit proposal', details: error.message },
      { status: 500 }
    );
  }
}
