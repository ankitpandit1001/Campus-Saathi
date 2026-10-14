import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import {
  LayoutDashboard,
  PlusCircle,
  FileText,
  User,
  ShieldCheck,
  Wrench,
  CheckSquare,
  BarChart3,
  Tags,
  Users,
  ScrollText,
  LogOut,
  X,
  Building2,
  Compass,
  Sliders,
  UserCheck,
  Crown,
  Sparkles,
} from 'lucide-react';

export function Sidebar({ isOpen, onClose }) {
  const { user, activeInstitution, logout } = useAuth();
  const role = user?.role;

  const studentLinks = [
    { to: '/dashboard', label: 'Student Dashboard', icon: LayoutDashboard },
    { to: '/submit-complaint', label: 'Submit Complaint', icon: PlusCircle },
    { to: '/my-complaints', label: 'My Complaints', icon: FileText },
    { to: '/institutions', label: 'Explore Institutions', icon: Compass },
    { to: '/profile', label: 'Profile & Settings', icon: User },
  ];

  const staffLinks = [
    { to: '/staff/dashboard', label: 'Staff Dashboard', icon: LayoutDashboard },
    { to: '/staff/complaints', label: 'Assigned Complaints', icon: CheckSquare },
    { to: '/staff/stats', label: 'Work Statistics', icon: BarChart3 },
    { to: '/institutions', label: 'Explore Institutions', icon: Compass },
    { to: '/staff/profile', label: 'Staff Profile', icon: User },
  ];

  const adminLinks = [
    { to: '/admin/dashboard', label: 'Overview Dashboard', icon: LayoutDashboard },
    { to: '/admin/complaints', label: 'All Complaints', icon: FileText },
    { to: '/admin/members', label: 'Member Governance', icon: UserCheck },
    { to: '/admin/categories', label: 'Categories & SLA', icon: Tags },
    { to: '/admin/users', label: 'Staff Roster', icon: Users },
    { to: '/admin/institution-settings', label: 'Campus Settings', icon: Sliders },
    { to: '/admin/analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { to: '/admin/audit-logs', label: 'Audit Logs', icon: ScrollText },
    { to: '/institutions', label: 'Campus Directory', icon: Compass },
    { to: '/admin/profile', label: 'Admin Settings', icon: User },
  ];

  const navLinks = role === 'ADMIN' ? adminLinks : role === 'STAFF' ? staffLinks : studentLinks;

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/70 backdrop-blur-md md:hidden animate-in fade-in duration-200"
          onClick={onClose}
          aria-hidden="true"
        />
      )}

      <aside
        className={`fixed top-0 bottom-0 left-0 z-50 flex w-64 flex-col justify-between border-r border-slate-200/80 dark:border-white/10 bg-white/95 dark:bg-slate-950/95 backdrop-blur-2xl text-slate-700 dark:text-slate-300 transition-transform duration-300 ease-in-out md:static md:translate-x-0 overflow-y-auto ${
          isOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full'
        }`}
      >
        <div>
          {/* Logo Brand */}
          <div className="flex h-16 items-center justify-between px-6 border-b border-slate-200/80 dark:border-white/10">
            <div className="flex items-center space-x-3">
              <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/30">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-lg font-black font-display tracking-tight text-slate-900 dark:text-white flex items-center">
                  Campus<span className="text-blue-600 dark:text-blue-400">Saathi</span>
                </span>
                <span className="block text-[9px] font-extrabold text-slate-400 dark:text-slate-500 uppercase tracking-widest leading-none mt-0.5">
                  Multi-Institution SaaS
                </span>
              </div>
            </div>
            <button
              onClick={onClose}
              className="rounded-lg p-1 text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 md:hidden transition-colors"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Active Institution Badge Card */}
          <div className="p-3 mx-3 my-3 rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 shadow-sm">
            <div className="flex items-center space-x-2.5">
              <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500/15 to-indigo-500/15 border border-blue-500/30 flex items-center justify-center text-blue-600 dark:text-blue-400 font-black text-xs flex-shrink-0">
                {activeInstitution?.code ? activeInstitution.code.slice(0, 3) : <Building2 className="w-4 h-4" />}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-black text-slate-900 dark:text-white truncate font-display">
                  {activeInstitution?.name || 'Public Portal'}
                </p>
                <p className="text-[10px] text-blue-600 dark:text-blue-400 font-extrabold uppercase tracking-wider font-mono">
                  {role} • {activeInstitution?.city || 'Campus'}
                </p>
              </div>
            </div>
          </div>

          {/* Super Admin Access Banner (if user has super admin privileges) */}
          {user?.isSuperAdmin && (
            <div className="px-3 mb-2">
              <NavLink
                to="/platform/dashboard"
                onClick={() => onClose()}
                className={({ isActive }) =>
                  `flex items-center justify-between px-3 py-2 rounded-xl text-xs font-black transition-all border ${
                    isActive
                      ? 'bg-amber-500 text-slate-950 border-amber-400 shadow-md shadow-amber-500/25'
                      : 'bg-amber-50 dark:bg-amber-950/40 border-amber-300 dark:border-amber-800 text-amber-800 dark:text-amber-300 hover:bg-amber-100 dark:hover:bg-amber-900/50'
                  }`
                }
              >
                <div className="flex items-center space-x-2">
                  <Crown className="w-4 h-4 text-amber-600 dark:text-amber-400" />
                  <span>Platform Super Admin</span>
                </div>
                <span className="text-[9px] font-mono font-bold uppercase tracking-wider bg-amber-200 dark:bg-amber-900 px-1.5 py-0.5 rounded">
                  Root
                </span>
              </NavLink>
            </div>
          )}

          {/* Navigation Links */}
          <nav className="space-y-0.5 px-3">
            {navLinks.map((item) => {
              const Icon = item.icon;
              return (
                <NavLink
                  key={item.to}
                  to={item.to}
                  onClick={() => onClose()}
                  className={({ isActive }) =>
                    `group relative flex items-center px-3.5 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 font-extrabold'
                        : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-900 hover:text-slate-900 dark:hover:text-white'
                    }`
                  }
                >
                  <Icon className="w-4 h-4 mr-3 flex-shrink-0 transition-transform group-hover:scale-110" />
                  <span>{item.label}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* Footer controls */}
        <div className="p-4 border-t border-slate-200/80 dark:border-white/10 mt-auto">
          <button
            onClick={logout}
            className="flex w-full items-center px-3.5 py-2.5 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 transition-colors"
          >
            <LogOut className="w-4 h-4 mr-3" />
            <span>Sign Out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
