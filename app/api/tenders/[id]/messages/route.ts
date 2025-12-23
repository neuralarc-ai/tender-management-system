import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * GET /api/tenders/[id]/messages
 * Fetch all messages for a tender
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenderId = params.id;
    const serviceClient = createServiceClient();

    // Get messages using stored function
    const { data, error } = await serviceClient.rpc('get_tender_messages', {
      p_tender_id: tenderId
    });

    if (error) throw error;

    // Extract message data from JSONB
    const messages = (data || []).map((item: any) => item.message_data);

    return NextResponse.json({ messages });
  } catch (error: any) {
    console.error('Error fetching messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch messages', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST /api/tenders/[id]/messages
 * Create a new message
 */
export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenderId = params.id;
    const body = await request.json();
    const { sender_id, content, message_type = 'text', attachments = [] } = body;

    const serviceClient = createServiceClient();

    // Create message
    const { data: message, error: messageError } = await serviceClient
      .from('tender_messages')
      .insert({
        tender_id: tenderId,
        sender_id,
        message_type,
        content
      })
      .select()
      .single();

    if (messageError) throw messageError;

    // Add attachments if any
    if (attachments.length > 0) {
      const attachmentData = attachments.map((att: any) => ({
        message_id: message.id,
        file_name: att.file_name,
        file_url: att.file_url,
        file_size: att.file_size,
        file_type: att.file_type
      }));

      const { error: attachError } = await serviceClient
        .from('tender_message_attachments')
        .insert(attachmentData);

      if (attachError) throw attachError;
    }

    // Create notification for recipient
    const { data: tender } = await serviceClient
      .from('tenders')
      .select('created_by, title')
      .eq('id', tenderId)
      .single();

    if (tender) {
      const { data: sender } = await serviceClient
        .from('users')
        .select('role, full_name')
        .eq('id', sender_id)
        .single();

      const recipientRole = sender?.role === 'admin' ? 'client' : 'admin';
      
      await serviceClient.rpc('create_notification', {
        p_type: 'message_received',
        p_title: 'New Message',
        p_message: `${sender?.full_name || 'Someone'} sent a message on "${tender.title}"`,
        p_tender_id: tenderId,
        p_created_by: sender_id,
        p_target_roles: [recipientRole]
      });
    }

    return NextResponse.json({ success: true, message }, { status: 201 });
  } catch (error: any) {
    console.error('Error creating message:', error);
    return NextResponse.json(
      { error: 'Failed to create message', details: error.message },
      { status: 500 }
    );
  }
}

/**
 * PATCH /api/tenders/[id]/messages
 * Mark messages as read
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tenderId = params.id;
    const body = await request.json();
    const { user_id } = body;

    const serviceClient = createServiceClient();

    const { data, error } = await serviceClient.rpc('mark_messages_read', {
      p_tender_id: tenderId,
      p_user_id: user_id
    });

    if (error) throw error;

    return NextResponse.json({ success: true, updated_count: data });
  } catch (error: any) {
    console.error('Error marking messages as read:', error);
    return NextResponse.json(
      { error: 'Failed to mark messages as read', details: error.message },
      { status: 500 }
    );
  }
}

