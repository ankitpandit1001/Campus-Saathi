import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
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
  RotateCcw,
  MessageSquare,
  Send,
  AlertCircle,
  CheckCircle2,
  FileImage,
} from 'lucide-react';

export function ComplaintDetailPage() {
  const { id } = useParams();
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [complaint, setComplaint] = useState(null);
  const [loading, setLoading] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [commentLoading, setCommentLoading] = useState(false);

  // Reopen Modal state
  const [isReopenOpen, setIsReopenOpen] = useState(false);
  const [reopenReason, setReopenReason] = useState('');
  const [reopenLoading, setReopenLoading] = useState(false);

  useEffect(() => {
    async function fetchComplaint() {
      try {
        setLoading(true);
        const res = await api.get(`/complaints/${id}`);
        if (res.data.success) {
          setComplaint(res.data.data.complaint);
        }
      } catch (err) {
        showToast(err.response?.data?.message || 'Failed to load complaint', 'error');
        navigate('/my-complaints');
      } finally {
        setLoading(false);
      }
    }
    fetchComplaint();
  }, [id, navigate, showToast]);

  const handleAddComment = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    try {
      setCommentLoading(true);
      const res = await api.post(`/complaints/${id}/comments`, {
        content: newComment.trim(),
        isInternal: false,
      });

      if (res.data.success) {
        setComplaint((prev) => ({
          ...prev,
          comments: [...(prev.comments || []), res.data.data.comment],
        }));
        setNewComment('');
        showToast('Comment posted successfully', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to post comment', 'error');
    } finally {
      setCommentLoading(false);
    }
  };

  const handleReopen = async (e) => {
    e.preventDefault();
    if (reopenReason.trim().length < 5) {
      showToast('Please provide a detailed explanation for reopening (min 5 chars).', 'error');
      return;
    }

    try {
      setReopenLoading(true);
      const res = await api.post(`/complaints/${id}/reopen`, {
        reopenReason: reopenReason.trim(),
      });

      if (res.data.success) {
        showToast('Complaint reopened successfully.', 'success');
        setIsReopenOpen(false);
        // Refresh complaint data
        const refreshRes = await api.get(`/complaints/${id}`);
        if (refreshRes.data.success) {
          setComplaint(refreshRes.data.data.complaint);
        }
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to reopen complaint', 'error');
    } finally {
      setReopenLoading(false);
    }
  };

  if (loading) {
    return <LoadingSpinner text="Loading complaint details..." />;
  }

  if (!complaint) return null;

  const assignedStaff =
    complaint.assignments && complaint.assignments.length > 0
      ? complaint.assignments[0].staff
      : null;

  const isResolved = complaint.status === 'RESOLVED';
  const isRejected = complaint.status === 'REJECTED';
  const isReopened = complaint.status === 'REOPENED';

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Navigation & Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <Link
          to="/my-complaints"
          className="inline-flex items-center space-x-2 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Complaints</span>
        </Link>

        {isResolved && (
          <button
            onClick={() => setIsReopenOpen(true)}
            className="inline-flex items-center space-x-2 text-xs font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-950/40 hover:bg-amber-100 dark:hover:bg-amber-900/50 border border-amber-300 dark:border-amber-800 px-4 py-2 rounded-xl transition-all shadow-sm self-start sm:self-auto"
          >
            <RotateCcw className="w-4 h-4" />
            <span>Reopen Complaint</span>
          </button>
        )}
      </div>

      {/* Main Header Card */}
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

        {/* Resolution Banner if resolved */}
        {complaint.resolutionSummary && (
          <div className="p-4 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-200 dark:border-emerald-800/80 text-emerald-900 dark:text-emerald-200 text-xs space-y-1">
            <div className="flex items-center space-x-2 font-bold text-emerald-800 dark:text-emerald-300">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>Resolution Description</span>
            </div>
            <p className="pl-6 text-emerald-950 dark:text-emerald-100 font-medium whitespace-pre-line">
              {complaint.resolutionSummary}
            </p>
          </div>
        )}

        {/* Rejection Banner if rejected */}
        {isRejected && complaint.rejectionReason && (
          <div className="p-4 rounded-xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800/80 text-rose-900 dark:text-rose-200 text-xs space-y-1">
            <div className="flex items-center space-x-2 font-bold text-rose-800 dark:text-rose-300">
              <AlertCircle className="w-4 h-4 text-rose-600 dark:text-rose-400" />
              <span>Rejection Reason</span>
            </div>
            <p className="pl-6 text-rose-950 dark:text-rose-100 font-medium">{complaint.rejectionReason}</p>
          </div>
        )}

        {/* Reopened Notice */}
        {isReopened && complaint.reopenReason && (
          <div className="p-4 rounded-xl bg-orange-50 dark:bg-orange-950/40 border border-orange-200 dark:border-orange-800/80 text-orange-900 dark:text-orange-200 text-xs space-y-1">
            <div className="flex items-center space-x-2 font-bold text-orange-800 dark:text-orange-300">
              <RotateCcw className="w-4 h-4 text-orange-600 dark:text-orange-400" />
              <span>Student Reopened Reason</span>
            </div>
            <p className="pl-6 text-orange-950 dark:text-orange-100 font-medium">{complaint.reopenReason}</p>
          </div>
        )}

        {/* Photo Attachment if available */}
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

        {/* Metadata Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100 dark:border-slate-800 text-xs">
          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Location</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center mt-0.5">
              <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
              {complaint.location}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Room / Desk</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center mt-0.5">
              <Building className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
              {complaint.roomNumber || 'N/A'}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Lodged On</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center mt-0.5">
              <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
              {new Date(complaint.createdAt).toLocaleDateString()}
            </span>
          </div>

          <div>
            <span className="text-slate-400 dark:text-slate-500 block font-medium">Assigned Staff</span>
            <span className="font-semibold text-slate-800 dark:text-slate-200 inline-flex items-center mt-0.5">
              <User className="w-3.5 h-3.5 mr-1 text-slate-400 dark:text-slate-500" />
              {assignedStaff ? assignedStaff.name : 'Pending Assignment'}
            </span>
          </div>
        </div>
      </div>

      {/* Two Column Layout: Timeline & Comments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Status Lifecycle Timeline */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm transition-colors">
          <div className="flex items-center space-x-2 mb-6 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Clock className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
              Status Change Timeline
            </h2>
          </div>
          <StatusTimeline history={complaint.statusHistory} />
        </div>

        {/* Discussion / Comments Section */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-slate-200/80 dark:border-slate-800 shadow-sm flex flex-col justify-between transition-colors">
          <div>
            <div className="flex items-center space-x-2 mb-4 pb-3 border-b border-slate-100 dark:border-slate-800">
              <MessageSquare className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              <h2 className="text-sm font-bold text-slate-900 dark:text-white uppercase tracking-wider">
                Progress Discussion
              </h2>
            </div>

            <div className="space-y-3 max-h-80 overflow-y-auto pr-1">
              {!complaint.comments || complaint.comments.length === 0 ? (
                <p className="text-xs text-slate-400 dark:text-slate-500 py-6 text-center">
                  No notes or comments on this complaint yet.
                </p>
              ) : (
                complaint.comments.map((comment) => {
                  const isStaff = comment.user?.role === 'STAFF';
                  const isAdmin = comment.user?.role === 'ADMIN';

                  return (
                    <div
                      key={comment.id}
                      className={`p-3.5 rounded-xl text-xs space-y-1 ${
                        isStaff
                          ? 'bg-teal-50/70 dark:bg-teal-950/30 border border-teal-100 dark:border-teal-900/60'
                          : isAdmin
                          ? 'bg-indigo-50/70 dark:bg-indigo-950/30 border border-indigo-100 dark:border-indigo-900/60'
                          : 'bg-slate-50 dark:bg-slate-800/60 border border-slate-100 dark:border-slate-800'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {comment.user?.name}{' '}
                          <span className="text-[10px] text-slate-400 dark:text-slate-500 font-normal">
                            ({comment.user?.role})
                          </span>
                        </span>
                        <span className="text-[10px] text-slate-400 dark:text-slate-500">
                          {new Date(comment.createdAt).toLocaleTimeString([], {
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </span>
                      </div>
                      <p className="text-slate-700 dark:text-slate-300 whitespace-pre-line">{comment.content}</p>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Add Comment Input Form */}
          <form onSubmit={handleAddComment} className="mt-4 pt-3 border-t border-slate-100 dark:border-slate-800">
            <div className="flex space-x-2">
              <input
                type="text"
                value={newComment}
                onChange={(e) => setNewComment(e.target.value)}
                placeholder="Type follow-up note or question..."
                className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent"
              />
              <button
                type="submit"
                disabled={commentLoading || !newComment.trim()}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold inline-flex items-center space-x-1 disabled:opacity-50 transition-colors shadow-sm"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Send</span>
              </button>
            </div>
          </form>
        </div>
      </div>

      {/* Reopen Complaint Modal */}
      <Modal
        isOpen={isReopenOpen}
        onClose={() => setIsReopenOpen(false)}
        title={`Reopen Complaint ${complaint.complaintNumber}`}
      >
        <form onSubmit={handleReopen} className="space-y-4">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
            If the infrastructure fault was not adequately addressed or reoccurred shortly after being marked as resolved, you may request that it be reopened. Please explain why:
          </p>
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Reason for Reopening <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={reopenReason}
              onChange={(e) => setReopenReason(e.target.value)}
              placeholder="e.g. The leak resumed 2 hours after repair; valve washer still dripping..."
              className="w-full p-3 text-xs rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
            />
          </div>
          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setIsReopenOpen(false)}
              className="px-4 py-2 text-xs font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={reopenLoading}
              className="px-5 py-2 text-xs font-bold text-white bg-amber-600 hover:bg-amber-700 rounded-xl shadow-md transition-colors"
            >
              {reopenLoading ? 'Submitting...' : 'Confirm Reopen'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
