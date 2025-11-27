'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Calendar, Edit, Trash2, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import { useLocale } from '@/hooks/useLocale';
import { t, getCategoryName } from '@/lib/i18n';
import type { PlannedTransaction, Account, Category } from '@/types';

export default function PlannedTransactionsPage() {
  const { locale } = useLocale();
  const [plannedTransactions, setPlannedTransactions] = useState<PlannedTransaction[]>([]);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [transactionToDelete, setTransactionToDelete] = useState<string | null>(null);

  useEffect(() => {
    const updateData = () => {
      const data = storage.getData();
      setPlannedTransactions(data.plannedTransactions);
      setAccounts(data.accounts);
      setCategories(data.categories);
    };
    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = (id: string) => {
    setTransactionToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (transactionToDelete) {
      storage.deletePlannedTransaction(transactionToDelete);
      setDeleteDialogOpen(false);
      setTransactionToDelete(null);
    }
  };

  const getAccount = (id: string) => accounts.find(a => a.id === id);
  const getCategory = (id: string) => categories.find(c => c.id === id);

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-7xl overflow-x-hidden">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">{t('planned.title', locale)}</h1>
        <Link href="/planned/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            {t('planned.addPlanned', locale)}
          </Button>
        </Link>
      </div>

      {plannedTransactions.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Calendar className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">{t('planned.noPlanned', locale)}</h3>
            <p className="text-muted-foreground mb-6">{t('planned.createFirst', locale)}</p>
            <Link href="/planned/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                {t('planned.addPlanned', locale)}
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {plannedTransactions.map((transaction, index) => {
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
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div
                          className={`h-12 w-12 rounded-full flex items-center justify-center ${
                            isIncome ? 'bg-income/20' : isTransfer ? 'bg-transfer/20' : 'bg-expense/20'
                          }`}
                        >
                          {isIncome ? (
                            <TrendingUp className="h-6 w-6 text-income" />
                          ) : isTransfer ? (
                            <ArrowLeftRight className="h-6 w-6 text-transfer" />
                          ) : (
                            <TrendingDown className="h-6 w-6 text-expense" />
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-lg mb-1 break-words">
                            {category ? getCategoryName(category, locale) : 'Planned Transaction'}
                            {transaction.note && (
                              <span className="text-muted-foreground text-sm ml-2 break-words">
                                {transaction.note}
                              </span>
                            )}
                          </div>
                          <div className="text-sm text-muted-foreground space-y-1">
                            <div>{account?.name}</div>
                            <div>
                              {formatDate(transaction.startDate)}
                              {transaction.endDate && ` - ${formatDate(transaction.endDate)}`}
                            </div>
                            <div className="capitalize">{transaction.frequency}</div>
                          </div>
                        </div>
                        <div className={`text-right ${
                          isIncome ? 'text-income' : isTransfer ? 'text-transfer' : 'text-expense'
                        }`}>
                          <div className="text-2xl font-bold">
                            {isIncome ? '+' : '-'}
                            {formatCurrency(transaction.amount, transaction.currency)}
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 ml-4">
                        <Link href={`/planned/${transaction.id}/edit`}>
                          <Button variant="outline" size="sm">
                            <Edit className="h-4 w-4" />
                          </Button>
                        </Link>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleDelete(transaction.id)}
                        >
                          <Trash2 className="h-4 w-4 text-danger" />
                        </Button>
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
          setTransactionToDelete(null);
        }}
        title={t('planned.deletePlanned', locale)}
      >
        <p className="mb-4">{t('planned.deleteConfirm', locale)}</p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setDeleteDialogOpen(false);
              setTransactionToDelete(null);
            }}
          >
            {t('common.cancel', locale)}
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            {t('common.delete', locale)}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

