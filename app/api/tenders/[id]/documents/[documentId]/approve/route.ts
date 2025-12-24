import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * PATCH /api/tenders/[id]/documents/[documentId]/approve
 * Approve or unapprove a document for partner visibility
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
): Promise<NextResponse> {
  try {
    const { documentId } = params;
    const body = await request.json();
    const { approval_status } = body; // 'approved' or 'pending' or 'rejected'

    if (!approval_status || !['approved', 'pending', 'rejected'].includes(approval_status)) {
      return NextResponse.json(
        { error: 'Invalid approval_status. Must be: approved, pending, or rejected' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Update document approval status
    const { data: document, error: updateError } = await supabase
      .from('tender_documents')
      .update({
        approval_status,
        approved_at: approval_status === 'approved' ? new Date().toISOString() : null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', documentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating document approval:', updateError);
      return NextResponse.json(
        { error: 'Failed to update document approval status' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document,
      message: `Document ${approval_status === 'approved' ? 'approved' : approval_status === 'rejected' ? 'rejected' : 'set to pending'} successfully`
    });

  } catch (error: any) {
    console.error('Document approval error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

