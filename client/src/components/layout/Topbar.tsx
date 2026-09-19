import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import {
  Sparkles,
  Search,
  MapPin,
  Bell,
  Sun,
  Moon,
  LogOut,
  Settings,
  LayoutDashboard,
  CheckCircle2,
} from 'lucide-react';
import { Link } from 'react-router-dom';

interface TopbarProps {
  onOpenSearch: () => void;
}

export const Topbar: React.FC<TopbarProps> = ({ onOpenSearch }) => {
  const { user, logout } = useAuth();
  const { isDark, toggleTheme } = useTheme();

  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);

  const userLocation = (() => {
    const stored = localStorage.getItem('digital_desk_user_location');
    if (!stored) return null;
    try {
      const parsed = JSON.parse(stored) as { city?: string; country?: string };
      return parsed.city ? `${parsed.city}${parsed.country ? `, ${parsed.country}` : ''}` : null;
    } catch {
      return null;
    }
  })();

  return (
    <header className="sticky top-4 z-40 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
      <div className="desk-surface rounded-3xl p-3 sm:px-6 border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e]/90 shadow-soft-md flex items-center justify-between gap-4">
        
        {/* Brand Logo */}
        <Link to="/dashboard" className="flex items-center space-x-3 group flex-shrink-0">
          <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 p-0.5 shadow-soft-sm group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-white dark:bg-[#0b0f19] rounded-[14px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-500" />
            </div>
          </div>
          <div className="hidden sm:block">
            <span className="font-extrabold text-base text-slate-900 dark:text-white tracking-tight">
              Digital Desk
            </span>
            <p className="text-[10px] text-slate-500 dark:text-slate-400 font-medium">
              Your digital world, in one place.
            </p>
          </div>
        </Link>

        {/* Center: Global Search Bar */}
        <div className="flex-1 max-w-md mx-2">
          <button
            onClick={onOpenSearch}
            className="w-full glass-input rounded-2xl px-4 py-2 text-xs flex items-center justify-between text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100/80 dark:hover:bg-slate-800/80 transition-all border border-slate-200/70 dark:border-slate-800"
          >
            <div className="flex items-center space-x-2">
              <Search className="w-4 h-4 text-indigo-500" />
              <span className="truncate">Global Search (Activity, Events, Repos)...</span>
            </div>
            <kbd className="hidden md:inline-flex items-center space-x-0.5 px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-lg border border-slate-200 dark:border-slate-700">
              <span>⌘</span>
              <span>K</span>
            </kbd>
          </button>
        </div>

        {/* Right Section: Location, Notifications, Theme Toggle, Profile */}
        <div className="flex items-center space-x-2 sm:space-x-3 flex-shrink-0">
          
          {/* Location Badge */}
          <div className="hidden lg:flex items-center space-x-1.5 px-3 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-800/80 border border-slate-200/60 dark:border-slate-800 text-xs font-medium text-slate-600 dark:text-slate-300">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span className="truncate max-w-[120px]">{userLocation || 'Set Location'}</span>
          </div>

          {/* Theme Toggle Button */}
          <button
            onClick={toggleTheme}
            className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors border border-slate-200/60 dark:border-slate-800"
            title={isDark ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-600" />}
          </button>

          {/* Notifications Button */}
          <div className="relative">
            <button
              onClick={() => setNotificationsOpen(!notificationsOpen)}
              className="p-2.5 rounded-2xl bg-slate-100 dark:bg-slate-800/80 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-600 dark:text-slate-300 transition-colors relative border border-slate-200/60 dark:border-slate-800"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-white dark:ring-[#151c2e]" />
            </button>

            {notificationsOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setNotificationsOpen(false)} />
                <div className="absolute right-0 mt-2 w-72 desk-surface rounded-3xl p-4 shadow-xl z-50 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151c2e] animate-scale-in space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-2">
                    <h4 className="text-xs font-bold text-slate-900 dark:text-white">Notifications</h4>
                    <span className="text-[10px] font-semibold text-indigo-500 font-mono">System Active</span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-600 dark:text-slate-300">
                    <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 flex items-start space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-indigo-500 flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="font-semibold text-slate-900 dark:text-white">Digital Desk Online</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400">All integrations bound to real API sources.</p>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* Profile Dropdown */}
          {user && (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen(!profileDropdownOpen)}
                className="flex items-center space-x-2 p-1 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
              >
                <img
                  src={user.avatar}
                  alt={user.name}
                  className="w-8 h-8 rounded-xl object-cover ring-2 ring-indigo-500/30"
                />
              </button>

              {profileDropdownOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setProfileDropdownOpen(false)} />
                  <div className="absolute right-0 mt-2 w-56 desk-surface rounded-3xl p-2 shadow-xl z-50 border border-slate-200 dark:border-slate-800 bg-white dark:bg-[#151c2e] animate-scale-in">
                    <div className="px-3 py-2.5 border-b border-slate-100 dark:border-slate-800">
                      <p className="text-xs font-bold text-slate-900 dark:text-white">{user.name}</p>
                      <p className="text-[11px] text-slate-400 truncate">{user.email}</p>
                    </div>

                    <div className="py-1">
                      <Link
                        to="/dashboard"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-500/10 rounded-xl transition-colors"
                      >
                        <LayoutDashboard className="w-4 h-4 text-indigo-500" />
                        <span>Command Center</span>
                      </Link>

                      <Link
                        to="/settings"
                        onClick={() => setProfileDropdownOpen(false)}
                        className="flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-slate-200 hover:bg-indigo-500/10 rounded-xl transition-colors"
                      >
                        <Settings className="w-4 h-4 text-purple-500" />
                        <span>Settings & Integrations</span>
                      </Link>
                    </div>

                    <div className="border-t border-slate-100 dark:border-slate-800 pt-1">
                      <button
                        onClick={() => {
                          setProfileDropdownOpen(false);
                          logout();
                        }}
                        className="w-full flex items-center space-x-2 px-3 py-2 text-xs font-semibold text-rose-500 hover:bg-rose-500/10 rounded-xl transition-colors text-left"
                      >
                        <LogOut className="w-4 h-4" />
                        <span>Sign Out</span>
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </header>
  );
};
