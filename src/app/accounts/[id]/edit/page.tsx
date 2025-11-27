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
import { t } from '@/lib/i18n';
import type { Account } from '@/types';

const accountColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export default function EditAccountPage() {
  const { locale } = useLocale();
  const params = useParams();
  const router = useRouter();
  const accountId = params.id as string;
  const [account, setAccount] = useState<Account | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<Account['type']>('cash');
  const [currency, setCurrency] = useState('USD');
  const [color, setColor] = useState(accountColors[0]);

  const accountTypes = [
    { value: 'cash', label: t('accounts.accountTypes.cash', locale) },
    { value: 'bank', label: t('accounts.accountTypes.bank', locale) },
    { value: 'card', label: t('accounts.accountTypes.card', locale) },
    { value: 'savings', label: t('accounts.accountTypes.savings', locale) },
    { value: 'investment', label: t('accounts.accountTypes.investment', locale) },
    { value: 'other', label: t('accounts.accountTypes.other', locale) },
  ];

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
        {t('accounts.backToAccount', locale)}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{t('accounts.editAccount', locale)}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('accounts.accountName', locale)}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('accounts.accountNamePlaceholder', locale)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('accounts.accountType', locale)}</label>
              <Select value={type} onChange={(e) => setType(e.target.value as Account['type'])} required>
                {accountTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </Select>
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
              <label className="text-sm font-medium mb-2 block">{t('accounts.color', locale)}</label>
              <div className="flex gap-2 flex-wrap">
                {accountColors.map((c) => (
                  <button
                    key={c}
                    type="button"
                    onClick={() => setColor(c)}
                    className={`h-10 w-10 rounded-full border-2 transition-all ${
                      color === c ? 'border-foreground scale-110 ring-2 ring-offset-2 ring-offset-background' : 'border-border'
                    }`}
                    style={{ 
                      backgroundColor: c,
                      ...(color === c ? { 
                        boxShadow: `0 0 0 2px ${c}40, 0 0 0 4px var(--background), 0 0 0 6px ${c}60` 
                      } : {})
                    }}
                  />
                ))}
              </div>
            </div>

            <div className="flex gap-2 pt-4">
              <Link href={`/accounts/${accountId}`} className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  {t('common.cancel', locale)}
                </Button>
              </Link>
              <Button type="submit" className="flex-1">
                {t('accounts.saveChanges', locale)}
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

