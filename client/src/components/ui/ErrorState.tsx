import React from 'react';
import { AlertCircle } from 'lucide-react';

export const ErrorState: React.FC<{ message?: string; onRetry?: () => void }> = ({
  message = 'An unexpected error occurred.',
  onRetry,
}) => {
  return (
    <div className="p-6 rounded-3xl bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 flex flex-col items-center justify-center text-center space-y-2">
      <AlertCircle className="w-6 h-6" />
      <p className="text-xs font-semibold">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="mt-1 px-3 py-1.5 rounded-xl bg-rose-500/20 hover:bg-rose-500/30 text-xs font-bold transition-colors"
        >
          Try Again
        </button>
      )}
    </div>
  );
};
