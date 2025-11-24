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
import type { Account, Transaction } from '@/types';

export default function Home() {
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mainCurrency, setMainCurrency] = useState('USD');
  const [totalBalance, setTotalBalance] = useState(0);
  const [totalIncome, setTotalIncome] = useState(0);
  const [totalExpense, setTotalExpense] = useState(0);

  useEffect(() => {
    const updateData = () => {
      const data = storage.getData();
      setAccounts(data.accounts);
      setMainCurrency(data.settings.mainCurrency);
      
      const recentTransactions = data.transactions
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
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

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <Link href="/accounts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Balance
              </CardTitle>
            </CardHeader>
            <CardContent>
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
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-income" />
                This Month Income
              </CardTitle>
            </CardHeader>
            <CardContent>
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
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <TrendingDown className="h-4 w-4 text-expense" />
                This Month Expense
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-expense">
                {formatCurrency(totalExpense, mainCurrency)}
              </div>
            </CardContent>
          </Card>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Accounts
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{accounts.length}</div>
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
              <CardTitle>Accounts</CardTitle>
            </CardHeader>
            <CardContent>
              {accounts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <Wallet className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No accounts yet</p>
                  <Link href="/accounts/new">
                    <Button className="mt-4" variant="outline">
                      Create Account
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
                        <div>
                          <div className="font-medium">{account.name}</div>
                          <div className="text-sm text-muted-foreground">{account.type}</div>
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
              <CardTitle>Recent Transactions</CardTitle>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <ArrowLeftRight className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>No transactions yet</p>
                  <Link href="/transactions/new">
                    <Button className="mt-4" variant="outline">
                      Add Transaction
                    </Button>
                  </Link>
                </div>
              ) : (
                <div className="space-y-2">
                  {transactions.map((transaction) => {
                    const account = accounts.find(a => a.id === transaction.accountId);
                    const isIncome = transaction.type === 'income';
                    const isTransfer = transaction.type === 'transfer';
                    
                    return (
                      <Link
                        key={transaction.id}
                        href={`/transactions/${transaction.id}`}
                        className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors"
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`h-10 w-10 rounded-full flex items-center justify-center ${
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
                          <div>
                            <div className="font-medium">{transaction.note || 'Transaction'}</div>
                            <div className="text-sm text-muted-foreground">
                              {account?.name} • {formatDate(transaction.date)}
                            </div>
                          </div>
                        </div>
                        <div className={`font-semibold ${
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
