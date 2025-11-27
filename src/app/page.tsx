'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight, Wallet } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { exchangeRates } from '@/lib/exchange-rates';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { useLocale } from '@/hooks/useLocale';
import { t, getCategoryName } from '@/lib/i18n';
import type { Account, Transaction, Category } from '@/types';

export default function Home() {
  const { locale } = useLocale();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mainCurrency, setMainCurrency] = useState('USD');
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const updateData = () => {
      const data = storage.getData();
      setAccounts(data.accounts);
      setCategories(data.categories);
      setMainCurrency(data.settings.mainCurrency);
      
      const recentTransactions = data.transactions
        .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
        .slice(0, 10);
      setTransactions(recentTransactions);

      // Calculate totals
      const totalByCurrency = data.accounts.reduce((acc, account) => {
        acc[account.currency] = (acc[account.currency] || 0) + account.balance;
        return acc;
      }, {} as Record<string, number>);

      const total = Object.entries(totalByCurrency).reduce((sum, [currency, amount]) => {
        return sum + exchangeRates.convert(amount, currency, data.settings.mainCurrency);
      }, 0);
      setTotalBalance(total);

      const now = new Date();
      const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      const thisMonthTransactions = data.transactions.filter(
        t => new Date(t.date) >= thisMonth
      );

      const income = thisMonthTransactions
        .filter(t => t.type === 'income')
        .reduce((sum, t) => sum + exchangeRates.convert(t.amount, t.currency, data.settings.mainCurrency), 0);
      
      const expense = thisMonthTransactions
        .filter(t => t.type === 'expense')
        .reduce((sum, t) => sum + exchangeRates.convert(t.amount, t.currency, data.settings.mainCurrency), 0);

      setTotalIncome(income);
      setTotalExpense(expense);
    };

    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, []);

  const totalByCurrency = accounts.reduce((acc, account) => {
    acc[account.currency] = (acc[account.currency] || 0) + account.balance;
    return acc;
  }, {} as Record<string, number>);

  const getCategory = (id: string) => categories.find(c => c.id === id);

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-7xl overflow-x-hidden">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('dashboard.title', locale)}</h1>
        <Link href="/transactions/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('dashboard.addTransaction', locale)}
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 mb-6 items-stretch">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="h-full"
        >
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {t('dashboard.totalBalance', locale)}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-2xl font-bold">{formatCurrency(totalBalance, mainCurrency)}</div>
              {Object.keys(totalByCurrency).length > 1 && (
                <div className="mt-2 space-y-1">
                  {Object.entries(totalByCurrency).map(([currency, amount]) => (
                    <div key={currency} className="text-xs text-muted-foreground">
                      {formatCurrency(amount, currency)}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="h-full"
        >
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-income" />
                {t('dashboard.thisMonthIncome', locale)}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-2xl font-bold text-income">
                {formatCurrency(totalIncome, mainCurrency)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="h-full"
        >
          <Card className="h-full flex flex-col">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-expense" />
                {t('dashboard.thisMonthExpense', locale)}
              </CardTitle>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="text-2xl font-bold text-expense">
                {formatCurrency(totalExpense, mainCurrency)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.accounts', locale)}</CardTitle>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('dashboard.noAccounts', locale)}</p>
                  <Link href="/accounts/new">
                    <Button className="mt-4" variant="outline">
                      {t('dashboard.createAccount', locale)}
                    </Button>
                  </Link>
        </div>
              ) : (
                <div className="space-y-2">
                  {accounts.map((account) => (
                    <Link
                      key={account.id}
                      href={`/accounts/${account.id}`}
                      className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className="h-10 w-10 rounded-full flex items-center justify-center"
                          style={{ backgroundColor: account.color + '20' }}
                        >
                          <div
                            className="h-6 w-6 rounded-full"
                            style={{ backgroundColor: account.color }}
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="font-medium break-words">{account.name}</div>
                          <div className="text-sm text-muted-foreground break-words">{t(`accounts.accountTypes.${account.type}`, locale)}</div>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="font-semibold">
                          {formatCurrency(account.balance, account.currency)}
                        </div>
                        <div className="text-xs text-muted-foreground">
                          {formatCurrency(
                            exchangeRates.convert(account.balance, account.currency, mainCurrency),
                            mainCurrency
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
        >
          <Card>
            <CardHeader>
              <CardTitle>{t('dashboard.recentTransactions', locale)}</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>{t('dashboard.noTransactions', locale)}</p>
                  <Link href="/transactions/new">
                    <Button className="mt-4" variant="outline">
                      {t('dashboard.addTransaction', locale)}
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => {
                    const account = accounts.find(a => a.id === transaction.accountId);
                    const category = getCategory(transaction.categoryId);
                    const isIncome = transaction.type === 'income';
                    const isTransfer = transaction.type === 'transfer';
                    
                    return (
                      <Link
                        key={transaction.id}
                        href={`/transactions/${transaction.id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors min-w-0"
                      >
                        <div className="flex items-center gap-3 flex-1 min-w-0">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center flex-shrink-0 ${
                              isIncome ? 'bg-income/20' : isTransfer ? 'bg-transfer/20' : 'bg-expense/20'
                            }`}
                          >
                            {isIncome ? (
                              <TrendingUp className={`h-5 w-5 ${isIncome ? 'text-income' : ''}`} />
                            ) : isTransfer ? (
                              <ArrowLeftRight className="h-5 w-5 text-transfer" />
                            ) : (
                              <TrendingDown className="h-5 w-5 text-expense" />
                            )}
                          </div>
                          <div className="min-w-0 flex-1">
                            <div className="font-medium break-words">
                              {category ? getCategoryName(category, locale) : t('transactions.transfer', locale)}
                              {transaction.note && (
                                <span className="text-muted-foreground text-sm ml-2 break-words">
                                  {transaction.note}
                                </span>
                              )}
                            </div>
                            <div className="text-sm text-muted-foreground break-words">
                              {account?.name} • {formatDate(transaction.date, locale)}
                            </div>
                          </div>
                        </div>
                        <div className={`font-semibold flex-shrink-0 ml-2 ${
                          isIncome ? 'text-income' : isTransfer ? 'text-transfer' : 'text-expense'
                        }`}>
                          {isIncome ? '+' : '-'}
                          {formatCurrency(transaction.amount, transaction.currency)}
                        </div>
                      </Link>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </motion.div>
        </div>
    </div>
  );
}
