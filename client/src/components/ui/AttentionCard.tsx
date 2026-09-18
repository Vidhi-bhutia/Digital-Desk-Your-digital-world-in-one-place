import React from 'react';
import { LucideIcon, ArrowUpRight } from 'lucide-react';
import { Badge } from './Badge.js';

interface AttentionCardProps {
  title: string;
  description: string;
  type: 'urgent' | 'warning' | 'info';
  icon: LucideIcon;
  actionText?: string;
  onAction?: () => void;
  link?: string;
}

export const AttentionCard: React.FC<AttentionCardProps> = ({
  title,
  description,
  type,
  icon: Icon,
  actionText = 'View',
  onAction,
  link,
}) => {
  const badgeVariant = {
    urgent: 'rose' as const,
    warning: 'amber' as const,
    info: 'indigo' as const,
  };

  const bgStyles = {
    urgent: 'bg-rose-500/5 border-rose-500/20 text-rose-600 dark:text-rose-400',
    warning: 'bg-amber-500/5 border-amber-500/20 text-amber-700 dark:text-amber-400',
    info: 'bg-indigo-500/5 border-indigo-500/20 text-indigo-600 dark:text-indigo-400',
  };

  return (
    <div className={`p-3.5 rounded-2xl border ${bgStyles[type]} flex items-center justify-between transition-all hover:shadow-soft-sm`}>
      <div className="flex items-center space-x-3">
        <div className="p-2 rounded-xl bg-white dark:bg-slate-800 shadow-xs flex-shrink-0">
          <Icon className="w-4 h-4" />
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <h4 className="text-xs font-bold text-slate-900 dark:text-white leading-none">{title}</h4>
            <Badge variant={badgeVariant[type]}>{type.toUpperCase()}</Badge>
          </div>
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-1 leading-tight line-clamp-1">
            {description}
          </p>
        </div>
      </div>

      {link ? (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-0.5 ml-2 flex-shrink-0"
        >
          <span>{actionText}</span>
          <ArrowUpRight className="w-3 h-3" />
        </a>
      ) : onAction ? (
        <button
          onClick={onAction}
          className="text-xs font-semibold text-indigo-600 dark:text-indigo-400 hover:underline flex items-center space-x-0.5 ml-2 flex-shrink-0"
        >
          <span>{actionText}</span>
          <ArrowUpRight className="w-3 h-3" />
        </button>
      ) : null}
    </div>
  );
};
