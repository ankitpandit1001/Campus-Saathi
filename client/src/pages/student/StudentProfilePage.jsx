import React, { useState } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { RoleBadge } from '../../components/common/Badge';
import { User, KeyRound, Shield, Save, Check } from 'lucide-react';

export function StudentProfilePage() {
  const { user, updateUser } = useAuth();
  const { showToast } = useToast();

  const [profileData, setProfileData] = useState({
    name: user?.name || '',
    department: user?.department || '',
    phone: user?.phone || '',
    studentId: user?.studentId || '',
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
        showToast('Profile information updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update profile', 'error');
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
      setPasswordError('New passwords do not match.');
      return;
    }

    try {
      setPasswordLoading(true);
      const res = await api.post('/auth/change-password', {
        currentPassword: passwords.currentPassword,
        newPassword: passwords.newPassword,
      });

      if (res.data.success) {
        showToast('Password changed successfully!', 'success');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
      }
    } catch (err) {
      setPasswordError(err.response?.data?.message || 'Failed to change password');
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Profile & Account Settings</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">Manage your personal details and security preferences</p>
      </div>

      {/* Account Overview Header Card */}
      <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 transition-colors">
        <div className="flex items-center space-x-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-blue-600 to-indigo-600 text-white font-extrabold text-2xl flex items-center justify-center shadow-md">
            {user?.name ? user.name.charAt(0).toUpperCase() : 'U'}
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">{user?.name}</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">{user?.email}</p>
            <div className="mt-1.5 flex items-center space-x-2">
              <RoleBadge role={user?.role} />
              {user?.studentId && (
                <span className="font-mono text-[11px] font-semibold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  ID: {user.studentId}
                </span>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Profile Edit Form */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center space-x-2 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
            <User className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Student Details
            </h3>
          </div>

          <form onSubmit={handleProfileSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Full Name
              </label>
              <input
                type="text"
                required
                value={profileData.name}
                onChange={(e) => setProfileData({ ...profileData, name: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Student ID / Roll No
              </label>
              <input
                type="text"
                value={profileData.studentId}
                onChange={(e) => setProfileData({ ...profileData, studentId: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Department
              </label>
              <input
                type="text"
                value={profileData.department}
                onChange={(e) => setProfileData({ ...profileData, department: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Phone Number
              </label>
              <input
                type="tel"
                value={profileData.phone}
                onChange={(e) => setProfileData({ ...profileData, phone: e.target.value })}
                placeholder="+91 98765 43210"
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={profileLoading}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{profileLoading ? 'Saving...' : 'Save Changes'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Change Password Form */}
        <div className="bg-white dark:bg-slate-900 p-6 sm:p-7 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center space-x-2 pb-4 mb-5 border-b border-slate-100 dark:border-slate-800">
            <KeyRound className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h3 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Security & Password
            </h3>
          </div>

          {passwordError && (
            <div className="p-3 mb-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-medium">
              {passwordError}
            </div>
          )}

          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Current Password
              </label>
              <input
                type="password"
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords({ ...passwords, currentPassword: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                New Password (Min 8 Characters)
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwords.newPassword}
                onChange={(e) => setPasswords({ ...passwords, newPassword: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                Confirm New Password
              </label>
              <input
                type="password"
                required
                minLength={8}
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords({ ...passwords, confirmPassword: e.target.value })}
                className="w-full px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={passwordLoading}
                className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 dark:bg-blue-600 dark:hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md transition-all disabled:opacity-50"
              >
                <Shield className="w-3.5 h-3.5" />
                <span>{passwordLoading ? 'Updating...' : 'Update Password'}</span>
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
