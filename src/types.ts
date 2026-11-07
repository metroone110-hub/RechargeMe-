export type Operator = 'MTN' | 'Orange' | 'Moov';

export type PaymentProvider = 'Solde RechargeMe' | 'Wave' | 'MTN Money' | 'Orange Money' | 'Moov Money';

export type PlanKind = 'internet' | 'appels';

export interface Plan {
  id: string;
  name: string;
  valid: string;
  days: number;
  price: number;
  kind: PlanKind;
  operator: Operator;
}

export type TransactionKind = 'airtime' | 'internet' | 'appels' | 'in' | 'out';

export interface Transaction {
  id: string;
  ref: string;
  date: string;
  kind: TransactionKind;
  label: string;
  sub: string;
  phone?: string;
  amount: number; // positive for top-up/incoming, negative for purchase/outgoing
  provider?: PaymentProvider;
  operator?: Operator;
  status?: 'success' | 'pending' | 'failed';
}

export interface UserAccount {
  phone: string;
  balance: number;
  hideBalance?: boolean;
  tx: Transaction[];
  createdAt: string;
}

export interface BuyState {
  type: 'airtime' | 'internet' | 'appels';
  phone: string;
  amount: number;
  plan: Plan | null;
  durationFilter: 'all' | 'short' | 'medium' | 'long';
  searchQuery: string;
}
