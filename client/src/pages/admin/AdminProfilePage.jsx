import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { RoleBadge } from '../../components/common/Badge';
import { ShieldCheck, User, KeyRound, Database, Server, Save } from 'lucide-react';

export function AdminProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    phone: user?.phone || '',
    department: user?.department || '',
  });
  const [profileLoading, setProfileLoading] = useState(false);

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [passwordError, setPasswordError] = useState('');

  const handleProfileSubmit = async (e) => {
    e.preventDefault();
    try {
      setProfileLoading(true);
      const res = await api.patch('/auth/profile', profileData);
      if (res.data.success) {
        updateUser(res.data.data.user);
        showToast('Administrative profile updated!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Update failed', 'error');
    } finally {
      setProfileLoading(false);
    }
  };

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setPasswordError('');

    if (passwords.newPassword.length < 8) {
      setPasswordError('New password must be at least 8 characters long.');
      return;
    }
    if (passwords.newPassword !== passwords.confirmPassword) {
      setPasswordError('Passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await api.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      if (res.data.success) {
        showToast('Admin password changed successfully!', 'success');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Password update failed');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Admin System Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          CampusSaathi system configuration, credentials, and institutional parameters
        </p>
      </div>

      {/* Admin Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-indigo-700 to-blue-700 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            <div className="mt-1.5 flex items-center space-x-2">
              <RoleBadge role="ADMIN" />
              <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">Chief Campus Administrator</span>
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Info */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center space-x-2 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Profile Details
            </h3>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Administrative Office / Department
              </label>
              <input
                type="text"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Official Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center space-x-1.5 font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{profileLoading ? 'Saving...' : 'Save Profile'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center space-x-2 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
            <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Security Credentials
            </h3>
          </div>

          {passwordError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4 text-xs">
            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Current Admin Password
              </label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                New Password (Min 8 Characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center space-x-1.5 font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Instance Tech Stack Specifications */}
      <div className="bg-slate-900 dark:bg-slate-950 text-white p-6 rounded-2xl border border-slate-800 shadow-xl space-y-4">
        <h3 className="text-sm font-bold uppercase tracking-wider text-blue-400">
          Environment & System Telemetry
        </h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs">
          <div>
            <span className="text-slate-400 block">Version</span>
            <span className="font-mono font-bold text-white">v1.0.0 (Production-Ready)</span>
          </div>
          <div>
            <span className="text-slate-400 block">Database Architecture</span>
            <span className="font-mono font-bold text-white">PostgreSQL / Prisma ORM</span>
          </div>
          <div>
            <span className="text-slate-400 block">Authentication</span>
            <span className="font-mono font-bold text-white">JWT (HS256) + HttpOnly</span>
          </div>
          <div>
            <span className="text-slate-400 block">File Storage Engine</span>
            <span className="font-mono font-bold text-white">Multer (UUID Hash Sanitized)</span>
          </div>
        </div>
      </div>
    </div>
  );
}
