import React from 'react';
import { LucideIcon } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  trend?: string;
  onClick?: () => void;
}

export const StatCard: React.FC<StatCardProps> = ({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  trend,
  onClick,
}) => {
  return (
    <div
      onClick={onClick}
      className={`desk-surface desk-surface-hover p-4 rounded-2xl shadow-soft-sm flex items-center justify-between cursor-pointer border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e]`}
    >
      <div className="flex items-center space-x-3.5">
        <div className={`w-11 h-11 rounded-2xl ${iconBg} flex items-center justify-center ${iconColor} flex-shrink-0 shadow-sm`}>
          <Icon className="w-5 h-5" />
        </div>
        <div>
          <p className="text-xs font-semibold text-slate-500 dark:text-slate-400">{title}</p>
          <div className="flex items-baseline space-x-2 mt-0.5">
            <span className="text-xl font-bold text-slate-900 dark:text-white tracking-tight">{value}</span>
            {subtitle && (
              <span className="text-[11px] text-slate-400 font-medium">{subtitle}</span>
            )}
          </div>
        </div>
      </div>

      {trend && (
        <span className="text-[11px] font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
          {trend}
        </span>
      )}
    </div>
  );
};
