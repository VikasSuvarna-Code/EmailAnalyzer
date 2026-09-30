'use client';
import { useApp } from '@/context/AppContext';
import { calculateMetrics, aggregateStats, formatNumber } from '@/lib/analytics';
import { formatDate, CAMPAIGN_TYPE_COLORS } from '@/lib/constants';
import { Card, StatCard, Badge, Button, EmptyState } from '@/components/ui';
import {
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend,
  BarChart, Bar,
} from 'recharts';
import { TrendingUp, Mail, Eye, MousePointer, Trophy, Download, Plus } from 'lucide-react';
import Link from 'next/link';

function exportCSV(data: object[], filename: string) {
  if (data.length === 0) return;
  const headers = Object.keys(data[0]);
  const rows = data.map(row => headers.map(h => JSON.stringify((row as Record<string, unknown>)[h] ?? '')).join(','));
  const csv = [headers.join(','), ...rows].join('\n');
  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function ReportsPage() {
  const { state } = useApp();
  const campaigns = state.campaigns;
  const stats = aggregateStats(campaigns);

  if (campaigns.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="No report data yet"
          description="There is not enough campaign data to generate a report yet. Add campaigns to start seeing trends."
          action={<Link href="/campaigns/new"><Button><Plus className="w-4 h-4" /> Add Campaign</Button></Link>}
        />
      </div>
    );
  }

  const sorted = [...campaigns].sort((a, b) => a.date.localeCompare(b.date));

  const trendData = sorted.map(c => {
    const m = calculateMetrics(c);
    return {
      name: c.name.length > 12 ? c.name.slice(0, 12) + '…' : c.name,
      date: c.date,
      'Open Rate': m.openRate,
      CTR: m.clickThroughRate,
      'Conv. Rate': m.conversionRate,
    };
  });

  const topByConversion = [...campaigns]
    .sort((a, b) => calculateMetrics(b).conversionRate - calculateMetrics(a).conversionRate)
    .slice(0, 5)
    .map(c => ({
      name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
      'Conversion Rate': calculateMetrics(c).conversionRate,
    }));

  const topByOpenRate = [...campaigns]
    .sort((a, b) => calculateMetrics(b).openRate - calculateMetrics(a).openRate)
    .slice(0, 5)
    .map(c => ({
      name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
      'Open Rate': calculateMetrics(c).openRate,
    }));

  const recent = [...campaigns].sort((a, b) => b.updatedAt.localeCompare(a.updatedAt)).slice(0, 6);

  const exportData = campaigns.map(c => {
    const m = calculateMetrics(c);
    return {
      Name: c.name,
      'Subject Line': c.subjectLine,
      Type: c.type,
      Audience: c.audience,
      Date: c.date,
      'Emails Sent': c.emailsSent,
      Delivered: c.emailsDelivered,
      Opened: c.emailsOpened,
      Clicked: c.emailsClicked,
      Conversions: c.conversions,
      Bounced: c.emailsBounced,
      'Delivery Rate %': m.deliveryRate,
      'Open Rate %': m.openRate,
      'CTR %': m.clickThroughRate,
      'Conversion Rate %': m.conversionRate,
      'Bounce Rate %': m.bounceRate,
      Status: c.isCompleted ? 'Completed' : 'Active',
    };
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-6xl mx-auto">
      {/* Export */}
      <div className="flex justify-end">
        <Button variant="outline" size="sm" onClick={() => exportCSV(exportData, 'campaign-report.csv')}>
          <Download className="w-4 h-4" /> Export CSV
        </Button>
      </div>

      {/* Aggregate KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard label="Total Campaigns" value={stats.totalCampaigns} icon={<Mail className="w-5 h-5" />} />
        <StatCard label="Avg Open Rate" value={`${stats.avgOpenRate}%`} icon={<Eye className="w-5 h-5" />} />
        <StatCard label="Avg CTR" value={`${stats.avgCTR}%`} icon={<MousePointer className="w-5 h-5" />} />
        <StatCard label="Avg Conversion" value={`${stats.avgConversionRate}%`} icon={<TrendingUp className="w-5 h-5" />} />
      </div>

      {/* Trend chart */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Performance Trends Over Time</h3>
        <ResponsiveContainer width="100%" height={240}>
          <LineChart data={trendData} margin={{ top: 4, right: 16, left: -20, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" tick={{ fontSize: 10 }} />
            <YAxis tick={{ fontSize: 10 }} unit="%" />
            <Tooltip formatter={(v: unknown) => `${Number(v)}%`} />
            <Legend />
            <Line type="monotone" dataKey="Open Rate" stroke="#6366f1" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="CTR" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} />
            <Line type="monotone" dataKey="Conv. Rate" stroke="#22c55e" strokeWidth={2} dot={{ r: 3 }} />
          </LineChart>
        </ResponsiveContainer>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top by conversion */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top 5 by Conversion Rate</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topByConversion} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
              <Tooltip formatter={(v: unknown) => `${Number(v)}%`} />
              <Bar dataKey="Conversion Rate" fill="#22c55e" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>

        {/* Top by open rate */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Eye className="w-4 h-4 text-indigo-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top 5 by Open Rate</h3>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={topByOpenRate} margin={{ top: 4, right: 8, left: -20, bottom: 0 }} layout="vertical">
              <XAxis type="number" tick={{ fontSize: 10 }} unit="%" />
              <YAxis type="category" dataKey="name" tick={{ fontSize: 10 }} width={100} />
              <Tooltip formatter={(v: unknown) => `${Number(v)}%`} />
              <Bar dataKey="Open Rate" fill="#6366f1" radius={[0, 4, 4, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </Card>
      </div>

      {/* Recent activity */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Recent Activity</h3>
        <div className="space-y-3">
          {recent.map(c => {
            const m = calculateMetrics(c);
            return (
              <div key={c.id} className="flex items-center justify-between py-2 border-b border-gray-100 dark:border-gray-700/50 last:border-0">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-indigo-500" />
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">{c.name}</p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">{formatDate(c.date)} · {c.audience}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-xs text-right">
                  <Badge variant={(CAMPAIGN_TYPE_COLORS[c.type] as Parameters<typeof Badge>[0]['variant'])} className="hidden sm:flex">{c.type}</Badge>
                  <div>
                    <div className="font-semibold text-gray-900 dark:text-white">{m.openRate}%</div>
                    <div className="text-gray-400">open rate</div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Full stats table */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">All Campaign Statistics</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 text-left">
                <th className="pb-2 pr-3 font-medium">Campaign</th>
                <th className="pb-2 px-3 font-medium text-right">Sent</th>
                <th className="pb-2 px-3 font-medium text-right">Open %</th>
                <th className="pb-2 px-3 font-medium text-right">CTR %</th>
                <th className="pb-2 px-3 font-medium text-right">Conv %</th>
                <th className="pb-2 px-3 font-medium text-right hidden md:table-cell">Bounce %</th>
                <th className="pb-2 pl-3 font-medium">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {sorted.map(c => {
                const m = calculateMetrics(c);
                return (
                  <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-800/30">
                    <td className="py-2.5 pr-3">
                      <div className="font-medium text-gray-900 dark:text-white">{c.name}</div>
                      <div className="text-xs text-gray-400">{formatDate(c.date)}</div>
                    </td>
                    <td className="py-2.5 px-3 text-right text-gray-700 dark:text-gray-300">{formatNumber(c.emailsSent)}</td>
                    <td className="py-2.5 px-3 text-right font-medium text-gray-900 dark:text-white">{m.openRate}%</td>
                    <td className="py-2.5 px-3 text-right text-gray-700 dark:text-gray-300">{m.clickThroughRate}%</td>
                    <td className="py-2.5 px-3 text-right text-gray-700 dark:text-gray-300">{m.conversionRate}%</td>
                    <td className="py-2.5 px-3 text-right hidden md:table-cell text-gray-700 dark:text-gray-300">{m.bounceRate}%</td>
                    <td className="py-2.5 pl-3">
                      <Badge variant={c.isCompleted ? 'success' : 'info'}>{c.isCompleted ? 'Completed' : 'Active'}</Badge>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
