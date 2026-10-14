import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  UploadCloud,
  X,
  PlusCircle,
  Building,
  MapPin,
  AlertTriangle,
  FileText,
  Image as ImageIcon,
  ArrowLeft,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';

export function SubmitComplaintPage() {
  const [formData, setFormData] = useState({
    title: '',
    categoryId: '',
    location: '',
    roomNumber: '',
    priority: 'MEDIUM',
    description: '',
  });
  const [categories, setCategories] = useState([]);
  const [imageFile, setImageFile] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { showToast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    async function loadCategories() {
      try {
        const res = await api.get('/admin/categories');
        if (res.data.success && res.data.data.categories) {
          const activeCategories = res.data.data.categories.filter((c) => c.isActive);
          setCategories(activeCategories);
          if (activeCategories.length > 0) {
            setFormData((prev) => ({ ...prev, categoryId: activeCategories[0].id }));
          }
        }
      } catch (err) {
        console.error('Failed to load categories', err);
      }
    }
    loadCategories();
  }, []);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError('Image file size cannot exceed 5MB.');
        return;
      }
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
      setError('');
    }
  };

  const handleRemoveImage = () => {
    setImageFile(null);
    if (imagePreview) {
      URL.revokeObjectURL(imagePreview);
      setImagePreview(null);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (formData.title.trim().length < 5) {
      setError('Title must be at least 5 characters long.');
      return;
    }
    if (formData.description.trim().length < 10) {
      setError('Description must be at least 10 characters long.');
      return;
    }
    if (!formData.categoryId) {
      setError('Please select an issue category.');
      return;
    }

    try {
      setLoading(true);
      const data = new FormData();
      data.append('title', formData.title.trim());
      data.append('description', formData.description.trim());
      data.append('categoryId', formData.categoryId);
      data.append('location', formData.location.trim());
      if (formData.roomNumber) {
        data.append('roomNumber', formData.roomNumber.trim());
      }
      data.append('priority', formData.priority);
      if (imageFile) {
        data.append('image', imageFile);
      }

      const res = await api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });

      if (res.data.success) {
        showToast('Complaint lodged successfully!', 'success');
        navigate(`/complaints/${res.data.data.complaint.id}`);
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Failed to submit complaint. Please check fields.';
      setError(msg);
      showToast(msg, 'error');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between pb-4 border-b border-slate-200/80 dark:border-white/10">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-blue-600 dark:text-blue-400 mb-1">
            <Sparkles className="w-3.5 h-3.5" />
            <span>CampusSaathi Ticket Dispatch</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight">
            Submit New Complaint
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Report infrastructure faults with automatic SLA tracking and photo verification
          </p>
        </div>

        <Link
          to="/my-complaints"
          className="text-xs font-bold text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 flex items-center space-x-1"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>My Complaints</span>
        </Link>
      </div>

      {error && (
        <div className="p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900 text-rose-700 dark:text-rose-300 text-xs font-semibold flex items-center space-x-2">
          <AlertTriangle className="w-4 h-4 flex-shrink-0" />
          <span>{error}</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="glass-card p-6 sm:p-9 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-xl space-y-6 transition-colors">
        {/* Title */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
            Complaint Subject / Title <span className="text-rose-500">*</span>
          </label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="e.g. Lab 3 Central Air Conditioning Not Cooling"
            className="block w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
          />
        </div>

        {/* Category & Priority Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Infrastructure Category <span className="text-rose-500">*</span>
            </label>
            <select
              name="categoryId"
              required
              value={formData.categoryId}
              onChange={handleChange}
              className="block w-full px-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
            >
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name} (SLA: {cat.slaHours}h)
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Urgency / Priority
            </label>
            <div className="grid grid-cols-3 gap-2">
              {['LOW', 'MEDIUM', 'HIGH'].map((p) => {
                const isSelected = formData.priority === p;
                return (
                  <button
                    key={p}
                    type="button"
                    onClick={() => setFormData({ ...formData, priority: p })}
                    className={`py-2.5 px-3 text-xs font-bold rounded-2xl border transition-all text-center ${
                      isSelected
                        ? p === 'HIGH'
                          ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-300 dark:border-rose-800 text-rose-700 dark:text-rose-300 ring-2 ring-rose-500/20 shadow-sm'
                          : p === 'MEDIUM'
                          ? 'bg-amber-50 dark:bg-amber-950/60 border-amber-300 dark:border-amber-800 text-amber-700 dark:text-amber-300 ring-2 ring-amber-500/20 shadow-sm'
                          : 'bg-emerald-50 dark:bg-emerald-950/60 border-emerald-300 dark:border-emerald-800 text-emerald-700 dark:text-emerald-300 ring-2 ring-emerald-500/20 shadow-sm'
                        : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 bg-slate-50/50 dark:bg-slate-800/40 hover:bg-slate-100 dark:hover:bg-slate-800'
                    }`}
                  >
                    {p}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Location & Room */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Campus Building / Location <span className="text-rose-500">*</span>
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <MapPin className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="location"
                required
                value={formData.location}
                onChange={handleChange}
                placeholder="e.g. Mechanical Workshop, Ground Floor"
                className="block w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
              Room / Desk Number (Optional)
            </label>
            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400 dark:text-slate-500">
                <Building className="w-4 h-4" />
              </div>
              <input
                type="text"
                name="roomNumber"
                value={formData.roomNumber}
                onChange={handleChange}
                placeholder="e.g. Room 204 / Station 14"
                className="block w-full pl-10 pr-4 py-3 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
              />
            </div>
          </div>
        </div>

        {/* Detailed Description */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
            Detailed Issue Description <span className="text-rose-500">*</span>
          </label>
          <textarea
            name="description"
            required
            rows={4}
            value={formData.description}
            onChange={handleChange}
            placeholder="Please provide specific details regarding the issue (when it occurred, current impact, visible damages)..."
            className="block w-full p-4 rounded-2xl border border-slate-300 dark:border-slate-700 bg-white/80 dark:bg-slate-800/80 text-sm text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600 focus:border-transparent transition-all shadow-inner"
          />
        </div>

        {/* Supporting Image Attachment */}
        <div>
          <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5 font-mono">
            Supporting Photo Attachment (Optional)
          </label>

          {imagePreview ? (
            <div className="relative inline-block border border-slate-200 dark:border-slate-700 rounded-2xl overflow-hidden shadow-md">
              <img
                src={imagePreview}
                alt="Complaint preview"
                className="h-44 w-auto object-cover rounded-2xl"
              />
              <button
                type="button"
                onClick={handleRemoveImage}
                className="absolute top-2 right-2 bg-slate-900/80 text-white rounded-full p-1.5 hover:bg-rose-600 transition-colors shadow-md"
                aria-label="Remove image"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          ) : (
            <label className="flex flex-col items-center justify-center border-2 border-dashed border-slate-300 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 rounded-3xl p-6 cursor-pointer bg-slate-50/50 dark:bg-slate-800/40 hover:bg-blue-50/20 dark:hover:bg-blue-900/20 transition-all text-center group">
              <UploadCloud className="w-9 h-9 text-slate-400 dark:text-slate-500 group-hover:text-blue-500 transition-colors mb-2" />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300">
                Click to browse photo or drag & drop here
              </span>
              <span className="text-[11px] text-slate-400 dark:text-slate-500 mt-1 font-mono">
                Supports JPEG, PNG, WebP up to 5MB
              </span>
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                onChange={handleImageChange}
                className="hidden"
              />
            </label>
          )}
        </div>

        {/* Action Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            disabled={loading}
            className="inline-flex items-center space-x-2 text-sm font-extrabold text-white bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 px-8 py-3.5 rounded-2xl shadow-lg shadow-blue-600/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
          >
            <PlusCircle className="w-4 h-4" />
            <span>{loading ? 'Submitting Ticket...' : 'Register Complaint'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
