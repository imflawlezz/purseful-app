'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { useLocale } from '@/hooks/useLocale';
import { t } from '@/lib/i18n';
import type { Category, TransactionType } from '@/types';

const categoryColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#F43F5E',
];

export default function EditCategoryPage() {
  const { locale } = useLocale();
  const params = useParams();
  const router = useRouter();
  const categoryId = params.id as string;
  const [category, setCategory] = useState<Category | null>(null);
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState(categoryColors[0]);
  const [icon, setIcon] = useState('ShoppingBag');

  useEffect(() => {
    const data = storage.getData();
    const cat = data.categories.find(c => c.id === categoryId);
    if (!cat) {
      router.push('/categories');
      return;
    }
    setCategory(cat);
    setName(cat.name);
    setType(cat.type);
    setColor(cat.color);
    setIcon(cat.icon);
  }, [categoryId, router]);

  if (!category) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    storage.updateCategory(categoryId, {
      name,
      type,
      color,
      icon,
    });
    router.push('/categories');
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-2xl">
      <Link href="/categories" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        {t('categories.backToCategories', locale)}
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>{t('categories.editCategory', locale)}</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('categories.categoryName', locale)}</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder={t('categories.categoryNamePlaceholder', locale)}
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('categories.type', locale)}</label>
              <Select value={type} onChange={(e) => setType(e.target.value as TransactionType)} required>
                <option value="expense">{t('transactions.expense', locale)}</option>
                <option value="income">{t('transactions.income', locale)}</option>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">{t('accounts.color', locale)}</label>
              <div className="flex gap-2 flex-wrap">
                {categoryColors.map((c) => (
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
              <Link href="/categories" className="flex-1">
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

