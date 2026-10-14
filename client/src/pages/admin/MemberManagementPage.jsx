import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import { RoleBadge } from '../../components/common/Badge';
import {
  Users,
  UserCheck,
  UserX,
  Clock,
  Search,
  Shield,
  Building,
  Mail,
  Phone,
  CheckCircle,
  XCircle,
  AlertTriangle,
  RefreshCw,
  Sparkles,
  ShieldAlert,
  ChevronRight,
  Filter,
} from 'lucide-react';

export function MemberManagementPage() {
  const { user, activeInstitution } = useAuth();
  const { showToast } = useToast();

  const [activeTab, setActiveTab] = useState('REQUESTS'); // 'REQUESTS' or 'MEMBERS'
  const [loading, setLoading] = useState(true);

  // Join requests state
  const [joinRequests, setJoinRequests] = useState([]);
  const [requestFilter, setRequestFilter] = useState('PENDING'); // 'PENDING', 'APPROVED', 'REJECTED', 'ALL'
  const [actionLoadingId, setActionLoadingId] = useState(null);

  // Members state
  const [members, setMembers] = useState([]);
  const [memberRoleFilter, setMemberRoleFilter] = useState('ALL');
  const [memberStatusFilter, setMemberStatusFilter] = useState('ALL');
  const [memberSearch, setMemberSearch] = useState('');

  // Status modal
  const [confirmModalOpen, setConfirmModalOpen] = useState(false);
  const [selectedMember, setSelectedMember] = useState(null);
  const [targetStatus, setTargetStatus] = useState(null);
  const [modalLoading, setModalLoading] = useState(false);

  const instId = activeInstitution?.id;

  const fetchJoinRequests = async () => {
    if (!instId) return;
    try {
      const res = await api.get(`/institutions/${instId}/join-requests?status=${requestFilter}`);
      if (res.data.success) {
        setJoinRequests(res.data.data.joinRequests);
      }
    } catch (err) {
      console.error('Failed to load join requests:', err);
    }
  };

  const fetchMembers = async () => {
    if (!instId) return;
    try {
      const params = new URLSearchParams();
      if (memberRoleFilter !== 'ALL') params.append('role', memberRoleFilter);
      if (memberStatusFilter !== 'ALL') params.append('status', memberStatusFilter);
      if (memberSearch.trim()) params.append('search', memberSearch.trim());

      const res = await api.get(`/institutions/${instId}/members?${params.toString()}`);
      if (res.data.success) {
        setMembers(res.data.data.members);
      }
    } catch (err) {
      console.error('Failed to load members:', err);
    }
  };

  const refreshAll = async () => {
    setLoading(true);
    await Promise.all([fetchJoinRequests(), fetchMembers()]);
    setLoading(false);
  };

  useEffect(() => {
    refreshAll();
  }, [instId, requestFilter, memberRoleFilter, memberStatusFilter]);

  const handleReviewRequest = async (requestId, action) => {
    try {
      setActionLoadingId(requestId);
      const res = await api.patch(`/institutions/${instId}/join-requests/${requestId}`, { action });
      if (res.data.success) {
        showToast(res.data.message || `Request ${action.toLowerCase()}ed!`, 'success');
        await Promise.all([fetchJoinRequests(), fetchMembers()]);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to review request', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  const openStatusChange = (member, status) => {
    setSelectedMember(member);
    setTargetStatus(status);
    setConfirmModalOpen(true);
  };

  const handleConfirmStatusChange = async () => {
    if (!selectedMember || !targetStatus) return;
    try {
      setModalLoading(true);
      const res = await api.patch(`/institutions/${instId}/members/${selectedMember.id}/status`, {
        status: targetStatus,
      });
      if (res.data.success) {
        showToast(`Membership status updated to ${targetStatus}`, 'success');
        setConfirmModalOpen(false);
        fetchMembers();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update membership status', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-emerald-100 dark:bg-emerald-950/70 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
            <CheckCircle className="w-3 h-3 mr-1" /> Active
          </span>
        );
      case 'PENDING':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-100 dark:bg-amber-950/70 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800">
            <Clock className="w-3 h-3 mr-1" /> Pending
          </span>
        );
      case 'SUSPENDED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-orange-100 dark:bg-orange-950/70 text-orange-800 dark:text-orange-300 border border-orange-300 dark:border-orange-800">
            <AlertTriangle className="w-3 h-3 mr-1" /> Suspended
          </span>
        );
      case 'REVOKED':
      case 'REJECTED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-rose-100 dark:bg-rose-950/70 text-rose-800 dark:text-rose-300 border border-rose-300 dark:border-rose-800">
            <XCircle className="w-3 h-3 mr-1" /> {status}
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
            {status}
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="rounded-3xl glass-card p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
              <Building className="w-3.5 h-3.5" />
              <span>{activeInstitution?.name || 'Institution'} • Tenant Security</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight">
              Member Governance & Onboarding
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1 max-w-2xl">
              Manage student join requests, verify academic credentials, maintain the staff roster, and enforce strict tenant access controls.
            </p>
          </div>

          <div className="flex items-center space-x-2.5 self-start md:self-center">
            <button
              onClick={refreshAll}
              disabled={loading}
              className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-600 dark:text-slate-300 text-xs font-bold inline-flex items-center space-x-1.5 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh</span>
            </button>
          </div>
        </div>

        {/* Tab Switcher */}
        <div className="flex items-center space-x-2 mt-6 border-b border-slate-200 dark:border-white/10">
          <button
            onClick={() => setActiveTab('REQUESTS')}
            className={`flex items-center space-x-2 pb-3 px-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all ${
              activeTab === 'REQUESTS'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Clock className="w-4 h-4" />
            <span>Join Requests</span>
            {joinRequests.filter((r) => r.status === 'PENDING').length > 0 && (
              <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-white">
                {joinRequests.filter((r) => r.status === 'PENDING').length}
              </span>
            )}
          </button>

          <button
            onClick={() => setActiveTab('MEMBERS')}
            className={`flex items-center space-x-2 pb-3 px-3 text-xs sm:text-sm font-extrabold border-b-2 transition-all ${
              activeTab === 'MEMBERS'
                ? 'border-blue-600 text-blue-600 dark:text-blue-400'
                : 'border-transparent text-slate-500 hover:text-slate-800 dark:hover:text-slate-200'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Active Member Roster</span>
            <span className="ml-1.5 px-2 py-0.5 rounded-full text-[10px] font-bold bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300">
              {members.length}
            </span>
          </button>
        </div>
      </div>

      {/* TAB 1: JOIN REQUESTS */}
      {activeTab === 'REQUESTS' && (
        <div className="space-y-4">
          {/* Filter Bar */}
          <div className="flex items-center justify-between gap-3">
            <div className="flex items-center space-x-1.5">
              {['PENDING', 'APPROVED', 'REJECTED', 'ALL'].map((f) => (
                <button
                  key={f}
                  onClick={() => setRequestFilter(f)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                    requestFilter === f
                      ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/25'
                      : 'bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800'
                  }`}
                >
                  {f === 'PENDING' ? 'Pending Queue' : f.charAt(0) + f.slice(1).toLowerCase()}
                </button>
              ))}
            </div>
            <span className="text-xs text-slate-400 font-medium">
              Showing {joinRequests.length} applications
            </span>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner text="Fetching applicant queue..." />
            </div>
          ) : joinRequests.length === 0 ? (
            <EmptyState
              icon={UserCheck}
              title="No Join Requests Found"
              description={`There are currently no ${requestFilter.toLowerCase()} applications for ${activeInstitution?.name}.`}
            />
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {joinRequests.map((req) => (
                <div
                  key={req.id}
                  className="rounded-2xl glass-card border border-slate-200/90 dark:border-white/10 p-5 space-y-3.5 shadow-sm hover:shadow-md transition-shadow relative overflow-hidden"
                >
                  {/* Status header */}
                  <div className="flex items-center justify-between">
                    <RoleBadge role={req.requestedRole} />
                    {getStatusBadge(req.status)}
                  </div>

                  {/* Applicant Details */}
                  <div>
                    <h3 className="font-bold text-sm text-slate-900 dark:text-white font-display">
                      {req.user.name}
                    </h3>
                    <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                      <Mail className="w-3 h-3 text-slate-400" />
                      <span className="truncate">{req.user.email}</span>
                    </p>
                    {req.user.phone && (
                      <p className="text-xs text-slate-500 dark:text-slate-400 flex items-center space-x-1 mt-0.5">
                        <Phone className="w-3 h-3 text-slate-400" />
                        <span>{req.user.phone}</span>
                      </p>
                    )}
                  </div>

                  {/* Credentials / Department */}
                  <div className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800/80 text-xs space-y-1">
                    {req.studentId && (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-400 font-medium">Student / Roll ID:</span>
                        <span className="font-mono font-bold text-slate-800 dark:text-slate-200">
                          {req.studentId}
                        </span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-slate-400 font-medium">Applied On:</span>
                      <span className="text-slate-600 dark:text-slate-300">
                        {new Date(req.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>

                  {/* Review Actions */}
                  {req.status === 'PENDING' && (
                    <div className="pt-1 flex items-center space-x-2">
                      <button
                        onClick={() => handleReviewRequest(req.id, 'APPROVE')}
                        disabled={actionLoadingId === req.id}
                        className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm shadow-emerald-500/20 transition-colors disabled:opacity-50"
                      >
                        <CheckCircle className="w-3.5 h-3.5" />
                        <span>Approve</span>
                      </button>
                      <button
                        onClick={() => handleReviewRequest(req.id, 'REJECT')}
                        disabled={actionLoadingId === req.id}
                        className="flex-1 inline-flex items-center justify-center space-x-1.5 py-2 px-3 rounded-xl text-xs font-bold text-rose-600 dark:text-rose-400 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 transition-colors disabled:opacity-50"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: ACTIVE MEMBERS ROSTER */}
      {activeTab === 'MEMBERS' && (
        <div className="space-y-4">
          {/* Controls Bar */}
          <div className="rounded-2xl glass-card p-4 border border-slate-200/80 dark:border-white/10 flex flex-col md:flex-row md:items-center justify-between gap-3">
            <div className="flex flex-1 items-center space-x-2">
              <div className="relative flex-1 max-w-sm">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search members by name or email..."
                  value={memberSearch}
                  onChange={(e) => setMemberSearch(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && fetchMembers()}
                  className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <button
                onClick={fetchMembers}
                className="px-3 py-2 rounded-xl text-xs font-bold bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                Search
              </button>
            </div>

            <div className="flex items-center space-x-2">
              <select
                value={memberRoleFilter}
                onChange={(e) => setMemberRoleFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none font-bold"
              >
                <option value="ALL">All Roles</option>
                <option value="STUDENT">Students</option>
                <option value="STAFF">Staff & Maintenance</option>
                <option value="ADMIN">Admins</option>
              </select>

              <select
                value={memberStatusFilter}
                onChange={(e) => setMemberStatusFilter(e.target.value)}
                className="px-3 py-2 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 focus:outline-none font-bold"
              >
                <option value="ALL">All Statuses</option>
                <option value="ACTIVE">Active</option>
                <option value="SUSPENDED">Suspended</option>
                <option value="REVOKED">Revoked</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center">
              <LoadingSpinner text="Loading member roster..." />
            </div>
          ) : members.length === 0 ? (
            <EmptyState
              icon={Users}
              title="No Members Found"
              description="No members match the current search or filters."
            />
          ) : (
            <div className="overflow-x-auto rounded-2xl border border-slate-200/80 dark:border-white/10 glass-card">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-white/10 bg-slate-50/60 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 font-extrabold uppercase tracking-wider">
                    <th className="py-3.5 px-4">Member Name</th>
                    <th className="py-3.5 px-4">Role</th>
                    <th className="py-3.5 px-4">Department / ID</th>
                    <th className="py-3.5 px-4">Membership Status</th>
                    <th className="py-3.5 px-4">Joined Date</th>
                    <th className="py-3.5 px-4 text-right">Access Controls</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-slate-800/80">
                  {members.map((m) => (
                    <tr
                      key={m.id}
                      className="hover:bg-slate-50/70 dark:hover:bg-slate-900/40 transition-colors"
                    >
                      <td className="py-3.5 px-4">
                        <div className="flex items-center space-x-2.5">
                          <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-blue-500/20 to-indigo-500/20 border border-blue-500/30 flex items-center justify-center font-bold text-xs text-blue-600 dark:text-blue-400">
                            {m.user.name.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 dark:text-white">{m.user.name}</p>
                            <p className="text-[11px] text-slate-400">{m.user.email}</p>
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <RoleBadge role={m.role} />
                      </td>
                      <td className="py-3.5 px-4 text-slate-600 dark:text-slate-300">
                        {m.department?.name ? (
                          <span className="font-medium">{m.department.name}</span>
                        ) : m.studentId ? (
                          <span className="font-mono text-slate-500 dark:text-slate-400">{m.studentId}</span>
                        ) : (
                          <span className="text-slate-400 italic">None assigned</span>
                        )}
                      </td>
                      <td className="py-3.5 px-4">{getStatusBadge(m.status)}</td>
                      <td className="py-3.5 px-4 text-slate-500 dark:text-slate-400">
                        {new Date(m.createdAt).toLocaleDateString()}
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        {m.userId === user?.id ? (
                          <span className="text-[11px] text-slate-400 font-bold italic">Current User</span>
                        ) : (
                          <div className="flex items-center justify-end space-x-1.5">
                            {m.status === 'ACTIVE' && (
                              <button
                                onClick={() => openStatusChange(m, 'SUSPENDED')}
                                className="px-2 py-1 rounded-lg text-[11px] font-bold text-orange-600 hover:bg-orange-50 dark:hover:bg-orange-950/40 border border-orange-200 dark:border-orange-900 transition-colors"
                              >
                                Suspend
                              </button>
                            )}

                            {m.status === 'SUSPENDED' && (
                              <button
                                onClick={() => openStatusChange(m, 'ACTIVE')}
                                className="px-2 py-1 rounded-lg text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-900 transition-colors"
                              >
                                Reactivate
                              </button>
                            )}

                            {m.status !== 'REVOKED' && (
                              <button
                                onClick={() => openStatusChange(m, 'REVOKED')}
                                className="px-2 py-1 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-900 transition-colors"
                              >
                                Revoke
                              </button>
                            )}
                          </div>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      <Modal
        isOpen={confirmModalOpen}
        onClose={() => setConfirmModalOpen(false)}
        title="Confirm Membership Status Change"
      >
        <div className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Are you sure you want to change the membership status of{' '}
            <strong className="text-slate-900 dark:text-white">{selectedMember?.user.name}</strong> to{' '}
            <strong className="text-blue-600 dark:text-blue-400">{targetStatus}</strong>?
          </p>

          {targetStatus === 'SUSPENDED' && (
            <div className="p-3 rounded-xl bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 text-xs text-amber-800 dark:text-amber-200">
              <AlertTriangle className="w-4 h-4 inline mr-1 text-amber-600" />
              Suspending this membership will immediately revoke their ability to submit complaints, view queues, or access institution data.
            </div>
          )}

          {targetStatus === 'REVOKED' && (
            <div className="p-3 rounded-xl bg-rose-50 dark:bg-rose-950/50 border border-rose-200 dark:border-rose-800 text-xs text-rose-800 dark:text-rose-200">
              <ShieldAlert className="w-4 h-4 inline mr-1 text-rose-600" />
              Revoking membership prevents all future access to this institution. They will need to re-apply through the public directory.
            </div>
          )}

          <div className="flex justify-end space-x-2.5 pt-2">
            <button
              onClick={() => setConfirmModalOpen(false)}
              className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-slate-800"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirmStatusChange}
              disabled={modalLoading}
              className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/20 disabled:opacity-50"
            >
              {modalLoading ? 'Updating...' : `Confirm ${targetStatus}`}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  );
}
