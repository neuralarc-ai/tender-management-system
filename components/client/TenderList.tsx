import { Tender } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { RiCalendarLine, RiFileTextLine, RiTimeLine, RiEyeLine, RiTaskLine, RiAlertLine, RiCheckDoubleLine, RiCloseCircleLine } from 'react-icons/ri';
import { formatDistanceToNow } from 'date-fns';

interface TenderListProps {
  tenders: Tender[];
  onReview: (id: string) => void;
}

export function TenderList({ tenders, onReview }: TenderListProps) {
  if (tenders.length === 0) {
    return (
      <div className="text-center py-20 text-gray-500">
        <RiFileTextLine className="w-16 h-16 mx-auto mb-4 opacity-50" />
        <h3 className="text-lg font-medium mb-2">No tenders found</h3>
        <p>Submit a new tender to get started</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {tenders.map((tender) => (
        <TenderCard key={tender.id} tender={tender} onReview={() => onReview(tender.id)} />
      ))}
    </div>
  );
}

function TenderCard({ tender, onReview }: { tender: Tender, onReview: () => void }) {
  const isExpired = new Date(tender.submissionDeadline) < new Date();
  const deadlineText = isExpired 
    ? 'Expired' 
    : formatDistanceToNow(new Date(tender.submissionDeadline), { addSuffix: true });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'submitted': return 'info';
      case 'accepted': return 'success';
      case 'rejected': return 'destructive';
      default: return 'secondary';
    }
  };

  return (
    <Card className="hover:border-blue-300 transition-colors">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div>
            <h3 className="text-xl font-bold text-gray-900 mb-2">{tender.title}</h3>
            <div className="flex gap-4 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <RiCalendarLine />
                {new Date(tender.createdAt).toLocaleDateString()}
              </span>
              <span className="flex items-center gap-1">
                <RiFileTextLine />
                {tender.documents.length} documents
              </span>
            </div>
          </div>
          <div className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-semibold ${isExpired ? 'bg-gray-100 text-gray-500' : 'bg-yellow-50 text-yellow-700'}`}>
            <RiTimeLine />
            {deadlineText}
          </div>
        </div>

        <p className="text-gray-600 mb-6 line-clamp-3">{tender.description}</p>

        {tender.proposal.status !== 'draft' && (
          <div className="border-t pt-4 mt-4">
            <div className="flex justify-between items-center mb-4">
              <h4 className="flex items-center gap-2 font-semibold text-gray-900">
                <RiTaskLine className="text-blue-600" />
                Proposal from Neural Arc Inc
              </h4>
              <Badge variant={getStatusColor(tender.proposal.status) as any}>
                {tender.proposal.status.replace('_', ' ')}
              </Badge>
            </div>

            {tender.proposal.status === 'submitted' && (
              <div className="bg-amber-50 p-4 rounded-lg border border-amber-100 mb-4">
                <div className="flex justify-between items-center">
                  <div className="flex gap-3">
                    <RiAlertLine className="text-amber-600 w-5 h-5 mt-0.5" />
                    <div>
                      <p className="font-semibold text-amber-800">Action Required</p>
                      <p className="text-sm text-amber-700">A proposal has been submitted and is awaiting your review.</p>
                    </div>
                  </div>
                  <Button onClick={onReview} className="bg-blue-600 hover:bg-blue-700 text-white">
                    <RiEyeLine className="mr-2" />
                    Review Proposal
                  </Button>
                </div>
              </div>
            )}

            {(tender.proposal.status === 'accepted' || tender.proposal.status === 'rejected') && (
              <div className="bg-gray-50 p-4 rounded-lg space-y-3">
                 <div className="flex items-center gap-2 font-medium">
                   {tender.proposal.status === 'accepted' ? (
                     <><RiCheckDoubleLine className="text-green-600" /> Proposal Accepted</>
                   ) : (
                     <><RiCloseCircleLine className="text-red-600" /> Proposal Rejected</>
                   )}
                 </div>
                 {tender.proposal.feedback && (
                   <div className="text-sm text-gray-600">
                     <span className="font-medium text-gray-900">Feedback: </span>
                     {tender.proposal.feedback}
                   </div>
                 )}
                 <div className="text-xs text-gray-500">
                   Reviewed at {new Date(tender.proposal.reviewedAt!).toLocaleString()}
                 </div>
              </div>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

