import { useState } from 'react';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCheques } from '@/hooks/useCheques';
import { useFollowUps } from '@/hooks/useFollowUps';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RecoveryStatusBadge } from '@/components/cheques/RecoveryStatusBadge';
import { format } from 'date-fns';
import { Plus, Phone, MessageSquare } from 'lucide-react';
import { RecoveryStatus, BOUNCE_REASONS, RECOVERY_STATUSES } from '@/types/cheque';

export function BouncedPage() {
  const { cheques, updateCheque } = useCheques();
  const [selectedChequeId, setSelectedChequeId] = useState<string | null>(null);
  const [isFollowUpOpen, setIsFollowUpOpen] = useState(false);
  const { followUps, addFollowUp, isAdding } = useFollowUps(selectedChequeId || undefined);

  const [followUpData, setFollowUpData] = useState({ contact_date: '', next_follow_up_date: '', notes: '', action_taken: '' });

  const bouncedCheques = cheques.filter((c) => c.status === 'bounced');
  const selectedCheque = cheques.find((c) => c.id === selectedChequeId);

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  const handleAddFollowUp = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedChequeId) return;
    addFollowUp({
      cheque_id: selectedChequeId,
      contact_date: followUpData.contact_date,
      next_follow_up_date: followUpData.next_follow_up_date || null,
      notes: followUpData.notes || null,
      action_taken: followUpData.action_taken || null,
    });
    setFollowUpData({ contact_date: '', next_follow_up_date: '', notes: '', action_taken: '' });
    setIsFollowUpOpen(false);
  };

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div>
          <h1 className="text-2xl font-bold">Bounced Cheques</h1>
          <p className="text-muted-foreground">Track and recover bounced cheques</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Cheque List */}
          <div className="lg:col-span-1 bg-card rounded-xl border">
            <div className="p-4 border-b"><h3 className="font-semibold">Bounced Cheques ({bouncedCheques.length})</h3></div>
            <div className="divide-y max-h-[600px] overflow-y-auto">
              {bouncedCheques.length === 0 ? (
                <p className="p-4 text-sm text-muted-foreground">No bounced cheques</p>
              ) : bouncedCheques.map((cheque) => (
                <div key={cheque.id} onClick={() => setSelectedChequeId(cheque.id)} className={`p-4 cursor-pointer hover:bg-muted/50 transition-colors ${selectedChequeId === cheque.id ? 'bg-muted' : ''}`}>
                  <div className="flex items-start justify-between mb-2">
                    <p className="font-medium">{cheque.party_name}</p>
                    {cheque.recovery_status && <RecoveryStatusBadge status={cheque.recovery_status} />}
                  </div>
                  <p className="text-sm text-muted-foreground">{cheque.bank_name} - #{cheque.cheque_number}</p>
                  <p className="text-lg font-bold mt-1">{formatCurrency(Number(cheque.amount))}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Details Panel */}
          <div className="lg:col-span-2 space-y-4">
            {selectedCheque ? (
              <>
                <div className="bg-card rounded-xl border p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div>
                      <h2 className="text-xl font-bold">{selectedCheque.party_name}</h2>
                      <p className="text-muted-foreground">{selectedCheque.bank_name} - Cheque #{selectedCheque.cheque_number}</p>
                    </div>
                    <p className="text-2xl font-bold text-destructive">{formatCurrency(Number(selectedCheque.amount))}</p>
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                    <div><p className="text-muted-foreground">Issue Date</p><p className="font-medium">{format(new Date(selectedCheque.issue_date), 'MMM d, yyyy')}</p></div>
                    <div><p className="text-muted-foreground">Bounce Date</p><p className="font-medium">{selectedCheque.bounce_date ? format(new Date(selectedCheque.bounce_date), 'MMM d, yyyy') : '-'}</p></div>
                    <div><p className="text-muted-foreground">Bounce Reason</p><p className="font-medium">{selectedCheque.bounce_reason ? BOUNCE_REASONS[selectedCheque.bounce_reason] : '-'}</p></div>
                    <div><p className="text-muted-foreground">Recovery Status</p>
                      <Select value={selectedCheque.recovery_status || 'pending'} onValueChange={(v) => updateCheque({ id: selectedCheque.id, recovery_status: v as RecoveryStatus })}>
                        <SelectTrigger className="mt-1 h-8"><SelectValue /></SelectTrigger>
                        <SelectContent>{Object.entries(RECOVERY_STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                      </Select>
                    </div>
                  </div>
                  {selectedCheque.bounce_remarks && <div className="mt-4 p-3 bg-muted rounded-lg"><p className="text-sm"><span className="font-medium">Remarks:</span> {selectedCheque.bounce_remarks}</p></div>}
                </div>

                <div className="bg-card rounded-xl border">
                  <div className="p-4 border-b flex items-center justify-between">
                    <h3 className="font-semibold">Follow-up History</h3>
                    <Button size="sm" onClick={() => setIsFollowUpOpen(true)}><Plus className="h-4 w-4 mr-1" />Add Follow-up</Button>
                  </div>
                  <div className="divide-y max-h-[300px] overflow-y-auto">
                    {followUps.length === 0 ? (
                      <p className="p-4 text-sm text-muted-foreground">No follow-ups recorded yet</p>
                    ) : followUps.map((fu) => (
                      <div key={fu.id} className="p-4">
                        <div className="flex items-center gap-2 mb-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium text-sm">{format(new Date(fu.contact_date), 'MMM d, yyyy')}</span>
                          {fu.next_follow_up_date && <span className="text-xs text-muted-foreground ml-auto">Next: {format(new Date(fu.next_follow_up_date), 'MMM d')}</span>}
                        </div>
                        {fu.action_taken && <p className="text-sm font-medium">{fu.action_taken}</p>}
                        {fu.notes && <p className="text-sm text-muted-foreground mt-1">{fu.notes}</p>}
                      </div>
                    ))}
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-card rounded-xl border p-12 text-center">
                <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="font-semibold mb-2">Select a Cheque</h3>
                <p className="text-sm text-muted-foreground">Click on a bounced cheque to view details and manage recovery</p>
              </div>
            )}
          </div>
        </div>

        <Dialog open={isFollowUpOpen} onOpenChange={setIsFollowUpOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Add Follow-up</DialogTitle></DialogHeader>
            <form onSubmit={handleAddFollowUp} className="space-y-4">
              <div><Label>Contact Date</Label><Input type="date" value={followUpData.contact_date} onChange={(e) => setFollowUpData({ ...followUpData, contact_date: e.target.value })} required /></div>
              <div><Label>Action Taken</Label><Input value={followUpData.action_taken} onChange={(e) => setFollowUpData({ ...followUpData, action_taken: e.target.value })} placeholder="e.g., Called party, sent notice..." /></div>
              <div><Label>Notes</Label><Textarea value={followUpData.notes} onChange={(e) => setFollowUpData({ ...followUpData, notes: e.target.value })} placeholder="Additional details..." /></div>
              <div><Label>Next Follow-up Date</Label><Input type="date" value={followUpData.next_follow_up_date} onChange={(e) => setFollowUpData({ ...followUpData, next_follow_up_date: e.target.value })} /></div>
              <Button type="submit" className="w-full" disabled={isAdding}>Save Follow-up</Button>
            </form>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
export default function Page() {
  return null;
}
