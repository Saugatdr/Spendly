export type TransactionType = 'income' | 'expense' | 'freelanceSalary';

export interface Category {
  id: string;
  name: string;
  icon: string;
  color: string;
  budgetLimit?: number;
}

export interface Transaction {
  id: string;
  type: TransactionType;
  amount: number;
  categoryId: string;
  note: string;
  date: string; // ISO string
  createdAt: string;
  clientName?: string; // freelance salary only
}

export interface Budget {
  categoryId: string;
  limit: number;
  month: string; // "YYYY-MM"
}

export interface AppSettings {
  currency: string;
  currencySymbol: string;
  darkMode: boolean;
}
