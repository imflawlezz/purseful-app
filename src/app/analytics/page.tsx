'use client';

import { useEffect, useState } from 'react';
import { TrendingUp, TrendingDown, Target, Calendar, PieChart as PieChartIcon, BarChart3 } from 'lucide-react';
import { storage } from '@/lib/storage';
import { analytics } from '@/lib/analytics';
import { exchangeRates } from '@/lib/exchange-rates';
import { formatCurrency, formatDate } from '@/lib/utils';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Select } from '@/components/ui/Select';
import { PieChart } from '@/components/ui/PieChart';
import { BarChart } from '@/components/ui/BarChart';
import { useLocale } from '@/hooks/useLocale';
import { t, getCategoryName } from '@/lib/i18n';
import type { Category } from '@/types';

export default function AnalyticsPage() {
  const { locale } = useLocale();
  const [mainCurrency, setMainCurrency] = useState('USD');
  const [period, setPeriod] = useState<'week' | 'month' | 'quarter' | 'year'>('month');
  const [forecast, setForecast] = useState({
    income: 0,
    expense: 0,
    transfers: 0,
    byCategory: {} as Record<string, { income: number; expense: number }>,
  });
  const [budgetForecast, setBudgetForecast] = useState<
    {
      budgetId: string;
      categoryId: string;
      budgetAmount: number;
      forecastedSpending: number;
      currentSpending: number;
      remaining: number;
      percentage: number;
    }[]
  >([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [transactionData, setTransactionData] = useState({
    income: 0,
    expense: 0,
    incomeByCategory: {} as Record<string, number>,
    expenseByCategory: {} as Record<string, number>,
  });

  useEffect(() => {
    const updateData = () => {
      const data = storage.getData();
      setMainCurrency(data.settings.mainCurrency);
      setCategories(data.categories);

      const now = new Date();
      let startDate = new Date();
      let endDate = new Date();

      if (period === 'week') {
        startDate = new Date(now);
        startDate.setDate(now.getDate() - now.getDay()); // Start of week
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 7);
      } else if (period === 'month') {
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
      } else if (period === 'quarter') {
        const quarter = Math.floor(now.getMonth() / 3);
        startDate = new Date(now.getFullYear(), quarter * 3, 1);
        endDate = new Date(now.getFullYear(), (quarter + 1) * 3, 0);
      } else if (period === 'year') {
        startDate = new Date(now.getFullYear(), 0, 1);
        endDate = new Date(now.getFullYear(), 11, 31);
      }

      const forecastData = analytics.getForecast(startDate, endDate);
      setForecast(forecastData);

      const budgetData = analytics.getBudgetForecast(startDate, endDate);
      setBudgetForecast(budgetData);

      const actualData = analytics.getTransactionData(startDate, endDate);
      setTransactionData(actualData);
    };

    updateData();
    const interval = setInterval(updateData, 5000);
    return () => clearInterval(interval);
  }, [period]);

  const getCategory = (id: string) => categories.find(c => c.id === id);

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-7xl overflow-x-hidden">
      <div className="mb-6 grid sm:flex sm:flex-row sm:items-center sm:justify-between gap-4">
        <h1 className="text-3xl font-bold">{t('analytics.title', locale)}</h1>
        <Select
          value={period}
          onChange={(e) => setPeriod(e.target.value as typeof period)}
          className=""
        >
          <option value="week">{t('analytics.thisWeek', locale)}</option>
          <option value="month">{t('analytics.thisMonth', locale)}</option>
          <option value="quarter">{t('analytics.thisQuarter', locale)}</option>
          <option value="year">{t('analytics.thisYear', locale)}</option>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 mb-6 items-stretch">
        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-income" />
              {t('analytics.forecastedIncome', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-2xl font-bold text-income">
              {formatCurrency(forecast.income, mainCurrency)}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground flex items-center gap-2">
              <TrendingDown className="h-4 w-4 text-expense" />
              {t('analytics.forecastedExpense', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-2xl font-bold text-expense">
              {formatCurrency(forecast.expense, mainCurrency)}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('analytics.netForecast', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className={`text-2xl font-bold ${
              forecast.income - forecast.expense >= 0 ? 'text-income' : 'text-expense'
            }`}>
              {formatCurrency(forecast.income - forecast.expense, mainCurrency)}
            </div>
          </CardContent>
        </Card>

        <Card className="h-full flex flex-col">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t('analytics.budgetsTracked', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent className="flex-1">
            <div className="text-2xl font-bold">
              {budgetForecast.length}
            </div>
          </CardContent>
        </Card>
      </div>

      {budgetForecast.length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              {t('analytics.budgetForecasts', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {budgetForecast.map((bf) => {
                const category = getCategory(bf.categoryId);
                const isOverBudget = bf.remaining < 0;
                
                return (
                  <div key={bf.budgetId} className="p-4 rounded-lg border border-border">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <div className="font-semibold text-lg">{category ? getCategoryName(category, locale) : t('common.unknown', locale)}</div>
                        <div className="text-sm text-muted-foreground">
                          {t('analytics.budget', locale)}: {formatCurrency(bf.budgetAmount, mainCurrency)}
                        </div>
                      </div>
                      <div className={`text-right ${isOverBudget ? 'text-expense' : 'text-income'}`}>
                        <div className="text-lg font-bold">
                          {formatCurrency(bf.remaining, mainCurrency)}
                        </div>
                        <div className="text-xs text-muted-foreground">{t('analytics.remaining', locale)}</div>
                      </div>
                    </div>
                    
                    <div className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('analytics.currentSpending', locale)}</span>
                        <span>{formatCurrency(bf.currentSpending, mainCurrency)}</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">{t('analytics.forecastedAdditional', locale)}</span>
                        <span>{formatCurrency(bf.forecastedSpending, mainCurrency)}</span>
                      </div>
                      <div className="pt-2">
                        <div className="h-2 bg-muted rounded-full overflow-hidden">
                          <div
                            className={`h-full transition-all ${
                              isOverBudget ? 'bg-expense' : bf.percentage > 80 ? 'bg-warning' : 'bg-income'
                            }`}
                            style={{ width: `${Math.min(bf.percentage, 100)}%` }}
                          />
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 text-center">
                          {bf.percentage.toFixed(1)}% {t('analytics.ofBudget', locale)}
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {Object.keys(transactionData.expenseByCategory).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                {t('analytics.expenseByCategory', locale)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart
                data={Object.entries(transactionData.expenseByCategory)
                  .map(([categoryId, value]) => {
                    const category = getCategory(categoryId);
                    return {
                      label: category ? getCategoryName(category, locale) : t('common.unknown', locale),
                      value,
                      color: category?.color || '#64748B',
                    };
                  })
                  .sort((a, b) => b.value - a.value)}
                size={200}
              />
            </CardContent>
          </Card>
        )}

        {Object.keys(transactionData.incomeByCategory).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <PieChartIcon className="h-5 w-5" />
                {t('analytics.incomeByCategory', locale)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <PieChart
                data={Object.entries(transactionData.incomeByCategory)
                  .map(([categoryId, value]) => {
                    const category = getCategory(categoryId);
                    return {
                      label: category ? getCategoryName(category, locale) : t('common.unknown', locale),
                      value,
                      color: category?.color || '#64748B',
                    };
                  })
                  .sort((a, b) => b.value - a.value)}
                size={200}
              />
            </CardContent>
          </Card>
        )}
      </div>

      <div className="grid gap-6 lg:grid-cols-2 mb-6">
        {Object.keys(transactionData.expenseByCategory).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('analytics.topExpenses', locale)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={Object.entries(transactionData.expenseByCategory)
                  .map(([categoryId, value]) => {
                    const category = getCategory(categoryId);
                    return {
                      label: category ? getCategoryName(category, locale) : t('common.unknown', locale),
                      value,
                      color: category?.color || '#64748B',
                    };
                  })
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 10)}
                currency={mainCurrency}
              />
            </CardContent>
          </Card>
        )}

        {Object.keys(transactionData.incomeByCategory).length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                {t('analytics.topIncomeSources', locale)}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BarChart
                data={Object.entries(transactionData.incomeByCategory)
                  .map(([categoryId, value]) => {
                    const category = getCategory(categoryId);
                    return {
                      label: category ? getCategoryName(category, locale) : t('common.unknown', locale),
                      value,
                      color: category?.color || '#64748B',
                    };
                  })
                  .sort((a, b) => b.value - a.value)
                  .slice(0, 10)}
                currency={mainCurrency}
              />
            </CardContent>
          </Card>
        )}
      </div>

      {Object.keys(forecast.byCategory).length > 0 && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              {t('analytics.forecastByCategory', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {Object.entries(forecast.byCategory).map(([categoryId, amounts]) => {
                const category = getCategory(categoryId);
                if (!category) return null;
                
                return (
                  <div key={categoryId} className="flex items-center justify-between p-3 rounded-lg hover:bg-accent transition-colors">
                    <div className="flex items-center gap-3">
                      <div
                        className="h-8 w-8 rounded-full"
                        style={{ backgroundColor: category.color + '20' }}
                      >
                        <div
                          className="h-6 w-6 rounded-full m-1"
                          style={{ backgroundColor: category.color }}
                        />
                      </div>
                      <div>
                        <div className="font-medium break-words">{getCategoryName(category, locale)}</div>
                        <div className="text-xs text-muted-foreground capitalize">{category.type}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      {amounts.income > 0 && (
                        <div className="text-sm font-semibold text-income">
                          +{formatCurrency(amounts.income, mainCurrency)}
                        </div>
                      )}
                      {amounts.expense > 0 && (
                        <div className="text-sm font-semibold text-expense">
                          -{formatCurrency(amounts.expense, mainCurrency)}
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

