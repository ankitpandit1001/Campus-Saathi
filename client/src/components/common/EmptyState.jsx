import React from 'react';
import { Inbox } from 'lucide-react';

export function EmptyState({
  icon: Icon = Inbox,
  title = 'No records found',
  description = 'There are no items matching your criteria at this moment.',
  action,
}) {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm my-4 transition-colors">
      <div className="w-14 h-14 rounded-2xl bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-base font-bold text-slate-800 dark:text-slate-200">{title}</h3>
      <p className="text-sm text-slate-500 dark:text-slate-400 max-w-sm mt-1 mb-5">{description}</p>
      {action && <div>{action}</div>}
    </div>
  );
}
