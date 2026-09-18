import React from 'react';
import { LucideIcon, CheckCircle2, XCircle, ExternalLink, RefreshCw, Trash2 } from 'lucide-react';
import { Badge } from './Badge.js';

export interface ChildService {
  name: string;
  icon: LucideIcon;
  status: 'active' | 'inactive';
}

interface IntegrationCardProps {
  name: string;
  provider: 'github' | 'google' | 'weather';
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  isConnected: boolean;
  lastSynced?: string;
  childrenServices?: ChildService[];
  onConnect: () => void;
  onDisconnect?: () => void;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  name,
  icon: Icon,
  iconBg,
  iconColor,
  isConnected,
  lastSynced = 'Just now',
  childrenServices = [],
  onConnect,
  onDisconnect,
}) => {
  return (
    <div className="desk-surface p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-6">
      {/* Top Header Row */}
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{name}</h3>
              {isConnected ? (
                <Badge variant="emerald" size="sm">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Connected</span>
                </Badge>
              ) : (
                <Badge variant="slate" size="sm">
                  <XCircle className="w-3 h-3" />
                  <span>Not Connected</span>
                </Badge>
              )}
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              Last synced: <span className="font-medium text-slate-700 dark:text-slate-300">{lastSynced}</span>
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2">
          {isConnected ? (
            <>
              <button
                onClick={onConnect}
                className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 transition-colors"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                <span>Re-sync</span>
              </button>
              {onDisconnect && (
                <button
                  onClick={onDisconnect}
                  className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 transition-colors"
                  title="Disconnect Integration"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              )}
            </>
          ) : (
            <button
              onClick={onConnect}
              className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5 transition-colors"
            >
              <span>Connect {name}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Connected Sub-services Tree Structure */}
      {childrenServices.length > 0 && (
        <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-4 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Connected Services Tree
          </p>

          <div className="pl-2 space-y-1.5 font-mono text-xs text-slate-600 dark:text-slate-300">
            {childrenServices.map((child, idx) => {
              const isLast = idx === childrenServices.length - 1;
              const treeSymbol = isLast ? '└── ' : '├── ';
              const ChildIcon = child.icon;

              return (
                <div key={child.name} className="flex items-center space-x-2">
                  <span className="text-slate-400 font-bold">{treeSymbol}</span>
                  <div className="flex items-center space-x-2 px-2.5 py-1 rounded-lg bg-slate-100/70 dark:bg-slate-800/50">
                    <ChildIcon className="w-3.5 h-3.5 text-indigo-500" />
                    <span className="font-sans font-semibold text-xs text-slate-800 dark:text-slate-200">{child.name}</span>
                    <span className={`w-1.5 h-1.5 rounded-full ${isConnected ? 'bg-emerald-400' : 'bg-slate-400'}`} />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
};
