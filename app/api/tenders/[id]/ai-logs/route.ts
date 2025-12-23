import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * GET /api/tenders/[id]/ai-logs
 * Fetch AI regeneration logs for a tender
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenderId = params.id;
    const serviceClient = createServiceClient();

    const { data, error } = await serviceClient.rpc('get_ai_regeneration_logs', {
      p_tender_id: tenderId
    });

    if (error) throw error;

    // Extract log data from JSONB
    const logs = (data || []).map((item: any) => item.log_data);

    return NextResponse.json({ logs });
  } catch (error: any) {
    console.error('Error fetching AI logs:', error);
    return NextResponse.json(
      { error: 'Failed to fetch AI logs', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenders/[id]/ai-logs
 * Create a new AI regeneration log entry
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenderId = params.id;
    const body = await request.json();
    const { 
      regenerated_by, 
      reason, 
      old_proposal_snapshot,
      helium_thread_id,
      helium_project_id,
      status = 'in_progress'
    } = body;

    const serviceClient = createServiceClient();

    const { data: log, error } = await serviceClient
      .from('ai_regeneration_logs')
      .insert({
        tender_id: tenderId,
        regenerated_by,
        reason,
        old_proposal_snapshot,
        helium_thread_id,
        helium_project_id,
        status
      })
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, log }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating AI log:', error);
    return NextResponse.json(
      { error: 'Failed to create AI log', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tenders/[id]/ai-logs/[logId]
 * Update AI log status (mark as completed/failed)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json();
    const { log_id, status, error_message, new_proposal_snapshot } = body;

    const serviceClient = createServiceClient();

    const updateData: any = {
      status,
      completed_at: status === 'completed' || status === 'failed' ? new Date().toISOString() : null
    };

    if (error_message) updateData.error_message = error_message;
    if (new_proposal_snapshot) updateData.new_proposal_snapshot = new_proposal_snapshot;

    const { data: log, error } = await serviceClient
      .from('ai_regeneration_logs')
      .update(updateData)
      .eq('id', log_id)
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ success: true, log });
  } catch (error: any) {
    console.error('Error updating AI log:', error);
    return NextResponse.json(
      { error: 'Failed to update AI log', details: error.message },
      { status: 500 }
    );
  }
}

