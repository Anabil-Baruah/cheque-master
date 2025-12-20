import { RecoveryStatus, RECOVERY_STATUSES } from '@/types/cheque';
import { cn } from '@/lib/utils';

interface RecoveryStatusBadgeProps {
  status: RecoveryStatus;
  className?: string;
}

export function RecoveryStatusBadge({ status, className }: RecoveryStatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-1 rounded-full text-xs font-medium',
        status === 'pending' && 'bg-warning/15 text-warning border border-warning/30',
        status === 'in_progress' && 'bg-info/15 text-info border border-info/30',
        status === 'recovered' && 'bg-success/15 text-success border border-success/30',
        status === 'written_off' && 'bg-muted text-muted-foreground border border-border',
        className
      )}
    >
      {RECOVERY_STATUSES[status]}
    </span>
  );
}