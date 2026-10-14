import React from 'react';
import { Outlet, Link } from 'react-router-dom';
import { Building2, ShieldCheck, Clock, CheckCircle, Sparkles } from 'lucide-react';
import { ThemeToggle } from '../components/common/ThemeToggle';

export function AuthLayout() {
  return (
    <div className="flex min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100">
      {/* Left Marketing Panel - Desktop Only */}
      <div className="hidden lg:flex lg:w-1/2 bg-slate-900 dark:bg-slate-950 text-white p-12 flex-col justify-between relative overflow-hidden border-r border-slate-800">
        {/* Subtle background glow */}
        <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 rounded-full bg-blue-600/20 blur-3xl animate-pulse-slow" />
        <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-96 h-96 rounded-full bg-indigo-600/20 blur-3xl animate-pulse-slow" />

        <div className="relative z-10">
          <Link to="/" className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/30">
              <Building2 className="w-6 h-6" />
            </div>
            <span className="text-2xl font-black tracking-tight font-mono">
              Campus<span className="text-blue-400">Saathi</span>
            </span>
          </Link>
        </div>

        <div className="relative z-10 max-w-md my-auto">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-4">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Smart Campus Infrastructure</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight text-white sm:text-4xl leading-tight">
            Streamlining campus maintenance with transparency and speed.
          </h1>
          <p className="mt-4 text-slate-300 text-sm leading-relaxed">
            Report classroom faults, hostel electricity outages, Wi-Fi deadzones, and sanitation concerns in seconds. Track resolution timelines in real time.
          </p>

          <div className="mt-8 space-y-3.5 text-xs text-slate-300">
            <div className="flex items-center space-x-3">
              <CheckCircle className="w-4 h-4 text-emerald-400 flex-shrink-0" />
              <span>Real-time status tracking & verified photo attachments</span>
            </div>
            <div className="flex items-center space-x-3">
              <Clock className="w-4 h-4 text-blue-400 flex-shrink-0" />
              <span>Category SLAs with automated overdue escalation alerts</span>
            </div>
            <div className="flex items-center space-x-3">
              <ShieldCheck className="w-4 h-4 text-indigo-400 flex-shrink-0" />
              <span>Enterprise role-based access for students, staff, and admin</span>
            </div>
          </div>
        </div>

        <div className="relative z-10 text-xs text-slate-500 flex justify-between">
          <span>&copy; {new Date().getFullYear()} CampusSaathi Enterprise Suite</span>
          <span>B.Tech CSE Major Project</span>
        </div>
      </div>

      {/* Right Form Container */}
      <div className="flex flex-1 flex-col justify-center px-4 py-12 sm:px-6 lg:px-20 xl:px-24 relative bg-slate-50 dark:bg-slate-950">
        {/* Top Right Controls (Theme Toggle) */}
        <div className="absolute top-6 right-6 flex items-center space-x-3 z-50">
          <ThemeToggle variant="icon" />
        </div>

        <div className="mx-auto w-full max-w-md">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-8">
            <Link to="/" className="inline-flex items-center space-x-2.5">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white font-bold shadow-md shadow-blue-500/20">
                <Building2 className="w-5 h-5" />
              </div>
              <span className="text-xl font-bold font-mono text-slate-900 dark:text-white">
                Campus<span className="text-blue-600 dark:text-blue-400">Saathi</span>
              </span>
            </Link>
          </div>

          <Outlet />
        </div>
      </div>
    </div>
  );
}
