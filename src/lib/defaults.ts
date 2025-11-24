import type { Category } from '@/types';
import { storage } from './storage';

export const defaultCategories: Category[] = [
  // Income categories
  { id: 'income-salary', name: 'Salary', type: 'income', color: '#10B981', icon: 'Briefcase', createdAt: new Date().toISOString() },
  { id: 'income-freelance', name: 'Freelance', type: 'income', color: '#3B82F6', icon: 'Laptop', createdAt: new Date().toISOString() },
  { id: 'income-investment', name: 'Investment', type: 'income', color: '#8B5CF6', icon: 'TrendingUp', createdAt: new Date().toISOString() },
  { id: 'income-other', name: 'Other Income', type: 'income', color: '#06B6D4', icon: 'DollarSign', createdAt: new Date().toISOString() },
  
  // Expense categories
  { id: 'expense-food', name: 'Food & Dining', type: 'expense', color: '#F59E0B', icon: 'UtensilsCrossed', createdAt: new Date().toISOString() },
  { id: 'expense-shopping', name: 'Shopping', type: 'expense', color: '#EC4899', icon: 'ShoppingBag', createdAt: new Date().toISOString() },
  { id: 'expense-transport', name: 'Transportation', type: 'expense', color: '#6366F1', icon: 'Car', createdAt: new Date().toISOString() },
  { id: 'expense-bills', name: 'Bills & Utilities', type: 'expense', color: '#EF4444', icon: 'Home', createdAt: new Date().toISOString() },
  { id: 'expense-entertainment', name: 'Entertainment', type: 'expense', color: '#8B5CF6', icon: 'Film', createdAt: new Date().toISOString() },
  { id: 'expense-health', name: 'Health & Fitness', type: 'expense', color: '#10B981', icon: 'Heart', createdAt: new Date().toISOString() },
  { id: 'expense-education', name: 'Education', type: 'expense', color: '#06B6D4', icon: 'GraduationCap', createdAt: new Date().toISOString() },
  { id: 'expense-other', name: 'Other Expense', type: 'expense', color: '#64748B', icon: 'MoreHorizontal', createdAt: new Date().toISOString() },
];

export function initializeDefaults() {
  if (typeof window === 'undefined') return;
  
  const data = storage.getData();
  
  // Initialize default categories if none exist
  if (data.categories.length === 0) {
    data.categories = defaultCategories;
    storage.saveData(data);
  }
}

