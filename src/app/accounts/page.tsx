'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Plus, Wallet, Edit, Trash2 } from 'lucide-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { storage } from '@/lib/storage';
import { exchangeRates } from '@/lib/exchange-rates';
import { formatCurrency } from '@/lib/utils';
import { Card, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Dialog } from '@/components/ui/Dialog';
import type { Account } from '@/types';

const accountTypes = [
  { value: 'cash', label: 'Cash' },
  { value: 'bank', label: 'Bank' },
  { value: 'card', label: 'Card' },
  { value: 'savings', label: 'Savings' },
  { value: 'investment', label: 'Investment' },
  { value: 'other', label: 'Other' },
];

const accountIcons = [
  'Wallet', 'CreditCard', 'PiggyBank', 'TrendingUp', 'Building2', 'Briefcase',
];

const accountColors = [
  '#3B82F6', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6', '#EC4899',
  '#06B6D4', '#84CC16', '#F97316', '#6366F1',
];

export default function AccountsPage() {
  const router = useRouter();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [mainCurrency, setMainCurrency] = useState('USD');
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [accountToDelete, setAccountToDelete] = useState<string | null>(null);

  useEffect(() => {
    const updateData = () => {
      const data = storage.getData();
      setAccounts(data.accounts);
      setMainCurrency(data.settings.mainCurrency);
    };
    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleDelete = (id: string) => {
    setAccountToDelete(id);
    setDeleteDialogOpen(true);
  };

  const confirmDelete = () => {
    if (accountToDelete) {
      storage.deleteAccount(accountToDelete);
      setDeleteDialogOpen(false);
      setAccountToDelete(null);
    }
  };

  const totalByCurrency = accounts.reduce((acc, account) => {
    acc[account.currency] = (acc[account.currency] || 0) + account.balance;
    return acc;
  }, {} as Record<string, number>);

  const totalInMainCurrency = Object.entries(totalByCurrency).reduce((sum, [currency, amount]) => {
    return sum + exchangeRates.convert(amount, currency, mainCurrency);
  }, 0);

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-7xl">
      <div className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Accounts</h1>
        <Link href="/accounts/new">
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Add Account
          </Button>
        </Link>
      </div>

      {accounts.length > 0 && (
        <Card className="mb-6">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-sm text-muted-foreground mb-1">Total Balance</div>
                <div className="text-3xl font-bold">{formatCurrency(totalInMainCurrency, mainCurrency)}</div>
              </div>
              {Object.keys(totalByCurrency).length > 1 && (
                <div className="text-right">
                  {Object.entries(totalByCurrency).map(([currency, amount]) => (
                    <div key={currency} className="text-sm">
                      <span className="text-muted-foreground">{currency}:</span>{' '}
                      <span className="font-semibold">{formatCurrency(amount, currency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {accounts.length === 0 ? (
        <Card>
          <CardContent className="p-12 text-center">
            <Wallet className="h-16 w-16 mx-auto mb-4 text-muted-foreground opacity-50" />
            <h3 className="text-xl font-semibold mb-2">No accounts yet</h3>
            <p className="text-muted-foreground mb-6">Create your first account to get started</p>
            <Link href="/accounts/new">
              <Button>
                <Plus className="mr-2 h-4 w-4" />
                Create Account
              </Button>
            </Link>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3 items-stretch">
          {accounts.map((account, index) => (
            <motion.div
              key={account.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="h-full"
            >
              <Card className="hover:shadow-lg transition-shadow h-full flex flex-col">
                <CardContent className="p-6 flex flex-col flex-1">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-12 w-12 rounded-full flex items-center justify-center"
                        style={{ backgroundColor: account.color + '20' }}
                      >
                        <div
                          className="h-8 w-8 rounded-full"
                          style={{ backgroundColor: account.color }}
                        />
                      </div>
                      <div>
                        <h3 className="font-semibold text-lg">{account.name}</h3>
                        <p className="text-sm text-muted-foreground capitalize">{account.type}</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => router.push(`/accounts/${account.id}/edit`)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(account.id)}
                      >
                        <Trash2 className="h-4 w-4 text-danger" />
                      </Button>
                    </div>
                  </div>
                  <div className="space-y-2 flex-1">
                    <div>
                      <div className="text-sm text-muted-foreground">Balance</div>
                      <div className="text-2xl font-bold">
                        {formatCurrency(account.balance, account.currency)}
                      </div>
                      {account.currency !== mainCurrency && (
                        <div className="text-sm text-muted-foreground">
                          ≈ {formatCurrency(
                            exchangeRates.convert(account.balance, account.currency, mainCurrency),
                            mainCurrency
                          )}
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="mt-4 pt-4 border-t border-border">
                    <Link href={`/accounts/${account.id}`}>
                      <Button variant="outline" className="w-full">
                        View Details
                      </Button>
                    </Link>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          ))}
        </div>
      )}

      <Dialog
        open={deleteDialogOpen}
        onClose={() => {
          setDeleteDialogOpen(false);
          setAccountToDelete(null);
        }}
        title="Delete Account"
      >
        <p className="mb-4">Are you sure you want to delete this account? All related transactions will also be deleted.</p>
        <div className="flex gap-2 justify-end">
          <Button
            variant="outline"
            onClick={() => {
              setDeleteDialogOpen(false);
              setAccountToDelete(null);
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

