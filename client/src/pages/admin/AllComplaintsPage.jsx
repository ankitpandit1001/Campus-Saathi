import React, { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { Pagination } from '../../components/common/Pagination';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { EmptyState } from '../../components/common/EmptyState';
import { Modal } from '../../components/common/Modal';
import {
  Search,
  Download,
  UserCheck,
  CheckCircle,
  XCircle,
  RefreshCw,
  FileText,
  Eye,
  Calendar,
} from 'lucide-react';

export function AllComplaintsPage() {
  const [searchParams, setSearchParams] = useSearchParams();
  const { showToast } = useToast();

  const [complaints, setComplaints] = useState([]);
  const [categories, setCategories] = useState([]);
  const [staffUsers, setStaffUsers] = useState([]);
  const [pagination, setPagination] = useState({ currentPage: 1, totalPages: 1, totalCount: 0 });
  const [loading, setLoading] = useState(true);

  // Filters
  const [search, setSearch] = useState(searchParams.get('search') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');
  const [priority, setPriority] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [page, setPage] = useState(1);

  // Assignment Modal
  const [assignModalOpen, setAssignModalOpen] = useState(false);
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [selectedStaffId, setSelectedStaffId] = useState('');
  const [assignNotes, setAssignNotes] = useState('');
  const [assignPriority, setAssignPriority] = useState('MEDIUM');
  const [assignLoading, setAssignLoading] = useState(false);

  // Status Modal (e.g. Reject or Close)
  const [statusModalOpen, setStatusModalOpen] = useState(false);
  const [newStatus, setNewStatus] = useState('IN_PROGRESS');
  const [statusNotes, setStatusNotes] = useState('');
  const [rejectionReason, setRejectionReason] = useState('');
  const [statusLoading, setStatusLoading] = useState(false);

  // Detail Modal
  const [detailModalOpen, setDetailModalOpen] = useState(false);
  const [detailComplaint, setDetailComplaint] = useState(null);

  useEffect(() => {
    async function loadMeta() {
      try {
        const [catRes, userRes] = await Promise.all([
          api.get('/admin/categories'),
          api.get('/admin/users?role=STAFF'),
        ]);
        if (catRes.data.success) setCategories(catRes.data.data.categories);
        if (userRes.data.success) setStaffUsers(userRes.data.data.users.filter((u) => u.isActive));
      } catch (err) {
        console.warn('Failed to load filter metadata');
      }
    }
    loadMeta();
  }, []);

  const fetchComplaints = async () => {
    try {
      setLoading(true);
      const params = new URLSearchParams();
      params.append('page', page);
      params.append('limit', '10');
      if (search) params.append('search', search);
      if (status) params.append('status', status);
      if (priority) params.append('priority', priority);
      if (categoryId) params.append('categoryId', categoryId);

      const res = await api.get(`/complaints?${params.toString()}`);
      if (res.data.success) {
        setComplaints(res.data.data.complaints);
        setPagination(res.data.data.pagination);
      }
    } catch (err) {
      console.error('Failed to load complaints', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchComplaints();
  }, [page, search, status, priority, categoryId]);

  const handleOpenAssign = (complaint) => {
    setSelectedComplaint(complaint);
    setSelectedStaffId(complaint.assignments?.[0]?.staffId || (staffUsers[0]?.id || ''));
    setAssignPriority(complaint.priority || 'MEDIUM');
    setAssignNotes('');
    setAssignModalOpen(true);
  };

  const handleAssignSubmit = async (e) => {
    e.preventDefault();
    if (!selectedStaffId) {
      showToast('Please select a staff member.', 'error');
      return;
    }

    try {
      setAssignLoading(true);
      const res = await api.patch(`/admin/complaints/${selectedComplaint.id}/assign`, {
        staffId: selectedStaffId,
        notes: assignNotes.trim(),
        priority: assignPriority,
      });

      if (res.data.success) {
        showToast('Complaint assigned successfully!', 'success');
        setAssignModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Assignment failed', 'error');
    } finally {
      setAssignLoading(false);
    }
  };

  const handleOpenStatus = (complaint) => {
    setSelectedComplaint(complaint);
    setNewStatus(complaint.status);
    setStatusNotes('');
    setRejectionReason('');
    setStatusModalOpen(true);
  };

  const handleStatusSubmit = async (e) => {
    e.preventDefault();
    if (newStatus === 'REJECTED' && rejectionReason.trim().length < 5) {
      showToast('Rejection reason must be at least 5 characters.', 'error');
      return;
    }

    try {
      setStatusLoading(true);
      const res = await api.patch(`/admin/complaints/${selectedComplaint.id}/status`, {
        status: newStatus,
        notes: statusNotes.trim(),
        rejectionReason: newStatus === 'REJECTED' ? rejectionReason.trim() : undefined,
      });

      if (res.data.success) {
        showToast(`Complaint status changed to ${newStatus}!`, 'success');
        setStatusModalOpen(false);
        fetchComplaints();
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Status update failed', 'error');
    } finally {
      setStatusLoading(false);
    }
  };

  const handleViewDetails = async (c) => {
    try {
      const res = await api.get(`/complaints/${c.id}`);
      if (res.data.success) {
        setDetailComplaint(res.data.data.complaint);
        setDetailModalOpen(true);
      }
    } catch (err) {
      showToast('Failed to load complaint details', 'error');
    }
  };

  const handleExportCsv = () => {
    const params = new URLSearchParams();
    if (status) params.append('status', status);
    if (priority) params.append('priority', priority);
    if (categoryId) params.append('categoryId', categoryId);

    window.open(`/api/admin/reports/export?${params.toString()}`, '_blank');
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">All Campus Complaints</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Institutional master queue: review, dispatch technicians, and manage resolution statuses
          </p>
        </div>

        <button
          onClick={handleExportCsv}
          className="inline-flex items-center space-x-2 text-xs font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-850 hover:bg-slate-50 dark:hover:bg-slate-800 border border-slate-300 dark:border-slate-700 px-4 py-2.5 rounded-xl shadow-sm transition-all self-start sm:self-auto"
        >
          <Download className="w-4 h-4 text-slate-500 dark:text-slate-400" />
          <span>Export Filtered CSV</span>
        </button>
      </div>

      {/* Filter Bar */}
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
              placeholder="Search by ID, title, location..."
              className="w-full pl-9 pr-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <select
            value={status}
            onChange={(e) => {
              setStatus(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
          >
            <option value="">All Statuses</option>
            <option value="SUBMITTED">Submitted</option>
            <option value="UNDER_REVIEW">Under Review</option>
            <option value="ASSIGNED">Assigned</option>
            <option value="IN_PROGRESS">In Progress</option>
            <option value="RESOLVED">Resolved</option>
            <option value="CLOSED">Closed</option>
            <option value="REOPENED">Reopened</option>
            <option value="REJECTED">Rejected</option>
          </select>

          <select
            value={priority}
            onChange={(e) => {
              setPriority(e.target.value);
              setPage(1);
            }}
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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
            className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
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
              onClick={() => {
                setSearch('');
                setStatus('');
                setPriority('');
                setCategoryId('');
                setPage(1);
              }}
              className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold inline-flex items-center space-x-1"
            >
              <RefreshCw className="w-3 h-3" />
              <span>Reset Filters</span>
            </button>
          </div>
        )}
      </div>

      {/* Main Table */}
      {loading ? (
        <LoadingSpinner text="Loading complaints directory..." />
      ) : complaints.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No complaints match filters"
          description="Try broadening your search or resetting active filters."
        />
      ) : (
        <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm overflow-hidden transition-colors">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-600 dark:text-slate-300">
              <thead className="bg-slate-50 dark:bg-slate-850 text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase tracking-wider border-b border-slate-100 dark:border-slate-800">
                <tr>
                  <th className="px-5 py-3.5">ID</th>
                  <th className="px-5 py-3.5">Title & Location</th>
                  <th className="px-5 py-3.5">Category</th>
                  <th className="px-5 py-3.5">Priority</th>
                  <th className="px-5 py-3.5">Status</th>
                  <th className="px-5 py-3.5">Reporter</th>
                  <th className="px-5 py-3.5">Assigned Staff</th>
                  <th className="px-5 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60 font-medium">
                {complaints.map((c) => {
                  const staffName =
                    c.assignments && c.assignments.length > 0 && c.assignments[0].staff
                      ? c.assignments[0].staff.name
                      : 'Unassigned';

                  return (
                    <tr key={c.id} className="hover:bg-slate-50/70 dark:hover:bg-slate-800/50 transition-colors">
                      <td className="px-5 py-3.5 font-mono font-bold text-blue-600 dark:text-blue-400">
                        {c.complaintNumber}
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="font-bold text-slate-900 dark:text-white max-w-xs truncate">{c.title}</p>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-0.5">{c.location}</p>
                      </td>
                      <td className="px-5 py-3.5 text-slate-700 dark:text-slate-300">{c.category?.name}</td>
                      <td className="px-5 py-3.5">
                        <PriorityBadge priority={c.priority} />
                      </td>
                      <td className="px-5 py-3.5">
                        <StatusBadge status={c.status} />
                      </td>
                      <td className="px-5 py-3.5">
                        <p className="text-slate-900 dark:text-slate-200 font-semibold">{c.student?.name}</p>
                        <p className="text-[10px] text-slate-400 dark:text-slate-500">{c.student?.department || 'Student'}</p>
                      </td>
                      <td className="px-5 py-3.5">
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
                      <td className="px-5 py-3.5 text-right space-x-1.5 whitespace-nowrap">
                        <button
                          onClick={() => handleViewDetails(c)}
                          className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenAssign(c)}
                          className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                          title="Assign Staff"
                        >
                          <UserCheck className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => handleOpenStatus(c)}
                          className="p-1.5 rounded-lg text-indigo-600 dark:text-indigo-400 hover:text-indigo-800 dark:hover:text-indigo-300 hover:bg-indigo-50 dark:hover:bg-indigo-900/30 transition-colors"
                          title="Change Status"
                        >
                          <CheckCircle className="w-4 h-4" />
                        </button>
                      </td>
                    </tr>
                  );
                })}
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

      {/* Assignment Modal */}
      <Modal
        isOpen={assignModalOpen}
        onClose={() => setAssignModalOpen(false)}
        title={`Assign Staff: ${selectedComplaint?.complaintNumber}`}
      >
        <form onSubmit={handleAssignSubmit} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300">
            Dispatch an active maintenance technician to resolve:{' '}
            <span className="font-semibold text-slate-900 dark:text-white">"{selectedComplaint?.title}"</span>
          </p>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Select Maintenance Staff <span className="text-rose-500">*</span>
            </label>
            <select
              required
              value={selectedStaffId}
              onChange={(e) => setSelectedStaffId(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="">Choose technician...</option>
              {staffUsers.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.name} - {s.department || 'Maintenance'} ({s.email})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Override Priority (Optional)
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['LOW', 'MEDIUM', 'HIGH'].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setAssignPriority(p)}
                  className={`py-1.5 px-3 text-xs font-bold rounded-lg border text-center transition-all ${
                    assignPriority === p
                      ? 'bg-blue-50 dark:bg-blue-950/60 border-blue-400 dark:border-blue-500 text-blue-700 dark:text-blue-300'
                      : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-750'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Administrative Dispatch Instructions (Optional)
            </label>
            <textarea
              rows={3}
              value={assignNotes}
              onChange={(e) => setAssignNotes(e.target.value)}
              placeholder="e.g. Please bring spare parts from Electrical Store Room B..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setAssignModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={assignLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
            >
              {assignLoading ? 'Dispatching...' : 'Confirm Assignment'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Status Update / Reject Modal */}
      <Modal
        isOpen={statusModalOpen}
        onClose={() => setStatusModalOpen(false)}
        title={`Update Status: ${selectedComplaint?.complaintNumber}`}
      >
        <form onSubmit={handleStatusSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Target Status
            </label>
            <select
              value={newStatus}
              onChange={(e) => setNewStatus(e.target.value)}
              className="w-full px-3 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            >
              <option value="UNDER_REVIEW">Under Review</option>
              <option value="IN_PROGRESS">In Progress</option>
              <option value="RESOLVED">Resolved</option>
              <option value="CLOSED">Closed</option>
              <option value="REJECTED">Reject Complaint</option>
            </select>
          </div>

          {newStatus === 'REJECTED' && (
            <div>
              <label className="block text-xs font-bold text-rose-700 dark:text-rose-400 uppercase tracking-wider mb-1">
                Rejection Reason (Required) <span className="text-rose-500">*</span>
              </label>
              <textarea
                required
                rows={3}
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Explain why this complaint was deemed invalid or duplicate..."
                className="w-full p-2.5 text-xs rounded-xl border border-rose-300 dark:border-rose-800 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-rose-500"
              />
            </div>
          )}

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Audit Notes
            </label>
            <textarea
              rows={2}
              value={statusNotes}
              onChange={(e) => setStatusNotes(e.target.value)}
              placeholder="Administrative audit comments..."
              className="w-full p-2.5 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setStatusModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={statusLoading}
              className={`px-5 py-2 text-xs font-bold text-white rounded-xl shadow-md transition-colors ${
                newStatus === 'REJECTED'
                  ? 'bg-rose-600 hover:bg-rose-700'
                  : 'bg-blue-600 hover:bg-blue-700'
              }`}
            >
              {statusLoading ? 'Updating...' : 'Update Status'}
            </button>
          </div>
        </form>
      </Modal>

      {/* Detail Modal */}
      <Modal
        isOpen={detailModalOpen}
        onClose={() => setDetailModalOpen(false)}
        title={`Complaint Details: ${detailComplaint?.complaintNumber}`}
        maxWidth="max-w-2xl"
      >
        {detailComplaint && (
          <div className="space-y-4 text-xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
              <span className="font-semibold text-slate-700 dark:text-slate-300">{detailComplaint.category?.name}</span>
              <div className="flex items-center space-x-2">
                <PriorityBadge priority={detailComplaint.priority} />
                <StatusBadge status={detailComplaint.status} />
              </div>
            </div>

            <div>
              <h3 className="text-sm font-bold text-slate-900 dark:text-white">{detailComplaint.title}</h3>
              <p className="text-slate-600 dark:text-slate-300 whitespace-pre-line mt-1.5 leading-relaxed">
                {detailComplaint.description}
              </p>
            </div>

            {detailComplaint.imageUrl && (
              <div className="pt-2">
                <span className="text-[11px] font-bold text-slate-500 dark:text-slate-400 uppercase block mb-1">
                  Photo Attachment
                </span>
                <img
                  src={api.getAssetUrl(detailComplaint.imageUrl)}
                  alt="Attachment"
                  className="max-h-48 rounded-xl border border-slate-200 dark:border-slate-700"
                />
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-3 border-t border-slate-100 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Reporter</span>
                <span>{detailComplaint.student?.name} ({detailComplaint.student?.email})</span>
              </div>
              <div>
                <span className="font-bold text-slate-700 dark:text-slate-300 block">Location</span>
                <span>{detailComplaint.location} {detailComplaint.roomNumber ? `(${detailComplaint.roomNumber})` : ''}</span>
              </div>
            </div>
          </div>
        )}
      </Modal>
    </div>
  );
}
