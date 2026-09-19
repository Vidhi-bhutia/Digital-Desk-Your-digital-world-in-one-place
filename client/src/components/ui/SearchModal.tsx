import React, { useState, useEffect } from 'react';
import { Search, X, Mail, Calendar, Github, Activity, ArrowRight, Loader2, Sparkles, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../services/api';

interface SearchResultItem {
  id: string;
  source: 'github' | 'gmail' | 'calendar';
  provider: string;
  eventType: string;
  externalId: string;
  title: string;
  description?: string;
  timestamp: string;
  url?: string;
  metadata?: any;
}

interface GroupedSearchResults {
  github: SearchResultItem[];
  gmail: SearchResultItem[];
  calendar: SearchResultItem[];
  activity: SearchResultItem[];
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SearchModal: React.FC<SearchModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GroupedSearchResults | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Keyboard shortcut Ctrl/Cmd + K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        if (isOpen) onClose();
        else {
          // Open triggered from parent or button
        }
      }
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  // Debounced Search API trigger
  useEffect(() => {
    if (!query.trim()) {
      setResults(null);
      setIsLoading(false);
      setHasSearched(false);
      return;
    }

    setIsLoading(true);
    const timer = setTimeout(async () => {
      try {
        const res = await api.get<{ success: boolean; data: GroupedSearchResults }>('/search', {
          params: { q: query.trim() },
        });
        setResults(res.data.data);
        setHasSearched(true);
      } catch (err) {
        console.error('Search failed:', err);
      } finally {
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  if (!isOpen) return null;

  const totalResultsCount =
    (results?.github.length || 0) +
    (results?.gmail.length || 0) +
    (results?.calendar.length || 0);

  const quickActions = [
    { label: 'Search Gmail Inbox', prefix: 'from:', icon: Mail, path: '/activity?source=gmail' },
    { label: 'Search GitHub Repos', prefix: 'repo:', icon: Github, path: '/activity?source=github' },
    { label: 'Search Calendar Events', prefix: 'event:', icon: Calendar, path: '/timeline?source=calendar' },
    { label: 'View Unified Timeline', icon: Activity, path: '/timeline' },
    { label: 'Manage Integration Connections', icon: Sparkles, path: '/integrations' },
  ];

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/60 backdrop-blur-sm flex items-start justify-center pt-16 sm:pt-24 p-4 animate-fade-in">
      {/* Backdrop overlay */}
      <div className="fixed inset-0" onClick={onClose} />

      {/* Main Search Modal Box */}
      <div className="relative w-full max-w-2xl bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800 rounded-3xl shadow-2xl overflow-hidden z-10 space-y-0">
        
        {/* Input Header Row */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200/80 dark:border-slate-800/80">
          <Search className="w-5 h-5 text-indigo-500 mr-3 flex-shrink-0" />
          <input
            type="text"
            autoFocus
            placeholder="Search across Gmail, GitHub, Calendar, and Activity..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 mr-2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <button
            onClick={onClose}
            className="px-2 py-1 rounded-lg bg-slate-100 dark:bg-slate-800 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white"
          >
            ESC
          </button>
        </div>

        {/* Modal Body Content */}
        <div className="p-4 max-h-[60vh] overflow-y-auto space-y-4">
          
          {/* Loading Indicator */}
          {isLoading && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-2">
              <Loader2 className="w-6 h-6 text-indigo-500 animate-spin" />
              <p className="text-xs text-slate-400">Searching your connected digital workspace...</p>
            </div>
          )}

          {/* Quick Actions (When Empty Query) */}
          {!query.trim() && !isLoading && (
            <div className="space-y-3">
              <p className="text-[11px] font-bold text-slate-400 uppercase tracking-wider px-1">
                Quick Actions & Shortcuts
              </p>
              <div className="space-y-1">
                {quickActions.map((action, idx) => {
                  const Icon = action.icon;
                  return (
                    <Link
                      key={idx}
                      to={action.path}
                      onClick={onClose}
                      className="flex items-center justify-between p-3 rounded-2xl hover:bg-slate-100 dark:hover:bg-slate-800/60 transition-colors group"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-xl bg-indigo-500/10 text-indigo-500 flex items-center justify-center">
                          <Icon className="w-4 h-4" />
                        </div>
                        <span className="text-xs font-semibold text-slate-700 dark:text-slate-200 group-hover:text-indigo-600 dark:group-hover:text-indigo-400">
                          {action.label}
                        </span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-slate-400 group-hover:translate-x-1 transition-transform" />
                    </Link>
                  );
                })}
              </div>
            </div>
          )}

          {/* No Results Found */}
          {!isLoading && hasSearched && totalResultsCount === 0 && (
            <div className="py-12 flex flex-col items-center justify-center text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400">
                <Search className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-slate-900 dark:text-white">No results found</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 max-w-xs">
                  No matching Gmail messages, GitHub repos, or Calendar events found for "{query}".
                </p>
              </div>
            </div>
          )}

          {/* Search Results Display */}
          {!isLoading && results && totalResultsCount > 0 && (
            <div className="space-y-5">
              
              {/* Gmail Results */}
              {results.gmail.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-1">
                    <Mail className="w-3.5 h-3.5 text-rose-500" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Gmail Messages ({results.gmail.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {results.gmail.map((msg) => (
                      <div
                        key={msg.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-rose-500/30 transition-colors"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                            {msg.title}
                          </p>
                          <span className="text-[10px] text-slate-400 flex-shrink-0 ml-2">
                            {new Date(msg.timestamp).toLocaleDateString()}
                          </span>
                        </div>
                        {msg.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                            {msg.description}
                          </p>
                        )}
                        {msg.metadata?.sender && (
                          <p className="text-[10px] text-rose-500 font-medium mt-1">
                            From: {msg.metadata.sender}
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* GitHub Results */}
              {results.github.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-1">
                    <Github className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      GitHub Repos & Events ({results.github.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {results.github.map((gh) => (
                      <div
                        key={gh.id}
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-indigo-500/30 transition-colors flex items-center justify-between"
                      >
                        <div>
                          <p className="text-xs font-bold text-slate-900 dark:text-white">
                            {gh.title}
                          </p>
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                            {gh.description}
                          </p>
                        </div>
                        {gh.url && (
                          <a
                            href={gh.url}
                            target="_blank"
                            rel="noreferrer"
                            className="p-1.5 rounded-lg bg-indigo-500/10 text-indigo-500 hover:bg-indigo-500/20"
                          >
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Calendar Results */}
              {results.calendar.length > 0 && (
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 px-1">
                    <Calendar className="w-3.5 h-3.5 text-blue-500" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                      Google Calendar Events ({results.calendar.length})
                    </span>
                  </div>
                  <div className="space-y-1">
                    {results.calendar.map((cal) => (
                      <a
                        key={cal.id}
                        href={cal.url || '#'}
                        target="_blank"
                        rel="noreferrer"
                        className="p-3 rounded-2xl bg-slate-50 dark:bg-slate-800/40 border border-slate-200/60 dark:border-slate-800 hover:border-blue-500/30 transition-colors block group"
                      >
                        <div className="flex items-center justify-between">
                          <p className="text-xs font-bold text-slate-900 dark:text-white group-hover:text-blue-500">
                            {cal.title}
                          </p>
                          <span className="text-[10px] text-slate-400">
                            {new Date(cal.timestamp).toLocaleString([], {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit',
                            })}
                          </span>
                        </div>
                        {cal.description && (
                          <p className="text-[11px] text-slate-500 dark:text-slate-400 line-clamp-1 mt-1">
                            {cal.description}
                          </p>
                        )}
                      </a>
                    ))}
                  </div>
                </div>
              )}

            </div>
          )}

        </div>
      </div>
    </div>
  );
};
