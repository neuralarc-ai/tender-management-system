import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RiUploadLine, RiCloseLine, RiSendPlaneLine, RiFileLine, RiDeleteBinLine } from 'react-icons/ri';
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
  const queryClient = useQueryClient();
  
  const { register, handleSubmit, reset, formState: { errors } } = useForm<TenderFormData>();

  const createTender = useMutation({
    mutationFn: async (data: TenderFormData & { documents: UploadedFile[] }) => {
      const response = await axios.post('/api/tenders', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      reset();
      setUploadedFiles([]);
      onClose();
      alert('Tender submitted successfully! AI analysis will begin shortly.');
    },
    onError: (error) => {
      alert('Error submitting tender');
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

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
          <h2 className="text-xl font-semibold text-gray-900">Submit New Tender Requirement</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-gray-700">
            <RiCloseLine size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Tender Title *</label>
            <Input {...register('title', { required: true })} placeholder="e.g., AI-Powered Customer Service Platform" />
            {errors.title && <span className="text-red-500 text-xs">Title is required</span>}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Detailed Description *</label>
            <Textarea {...register('description', { required: true })} placeholder="Provide a comprehensive description..." className="min-h-[100px]" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Scope of Work *</label>
              <Textarea {...register('scopeOfWork', { required: true })} className="min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Technical Requirements *</label>
              <Textarea {...register('technicalRequirements', { required: true })} className="min-h-[100px]" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Functional Requirements *</label>
              <Textarea {...register('functionalRequirements', { required: true })} className="min-h-[100px]" />
            </div>
            <div className="space-y-2">
              <label className="text-sm font-medium text-gray-700">Eligibility Criteria *</label>
              <Textarea {...register('eligibilityCriteria', { required: true })} className="min-h-[100px]" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Submission Deadline *</label>
            <Input type="datetime-local" {...register('submissionDeadline', { required: true })} />
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Supporting Documents</label>
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 text-center hover:border-blue-500 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                multiple 
                onChange={handleFileUpload}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                disabled={isUploading}
              />
              <div className="flex flex-col items-center gap-2">
                <RiUploadLine className="text-blue-500 w-12 h-12" />
                <p className="text-gray-600">Click or drag files to upload</p>
                <p className="text-xs text-gray-400">PDF, DOC, DOCX, XLS (Max 10MB)</p>
              </div>
            </div>
            
            {isUploading && <p className="text-sm text-blue-500 animate-pulse">Uploading...</p>}

            <div className="space-y-2 mt-4">
              {uploadedFiles.map((file, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-2">
                    <RiFileLine className="text-gray-500" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                    <span className="text-xs text-gray-400">({(file.size / 1024).toFixed(1)} KB)</span>
                  </div>
                  <button type="button" onClick={() => removeFile(index)} className="text-red-500 hover:text-red-700">
                    <RiDeleteBinLine />
                  </button>
                </div>
              ))}
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t">
            <Button type="button" variant="secondary" onClick={onClose}>Cancel</Button>
            <Button type="submit" disabled={createTender.isPending || isUploading}>
              <RiSendPlaneLine className="mr-2" />
              {createTender.isPending ? 'Submitting...' : 'Submit Tender'}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

