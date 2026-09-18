import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Sliders, Github, Mail, Calendar, CloudSun } from 'lucide-react';
import { useAuth } from '../context/AuthContext.js';

export const Sidebar: React.FC = () => {
  const { user } = useAuth();

  const navItems = [
    { name: 'Command Center', path: '/dashboard', icon: LayoutDashboard },
    { name: 'Integrations', path: '/settings', icon: Sliders },
  ];

  const connectedServices = user?.connectedServices || { github: false, google: false };

  return (
    <aside className="w-64 glass-panel rounded-2xl p-4 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-6rem)]">
      <div className="space-y-6">
        <div>
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
            Navigation
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-xl font-medium text-sm transition-all duration-200 ${
                    isActive
                      ? 'bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-500/25'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-white/5'
                  }`
                }
              >
                <item.icon className="w-4 h-4" />
                <span>{item.name}</span>
              </NavLink>
            ))}
          </nav>
        </div>

        {/* Connected Services Quick Status */}
        <div className="border-t border-white/5 pt-4">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">
            Active Integrations
          </p>
          <div className="space-y-2">
            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Github className="w-4 h-4 text-slate-300" />
                <span>GitHub</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${connectedServices.github ? 'bg-emerald-400 shadow-glow' : 'bg-slate-600'}`} />
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-red-400" />
                <span>Gmail</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${connectedServices.google ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>Google Calendar</span>
              </div>
              <span className={`w-2 h-2 rounded-full ${connectedServices.google ? 'bg-emerald-400' : 'bg-slate-600'}`} />
            </div>

            <div className="flex items-center justify-between px-3 py-2 rounded-lg bg-white/5 text-xs text-slate-300">
              <div className="flex items-center space-x-2">
                <CloudSun className="w-4 h-4 text-amber-400" />
                <span>Weather</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer Tagline Card */}
      <div className="p-3.5 glass-card rounded-xl border border-white/5 text-center">
        <p className="text-xs font-semibold bg-gradient-to-r from-indigo-300 to-purple-300 bg-clip-text text-transparent">
          Digital Desk v1.0
        </p>
        <p className="text-[10px] text-slate-400 mt-0.5">Your digital world, in one place.</p>
      </div>
    </aside>
  );
};
