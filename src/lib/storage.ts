'use client';

import type { AppData, Account, Category, Transaction, PlannedTransaction, Budget, Settings, TransactionTemplate } from '@/types';

const STORAGE_KEY = 'purseful-app-data';

const defaultSettings: Settings = {
  mainCurrency: 'USD',
  theme: 'system',
  locale: 'en',
  exchangeRates: [],
};

const defaultData: AppData = {
  accounts: [],
  categories: [],
  transactions: [],
  plannedTransactions: [],
  budgets: [],
  transactionTemplates: [],
  settings: defaultSettings,
};

export const storage = {
  getData(): AppData {
    if (typeof window === 'undefined') return defaultData;
    
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return defaultData;
      
      const data = JSON.parse(stored) as AppData;
      // Ensure all required fields exist
      return {
        accounts: data.accounts || [],
        categories: data.categories || [],
        transactions: data.transactions || [],
        plannedTransactions: data.plannedTransactions || [],
        budgets: data.budgets || [],
        transactionTemplates: data.transactionTemplates || [],
        settings: { ...defaultSettings, ...data.settings },
      };
    } catch (error) {
      console.error('Error loading data:', error);
      return defaultData;
    }
  },

  saveData(data: AppData): void {
    if (typeof window === 'undefined') return;
    
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving data:', error);
    }
  },

  exportData(): string {
    const data = this.getData();
    return JSON.stringify(data, null, 2);
  },

  importData(jsonString: string): boolean {
    try {
      const data = JSON.parse(jsonString) as AppData;
      // Validate structure
      if (
        Array.isArray(data.accounts) &&
        Array.isArray(data.categories) &&
        Array.isArray(data.transactions) &&
        Array.isArray(data.plannedTransactions) &&
        Array.isArray(data.budgets) &&
        data.settings
      ) {
        this.saveData(data);
        return true;
      }
      return false;
    } catch (error) {
      console.error('Error importing data:', error);
      return false;
    }
  },

  // Account operations
  addAccount(account: Account): void {
    const data = this.getData();
    data.accounts.push(account);
    this.saveData(data);
  },

  updateAccount(id: string, updates: Partial<Account>): void {
    const data = this.getData();
    const index = data.accounts.findIndex(a => a.id === id);
    if (index !== -1) {
      data.accounts[index] = { ...data.accounts[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveData(data);
    }
  },

  deleteAccount(id: string): void {
    const data = this.getData();
    data.accounts = data.accounts.filter(a => a.id !== id);
    // Also delete related transactions
    data.transactions = data.transactions.filter(t => t.accountId !== id && t.toAccountId !== id);
    this.saveData(data);
  },

  // Category operations
  addCategory(category: Category): void {
    const data = this.getData();
    data.categories.push(category);
    this.saveData(data);
  },

  updateCategory(id: string, updates: Partial<Category>): void {
    const data = this.getData();
    const index = data.categories.findIndex(c => c.id === id);
    if (index !== -1) {
      data.categories[index] = { ...data.categories[index], ...updates };
      this.saveData(data);
    }
  },

  deleteCategory(id: string): void {
    const data = this.getData();
    data.categories = data.categories.filter(c => c.id !== id);
    // Update transactions to remove category reference
    data.transactions = data.transactions.map(t => 
      t.categoryId === id ? { ...t, categoryId: '' } : t
    );
    this.saveData(data);
  },

  // Transaction operations
  addTransaction(transaction: Transaction): void {
    const data = this.getData();
    data.transactions.push(transaction);
    
    // Update account balance
    const account = data.accounts.find(a => a.id === transaction.accountId);
    if (account) {
      if (transaction.type === 'income') {
        account.balance += transaction.amount;
      } else if (transaction.type === 'expense') {
        account.balance -= transaction.amount;
      } else if (transaction.type === 'transfer' && transaction.toAccountId) {
        account.balance -= transaction.amount;
        const toAccount = data.accounts.find(a => a.id === transaction.toAccountId);
        if (toAccount) {
          toAccount.balance += transaction.amount;
        }
      }
      account.updatedAt = new Date().toISOString();
    }
    
    this.saveData(data);
  },

  updateTransaction(id: string, updates: Partial<Transaction>): void {
    const data = this.getData();
    const index = data.transactions.findIndex(t => t.id === id);
    if (index !== -1) {
      const oldTransaction = data.transactions[index];
      // Revert old transaction
      const account = data.accounts.find(a => a.id === oldTransaction.accountId);
      if (account) {
        if (oldTransaction.type === 'income') {
          account.balance -= oldTransaction.amount;
        } else if (oldTransaction.type === 'expense') {
          account.balance += oldTransaction.amount;
        } else if (oldTransaction.type === 'transfer' && oldTransaction.toAccountId) {
          account.balance += oldTransaction.amount;
          const toAccount = data.accounts.find(a => a.id === oldTransaction.toAccountId);
          if (toAccount) {
            toAccount.balance -= oldTransaction.amount;
          }
        }
      }
      
      // Apply new transaction
      const newTransaction = { ...oldTransaction, ...updates, updatedAt: new Date().toISOString() };
      data.transactions[index] = newTransaction;
      
      const updatedAccount = data.accounts.find(a => a.id === newTransaction.accountId);
      if (updatedAccount) {
        if (newTransaction.type === 'income') {
          updatedAccount.balance += newTransaction.amount;
        } else if (newTransaction.type === 'expense') {
          updatedAccount.balance -= newTransaction.amount;
        } else if (newTransaction.type === 'transfer' && newTransaction.toAccountId) {
          updatedAccount.balance -= newTransaction.amount;
          const toAccount = data.accounts.find(a => a.id === newTransaction.toAccountId);
          if (toAccount) {
            toAccount.balance += newTransaction.amount;
          }
        }
        updatedAccount.updatedAt = new Date().toISOString();
      }
      
      this.saveData(data);
    }
  },

  deleteTransaction(id: string): void {
    const data = this.getData();
    const transaction = data.transactions.find(t => t.id === id);
    if (transaction) {
      // Revert balance change
      const account = data.accounts.find(a => a.id === transaction.accountId);
      if (account) {
        if (transaction.type === 'income') {
          account.balance -= transaction.amount;
        } else if (transaction.type === 'expense') {
          account.balance += transaction.amount;
        } else if (transaction.type === 'transfer' && transaction.toAccountId) {
          account.balance += transaction.amount;
          const toAccount = data.accounts.find(a => a.id === transaction.toAccountId);
          if (toAccount) {
            toAccount.balance -= transaction.amount;
          }
        }
        account.updatedAt = new Date().toISOString();
      }
      data.transactions = data.transactions.filter(t => t.id !== id);
      this.saveData(data);
    }
  },

  // Planned transaction operations
  addPlannedTransaction(plannedTransaction: PlannedTransaction): void {
    const data = this.getData();
    data.plannedTransactions.push(plannedTransaction);
    this.saveData(data);
  },

  updatePlannedTransaction(id: string, updates: Partial<PlannedTransaction>): void {
    const data = this.getData();
    const index = data.plannedTransactions.findIndex(pt => pt.id === id);
    if (index !== -1) {
      data.plannedTransactions[index] = { ...data.plannedTransactions[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveData(data);
    }
  },

  deletePlannedTransaction(id: string): void {
    const data = this.getData();
    data.plannedTransactions = data.plannedTransactions.filter(pt => pt.id !== id);
    this.saveData(data);
  },

  // Budget operations
  addBudget(budget: Budget): void {
    const data = this.getData();
    data.budgets.push(budget);
    this.saveData(data);
  },

  updateBudget(id: string, updates: Partial<Budget>): void {
    const data = this.getData();
    const index = data.budgets.findIndex(b => b.id === id);
    if (index !== -1) {
      data.budgets[index] = { ...data.budgets[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveData(data);
    }
  },

  deleteBudget(id: string): void {
    const data = this.getData();
    data.budgets = data.budgets.filter(b => b.id !== id);
    this.saveData(data);
  },

  // Transaction template operations
  addTransactionTemplate(template: TransactionTemplate): void {
    const data = this.getData();
    data.transactionTemplates.push(template);
    this.saveData(data);
  },

  updateTransactionTemplate(id: string, updates: Partial<TransactionTemplate>): void {
    const data = this.getData();
    const index = data.transactionTemplates.findIndex(t => t.id === id);
    if (index !== -1) {
      data.transactionTemplates[index] = { ...data.transactionTemplates[index], ...updates, updatedAt: new Date().toISOString() };
      this.saveData(data);
    }
  },

  deleteTransactionTemplate(id: string): void {
    const data = this.getData();
    data.transactionTemplates = data.transactionTemplates.filter(t => t.id !== id);
    this.saveData(data);
  },

  // Settings operations
  updateSettings(updates: Partial<Settings>): void {
    const data = this.getData();
    data.settings = { ...data.settings, ...updates };
    this.saveData(data);
  },
};

