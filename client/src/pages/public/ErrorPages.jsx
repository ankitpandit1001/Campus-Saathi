import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft } from 'lucide-react';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export function UnauthorizedPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center transition-colors relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <div className="w-16 h-16 rounded-2xl bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center mb-6 shadow-inner border border-rose-200 dark:border-rose-900">
        <ShieldAlert className="w-8 h-8" />
      </div>
      <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">Access Denied (403)</h1>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md">
        You do not have permission to view or modify this resource. Only authorized roles can access this area.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Return to Safety</span>
        </Link>
      </div>
    </div>
  );
}

export function NotFoundPage() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 flex flex-col items-center justify-center p-4 text-center transition-colors relative">
      <div className="absolute top-4 right-4">
        <ThemeToggle />
      </div>
      <h1 className="text-6xl font-black text-slate-300 dark:text-slate-700 tracking-tight font-mono">404</h1>
      <h2 className="text-2xl font-bold text-slate-900 dark:text-white mt-2">Page Not Found</h2>
      <p className="mt-2 text-sm text-slate-600 dark:text-slate-400 max-w-md">
        The page you are looking for does not exist or has been moved to another location.
      </p>
      <div className="mt-6">
        <Link
          to="/"
          className="inline-flex items-center space-x-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 px-6 py-2.5 rounded-xl shadow-md transition-all"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Home</span>
        </Link>
      </div>
    </div>
  );
}
