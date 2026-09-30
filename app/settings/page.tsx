'use client';
import { useState } from 'react';
import { useApp } from '@/context/AppContext';
import { Card, Input, Select, Button } from '@/components/ui';
import { CAMPAIGN_TYPES } from '@/lib/constants';
import { CampaignType } from '@/types';
import { Sun, Moon, User, Settings, Database, Trash2 } from 'lucide-react';

export default function SettingsPage() {
  const { state, updateProfile, updateSettings } = useApp();
  const [profile, setProfile] = useState(state.profile);
  const [saved, setSaved] = useState(false);

  function handleSave(e: React.FormEvent) {
    e.preventDefault();
    updateProfile(profile);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  }

  const typeOptions = CAMPAIGN_TYPES.map(t => ({ value: t, label: t }));
  const isDark = state.settings.theme === 'dark';

  function clearData() {
    if (confirm('This will delete all campaigns and reset the app. Are you sure?')) {
      localStorage.clear();
      window.location.reload();
    }
  }

  return (
    <div className="p-4 lg:p-6 space-y-6 max-w-2xl mx-auto">
      {/* Profile */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <User className="w-4 h-4" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Profile</h2>
        </div>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="flex items-center gap-4 mb-5">
            <div className="w-16 h-16 rounded-full bg-indigo-600 flex items-center justify-center text-white text-2xl font-bold">
              {profile.name ? profile.name.charAt(0).toUpperCase() : '?'}
            </div>
            <div>
              <p className="font-medium text-gray-900 dark:text-white">{profile.name || 'Your Name'}</p>
              <p className="text-sm text-gray-500 dark:text-gray-400">{profile.email || 'your@email.com'}</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Input
              label="Name"
              value={profile.name}
              onChange={e => setProfile(p => ({ ...p, name: e.target.value }))}
              placeholder="Alex Johnson"
            />
            <Input
              label="Email"
              type="email"
              value={profile.email}
              onChange={e => setProfile(p => ({ ...p, email: e.target.value }))}
              placeholder="alex@company.com"
            />
            <Input
              label="Default Audience"
              value={profile.defaultAudience}
              onChange={e => setProfile(p => ({ ...p, defaultAudience: e.target.value }))}
              placeholder="All Subscribers"
            />
            <Select
              label="Preferred Campaign Type"
              value={profile.preferredCampaignType}
              onChange={e => setProfile(p => ({ ...p, preferredCampaignType: e.target.value as CampaignType }))}
              options={typeOptions}
            />
          </div>
          <div className="flex items-center gap-3 pt-2">
            <Button type="submit" variant="primary">Save Profile</Button>
            {saved && <span className="text-sm text-green-600 dark:text-green-400">✓ Saved!</span>}
          </div>
        </form>
      </Card>

      {/* Appearance */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-indigo-100 dark:bg-indigo-900/30 flex items-center justify-center text-indigo-600 dark:text-indigo-400">
            <Settings className="w-4 h-4" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Appearance</h2>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Color Theme</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">Choose between light and dark mode</p>
          </div>
          <div className="flex rounded-lg border border-gray-300 dark:border-gray-600 overflow-hidden">
            <button
              onClick={() => updateSettings({ theme: 'light' })}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                !isDark
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Sun className="w-4 h-4" /> Light
            </button>
            <button
              onClick={() => updateSettings({ theme: 'dark' })}
              className={`flex items-center gap-2 px-4 py-2 text-sm font-medium transition-colors ${
                isDark
                  ? 'bg-indigo-600 text-white'
                  : 'bg-white dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700'
              }`}
            >
              <Moon className="w-4 h-4" /> Dark
            </button>
          </div>
        </div>
      </Card>

      {/* Data */}
      <Card className="p-6">
        <div className="flex items-center gap-3 mb-5">
          <div className="w-8 h-8 rounded-lg bg-gray-100 dark:bg-gray-700 flex items-center justify-center text-gray-600 dark:text-gray-400">
            <Database className="w-4 h-4" />
          </div>
          <h2 className="text-base font-semibold text-gray-900 dark:text-white">Data Management</h2>
        </div>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-4">
          All campaign data is stored locally in your browser&rsquo;s localStorage. No data is sent to any server.
        </p>
        <div className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 rounded-lg p-4">
          <div>
            <p className="text-sm font-medium text-gray-700 dark:text-gray-300">Total Campaigns</p>
            <p className="text-xs text-gray-500 dark:text-gray-400">{state.campaigns.length} campaigns stored</p>
          </div>
        </div>
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-4">
          <p className="text-sm font-medium text-red-600 dark:text-red-400 mb-2">Danger Zone</p>
          <Button variant="danger" size="sm" onClick={clearData}>
            <Trash2 className="w-4 h-4" /> Clear All Data & Reset
          </Button>
          <p className="text-xs text-gray-400 dark:text-gray-500 mt-2">This will delete all campaigns and restore the demo data on next reload.</p>
        </div>
      </Card>

      {/* About */}
      <Card className="p-6">
        <h2 className="text-base font-semibold text-gray-900 dark:text-white mb-3">About</h2>
        <div className="space-y-2 text-sm text-gray-500 dark:text-gray-400">
          <p><span className="font-medium text-gray-700 dark:text-gray-300">Application:</span> Email Campaign Analyzer</p>
          <p><span className="font-medium text-gray-700 dark:text-gray-300">Version:</span> 1.0.0</p>
          <p><span className="font-medium text-gray-700 dark:text-gray-300">Built with:</span> Next.js · TypeScript · Tailwind CSS · Recharts</p>
          <p><span className="font-medium text-gray-700 dark:text-gray-300">Workshop:</span> IBM Bob Workshop</p>
        </div>
      </Card>
    </div>
  );
}
