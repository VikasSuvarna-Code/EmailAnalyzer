'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Campaign } from '@/types';
import { calculateMetrics, formatNumber } from '@/lib/analytics';
import { formatDate, CAMPAIGN_TYPES, CAMPAIGN_TYPE_COLORS } from '@/lib/constants';
import { Card, Badge, Button, Select, EmptyState, Modal } from '@/components/ui';
import { CampaignForm } from '@/components/campaigns/CampaignForm';
import { Plus, Search, Pencil, Trash2, BarChart2, CheckCircle, Circle, SlidersHorizontal } from 'lucide-react';
import Link from 'next/link';

type SortKey = 'date' | 'name' | 'openRate' | 'ctr' | 'conversions';
type SortDir = 'asc' | 'desc';

const STATUS_OPTIONS = [
  { value: '', label: 'All Statuses' },
  { value: 'active', label: 'Active' },
  { value: 'completed', label: 'Completed' },
];

const TYPE_OPTIONS = [
  { value: '', label: 'All Types' },
  ...CAMPAIGN_TYPES.map(t => ({ value: t, label: t })),
];

const SORT_OPTIONS = [
  { value: 'date', label: 'Date' },
  { value: 'name', label: 'Name' },
  { value: 'openRate', label: 'Open Rate' },
  { value: 'ctr', label: 'CTR' },
  { value: 'conversions', label: 'Conversions' },
];

export default function CampaignsPage() {
  const { state, addCampaign, updateCampaign, deleteCampaign, toggleComplete } = useApp();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [sortKey, setSortKey] = useState<SortKey>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [addOpen, setAddOpen] = useState(false);
  const [editCampaign, setEditCampaign] = useState<Campaign | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const filtered = state.campaigns
    .filter(c => {
      const q = search.toLowerCase();
      if (q && !c.name.toLowerCase().includes(q) && !c.subjectLine.toLowerCase().includes(q) && !c.audience.toLowerCase().includes(q)) return false;
      if (filterType && c.type !== filterType) return false;
      if (filterStatus === 'active' && c.isCompleted) return false;
      if (filterStatus === 'completed' && !c.isCompleted) return false;
      return true;
    })
    .sort((a, b) => {
      let av: number | string = 0, bv: number | string = 0;
      if (sortKey === 'date') { av = a.date; bv = b.date; }
      else if (sortKey === 'name') { av = a.name.toLowerCase(); bv = b.name.toLowerCase(); }
      else if (sortKey === 'openRate') { av = calculateMetrics(a).openRate; bv = calculateMetrics(b).openRate; }
      else if (sortKey === 'ctr') { av = calculateMetrics(a).clickThroughRate; bv = calculateMetrics(b).clickThroughRate; }
      else if (sortKey === 'conversions') { av = a.conversions; bv = b.conversions; }
      if (av < bv) return sortDir === 'asc' ? -1 : 1;
      if (av > bv) return sortDir === 'asc' ? 1 : -1;
      return 0;
    });

  function handleSort(key: SortKey) {
    if (key === sortKey) setSortDir(d => d === 'asc' ? 'desc' : 'asc');
    else { setSortKey(key); setSortDir('desc'); }
  }

  const sortIndicator = (key: SortKey) => sortKey === key ? (sortDir === 'asc' ? ' ↑' : ' ↓') : '';

  return (
    <div className="p-4 lg:p-6 space-y-5 max-w-7xl mx-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{state.campaigns.length} campaign{state.campaigns.length !== 1 ? 's' : ''} total</p>
        </div>
        <Button onClick={() => setAddOpen(true)}>
          <Plus className="w-4 h-4" /> Add Campaign
        </Button>
      </div>

      {/* Filters */}
      <Card className="p-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-[180px]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                placeholder="Search campaigns..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="w-full pl-9 pr-3 py-2 text-sm rounded-lg border border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-700 text-gray-900 dark:text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>
          </div>
          <div className="w-40">
            <Select
              value={filterType}
              onChange={e => setFilterType(e.target.value)}
              options={TYPE_OPTIONS}
            />
          </div>
          <div className="w-40">
            <Select
              value={filterStatus}
              onChange={e => setFilterStatus(e.target.value)}
              options={STATUS_OPTIONS}
            />
          </div>
          <div className="w-40">
            <Select
              value={sortKey}
              onChange={e => handleSort(e.target.value as SortKey)}
              options={SORT_OPTIONS}
            />
          </div>
          {(search || filterType || filterStatus) && (
            <Button variant="ghost" size="sm" onClick={() => { setSearch(''); setFilterType(''); setFilterStatus(''); }}>
              Clear filters
            </Button>
          )}
        </div>
      </Card>

      {/* Table */}
      <Card>
        {filtered.length === 0 ? (
          <EmptyState
            title={search || filterType || filterStatus ? 'No campaigns match your search.' : 'No campaigns yet.'}
            description={search || filterType || filterStatus ? 'Try adjusting your filters.' : 'Add your first campaign to start analyzing performance.'}
            action={
              !search && !filterType && !filterStatus ? (
                <Button onClick={() => setAddOpen(true)}><Plus className="w-4 h-4" /> Add Campaign</Button>
              ) : undefined
            }
            icon={<SlidersHorizontal className="w-12 h-12" />}
          />
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="text-left text-xs text-gray-500 dark:text-gray-400 border-b border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50">
                  <th className="px-4 py-3 font-medium cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('name')}>
                    Campaign{sortIndicator('name')}
                  </th>
                  <th className="px-4 py-3 font-medium hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell">Audience</th>
                  <th className="px-4 py-3 font-medium text-right cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('openRate')}>
                    Open{sortIndicator('openRate')}
                  </th>
                  <th className="px-4 py-3 font-medium text-right cursor-pointer hidden sm:table-cell hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('ctr')}>
                    CTR{sortIndicator('ctr')}
                  </th>
                  <th className="px-4 py-3 font-medium text-right cursor-pointer hidden md:table-cell hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('conversions')}>
                    Conv.{sortIndicator('conversions')}
                  </th>
                  <th className="px-4 py-3 font-medium hidden lg:table-cell cursor-pointer hover:text-gray-900 dark:hover:text-white" onClick={() => handleSort('date')}>
                    Date{sortIndicator('date')}
                  </th>
                  <th className="px-4 py-3 font-medium">Status</th>
                  <th className="px-4 py-3 font-medium text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 dark:divide-gray-700/50">
                {filtered.map(c => {
                  const m = calculateMetrics(c);
                  return (
                    <tr key={c.id} className="hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors group">
                      <td className="px-4 py-3">
                        <div className="font-medium text-gray-900 dark:text-white max-w-[200px] truncate">{c.name}</div>
                        <div className="text-xs text-gray-500 dark:text-gray-400 truncate max-w-[200px]">{c.subjectLine}</div>
                      </td>
                      <td className="px-4 py-3 hidden md:table-cell">
                        <Badge variant={(CAMPAIGN_TYPE_COLORS[c.type] as Parameters<typeof Badge>[0]['variant'])}>{c.type}</Badge>
                      </td>
                      <td className="px-4 py-3 hidden lg:table-cell text-gray-600 dark:text-gray-400 text-xs">{c.audience}</td>
                      <td className="px-4 py-3 text-right font-semibold text-gray-900 dark:text-white">{m.openRate}%</td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell text-gray-700 dark:text-gray-300">{m.clickThroughRate}%</td>
                      <td className="px-4 py-3 text-right hidden md:table-cell text-gray-700 dark:text-gray-300">{formatNumber(c.conversions)}</td>
                      <td className="px-4 py-3 hidden lg:table-cell text-xs text-gray-500 dark:text-gray-400">{formatDate(c.date)}</td>
                      <td className="px-4 py-3">
                        <button onClick={() => toggleComplete(c.id)} title={c.isCompleted ? 'Mark active' : 'Mark completed'}>
                          {c.isCompleted
                            ? <CheckCircle className="w-4 h-4 text-green-500" />
                            : <Circle className="w-4 h-4 text-gray-400 hover:text-green-500 transition-colors" />
                          }
                        </button>
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <Link href={`/analysis?id=${c.id}`}>
                            <button className="p-1.5 rounded hover:bg-indigo-50 dark:hover:bg-indigo-900/30 text-indigo-600 dark:text-indigo-400 transition-colors" title="Analyze">
                              <BarChart2 className="w-4 h-4" />
                            </button>
                          </Link>
                          <button
                            onClick={() => setEditCampaign(c)}
                            className="p-1.5 rounded hover:bg-gray-100 dark:hover:bg-gray-700 text-gray-500 dark:text-gray-400 transition-colors"
                            title="Edit"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button
                            onClick={() => setDeletingId(c.id)}
                            className="p-1.5 rounded hover:bg-red-50 dark:hover:bg-red-900/30 text-red-500 transition-colors"
                            title="Delete"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {/* Add Modal */}
      <Modal open={addOpen} onClose={() => setAddOpen(false)} title="Add Campaign" size="xl">
        <CampaignForm
          onSubmit={data => { addCampaign(data); setAddOpen(false); }}
          onCancel={() => setAddOpen(false)}
        />
      </Modal>

      {/* Edit Modal */}
      <Modal open={!!editCampaign} onClose={() => setEditCampaign(null)} title="Edit Campaign" size="xl">
        {editCampaign && (
          <CampaignForm
            initial={editCampaign}
            onSubmit={data => {
              updateCampaign({ ...editCampaign, ...data });
              setEditCampaign(null);
            }}
            onCancel={() => setEditCampaign(null)}
            submitLabel="Update Campaign"
          />
        )}
      </Modal>

      {/* Delete Confirm */}
      <Modal open={!!deletingId} onClose={() => setDeletingId(null)} title="Delete Campaign" size="sm">
        <p className="text-sm text-gray-600 dark:text-gray-300 mb-6">
          Are you sure you want to delete this campaign? This action cannot be undone.
        </p>
        <div className="flex gap-3 justify-end">
          <Button variant="secondary" onClick={() => setDeletingId(null)}>Cancel</Button>
          <Button variant="danger" onClick={() => { if (deletingId) { deleteCampaign(deletingId); setDeletingId(null); } }}>
            <Trash2 className="w-4 h-4" /> Delete
          </Button>
        </div>
      </Modal>
    </div>
  );
}
