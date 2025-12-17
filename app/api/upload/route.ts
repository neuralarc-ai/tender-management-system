import { NextResponse } from 'next/server';
import { tenderService } from '@/lib/tenderService';

export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const result = await tenderService.saveFile(file);
    return NextResponse.json(result);
  } catch (error) {
    return NextResponse.json({ error: 'Upload failed' }, { status: 500 });
  }
}

