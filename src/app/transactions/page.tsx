'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import {Plus, TrendingUp, TrendingDown, ArrowLeftRight, Filter, Calendar, ArrowUpDown, Wallet} from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { useLocale } from '@/hooks/useLocale';
import { t, getCategoryName } from '@/lib/i18n';
import type { Transaction, Account, Category } from '@/types';

export default function TransactionsPage() {
  const { locale } = useLocale();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [filterType, setFilterType] = useState<string>('all');
  const [filterAccount, setFilterAccount] = useState<string>('all');
  const [sortBy, setSortBy] = useState<string>('date-desc');

  useEffect(() => {
    const updateData = () => {
      const data = storage.getData();
      setAccounts(data.accounts);
      setCategories(data.categories);
      
      let filtered = data.transactions;
      
      if (filterType !== 'all') {
        filtered = filtered.filter(t => t.type === filterType);
      }
      
      if (filterAccount !== 'all') {
        filtered = filtered.filter(t => t.accountId === filterAccount || t.toAccountId === filterAccount);
      }
      
      // Apply sorting - default to creation order (newest first)
      filtered = filtered.sort((a, b) => {
        switch (sortBy) {
          case 'date-desc':
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
          case 'date-asc':
            return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
          case 'amount-desc':
            return b.amount - a.amount;
          case 'amount-asc':
            return a.amount - b.amount;
          case 'type':
            return a.type.localeCompare(b.type);
          default:
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        }
      });
      
      setTransactions(filtered);
    };
    
    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, [filterType, filterAccount, sortBy]);

  const getAccount = (id: string) => accounts.find(a => a.id === id);
  const getCategory = (id: string) => categories.find(c => c.id === id);

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-7xl overflow-x-hidden">
      <div className="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">{t('transactions.title', locale)}</h1>
        <div className="grid sm:flex gap-2">
          <Link href="/planned">
            <Button variant="outline">
              <Calendar className="mr-2 h-4 w-4" />
              {t('transactions.planned', locale)}
            </Button>
          </Link>
          <Link href="/transactions/new">
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              {t('transactions.addTransaction', locale)}
            </Button>
          </Link>
        </div>
      </div>

      <div className="mb-6 grid lg:flex flex-wrap gap-4">
        <div className="flex items-center gap-2">
          <Filter className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filterType}
            onChange={(e) => setFilterType(e.target.value)}
            className="lg:w-xs"
          >
            <option value="all">{t('transactions.allTypes', locale)}</option>
            <option value="income">{t('transactions.income', locale)}</option>
            <option value="expense">{t('transactions.expense', locale)}</option>
            <option value="transfer">{t('transactions.transfer', locale)}</option>
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-muted-foreground" />
          <Select
            value={filterAccount}
            onChange={(e) => setFilterAccount(e.target.value)}
            className="lg:w-xs"
          >
            <option value="all">{t('transactions.allAccounts', locale)}</option>
            {accounts.map((account) => (
              <option key={account.id} value={account.id}>
                {account.name}
              </option>
            ))}
          </Select>
        </div>
        <div className="flex items-center gap-2">
          <ArrowUpDown className="h-4 w-4 text-muted-foreground" />
          <span className="text-sm text-muted-foreground hidden sm:inline">{t('transactions.sortBy', locale)}:</span>
          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="lg:w-sm"
          >
            <option value="date-desc">{t('transactions.dateNewest', locale)}</option>
            <option value="date-asc">{t('transactions.dateOldest', locale)}</option>
            <option value="amount-desc">{t('transactions.amountHigh', locale)}</option>
            <option value="amount-asc">{t('transactions.amountLow', locale)}</option>
            <option value="type">{t('transactions.sortType', locale)}</option>
          </Select>
        </div>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <ArrowLeftRight className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No transactions yet</h3>
            <p className="text-muted-foreground mb-6">Start tracking your finances by adding your first transaction</p>
            <Link href="/transactions/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Add Transaction
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {transactions.map((transaction, index) => {
            const account = getAccount(transaction.accountId);
            const category = getCategory(transaction.categoryId);
            const isIncome = transaction.type === 'income';
            const isTransfer = transaction.type === 'transfer';
            
            return (
              <motion.div
                key={transaction.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Link href={`/transactions/${transaction.id}`}>
                  <Card className="hover:shadow-md transition-shadow">
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isIncome ? 'bg-income/20' : isTransfer ? 'bg-transfer/20' : 'bg-expense/20'
                            }`}
                          >
                            {isIncome ? (
                              <TrendingUp className="h-5 w-5 text-income" />
                            ) : isTransfer ? (
                              <ArrowLeftRight className="h-5 w-5 text-transfer" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-expense" />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-medium break-words">
                              {category ? getCategoryName(category, locale) : t('transactions.transfer', locale)}
                              {transaction.note && (
                                <span className="text-muted-foreground text-sm ml-2 break-words">
                                  {transaction.note}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground break-words">
                              {account?.name}
                              {isTransfer && transaction.toAccountId && (
                                <>
                                  {' → '}
                                  {getAccount(transaction.toAccountId)?.name}
                                </>
                              )}
                              {' • '}
                              {formatDate(transaction.date)}
                            </div>
                          </div>
                        </div>
                        <div className={`font-semibold text-right flex-shrink-0 ${
                          isIncome ? 'text-income' : isTransfer ? 'text-transfer' : 'text-expense'
                        }`}>
                          {isIncome ? '+' : '-'}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              </motion.div>
            );
          })}
        </div>
      )}
    </div>
  );
}

