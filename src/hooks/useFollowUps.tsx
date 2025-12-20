import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { FollowUp } from '@/types/cheque';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';

export function useFollowUps(chequeId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: followUps = [], isLoading } = useQuery({
    queryKey: ['followUps', chequeId],
    queryFn: async () => {
      if (!user || !chequeId) return [];
      const { data, error } = await supabase
        .from('follow_ups')
        .select('*')
        .eq('cheque_id', chequeId)
        .order('contact_date', { ascending: false });
      
      if (error) throw error;
      return data as FollowUp[];
    },
    enabled: !!user && !!chequeId,
  });

  const addFollowUpMutation = useMutation({
    mutationFn: async (followUp: Omit<FollowUp, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');
      const { data, error } = await supabase
        .from('follow_ups')
        .insert([{ ...followUp, user_id: user.id }])
        .select()
        .single();
      
      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followUps'] });
      toast({ title: 'Success', description: 'Follow-up recorded successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  const deleteFollowUpMutation = useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('follow_ups')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['followUps'] });
      toast({ title: 'Success', description: 'Follow-up deleted successfully' });
    },
    onError: (error: Error) => {
      toast({ title: 'Error', description: error.message, variant: 'destructive' });
    },
  });

  return {
    followUps,
    isLoading,
    addFollowUp: addFollowUpMutation.mutate,
    deleteFollowUp: deleteFollowUpMutation.mutate,
    isAdding: addFollowUpMutation.isPending,
  };
}