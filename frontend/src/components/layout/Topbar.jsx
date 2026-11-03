import React from 'react';
import { Menu, Sun, Moon } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import Avatar from '../common/Avatar';
import Badge from '../common/Badge';
import NotificationCenter from './NotificationCenter';

export const Topbar = ({ onOpenMobileNav, pageTitle = 'Dashboard' }) => {
  const { user } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  return <header className="dd-topbar" style={{ height: 70, backgroundColor: 'var(--color-surface)', borderBottom: '1px solid var(--color-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 16, padding: '0 24px', position: 'sticky', top: 0, zIndex: 30, boxShadow: 'var(--shadow-sm)' }}>
    <div style={{ display: 'flex', alignItems: 'center', gap: 16 }}>
      <button type="button" onClick={onOpenMobileNav} className="mobile-menu-btn" aria-label="Open Navigation Menu" style={{ display: 'none', background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-text)', padding: 4 }}><Menu size={24}/></button>
      <h1 style={{ fontSize: 20, fontWeight: 800, color: 'var(--color-text)', fontFamily: 'var(--font-heading)' }}>{pageTitle}</h1>
    </div>
    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
      <button type="button" onClick={toggleTheme} aria-label="Toggle Theme" style={{ width: 38, height: 38, borderRadius: 'var(--radius-full)', border: '1px solid var(--color-border)', backgroundColor: 'var(--color-surface-hover)', color: 'var(--color-text)', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>{isDark ? <Sun size={18}/> : <Moon size={18}/>}</button>
      <NotificationCenter />
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, paddingLeft: 8 }}>
        <Avatar name={user?.name || 'User'} src={user?.avatar} size={36}/>
        <div className="topbar-user-info" style={{ display: 'flex', flexDirection: 'column' }}><span style={{ fontSize: 13, fontWeight: 700, color: 'var(--color-text)' }}>{user?.name || 'User'}</span><Badge variant="brand" size="sm">Digital Desk</Badge></div>
      </div>
    </div>
  </header>;
};

export default Topbar;
