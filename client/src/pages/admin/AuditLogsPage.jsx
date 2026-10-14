import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { ScrollText, Shield, User, Globe, Clock, Filter } from 'lucide-react';

export function AuditLogsPage() {
  const [logs, setLogs] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [action, setAction] = useState('');
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchLogs() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', '15');
        if (action) params.append('action', action);

        const res = await api.get(`/admin/audit-logs?${params.toString()}`);
        if (res.data.success) {
          setLogs(res.data.data.logs);
          setPagination(res.data.data.pagination);
        }
      } catch (err) {
        console.error('Failed to load audit logs', err);
      } finally {
        setLoading(false);
      }
    }
    fetchLogs();
  }, [page, action]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">System Audit Logs</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Immutable security log recording all administrative modifications, technician assignments, and data exports
          </p>
        </div>

        {/* Action Filter */}
        <div className="flex items-center space-x-2">
          <Filter className="w-4 h-4 text-slate-400 dark:text-slate-500" />
          <select
            value={action}
            onChange={(e) => {
              setAction(e.target.value);
              setPage(1);
            }}
            className="px-3 py-1.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 focus:outline-none focus:ring-2 focus:ring-blue-600 bg-white dark:bg-slate-800 text-slate-900 dark:text-white"
          >
            <option value="">All Actions</option>
            <option value="USER_LOGIN">User Logins</option>
            <option value="COMPLAINT_ASSIGNED">Complaint Dispatches</option>
            <option value="ADMIN_STATUS_UPDATE">Status Transitions</option>
            <option value="STAFF_STATUS_UPDATE">Staff Updates</option>
            <option value="STAFF_CREATED">Staff Account Creation</option>
            <option value="CATEGORY_CREATED">Category Changes</option>
            <option value="COMPLAINTS_CSV_EXPORTED">CSV Data Exports</option>
          </select>
        </div>
      </div>

      {/* Logs Table */}
      {loading ? (
        <LoadingSpinner text="Loading audit trail..." />
      ) : logs.length === 0 ? (
        <EmptyState
          icon={ScrollText}
          title="No audit entries found"
          description="System events will appear here as users perform actions."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-850 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">Timestamp</th>
                  <th className="px-5 py-3.5">Actor</th>
                  <th className="px-5 py-3.5">Action</th>
                  <th className="px-5 py-3.5">Entity</th>
                  <th className="px-5 py-3.5">Activity Details</th>
                  <th className="px-5 py-3.5">IP Address</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {logs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-5 py-3.5 whitespace-nowrap text-slate-400 dark:text-slate-500">
                      {new Date(log.createdAt).toLocaleString(undefined, {
                        month: 'short',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                        second: '2-digit',
                      })}
                    </td>
                    <td className="px-5 py-3.5">
                      <div className="flex items-center space-x-1.5">
                        <User className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        <span className="font-bold text-slate-900 dark:text-white">
                          {log.user ? log.user.name : 'System'}
                        </span>
                        {log.user && (
                          <span className="text-[10px] text-slate-400 dark:text-slate-500">({log.user.role})</span>
                        )}
                      </div>
                    </td>
                    <td className="px-5 py-3.5">
                      <span className="font-mono text-[10px] font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
                        {log.action}
                      </span>
                    </td>
                    <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300 font-semibold">{log.entityType}</td>
                    <td className="px-5 py-3.5 max-w-sm truncate text-slate-700 dark:text-slate-300" title={log.details}>
                      {log.details || 'N/A'}
                    </td>
                    <td className="px-5 py-3.5 text-slate-400 dark:text-slate-500 font-mono text-[11px]">
                      {log.ipAddress || '127.0.0.1'}
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
    </div>
  );
}
