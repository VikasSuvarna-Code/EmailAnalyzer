'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
  LayoutDashboard,
  Mail,
  BarChart2,
  GitCompare,
  Bot,
  Settings,
  TrendingUp,
} from 'lucide-react';

const NAV_ITEMS = [
  { href: '/', label: 'Dashboard', icon: LayoutDashboard },
  { href: '/campaigns', label: 'Campaigns', icon: Mail },
  { href: '/analysis', label: 'Analysis', icon: BarChart2 },
  { href: '/compare', label: 'Compare', icon: GitCompare },
  { href: '/reports', label: 'Reports', icon: TrendingUp },
  { href: '/assistant', label: 'AI Assistant', icon: Bot },
  { href: '/settings', label: 'Settings', icon: Settings },
];

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export function Sidebar({ open, onClose }: SidebarProps) {
  const pathname = usePathname();

  return (
    <>
      {/* Overlay for mobile */}
      {open && (
        <div
          className="fixed inset-0 z-20 bg-black/40 lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-64 bg-white dark:bg-gray-900 border-r border-gray-200 dark:border-gray-800 flex flex-col transform transition-transform duration-200 lg:translate-x-0 lg:static lg:z-auto ${open ? 'translate-x-0' : '-translate-x-full'}`}
      >
        {/* Logo */}
        <div className="flex items-center gap-3 px-6 py-5 border-b border-gray-200 dark:border-gray-800">
          <div className="w-8 h-8 rounded-lg bg-indigo-600 flex items-center justify-center">
            <Mail className="w-4 h-4 text-white" />
          </div>
          <div>
            <p className="text-sm font-bold text-gray-900 dark:text-white leading-tight">Email Campaign</p>
            <p className="text-xs text-indigo-600 dark:text-indigo-400 font-medium">Analyzer</p>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 px-3 py-4 space-y-1 overflow-y-auto">
          {NAV_ITEMS.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-indigo-50 dark:bg-indigo-900/30 text-indigo-700 dark:text-indigo-300'
                    : 'text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-800 hover:text-gray-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-200 dark:border-gray-800">
          <p className="text-xs text-gray-400 dark:text-gray-600">IBM Bob Workshop</p>
        </div>
      </aside>
    </>
  );
}

// Mobile bottom nav
export function MobileNav() {
  const pathname = usePathname();
  const items = NAV_ITEMS.slice(0, 5); // show first 5 on mobile
  return (
    <nav className="lg:hidden fixed bottom-0 inset-x-0 z-20 bg-white dark:bg-gray-900 border-t border-gray-200 dark:border-gray-800 flex">
      {items.map(({ href, label, icon: Icon }) => {
        const isActive = pathname === href || (href !== '/' && pathname.startsWith(href));
        return (
          <Link
            key={href}
            href={href}
            className={`flex-1 flex flex-col items-center py-2 gap-0.5 text-xs font-medium transition-colors ${
              isActive
                ? 'text-indigo-600 dark:text-indigo-400'
                : 'text-gray-500 dark:text-gray-500 hover:text-gray-900 dark:hover:text-white'
            }`}
          >
            <Icon className="w-5 h-5" />
            <span>{label}</span>
          </Link>
        );
      })}
    </nav>
  );
}
