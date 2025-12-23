import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RiUploadLine, RiCloseLine, RiSendPlaneLine, RiFileLine, RiDeleteBinLine, RiCheckLine } from 'react-icons/ri';
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
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TenderFormData>();

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
    onError: (error) => {
      alert('Error submitting tender. Please try again.');
      console.error(error);
    }
  });

  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    setIsUploading(true);
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
  };

  const removeFile = (index: number) => {
    setUploadedFiles(prev => prev.filter((_, i) => i !== index));
  };

  const onSubmit = (data: TenderFormData) => {
    createTender.mutate({
      ...data,
      documents: uploadedFiles
    });
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
            <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">Requirement Intake Form</p>
          </div>
          <button 
            onClick={onClose} 
            className="text-gray-400 hover:text-neural transition-colors bg-gray-50 hover:bg-gray-100 rounded-full p-3"
          >
            <RiCloseLine size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-8 space-y-8">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Project Title *</label>
            <Input 
              {...register('title', { required: true })} 
              placeholder="e.g., AI-Powered Customer Service Platform" 
              className="rounded-2xl border-2 border-gray-100 focus:border-neural h-12 px-4 font-medium"
            />
            {errors.title && <span className="text-passion text-xs font-bold uppercase tracking-wider">Required field</span>}
          </div>

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Project Description *</label>
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

          <div className="space-y-3">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Submission Deadline *</label>
            <Input 
              type="datetime-local" 
              {...register('submissionDeadline', { required: true })} 
              className="rounded-2xl border-2 border-gray-100 focus:border-neural h-12 px-4 font-medium"
            />
          </div>

          <div className="space-y-4">
            <label className="text-[10px] font-black text-gray-400 uppercase tracking-widest block">Supporting Documents</label>
            <div className="border-2 border-dashed border-gray-200 rounded-3xl p-12 text-center hover:border-passion hover:bg-passion-light/10/30 transition-all cursor-pointer relative group">
              <input 
                type="file" 
                multiple 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <div className="flex flex-col items-center gap-3">
                <div className="w-16 h-16 bg-passion-light/30 rounded-2xl flex items-center justify-center group-hover:scale-110 transition-transform">
                  <RiUploadLine className="text-passion w-8 h-8" />
                </div>
                <div>
                  <p className="text-neural-light font-bold">Click or drag files to upload</p>
                  <p className="text-[10px] text-gray-400 uppercase tracking-widest font-bold mt-1">PDF, DOC, DOCX, XLS (Max 10MB)</p>
                </div>
              </div>
            </div>
            
            {isUploading && (
              <div className="flex items-center gap-3 justify-center">
                <div className="w-5 h-5 border-3 border-indigo-100 border-t-indigo-600 rounded-full animate-spin"></div>
                <p className="text-sm text-passion font-bold uppercase tracking-wider animate-pulse">Uploading...</p>
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
                    className="text-red-400 hover:text-passion transition-colors opacity-0 group-hover:opacity-100 bg-passion-light/10 hover:bg-passion-light/30 p-2 rounded-xl"
                  >
                    <RiDeleteBinLine size={18} />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-4 pt-6 border-t border-gray-100">
            <Button 
              type="button" 
              variant="ghost" 
              onClick={onClose}
              className="rounded-full px-8 h-12 font-bold uppercase tracking-wider text-[11px]"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createTender.isPending || isUploading}
              className="rounded-full px-8 h-12 bg-passion hover:bg-passion-dark font-black uppercase tracking-wider text-[11px] shadow-lg shadow-passion/10"
            >
              {createTender.isPending ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  <span>Submitting...</span>
                </div>
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
