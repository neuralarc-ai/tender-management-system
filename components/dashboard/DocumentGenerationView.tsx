'use client';

import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Tender } from '@/types';
import { TenderPDFGenerator } from '@/lib/tenderPDFGenerator';
import { VisualDocumentEditor } from '@/components/admin/VisualDocumentEditor';
import axios from 'axios';
import { 
  RiFileTextLine, 
  RiDownloadLine, 
  RiRefreshLine, 
  RiEyeLine,
  RiCheckLine,
  RiLoader4Line,
  RiErrorWarningLine,
  RiSparklingLine,
  RiFileList3Line,
  RiTimeLine,
  RiCloseLine,
  RiFilePdfLine,
  RiEditLine,
  RiCheckboxCircleLine,
  RiCloseCircleLine,
  RiShareLine
} from 'react-icons/ri';

interface TenderDocument {
  id: string;
  tender_id: string;
  document_type: string;
  title: string;
  content: string | null;
  status: 'generating' | 'completed' | 'failed';
  generation_progress: number;
  page_count: number | null;
  word_count: number | null;
  created_at: string;
  updated_at: string;
  metadata: any;
  approval_status?: 'pending' | 'approved' | 'rejected';
  approved_at?: string | null;
}

export function DocumentGenerationView({ tenders }: { tenders: Tender[] }) {
  const [selectedTender, setSelectedTender] = useState<string | null>(null);
  const [previewDocument, setPreviewDocument] = useState<TenderDocument | null>(null);
  const [editingDocument, setEditingDocument] = useState<TenderDocument | null>(null);
  const [justEditedDocId, setJustEditedDocId] = useState<string | null>(null);
  const queryClient = useQueryClient();

  // Fetch all documents
  const { data: documentsData } = useQuery({
    queryKey: ['tender-documents'],
    queryFn: async () => {
      const allDocs: TenderDocument[] = [];
      for (const tender of tenders) {
        try {
          const response = await axios.get(`/api/tenders/${tender.id}/generate-document`);
          if (response.data.documents) {
            allDocs.push(...response.data.documents);
          }
        } catch (error) {
          console.error(`Error fetching documents for tender ${tender.id}:`, error);
        }
      }
      return allDocs;
    },
    refetchInterval: (query) => {
      // Refetch every 3 seconds if any document is generating
      const data = query.state.data;
      const hasGenerating = Array.isArray(data) && data.some(doc => doc.status === 'generating');
      return hasGenerating ? 3000 : false;
    }
  });

  const documents = documentsData || [];

  // Generate document mutation
  const generateDocument = useMutation({
    mutationFn: async ({ tenderId, documentType }: { tenderId: string; documentType: string }) => {
      const response = await axios.post(`/api/tenders/${tenderId}/generate-document`, {
        documentType
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tender-documents'] });
    }
  });

  // Save edited document
  const handleSaveDocument = async (content: string): Promise<void> => {
    if (!editingDocument) return;
    
    try {
      await axios.patch(
        `/api/tenders/${editingDocument.tender_id}/documents/${editingDocument.id}`,
        { content }
      );
      
      // Mark as just edited so we can show "Send Updated PDF" button
      setJustEditedDocId(editingDocument.id);
      
      // Refresh documents
      queryClient.invalidateQueries({ queryKey: ['tender-documents'] });
      
      // Close editor
      setEditingDocument(null);
      
      // Show success message
      alert('✓ Document saved successfully! Click "Send Updated PDF to Partner" to share the changes.');
    } catch (error) {
      console.error('Error saving document:', error);
      throw error;
    }
  };

  // Approve document mutation
  const approveDocument = useMutation({
    mutationFn: async ({ documentId, tenderId, approval_status, sendUpdate }: { 
      documentId: string; 
      tenderId: string; 
      approval_status: 'approved' | 'pending' | 'rejected';
      sendUpdate?: boolean;
    }) => {
      const response = await axios.patch(
        `/api/tenders/${tenderId}/documents/${documentId}/approve`,
        { approval_status }
      );
      return { ...response.data, sendUpdate };
    },
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['tender-documents'] });
      
      // Clear the just-edited flag
      setJustEditedDocId(null);
      
      const message = data.sendUpdate
        ? '✓ Updated PDF sent to partner! The old version has been replaced.'
        : data.approval_status === 'approved' 
        ? '✓ Document approved! Partners can now see this document.'
        : data.approval_status === 'rejected'
        ? '✓ Document rejected.'
        : '✓ Approval revoked. Document is now pending.';
      alert(message);
    },
    onError: () => {
      alert('✗ Failed to update approval status. Please try again.');
    }
  });

  // Group documents by status
  const generatingDocs = documents.filter(d => d.status === 'generating');
  const completedDocs = documents.filter(d => d.status === 'completed');
  const failedDocs = documents.filter(d => d.status === 'failed');

  return (
    <>
    <div className="space-y-6 animate-in fade-in duration-300">
      {/* Header */}
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-3xl font-bold text-neural flex items-center gap-3">
            <RiSparklingLine className="text-passion" />
            Document Generation Center
          </h2>
          <p className="text-gray-500 mt-1">AI-powered professional tender documents using Gemini 3 Pro</p>
        </div>
        <div className="flex gap-3">
          <Button 
            variant="outline"
            onClick={() => queryClient.invalidateQueries({ queryKey: ['tender-documents'] })}
            className="rounded-full"
          >
            <RiRefreshLine className="mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <StatCard
          label="Total Documents"
          value={documents.length}
          icon={<RiFileTextLine />}
          color="neural"
        />
        <StatCard
          label="Generating"
          value={generatingDocs.length}
          icon={<RiLoader4Line className="animate-spin" />}
          color="passion"
        />
        <StatCard
          label="Completed"
          value={completedDocs.length}
          icon={<RiCheckLine />}
          color="verdant"
        />
        <StatCard
          label="Failed"
          value={failedDocs.length}
          icon={<RiErrorWarningLine />}
          color="red"
        />
      </div>

      {/* Generate New Document Section */}
      {tenders.length > 0 && (
        <Card className="p-6 rounded-3xl border-2 border-dashed border-gray-200 hover:border-passion transition-colors">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-bold text-neural mb-1">Generate New Document</h3>
              <p className="text-sm text-gray-600">Select a tender to generate a professional document</p>
            </div>
            <div className="flex gap-3">
              <select
                value={selectedTender || ''}
                onChange={(e) => setSelectedTender(e.target.value)}
                className="px-4 py-2 border-2 border-gray-200 rounded-2xl focus:outline-none focus:border-passion"
              >
                <option value="">Select Tender...</option>
                {tenders.map(tender => (
                  <option key={tender.id} value={tender.id}>
                    {tender.title}
                  </option>
                ))}
              </select>
              <Button
                onClick={() => selectedTender && generateDocument.mutate({ 
                  tenderId: selectedTender, 
                  documentType: 'full' 
                })}
                disabled={!selectedTender || generateDocument.isPending}
                className="rounded-full bg-passion hover:bg-passion-dark"
              >
                <RiSparklingLine className="mr-2" />
                Generate Document
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Generating Documents */}
      {generatingDocs.length > 0 && (
        <div>
          <h3 className="font-bold text-neural mb-4 flex items-center gap-2">
            <RiLoader4Line className="animate-spin text-passion" />
            Currently Generating ({generatingDocs.length})
          </h3>
          <div className="space-y-3">
            {generatingDocs.map(doc => (
              <GeneratingDocumentCard key={doc.id} document={doc} />
            ))}
          </div>
        </div>
      )}

      {/* Completed Documents */}
      {completedDocs.length > 0 && (
        <div>
          <h3 className="font-bold text-neural mb-4 flex items-center gap-2">
            <RiCheckLine className="text-verdant" />
            Ready to Download ({completedDocs.length})
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {completedDocs.map(doc => (
              <CompletedDocumentCard 
                key={doc.id} 
                document={doc}
                onPreview={() => setPreviewDocument(doc)}
                onEdit={() => {
                  setJustEditedDocId(null); // Clear flag when opening editor
                  setEditingDocument(doc);
                }}
                onApprove={(status, sendUpdate) => approveDocument.mutate({ 
                  documentId: doc.id, 
                  tenderId: doc.tender_id, 
                  approval_status: status,
                  sendUpdate 
                })}
                isApproving={approveDocument.isPending}
                wasJustEdited={doc.id === justEditedDocId}
              />
            ))}
          </div>
        </div>
      )}

      {/* Failed Documents */}
      {failedDocs.length > 0 && (
        <div>
          <h3 className="font-bold text-neural mb-4 flex items-center gap-2">
            <RiErrorWarningLine className="text-red-500" />
            Failed Generation ({failedDocs.length})
          </h3>
          <div className="space-y-3">
            {failedDocs.map(doc => (
              <FailedDocumentCard 
                key={doc.id} 
                document={doc}
                onRetry={() => {
                  const tender = tenders.find(t => t.id === doc.tender_id);
                  if (tender) {
                    generateDocument.mutate({ 
                      tenderId: tender.id, 
                      documentType: doc.document_type 
                    });
                  }
                }}
              />
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {documents.length === 0 && (
        <Card className="p-12 rounded-3xl text-center">
          <RiFileList3Line className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-neural mb-2">No Documents Yet</h3>
          <p className="text-gray-600 mb-6">
            Generate professional tender documents automatically when partners submit tenders
          </p>
          <Button
            onClick={() => tenders.length > 0 && setSelectedTender(tenders[0].id)}
            disabled={tenders.length === 0}
            className="rounded-full bg-passion hover:bg-passion-dark"
          >
            <RiSparklingLine className="mr-2" />
            Generate First Document
          </Button>
        </Card>
      )}

      {/* Preview Modal */}
      {previewDocument && (
        <DocumentPreviewModal
          document={previewDocument}
          onClose={() => setPreviewDocument(null)}
        />
      )}

      {/* Document Editor */}
      {editingDocument && (
        <VisualDocumentEditor
          documentId={editingDocument.id}
          initialContent={editingDocument.content || ''}
          title={editingDocument.title}
          onSave={handleSaveDocument}
          onClose={() => setEditingDocument(null)}
        />
      )}
    </div>
    </>
  );
}

// Stat Card Component
function StatCard({ label, value, icon, color }: { 
  label: string; 
  value: number; 
  icon: React.ReactNode; 
  color: string;
}) {
  const colorClasses = {
    neural: 'bg-neural text-white',
    passion: 'bg-passion text-white',
    verdant: 'bg-verdant text-white',
    red: 'bg-red-500 text-white'
  };

  return (
    <Card className="p-4 rounded-2xl">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-xs text-gray-500 font-bold uppercase tracking-wider mb-1">{label}</p>
          <p className="text-2xl font-black text-neural">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${colorClasses[color as keyof typeof colorClasses]}`}>
          {icon}
        </div>
      </div>
    </Card>
  );
}

// Generating Document Card
function GeneratingDocumentCard({ document }: { document: TenderDocument }) {
  return (
    <Card className="p-6 rounded-3xl border-2 border-passion-light bg-passion-light/5">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-passion rounded-xl flex items-center justify-center flex-shrink-0">
          <RiLoader4Line className="text-white w-6 h-6 animate-spin" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-neural mb-1 truncate">{document.title}</h4>
          <p className="text-sm text-gray-600 mb-3">
            Generating with Gemini 3 Pro... {document.generation_progress}% complete
          </p>
          <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-passion to-verdant transition-all duration-500"
              style={{ width: `${document.generation_progress}%` }}
            />
          </div>
          <p className="text-xs text-gray-500 mt-2">
            Started {new Date(document.created_at).toLocaleTimeString()}
          </p>
        </div>
      </div>
    </Card>
  );
}

// Completed Document Card
function CompletedDocumentCard({ 
  document: doc, 
  onPreview,
  onEdit,
  onApprove,
  isApproving,
  wasJustEdited
}: { 
  document: TenderDocument;
  onPreview: () => void;
  onEdit: () => void;
  onApprove: (status: 'approved' | 'pending' | 'rejected', sendUpdate?: boolean) => void;
  isApproving: boolean;
  wasJustEdited: boolean;
}) {
  const isApproved = doc.approval_status === 'approved';
  const isRejected = doc.approval_status === 'rejected';
  const isPending = !doc.approval_status || doc.approval_status === 'pending';
  
  // Check if document was edited after approval
  const wasEditedAfterApproval = isApproved && doc.approved_at && doc.updated_at && 
    new Date(doc.updated_at) > new Date(doc.approved_at);

  return (
    <Card className={`p-6 rounded-3xl hover:shadow-lg transition-shadow ${
      isApproved ? 'ring-2 ring-verdant/30 bg-verdant/5' : 
      isRejected ? 'ring-2 ring-red-300/30 bg-red-50/30' : ''
    }`}>
      <div className="flex items-start gap-3 mb-4">
        <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${
          isApproved ? 'bg-verdant' : isRejected ? 'bg-red-500' : 'bg-gray-400'
        }`}>
          <RiFileTextLine className="text-white w-6 h-6" />
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="font-bold text-neural mb-1 text-sm truncate">{doc.title}</h4>
          <div className="flex items-center gap-2 text-xs">
            {isApproved && (
              <>
                <RiCheckboxCircleLine className="text-verdant" />
                <span className="text-verdant font-semibold">Approved & Shared</span>
              </>
            )}
            {isRejected && (
              <>
                <RiCloseCircleLine className="text-red-500" />
                <span className="text-red-500 font-semibold">Rejected</span>
              </>
            )}
            {isPending && (
              <>
                <RiCheckLine className="text-gray-400" />
                <span className="text-gray-600">Pending Approval</span>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-2 gap-2 mb-4 text-xs">
        <div className="bg-gray-50 p-2 rounded-xl">
          <p className="text-gray-500 font-bold uppercase tracking-wider mb-0.5">Pages</p>
          <p className="font-black text-neural">{doc.page_count || 0}</p>
        </div>
        <div className="bg-gray-50 p-2 rounded-xl">
          <p className="text-gray-500 font-bold uppercase tracking-wider mb-0.5">Words</p>
          <p className="font-black text-neural">{doc.word_count?.toLocaleString() || 0}</p>
        </div>
      </div>

      <div className="space-y-2">
        <div className="grid grid-cols-3 gap-2">
        <Button
          variant="outline"
          size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onPreview();
            }}
            className="rounded-full text-xs"
        >
          <RiEyeLine className="mr-1" />
          Preview
        </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              onEdit();
            }}
            className="rounded-full text-xs bg-aurora/10 hover:bg-aurora/20 border-aurora/30"
          >
            <RiEditLine className="mr-1" />
            Edit
          </Button>
        <Button
          size="sm"
            onClick={(e) => {
              e.stopPropagation();
            try {
              // Generate PDF from markdown content
              const pdfBlob = TenderPDFGenerator.generatePDF({
                title: doc.title,
                content: doc.content || '',
                metadata: {
                    author: 'Neural Arc Inc',
                  subject: 'Tender Document',
                  keywords: 'tender, rfp, procurement'
                }
              });

              // Download PDF
              TenderPDFGenerator.downloadPDF(pdfBlob, `${doc.title}.pdf`);
            } catch (error) {
              console.error('PDF generation error:', error);
              alert('Failed to generate PDF. Please try again.');
            }
          }}
            className="rounded-full bg-passion hover:bg-passion-dark text-xs"
        >
          <RiFilePdfLine className="mr-1" />
          PDF
        </Button>
        </div>

        {/* Approval Actions */}
        <div className="pt-2 border-t">
          {/* Show "Send Updated PDF" button if just edited or edited after approval */}
          {(wasJustEdited || wasEditedAfterApproval) && isApproved ? (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Send updated PDF to partner? This will replace the existing document.')) {
                  onApprove('approved', true);
                }
              }}
              disabled={isApproving}
              className="w-full rounded-full bg-passion hover:bg-passion-dark text-white text-xs font-bold animate-pulse"
            >
              <RiShareLine className="mr-1" />
              {isApproving ? 'Sending...' : '📤 Send Updated PDF to Partner'}
            </Button>
          ) : !isApproved ? (
            <Button
              size="sm"
              onClick={(e) => {
                e.stopPropagation();
                if (confirm('Send this PDF to partner? They will be able to view and download it.')) {
                  onApprove('approved', false);
                }
              }}
              disabled={isApproving}
              className="w-full rounded-full bg-verdant hover:bg-verdant-dark text-white text-xs font-bold"
            >
              <RiShareLine className="mr-1" />
              {isApproving ? 'Approving...' : 'Send PDF to Partner'}
            </Button>
          ) : (
            <div className="grid grid-cols-2 gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={(e) => {
                  e.stopPropagation();
                  if (confirm('Revoke access? Partner will no longer see this document.')) {
                    onApprove('pending', false);
                  }
                }}
                disabled={isApproving}
                className="rounded-full text-xs"
              >
                <RiCloseCircleLine className="mr-1" />
                Revoke
              </Button>
              <div className="flex items-center justify-center text-xs text-verdant font-semibold">
                <RiCheckboxCircleLine className="mr-1" />
                Sent
              </div>
            </div>
          )}
        </div>
        
        {/* Warning if edited after approval */}
        {wasEditedAfterApproval && !wasJustEdited && (
          <div className="text-xs text-orange-600 font-semibold text-center bg-orange-50 py-2 px-3 rounded-lg">
            ⚠️ Document edited after sending. Click button above to update partner's PDF.
          </div>
        )}
      </div>

      <p className="text-xs text-gray-500 mt-3 text-center">
        {new Date(doc.created_at).toLocaleString()}
        {isApproved && doc.approved_at && (
          <span className="block text-verdant mt-1">
            ✓ Approved {new Date(doc.approved_at).toLocaleDateString()}
          </span>
        )}
      </p>
    </Card>
  );
}

// Failed Document Card
function FailedDocumentCard({ 
  document, 
  onRetry 
}: { 
  document: TenderDocument;
  onRetry: () => void;
}) {
  return (
    <Card className="p-6 rounded-3xl border-2 border-red-200 bg-red-50">
      <div className="flex items-start gap-4">
        <div className="w-12 h-12 bg-red-500 rounded-xl flex items-center justify-center flex-shrink-0">
          <RiErrorWarningLine className="text-white w-6 h-6" />
        </div>
        <div className="flex-1">
          <h4 className="font-bold text-neural mb-1">{document.title}</h4>
          <p className="text-sm text-red-700 mb-3">
            Generation failed: {document.metadata?.error || 'Unknown error'}
          </p>
          <Button
            onClick={onRetry}
            variant="outline"
            size="sm"
            className="rounded-full border-red-300"
          >
            <RiRefreshLine className="mr-2" />
            Retry Generation
          </Button>
        </div>
      </div>
    </Card>
  );
}

// Document Preview Modal
function DocumentPreviewModal({ 
  document, 
  onClose 
}: { 
  document: TenderDocument;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-6 border-b">
          <div>
            <h3 className="font-bold text-neural">{document.title}</h3>
            <p className="text-sm text-gray-600">
              {document.page_count} pages • {document.word_count?.toLocaleString()} words
            </p>
          </div>
          <Button variant="ghost" onClick={onClose} className="rounded-full">
            <RiCloseLine className="w-6 h-6" />
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-6 prose max-w-none">
          <pre className="whitespace-pre-wrap font-sans text-sm">
            {document.content}
          </pre>
        </div>
      </div>
    </div>
  );
}

