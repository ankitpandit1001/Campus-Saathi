import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';

export function StaffDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStaffData() {
      try {
        setLoading(true);
        const [complaintsRes, statsRes] = await Promise.all([
          api.get('/staff/complaints?limit=6'),
          api.get('/staff/stats'),
        ]);

        if (complaintsRes.data.success) {
          setComplaints(complaintsRes.data.data.complaints);
        }
        if (statsRes.data.success) {
          setStats(statsRes.data.data.stats);
        }
      } catch (err) {
        console.error('Failed to load staff dashboard', err);
      } finally {
        setLoading(false);
      }
    }
    loadStaffData();
  }, []);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 rounded-2xl bg-teal-500/10 dark:bg-teal-950 text-teal-600 dark:text-teal-400 border border-teal-200/50 dark:border-teal-800 flex items-center justify-center font-bold">
            <Wrench className="w-6 h-6" />
          </div>
          <div>
            <span className="text-xs font-bold text-teal-600 dark:text-teal-400 uppercase tracking-wider">
              {user?.department || 'Technician Operations Desk'}
            </span>
            <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
              Welcome, {user?.name}
            </h1>
          </div>
        </div>

        <Link
          to="/staff/complaints"
          className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-auto hover:scale-[1.02]"
        >
          <span>View Assigned Queue</span>
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* KPI Workload Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Total Assigned</span>
            <div className="w-8 h-8 rounded-xl bg-blue-50 dark:bg-blue-950/70 text-blue-600 dark:text-blue-400 flex items-center justify-center">
              <Wrench className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {stats?.totalAssigned || 0}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Assigned tasks to date</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>In Progress</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 dark:bg-amber-950/70 text-amber-600 dark:text-amber-400 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {stats?.inProgress || 0}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Currently on-site repairs</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>Resolved</span>
            <div className="w-8 h-8 rounded-xl bg-emerald-50 dark:bg-emerald-950/70 text-emerald-600 dark:text-emerald-400 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-2">
            {stats?.resolved || 0}
          </p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
            {stats?.resolutionRate || 0}% resolution efficiency
          </p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
            <span>SLA Overdue</span>
            <div className="w-8 h-8 rounded-xl bg-rose-50 dark:bg-rose-950/70 text-rose-600 dark:text-rose-400 flex items-center justify-center">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-2">
            {stats?.overdue || 0}
          </p>
          <p className="text-[11px] text-rose-400 mt-1">Requires immediate escalation</p>
        </div>
      </div>

      {/* Active Work Queue */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg font-bold text-slate-900 dark:text-white">Assigned Complaints Queue</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Prioritize tasks according to SLA deadlines</p>
          </div>
          <Link
            to="/staff/complaints"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center space-x-1"
          >
            <span>View all assignments</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading assigned complaints..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            icon={Wrench}
            title="No tasks currently assigned"
            description="Your work queue is all caught up! New complaints assigned by admin will appear here."
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {complaints.map((c) => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                linkPrefix="/staff/complaints"
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
