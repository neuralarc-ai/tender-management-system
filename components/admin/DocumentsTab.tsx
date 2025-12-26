'use client';

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { TenderPDFGenerator } from '@/lib/tenderPDFGenerator';
import { PDFPreviewModal } from './PDFPreviewModal';
import axios from 'axios';
import {
  RiFileTextLine,
  RiDownloadLine,
  RiEyeLine,
  RiCheckLine,
  RiCloseLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiFilePdfLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiAlertLine
} from 'react-icons/ri';

interface DocumentsTabProps {
  tenderId: string;
  currentUserId: string;
  currentUserRole: 'admin' | 'client';
}

interface TenderDocument {
  id: string;
  tender_id: string;
  title: string;
  content: string | null;
  status: 'generating' | 'completed' | 'failed';
  generation_progress: number;
  approval_status: 'pending' | 'approved' | 'rejected';
  approved_by: string | null;
  approved_at: string | null;
  rejection_reason: string | null;
  page_count: number | null;
  word_count: number | null;
  created_at: string;
}

export function DocumentsTab({ tenderId, currentUserId, currentUserRole }: DocumentsTabProps) {
  const [previewDocument, setPreviewDocument] = useState<TenderDocument | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const queryClient = useQueryClient();

  // Fetch documents for this tender
  const { data: documentsData, isLoading } = useQuery({
    queryKey: ['tender-documents', tenderId],
    queryFn: async () => {
      const response = await axios.get(`/api/tenders/${tenderId}/generate-document`);
      return response.data.documents || [];
    },
    refetchInterval: (query) => {
      const data = query.state.data;
      const hasGenerating = Array.isArray(data) && data.some((doc: TenderDocument) => doc.status === 'generating');
      return hasGenerating ? 3000 : false;
    }
  });

  const documents: TenderDocument[] = documentsData || [];

  // Partners see all their documents (with approval status indicators)
  // Admins see all documents
  const filteredDocuments = documents;

  // Approval mutation
  const approveDocument = useMutation({
    mutationFn: async ({ documentId, action, reason }: { documentId: string; action: 'approve' | 'reject'; reason?: string }) => {
      const response = await axios.patch(`/api/documents/${documentId}/approve`, {
        action,
        userId: currentUserId,
        rejectionReason: reason
      });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tender-documents', tenderId] });
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      alert(`✓ Document ${variables.action === 'approve' ? 'approved' : 'rejected'} successfully!`);
      setRejectionReason('');
    }
  });

  if (isLoading) {
    return (
      <div className="flex items-center justify-center py-12">
        <RiLoader4Line className="w-8 h-8 animate-spin text-passion" />
      </div>
    );
  }

  if (filteredDocuments.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-3xl">
        <RiFileTextLine className="w-16 h-16 text-gray-300 mx-auto mb-4" />
        <h3 className="font-bold text-neural mb-2">
          {currentUserRole === 'client' ? 'No Approved Documents Yet' : 'No Documents Generated Yet'}
        </h3>
        <p className="text-sm text-gray-600">
          {currentUserRole === 'client' 
            ? 'Neural Arc Inc will share documents here once they are approved.'
            : 'Documents will be automatically generated when the tender is submitted.'}
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {filteredDocuments.map((doc) => (
        <div key={doc.id} className="bg-white border-2 border-gray-100 rounded-3xl p-6 hover:shadow-md transition-shadow">
          {/* Document Header */}
          <div className="flex items-start gap-4 mb-4">
            <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 ${
              doc.status === 'completed' 
                ? 'bg-verdant' 
                : doc.status === 'generating' 
                ? 'bg-passion' 
                : 'bg-red-500'
            }`}>
              {doc.status === 'completed' ? (
                <RiFileTextLine className="text-white w-7 h-7" />
              ) : doc.status === 'generating' ? (
                <RiLoader4Line className="text-white w-7 h-7 animate-spin" />
              ) : (
                <RiErrorWarningLine className="text-white w-7 h-7" />
              )}
            </div>
            
            <div className="flex-1">
              <h4 className="font-bold text-neural mb-1">{doc.title}</h4>
              <div className="flex items-center gap-4 text-sm">
                <span className={`font-bold uppercase tracking-wider text-xs ${
                  doc.status === 'completed' ? 'text-verdant' :
                  doc.status === 'generating' ? 'text-passion' :
                  'text-red-500'
                }`}>
                  {doc.status === 'completed' ? '✓ Generated' : doc.status === 'generating' ? 'Generating...' : '✗ Failed'}
                </span>
                
                {doc.status === 'completed' && (
                  <>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{doc.page_count} pages</span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-600">{doc.word_count?.toLocaleString()} words</span>
                  </>
                )}
              </div>
              
              {doc.status === 'generating' && (
                <div className="mt-3 w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="h-full bg-gradient-to-r from-passion to-verdant rounded-full transition-all"
                    style={{ width: `${doc.generation_progress}%` }}
                  />
                </div>
              )}
            </div>
          </div>

          {/* Approval Status */}
          {doc.status === 'completed' && (
            <div className={`mb-4 p-4 rounded-2xl border-2 ${
              doc.approval_status === 'approved' 
                ? 'bg-verdant-light/10 border-verdant-light' 
                : doc.approval_status === 'rejected'
                ? 'bg-red-50 border-red-200'
                : 'bg-amber-50 border-amber-200'
            }`}>
              <div className="flex items-center gap-2 mb-1">
                {doc.approval_status === 'approved' ? (
                  <>
                    <RiCheckboxCircleLine className="text-verdant w-5 h-5" />
                    <span className="font-bold text-verdant">Approved by Neural Arc Inc</span>
                  </>
                ) : doc.approval_status === 'rejected' ? (
                  <>
                    <RiCloseCircleLine className="text-red-600 w-5 h-5" />
                    <span className="font-bold text-red-600">Rejected by Neural Arc Inc</span>
                  </>
                ) : (
                  <>
                    <RiAlertLine className="text-amber-600 w-5 h-5" />
                    <span className="font-bold text-amber-600">Pending Neural Arc Inc Approval</span>
                  </>
                )}
              </div>
              
              {doc.approved_at && (
                <p className="text-xs text-gray-600">
                  {new Date(doc.approved_at).toLocaleString()}
                </p>
              )}
              
              {doc.rejection_reason && (
                <p className="text-sm text-red-700 mt-2">
                  Reason: {doc.rejection_reason}
                </p>
              )}
            </div>
          )}

          {/* Actions */}
          {doc.status === 'completed' && (
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPreviewDocument(doc)}
                className="flex-1 rounded-full"
              >
                <RiEyeLine className="mr-2" />
                Preview
              </Button>
              
              <Button
                size="sm"
                onClick={() => {
                  // Partners can only download approved documents
                  if (currentUserRole === 'client' && doc.approval_status !== 'approved') {
                    alert('This document is pending approval from Neural Arc Inc. You will be able to download it once it is approved.');
                    return;
                  }
                  
                  try {
                    const pdfBlob = TenderPDFGenerator.generatePDF({
                      title: doc.title,
                      content: doc.content || '',
                      metadata: {
                        author: 'DCS Corporation',
                        subject: 'Tender Document'
                      }
                    });
                    TenderPDFGenerator.downloadPDF(pdfBlob, `${doc.title}.pdf`);
                  } catch (error) {
                    console.error('PDF generation error:', error);
                    alert('Failed to generate PDF');
                  }
                }}
                disabled={currentUserRole === 'client' && doc.approval_status !== 'approved'}
                className={`flex-1 rounded-full ${
                  currentUserRole === 'client' && doc.approval_status !== 'approved'
                    ? 'opacity-50 cursor-not-allowed'
                    : 'bg-passion hover:bg-passion-dark'
                }`}
              >
                <RiFilePdfLine className="mr-2" />
                {currentUserRole === 'client' && doc.approval_status !== 'approved' 
                  ? '🔒 Awaiting Approval' 
                  : 'Download PDF'}
              </Button>

              {/* Admin Approval Actions */}
              {currentUserRole === 'admin' && doc.approval_status === 'pending' && (
                <>
                  <Button
                    size="sm"
                    onClick={() => approveDocument.mutate({ documentId: doc.id, action: 'approve' })}
                    disabled={approveDocument.isPending}
                    className="rounded-full bg-verdant hover:bg-verdant/90"
                  >
                    <RiCheckLine className="mr-2" />
                    Approve
                  </Button>
                  
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      const reason = prompt('Rejection reason:');
                      if (reason) {
                        approveDocument.mutate({ documentId: doc.id, action: 'reject', reason });
                      }
                    }}
                    disabled={approveDocument.isPending}
                    className="rounded-full border-red-300 text-red-600 hover:bg-red-50"
                  >
                    <RiCloseCircleLine className="mr-2" />
                    Reject
                  </Button>
                </>
              )}
            </div>
          )}
        </div>
      ))}

      {/* Preview Modal - Professional PDF View */}
      {previewDocument && (
        <PDFPreviewModal
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}
    </div>
  );
}

