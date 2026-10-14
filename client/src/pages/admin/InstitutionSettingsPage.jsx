import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { LoadingSpinner } from '../../components/common/LoadingSpinner';
import {
  Building2,
  Sliders,
  ShieldCheck,
  Clock,
  Save,
  CheckCircle,
  AlertCircle,
  Globe,
  Mail,
  MapPin,
  Sparkles,
} from 'lucide-react';

export function InstitutionSettingsPage() {
  const { activeInstitution } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  const [institution, setInstitution] = useState(null);
  const [settings, setSettings] = useState({
    allowSelfRegistration: true,
    requireEmailDomain: '',
    defaultSlaHours: 48,
    slaEscalationEnabled: true,
  });

  const [policies, setPolicies] = useState([
    { priority: 'LOW', targetResponseHours: 48, targetResolutionHours: 120 },
    { priority: 'MEDIUM', targetResponseHours: 24, targetResolutionHours: 72 },
    { priority: 'HIGH', targetResponseHours: 8, targetResolutionHours: 36 },
    { priority: 'URGENT', targetResponseHours: 2, targetResolutionHours: 12 },
  ]);

  const instId = activeInstitution?.id;

  const fetchSettings = async () => {
    if (!instId) return;
    try {
      setLoading(true);
      const res = await api.get(`/institutions/${instId}/settings`);
      if (res.data.success) {
        setInstitution(res.data.data.institution);
        if (res.data.data.settings) {
          setSettings(res.data.data.settings);
        }
        if (res.data.data.policies && res.data.data.policies.length > 0) {
          setPolicies(res.data.data.policies);
        }
      }
    } catch (err) {
      console.error('Failed to load institution settings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSettings();
  }, [instId]);

  const handlePolicyChange = (index, field, value) => {
    setPolicies((prev) => {
      const updated = [...prev];
      updated[index] = { ...updated[index], [field]: parseInt(value, 10) || 0 };
      return updated;
    });
  };

  const handleSave = async (e) => {
    e.preventDefault();
    try {
      setSaving(true);
      const res = await api.patch(`/institutions/${instId}/settings`, {
        name: institution?.name,
        contactEmail: institution?.contactEmail,
        contactPhone: institution?.contactPhone,
        address: institution?.address,
        website: institution?.website,
        logoUrl: institution?.logoUrl,
        allowSelfRegistration: settings.allowSelfRegistration,
        requireEmailDomain: settings.requireEmailDomain,
        defaultSlaHours: parseInt(settings.defaultSlaHours, 10) || 48,
        slaEscalationEnabled: settings.slaEscalationEnabled,
        policies,
      });

      if (res.data.success) {
        showToast('Institution settings and SLA policies updated successfully!', 'success');
      }
    } catch (err) {
      showToast(err.response?.data?.message || 'Failed to update settings', 'error');
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="p-12 text-center">
        <LoadingSpinner text="Loading institution settings..." />
      </div>
    );
  }

  return (
    <div className="space-y-6 max-w-5xl mx-auto">
      {/* Header */}
      <div className="rounded-3xl glass-card p-6 sm:p-8 border border-slate-200/80 dark:border-white/10 relative overflow-hidden">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center space-x-2 text-xs font-mono font-bold text-blue-600 dark:text-blue-400 uppercase tracking-widest mb-1">
              <Building2 className="w-3.5 h-3.5" />
              <span>{institution?.name} • [{institution?.code}]</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black font-display text-slate-900 dark:text-white tracking-tight">
              Institution Settings & SLA Policies
            </h1>
            <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-1">
              Configure membership onboarding rules, authorized email domains, and SLA response time targets.
            </p>
          </div>

          <button
            onClick={handleSave}
            disabled={saving}
            className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-xl text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-md shadow-blue-500/25 transition-all self-start sm:self-center disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
          </button>
        </div>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Card 1: Institution Profile Details */}
        <div className="rounded-3xl glass-card p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Campus Profile Information
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Official institution details visible on the public directory
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Institution Name
              </label>
              <input
                type="text"
                value={institution?.name || ''}
                onChange={(e) => setInstitution({ ...institution, name: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Official Contact Email
              </label>
              <input
                type="email"
                value={institution?.contactEmail || ''}
                onChange={(e) => setInstitution({ ...institution, contactEmail: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Contact Phone
              </label>
              <input
                type="text"
                value={institution?.contactPhone || ''}
                onChange={(e) => setInstitution({ ...institution, contactPhone: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Official Website
              </label>
              <input
                type="url"
                value={institution?.website || ''}
                onChange={(e) => setInstitution({ ...institution, website: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Campus Physical Address
              </label>
              <input
                type="text"
                value={institution?.address || ''}
                onChange={(e) => setInstitution({ ...institution, address: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-medium"
              />
            </div>
          </div>
        </div>

        {/* Card 2: Onboarding & Membership Policies */}
        <div className="rounded-3xl glass-card p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <ShieldCheck className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Membership & Verification Policies
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Control how students and faculty join your institution workspace
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <div className="flex items-center justify-between p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/70 dark:border-slate-800">
              <div>
                <p className="text-xs font-bold text-slate-900 dark:text-white">
                  Allow Public Join Requests
                </p>
                <p className="text-[11px] text-slate-500 dark:text-slate-400">
                  When enabled, registered users can discover your institution in the directory and request membership.
                </p>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={settings.allowSelfRegistration}
                  onChange={(e) => setSettings({ ...settings, allowSelfRegistration: e.target.checked })}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer dark:bg-slate-800 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
              </label>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">
                Restricted Email Domain (Optional)
              </label>
              <input
                type="text"
                placeholder="e.g. northstar.edu (leave blank for any domain)"
                value={settings.requireEmailDomain || ''}
                onChange={(e) => setSettings({ ...settings, requireEmailDomain: e.target.value })}
                className="w-full px-3.5 py-2.5 rounded-xl text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-blue-500 font-mono font-medium"
              />
              <p className="text-[11px] text-slate-400 mt-1">
                If specified, only users registering with emails ending in this domain can apply to join.
              </p>
            </div>
          </div>
        </div>

        {/* Card 3: Service Level Agreement (SLA) Targets */}
        <div className="rounded-3xl glass-card p-6 border border-slate-200/80 dark:border-white/10 space-y-4">
          <div className="flex items-center space-x-2.5 pb-3 border-b border-slate-100 dark:border-slate-800">
            <Clock className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <div>
              <h2 className="text-base font-bold text-slate-900 dark:text-white font-display">
                Service Level Agreements (Response Targets)
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                Define maximum hours permitted for first response and final resolution by priority level
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {policies.map((policy, idx) => (
              <div
                key={policy.priority}
                className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-3"
              >
                <div className="flex items-center justify-between">
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
                      policy.priority === 'URGENT'
                        ? 'bg-rose-100 dark:bg-rose-950 text-rose-700 dark:text-rose-300'
                        : policy.priority === 'HIGH'
                        ? 'bg-orange-100 dark:bg-orange-950 text-orange-700 dark:text-orange-300'
                        : policy.priority === 'MEDIUM'
                        ? 'bg-blue-100 dark:bg-blue-950 text-blue-700 dark:text-blue-300'
                        : 'bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                    }`}
                  >
                    {policy.priority} Priority
                  </span>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Target Response (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={policy.targetResponseHours}
                    onChange={(e) => handlePolicyChange(idx, 'targetResponseHours', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-500 mb-1">
                    Target Resolution (Hours)
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={policy.targetResolutionHours}
                    onChange={(e) => handlePolicyChange(idx, 'targetResolutionHours', e.target.value)}
                    className="w-full px-2.5 py-1.5 rounded-lg text-xs bg-white dark:bg-slate-950 border border-slate-200 dark:border-slate-800 font-mono font-bold"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving}
            className="inline-flex items-center space-x-2 px-6 py-3 rounded-2xl text-xs font-extrabold text-white bg-blue-600 hover:bg-blue-700 shadow-xl shadow-blue-500/25 transition-all disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{saving ? 'Saving...' : 'Save All Settings'}</span>
          </button>
        </div>
      </form>
    </div>
  );
}
