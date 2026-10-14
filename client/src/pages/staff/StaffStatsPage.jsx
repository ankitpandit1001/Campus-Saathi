import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Wrench,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Award,
  Zap,
} from 'lucide-react';

export function StaffStatsPage() {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadStats() {
      try {
        setLoading(true);
        const res = await api.get('/staff/stats');
        if (res.data.success) {
          setStats(res.data.data.stats);
        }
      } catch (err) {
        console.error('Failed to load stats', err);
      } finally {
        setLoading(false);
      }
    }
    loadStats();
  }, []);

  if (loading) return <LoadingSpinner text="Computing performance statistics..." />;

  const resolutionRate = stats?.resolutionRate || 0;

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Staff Work Statistics</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Performance metrics, resolution velocity, and task completion rates
        </p>
      </div>

      {/* Main KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
            <span>Total Assigned</span>
            <Wrench className="w-4 h-4 text-blue-600 dark:text-blue-400" />
          </div>
          <p className="text-3xl font-black text-slate-900 dark:text-white mt-2">{stats?.totalAssigned || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
            <span>Resolved</span>
            <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
          </div>
          <p className="text-3xl font-black text-emerald-600 dark:text-emerald-400 mt-2">{stats?.resolved || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
            <span>In Progress</span>
            <Clock className="w-4 h-4 text-amber-600 dark:text-amber-400" />
          </div>
          <p className="text-3xl font-black text-amber-600 dark:text-amber-400 mt-2">{stats?.inProgress || 0}</p>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center justify-between text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase">
            <span>SLA Overdue</span>
            <AlertTriangle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
          </div>
          <p className="text-3xl font-black text-rose-600 dark:text-rose-400 mt-2">{stats?.overdue || 0}</p>
        </div>
      </div>

      {/* Progress & Efficiency Gauge Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-6 transition-colors">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 flex items-center justify-center">
            <Award className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Task Resolution Efficiency</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Percentage of assigned tasks successfully resolved</p>
          </div>
        </div>

        <div>
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300">Completion Ratio</span>
            <span className="text-sm font-extrabold text-blue-600 dark:text-blue-400">{resolutionRate}%</span>
          </div>
          <div className="w-full h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
            <div
              className="h-full bg-blue-600 rounded-full transition-all duration-500"
              style={{ width: `${resolutionRate}%` }}
            />
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-400">
          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <Zap className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">SLA Priority Adherence</span>
              <span>Always review High Priority tasks first to prevent breach of 12-24h institutional deadlines.</span>
            </div>
          </div>

          <div className="flex items-start space-x-3 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60">
            <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
            <div>
              <span className="font-bold text-slate-800 dark:text-slate-200 block">Detailed Notes</span>
              <span>Adding descriptive resolution summaries helps avoid student re-openings and maintains project auditing records.</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
