import { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { RiCloseLine, RiCheckLine, RiCloseCircleLine } from 'react-icons/ri';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import axios from 'axios';

interface ReviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  tenderId: string | null;
}

export function ReviewModal({ isOpen, onClose, tenderId }: ReviewModalProps) {
  const [feedback, setFeedback] = useState('');
  const queryClient = useQueryClient();

  const reviewProposal = useMutation({
    mutationFn: async ({ status, feedback }: { status: 'accepted' | 'rejected', feedback: string }) => {
      if (!tenderId) return;
      const response = await axios.put(`/api/tenders/${tenderId}/proposal/review`, { status, feedback });
      return response.data;
    },
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: ['tenders'] });
      setFeedback('');
      onClose();
      alert(`Proposal ${variables.status}!`);
    },
    onError: (error) => {
      alert('Error reviewing proposal');
      console.error(error);
    }
  });

  if (!isOpen || !tenderId) return null;

  return (
    <div className="fixed inset-0 bg-neural/50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-xl w-full max-w-lg">
        <div className="flex justify-between items-center p-6 border-b">
          <h2 className="text-xl font-semibold text-neural">Review Proposal</h2>
          <button onClick={onClose} className="text-gray-500 hover:text-neural-light">
            <RiCloseLine size={24} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-medium text-neural-light">Feedback (Optional)</label>
            <Textarea 
              value={feedback}
              onChange={(e) => setFeedback(e.target.value)}
              placeholder="Provide feedback on the proposal..."
              className="min-h-[120px]"
            />
          </div>

          <div className="flex gap-4">
            <Button 
              className="flex-1 bg-verdant hover:bg-verdant-dark text-white"
              onClick={() => reviewProposal.mutate({ status: 'accepted', feedback })}
              disabled={reviewProposal.isPending}
            >
              <RiCheckLine className="mr-2" />
              Accept Proposal
            </Button>
            
            <Button 
              className="flex-1"
              variant="destructive"
              onClick={() => reviewProposal.mutate({ status: 'rejected', feedback })}
              disabled={reviewProposal.isPending}
            >
              <RiCloseCircleLine className="mr-2" />
              Reject Proposal
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}


