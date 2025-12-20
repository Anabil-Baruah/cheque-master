import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { Cheque, ChequeStatus, BounceReason, RecoveryStatus, DashboardStats } from '@/types/cheque';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
import { addDays, isBefore, isAfter, startOfDay } from 'date-fns';

export function useCheques() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: cheques = [], isLoading } = useQuery({
    queryKey: ['cheques', user?.id],
    queryFn: async () => {
      if (!user) return [];
      const { data, error } = await supabase
        .from('cheques')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      
      if (error) throw error;
      return data as Cheque[];
    },
    enabled: !!user,
  });

  const addChequeMutation = useMutation({
    mutationFn: async (cheque: Omit<Cheque, 'id' | 'user_id' | 'created_at' | 'updated_at'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('cheques')
        .insert([{ ...cheque, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast({ title: 'Success', description: 'Cheque added successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const updateChequeMutation = useMutation({
    mutationFn: async ({ id, ...updates }: Partial<Cheque> & { id: string }) => {
      const { data, error } = await supabase
        .from('cheques')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast({ title: 'Success', description: 'Cheque updated successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteChequeMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('cheques')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast({ title: 'Success', description: 'Cheque deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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
      const { data, error } = await supabase
        .from('cheques')
        .update({
          status: 'bounced' as ChequeStatus,
          bounce_reason,
          bounce_remarks,
          bounce_date: new Date().toISOString().split('T')[0],
          recovery_status: 'pending' as RecoveryStatus,
        })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['cheques'] });
      toast({ title: 'Cheque Marked as Bounced', description: 'Recovery tracking initiated' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
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