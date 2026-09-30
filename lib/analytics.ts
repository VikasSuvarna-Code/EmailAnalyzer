import { Campaign, CampaignMetrics, MetricEvaluation, MetricThreshold } from '@/types';

/** Safe division that returns 0 when denominator is 0 */
function safeDivide(numerator: number, denominator: number): number {
  if (denominator === 0 || isNaN(denominator)) return 0;
  return numerator / denominator;
}

/** Round to two decimal places */
function round2(n: number): number {
  return Math.round(n * 100) / 100;
}

export function calculateMetrics(c: Campaign): CampaignMetrics {
  return {
    deliveryRate: round2(safeDivide(c.emailsDelivered, c.emailsSent) * 100),
    openRate: round2(safeDivide(c.emailsOpened, c.emailsDelivered) * 100),
    clickThroughRate: round2(safeDivide(c.emailsClicked, c.emailsDelivered) * 100),
    conversionRate: round2(safeDivide(c.conversions, c.emailsDelivered) * 100),
    bounceRate: round2(safeDivide(c.emailsBounced, c.emailsSent) * 100),
  };
}

function thresholdForOpenRate(v: number): MetricThreshold {
  if (v >= 25) return 'strong';
  if (v >= 15) return 'warning';
  return 'weak';
}
function thresholdForCTR(v: number): MetricThreshold {
  if (v >= 3) return 'strong';
  if (v >= 1) return 'warning';
  return 'weak';
}
function thresholdForConversion(v: number): MetricThreshold {
  if (v >= 2) return 'strong';
  if (v >= 0.5) return 'warning';
  return 'weak';
}
function thresholdForBounce(v: number): MetricThreshold {
  if (v < 2) return 'strong';
  if (v <= 5) return 'warning';
  return 'weak';
}
function thresholdForDelivery(v: number): MetricThreshold {
  if (v >= 98) return 'strong';
  if (v >= 95) return 'warning';
  return 'weak';
}

export function evaluateMetrics(c: Campaign): MetricEvaluation[] {
  const m = calculateMetrics(c);
  return [
    {
      label: 'Delivery Rate',
      value: m.deliveryRate,
      formatted: `${m.deliveryRate}%`,
      threshold: c.emailsSent === 0 ? 'neutral' : thresholdForDelivery(m.deliveryRate),
      description: 'Percentage of emails that reached recipients',
    },
    {
      label: 'Open Rate',
      value: m.openRate,
      formatted: `${m.openRate}%`,
      threshold: c.emailsDelivered === 0 ? 'neutral' : thresholdForOpenRate(m.openRate),
      description: 'Percentage of delivered emails that were opened',
    },
    {
      label: 'Click-Through Rate',
      value: m.clickThroughRate,
      formatted: `${m.clickThroughRate}%`,
      threshold: c.emailsDelivered === 0 ? 'neutral' : thresholdForCTR(m.clickThroughRate),
      description: 'Percentage of delivered emails that were clicked',
    },
    {
      label: 'Conversion Rate',
      value: m.conversionRate,
      formatted: `${m.conversionRate}%`,
      threshold: c.emailsDelivered === 0 ? 'neutral' : thresholdForConversion(m.conversionRate),
      description: 'Percentage of delivered emails that converted',
    },
    {
      label: 'Bounce Rate',
      value: m.bounceRate,
      formatted: `${m.bounceRate}%`,
      threshold: c.emailsSent === 0 ? 'neutral' : thresholdForBounce(m.bounceRate),
      description: 'Percentage of emails that could not be delivered',
    },
  ];
}

export function aggregateStats(campaigns: Campaign[]) {
  if (campaigns.length === 0) {
    return {
      totalCampaigns: 0,
      totalSent: 0,
      totalDelivered: 0,
      totalOpened: 0,
      totalClicked: 0,
      totalConversions: 0,
      avgOpenRate: 0,
      avgCTR: 0,
      avgConversionRate: 0,
    };
  }
  const totalSent = campaigns.reduce((s, c) => s + c.emailsSent, 0);
  const totalDelivered = campaigns.reduce((s, c) => s + c.emailsDelivered, 0);
  const totalOpened = campaigns.reduce((s, c) => s + c.emailsOpened, 0);
  const totalClicked = campaigns.reduce((s, c) => s + c.emailsClicked, 0);
  const totalConversions = campaigns.reduce((s, c) => s + c.conversions, 0);

  const rates = campaigns.map(c => calculateMetrics(c));
  const avgOpenRate = round2(rates.reduce((s, r) => s + r.openRate, 0) / campaigns.length);
  const avgCTR = round2(rates.reduce((s, r) => s + r.clickThroughRate, 0) / campaigns.length);
  const avgConversionRate = round2(rates.reduce((s, r) => s + r.conversionRate, 0) / campaigns.length);

  return {
    totalCampaigns: campaigns.length,
    totalSent,
    totalDelivered,
    totalOpened,
    totalClicked,
    totalConversions,
    avgOpenRate,
    avgCTR,
    avgConversionRate,
  };
}

export function topPerformer(campaigns: Campaign[]): Campaign | null {
  if (campaigns.length === 0) return null;
  return campaigns.reduce((best, c) => {
    const bRate = calculateMetrics(best).openRate;
    const cRate = calculateMetrics(c).openRate;
    return cRate > bRate ? c : best;
  });
}

export function formatNumber(n: number): string {
  return new Intl.NumberFormat('en-US').format(n);
}
