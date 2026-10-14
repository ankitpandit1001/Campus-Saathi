import React from 'react';

export function LoadingSpinner({ text = 'Loading...', size = 'md' }) {
  const sizeClasses = {
    sm: 'w-4 h-4 border-2',
    md: 'w-8 h-8 border-3',
    lg: 'w-12 h-12 border-4',
  }[size] || 'w-8 h-8 border-3';

  return (
    <div className="flex flex-col items-center justify-center p-8 text-center space-y-3">
      <div
        className={`${sizeClasses} border-slate-200 dark:border-slate-800 border-t-blue-600 dark:border-t-blue-400 rounded-full animate-spin`}
      />
      {text && <p className="text-sm font-semibold text-slate-500 dark:text-slate-400">{text}</p>}
    </div>
  );
}
