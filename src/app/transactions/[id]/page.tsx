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
import { useLocale } from '@/hooks/useLocale';
import { t, getCategoryName } from '@/lib/i18n';
import type { Transaction, Account, Category } from '@/types';

export default function TransactionDetailPage() {
  const { locale } = useLocale();
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
        {t('transactions.backToTransactions', locale)}
      </Link>

      <Card>
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-6">
            <div>
              <h1 className="text-3xl font-bold mb-2">
                {transaction.note || (category ? getCategoryName(category, locale) : null) || t('common.transaction', locale)}
              </h1>
              <div className={`inline-block px-3 py-1 rounded-full text-sm font-medium ${
                isIncome ? 'bg-income/20 text-income' : 
                isTransfer ? 'bg-transfer/20 text-transfer' : 
                'bg-expense/20 text-expense'
              }`}>
                {t(`transactions.${transaction.type}`, locale)}
              </div>
            </div>
            <div className="grid md:flex gap-2">
              <Link href={`/transactions/${transactionId}/edit`}>
                <Button variant="outline">
                  <Edit className="mr-2 h-4 w-4" />
                  {t('common.edit', locale)}
                </Button>
              </Link>
              <Button variant="danger" onClick={() => setDeleteDialogOpen(true)}>
                <Trash2 className="mr-2 h-4 w-4" />
                {t('common.delete', locale)}
              </Button>
            </div>
          </div>

          <div className="space-y-4">
            <div>
              <div className="text-sm text-muted-foreground mb-1">{t('transactions.amount', locale)}</div>
              <div className={`text-3xl font-bold ${
                isIncome ? 'text-income' : isTransfer ? 'text-transfer' : 'text-expense'
              }`}>
                {isIncome ? '+' : '-'}
                {formatCurrency(transaction.amount, transaction.currency)}
              </div>
            </div>

            <div>
              <div className="text-sm text-muted-foreground mb-1">{t('transactions.date', locale)}</div>
              <div className="text-lg font-medium">{formatDate(transaction.date)}</div>
            </div>

            {account && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">
                  {isTransfer ? t('transactions.fromAccount', locale) : t('transactions.account', locale)}
                </div>
                <div className="text-lg font-medium">{account.name}</div>
              </div>
            )}

            {isTransfer && toAccount && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">{t('transactions.toAccount', locale)}</div>
                <div className="text-lg font-medium">{toAccount.name}</div>
              </div>
            )}

            {category && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">{t('transactions.category', locale)}</div>
                <div className="text-lg font-medium">{getCategoryName(category, locale)}</div>
              </div>
            )}

            {transaction.note && (
              <div>
                <div className="text-sm text-muted-foreground mb-1">{t('transactions.note', locale)}</div>
                <div className="text-lg">{transaction.note}</div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => setDeleteDialogOpen(false)}
        title={t('transactions.deleteTransaction', locale)}
      >
        <p className="mb-4">{t('transactions.deleteTransactionConfirm', locale)}</p>
        <div className="flex gap-2 justify-end">
          <Button variant="outline" onClick={() => setDeleteDialogOpen(false)}>
            {t('common.cancel', locale)}
          </Button>
          <Button variant="danger" onClick={handleDelete}>
            {t('common.delete', locale)}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

