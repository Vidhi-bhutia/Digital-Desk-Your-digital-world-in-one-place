import React from 'react';
import { Loader2 } from 'lucide-react';

export const LoadingState: React.FC<{ message?: string }> = ({
  message = 'Loading data...',
}) => {
  return (
    <div className="p-8 rounded-3xl desk-surface flex flex-col items-center justify-center space-y-3">
      <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
      <p className="text-xs font-medium text-slate-500 dark:text-slate-400">{message}</p>
    </div>
  );
};
