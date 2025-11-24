'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Target, Edit, Trash2, TrendingDown } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { exchangeRates } from '@/lib/exchange-rates';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import type { Budget, Category, Transaction } from '@/types';

export default function BudgetsPage() {
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mainCurrency, setMainCurrency] = useState('USD');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [budgetToDelete, setBudgetToDelete] = useState<string | null>(null);

  useEffect(() => {
    const updateData = () => {
      const data = storage.getData();
      setBudgets(data.budgets);
      setCategories(data.categories);
      setTransactions(data.transactions);
      setMainCurrency(data.settings.mainCurrency);
    };
    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = (id: string) => {
    setBudgetToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (budgetToDelete) {
      storage.deleteBudget(budgetToDelete);
      setDeleteDialogOpen(false);
      setBudgetToDelete(null);
    }
  };

  const getCategory = (id: string) => categories.find(c => c.id === id);
  
  const getBudgetSpent = (budget: Budget): number => {
    const now = new Date();
    const startDate = new Date(budget.startDate);
    let endDate = budget.endDate ? new Date(budget.endDate) : new Date();
    
    // Determine period end based on period type
    if (!budget.endDate) {
      if (budget.period === 'weekly') {
        endDate = new Date(startDate);
        endDate.setDate(endDate.getDate() + 7);
      } else if (budget.period === 'monthly') {
        endDate = new Date(startDate);
        endDate.setMonth(endDate.getMonth() + 1);
      } else if (budget.period === 'yearly') {
        endDate = new Date(startDate);
        endDate.setFullYear(endDate.getFullYear() + 1);
      }
    }
    
    const relevantTransactions = transactions.filter(t => {
      const tDate = new Date(t.date);
      return (
        t.categoryId === budget.categoryId &&
        t.type === 'expense' &&
        tDate >= startDate &&
        tDate <= endDate
      );
    });
    
    return relevantTransactions.reduce((sum, t) => {
      return sum + exchangeRates.convert(t.amount, t.currency, budget.currency);
    }, 0);
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Budgets</h1>
        <Link href="/budgets/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Budget
          </Button>
        </Link>
      </div>

      {budgets.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Target className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No budgets yet</h3>
            <p className="text-muted-foreground mb-6">Create budgets to track your spending</p>
            <Link href="/budgets/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Budget
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {budgets.map((budget, index) => {
            const category = getCategory(budget.categoryId);
            const spent = getBudgetSpent(budget);
            const remaining = budget.amount - spent;
            const percentage = (spent / budget.amount) * 100;
            const isOverBudget = spent > budget.amount;
            
            return (
              <motion.div
                key={budget.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="h-full"
              >
                <Card className="h-full flex flex-col">
                  <CardContent className="p-6 flex flex-col flex-1">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-12 w-12 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: category?.color + '20' || '#64748B20' }}
                        >
                          <Target className="h-6 w-6" style={{ color: category?.color || '#64748B' }} />
                        </div>
                        <div>
                          <h3 className="font-semibold text-lg">{category?.name || 'Unknown'}</h3>
                          <p className="text-sm text-muted-foreground capitalize">{budget.period}</p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <Link href={`/budgets/${budget.id}/edit`}>
                          <Button variant="ghost" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDelete(budget.id)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
                      </div>
                    </div>
                    
                    <div className="space-y-3 flex-1">
                      <div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Budget</span>
                          <span className="font-semibold">
                            {formatCurrency(budget.amount, budget.currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm mb-1">
                          <span className="text-muted-foreground">Spent</span>
                          <span className={`font-semibold ${isOverBudget ? 'text-expense' : ''}`}>
                            {formatCurrency(spent, budget.currency)}
                          </span>
                        </div>
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Remaining</span>
                          <span className={`font-semibold ${remaining < 0 ? 'text-expense' : 'text-income'}`}>
                            {formatCurrency(remaining, budget.currency)}
                          </span>
                        </div>
                      </div>
                      
                      <div className="pt-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isOverBudget ? 'bg-expense' : percentage > 80 ? 'bg-warning' : 'bg-income'
                            }`}
                            style={{ width: `${Math.min(percentage, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 text-center">
                          {percentage.toFixed(1)}% used
                        </div>
                      </div>
                      
                      <div className="text-xs text-muted-foreground pt-2 border-t border-border">
                        {formatDate(budget.startDate)}
                        {budget.endDate && ` - ${formatDate(budget.endDate)}`}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setBudgetToDelete(null);
        }}
        title="Delete Budget"
      >
        <p className="mb-4">Are you sure you want to delete this budget?</p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setDeleteDialogOpen(false);
              setBudgetToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

