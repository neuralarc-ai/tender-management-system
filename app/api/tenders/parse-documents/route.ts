import { NextResponse } from 'next/server';
import { geminiDocumentParser } from '@/lib/geminiDocumentParser';
import { createServiceClient } from '@/lib/supabase';

/**
 * POST /api/tenders/parse-documents
 * Parse uploaded tender documents using Gemini AI
 */
export async function POST(request: Request): Promise<NextResponse> {
  try {
    const body = await request.json();
    const { documents } = body;

    if (!documents || !Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json(
        { error: 'No documents provided for parsing' },
        { status: 400 }
      );
    }

    // Check if Gemini is configured
    if (!geminiDocumentParser.isConfigured()) {
      return NextResponse.json(
        { 
          error: 'Document parsing service not configured', 
          message: 'Please configure GEMINI_API_KEY in environment variables'
        },
        { status: 503 }
      );
    }

    const supabase = createServiceClient();
    const documentsToProcess: Array<{
      content: string;
      fileName: string;
      mimeType: string;
    }> = [];

    // Fetch document content from Supabase Storage
    for (const doc of documents) {
      try {
        // Extract file path from URL
        const url = new URL(doc.url);
        const pathMatch = url.pathname.match(/\/storage\/v1\/object\/public\/tender-files\/(.+)/);
        
        if (!pathMatch) {
          console.warn('Could not extract file path from URL:', doc.url);
          continue;
        }

        const filePath = pathMatch[1];

        // Download file from Supabase Storage
        const { data: fileData, error: downloadError } = await supabase
          .storage
          .from('tender-files')
          .download(filePath);

        if (downloadError) {
          console.error('Error downloading file:', downloadError);
          continue;
        }

        // Convert blob to base64 for Gemini
        const arrayBuffer = await fileData.arrayBuffer();
        const base64Content = Buffer.from(arrayBuffer).toString('base64');

        // Determine MIME type
        const mimeType = getMimeType(doc.name);

        documentsToProcess.push({
          content: base64Content,
          fileName: doc.name,
          mimeType
        });
      } catch (error) {
        console.error('Error processing document:', error);
        // Continue with other documents
      }
    }

    if (documentsToProcess.length === 0) {
      return NextResponse.json(
        { 
          error: 'No documents could be processed', 
          message: 'Unable to download or process the uploaded documents'
        },
        { status: 400 }
      );
    }

    // Parse documents using Gemini
    let parsedData;
    if (documentsToProcess.length === 1) {
      parsedData = await geminiDocumentParser.parseDocument(
        documentsToProcess[0].content,
        documentsToProcess[0].fileName,
        documentsToProcess[0].mimeType
      );
    } else {
      parsedData = await geminiDocumentParser.parseMultipleDocuments(documentsToProcess);
    }

    // Validate parsed data
    const validation = geminiDocumentParser.validateParsedData(parsedData);

    return NextResponse.json({
      success: true,
      data: parsedData,
      validation,
      processedDocuments: documentsToProcess.length
    });

  } catch (error: any) {
    console.error('Document parsing error:', error);
    return NextResponse.json(
      { 
        error: 'Failed to parse documents', 
        message: error.message,
        details: process.env.NODE_ENV === 'development' ? error.stack : undefined
      },
      { status: 500 }
    );
  }
}

/**
 * Get MIME type from file name
 */
function getMimeType(fileName: string): string {
  const ext = fileName.split('.').pop()?.toLowerCase();
  
  const mimeTypes: Record<string, string> = {
    'pdf': 'application/pdf',
    'doc': 'application/msword',
    'docx': 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'xls': 'application/vnd.ms-excel',
    'xlsx': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'txt': 'text/plain',
    'rtf': 'application/rtf',
    'odt': 'application/vnd.oasis.opendocument.text',
    'png': 'image/png',
    'jpg': 'image/jpeg',
    'jpeg': 'image/jpeg'
  };

  return mimeTypes[ext || ''] || 'application/octet-stream';
}

