'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Wallet, TrendingUp, Calendar, Settings, Tag } from 'lucide-react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

const tabs = [
  { href: '/', icon: Home, label: 'Home' },
  { href: '/accounts', icon: Wallet, label: 'Accounts' },
  { href: '/transactions', icon: TrendingUp, label: 'Transactions' },
  { href: '/categories', icon: Tag, label: 'Categories' },
  { href: '/settings', icon: Settings, label: 'Settings' },
];

export function TabBar() {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-card/95 backdrop-blur-sm lg:hidden">
      <div className="flex h-16 items-center justify-around">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = pathname === tab.href;
          
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
      </div>
    </nav>
  );
}

