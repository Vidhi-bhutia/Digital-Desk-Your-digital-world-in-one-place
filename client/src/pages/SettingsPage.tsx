import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { useTheme } from '../context/ThemeContext.js';
import {
  User as UserIcon,
  Palette,
  Bell,
  ShieldCheck,
  Lock,
  MapPin,
  RefreshCw,
  Trash2,
  Sun,
  Moon,
  Monitor,
  CheckCircle2,
} from 'lucide-react';

export const SettingsPage: React.FC = () => {
  const { user } = useAuth();
  const { theme, setTheme } = useTheme();

  const [activeTab, setActiveTab] = useState<'account' | 'appearance' | 'notifications' | 'privacy' | 'security' | 'location'>('account');
  const [location, setLocation] = useState<Record<string, unknown> | null>(() => {
    const stored = localStorage.getItem('digital_desk_user_location');
    if (!stored) return null;
    try { return JSON.parse(stored); } catch { return null; }
  });
  const [locationMessage, setLocationMessage] = useState('');
  const [manualLocation, setManualLocation] = useState('');

  const tabs = [
    { id: 'account' as const, name: 'Account', icon: UserIcon },
    { id: 'appearance' as const, name: 'Appearance', icon: Palette },
    { id: 'notifications' as const, name: 'Notifications', icon: Bell },
    { id: 'privacy' as const, name: 'Privacy & Data', icon: ShieldCheck },
    { id: 'security' as const, name: 'Security', icon: Lock },
    { id: 'location' as const, name: 'Location', icon: MapPin },
  ];

  const saveLocation = (nextLocation: Record<string, unknown> | null) => {
    setLocation(nextLocation);
    if (nextLocation) localStorage.setItem('digital_desk_user_location', JSON.stringify(nextLocation));
    else localStorage.removeItem('digital_desk_user_location');
    window.dispatchEvent(new Event('digital-desk-location-changed'));
  };

  const refreshLocation = () => {
    if (!navigator.geolocation) {
      setLocationMessage('Browser location is unavailable.');
      return;
    }
    setLocationMessage('Requesting your location...');
    navigator.geolocation.getCurrentPosition(
      (position) => {
        saveLocation({ city: '', region: '', country: '', latitude: position.coords.latitude, longitude: position.coords.longitude, source: 'current' });
        setLocationMessage('Location access enabled.');
      },
      () => setLocationMessage('Location unavailable. Check browser permission and try again.'),
      { enableHighAccuracy: false, timeout: 10000, maximumAge: 300000 }
    );
  };

  return (
    <div className="space-y-6 animate-fade-in pb-12 max-w-4xl">
      <div>
        <h1 className="text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">Settings</h1>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
          Manage your account preferences, appearance, notifications, and security.
        </p>
      </div>

      {/* Settings Navigation Tabs */}
      <div className="flex space-x-1.5 p-1.5 desk-surface rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] overflow-x-auto">
        {tabs.map((t) => {
          const Icon = t.icon;
          const isActive = activeTab === t.id;
          return (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-xl text-xs font-semibold transition-all ${
                isActive
                  ? 'bg-indigo-600 text-white shadow-soft-sm'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800/60'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{t.name}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Content Panels */}
      <div className="desk-surface p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm">
        {activeTab === 'account' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Account Information</h3>
            <div className="flex items-center space-x-4 p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 border border-slate-200/60 dark:border-slate-800">
              <img src={user?.avatar} alt={user?.name} className="w-14 h-14 rounded-2xl object-cover ring-2 ring-indigo-500/30" />
              <div>
                <p className="text-sm font-bold text-slate-900 dark:text-white">{user?.name}</p>
                <p className="text-xs text-slate-400">{user?.email}</p>
                <p className="text-[10px] font-mono text-indigo-500 mt-0.5">User ID: {user?.id}</p>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'appearance' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Appearance & Color Theme</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Choose how Digital Desk looks to you.</p>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-2">
              <button
                onClick={() => setTheme('light')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  theme === 'light'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Sun className="w-6 h-6 mx-auto text-amber-500 mb-2" />
                <p className="text-xs font-bold">Light Mode</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Pastel blue environment</p>
              </button>

              <button
                onClick={() => setTheme('dark')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  theme === 'dark'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Moon className="w-6 h-6 mx-auto text-indigo-400 mb-2" />
                <p className="text-xs font-bold">Dark Mode</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Deep navy environment</p>
              </button>

              <button
                onClick={() => setTheme('system')}
                className={`p-4 rounded-2xl border text-center transition-all ${
                  theme === 'system'
                    ? 'border-indigo-500 bg-indigo-500/10 text-indigo-600 dark:text-indigo-400'
                    : 'border-slate-200 dark:border-slate-800 hover:bg-slate-50 dark:hover:bg-slate-800/40'
                }`}
              >
                <Monitor className="w-6 h-6 mx-auto text-slate-400 mb-2" />
                <p className="text-xs font-bold">System Default</p>
                <p className="text-[10px] text-slate-400 mt-0.5">Follow OS setting</p>
              </button>
            </div>
          </div>
        )}

        {activeTab === 'notifications' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Notification Preferences</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Configure email and integration alerts.</p>
            <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-800/50 text-xs text-slate-600 dark:text-slate-300">
              Desktop notifications active for upcoming calendar events and pull requests.
            </div>
          </div>
        )}

        {activeTab === 'privacy' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Privacy & Data Control</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Your OAuth tokens are safely encrypted on the server.</p>
            <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-xs text-emerald-600 dark:text-emerald-400 flex items-center space-x-2">
              <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
              <span>HTTP-Only Secure Cookie session protection active.</span>
            </div>
          </div>
        )}

        {activeTab === 'security' && (
          <div className="space-y-3">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Security & Password</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">Passwords are hashed using bcrypt.</p>
          </div>
        )}

        {activeTab === 'location' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Location</h3>
            <div className="space-y-3 text-xs">
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400">Location access</span>
                <span className={`font-semibold ${location ? 'text-emerald-500' : 'text-slate-400'}`}>{location ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400">Location source</span>
                <span className="font-semibold text-slate-700 dark:text-slate-200">{location?.source === 'manual' ? 'Manual' : location ? 'Current location' : 'None'}</span>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400">Current location</span>
                <button onClick={refreshLocation} className="flex items-center gap-1.5 text-indigo-600 dark:text-indigo-400 font-semibold"><RefreshCw className="w-3.5 h-3.5" />Refresh location</button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400">Manual location</span>
                <form onSubmit={(event) => { event.preventDefault(); if (manualLocation.trim()) { saveLocation({ city: manualLocation.trim(), region: '', country: '', latitude: 0, longitude: 0, source: 'manual' }); setManualLocation(''); setLocationMessage('Manual location saved.'); } }} className="flex items-center gap-2">
                  <input value={manualLocation} onChange={(event) => setManualLocation(event.target.value)} placeholder="Search city" className="glass-input rounded-lg px-2 py-1 text-xs w-28" />
                  <button type="submit" className="text-indigo-600 dark:text-indigo-400 font-semibold">Change</button>
                </form>
              </div>
              {location && <button onClick={() => { saveLocation(null); setLocationMessage('Saved location cleared.'); }} className="flex items-center gap-1.5 text-rose-500 font-semibold"><Trash2 className="w-3.5 h-3.5" />Clear saved location</button>}
              {locationMessage && <p className="text-[11px] text-slate-500 dark:text-slate-400">{locationMessage}</p>}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
