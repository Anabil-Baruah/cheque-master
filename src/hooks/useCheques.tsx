'use client';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Cheque, ChequeStatus, BounceReason, RecoveryStatus, DashboardStats } from '@/types/cheque';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { addDays, isBefore, isAfter, startOfDay } from 'date-fns';
import { useRouter } from 'next/navigation';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL as string;

export function useCheques() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const router = useRouter();

  const { data: cheques = [], isLoading } = useQuery({
    queryKey: ['cheques', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`${API_BASE}/cheques?user_id=${user.id}`);
      if (!res.ok) throw new Error('Failed to load cheques');
      return (await res.json()) as Cheque[];
    },
    enabled: !!user,
  });

  const addChequeMutation = useMutation({
    mutationFn: async (cheque: Omit<Cheque, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      const res = await fetch(`${API_BASE}/cheques`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...cheque, user_id: user.id }),
      });
      if (!res.ok) throw new Error('Failed to add cheque');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast({ title: 'Success', description: 'Cheque added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      if (error.message.includes('User not authenticated')) {
        router.replace('/auth');
      }
    },
  });

  const updateChequeMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cheque> & { id: string }) => {
      const res = await fetch(`${API_BASE}/cheques/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });
      if (!res.ok) throw new Error('Failed to update cheque');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast({ title: 'Success', description: 'Cheque updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      if (error.message.includes('User not authenticated')) {
        router.replace('/auth');
      }
    },
  });

  const deleteChequeMutation = useMutation({
    mutationFn: async (id: string) => {
      const res = await fetch(`${API_BASE}/cheques/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete cheque');
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast({ title: 'Success', description: 'Cheque deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      if (error.message.includes('User not authenticated')) {
        router.replace('/auth');
      }
    },
  });

  const markAsBouncedMutation = useMutation({
    mutationFn: async ({ 
      id, 
      bounce_reason, 
      bounce_remarks 
    }: { 
      id: string; 
      bounce_reason: BounceReason; 
      bounce_remarks?: string 
    }) => {
      const res = await fetch(`${API_BASE}/cheques/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          status: 'bounced' as ChequeStatus,
          bounce_reason,
          bounce_remarks,
          bounce_date: new Date().toISOString().split('T')[0],
          recovery_status: 'pending' as RecoveryStatus,
        }),
      });
      if (!res.ok) throw new Error('Failed to mark as bounced');
      return await res.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast({ title: 'Cheque Marked as Bounced', description: 'Recovery tracking initiated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
      if (error.message.includes('User not authenticated')) {
        router.replace('/auth');
      }
    },
  });

  const getStats = (): DashboardStats => {
    const today = startOfDay(new Date());
    const weekFromNow = addDays(today, 7);

    const pendingCheques = cheques.filter(c => c.status === 'pending');
    const clearedCheques = cheques.filter(c => c.status === 'cleared');
    const bouncedCheques = cheques.filter(c => c.status === 'bounced');
    const recoveredCheques = bouncedCheques.filter(c => c.recovery_status === 'recovered');

    const upcomingDue = pendingCheques.filter(c => {
      if (!c.due_date) return false;
      const dueDate = new Date(c.due_date);
      return isAfter(dueDate, today) && isBefore(dueDate, weekFromNow);
    });

    const overdue = pendingCheques.filter(c => {
      if (!c.due_date) return false;
      return isBefore(new Date(c.due_date), today);
    });

    return {
      totalCheques: cheques.length,
      pendingCheques: pendingCheques.length,
      clearedCheques: clearedCheques.length,
      bouncedCheques: bouncedCheques.length,
      totalAmount: cheques.reduce((sum, c) => sum + Number(c.amount), 0),
      pendingAmount: pendingCheques.reduce((sum, c) => sum + Number(c.amount), 0),
      bouncedAmount: bouncedCheques.reduce((sum, c) => sum + Number(c.amount), 0),
      recoveredAmount: recoveredCheques.reduce((sum, c) => sum + Number(c.amount), 0),
      upcomingDueCount: upcomingDue.length,
      overdueCount: overdue.length,
    };
  };

  return {
    cheques,
    isLoading,
    stats: getStats(),
    addCheque: addChequeMutation.mutate,
    updateCheque: updateChequeMutation.mutate,
    deleteCheque: deleteChequeMutation.mutate,
    markAsBounced: markAsBouncedMutation.mutate,
    isAdding: addChequeMutation.isPending,
    isUpdating: updateChequeMutation.isPending,
  };
}
