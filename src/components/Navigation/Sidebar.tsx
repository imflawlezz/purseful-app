'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, TrendingUp, Calendar, Settings, Tag, Target, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { storage } from '@/lib/storage';
import { formatCurrency } from '@/lib/utils';
import { exchangeRates } from '@/lib/exchange-rates';
import { useEffect, useState } from 'react';
import { useLocale } from '@/hooks/useLocale';
import { t } from '@/lib/i18n';

export function Sidebar() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const [accounts, setAccounts] = useState(storage.getData().accounts);
  const [mainCurrency, setMainCurrency] = useState(storage.getData().settings.mainCurrency);

  const navItems = [
    { href: '/', icon: Home, label: t('nav.home', locale) },
    { href: '/transactions', icon: TrendingUp, label: t('nav.transactions', locale) },
    { href: '/budgets', icon: Target, label: t('nav.budgets', locale) },
    { href: '/analytics', icon: BarChart3, label: t('nav.analytics', locale) },
    { href: '/accounts', icon: Wallet, label: t('nav.accounts', locale) },
    { href: '/planned', icon: Calendar, label: t('nav.planned', locale) },
    { href: '/categories', icon: Tag, label: t('nav.categories', locale) },
    { href: '/settings', icon: Settings, label: t('nav.settings', locale) },
  ];

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

  const totalByCurrency = accounts.reduce((acc, account) => {
    acc[account.currency] = (acc[account.currency] || 0) + account.balance;
    return acc;
  }, {} as Record<string, number>);

  const totalInMainCurrency = Object.entries(totalByCurrency).reduce((sum, [currency, amount]) => {
    return sum + exchangeRates.convert(amount, currency, mainCurrency);
  }, 0);

  return (
    <aside className="hidden lg:flex lg:w-64 lg:flex-col lg:border-r lg:border-border lg:bg-card lg:fixed lg:left-0 lg:top-0 lg:h-screen lg:z-40">
      <div className="flex flex-col h-full overflow-y-auto">
        <div className="p-6 border-b border-border flex-shrink-0">
          <h1 className="text-2xl font-bold">{t('analytics.appName', locale)}</h1>
        </div>
        
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = pathname === item.href;
            
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'text-muted-foreground hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border space-y-4 flex-shrink-0">
          <div>
            <h3 className="text-sm font-semibold mb-2 px-3">{t('nav.accounts', locale)}</h3>
            <div className="space-y-1 max-h-64 overflow-y-auto min-h-0">
              {accounts.map((account) => (
                <Link
                  key={account.id}
                  href={`/accounts/${account.id}`}
                  className={cn(
                    'flex items-center justify-between rounded-lg px-3 py-2 text-sm transition-colors',
                    pathname === `/accounts/${account.id}`
                      ? 'bg-primary text-primary-foreground'
                      : 'hover:bg-accent'
                  )}
                >
                  <div className="flex items-center gap-2">
                    <div
                      className="h-3 w-3 rounded-full"
                      style={{ backgroundColor: account.color }}
                    />
                    <span className="font-medium">{account.name}</span>
                  </div>
                  <span className="font-semibold">
                    {formatCurrency(account.balance, account.currency)}
                  </span>
                </Link>
              ))}
            </div>
          </div>
          
          <div className="pt-4 border-t border-border">
            <div className="px-3 space-y-1">
              <div className="flex items-center justify-between text-sm">
                <span className="text-muted-foreground">{t('dashboard.totalBalance', locale)}</span>
                <span className="font-bold text-lg">
                  {formatCurrency(totalInMainCurrency, mainCurrency)}
                </span>
              </div>
              {Object.keys(totalByCurrency).length > 1 && (
                <div className="pt-2 space-y-1">
                  {Object.entries(totalByCurrency).map(([currency, amount]) => (
                    <div key={currency} className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{currency}</span>
                      <span>{formatCurrency(amount, currency)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
}

