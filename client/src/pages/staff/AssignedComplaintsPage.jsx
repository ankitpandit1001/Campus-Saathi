import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { ComplaintCard } from '../../components/complaints/ComplaintCard';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Search, Wrench, RefreshCw } from 'lucide-react';

export function AssignedComplaintsPage() {
  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');
  const [priority, setPriority] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get('/admin/categories');
        if (res.data.success) {
          setCategories(res.data.data.categories);
        }
      } catch (err) {
        console.warn('Failed to load categories');
      }
    }
    loadCategories();
  }, []);

  useEffect(() => {
    async function fetchAssigned() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        params.append('page', page);
        params.append('limit', '9');
        if (search) params.append('search', search);
        if (status) params.append('status', status);
        if (priority) params.append('priority', priority);
        if (categoryId) params.append('categoryId', categoryId);

        const res = await api.get(`/staff/complaints?${params.toString()}`);
        if (res.data.success) {
          setComplaints(res.data.data.complaints);
          setPagination(res.data.data.pagination);
        }
      } catch (err) {
        console.error('Failed to load assigned complaints', err);
      } finally {
        setLoading(false);
      }
    }
    fetchAssigned();
  }, [page, search, status, priority, categoryId]);

  const handleResetFilters = () => {
    setSearch('');
    setStatus('');
    setPriority('');
    setCategoryId('');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Assigned Work Queue</h1>
        <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
          Manage complaints dispatched to you by college administration
        </p>
      </div>

      {/* Filter Controls */}
      <div className="bg-white dark:bg-slate-900 p-4 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-3 transition-colors">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-400 dark:text-slate-500" />
            <input
              type="text"
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by ID or location..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">All Statuses</option>
            <option value="ASSIGNED">Assigned (New)</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="REOPENED">Reopened</option>
          </select>

          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">All Priorities</option>
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
          </select>

          <select
            value={categoryId}
            onChange={(e) => {
              setCategoryId(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200 font-medium focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
          >
            <option value="">All Categories</option>
            {categories.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name}
              </option>
            ))}
          </select>
        </div>

        {(search || status || priority || categoryId) && (
          <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-xs">
            <span className="text-slate-500 dark:text-slate-400">Active filters applied</span>
            <button
              onClick={handleResetFilters}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold inline-flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {loading ? (
        <LoadingSpinner text="Loading assigned tasks..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={Wrench}
          title="No matching assigned complaints"
          description="Adjust your search criteria or clear filters to view all your tasks."
          action={
            <button
              onClick={handleResetFilters}
              className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:underline"
            >
              Reset filters
            </button>
          }
        />
      ) : (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {complaints.map((c) => (
              <ComplaintCard
                key={c.id}
                complaint={c}
                linkPrefix="/staff/complaints"
              />
            ))}
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
