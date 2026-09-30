'use client';
import { useApp } from '@/context/AppContext';
import { aggregateStats, topPerformer, calculateMetrics, formatNumber } from '@/lib/analytics';
import { formatDate, CAMPAIGN_TYPE_COLORS } from '@/lib/constants';
import { StatCard, Card, Badge, Button, EmptyState } from '@/components/ui';
import {
  Mail, Users, Eye, MousePointer, TrendingUp, BarChart2,
  GitCompare, FileText, Bot, Plus, Trophy, Clock,
} from 'lucide-react';
import Link from 'next/link';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
} from 'recharts';

export default function DashboardPage() {
  const { state } = useApp();
  const { campaigns } = state;
  const stats = aggregateStats(campaigns);
  const top = topPerformer(campaigns);
  const recent = [...campaigns].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 5);

  const chartData = [...campaigns]
    .sort((a, b) => a.date.localeCompare(b.date))
    .slice(-7)
    .map(c => ({
      name: c.name.length > 14 ? c.name.slice(0, 14) + '…' : c.name,
      'Open Rate': calculateMetrics(c).openRate,
      'CTR': calculateMetrics(c).clickThroughRate,
    }));

  const today = new Date().toLocaleDateString('en-US', {
    weekday: 'long', year: 'numeric', month: 'long', day: 'numeric',
  });

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-7xl mx-auto">
      {/* Welcome */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">
            Welcome back, {state.profile.name || 'there'} 👋
          </h2>
          <p className="text-sm text-gray-500 dark:text-gray-400">{today}</p>
        </div>
        <Link href="/campaigns/new">
          <Button variant="primary" size="md">
            <Plus className="w-4 h-4" /> Add Campaign
          </Button>
        </Link>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
        <StatCard label="Total Campaigns" value={stats.totalCampaigns} icon={<Mail className="w-5 h-5" />} />
        <StatCard label="Emails Sent" value={formatNumber(stats.totalSent)} icon={<Users className="w-5 h-5" />} />
        <StatCard label="Total Opens" value={formatNumber(stats.totalOpened)} icon={<Eye className="w-5 h-5" />} />
        <StatCard label="Total Clicks" value={formatNumber(stats.totalClicked)} icon={<MousePointer className="w-5 h-5" />} />
        <StatCard label="Avg Open Rate" value={`${stats.avgOpenRate}%`} icon={<TrendingUp className="w-5 h-5" />} />
        <StatCard label="Avg CTR" value={`${stats.avgCTR}%`} icon={<BarChart2 className="w-5 h-5" />} />
        <StatCard label="Total Conversions" value={formatNumber(stats.totalConversions)} icon={<Trophy className="w-5 h-5" />} />
        <StatCard label="Avg Conversion" value={`${stats.avgConversionRate}%`} icon={<TrendingUp className="w-5 h-5" />} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Chart */}
        <Card className="p-5 lg:col-span-2">
          <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Open Rate & CTR — Recent Campaigns</h3>
          {chartData.length === 0 ? (
            <EmptyState title="No chart data" description="Add campaigns to see performance trends." />
          ) : (
            <ResponsiveContainer width="100%" height={220}>
              <BarChart data={chartData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" className="dark:stroke-gray-700" />
                <XAxis dataKey="name" tick={{ fontSize: 11 }} />
                <YAxis tick={{ fontSize: 11 }} unit="%" />
                <Tooltip formatter={(v: unknown) => `${Number(v)}%`} />
                <Bar dataKey="Open Rate" fill="#6366f1" radius={[4, 4, 0, 0]} />
                <Bar dataKey="CTR" fill="#a5b4fc" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Top performer */}
        <Card className="p-5">
          <div className="flex items-center gap-2 mb-4">
            <Trophy className="w-4 h-4 text-yellow-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Top Performer</h3>
          </div>
          {top ? (
            <div className="space-y-3">
              <div>
                <p className="font-semibold text-gray-900 dark:text-white">{top.name}</p>
                <Badge variant={(CAMPAIGN_TYPE_COLORS[top.type] as Parameters<typeof Badge>[0]['variant'])} className="mt-1">
                  {top.type}
                </Badge>
              </div>
              <div className="space-y-2 text-sm">
                {[
                  { label: 'Open Rate', value: `${calculateMetrics(top).openRate}%` },
                  { label: 'CTR', value: `${calculateMetrics(top).clickThroughRate}%` },
                  { label: 'Conversions', value: formatNumber(top.conversions) },
                  { label: 'Sent', value: formatNumber(top.emailsSent) },
                ].map(row => (
                  <div key={row.label} className="flex justify-between">
                    <span className="text-gray-500 dark:text-gray-400">{row.label}</span>
                    <span className="font-medium text-gray-900 dark:text-white">{row.value}</span>
                  </div>
                ))}
              </div>
              <Link href={`/analysis?id=${top.id}`}>
                <Button variant="outline" size="sm" className="w-full">View Analysis</Button>
              </Link>
            </div>
          ) : (
            <EmptyState title="No campaigns yet" description="Add your first campaign." />
          )}
        </Card>
      </div>

      {/* Recent Campaigns */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-gray-500" />
            <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300">Recent Campaigns</h3>
          </div>
          <Link href="/campaigns" className="text-xs text-indigo-600 dark:text-indigo-400 hover:underline">View all</Link>
        </div>
        {recent.length === 0 ? (
          <EmptyState
            title="No campaigns yet"
            description="Add your first campaign to start analyzing performance."
            action={
              <Link href="/campaigns/new">
                <Button variant="primary" size="sm"><Plus className="w-4 h-4" /> Add Campaign</Button>
              </Link>
            }
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700">
                  <th className="pb-2 font-medium">Campaign</th>
                  <th className="pb-2 font-medium hidden sm:table-cell">Type</th>
                  <th className="pb-2 font-medium text-right">Open Rate</th>
                  <th className="pb-2 font-medium text-right hidden md:table-cell">CTR</th>
                  <th className="pb-2 font-medium text-right hidden lg:table-cell">Date</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {recent.map(c => {
                  const m = calculateMetrics(c);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors">
                      <td className="py-3 pr-4">
                        <div className="font-medium text-gray-900 dark:text-white truncate max-w-[160px]">{c.name}</div>
                        <div className="text-xs text-gray-500">{c.audience}</div>
                      </td>
                      <td className="py-3 hidden sm:table-cell">
                        <Badge variant={(CAMPAIGN_TYPE_COLORS[c.type] as Parameters<typeof Badge>[0]['variant'])}>{c.type}</Badge>
                      </td>
                      <td className="py-3 text-right font-medium text-gray-900 dark:text-white">{m.openRate}%</td>
                      <td className="py-3 text-right hidden md:table-cell text-gray-700 dark:text-gray-300">{m.clickThroughRate}%</td>
                      <td className="py-3 text-right hidden lg:table-cell text-gray-500 dark:text-gray-400 text-xs">{formatDate(c.date)}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Quick Actions */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Quick Actions</h3>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { href: '/campaigns/new', icon: Plus, label: 'Add Campaign', color: 'text-indigo-600 dark:text-indigo-400 bg-indigo-50 dark:bg-indigo-900/30' },
            { href: '/analysis', icon: BarChart2, label: 'Analyze', color: 'text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/30' },
            { href: '/compare', icon: GitCompare, label: 'Compare', color: 'text-purple-600 dark:text-purple-400 bg-purple-50 dark:bg-purple-900/30' },
            { href: '/reports', icon: FileText, label: 'Reports', color: 'text-green-600 dark:text-green-400 bg-green-50 dark:bg-green-900/30' },
            { href: '/assistant', icon: Bot, label: 'AI Assistant', color: 'text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/30' },
          ].map(({ href, icon: Icon, label, color }) => (
            <Link key={href} href={href}>
              <div className={`flex flex-col items-center gap-2 p-4 rounded-xl ${color} hover:opacity-80 transition-opacity cursor-pointer text-center`}>
                <Icon className="w-6 h-6" />
                <span className="text-xs font-medium">{label}</span>
              </div>
            </Link>
          ))}
        </div>
      </Card>
    </div>
  );
}
