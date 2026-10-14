import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useTheme } from '../../context/ThemeContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
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
import { Download, Calendar, Filter, BarChart3, TrendingUp, AlertTriangle } from 'lucide-react';

export function AnalyticsReportsPage() {
  const { isDark } = useTheme();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [fromDate, setFromDate] = useState('');
  const [toDate, setToDate] = useState('');

  const fetchAnalytics = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/dashboard');
      if (res.data.success) {
        setData(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load analytics', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalytics();
  }, []);

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (fromDate) params.append('fromDate', fromDate);
    if (toDate) params.append('toDate', toDate);
    window.open(`/api/admin/reports/export?${params.toString()}`, '_blank');
  };

  if (loading) return <LoadingSpinner text="Compiling analytics & reports..." />;
  if (!data) return null;

  const metrics = data.metrics || {};
  const charts = data.charts || {};

  const totalComplaints = metrics.totalComplaints ?? metrics.total ?? 0;
  const newlySubmitted = metrics.newlySubmitted ?? metrics.submitted ?? 0;
  const inProgress = metrics.inProgress ?? 0;
  const resolved = metrics.resolved ?? 0;
  const overdue = metrics.overdue ?? 0;
  const avgResolutionTimeHours = metrics.avgResolutionTimeHours ?? metrics.avgResolutionHours ?? 0;

  const complaintsByCategory = charts.complaintsByCategory || charts.categoryDistribution || [];
  const complaintsByPriority = charts.complaintsByPriority || [];
  const trendsOverTime = charts.trendsOverTime || [];
  const staffWorkload = charts.staffWorkload || [];

  const PRIORITY_COLORS = {
    Low: '#10B981',
    Medium: '#F59E0B',
    High: '#EF4444',
  };

  const chartTooltipStyle = {
    backgroundColor: isDark ? '#0f172a' : '#ffffff',
    borderColor: isDark ? '#334155' : '#e2e8f0',
    color: isDark ? '#f8fafc' : '#0f172a',
    borderRadius: '12px',
    fontSize: '12px',
    boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)',
  };

  const axisTickStyle = {
    fill: isDark ? '#94a3b8' : '#64748b',
    fontSize: 11,
  };

  const gridStroke = isDark ? '#334155' : '#f1f5f9';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Analytics & Reports</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional performance reporting, SLA compliance rates, and data export
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-5 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4" />
          <span>Export Complaints CSV</span>
        </button>
      </div>

      {/* Date Filter Bar */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-wrap items-center justify-between gap-4 transition-colors">
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <span className="font-bold text-slate-700 dark:text-slate-300">Filter By Date:</span>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 dark:text-slate-500">From:</span>
            <input
              type="date"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400 dark:text-slate-500">To:</span>
            <input
              type="date"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>
        </div>

        {(fromDate || toDate) && (
          <button
            onClick={() => {
              setFromDate('');
              setToDate('');
            }}
            className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
          >
            Clear Date Filters
          </button>
        )}
      </div>

      {/* Summary Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Average Resolution Velocity
          </span>
          <p className="text-3xl font-extrabold text-blue-600 dark:text-blue-400 mt-2">
            {avgResolutionTimeHours} hrs
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Calculated from closed tickets</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Resolution Success Rate
          </span>
          <p className="text-3xl font-extrabold text-emerald-600 dark:text-emerald-400 mt-2">
            {totalComplaints > 0
              ? Math.round((resolved / totalComplaints) * 100)
              : 0}%
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Resolved vs total logged</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            Active Backlog
          </span>
          <p className="text-3xl font-extrabold text-amber-600 dark:text-amber-400 mt-2">
            {newlySubmitted + inProgress}
          </p>
          <span className="text-[11px] text-slate-400 dark:text-slate-500">Submitted & In Progress</span>
        </div>

        <div className="bg-white dark:bg-slate-900 p-5 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <span className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider block">
            SLA Breached (Overdue)
          </span>
          <p className="text-3xl font-extrabold text-rose-600 dark:text-rose-400 mt-2">{overdue}</p>
          <span className="text-[11px] text-rose-400 dark:text-rose-400 font-medium">Exceeded target SLA</span>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Infrastructure Issue Categories</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Total complaints categorized by department</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={complaintsByCategory}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="name" tick={axisTickStyle} angle={-15} textAnchor="end" height={50} />
                <YAxis allowDecimals={false} tick={axisTickStyle} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Bar dataKey="count" fill="#3b82f6" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Issue Severity Distribution</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Breakdown of reported incident severity</p>
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

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">7-Day Incident Trend Line</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Submission pace vs. resolution closure</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={trendsOverTime}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="date" tick={axisTickStyle} />
                <YAxis allowDecimals={false} tick={axisTickStyle} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Line type="monotone" dataKey="submitted" stroke="#3b82f6" strokeWidth={2} name="Submitted" />
                <Line type="monotone" dataKey="resolved" stroke="#10b981" strokeWidth={2} name="Resolved" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <h2 className="text-sm font-bold text-slate-900 dark:text-white mb-1">Technician Workload Analysis</h2>
          <p className="text-xs text-slate-400 dark:text-slate-500 mb-4">Tickets assigned vs resolved per technician</p>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={staffWorkload}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={gridStroke} />
                <XAxis dataKey="name" tick={axisTickStyle} />
                <YAxis allowDecimals={false} tick={axisTickStyle} />
                <Tooltip contentStyle={chartTooltipStyle} />
                <Legend />
                <Bar dataKey="assigned" fill="#6366f1" name="Assigned" radius={[4, 4, 0, 0]} />
                <Bar dataKey="resolved" fill="#10b981" name="Resolved" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}
