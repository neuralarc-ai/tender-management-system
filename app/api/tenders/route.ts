import { NextResponse } from 'next/server';
import { tenderService } from '@/lib/tenderService';

export async function GET() {
  const tenders = tenderService.getAll();
  return NextResponse.json(tenders);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const newTender = tenderService.create(body);
    return NextResponse.json(newTender, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: 'Failed to create tender' }, { status: 500 });
  }
}

