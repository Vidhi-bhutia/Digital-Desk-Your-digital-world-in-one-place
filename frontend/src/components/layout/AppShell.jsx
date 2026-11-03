import React, { useState } from 'react';
import Sidebar from './Sidebar';
import Topbar from './Topbar';
import MainContent from './MainContent';
import MobileNav from './MobileNav';
import { useEffect } from 'react';

export const AppShell = ({ children, pageTitle, onOpenSearch }) => {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  useEffect(() => {
    const openSearch = () => onOpenSearch?.();
    document.addEventListener('digitaldesk:open-search', openSearch);
    return () => document.removeEventListener('digitaldesk:open-search', openSearch);
  }, [onOpenSearch]);

  return (
    <div
      className="dd-app-shell"
      style={{
        display: 'flex',
        minHeight: '100vh',
        backgroundColor: 'var(--color-bg)',
      }}
    >
      {/* Desktop Sidebar */}
      <div className="desktop-sidebar-container">
        <Sidebar
          isCollapsed={isSidebarCollapsed}
          toggleCollapse={() => setIsSidebarCollapsed(!isSidebarCollapsed)}
        />
      </div>

      {/* Mobile Drawer */}
      <MobileNav
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
      />

      {/* Main Body Area */}
      <div
        style={{
          flex: 1,
          display: 'flex',
          flexDirection: 'column',
          minWidth: 0,
        }}
      >
        <Topbar
          pageTitle={pageTitle}
          onOpenMobileNav={() => setIsMobileNavOpen(true)}
          onOpenSearch={onOpenSearch}
        />
        <MainContent>{children}</MainContent>
      </div>
    </div>
  );
};

export default AppShell;
