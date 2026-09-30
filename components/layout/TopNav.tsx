'use client';
import { useApp } from '@/context/AppContext';
import { Sun, Moon, Menu, Bell } from 'lucide-react';
import { usePathname } from 'next/navigation';

const PAGE_TITLES: Record<string, string> = {
  '/': 'Dashboard',
  '/campaigns': 'Campaigns',
  '/campaigns/new': 'Add Campaign',
  '/analysis': 'Campaign Analysis',
  '/compare': 'Compare Campaigns',
  '/reports': 'Reports',
  '/assistant': 'AI Assistant',
  '/settings': 'Settings',
};

interface TopNavProps {
  onMenuClick: () => void;
}

export function TopNav({ onMenuClick }: TopNavProps) {
  const { state, updateSettings } = useApp();
  const pathname = usePathname();

  const title = Object.entries(PAGE_TITLES).find(([key]) =>
    key === pathname || (key !== '/' && pathname.startsWith(key))
  )?.[1] ?? 'Email Campaign Analyzer';

  const isDark = state.settings.theme === 'dark';

  const toggleTheme = () => {
    updateSettings({ theme: isDark ? 'light' : 'dark' });
  };

  return (
    <header className="sticky top-0 z-10 bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 px-4 lg:px-6 py-3 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 rounded-lg text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Open menu"
        >
          <Menu className="w-5 h-5" />
        </button>
        <h1 className="text-lg font-semibold text-gray-900 dark:text-white">{title}</h1>
      </div>
      <div className="flex items-center gap-2">
        <span className="hidden sm:block text-xs text-gray-400 dark:text-gray-500">
          {new Date().toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })}
        </span>
        <button
          onClick={toggleTheme}
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Toggle theme"
        >
          {isDark ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
        </button>
        <button
          className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
          aria-label="Notifications"
        >
          <Bell className="w-4 h-4" />
        </button>
        {state.profile.name && (
          <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-semibold ml-1">
            {state.profile.name.charAt(0).toUpperCase()}
          </div>
        )}
      </div>
    </header>
  );
}
