'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { calculateMetrics, formatNumber } from '@/lib/analytics';
import { formatDate } from '@/lib/constants';
import { Card, Button, EmptyState } from '@/components/ui';
import {
  RadarChart, Radar, PolarGrid, PolarAngleAxis, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid,
} from 'recharts';
import Link from 'next/link';
import { Plus } from 'lucide-react';

const COLORS = ['#6366f1', '#f59e0b', '#22c55e', '#ef4444', '#3b82f6', '#a855f7'];

export default function ComparePage() {
  const { state } = useApp();
  const campaigns = state.campaigns;
  const [selected, setSelected] = useState<string[]>([]);

  function toggleSelect(id: string) {
    setSelected(prev =>
      prev.includes(id)
        ? prev.filter(x => x !== id)
        : prev.length < 5
          ? [...prev, id]
          : prev
    );
  }

  const chosenCampaigns = campaigns.filter(c => selected.includes(c.id));

  const radarData = [
    { metric: 'Open Rate' },
    { metric: 'CTR' },
    { metric: 'Conversion' },
    { metric: 'Delivery' },
  ].map(row => {
    const out: Record<string, string | number> = { metric: row.metric };
    chosenCampaigns.forEach(c => {
      const m = calculateMetrics(c);
      if (row.metric === 'Open Rate') out[c.name] = m.openRate;
      else if (row.metric === 'CTR') out[c.name] = m.clickThroughRate;
      else if (row.metric === 'Conversion') out[c.name] = m.conversionRate;
      else if (row.metric === 'Delivery') out[c.name] = m.deliveryRate;
    });
    return out;
  });

  const rawBarData = ['Sent', 'Delivered', 'Opened', 'Clicked', 'Conversions'].map(label => {
    const out: Record<string, string | number> = { name: label };
    chosenCampaigns.forEach(c => {
      if (label === 'Sent') out[c.name] = c.emailsSent;
      else if (label === 'Delivered') out[c.name] = c.emailsDelivered;
      else if (label === 'Opened') out[c.name] = c.emailsOpened;
      else if (label === 'Clicked') out[c.name] = c.emailsClicked;
      else if (label === 'Conversions') out[c.name] = c.conversions;
    });
    return out;
  });

  if (campaigns.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="No campaigns to compare"
          description="Add at least two campaigns to use the comparison tool."
          action={<Link href="/campaigns/new"><Button><Plus className="w-4 h-4" /> Add Campaign</Button></Link>}
        />
      </div>
    );
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      <p className="text-sm text-gray-500 dark:text-gray-400">Select 2–5 campaigns to compare side by side.</p>

      {/* Campaign selector */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Select Campaigns <span className="text-gray-400 font-normal">({selected.length} selected)</span>
        </h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {campaigns.map((c) => {
            const isSelected = selected.includes(c.id);
            const colorIdx = selected.indexOf(c.id);
            return (
              <button
                key={c.id}
                onClick={() => toggleSelect(c.id)}
                className={`flex items-center gap-3 p-3 rounded-lg border-2 text-left transition-all ${
                  isSelected
                    ? 'border-indigo-500 bg-indigo-50 dark:bg-indigo-900/20'
                    : 'border-gray-200 dark:border-gray-700 hover:border-gray-300 dark:hover:border-gray-600'
                }`}
              >
                <div
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: isSelected ? COLORS[colorIdx] : '#d1d5db' }}
                />
                <div className="min-w-0">
                  <p className="text-sm font-medium text-gray-900 dark:text-white truncate">{c.name}</p>
                  <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(c.date)}</p>
                </div>
              </button>
            );
          })}
        </div>
      </Card>

      {chosenCampaigns.length < 2 ? (
        <Card className="p-10">
          <EmptyState
            title="Select at least 2 campaigns"
            description="Choose campaigns above to start comparing performance."
          />
        </Card>
      ) : (
        <>
          {/* Summary table */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Comparison Table</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                    <th className="pb-2 pr-4 font-medium">Metric</th>
                    {chosenCampaigns.map((c, i) => (
                      <th key={c.id} className="pb-2 px-3 font-medium">
                        <span style={{ color: COLORS[i] }}>{c.name}</span>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                  {[
                    { label: 'Emails Sent', fn: (c: typeof campaigns[0]) => formatNumber(c.emailsSent) },
                    { label: 'Delivered', fn: (c: typeof campaigns[0]) => formatNumber(c.emailsDelivered) },
                    { label: 'Opened', fn: (c: typeof campaigns[0]) => formatNumber(c.emailsOpened) },
                    { label: 'Clicked', fn: (c: typeof campaigns[0]) => formatNumber(c.emailsClicked) },
                    { label: 'Conversions', fn: (c: typeof campaigns[0]) => formatNumber(c.conversions) },
                    { label: 'Open Rate', fn: (c: typeof campaigns[0]) => `${calculateMetrics(c).openRate}%` },
                    { label: 'CTR', fn: (c: typeof campaigns[0]) => `${calculateMetrics(c).clickThroughRate}%` },
                    { label: 'Conversion Rate', fn: (c: typeof campaigns[0]) => `${calculateMetrics(c).conversionRate}%` },
                    { label: 'Bounce Rate', fn: (c: typeof campaigns[0]) => `${calculateMetrics(c).bounceRate}%` },
                    { label: 'Delivery Rate', fn: (c: typeof campaigns[0]) => `${calculateMetrics(c).deliveryRate}%` },
                  ].map(row => (
                    <tr key={row.label} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                      <td className="py-2.5 pr-4 font-medium text-gray-700 dark:text-gray-300">{row.label}</td>
                      {chosenCampaigns.map(c => {
                        const vals = chosenCampaigns.map(x => {
                          const raw = row.fn(x);
                          return parseFloat(raw.replace(/[^0-9.]/g, ''));
                        });
                        const rawVal = parseFloat(row.fn(c).replace(/[^0-9.]/g, ''));
                        const isBest = rawVal === Math.max(...vals);
                        return (
                          <td key={c.id} className={`py-2.5 px-3 ${isBest ? 'font-bold text-indigo-600 dark:text-indigo-400' : 'text-gray-700 dark:text-gray-300'}`}>
                            {row.fn(c)}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="text-xs text-gray-400 dark:text-gray-500 mt-3">Best value per row is highlighted in indigo.</p>
          </Card>

          {/* Raw counts chart */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Raw Counts Comparison</h3>
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={rawBarData} margin={{ top: 4, right: 8, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} />
                <Tooltip formatter={(v: unknown) => formatNumber(Number(v))} />
                <Legend />
                {chosenCampaigns.map((c, i) => (
                  <Bar key={c.id} dataKey={c.name} fill={COLORS[i]} radius={[3, 3, 0, 0]} />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </Card>

          {/* Rates radar */}
          <Card className="p-5">
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Rate Comparison (Radar)</h3>
            <ResponsiveContainer width="100%" height={300}>
              <RadarChart data={radarData}>
                <PolarGrid />
                <PolarAngleAxis dataKey="metric" tick={{ fontSize: 12 }} />
                <Tooltip formatter={(v: unknown) => `${Number(v)}%`} />
                <Legend />
                {chosenCampaigns.map((c, i) => (
                  <Radar key={c.id} name={c.name} dataKey={c.name} stroke={COLORS[i]} fill={COLORS[i]} fillOpacity={0.2} />
                ))}
              </RadarChart>
            </ResponsiveContainer>
          </Card>
        </>
      )}
    </div>
  );
}
