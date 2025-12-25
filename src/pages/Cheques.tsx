import { useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { AppLayout } from '@/components/layout/AppLayout';
import { useCheques } from '@/hooks/useCheques';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ChequeStatusBadge } from '@/components/cheques/ChequeStatusBadge';
import { format } from 'date-fns';
import { Plus, Search, Trash2, Edit, AlertTriangle } from 'lucide-react';
import { ChequeStatus, BounceReason, BOUNCE_REASONS, CHEQUE_STATUSES } from '@/types/cheque';

export function ChequesPage() {
  const searchParams = useSearchParams();
  const { cheques, isLoading, addCheque, updateCheque, deleteCheque, markAsBounced, isAdding } = useCheques();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAddOpen, setIsAddOpen] = useState(searchParams.get('add') === 'true');
  const [isBounceOpen, setIsBounceOpen] = useState(false);
  const [selectedChequeId, setSelectedChequeId] = useState<string | null>(null);
  const [bounceReason, setBounceReason] = useState<BounceReason>('insufficient_funds');
  const [bounceRemarks, setBounceRemarks] = useState('');

  // Form state
  const [formData, setFormData] = useState({
    party_name: '', cheque_number: '', bank_name: '', amount: '',
    issue_date: '', due_date: '', status: 'pending' as ChequeStatus,
  });

  const filteredCheques = cheques.filter((c) => {
    const matchesSearch = c.party_name.toLowerCase().includes(search.toLowerCase()) ||
      c.cheque_number.includes(search) || c.bank_name.toLowerCase().includes(search.toLowerCase());
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addCheque({
      ...formData,
      amount: parseFloat(formData.amount),
      due_date: formData.due_date || null,
      bounce_reason: null, bounce_date: null, bounce_remarks: null, recovery_status: null,
    });
    setFormData({ party_name: '', cheque_number: '', bank_name: '', amount: '', issue_date: '', due_date: '', status: 'pending' });
    setIsAddOpen(false);
  };

  const handleMarkBounced = () => {
    if (selectedChequeId) {
      markAsBounced({ id: selectedChequeId, bounce_reason: bounceReason, bounce_remarks: bounceRemarks });
      setIsBounceOpen(false);
      setSelectedChequeId(null);
      setBounceRemarks('');
    }
  };

  const formatCurrency = (amount: number) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', minimumFractionDigits: 0 }).format(amount);

  return (
    <AppLayout>
      <div className="space-y-6 animate-fade-in">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">All Cheques</h1>
            <p className="text-muted-foreground">Manage your cheque records</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button><Plus className="h-4 w-4 mr-2" />Add Cheque</Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader><DialogTitle>Add New Cheque</DialogTitle></DialogHeader>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="col-span-2"><Label>Party Name</Label><Input value={formData.party_name} onChange={(e) => setFormData({ ...formData, party_name: e.target.value })} required /></div>
                  <div><Label>Cheque Number</Label><Input value={formData.cheque_number} onChange={(e) => setFormData({ ...formData, cheque_number: e.target.value })} required /></div>
                  <div><Label>Bank Name</Label><Input value={formData.bank_name} onChange={(e) => setFormData({ ...formData, bank_name: e.target.value })} required /></div>
                  <div><Label>Amount (₹)</Label><Input type="number" value={formData.amount} onChange={(e) => setFormData({ ...formData, amount: e.target.value })} required /></div>
                  <div><Label>Status</Label>
                    <Select value={formData.status} onValueChange={(v) => setFormData({ ...formData, status: v as ChequeStatus })}>
                      <SelectTrigger><SelectValue /></SelectTrigger>
                      <SelectContent>{Object.entries(CHEQUE_STATUSES).filter(([k]) => k !== 'bounced').map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                    </Select>
                  </div>
                  <div><Label>Issue Date</Label><Input type="date" value={formData.issue_date} onChange={(e) => setFormData({ ...formData, issue_date: e.target.value })} required /></div>
                  <div><Label>Due Date (PDC)</Label><Input type="date" value={formData.due_date} onChange={(e) => setFormData({ ...formData, due_date: e.target.value })} /></div>
                </div>
                <Button type="submit" className="w-full" disabled={isAdding}>Add Cheque</Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="flex flex-col sm:flex-row gap-4">
          <div className="relative flex-1"><Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" /><Input placeholder="Search by party, cheque number, bank..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-10" /></div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40"><SelectValue placeholder="Status" /></SelectTrigger>
            <SelectContent><SelectItem value="all">All Status</SelectItem>{Object.entries(CHEQUE_STATUSES).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
          </Select>
        </div>

        <div className="bg-card rounded-xl border overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-muted/50"><tr className="text-left text-sm"><th className="p-4 font-medium">Party</th><th className="p-4 font-medium">Cheque #</th><th className="p-4 font-medium">Bank</th><th className="p-4 font-medium">Amount</th><th className="p-4 font-medium">Due Date</th><th className="p-4 font-medium">Status</th><th className="p-4 font-medium">Actions</th></tr></thead>
              <tbody className="divide-y">
                {filteredCheques.length === 0 ? (
                  <tr><td colSpan={7} className="p-8 text-center text-muted-foreground">No cheques found</td></tr>
                ) : filteredCheques.map((cheque) => (
                  <tr key={cheque.id} className="hover:bg-muted/30">
                    <td className="p-4 font-medium">{cheque.party_name}</td>
                    <td className="p-4 font-mono text-sm">{cheque.cheque_number}</td>
                    <td className="p-4">{cheque.bank_name}</td>
                    <td className="p-4 font-semibold">{formatCurrency(Number(cheque.amount))}</td>
                    <td className="p-4">{cheque.due_date ? format(new Date(cheque.due_date), 'MMM d, yyyy') : '-'}</td>
                    <td className="p-4"><ChequeStatusBadge status={cheque.status} /></td>
                    <td className="p-4">
                      <div className="flex items-center gap-2">
                        {cheque.status !== 'bounced' && cheque.status !== 'cleared' && (
                          <Button variant="ghost" size="icon" onClick={() => { setSelectedChequeId(cheque.id); setIsBounceOpen(true); }}><AlertTriangle className="h-4 w-4 text-destructive" /></Button>
                        )}
                        {cheque.status === 'pending' && (
                          <Button variant="ghost" size="sm" onClick={() => updateCheque({ id: cheque.id, status: 'deposited' })}>Deposit</Button>
                        )}
                        {cheque.status === 'deposited' && (
                          <Button variant="ghost" size="sm" onClick={() => updateCheque({ id: cheque.id, status: 'cleared' })}>Clear</Button>
                        )}
                        <Button variant="ghost" size="icon" onClick={() => deleteCheque(cheque.id)}><Trash2 className="h-4 w-4" /></Button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <Dialog open={isBounceOpen} onOpenChange={setIsBounceOpen}>
          <DialogContent>
            <DialogHeader><DialogTitle>Mark Cheque as Bounced</DialogTitle></DialogHeader>
            <div className="space-y-4">
              <div><Label>Bounce Reason</Label>
                <Select value={bounceReason} onValueChange={(v) => setBounceReason(v as BounceReason)}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>{Object.entries(BOUNCE_REASONS).map(([k, v]) => <SelectItem key={k} value={k}>{v}</SelectItem>)}</SelectContent>
                </Select>
              </div>
              <div><Label>Remarks (Optional)</Label><Input value={bounceRemarks} onChange={(e) => setBounceRemarks(e.target.value)} placeholder="Additional notes..." /></div>
              <Button onClick={handleMarkBounced} variant="destructive" className="w-full">Mark as Bounced</Button>
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </AppLayout>
  );
}
export default function Page() {
  return null;
}
