import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import {
  PlusCircle,
  FileText,
  Clock,
  CheckCircle2,
  AlertCircle,
  ArrowRight,
  Sparkles,
  Zap,
  Activity,
  Layers,
} from 'lucide-react';

export function StudentDashboard() {
  const { user } = useAuth();
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStudentComplaints() {
      try {
        setLoading(true);
        const res = await api.get('/complaints?limit=6');
        if (res.data.success) {
          setComplaints(res.data.data.complaints);
        }
      } catch (err) {
        console.error('Error fetching student dashboard complaints', err);
      } finally {
        setLoading(false);
      }
    }
    fetchStudentComplaints();
  }, []);

  const totalCount = complaints.length;
  const inProgressCount = complaints.filter((c) => c.status === 'IN_PROGRESS' || c.status === 'ASSIGNED').length;
  const resolvedCount = complaints.filter((c) => c.status === 'RESOLVED' || c.status === 'CLOSED').length;
  const pendingCount = complaints.filter((c) => c.status === 'SUBMITTED' || c.status === 'UNDER_REVIEW').length;

  return (
    <div className="space-y-8">
      {/* Flutter-Style Hero Welcome Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-700 p-6 sm:p-9 text-white shadow-xl shadow-blue-500/20">
        {/* Glow ambient meshes */}
        <div className="absolute top-0 right-0 -mr-16 -mt-16 w-80 h-80 rounded-full bg-white/10 blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-60 h-60 rounded-full bg-indigo-400/20 blur-2xl pointer-events-none" />

        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center space-x-2 bg-white/15 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-extrabold mb-3.5 border border-white/20 shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-200 animate-pulse" />
            <span>Student Maintenance Command</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black font-display tracking-tight text-white leading-tight">
            Welcome back, {user?.name}! 👋
          </h1>

          <p className="mt-2.5 text-sm sm:text-base text-blue-100/90 leading-relaxed font-normal">
            Lodge infrastructure bottlenecks, power issues, or lab equipment faults with photo proof. College technicians are actively monitoring your department queue.
          </p>

          <div className="mt-6 flex flex-wrap gap-3">
            <Link
              to="/submit-complaint"
              className="inline-flex items-center space-x-2 bg-white text-blue-700 hover:bg-blue-50 px-5 py-3 rounded-2xl font-extrabold text-xs shadow-lg shadow-black/10 transition-all hover:scale-105 active:scale-95"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Submit New Complaint</span>
            </Link>

            <Link
              to="/my-complaints"
              className="inline-flex items-center space-x-2 bg-white/15 hover:bg-white/25 text-white px-5 py-3 rounded-2xl font-bold text-xs border border-white/25 backdrop-blur-md transition-all hover:scale-105"
            >
              <span>View All Complaints ({totalCount})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </div>

      {/* KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        <div className="glass-card p-5 rounded-3xl card-elevate">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider font-mono">
              Total Reported
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/50 dark:border-blue-800 flex items-center justify-center">
              <FileText className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-display text-slate-900 dark:text-white mt-2">{totalCount}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Lifetime complaints lodged</p>
        </div>

        <div className="glass-card p-5 rounded-3xl card-elevate">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-indigo-500 dark:text-indigo-400 uppercase tracking-wider font-mono">
              Under Review
            </span>
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-400 border border-indigo-200/50 dark:border-indigo-800 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-display text-slate-900 dark:text-white mt-2">{pendingCount}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Pending admin assignment</p>
        </div>

        <div className="glass-card p-5 rounded-3xl card-elevate">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-500 dark:text-amber-400 uppercase tracking-wider font-mono">
              In Progress
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 dark:bg-amber-950/80 text-amber-600 dark:text-amber-400 border border-amber-200/50 dark:border-amber-800 flex items-center justify-center">
              <AlertCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-display text-slate-900 dark:text-white mt-2">{inProgressCount}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Technicians actively on-site</p>
        </div>

        <div className="glass-card p-5 rounded-3xl card-elevate">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-500 dark:text-emerald-400 uppercase tracking-wider font-mono">
              Resolved
            </span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 dark:bg-emerald-950/80 text-emerald-600 dark:text-emerald-400 border border-emerald-200/50 dark:border-emerald-800 flex items-center justify-center">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <p className="text-3xl font-black font-display text-slate-900 dark:text-white mt-2">{resolvedCount}</p>
          <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">Work verified & completed</p>
        </div>
      </div>

      {/* Recent Complaints Section */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-lg sm:text-xl font-black font-display text-slate-900 dark:text-white">
              Recent Complaints
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Live status tracker of your recent campus issues
            </p>
          </div>
          <Link
            to="/my-complaints"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center space-x-1"
          >
            <span>View all complaints</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <LoadingSpinner text="Loading recent complaints..." />
        ) : complaints.length === 0 ? (
          <EmptyState
            title="No complaints reported yet"
            description="You have not submitted any complaints. Click the button below if you notice any issues on campus."
            action={
              <Link
                to="/submit-complaint"
                className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-2xl shadow-md transition-all hover:scale-105"
              >
                <PlusCircle className="w-4 h-4" />
                <span>Submit Complaint</span>
              </Link>
            }
          />
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {complaints.map((c) => (
              <ComplaintCard key={c.id} complaint={c} linkPrefix="/complaints" />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
