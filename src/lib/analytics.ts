import { storage } from './storage';
import { exchangeRates } from './exchange-rates';
import type { PlannedTransaction, Budget, Transaction } from '@/types';

export const analytics = {
  /**
   * Get forecasted income/expense for a period based on planned transactions
   */
  getForecast(startDate: Date, endDate: Date): {
    income: number;
    expense: number;
    transfers: number;
    byCategory: Record<string, { income: number; expense: number }>;
  } {
    const data = storage.getData();
    const mainCurrency = data.settings.mainCurrency;
    const result = {
      income: 0,
      expense: 0,
      transfers: 0,
      byCategory: {} as Record<string, { income: number; expense: number }>,
    };

    data.plannedTransactions.forEach((planned) => {
      const plannedStart = new Date(planned.startDate);
      const plannedEnd = planned.endDate ? new Date(planned.endDate) : null;

      // Skip if planned transaction doesn't overlap with forecast period
      if (plannedEnd && plannedEnd < startDate) return;
      if (plannedStart > endDate) return;

      // Calculate occurrences in the period
      const occurrences = this.getOccurrencesInPeriod(
        planned,
        new Date(Math.max(plannedStart.getTime(), startDate.getTime())),
        new Date(Math.min(plannedEnd?.getTime() || endDate.getTime(), endDate.getTime()))
      );

      const amount = exchangeRates.convert(planned.amount, planned.currency, mainCurrency) * occurrences;

      if (planned.type === 'income') {
        result.income += amount;
        if (planned.categoryId) {
          if (!result.byCategory[planned.categoryId]) {
            result.byCategory[planned.categoryId] = { income: 0, expense: 0 };
          }
          result.byCategory[planned.categoryId].income += amount;
        }
      } else if (planned.type === 'expense') {
        result.expense += amount;
        if (planned.categoryId) {
          if (!result.byCategory[planned.categoryId]) {
            result.byCategory[planned.categoryId] = { income: 0, expense: 0 };
          }
          result.byCategory[planned.categoryId].expense += amount;
        }
      } else {
        result.transfers += amount;
      }
    });

    return result;
  },

  /**
   * Get number of occurrences for a planned transaction in a period
   * This checks if each specific occurrence date actually falls within the time window
   */
  getOccurrencesInPeriod(
    planned: PlannedTransaction,
    startDate: Date,
    endDate: Date
  ): number {
    if (planned.frequency === 'once') {
      const plannedDate = new Date(planned.startDate);
      plannedDate.setHours(0, 0, 0, 0);
      const windowStart = new Date(startDate);
      windowStart.setHours(0, 0, 0, 0);
      const windowEnd = new Date(endDate);
      windowEnd.setHours(23, 59, 59, 999);
      if (plannedDate >= windowStart && plannedDate <= windowEnd) {
        return 1;
      }
      return 0;
    }

    let count = 0;
    // Start from the planned transaction's start date
    let currentDate = new Date(planned.startDate);
    currentDate.setHours(0, 0, 0, 0);
    const plannedEnd = planned.endDate ? new Date(planned.endDate) : null;
    if (plannedEnd) {
      plannedEnd.setHours(23, 59, 59, 999);
    }
    const windowStart = new Date(startDate);
    windowStart.setHours(0, 0, 0, 0);
    const windowEnd = new Date(endDate);
    windowEnd.setHours(23, 59, 59, 999);

    // Find the first occurrence that falls within the window
    while (currentDate < windowStart) {
      // Move to next occurrence
      if (planned.frequency === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (planned.frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (planned.frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (planned.frequency === 'yearly') {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
      
      // Check if we've exceeded the planned end date
      if (plannedEnd && currentDate > plannedEnd) {
        return 0;
      }
    }

    // Now count all occurrences that fall within the window
    while (currentDate <= windowEnd) {
      // Check if we've exceeded the planned end date
      if (plannedEnd && currentDate > plannedEnd) break;
      
      // Only count if this occurrence is within the window
      if (currentDate >= windowStart && currentDate <= windowEnd) {
        count++;
      }

      // Move to next occurrence
      if (planned.frequency === 'daily') {
        currentDate.setDate(currentDate.getDate() + 1);
      } else if (planned.frequency === 'weekly') {
        currentDate.setDate(currentDate.getDate() + 7);
      } else if (planned.frequency === 'monthly') {
        currentDate.setMonth(currentDate.getMonth() + 1);
      } else if (planned.frequency === 'yearly') {
        currentDate.setFullYear(currentDate.getFullYear() + 1);
      }
    }

    return count;
  },

  /**
   * Get budget forecast - predicted spending vs budget limits
   */
  getBudgetForecast(startDate: Date, endDate: Date): {
    budgetId: string;
    categoryId: string;
    budgetAmount: number;
    forecastedSpending: number;
    currentSpending: number;
    remaining: number;
    percentage: number;
  }[] {
    const data = storage.getData();
    const mainCurrency = data.settings.mainCurrency;
    const forecast = this.getForecast(startDate, endDate);
    const results: {
      budgetId: string;
      categoryId: string;
      budgetAmount: number;
      forecastedSpending: number;
      currentSpending: number;
      remaining: number;
      percentage: number;
    }[] = [];

    // Get current spending in the period
    const currentSpendingByCategory: Record<string, number> = {};
    data.transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return t.type === 'expense' && tDate >= startDate && tDate <= endDate;
      })
      .forEach(t => {
        if (!currentSpendingByCategory[t.categoryId]) {
          currentSpendingByCategory[t.categoryId] = 0;
        }
        currentSpendingByCategory[t.categoryId] += exchangeRates.convert(
          t.amount,
          t.currency,
          mainCurrency
        );
      });

    data.budgets.forEach((budget) => {
      const budgetStart = new Date(budget.startDate);
      const budgetEnd = budget.endDate ? new Date(budget.endDate) : null;

      // Check if budget period overlaps with forecast period
      if (budgetEnd && budgetEnd < startDate) return;
      if (budgetStart > endDate) return;

      // Calculate budget amount for the forecast period
      let budgetAmount = 0;
      if (budget.period === 'weekly') {
        const weeks = Math.ceil((endDate.getTime() - Math.max(startDate.getTime(), budgetStart.getTime())) / (7 * 24 * 60 * 60 * 1000));
        budgetAmount = budget.amount * weeks;
      } else if (budget.period === 'monthly') {
        const months = Math.ceil((endDate.getTime() - Math.max(startDate.getTime(), budgetStart.getTime())) / (30 * 24 * 60 * 60 * 1000));
        budgetAmount = budget.amount * months;
      } else if (budget.period === 'yearly') {
        const years = Math.ceil((endDate.getTime() - Math.max(startDate.getTime(), budgetStart.getTime())) / (365 * 24 * 60 * 60 * 1000));
        budgetAmount = budget.amount * years;
      }

      const budgetAmountConverted = exchangeRates.convert(budgetAmount, budget.currency, mainCurrency);
      const forecastedSpending = forecast.byCategory[budget.categoryId]?.expense || 0;
      const currentSpending = currentSpendingByCategory[budget.categoryId] || 0;
      const totalSpending = currentSpending + forecastedSpending;
      const remaining = budgetAmountConverted - totalSpending;
      const percentage = (totalSpending / budgetAmountConverted) * 100;

      results.push({
        budgetId: budget.id,
        categoryId: budget.categoryId,
        budgetAmount: budgetAmountConverted,
        forecastedSpending,
        currentSpending,
        remaining,
        percentage: isNaN(percentage) ? 0 : percentage,
      });
    });

    return results;
  },

  /**
   * Get actual transaction data for a period
   */
  getTransactionData(startDate: Date, endDate: Date): {
    income: number;
    expense: number;
    incomeByCategory: Record<string, number>;
    expenseByCategory: Record<string, number>;
  } {
    const data = storage.getData();
    const mainCurrency = data.settings.mainCurrency;
    const result = {
      income: 0,
      expense: 0,
      incomeByCategory: {} as Record<string, number>,
      expenseByCategory: {} as Record<string, number>,
    };

    data.transactions
      .filter(t => {
        const tDate = new Date(t.date);
        return tDate >= startDate && tDate <= endDate;
      })
      .forEach(t => {
        const amount = exchangeRates.convert(t.amount, t.currency, mainCurrency);
        
        if (t.type === 'income') {
          result.income += amount;
          if (t.categoryId) {
            result.incomeByCategory[t.categoryId] = (result.incomeByCategory[t.categoryId] || 0) + amount;
          }
        } else if (t.type === 'expense') {
          result.expense += amount;
          if (t.categoryId) {
            result.expenseByCategory[t.categoryId] = (result.expenseByCategory[t.categoryId] || 0) + amount;
          }
        }
      });

    return result;
  },
};

