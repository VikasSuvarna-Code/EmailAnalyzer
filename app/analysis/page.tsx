'use client';
import { useSearchParams } from 'next/navigation';
import { useState, Suspense } from 'react';
import { useApp } from '@/context/AppContext';
import { evaluateMetrics, formatNumber } from '@/lib/analytics';
import { formatDate, CAMPAIGN_TYPE_COLORS } from '@/lib/constants';
import { Card, Badge, Button, EmptyState, Select, Modal } from '@/components/ui';
import { MetricCard } from '@/components/analysis/MetricCard';
import { CampaignForm } from '@/components/campaigns/CampaignForm';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Pencil, CheckCircle, Circle } from 'lucide-react';
import Link from 'next/link';

function AnalysisContent() {
  const params = useSearchParams();
  const { state, updateCampaign, toggleComplete } = useApp();
  const [editOpen, setEditOpen] = useState(false);

  const campaigns = state.campaigns;
  const selectedId = params.get('id') ?? campaigns[0]?.id ?? '';
  const [localId, setLocalId] = useState(selectedId);

  const campaign = campaigns.find(c => c.id === localId) ?? campaigns[0];

  const campaignOptions = campaigns.map(c => ({ value: c.id, label: c.name }));

  if (campaigns.length === 0) {
    return (
      <div className="p-6">
        <EmptyState
          title="No campaigns to analyze"
          description="Add your first campaign to see detailed analytics."
          action={<Link href="/campaigns/new"><Button>Add Campaign</Button></Link>}
        />
      </div>
    );
  }

  if (!campaign) return null;

  const evaluations = evaluateMetrics(campaign);
  const strong = evaluations.filter(e => e.threshold === 'strong');
  const weak = evaluations.filter(e => e.threshold === 'weak');

  const engagementData = [
    { name: 'Sent', value: campaign.emailsSent, fill: '#6366f1' },
    { name: 'Delivered', value: campaign.emailsDelivered, fill: '#22c55e' },
    { name: 'Opened', value: campaign.emailsOpened, fill: '#3b82f6' },
    { name: 'Clicked', value: campaign.emailsClicked, fill: '#f59e0b' },
    { name: 'Conversions', value: campaign.conversions, fill: '#10b981' },
    { name: 'Bounced', value: campaign.emailsBounced, fill: '#ef4444' },
  ];

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-5xl mx-auto">
      {/* Campaign selector */}
      <div className="flex flex-col sm:flex-row sm:items-center gap-3">
        <div className="flex-1 max-w-xs">
          <Select
            value={localId}
            onChange={e => setLocalId(e.target.value)}
            options={campaignOptions}
          />
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => toggleComplete(campaign.id)}
            className="flex items-center gap-1.5 text-sm text-gray-500 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white"
          >
            {campaign.isCompleted
              ? <><CheckCircle className="w-4 h-4 text-green-500" /> Completed</>
              : <><Circle className="w-4 h-4" /> Mark complete</>}
          </button>
          <Button variant="outline" size="sm" onClick={() => setEditOpen(true)}>
            <Pencil className="w-4 h-4" /> Edit
          </Button>
        </div>
      </div>

      {/* Campaign header */}
      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">{campaign.name}</h2>
            <p className="text-sm text-gray-500 dark:text-gray-400 mt-1 italic">&quot;{campaign.subjectLine}&quot;</p>
            <div className="flex flex-wrap gap-2 mt-3">
              <Badge variant={(CAMPAIGN_TYPE_COLORS[campaign.type] as Parameters<typeof Badge>[0]['variant'])}>
                {campaign.type}
              </Badge>
              <Badge variant={campaign.isCompleted ? 'success' : 'info'}>
                {campaign.isCompleted ? 'Completed' : 'Active'}
              </Badge>
              <span className="text-xs text-gray-500 dark:text-gray-400">
                {campaign.audience} · {formatDate(campaign.date)}
              </span>
            </div>
            {campaign.notes && (
              <p className="text-sm text-gray-500 dark:text-gray-400 mt-2 bg-gray-50 dark:bg-gray-700/50 rounded-lg px-3 py-2">
                {campaign.notes}
              </p>
            )}
          </div>
        </div>

        {/* Raw numbers */}
        <div className="mt-5 grid grid-cols-3 sm:grid-cols-6 gap-3 pt-4 border-t border-gray-200 dark:border-gray-700">
          {[
            { label: 'Sent', value: campaign.emailsSent },
            { label: 'Delivered', value: campaign.emailsDelivered },
            { label: 'Opened', value: campaign.emailsOpened },
            { label: 'Clicked', value: campaign.emailsClicked },
            { label: 'Conversions', value: campaign.conversions },
            { label: 'Bounced', value: campaign.emailsBounced },
          ].map(({ label, value }) => (
            <div key={label} className="text-center">
              <p className="text-lg font-bold text-gray-900 dark:text-white">{formatNumber(value)}</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">{label}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* Metric cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {evaluations.map(m => <MetricCard key={m.label} metric={m} />)}
      </div>

      {/* Chart */}
      <Card className="p-5">
        <h3 className="text-sm font-semibold text-gray-700 dark:text-gray-300 mb-4">Engagement Funnel</h3>
        <ResponsiveContainer width="100%" height={200}>
          <BarChart data={engagementData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
            <XAxis dataKey="name" tick={{ fontSize: 11 }} />
            <YAxis tick={{ fontSize: 11 }} />
            <Tooltip formatter={(v: unknown) => formatNumber(Number(v))} />
            <Bar dataKey="value" radius={[4, 4, 0, 0]}>
              {engagementData.map((entry, i) => (
                <Cell key={i} fill={entry.fill} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Card>

      {/* Strong / Weak */}
      {(strong.length > 0 || weak.length > 0) && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {strong.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-green-700 dark:text-green-400 mb-3">✅ Strong Metrics</h3>
              <ul className="space-y-2">
                {strong.map(m => (
                  <li key={m.label} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">{m.label}</span>
                    <span className="font-semibold text-green-700 dark:text-green-400">{m.formatted}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
          {weak.length > 0 && (
            <Card className="p-5">
              <h3 className="text-sm font-semibold text-red-600 dark:text-red-400 mb-3">⚠️ Needs Attention</h3>
              <ul className="space-y-2">
                {weak.map(m => (
                  <li key={m.label} className="flex justify-between text-sm">
                    <span className="text-gray-600 dark:text-gray-300">{m.label}</span>
                    <span className="font-semibold text-red-600 dark:text-red-400">{m.formatted}</span>
                  </li>
                ))}
              </ul>
            </Card>
          )}
        </div>
      )}

      {/* Edit modal */}
      <Modal open={editOpen} onClose={() => setEditOpen(false)} title="Edit Campaign" size="xl">
        <CampaignForm
          initial={campaign}
          onSubmit={data => { updateCampaign({ ...campaign, ...data }); setEditOpen(false); }}
          onCancel={() => setEditOpen(false)}
          submitLabel="Update Campaign"
        />
      </Modal>
    </div>
  );
}

export default function AnalysisPage() {
  return (
    <Suspense fallback={<div className="p-6 text-gray-500">Loading analysis...</div>}>
      <AnalysisContent />
    </Suspense>
  );
}
