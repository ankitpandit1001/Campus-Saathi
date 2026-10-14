import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Building2,
  Search,
  MapPin,
  GraduationCap,
  School,
  Building,
  Users,
  ExternalLink,
  ShieldCheck,
  PlusCircle,
  Sparkles,
  ArrowRight,
  Filter,
  CheckCircle,
  X,
  Mail,
  Phone,
} from 'lucide-react';

export function InstitutionDirectoryPage() {
  const { user } = useAuth();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [institutions, setInstitutions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedType, setSelectedType] = useState('ALL');
  const [selectedState, setSelectedState] = useState('ALL');

  // Join modal state
  const [joiningInst, setJoiningInst] = useState(null);
  const [requestedRole, setRequestedRole] = useState('STUDENT');
  const [studentId, setStudentId] = useState('');
  const [joinNotes, setJoinNotes] = useState('');
  const [submittingJoin, setSubmittingJoin] = useState(false);

  useEffect(() => {
    async function fetchInstitutions() {
      try {
        setLoading(true);
        const params = new URLSearchParams();
        if (search) params.append('search', search);
        if (selectedType !== 'ALL') params.append('type', selectedType);
        if (selectedState !== 'ALL') params.append('state', selectedState);

        const res = await api.get(`/institutions?${params.toString()}`);
        if (res.data.success) {
          setInstitutions(res.data.data.institutions);
        }
      } catch (err) {
        console.error('Failed to load institutions', err);
      } finally {
        setLoading(false);
      }
    }

    const timer = setTimeout(fetchInstitutions, 250);
    return () => clearTimeout(timer);
  }, [search, selectedType, selectedState]);

  const handleOpenJoin = (inst) => {
    if (!user) {
      showToast('Please sign in or register to join an institution.', 'info');
      navigate('/login', { state: { from: { pathname: '/institutions' } } });
      return;
    }
    setJoiningInst(inst);
  };

  const handleConfirmJoin = async (e) => {
    e.preventDefault();
    if (!joiningInst) return;

    try {
      setSubmittingJoin(true);
      const res = await api.post(`/institutions/${joiningInst.id}/join-requests`, {
        requestedRole,
        studentId: requestedRole === 'STUDENT' ? studentId : undefined,
        notes: joinNotes,
      });

      if (res.data.success) {
        showToast(res.data.message || 'Join request submitted for review!', 'success');
        setJoiningInst(null);
        setStudentId('');
        setJoinNotes('');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to submit join request.', 'error');
    } finally {
      setSubmittingJoin(false);
    }
  };

  const typeIcons = {
    SCHOOL: School,
    COLLEGE: GraduationCap,
    UNIVERSITY: Building,
    OTHER: Building2,
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white pb-20">
      {/* Top Navigation Bar */}
      <header className="sticky top-0 z-30 flex h-16 w-full items-center justify-between border-b border-slate-200/80 dark:border-white/10 glass-panel px-4 md:px-8 backdrop-blur-xl">
        <Link to="/" className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/30">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <span className="text-xl font-black font-display tracking-tight text-slate-900 dark:text-white flex items-center">
              Campus<span className="text-blue-600 dark:text-blue-400">Saathi</span>
            </span>
            <span className="block text-[9px] font-extrabold text-slate-400 uppercase tracking-widest leading-none">
              SaaS Directory
            </span>
          </div>
        </Link>

        <div className="flex items-center space-x-3">
          <Link
            to="/register-institution"
            className="hidden sm:inline-flex items-center space-x-1.5 text-xs font-bold px-3.5 py-2 rounded-xl bg-blue-600 text-white hover:bg-blue-700 shadow-md shadow-blue-600/20 transition-all"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register Institution</span>
          </Link>

          {user ? (
            <Link
              to="/dashboard"
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Go to Workspace &rarr;
            </Link>
          ) : (
            <Link
              to="/login"
              className="text-xs font-bold px-3.5 py-2 rounded-xl bg-slate-200 dark:bg-slate-800 text-slate-800 dark:text-slate-200 hover:bg-slate-300 dark:hover:bg-slate-700 transition-colors"
            >
              Sign In
            </Link>
          )}
        </div>
      </header>

      {/* Directory Hero Header */}
      <section className="relative overflow-hidden py-12 md:py-16 px-4 md:px-8 max-w-7xl mx-auto text-center">
        <div className="inline-flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 text-blue-600 dark:text-blue-400 text-xs font-bold uppercase tracking-wider mb-4">
          <Sparkles className="w-3.5 h-3.5" />
          <span>Multi-Tenant Educational Network</span>
        </div>

        <h1 className="text-3xl md:text-5xl font-black font-display tracking-tight text-slate-900 dark:text-white leading-tight">
          Explore CampusSaathi Educational Institutions
        </h1>

        <p className="mt-4 max-w-2xl mx-auto text-sm md:text-base text-slate-600 dark:text-slate-300">
          Find your school, engineering college, or university to access authorized campus maintenance tracking, transparent issue resolution, and technician desks.
        </p>

        {/* Search & Filter Bar */}
        <div className="mt-8 max-w-3xl mx-auto glass-card p-3 rounded-2xl border border-slate-200/90 dark:border-white/10 shadow-lg">
          <div className="flex flex-col sm:flex-row gap-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search by institution name, code, or city..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
              />
            </div>

            <div className="flex gap-2">
              <select
                value={selectedType}
                onChange={(e) => setSelectedType(e.target.value)}
                className="px-3 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-xs font-bold text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-600"
              >
                <option value="ALL">All Types</option>
                <option value="COLLEGE">Colleges</option>
                <option value="UNIVERSITY">Universities</option>
                <option value="SCHOOL">Schools</option>
              </select>

              <Link
                to="/register-institution"
                className="sm:hidden px-3 py-2.5 rounded-xl bg-blue-600 text-white text-xs font-bold flex items-center justify-center"
              >
                + Register
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Directory Grid */}
      <main className="max-w-7xl mx-auto px-4 md:px-8">
        <div className="flex items-center justify-between mb-6">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
            {institutions.length} verified institution{institutions.length !== 1 ? 's' : ''} on platform
          </span>

          <Link
            to="/register-institution"
            className="text-xs font-bold text-blue-600 dark:text-blue-400 hover:underline flex items-center space-x-1"
          >
            <span>Can't find your campus? Register it here</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {loading ? (
          <div className="py-20 text-center">
            <LoadingSpinner text="Searching educational institutions..." size="lg" />
          </div>
        ) : institutions.length === 0 ? (
          <div className="glass-card p-12 text-center rounded-3xl max-w-lg mx-auto">
            <Building2 className="w-12 h-12 text-slate-400 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-slate-900 dark:text-white">No institutions match your search</h3>
            <p className="text-xs text-slate-500 mt-1 mb-6">
              Be the first to bring modern campus issue management to your school or college.
            </p>
            <Link
              to="/register-institution"
              className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl bg-blue-600 text-white font-bold text-xs shadow-md shadow-blue-500/20 hover:scale-105 transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Register New Institution</span>
            </Link>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {institutions.map((inst) => {
              const TypeIcon = typeIcons[inst.type] || Building2;
              return (
                <div
                  key={inst.id}
                  className="glass-card p-6 rounded-3xl border border-slate-200/80 dark:border-white/10 card-elevate flex flex-col justify-between"
                >
                  <div>
                    {/* Header: Type & Code Badges */}
                    <div className="flex items-center justify-between mb-3">
                      <span className="inline-flex items-center space-x-1 text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full bg-blue-50 dark:bg-blue-950/80 text-blue-600 dark:text-blue-400 border border-blue-200/60 dark:border-blue-800">
                        <TypeIcon className="w-3 h-3" />
                        <span>{inst.type}</span>
                      </span>

                      <div className="flex items-center space-x-1.5">
                        {inst.isDemo && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-md bg-amber-50 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 border border-amber-200 dark:border-amber-800 font-bold">
                            Demo Tenant
                          </span>
                        )}
                        <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {inst.code}
                        </span>
                      </div>
                    </div>

                    <h2 className="text-lg font-black font-display text-slate-900 dark:text-white tracking-tight leading-snug">
                      {inst.name}
                    </h2>

                    <div className="flex items-center space-x-1.5 text-xs text-slate-500 dark:text-slate-400 mt-2">
                      <MapPin className="w-3.5 h-3.5 text-slate-400 flex-shrink-0" />
                      <span>
                        {inst.city}, {inst.state}
                      </span>
                    </div>

                    <div className="mt-4 pt-4 border-t border-slate-100 dark:border-slate-800 grid grid-cols-2 gap-2 text-xs text-slate-500">
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 font-mono">
                          Departments
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {inst._count?.departments || 0} active
                        </span>
                      </div>
                      <div>
                        <span className="block text-[10px] uppercase font-bold text-slate-400 font-mono">
                          Issue Categories
                        </span>
                        <span className="font-bold text-slate-800 dark:text-slate-200">
                          {inst._count?.categories || 0} configured
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
                    <button
                      onClick={() => handleOpenJoin(inst)}
                      className="flex-1 py-2.5 px-4 rounded-xl text-xs font-bold bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20 transition-all text-center flex items-center justify-center space-x-1.5"
                    >
                      <Users className="w-3.5 h-3.5" />
                      <span>Join Campus</span>
                    </button>

                    {inst.website && (
                      <a
                        href={inst.website}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-2.5 rounded-xl border border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-500 transition-colors"
                        title="Visit institution website"
                      >
                        <ExternalLink className="w-4 h-4" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>

      {/* Join Institution Modal */}
      {joiningInst && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-md animate-in fade-in duration-200">
          <div className="glass-card max-w-md w-full p-6 sm:p-8 rounded-3xl border border-slate-200/90 dark:border-white/10 shadow-2xl relative">
            <button
              onClick={() => setJoiningInst(null)}
              className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 dark:hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-3 mb-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-extrabold text-blue-600 uppercase tracking-widest font-mono">
                  Membership Request
                </span>
                <h3 className="text-base font-extrabold text-slate-900 dark:text-white leading-tight">
                  {joiningInst.name}
                </h3>
              </div>
            </div>

            <form onSubmit={handleConfirmJoin} className="space-y-4 mt-6">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Requested Role
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRequestedRole('STUDENT')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      requestedRole === 'STUDENT'
                        ? 'bg-blue-600 text-white border-blue-600 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Student
                  </button>
                  <button
                    type="button"
                    onClick={() => setRequestedRole('STAFF')}
                    className={`py-2 px-3 rounded-xl text-xs font-bold transition-all border ${
                      requestedRole === 'STAFF'
                        ? 'bg-teal-600 text-white border-teal-600 shadow-md'
                        : 'border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    Staff / Technician
                  </button>
                </div>
              </div>

              {requestedRole === 'STUDENT' && (
                <div>
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                    Student Roll Number / Enrollment ID
                  </label>
                  <input
                    type="text"
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="e.g. 2024-CSE-089"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                  />
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 uppercase tracking-wider mb-1.5">
                  Application Note (Optional)
                </label>
                <textarea
                  rows={2}
                  value={joinNotes}
                  onChange={(e) => setJoinNotes(e.target.value)}
                  placeholder="Mention your department, semester, or technician trade..."
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-sm text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-600"
                />
              </div>

              <div className="pt-2 flex items-center justify-end space-x-3">
                <button
                  type="button"
                  onClick={() => setJoiningInst(null)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingJoin}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all disabled:opacity-50"
                >
                  {submittingJoin ? 'Submitting...' : 'Submit Application'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
