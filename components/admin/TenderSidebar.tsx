import { Tender } from '@/types';
import { RiCalendarLine, RiTimeLine } from 'react-icons/ri';
import { formatDistanceToNow } from 'date-fns';

interface TenderSidebarProps {
  tenders: Tender[];
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function TenderSidebar({ tenders, selectedId, onSelect }: TenderSidebarProps) {
  if (tenders.length === 0) {
    return (
      <div className="text-center py-10 text-gray-500">
        <p>No tenders available</p>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {tenders.map(tender => {
        const isSelected = tender.id === selectedId;
        const isExpired = new Date(tender.submissionDeadline) < new Date();
        
        return (
          <div
            key={tender.id}
            onClick={() => onSelect(tender.id)}
            className={`p-4 rounded-xl border-2 cursor-pointer transition-all ${
              isSelected 
                ? 'border-drift bg-drift/10 ring-1 ring-drift' 
                : 'border-gray-200 hover:border-drift/50 hover:bg-gray-50'
            }`}
          >
            <h3 className={`font-semibold mb-2 line-clamp-2 ${isSelected ? 'text-neural' : 'text-neural'}`}>
              {tender.title}
            </h3>
            <div className="flex flex-col gap-1 text-xs text-gray-500">
              <span className="flex items-center gap-1">
                <RiCalendarLine /> {new Date(tender.createdAt).toLocaleDateString()}
              </span>
              <span className={`flex items-center gap-1 ${isExpired ? 'text-passion' : ''}`}>
                <RiTimeLine /> 
                {isExpired ? 'Expired' : formatDistanceToNow(new Date(tender.submissionDeadline))} remaining
              </span>
            </div>
          </div>
        );
      })}
    </div>
  );
}


