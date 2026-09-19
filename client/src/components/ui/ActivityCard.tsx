import React from 'react';
import { LucideIcon, ExternalLink } from 'lucide-react';
import { Badge } from './Badge';

interface ActivityCardProps {
  time: string;
  source: 'GitHub' | 'Gmail' | 'Calendar';
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  title: string;
  description?: string;
  link?: string;
}

export const ActivityCard: React.FC<ActivityCardProps> = ({
  time,
  source,
  icon: Icon,
  iconBg,
  iconColor,
  title,
  description,
  link,
}) => {
  const sourceVariant = {
    GitHub: 'indigo' as const,
    Gmail: 'rose' as const,
    Calendar: 'blue' as const,
  };

  return (
    <div className="flex items-start space-x-3.5 group p-3 rounded-2xl hover:bg-slate-100/60 dark:hover:bg-slate-800/40 transition-colors border border-transparent hover:border-slate-200/50 dark:hover:border-slate-800/50">
      {/* Time Tag */}
      <span className="text-xs font-mono font-semibold text-slate-500 dark:text-slate-400 mt-1 min-w-[45px]">
        {time}
      </span>

      {/* Source Icon Badge */}
      <div className={`w-8 h-8 rounded-xl ${iconBg} ${iconColor} flex items-center justify-center flex-shrink-0 mt-0.5 shadow-sm`}>
        <Icon className="w-4 h-4" />
      </div>

      {/* Activity Details */}
      <div className="flex-1 min-w-0">
        <div className="flex items-center space-x-2">
          <Badge variant={sourceVariant[source]}>{source}</Badge>
          <h4 className="text-xs font-semibold text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
            {title}
          </h4>
        </div>
        {description && (
          <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1 leading-relaxed">
            {description}
          </p>
        )}
      </div>

      {link && (
        <a
          href={link}
          target="_blank"
          rel="noreferrer"
          className="text-slate-400 hover:text-indigo-600 dark:hover:text-indigo-400 p-1 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"
        >
          <ExternalLink className="w-3.5 h-3.5" />
        </a>
      )}
    </div>
  );
};
