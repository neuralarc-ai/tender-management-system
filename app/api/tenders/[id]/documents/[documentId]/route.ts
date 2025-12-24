import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * PATCH /api/tenders/[id]/documents/[documentId]
 * Update document content (Admin only)
 */
export async function PATCH(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
): Promise<NextResponse> {
  try {
    const { documentId } = params;
    const body = await request.json();
    const { content } = body;

    if (!content || typeof content !== 'string') {
      return NextResponse.json(
        { error: 'Content is required and must be a string' },
        { status: 400 }
      );
    }

    // Calculate updated metadata
    const words = content.trim().split(/\s+/).filter(word => word.length > 0);
    const wordCount = words.length;
    const pageCount = Math.ceil(wordCount / 500);

    const supabase = createServiceClient();

    // Update document with new content and metadata
    const { data: document, error: updateError } = await supabase
      .from('tender_documents')
      .update({
        content,
        word_count: wordCount,
        page_count: pageCount,
        updated_at: new Date().toISOString(),
        metadata: {
          last_edited: new Date().toISOString(),
          edit_count: supabase.rpc('increment_edit_count', { doc_id: documentId })
        }
      })
      .eq('id', documentId)
      .select()
      .single();

    if (updateError) {
      console.error('Error updating document:', updateError);
      return NextResponse.json(
        { error: 'Failed to update document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      document,
      message: 'Document updated successfully'
    });

  } catch (error: any) {
    console.error('Document update error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * GET /api/tenders/[id]/documents/[documentId]
 * Get specific document
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
): Promise<NextResponse> {
  try {
    const { documentId } = params;
    const supabase = createServiceClient();

    const { data: document, error } = await supabase
      .from('tender_documents')
      .select('*')
      .eq('id', documentId)
      .single();

    if (error || !document) {
      return NextResponse.json(
        { error: 'Document not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ document });

  } catch (error: any) {
    console.error('Document fetch error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

/**
 * DELETE /api/tenders/[id]/documents/[documentId]
 * Delete document (Admin only)
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string; documentId: string } }
): Promise<NextResponse> {
  try {
    const { documentId } = params;
    const supabase = createServiceClient();

    const { error } = await supabase
      .from('tender_documents')
      .delete()
      .eq('id', documentId);

    if (error) {
      console.error('Error deleting document:', error);
      return NextResponse.json(
        { error: 'Failed to delete document' },
        { status: 500 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Document deleted successfully'
    });

  } catch (error: any) {
    console.error('Document delete error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

