export type ChequeStatus = 'pending' | 'deposited' | 'cleared' | 'bounced';
export type BounceReason = 'insufficient_funds' | 'signature_mismatch' | 'account_closed' | 'stop_payment' | 'stale_dated' | 'other';
export type RecoveryStatus = 'pending' | 'in_progress' | 'recovered' | 'written_off';

export interface Cheque {
  id: string;
  user_id: string;
  party_name: string;
  cheque_number: string;
  bank_name: string;
  amount: number;
  issue_date: string;
  due_date: string | null;
  status: ChequeStatus;
  bounce_reason: BounceReason | null;
  bounce_date: string | null;
  bounce_remarks: string | null;
  recovery_status: RecoveryStatus | null;
  created_at: string;
  updated_at: string;
}

export interface FollowUp {
  id: string;
  cheque_id: string;
  user_id: string;
  contact_date: string;
  next_follow_up_date: string | null;
  notes: string | null;
  action_taken: string | null;
  created_at: string;
}

export interface Profile {
  id: string;
  user_id: string;
  full_name: string | null;
  company_name: string | null;
  created_at: string;
  updated_at: string;
}

export interface DashboardStats {
  totalCheques: number;
  pendingCheques: number;
  clearedCheques: number;
  bouncedCheques: number;
  totalAmount: number;
  pendingAmount: number;
  bouncedAmount: number;
  recoveredAmount: number;
  upcomingDueCount: number;
  overdueCount: number;
}

export const BOUNCE_REASONS: Record<BounceReason, string> = {
  insufficient_funds: 'Insufficient Funds',
  signature_mismatch: 'Signature Mismatch',
  account_closed: 'Account Closed',
  stop_payment: 'Stop Payment',
  stale_dated: 'Stale Dated',
  other: 'Other',
};

export const RECOVERY_STATUSES: Record<RecoveryStatus, string> = {
  pending: 'Pending',
  in_progress: 'In Progress',
  recovered: 'Recovered',
  written_off: 'Written Off',
};

export const CHEQUE_STATUSES: Record<ChequeStatus, string> = {
  pending: 'Pending',
  deposited: 'Deposited',
  cleared: 'Cleared',
  bounced: 'Bounced',
};