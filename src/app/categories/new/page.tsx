'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { generateId } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import type { Category, TransactionType } from '@/types';

const categoryColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#F43F5E',
];

export default function NewCategoryPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [type, setType] = useState<TransactionType>('expense');
  const [color, setColor] = useState(categoryColors[0]);
  const [icon, setIcon] = useState('ShoppingBag');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    const newCategory: Category = {
      id: generateId(),
      name,
      type,
      color,
      icon,
      createdAt: new Date().toISOString(),
    };

    storage.addCategory(newCategory);
    router.push('/categories');
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-2xl">
      <Link href="/categories" className="inline-flex items-center gap-2 text-muted-foreground hover:text-foreground mb-6">
        <ArrowLeft className="h-4 w-4" />
        Back to Categories
      </Link>

      <Card>
        <CardHeader>
          <CardTitle>Create New Category</CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Category Name</label>
              <Input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Groceries, Salary"
                required
              />
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Type</label>
              <Select value={type} onChange={(e) => setType(e.target.value as TransactionType)} required>
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </Select>
            </div>

            <div>
              <label className="text-sm font-medium mb-2 block">Color</label>
              <div className="flex gap-2 flex-wrap">
                {categoryColors.map((c) => (
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
              <Link href="/categories" className="flex-1">
                <Button type="button" variant="outline" className="w-full">
                  Cancel
                </Button>
              </Link>
              <Button type="submit" className="flex-1">
                Create Category
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

