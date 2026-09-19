import React, { useState } from 'react';
import { LucideIcon, CheckCircle2, XCircle, ExternalLink, RefreshCw, Trash2, AlertCircle, Loader2 } from 'lucide-react';
import { Badge } from './Badge';

export interface ChildService {
  name: string;
  icon: LucideIcon;
  status: 'active' | 'inactive';
}

export type IntegrationStatus = 'disconnected' | 'connecting' | 'connected' | 'syncing' | 'failed' | 'expired';

interface IntegrationCardProps {
  name: string;
  provider: 'github' | 'google' | 'weather';
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  status: IntegrationStatus;
  lastSynced?: string;
  childrenServices?: ChildService[];
  errorMessage?: string;
  onConnect: () => void;
  onSync?: () => Promise<void>;
  onDisconnect?: () => Promise<void>;
}

export const IntegrationCard: React.FC<IntegrationCardProps> = ({
  name,
  icon: Icon,
  iconBg,
  iconColor,
  status,
  lastSynced,
  childrenServices = [],
  errorMessage,
  onConnect,
  onSync,
  onDisconnect,
}) => {
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncFeedback, setSyncFeedback] = useState<string | null>(null);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [isDisconnecting, setIsDisconnecting] = useState(false);

  const handleSyncClick = async () => {
    if (!onSync || isSyncing) return;
    setIsSyncing(true);
    setSyncFeedback(null);
    try {
      await onSync();
      setSyncFeedback('Sync successful');
    } catch (err: any) {
      setSyncFeedback('Sync failed. Try again.');
    } finally {
      setIsSyncing(false);
      setTimeout(() => setSyncFeedback(null), 4000);
    }
  };

  const handleConfirmDisconnect = async () => {
    if (!onDisconnect || isDisconnecting) return;
    setIsDisconnecting(true);
    try {
      await onDisconnect();
      setShowConfirmModal(false);
    } catch (err) {
      console.error(err);
    } finally {
      setIsDisconnecting(false);
    }
  };

  const renderBadge = () => {
    switch (status) {
      case 'connected':
        return (
          <Badge variant="emerald" size="sm">
            <CheckCircle2 className="w-3 h-3" />
            <span>Connected</span>
          </Badge>
        );
      case 'syncing':
        return (
          <Badge variant="indigo" size="sm">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Syncing...</span>
          </Badge>
        );
      case 'failed':
        return (
          <Badge variant="rose" size="sm">
            <AlertCircle className="w-3 h-3" />
            <span>Connection failed</span>
          </Badge>
        );
      case 'expired':
        return (
          <Badge variant="amber" size="sm">
            <AlertCircle className="w-3 h-3" />
            <span>Expired</span>
          </Badge>
        );
      case 'connecting':
        return (
          <Badge variant="indigo" size="sm">
            <Loader2 className="w-3 h-3 animate-spin" />
            <span>Connecting...</span>
          </Badge>
        );
      default:
        return (
          <Badge variant="slate" size="sm">
            <XCircle className="w-3 h-3" />
            <span>Not Connected</span>
          </Badge>
        );
    }
  };

  return (
    <div className="desk-surface p-6 rounded-3xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] shadow-soft-sm space-y-6 relative">
      {/* Top Header Row */}
      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className={`w-12 h-12 rounded-2xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 shadow-sm`}>
            <Icon className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h3 className="text-base font-bold text-slate-900 dark:text-white">{name}</h3>
              {renderBadge()}
            </div>
            {lastSynced && (
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                Last synced: <span className="font-medium text-slate-700 dark:text-slate-300">{lastSynced}</span>
              </p>
            )}
            {errorMessage && (
              <p className="text-xs text-rose-500 mt-1 font-medium flex items-center space-x-1">
                <AlertCircle className="w-3.5 h-3.5 flex-shrink-0" />
                <span>{errorMessage}</span>
              </p>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center space-x-2 self-end sm:self-auto">
          {status === 'connected' || status === 'syncing' ? (
            <>
              {onSync && (
                <button
                  onClick={handleSyncClick}
                  disabled={isSyncing}
                  className="px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-xs font-semibold text-slate-700 dark:text-slate-200 flex items-center space-x-1.5 transition-colors disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
                  <span>{isSyncing ? 'Syncing...' : 'Sync Now'}</span>
                </button>
              )}
              {onDisconnect && (
                <button
                  onClick={() => setShowConfirmModal(true)}
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
              <span>{status === 'expired' ? 'Reconnect' : `Connect ${name}`}</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Sync Feedback Alert */}
      {syncFeedback && (
        <div className="p-2.5 rounded-xl bg-indigo-500/10 border border-indigo-500/20 text-xs font-semibold text-indigo-500 flex items-center justify-between">
          <span>{syncFeedback}</span>
        </div>
      )}

      {/* Connected Sub-services Tree Structure */}
      {childrenServices.length > 0 && (
        <div className="border-t border-slate-200/60 dark:border-slate-800/60 pt-4 space-y-2">
          <p className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider">
            Connected Services Scope
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
                    <span
                      className={`w-1.5 h-1.5 rounded-full ${
                        status === 'connected' ? 'bg-emerald-400' : 'bg-slate-400'
                      }`}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Disconnect Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/50 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="desk-surface p-6 rounded-3xl max-w-sm w-full bg-white dark:bg-[#151c2e] border border-slate-200 dark:border-slate-800 shadow-2xl space-y-4">
            <h3 className="text-sm font-bold text-slate-900 dark:text-white">Disconnect {name}?</h3>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Your {name} connection will stop syncing and stored cached items will be removed.
            </p>
            <div className="flex items-center justify-end gap-2 pt-2">
              <button
                onClick={() => setShowConfirmModal(false)}
                className="px-3.5 py-2 rounded-xl text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDisconnect}
                disabled={isDisconnecting}
                className="px-4 py-2 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-sm flex items-center space-x-1.5"
              >
                {isDisconnecting ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <span>Disconnect</span>}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
