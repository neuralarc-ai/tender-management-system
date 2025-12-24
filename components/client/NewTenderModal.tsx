import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RiUploadLine, RiCloseLine, RiSendPlaneLine, RiFileLine, RiDeleteBinLine, RiCheckLine, RiMagicLine, RiEditLine, RiAlertLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { UploadedFile } from '@/types';
import axios from 'axios';

interface NewTenderModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface TenderFormData {
  title: string;
  description: string;
  scopeOfWork: string;
  technicalRequirements: string;
  functionalRequirements: string;
  submissionDeadline: string;
  eligibilityCriteria: string;
}

export function NewTenderModal({ isOpen, onClose }: NewTenderModalProps) {
  const [uploadedFiles, setUploadedFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isParsing, setIsParsing] = useState(false);
  const [parsingStep, setParsingStep] = useState(0);
  const [parsedData, setParsedData] = useState<any>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [showDetailedForm, setShowDetailedForm] = useState(false);
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors }, setValue, watch } = useForm<TenderFormData>();

  // AI parsing steps for animation
  const parsingSteps = [
    { icon: '📄', label: 'Reading Document', description: 'Processing uploaded files' },
    { icon: '🔍', label: 'Analyzing Content', description: 'Understanding document structure' },
    { icon: '🎯', label: 'Extracting Fields', description: 'Identifying key information' },
    { icon: '✅', label: 'Validating Data', description: 'Ensuring accuracy' },
    { icon: '✨', label: 'Finalizing', description: 'Preparing results' }
  ];

  const createTender = useMutation({
    mutationFn: async (data: TenderFormData & { documents: UploadedFile[] }) => {
      // Use the client user UUID from database
      // Client: partner@dcs.com (PIN: 1111)
      const response = await axios.post('/api/tenders', { 
        ...data, 
        createdBy: '11111111-1111-1111-1111-111111111111' 
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      setShowSuccess(true);
      
      setTimeout(() => {
      reset();
      setUploadedFiles([]);
        setShowSuccess(false);
      onClose();
      }, 2000);
    },
    onError: (error: any) => {
      console.error('Tender submission error:', error);
      
      // Check for deadline constraint error
      const errorMessage = error.response?.data?.details || error.message || '';
      if (errorMessage.includes('submission_deadline_future') || errorMessage.includes('deadline')) {
        setParseError('⚠️ The deadline extracted from the document is in the past. Please set a future deadline and try again.');
        // Show the detailed form so user can edit the deadline
        setShowDetailedForm(true);
      } else {
        alert('Error submitting tender. Please check all required fields and try again.');
      }
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
    setParseError(null);
    const newFiles: UploadedFile[] = [];

    for (let i = 0; i < files.length; i++) {
      const file = files[i];
      const formData = new FormData();
      formData.append('file', file);

      try {
        const response = await axios.post('/api/upload', formData, {
          headers: { 'Content-Type': 'multipart/form-data' }
        });
        newFiles.push(response.data);
      } catch (error) {
        console.error('Upload failed', error);
        alert(`Failed to upload ${file.name}`);
      }
    }

    setUploadedFiles(prev => [...prev, ...newFiles]);
    setIsUploading(false);

    // Auto-trigger parsing if documents uploaded
    if (newFiles.length > 0) {
      handleParseDocuments([...uploadedFiles, ...newFiles]);
    }
  };

  const handleParseDocuments = async (documents: UploadedFile[]) => {
    if (documents.length === 0) return;

    setIsParsing(true);
    setParseError(null);
    setParsingStep(0);

    // Start time for calculating duration
    const startTime = Date.now();

    try {
      // Start animation - faster progression initially
      const animationPromise = new Promise<void>((resolve) => {
        let currentStep = 0;
        const stepDuration = 2000; // 2 seconds per step initially
        
        const stepInterval = setInterval(() => {
          currentStep++;
          if (currentStep < parsingSteps.length) {
            setParsingStep(currentStep);
          } else {
            clearInterval(stepInterval);
            resolve();
          }
        }, stepDuration);

        // Store interval ID to clear later if needed
        (window as any).__parsingInterval = stepInterval;
      });

      // Make API call
      const apiPromise = axios.post('/api/tenders/parse-documents', {
        documents
      });

      // Wait for API response
      const response = await apiPromise;

      // Calculate elapsed time
      const elapsed = Date.now() - startTime;
      
      // If animation finished too early, wait a bit
      if (elapsed < parsingSteps.length * 2000) {
        await animationPromise;
      } else {
        // API took longer, complete animation quickly
        clearInterval((window as any).__parsingInterval);
        setParsingStep(parsingSteps.length - 1);
      }

      if (response.data.success) {
        const data = response.data.data;
        setParsedData(data);

        // Auto-fill form fields
        setValue('title', data.title || '');
        setValue('description', data.description || '');
        setValue('scopeOfWork', data.scopeOfWork || '');
        setValue('technicalRequirements', data.technicalRequirements || '');
        setValue('functionalRequirements', data.functionalRequirements || '');
        setValue('eligibilityCriteria', data.eligibilityCriteria || '');
        if (data.submissionDeadline) {
          setValue('submissionDeadline', data.submissionDeadline);
        }

        // Show validation warnings if any
        if (response.data.validation && response.data.validation.errors.length > 0) {
          setParseError(`Please review: ${response.data.validation.errors.join(', ')}`);
        }
      }
    } catch (error: any) {
      clearInterval((window as any).__parsingInterval);
      console.error('Document parsing failed:', error);
      setParseError(
        error.response?.data?.message || 
        'Failed to parse documents. You can still fill the form manually.'
      );
    } finally {
      setIsParsing(false);
      setParsingStep(0);
      delete (window as any).__parsingInterval;
    }
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: TenderFormData) => {
    // Validate deadline is in the future
    const deadline = new Date(data.submissionDeadline);
    const now = new Date();
    
    if (deadline <= now) {
      setParseError('⚠️ Submission deadline must be in the future. Please update the deadline.');
      setShowDetailedForm(true);
      return;
    }
    
    createTender.mutate({
      ...data,
      documents: uploadedFiles
    });
  };

  const handleReset = () => {
    reset();
    setUploadedFiles([]);
    setParsedData(null);
    setParseError(null);
    setShowDetailedForm(false);
  };

  if (!isOpen) return null;

  if (showSuccess) {
    return (
      <div className="fixed inset-0 bg-neural/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-md p-12 text-center animate-in fade-in zoom-in duration-300">
          <div className="w-20 h-20 bg-verdant rounded-full flex items-center justify-center mx-auto mb-6 animate-bounce">
            <RiCheckLine className="text-white" size={48} />
          </div>
          <h3 className="text-2xl font-black text-neural mb-3 uppercase tracking-tight">Success!</h3>
          <p className="text-sm text-gray-500 font-medium">
            Your tender has been submitted successfully.<br />AI analysis will begin shortly.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-neural/60 backdrop-blur-sm z-50 flex items-center justify-center p-4 font-sans">
      <div className="bg-white rounded-[40px] shadow-2xl w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-8 border-b border-gray-100 sticky top-0 bg-white z-10 rounded-t-[40px]">
          <div>
            <h2 className="text-2xl font-black text-neural uppercase tracking-tight">New Tender</h2>
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">
              {parsedData ? '✨ AI-Extracted Information' : '🚀 Quick Upload with Smart Parsing'}
            </p>
          </div>
          <button 
            onClick={() => {
              handleReset();
              onClose();
            }} 
            className="text-gray-400 hover:text-neural transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-3"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          {/* Smart Upload Section - Always Visible */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                📄 Upload Tender Documents
              </label>
              {parsedData && (
                <div className="flex items-center gap-2 text-xs font-bold text-verdant">
                  <RiCheckLine className="w-4 h-4" />
                  <span>Parsed {uploadedFiles.length} document(s)</span>
                </div>
              )}
            </div>

            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:border-passion hover:bg-passion-light/10 transition-all cursor-pointer relative group">
              <input 
                type="file" 
                multiple 
                accept=".pdf,.doc,.docx,.xls,.xlsx,.txt"
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading || isParsing}
              />
              <div className="flex flex-col items-center gap-3">
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform ${
                  isParsing ? 'bg-passion animate-pulse' : 'bg-passion-light/30'
                }`}>
                  {isParsing ? (
                    <RiMagicLine className="text-white w-8 h-8 animate-spin" />
                  ) : (
                    <RiUploadLine className="text-passion w-8 h-8" />
                  )}
                </div>
                <div>
                  <p className="text-neural-light font-bold">
                    {isParsing ? '✨ AI is reading your documents...' : 'Drop tender documents here or click to upload'}
                  </p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">
                    PDF, DOC, DOCX, XLS, XLSX - AI extracts all information automatically
                  </p>
                </div>
              </div>
            </div>
            
            {isUploading && (
              <div className="flex items-center gap-3 justify-center">
                <div className="w-5 h-5 border-3 border-passion-light border-t-passion rounded-full animate-spin"></div>
                <p className="text-sm text-passion font-bold uppercase tracking-wider animate-pulse">Uploading files...</p>
              </div>
            )}

            {isParsing && (
              <div className="relative bg-white border-2 border-gray-100 rounded-3xl p-8 shadow-lg">
                {/* Animated gradient background */}
                <div className="absolute inset-0 bg-gradient-to-r from-passion-light/5 via-verdant-light/5 to-passion-light/5 rounded-3xl animate-pulse" />
                
                {/* Content */}
                <div className="relative">
                  {/* Current Step Display */}
                  <div className="flex items-start gap-4 mb-8">
                    <div className="w-20 h-20 bg-gradient-to-br from-passion-light to-passion rounded-2xl shadow-lg flex items-center justify-center text-4xl flex-shrink-0">
                      <span className="animate-bounce">{parsingSteps[parsingStep].icon}</span>
                    </div>
                    <div className="flex-1 pt-2">
                      <h3 className="text-neural font-black text-xl uppercase tracking-tight mb-2">
                        {parsingSteps[parsingStep].label}
                      </h3>
                      <p className="text-gray-600 text-sm font-medium">
                        {parsingSteps[parsingStep].description}
                      </p>
                    </div>
                  </div>

                  {/* Progress Steps - Horizontal on desktop */}
                  <div className="relative mb-6">
                    <div className="flex items-center justify-between">
                      {parsingSteps.map((step, index) => (
                        <div key={index} className="flex flex-col items-center flex-1 relative">
                          {/* Step Circle */}
                          <div className={`w-12 h-12 rounded-full flex items-center justify-center text-lg font-bold transition-all duration-500 z-10 ${
                            index < parsingStep 
                              ? 'bg-verdant text-white shadow-lg scale-110' 
                              : index === parsingStep 
                              ? 'bg-passion text-white shadow-xl scale-125 ring-4 ring-passion-light/30' 
                              : 'bg-gray-200 text-gray-400'
                          }`}>
                            {index < parsingStep ? (
                              <span className="text-xl">✓</span>
                            ) : (
                              <span className={index === parsingStep ? 'animate-pulse' : ''}>
                                {step.icon}
                              </span>
                            )}
                          </div>
                          
                          {/* Step Label */}
                          <p className={`text-[10px] font-bold uppercase tracking-wider mt-3 text-center transition-colors ${
                            index <= parsingStep ? 'text-neural' : 'text-gray-400'
                          }`}>
                            {step.label}
                          </p>
                          
                          {/* Connecting Line */}
                          {index < parsingSteps.length - 1 && (
                            <div className="absolute top-6 left-1/2 w-full h-0.5 bg-gray-200 -z-0">
                              <div 
                                className={`h-full transition-all duration-700 ease-out ${
                                  index < parsingStep ? 'bg-gradient-to-r from-verdant to-verdant' : 'bg-gray-200'
                                }`}
                                style={{ 
                                  width: index < parsingStep ? '100%' : index === parsingStep - 1 ? '50%' : '0%' 
                                }}
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Modern Progress Bar */}
                  <div className="relative w-full h-3 bg-gray-100 rounded-full overflow-hidden shadow-inner">
                    <div 
                      className="absolute inset-y-0 left-0 bg-gradient-to-r from-passion via-passion-light to-verdant rounded-full transition-all duration-700 ease-out shadow-sm"
                      style={{ width: `${((parsingStep + 1) / parsingSteps.length) * 100}%` }}
                    >
                      {/* Shimmer effect */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent animate-shimmer" />
                    </div>
                  </div>

                  {/* Percentage and Status */}
                  <div className="flex items-center justify-between mt-4">
                    <span className="text-xs text-gray-500 font-medium">
                      Powered by AI • Processing securely
                    </span>
                    <span className="text-sm text-neural font-black">
                      {Math.round(((parsingStep + 1) / parsingSteps.length) * 100)}%
                    </span>
                  </div>
                </div>
              </div>
            )}

            {parseError && (
              <div className="bg-amber-50 border-2 border-amber-200 rounded-2xl p-4 flex items-start gap-3">
                <RiAlertLine className="text-amber-600 w-5 h-5 flex-shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm text-amber-900 font-bold">Parsing Notice</p>
                  <p className="text-xs text-amber-700 mt-1">{parseError}</p>
                </div>
              </div>
            )}

            <div className="space-y-2 mt-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-colors group">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-passion-light/30 rounded-xl flex items-center justify-center">
                      <RiFileLine className="text-passion" />
                    </div>
                    <div>
                      <span className="text-sm text-neural font-bold block">{file.name}</span>
                      <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">{(file.size / 1024).toFixed(1)} KB</span>
                    </div>
                  </div>
                  <button 
                    type="button" 
                    onClick={() => removeFile(index)} 
                    className="text-passion/60 hover:text-passion transition-colors opacity-0 group-hover:opacity-100 bg-passion-light/10 hover:bg-passion-light/30 p-2 rounded-xl"
                  >
                    <RiDeleteBinLine size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Parsed Data Preview or Manual Entry */}
          {parsedData && !showDetailedForm && (
            <div className="bg-gradient-to-br from-verdant-light/20 to-passion-light/20 rounded-3xl p-6 border-2 border-verdant-light">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-verdant rounded-xl flex items-center justify-center">
                    <RiMagicLine className="text-white w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-neural uppercase text-sm">AI Extraction Complete</h3>
                    <p className="text-[10px] text-gray-600 uppercase tracking-widest font-bold">
                      Confidence: {Math.round((parsedData.confidence || 0) * 100)}%
                    </p>
                  </div>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowDetailedForm(true)}
                  className="rounded-full px-4 h-9 text-xs font-bold uppercase tracking-wider"
                >
                  <RiEditLine className="mr-2 w-4 h-4" />
                  Review & Edit
                </Button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <p className="text-gray-500 font-bold uppercase tracking-wider mb-1">Title</p>
                  <p className="text-neural font-medium">{watch('title') || 'Not extracted'}</p>
                </div>
                <div>
                  <p className="text-gray-500 font-bold uppercase tracking-wider mb-1">Deadline</p>
                  <p className="text-neural font-medium">
                    {watch('submissionDeadline') ? new Date(watch('submissionDeadline')).toLocaleString() : 'Not found - please set'}
                  </p>
                </div>
              </div>

              {parsedData.warnings && parsedData.warnings.length > 0 && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider mb-2">Notices:</p>
                  <ul className="text-xs text-gray-600 space-y-1">
                    {parsedData.warnings.slice(0, 3).map((warning: string, idx: number) => (
                      <li key={idx}>• {warning}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Required Fields - Title & Deadline (Always show if no parsed data or editing) */}
          {(!parsedData || showDetailedForm) && (
            <>
          <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  Project Title * {parsedData && <span className="text-verdant">(AI-Extracted)</span>}
                </label>
            <Input 
              {...register('title', { required: true })} 
              placeholder="e.g., AI-Powered Customer Service Platform" 
              className="rounded-2xl border-2 border-gray-100 focus:border-neural h-12 px-4 font-medium"
            />
            {errors.title && <span className="text-passion text-xs font-bold uppercase tracking-wider">Required field</span>}
          </div>

          <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  Submission Deadline * {parsedData && watch('submissionDeadline') && <span className="text-verdant">(AI-Extracted)</span>}
                </label>
                <Input 
                  type="datetime-local" 
                  {...register('submissionDeadline', { required: true })} 
                  className="rounded-2xl border-2 border-gray-100 focus:border-neural h-12 px-4 font-medium"
                />
                {errors.submissionDeadline && <span className="text-passion text-xs font-bold uppercase tracking-wider">Required field</span>}
              </div>
            </>
          )}

          {/* Detailed Form Fields - Show only when editing or no parsed data */}
          {showDetailedForm && (
            <>
              <div className="space-y-3">
                <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">
                  Project Description * <span className="text-verdant">(AI-Extracted - Review & Edit)</span>
                </label>
            <Textarea 
              {...register('description', { required: true })} 
              placeholder="Provide a comprehensive description of your requirements..." 
              className="rounded-2xl border-2 border-gray-100 focus:border-neural min-h-[120px] p-4 font-medium resize-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Scope of Work *</label>
              <Textarea 
                {...register('scopeOfWork', { required: true })} 
                className="rounded-2xl border-2 border-gray-100 focus:border-neural min-h-[120px] p-4 font-medium resize-none"
                placeholder="Define the project scope..."
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Technical Requirements *</label>
              <Textarea 
                {...register('technicalRequirements', { required: true })} 
                className="rounded-2xl border-2 border-gray-100 focus:border-neural min-h-[120px] p-4 font-medium resize-none"
                placeholder="Specify technical needs..."
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Functional Requirements *</label>
              <Textarea 
                {...register('functionalRequirements', { required: true })} 
                className="rounded-2xl border-2 border-gray-100 focus:border-neural min-h-[120px] p-4 font-medium resize-none"
                placeholder="List functional requirements..."
              />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Eligibility Criteria *</label>
              <Textarea 
                {...register('eligibilityCriteria', { required: true })} 
                className="rounded-2xl border-2 border-gray-100 focus:border-neural min-h-[120px] p-4 font-medium resize-none"
                placeholder="Define eligibility criteria..."
              />
            </div>
          </div>
            </>
          )}

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={() => {
                handleReset();
                onClose();
              }}
              className="rounded-full px-8 h-12 font-bold uppercase tracking-wider text-[11px]"
            >
              Cancel
            </Button>
            
            {parsedData && !showDetailedForm && (
              <Button 
                type="button" 
                variant="outline"
                onClick={() => setShowDetailedForm(true)}
                className="rounded-full px-8 h-12 font-bold uppercase tracking-wider text-[11px]"
              >
                <RiEditLine className="mr-2" size={16} />
                Review Details
              </Button>
            )}
            
            <Button 
              type="submit" 
              disabled={createTender.isPending || isUploading || isParsing || (!parsedData && uploadedFiles.length === 0)}
              className="rounded-full px-8 h-12 bg-passion hover:bg-passion-dark font-black uppercase tracking-wider text-[11px] shadow-lg shadow-passion/10"
            >
              {createTender.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
              ) : parsedData ? (
                <>
                  <RiMagicLine className="mr-2" size={16} />
                  Submit AI-Parsed Tender
                </>
              ) : (
                <>
                  <RiSendPlaneLine className="mr-2" size={16} />
                  Submit Tender
                </>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
