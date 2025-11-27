'use client';

import { formatCurrency } from '@/lib/utils';

interface BarChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  height?: number;
  currency?: string;
}

export function BarChart({ data, height = 200, currency = 'USD' }: BarChartProps) {
  const maxValue = Math.max(...data.map(d => d.value), 1);

  return (
    <div className="space-y-2">
      {data.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="flex-1 break-words min-w-0">{item.label}</span>
              <span className="font-medium ml-2 flex-shrink-0">{formatCurrency(item.value, currency)}</span>
            </div>
            <div className="h-6 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full transition-all rounded-full"
                style={{
                  width: `${percentage}%`,
                  backgroundColor: item.color,
                }}
              />
            </div>
          </div>
        );
      })}
      {data.length === 0 && (
        <div className="flex items-center justify-center h-32">
          <p className="text-muted-foreground text-sm">No data</p>
        </div>
      )}
    </div>
  );
}

