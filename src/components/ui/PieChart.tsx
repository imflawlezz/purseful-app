'use client';

import { useLocale } from '@/hooks/useLocale';
import { t } from '@/lib/i18n';

interface PieChartProps {
  data: Array<{ label: string; value: number; color: string }>;
  size?: number;
}

export function PieChart({ data, size = 200 }: PieChartProps) {
  const { locale } = useLocale();
  const total = data.reduce((sum, item) => sum + item.value, 0);
  if (total === 0) {
    return (
      <div className="flex items-center justify-center" style={{ width: size, height: size }}>
        <p className="text-muted-foreground text-sm">{t('analytics.noData', locale)}</p>
      </div>
    );
  }

  let currentAngle = -90; // Start at top
  const radius = size / 2 - 10;
  const center = size / 2;

  // If only one item, draw a full circle
  if (data.length === 1) {
    return (
      <div className="flex flex-col items-center">
        <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <circle
            cx={center}
            cy={center}
            r={radius}
            fill={data[0].color}
            stroke="var(--background)"
            strokeWidth="2"
            className="transition-opacity hover:opacity-80"
          />
        </svg>
        <div className="mt-4 space-y-2 w-full">
          <div className="flex items-center gap-2 text-sm">
            <div
              className="w-4 h-4 rounded-full"
              style={{ backgroundColor: data[0].color }}
            />
            <span className="flex-1 break-words">{data[0].label}</span>
            <span className="font-medium">100%</span>
          </div>
        </div>
      </div>
    );
  }

  const paths = data.map((item, index) => {
    const percentage = (item.value / total) * 100;
    const angle = (item.value / total) * 360;
    const startAngle = currentAngle;
    const endAngle = currentAngle + angle;
    currentAngle = endAngle;

    const x1 = center + radius * Math.cos((startAngle * Math.PI) / 180);
    const y1 = center + radius * Math.sin((startAngle * Math.PI) / 180);
    const x2 = center + radius * Math.cos((endAngle * Math.PI) / 180);
    const y2 = center + radius * Math.sin((endAngle * Math.PI) / 180);
    const largeArcFlag = angle > 180 ? 1 : 0;

    const pathData = [
      `M ${center} ${center}`,
      `L ${x1} ${y1}`,
      `A ${radius} ${radius} 0 ${largeArcFlag} 1 ${x2} ${y2}`,
      'Z',
    ].join(' ');

    return (
      <path
        key={index}
        d={pathData}
        fill={item.color}
        stroke="var(--background)"
        strokeWidth="2"
        className="transition-opacity hover:opacity-80"
      />
    );
  });

  return (
    <div className="flex flex-col items-center">
      <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
        {paths}
      </svg>
      <div className="mt-4 space-y-2 w-full">
        {data.map((item, index) => {
          const percentage = ((item.value / total) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center gap-2 text-sm">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: item.color }}
              />
              <span className="flex-1 break-words">{item.label}</span>
              <span className="font-medium">{percentage}%</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}

