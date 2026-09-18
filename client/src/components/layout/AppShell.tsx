import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import { Topbar } from './Topbar.js';
import { Sidebar } from './Sidebar.js';
import { SearchModal } from '../ui/SearchModal.js';

export const AppShell: React.FC = () => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);

  return (
    <div className="min-h-screen bg-pastel-bg dark:bg-navy-bg transition-colors duration-300 flex flex-col">
      {/* Floating Topbar */}
      <Topbar onOpenSearch={() => setIsSearchOpen(true)} />

      {/* Main Container Layout */}
      <div className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-6 flex gap-6">
        {/* Vertical Collapsible Sidebar */}
        <div className="hidden md:block">
          <Sidebar
            isCollapsed={isSidebarCollapsed}
            onToggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
            onOpenSearch={() => setIsSearchOpen(true)}
          />
        </div>

        {/* Dynamic Content Page */}
        <main className="flex-1 min-w-0">
          <Outlet />
        </main>
      </div>

      {/* Global Search Modal Palette */}
      <SearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
    </div>
  );
};
