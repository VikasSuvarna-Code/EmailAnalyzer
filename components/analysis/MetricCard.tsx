'use client';
import { MetricEvaluation } from '@/types';
import { THRESHOLD_COLORS } from '@/lib/constants';

interface MetricCardProps {
  metric: MetricEvaluation;
}

export function MetricCard({ metric }: MetricCardProps) {
  const colors = THRESHOLD_COLORS[metric.threshold];
  return (
    <div className={`rounded-xl p-5 ${colors.bg} border border-current border-opacity-20`}>
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className={`text-xs font-medium uppercase tracking-wide ${colors.text}`}>{metric.label}</p>
          <p className={`mt-1 text-3xl font-bold ${colors.text}`}>{metric.formatted}</p>
          <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">{metric.description}</p>
        </div>
        <span className={`text-xs font-semibold px-2 py-1 rounded-full ${colors.bg} ${colors.text}`}>
          {colors.label}
        </span>
      </div>
    </div>
  );
}
