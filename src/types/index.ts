export type TransactionType = 'income' | 'expense' | 'transfer';

export interface Account {
  id: string;
  name: string;
  type: 'cash' | 'bank' | 'card' | 'savings' | 'investment' | 'other';
  currency: string;
  balance: number;
  color: string;
  icon: string;
  createdAt: string;
  updatedAt: string;
}

export interface Category {
  id: string;
  name: string;
  type: TransactionType;
  color: string;
  icon: string;
  parentId?: string;
  createdAt: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  date: string;
  note?: string;
  toAccountId?: string; // For transfers
  createdAt: string;
  updatedAt: string;
}

export interface PlannedTransaction {
  id: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  startDate: string;
  endDate?: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly' | 'once';
  note?: string;
  toAccountId?: string;
  lastProcessedDate?: string; // Track last date processed to prevent duplicates
  createdAt: string;
  updatedAt: string;
}

export interface Budget {
  id: string;
  categoryId: string;
  amount: number;
  currency: string;
  period: 'weekly' | 'monthly' | 'yearly';
  startDate: string;
  endDate?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ExchangeRate {
  from: string;
  to: string;
  rate: number;
  updatedAt: string;
}

export interface Settings {
  mainCurrency: string;
  theme: 'light' | 'dark' | 'system';
  locale: 'en' | 'pl' | 'ru';
  exchangeRates: ExchangeRate[];
  lastExchangeRateUpdate?: string;
}

export interface TransactionTemplate {
  id: string;
  name: string;
  accountId: string;
  categoryId: string;
  type: TransactionType;
  amount: number;
  currency: string;
  note?: string;
  toAccountId?: string; // For transfers
  createdAt: string;
  updatedAt: string;
}

export interface AppData {
  accounts: Account[];
  categories: Category[];
  transactions: Transaction[];
  plannedTransactions: PlannedTransaction[];
  budgets: Budget[];
  transactionTemplates: TransactionTemplate[];
  settings: Settings;
}

