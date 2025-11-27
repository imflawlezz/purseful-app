import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function formatCurrency(amount: number, currency: string): string {
  const formatter = new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
  return formatter.format(amount);
}

export function formatDate(date: string | Date, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'pl': 'pl-PL',
    'ru': 'ru-RU',
  };
  return new Intl.DateTimeFormat(localeMap[locale] || 'en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function formatDateShort(date: string | Date, locale: string = 'en'): string {
  const d = typeof date === 'string' ? new Date(date) : date;
  const localeMap: Record<string, string> = {
    'en': 'en-US',
    'pl': 'pl-PL',
    'ru': 'ru-RU',
  };
  return new Intl.DateTimeFormat(localeMap[locale] || 'en-US', {
    month: 'short',
    day: 'numeric',
  }).format(d);
}

export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

