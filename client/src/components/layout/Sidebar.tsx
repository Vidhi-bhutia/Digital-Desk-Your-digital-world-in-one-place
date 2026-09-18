import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  Home,
  Activity,
  Calendar,
  Search,
  Bell,
  Sliders,
  Settings,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext.js';

interface SidebarProps {
  isCollapsed: boolean;
  onToggleCollapse: () => void;
  onOpenSearch: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  isCollapsed,
  onToggleCollapse,
  onOpenSearch,
}) => {
  const { user } = useAuth();

  const mainNavItems = [
    { name: 'Home', path: '/dashboard', icon: Home },
    { name: 'Activity', path: '/activity', icon: Activity },
    { name: 'Timeline', path: '/timeline', icon: Calendar },
    { name: 'Search', action: onOpenSearch, icon: Search },
    { name: 'Attention', path: '/attention', icon: Bell },
    { name: 'Integrations', path: '/integrations', icon: Sliders },
  ];

  const bottomNavItems = [
    { name: 'Settings', path: '/settings', icon: Settings },
  ];

  return (
    <aside
      className={`desk-surface rounded-3xl p-3 flex flex-col justify-between transition-all duration-300 border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e]/90 shadow-soft-md min-h-[calc(100vh-7rem)] sticky top-24 ${
        isCollapsed ? 'w-20' : 'w-60'
      }`}
    >
      <div className="space-y-6">
        {/* Collapse Toggle Button */}
        <div className="flex items-center justify-between px-2">
          {!isCollapsed && (
            <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
              Navigation
            </span>
          )}
          <button
            onClick={onToggleCollapse}
            className="p-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-500 dark:text-slate-400 transition-colors mx-auto"
            title={isCollapsed ? 'Expand Sidebar' : 'Collapse Sidebar'}
          >
            {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
          </button>
        </div>

        {/* Main Navigation Items */}
        <nav className="space-y-1.5">
          {mainNavItems.map((item) => {
            const Icon = item.icon;

            if (item.action) {
              return (
                <button
                  key={item.name}
                  onClick={item.action}
                  className={`w-full flex items-center ${
                    isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'
                  } py-2.5 rounded-2xl text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 hover:bg-indigo-500/10 transition-colors text-left`}
                  title={isCollapsed ? item.name : undefined}
                >
                  <Icon className="w-4 h-4 flex-shrink-0" />
                  {!isCollapsed && <span>{item.name}</span>}
                </button>
              );
            }

            return (
              <NavLink
                key={item.path}
                to={item.path!}
                className={({ isActive }) =>
                  `flex items-center ${
                    isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'
                  } py-2.5 rounded-2xl text-xs font-semibold transition-all duration-200 ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-soft-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Bottom Section: Settings & User Profile */}
      <div className="space-y-3 pt-4 border-t border-slate-200/60 dark:border-slate-800/60">
        <nav className="space-y-1.5">
          {bottomNavItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center ${
                    isCollapsed ? 'justify-center px-0' : 'space-x-3 px-3.5'
                  } py-2.5 rounded-2xl text-xs font-semibold transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-soft-sm'
                      : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
                  }`
                }
                title={isCollapsed ? item.name : undefined}
              >
                <Icon className="w-4 h-4 flex-shrink-0" />
                {!isCollapsed && <span>{item.name}</span>}
              </NavLink>
            );
          })}
        </nav>

        {/* User Card */}
        {user && (
          <div
            className={`p-2 rounded-2xl bg-slate-100/70 dark:bg-slate-800/50 flex items-center ${
              isCollapsed ? 'justify-center' : 'space-x-2.5'
            }`}
          >
            <img
              src={user.avatar}
              alt={user.name}
              className="w-7 h-7 rounded-xl object-cover ring-1 ring-slate-300 dark:ring-slate-700 flex-shrink-0"
            />
            {!isCollapsed && (
              <div className="min-w-0 flex-1">
                <p className="text-xs font-bold text-slate-800 dark:text-slate-200 truncate leading-tight">
                  {user.name}
                </p>
                <p className="text-[10px] text-slate-400 truncate leading-tight">Profile Active</p>
              </div>
            )}
          </div>
        )}
      </div>
    </aside>
  );
};
