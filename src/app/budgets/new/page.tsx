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
import type { Budget, Category } from '@/types';

export default function NewBudgetPage() {
  const { locale } = useLocale();
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [period, setPeriod] = useState<Budget['period']>('monthly');
  const [startDate, setStartDate] = useState(new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState('');

  useEffect(() => {
    const data = storage.getData();
    setCategories(data.categories.filter(c => c.type === 'expense'));
    setCurrency(data.settings.mainCurrency);
  }, []);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!categoryId) return;

    const newBudget: Budget = {
      id: generateId(),
      categoryId,
      amount: parseFloat(amount) || 0,
      currency,
      period,
      startDate,
      endDate: endDate || undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.addBudget(newBudget);
    router.push('/budgets');
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-2xl">
      <Link href="/budgets" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        {t('budgets.backToBudgets', locale)}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{t('budgets.createNewBudget', locale)}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('budgets.category', locale)}</label>
              <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                <option value="">{t('transactions.selectCategory', locale)}</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {getCategoryName(category, locale)}
                  </option>
                ))}
              </Select>
            </div>

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
              <label className="text-sm font-medium mb-2 block">{t('budgets.period', locale)}</label>
              <Select value={period} onChange={(e) => setPeriod(e.target.value as Budget['period'])} required>
                <option value="weekly">{t('budgets.periods.weekly', locale)}</option>
                <option value="monthly">{t('budgets.periods.monthly', locale)}</option>
                <option value="yearly">{t('budgets.periods.yearly', locale)}</option>
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

            <div className="flex gap-2 pt-4">
              <Link href="/budgets" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  {t('common.cancel', locale)}
                </Button>
              </Link>
              <Button type="submit" className="flex-1">
                {t('budgets.createBudget', locale)}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

