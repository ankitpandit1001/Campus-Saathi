import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  ShieldCheck,
  Building2,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  FileText,
  Search,
  ExternalLink,
  RefreshCw,
  Sparkles,
  ArrowRight,
  School,
  Building,
} from 'lucide-react';

export function PlatformSuperAdminDashboard() {
  const { showToast } = useToast();
  const [metrics, setMetrics] = useState(null);
  const [institutions, setInstitutions] = useState([]);
  const [auditLogs, setAuditLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const loadPlatformData = async () => {
    try {
      setLoading(true);
      const [metricsRes, instRes, logsRes] = await Promise.all([
        api.get('/platform/metrics'),
        api.get(`/platform/institutions?status=${statusFilter}`),
        api.get('/platform/audit-logs?limit=15'),
      ]);

      if (metricsRes.data.success) {
        setMetrics(metricsRes.data.data.metrics);
      }
      if (instRes.data.success) {
        setInstitutions(instRes.data.data.institutions);
      }
      if (logsRes.data.success) {
        setAuditLogs(logsRes.data.data.logs);
      }
    } catch (err) {
      console.error('Failed to load super admin data', err);
      showToast('Failed to load platform data.', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadPlatformData();
  }, [statusFilter]);

  const handleUpdateStatus = async (institutionId, newStatus) => {
    try {
      setActionLoadingId(institutionId);
      const res = await api.patch(`/platform/institutions/${institutionId}/status`, {
        status: newStatus,
      });

      if (res.data.success) {
        showToast(`Institution status updated to ${newStatus}.`, 'success');
        await loadPlatformData();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Status update failed.', 'error');
    } finally {
      setActionLoadingId(null);
    }
  };

  if (loading && !metrics) {
    return (
      <div className="py-24 text-center">
        <LoadingSpinner text="Computing platform metrics & governance queue..." size="lg" />
      </div>
    );
  }

  const pendingList = institutions.filter((i) => i.status === 'PENDING');

  return (
    <div className="space-y-8">
      {/* Super Admin Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-indigo-950 to-purple-950 p-6 sm:p-9 text-white border border-slate-800 shadow-2xl">
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-blue-600/10 blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-purple-500/10 border border-purple-500/20 px-3.5 py-1 rounded-full text-xs font-extrabold mb-3 text-purple-300">
            <ShieldCheck className="w-3.5 h-3.5 text-purple-400" />
            <span>Platform Governance Center</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white leading-tight">
            Super Administrator Control Plane
          </h1>

          <p className="mt-2.5 text-xs sm:text-sm text-slate-300 leading-relaxed">
            Oversee tenant onboarding, approve accredited institutions, inspect system-wide operational health, and review audit trails across all campus domains.
          </p>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 rounded-3xl card-elevate">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
              Total Enrolled
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800 flex items-center justify-center">
              <Building2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-display text-slate-900 dark:text-white mt-2">
            {metrics?.totalInstitutions || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Institutions on platform</p>
        </div>

        <div className="glass-card p-5 rounded-3xl card-elevate">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 uppercase tracking-wider font-mono">
              Pending Approvals
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-display text-amber-600 dark:text-amber-400 mt-2">
            {metrics?.pendingInstitutions || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Awaiting verification</p>
        </div>

        <div className="glass-card p-5 rounded-3xl card-elevate">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500 uppercase tracking-wider font-mono">
              Active Tenancies
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-display text-emerald-600 dark:text-emerald-400 mt-2">
            {metrics?.activeInstitutions || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">Operating normally</p>
        </div>

        <div className="glass-card p-5 rounded-3xl card-elevate">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-500 uppercase tracking-wider font-mono">
              Platform Issues
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-display text-slate-900 dark:text-white mt-2">
            {metrics?.totalComplaints || 0}
          </p>
          <p className="text-[11px] text-slate-400 mt-1">
            {metrics?.resolvedComplaints || 0} resolved successfully
          </p>
        </div>
      </div>

      {/* Pending Approval Queue */}
      {pendingList.length > 0 && (
        <div className="glass-card p-6 sm:p-8 rounded-3xl border border-amber-200 dark:border-amber-900/40 bg-amber-50/20 dark:bg-amber-950/10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-2.5">
              <div className="w-3 h-3 rounded-full bg-amber-500 animate-ping" />
              <h2 className="text-lg font-black font-display text-slate-900 dark:text-white">
                Pending Institution Approvals ({pendingList.length})
              </h2>
            </div>
          </div>

          <div className="divide-y divide-slate-200/70 dark:divide-slate-800">
            {pendingList.map((inst) => (
              <div key={inst.id} className="py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="font-extrabold text-sm text-slate-900 dark:text-white">{inst.name}</span>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-blue-100 dark:bg-blue-900/50 text-blue-700 dark:text-blue-300 font-bold">
                      {inst.code}
                    </span>
                    <span className="text-[10px] uppercase font-bold text-slate-500">{inst.type}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1">
                    {inst.city}, {inst.state} &bull; Contact: {inst.contactEmail}
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleUpdateStatus(inst.id, 'ACTIVE')}
                    disabled={actionLoadingId === inst.id}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 shadow-md shadow-emerald-600/20 transition-all hover:scale-105 disabled:opacity-50"
                  >
                    Approve &amp; Activate
                  </button>
                  <button
                    onClick={() => handleUpdateStatus(inst.id, 'REJECTED')}
                    disabled={actionLoadingId === inst.id}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/50 border border-rose-200 dark:border-rose-800 transition-colors disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Institution Governance Table */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h2 className="text-xl font-black font-display text-slate-900 dark:text-white">
              Institutions Directory
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">Manage operational tenancies and security status</p>
          </div>

          <div className="flex items-center space-x-2">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="REJECTED">Rejected</option>
            </select>

            <button
              onClick={loadPlatformData}
              className="p-2 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500"
              title="Refresh"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-400 font-mono uppercase text-[10px]">
                <th className="py-3 px-3">Institution</th>
                <th className="py-3 px-3">Code / Type</th>
                <th className="py-3 px-3">Location</th>
                <th className="py-3 px-3">Status</th>
                <th className="py-3 px-3">Complaints</th>
                <th className="py-3 px-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {institutions.map((inst) => (
                <tr key={inst.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-900/50 transition-colors">
                  <td className="py-3 px-3">
                    <span className="font-bold text-slate-900 dark:text-white block">{inst.name}</span>
                    <span className="text-[11px] text-slate-400">{inst.contactEmail}</span>
                  </td>

                  <td className="py-3 px-3">
                    <span className="font-mono font-bold text-blue-600 dark:text-blue-400">{inst.code}</span>
                    <span className="block text-[10px] text-slate-500">{inst.type}</span>
                  </td>

                  <td className="py-3 px-3 text-slate-600 dark:text-slate-300">
                    {inst.city}, {inst.state}
                  </td>

                  <td className="py-3 px-3">
                    <span
                      className={`inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                        inst.status === 'ACTIVE'
                          ? 'bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800'
                          : inst.status === 'PENDING'
                          ? 'bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800'
                          : 'bg-rose-50 dark:bg-rose-950/80 text-rose-600 dark:text-rose-400 border border-rose-200 dark:border-rose-800'
                      }`}
                    >
                      {inst.status}
                    </span>
                  </td>

                  <td className="py-3 px-3 font-mono font-bold text-slate-700 dark:text-slate-300">
                    {inst._count?.complaints || 0}
                  </td>

                  <td className="py-3 px-3 text-right">
                    <div className="flex items-center justify-end space-x-1.5">
                      {inst.status === 'ACTIVE' ? (
                        <button
                          onClick={() => handleUpdateStatus(inst.id, 'SUSPENDED')}
                          disabled={actionLoadingId === inst.id}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-rose-600 hover:bg-rose-50 dark:hover:bg-rose-950/40 border border-rose-200 dark:border-rose-800"
                        >
                          Suspend
                        </button>
                      ) : inst.status === 'SUSPENDED' ? (
                        <button
                          onClick={() => handleUpdateStatus(inst.id, 'ACTIVE')}
                          disabled={actionLoadingId === inst.id}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
                        >
                          Reactivate
                        </button>
                      ) : inst.status === 'PENDING' ? (
                        <button
                          onClick={() => handleUpdateStatus(inst.id, 'ACTIVE')}
                          disabled={actionLoadingId === inst.id}
                          className="px-2.5 py-1 rounded-lg text-[11px] font-bold text-emerald-600 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800"
                        >
                          Approve
                        </button>
                      ) : null}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Platform Audit Trail Table */}
      <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-black font-display text-slate-900 dark:text-white">
              Platform Security Audit Trail
            </h2>
            <p className="text-xs text-slate-500">Immutable records of administrative governance events</p>
          </div>
        </div>

        <div className="divide-y divide-slate-100 dark:divide-slate-800/80 text-xs">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <span className="font-mono font-bold text-blue-600 dark:text-blue-400 mr-2">
                  [{log.action}]
                </span>
                <span className="text-slate-800 dark:text-slate-200">{log.details || 'System event recorded'}</span>
                {log.institution && (
                  <span className="ml-2 text-[10px] px-2 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500">
                    {log.institution.name}
                  </span>
                )}
              </div>

              <div className="text-[11px] text-slate-400 font-mono">
                {new Date(log.createdAt).toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
