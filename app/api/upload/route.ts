import { NextResponse } from 'next/server';
import { createServiceClient } from '@/lib/supabase';

/**
 * POST /api/upload
 * Upload file to Supabase Storage
 */
export async function POST(request: Request) {
  try {
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const tenderId = formData.get('tenderId') as string;
    const userId = formData.get('userId') as string;
    
    if (!file) {
      return NextResponse.json(
        { error: 'No file uploaded' },
        { status: 400 }
      );
    }

    // Validate file size (10MB max)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json(
        { error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    const serviceClient = createServiceClient();

    // Generate unique filename
    const fileExt = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${fileExt}`;
    const filePath = `tender-documents/${fileName}`;

    // Upload to Supabase Storage
    const { data: uploadData, error: uploadError } = await serviceClient
      .storage
      .from('tender-files')
      .upload(filePath, file, {
        contentType: file.type,
        upsert: false
      });

    if (uploadError) {
      console.error('Upload error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload file', details: uploadError.message },
        { status: 500 }
      );
    }

    // Get public URL
    const { data: urlData } = serviceClient
      .storage
      .from('tender-files')
      .getPublicUrl(filePath);

    // Save file metadata to database if tenderId provided
    if (tenderId && userId) {
      const { error: dbError } = await serviceClient
        .from('uploaded_files')
        .insert({
          tender_id: tenderId,
          file_name: file.name,
          file_url: urlData.publicUrl,
          file_size: file.size,
          file_type: file.type,
          uploaded_by: userId
        });

      if (dbError) {
        console.error('Database insert error:', dbError);
        // Don't fail the upload, file is already stored
      }
    }

    return NextResponse.json({
      name: file.name,
      url: urlData.publicUrl,
      size: file.size,
      type: file.type
    });

  } catch (error: any) {
    console.error('Upload failed:', error);
    return NextResponse.json(
      { error: 'Upload failed', details: error.message },
      { status: 500 }
    );
  }
}
