import React from 'react';
import { Clock, MapPin, ExternalLink } from 'lucide-react';

interface EventCardProps {
  title: string;
  startTime: string;
  endTime?: string;
  location?: string;
  link?: string;
}

export const EventCard: React.FC<EventCardProps> = ({
  title,
  startTime,
  endTime,
  location,
  link,
}) => {
  return (
    <div className="desk-surface desk-surface-hover p-3.5 rounded-2xl border border-slate-200/80 dark:border-slate-800/80 bg-white/90 dark:bg-[#151c2e] space-y-2">
      <div className="flex items-start justify-between">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
          <h4 className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{title}</h4>
        </div>
        {link && (
          <a
            href={link}
            target="_blank"
            rel="noreferrer"
            className="text-slate-400 hover:text-blue-500 transition-colors"
          >
            <ExternalLink className="w-3.5 h-3.5" />
          </a>
        )}
      </div>

      <div className="flex items-center space-x-3 text-[11px] text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-1">
          <Clock className="w-3 h-3 text-blue-500" />
          <span>{startTime} {endTime ? `- ${endTime}` : ''}</span>
        </div>
        {location && (
          <div className="flex items-center space-x-1 truncate max-w-[130px]">
            <MapPin className="w-3 h-3 text-slate-400" />
            <span className="truncate">{location}</span>
          </div>
        )}
      </div>
    </div>
  );
};
