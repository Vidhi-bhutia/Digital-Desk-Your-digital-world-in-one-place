import React from 'react';
import { NavLink, useNavigate } from 'react-router-dom';
import { 
  Home, 
  Search, 
  CheckSquare, 
  Calendar, 
  Activity, 
  Grid, 
  Settings, 
  User, 
  LogOut, 
  Sun, 
  Moon 
} from 'lucide-react';
import { LogoFull, LogoMark } from '../common/Logo';
import Avatar from '../common/Avatar';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';

export const Sidebar = ({ isCollapsed = false, toggleCollapse, onCloseMobile }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  const navGroups = [
    {
      title: 'Workspace',
      items: [
        { label: 'Home', path: '/dashboard', icon: Home },
        { label: 'Search', path: '/search', icon: Search, badge: 'Phase 2' },
        { label: 'Tasks', path: '/tasks', icon: CheckSquare, badge: 'Phase 2' },
        { label: 'Calendar', path: '/calendar', icon: Calendar, badge: 'Phase 2' },
        { label: 'Activity', path: '/activity', icon: Activity },
        { label: 'Integrations', path: '/integrations', icon: Grid },
      ],
    },
    {
      title: 'System',
      items: [
        { label: 'Settings', path: '/settings', icon: Settings },
        { label: 'Profile', path: '/profile', icon: User },
      ],
    },
  ];

  return (
    <aside
      className="dd-sidebar"
      style={{
        width: isCollapsed ? '80px' : '260px',
        backgroundColor: 'var(--color-surface)',
        borderRight: '1px solid var(--color-border)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'sticky',
        top: 0,
        transition: 'width var(--transition-normal)',
        zIndex: 40,
        userSelect: 'none',
      }}
    >
      {/* Brand Header */}
      <div
        style={{
          padding: isCollapsed ? '20px 12px' : '20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: isCollapsed ? 'center' : 'space-between',
          borderBottom: '1px solid var(--color-border-subtle)',
        }}
      >
        {isCollapsed ? (
          <LogoMark size={36} />
        ) : (
          <LogoFull size={34} showTagline={false} />
        )}
      </div>

      {/* Nav List */}
      <div style={{ flex: 1, padding: '16px 12px', overflowY: 'auto' }}>
        {navGroups.map((group, gIdx) => (
          <div key={gIdx} style={{ marginBottom: '24px' }}>
            {!isCollapsed && (
              <span
                style={{
                  fontSize: '11px',
                  fontWeight: 700,
                  textTransform: 'uppercase',
                  letterSpacing: '0.08em',
                  color: 'var(--color-text-subtle)',
                  paddingLeft: '12px',
                  marginBottom: '8px',
                  display: 'block',
                }}
              >
                {group.title}
              </span>
            )}

            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
              {group.items.map((item) => {
                const Icon = item.icon;
                return (
                  <NavLink
                    key={item.path}
                    to={item.path}
                    onClick={onCloseMobile}
                    style={({ isActive }) => ({
                      display: 'flex',
                      alignItems: 'center',
                      gap: '12px',
                      padding: isCollapsed ? '12px' : '10px 14px',
                      justifyContent: isCollapsed ? 'center' : 'flex-start',
                      borderRadius: 'var(--radius-md)',
                      fontSize: '14px',
                      fontWeight: isActive ? 700 : 500,
                      color: isActive ? 'var(--color-brand)' : 'var(--color-text-muted)',
                      backgroundColor: isActive ? 'var(--color-brand-subtle)' : 'transparent',
                      textDecoration: 'none',
                      transition: 'all var(--transition-fast)',
                    })}
                  >
                    <Icon size={20} />
                    {!isCollapsed && (
                      <span style={{ flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                        {item.label}
                      </span>
                    )}
                    {!isCollapsed && item.badge && (
                      <span
                        style={{
                          fontSize: '10px',
                          fontWeight: 700,
                          padding: '2px 6px',
                          borderRadius: 'var(--radius-full)',
                          backgroundColor: 'var(--color-border-subtle)',
                          color: 'var(--color-text-muted)',
                        }}
                      >
                        {item.badge}
                      </span>
                    )}
                  </NavLink>
                );
              })}
            </div>
          </div>
        ))}
      </div>

      {/* User & Theme Footer */}
      <div
        style={{
          padding: '16px 12px',
          borderTop: '1px solid var(--color-border-subtle)',
          backgroundColor: 'var(--color-bg)',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px',
        }}
      >
        {/* User Card */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '12px',
            padding: isCollapsed ? '8px' : '10px',
            borderRadius: 'var(--radius-md)',
            backgroundColor: 'var(--color-surface)',
            border: '1px solid var(--color-border)',
          }}
        >
          <Avatar name={user?.name || 'User'} src={user?.avatar} size={36} />
          {!isCollapsed && (
            <div style={{ flex: 1, overflow: 'hidden' }}>
              <div style={{ fontSize: '13px', fontWeight: 700, color: 'var(--color-text)', truncate: true }}>
                {user?.name || 'User'}
              </div>
              <div style={{ fontSize: '11px', color: 'var(--color-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                {user?.email || ''}
              </div>
            </div>
          )}
        </div>

        {/* Theme & Logout Quick Actions */}
        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={toggleTheme}
            title={isDark ? 'Switch to Light Theme' : 'Switch to Dark Theme'}
            style={{
              flex: 1,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-border)',
              backgroundColor: 'var(--color-surface)',
              color: 'var(--color-text)',
              cursor: 'pointer',
              fontSize: '12px',
              fontWeight: 600,
            }}
          >
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
            {!isCollapsed && (isDark ? 'Light' : 'Dark')}
          </button>

          <button
            onClick={handleLogout}
            title="Log out of Digital Desk"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: '38px',
              height: '38px',
              borderRadius: 'var(--radius-md)',
              border: '1px solid var(--color-danger-border)',
              backgroundColor: 'var(--color-danger-bg)',
              color: 'var(--color-danger)',
              cursor: 'pointer',
            }}
          >
            <LogOut size={16} />
          </button>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
