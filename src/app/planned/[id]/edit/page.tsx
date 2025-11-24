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
import type { PlannedTransaction, Account, Category, TransactionType } from '@/types';

export default function EditPlannedTransactionPage() {
  const params = useParams();
  const router = useRouter();
  const transactionId = params.id as string;
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transaction, setTransaction] = useState<PlannedTransaction | null>(null);
  const [type, setType] = useState<TransactionType>('expense');
  const [accountId, setAccountId] = useState('');
  const [toAccountId, setToAccountId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('USD');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [frequency, setFrequency] = useState<PlannedTransaction['frequency']>('monthly');
  const [note, setNote] = useState('');

  useEffect(() => {
    const data = storage.getData();
    const trans = data.plannedTransactions.find(t => t.id === transactionId);
    if (!trans) {
      router.push('/planned');
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
    setStartDate(trans.startDate);
    setEndDate(trans.endDate || '');
    setFrequency(trans.frequency);
    setNote(trans.note || '');
  }, [transactionId, router]);

  useEffect(() => {
    setCategories(storage.getData().categories.filter(c => 
      type === 'transfer' || c.type === type || c.type === 'expense'
    ));
  }, [type]);

  if (!transaction) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!accountId) return;
    if (type !== 'transfer' && !categoryId) return;
    if (type === 'transfer' && !toAccountId) return;

    storage.updatePlannedTransaction(transactionId, {
      type,
      accountId,
      categoryId: type === 'transfer' ? '' : categoryId,
      toAccountId: type === 'transfer' ? toAccountId : undefined,
      amount: parseFloat(amount) || 0,
      currency,
      startDate,
      endDate: endDate || undefined,
      frequency,
      note,
    });
    
    router.push('/planned');
  };

  const filteredCategories = categories.filter(c => 
    type === 'transfer' || c.type === type || c.type === 'expense'
  );

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-2xl">
      <Link href="/planned" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Planned Transactions
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Planned Transaction</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={type} onChange={(e) => setType(e.target.value as TransactionType)} required>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
                <option value="transfer">Transfer</option>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">
                {type === 'transfer' ? 'From Account' : 'Account'}
              </label>
              <Select value={accountId} onChange={(e) => setAccountId(e.target.value)} required>
                <option value="">Select account</option>
                {accounts.map((account) => (
                  <option key={account.id} value={account.id}>
                    {account.name} ({account.currency})
                  </option>
                ))}
              </Select>
            </div>

            {type === 'transfer' && (
              <div>
                <label className="text-sm font-medium mb-2 block">To Account</label>
                <Select value={toAccountId} onChange={(e) => setToAccountId(e.target.value)} required>
                  <option value="">Select account</option>
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
                <label className="text-sm font-medium mb-2 block">Category</label>
                <Select value={categoryId} onChange={(e) => setCategoryId(e.target.value)} required>
                  <option value="">Select category</option>
                  {filteredCategories.map((category) => (
                    <option key={category.id} value={category.id}>
                      {category.name}
                    </option>
                  ))}
                </Select>
              </div>
            )}

            <div>
              <label className="text-sm font-medium mb-2 block">Amount</label>
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
              <label className="text-sm font-medium mb-2 block">Currency</label>
              <Select value={currency} onChange={(e) => setCurrency(e.target.value)} required>
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Start Date</label>
              <Input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">End Date (optional)</label>
              <Input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Frequency</label>
              <Select value={frequency} onChange={(e) => setFrequency(e.target.value as PlannedTransaction['frequency'])} required>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
                <option value="monthly">Monthly</option>
                <option value="yearly">Yearly</option>
                <option value="once">Once</option>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Note (optional)</label>
              <Input
                value={note}
                onChange={(e) => setNote(e.target.value)}
                placeholder="Add a note..."
              />
            </div>

            <div className="flex gap-2 pt-4">
              <Link href="/planned" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1">
                Save Changes
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

