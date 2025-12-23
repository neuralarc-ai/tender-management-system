import { NextResponse } from 'next/server';
import { supabaseTenderService } from '@/lib/supabaseTenderService';
import { autoGenerateProposal } from '@/lib/aiProposalService';

// Configure route to allow AI generation
export const maxDuration = 300; // 5 minutes (Vercel hobby plan limit)
export const dynamic = 'force-dynamic'; // Never cache

/**
 * POST /api/tenders/[id]/generate-proposal
 * Admin can manually trigger AI proposal generation
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tender = await supabaseTenderService.getById(params.id);
    
    if (!tender) {
      return NextResponse.json(
        { error: 'Tender not found' },
        { status: 404 }
      );
    }

    // Check if AI analysis is complete
    if (tender.aiAnalysis?.status !== 'completed') {
      return NextResponse.json(
        { error: 'AI analysis must be completed before generating proposal' },
        { status: 400 }
      );
    }

    console.log(`🤖 Generating AI proposal for: ${tender.title}`);

    // Generate proposal using AI
    const aiProposal = await autoGenerateProposal(tender, tender.aiAnalysis);

    // Update the tender's proposal in database
    const updatedProposal = await supabaseTenderService.updateProposal(params.id, {
      ...aiProposal,
      status: 'draft'
    });

    if (!updatedProposal) {
      return NextResponse.json(
        { error: 'Failed to update proposal' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'AI proposal generated successfully',
      proposal: updatedProposal
    });

  } catch (error: any) {
    console.error('Error generating AI proposal:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate proposal with AI',
        details: error.message,
        fallback: 'Template-based proposal will be used'
      },
      { status: 500 }
    );
  }
}

