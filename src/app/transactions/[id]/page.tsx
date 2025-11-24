'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import type { Transaction, Account, Category } from '@/types';

export default function TransactionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);

  useEffect(() => {
    const updateData = () => {
      const data = storage.getData();
      const trans = data.transactions.find(t => t.id === transactionId);
      if (!trans) {
        router.push('/transactions');
        return;
      }
      setTransaction(trans);
      setAccounts(data.accounts);
      setCategories(data.categories);
    };
    
    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, [transactionId, router]);

  if (!transaction) return null;

  const account = accounts.find(a => a.id === transaction.accountId);
  const toAccount = transaction.toAccountId ? accounts.find(a => a.id === transaction.toAccountId) : null;
  const category = categories.find(c => c.id === transaction.categoryId);
  const isIncome = transaction.type === 'income';
  const isTransfer = transaction.type === 'transfer';

  const handleDelete = () => {
    storage.deleteTransaction(transactionId);
    router.push('/transactions');
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-2xl">
      <Link href="/transactions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Transactions
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {transaction.note || category?.name || 'Transaction'}
              </h1>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                isIncome ? 'bg-income/20 text-income' : 
                isTransfer ? 'bg-transfer/20 text-transfer' : 
                'bg-expense/20 text-expense'
              }`}>
                {transaction.type.charAt(0).toUpperCase() + transaction.type.slice(1)}
              </div>
            </div>
            <div className="flex gap-2">
              <Link href={`/transactions/${transactionId}/edit`}>
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

          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">Amount</div>
              <div className={`text-3xl font-bold ${
                isIncome ? 'text-income' : isTransfer ? 'text-transfer' : 'text-expense'
              }`}>
                {isIncome ? '+' : '-'}
                {formatCurrency(transaction.amount, transaction.currency)}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">Date</div>
              <div className="text-lg font-medium">{formatDate(transaction.date)}</div>
            </div>

            {account && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  {isTransfer ? 'From Account' : 'Account'}
                </div>
                <div className="text-lg font-medium">{account.name}</div>
              </div>
            )}

            {isTransfer && toAccount && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">To Account</div>
                <div className="text-lg font-medium">{toAccount.name}</div>
              </div>
            )}

            {category && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Category</div>
                <div className="text-lg font-medium">{category.name}</div>
              </div>
            )}

            {transaction.note && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">Note</div>
                <div className="text-lg">{transaction.note}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title="Delete Transaction"
      >
        <p className="mb-4">Are you sure you want to delete this transaction?</p>
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

