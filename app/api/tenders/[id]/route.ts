import { NextResponse } from 'next/server';
import { tenderService } from '@/lib/tenderService';

export async function GET(request: Request, { params }: { params: { id: string } }) {
  const tender = tenderService.getById(params.id);
  
  if (!tender) {
    return NextResponse.json({ error: 'Tender not found' }, { status: 404 });
  }
  
  return NextResponse.json(tender);
}

