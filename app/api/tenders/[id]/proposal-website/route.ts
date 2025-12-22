import { NextResponse } from 'next/server';
import { supabaseTenderService } from '@/lib/supabaseTenderService';
import { generateProposalWebsite } from '@/lib/proposalWebsiteGenerator';

/**
 * GET /api/tenders/[id]/proposal-website
 * Serve the proposal as a professional website
 */
export async function GET(
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

    // Check if AI generated HTML file
    const aiWebsiteHtml = (tender.proposal as any)?.websiteHtml;
    
    // Use AI-generated HTML if available, otherwise generate from text
    const websiteHtml = aiWebsiteHtml || generateProposalWebsite(tender);

    // Serve the HTML
    return new NextResponse(websiteHtml, {
      headers: {
        'Content-Type': 'text/html',
        'Cache-Control': 'public, max-age=3600',
      },
    });

  } catch (error: any) {
    console.error('Error serving proposal website:', error);
    return NextResponse.json(
      { error: 'Failed to serve proposal website', details: error.message },
      { status: 500 }
    );
  }
}

