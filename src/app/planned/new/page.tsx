'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { CURRENCIES } from '@/lib/currencies';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useLocale } from '@/hooks/useLocale';
import { t, getCategoryName } from '@/lib/i18n';
import type { PlannedTransaction, Account, Category, TransactionType } from '@/types';

export default function NewPlannedTransactionPage() {
  const { locale } = useLocale();
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [type, setType] = useState<TransactionType>('expense');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');
  const [frequency, setFrequency] = useState<PlannedTransaction['frequency']>('monthly');
  const [note, setNote] = useState('');

  useEffect(() => {
    const data = storage.getData();
    setAccounts(data.accounts);
    setCategories(data.categories.filter(c => c.type === type));
  }, [type]);

  useEffect(() => {
    if (accountId) {
      const account = accounts.find(a => a.id === accountId);
      if (account) {
        setCurrency(account.currency);
      }
    }
  }, [accountId, accounts]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountId) return;
    if (type !== 'transfer' && !categoryId) return;
    if (type === 'transfer' && !toAccountId) return;

    const newPlannedTransaction: PlannedTransaction = {
      id: generateId(),
      accountId,
      categoryId: type === 'transfer' ? '' : categoryId,
      type,
      amount: parseFloat(amount) || 0,
      currency,
      startDate,
      endDate: endDate || undefined,
      frequency,
      note,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.addPlannedTransaction(newPlannedTransaction);
    router.push('/planned');
  };

  const filteredCategories = categories.filter(c => 
    type === 'transfer' || c.type === type
  );

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-2xl">
      <Link href="/planned" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        {t('planned.backToPlanned', locale)}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{t('planned.addPlannedTransaction', locale)}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('transactions.type', locale)}</label>
              <Select value={type} onChange={(e) => setType(e.target.value as TransactionType)} required>
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
                <option value="">{t('transactions.selectAccount', locale)}</option>
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
                  <option value="">{t('transactions.selectAccount', locale)}</option>
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
                  <option value="">{t('transactions.selectCategory', locale)}</option>
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
                placeholder={t('transactions.amountPlaceholder', locale)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('accounts.currency', locale)}</label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)} required>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('budgets.startDate', locale)}</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('budgets.endDate', locale)}</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('planned.frequency', locale)}</label>
              <Select value={frequency} onChange={(e) => setFrequency(e.target.value as PlannedTransaction['frequency'])} required>
                <option value="daily">{t('planned.frequencies.daily', locale)}</option>
                <option value="weekly">{t('planned.frequencies.weekly', locale)}</option>
                <option value="monthly">{t('planned.frequencies.monthly', locale)}</option>
                <option value="yearly">{t('planned.frequencies.yearly', locale)}</option>
                <option value="once">{t('planned.frequencies.once', locale)}</option>
              </Select>
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
              <Link href="/planned" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  {t('common.cancel', locale)}
                </Button>
              </Link>
              <Button type="submit" className="flex-1">
                {t('planned.addPlannedTransaction', locale)}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

