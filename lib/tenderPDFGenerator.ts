import jsPDF from 'jspdf';

/**
 * PDF Generator for Tender Documents
 * Converts markdown tender documents to professional PDF format
 */

interface PDFOptions {
  title: string;
  content: string;
  metadata?: {
    author?: string;
    subject?: string;
    keywords?: string;
  };
}

export class TenderPDFGenerator {
  /**
   * Generate professional PDF from markdown content
   */
  static generatePDF(options: PDFOptions): Blob {
    const { title, content, metadata } = options;

    // Create PDF document (A4 size)
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4'
    });

    // Set document properties
    doc.setProperties({
      title: title,
      author: metadata?.author || 'Neural Arc Inc',
      subject: metadata?.subject || 'Proposal Document',
      keywords: metadata?.keywords || 'proposal, tender response, implementation',
      creator: 'Neural Arc - Tender Management System'
    });

    // Parse markdown and add to PDF
    this.addContentToPDF(doc, content, title);

    // Return as blob
    return doc.output('blob');
  }

  /**
   * Add formatted content to PDF (handles text properly, removes markdown artifacts)
   */
  private static addContentToPDF(doc: jsPDF, content: string, title: string): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 20;
    const maxWidth = pageWidth - (margin * 2);
    let yPosition = margin;

    // Add cover page
    this.addCoverPage(doc, title);
    doc.addPage();
    yPosition = margin;

    // Clean content - remove markdown artifacts
    let cleanedContent = content
      .replace(/\*\*\*(.+?)\*\*\*/g, '$1') // Remove bold+italic
      .replace(/\*\*(.+?)\*\*/g, '$1')     // Remove bold
      .replace(/\*(.+?)\*/g, '$1')         // Remove italic
      .replace(/`(.+?)`/g, '$1')           // Remove code blocks
      .replace(/^\s*[-*]\s+/gm, '• ')      // Normalize bullets
      .replace(/^#{1,6}\s+/gm, '')         // Remove # symbols from headings
      .replace(/^\s*---+\s*$/gm, '___')    // Mark horizontal rules
      .replace(/\|/g, ' | ')               // Space out table separators
      .trim();

    // Parse into lines
    const lines = cleanedContent.split('\n');
    
    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      
      // Check if we need a new page
      if (yPosition > pageHeight - margin - 20) {
        doc.addPage();
        yPosition = margin;
      }

      // Skip empty lines but add small space
      if (line.length === 0) {
        yPosition += 3;
        continue;
      }

      // Handle horizontal rules
      if (line === '___') {
        doc.setDrawColor(217, 120, 84);
        doc.setLineWidth(0.5);
        doc.line(margin, yPosition, pageWidth - margin, yPosition);
        yPosition += 8;
        continue;
      }

      // Detect section types by analyzing content
      const isMainHeading = line.length < 100 && line === line.toUpperCase() && !line.startsWith('•');
      const isSubHeading = !line.startsWith('•') && !line.includes('|') && line.length < 80 && 
                          (lines[i-1]?.trim() === '' || i === 0);
      const isBullet = line.startsWith('•');
      const isTableRow = line.includes(' | ');

      if (isMainHeading && line.length > 3) {
        // Main section heading
        doc.setFontSize(16);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(61, 74, 74);
        const text = line.replace(/^[0-9]+\.\s*/, '');
        doc.text(text, margin, yPosition);
        yPosition += 12;
        
      } else if (isSubHeading && !isBullet) {
        // Sub heading
        doc.setFontSize(12);
        doc.setFont('helvetica', 'bold');
        doc.setTextColor(74, 106, 106);
        doc.text(line, margin, yPosition);
        yPosition += 9;
        
      } else if (isBullet) {
        // Bullet point
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);
        const text = line;
        const splitText = doc.splitTextToSize(text, maxWidth - 5);
        doc.text(splitText, margin + 3, yPosition);
        yPosition += splitText.length * 5 + 2;
        
      } else if (isTableRow) {
        // Table row (simple formatting)
        doc.setFontSize(9);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);
        const cells = line.split('|').map(cell => cell.trim()).filter(cell => cell);
        
        if (cells.length > 0) {
          const colWidth = maxWidth / cells.length;
          cells.forEach((cell, idx) => {
            const cellText = doc.splitTextToSize(cell, colWidth - 4);
            doc.text(cellText, margin + (idx * colWidth), yPosition);
          });
          yPosition += 7;
        }
        
      } else if (line.length > 0) {
        // Regular paragraph
        doc.setFontSize(10);
        doc.setFont('helvetica', 'normal');
        doc.setTextColor(40, 40, 40);
        const splitText = doc.splitTextToSize(line, maxWidth);
        doc.text(splitText, margin, yPosition);
        yPosition += splitText.length * 5 + 3;
      }
    }

    // Add page numbers
    const pageCount = doc.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(150, 150, 150);
      doc.text(
        `Page ${i} of ${pageCount}`,
        pageWidth / 2,
        pageHeight - 10,
        { align: 'center' }
      );
    }
  }

  /**
   * Add professional cover page matching Neural Arc reference style
   */
  private static addCoverPage(doc: jsPDF, title: string): void {
    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();

    // White background
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, pageWidth, pageHeight, 'F');

    // Company Name at top (NEURAL ARC)
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(61, 74, 74);
    doc.text('NEURAL ARC', pageWidth / 2, 35, { align: 'center' });

    // Project Title (large, centered)
    doc.setFontSize(20);
    doc.setFont('helvetica', 'bold');
    doc.setTextColor(217, 120, 84); // Passion color
    const titleLines = doc.splitTextToSize(title, pageWidth - 40);
    let titleY = 70;
    titleLines.forEach((line: string) => {
      doc.text(line, pageWidth / 2, titleY, { align: 'center' });
      titleY += 10;
    });

    // Document Type (Proposal)
    doc.setFontSize(14);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(61, 74, 74);
    doc.text('Proposal', pageWidth / 2, titleY + 10, { align: 'center' });

    // Subtitle
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(100, 100, 100);
    doc.text('Implementation & Delivery', pageWidth / 2, titleY + 20, { align: 'center' });

    // RFQ Reference
    const rfqNumber = `RFQ ${Date.now().toString().slice(-8)}`;
    doc.setFontSize(11);
    doc.setTextColor(100, 100, 100);
    doc.text(rfqNumber, pageWidth / 2, titleY + 35, { align: 'center' });

    // Horizontal line
    doc.setDrawColor(217, 120, 84);
    doc.setLineWidth(0.5);
    doc.line(40, titleY + 45, pageWidth - 40, titleY + 45);

    // Tagline
    doc.setFontSize(10);
    doc.setFont('helvetica', 'italic');
    doc.setTextColor(120, 120, 120);
    doc.text('Pioneering Generative AI Solutions for Enterprise Excellence', 
      pageWidth / 2, pageHeight - 80, { align: 'center' });

    // Date
    doc.setFontSize(11);
    doc.setFont('helvetica', 'normal');
    doc.setTextColor(61, 74, 74);
    doc.text(
      new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long' }),
      pageWidth / 2,
      pageHeight - 60,
      { align: 'center' }
    );

    // Footer - Copyright
    doc.setFontSize(8);
    doc.setTextColor(150, 150, 150);
    doc.text('© 2025 Neural Arc Inc. All rights reserved.', pageWidth / 2, pageHeight - 25, { align: 'center' });
    doc.text('Confidential and Proprietary', pageWidth / 2, pageHeight - 18, { align: 'center' });
    
    // Bottom decorative line
    doc.setDrawColor(217, 120, 84);
    doc.setLineWidth(0.5);
    doc.line(40, pageHeight - 35, pageWidth - 40, pageHeight - 35);
  }

  /**
   * Download PDF file
   */
  static downloadPDF(blob: Blob, filename: string): void {
    const url = URL.createObjectURL(blob);
    const a = window.document.createElement('a');
    a.href = url;
    a.download = filename.endsWith('.pdf') ? filename : `${filename}.pdf`;
    a.click();
    URL.revokeObjectURL(url);
  }
}

