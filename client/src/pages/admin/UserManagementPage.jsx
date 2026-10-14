import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { RoleBadge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Users,
  UserPlus,
  Search,
  Shield,
  UserX,
  UserCheck,
  Building,
  Mail,
  Phone,
  KeyRound,
} from 'lucide-react';

export function UserManagementPage() {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('STAFF'); // 'STAFF' or 'STUDENT'
  const [users, setUsers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [search, setSearch] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  // New Staff Modal
  const [newStaffModalOpen, setNewStaffModalOpen] = useState(false);
  const [staffForm, setStaffForm] = useState({
    name: '',
    email: '',
    password: '',
    department: 'Electrical Maintenance',
    phone: '',
  });
  const [staffLoading, setStaffLoading] = useState(false);

  // Toggle Status Modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [toggleLoading, setToggleLoading] = useState(false);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('role', activeTab);
      params.append('page', page);
      params.append('limit', '12');
      if (search) params.append('search', search);

      const res = await api.get(`/admin/users?${params.toString()}`);
      if (res.data.success) {
        setUsers(res.data.data.users);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to fetch users', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, [activeTab, page, search]);

  const handleCreateStaff = async (e) => {
    e.preventDefault();
    if (staffForm.password.length < 8) {
      showToast('Staff password must be at least 8 characters.', 'error');
      return;
    }

    try {
      setStaffLoading(true);
      const res = await api.post('/admin/users/staff', staffForm);
      if (res.data.success) {
        showToast(`Staff account for ${res.data.data.user.name} created!`, 'success');
        setNewStaffModalOpen(false);
        setStaffForm({
          name: '',
          email: '',
          password: '',
          department: 'Electrical Maintenance',
          phone: '',
        });
        fetchUsers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to create staff account', 'error');
    } finally {
      setStaffLoading(false);
    }
  };

  const handleOpenToggle = (u) => {
    if (u.id === currentUser?.id) {
      showToast('You cannot deactivate your own administrative account.', 'error');
      return;
    }
    setSelectedUser(u);
    setConfirmModalOpen(true);
  };

  const handleConfirmToggle = async () => {
    try {
      setToggleLoading(true);
      const newActive = !selectedUser.isActive;
      const res = await api.patch(`/admin/users/${selectedUser.id}/status`, {
        isActive: newActive,
      });

      if (res.data.success) {
        showToast(
          `Account for ${selectedUser.name} ${newActive ? 'activated' : 'deactivated'}.`,
          'info'
        );
        setConfirmModalOpen(false);
        fetchUsers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to change user status', 'error');
    } finally {
      setToggleLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">User & Staff Management</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Manage institutional maintenance personnel, technicians, and student member access
          </p>
        </div>

        {activeTab === 'STAFF' && (
          <button
            onClick={() => setNewStaffModalOpen(true)}
            className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-auto"
          >
            <UserPlus className="w-4 h-4" />
            <span>Create Staff Account</span>
          </button>
        )}
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-slate-200 dark:border-slate-800">
        <button
          onClick={() => {
            setActiveTab('STAFF');
            setPage(1);
          }}
          className={`py-3 px-6 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'STAFF'
              ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Maintenance Staff & Technicians
        </button>
        <button
          onClick={() => {
            setActiveTab('STUDENT');
            setPage(1);
          }}
          className={`py-3 px-6 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'STUDENT'
              ? 'border-blue-600 dark:border-blue-400 text-blue-600 dark:text-blue-400'
              : 'border-transparent text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          Registered Student Accounts
        </button>
      </div>

      {/* Search Input */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <div className="relative max-w-md">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
          <input
            type="text"
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            placeholder={`Search ${activeTab.toLowerCase()} by name, email, department...`}
            className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
          />
        </div>
      </div>

      {/* Users Table */}
      {loading ? (
        <LoadingSpinner text="Loading users directory..." />
      ) : users.length === 0 ? (
        <EmptyState
          icon={Users}
          title={`No ${activeTab.toLowerCase()} accounts found`}
          description="Try modifying your search query."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-850 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">User</th>
                  <th className="px-5 py-3.5">Role</th>
                  <th className="px-5 py-3.5">Department / Roll No</th>
                  <th className="px-5 py-3.5">Phone</th>
                  <th className="px-5 py-3.5">Activity</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {users.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-3">
                        <div className="w-8 h-8 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold flex items-center justify-center text-xs">
                          {u.name?.charAt(0)}
                        </div>
                        <div>
                          <p className="font-bold text-slate-900 dark:text-white">{u.name}</p>
                          <p className="text-[11px] text-slate-400 dark:text-slate-500">{u.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <RoleBadge role={u.role} />
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">
                      <p className="font-semibold">{u.department || 'N/A'}</p>
                      {u.studentId && (
                        <p className="text-[10px] text-slate-400 dark:text-slate-500 font-mono">Roll: {u.studentId}</p>
                      )}
                    </td>
                    <td className="px-5 py-3.5 text-slate-600 dark:text-slate-400">{u.phone || 'N/A'}</td>
                    <td className="px-5 py-3.5 text-slate-500 dark:text-slate-400">
                      {u.role === 'STAFF'
                        ? `${u._count?.assignments || 0} assignments`
                        : `${u._count?.complaints || 0} complaints lodged`}
                    </td>
                    <td className="px-5 py-3.5">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full border ${
                          u.isActive
                            ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                            : 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-200 dark:border-rose-800'
                        }`}
                      >
                        {u.isActive ? 'Active' : 'Deactivated'}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      {u.id !== currentUser?.id && (
                        <button
                          onClick={() => handleOpenToggle(u)}
                          className={`text-xs font-semibold px-3 py-1 rounded-lg transition-colors ${
                            u.isActive
                              ? 'text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40'
                              : 'text-emerald-600 dark:text-emerald-400 hover:bg-emerald-50 dark:hover:bg-emerald-950/40'
                          }`}
                        >
                          {u.isActive ? 'Deactivate' : 'Activate'}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          <Pagination
            currentPage={pagination.currentPage}
            totalPages={pagination.totalPages}
            totalCount={pagination.totalCount}
            onPageChange={setPage}
          />
        </div>
      )}

      {/* Create Staff Modal */}
      <Modal
        isOpen={newStaffModalOpen}
        onClose={() => setNewStaffModalOpen(false)}
        title="Register New Maintenance Staff"
      >
        <form onSubmit={handleCreateStaff} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Full Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={staffForm.name}
              onChange={(e) => setStaffForm({ ...staffForm, name: e.target.value })}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Email Address <span className="text-rose-500">*</span>
            </label>
            <input
              type="email"
              required
              value={staffForm.email}
              onChange={(e) => setStaffForm({ ...staffForm, email: e.target.value })}
              placeholder="e.g. ramesh.electric@campussaathi.edu"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Department / Specialization <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={staffForm.department}
              onChange={(e) => setStaffForm({ ...staffForm, department: e.target.value })}
              placeholder="e.g. Electrical Maintenance / Water Supply"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Phone Number
            </label>
            <input
              type="tel"
              value={staffForm.phone}
              onChange={(e) => setStaffForm({ ...staffForm, phone: e.target.value })}
              placeholder="+91 98000 77777"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Initial Password (Min 8 Chars) <span className="text-rose-500">*</span>
            </label>
            <input
              type="password"
              required
              minLength={8}
              value={staffForm.password}
              onChange={(e) => setStaffForm({ ...staffForm, password: e.target.value })}
              placeholder="Staff@123"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setNewStaffModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={staffLoading}
              className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
            >
              {staffLoading ? 'Registering...' : 'Create Account'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Confirm Toggle Status Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Account Status Change"
      >
        <div className="space-y-4 text-xs">
          <p className="text-slate-600 dark:text-slate-300">
            Are you sure you want to{' '}
            <span className="font-bold text-slate-900 dark:text-white">
              {selectedUser?.isActive ? 'deactivate' : 'activate'}
            </span>{' '}
            the account for{' '}
            <span className="font-semibold text-blue-600 dark:text-blue-400">{selectedUser?.name}</span> (
            {selectedUser?.email})?
          </p>

          {selectedUser?.isActive && (
            <p className="p-3 bg-amber-50 dark:bg-amber-950/40 rounded-xl border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 leading-relaxed">
              Deactivating this account will prevent this user from logging in. Any existing complaints or assignments will remain preserved in database history.
            </p>
          )}

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setConfirmModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="button"
              disabled={toggleLoading}
              onClick={handleConfirmToggle}
              className={`px-5 py-2 font-bold text-white rounded-xl shadow-md transition-colors ${
                selectedUser?.isActive
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-emerald-600 hover:bg-emerald-700'
              }`}
            >
              {toggleLoading ? 'Processing...' : 'Confirm'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
