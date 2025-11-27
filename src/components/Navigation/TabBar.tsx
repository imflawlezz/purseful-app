'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, TrendingUp, Settings, Target, MoreHorizontal } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';
import { useState } from 'react';
import { Dialog } from '@/components/ui/Dialog';
import { Calendar, Tag } from 'lucide-react';
import { useLocale } from '@/hooks/useLocale';
import { t } from '@/lib/i18n';

import { BarChart3 } from 'lucide-react';

export function TabBar() {
  const { locale } = useLocale();
  const pathname = usePathname();
  const [othersOpen, setOthersOpen] = useState(false);

  const mainTabs = [
    { href: '/', icon: Home, label: t('nav.home', locale) },
    { href: '/analytics', icon: BarChart3, label: t('nav.analytics', locale) },
    { href: '/transactions', icon: TrendingUp, label: t('nav.transactions', locale) },
    { href: '/budgets', icon: Target, label: t('nav.budgets', locale) },
  ];

  const otherTabs = [
    { href: '/accounts', icon: Wallet, label: t('nav.accounts', locale) },
    { href: '/planned', icon: Calendar, label: t('nav.planned', locale) },
    { href: '/categories', icon: Tag, label: t('nav.categories', locale) },
    { href: '/settings', icon: Settings, label: t('nav.settings', locale) },
  ];

  const isOthersActive = otherTabs.some(tab => pathname === tab.href || pathname.startsWith(tab.href + '/'));

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm lg:hidden px-4 pb-safe safe-area-inset-bottom">
        <div className="flex h-16 items-center justify-around gap-2">
          {mainTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={cn(
                  'relative flex flex-col items-center justify-center gap-1 flex-1 h-full',
                  isActive ? 'text-primary' : 'text-muted-foreground'
                )}
              >
                {isActive && (
                  <motion.div
                    layoutId="activeTab"
                    className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-b-full"
                    initial={false}
                    transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                  />
                )}
                <Icon className="h-5 w-5" />
                <span className="text-xs font-medium">{tab.label}</span>
              </Link>
            );
          })}
          
          <button
            onClick={() => setOthersOpen(true)}
            className={cn(
              'relative flex flex-col items-center justify-center gap-1 flex-1 h-full',
              isOthersActive ? 'text-primary' : 'text-muted-foreground'
            )}
          >
            {isOthersActive && (
              <motion.div
                layoutId="activeTabOthers"
                className="absolute top-0 left-0 right-0 h-1 bg-primary rounded-b-full"
                initial={false}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            )}
            <MoreHorizontal className="h-5 w-5" />
            <span className="text-xs font-medium">{t('nav.more', locale)}</span>
          </button>
        </div>
      </nav>

      <Dialog
        open={othersOpen}
        onClose={() => setOthersOpen(false)}
        title={t('nav.more', locale)}
        className="max-w-sm"
      >
        <div className="space-y-2">
          {otherTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = pathname === tab.href || pathname.startsWith(tab.href + '/');
            
            return (
              <Link
                key={tab.href}
                href={tab.href}
                onClick={() => setOthersOpen(false)}
                className={cn(
                  'flex items-center gap-3 rounded-lg px-4 py-3 text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-primary text-primary-foreground'
                    : 'hover:bg-accent hover:text-accent-foreground'
                )}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </Link>
            );
          })}
        </div>
      </Dialog>
    </>
  );
}
