import React, { useState, useEffect } from 'react';
import { Search, X, Github, Mail, Calendar, Sparkles, ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const navigate = useNavigate();

  // Listen for Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (isOpen) {
          onClose();
        } else {
          // Open handled by parent or state
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const quickLinks = [
    { title: 'Command Center Home', path: '/dashboard', icon: Sparkles },
    { title: 'Activity Timeline', path: '/activity', icon: Github },
    { title: 'Schedule & Calendar', path: '/timeline', icon: Calendar },
    { title: 'Attention & Action Items', path: '/attention', icon: Mail },
    { title: 'Connected Integrations', path: '/integrations', icon: Sparkles },
    { title: 'Account Settings', path: '/settings', icon: Sparkles },
  ];

  const filteredLinks = quickLinks.filter((l) =>
    l.title.toLowerCase().includes(query.toLowerCase())
  );

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/40 backdrop-blur-xs flex items-start justify-center pt-20 p-4">
      <div
        className="fixed inset-0"
        onClick={onClose}
      />
      <div className="relative z-10 w-full max-w-xl desk-surface rounded-3xl bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800 shadow-2xl overflow-hidden animate-scale-in">
        {/* Search Input Box */}
        <div className="p-4 border-b border-slate-200/60 dark:border-slate-800/60 flex items-center space-x-3">
          <Search className="w-5 h-5 text-indigo-500 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search across activity, events, repositories, and pages..."
            className="w-full bg-transparent border-none text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-mono font-semibold text-slate-400 bg-slate-100 dark:bg-slate-800 rounded-md border border-slate-200 dark:border-slate-700">
            ESC
          </kbd>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600 dark:hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results / Navigation Shortcuts */}
        <div className="p-3 max-h-80 overflow-y-auto space-y-1">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider px-3 py-1.5">
            Quick Navigation & Search
          </p>

          {filteredLinks.length > 0 ? (
            filteredLinks.map((item) => {
              const Icon = item.icon;
              return (
                <button
                  key={item.path}
                  onClick={() => {
                    navigate(item.path);
                    onClose();
                  }}
                  className="w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl hover:bg-indigo-500/10 dark:hover:bg-slate-800/60 text-slate-700 dark:text-slate-200 transition-colors group text-left"
                >
                  <div className="flex items-center space-x-3">
                    <div className="p-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-indigo-500 group-hover:scale-105 transition-transform">
                      <Icon className="w-4 h-4" />
                    </div>
                    <span className="text-xs font-semibold">{item.title}</span>
                  </div>
                  <ArrowRight className="w-3.5 h-3.5 text-slate-400 group-hover:text-indigo-500 transition-colors" />
                </button>
              );
            })
          ) : (
            <div className="p-6 text-center text-xs text-slate-400">
              No results found for "{query}". Try searching for 'activity', 'calendar', or 'integrations'.
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
