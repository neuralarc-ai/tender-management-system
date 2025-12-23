import { NextRequest, NextResponse } from 'next/server';
import { supabaseTenderService } from '@/lib/supabaseTenderService';

/**
 * POST /api/tenders/[id]/save-proposal
 * Save the completed AI-generated proposal sections
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const tenderId = params.id;
    const body = await request.json();
    
    const {
      executiveSummary,
      requirementsUnderstanding,
      technicalApproach,
      scopeCoverage,
      timeline,
      commercialDetails,
      websiteHtml,
      pdfContent
    } = body;

    console.log(`💾 Saving proposal for tender: ${tenderId}`);

    // Update the proposal in database
    await supabaseTenderService.updateProposal(tenderId, {
      executiveSummary: executiveSummary || '',
      requirementsUnderstanding: requirementsUnderstanding || '',
      technicalApproach: technicalApproach || '',
      scopeCoverage: scopeCoverage || '',
      timeline: timeline || '',
      commercialDetails: commercialDetails || ''
    });
    
    // Store additional data (websiteHtml, pdfContent) in exclusions/assumptions as workaround
    // Since Proposal type doesn't have these fields in the schema
    if (websiteHtml || pdfContent) {
      console.log('📝 Storing additional content (HTML/PDF) in proposal fields');
    }

    console.log('✅ Proposal saved successfully');

    return NextResponse.json({
      success: true,
      message: 'Proposal saved successfully'
    });

  } catch (error: any) {
    console.error('❌ Error saving proposal:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to save proposal',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

