import { NextResponse } from 'next/server';
import { tenderDocumentGenerator } from '@/lib/tenderDocumentGenerator';
import { createServiceClient } from '@/lib/supabase';

/**
 * POST /api/tenders/[id]/generate-document
 * Generate a tender document using Gemini 3 Pro
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const tenderId = params.id;
    const body = await request.json();
    const { documentType = 'full' } = body; // 'full' or 'summary'

    // Fetch tender details
    const supabase = createServiceClient();
    const { data: tender, error: tenderError } = await supabase
      .from('tenders')
      .select('*')
      .eq('id', tenderId)
      .single();

    if (tenderError || !tender) {
      return NextResponse.json(
        { error: 'Tender not found' },
        { status: 404 }
      );
    }

    // Check if service is configured
    if (!tenderDocumentGenerator.isConfigured()) {
      return NextResponse.json(
        { 
          error: 'Document generation service not configured',
          message: 'Please set GEMINI_API_KEY in environment variables'
        },
        { status: 503 }
      );
    }

    // Create initial document record
    const { data: documentRecord, error: createError } = await supabase
      .from('tender_documents')
      .insert({
        tender_id: tenderId,
        document_type: documentType,
        title: `${tender.title} - ${documentType === 'full' ? 'Complete Tender Document' : 'Quick Summary'}`,
        status: 'generating',
        generation_progress: 0,
        generated_by: tender.created_by
      })
      .select()
      .single();

    if (createError) {
      console.error('Error creating document record:', createError);
      return NextResponse.json(
        { error: 'Failed to create document record' },
        { status: 500 }
      );
    }

    // Generate document asynchronously
    generateDocumentAsync(documentRecord.id, tender, documentType);

    return NextResponse.json({
      documentId: documentRecord.id,
      status: 'generating',
      message: 'Document generation started',
      estimatedTime: documentType === 'full' ? 60 : 20 // seconds
    });

  } catch (error: any) {
    console.error('Document generation API error:', error);
    return NextResponse.json(
      { error: 'Failed to start document generation', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * Generate document asynchronously with automatic retry on failure
 */
async function generateDocumentAsync(
  documentId: string,
  tender: any,
  documentType: string,
  retryCount: number = 0
): Promise<void> {
  const supabase = createServiceClient();
  const MAX_RETRIES = 2; // Retry up to 2 times

  try {
    // Validate tender data has required fields
    if (!tender.title || !tender.description) {
      throw new Error('Tender missing required fields (title, description)');
    }

    // Ensure all fields exist with defaults
    const tenderData = {
      ...tender,
      title: tender.title || 'Untitled Project',
      description: tender.description || 'No description provided',
      technical_requirements: tender.technical_requirements || tender.technicalRequirements || 'Standard technical requirements apply',
      functional_requirements: tender.functional_requirements || tender.functionalRequirements || 'Standard functional requirements apply',
      scope_of_work: tender.scope_of_work || tender.scopeOfWork || 'Scope to be determined',
      eligibility_criteria: tender.eligibility_criteria || tender.eligibilityCriteria || 'Standard vendor qualifications required',
      submission_deadline: tender.submission_deadline || tender.submissionDeadline || new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString()
    };

    // Update progress to 10%
    await supabase
      .from('tender_documents')
      .update({ 
        generation_progress: 10,
        metadata: { retryCount, lastRetryAt: new Date().toISOString() }
      })
      .eq('id', documentId);

    // Generate document
    const generatedDoc = documentType === 'full'
      ? await tenderDocumentGenerator.generateTenderDocument(tenderData)
      : await tenderDocumentGenerator.generateSummaryDocument(tenderData);

    // Update progress to 90%
    await supabase
      .from('tender_documents')
      .update({ generation_progress: 90 })
      .eq('id', documentId);

    // Save completed document
    await supabase
      .from('tender_documents')
      .update({
        status: 'completed',
        generation_progress: 100,
        content: generatedDoc.content,
        page_count: generatedDoc.metadata.pageCount,
        word_count: generatedDoc.metadata.wordCount,
        metadata: {
          sections: generatedDoc.sections.length,
          generatedAt: generatedDoc.metadata.generatedAt
        }
      })
      .eq('id', documentId);

    console.log(`Document ${documentId} generated successfully`);

  } catch (error: any) {
    console.error(`Async document generation error (attempt ${retryCount + 1}/${MAX_RETRIES + 1}):`, error);
    
    // Retry logic
    if (retryCount < MAX_RETRIES) {
      console.log(`Retrying document generation for ${documentId} (attempt ${retryCount + 2}/${MAX_RETRIES + 1})...`);
      
      // Update status to show retry
      await supabase
        .from('tender_documents')
        .update({
          status: 'generating',
          generation_progress: 0,
          metadata: {
            error: error.message,
            retryCount: retryCount + 1,
            lastRetryAt: new Date().toISOString(),
            willRetry: true
          }
        })
        .eq('id', documentId);

      // Wait 5 seconds before retry
      await new Promise(resolve => setTimeout(resolve, 5000));
      
      // Retry generation
      return generateDocumentAsync(documentId, tender, documentType, retryCount + 1);
    }
    
    // Max retries exceeded - mark as failed
    await supabase
      .from('tender_documents')
      .update({
        status: 'failed',
        metadata: {
          error: error.message,
          failedAt: new Date().toISOString(),
          retryCount,
          maxRetriesExceeded: true
        }
      })
      .eq('id', documentId);

    console.error(`Document generation failed after ${retryCount + 1} attempts`);
  }
}

/**
 * GET /api/tenders/[id]/generate-document
 * Get all documents for a tender
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const tenderId = params.id;
    const supabase = createServiceClient();

    const { data: documents, error } = await supabase
      .from('tender_documents')
      .select('*')
      .eq('tender_id', tenderId)
      .order('created_at', { ascending: false });

    if (error) {
      return NextResponse.json(
        { error: 'Failed to fetch documents' },
        { status: 500 }
      );
    }

    return NextResponse.json({ documents });

  } catch (error: any) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}

