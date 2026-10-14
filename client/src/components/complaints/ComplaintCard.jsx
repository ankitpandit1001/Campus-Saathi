import React from 'react';
import { Link } from 'react-router-dom';
import { StatusBadge, PriorityBadge } from '../common/Badge';
import { MapPin, Calendar, MessageSquare, ArrowRight, Tag } from 'lucide-react';

export function ComplaintCard({ complaint, linkPrefix = '/complaints' }) {
  const commentCount = complaint._count?.comments || complaint.comments?.length || 0;
  const assignedStaff = complaint.assignments && complaint.assignments.length > 0 && complaint.assignments[0].staff
    ? complaint.assignments[0].staff.name
    : null;

  return (
    <div className="group glass-card rounded-3xl p-5 card-elevate border border-slate-200/90 dark:border-white/10 hover:border-blue-500/40 dark:hover:border-blue-500/40 hover:shadow-glow-sm transition-all duration-300 flex flex-col justify-between relative overflow-hidden">
      <div>
        {/* Top Badges */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center space-x-2">
            <span className="font-mono text-xs font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-2.5 py-0.5 rounded-lg border border-blue-200 dark:border-blue-900/60 shadow-sm">
              {complaint.complaintNumber}
            </span>
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-semibold truncate max-w-[120px]">
              {complaint.category?.name}
            </span>
          </div>

          <div className="flex items-center space-x-1.5">
            <PriorityBadge priority={complaint.priority} />
            <StatusBadge status={complaint.status} />
          </div>
        </div>

        {/* Title */}
        <h3 className="text-base font-extrabold text-slate-900 dark:text-white line-clamp-1 mb-2 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors font-display">
          <Link to={`${linkPrefix}/${complaint.id}`}>{complaint.title}</Link>
        </h3>

        {/* Description */}
        <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-2 mb-4 leading-relaxed font-normal">
          {complaint.description}
        </p>
      </div>

      {/* Footer Details */}
      <div className="pt-3 border-t border-slate-100 dark:border-white/10 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="inline-flex items-center text-slate-700 dark:text-slate-300 font-medium">
            <MapPin className="w-3.5 h-3.5 mr-1 text-slate-400" />
            <span className="truncate max-w-[120px]">{complaint.location}</span>
          </span>

          <span className="inline-flex items-center">
            <Calendar className="w-3.5 h-3.5 mr-1 text-slate-400" />
            {new Date(complaint.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
          </span>

          {commentCount > 0 && (
            <span className="inline-flex items-center font-semibold text-blue-600 dark:text-blue-400">
              <MessageSquare className="w-3.5 h-3.5 mr-1" />
              {commentCount}
            </span>
          )}
        </div>

        <Link
          to={`${linkPrefix}/${complaint.id}`}
          className="inline-flex items-center font-extrabold text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 transition-colors group-hover:translate-x-1 transform duration-200"
        >
          <span>View</span> <ArrowRight className="w-3.5 h-3.5 ml-1" />
        </Link>
      </div>
    </div>
  );
}
