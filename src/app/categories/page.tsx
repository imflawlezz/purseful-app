'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Trash2, Edit } from 'lucide-react';
import Link from 'next/link';
import { storage } from '@/lib/storage';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Dialog } from '@/components/ui/Dialog';
import type { Category } from '@/types';

const categoryIcons = [
  'ShoppingBag', 'UtensilsCrossed', 'Car', 'Home', 'Plane', 'Heart',
  'Gamepad2', 'GraduationCap', 'Briefcase', 'Dumbbell', 'Music', 'Film',
];

const categoryColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#6366F1', '#14B8A6', '#F43F5E',
];

export default function CategoriesPage() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [categoryToDelete, setCategoryToDelete] = useState<string | null>(null);

  useEffect(() => {
    const updateData = () => {
      const data = storage.getData();
      setCategories(data.categories);
    };
    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = (id: string) => {
    setCategoryToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (categoryToDelete) {
      storage.deleteCategory(categoryToDelete);
      setDeleteDialogOpen(false);
      setCategoryToDelete(null);
    }
  };

  const incomeCategories = categories.filter(c => c.type === 'income');
  const expenseCategories = categories.filter(c => c.type === 'expense');

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Categories</h1>
        <Link href="/categories/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Category
          </Button>
        </Link>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="text-xl font-semibold mb-4">Income Categories</h2>
          {incomeCategories.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No income categories yet
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {incomeCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: category.color + '20' }}
                          >
                            <div
                              className="h-6 w-6 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                          </div>
                          <div className="font-medium">{category.name}</div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/categories/${category.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Expense Categories</h2>
          {expenseCategories.length === 0 ? (
            <Card>
              <CardContent className="p-8 text-center text-muted-foreground">
                No expense categories yet
              </CardContent>
            </Card>
          ) : (
            <div className="space-y-2">
              {expenseCategories.map((category, index) => (
                <motion.div
                  key={category.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                >
                  <Card>
                    <CardContent className="p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="h-10 w-10 rounded-full flex items-center justify-center"
                            style={{ backgroundColor: category.color + '20' }}
                          >
                            <div
                              className="h-6 w-6 rounded-full"
                              style={{ backgroundColor: category.color }}
                            />
                          </div>
                          <div className="font-medium">{category.name}</div>
                        </div>
                        <div className="flex gap-2">
                          <Link href={`/categories/${category.id}/edit`}>
                            <Button variant="ghost" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDelete(category.id)}
                          >
                            <Trash2 className="h-4 w-4 text-danger" />
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          )}
        </div>
      </div>

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setCategoryToDelete(null);
        }}
        title="Delete Category"
      >
        <p className="mb-4">Are you sure you want to delete this category?</p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setDeleteDialogOpen(false);
              setCategoryToDelete(null);
            }}
          >
            Cancel
          </Button>
          <Button variant="danger" onClick={confirmDelete}>
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}

