'use client';

import { useEffect, useState } from 'react';
import { Download, Upload, RefreshCw, Moon, Sun, Monitor } from 'lucide-react';
import { storage } from '@/lib/storage';
import { exchangeRates } from '@/lib/exchange-rates';
import { theme as themeUtil, type Theme } from '@/lib/theme';
import { CURRENCIES } from '@/lib/currencies';
import { Button } from '@/components/ui/Button';
import { Select } from '@/components/ui/Select';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import type { Settings } from '@/types';

export default function SettingsPage() {
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
            alert('Data imported successfully!');
            window.location.reload();
          } else {
            alert('Failed to import data. Please check the file format.');
          }
        };
        reader.readAsText(file);
      }
    };
    input.click();
  };

  return (
    <div className="container mx-auto p-4 lg:p-8 max-w-4xl">
      <h1 className="text-3xl font-bold mb-6">Settings</h1>

      <div className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Theme</label>
              <div className="flex gap-2">
                <Button
                  variant={currentTheme === 'light' ? 'primary' : 'outline'}
                  onClick={() => handleThemeChange('light')}
                  className="flex-1"
                >
                  <Sun className="mr-2 h-4 w-4" />
                  Light
                </Button>
                <Button
                  variant={currentTheme === 'dark' ? 'primary' : 'outline'}
                  onClick={() => handleThemeChange('dark')}
                  className="flex-1"
                >
                  <Moon className="mr-2 h-4 w-4" />
                  Dark
                </Button>
                <Button
                  variant={currentTheme === 'system' ? 'primary' : 'outline'}
                  onClick={() => handleThemeChange('system')}
                  className="flex-1"
                >
                  <Monitor className="mr-2 h-4 w-4" />
                  System
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Currency</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="text-sm font-medium mb-2 block">Main Currency</label>
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
            <CardTitle>Exchange Rates</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex items-center justify-between mb-4">
                <div>
                  <div className="font-medium">Update Exchange Rates</div>
                  <div className="text-sm text-muted-foreground">
                    {settings.lastExchangeRateUpdate
                      ? `Last updated: ${new Date(settings.lastExchangeRateUpdate).toLocaleString()}`
                      : 'Never updated'}
                  </div>
                </div>
                <Button
                  onClick={handleUpdateExchangeRates}
                  disabled={isUpdatingRates}
                  variant="outline"
                >
                  <RefreshCw className={`mr-2 h-4 w-4 ${isUpdatingRates ? 'animate-spin' : ''}`} />
                  Update Rates
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                Exchange rates are fetched when you have an internet connection and cached for offline use.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Data Management</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="font-medium mb-2">Export Data</div>
              <p className="text-sm text-muted-foreground mb-4">
                Download a backup of all your data as a JSON file.
              </p>
              <Button onClick={handleExport} variant="outline">
                <Download className="mr-2 h-4 w-4" />
                Export Data
              </Button>
            </div>
            <div className="pt-4 border-t border-border">
              <div className="font-medium mb-2">Import Data</div>
              <p className="text-sm text-muted-foreground mb-4">
                Restore your data from a previously exported backup file. This will replace all current data.
              </p>
              <Button onClick={handleImport} variant="outline">
                <Upload className="mr-2 h-4 w-4" />
                Import Data
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

