import { NextResponse } from 'next/server';
import { supabaseTenderService } from '@/lib/supabaseTenderService';

/**
 * POST /api/tenders/[id]/proposal/review
 * Client reviews proposal (accept/reject)
 * Creates notification for admin
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { status, feedback } = body;
    
    if (!status || !['accepted', 'rejected'].includes(status)) {
      return NextResponse.json(
        { error: 'Invalid status. Must be "accepted" or "rejected"' },
        { status: 400 }
      );
    }

    const updatedProposal = await supabaseTenderService.reviewProposal(
      params.id,
      status,
      feedback || ''
    );
    
    if (!updatedProposal) {
      return NextResponse.json(
        { error: 'Proposal not found' },
        { status: 404 }
      );
    }
    
    return NextResponse.json(updatedProposal);
  } catch (error: any) {
    console.error('Error reviewing proposal:', error);
    return NextResponse.json(
      { error: 'Failed to review proposal', details: error.message },
      { status: 500 }
    );
  }
}
