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
import type { Account } from '@/types';

const accountTypes = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'card', label: 'Card' },
  { value: 'savings', label: 'Savings' },
  { value: 'investment', label: 'Investment' },
  { value: 'other', label: 'Other' },
];

const accountColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export default function EditAccountPage() {
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;
  const [account, setAccount] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('cash');
  const [currency, setCurrency] = useState('USD');
  const [color, setColor] = useState(accountColors[0]);

  useEffect(() => {
    const data = storage.getData();
    const acc = data.accounts.find(a => a.id === accountId);
    if (!acc) {
      router.push('/accounts');
      return;
    }
    setAccount(acc);
    setName(acc.name);
    setType(acc.type);
    setCurrency(acc.currency);
    setColor(acc.color);
  }, [accountId, router]);

  if (!account) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateAccount(accountId, {
      name,
      type,
      currency,
      color,
    });
    router.push(`/accounts/${accountId}`);
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-2xl">
      <Link href={`/accounts/${accountId}`} className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Account
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Edit Account</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Account Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Main Wallet, Savings Account"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Account Type</label>
              <Select value={type} onChange={(e) => setType(e.target.value as Account['type'])} required>
                {accountTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
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
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {accountColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-10 w-10 rounded-full border-2 transition-all ${
                      color === c ? 'border-foreground scale-110' : 'border-border'
                    }`}
                    style={{ backgroundColor: c }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Link href={`/accounts/${accountId}`} className="flex-1">
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

