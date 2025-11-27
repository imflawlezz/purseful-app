'use client';

import { TabBar } from './Navigation/TabBar';
import { Sidebar } from './Navigation/Sidebar';

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      <main className="flex-1 lg:ml-64 pb-16 lg:pb-0 min-h-screen">
        {children}
      </main>
      <TabBar />
    </div>
  );
}

