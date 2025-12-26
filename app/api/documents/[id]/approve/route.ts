import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * PATCH /api/documents/[id]/approve
 * Approve or reject a generated tender document
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
): Promise<NextResponse> {
  try {
    const documentId = params.id;
    const body = await request.json();
    const { action, userId, rejectionReason } = body; // action: 'approve' or 'reject'

    if (!action || !userId) {
      return NextResponse.json(
        { error: 'Missing required fields: action and userId' },
        { status: 400 }
      );
    }

    if (action !== 'approve' && action !== 'reject') {
      return NextResponse.json(
        { error: 'Invalid action. Must be "approve" or "reject"' },
        { status: 400 }
      );
    }

    const supabase = createServiceClient();

    // Update document approval status
    const updateData: any = {
      approval_status: action === 'approve' ? 'approved' : 'rejected',
      approved_by: userId,
      approved_at: new Date().toISOString()
    };

    if (action === 'reject' && rejectionReason) {
      updateData.rejection_reason = rejectionReason;
    }

    const { data: document, error: updateError } = await supabase
      .from('tender_documents')
      .update(updateData)
      .eq('id', documentId)
      .select('*, tenders(title, created_by)')
      .single();

    if (updateError) {
      console.error('Error updating document approval:', updateError);
      return NextResponse.json(
        { error: 'Failed to update approval status' },
        { status: 500 }
      );
    }

    // Create notification for partner
    if (document && document.tenders) {
      const tender = document.tenders as any;
      const notificationTitle = action === 'approve' 
        ? '✅ Document Approved!' 
        : '❌ Document Rejected';
      
      const notificationMessage = action === 'approve'
        ? `Your tender document "${document.title}" has been approved by Neural Arc Inc. You can now download it!`
        : `Your tender document "${document.title}" was rejected. ${rejectionReason || 'Please review and make necessary changes.'}`;

      await supabase.rpc('create_notification', {
        p_type: action === 'approve' ? 'document_approved' : 'document_rejected',
        p_title: notificationTitle,
        p_message: notificationMessage,
        p_tender_id: document.tender_id,
        p_created_by: 'admin',
        p_target_roles: ['client']
      });
    }

    return NextResponse.json({
      success: true,
      document,
      message: `Document ${action === 'approve' ? 'approved' : 'rejected'} successfully`
    });

  } catch (error: any) {
    console.error('Document approval error:', error);
    return NextResponse.json(
      { error: 'Failed to process approval', details: error.message },
      { status: 500 }
    );
  }
}

