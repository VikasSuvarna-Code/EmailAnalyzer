import { Campaign } from '@/types';
import { calculateMetrics, aggregateStats, topPerformer, formatNumber } from './analytics';

export interface AssistantResponse {
  text: string;
}

export function getAssistantResponse(question: string, campaigns: Campaign[]): AssistantResponse {
  const q = question.toLowerCase().trim();

  if (campaigns.length === 0) {
    return {
      text: "I don't have any campaign data to analyze yet. Add some campaigns first, then I can answer your questions!",
    };
  }

  // Highest open rate
  if (q.includes('highest open rate') || q.includes('best open rate') || q.includes('most opened')) {
    const best = campaigns.reduce((a, b) =>
      calculateMetrics(a).openRate > calculateMetrics(b).openRate ? a : b
    );
    const rate = calculateMetrics(best).openRate;
    return {
      text: `The campaign with the highest open rate is **"${best.name}"** with an open rate of **${rate}%**. It was sent to ${best.audience} on ${new Date(best.date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}.`,
    };
  }

  // Most conversions
  if (q.includes('most conversions') || q.includes('highest conversions') || q.includes('best conversion')) {
    const best = campaigns.reduce((a, b) => (a.conversions > b.conversions ? a : b));
    const rate = calculateMetrics(best).conversionRate;
    return {
      text: `The campaign with the most conversions is **"${best.name}"** with **${formatNumber(best.conversions)} conversions** (conversion rate: ${rate}%).`,
    };
  }

  // Clicks this month / week
  if (q.includes('clicked this month') || q.includes('clicks this month')) {
    const now = new Date();
    const thisMonth = campaigns.filter(c => {
      const d = new Date(c.date);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    });
    if (thisMonth.length === 0) {
      return { text: "There are no campaigns from this month yet." };
    }
    const total = thisMonth.reduce((s, c) => s + c.emailsClicked, 0);
    return {
      text: `This month, **${formatNumber(total)} emails were clicked** across ${thisMonth.length} campaign${thisMonth.length > 1 ? 's' : ''}.`,
    };
  }

  if (q.includes('clicked this week') || q.includes('clicks this week')) {
    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thisWeek = campaigns.filter(c => new Date(c.date) >= weekAgo);
    if (thisWeek.length === 0) {
      return { text: "There are no campaigns from the past 7 days yet." };
    }
    const total = thisWeek.reduce((s, c) => s + c.emailsClicked, 0);
    return {
      text: `In the past 7 days, **${formatNumber(total)} emails were clicked** across ${thisWeek.length} campaign${thisWeek.length > 1 ? 's' : ''}.`,
    };
  }

  // Average CTR
  if (q.includes('average click') || q.includes('avg click') || q.includes('click-through rate') || q.includes('ctr')) {
    const stats = aggregateStats(campaigns);
    return {
      text: `Your average click-through rate across all ${campaigns.length} campaigns is **${stats.avgCTR}%**.`,
    };
  }

  // Average open rate
  if (q.includes('average open') || q.includes('avg open')) {
    const stats = aggregateStats(campaigns);
    return {
      text: `Your average open rate across all ${campaigns.length} campaigns is **${stats.avgOpenRate}%**.`,
    };
  }

  // Overall performance / how are campaigns performing
  if (q.includes('how are') || q.includes('performing') || q.includes('overall')) {
    const stats = aggregateStats(campaigns);
    const top = topPerformer(campaigns);
    return {
      text: `You have **${stats.totalCampaigns} campaigns** with a total of **${formatNumber(stats.totalSent)} emails sent**.\n\n- Average open rate: **${stats.avgOpenRate}%**\n- Average CTR: **${stats.avgCTR}%**\n- Average conversion rate: **${stats.avgConversionRate}%**\n- Total conversions: **${formatNumber(stats.totalConversions)}**\n\nTop performer: **"${top?.name ?? 'N/A'}"**`,
    };
  }

  // Summarize a specific campaign
  if (q.includes('summarize') || q.includes('summary')) {
    // try to find campaign name in question
    const match = campaigns.find(c => q.includes(c.name.toLowerCase()));
    if (match) {
      const m = calculateMetrics(match);
      return {
        text: `**Summary for "${match.name}"**\n\n- Sent: ${formatNumber(match.emailsSent)}\n- Delivered: ${formatNumber(match.emailsDelivered)} (${m.deliveryRate}%)\n- Opened: ${formatNumber(match.emailsOpened)} (${m.openRate}%)\n- Clicked: ${formatNumber(match.emailsClicked)} (${m.clickThroughRate}%)\n- Conversions: ${formatNumber(match.conversions)} (${m.conversionRate}%)\n- Bounced: ${formatNumber(match.emailsBounced)} (${m.bounceRate}%)`,
      };
    }
    // fallback: summarize most recent
    const sorted = [...campaigns].sort((a, b) => b.date.localeCompare(a.date));
    const latest = sorted[0];
    const m = calculateMetrics(latest);
    return {
      text: `**Summary for your most recent campaign: "${latest.name}"**\n\n- Sent: ${formatNumber(latest.emailsSent)}\n- Delivered: ${formatNumber(latest.emailsDelivered)} (${m.deliveryRate}%)\n- Opened: ${formatNumber(latest.emailsOpened)} (${m.openRate}%)\n- Clicked: ${formatNumber(latest.emailsClicked)} (${m.clickThroughRate}%)\n- Conversions: ${formatNumber(latest.conversions)} (${m.conversionRate}%)\n- Bounced: ${formatNumber(latest.emailsBounced)} (${m.bounceRate}%)`,
    };
  }

  // Campaigns to review / weak campaigns
  if (q.includes('review') || q.includes('weak') || q.includes('improve') || q.includes('attention')) {
    const weak = campaigns.filter(c => calculateMetrics(c).openRate < 15);
    if (weak.length === 0) {
      return { text: "All your campaigns have open rates above 15% — they're looking solid! Keep monitoring CTR and conversion rates for further optimization." };
    }
    const names = weak.map(c => `"${c.name}"`).join(', ');
    return {
      text: `The following campaigns have open rates below 15% and may need attention: ${names}. Consider reviewing subject lines, send times, and audience segmentation.`,
    };
  }

  // Total emails sent
  if (q.includes('total') && (q.includes('sent') || q.includes('emails'))) {
    const stats = aggregateStats(campaigns);
    return {
      text: `In total, **${formatNumber(stats.totalSent)} emails have been sent** across all your campaigns.`,
    };
  }

  // Number of campaigns
  if (q.includes('how many campaigns') || q.includes('number of campaigns') || q.includes('total campaigns')) {
    return {
      text: `You have **${campaigns.length} campaign${campaigns.length !== 1 ? 's' : ''}** in your analyzer.`,
    };
  }

  // Fallback
  return {
    text: "I'm not sure how to answer that specific question yet. Try asking about open rates, click rates, conversions, campaign performance, or request a campaign summary. You can also use the suggested questions below!",
  };
}
