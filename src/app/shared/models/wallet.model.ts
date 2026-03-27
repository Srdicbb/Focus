export interface WalletCategory {
  id: string;
  name: string;
  defaultPercent?: number;
}

export interface WalletEntry {
  id: string;
  categoryId: string;
  amount: number; // positive = income, negative = expense
  note?: string;
  monthKey: string;
  createdAt: Date;
  batchId?: string;
}

export interface CategoryBalance {
  category: WalletCategory;
  income: number;
  expenses: number;
  balance: number;
}

export interface WalletMonthSummary {
  monthKey: string;
  totalIncome: number;
  totalExpenses: number;
  netBalance: number;
  carryOver: number;
  categories: CategoryBalance[];
}
