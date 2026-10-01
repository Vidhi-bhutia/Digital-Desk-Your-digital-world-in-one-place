import React from 'react';
import { Search, Bell, Menu, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';

export const Topbar = ({ onOpenMobileNav, onOpenSearch, pageTitle = 'Dashboard' }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  return (
    <header
      className="dd-topbar"
      style={{
        height: '70px',
        backgroundColor: 'var(--color-surface)',
        borderBottom: '1px solid var(--color-border)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '0 24px',
        position: 'sticky',
        top: 0,
        zIndex: 30,
        boxShadow: 'var(--shadow-sm)',
      }}
    >
      {/* Left side: Mobile Menu Trigger & Page Title */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
        <button
          onClick={onOpenMobileNav}
          className="mobile-menu-btn"
          aria-label="Open Navigation Menu"
          style={{
            display: 'none',
            background: 'none',
            border: 'none',
            cursor: 'pointer',
            color: 'var(--color-text)',
            padding: '4px',
          }}
        >
          <Menu size={24} />
        </button>

        <div>
          <h1 style={{ fontSize: '20px', fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>
            {pageTitle}
          </h1>
        </div>
      </div>

      {/* Middle: Universal Digital Desk Search Bar */}
      <div
        onClick={onOpenSearch}
        style={{
          flex: 1,
          maxWidth: '480px',
          margin: '0 24px',
          position: 'relative',
          cursor: 'pointer',
        }}
      >
        <div
          style={{
            position: 'absolute',
            left: '14px',
            top: '50%',
            transform: 'translateY(-50%)',
            color: 'var(--color-text-muted)',
            display: 'flex',
            alignItems: 'center',
            pointerEvents: 'none',
          }}
        >
          <Search size={18} />
        </div>
        <input
          type="text"
          placeholder="Search the web or your digital desk... (Ctrl + K)"
          readOnly
          style={{
            width: '100%',
            height: '42px',
            paddingLeft: '42px',
            paddingRight: '70px',
            fontSize: '13px',
            fontFamily: 'var(--font-sans)',
            backgroundColor: 'var(--color-bg)',
            border: '1px solid var(--color-border)',
            borderRadius: 'var(--radius-full)',
            color: 'var(--color-text)',
            outline: 'none',
            cursor: 'pointer',
          }}
        />
        <div
          style={{
            position: 'absolute',
            right: '12px',
            top: '50%',
            transform: 'translateY(-50%)',
          }}
        >
          <kbd
            style={{
              fontSize: '10px',
              fontWeight: 700,
              padding: '2px 6px',
              borderRadius: '4px',
              backgroundColor: 'var(--color-surface)',
              border: '1px solid var(--color-border)',
              color: 'var(--color-text-muted)',
            }}
          >
            ⌘K
          </kbd>
        </div>
      </div>

      {/* Right side: Quick Actions & Profile */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={toggleTheme}
          aria-label="Toggle Theme"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-hover)',
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
          }}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <button
          aria-label="Notifications"
          style={{
            width: '38px',
            height: '38px',
            borderRadius: 'var(--radius-full)',
            border: '1px solid var(--color-border)',
            backgroundColor: 'var(--color-surface-hover)',
            color: 'var(--color-text)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            cursor: 'pointer',
            position: 'relative',
          }}
        >
          <Bell size={18} />
          <span
            style={{
              position: 'absolute',
              top: '8px',
              right: '8px',
              width: '8px',
              height: '8px',
              borderRadius: '50%',
              backgroundColor: 'var(--color-brand)',
            }}
          />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', paddingLeft: '8px' }}>
          <Avatar name={user?.name || 'User'} src={user?.avatar} size={36} />
          <div className="topbar-user-info" style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)' }}>
              {user?.name || 'User'}
            </span>
            <Badge variant="brand" size="sm">Phase 2 Dashboard</Badge>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Topbar;
