import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Building2,
  CheckCircle2,
  Clock,
  ShieldCheck,
  ArrowRight,
  Sparkles,
  Wrench,
  BarChart3,
  Users,
  CheckCircle,
  Zap,
  Layers,
  ArrowUpRight,
  Wifi,
  Flame,
  Droplets,
  Cpu,
  Compass,
  FileCheck,
  Lock,
  ChevronRight,
  Activity,
  AlertCircle,
  Camera,
  MapPin,
  Crown,
} from 'lucide-react';
import { ThemeToggle } from '../../components/common/ThemeToggle';

export function LandingPage() {
  const [activeFacility, setActiveFacility] = useState(0);
  const [activeTab, setActiveTab] = useState('STUDENT');

  const facilityDemos = [
    {
      id: 'CF-2026-0042',
      title: 'Lab 304 Central AC Pressure Regulator Valve Failure',
      category: 'Air Conditioning & HVAC',
      categoryColor: 'from-cyan-500 to-blue-600',
      location: 'Computer Science Block, 3rd Floor',
      room: 'Room 304',
      priority: 'HIGH',
      slaHours: '12h Target',
      slaProgress: '82%',
      status: 'IN_PROGRESS',
      reportedTime: '35 mins ago',
      assignedTechnician: 'Anita Deshmukh (HVAC Lead)',
      technicianPhone: '+91 98111 22334',
      reporter: 'Rahul Sharma (Roll: CF2024CS041)',
      diagnosticNote: 'Replaced bypass gasket; running compressor test under full lab load.',
      icon: Cpu,
    },
    {
      id: 'CF-2026-0048',
      title: 'Central Library West Wing Wi-Fi 6 Access Point Packet Loss',
      category: 'Wi-Fi & Network',
      categoryColor: 'from-violet-500 to-indigo-600',
      location: 'Central Library, 2nd Floor Reading Room',
      room: 'Station AP-09',
      priority: 'MEDIUM',
      slaHours: '24h Target',
      slaProgress: '94%',
      status: 'RESOLVED',
      reportedTime: '2 hours ago',
      assignedTechnician: 'Ramesh Kumar (Network Admin)',
      technicianPhone: '+91 98222 33445',
      reporter: 'Priya Patel (Roll: CF2024IT019)',
      diagnosticNote: 'Port 14 PoE cycle complete; upgraded firmware to v17.9.4. Signal verified at -45 dBm.',
      icon: Wifi,
    },
    {
      id: 'CF-2026-0051',
      title: 'Auditorium Stage Left Power Distribution Sub-Panel Tripping',
      category: 'Electrical Maintenance',
      categoryColor: 'from-amber-500 to-orange-600',
      location: 'Main Auditorium, Ground Level',
      room: 'Stage Backstage Panel A',
      priority: 'HIGH',
      slaHours: '6h Target',
      slaProgress: '60%',
      status: 'ASSIGNED',
      reportedTime: '15 mins ago',
      assignedTechnician: 'Vikram Singh (Chief Electrician)',
      technicianPhone: '+91 98333 44556',
      reporter: 'Ankit Kumar (Roll: CF2023EE008)',
      diagnosticNote: 'Dispatched with 63A MCB spare unit. On-site inspection starting.',
      icon: Zap,
    },
    {
      id: 'CF-2026-0055',
      title: 'Girls Hostel Block B 2nd Floor RO Filter Low Flow Rate',
      category: 'Water & Sanitation',
      categoryColor: 'from-emerald-500 to-teal-600',
      location: 'Hostel Block B, Corrdior 2',
      room: 'Water Station B2',
      priority: 'LOW',
      slaHours: '48h Target',
      slaProgress: '90%',
      status: 'RESOLVED',
      reportedTime: '4 hours ago',
      assignedTechnician: 'Suresh Patil (Plumbing Staff)',
      technicianPhone: '+91 98444 55667',
      reporter: 'Neha Joshi (Roll: CF2024CS082)',
      diagnosticNote: 'Installed new 5-micron sediment filter cartridge and sterilized outlet tap.',
      icon: Droplets,
    },
  ];

  const currentMock = facilityDemos[activeFacility];

  return (
    <div className="min-h-screen text-slate-800 dark:text-slate-100 transition-colors duration-300 relative overflow-x-hidden selection:bg-blue-600 selection:text-white">
      {/* Background Ambient Glow Meshes */}
      <div className="fixed inset-0 pointer-events-none -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[550px] bg-gradient-to-b from-blue-500/15 via-indigo-500/10 to-transparent blur-[120px] rounded-full dark:from-blue-600/20 dark:via-purple-600/15" />
        <div className="absolute top-1/3 -left-48 w-96 h-96 bg-cyan-500/10 dark:bg-cyan-500/15 blur-[100px] rounded-full" />
        <div className="absolute top-2/3 -right-48 w-96 h-96 bg-indigo-500/10 dark:bg-indigo-500/15 blur-[100px] rounded-full" />
      </div>

      {/* Modern Island Navigation Header */}
      <div className="sticky top-4 z-40 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="rounded-2xl glass-panel border border-slate-200/80 dark:border-white/10 px-4 sm:px-6 h-16 flex items-center justify-between shadow-lg shadow-slate-900/5 dark:shadow-black/20">
          {/* Logo & Brand */}
          <Link to="/" className="flex items-center space-x-3 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-sky-500 flex items-center justify-center text-white font-black shadow-md shadow-blue-500/30 group-hover:scale-105 transition-transform duration-200">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center space-x-1.5">
                <span className="text-lg font-black tracking-tight font-display text-slate-900 dark:text-white">
                  Campus<span className="text-blue-600 dark:text-blue-400">Saathi</span>
                </span>
                <span className="hidden sm:inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-widest bg-emerald-100 dark:bg-emerald-950/80 text-emerald-700 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mr-1 animate-pulse"></span>
                  Live
                </span>
              </div>
              <span className="hidden sm:block text-[9px] font-bold text-slate-400 dark:text-slate-500 tracking-wider uppercase leading-none">
                Enterprise Campus Suite
              </span>
            </div>
          </Link>

          {/* Center Links (Desktop) */}
          <nav className="hidden md:flex items-center space-x-5 text-xs font-bold text-slate-600 dark:text-slate-300">
            <Link to="/institutions" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Campus Directory
            </Link>
            <Link to="/register-institution" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Register Campus
            </Link>
            <a href="#simulator" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Live Simulator
            </a>
            <a href="#facilities" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Facilities
            </a>
            <a href="#accounts" className="hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
              Demo Logins
            </a>
          </nav>

          {/* Right Controls */}
          <div className="flex items-center space-x-2.5 sm:space-x-3">
            <ThemeToggle variant="icon" />

            <Link
              to="/login"
              className="text-xs font-bold text-slate-700 dark:text-slate-200 hover:text-blue-600 dark:hover:text-blue-400 px-3 py-2 rounded-xl transition-colors"
            >
              Sign In
            </Link>

            <Link
              to="/institutions"
              className="relative inline-flex items-center space-x-1.5 text-xs font-extrabold text-white bg-gradient-to-r from-blue-600 via-indigo-600 to-blue-700 hover:from-blue-500 hover:to-indigo-600 px-4 sm:px-5 py-2.5 rounded-xl shadow-md shadow-blue-500/25 hover:shadow-blue-500/40 transition-all hover:scale-[1.02] active:scale-[0.98]"
            >
              <span>Explore Campuses</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </header>
      </div>

      {/* Hero Section */}
      <section className="relative pt-12 pb-16 lg:pt-20 lg:pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          {/* Badge Pill */}
          <div className="inline-flex items-center space-x-2 bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-purple-500/10 border border-blue-500/20 dark:border-blue-400/20 px-4 py-1.5 rounded-full text-xs font-extrabold text-blue-700 dark:text-blue-300 mb-6 backdrop-blur-md shadow-sm">
            <Sparkles className="w-3.5 h-3.5 text-blue-500 animate-pulse" />
            <span>Next-Gen College Infrastructure Management • B.Tech CSE Major Project</span>
          </div>

          {/* Dramatic Title */}
          <h1 className="text-4xl sm:text-6xl lg:text-7xl font-black font-display tracking-tight text-slate-900 dark:text-white max-w-5xl mx-auto leading-[1.08]">
            Campus Issues Solved with{' '}
            <span className="text-gradient">
              Total Transparency
            </span>{' '}
            & Instant Accountability.
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-base sm:text-lg lg:text-xl text-slate-600 dark:text-slate-300 max-w-2xl mx-auto leading-relaxed font-normal">
            Report electricity faults, Wi-Fi outages, AC repairs, and classroom issues directly to maintenance teams. Track strict resolution SLAs with photo verification and automatic escalation.
          </p>

          {/* Action Buttons */}
          <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3.5">
            <Link
              to="/institutions"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2.5 text-sm font-extrabold text-white bg-blue-600 hover:bg-blue-700 px-8 py-3.5 rounded-2xl shadow-xl shadow-blue-600/30 transition-all hover:scale-105 active:scale-95"
            >
              <Building2 className="w-4 h-4" />
              <span>Browse Institution Directory</span>
              <ArrowRight className="w-4 h-4" />
            </Link>

            <Link
              to="/register-institution"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-sm font-bold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-900/80 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-800 px-7 py-3.5 rounded-2xl shadow-sm transition-all hover:scale-105"
            >
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>Register Your Campus</span>
            </Link>

            <a
              href="#simulator"
              className="w-full sm:w-auto inline-flex items-center justify-center space-x-2 text-sm font-bold text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white px-5 py-3.5 rounded-2xl transition-colors"
            >
              <Activity className="w-4 h-4 text-blue-500" />
              <span>Live Simulator</span>
            </a>
          </div>

          {/* Quick Metrics Bar */}
          <div className="mt-12 max-w-4xl mx-auto grid grid-cols-2 md:grid-cols-4 gap-3.5">
            <div className="glass-card p-4 rounded-2xl text-center">
              <span className="block text-2xl font-black font-mono text-blue-600 dark:text-blue-400">Multi-Tenant</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Schools • Colleges • Unis</span>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <span className="block text-2xl font-black font-mono text-emerald-600 dark:text-emerald-400">100% Isolated</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Strict Tenant Boundaries</span>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <span className="block text-2xl font-black font-mono text-indigo-600 dark:text-indigo-400">12 - 48h</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">Configurable SLA Targets</span>
            </div>
            <div className="glass-card p-4 rounded-2xl text-center">
              <span className="block text-2xl font-black font-mono text-amber-500 dark:text-amber-400">Real-Time</span>
              <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">In-App & Audit Logs</span>
            </div>
          </div>
        </div>
      </section>

      {/* Interactive Live Campus Issue Simulator */}
      <section id="simulator" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center space-x-1.5 text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-full border border-blue-200 dark:border-blue-900/60 mb-2">
            <Zap className="w-3.5 h-3.5" />
            <span>Interactive Simulator</span>
          </div>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white">
            See How CampusSaathi Resolves Infrastructure Issues
          </h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-2">
            Click any campus category below to inspect how tickets are dispatched, tracked, and resolved in real time:
          </p>
        </div>

        {/* Facility Selector Pills */}
        <div className="flex flex-wrap items-center justify-center gap-2 mb-8">
          {facilityDemos.map((demo, idx) => {
            const Icon = demo.icon;
            const isSelected = activeFacility === idx;
            return (
              <button
                key={demo.id}
                onClick={() => setActiveFacility(idx)}
                className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all duration-200 ${
                  isSelected
                    ? 'bg-blue-600 text-white shadow-lg shadow-blue-600/30 scale-105'
                    : 'glass-panel text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
                }`}
              >
                <Icon className="w-4 h-4" />
                <span>{demo.category}</span>
              </button>
            );
          })}
        </div>

        {/* 3D-Styled Interactive Card */}
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200/90 dark:border-white/10 shadow-2xl relative overflow-hidden">
          {/* Top Status Strip */}
          <div className="flex flex-wrap items-center justify-between gap-4 pb-6 border-b border-slate-100 dark:border-slate-800">
            <div className="flex items-center space-x-3">
              <span className="font-mono text-sm font-black text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-950/80 px-3 py-1 rounded-xl border border-blue-200 dark:border-blue-900">
                {currentMock.id}
              </span>
              <span className="text-xs font-bold text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800/80 px-3 py-1 rounded-xl">
                {currentMock.category}
              </span>
              <span className="text-xs font-semibold text-slate-400 dark:text-slate-500">
                Reported {currentMock.reportedTime}
              </span>
            </div>

            <div className="flex items-center space-x-2">
              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                  currentMock.priority === 'HIGH'
                    ? 'bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 border-rose-300 dark:border-rose-800'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                }`}
              >
                {currentMock.priority} Priority
              </span>

              <span
                className={`text-xs font-extrabold px-3 py-1 rounded-full border ${
                  currentMock.status === 'RESOLVED'
                    ? 'bg-emerald-50 dark:bg-emerald-950/60 text-emerald-700 dark:text-emerald-300 border-emerald-300 dark:border-emerald-800'
                    : 'bg-amber-50 dark:bg-amber-950/60 text-amber-700 dark:text-amber-300 border-amber-300 dark:border-amber-800'
                }`}
              >
                ● {currentMock.status.replace('_', ' ')}
              </span>
            </div>
          </div>

          {/* Card Body */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 pt-6">
            <div className="lg:col-span-2 space-y-5">
              <div>
                <h3 className="text-xl sm:text-2xl font-black font-display text-slate-900 dark:text-white leading-tight">
                  {currentMock.title}
                </h3>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs font-medium text-slate-500 dark:text-slate-400">
                  <span className="flex items-center">
                    <MapPin className="w-4 h-4 mr-1 text-slate-400" />
                    {currentMock.location}
                  </span>
                  <span className="flex items-center">
                    <Building2 className="w-4 h-4 mr-1 text-slate-400" />
                    {currentMock.room}
                  </span>
                  <span className="flex items-center font-semibold text-slate-700 dark:text-slate-300">
                    Reporter: {currentMock.reporter}
                  </span>
                </div>
              </div>

              {/* Technician Diagnostic Note */}
              <div className="p-4 rounded-2xl bg-blue-50/60 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-900/60 space-y-1 text-xs">
                <span className="font-bold text-blue-800 dark:text-blue-300 flex items-center">
                  <Wrench className="w-4 h-4 mr-1.5" /> Technician Live Diagnostic Update:
                </span>
                <p className="text-slate-700 dark:text-slate-200 pl-5 leading-relaxed">
                  "{currentMock.diagnosticNote}"
                </p>
              </div>

              {/* SLA Target Adherence Meter */}
              <div>
                <div className="flex items-center justify-between text-xs mb-2 font-bold">
                  <span className="text-slate-700 dark:text-slate-300 flex items-center">
                    <Clock className="w-4 h-4 mr-1.5 text-blue-500" /> Institutional SLA Resolution Target ({currentMock.slaHours})
                  </span>
                  <span className="text-emerald-600 dark:text-emerald-400 font-mono">
                    {currentMock.slaProgress} compliant
                  </span>
                </div>
                <div className="w-full h-2.5 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-blue-500 to-emerald-500 rounded-full transition-all duration-700"
                    style={{ width: currentMock.slaProgress }}
                  />
                </div>
              </div>
            </div>

            {/* Right Column: Dispatch Card */}
            <div className="glass-panel p-5 rounded-2xl flex flex-col justify-between space-y-4 border border-slate-200/80 dark:border-white/10">
              <div>
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 dark:text-slate-500 block mb-2">
                  Assigned Maintenance Dispatch
                </span>
                <div className="flex items-center space-x-3">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-teal-500 to-emerald-500 text-white font-black text-sm flex items-center justify-center shadow-md">
                    {currentMock.assignedTechnician.charAt(0)}
                  </div>
                  <div>
                    <h4 className="font-bold text-sm text-slate-900 dark:text-white">
                      {currentMock.assignedTechnician}
                    </h4>
                    <p className="text-xs text-teal-600 dark:text-teal-400 font-semibold font-mono">
                      {currentMock.technicianPhone}
                    </p>
                  </div>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 dark:border-slate-800 space-y-2 text-xs">
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Photo Attachment:</span>
                  <span className="font-bold text-emerald-600 dark:text-emerald-400 flex items-center">
                    <Camera className="w-3.5 h-3.5 mr-1" /> Verified On-Site
                  </span>
                </div>
                <div className="flex items-center justify-between text-slate-600 dark:text-slate-400">
                  <span>Reopen Protection:</span>
                  <span className="font-bold text-blue-600 dark:text-blue-400">Student Empowered</span>
                </div>
              </div>

              <Link
                to="/login"
                className="w-full flex items-center justify-center space-x-1.5 py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 shadow-md transition-all hover:scale-[1.02]"
              >
                <span>Test Live Workflow</span>
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Campus Facilities Monitored */}
      <section id="facilities" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
            Campus Infrastructure Coverage
          </span>
          <h2 className="text-3xl sm:text-4xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
            Engineered for Every Division of Modern Colleges
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="glass-card p-6 rounded-3xl card-elevate">
            <div className="w-12 h-12 rounded-2xl bg-blue-500/10 text-blue-600 dark:text-blue-400 border border-blue-500/20 flex items-center justify-center mb-5">
              <Cpu className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Classroom & Computer Labs</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Monitors projectors, lab PCs, air conditioning, and electrical sockets. Dispatches certified IT hardware technicians directly.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl card-elevate">
            <div className="w-12 h-12 rounded-2xl bg-indigo-500/10 text-indigo-600 dark:text-indigo-400 border border-indigo-500/20 flex items-center justify-center mb-5">
              <Wifi className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Wi-Fi & Campus Fiber</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Real-time reporting for hostel and library access points. Network admins receive exact floor and station IDs for instant diagnosis.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl card-elevate">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 dark:text-amber-400 border border-amber-500/20 flex items-center justify-center mb-5">
              <Zap className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Power Grids & Generators</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              High-priority routing for sub-station trips, switchgear faults, and UPS backup battery failures with 6-hour emergency SLA windows.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl card-elevate">
            <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border border-emerald-500/20 flex items-center justify-center mb-5">
              <Droplets className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Water & Sanitation</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Covers RO drinking water plants, washroom plumbing, and water tank pressure pumps across all faculties and residential hostels.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl card-elevate">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 text-teal-600 dark:text-teal-400 border border-teal-500/20 flex items-center justify-center mb-5">
              <Compass className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Hostel Amenities</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Direct student portal for reporting furniture damages, room locks, solar water heater issues, and mess sanitation concerns.
            </p>
          </div>

          <div className="glass-card p-6 rounded-3xl card-elevate">
            <div className="w-12 h-12 rounded-2xl bg-purple-500/10 text-purple-600 dark:text-purple-400 border border-purple-500/20 flex items-center justify-center mb-5">
              <FileCheck className="w-6 h-6" />
            </div>
            <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">Audit Logs & Governance</h3>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
              Complete historical auditing: Every single ticket assignment, status transition, and technician note is timestamped and immutable.
            </p>
          </div>
        </div>
      </section>

      {/* Pre-configured Demo Accounts Card */}
      <section id="accounts" className="py-16 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="glass-card rounded-3xl p-6 sm:p-10 border border-slate-200 dark:border-white/10 shadow-2xl">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-slate-200 dark:border-slate-800 gap-3">
            <div>
              <span className="text-xs font-extrabold uppercase tracking-widest text-blue-600 dark:text-blue-400">
                Multi-Tenant Architecture Testing
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold font-display text-slate-900 dark:text-white mt-1">
                Pre-configured Evaluation Credentials
              </h2>
            </div>
            <span className="inline-flex items-center px-3 py-1 rounded-xl text-xs font-bold bg-amber-50 dark:bg-amber-950/80 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800">
              ⚡ Demo Data (Strict Tenant Isolation)
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6 text-xs">
            {/* Super Admin Box */}
            <div className="p-4 rounded-2xl bg-amber-50/50 dark:bg-slate-850 border border-amber-200/80 dark:border-amber-900/60 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase tracking-wider text-amber-700 dark:text-amber-400 text-[10px]">
                  Root Super Admin
                </span>
                <Crown className="w-4 h-4 text-amber-500" />
              </div>
              <div>
                <p className="font-mono font-bold text-slate-900 dark:text-white text-xs truncate">superadmin@campusfix.io</p>
                <p className="font-mono text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Password: SuperAdmin@123</p>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
                Approve/reject new institutions, suspend/reactivate tenants, review platform metrics.
              </p>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl font-bold text-slate-900 bg-amber-400 hover:bg-amber-300 transition-colors shadow-sm"
              >
                Sign In as Super Admin
              </Link>
            </div>

            {/* Institution Admin Box */}
            <div className="p-4 rounded-2xl bg-indigo-50/50 dark:bg-slate-850 border border-indigo-100 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase tracking-wider text-indigo-700 dark:text-indigo-400 text-[10px]">
                  Northstar Admin
                </span>
                <ShieldCheck className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />
              </div>
              <div>
                <p className="font-mono font-bold text-slate-900 dark:text-white text-xs truncate">admin@campusfix.edu</p>
                <p className="font-mono text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Password: Admin@123</p>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
                Campus telemetry, member approvals, dispatching staff, SLA target configuration.
              </p>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl font-bold text-white bg-indigo-600 hover:bg-indigo-700 transition-colors shadow-sm"
              >
                Sign In as Inst. Admin
              </Link>
            </div>

            {/* Staff Box */}
            <div className="p-4 rounded-2xl bg-teal-50/50 dark:bg-slate-850 border border-teal-100 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase tracking-wider text-teal-700 dark:text-teal-400 text-[10px]">
                  Field Staff
                </span>
                <Wrench className="w-4 h-4 text-teal-600 dark:text-teal-400" />
              </div>
              <div>
                <p className="font-mono font-bold text-slate-900 dark:text-white text-xs truncate">anita.network@campusfix.edu</p>
                <p className="font-mono text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Password: Staff@123</p>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
                Assigned ticket queue, status updates, technician resolution notes and evidence.
              </p>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl font-bold text-white bg-teal-600 hover:bg-teal-700 transition-colors shadow-sm"
              >
                Sign In as Staff
              </Link>
            </div>

            {/* Student Box */}
            <div className="p-4 rounded-2xl bg-blue-50/50 dark:bg-slate-850 border border-blue-100 dark:border-slate-700/80 space-y-2.5">
              <div className="flex items-center justify-between">
                <span className="font-extrabold uppercase tracking-wider text-blue-700 dark:text-blue-400 text-[10px]">
                  Student (Multi-Tenant)
                </span>
                <Users className="w-4 h-4 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <p className="font-mono font-bold text-slate-900 dark:text-white text-xs truncate">rahul.sharma@campusfix.edu</p>
                <p className="font-mono text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">Password: Student@123</p>
              </div>
              <p className="text-slate-600 dark:text-slate-400 text-[10px] leading-relaxed">
                Memberships in Northstar & Greenfield! Test the 1-click institution switcher.
              </p>
              <Link
                to="/login"
                className="w-full inline-flex items-center justify-center py-2 px-3 rounded-xl font-bold text-white bg-blue-600 hover:bg-blue-700 transition-colors shadow-sm"
              >
                Sign In as Student
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Modern Clean Footer */}
      <footer className="py-12 border-t border-slate-200/80 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 transition-colors">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center space-x-2">
            <Building2 className="w-4 h-4 text-blue-600 dark:text-blue-400" />
            <span className="font-bold text-slate-800 dark:text-slate-200">CampusSaathi Operations Suite</span>
            <span>— Final-Year B.Tech CSE Project</span>
          </div>
          <p className="font-mono text-[11px]">Designed & Engineered with React + Node.js + Prisma</p>
        </div>
      </footer>
    </div>
  );
}
