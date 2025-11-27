'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { CURRENCIES } from '@/lib/currencies';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useLocale } from '@/hooks/useLocale';
import { t, getCategoryName } from '@/lib/i18n';
import type { Transaction, Account, Category } from '@/types';

export default function EditTransactionPage() {
  const { locale } = useLocale();
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transaction, setTransaction] = useState<Transaction | null>(null);
  const [type, setType] = useState<Transaction['type']>('expense');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [date, setDate] = useState('');
  const [note, setNote] = useState('');

  useEffect(() => {
    const data = storage.getData();
    const trans = data.transactions.find(t => t.id === transactionId);
    if (!trans) {
      router.push('/transactions');
      return;
    }
    setTransaction(trans);
    setAccounts(data.accounts);
    setCategories(data.categories);
    setType(trans.type);
    setAccountId(trans.accountId);
    setToAccountId(trans.toAccountId || '');
    setCategoryId(trans.categoryId);
    setAmount(trans.amount.toString());
    setCurrency(trans.currency);
    setDate(trans.date);
    setNote(trans.note || '');
  }, [transactionId, router]);

  useEffect(() => {
    setCategories(storage.getData().categories.filter(c => 
      type === 'transfer' || c.type === type
    ));
  }, [type]);

  if (!transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountId) return;
    if (type !== 'transfer' && !categoryId) return;
    if (type === 'transfer' && !toAccountId) return;

    storage.updateTransaction(transactionId, {
      type,
      accountId,
      categoryId: type === 'transfer' ? '' : categoryId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      amount: parseFloat(amount) || 0,
      currency,
      date,
      note,
    });
    
    router.push(`/transactions/${transactionId}`);
  };

  const filteredCategories = categories.filter(c => 
    type === 'transfer' || c.type === type
  );

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-2xl overflow-x-hidden">
      <Link href={`/transactions/${transactionId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        {t('transactions.backToTransaction', locale)}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{t('transactions.editTransaction', locale)}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('transactions.type', locale)}</label>
              <Select value={type} onChange={(e) => setType(e.target.value as Transaction['type'])} required>
                <option value="expense">{t('transactions.expense', locale)}</option>
                <option value="income">{t('transactions.income', locale)}</option>
                <option value="transfer">{t('transactions.transfer', locale)}</option>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {type === 'transfer' ? t('transactions.fromAccount', locale) : t('transactions.account', locale)}
              </label>
              <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
                <option value="">{t('transactions.allAccounts', locale).replace('All ', 'Select ')}</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </option>
                ))}
              </Select>
            </div>

            {type === 'transfer' && (
              <div>
                <label className="text-sm font-medium mb-2 block">{t('transactions.toAccount', locale)}</label>
                <Select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} required>
                  <option value="">{t('transactions.allAccounts', locale).replace('All ', 'Select ')}</option>
                  {accounts.filter(a => a.id !== accountId).map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.name} ({account.currency})
                    </option>
                  ))}
                </Select>
              </div>
            )}

            {type !== 'transfer' && (
              <div>
                <label className="text-sm font-medium mb-2 block">{t('transactions.category', locale)}</label>
                <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                  <option value="">{t('transactions.category', locale)}...</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {getCategoryName(category, locale)}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">{t('transactions.amount', locale)}</label>
              <Input
                type="number"
                step="0.01"
                min="0"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0.00"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('transactions.currency', locale)}</label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)} required disabled>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </Select>
              <p className="text-xs text-muted-foreground mt-1">{t('transactions.currencyLocked', locale)}</p>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('transactions.date', locale)}</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('transactions.note', locale)}</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder={t('transactions.notePlaceholder', locale)}
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Link href={`/transactions/${transactionId}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  {t('common.cancel', locale)}
                </Button>
              </Link>
              <Button type="submit" className="flex-1">
                {t('transactions.saveChanges', locale)}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

