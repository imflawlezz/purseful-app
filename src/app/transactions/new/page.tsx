'use client';

import { Suspense, useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ArrowLeft, Save, BookOpen } from 'lucide-react';
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
import type { Transaction, Account, Category, PlannedTransaction, TransactionTemplate } from '@/types';

export default function NewTransactionPage() {
  return (
    <Suspense fallback={<div className="p-4">{t('settings.loading', 'en')}</div>}>
      <NewTransactionContent />
    </Suspense>
  );
}

function NewTransactionContent() {
  const { locale } = useLocale();
  const router = useRouter();
  const searchParams = useSearchParams();
  const defaultAccountId = searchParams.get('accountId');
  
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [templates, setTemplates] = useState<TransactionTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState('');
  const [templateName, setTemplateName] = useState('');
  const [showSaveTemplate, setShowSaveTemplate] = useState(false);
  const [type, setType] = useState<Transaction['type']>('expense');
  const [accountId, setAccountId] = useState(defaultAccountId || '');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const [note, setNote] = useState('');

  useEffect(() => {
    const data = storage.getData();
    setAccounts(data.accounts);
    setTemplates(data.transactionTemplates);
    // Only show categories that match the transaction type
    setCategories(data.categories.filter(c => c.type === type));
    
    if (defaultAccountId && data.accounts.find(a => a.id === defaultAccountId)) {
      const account = data.accounts.find(a => a.id === defaultAccountId);
      if (account) {
        setCurrency(account.currency);
      }
    }
  }, [type, defaultAccountId]);

  useEffect(() => {
    if (accountId) {
      const account = accounts.find(a => a.id === accountId);
      if (account) {
        setCurrency(account.currency);
      }
    }
  }, [accountId, accounts]);

  useEffect(() => {
    if (selectedTemplate) {
      const template = templates.find(t => t.id === selectedTemplate);
      if (template) {
        setType(template.type);
        setAccountId(template.accountId);
        setCategoryId(template.categoryId);
        setAmount(template.amount.toString());
        setCurrency(template.currency);
        setNote(template.note || '');
        if (template.toAccountId) {
          setToAccountId(template.toAccountId);
        }
        setSelectedTemplate(''); // Reset selection
      }
    }
  }, [selectedTemplate, templates]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountId) return;
    if (type !== 'transfer' && !categoryId) return;
    if (type === 'transfer' && !toAccountId) return;

    const transactionDate = new Date(date);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    transactionDate.setHours(0, 0, 0, 0);

    // If date is in the future, create a planned transaction instead
    if (transactionDate > today) {
      const newPlannedTransaction: PlannedTransaction = {
        id: generateId(),
        accountId,
        categoryId: type === 'transfer' ? '' : categoryId,
        type,
        amount: parseFloat(amount) || 0,
        currency,
        startDate: date,
        endDate: date, // Same date for "once" frequency
        frequency: 'once',
        note,
        toAccountId: type === 'transfer' ? toAccountId : undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      storage.addPlannedTransaction(newPlannedTransaction);
      router.push('/planned');
      return;
    }

    const newTransaction: Transaction = {
      id: generateId(),
      accountId,
      categoryId: type === 'transfer' ? '' : categoryId,
      type,
      amount: parseFloat(amount) || 0,
      currency,
      date,
      note,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    storage.addTransaction(newTransaction);
    router.push('/transactions');
  };

  const filteredCategories = categories.filter(c => 
    type === 'transfer' || c.type === type
  );

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-2xl overflow-x-hidden">
      <Link href="/transactions" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        {t('common.back', locale)} {t('transactions.title', locale)}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{t('transactions.addTransaction', locale)}</CardTitle>
        </CardHeader>
        <CardContent>
          {templates.length > 0 && (
            <div className="mb-4 pb-4 border-b border-border">
              <label className="text-sm font-medium mb-2 block">{t('transactions.loadTemplate', locale)}</label>
              <Select 
                value={selectedTemplate} 
                onChange={(e) => setSelectedTemplate(e.target.value)}
              >
                <option value="">{t('transactions.selectTemplate', locale)}</option>
                {templates.map((template) => (
                  <option key={template.id} value={template.id}>
                    {template.name}
                  </option>
                ))}
              </Select>
            </div>
          )}
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

            <div className="grid md:flex gap-2 pt-4">
              <Link href="/transactions" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  {t('common.cancel', locale)}
                </Button>
              </Link>
              <Button 
                type="button" 
                variant="outline" 
                onClick={() => setShowSaveTemplate(true)}
                disabled={!accountId || (!categoryId && type !== 'transfer') || !amount}
              >
                <Save className="mr-2 h-4 w-4" />
                {t('transactions.saveTemplate', locale)}
              </Button>
              <Button type="submit" className="flex-1">
                {t('transactions.addTransaction', locale)}
              </Button>
            </div>
          </form>
          
          {showSaveTemplate && (
            <div className="mt-4 p-4 border border-border rounded-lg bg-accent/50">
              <label className="text-sm font-medium mb-2 block">{t('transactions.templateName', locale)}</label>
              <div className="grid md:flex gap-2">
                <Input
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder={t('settings.templateNamePlaceholder', locale)}
                  className="flex-1"
                />
                <Button
                  type="button"
                  onClick={() => {
                    if (templateName && accountId && (categoryId || type === 'transfer')) {
                      const newTemplate: TransactionTemplate = {
                        id: generateId(),
                        name: templateName,
                        accountId,
                        categoryId: type === 'transfer' ? '' : categoryId,
                        type,
                        amount: parseFloat(amount) || 0,
                        currency,
                        note,
                        toAccountId: type === 'transfer' ? toAccountId : undefined,
                        createdAt: new Date().toISOString(),
                        updatedAt: new Date().toISOString(),
                      };
                      storage.addTransactionTemplate(newTemplate);
                      setTemplates([...templates, newTemplate]);
                      setTemplateName('');
                      setShowSaveTemplate(false);
                    }
                  }}
                  disabled={!templateName}
                >
                  {t('common.save', locale)}
                </Button>
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    setShowSaveTemplate(false);
                    setTemplateName('');
                  }}
                >
                  {t('common.cancel', locale)}
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}

