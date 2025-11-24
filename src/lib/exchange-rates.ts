import { storage } from './storage';
import type { ExchangeRate } from '@/types';

const EXCHANGE_RATE_API = 'https://api.exchangerate-api.com/v4/latest/';

export const exchangeRates = {
  async fetchRates(baseCurrency: string): Promise<Record<string, number> | null> {
    if (typeof window === 'undefined') return null;
    
    try {
      const response = await fetch(`${EXCHANGE_RATE_API}${baseCurrency}`);
      if (!response.ok) throw new Error('Failed to fetch exchange rates');
      
      const data = await response.json();
      return data.rates;
    } catch (error) {
      console.error('Error fetching exchange rates:', error);
      return null;
    }
  },

  async updateExchangeRates(): Promise<boolean> {
    const data = storage.getData();
    const mainCurrency = data.settings.mainCurrency;
    
    const rates = await this.fetchRates(mainCurrency);
    if (!rates) return false;
    
    const exchangeRates: ExchangeRate[] = Object.entries(rates).map(([to, rate]) => ({
      from: mainCurrency,
      to,
      rate: rate as number,
      updatedAt: new Date().toISOString(),
    }));
    
    storage.updateSettings({
      exchangeRates,
      lastExchangeRateUpdate: new Date().toISOString(),
    });
    
    return true;
  },

  getRate(from: string, to: string): number {
    if (from === to) return 1;
    
    const data = storage.getData();
    const mainCurrency = data.settings.mainCurrency;
    const rates = data.settings.exchangeRates;
    
    // Direct rate: from mainCurrency to target
    if (from === mainCurrency) {
      const rate = rates.find(r => r.from === from && r.to === to);
      return rate?.rate || 1;
    }
    
    // Inverse rate: from target to mainCurrency, then to destination
    if (to === mainCurrency) {
      const rate = rates.find(r => r.from === mainCurrency && r.to === from);
      if (rate) {
        return 1 / rate.rate; // Inverse of the stored rate
      }
    }
    
    // Cross conversion: from -> mainCurrency -> to
    const fromRate = rates.find(r => r.from === mainCurrency && r.to === from);
    const toRate = rates.find(r => r.from === mainCurrency && r.to === to);
    
    if (fromRate && toRate) {
      // Convert: from -> mainCurrency -> to
      // First convert to mainCurrency: amount / fromRate
      // Then convert to target: (amount / fromRate) * toRate
      return toRate.rate / fromRate.rate;
    }
    
    return 1;
  },

  convert(amount: number, from: string, to: string): number {
    if (from === to) return amount;
    const rate = this.getRate(from, to);
    return amount * rate;
  },
};

