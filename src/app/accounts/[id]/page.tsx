'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2, Plus, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { exchangeRates } from '@/lib/exchange-rates';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import type { Account, Transaction } from '@/types';

export default function AccountDetailPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;
  const [account, setAccount] = useState<Account | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [mainCurrency, setMainCurrency] = useState('USD');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const updateData = () => {
      const data = storage.getData();
      const acc = data.accounts.find(a => a.id === accountId);
      if (!acc) {
        router.push('/accounts');
        return;
      }
      setAccount(acc);
      setMainCurrency(data.settings.mainCurrency);
      
      const accountTransactions = data.transactions
        .filter(t => t.accountId === accountId || t.toAccountId === accountId)
        .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
      setTransactions(accountTransactions);
    };
    
    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, [accountId, router]);

  if (!account) return null;

  const handleDelete = () => {
    storage.deleteAccount(accountId);
    router.push('/accounts');
  };

  const income = transactions
    .filter(t => t.type === 'income' && t.accountId === accountId)
    .reduce((sum, t) => sum + exchangeRates.convert(t.amount, t.currency, mainCurrency), 0);

  const expense = transactions
    .filter(t => t.type === 'expense' && t.accountId === accountId)
    .reduce((sum, t) => sum + exchangeRates.convert(t.amount, t.currency, mainCurrency), 0);

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-4xl">
      <Link href="/accounts" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Accounts
      </Link>

      <Card className="mb-6">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div className="flex items-center gap-4">
              <div
                className="h-16 w-16 rounded-full flex items-center justify-center"
                style={{ backgroundColor: account.color + '20' }}
              >
                <div
                  className="h-12 w-12 rounded-full"
                  style={{ backgroundColor: account.color }}
                />
              </div>
              <div>
                <h1 className="text-3xl font-bold">{account.name}</h1>
                <p className="text-muted-foreground capitalize">{account.type}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/accounts/${accountId}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  Edit
                </Button>
              </Link>
              <Button variant="danger" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                Delete
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 pt-4 border-t border-border">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Balance</div>
              <div className="text-2xl font-bold">
                {formatCurrency(account.balance, account.currency)}
              </div>
              {account.currency !== mainCurrency && (
                <div className="text-sm text-muted-foreground">
                  ≈ {formatCurrency(
                    exchangeRates.convert(account.balance, account.currency, mainCurrency),
                    mainCurrency
                  )}
                </div>
              )}
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Income</div>
              <div className="text-2xl font-bold text-income">
                {formatCurrency(income, mainCurrency)}
              </div>
            </div>
            <div>
              <div className="text-sm text-muted-foreground mb-1">Expense</div>
              <div className="text-2xl font-bold text-expense">
                {formatCurrency(expense, mainCurrency)}
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-2xl font-bold">Transactions</h2>
        <Link href={`/transactions/new?accountId=${accountId}`}>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Transaction
          </Button>
        </Link>
      </div>

      {transactions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <p className="text-muted-foreground">No transactions yet</p>
            <Link href={`/transactions/new?accountId=${accountId}`}>
              <Button className="mt-4" variant="outline">
                Add Transaction
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-2">
          {transactions.map((transaction) => {
            const isIncome = transaction.type === 'income';
            const isTransfer = transaction.type === 'transfer';
            const isOutgoing = transaction.accountId === accountId;
            
            return (
              <Link key={transaction.id} href={`/transactions/${transaction.id}`}>
                <Card className="hover:shadow-md transition-shadow">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className={`h-10 w-10 rounded-full flex items-center justify-center ${
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
                        <div>
                          <div className="font-medium">{transaction.note || 'Transaction'}</div>
                          <div className="text-sm text-muted-foreground">
                            {formatDate(transaction.date)}
                          </div>
                        </div>
                      </div>
                      <div className={`font-semibold text-right ${
                        isIncome ? 'text-income' : isTransfer ? 'text-transfer' : 'text-expense'
                      }`}>
                        {isTransfer && !isOutgoing ? '+' : isIncome ? '+' : '-'}
                        {formatCurrency(transaction.amount, transaction.currency)}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </Link>
            );
          })}
        </div>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Account"
      >
        <p className="mb-4">Are you sure you want to delete this account? All related transactions will also be deleted.</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            Cancel
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

