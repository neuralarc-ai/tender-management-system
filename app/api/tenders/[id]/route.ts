import { NextResponse } from 'next/server';
import { supabaseTenderService } from '@/lib/supabaseTenderService';

/**
 * GET /api/tenders/[id]
 * Fetch a single tender by ID from database
 */
export async function GET(
  request: Request, 
  { params }: { params: { id: string } }
) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const role = searchParams.get('role') || 'admin';

    const tender = await supabaseTenderService.getById(
      params.id, 
      userId || undefined, 
      role
    );
    
    if (!tender) {
      return NextResponse.json({ error: 'Tender not found' }, { status: 404 });
    }
    
    return NextResponse.json(tender);
  } catch (error: any) {
    console.error('Error fetching tender:', error);
    return NextResponse.json(
      { error: 'Failed to fetch tender', details: error.message },
      { status: 500 }
    );
  }
}
