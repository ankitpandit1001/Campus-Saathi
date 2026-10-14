import React, { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useNotifications } from '../../context/NotificationContext';
import {
  Bell,
  Menu,
  User,
  LogOut,
  CheckCheck,
  ExternalLink,
  ShieldCheck,
  Building2,
  ChevronDown,
  Check,
  Compass,
  PlusCircle,
  Crown,
  Sparkles,
} from 'lucide-react';
import { RoleBadge } from '../common/Badge';
import { ThemeToggle } from '../common/ThemeToggle';

export function Navbar({ onToggleSidebar }) {
  const { user, activeInstitution, memberships, switchInstitution, logout } = useAuth();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotifications();
  const navigate = useNavigate();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [showInstitutionSwitcher, setShowInstitutionSwitcher] = useState(false);
  const [switching, setSwitching] = useState(false);

  const notifRef = useRef(null);
  const profileRef = useRef(null);
  const instRef = useRef(null);

  // Close menus when clicked outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
      if (profileRef.current && !profileRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (instRef.current && !instRef.current.contains(event.target)) {
        setShowInstitutionSwitcher(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const profilePath =
    user?.role === 'ADMIN'
      ? '/admin/profile'
      : user?.role === 'STAFF'
      ? '/staff/profile'
      : '/profile';

  const handleSwitch = async (instId) => {
    if (instId === activeInstitution?.id) {
      setShowInstitutionSwitcher(false);
      return;
    }
    setSwitching(true);
    await switchInstitution(instId);
    setSwitching(false);
    setShowInstitutionSwitcher(false);
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-white/10 glass-panel px-4 md:px-8 backdrop-blur-xl transition-colors duration-200">
      {/* Left: Mobile hamburger & Institution Workspace Picker */}
      <div className="flex items-center space-x-3">
        <button
          onClick={onToggleSidebar}
          className="rounded-xl p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-slate-800 md:hidden focus:outline-none transition-colors"
          aria-label="Toggle menu"
        >
          <Menu className="w-5 h-5" />
        </button>

        {/* Institution Switcher Pill */}
        <div className="relative" ref={instRef}>
          <button
            onClick={() => setShowInstitutionSwitcher(!showInstitutionSwitcher)}
            className="flex items-center space-x-2.5 px-3 py-1.5 rounded-2xl bg-slate-100/80 dark:bg-slate-900/80 hover:bg-slate-200/80 dark:hover:bg-slate-800 border border-slate-200/90 dark:border-white/10 transition-all text-left group shadow-sm"
          >
            <div className="w-7 h-7 rounded-lg bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-xs shadow-sm">
              <Building2 className="w-3.5 h-3.5" />
            </div>
            <div className="hidden sm:block">
              <div className="flex items-center space-x-1.5">
                <span className="text-xs font-black text-slate-900 dark:text-white truncate max-w-[150px] font-display">
                  {activeInstitution?.name || 'No Active Campus'}
                </span>
                {activeInstitution?.code && (
                  <span className="text-[10px] font-mono font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-1.5 py-0.2 rounded border border-blue-200 dark:border-blue-900">
                    {activeInstitution.code}
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-1 text-[10px] text-slate-400 dark:text-slate-500">
                <span className="font-extrabold text-blue-600 dark:text-blue-400">{user?.role}</span>
                <span>•</span>
                <span>Switch Tenant</span>
              </div>
            </div>
            <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-700 dark:group-hover:text-slate-200 transition-transform" />
          </button>

          {/* Institution Switcher Dropdown */}
          {showInstitutionSwitcher && (
            <div className="absolute left-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/90 dark:border-white/10 py-3 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-2xl">
              <div className="px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono font-extrabold uppercase tracking-widest text-slate-400">
                    Tenant Switcher
                  </span>
                  <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-200 dark:border-emerald-800">
                    Isolated Database Context
                  </span>
                </div>
                <p className="text-xs font-bold text-slate-900 dark:text-white mt-1">
                  Your Institution Memberships
                </p>
              </div>

              {/* Memberships List */}
              <div className="max-h-60 overflow-y-auto p-2 space-y-1">
                {memberships.length === 0 ? (
                  <div className="p-4 text-center text-xs text-slate-400">
                    No institution memberships found.
                  </div>
                ) : (
                  memberships.map((m) => {
                    const isActive = m.institution.id === activeInstitution?.id;
                    return (
                      <div
                        key={m.id}
                        onClick={() => handleSwitch(m.institution.id)}
                        className={`flex items-center justify-between p-3 rounded-xl transition-all cursor-pointer ${
                          isActive
                            ? 'bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-900/60'
                            : 'hover:bg-slate-50 dark:hover:bg-slate-800/60 border border-transparent'
                        }`}
                      >
                        <div className="flex items-center space-x-2.5">
                          <div
                            className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                              isActive
                                ? 'bg-blue-600 text-white'
                                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300'
                            }`}
                          >
                            <Building2 className="w-4 h-4" />
                          </div>
                          <div>
                            <div className="flex items-center space-x-1.5">
                              <p className="text-xs font-bold text-slate-900 dark:text-white">
                                {m.institution.name}
                              </p>
                              {m.institution.code && (
                                <span className="text-[9px] font-mono font-bold text-slate-400">
                                  [{m.institution.code}]
                                </span>
                              )}
                            </div>
                            <div className="flex items-center space-x-1.5 text-[10px] text-slate-400 mt-0.5">
                              <span className="font-semibold text-blue-600 dark:text-blue-400">
                                {m.role}
                              </span>
                              <span>•</span>
                              <span>{m.institution.city || 'Campus'}</span>
                            </div>
                          </div>
                        </div>

                        {isActive ? (
                          <span className="flex items-center space-x-1 text-[11px] font-bold text-blue-600 dark:text-blue-400">
                            <Check className="w-4 h-4" />
                            <span className="hidden sm:inline">Active</span>
                          </span>
                        ) : (
                          <button
                            disabled={switching}
                            className="px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-blue-600 hover:text-white transition-colors"
                          >
                            Switch
                          </button>
                        )}
                      </div>
                    );
                  })
                )}
              </div>

              {/* Super Admin Special Button */}
              {user?.isSuperAdmin && (
                <div className="px-2 pt-2 border-t border-slate-100 dark:border-slate-800">
                  <Link
                    to="/platform/dashboard"
                    onClick={() => setShowInstitutionSwitcher(false)}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-amber-500/10 via-purple-500/10 to-indigo-500/10 hover:from-amber-500/20 hover:to-indigo-500/20 border border-amber-500/30 text-amber-700 dark:text-amber-300 transition-all"
                  >
                    <div className="flex items-center space-x-2">
                      <Crown className="w-4 h-4 text-amber-500" />
                      <span className="text-xs font-black font-display">
                        Platform Super Admin Suite
                      </span>
                    </div>
                    <span className="text-[10px] font-mono font-bold uppercase bg-amber-500 text-white px-2 py-0.5 rounded-full">
                      Open
                    </span>
                  </Link>
                </div>
              )}

              {/* Bottom Actions */}
              <div className="px-3 pt-2.5 mt-2 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs">
                <Link
                  to="/institutions"
                  onClick={() => setShowInstitutionSwitcher(false)}
                  className="inline-flex items-center space-x-1 text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 font-semibold"
                >
                  <Compass className="w-3.5 h-3.5" />
                  <span>Browse Directory</span>
                </Link>

                <Link
                  to="/register-institution"
                  onClick={() => setShowInstitutionSwitcher(false)}
                  className="inline-flex items-center space-x-1 text-blue-600 dark:text-blue-400 hover:underline font-bold"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Register Campus</span>
                </Link>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Right: Super Admin Badge, Theme Toggle, Notifications & Profile */}
      <div className="flex items-center space-x-2.5 sm:space-x-3">
        {/* Super Admin Quick Link */}
        {user?.isSuperAdmin && (
          <Link
            to="/platform/dashboard"
            className="hidden lg:inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-xl text-xs font-black bg-gradient-to-r from-amber-500/15 via-purple-500/15 to-indigo-500/15 border border-amber-500/30 text-amber-700 dark:text-amber-300 hover:scale-105 transition-all shadow-sm"
          >
            <Crown className="w-3.5 h-3.5 text-amber-500" />
            <span>Super Admin</span>
          </Link>
        )}

        {/* Theme Toggle Button */}
        <ThemeToggle variant="dropdown" />

        {/* Notifications Dropdown */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="relative rounded-xl p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-white transition-colors border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
            aria-label="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900 animate-pulse">
                {unreadCount > 9 ? '9+' : unreadCount}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 py-3 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
              <div className="flex items-center justify-between px-4 pb-2.5 border-b border-slate-100 dark:border-slate-800">
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-sm text-slate-900 dark:text-white font-display">
                    Notifications
                  </span>
                  {unreadCount > 0 && (
                    <span className="text-xs font-semibold bg-blue-100 dark:bg-blue-950/80 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-full border border-blue-200 dark:border-blue-800">
                      {unreadCount} new
                    </span>
                  )}
                </div>
                {unreadCount > 0 && (
                  <button
                    onClick={markAllAsRead}
                    className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold inline-flex items-center space-x-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              <div className="max-h-80 overflow-y-auto divide-y divide-slate-50 dark:divide-slate-800/60">
                {notifications.length === 0 ? (
                  <div className="p-6 text-center text-xs text-slate-400 dark:text-slate-500">
                    No notifications yet.
                  </div>
                ) : (
                  notifications.map((n) => (
                    <div
                      key={n.id}
                      onClick={() => markAsRead(n.id)}
                      className={`p-3.5 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition-colors cursor-pointer text-xs ${
                        !n.isRead
                          ? 'bg-blue-50/50 dark:bg-blue-950/30 font-medium'
                          : 'text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <span className="font-semibold text-slate-900 dark:text-slate-200">
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(n.createdAt).toLocaleDateString()}
                        </span>
                      </div>
                      <p className="mt-1 text-slate-600 dark:text-slate-400 line-clamp-2">
                        {n.message}
                      </p>
                      {n.link && (
                        <Link
                          to={n.link}
                          onClick={() => setShowNotifications(false)}
                          className="mt-1.5 inline-flex items-center text-blue-600 dark:text-blue-400 font-semibold hover:underline text-[11px]"
                        >
                          View details <ExternalLink className="w-3 h-3 ml-1" />
                        </Link>
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* User Profile Menu */}
        <div className="relative" ref={profileRef}>
          <button
            onClick={() => setShowProfileMenu(!showProfileMenu)}
            className="flex items-center space-x-2.5 rounded-xl p-1.5 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors text-left border border-transparent hover:border-slate-200 dark:hover:border-slate-700"
          >
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-black text-xs flex items-center justify-center shadow-md shadow-blue-500/25 ring-2 ring-blue-500/20">
              {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
            </div>
            <div className="hidden md:block">
              <p className="text-xs font-bold text-slate-800 dark:text-slate-100 leading-none">
                {user?.name}
              </p>
              <p className="text-[10px] text-slate-400 dark:text-slate-500 mt-1 leading-none">
                {user?.email}
              </p>
            </div>
          </button>

          {showProfileMenu && (
            <div className="absolute right-0 mt-2 w-56 rounded-2xl bg-white dark:bg-slate-900 shadow-2xl border border-slate-200/80 dark:border-slate-800 py-2 z-50 animate-in fade-in zoom-in-95 duration-150 backdrop-blur-xl">
              <div className="px-4 py-2.5 border-b border-slate-100 dark:border-slate-800">
                <p className="text-xs font-bold text-slate-900 dark:text-white truncate">
                  {user?.name}
                </p>
                <p className="text-[11px] text-slate-400 dark:text-slate-500 truncate mb-1.5">
                  {user?.email}
                </p>
                <RoleBadge role={user?.role} />
              </div>

              <Link
                to={profilePath}
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium transition-colors"
              >
                <User className="w-4 h-4 mr-2.5 text-slate-400" />
                Profile & Settings
              </Link>

              <Link
                to="/institutions"
                onClick={() => setShowProfileMenu(false)}
                className="flex items-center px-4 py-2.5 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800/80 font-medium transition-colors"
              >
                <Compass className="w-4 h-4 mr-2.5 text-slate-400" />
                Campus Directory
              </Link>

              <div className="border-t border-slate-100 dark:border-slate-800 my-1"></div>

              <button
                onClick={logout}
                className="w-full flex items-center px-4 py-2 text-xs text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 font-semibold text-left transition-colors"
              >
                <LogOut className="w-4 h-4 mr-2.5 text-rose-500" />
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
