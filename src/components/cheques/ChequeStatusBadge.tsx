import { ChequeStatus, CHEQUE_STATUSES } from '@/types/cheque';
import { cn } from '@/lib/utils';

interface ChequeStatusBadgeProps {
  status: ChequeStatus;
  className?: string;
}

export function ChequeStatusBadge({ status, className }: ChequeStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        status === 'pending' && 'status-pending',
        status === 'deposited' && 'status-deposited',
        status === 'cleared' && 'status-cleared',
        status === 'bounced' && 'status-bounced',
        className
      )}
    >
      {CHEQUE_STATUSES[status]}
    </span>
  );
}