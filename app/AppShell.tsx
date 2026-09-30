'use client';
import { useState } from 'react';
import { Sidebar, MobileNav } from '@/components/layout/Sidebar';
import { TopNav } from '@/components/layout/TopNav';

export function AppShell({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <TopNav onMenuClick={() => setSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto pb-16 lg:pb-0">
          {children}
        </main>
      </div>
      <MobileNav />
    </div>
  );
}
