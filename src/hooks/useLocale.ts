'use client';

import { useState, useEffect } from 'react';
import { storage } from '@/lib/storage';
import type { Locale } from '@/lib/i18n';

export function useLocale() {
  const [locale, setLocale] = useState<Locale>(() => {
    if (typeof window === 'undefined') return 'en';
    return storage.getData().settings.locale || 'en';
  });

  useEffect(() => {
    const updateLocale = () => {
      const data = storage.getData();
      setLocale(data.settings.locale || 'en');
    };
    updateLocale();
    const interval = setInterval(updateLocale, 1000);
    return () => clearInterval(interval);
  }, []);

  const changeLocale = (newLocale: Locale) => {
    storage.updateSettings({ locale: newLocale });
    setLocale(newLocale);
  };

  return { locale, changeLocale };
}

