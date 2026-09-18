import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext.js';
import { LayoutDashboard, LogOut, Settings, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';

export const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [dropdownOpen, setDropdownOpen] = useState(false);

  return (
    <header className="sticky top-0 z-40 w-full glass-panel border-b border-white/5 bg-[#090d16]/80 backdrop-blur-xl">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        
        {/* Brand Logo & Tagline */}
        <Link to="/dashboard" className="flex items-center space-x-3 group">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-pink-500 p-0.5 shadow-lg shadow-indigo-500/20 group-hover:scale-105 transition-transform duration-300">
            <div className="w-full h-full bg-[#090d16] rounded-[10px] flex items-center justify-center">
              <Sparkles className="w-5 h-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
            </div>
          </div>
          <div>
            <span className="font-bold text-lg bg-gradient-to-r from-white via-slate-200 to-indigo-200 bg-clip-text text-transparent">
              Digital Desk
            </span>
            <p className="text-[11px] text-slate-400 font-medium tracking-wide hidden sm:block">
              Your digital world, in one place.
            </p>
          </div>
        </Link>

        {/* Right Section: User Profile Dropdown */}
        {user && (
          <div className="relative">
            <button
              onClick={() => setDropdownOpen(!dropdownOpen)}
              className="flex items-center space-x-3 p-1.5 rounded-xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all"
            >
              <img
                src={user.avatar}
                alt={user.name}
                className="w-9 h-9 rounded-lg object-cover ring-2 ring-indigo-500/30"
              />
              <div className="text-left hidden md:block">
                <p className="text-sm font-semibold text-slate-200 leading-none">{user.name}</p>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5">{user.email}</p>
              </div>
            </button>

            {/* Dropdown Menu */}
            {dropdownOpen && (
              <>
                <div
                  className="fixed inset-0 z-40"
                  onClick={() => setDropdownOpen(false)}
                />
                <div className="absolute right-0 mt-2 w-56 glass-panel rounded-2xl shadow-2xl py-2 z-50 border border-white/10 animate-fade-in">
                  <div className="px-4 py-3 border-b border-white/5">
                    <p className="text-xs font-semibold text-slate-400">Signed in as</p>
                    <p className="text-sm font-medium text-indigo-300 truncate">{user.email}</p>
                  </div>

                  <Link
                    to="/dashboard"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-indigo-600/20 transition-colors"
                  >
                    <LayoutDashboard className="w-4 h-4 text-indigo-400" />
                    <span>Command Center</span>
                  </Link>

                  <Link
                    to="/settings"
                    onClick={() => setDropdownOpen(false)}
                    className="flex items-center space-x-2.5 px-4 py-2.5 text-sm text-slate-300 hover:text-white hover:bg-indigo-600/20 transition-colors"
                  >
                    <Settings className="w-4 h-4 text-purple-400" />
                    <span>Integrations & Settings</span>
                  </Link>

                  <div className="border-t border-white/5 my-1" />

                  <button
                    onClick={() => {
                      setDropdownOpen(false);
                      logout();
                    }}
                    className="w-full flex items-center space-x-2.5 px-4 py-2.5 text-sm text-red-400 hover:text-red-300 hover:bg-red-500/10 transition-colors text-left"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </header>
  );
};
