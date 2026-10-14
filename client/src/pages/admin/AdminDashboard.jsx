import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import {
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
  CartesianGrid,
  Legend,
} from 'recharts';
import {
  FileText,
  Clock,
  CheckCircle2,
  AlertTriangle,
  Users,
  Download,
  ArrowRight,
  TrendingUp,
  ShieldCheck,
} from 'lucide-react';

export function AdminDashboard() {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const loadDashboard = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      } else {
        setError('Server responded with an unsuccessful status.');
      }
    } catch (err) {
      console.error('Failed to load admin dashboard', err);
      setError(err.response?.data?.message || err.message || 'Failed to load administrative analytics.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) return <LoadingSpinner text="Computing campus issue analytics..." />;

  if (error) {
    return (
      <div className="bg-white dark:bg-slate-900 p-8 rounded-2xl border border-rose-200 dark:border-rose-900/50 shadow-sm text-center max-w-lg mx-auto my-12">
        <AlertTriangle className="w-10 h-10 text-rose-500 mx-auto mb-3" />
        <h2 className="text-lg font-bold text-slate-900 dark:text-white">Unable to Load Dashboard</h2>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 mb-5">{error}</p>
        <button
          onClick={loadDashboard}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl transition-all shadow-md"
        >
          Retry Connection
        </button>
      </div>
    );
  }

  if (!data) return null;

  const metrics = data.metrics || {};
  const charts = data.charts || {};
  const recentComplaints = data.recentComplaints || [];

  const complaintsByCategory = charts.complaintsByCategory || charts.categoryDistribution || [];
  const complaintsByPriority = charts.complaintsByPriority || [];
  const trendsOverTime = charts.trendsOverTime || [];
  const staffWorkload = charts.staffWorkload || [];

  const PRIORITY_COLORS = {
    Low: '#10B981',
    Medium: '#F59E0B',
    High: '#EF4444',
  };

  const chartGridStroke = isDark ? '#1e293b' : '#f1f5f9';
  const chartTickFill = isDark ? '#94a3b8' : '#64748b';
  const chartTooltipStyle = {
    borderRadius: '12px',
    fontSize: '12px',
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    color: isDark ? '#f8fafc' : '#0f172a',
    boxShadow: isDark ? '0 10px 25px -5px rgba(0,0,0,0.5)' : '0 10px 15px -3px rgba(0,0,0,0.1)',
  };

  return (
    <div className="space-y-8">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <div className="inline-flex items-center space-x-1.5 text-xs font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/70 px-2.5 py-0.5 rounded-md mb-1 border border-blue-100 dark:border-blue-900">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Administrative Command Center</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white tracking-tight">
            Campus Issues & Operational Analytics
          </h1>
        </div>

        <div className="flex items-center space-x-3">
          <a
            href="/api/admin/reports/export"
            download
            className="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-xl shadow-sm transition-all"
          >
            <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
            <span>Export CSV Report</span>
          </a>
          <Link
            to="/admin/complaints"
            className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-md transition-all hover:scale-[1.02]"
          >
            <span>Manage All Issues</span>
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>

      {/* Top 6 KPI Metric Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-4">
        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[11px] font-bold text-slate-400 uppercase tracking-wider block">
            Total Issues
          </span>
          <p className="text-2xl font-black text-slate-900 dark:text-white mt-1">{metrics.totalComplaints}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">All recorded</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[11px] font-bold text-blue-500 uppercase tracking-wider block">
            Newly Lodged
          </span>
          <p className="text-2xl font-black text-blue-600 dark:text-blue-400 mt-1">{metrics.newlySubmitted}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Awaiting assignment</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[11px] font-bold text-amber-500 uppercase tracking-wider block">
            In Progress
          </span>
          <p className="text-2xl font-black text-amber-600 dark:text-amber-400 mt-1">{metrics.inProgress}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Work ongoing</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[11px] font-bold text-emerald-500 uppercase tracking-wider block">
            Resolved
          </span>
          <p className="text-2xl font-black text-emerald-600 dark:text-emerald-400 mt-1">{metrics.resolved}</p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Repairs completed</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[11px] font-bold text-rose-500 uppercase tracking-wider block">
            SLA Overdue
          </span>
          <p className="text-2xl font-black text-rose-600 dark:text-rose-400 mt-1">{metrics.overdue}</p>
          <span className="text-[10px] text-rose-400 font-semibold">Exceeded SLA</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-[11px] font-bold text-indigo-500 uppercase tracking-wider block">
            Avg Resolution
          </span>
          <p className="text-2xl font-black text-indigo-600 dark:text-indigo-400 mt-1">
            {metrics.avgResolutionTimeHours}h
          </p>
          <span className="text-[10px] text-slate-400 dark:text-slate-500">Mean time to fix</span>
        </div>
      </div>

      {/* Analytics Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Category Breakdown Bar Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Complaints by Category</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Volume of incidents across campus divisions</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintsByCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridStroke} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: chartTickFill }} interval={0} angle={-15} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: chartTickFill }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Priority Breakdown Pie Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Issue Urgency Distribution</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Proportion of Low, Medium, and High priority reports</p>
          <div className="h-64 flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={complaintsByPriority}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={85}
                  paddingAngle={5}
                  dataKey="count"
                >
                  {complaintsByPriority.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={PRIORITY_COLORS[entry.name] || '#94a3b8'} />
                  ))}
                </Pie>
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend verticalAlign="bottom" height={36} iconType="circle" />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* 7-Day Trend Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">7-Day Complaint Velocity</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">New submissions vs. resolved issues over time</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridStroke} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: chartTickFill }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: chartTickFill }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={2.5} name="Submitted" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2.5} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Staff Workload Chart */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Staff Dispatch & Resolution Workload</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Assigned tasks vs. completed tickets per technician</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffWorkload}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={chartGridStroke} />
                <XAxis dataKey="name" tick={{ fontSize: 11, fill: chartTickFill }} />
                <YAxis allowDecimals={false} tick={{ fontSize: 11, fill: chartTickFill }} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Bar dataKey="assigned" fill="#6366f1" name="Assigned" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Recent Complaints Table */}
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
        <div className="p-6 flex items-center justify-between border-b border-slate-100 dark:border-slate-800">
          <div>
            <h2 className="text-base font-bold text-slate-900 dark:text-white">Recent Complaints Queue</h2>
            <p className="text-xs text-slate-500 dark:text-slate-400">Quick view of latest submitted issues</p>
          </div>
          <Link
            to="/admin/complaints"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 inline-flex items-center space-x-1"
          >
            <span>View all complaints</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
            <thead className="bg-slate-50 dark:bg-slate-950 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
              <tr>
                <th className="px-6 py-3.5">ID</th>
                <th className="px-6 py-3.5">Title</th>
                <th className="px-6 py-3.5">Category</th>
                <th className="px-6 py-3.5">Priority</th>
                <th className="px-6 py-3.5">Status</th>
                <th className="px-6 py-3.5">Reporter</th>
                <th className="px-6 py-3.5">Assigned Staff</th>
                <th className="px-6 py-3.5 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800 font-medium">
              {recentComplaints.map((c) => {
                const staffName =
                  (c.assignments && c.assignments.length > 0 && c.assignments[0]?.staff?.name) ||
                  c.assignedStaff?.name ||
                  'Unassigned';

                return (
                  <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                    <td className="px-6 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                      {c.complaintNumber}
                    </td>
                    <td className="px-6 py-3.5 font-bold text-slate-900 dark:text-white max-w-xs truncate">
                      {c.title}
                    </td>
                    <td className="px-6 py-3.5 text-slate-700 dark:text-slate-300">{c.category?.name}</td>
                    <td className="px-6 py-3.5">
                      <PriorityBadge priority={c.priority} />
                    </td>
                    <td className="px-6 py-3.5">
                      <StatusBadge status={c.status} />
                    </td>
                    <td className="px-6 py-3.5 text-slate-800 dark:text-slate-200">{c.student?.name}</td>
                    <td className="px-6 py-3.5">
                      <span
                        className={
                          staffName === 'Unassigned'
                            ? 'text-amber-600 dark:text-amber-400 font-bold'
                            : 'text-slate-800 dark:text-slate-200'
                        }
                      >
                        {staffName}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <Link
                        to={`/admin/complaints?search=${c.complaintNumber}`}
                        className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-bold inline-flex items-center space-x-1"
                      >
                        <span>Manage</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

