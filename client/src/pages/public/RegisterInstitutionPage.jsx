import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useToast } from '../../context/ToastContext';
import {
  Building2,
  ShieldCheck,
  CheckCircle2,
  Sparkles,
  ArrowLeft,
  Mail,
  Lock,
  User,
  Phone,
  Globe,
  MapPin,
  School,
  Clock,
} from 'lucide-react';

export function RegisterInstitutionPage() {
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    code: '',
    type: 'COLLEGE',
    state: '',
    city: '',
    address: '',
    contactEmail: '',
    contactPhone: '',
    website: '',
    adminName: '',
    adminEmail: '',
    adminPassword: '',
    adminPhone: '',
  });

  const [loading, setLoading] = useState(false);
  const [registered, setRegistered] = useState(null);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const res = await api.post('/institutions/register', formData);
      if (res.data.success) {
        setRegistered(res.data.data.institution);
        showToast('Registration submitted! Awaiting Super Admin review.', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit institution registration.', 'error');
    } finally {
      setLoading(false);
    }
  };

  if (registered) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 flex items-center justify-center p-4">
        <div className="glass-card max-w-lg w-full p-8 md:p-10 rounded-3xl border border-slate-200/90 dark:border-white/10 text-center shadow-2xl">
          <div className="w-16 h-16 rounded-2xl bg-emerald-500/10 text-emerald-500 border border-emerald-500/20 flex items-center justify-center mx-auto mb-4">
            <CheckCircle2 className="w-8 h-8" />
          </div>

          <span className="text-xs font-mono font-bold uppercase tracking-wider text-amber-500 bg-amber-500/10 px-3 py-1 rounded-full">
            Status: PENDING REVIEW
          </span>

          <h2 className="text-2xl font-black font-display text-slate-900 dark:text-white mt-4">
            Registration Submitted!
          </h2>

          <p className="text-sm text-slate-600 dark:text-slate-300 mt-2 leading-relaxed">
            <span className="font-bold text-slate-900 dark:text-white">{registered.name}</span> has been enrolled on CampusSaathi. A Platform Super Admin will verify the accreditation details and activate your institution workspace.
          </p>

          <div className="mt-6 p-4 rounded-2xl bg-slate-100 dark:bg-slate-900 text-left space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-slate-500">Institution Code:</span>
              <span className="font-mono font-bold text-blue-600">{registered.code}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Location:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">
                {registered.city}, {registered.state}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-slate-500">Contact Email:</span>
              <span className="font-semibold text-slate-800 dark:text-slate-200">{registered.contactEmail}</span>
            </div>
          </div>

          <div className="mt-8 flex flex-col sm:flex-row gap-3 justify-center">
            <Link
              to="/institutions"
              className="py-3 px-6 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md transition-all"
            >
              Back to Directory
            </Link>
            <Link
              to="/login"
              className="py-3 px-6 rounded-xl text-xs font-bold border border-slate-300 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
            >
              Sign In to Existing Account
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 pb-20">
      {/* Top Header */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-white/10 glass-panel px-4 md:px-8 backdrop-blur-xl">
        <Link to="/institutions" className="flex items-center space-x-2 text-xs font-bold text-slate-500 hover:text-blue-600">
          <ArrowLeft className="w-4 h-4" />
          <span>Back to Directory</span>
        </Link>

        <Link to="/" className="flex items-center space-x-2">
          <div className="w-8 h-8 rounded-lg bg-blue-600 text-white flex items-center justify-center font-bold">
            <Building2 className="w-4 h-4" />
          </div>
          <span className="font-black text-sm font-display tracking-tight">CampusSaathi SaaS</span>
        </Link>
      </header>

      <main className="max-w-4xl mx-auto px-4 pt-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center space-x-2 bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Campus Onboarding</span>
          </div>

          <h1 className="text-3xl sm:text-4xl font-black font-display tracking-tight text-slate-900 dark:text-white">
            Register Your Educational Institution
          </h1>

          <p className="mt-2 text-sm text-slate-500 max-w-xl mx-auto">
            Join the CampusSaathi multi-tenant network. Empower your students and campus maintenance technicians with transparent SLAs and real-time tracking.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-8">
          {/* Section 1: Institution Details */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10">
            <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-200/80 dark:border-slate-800 mb-6">
              <School className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              <h2 className="text-lg font-black font-display text-slate-900 dark:text-white">
                1. Institution Information
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Institution Name *
                </label>
                <input
                  type="text"
                  required
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  placeholder="e.g. Indian Institute of Information Technology"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Unique Code *
                </label>
                <input
                  type="text"
                  required
                  name="code"
                  value={formData.code}
                  onChange={handleChange}
                  placeholder="e.g. IIITP (used in complaint IDs)"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none uppercase font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Institution Type *
                </label>
                <select
                  name="type"
                  value={formData.type}
                  onChange={handleChange}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                >
                  <option value="COLLEGE">College</option>
                  <option value="UNIVERSITY">University</option>
                  <option value="SCHOOL">School</option>
                  <option value="OTHER">Other Educational Institute</option>
                </select>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  State / Province *
                </label>
                <input
                  type="text"
                  required
                  name="state"
                  value={formData.state}
                  onChange={handleChange}
                  placeholder="e.g. Maharashtra"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  City *
                </label>
                <input
                  type="text"
                  required
                  name="city"
                  value={formData.city}
                  onChange={handleChange}
                  placeholder="e.g. Pune"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Campus Address
                </label>
                <input
                  type="text"
                  name="address"
                  value={formData.address}
                  onChange={handleChange}
                  placeholder="e.g. Survey No. 25, Hinjewadi Phase 3"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Official Contact Email *
                </label>
                <input
                  type="email"
                  required
                  name="contactEmail"
                  value={formData.contactEmail}
                  onChange={handleChange}
                  placeholder="e.g. admin@iiitp.ac.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Website URL
                </label>
                <input
                  type="url"
                  name="website"
                  value={formData.website}
                  onChange={handleChange}
                  placeholder="https://www.iiitp.ac.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Section 2: Designated Admin Account */}
          <div className="glass-card p-6 sm:p-8 rounded-3xl border border-slate-200/80 dark:border-white/10">
            <div className="flex items-center space-x-2.5 pb-4 border-b border-slate-200/80 dark:border-slate-800 mb-6">
              <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
              <h2 className="text-lg font-black font-display text-slate-900 dark:text-white">
                2. Primary Administrator Account
              </h2>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Administrator Full Name *
                </label>
                <input
                  type="text"
                  required
                  name="adminName"
                  value={formData.adminName}
                  onChange={handleChange}
                  placeholder="e.g. Dr. Ramesh Kumar"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Login Email *
                </label>
                <input
                  type="email"
                  required
                  name="adminEmail"
                  value={formData.adminEmail}
                  onChange={handleChange}
                  placeholder="e.g. ramesh.kumar@iiitp.ac.in"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Password * (Min 8 chars)
                </label>
                <input
                  type="password"
                  required
                  minLength={8}
                  name="adminPassword"
                  value={formData.adminPassword}
                  onChange={handleChange}
                  placeholder="••••••••"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Admin Phone
                </label>
                <input
                  type="text"
                  name="adminPhone"
                  value={formData.adminPhone}
                  onChange={handleChange}
                  placeholder="+91 98000 00000"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm focus:ring-2 focus:ring-blue-600 focus:outline-none"
                />
              </div>
            </div>
          </div>

          {/* Submission CTA */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-6 glass-card rounded-2xl">
            <div className="text-xs text-slate-500">
              By submitting, your institution enters a <span className="font-bold text-slate-800 dark:text-slate-200">Pending Review</span> queue. No charges apply during trial.
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full sm:w-auto py-3.5 px-8 rounded-xl font-black text-xs uppercase tracking-wider text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/25 transition-all hover:scale-105 active:scale-95 disabled:opacity-50"
            >
              {loading ? 'Submitting Application...' : 'Register Institution Now'}
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
