import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import { Modal } from '../../components/common/Modal';
import { Tags, PlusCircle, Edit2, CheckCircle2, XCircle, Clock } from 'lucide-react';

export function CategoryManagementPage() {
  const { showToast } = useToast();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  // Add / Edit Modal
  const [modalOpen, setModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    slaHours: 48,
    isActive: true,
  });
  const [submitLoading, setSubmitLoading] = useState(false);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await api.get('/admin/categories');
      if (res.data.success) {
        setCategories(res.data.data.categories);
      }
    } catch (err) {
      console.error('Failed to load categories', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreate = () => {
    setIsEditing(false);
    setEditingId(null);
    setFormData({ name: '', description: '', slaHours: 48, isActive: true });
    setModalOpen(true);
  };

  const handleOpenEdit = (cat) => {
    setIsEditing(true);
    setEditingId(cat.id);
    setFormData({
      name: cat.name,
      description: cat.description,
      slaHours: cat.slaHours,
      isActive: cat.isActive,
    });
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitLoading(true);
      if (isEditing) {
        const res = await api.patch(`/admin/categories/${editingId}`, formData);
        if (res.data.success) {
          showToast('Category updated successfully!', 'success');
        }
      } else {
        const res = await api.post('/admin/categories', formData);
        if (res.data.success) {
          showToast('Category created successfully!', 'success');
        }
      }
      setModalOpen(false);
      fetchCategories();
    } catch (err) {
      showToast(err.response?.data?.message || 'Operation failed', 'error');
    } finally {
      setSubmitLoading(false);
    }
  };

  const handleToggleStatus = async (cat) => {
    try {
      const res = await api.patch(`/admin/categories/${cat.id}`, {
        isActive: !cat.isActive,
      });
      if (res.data.success) {
        showToast(`Category ${!cat.isActive ? 'activated' : 'deactivated'}`, 'info');
        fetchCategories();
      }
    } catch (err) {
      showToast('Failed to update category status', 'error');
    }
  };

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">Complaint Categories</h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-0.5">
            Configure campus maintenance domains, problem descriptions, and SLA target resolution windows
          </p>
        </div>

        <button
          onClick={handleOpenCreate}
          className="inline-flex items-center space-x-2 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 px-4 py-2.5 rounded-xl shadow-md transition-all self-start sm:self-auto"
        >
          <PlusCircle className="w-4 h-4" />
          <span>New Category</span>
        </button>
      </div>

      {/* Categories Grid */}
      {loading ? (
        <LoadingSpinner text="Loading categories..." />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {categories.map((cat) => (
            <div
              key={cat.id}
              className={`p-5 rounded-2xl border transition-all shadow-sm flex flex-col justify-between ${
                cat.isActive
                  ? 'bg-white dark:bg-slate-900 border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  : 'border-slate-200 dark:border-slate-800 bg-slate-50/60 dark:bg-slate-850/60 opacity-75'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <span className="font-bold text-base text-slate-900 dark:text-white">{cat.name}</span>
                  </div>
                  <span
                    className={`text-[11px] font-bold px-2 py-0.5 rounded-full border ${
                      cat.isActive
                        ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-200 dark:border-emerald-800'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 border-slate-200 dark:border-slate-700'
                    }`}
                  >
                    {cat.isActive ? 'Active' : 'Disabled'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed mb-4">{cat.description}</p>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between text-xs text-slate-500 dark:text-slate-400">
                <div className="flex items-center space-x-3">
                  <span className="inline-flex items-center font-semibold text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/60 px-2 py-0.5 rounded-md">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    SLA: {cat.slaHours} hours
                  </span>
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {cat._count?.complaints || 0} tickets
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => handleToggleStatus(cat)}
                    className="text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200 transition-colors"
                  >
                    {cat.isActive ? 'Disable' : 'Enable'}
                  </button>
                  <button
                    onClick={() => handleOpenEdit(cat)}
                    className="p-1.5 rounded-lg text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 transition-colors"
                    title="Edit Category"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Add / Edit Modal */}
      <Modal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={isEditing ? 'Edit Category' : 'Create New Category'}
      >
        <form onSubmit={handleSubmit} className="space-y-4 text-xs">
          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Category Name <span className="text-rose-500">*</span>
            </label>
            <input
              type="text"
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="e.g. Wi-Fi & Internet Infrastructure"
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Target Resolution SLA (Hours) <span className="text-rose-500">*</span>
            </label>
            <input
              type="number"
              required
              min={1}
              max={720}
              value={formData.slaHours}
              onChange={(e) => setFormData({ ...formData, slaHours: parseInt(e.target.value, 10) || 24 })}
              className="w-full px-3 py-2 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div>
            <label className="block font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1">
              Description <span className="text-rose-500">*</span>
            </label>
            <textarea
              required
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Detailed description of what falls under this issue category..."
              className="w-full p-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-600"
            />
          </div>

          <div className="flex items-center space-x-2 pt-1">
            <input
              type="checkbox"
              id="isActive"
              checked={formData.isActive}
              onChange={(e) => setFormData({ ...formData, isActive: e.target.checked })}
              className="rounded border-slate-300 dark:border-slate-700 text-blue-600 focus:ring-blue-500"
            />
            <label htmlFor="isActive" className="font-semibold text-slate-700 dark:text-slate-300 cursor-pointer">
              Active Category (visible to students)
            </label>
          </div>

          <div className="flex justify-end space-x-3 pt-2">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="px-4 py-2 font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitLoading}
              className="px-5 py-2 font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-colors"
            >
              {submitLoading ? 'Saving...' : isEditing ? 'Save Changes' : 'Create Category'}
            </button>
          </div>
        </form>
      </Modal>
    </div>
  );
}
