'use client';

import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { RiCloseLine, RiDownloadLine, RiZoomInLine, RiZoomOutLine } from 'react-icons/ri';
import { TenderPDFGenerator } from '@/lib/tenderPDFGenerator';

interface PDFPreviewModalProps {
  document: {
    id: string;
    title: string;
    content: string;
    page_count: number | null;
    word_count: number | null;
  };
  onClose: () => void;
}

export function PDFPreviewModal({ document, onClose }: PDFPreviewModalProps) {
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [zoom, setZoom] = useState(100);

  useEffect(() => {
    // Generate PDF and create URL for preview
    try {
      const pdfBlob = TenderPDFGenerator.generatePDF({
        title: document.title,
        content: document.content,
        metadata: {
          author: 'DCS Corporation',
          subject: 'Tender Document - RFQ'
        }
      });
      const url = URL.createObjectURL(pdfBlob);
      setPdfUrl(url);

      // Cleanup on unmount
      return () => {
        if (url) URL.revokeObjectURL(url);
      };
    } catch (error) {
      console.error('PDF preview error:', error);
    }
  }, [document]);

  const handleDownload = () => {
    if (pdfUrl) {
      const a = window.document.createElement('a');
      a.href = pdfUrl;
      a.download = `${document.title}.pdf`;
      a.click();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full h-full max-w-7xl max-h-[95vh] overflow-hidden flex flex-col shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200 bg-gray-50">
          <div>
            <h3 className="font-bold text-neural text-lg">{document.title}</h3>
            <p className="text-sm text-gray-600 mt-1">
              {document.page_count} pages • {document.word_count?.toLocaleString()} words • PDF Preview
            </p>
          </div>
          <div className="flex items-center gap-2">
            <div className="flex items-center gap-1 bg-white rounded-full p-1 border border-gray-200">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.max(50, zoom - 25))}
                disabled={zoom <= 50}
                className="rounded-full h-8 w-8 p-0"
              >
                <RiZoomOutLine className="w-4 h-4" />
              </Button>
              <span className="text-xs font-bold text-neural px-2 min-w-[50px] text-center">
                {zoom}%
              </span>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setZoom(Math.min(200, zoom + 25))}
                disabled={zoom >= 200}
                className="rounded-full h-8 w-8 p-0"
              >
                <RiZoomInLine className="w-4 h-4" />
              </Button>
            </div>
            <Button
              onClick={handleDownload}
              className="rounded-full bg-passion hover:bg-passion-dark"
            >
              <RiDownloadLine className="mr-2" />
              Download PDF
            </Button>
            <Button
              variant="ghost"
              onClick={onClose}
              className="rounded-full"
            >
              <RiCloseLine className="w-6 h-6" />
            </Button>
          </div>
        </div>

        {/* PDF Viewer */}
        <div className="flex-1 overflow-auto bg-gray-100 p-4">
          {pdfUrl ? (
            <div 
              className="mx-auto bg-white shadow-2xl"
              style={{ 
                width: `${(210 * zoom) / 100}mm`,
                transition: 'width 0.2s'
              }}
            >
              <iframe
                src={pdfUrl}
                className="w-full border-0"
                style={{ 
                  height: `${(297 * zoom) / 100}mm`,
                  minHeight: '800px'
                }}
                title="PDF Preview"
              />
            </div>
          ) : (
            <div className="flex items-center justify-center h-full">
              <div className="text-center">
                <div className="w-16 h-16 border-4 border-passion border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                <p className="text-gray-600 font-medium">Generating PDF preview...</p>
              </div>
            </div>
          )}
        </div>

        {/* Footer Instructions */}
        <div className="p-4 bg-gray-50 border-t border-gray-200">
          <p className="text-xs text-gray-600 text-center">
            💡 Use zoom controls to adjust view • Click Download to save PDF file
          </p>
        </div>
      </div>
    </div>
  );
}

