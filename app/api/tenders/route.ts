import { NextResponse } from 'next/server';
import { supabaseTenderService } from '@/lib/supabaseTenderService';
import axios from 'axios';

/**
 * GET /api/tenders
 * Fetch all tenders from database
 */
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role') || 'admin';

    const tenders = await supabaseTenderService.getAll(userId || undefined, role);
    return NextResponse.json(tenders);
  } catch (error: any) {
    console.error('Error fetching tenders:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tenders', details: error.message }, 
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenders
 * Create a new tender in database
 */
export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // Extract user ID from request (in production, get from session/JWT)
    // Default to client user if not provided
    const createdBy = body.createdBy || '11111111-1111-1111-1111-111111111111';
    
    const tenderData = {
      title: body.title,
      description: body.description,
      scopeOfWork: body.scopeOfWork,
      technicalRequirements: body.technicalRequirements,
      functionalRequirements: body.functionalRequirements,
      eligibilityCriteria: body.eligibilityCriteria,
      submissionDeadline: body.submissionDeadline,
      documents: body.documents || [],
      createdBy
    };

    const newTender = await supabaseTenderService.create(tenderData);
    
    // Trigger AI analysis in background
    if (newTender) {
      // Convert database format to Tender type for analysis
      const tenderForAnalysis = {
        id: newTender.id,
        title: tenderData.title,
        description: tenderData.description,
        scopeOfWork: tenderData.scopeOfWork,
        technicalRequirements: tenderData.technicalRequirements,
        functionalRequirements: tenderData.functionalRequirements,
        eligibilityCriteria: tenderData.eligibilityCriteria,
        submissionDeadline: tenderData.submissionDeadline,
        status: 'open',
        createdAt: new Date().toISOString(),
        createdBy
      };
      
      // Trigger AI analysis asynchronously
      supabaseTenderService.triggerAIAnalysis(newTender.id, tenderForAnalysis as any)
        .catch(err => console.error('AI analysis failed:', err));
      
      // ✨ NEW: Trigger automatic tender document generation
      axios.post(`${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/tenders/${newTender.id}/generate-document`, {
        documentType: 'full'
      }).catch(err => console.error('Document generation failed:', err));
    }
    
    return NextResponse.json(newTender, { status: 201 });
  } catch (error: any) {
    console.error('Error creating tender:', error);
    return NextResponse.json(
      { error: 'Failed to create tender', details: error.message },
      { status: 500 }
    );
  }
}
