import { NextRequest, NextResponse } from 'next/server';
import { supabaseTenderService } from '@/lib/supabaseTenderService';

/**
 * POST /api/tenders/[id]/generate-proposal
 * Calls Helium Quick Action API to generate proposal
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const tenderId = params.id;
    
    // Get tender details
    const tender = await supabaseTenderService.getById(tenderId);
    
    if (!tender) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Tender not found' 
        },
        { status: 404 }
      );
    }

    // Validate environment
    const AI_API_KEY = process.env.AI_API_KEY;
    const AI_API_ENDPOINT = process.env.AI_API_ENDPOINT || 'https://api.he2.site/api/v1/public';

    if (!AI_API_KEY) {
      console.error('❌ AI_API_KEY not configured');
      return NextResponse.json(
        { 
          success: false, 
          error: 'AI service not configured. Please set AI_API_KEY in environment variables.',
          details: 'AI_API_KEY is missing'
        },
        { status: 500 }
      );
    }

    console.log(`🚀 Initiating AI proposal generation for tender: ${tender.title}`);

    // Build the proposal prompt based on tender data
    const prompt = buildProposalPrompt(tender);

    // Prepare form data for Quick Action API
    const formData = new FormData();
    formData.append('prompt', prompt);
    formData.append('source', 'tender-management-system');
    formData.append('enable_thinking', 'true');
    formData.append('reasoning_effort', 'medium');
    formData.append('metadata', JSON.stringify({
      tender_id: tenderId,
      tender_title: tender.title,
      timestamp: new Date().toISOString()
    }));

    console.log('📤 Sending request to Helium Quick Action API...');

    // Call Helium Quick Action API
    const quickActionResponse = await fetch(`${AI_API_ENDPOINT}/quick-action`, {
      method: 'POST',
      headers: {
        'X-API-Key': AI_API_KEY
      },
      body: formData
    });

    if (!quickActionResponse.ok) {
      const errorText = await quickActionResponse.text();
      console.error('❌ Helium API Error:', errorText);
      
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to initiate AI generation',
          details: `API returned ${quickActionResponse.status}: ${errorText}`,
          status: quickActionResponse.status
        },
        { status: quickActionResponse.status }
      );
    }

    const quickActionData = await quickActionResponse.json();
    
    console.log('✅ Quick Action API Response:', {
      success: quickActionData.success,
      project_id: quickActionData.project_id,
      thread_id: quickActionData.thread_id,
      agent_run_id: quickActionData.agent_run_id
    });

    // Update tender proposal with initial metadata (store in executiveSummary temporarily as placeholder)
    // The actual metadata will be saved after completion
    try {
      await supabaseTenderService.updateProposal(tenderId, {
        executiveSummary: `Generating proposal... (Thread: ${quickActionData.thread_id}, Project: ${quickActionData.project_id})`
      });
    } catch (updateError) {
      console.warn('⚠️ Failed to update proposal status:', updateError);
      // Continue anyway - this is not critical
    }

    return NextResponse.json({
      success: true,
      message: 'AI generation started successfully',
      project_id: quickActionData.project_id,
      thread_id: quickActionData.thread_id,
      agent_run_id: quickActionData.agent_run_id
    });

  } catch (error: any) {
    console.error('❌ Error in generate-proposal:', error);
    
    return NextResponse.json(
      { 
        success: false, 
        error: 'Internal server error',
        details: error.message 
      },
      { status: 500 }
    );
  }
}

/**
 * Build comprehensive prompt for AI proposal generation
 */
function buildProposalPrompt(tender: any): string {
  return `Generete me the test pdf of single page.`;
}
