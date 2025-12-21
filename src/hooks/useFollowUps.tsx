import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { FollowUp } from '@/types/cheque';
import { useAuth } from './useAuth';
import { toast } from '@/hooks/use-toast';
const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL as string;

export function useFollowUps(chequeId?: string) {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  const { data: followUps = [], isLoading } = useQuery({
    queryKey: ['followUps', chequeId],
    queryFn: async () => {
      if (!user || !chequeId) return [];
      const res = await fetch(`${API_BASE}/follow-ups?cheque_id=${chequeId}`);
      if (!res.ok) throw new Error('Failed to load follow-ups');
      return (await res.json()) as FollowUp[];
    },
    enabled: !!user && !!chequeId,
  });

  const addFollowUpMutation = useMutation({
    mutationFn: async (followUp: Omit<FollowUp, 'id' | 'user_id' | 'created_at'>) => {
      if (!user) throw new Error('User not authenticated');
      const res = await fetch(`${API_BASE}/follow-ups`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...followUp, user_id: user.id }),
      });
      if (!res.ok) throw new Error('Failed to add follow-up');
      return await res.json();
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
      const res = await fetch(`${API_BASE}/follow-ups/${id}`, { method: 'DELETE' });
      if (!res.ok) throw new Error('Failed to delete follow-up');
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
