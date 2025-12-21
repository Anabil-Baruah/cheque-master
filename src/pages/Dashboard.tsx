import { AppLayout } from '@/components/layout/AppLayout';
import { StatCard } from '@/components/dashboard/StatCard';
import { useCheques } from '@/hooks/useCheques';
import { format, isBefore, startOfDay, addDays } from 'date-fns';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { ChequeStatusBadge } from '@/components/cheques/ChequeStatusBadge';
import {
  FileText,
  Clock,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Plus,
  ArrowRight,
} from 'lucide-react';

export default function DashboardPage() {
  const { cheques, stats, isLoading } = useCheques();

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(amount);
  };

  const today = startOfDay(new Date());
  const weekFromNow = addDays(today, 7);

  const upcomingCheques = cheques
    .filter((c) => {
      if (c.status !== 'pending' || !c.due_date) return false;
      const dueDate = new Date(c.due_date);
      return dueDate >= today && dueDate <= weekFromNow;
    })
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  const overdueCheques = cheques
    .filter((c) => {
      if (c.status !== 'pending' || !c.due_date) return false;
      return isBefore(new Date(c.due_date), today);
    })
    .sort((a, b) => new Date(a.due_date!).getTime() - new Date(b.due_date!).getTime())
    .slice(0, 5);

  const bouncedCheques = cheques
    .filter((c) => c.status === 'bounced' && c.recovery_status !== 'recovered')
    .slice(0, 5);

  if (isLoading) {
    return (
      <AppLayout>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-muted rounded w-48" />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="h-32 bg-muted rounded-xl" />
            ))}
          </div>
        </div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="space-y-8 animate-fade-in">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-muted-foreground">
              Overview of your cheque portfolio
            </p>
          </div>
          <Button asChild>
            <Link href="/cheques?add=true">
              <Plus className="h-4 w-4 mr-2" />
              Add Cheque
            </Link>
          </Button>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <StatCard
            title="Total Cheques"
            value={stats.totalCheques}
            subtitle={formatCurrency(stats.totalAmount)}
            icon={<FileText className="h-5 w-5" />}
          />
          <StatCard
            title="Pending"
            value={stats.pendingCheques}
            subtitle={formatCurrency(stats.pendingAmount)}
            icon={<Clock className="h-5 w-5" />}
            variant="warning"
          />
          <StatCard
            title="Cleared"
            value={stats.clearedCheques}
            subtitle="Successfully processed"
            icon={<CheckCircle className="h-5 w-5" />}
            variant="success"
          />
          <StatCard
            title="Bounced"
            value={stats.bouncedCheques}
            subtitle={formatCurrency(stats.bouncedAmount)}
            icon={<AlertTriangle className="h-5 w-5" />}
            variant="danger"
          />
        </div>

        {/* Secondary Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Due This Week</p>
                <p className="text-2xl font-bold">{stats.upcomingDueCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-info/15 text-info flex items-center justify-center">
                <Clock className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Overdue</p>
                <p className="text-2xl font-bold text-destructive">{stats.overdueCount}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-destructive/15 text-destructive flex items-center justify-center">
                <AlertTriangle className="h-5 w-5" />
              </div>
            </div>
          </div>
          <div className="bg-card rounded-xl border p-5">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">Recovered</p>
                <p className="text-2xl font-bold text-success">{formatCurrency(stats.recoveredAmount)}</p>
              </div>
              <div className="h-10 w-10 rounded-lg bg-success/15 text-success flex items-center justify-center">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
          </div>
        </div>

        {/* Lists */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Upcoming Due */}
          <div className="bg-card rounded-xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Due This Week</h3>
              <Link href="/cheques?filter=pending" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y">
              {upcomingCheques.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No cheques due this week</p>
              ) : (
                upcomingCheques.map((cheque) => (
                  <div key={cheque.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{cheque.party_name}</p>
                      <p className="text-xs text-muted-foreground">
                        Due {format(new Date(cheque.due_date!), 'MMM d')}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">{formatCurrency(Number(cheque.amount))}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Overdue */}
          <div className="bg-card rounded-xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold text-destructive">Overdue</h3>
              <Link href="/cheques?filter=overdue" className="text-sm text-primary hover:underline">
                View all
              </Link>
            </div>
            <div className="divide-y">
              {overdueCheques.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No overdue cheques</p>
              ) : (
                overdueCheques.map((cheque) => (
                  <div key={cheque.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{cheque.party_name}</p>
                      <p className="text-xs text-destructive">
                        Overdue since {format(new Date(cheque.due_date!), 'MMM d')}
                      </p>
                    </div>
                    <p className="font-semibold text-sm">{formatCurrency(Number(cheque.amount))}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Bounced - Needs Action */}
          <div className="bg-card rounded-xl border">
            <div className="p-4 border-b flex items-center justify-between">
              <h3 className="font-semibold">Bounced - Action Required</h3>
              <Link href="/bounced" className="text-sm text-primary hover:underline flex items-center gap-1">
                Manage <ArrowRight className="h-3 w-3" />
              </Link>
            </div>
            <div className="divide-y">
              {bouncedCheques.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No bounced cheques</p>
              ) : (
                bouncedCheques.map((cheque) => (
                  <div key={cheque.id} className="p-4 flex items-center justify-between">
                    <div>
                      <p className="font-medium text-sm">{cheque.party_name}</p>
                      <p className="text-xs text-muted-foreground">
                        {cheque.bank_name} - #{cheque.cheque_number}
                      </p>
                    </div>
                    <p className="font-semibold text-sm text-destructive">
                      {formatCurrency(Number(cheque.amount))}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
