import React, { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LogIn,
  KeyRound,
  Mail,
  Sparkles,
  Eye,
  EyeOff,
  ShieldCheck,
  Wrench,
  GraduationCap,
  ArrowLeft,
  Building2,
  Crown,
  Compass,
  PlusCircle,
} from 'lucide-react';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [activeRoleTab, setActiveRoleTab] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const res = await login(email, password);
    setLoading(false);

    if (res.success) {
      if (from) {
        navigate(from, { replace: true });
      } else if (res.user.isSuperAdmin) {
        navigate('/platform/dashboard', { replace: true });
      } else if (res.user.role === 'ADMIN') {
        navigate('/admin/dashboard', { replace: true });
      } else if (res.user.role === 'STAFF') {
        navigate('/staff/dashboard', { replace: true });
      } else {
        navigate('/dashboard', { replace: true });
      }
    } else {
      setError(res.message);
    }
  };

  const handleQuickLogin = (key, demoEmail, demoPassword) => {
    setActiveRoleTab(key);
    setEmail(demoEmail);
    setPassword(demoPassword);
    setError('');
  };

  return (
    <div className="glass-card p-6 sm:p-10 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl relative overflow-hidden transition-all duration-300">
      {/* Decorative top accent line */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-blue-500 via-indigo-500 to-amber-500" />

      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <div className="flex items-center space-x-2 text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
            <Building2 className="w-3.5 h-3.5" />
            <span>Multi-Tenant Platform</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight">
            Sign In
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Access your campus complaint & maintenance operations
          </p>
        </div>
        <Link
          to="/"
          className="text-xs font-semibold text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Home</span>
        </Link>
      </div>

      {error && (
        <div className="mb-5 p-3.5 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-rose-700 dark:text-rose-300 text-xs font-semibold animate-in fade-in duration-150">
          {error}
        </div>
      )}

      {/* 1-Click Role Switcher */}
      <div className="mb-6 p-2.5 rounded-2xl bg-slate-100/80 dark:bg-slate-850/80 border border-slate-200/80 dark:border-slate-800">
        <div className="flex items-center justify-between px-1.5 mb-2">
          <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center">
            <Sparkles className="w-3 h-3 text-blue-500 mr-1" /> Quick Demo Accounts (1-Click Fill)
          </span>
          <span className="text-[9px] font-mono text-emerald-600 dark:text-emerald-400 font-bold bg-emerald-50 dark:bg-emerald-950 px-1.5 py-0.2 rounded border border-emerald-300 dark:border-emerald-800">
            Seeded Data
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5">
          <button
            type="button"
            onClick={() => handleQuickLogin('STUDENT', 'rahul.sharma@campusfix.edu', 'Student@123')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${
              activeRoleTab === 'STUDENT'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-500/25 scale-[1.02]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 bg-white/40 dark:bg-slate-900/40'
            }`}
          >
            <GraduationCap className="w-4 h-4 mb-0.5 text-blue-400" />
            <span className="text-[11px]">Student</span>
            <span className="text-[9px] opacity-75 font-normal">Northstar / Rahul</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('STAFF', 'anita.network@campusfix.edu', 'Staff@123')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${
              activeRoleTab === 'STAFF'
                ? 'bg-teal-600 text-white shadow-md shadow-teal-500/25 scale-[1.02]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 bg-white/40 dark:bg-slate-900/40'
            }`}
          >
            <Wrench className="w-4 h-4 mb-0.5 text-teal-400" />
            <span className="text-[11px]">Staff</span>
            <span className="text-[9px] opacity-75 font-normal">Engineer Anita</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('ADMIN', 'admin@campusfix.edu', 'Admin@123')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${
              activeRoleTab === 'ADMIN'
                ? 'bg-indigo-600 text-white shadow-md shadow-indigo-500/25 scale-[1.02]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 bg-white/40 dark:bg-slate-900/40'
            }`}
          >
            <ShieldCheck className="w-4 h-4 mb-0.5 text-indigo-400" />
            <span className="text-[11px]">Inst. Admin</span>
            <span className="text-[9px] opacity-75 font-normal">Northstar Admin</span>
          </button>

          <button
            type="button"
            onClick={() => handleQuickLogin('SUPERADMIN', 'superadmin@campusfix.io', 'SuperAdmin@123')}
            className={`flex flex-col items-center justify-center p-2 rounded-xl text-xs font-bold transition-all ${
              activeRoleTab === 'SUPERADMIN'
                ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/25 scale-[1.02]'
                : 'text-slate-700 dark:text-slate-300 hover:bg-white dark:hover:bg-slate-800 bg-white/40 dark:bg-slate-900/40'
            }`}
          >
            <Crown className="w-4 h-4 mb-0.5 text-amber-500" />
            <span className="text-[11px]">Super Admin</span>
            <span className="text-[9px] opacity-75 font-normal">Root Platform</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Email Address
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <Mail className="w-4 h-4" />
            </div>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="e.g. rahul.sharma@northstar.edu"
              className="block w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
            Password
          </label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
              <KeyRound className="w-4 h-4" />
            </div>
            <input
              type={showPassword ? 'text' : 'password'}
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="block w-full pl-10 pr-10 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition-colors"
              aria-label={showPassword ? 'Hide password' : 'Show password'}
            >
              {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
            </button>
          </div>
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full flex items-center justify-center space-x-2 py-3.5 px-4 rounded-xl text-sm font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:ring-offset-2 dark:focus:ring-offset-slate-900 shadow-lg shadow-blue-600/30 transition-all hover:scale-[1.01] active:scale-[0.99] disabled:opacity-50 mt-2"
        >
          <LogIn className="w-4 h-4" />
          <span>{loading ? 'Authenticating...' : 'Sign In to CampusSaathi'}</span>
        </button>
      </form>

      {/* Directory and Registration Links */}
      <div className="mt-6 pt-5 border-t border-slate-200/80 dark:border-white/10 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
        <Link
          to="/institutions"
          className="inline-flex items-center space-x-1 font-semibold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400"
        >
          <Compass className="w-3.5 h-3.5" />
          <span>Browse Campus Directory</span>
        </Link>

        <Link
          to="/register-institution"
          className="inline-flex items-center space-x-1 font-bold text-blue-600 dark:text-blue-400 hover:underline"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Register New Institution</span>
        </Link>
      </div>

      <div className="mt-4 text-center text-xs text-slate-500 dark:text-slate-400">
        New student on campus?{' '}
        <Link to="/register" className="font-bold text-blue-600 dark:text-blue-400 hover:underline">
          Create student account
        </Link>
      </div>
    </div>
  );
}
