'use client';

import { useEffect, useState } from 'react';
import { Download, Upload, RefreshCw, Moon, Sun, Monitor, Globe } from 'lucide-react';
import { storage } from '@/lib/storage';
import { exchangeRates } from '@/lib/exchange-rates';
import { theme as themeUtil, type Theme } from '@/lib/theme';
import { CURRENCIES } from '@/lib/currencies';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { useLocale } from '@/hooks/useLocale';
import { t } from '@/lib/i18n';
import type { Settings } from '@/types';

export default function SettingsPage() {
  const { locale, changeLocale } = useLocale();
  const [settings, setSettings] = useState<Settings>(storage.getData().settings);
  const [currentTheme, setCurrentTheme] = useState<Theme>(themeUtil.getTheme());
  const [isUpdatingRates, setIsUpdatingRates] = useState(false);

  useEffect(() => {
    const updateData = () => {
      setSettings(storage.getData().settings);
    };
    updateData();
    const interval = setInterval(updateData, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleMainCurrencyChange = (currency: string) => {
    storage.updateSettings({ mainCurrency: currency });
    setSettings({ ...settings, mainCurrency: currency });
  };

  const handleThemeChange = (newTheme: Theme) => {
    themeUtil.setTheme(newTheme);
    setCurrentTheme(newTheme);
  };

  const handleUpdateExchangeRates = async () => {
    setIsUpdatingRates(true);
    const success = await exchangeRates.updateExchangeRates();
    if (success) {
      setSettings(storage.getData().settings);
    }
    setIsUpdatingRates(false);
  };

  const handleExport = () => {
    const data = storage.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `purseful-backup-${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'application/json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = (event) => {
          const content = event.target?.result as string;
          if (storage.importData(content)) {
            alert(t('settings.importSuccess', locale));
            window.location.reload();
          } else {
            alert(t('settings.importFailed', locale));
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">{t('settings.title', locale)}</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>{t('settings.appearance', locale)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('settings.theme', locale)}</label>
              <div className="grid md:flex gap-2">
                <Button
                  variant={currentTheme === 'light' ? 'primary' : 'outline'}
                  onClick={() => handleThemeChange('light')}
                  className="flex-1"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  {t('settings.light', locale)}
                </Button>
                <Button
                  variant={currentTheme === 'dark' ? 'primary' : 'outline'}
                  onClick={() => handleThemeChange('dark')}
                  className="flex-1"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  {t('settings.dark', locale)}
                </Button>
                <Button
                  variant={currentTheme === 'system' ? 'primary' : 'outline'}
                  onClick={() => handleThemeChange('system')}
                  className="flex-1"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  {t('settings.system', locale)}
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Globe className="h-5 w-5" />
              {t('settings.language', locale)}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('settings.language', locale)}</label>
              <Select
                value={locale}
                onChange={(e) => changeLocale(e.target.value as typeof locale)}
              >
                <option value="en">{t('settings.languageNames.en', locale)}</option>
                <option value="pl">{t('settings.languageNames.pl', locale)}</option>
                <option value="ru">{t('settings.languageNames.ru', locale)}</option>
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.currency', locale)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">{t('settings.mainCurrency', locale)}</label>
              <Select
                value={settings.mainCurrency}
                onChange={(e) => handleMainCurrencyChange(e.target.value)}
              >
                {CURRENCIES.map((c) => (
                  <option key={c.code} value={c.code}>
                    {c.code} - {c.name}
                  </option>
                ))}
              </Select>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.exchangeRates', locale)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-medium">{t('settings.updateExchangeRates', locale)}</div>
                  <div className="text-sm text-muted-foreground">
                    {settings.lastExchangeRateUpdate
                      ? `${t('settings.lastUpdatedPrefix', locale)} ${new Date(settings.lastExchangeRateUpdate).toLocaleString()}`
                      : t('settings.neverUpdated', locale)}
                  </div>
                </div>
                <Button
                  onClick={handleUpdateExchangeRates}
                  disabled={isUpdatingRates}
                  variant="outline"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isUpdatingRates ? 'animate-spin' : ''}`} />
                  {t('settings.updateRates', locale)}
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                {t('settings.ratesDescription', locale)}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>{t('settings.dataManagement', locale)}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium mb-2">{t('settings.exportData', locale)}</div>
              <p className="text-sm text-muted-foreground mb-4">
                {t('settings.exportDescription', locale)}
              </p>
              <Button onClick={handleExport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                {t('settings.exportData', locale)}
              </Button>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="font-medium mb-2">{t('settings.importData', locale)}</div>
              <p className="text-sm text-muted-foreground mb-4">
                {t('settings.importDescription', locale)}
              </p>
              <Button onClick={handleImport} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                {t('settings.importData', locale)}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

