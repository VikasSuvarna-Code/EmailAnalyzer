import { CampaignType, MetricThreshold } from '@/types';

export const CAMPAIGN_TYPES: CampaignType[] = [
  'Newsletter',
  'Promotion',
  'Product Update',
  'Event',
  'Transactional',
  'Other',
];

export const CAMPAIGN_TYPE_COLORS: Record<CampaignType, string> = {
  Newsletter: 'info',
  Promotion: 'purple',
  'Product Update': 'success',
  Event: 'warning',
  Transactional: 'default',
  Other: 'default',
};

export const THRESHOLD_COLORS: Record<MetricThreshold, { bg: string; text: string; label: string }> = {
  strong: {
    bg: 'bg-green-100 dark:bg-green-900/30',
    text: 'text-green-700 dark:text-green-400',
    label: 'Strong',
  },
  warning: {
    bg: 'bg-yellow-100 dark:bg-yellow-900/30',
    text: 'text-yellow-700 dark:text-yellow-400',
    label: 'Average',
  },
  weak: {
    bg: 'bg-red-100 dark:bg-red-900/30',
    text: 'text-red-700 dark:text-red-400',
    label: 'Needs Work',
  },
  neutral: {
    bg: 'bg-gray-100 dark:bg-gray-700',
    text: 'text-gray-500 dark:text-gray-400',
    label: 'N/A',
  },
};

export function formatDate(dateStr: string): string {
  if (!dateStr) return '—';
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}
