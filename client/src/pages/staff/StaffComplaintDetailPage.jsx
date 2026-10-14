import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { StatusBadge, PriorityBadge } from '../../components/common/Badge';
import { StatusTimeline } from '../../components/complaints/StatusTimeline';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import {
  ArrowLeft,
  MapPin,
  Calendar,
  Building,
  User,
  Clock,
  Play,
  CheckCircle2,
  MessageSquare,
  Send,
  Lock,
} from 'lucide-react';

export function StaffComplaintDetailPage() {
  const { id } = useParams();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);

  // Status updates
  const [inProgressLoading, setInProgressLoading] = useState(false);
  const [resolveModalOpen, setResolveModalOpen] = useState(false);
  const [resolutionSummary, setResolutionSummary] = useState('');
  const [resolveLoading, setResolveLoading] = useState(false);

  // Notes
  const [newNote, setNewNote] = useState('');
  const [isInternal, setIsInternal] = useState(false);
  const [noteLoading, setNoteLoading] = useState(false);

  useEffect(() => {
    async function fetchComplaint() {
      try {
        setLoading(true);
        const res = await api.get(`/complaints/${id}`);
        if (res.data.success) {
          setComplaint(res.data.data.complaint);
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Access denied or complaint not found', 'error');
        navigate('/staff/complaints');
      } finally {
        setLoading(false);
      }
    }
    fetchComplaint();
  }, [id, navigate, showToast]);

  const handleSetInProgress = async () => {
    try {
      setInProgressLoading(true);
      const res = await api.patch(`/staff/complaints/${id}/status`, {
        status: 'IN_PROGRESS',
        notes: 'Technician commenced on-site diagnosis and repair work.',
      });

      if (res.data.success) {
        showToast('Complaint status updated to IN PROGRESS!', 'success');
        // Refresh
        const refresh = await api.get(`/complaints/${id}`);
        if (refresh.data.success) setComplaint(refresh.data.data.complaint);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update status', 'error');
    } finally {
      setInProgressLoading(false);
    }
  };

  const handleResolve = async (e) => {
    e.preventDefault();
    if (resolutionSummary.trim().length < 5) {
      showToast('Resolution summary must be at least 5 characters long.', 'error');
      return;
    }

    try {
      setResolveLoading(true);
      const res = await api.patch(`/staff/complaints/${id}/status`, {
        status: 'RESOLVED',
        resolutionSummary: resolutionSummary.trim(),
      });

      if (res.data.success) {
        showToast('Complaint successfully marked as RESOLVED!', 'success');
        setResolveModalOpen(false);
        const refresh = await api.get(`/complaints/${id}`);
        if (refresh.data.success) setComplaint(refresh.data.data.complaint);
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to mark as resolved', 'error');
    } finally {
      setResolveLoading(false);
    }
  };

  const handleAddNote = async (e) => {
    e.preventDefault();
    if (!newNote.trim()) return;

    try {
      setNoteLoading(true);
      const res = await api.post(`/staff/complaints/${id}/notes`, {
        content: newNote.trim(),
        isInternal,
      });

      if (res.data.success) {
        setComplaint((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data.data.comment],
        }));
        setNewNote('');
        setIsInternal(false);
        showToast('Progress note added successfully', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to add note', 'error');
    } finally {
      setNoteLoading(false);
    }
  };

  if (loading) return <LoadingSpinner text="Loading task details..." />;
  if (!complaint) return null;

  const canStartWork = ['ASSIGNED', 'SUBMITTED', 'REOPENED'].includes(complaint.status);
  const canResolve = ['ASSIGNED', 'IN_PROGRESS', 'REOPENED'].includes(complaint.status);

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/staff/complaints"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Assigned Queue</span>
        </Link>

        {/* Action Controls for Staff */}
        <div className="flex items-center space-x-2.5">
          {canStartWork && (
            <button
              onClick={handleSetInProgress}
              disabled={inProgressLoading}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 px-4 py-2 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              <span>{inProgressLoading ? 'Updating...' : 'Start Work (In Progress)'}</span>
            </button>
          )}

          {canResolve && (
            <button
              onClick={() => setResolveModalOpen(true)}
              className="inline-flex items-center space-x-1.5 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 px-4 py-2 rounded-xl shadow-md transition-all"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>Mark as Resolved</span>
            </button>
          )}
        </div>
      </div>

      {/* Main Card */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm space-y-4 transition-colors">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 dark:border-slate-800 pb-4">
          <div className="flex items-center space-x-2.5">
            <span className="font-mono text-sm font-bold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-3 py-1 rounded-lg border border-blue-100 dark:border-blue-900">
              {complaint.complaintNumber}
            </span>
            <span className="text-xs font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-1 rounded-lg">
              {complaint.category?.name}
            </span>
          </div>

          <div className="flex items-center space-x-2">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        <h1 className="text-xl sm:text-2xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          {complaint.title}
        </h1>

        <p className="text-sm text-slate-700 dark:text-slate-300 whitespace-pre-line leading-relaxed">
          {complaint.description}
        </p>

        {complaint.resolutionSummary && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-xs space-y-1">
            <span className="font-bold text-emerald-800 dark:text-emerald-300">Resolution Summary:</span>
            <p className="font-medium whitespace-pre-line text-emerald-950 dark:text-emerald-100">{complaint.resolutionSummary}</p>
          </div>
        )}

        {complaint.imageUrl && (
          <div className="pt-2">
            <span className="text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider block mb-2">
              Attached Photo
            </span>
            <div className="inline-block rounded-xl border border-slate-200 dark:border-slate-700 overflow-hidden shadow-sm">
              <img
                src={api.getAssetUrl(complaint.imageUrl)}
                alt="Complaint attachment"
                className="max-h-72 w-auto object-contain bg-slate-100 dark:bg-slate-800"
              />
            </div>
          </div>
        )}

        {/* Metadata Details */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Location</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center mt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
              {complaint.location}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Room / Station</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center mt-0.5">
              <Building className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
              {complaint.roomNumber || 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Student (Reporter)</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center mt-0.5">
              <User className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
              {complaint.student?.name} ({complaint.student?.department || 'Student'})
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Lodged Date</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center mt-0.5">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
              {new Date(complaint.createdAt).toLocaleDateString()}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Timeline & Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Timeline */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center space-x-2 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Status Change Timeline
            </h2>
          </div>
          <StatusTimeline history={complaint.statusHistory} />
        </div>

        {/* Discussion / Progress Notes */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Progress Notes & Updates
              </h2>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {!complaint.comments || complaint.comments.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">
                  No notes recorded yet.
                </p>
              ) : (
                complaint.comments.map((comment) => (
                  <div
                    key={comment.id}
                    className={`p-3.5 rounded-xl text-xs space-y-1 ${
                      comment.isInternal
                        ? 'bg-amber-50/80 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/60'
                        : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-1.5 font-bold text-slate-800 dark:text-slate-200">
                        {comment.isInternal && (
                          <span className="inline-flex items-center text-[10px] bg-amber-200/80 dark:bg-amber-900/80 text-amber-900 dark:text-amber-200 px-1.5 py-0.5 rounded font-mono uppercase">
                            <Lock className="w-3 h-3 mr-0.5" /> Internal Note
                          </span>
                        )}
                        <span>{comment.user?.name}</span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                          ({comment.user?.role})
                        </span>
                      </div>
                      <span className="text-[10px] text-slate-400 dark:text-slate-500">
                        {new Date(comment.createdAt).toLocaleTimeString([], {
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </span>
                    </div>
                    <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{comment.content}</p>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Add Staff Note Form */}
          <form onSubmit={handleAddNote} className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2">
            <div className="flex items-center space-x-2 text-xs">
              <label className="flex items-center space-x-1.5 text-slate-600 dark:text-slate-400 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={isInternal}
                  onChange={(e) => setIsInternal(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
                />
                <span className="font-semibold text-amber-800 dark:text-amber-400">Internal technician note (hidden from student)</span>
              </label>
            </div>

            <div className="flex space-x-2">
              <input
                type="text"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                placeholder="Log work note or update..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={noteLoading || !newNote.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center space-x-1 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Mark Resolved Modal */}
      <Modal
        isOpen={resolveModalOpen}
        onClose={() => setResolveModalOpen(false)}
        title={`Resolve Complaint ${complaint.complaintNumber}`}
      >
        <form onSubmit={handleResolve} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            Please document the repair action performed, parts replaced, or diagnostic verification details. This description will be visible to the student and administration.
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Resolution Summary <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={4}
              value={resolutionSummary}
              onChange={(e) => setResolutionSummary(e.target.value)}
              placeholder="e.g. Flashed Cisco AP firmware to 17.9.4 and verified PoE port 14 power output. Wi-Fi verified at -48 dBm..."
              className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setResolveModalOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={resolveLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow-md transition-colors"
            >
              {resolveLoading ? 'Saving...' : 'Confirm Resolution'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
