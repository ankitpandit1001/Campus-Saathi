import React from 'react';
import { StatusBadge, RoleBadge } from '../common/Badge';
import { Clock, User } from 'lucide-react';

export function StatusTimeline({ history = [] }) {
  if (!history || history.length === 0) {
    return <p className="text-sm text-slate-500 dark:text-slate-400 py-3">No status history available.</p>;
  }

  return (
    <div className="flow-root">
      <ul className="-mb-8">
        {history.map((item, itemIdx) => {
          const isLast = itemIdx === history.length - 1;

          return (
            <li key={item.id || itemIdx}>
              <div className="relative pb-8">
                {!isLast && (
                  <span
                    className="absolute left-4 top-4 -ml-px h-full w-0.5 bg-slate-200 dark:bg-slate-800"
                    aria-hidden="true"
                  />
                )}
                <div className="relative flex space-x-3 items-start">
                  <div>
                    <span className="h-8 w-8 rounded-full bg-blue-100 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 flex items-center justify-center ring-4 ring-white dark:ring-slate-900 shadow-sm">
                      <Clock className="w-4 h-4" />
                    </span>
                  </div>
                  <div className="flex min-w-0 flex-1 justify-between space-x-4 pt-0.5">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Transitioned to</span>
                        <StatusBadge status={item.newStatus} />
                      </div>

                      {item.notes && (
                        <p className="text-sm text-slate-700 dark:text-slate-300 bg-slate-50 dark:bg-slate-800/60 rounded-xl p-2.5 border border-slate-100 dark:border-slate-800">
                          {item.notes}
                        </p>
                      )}

                      <div className="flex items-center space-x-2 text-xs text-slate-400 dark:text-slate-500">
                        {item.changedBy && (
                          <span className="inline-flex items-center space-x-1">
                            <User className="w-3 h-3" />
                            <span className="font-semibold text-slate-600 dark:text-slate-300">{item.changedBy.name}</span>
                            <span className="text-slate-400 dark:text-slate-500">({item.changedBy.role})</span>
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="whitespace-nowrap text-right text-xs text-slate-400 dark:text-slate-500 font-medium">
                      {new Date(item.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
