'use client';

import { useEffect } from 'react';
import { theme } from '@/lib/theme';
import { initializeDefaults } from '@/lib/defaults';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  useEffect(() => {
    theme.init();
    initializeDefaults();
  }, []);

  return <>{children}</>;
}

