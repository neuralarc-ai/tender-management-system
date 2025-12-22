import { NextResponse } from 'next/server';
import { supabaseTenderService } from '@/lib/supabaseTenderService';

/**
 * GET /api/tenders/[id]/proposal-pdf
 * Download the AI-generated proposal PDF
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const tender = await supabaseTenderService.getById(params.id);
    
    if (!tender) {
      return NextResponse.json(
        { error: 'Tender not found' },
        { status: 404 }
      );
    }

    // Check if proposal has PDF content
    const pdfContent = (tender.proposal as any)?.pdfContent;
    const pdfFileName = (tender.proposal as any)?.pdfFileName || 'neural-arc-proposal.pdf';
    
    if (!pdfContent) {
      return NextResponse.json(
        { error: 'PDF not generated yet. Please generate proposal with AI first.' },
        { status: 404 }
      );
    }

    // If it's base64 PDF
    if (pdfContent.startsWith('data:application/pdf')) {
      const base64Data = pdfContent.split(',')[1];
      const buffer = Buffer.from(base64Data, 'base64');
      
      return new NextResponse(buffer, {
        headers: {
          'Content-Type': 'application/pdf',
          'Content-Disposition': `attachment; filename="${pdfFileName}"`,
        },
      });
    }
    
    // If it's markdown, convert to PDF-like format (simple HTML that can be printed as PDF)
    const htmlContent = `<!DOCTYPE html>
<html>
<head>
  <title>Neural Arc Proposal - ${tender.title}</title>
  <style>
    @page { margin: 2cm; }
    body { font-family: 'Times New Roman', serif; line-height: 1.6; color: #333; max-width: 800px; margin: 40px auto; padding: 40px; }
    h1 { color: #4F46E5; font-size: 28px; margin-bottom: 10px; border-bottom: 3px solid #4F46E5; padding-bottom: 10px; }
    h2 { color: #4F46E5; font-size: 20px; margin-top: 30px; margin-bottom: 15px; }
    h3 { color: #666; font-size: 16px; margin-top: 20px; }
    p { margin: 15px 0; text-align: justify; }
    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #eee; padding-bottom: 20px; }
    .logo { font-size: 32px; font-weight: bold; color: #4F46E5; margin-bottom: 10px; }
    .footer { margin-top: 50px; padding-top: 20px; border-top: 2px solid #eee; text-align: center; font-size: 12px; color: #666; }
    pre { white-space: pre-wrap; background: #f5f5f5; padding: 15px; border-radius: 5px; }
    @media print { body { margin: 0; padding: 20px; } }
  </style>
</head>
<body>
  <div class="header">
    <div class="logo">NEURAL ARC INC.</div>
    <p>AI-Driven Solutions & Software Development Excellence</p>
    <p><small>Portfolio: ipc.he2.ai | ers.he2.ai</small></p>
  </div>
  
  <h1>${tender.title}</h1>
  <p><strong>Client:</strong> ${tender.createdBy === 'dcs' ? 'DCS Corporation' : 'Client'}</p>
  <p><strong>AI Match Score:</strong> ${tender.aiAnalysis?.overallScore}%</p>
  <p><strong>Date:</strong> ${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</p>
  
  <h2>Executive Summary</h2>
  <pre>${tender.proposal.executiveSummary || 'Content pending...'}</pre>
  
  <h2>Requirements Understanding</h2>
  <pre>${tender.proposal.requirementsUnderstanding || 'Content pending...'}</pre>
  
  <h2>Technical Approach</h2>
  <pre>${tender.proposal.technicalApproach || 'Content pending...'}</pre>
  
  <h2>Scope Coverage</h2>
  <pre>${tender.proposal.scopeCoverage || 'Content pending...'}</pre>
  
  <h2>Delivery Timeline</h2>
  <pre>${tender.proposal.timeline || 'Content pending...'}</pre>
  
  <h2>Commercial Details</h2>
  <pre>${tender.proposal.commercialDetails || 'Content pending...'}</pre>
  
  <div class="footer">
    <p><strong>Neural Arc Inc.</strong></p>
    <p>Contact: admin@neuralarc.com | Website: neuralarc.com</p>
    <p><em>This proposal is confidential and intended solely for ${tender.createdBy === 'dcs' ? 'DCS Corporation' : 'the addressee'}.</em></p>
  </div>
  
  <script>
    // Auto-print dialog for PDF generation
    // window.print();
  </script>
</body>
</html>`;

    return new NextResponse(htmlContent, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `inline; filename="${pdfFileName.replace('.pdf', '.html')}"`,
      },
    });

  } catch (error: any) {
    console.error('Error serving proposal PDF:', error);
    return NextResponse.json(
      { error: 'Failed to serve proposal PDF', details: error.message },
      { status: 500 }
    );
  }
}

