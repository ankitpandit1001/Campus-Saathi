import React from 'react';

export function StatusBadge({ status }) {
  const normalized = (status || '').toUpperCase();

  const config = {
    SUBMITTED: {
      bg: 'bg-sky-50 dark:bg-sky-950/60 text-sky-700 dark:text-sky-300 border-sky-200 dark:border-sky-800/80',
      label: 'Submitted',
    },
    UNDER_REVIEW: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/60 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800/80',
      label: 'Under Review',
    },
    ASSIGNED: {
      bg: 'bg-purple-50 dark:bg-purple-950/60 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800/80',
      label: 'Assigned',
    },
    IN_PROGRESS: {
      bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
      label: 'In Progress',
    },
    RESOLVED: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
      label: 'Resolved',
    },
    CLOSED: {
      bg: 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
      label: 'Closed',
    },
    REJECTED: {
      bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
      label: 'Rejected',
    },
    REOPENED: {
      bg: 'bg-orange-50 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 border-orange-200 dark:border-orange-800/80',
      label: 'Reopened',
    },
  }[normalized] || {
    bg: 'bg-slate-50 dark:bg-slate-850 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    label: status,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      <span className="w-1.5 h-1.5 rounded-full bg-current mr-1.5 opacity-80"></span>
      {config.label}
    </span>
  );
}

export function PriorityBadge({ priority }) {
  const normalized = (priority || '').toUpperCase();

  const config = {
    LOW: {
      bg: 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800/80',
      label: 'Low',
    },
    MEDIUM: {
      bg: 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-800/80',
      label: 'Medium',
    },
    HIGH: {
      bg: 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800/80',
      label: 'High Priority',
    },
  }[normalized] || {
    bg: 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700',
    label: priority,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold border ${config.bg}`}
    >
      {config.label}
    </span>
  );
}

export function RoleBadge({ role }) {
  const normalized = (role || '').toUpperCase();

  const config = {
    ADMIN: {
      bg: 'bg-indigo-50 dark:bg-indigo-950/80 text-indigo-700 dark:text-indigo-300 border-indigo-200 dark:border-indigo-800',
      label: 'Administrator',
    },
    STAFF: {
      bg: 'bg-teal-50 dark:bg-teal-950/80 text-teal-700 dark:text-teal-300 border-teal-200 dark:border-teal-800',
      label: 'Staff',
    },
    STUDENT: {
      bg: 'bg-blue-50 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-800',
      label: 'Student',
    },
  }[normalized] || {
    bg: 'bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-700',
    label: role,
  };

  return (
    <span
      className={`inline-flex items-center px-2.5 py-0.5 rounded-lg text-xs font-bold border ${config.bg}`}
    >
      {config.label}
    </span>
  );
}

