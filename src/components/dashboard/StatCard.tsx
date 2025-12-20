import { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  variant?: 'default' | 'warning' | 'success' | 'danger';
}

const variantStyles = {
  default: 'border-border',
  warning: 'border-warning/30 bg-warning/5',
  success: 'border-success/30 bg-success/5',
  danger: 'border-destructive/30 bg-destructive/5',
};

const iconStyles = {
  default: 'bg-primary/10 text-primary',
  warning: 'bg-warning/15 text-warning',
  success: 'bg-success/15 text-success',
  danger: 'bg-destructive/15 text-destructive',
};

export function StatCard({
  title,
  value,
  subtitle,
  icon,
  variant = 'default',
}: StatCardProps) {
  return (
    <div
      className={cn(
        'bg-card rounded-xl border p-5 transition-all duration-200 hover:shadow-md',
        variantStyles[variant]
      )}
    >
      <div className="flex items-start justify-between">
        <div className="space-y-2">
          <p className="text-sm font-medium text-muted-foreground">{title}</p>
          <p className="text-2xl font-bold tracking-tight">{value}</p>
          {subtitle && (
            <p className="text-xs text-muted-foreground">{subtitle}</p>
          )}
        </div>
        <div
          className={cn(
            'h-10 w-10 rounded-lg flex items-center justify-center',
            iconStyles[variant]
          )}
        >
          {icon}
        </div>
      </div>
    </div>
  );
}